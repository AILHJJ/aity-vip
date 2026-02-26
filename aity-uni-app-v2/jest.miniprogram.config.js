module.exports = {
  testEnvironment: 'node',
  testMatch: ['../tests/miniprogram/**/*.test.js'],
  testTimeout: 60000,
  setupFilesAfterEnv: ['./jest.miniprogram.setup.js'],
  verbose: true,
  reporters: [
    'default',
    ['json', { outputFile: '../tests/miniprogram/reports/test-results.json' }]
  ]
};
