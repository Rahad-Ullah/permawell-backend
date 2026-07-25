import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { UserRole } from '../user/user.constant';
import { User } from '../user/user.model';
import { IWishlist } from './wishlist.interface';
import { Wishlist } from './wishlist.model';

// ------------ toggle wishlist service ----------
const toggleWishlist = async (payload: IWishlist) => {
  const { user, careProvider } = payload;

  // check if the care provider is valid
  const existingCareProvider = await User.exists({ _id: careProvider, role: UserRole.CareProvider });
  if (!existingCareProvider) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Care provider not found');
  }

  const existingWishlist = await Wishlist.findOne({ user, careProvider });

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
      .populate('careProvider')
      .populate('user', 'name role email image'),
    wishlistQuery.getPaginationInfo(),
  ]);

  return { data, pagination };
};

export const WishlistServices = {
  toggleWishlist,
  getWishlistByUserId,
};
