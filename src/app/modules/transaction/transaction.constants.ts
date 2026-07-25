export enum TransactionReferenceType {
    Ride = 'Ride',
    Listing = 'Listing',
    Reservation = 'Reservation',
    Consultation = 'Consultation',
    Wallet = 'Wallet',
}

export enum TransactionGateway {
    Stripe = 'stripe',
    Paypal = 'paypal',
    Manual = 'manual',
}

export enum TransactionType {
    Payment = 'payment',
    Refund = 'refund',
    Payout = 'payout',
}

export enum TransactionStatus {
    Pending = 'pending',
    Completed = 'completed',
    Failed = 'failed',
    Cancelled = 'cancelled',
}