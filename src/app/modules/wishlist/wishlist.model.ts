import { Schema, model } from 'mongoose';
import { IWishlist, WishlistModel } from './wishlist.interface';

const wishlistSchema = new Schema<IWishlist, WishlistModel>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  careProvider: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
}, { timestamps: true });

wishlistSchema.index({ user: 1, careProvider: 1 }, { unique: true });

export const Wishlist = model<IWishlist, WishlistModel>(
  'Wishlist',
  wishlistSchema
);