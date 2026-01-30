const http = require('http');

const PORT = 8080;

const testHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>登录测试页面</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .login-box {
            background: white;
            border-radius: 10px;
            padding: 40px;
            width: 100%;
            max-width: 400px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }
        .logo-section { text-align: center; margin-bottom: 40px; }
        .app-title { font-size: 28px; font-weight: bold; color: #333; margin-bottom: 10px; }
        .app-subtitle { font-size: 14px; color: #999; }
        .form-group { margin-bottom: 20px; }
        .form-label { display: block; font-size: 14px; color: #666; margin-bottom: 8px; }
        .form-input {
            width: 100%;
            height: 45px;
            padding: 0 15px;
            font-size: 14px;
            color: #333;
            background: #f5f5f5;
            border: 1px solid #e0e0e0;
            border-radius: 5px;
            outline: none;
        }
        .form-input:focus { background: white; border-color: #667eea; }
        .remember-group { margin-bottom: 25px; display: flex; align-items: center; }
        .remember-group input[type="checkbox"] { margin-right: 8px; }
        .login-btn {
            width: 100%;
            height: 45px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-size: 16px;
            font-weight: bold;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        .login-btn:hover { opacity: 0.9; }
        .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .footer-text { text-align: center; margin-top: 25px; font-size: 12px; color: #999; }
        .message {
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 5px;
            font-size: 14px;
            display: none;
        }
        .message.success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .message.error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .message.show { display: block; }
        .api-info {
            margin-top: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 5px;
            font-size: 12px;
            color: #666;
        }
        .api-info h4 { margin-bottom: 10px; color: #333; }
        .api-info pre {
            background: white;
            padding: 10px;
            border-radius: 3px;
            overflow-x: auto;
            margin-top: 5px;
            font-size: 11px;
        }
        .status-indicator {
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-right: 5px;
        }
        .status-indicator.online { background: #28a745; }
        .status-indicator.offline { background: #dc3545; }
    </style>
</head>
<body>
    <div class="login-box">
        <div class="logo-section">
            <div class="app-title">VIP投研分享系统</div>
            <div class="app-subtitle">内部投研信息分享平台 - 浏览器测试页面</div>
        </div>
        <div id="message" class="message"></div>
        <form id="loginForm">
            <div class="form-group">
                <label class="form-label">用户名/邮箱</label>
                <input type="text" class="form-input" id="account" placeholder="请输入用户名或邮箱" value="admin">
            </div>
            <div class="form-group">
                <label class="form-label">密码</label>
                <input type="password" class="form-input" id="password" placeholder="请输入密码" value="123456">
            </div>
            <div class="remember-group">
                <input type="checkbox" id="rememberMe">
                <label for="rememberMe">记住我</label>
            </div>
            <button type="submit" class="login-btn" id="loginBtn">登录</button>
        </form>
        <div class="footer-text">请使用管理员分配的账号登录</div>
        <div class="api-info">
            <h4>测试信息：</h4>
            <div>
                <span class="status-indicator" id="statusIndicator"></span>
                后端状态: <span id="backendStatus">检查中...</span>
            </div>
            <div>API 地址: <code>http://localhost:3001/api/auth/login</code></div>
            <div>默认账号: <strong>admin</strong> / <strong>123456</strong></div>
            <div id="responseInfo"></div>
        </div>
    </div>
    <script>
        const API_BASE_URL = 'http://localhost:3001/api';
        function showMessage(text, type) {
            const messageEl = document.getElementById('message');
            messageEl.textContent = text;
            messageEl.className = 'message ' + type + ' show';
            setTimeout(() => messageEl.classList.remove('show'), 5000);
        }
        function showResponse(data) {
            document.getElementById('responseInfo').innerHTML = '<h4 style="margin-top: 10px;">API 响应：</h4><pre>' + JSON.stringify(data, null, 2) + '</pre>';
        }
        function updateBackendStatus(online) {
            const indicator = document.getElementById('statusIndicator');
            const status = document.getElementById('backendStatus');
            if (online) {
                indicator.className = 'status-indicator online';
                status.textContent = '在线';
                status.style.color = '#28a745';
            } else {
                indicator.className = 'status-indicator offline';
                status.textContent = '离线';
                status.style.color = '#dc3545';
            }
        }
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const account = document.getElementById('account').value.trim();
            const password = document.getElementById('password').value.trim();
            const rememberMe = document.getElementById('rememberMe').checked;
            const loginBtn = document.getElementById('loginBtn');
            if (!account) { showMessage('请输入用户名或邮箱', 'error'); return; }
            if (!password) { showMessage('请输入密码', 'error'); return; }
            const isEmail = account.includes('@');
            const loginData = { password: password, rememberMe: rememberMe };
            loginData[isEmail ? 'email' : 'username'] = account;
            loginBtn.disabled = true;
            loginBtn.textContent = '登录中...';
            try {
                const response = await fetch(API_BASE_URL + '/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(loginData)
                });
                const result = await response.json();
                showResponse(result);
                if (response.ok && result.success) {
                    showMessage('登录成功！Token 已保存', 'success');
                    if (result.token) {
                        localStorage.setItem('token', result.token);
                        localStorage.setItem('userInfo', JSON.stringify(result.user));
                    }
                } else {
                    showMessage(result.message || '登录失败', 'error');
                }
            } catch (error) {
                showMessage('网络请求失败: ' + error.message, 'error');
                showResponse({ error: error.message });
            } finally {
                loginBtn.disabled = false;
                loginBtn.textContent = '登录';
            }
        });
        window.addEventListener('load', async () => {
            try {
                const response = await fetch('http://localhost:3001/api/health');
                await response.json();
                updateBackendStatus(true);
            } catch (error) {
                updateBackendStatus(false);
                showMessage('警告: 无法连接到后端服务器', 'error');
            }
        });
    </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
    console.log(new Date().toISOString() + ' - ' + req.method + ' ' + req.url);
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(testHTML);
    } else {
        res.writeHead(404);
        res.end('404 Not Found');
    }
});

server.listen(PORT, () => {
    console.log('========================================');
    console.log('测试服务器已启动！');
    console.log('========================================');
    console.log('访问地址: http://localhost:' + PORT);
    console.log('后端 API: http://localhost:3001');
    console.log('========================================');
    console.log('默认测试账号: admin / admin123');
    console.log('========================================');
});
