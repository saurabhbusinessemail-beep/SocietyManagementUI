export interface ICoupon {
  _id?: string;
  code: string;
  type: 'percentage' | 'fixed' | 'direct';
  value: number;
  planId: string | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDiscountResult {
  discount: number;
  finalAmount: number;
  couponCode: string | null;
}