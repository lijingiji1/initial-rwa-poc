const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'rwab-backend' },
  transports: [
    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: logFormat
    }),
    
    // Combined log file
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: logFormat
    }),
    
    // Access log file
    new winston.transports.File({
      filename: path.join(logsDir, 'access.log'),
      level: 'http',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: logFormat
    })
  ],
  
  // Handle exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      format: logFormat
    })
  ],
  
  // Handle rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      format: logFormat
    })
  ]
});

// Add console transport for non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Custom log levels
logger.addColors({
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
});

// Set log levels
winston.addColors({
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
});

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      userId: req.user?.userId || 'anonymous',
      requestId: req.id
    };
    
    logger.http('HTTP Request', logData);
  });
  
  next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  const errorData = {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userId: req.user?.userId || 'anonymous',
    requestId: req.id,
    userAgent: req.get('User-Agent')
  };
  
  logger.error('Request Error', errorData);
  next(err);
};

// Custom log methods
const loggers = {
  // API logs
  api: (message, meta = {}) => {
    logger.info(`[API] ${message}`, meta);
  },
  
  // Database logs
  database: (message, meta = {}) => {
    logger.info(`[DATABASE] ${message}`, meta);
  },
  
  // Authentication logs
  auth: (message, meta = {}) => {
    logger.info(`[AUTH] ${message}`, meta);
  },
  
  // Transaction logs
  transaction: (message, meta = {}) => {
    logger.info(`[TRANSACTION] ${message}`, meta);
  },
  
  // File upload logs
  upload: (message, meta = {}) => {
    logger.info(`[UPLOAD] ${message}`, meta);
  },
  
  // Security logs
  security: (message, meta = {}) => {
    logger.warn(`[SECURITY] ${message}`, meta);
  },
  
  // Performance logs
  performance: (message, meta = {}) => {
    logger.info(`[PERFORMANCE] ${message}`, meta);
  },
  
  // Business logic logs
  business: (message, meta = {}) => {
    logger.info(`[BUSINESS] ${message}`, meta);
  }
};

// Log rotation utility
const rotateLogs = () => {
  const logFiles = [
    'error.log',
    'combined.log',
    'access.log',
    'exceptions.log',
    'rejections.log'
  ];
  
  logFiles.forEach(filename => {
    const filePath = path.join(logsDir, filename);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const fileSizeInMB = stats.size / (1024 * 1024);
      
      if (fileSizeInMB > 5) { // Rotate if file is larger than 5MB
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const rotatedFilename = `${filename}.${timestamp}`;
        fs.renameSync(filePath, path.join(logsDir, rotatedFilename));
        logger.info(`Log file rotated: ${filename} -> ${rotatedFilename}`);
      }
    }
  });
};

// Schedule log rotation (daily)
setInterval(rotateLogs, 24 * 60 * 60 * 1000);

// Export logger and utilities
module.exports = {
  logger,
  requestLogger,
  errorLogger,
  loggers,
  rotateLogs
};
