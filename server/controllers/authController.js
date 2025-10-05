import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!email) return res.status(400).json({ error: { code: 'FIELD_REQUIRED', field: 'email', message: 'Email is required' } });
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: { code: 'EMAIL_TAKEN', field: 'email' } });
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, role: role || 'user' });
  res.json({ id: user._id, email: user.email, role: user.role });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS' } });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS' } });
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, role: user.role, email: user.email, name: user.name });
};

export const me = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
};

export const getAgents = async (req, res) => {
  const agents = await User.find({ role: { $in: ['agent', 'admin'] } }).select('email name role');
  res.json(agents);
};
