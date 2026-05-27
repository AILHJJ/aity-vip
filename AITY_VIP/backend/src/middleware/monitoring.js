const logger = require('../utils/logger');

const metrics = {
  requests: {
    total: 0,
    success: 0,
    error: 0,
    byRoute: {}
  },
  responseTime: {
    total: 0,
    count: 0,
    byRoute: {}
  },
  errors: {
    total: 0,
    byType: {}
  },
  database: {
    queries: 0,
    slowQueries: 0
  }
};

function trackRequest(req, res, next) {
  const startTime = Date.now();
  const route = req.route ? req.route.path : req.path;

  metrics.requests.total++;
  metrics.requests.byRoute[route] = (metrics.requests.byRoute[route] || 0) + 1;

  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    
    metrics.responseTime.total += responseTime;
    metrics.responseTime.count++;
    metrics.responseTime.byRoute[route] = metrics.responseTime.byRoute[route] || {
      total: 0,
      count: 0
    };
    metrics.responseTime.byRoute[route].total += responseTime;
    metrics.responseTime.byRoute[route].count++;

    if (res.statusCode >= 200 && res.statusCode < 300) {
      metrics.requests.success++;
    } else {
      metrics.requests.error++;
    }

    if (responseTime > 1000) {
      logger.warn('Slow request detected', {
        route: route,
        method: req.method,
        responseTime: `${responseTime}ms`,
        statusCode: res.statusCode
      });
    }
  });

  next();
}

function trackError(err, req, res, next) {
  metrics.errors.total++;
  const errorType = err.name || 'UnknownError';
  metrics.errors.byType[errorType] = (metrics.errors.byType[errorType] || 0) + 1;

  logger.error('Error tracked', {
    errorType,
    errorMessage: err.message,
    route: req.route ? req.route.path : req.path,
    method: req.method
  });

  next(err);
}

function getMetrics() {
  const avgResponseTime = metrics.responseTime.count > 0 
    ? metrics.responseTime.total / metrics.responseTime.count 
    : 0;

  const successRate = metrics.requests.total > 0 
    ? (metrics.requests.success / metrics.requests.total) * 100 
    : 0;

  return {
    requests: {
      ...metrics.requests,
      successRate: `${successRate.toFixed(2)}%`
    },
    responseTime: {
      average: `${avgResponseTime.toFixed(2)}ms`,
      ...metrics.responseTime
    },
    errors: metrics.errors,
    database: metrics.database,
    uptime: process.uptime()
  };
}

function resetMetrics() {
  metrics.requests.total = 0;
  metrics.requests.success = 0;
  metrics.requests.error = 0;
  metrics.requests.byRoute = {};
  metrics.responseTime.total = 0;
  metrics.responseTime.count = 0;
  metrics.responseTime.byRoute = {};
  metrics.errors.total = 0;
  metrics.errors.byType = {};
  metrics.database.queries = 0;
  metrics.database.slowQueries = 0;
}

module.exports = {
  trackRequest,
  trackError,
  getMetrics,
  resetMetrics
};
