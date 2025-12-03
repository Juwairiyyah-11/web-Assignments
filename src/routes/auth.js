import { Router } from 'express';
import bcrypt from 'bcrypt';
import validator from 'validator';
import User from '../models/User.js';
import { ensureGuest } from '../middleware/auth.js';

const router = Router();
const SALT_ROUNDS = 10;
router.get('/register', ensureGuest, (_req, res) => {
  res.render('auth/register', { title: 'Register' });
});

router.post('/register', ensureGuest, async (req, res) => {
  const { username = '', email = '', password = '', confirm = '' } = req.body;
  const errors = [];

  if (!username.trim()) errors.push('Username is required.');
  if (!validator.isEmail(email || '')) errors.push('Valid email is required.');
  if (password.length < 6) errors.push('Password must be at least 6 characters.');
  if (password !== confirm) errors.push('Passwords do not match.');

  if (errors.length) return res.status(400).render('auth/register', { errors, title: 'Register', body: { username, email } });

  try {
    const exists = await User.findOne({ $or: [{ username }, { email }] }).lean();
    if (exists) return res.status(400).render('auth/register', { errors: ['Username or email already exists.'], title: 'Register', body: { username, email } });

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    await User.create({ username, email, password: hash });

    res.redirect('/login?registered=1');
  } 
  catch (e) {
    res.status(500).render('auth/register', { errors: ['Registration failed. Please try again.'], title: 'Register', body: { username, email } });
  }
});

router.get('/login', ensureGuest, (req, res) => {
  const justRegistered = req.query.registered ? 'Account created. Please sign in.' : null;
  res.render('auth/login', { title: 'Login', justRegistered });
});

router.post('/login', ensureGuest, async (req, res) => {
  const { email = '', password = '' } = req.body;

  if (!email || !password)
    return res.status(400).render('auth/login', { title: 'Login', errors: ['Email and password required.'], body: { email } });

  try {
    const user = await User.findOne({ email }).lean();
    if (!user) return res.status(401).render('auth/login', { title: 'Login', errors: ['Invalid credentials.'], body: { email } });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).render('auth/login', { title: 'Login', errors: ['Invalid credentials.'], body: { email } });

    req.session.user = { id: String(user._id), email: user.email, username: user.username };
    res.redirect('/dashboard');
  } 
  catch (e) 
  {
    res.status(500).render('auth/login', { title: 'Login', errors: ['Login failed. Try again.'], body: { email } });
  }
});

router.get('/logout', (req, res) => {
  req.session.reset();
  res.redirect('/login');
});
export default router;