// playwright-video.config.js
// 带录屏功能的测试配置

const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'test-results/html-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5174',
    trace: 'on',
    screenshot: 'on',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        executablePath: 'D:\\your-mcp-proxy\\AITY_VIP\\chrome-win64\\chrome.exe',
        viewport: { width: 1280, height: 800 },
        recordVideo: {
          dir: 'test-results/videos/',
          size: { width: 1280, height: 800 }
        }
      },
    },
  ],
  outputDir: 'test-results/artifacts',
});
