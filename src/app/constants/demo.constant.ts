export enum DemoBookingStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    RESCHEDULED = 'rescheduled',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    NO_SHOW = 'no_show',
    FOLLOW_UP = 'follow_up'
}

export enum BookingSource {
    WEBSITE = 'website',
    MOBILE_APP = 'mobile_app',
    REFERRAL = 'referral',
    SOCIAL_MEDIA = 'social_media',
    EMAIL_CAMPAIGN = 'email_campaign',
    DIRECT_CALL = 'direct_call',
    CHATBOT = 'chatbot',
    PARTNER = 'partner'
}