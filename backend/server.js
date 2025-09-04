/**
 * YouTube Optimizer - Express Server
 * 
 * @author SDI Solution Driven Innovators
 * @version 1.0.0
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const optimizeRoutes = require('./routes/optimize');
const analyticsRoutes = require('./routes/analytics');
const apiKeysRoutes = require('./routes/apiKeys');

// Import middleware
const rateLimit = require('./middleware/rateLimit');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');

// Import database connection
const connectDB = require('./services/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
connectDB();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "https://pagead2.googlesyndication.com", "https://www.googletagmanager.com", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:", "https://pagead2.googlesyndication.com"],
      connectSrc: ["'self'", "https://generativelanguage.googleapis.com", "https://www.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", "https://pagead2.googlesyndication.com"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5500',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Rate limiting
app.use('/api/', rateLimit);

// Static files (for production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend')));
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/optimize', optimizeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/keys', apiKeysRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// Serve frontend for all other routes (SPA support)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  });
}

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: 'The requested resource was not found on this server'
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', err);
  process.exit(1);
});

// Uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
