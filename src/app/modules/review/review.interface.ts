import { Model, Types } from 'mongoose';

export interface IReview {
  _id: Types.ObjectId;
  careProvider: Types.ObjectId;
  reviewer: Types.ObjectId;
  rating: number;
  comment: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ReviewModel = Model<IReview>;