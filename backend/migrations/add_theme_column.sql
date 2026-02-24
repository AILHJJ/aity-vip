-- 添加 theme 字段到 messages 表
-- 执行此SQL以支持Markdown主题功能

-- MySQL 语法
ALTER TABLE messages ADD COLUMN theme VARCHAR(50) NOT NULL DEFAULT 'default' COMMENT 'Markdown主题样式：default, github, emerald, ocean, warm, dark';

-- 如果字段已存在，使用以下命令修改（可选）
-- ALTER TABLE messages MODIFY COLUMN theme VARCHAR(50) NOT NULL DEFAULT 'default' COMMENT 'Markdown主题样式';
