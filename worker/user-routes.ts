import { Hono } from "hono";
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { Env } from './core-utils';
import { UserEntity, MenuEntity, ComplaintEntity, SuggestionEntity, SettingsEntity, MonthlyDueEntity, GuestPaymentEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import type { User, WeeklyMenu, Complaint, Suggestion, MessSettings, MonthlyDue, GuestPayment, VerifyPaymentPayload } from "@shared/types";
import { format } from 'date-fns';
// A simple placeholder for image uploads. In a real app, use a service like R2.
const uploadImage = async (file: File): Promise<string> => {
  return `https://placehold.co/600x400?text=Image+Placeholder\\n${file.size}+bytes`;
};
// Basic password hashing simulation
const hashPassword = async (password: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
};
const verifyPassword = async (password: string, hash: string) => {
    const passwordHash = await hashPassword(password);
    return passwordHash === hash;
};
export function userRoutes(app: Hono<{ Bindings: Env & { RAZORPAY_KEY_ID: string; RAZORPAY_KEY_SECRET: string } }>) {
  // Middleware to ensure admin and manager exist
  app.use('/api/*', async (c, next) => {
    const adminUser = new UserEntity(c.env, 'admin@messconnect.com');
    if (!await adminUser.exists()) {
      const passwordHash = await hashPassword('password');
      await UserEntity.create(c.env, { id: 'admin@messconnect.com', name: 'Admin', phone: '0000000000', passwordHash, role: 'admin', status: 'approved' });
    }
    const managerUser = new UserEntity(c.env, 'manager@messconnect.com');
    if (!await managerUser.exists()) {
      const passwordHash = await hashPassword('password');
      await UserEntity.create(c.env, { id: 'manager@messconnect.com', name: 'Manager', phone: '1111111111', passwordHash, role: 'manager', status: 'approved' });
    }
    await next();
  });
  // --- AUTH ROUTES ---
  const registerSchema = z.object({ name: z.string().min(2), email: z.string().email(), phone: z.string().min(10), password: z.string().min(6) });
  app.post('/api/auth/register', zValidator('json', registerSchema), async (c) => {
    const { name, email, phone, password } = c.req.valid('json');
    const user = new UserEntity(c.env, email);
    if (await user.exists()) return bad(c, 'User with this email already exists.');
    const passwordHash = await hashPassword(password);
    const newUser: User = { id: email, name, phone, passwordHash, role: 'student', status: 'pending' };
    await UserEntity.create(c.env, newUser);
    const { passwordHash: _, ...userResponse } = newUser;
    return ok(c, userResponse);
  });
  const loginSchema = z.object({ email: z.string().email(), password: z.string() });
  app.post('/api/auth/login', zValidator('json', loginSchema), async (c) => {
    const { email, password } = c.req.valid('json');
    const userEntity = new UserEntity(c.env, email);
    if (!await userEntity.exists()) return notFound(c, 'User not found.');
    const user = await userEntity.getState();
    if (!await verifyPassword(password, user.passwordHash)) return bad(c, 'Invalid credentials.');
    const { passwordHash: _, ...userResponse } = user;
    return ok(c, userResponse);
  });
  // --- STUDENT MANAGEMENT & DUES GENERATION ---
  app.get('/api/students', async (c) => {
    const { items: allUsers } = await UserEntity.list(c.env);
    const students = allUsers.filter(u => u.role === 'student').map(({ passwordHash, ...rest }) => rest);
    return ok(c, { students });
  });
  const statusUpdateSchema = z.object({ status: z.enum(['approved', 'rejected']) });
  app.post('/api/students/:id/status', zValidator('json', statusUpdateSchema), async (c) => {
    const studentId = c.req.param('id');
    const { status } = c.req.valid('json');
    const studentEntity = new UserEntity(c.env, studentId);
    if (!await studentEntity.exists()) return notFound(c, 'Student not found.');
    await studentEntity.patch({ status });
    if (status === 'approved') {
        const settingsEntity = new SettingsEntity(c.env, 'settings');
        const settings = await settingsEntity.getState();
        const currentMonth = format(new Date(), 'yyyy-MM');
        const dueId = `${studentId}:${currentMonth}`;
        const dueEntity = new MonthlyDueEntity(c.env, dueId);
        if (!await dueEntity.exists()) {
            const newDue: MonthlyDue = { id: dueId, studentId, month: currentMonth, amount: settings.monthlyFee, status: 'due' };
            await MonthlyDueEntity.create(c.env, newDue);
        }
    }
    return ok(c, { message: `Student status updated to ${status}` });
  });
  // --- MENU ROUTES ---
  app.get('/api/menu', async (c) => {
    const menuEntity = new MenuEntity(c.env, 'current');
    if (!await menuEntity.exists()) return notFound(c, 'Menu has not been set yet.');
    return ok(c, await menuEntity.getState());
  });
  const dayMenuSchema = z.object({ day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']), breakfast: z.string().min(1), lunch: z.string().min(1), dinner: z.string().min(1) });
  const weeklyMenuSchema = z.object({ days: z.array(dayMenuSchema).length(7) });
  app.post('/api/menu', zValidator('json', weeklyMenuSchema), async (c) => {
    const { days } = c.req.valid('json');
    const menuEntity = new MenuEntity(c.env, 'current');
    const newMenu: WeeklyMenu = { id: 'current', weekNumber: new Date().getWeek(), days };
    await menuEntity.save(newMenu);
    return ok(c, newMenu);
  });
  // --- FEEDBACK ROUTES ---
  app.post('/api/complaints', async (c) => {
    const formData = await c.req.formData();
    const text = formData.get('text') as string;
    const studentId = formData.get('studentId') as string;
    const studentName = formData.get('studentName') as string;
    const imageFile = formData.get('image') as File | null;
    if (!text || !studentId || !studentName) return bad(c, 'Missing required fields.');
    let imageUrl: string | undefined;
    if (imageFile && imageFile.size > 0) {
      imageUrl = await uploadImage(imageFile);
    }
    const newComplaint: Complaint = { id: crypto.randomUUID(), studentId, studentName, text, imageUrl, createdAt: Date.now() };
    await ComplaintEntity.create(c.env, newComplaint);
    return ok(c, newComplaint);
  });
  app.get('/api/complaints', async (c) => {
    const studentId = c.req.query('studentId');
    const { items } = await ComplaintEntity.list(c.env);
    const complaints = studentId ? items.filter(item => item.studentId === studentId) : items;
    return ok(c, { complaints });
  });
  const replySchema = z.object({ reply: z.string().min(1) });
  app.post('/api/complaints/:id/reply', zValidator('json', replySchema), async (c) => {
    const id = c.req.param('id');
    const { reply } = c.req.valid('json');
    const complaintEntity = new ComplaintEntity(c.env, id);
    if (!await complaintEntity.exists()) return notFound(c, 'Complaint not found.');
    await complaintEntity.patch({ reply });
    return ok(c, { message: 'Reply added.' });
  });
  const suggestionSchema = z.object({ text: z.string().min(10), studentId: z.string(), studentName: z.string() });
  app.post('/api/suggestions', zValidator('json', suggestionSchema), async (c) => {
    const { text, studentId, studentName } = c.req.valid('json');
    const newSuggestion: Suggestion = { id: crypto.randomUUID(), studentId, studentName, text, createdAt: Date.now() };
    await SuggestionEntity.create(c.env, newSuggestion);
    return ok(c, newSuggestion);
  });
  app.get('/api/suggestions', async (c) => {
    const studentId = c.req.query('studentId');
    const { items } = await SuggestionEntity.list(c.env);
    const suggestions = studentId ? items.filter(item => item.studentId === studentId) : items;
    return ok(c, { suggestions });
  });
  app.post('/api/suggestions/:id/reply', zValidator('json', replySchema), async (c) => {
    const id = c.req.param('id');
    const { reply } = c.req.valid('json');
    const suggestionEntity = new SuggestionEntity(c.env, id);
    if (!await suggestionEntity.exists()) return notFound(c, 'Suggestion not found.');
    await suggestionEntity.patch({ reply });
    return ok(c, { message: 'Reply added.' });
  });
  // --- FINANCIAL & SETTINGS ROUTES ---
  app.get('/api/settings', async (c) => {
    const settingsEntity = new SettingsEntity(c.env, 'settings');
    return ok(c, await settingsEntity.getState());
  });
  const settingsSchema = z.object({ monthlyFee: z.number().min(0) });
  app.post('/api/settings', zValidator('json', settingsSchema), async (c) => {
    const { monthlyFee } = c.req.valid('json');
    const settingsEntity = new SettingsEntity(c.env, 'settings');
    await settingsEntity.patch({ monthlyFee });
    return ok(c, await settingsEntity.getState());
  });
  app.get('/api/my-dues', async (c) => {
    const studentId = c.req.query('studentId');
    if (!studentId) return bad(c, 'Student ID is required.');
    const { items } = await MonthlyDueEntity.list(c.env);
    const dues = items.filter(d => d.studentId === studentId);
    return ok(c, { dues });
  });
  app.get('/api/financials', async (c) => {
    const [duesResult, guestPaymentsResult] = await Promise.all([
        MonthlyDueEntity.list(c.env),
        GuestPaymentEntity.list(c.env)
    ]);
    return ok(c, { dues: duesResult.items, guestPayments: guestPaymentsResult.items });
  });
  app.post('/api/dues/:id/mark-paid', async (c) => {
    const dueId = c.req.param('id');
    const dueEntity = new MonthlyDueEntity(c.env, dueId);
    if (!await dueEntity.exists()) return notFound(c, 'Due record not found.');
    await dueEntity.patch({ status: 'paid' });
    return ok(c, { message: 'Marked as paid.' });
  });
  // --- PAYMENT ROUTES ---
  const createOrderSchema = z.object({
    amount: z.number().min(1),
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
    entityId: z.string(),
  });
  app.post('/api/payment/create-order', zValidator('json', createOrderSchema), async (c) => {
    if (!c.env.RAZORPAY_KEY_ID || !c.env.RAZORPAY_KEY_SECRET) {
        return bad(c, 'Razorpay credentials are not configured.');
    }
    const { amount, entityId } = c.req.valid('json');
    const options = {
        amount: amount * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: `receipt_mess_${entityId.substring(0, 10)}_${Date.now()}`
    };
    try {
        const response = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(`${c.env.RAZORPAY_KEY_ID}:${c.env.RAZORPAY_KEY_SECRET}`)
            },
            body: JSON.stringify(options)
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Razorpay Error:", errorText);
            return bad(c, `Failed to create Razorpay order: ${errorText}`);
        }
        const order = await response.json();
        return ok(c, { orderId: order.id, amount: order.amount, currency: order.currency });
    } catch (error) {
        console.error("Create Order Error:", error);
        return bad(c, 'Could not create payment order.');
    }
  });
  const verifyPaymentSchema = z.object({
    razorpay_order_id: z.string(),
    razorpay_payment_id: z.string(),
    razorpay_signature: z.string(),
    entityId: z.string(),
    entityType: z.enum(['due', 'guest']),
    guestDetails: z.object({ name: z.string(), phone: z.string(), amount: z.number() }).optional(),
  });
  app.post('/api/payment/verify', zValidator('json', verifyPaymentSchema), async (c) => {
    const body = c.req.valid('json');
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, entityId, entityType, guestDetails } = body;
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(c.env.RAZORPAY_KEY_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(text));
    const expectedSignature = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
    if (expectedSignature === razorpay_signature) {
        if (entityType === 'due') {
            const dueEntity = new MonthlyDueEntity(c.env, entityId);
            if (await dueEntity.exists()) {
                await dueEntity.patch({ status: 'paid' });
                return ok(c, { message: 'Payment verified and due updated.' });
            }
        } else if (entityType === 'guest' && guestDetails) {
            const newPayment: GuestPayment = { id: crypto.randomUUID(), ...guestDetails, createdAt: Date.now() };
            await GuestPaymentEntity.create(c.env, newPayment);
            return ok(c, { message: 'Payment verified and guest payment recorded.' });
        }
        return bad(c, 'Entity not found for payment verification.');
    } else {
        return bad(c, 'Payment verification failed.');
    }
  });
}
// Helper to get week number
declare global {
    interface Date { getWeek(): number; }
}
Date.prototype.getWeek = function() {
    const date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}