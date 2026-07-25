import { Model, Types, ObjectId } from 'mongoose';
import { UserRole, UserStatus, VerificationStatus } from './user.constant';

export interface IUser {
  _id: Types.ObjectId;
  uid: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  roleRef: Types.ObjectId;
  email: string;
  password: string;
  phone: string;
  image?: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  location: {
    type: string;
    coordinates: [number, number];
  };
  status: UserStatus;
  isVerified: boolean;
  isOnline: boolean;
  isDeleted: boolean;
  verification?: {
    status: VerificationStatus;
    documents: string[];
    submittedAt?: Date;
    reviewNotes?: string;
    reviewedAt?: Date;
    reviewedBy?: Types.ObjectId;
  };
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export type UserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;
