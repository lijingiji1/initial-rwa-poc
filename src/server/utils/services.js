const axios = require('axios');
const crypto = require('crypto');

// HTTP client with retry logic
class HTTPClient {
  constructor(baseURL = '', timeout = 10000) {
    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        'User-Agent': 'RWaB-Backend/1.0.0'
      }
    });

    // Add request interceptor
    this.client.interceptors.request.use(
      (config) => {
        config.metadata = { startTime: Date.now() };
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor
    this.client.interceptors.response.use(
      (response) => {
        const duration = Date.now() - response.config.metadata.startTime;
        console.log(`HTTP ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status} (${duration}ms)`);
        return response;
      },
      (error) => {
        const duration = Date.now() - (error.config?.metadata?.startTime || Date.now());
        console.error(`HTTP ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status || 'ERROR'} (${duration}ms)`);
        return Promise.reject(error);
      }
    );
  }

  // GET request with retry
  async get(url, config = {}, retries = 3) {
    return this.requestWithRetry('GET', url, null, config, retries);
  }

  // POST request with retry
  async post(url, data = null, config = {}, retries = 3) {
    return this.requestWithRetry('POST', url, data, config, retries);
  }

  // PUT request with retry
  async put(url, data = null, config = {}, retries = 3) {
    return this.requestWithRetry('PUT', url, data, config, retries);
  }

  // DELETE request with retry
  async delete(url, config = {}, retries = 3) {
    return this.requestWithRetry('DELETE', url, null, config, retries);
  }

  // Request with retry logic
  async requestWithRetry(method, url, data, config, retries) {
    let lastError;
    
    for (let i = 0; i <= retries; i++) {
      try {
        const response = await this.client.request({
          method,
          url,
          data,
          ...config
        });
        return response;
      } catch (error) {
        lastError = error;
        
        // Don't retry on client errors (4xx)
        if (error.response && error.response.status >= 400 && error.response.status < 500) {
          throw error;
        }
        
        // Don't retry on last attempt
        if (i === retries) {
          throw error;
        }
        
        // Wait before retry (exponential backoff)
        const delay = Math.pow(2, i) * 1000;
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }

  // Sleep utility
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Email service (mock implementation)
class EmailService {
  constructor() {
    this.apiKey = process.env.EMAIL_API_KEY;
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@rwab.com';
    this.templates = new Map();
    this.initializeTemplates();
  }

  // Initialize email templates
  initializeTemplates() {
    this.templates.set('welcome', {
      subject: 'Welcome to RWA-B!',
      html: `
        <h1>Welcome to RWA-B!</h1>
        <p>Thank you for joining our platform. You can now start tokenizing and trading real-world assets.</p>
        <p>Best regards,<br>The RWA-B Team</p>
      `
    });

    this.templates.set('verification', {
      subject: 'Verify Your Email Address',
      html: `
        <h1>Verify Your Email</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="{{verificationLink}}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `
    });

    this.templates.set('password-reset', {
      subject: 'Reset Your Password',
      html: `
        <h1>Password Reset</h1>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="{{resetLink}}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
      `
    });
  }

  // Send email
  async sendEmail(to, templateName, data = {}) {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    // Replace template variables
    let html = template.html;
    let subject = template.subject;
    
    for (const [key, value] of Object.entries(data)) {
      const placeholder = `{{${key}}}`;
      html = html.replace(new RegExp(placeholder, 'g'), value);
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
    }

    // Mock email sending
    console.log(`Sending email to ${to}:`);
    console.log(`Subject: ${subject}`);
    console.log(`HTML: ${html}`);

    return {
      success: true,
      messageId: crypto.randomUUID(),
      to,
      subject
    };
  }

  // Send bulk email
  async sendBulkEmail(recipients, templateName, data = {}) {
    const results = [];
    
    for (const recipient of recipients) {
      try {
        const result = await this.sendEmail(recipient, templateName, data);
        results.push({ recipient, success: true, result });
      } catch (error) {
        results.push({ recipient, success: false, error: error.message });
      }
    }
    
    return results;
  }

  // Add custom template
  addTemplate(name, template) {
    this.templates.set(name, template);
  }
}

// SMS service (mock implementation)
class SMSService {
  constructor() {
    this.apiKey = process.env.SMS_API_KEY;
    this.fromNumber = process.env.FROM_NUMBER || '+1234567890';
  }

  // Send SMS
  async sendSMS(to, message) {
    // Mock SMS sending
    console.log(`Sending SMS to ${to}: ${message}`);
    
    return {
      success: true,
      messageId: crypto.randomUUID(),
      to,
      message
    };
  }

  // Send verification code
  async sendVerificationCode(to, code) {
    const message = `Your RWA-B verification code is: ${code}. This code will expire in 10 minutes.`;
    return this.sendSMS(to, message);
  }
}

// Push notification service
class PushNotificationService {
  constructor() {
    this.subscriptions = new Map();
  }

  // Subscribe user to notifications
  subscribe(userId, subscription) {
    if (!this.subscriptions.has(userId)) {
      this.subscriptions.set(userId, []);
    }
    this.subscriptions.get(userId).push(subscription);
  }

  // Unsubscribe user
  unsubscribe(userId, subscriptionId) {
    const userSubscriptions = this.subscriptions.get(userId);
    if (userSubscriptions) {
      const index = userSubscriptions.findIndex(sub => sub.id === subscriptionId);
      if (index > -1) {
        userSubscriptions.splice(index, 1);
      }
    }
  }

  // Send push notification
  async sendNotification(userId, notification) {
    const userSubscriptions = this.subscriptions.get(userId);
    if (!userSubscriptions || userSubscriptions.length === 0) {
      return { success: false, error: 'No subscriptions found' };
    }

    const results = [];
    for (const subscription of userSubscriptions) {
      try {
        // Mock push notification sending
        console.log(`Sending push notification to ${userId}:`, notification);
        results.push({ subscriptionId: subscription.id, success: true });
      } catch (error) {
        results.push({ subscriptionId: subscription.id, success: false, error: error.message });
      }
    }

    return { success: true, results };
  }

  // Send to all users
  async broadcastNotification(notification) {
    const results = [];
    for (const [userId] of this.subscriptions) {
      const result = await this.sendNotification(userId, notification);
      results.push({ userId, ...result });
    }
    return results;
  }
}

// File storage service
class FileStorageService {
  constructor() {
    this.storage = new Map();
    this.baseUrl = process.env.FILE_STORAGE_URL || 'http://localhost:3001/files';
  }

  // Upload file
  async uploadFile(file, path = '') {
    const fileId = crypto.randomUUID();
    const fileName = `${path}/${fileId}_${file.originalname}`;
    
    // Mock file storage
    this.storage.set(fileId, {
      id: fileId,
      fileName,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: `${this.baseUrl}/${fileName}`,
      uploadedAt: new Date()
    });

    return {
      success: true,
      fileId,
      fileName,
      url: `${this.baseUrl}/${fileName}`,
      size: file.size
    };
  }

  // Get file info
  getFileInfo(fileId) {
    return this.storage.get(fileId);
  }

  // Delete file
  deleteFile(fileId) {
    return this.storage.delete(fileId);
  }

  // List files
  listFiles(path = '') {
    const files = Array.from(this.storage.values());
    if (path) {
      return files.filter(file => file.fileName.startsWith(path));
    }
    return files;
  }
}

// Cache service
class CacheService {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map();
  }

  // Set cache with TTL
  set(key, value, ttlSeconds = 3600) {
    this.cache.set(key, value);
    this.ttl.set(key, Date.now() + (ttlSeconds * 1000));
  }

  // Get from cache
  get(key) {
    if (!this.cache.has(key)) return null;
    
    if (this.ttl.has(key) && this.ttl.get(key) < Date.now()) {
      this.delete(key);
      return null;
    }
    
    return this.cache.get(key);
  }

  // Delete from cache
  delete(key) {
    this.cache.delete(key);
    this.ttl.delete(key);
  }

  // Clear all cache
  clear() {
    this.cache.clear();
    this.ttl.clear();
  }

  // Get cache stats
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

module.exports = {
  HTTPClient,
  EmailService,
  SMSService,
  PushNotificationService,
  FileStorageService,
  CacheService
};
