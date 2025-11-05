import { Hono } from "hono";
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { Env } from './core-utils';
import { UserEntity, MenuEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { User, UserStatus, WeeklyMenu, DayMenu } from "@shared/types";
// Basic password hashing simulation (replace with a real library like bcrypt in production)
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
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Middleware to ensure admin and manager exist
  app.use('/api/*', async (c, next) => {
    const adminUser = new UserEntity(c.env, 'admin@messconnect.com');
    if (!await adminUser.exists()) {
      const passwordHash = await hashPassword('password');
      await UserEntity.create(c.env, {
        id: 'admin@messconnect.com',
        name: 'Admin',
        phone: '0000000000',
        passwordHash,
        role: 'admin',
        status: 'approved'
      });
    }
    const managerUser = new UserEntity(c.env, 'manager@messconnect.com');
    if (!await managerUser.exists()) {
      const passwordHash = await hashPassword('password');
      await UserEntity.create(c.env, {
        id: 'manager@messconnect.com',
        name: 'Manager',
        phone: '1111111111',
        passwordHash,
        role: 'manager',
        status: 'approved'
      });
    }
    await next();
  });
  // --- AUTH ROUTES ---
  const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
    password: z.string().min(6),
  });
  app.post('/api/auth/register', zValidator('json', registerSchema), async (c) => {
    const { name, email, phone, password } = c.req.valid('json');
    const user = new UserEntity(c.env, email);
    if (await user.exists()) {
      return bad(c, 'User with this email already exists.');
    }
    const passwordHash = await hashPassword(password);
    const newUser: User = { id: email, name, phone, passwordHash, role: 'student', status: 'pending' };
    await UserEntity.create(c.env, newUser);
    const { passwordHash: _, ...userResponse } = newUser;
    return ok(c, userResponse);
  });
  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
  });
  app.post('/api/auth/login', zValidator('json', loginSchema), async (c) => {
    const { email, password } = c.req.valid('json');
    const userEntity = new UserEntity(c.env, email);
    if (!await userEntity.exists()) {
      return notFound(c, 'User not found.');
    }
    const user = await userEntity.getState();
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return bad(c, 'Invalid credentials.');
    }
    const { passwordHash: _, ...userResponse } = user;
    return ok(c, userResponse);
  });
  // --- STUDENT MANAGEMENT ROUTES (MANAGER) ---
  app.get('/api/students', async (c) => {
    const { items: allUsers } = await UserEntity.list(c.env);
    const students = allUsers.filter(u => u.role === 'student').map(({ passwordHash, ...rest }) => rest);
    return ok(c, { students });
  });
  const statusUpdateSchema = z.object({
    status: z.enum(['approved', 'rejected']),
  });
  app.post('/api/students/:id/status', zValidator('json', statusUpdateSchema), async (c) => {
    const studentId = c.req.param('id');
    const { status } = c.req.valid('json');
    const studentEntity = new UserEntity(c.env, studentId);
    if (!await studentEntity.exists()) {
      return notFound(c, 'Student not found.');
    }
    await studentEntity.patch({ status });
    return ok(c, { message: `Student status updated to ${status}` });
  });
  // --- MENU ROUTES ---
  app.get('/api/menu', async (c) => {
    const menuEntity = new MenuEntity(c.env, 'current');
    if (!await menuEntity.exists()) {
        return notFound(c, 'Menu has not been set yet.');
    }
    const menu = await menuEntity.getState();
    return ok(c, menu);
  });
  const dayMenuSchema = z.object({
    day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
    breakfast: z.string().min(1),
    lunch: z.string().min(1),
    dinner: z.string().min(1),
  });
  const weeklyMenuSchema = z.object({
    days: z.array(dayMenuSchema).length(7),
  });
  app.post('/api/menu', zValidator('json', weeklyMenuSchema), async (c) => {
    const { days } = c.req.valid('json');
    const menuEntity = new MenuEntity(c.env, 'current');
    const currentWeek = new Date().getWeek();
    const newMenu: WeeklyMenu = { id: 'current', weekNumber: currentWeek, days };
    await menuEntity.save(newMenu);
    return ok(c, newMenu);
  });
}
// Helper to get week number
declare global {
    interface Date {
        getWeek(): number;
    }
}
Date.prototype.getWeek = function() {
    const date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}