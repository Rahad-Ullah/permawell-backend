export enum UserRole {
  Customer = 'customer',
  Owner = 'owner',
  Host = 'host',
  Driver = 'driver',
  SuperAdmin = 'super_admin',
  Admin = 'admin',
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