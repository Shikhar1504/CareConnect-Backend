import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import connectDB from './src/config/db.js';
import startCronJobs from './src/jobs/cron.jobs.js';

// Routes
import authRoutes from './src/routes/auth.routes.js';
import patientRoutes from './src/routes/patient.routes.js';
import aiRoutes from './src/routes/ai.routes.js';
import communicationRoutes from './src/routes/communication.routes.js';
import analyticsRoutes from './src/routes/analytics.routes.js';
import alertRoutes from './src/routes/alert.routes.js';
import checkinRoutes from './src/routes/checkin.routes.js';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/patient', checkinRoutes);
app.use('/api', communicationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

// Root
app.get('/', (req, res) => {
  res.send('CareConnect API Gateway is running!');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      startCronJobs();
    });

  } catch (error) {
    console.error('Startup error:', error);
    process.exit(1);
  }
};

startServer();