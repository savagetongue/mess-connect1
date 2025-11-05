import { IndexedEntity } from "./core-utils";
import type {
  User,
  WeeklyMenu,
  Complaint,
  Suggestion,
  MonthlyDue,
  GuestPayment,
  Broadcast,
  Note,
  MessSettings
} from "@shared/types";
// USER ENTITY
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", name: "", phone: "", passwordHash: "", role: 'student', status: 'pending' };
  static keyOf(state: User): string { return state.id; } // Use email as ID
}
// MENU ENTITY (Singleton for now)
export class MenuEntity extends IndexedEntity<WeeklyMenu> {
  static readonly entityName = "menu";
  static readonly indexName = "menus";
  static readonly initialState: WeeklyMenu = { id: "current", weekNumber: 1, days: [] };
}
// COMPLAINT ENTITY
export class ComplaintEntity extends IndexedEntity<Complaint> {
  static readonly entityName = "complaint";
  static readonly indexName = "complaints";
  static readonly initialState: Complaint = { id: "", studentId: "", studentName: "", text: "", createdAt: 0 };
}
// SUGGESTION ENTITY
export class SuggestionEntity extends IndexedEntity<Suggestion> {
  static readonly entityName = "suggestion";
  static readonly indexName = "suggestions";
  static readonly initialState: Suggestion = { id: "", studentId: "", studentName: "", text: "", createdAt: 0 };
}
// MONTHLY DUE ENTITY
export class MonthlyDueEntity extends IndexedEntity<MonthlyDue> {
  static readonly entityName = "monthlyDue";
  static readonly indexName = "monthlyDues";
  static readonly initialState: MonthlyDue = { studentId: "", month: "", amount: 0, status: 'due' };
  static keyOf(state: MonthlyDue): string { return `${state.studentId}:${state.month}`; }
}
// GUEST PAYMENT ENTITY
export class GuestPaymentEntity extends IndexedEntity<GuestPayment> {
  static readonly entityName = "guestPayment";
  static readonly indexName = "guestPayments";
  static readonly initialState: GuestPayment = { id: "", name: "", phone: "", amount: 0, createdAt: 0 };
}
// BROADCAST ENTITY
export class BroadcastEntity extends IndexedEntity<Broadcast> {
  static readonly entityName = "broadcast";
  static readonly indexName = "broadcasts";
  static readonly initialState: Broadcast = { id: "", message: "", createdAt: 0 };
}
// NOTE ENTITY
export class NoteEntity extends IndexedEntity<Note> {
  static readonly entityName = "note";
  static readonly indexName = "notes";
  static readonly initialState: Note = { id: "", text: "", completed: false };
}
// SETTINGS ENTITY (Singleton)
export class SettingsEntity extends IndexedEntity<MessSettings> {
    static readonly entityName = "settings";
    static readonly indexName = "settings";
    static readonly initialState: MessSettings = { id: "settings", monthlyFee: 0, rules: "" };
}