-- 讨论回复功能增强迁移
-- 日期: 2026-05-26
-- 功能: 回帖支持编辑/删除/图片

-- 1. 给 discussion_replies 表添加 images 字段（存储图片列表 JSON）
ALTER TABLE `discussion_replies`
  ADD COLUMN `images` JSON DEFAULT NULL COMMENT '图片列表 [{url, filename}]' AFTER `content`;

-- 2. 启用 updated_at 字段（之前设为 false）
ALTER TABLE `discussion_replies`
  MODIFY COLUMN `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 验证
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'discussion_replies'
AND COLUMN_NAME IN ('images', 'updated_at');
