/**
 * 密码修改功能测试 - V3 (使用Dev Browser AI快照)
 * 最可靠的方案：使用AI快照引用定位元素
 */

const BASE_URL = 'http://localhost:5173';
const TEST_ACCOUNT = 'admin';
const OLD_PASSWORD = '123456';
const NEW_PASSWORD = '654321';
const SCREENSHOT_DIR = 'C:/Users/DELL/.claude/skills/dev-browser/tmp';
const VIDEO_DIR = 'C:/Users/DELL/.claude/skills/dev-browser/tmp/videos';

const results: { name: string; passed: boolean; error: string | null }[] = [];

function recordTest(name: string, passed: boolean, error: string | null = null) {
  results.push({ name, passed, error });
  console.log(`${passed ? '✅' : '❌'} ${name}${error ? ` - ${error}` : ''}`);
}

async function main() {
  console.log('========================================');
  console.log('密码修改功能测试 V3 (AI快照版)');
  console.log('========================================\n');

  // 动态导入dev-browser-client
  const { DevBrowserClient } = await import('dev-browser-client');

  const client = new DevBrowserClient({
    baseUrl: 'http://localhost:3000',
    chromePath: 'D:/your-mcp-proxy/AITY_VIP/chrome-win64/chrome.exe'
  });

  try {
    // 连接浏览器
    console.log('连接浏览器...');
    await client.connect();
    console.log('浏览器已连接\n');

    // ============ 测试1: 登录 ============
    console.log('--- 测试1: 登录 ---');

    await client.navigate(BASE_URL);
    await client.waitForStable();

    // 获取AI快照
    let snapshot = await client.getAISnapshot();
    console.log('页面快照已获取');

    // 查找输入框和登录按钮
    const usernameRef = snapshot.elements.find((e: any) =>
      e.attributes?.placeholder?.includes('账号') ||
      e.attributes?.placeholder?.includes('用户名') ||
      e.attributes?.placeholder?.includes('手机')
    );

    const passwordRef = snapshot.elements.find((e: any) =>
      e.attributes?.type === 'password' ||
      e.attributes?.placeholder?.includes('密码')
    );

    const loginBtnRef = snapshot.elements.find((e: any) =>
      e.text?.includes('登录') || e.text?.includes('Login')
    );

    if (usernameRef && passwordRef && loginBtnRef) {
      // 填写表单
      await client.selectSnapshotRef('page', usernameRef.id);
      await client.page.keyboard.type(TEST_ACCOUNT);
      await client.waitForTimeout(300);

      await client.selectSnapshotRef('page', passwordRef.id);
      await client.page.keyboard.type(OLD_PASSWORD);
      await client.waitForTimeout(300);

      await client.screenshot(path.join(SCREENSHOT_DIR, 'v3-01-filled.png'));

      // 点击登录
      await client.selectSnapshotRef('page', loginBtnRef.id);
      await client.waitForTimeout(2000);
      await client.waitForStable();

      await client.screenshot(path.join(SCREENSHOT_DIR, 'v3-02-after-login.png'));
    }

    // 验证登录
    snapshot = await client.getAISnapshot();
    const hasLogout = snapshot.elements.some((e: any) =>
      e.text?.includes('退出') || e.text?.includes('登出')
    );
    recordTest('用户登录', hasLogout, hasLogout ? null : '未找到退出按钮');

    if (!hasLogout) {
      throw new Error('登录失败');
    }

    // ============ 测试2: 进入个人中心 ============
    console.log('\n--- 测试2: 进入个人中心 ---');

    // 查找"我的"标签
    snapshot = await client.getAISnapshot();
    const myTabRef = snapshot.elements.find((e: any) =>
      e.text?.includes('我的') || e.text?.includes('个人')
    );

    if (myTabRef) {
      await client.selectSnapshotRef('page', myTabRef.id);
      await client.waitForStable();
    }

    await client.screenshot(path.join(SCREENSHOT_DIR, 'v3-03-profile.png'));

    snapshot = await client.getAISnapshot();
    const hasPasswordMenu = snapshot.elements.some((e: any) =>
      e.text?.includes('修改密码') || e.text?.includes('更改密码')
    );
    recordTest('进入个人中心', hasPasswordMenu);

    // ============ 测试3: 打开密码修改 ============
    console.log('\n--- 测试3: 打开密码修改 ---');

    const passwordMenuRef = snapshot.elements.find((e: any) =>
      e.text?.includes('修改密码') || e.text?.includes('更改密码')
    );

    if (passwordMenuRef) {
      await client.selectSnapshotRef('page', passwordMenuRef.id);
      await client.waitForStable();
    }

    await client.screenshot(path.join(SCREENSHOT_DIR, 'v3-04-password-form.png'));

    snapshot = await client.getAISnapshot();
    const hasPasswordInput = snapshot.elements.some((e: any) =>
      e.attributes?.type === 'password'
    );
    recordTest('打开密码修改', hasPasswordInput);

    // ============ 测试4: 填写密码表单 ============
    console.log('\n--- 测试4: 填写密码表单 ---');

    const passwordInputs = snapshot.elements.filter((e: any) =>
      e.attributes?.type === 'password'
    );

    if (passwordInputs.length >= 2) {
      // 旧密码
      await client.selectSnapshotRef('page', passwordInputs[0].id);
      await client.page.keyboard.type(OLD_PASSWORD);
      await client.waitForTimeout(300);

      // 新密码
      await client.selectSnapshotRef('page', passwordInputs[1].id);
      await client.page.keyboard.type(NEW_PASSWORD);
      await client.waitForTimeout(300);

      // 确认密码
      if (passwordInputs.length >= 3) {
        await client.selectSnapshotRef('page', passwordInputs[2].id);
        await client.page.keyboard.type(NEW_PASSWORD);
      }
    }

    await client.screenshot(path.join(SCREENSHOT_DIR, 'v3-05-password-filled.png'));
    recordTest('填写密码表单', passwordInputs.length >= 2);

    // ============ 测试5: 提交密码修改 ============
    console.log('\n--- 测试5: 提交密码修改 ---');

    snapshot = await client.getAISnapshot();
    const submitBtnRef = snapshot.elements.find((e: any) =>
      e.text?.includes('确定') || e.text?.includes('提交') || e.text?.includes('保存')
    );

    if (submitBtnRef) {
      await client.selectSnapshotRef('page', submitBtnRef.id);
      await client.waitForTimeout(2000);

      // 处理可能的确认弹窗
      snapshot = await client.getAISnapshot();
      const confirmBtnRef = snapshot.elements.find((e: any) =>
        e.text?.includes('确定') && e.attributes?.class?.includes('modal')
      );

      if (confirmBtnRef) {
        await client.selectSnapshotRef('page', confirmBtnRef.id);
        await client.waitForTimeout(1000);
      }
    }

    await client.screenshot(path.join(SCREENSHOT_DIR, 'v3-06-password-submitted.png'));
    recordTest('提交密码修改', true);

    // ============ 测试6: 退出登录 ============
    console.log('\n--- 测试6: 退出登录 ---');

    // 返回个人中心
    snapshot = await client.getAISnapshot();
    const myTab2Ref = snapshot.elements.find((e: any) => e.text?.includes('我的'));
    if (myTab2Ref) {
      await client.selectSnapshotRef('page', myTab2Ref.id);
      await client.waitForStable();
    }

    // 点击退出
    snapshot = await client.getAISnapshot();
    const logoutBtnRef = snapshot.elements.find((e: any) =>
      e.text?.includes('退出') || e.text?.includes('登出')
    );

    if (logoutBtnRef) {
      await client.selectSnapshotRef('page', logoutBtnRef.id);
      await client.waitForTimeout(500);

      // 确认退出
      snapshot = await client.getAISnapshot();
      const confirmLogoutRef = snapshot.elements.find((e: any) =>
        e.text?.includes('确定') || e.text?.includes('确认')
      );

      if (confirmLogoutRef) {
        await client.selectSnapshotRef('page', confirmLogoutRef.id);
        await client.waitForTimeout(1000);
      }
    }

    await client.waitForStable();
    await client.screenshot(path.join(SCREENSHOT_DIR, 'v3-07-logged-out.png'));

    snapshot = await client.getAISnapshot();
    const hasLoginBtn = snapshot.elements.some((e: any) =>
      e.text?.includes('登录') && !e.text?.includes('退出')
    );
    recordTest('退出登录', hasLoginBtn);

    // ============ 测试7: 新密码登录 ============
    console.log('\n--- 测试7: 新密码登录 ---');

    await client.navigate(BASE_URL);
    await client.waitForStable();

    snapshot = await client.getAISnapshot();
    const usernameRef2 = snapshot.elements.find((e: any) =>
      e.attributes?.placeholder?.includes('账号') ||
      e.attributes?.placeholder?.includes('用户名')
    );
    const passwordRef2 = snapshot.elements.find((e: any) =>
      e.attributes?.type === 'password'
    );
    const loginBtnRef2 = snapshot.elements.find((e: any) => e.text?.includes('登录'));

    if (usernameRef2 && passwordRef2 && loginBtnRef2) {
      await client.selectSnapshotRef('page', usernameRef2.id);
      await client.page.keyboard.type(TEST_ACCOUNT);
      await client.selectSnapshotRef('page', passwordRef2.id);
      await client.page.keyboard.type(NEW_PASSWORD);
      await client.selectSnapshotRef('page', loginBtnRef2.id);
      await client.waitForTimeout(2000);
    }

    await client.screenshot(path.join(SCREENSHOT_DIR, 'v3-08-new-login.png'));

    snapshot = await client.getAISnapshot();
    const newLoginSuccess = snapshot.elements.some((e: any) =>
      e.text?.includes('退出') || e.text?.includes('登出')
    );
    recordTest('新密码登录', newLoginSuccess);

    // ============ 测试8: 恢复原密码 ============
    console.log('\n--- 测试8: 恢复原密码 ---');

    if (newLoginSuccess) {
      // 进入个人中心
      snapshot = await client.getAISnapshot();
      const myTab3Ref = snapshot.elements.find((e: any) => e.text?.includes('我的'));
      if (myTab3Ref) {
        await client.selectSnapshotRef('page', myTab3Ref.id);
        await client.waitForStable();
      }

      // 打开密码修改
      snapshot = await client.getAISnapshot();
      const pwdMenu2Ref = snapshot.elements.find((e: any) => e.text?.includes('修改密码'));
      if (pwdMenu2Ref) {
        await client.selectSnapshotRef('page', pwdMenu2Ref.id);
        await client.waitForStable();
      }

      // 填写恢复表单
      snapshot = await client.getAISnapshot();
      const pwdInputs2 = snapshot.elements.filter((e: any) => e.attributes?.type === 'password');

      if (pwdInputs2.length >= 2) {
        await client.selectSnapshotRef('page', pwdInputs2[0].id);
        await client.page.keyboard.type(NEW_PASSWORD);
        await client.selectSnapshotRef('page', pwdInputs2[1].id);
        await client.page.keyboard.type(OLD_PASSWORD);
        if (pwdInputs2.length >= 3) {
          await client.selectSnapshotRef('page', pwdInputs2[2].id);
          await client.page.keyboard.type(OLD_PASSWORD);
        }
      }

      // 提交
      snapshot = await client.getAISnapshot();
      const submit2Ref = snapshot.elements.find((e: any) =>
        e.text?.includes('确定') || e.text?.includes('提交')
      );
      if (submit2Ref) {
        await client.selectSnapshotRef('page', submit2Ref.id);
        await client.waitForTimeout(2000);
      }

      await client.screenshot(path.join(SCREENSHOT_DIR, 'v3-09-restored.png'));
      recordTest('恢复原密码', true);
    } else {
      recordTest('恢复原密码', false, '新密码登录失败');
    }

  } catch (error) {
    console.error('测试错误:', error);
    await client.screenshot(path.join(SCREENSHOT_DIR, 'v3-error.png'));
  } finally {
    await client.disconnect();

    // 保存报告
    const report = {
      timestamp: new Date().toISOString(),
      version: 'v3-ai-snapshot',
      summary: {
        total: results.length,
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length
      },
      tests: results
    };

    fs.writeFileSync(
      path.join(SCREENSHOT_DIR, 'password-test-v3-report.json'),
      JSON.stringify(report, null, 2)
    );

    console.log('\n========================================');
    console.log('测试完成!');
    console.log(`总计: ${report.summary.total}`);
    console.log(`通过: ${report.summary.passed}`);
    console.log(`失败: ${report.summary.failed}`);
    console.log('========================================');
  }
}

// 需要导入fs和path
import * as fs from 'fs';
import * as path from 'path';

main();
