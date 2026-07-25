import { model, Schema } from 'mongoose';
import { IWallet, WalletModel } from './wallet.interface';
import { autoIncrementPlugin } from '../../../DB/autoIncrementPlugin';
import {
  PayoutProvider,
  SupportedCurrency,
  WalletStatus,
} from './wallet.constants';

const chapaPayoutDetailsSchema = new Schema(
  {
    accountName: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    bankCode: { type: String, required: true, trim: true },
    bankName: { type: String, trim: true },
  },
  { _id: false },
);

const stripePayoutDetailsSchema = new Schema(
  {
    stripeAccountId: { type: String, required: true, trim: true },
    bankName: { type: String, trim: true },
    accountNumberLast4: { type: String, trim: true },
    fundingType: { type: String, trim: true },
    isOnboardingCompleted: { type: Boolean, default: false },
    payoutsEnabled: { type: Boolean, default: false },
  },
  { _id: false },
);

const walletSchema = new Schema<IWallet, WalletModel>(
  {
    uid: {
      type: String,
      unique: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // Guarantees 1:1 mapping (one wallet per host)
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(WalletStatus),
      default: WalletStatus.PENDING_ONBOARDING,
    },
    provider: {
      type: String,
      enum: Object.values(PayoutProvider),
      default: null,
      //   validate: {
      //     validator: function (value: PayoutProvider) {
      //   const queryContext = this as any;

      //   // Check if getUpdate exists (it will during findOneAndUpdate)
      //   if (typeof queryContext.getUpdate === 'function') {
      //     const update = queryContext.getUpdate();
      //     const currentUpdateData = update?.$set || update;
      //     const currency = currentUpdateData?.currency;

      //     if (currency === SupportedCurrency.USD) {
      //       return value === PayoutProvider.STRIPE;
      //     }
      //     if (currency === SupportedCurrency.ETB) {
      //       return value === PayoutProvider.CHAPA;
      //     }
      //     return false;
      //   }

      //   // Fallback for regular .save() invocations where 'this' actually is the document
      //   const docContext = this as any;
      //   if (docContext.currency === SupportedCurrency.USD) {
      //     return value === PayoutProvider.STRIPE;
      //   }
      //   if (docContext.currency === SupportedCurrency.ETB) {
      //     return value === PayoutProvider.CHAPA;
      //   }
      //   return false;
      // },
      //     message:
      //       'Currency/Provider mismatch! STRIPE requires USD and CHAPA requires ETB.',
      //   },
    },
    currency: {
      type: String,
      enum: Object.values(SupportedCurrency),
      default: SupportedCurrency.USD,
    },
    availableBalance: {
      type: Number,
      required: true,
      default: 0,
    },
    pendingBalance: {
      type: Number,
      required: true,
      default: 0,
    },
    gatewayBankInfo: {
      type: {
        [PayoutProvider.CHAPA]: {
          type: chapaPayoutDetailsSchema,
          required: false,
        },
        [PayoutProvider.STRIPE]: {
          type: stripePayoutDetailsSchema,
          required: false,
        },
      },
      default: null,
    },
  },
  { timestamps: true },
);

// Auto increment uid setup
walletSchema.plugin(autoIncrementPlugin, {
  incField: 'uid',
  prefix: 'WLT',
  counterId: 'wallet_sequence',
  padLength: 6,
});

export const Wallet = model<IWallet, WalletModel>('Wallet', walletSchema);
