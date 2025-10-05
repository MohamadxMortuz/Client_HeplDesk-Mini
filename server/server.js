import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();
const { MONGO_URI, JWT_SECRET } = process.env;
if (!MONGO_URI || !JWT_SECRET) {
  console.error('Missing required env vars. Set MONGO_URI and JWT_SECRET in server/.env');
  process.exit(1);
}
await connectDB();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/_meta', (req, res) => res.json({ name: 'HelpDesk Mini', version: '1.0.0' }));
app.get('/.well-known/hackathon.json', (req, res) => res.json({ name: 'HelpDesk Mini', description: 'Ticketing with SLA, comments, roles' }));

app.use('/api', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/tickets', commentRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
