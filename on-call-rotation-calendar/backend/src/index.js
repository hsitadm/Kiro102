const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const { initializeDatabase } = require('./utils/dbMigration');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB()
  .then(() => {
    // Initialize database with default data
    return initializeDatabase();
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to On-Call Rotation Calendar API' });
});

// API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
// app.use('/api/collaborators', require('./routes/collaboratorRoutes'));
// app.use('/api/schedules', require('./routes/scheduleRoutes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    code: 'NOT_FOUND',
    message: 'The requested resource was not found',
    timestamp: new Date().toISOString(),
    path: req.path
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    details: process.env.NODE_ENV === 'development' ? [err.message] : [],
    timestamp: new Date().toISOString(),
    path: req.path,
    correlationId: req.headers['x-correlation-id'] || 'unknown'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;