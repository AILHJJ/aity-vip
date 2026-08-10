-- 修复 discussion_replies 线上表结构缺失字段
-- 日期: 2026-08-10
-- 背景:
--   线上 GET /api/discussions 返回 500。
--   PM2 日志显示 Sequelize 查询 discussion_replies 时缺少 images 字段。
--   实际生产表同时缺少 images 和 updated_at，而模型 DiscussionReply 已依赖这两个字段。
--
-- 线上执行前已创建备份表:
--   discussion_replies_backup_20260810025310

ALTER TABLE `discussion_replies`
  ADD COLUMN `images` JSON NULL COMMENT '图片列表 [{url, filename}]' AFTER `content`;

ALTER TABLE `discussion_replies`
  ADD COLUMN `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`;

-- 验证:
-- SHOW COLUMNS FROM `discussion_replies`;
