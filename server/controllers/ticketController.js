import Ticket from '../models/Ticket.js';
import Comment from '../models/Comment.js';
import Activity from '../models/Activity.js';

const calcSLA = (priority) => {
  const hours = priority === 'high' ? 8 : priority === 'medium' ? 24 : 48;
  return new Date(Date.now() + hours * 60 * 60 * 1000);
};

export const createTicket = async (req, res) => {
  const { title, description, priority } = req.body;
  if (!title) return res.status(400).json({ error: { code: 'FIELD_REQUIRED', field: 'title', message: 'Title is required' } });
  const ticket = await Ticket.create({ title, description, priority: priority || 'medium', user: req.user.id, sla_due: calcSLA(priority || 'medium') });
  
  // Log activity
  await Activity.create({
    ticket: ticket._id,
    user: req.user.id,
    action: 'created',
    details: { message: 'Ticket created' },
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') }
  });
  
  res.json(ticket);
};

export const getTickets = async (req, res) => {
  const { limit = 10, offset = 0, q = '', status } = req.query;
  const filter = {};
  
  // Enhanced search to include comments
  if (q) {
    const commentTickets = await Comment.find({ 
      message: { $regex: q, $options: 'i' } 
    }).distinct('ticket');
    
    filter.$or = [
      { title: { $regex: q, $options: 'i' } }, 
      { description: { $regex: q, $options: 'i' } },
      { _id: { $in: commentTickets } }
    ];
  }
  
  if (status) filter.status = status;
  if (req.user.role === 'user') filter.user = req.user.id;
  const items = await Ticket.find(filter).populate('user agent').sort({ createdAt: -1 }).skip(parseInt(offset)).limit(parseInt(limit));
  res.json({ items, next_offset: parseInt(offset) + items.length });
};

export const getTicketById = async (req, res) => {
  const t = await Ticket.findById(req.params.id).populate('user agent');
  if (!t) return res.status(404).json({ error: { code: 'NOT_FOUND' } });
  const comments = await Comment.find({ ticket: t._id }).populate('user');
  const activities = await Activity.find({ ticket: t._id }).populate('user').sort({ createdAt: -1 });
  res.json({ ticket: t, comments, activities });
};

export const updateTicket = async (req, res) => {
  const { status, agent, version } = req.body;
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ error: { code: 'NOT_FOUND' } });
  if (version && ticket.version !== version) return res.status(409).json({ error: { code: 'STALE_UPDATE', message: 'Ticket has been modified by someone else' } });
  
  const activities = [];
  const oldStatus = ticket.status;
  const oldAgent = ticket.agent;
  
  if (status && status !== oldStatus) {
    ticket.status = status;
    activities.push({
      ticket: ticket._id,
      user: req.user.id,
      action: 'status_changed',
      details: { 
        field: 'status', 
        oldValue: oldStatus, 
        newValue: status,
        message: `Status changed from ${oldStatus} to ${status}` 
      },
      metadata: { ip: req.ip, userAgent: req.get('User-Agent') }
    });
  }
  
  if (agent !== undefined && agent?.toString() !== oldAgent?.toString()) {
    ticket.agent = agent || undefined;
    activities.push({
      ticket: ticket._id,
      user: req.user.id,
      action: 'assigned',
      details: { 
        field: 'agent', 
        oldValue: oldAgent, 
        newValue: agent,
        message: `Ticket assigned to agent` 
      },
      metadata: { ip: req.ip, userAgent: req.get('User-Agent') }
    });
  }
  
  if (activities.length === 0) {
    activities.push({
      ticket: ticket._id,
      user: req.user.id,
      action: 'updated',
      details: { message: 'Ticket updated' },
      metadata: { ip: req.ip, userAgent: req.get('User-Agent') }
    });
  }
  
  ticket.version += 1;
  await ticket.save();
  await Activity.insertMany(activities);
  
  res.json(ticket);
};

export const listBreached = async (req, res) => {
  const items = await Ticket.find({ sla_due: { $lt: new Date() }, status: { $ne: 'resolved' } });
  res.json({ items });
};
