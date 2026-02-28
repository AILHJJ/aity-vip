/**
 * Dev Browser 项目配置
 * 用于 AITY_VIP 项目的自动化测试
 */

export const config = {
  // 浏览器配置
  browser: {
    executablePath: 'D:/your-mcp-proxy/AITY_VIP/chrome-win64/chrome.exe',
    headless: false,
    slowMo: 100, // 操作延迟(ms)
    viewport: {
      width: 1920,
      height: 1080
    }
  },

  // 录屏配置 (必需)
  video: {
    enabled: true, // 必须启用录屏
    dir: 'D:/your-mcp-proxy/AITY_VIP/test-results/videos',
    size: {
      width: 1920,
      height: 1080
    },
    // 视频文件命名格式
    fileName: (testName: string) => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      return `${testName}-${timestamp}.webm`;
    }
  },

  // 截图配置
  screenshot: {
    dir: 'D:/your-mcp-proxy/AITY_VIP/test-results/screenshots',
    fullPage: true
  },

  // 测试环境
  environments: {
    development: {
      name: '开发环境',
      frontend: 'http://localhost:5174',
      backend: 'http://localhost:3001'
    },
    testing: {
      name: '测试环境',
      frontend: 'http://192.168.30.134:8081',
      backend: 'http://192.168.30.134:8081/api'
    },
    production: {
      name: '生产环境',
      frontend: 'https://aity88.online:8443',
      backend: 'https://aity88.online:8443/api'
    }
  },

  // 测试账号
  accounts: {
    admin: {
      username: 'admin',
      password: '123456',
      email: 'admin@example.com',
      role: '管理员'
    },
    vip: {
      username: '等风来',
      password: '112044',
      email: '625668823@qq.com',
      role: 'VIP用户'
    },
    testPhone: {
      phone: '18162327517',
      password: '12345678',
      role: '测试用户(手机)'
    },
    testEmail: {
      email: 'tdxhuangzhengni@tdx.com.cn',
      password: '12345678',
      role: '测试用户(邮箱)'
    }
  },

  // 测试验证码 (测试环境)
  captcha: {
    sms: '111111', // 短信验证码
    image: '111111' // 图形验证码
  },

  // 等待配置
  timeout: {
    navigation: 30000, // 页面导航超时
    element: 10000, // 元素等待超时
    action: 5000 // 操作超时
  },

  // 重试配置
  retry: {
    maxAttempts: 3,
    delay: 1000
  }
};

// 默认使用开发环境
export const defaultEnv = config.environments.development;

// 导出便捷方法
export function getTestUrl(path: string = ''): string {
  return `${defaultEnv.frontend}${path}`;
}

export function getApiUrl(path: string = ''): string {
  return `${defaultEnv.backend}${path}`;
}
