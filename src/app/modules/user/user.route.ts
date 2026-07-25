import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { UserRole } from './user.constant';
const router = express.Router();

// create user
router.post(
  '/create-user',
  validateRequest(UserValidation.createUserZodSchema),
  UserController.createUser,
);

// update profile
router.patch(
  '/profile',
  auth(),
  fileUploadHandler(),
  validateRequest(UserValidation.updateUserZodSchema),
  UserController.updateProfile,
);

// update kyc
router.patch(
  '/kyc',
  auth(UserRole.Customer, UserRole.Driver, UserRole.Host, UserRole.Owner),
  fileUploadHandler(),
  UserController.updateKyc,
);

// review kyc
router.patch(
  '/kyc/:id/review',
  auth(UserRole.Admin, UserRole.SuperAdmin),
  validateRequest(UserValidation.reviewKycZodSchema),
  UserController.reviewKyc,
);

// update user status
router.patch(
  '/status/:id',
  auth(UserRole.Admin, UserRole.SuperAdmin),
  validateRequest(UserValidation.updateStatusZodSchema),
  UserController.updateStatus,
);

// delete user
router.delete(
  '/:id',
  auth(UserRole.Admin, UserRole.SuperAdmin),
  validateRequest(UserValidation.deleteUserZodSchema),
  UserController.deleteSingleUser,
);

// get my kyc
router.get(
  '/kyc/me',
  auth(UserRole.Customer, UserRole.Driver, UserRole.Host, UserRole.Owner),
  UserController.getMyKyc,
);

// get profile
router.get('/profile', auth(), UserController.getUserProfile);

// get all users
router.get(
  '/all',
  auth(UserRole.Admin, UserRole.SuperAdmin),
  UserController.getAllUsers,
);

export const UserRoutes = router;
