const path = require('path');

// Base configuration
const baseConfig = {
  // Server configuration
  server: {
    port: process.env.PORT || 3001,
    host: process.env.HOST || 'localhost',
    env: process.env.NODE_ENV || 'development',
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true
    }
  },

  // Database configuration
  database: {
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/rwab',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    }
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },

  // Rate limiting configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    authWindowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 900000,
    authMaxRequests: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 5
  },

  // File upload configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,application/pdf').split(','),
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    tempPath: process.env.TEMP_PATH || './temp'
  },

  // IPFS configuration
  ipfs: {
    apiUrl: process.env.IPFS_API_URL || 'http://localhost:5001',
    gatewayUrl: process.env.IPFS_GATEWAY_URL || 'https://ipfs.io/ipfs/',
    timeout: parseInt(process.env.IPFS_TIMEOUT) || 30000
  },

  // Email configuration
  email: {
    apiKey: process.env.EMAIL_API_KEY,
    fromEmail: process.env.FROM_EMAIL || 'noreply@rwab.com',
    templatesPath: process.env.EMAIL_TEMPLATES_PATH || './templates/email'
  },

  // SMS configuration
  sms: {
    apiKey: process.env.SMS_API_KEY,
    fromNumber: process.env.FROM_NUMBER || '+1234567890'
  },

  // Redis configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB) || 0
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
    logPath: process.env.LOG_PATH || './logs',
    maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5,
    maxSize: process.env.LOG_MAX_SIZE || '10m'
  },

  // Security configuration
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    sessionSecret: process.env.SESSION_SECRET || 'session-secret',
    encryptionKey: process.env.ENCRYPTION_KEY,
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
    lockoutDuration: parseInt(process.env.LOCKOUT_DURATION) || 7200000 // 2 hours
  },

  // External APIs
  external: {
    etherscan: {
      apiKey: process.env.ETHERSCAN_API_KEY,
      baseUrl: process.env.ETHERSCAN_BASE_URL || 'https://api.etherscan.io/api'
    },
    infura: {
      projectId: process.env.INFURA_PROJECT_ID,
      baseUrl: process.env.INFURA_BASE_URL || 'https://mainnet.infura.io/v3'
    },
    coinGecko: {
      baseUrl: process.env.COINGECKO_BASE_URL || 'https://api.coingecko.com/api/v3'
    }
  },

  // Feature flags
  features: {
    enableRegistration: process.env.ENABLE_REGISTRATION !== 'false',
    enableEmailVerification: process.env.ENABLE_EMAIL_VERIFICATION !== 'false',
    enableTwoFactor: process.env.ENABLE_TWO_FACTOR !== 'false',
    enableMaintenanceMode: process.env.ENABLE_MAINTENANCE_MODE === 'true',
    enableAnalytics: process.env.ENABLE_ANALYTICS !== 'false'
  }
};

// Development configuration
const developmentConfig = {
  ...baseConfig,
  server: {
    ...baseConfig.server,
    env: 'development'
  },
  logging: {
    ...baseConfig.logging,
    level: 'debug'
  },
  database: {
    ...baseConfig.database,
    url: 'mongodb://localhost:27017/RWAB_dev'
  }
};

// Production configuration
const productionConfig = {
  ...baseConfig,
  server: {
    ...baseConfig.server,
    env: 'production'
  },
  logging: {
    ...baseConfig.logging,
    level: 'warn'
  },
  security: {
    ...baseConfig.security,
    bcryptRounds: 14
  }
};

// Test configuration
const testConfig = {
  ...baseConfig,
  server: {
    ...baseConfig.server,
    env: 'test',
    port: 3002
  },
  database: {
    ...baseConfig.database,
    url: 'mongodb://localhost:27017/RWAB_test'
  },
  jwt: {
    ...baseConfig.jwt,
    expiresIn: '1h'
  }
};

// Get configuration based on environment
function getConfig() {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return productionConfig;
    case 'test':
      return testConfig;
    case 'development':
    default:
      return developmentConfig;
  }
}

// Validate configuration
function validateConfig(config) {
  const errors = [];
  
  // Validate required environment variables
  if (!config.jwt.secret || config.jwt.secret === 'fallback-secret') {
    errors.push('JWT_SECRET must be set in production');
  }
  
  if (config.server.env === 'production' && !config.email.apiKey) {
    errors.push('EMAIL_API_KEY must be set in production');
  }
  
  if (config.server.env === 'production' && !config.security.encryptionKey) {
    errors.push('ENCRYPTION_KEY must be set in production');
  }
  
  // Validate database URL
  if (!config.database.url || config.database.url.includes('localhost')) {
    if (config.server.env === 'production') {
      errors.push('DATABASE_URL must be set to a production database in production');
    }
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
  
  return true;
}

// Export configuration
const config = getConfig();

// Validate configuration
try {
  validateConfig(config);
} catch (error) {
  console.warn('Configuration validation warning:', error.message);
}



module.exports = {
  config,
  getConfig,
  validateConfig,
  baseConfig,
  developmentConfig,
  productionConfig,
  testConfig,
  locationToken
};
