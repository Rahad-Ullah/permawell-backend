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
import { calculateDistance } from '../../../utils/calculateDistance';
import { PrivacySetting } from '../privacySetting/privacySetting.model';
import { PrivacyAccessLevel } from '../privacySetting/privacySetting.constants';

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

    // create privacy setting for care seeker
    if (createdUser.role === UserRole.CareSeeker) {
      await PrivacySetting.create([{
        user: createdUser._id,
      }], {
        session,
      });
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

const getSingleUserFromDB = async (id: string, user: JwtPayload) => {
  const existingUser = await User.findById(id).populate('roleRef');
  if (!existingUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // check privacy setting
  if (existingUser.role === UserRole.CareSeeker && user.role === UserRole.CareProvider) {
    const [privacySetting, isFavoriteProvider] = await Promise.all([
      PrivacySetting.findOne({ user: existingUser._id }),
      Wishlist.findOne({ user: existingUser._id, careProvider: user.id }),
    ]);

    const hasAccess = (access: PrivacyAccessLevel = PrivacyAccessLevel.AllProviders) => {
      if (access === PrivacyAccessLevel.AllProviders) return true;
      if (access === PrivacyAccessLevel.FavoriteProvidersOnly && isFavoriteProvider) return true;
      return false;
    }

    return {
      ...existingUser.toObject(),
      privacySetting: {
        emailAccess: hasAccess(privacySetting?.emailAccess),
        mobileAccess: hasAccess(privacySetting?.mobileAccess),
        messagingAccess: hasAccess(privacySetting?.messagingAccess),
        fullAddressAccess: hasAccess(privacySetting?.fullAddressAccess),
      },
    };
  }

  return existingUser;
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
  const existingUser = await User.isExistUserById(id);
  if (!existingUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // check username uniqueness
  if (payload.username) {
    const normalizedUsername = payload.username.trim();

    // Only check if the username actually changed (case-insensitive check)
    if (normalizedUsername.toLowerCase() !== existingUser.username.toLowerCase()) {
      const isTakenUserName = await User.exists({
        username: { $regex: new RegExp(`^${normalizedUsername}$`, 'i') },
        _id: { $ne: existingUser._id },
      });

      if (isTakenUserName) {
        throw new ApiError(StatusCodes.CONFLICT, 'Username is already taken!');
      }

      payload.username = normalizedUsername;
    }
  }

  // unlink file here
  if (payload.image && existingUser.image) {
    deleteS3File(existingUser.image);
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
  const filter: any = {
    role: UserRole.CareProvider,
    isDeleted: false,
    status: UserStatus.Active,
  };

  // 1. Filter by location radius using $near if coordinates are provided
  const lat = query.lat ? parseFloat(query.lat as string) : null;
  const lng = query.lng ? parseFloat(query.lng as string) : null;
  const radiusKm = query.radius ? Number(query.radius) : 200;
  if (lat !== null && lng !== null) {
    const EARTH_RADIUS_KM = 6378.1; // Equatorial radius of earth
    const radiusInRadians = radiusKm / EARTH_RADIUS_KM;

    filter.location = {
      $geoWithin: {
        $centerSphere: [[lng, lat], radiusInRadians],
      },
    };
  }

  // 2. Pre-filter care provider criteria
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

  // 3. Build and execute standard user query
  const userQuery = new QueryBuilder(User.find(filter), query)
    .search(['name', 'username', 'email'])
    .filter(['careType', 'specialty', 'experienceYears', 'lat', 'lng', 'radius'])
    .sort()
    .paginate()
    .fields();

  const [users, pagination] = await Promise.all([
    userQuery.modelQuery.populate('roleRef').lean(),
    userQuery.getPaginationInfo(),
  ]);

  // 4. Batch lookup wishlist status
  const providerIds = users.map((u: any) => u._id);
  let wishlistedProviderIds = new Set<string>();

  if (userId && providerIds.length > 0) {
    const wishlists = await Wishlist.find({
      user: userId,
      careProvider: { $in: providerIds },
    })
      .select('careProvider')
      .lean();

    wishlistedProviderIds = new Set(
      wishlists.map((w) => w.careProvider.toString())
    );
  }

  // 5. Format final response output (Embed distance & isWishlisted)
  const finalUsers = users.map((user: any) => {
    let distanceInKm: number | null = null;

    // Safely extract coordinates from GeoJSON [lng, lat]
    if (lat !== null && lng !== null && user.location?.coordinates) {
      const [providerLng, providerLat] = user.location.coordinates;
      distanceInKm = calculateDistance(lat, lng, providerLat, providerLng);
    }

    return {
      ...user,
      distanceInKm,
      isWishlisted: wishlistedProviderIds.has(user._id.toString()),
    };
  });

  return { users: finalUsers, pagination };
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
