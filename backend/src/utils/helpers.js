import crypto from 'crypto';
import urlParse from 'url-parse';

// Generate unique ID
export const generateId = (length = 16) => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate JWT token payload
export const generateTokenPayload = (user) => {
  return {
    id: user.id || user.uid,
    email: user.email,
    timestamp: Date.now(),
  };
};

// Extract domain from URL
export const extractDomain = (url) => {
  try {
    const parsed = urlParse(url);
    return parsed.hostname;
  } catch {
    throw new Error('Invalid URL format');
  }
};

// Validate URL format
export const isValidUrl = (url) => {
  try {
    const parsed = urlParse(url);
    return parsed.protocol && parsed.hostname && (parsed.protocol === 'http:' || parsed.protocol === 'https:');
  } catch {
    return false;
  }
};

// Clean and normalize keyword
export const normalizeKeyword = (keyword) => {
  return keyword
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
    .replace(/\s+/g, ' '); // Replace multiple spaces with single space
};

// Calculate keyword difficulty score (mock implementation)
export const calculateKeywordDifficulty = (searchVolume, competition) => {
  // Simple algorithm - in real implementation, this would use more sophisticated metrics
  const volumeScore = Math.min(searchVolume / 10000, 1) * 40; // Max 40 points for volume
  const competitionScore = competition * 60; // Max 60 points for competition
  return Math.round(volumeScore + competitionScore);
};

// Format number with commas
export const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Calculate percentage
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// Delay function for rate limiting
export const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Chunk array into smaller arrays
export const chunkArray = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

// Remove duplicates from array
export const removeDuplicates = (array, key = null) => {
  if (key) {
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  }
  return [...new Set(array)];
};

// Sanitize string for database storage
export const sanitizeString = (str) => {
  return str
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .substring(0, 1000); // Limit length
};

// Generate cache key
export const generateCacheKey = (prefix, ...parts) => {
  return `${prefix}:${parts.join(':')}`;
};

// Parse user agent for analytics
export const parseUserAgent = (userAgent) => {
  const isBot = /bot|crawler|spider|crawling/i.test(userAgent);
  const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
  const browser = userAgent.match(/(chrome|firefox|safari|edge|opera)/i)?.[1] || 'unknown';
  
  return {
    isBot,
    isMobile,
    browser: browser.toLowerCase(),
    raw: userAgent
  };
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Generate random string
export const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Convert string to slug
export const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

// Get file extension from URL
export const getFileExtension = (url) => {
  try {
    const parsed = urlParse(url);
    const pathname = parsed.pathname;
    return pathname.split('.').pop().toLowerCase();
  } catch {
    return '';
  }
}; 