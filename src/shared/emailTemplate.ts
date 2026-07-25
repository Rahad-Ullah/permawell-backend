import config from '../config';
import {
  ICreateAccount,
  ILowBalanceWarning,
  IResetPassword,
} from '../types/emailTemplate';

const createAccount = (values: ICreateAccount) => {
  const data = {
    to: values.email,
    subject: 'Verify your account',
    html: `
      <body
          style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
          <div
              style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
              <img src="${config.logo_url}" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
              <h2 style="font-size: 24px; margin-bottom: 20px;">
                Hey! ${values.name}${values.name && ','} 
                Your ${config.server_name} Account Credentials
              </h2>
              <div style="text-align: center;">
                  <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
                  <span
                      style="background-color: #F1913D; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">
                      ${values.otp}
                  </span>
                  <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 5 minutes.</p>
              </div>
          </div>
      </body>
    `,
  };
  return data;
};

const resetPassword = (values: IResetPassword) => {
  const data = {
    to: values.email,
    subject: 'Reset your password',
    html: `
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
          <div
              style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
              <img src="${config.logo_url}" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
              <div style="text-align: center;">
                  <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
                  <span
                      style="background-color: #F1913D; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">
                      ${values.otp}
                  </span>
                  <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 5 minutes.</p>
                  <p style="color: #b9b4b4; font-size: 16px; line-height: 1.5; margin-bottom: 20px;text-align:center">
                    If you didn't request this code, you can safely ignore this email. Someone else might have typed your email address by mistake.
                  </p>
              </div>
          </div>
      </body>
    `,
  };
  return data;
};

// warning for low platform balance
const lowBalanceWarning = (values: ILowBalanceWarning) => {
  const missingAmount = Math.max(
    0,
    values.requiredBalance - values.currentBalance,
  );

  const data = {
    to: values.adminEmail,
    subject: `🚨 ALERT: Low Balance Warning - ${values.gatewayName}`,
    html: `
      <body
          style="font-family: 'Trebuchet MS', sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
          <div
              style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); border-top: 4px solid #F1913D;">
              
              <img src="${config.logo_url}" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
              
              <h2 style="color: #F1913D; font-size: 22px; margin-bottom: 20px; text-align: center;">
                🚨 Payout Action Required: Low Funds
              </h2>
              
              <p style="font-size: 16px; line-height: 1.5; color: #333;">
                Hello Admin,
              </p>
              
              <p style="font-size: 16px; line-height: 1.5; color: #555;">
                A host payout request is currently on hold because your <strong>${values.gatewayName}</strong> available balance is insufficient to process the transaction.
              </p>

              <!-- Financial Breakdown Box -->
              <div style="background-color: #FFFBF7; border: 1px solid #FFE3CC; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <table style="width: 100%; font-size: 15px; border-collapse: collapse;">
                      <tr>
                          <td style="padding: 6px 0; color: #777;">Payment Gateway:</td>
                          <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #333;">${values.gatewayName}</td>
                      </tr>
                      <tr>
                          <td style="padding: 6px 0; color: #777;">Current Available Balance:</td>
                          <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #D32F2F;">${values.currentBalance.toLocaleString()} ${values.currency.toUpperCase()}</td>
                      </tr>
                      <tr>
                          <td style="padding: 6px 0; color: #777;">Required Transfer Amount:</td>
                          <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #333;">${values.requiredBalance.toLocaleString()} ${values.currency.toUpperCase()}</td>
                      </tr>
                      <tr style="border-top: 1px solid #FFE3CC;">
                          <td style="padding: 12px 0 0 0; font-weight: bold; color: #333;">⚠️ Shortfall Amount:</td>
                          <td style="padding: 12px 0 0 0; text-align: right; font-weight: bold; font-size: 18px; color: #D32F2F;">
                              -${missingAmount.toLocaleString()} ${values.currency.toUpperCase()}
                          </td>
                      </tr>
                  </table>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                  <p style="color: #777; font-size: 14px; line-height: 1.5;">
                      Please log into your ${values.gatewayName} dashboard immediately and deposit funds to resume pending host payouts.
                  </p>
              </div>
          </div>
      </body>
    `,
  };
  return data;
};

export const emailTemplate = {
  createAccount,
  resetPassword,
  lowBalanceWarning,
};
