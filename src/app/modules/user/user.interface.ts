import { Model, Types } from 'mongoose';
import { UserGender, UserRole, UserStatus } from './user.constant';

export interface IUser {
  _id: Types.ObjectId;
  uid: string;
  name: string;
  title: string;
  username: string;
  role: UserRole;
  roleRef: Types.ObjectId;
  email: string;
  password: string;
  image: string;
  gender: UserGender;
  dob: Date;
  nationality: string;
  language: string;
  bio: string;
  phone: {
    countryCode: string;
    number: string;
  };
  address: string;
  location: {
    type: string,
    coordinates: [number, number],
  };
  insurance?: string; // optional, only for doctors
  status: UserStatus;
  isEmailVerified: boolean;
  isOnline: boolean;
  lastSeenAt?: Date;
  isDeleted: boolean;
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
