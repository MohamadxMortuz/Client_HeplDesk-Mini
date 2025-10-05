import express from 'express';
import { register, login, me, getAgents } from '../controllers/authController.js';
import { protect, requireRole } from '../middleware/auth.js';
const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, me);
router.get('/agents', protect, requireRole(['agent', 'admin']), getAgents);
export default router;
