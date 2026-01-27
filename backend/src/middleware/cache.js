// 内存缓存实现，替代Redis
const memoryCache = new Map();

function generateCacheKey(prefix, params) {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join(':');
  return `${prefix}:${sortedParams}`;
}

// 内存缓存操作
const cache = {
  get: async (key) => {
    const item = memoryCache.get(key);
    if (!item) return null;
    
    // 检查是否过期
    if (item.expiry < Date.now()) {
      memoryCache.delete(key);
      return null;
    }
    
    return item.value;
  },
  
  set: async (key, value, ttl = 3600) => {
    memoryCache.set(key, {
      value,
      expiry: Date.now() + (ttl * 1000)
    });
    return true;
  },
  
  del: async (key) => {
    memoryCache.delete(key);
    return true;
  },
  
  delPattern: async (pattern) => {
    // 简单实现，实际项目中可能需要更复杂的模式匹配
    for (const key of memoryCache.keys()) {
      if (key.startsWith(pattern)) {
        memoryCache.delete(key);
      }
    }
    return true;
  }
};

function cacheMiddleware(prefix, ttl = 300) {
  return async (req, res, next) => {
    try {
      const cacheKey = generateCacheKey(prefix, {
        ...req.params,
        ...req.query,
        userId: req.user?.userId
      });

      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        return res.json({
          code: 200,
          message: 'Success',
          data: cachedData,
          cached: true
        });
      }

      const originalJson = res.json.bind(res);
      
      res.json = function(data) {
        if (data.code === 200 && data.data) {
          cache.set(cacheKey, data.data, ttl).catch(err => {
            console.error('Cache set error:', err);
          });
        }
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
}

function clearCache(pattern) {
  return async (req, res, next) => {
    try {
      await cache.delPattern(pattern);
      console.log(`Cache cleared for pattern: ${pattern}`);
    } catch (error) {
      console.error('Cache clear error:', error);
    }
    next();
  };
}

module.exports = {
  cacheMiddleware,
  clearCache
};
