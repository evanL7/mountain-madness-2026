import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import calendarRoutes from './routes/calendar.js';
import dashboardRoutes from './routes/dashboard.js';
import insightsRoutes from './routes/insights.js';
import challengesRoutes from './routes/challenges.js';
import chatRoutes from './routes/chat.js';

dotenv.config({ path: '../.env' });

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/calendar', calendarRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/challenges', challengesRoutes);
app.use('/api/chat', chatRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`FutureSpend server running on port ${PORT}`));
