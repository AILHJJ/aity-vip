const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    code: 200,
    message: 'API Version Information',
    data: {
      current_version: 'v1',
      supported_versions: ['v1'],
      deprecated_versions: [],
      documentation: '/api-docs'
    }
  });
});

module.exports = router;
