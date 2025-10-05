import Comment from '../models/Comment.js';
import Activity from '../models/Activity.js';

export const addComment = async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: { code: 'FIELD_REQUIRED', field: 'message' } });
  const comment = await Comment.create({ ticket: req.params.id, user: req.user.id, message });
  
  // Log activity
  await Activity.create({
    ticket: req.params.id,
    user: req.user.id,
    action: 'commented',
    details: { message: 'Comment added' },
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') }
  });
  
  res.json(comment);
};
