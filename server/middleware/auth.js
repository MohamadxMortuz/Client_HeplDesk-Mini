import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: { code: 'UNAUTHORIZED' } });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('-password');
    if (!user) return res.status(401).json({ error: { code: 'UNAUTHORIZED' } });
    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch (e) {
    return res.status(403).json({ error: { code: 'INVALID_TOKEN' } });
  }
};

export const requireRole = (roles = []) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: { code: 'FORBIDDEN' } });
  next();
};
