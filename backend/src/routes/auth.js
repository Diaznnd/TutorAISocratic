import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';

const r = Router();
const sign = (u) =>
  jwt.sign({ id: u.id, role: u.role, name: u.name }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Batasi percobaan login: maks 10 kali per 15 menit per IP untuk mencegah brute-force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Terlalu banyak percobaan masuk yang gagal. Silakan tunggu 15 menit.',
});

// Batasi registrasi akun baru: maks 10 kali per jam per IP
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Terlalu banyak akun didaftarkan dari perangkat ini. Coba lagi nanti.',
});

r.post('/register', registerLimiter, async (req, res) => {
  const p = z
    .object({
      name: z.string().trim().min(2).max(100),
      email: z.string().trim().toLowerCase().email().max(100),
      password: z.string().min(8, 'Kata sandi minimal 8 karakter').max(100),
      role: z.enum(['dosen', 'mahasiswa']),
    })
    .safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'Data tidak valid', detail: p.error.flatten() });
  const { name, email, password, role } = p.data;
  if (await prisma.user.findUnique({ where: { email } }))
    return res.status(409).json({ error: 'Email sudah terdaftar' });
  const user = await prisma.user.create({
    data: { name, email, role, passwordHash: await bcrypt.hash(password, 10) },
  });
  res.status(201).json({ token: sign(user), user: { id: user.id, name, role } });
});

r.post('/login', loginLimiter, async (req, res) => {
  const p = z
    .object({
      email: z.string().trim().toLowerCase().email().max(100),
      password: z.string().min(1).max(100),
    })
    .safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'Email atau kata sandi tidak valid' });

  const { email, password } = p.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash)))
    return res.status(401).json({ error: 'Email atau kata sandi salah' });
  res.json({ token: sign(user), user: { id: user.id, name: user.name, role: user.role } });
});

r.get('/me', requireAuth, (req, res) => res.json({ user: req.user }));

export default r;
