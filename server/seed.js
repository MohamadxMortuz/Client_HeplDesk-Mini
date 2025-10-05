import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Ticket from './models/Ticket.js';
import bcrypt from 'bcrypt';

dotenv.config();

const run = async () => {
  await connectDB();
  await User.deleteMany({});
  await Ticket.deleteMany({});
  const p = await bcrypt.hash('Password123!', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await User.create({ name: 'Admin', email: 'admin@example.com', password: p, role: 'admin' });
  const adminTest = await User.create({ name: 'Test Admin', email: 'admin@mail.com', password: adminPassword, role: 'admin' });
  const agent = await User.create({ name: 'Agent', email: 'agent@example.com', password: p, role: 'agent' });
  const user = await User.create({ name: 'User', email: 'user@example.com', password: p, role: 'user' });
  
  await Ticket.create({ title: 'Sample ticket 1', description: 'Problem description', user: user._id, priority: 'high', sla_due: new Date(Date.now()+8*3600*1000) });
  await Ticket.create({ title: 'Sample ticket 2', description: 'Another problem', user: user._id, priority: 'medium', sla_due: new Date(Date.now()+24*3600*1000) });
  
  console.log('seeded');
  console.log('Test accounts:');
  console.log('- admin@example.com / Password123! (admin)');
  console.log('- admin@mail.com / admin123 (admin)');
  console.log('- agent@example.com / Password123! (agent)');
  console.log('- user@example.com / Password123! (user)');
  process.exit(0);
};

run();
