import { z } from 'zod';
import { PayoutProvider, SupportedCurrency } from './wallet.constants';

// 1. CONNECT PAYOUT METHOD SCHEMA
// Validates the payload when a host sets up or updates their payout destination.
export const connectPayoutMethod = z.object({
  body: z
    .object({
      currency: z.nativeEnum(SupportedCurrency, {
        required_error: 'Currency is required (USD or ETB)',
      }),
      gatewayBankInfo: z
        .object({
          [PayoutProvider.CHAPA]: z
            .object({
              accountName: z
                .string({
                  required_error: 'Legal bank account name is required',
                })
                .trim()
                .min(1),
              accountNumber: z
                .string({
                  required_error:
                    'Bank account or mobile wallet number is required',
                })
                .trim()
                .min(1),
              bankCode: z
                .string({
                  required_error: 'Bank routing identifier code is required',
                })
                .trim()
                .min(1),
              bankName: z.string({ required_error: 'Bank name is required' }).trim().min(1),
            })
            .optional(),
          [PayoutProvider.STRIPE]: z
            .object({
              bankName: z.string().trim().optional(),
              accountNumberLast4: z.string().trim().max(4).optional(),
            })
            .optional(),
        })
        .strict(),
    })
    .strict()
    .superRefine((bodyData, ctx) => {
      const { currency, gatewayBankInfo } = bodyData;

      // Enforce that the matching details object is explicitly sent
      if (currency === SupportedCurrency.USD) {
        if (!gatewayBankInfo[PayoutProvider.STRIPE]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Stripe account information block is missing.',
            path: ['body', 'gatewayBankInfo', PayoutProvider.STRIPE],
          });
        }
      }

      if (currency === SupportedCurrency.ETB) {
        if (!gatewayBankInfo[PayoutProvider.CHAPA]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              'Chapa bank routing and account information block is missing.',
            path: ['body', 'gatewayBankInfo', PayoutProvider.CHAPA],
          });
        }
      }
    }),
});

// 2. PAYOUT WITHDRAWAL REQUEST SCHEMA
// Validates the payload when a host requests to cash out their available funds.
export const payoutWithdrawal = z.object({
  body: z.object({
    amount: z
      .number({ required_error: 'Withdrawal amount is required' })
      .int('Amount must be an integer.')
      .positive('Withdrawal amount must be greater than 0.'),
  }),
});

export const WalletValidations = {
  connectPayoutMethod,
  payoutWithdrawal,
};
