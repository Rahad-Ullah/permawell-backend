import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import deleteS3File from '../../../shared/deleteS3File';
import generateOTP from '../../../utils/generateOTP';
import { IUser } from './user.interface';
import { User } from './user.model';
import { UserRole, UserStatus } from './user.constant';
import QueryBuilder from '../../builder/QueryBuilder';
import mongoose, { FilterQuery } from 'mongoose';
import { sendNotifications } from '../../../helpers/notificationHelper';
import { NotificationType } from '../notification/notification.constant';
import { CareProvider } from '../careProvider/careProvider.model';
import { ICareProvider } from '../careProvider/careProvider.interface';
import { Wishlist } from '../wishlist/wishlist.model';

const createUserToDB = async (payload: Partial<IUser>) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Check if user exists
    const isExistUser = await User.exists({ email: payload.email }).session(
      session,
    );
    if (isExistUser) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exists!');
    }

    // Create user
    const [createdUser] = await User.create([payload], { session });
    if (!createdUser) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
    }

    // Create care provider profile
    if (createdUser.role === UserRole.CareProvider) {
      const [careProvider] = await CareProvider.create([{ user: createdUser._id }], {
        session,
      });
      if (!careProvider) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create care provider');
      }
      const updatedUser = await User.findByIdAndUpdate(
        { _id: createdUser._id },
        { $set: { roleRef: careProvider._id } },
        { session, new: true },
      );
      if (!updatedUser) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update user');
      }
    }

    // Generate OTP
    const otp = generateOTP(6);
    const values = {
      name: createdUser.name,
      otp: otp,
      email: createdUser.email!,
    };

    const createAccountTemplate = emailTemplate.createAccount(values);
    await emailHelper.sendEmail(createAccountTemplate);

    // Save OTP to DB
    const authentication = {
      oneTimeCode: otp,
      expireAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
    };

    await User.findOneAndUpdate(
      { _id: createdUser._id },
      { $set: { authentication } },
      { session, new: true },
    );

    await session.commitTransaction();

    return {
      message: 'Account created successfully. Please verify your email.',
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

const getSingleUserFromDB = async (id: string): Promise<Partial<IUser>> => {
  const user = await User.findById(id).populate('roleRef');
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return user;
};

const getProfileFromDB = async (id: string): Promise<Partial<IUser>> => {
  const user = await User.findById(id).populate('roleRef');
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // check if user is deleted
  if (user.isDeleted) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'It looks like your account has been deleted or deactivated.',
    );
  }

  //check user status
  if (user.status !== UserStatus.Active) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'It looks like your account has been suspended or deactivated.',
    );
  }

  return user;
};

const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>,
): Promise<Partial<IUser | null>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //unlink file here
  if (payload.image && isExistUser.image) {
    deleteS3File(isExistUser.image);
  }

  const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateDoc;
};

// ------------ update user status ------------
const updateStatusToDB = async (
  id: string,
  payload: { status: UserStatus },
): Promise<Partial<IUser | null>> => {
  const isExistUser = await User.exists({ _id: id });
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateDoc;
};

// ------------ delete user ------------
const deleteSingleUserFromDB = async (
  userId: string,
): Promise<Partial<IUser>> => {
  const result = await User.findByIdAndUpdate(
    userId,
    { isDeleted: true },
    { new: true },
  );
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  return result;
};

// ------------ get kyc by user id ------------
const getKycByUserIdFromDB = async (id: string): Promise<Partial<IUser>> => {
  const user = await User.findById(id).select('+verification');
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  return user;
};

// ------------ get all care providers ------------
const getAllCareProvidersFromDB = async (
  userId: string,
  query: Record<string, unknown>
) => {
  const filter = {
    role: UserRole.CareProvider,
    isDeleted: false,
    status: UserStatus.Active,
  } as any;

  // 1. Pre-filter care provider criteria
  const careProviderFilter: FilterQuery<ICareProvider> = {};
  if (query.careType) {
    careProviderFilter.careType = query.careType as string;
  }
  if (query.specialty) {
    careProviderFilter.specialty = query.specialty as string;
  }
  if (query.experienceYears) {
    careProviderFilter.experienceYears = { $gte: Number(query.experienceYears) };
  }

  if (Object.keys(careProviderFilter).length > 0) {
    const careProviders = await CareProvider.find(careProviderFilter).select('_id');
    filter.roleRef = { $in: careProviders.map((cp) => cp._id) };
  }

  // 2. Build and execute user query
  const userQuery = new QueryBuilder(User.find(filter), query)
    .search(['name', 'username', 'email'])
    .filter(['careType', 'specialty', 'experienceYears'])
    .sort()
    .paginate()
    .fields();

  const [users, pagination] = await Promise.all([
    userQuery.modelQuery.populate('roleRef').lean(),
    userQuery.getPaginationInfo(),
  ]);

  // 3. Embed wishlist status efficiently
  if (userId && users.length > 0) {
    // Collect all provider IDs (either user._id or roleRef._id based on how you reference providers)
    const providerIds = users.map((u: any) => u._id);

    // Fetch matching wishlist records for the current user
    const wishlists = await Wishlist.find({
      user: userId,
      careProvider: { $in: providerIds },
    })
      .select('careProvider')
      .lean();

    // Create a Set for fast lookup O(1)
    const wishlistedProviderIds = new Set(
      wishlists.map((w) => w.careProvider.toString())
    );

    // Attach isWishlisted status to each provider object
    const usersWithWishlist = users.map((user: any) => ({
      ...user,
      isWishlisted: wishlistedProviderIds.has(user._id.toString()),
    }));

    return { users: usersWithWishlist, pagination };
  }

  // If no userId is provided, default isWishlisted to false
  const usersWithWishlist = users.map((user: any) => ({
    ...user,
    isWishlisted: false,
  }));

  return { users: usersWithWishlist, pagination };
};
// ------------ get all users ------------
const getAllUsersFromDB = async (query: Record<string, unknown>) => {
  const userQuery = new QueryBuilder(
    User.find({ isDeleted: false, role: { $ne: UserRole.SuperAdmin } }),
    query,
  )
    .search(['name', 'username', 'email'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const [users, pagination] = await Promise.all([
    userQuery.modelQuery.populate('roleRef').lean(),
    userQuery.getPaginationInfo(),
  ]);

  return { users, pagination };
};

export const UserService = {
  createUserToDB,
  getSingleUserFromDB,
  getProfileFromDB,
  getKycByUserIdFromDB,
  updateProfileToDB,
  updateStatusToDB,
  deleteSingleUserFromDB,
  getAllCareProvidersFromDB,
  getAllUsersFromDB,
};
