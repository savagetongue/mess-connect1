import { Hono } from "hono";
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { Env } from './core-utils';
import { UserEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { User } from "@shared/types";
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
  // Ensure admin and manager exist on first run
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
    const newUser: User = {
      id: email,
      name,
      phone,
      passwordHash,
      role: 'student',
      status: 'pending',
    };
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
  // Placeholder for a protected route
  app.get('/api/auth/me', async (c) => {
      // In a real app, you'd get the user ID from a validated token/session
      const userId = c.req.query('userId');
      if (!isStr(userId)) return bad(c, 'Not authenticated');
      const userEntity = new UserEntity(c.env, userId);
      if (!await userEntity.exists()) return notFound(c, 'User not found');
      const user = await userEntity.getState();
      const { passwordHash: _, ...userResponse } = user;
      return ok(c, userResponse);
  });
}