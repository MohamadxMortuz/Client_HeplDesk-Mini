import express from 'express';
import { protect } from '../middleware/auth.js';
import { addComment } from '../controllers/commentController.js';
const router = express.Router();
router.post('/:id/comments', protect, addComment);
export default router;
