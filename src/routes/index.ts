import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { notificationRoutes } from '../app/modules/notification/notification.route';
import { wishlistRoutes } from '../app/modules/wishlist/wishlist.route';
import { newsletterRoutes } from '../app/modules/newsletter/newsletter.route';
import { disclaimerRoutes } from '../app/modules/disclaimer/disclaimer.route';
import { settingRoutes } from '../app/modules/setting/setting.route';
import { transactionRoutes } from '../app/modules/transaction/transaction.route';
import { adminRoutes } from '../app/modules/admin/admin.route';
import { walletRoutes } from '../app/modules/wallet/wallet.route';
import { careProviderRoutes } from '../app/modules/careProvider/careProvider.route';
import { reviewRoutes } from '../app/modules/review/review.route';
import { ChatRoutes } from '../app/modules/chat/chat.route';
import { MessageRoutes } from '../app/modules/message/message.route';
import { supportRoutes } from '../app/modules/support/support.route';
import { appointmentRoutes } from '../app/modules/appointment/appointment.route';
import { faqRoutes } from '../app/modules/faq/faq.route';
import { kycVerificationRoutes } from '../app/modules/kycVerification/kycVerification.route';
import { privacySettingRoutes } from '../app/modules/privacySetting/privacySetting.route';
import { analyticsRoutes } from '../app/modules/analytics/analytics.route';
const router = express.Router();

const apiRoutes: { path: string; route: any }[] = [
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/admins',
    route: adminRoutes,
  },
  {
    path: '/care-providers',
    route: careProviderRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/appointments',
    route: appointmentRoutes,
  },
  {
    path: '/wishlists',
    route: wishlistRoutes,
  },
  {
    path: '/reviews',
    route: reviewRoutes,
  },
  {
    path: '/chats',
    route: ChatRoutes,
  },
  {
    path: '/messages',
    route: MessageRoutes,
  },
  {
    path: '/transactions',
    route: transactionRoutes,
  },
  {
    path: '/wallets',
    route: walletRoutes,
  },
  {
    path: '/newsletters',
    route: newsletterRoutes,
  },
  {
    path: '/notifications',
    route: notificationRoutes,
  },
  {
    path: '/analytics',
    route: analyticsRoutes,
  },
  {
    path: '/privacy-settings',
    route: privacySettingRoutes,
  },
  {
    path: '/kyc',
    route: kycVerificationRoutes,
  },
  {
    path: '/supports',
    route: supportRoutes,
  },
  {
    path: '/faqs',
    route: faqRoutes,
  },
  {
    path: '/disclaimers',
    route: disclaimerRoutes,
  },
  {
    path: '/settings',
    route: settingRoutes,
  },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
