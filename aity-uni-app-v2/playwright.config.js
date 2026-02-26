/**
 * Playwright配置文件 - 简化版
 * 用于AITY VIP项目的E2E测试
 */

const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '../tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,

  reporter: [
    ['list'],
    ['html', { outputFolder: '../tests/e2e/reports/html', open: 'never' }]
  ],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'smoke',
      testMatch: /.*smoke.*\.spec\.js/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // 本地开发时自动启动服务器
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev:h5',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
