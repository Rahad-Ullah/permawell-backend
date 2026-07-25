export enum PayoutProvider {
  STRIPE = 'stripe',
  CHAPA = 'chapa',
}

export enum SupportedCurrency {
  ETB = 'ETB',
  USD = 'USD',
}

export enum WalletStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  PENDING_ONBOARDING = 'pending_onboarding',
}
