import express from 'express';
import { protect, requireRole } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimit.js';
import { idempotency } from '../middleware/idempotency.js';
import { createTicket, getTickets, getTicketById, updateTicket, listBreached } from '../controllers/ticketController.js';

const router = express.Router();
router.use(apiLimiter);
router.post('/', protect, idempotency, createTicket);
router.get('/', protect, getTickets);
router.get('/breached', protect, requireRole(['admin']), listBreached);
router.get('/:id', protect, getTicketById);
router.patch('/:id', protect, updateTicket);
export default router;
