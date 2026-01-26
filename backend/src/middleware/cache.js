const cache = require('../config/redis');

function generateCacheKey(prefix, params) {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join(':');
  return `${prefix}:${sortedParams}`;
}

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
