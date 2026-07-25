import QueryBuilder from '../../builder/QueryBuilder';
import { IWishlist } from './wishlist.interface';
import { Wishlist } from './wishlist.model';

// ------------ toggle wishlist service ----------
const toggleWishlist = async (payload: IWishlist) => {
  const { user, property } = payload;

  const existingWishlist = await Wishlist.findOne({ user, property });

  if (existingWishlist) {
    // If wishlist exists, remove it (toggle off)
    const result = await Wishlist.findByIdAndDelete(existingWishlist._id);
    return {
      data: { ...result?.toObject(), isWishlisted: false },
      message: 'Wishlist removed successfully',
    };
  } else {
    // If wishlist doesn't exist, create it (toggle on)
    const result = await Wishlist.create(payload);
    return {
      data: { ...result?.toObject(), isWishlisted: true },
      message: 'Wishlist added successfully',
    };
  }
};

// ------------ get wishlist by user id service ----------
const getWishlistByUserId = async (userId: string) => {
  const wishlistQuery = new QueryBuilder(Wishlist.find({ user: userId }), {})
    .sort()
    .paginate()
    .fields();

  const [data, pagination] = await Promise.all([
    wishlistQuery.modelQuery
      .populate('property')
      .populate('user', 'firstName lastName role email image'),
    wishlistQuery.getPaginationInfo(),
  ]);

  return { data, pagination };
};

export const WishlistServices = {
  toggleWishlist,
  getWishlistByUserId,
};
