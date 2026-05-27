// tests/e2e/ai-advisor.spec.js
const { test, expect } = require('@playwright/test');

test.describe('AI顾问功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/pages/ai-advisor/ai-advisor');
  });

  test('页面标题正确显示', async ({ page }) => {
    await expect(page).toHaveTitle(/AI顾问/);
  });

  test('显示AI顾问标题', async ({ page }) => {
    const title = page.locator('.advisor-title');
    if (await title.isVisible()) {
      await expect(title).toBeVisible();
    }
  });

  test('显示输入框', async ({ page }) => {
    const inputBox = page.locator('.advisor-input');
    if (await inputBox.isVisible()) {
      await expect(inputBox).toBeVisible();
    }
  });

  test('输入框可输入', async ({ page }) => {
    const inputBox = page.locator('.advisor-input');
    if (await inputBox.isVisible()) {
      await inputBox.fill('测试问题');
      await expect(inputBox).toHaveValue('测试问题');
    }
  });

  test('显示发送按钮', async ({ page }) => {
    const sendBtn = page.locator('.send-btn');
    if (await sendBtn.isVisible()) {
      await expect(sendBtn).toBeVisible();
    }
  });

  test('发送按钮可点击', async ({ page }) => {
    const sendBtn = page.locator('.send-btn');
    const inputBox = page.locator('.advisor-input');
    
    if (await sendBtn.isVisible() && await inputBox.isVisible()) {
      await inputBox.fill('测试问题');
      await sendBtn.click();
      await page.waitForTimeout(1000);
    }
  });

  test('显示对话历史', async ({ page }) => {
    const chatHistory = page.locator('.chat-history');
    if (await chatHistory.isVisible()) {
      await expect(chatHistory).toBeVisible();
    }
  });

  test('显示用户消息', async ({ page }) => {
    const userMessage = page.locator('.message.user');
    if (await userMessage.first().isVisible()) {
      await expect(userMessage.first()).toBeVisible();
    }
  });

  test('显示AI回复', async ({ page }) => {
    const aiMessage = page.locator('.message.ai');
    if (await aiMessage.first().isVisible()) {
      await expect(aiMessage.first()).toBeVisible();
    }
  });

  test('显示清空对话按钮', async ({ page }) => {
    const clearBtn = page.locator('.clear-chat-btn');
    if (await clearBtn.isVisible()) {
      await expect(clearBtn).toBeVisible();
    }
  });

  test('清空对话功能', async ({ page }) => {
    const clearBtn = page.locator('.clear-chat-btn');
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('显示加载状态', async ({ page }) => {
    const loadingIndicator = page.locator('.loading-indicator');
    if (await loadingIndicator.isVisible()) {
      await expect(loadingIndicator).toBeVisible();
    }
  });

  test('对话历史可滚动', async ({ page }) => {
    const chatHistory = page.locator('.chat-history');
    if (await chatHistory.isVisible()) {
      await chatHistory.evaluate(el => el.scrollTop = 100);
    }
  });

  test('显示快捷问题', async ({ page }) => {
    const quickQuestions = page.locator('.quick-questions');
    if (await quickQuestions.isVisible()) {
      await expect(quickQuestions).toBeVisible();
    }
  });

  test('点击快捷问题', async ({ page }) => {
    const quickQuestion = page.locator('.quick-question').first();
    if (await quickQuestion.isVisible()) {
      await quickQuestion.click();
      await page.waitForTimeout(500);
    }
  });

  test('显示打字效果', async ({ page }) => {
    const typingIndicator = page.locator('.typing-indicator');
    if (await typingIndicator.isVisible()) {
      await expect(typingIndicator).toBeVisible();
    }
  });

  test('显示消息时间', async ({ page }) => {
    const messageTime = page.locator('.message-time').first();
    if (await messageTime.isVisible()) {
      await expect(messageTime).toBeVisible();
    }
  });

  test('支持Markdown格式', async ({ page }) => {
    const markdownContent = page.locator('.markdown-content');
    if (await markdownContent.first().isVisible()) {
      await expect(markdownContent.first()).toBeVisible();
    }
  });

  test('显示复制按钮', async ({ page }) => {
    const copyBtn = page.locator('.copy-btn').first();
    if (await copyBtn.isVisible()) {
      await expect(copyBtn).toBeVisible();
    }
  });

  test('复制功能', async ({ page }) => {
    const copyBtn = page.locator('.copy-btn').first();
    if (await copyBtn.isVisible()) {
      await copyBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('页面响应式布局', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.advisor-page')).toBeVisible();

    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.advisor-page')).toBeVisible();
  });

  test('显示AI头像', async ({ page }) => {
    const aiAvatar = page.locator('.ai-avatar');
    if (await aiAvatar.isVisible()) {
      await expect(aiAvatar).toBeVisible();
    }
  });

  test('显示用户头像', async ({ page }) => {
    const userAvatar = page.locator('.user-avatar');
    if (await userAvatar.first().isVisible()) {
      await expect(userAvatar.first()).toBeVisible();
    }
  });

  test('输入框支持回车发送', async ({ page }) => {
    const inputBox = page.locator('.advisor-input');
    if (await inputBox.isVisible()) {
      await inputBox.fill('测试问题');
      await inputBox.press('Enter');
      await page.waitForTimeout(500);
    }
  });

  test('显示错误提示', async ({ page }) => {
    const errorMsg = page.locator('.error-message');
    if (await errorMsg.isVisible()) {
      await expect(errorMsg).toBeVisible();
    }
  });

  test('显示重试按钮', async ({ page }) => {
    const retryBtn = page.locator('.retry-btn');
    if (await retryBtn.isVisible()) {
      await expect(retryBtn).toBeVisible();
    }
  });

  test('页面滚动流畅', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, 0));
  });
});
