export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export type UserRole = 'student' | 'manager' | 'admin';
export type UserStatus = 'pending' | 'approved' | 'rejected';
export interface User {
  id: string; // email
  name: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
}
export interface DayMenu {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  breakfast: string;
  lunch: string;
  dinner: string;
}
export interface WeeklyMenu {
  id: string; // e.g., 'current'
  weekNumber: number;
  days: DayMenu[];
}
export interface Complaint {
  id: string;
  studentId: string;
  studentName: string;
  text: string;
  imageUrl?: string;
  reply?: string;
  createdAt: number;
}
export interface Suggestion {
  id: string;
  studentId: string;
  studentName: string;
  text: string;
  reply?: string;
  createdAt: number;
}
export type DueStatus = 'paid' | 'due';
export interface MonthlyDue {
  id: string; // Composite key: studentId:YYYY-MM
  studentId: string;
  month: string; // YYYY-MM format
  amount: number;
  status: DueStatus;
}
export interface GuestPayment {
  id: string;
  name: string;
  phone: string;
  amount: number;
  createdAt: number;
}
export interface Broadcast {
  id: string;
  message: string;
  createdAt: number;
}
export interface Note {
  id: string;
  text: string;
  completed: boolean;
}
export interface MessSettings {
  id: 'settings';
  monthlyFee: number;
  rules: string;
}
// Types for Razorpay Integration
export interface CreateOrderResponse {
  orderId: string;
  amount: number; // in paise
  currency: string;
  name: string;
  email: string;
  phone: string;
}
export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  entityId: string; // Can be dueId for students or a temp ID for guests
  entityType: 'due' | 'guest';
}