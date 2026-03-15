import { BookingSource, DemoBookingStatus } from "../constants";

export interface IDemoBooking {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    societyName?: string;
    preferredDate: Date | string;
    preferredTime: string;
    notes?: string;
    status?: DemoBookingStatus;
    bookingDate?: Date;
    scheduledDemoDate?: Date;
    demoCompletedDate?: Date;
    rescheduleCount?: number;
    previousTimeSlots?: IPreviousTimeSlot[];
    feedback?: string;
    rating?: number;
    source?: BookingSource;
    ipAddress?: string;
    userAgent?: string;
    convertedToCustomer?: boolean;
    convertedToCustomerDate?: Date;
    assignedTo?: string;
    followUpDate?: Date;
    followUpNotes?: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IPreviousTimeSlot {
    date: Date | string;
    time: string;
    rescheduledAt: Date;
    rescheduledBy?: string;
    reason?: string;
}

export interface IDemoBookingFilters {
    status?: DemoBookingStatus;
    source?: BookingSource;
    startDate?: Date;
    endDate?: Date;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface ITimeSlotAvailability {
    date: string;
    slots: {
        time: string;
        available: boolean;
        bookedCount?: number;
        maxCapacity?: number;
    }[];
}