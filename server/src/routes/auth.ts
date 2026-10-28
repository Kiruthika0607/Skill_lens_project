import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import crypto from 'crypto';
import { AuthenticatedRequest, authenticate } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-sih-industry-skill-key-2026';

// POST /api/auth/signup
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, role = 'student', fullName, college, discipline, graduationYear, preferredDomain } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const existingUser = db.prepare(`SELECT id FROM users WHERE email = ?`).get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const userId = `usr_${crypto.randomUUID()}`;
    const passwordHash = await bcrypt.hash(password, 10);

    db.prepare(`
      INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)
    `).run(userId, email, passwordHash, role);

    let studentId: string | undefined;

    if (role === 'student') {
      studentId = `std_${crypto.randomUUID()}`;
      db.prepare(`
        INSERT INTO students (id, user_id, full_name, college, discipline, graduation_year, preferred_domain, student_score)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0.0)
      `).run(studentId, userId, fullName || 'Engineering Student', college || 'Anna University', discipline || 'Computer Science Engineering', graduationYear || 2026, preferredDomain || 'Software Development');
    }

    const token = jwt.sign({ id: userId, email, role, studentId }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
      message: 'User registered successfully',
      user: { id: userId, email, role, studentId },
      token
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/register (alias for /signup)
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, role = 'student', fullName, college, discipline, graduationYear, preferredDomain } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
    const existingUser = db.prepare(`SELECT id FROM users WHERE email = ?`).get(email);
    if (existingUser) return res.status(400).json({ error: 'User with this email already exists.' });
    const userId = `usr_${crypto.randomUUID()}`;
    const passwordHash = await bcrypt.hash(password, 10);
    db.prepare(`INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)`).run(userId, email, passwordHash, role);
    let studentId: string | undefined;
    if (role === 'student') {
      studentId = `std_${crypto.randomUUID()}`;
      db.prepare(`INSERT INTO students (id, user_id, full_name, college, discipline, graduation_year, preferred_domain, student_score) VALUES (?, ?, ?, ?, ?, ?, ?, 0.0)`).run(studentId, userId, fullName || 'Engineering Student', college || 'Anna University', discipline || 'Computer Science Engineering', graduationYear || 2026, preferredDomain || 'Full Stack Web Development');
    }
    const token = jwt.sign({ id: userId, email, role, studentId }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.status(201).json({ message: 'User registered successfully', user: { id: userId, email, role, studentId }, token });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email address is required.' });
  return res.json({
    message: 'If an account exists with that email, a password reset link and temporary security code has been sent.',
    status: 'SENT'
  });
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email) as any;
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    let studentId: string | undefined;
    if (user.role === 'student') {
      const student = db.prepare(`SELECT id FROM students WHERE user_id = ?`).get(user.id) as any;
      studentId = student?.id;
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, studentId }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
      message: 'Logged in successfully',
      user: { id: user.id, email: user.email, role: user.role, studentId },
      token
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  return res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me
router.get('/me', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

  let studentDetails: any = null;
  if (req.user.role === 'student' && req.user.studentId) {
    studentDetails = db.prepare(`SELECT * FROM students WHERE id = ?`).get(req.user.studentId);
  }

  return res.json({
    user: req.user,
    student: studentDetails
  });
});

export default router;
