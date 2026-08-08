const Redis = require('ioredis');
require('dotenv').config();

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3
});

redis.on('connect', () => {
  console.log('Redis connected successfully');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redis.on('close', () => {
  console.log('Redis connection closed');
});

async function get(key) {
  try {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

async function set(key, value, ttl = 3600) {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttl);
    return true;
  } catch (error) {
    console.error('Redis set error:', error);
    return false;
  }
}

async function del(key) {
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error('Redis del error:', error);
    return false;
  }
}

async function delPattern(pattern) {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }
    return true;
  } catch (error) {
    console.error('Redis delPattern error:', error);
    return false;
  }
}

module.exports = {
  redis,
  get,
  set,
  del,
  delPattern
};
