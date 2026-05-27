const express = require('express');
const router = express.Router();
const { getMetrics, resetMetrics } = require('../middleware/monitoring');

router.get('/', (req, res) => {
  res.json({
    code: 200,
    message: 'System metrics',
    data: getMetrics()
  });
});

router.post('/reset', (req, res) => {
  resetMetrics();
  res.json({
    code: 200,
    message: 'Metrics reset successfully'
  });
});

module.exports = router;
