import { Model, ObjectId } from 'mongoose';

export interface IWishlist {
  _id: ObjectId;
  user: ObjectId;
  property: ObjectId;
  createdAt: Date;
  updatedAt: Date;

};

export type WishlistModel = Model<IWishlist>;