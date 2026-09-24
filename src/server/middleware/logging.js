const fs = require('fs');
const path = require('path');

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  // Log request details
  const logData = {
    timestamp,
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    userId: req.user?.userId || 'anonymous'
  };

  // Log to console
  console.log(`[${timestamp}] ${req.method} ${req.url} - ${req.ip}`);

  // Log to file
  const logEntry = `${timestamp} - ${req.method} ${req.url} - ${req.ip} - ${req.get('User-Agent')}\n`;
  fs.appendFileSync(path.join(__dirname, '../../logs/access.log'), logEntry);

  // Track response time
  res.on('finish', () => {
    const duration = Date.now() - start;
    const responseLog = `${timestamp} - ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms\n`;
    fs.appendFileSync(path.join(__dirname, '../../logs/response.log'), responseLog);
  });

  next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  const errorLog = {
    timestamp,
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userId: req.user?.userId || 'anonymous'
  };

  // Log to console
  console.error(`[${timestamp}] ERROR: ${err.message}`);

  // Log to file
  const logEntry = `${timestamp} - ERROR - ${err.message} - ${req.method} ${req.url} - ${req.ip}\n${err.stack}\n---\n`;
  fs.appendFileSync(path.join(__dirname, '../../logs/error.log'), logEntry);

  next(err);
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Strict Transport Security (HTTPS only)
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';");
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

// Request ID middleware
const requestId = (req, res, next) => {
  req.id = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.id);
  next();
};

// Response time middleware
const responseTime = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    res.setHeader('X-Response-Time', `${duration}ms`);
  });
  
  next();
};

// Maintenance mode middleware
const maintenanceMode = (req, res, next) => {
  if (process.env.MAINTENANCE_MODE === 'true') {
    return res.status(503).json({
      error: 'Service temporarily unavailable',
      message: 'The service is currently under maintenance. Please try again later.',
      retryAfter: 3600 // 1 hour
    });
  }
  next();
};

module.exports = {
  requestLogger,
  errorLogger,
  securityHeaders,
  requestId,
  responseTime,
  maintenanceMode
};
