import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import deleteS3File from '../../../shared/deleteS3File';
import generateOTP from '../../../utils/generateOTP';
import { IUser } from './user.interface';
import { User } from './user.model';
import { UserRole, UserStatus, VerificationStatus } from './user.constant';
import QueryBuilder from '../../builder/QueryBuilder';
import mongoose, { Types } from 'mongoose';
import { sendNotifications } from '../../../helpers/notificationHelper';
import { NotificationType } from '../notification/notification.constant';
import { Wallet } from '../wallet/wallet.model';

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

    // Create wallet for host
    if (createdUser.role === UserRole.CareProvider) {
      const [wallet] = await Wallet.create([{ user: createdUser._id }], {
        session,
      });
      if (!wallet) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create wallet');
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
  const user = await User.isExistUserById(id);
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

// ------------ get all users ------------
const getAllUsersFromDB = async (query: Record<string, unknown>) => {
  const userQuery = new QueryBuilder(
    User.find({ isDeleted: false, role: { $ne: UserRole.SuperAdmin } }).select(
      '+verification',
    ),
    query,
  )
    .search(['firstName', 'lastName', 'email'])
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
  getAllUsersFromDB,
};
