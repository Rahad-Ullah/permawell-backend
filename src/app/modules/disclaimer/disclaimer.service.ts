import { Disclaimer } from './disclaimer.model';
import { DisclaimerType } from './disclaimer.constants';
import { IDisclaimer } from './disclaimer.interface';

// -------------- create/update disclaimer ----------------
const createOrUpdateDisclaimer = async (
  payload: IDisclaimer
): Promise<IDisclaimer> => {
  const result = await Disclaimer.findOneAndUpdate(
    { type: payload.type },
    payload,
    { upsert: true, new: true }
  );
  return result;
};

// -------------- get disclaimer by type ----------------
const getDisclaimerByType = async (type: DisclaimerType): Promise<IDisclaimer | null> => {
  return await Disclaimer.findOne({ type });
};

export const DisclaimerServices = {
  createOrUpdateDisclaimer,
  getDisclaimerByType,
};