@echo off
chcp 65001 >nul
echo AITY VIP Skills 安装脚本
echo ==============================
echo.

rem 配置 npm 镜像
echo 配置 npm 镜像...
npm config set registry https://registry.npmmirror.com
echo.

rem 安装 Skills
echo 开始安装 Skills...
echo.

rem 产品经理必备
echo 1. 安装 PRD 编写...
npx skills add refoundai/lenny-skills@writing-prds -g -y
echo.

echo 2. 安装 内容策略...
npx skills add coreyhaines31/marketingskills@content-strategy -g -y
echo.

rem 研发自动化
echo 3. 安装 头脑风暴...
npx skills add obra/superpowers@brainstorming -g -y
echo.

echo 4. 安装 编写计划...
npx skills add obra/superpowers@writing-plans -g -y
echo.

echo 5. 安装 执行计划...
npx skills add obra/superpowers@executing-plans -g -y
echo.

echo 6. 安装 系统化调试...
npx skills add obra/superpowers@systematic-debugging -g -y
echo.

echo 7. 安装 测试驱动开发...
npx skills add obra/superpowers@test-driven-development -g -y
echo.

rem 前端开发
echo 8. 安装 React 最佳实践...
npx skills add vercel-labs/agent-skills@react-best-practices -g -y
echo.

echo 9. 安装 组合模式...
npx skills add vercel-labs/agent-skills@composition-patterns -g -y
echo.

rem 文档处理
echo 10. 安装 MarkItDown...
npx skills add microsoft/markitdown-skill -g -y
echo.

rem 数据分析
echo 11. 安装 数据分析...
npx skills add jupyter/data-analysis-skill -g -y
echo.

rem 浏览器自动化
echo 12. 安装 浏览器自动化...
npx skills add vercel-labs/agent-skills@dev-browser -g -y
echo.

rem 研究工具
echo 13. 安装 深度研究...
npx skills add obra/superpowers@research -g -y
echo.

echo 安装完成！
echo ==============================
echo 查看已安装的 Skills: npx skills ls -g
echo 搜索 Skills: npx skills find ^<关键词^>
echo.
pause
