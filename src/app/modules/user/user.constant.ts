export enum UserRole {
  CareSeeker = 'care_seeker',
  CareProvider = 'care_provider',
  Admin = 'admin',
  SuperAdmin = 'super_admin',
}

export enum UserGender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
}

export enum UserStatus {
  Active = 'active',
  Inactive = 'inactive',
  Blocked = 'blocked',
}

export enum VerificationStatus {
  Unverified = 'unverified',
  Pending = 'pending',
  Verified = 'verified',
  Rejected = 'rejected',
}