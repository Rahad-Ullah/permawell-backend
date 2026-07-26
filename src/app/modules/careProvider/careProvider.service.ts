import { ICareProvider } from './careProvider.interface';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { CareProvider } from './careProvider.model';

// ----------------- update care provider -----------------
const updateCareProviderToDB = async (
  userId: string,
  payload: Partial<ICareProvider>,
): Promise<Partial<ICareProvider | null>> => {
  const careProvider = await CareProvider.findOne({ user: userId });
  if (!careProvider) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Care provider doesn't exist!");
  }

  const updatedCareProvider = await CareProvider.findByIdAndUpdate(
    careProvider._id,
    payload,
    { new: true },
  );

  if (!updatedCareProvider) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update user");
  }

  return updatedCareProvider;
};



export const CareProviderServices = {
  updateCareProviderToDB
};