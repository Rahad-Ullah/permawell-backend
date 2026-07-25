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

// get profile
router.get('/profile', auth(), UserController.getUserProfile);

// get single user
router.get(
  '/single/:id',
  auth(),
  validateRequest(UserValidation.getSingleUserZodSchema),
  UserController.getSingleUser,
);

// get all providers
router.get(
  '/care-providers',
  auth(UserRole.CareSeeker),
  UserController.getAllProviders,
);

// get all users
router.get(
  '/all',
  auth(UserRole.CareSeeker, UserRole.Admin, UserRole.SuperAdmin),
  UserController.getAllUsers,
);

export const UserRoutes = router;
