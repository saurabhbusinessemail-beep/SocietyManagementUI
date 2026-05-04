import { IDefaultFields, IFlat, IFlatMember, ISociety, IUser } from './';

export type RentPaymentStatus = 'pending_approval' | 'approved' | 'rejected';
export type RentPaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'other';

export interface IRentPayment extends IDefaultFields {
  _id: string;
  societyId: string | ISociety;
  flatId: string | IFlat;
  flatMemberId: string | IFlatMember; // Tenant

  month: number;
  year: number;
  amount: number;

  paymentMethod?: RentPaymentMethod;
  paymentDetails?: any;

  paidOn?: Date;

  status: RentPaymentStatus;
  recordedBy?: string | IUser;
  approvedBy?: string | IUser;
  rejectionReason?: string;
  isOwnerRecorded?: boolean;

  note?: string;

  // Populated fields for reports
  flatNumber?: string;
  memberName?: string;
  memberContact?: string;
}

export interface IRentSummary {
  totalTenants: number;
  paidCount: number;
  pendingApprovalCount: number;
  notPaidCount: number;
  totalCollected: number;
  totalRentExpected?: number;
  pendingAmount?: number;
}

export interface IRentReportEntry {
  flatMemberId: string;
  memberName: string;
  memberContact: string;
  rentAmountExpected: number;
  payment: IRentPayment | null;
  status: RentPaymentStatus | 'not_paid';
  lastReminderSent?: Date;
}

export interface IRentMonthlyReport {
  summary: IRentSummary;
  entries: IRentReportEntry[];
}

export interface IRentLog {
  _id: string;
  logType: 'payment' | 'reminder';
  date: Date;
  month: number;
  year: number;
  amount?: number;
  status?: RentPaymentStatus;
  rejectionReason?: string;
  note?: string;
  sentBy?: any;
  recordedBy?: any;
  approvedBy?: any;
  type?: string; // for reminder type (sms/notification)
}

export interface IRentLogsResponse {
  logs: IRentLog[];
  flat: {
    flatNumber: string;
    floor: number;
    buildingNumber: string | null;
    societyName: string;
    owner: {
      name: string;
      contact: string;
      user: IUser | null;
    } | null;
  };
}
