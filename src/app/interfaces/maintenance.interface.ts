import { IDefaultFields, IFlat, IFlatMember, ISociety, IUser } from './';

export type MaintenancePaymentStatus = 'pending_approval' | 'approved' | 'rejected';
export type MaintenancePaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'other';

export interface IMaintenancePayment extends IDefaultFields {
  _id: string;
  societyId: string | ISociety;
  flatId: string | IFlat;
  flatMemberId: string | IFlatMember;

  month: number;
  year: number;
  amount: number;

  paymentMethod?: MaintenancePaymentMethod;
  paymentDetails?: any;

  paidOn?: Date;

  status: MaintenancePaymentStatus;
  recordedBy?: string | IUser;
  approvedBy?: string | IUser;
  rejectionReason?: string;
  isAdminRecorded?: boolean;

  note?: string;

  // Populated fields for reports
  flatNumber?: string;
  memberName?: string;
  memberContact?: string;
}

export interface IMaintenanceSummary {
  totalFlats: number;
  paidCount: number;
  pendingCount: number;
  totalCollected: number;
}

export interface IMaintenanceReportEntry {
  flatId: string;
  flatNumber: string;
  floor: number;
  memberName: string;
  memberContact: string;
  memberType: string;
  flatMemberId?: string;
  payment: IMaintenancePayment | null;
  status: MaintenancePaymentStatus | 'not_paid';
  lastReminderSent?: Date;
}

export interface IMaintenanceMonthlyReport {
  summary: IMaintenanceSummary;
  entries: IMaintenanceReportEntry[];
}

export interface IMaintenanceYearlyMonth {
  month: number;
  totalFlats: number;
  paidCount: number;
  pendingCount: number;
  notPaidCount: number;
  totalCollected: number;
}

export interface IMaintenanceYearlyReport {
  year: number;
  totalFlats: number;
  months: IMaintenanceYearlyMonth[];
}

export interface IMaintenanceLog {
  _id: string;
  logType: 'payment' | 'reminder';
  date: Date;
  month: number;
  year: number;
  amount?: number;
  status?: MaintenancePaymentStatus;
  rejectionReason?: string;
  note?: string;
  sentBy?: any;
  recordedBy?: any;
  approvedBy?: any;
  type?: string; // for reminder type (sms/notification)
}
