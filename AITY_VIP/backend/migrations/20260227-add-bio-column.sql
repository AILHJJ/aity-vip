-- ============================================
-- 数据库迁移脚本: 添加 bio 字段
-- 日期: 2026-02-27
-- 版本: v1.8.0
-- 说明: 用户简介功能需要 bio 字段
-- ============================================

-- 添加 bio 字段到 users 表
-- 如果字段已存在会报错，可以忽略
ALTER TABLE users ADD COLUMN bio TEXT DEFAULT NULL COMMENT '用户简介';

-- 验证字段是否添加成功
-- SELECT COLUMN_NAME, DATA_TYPE, COLUMN_COMMENT
-- FROM INFORMATION_SCHEMA.COLUMNS
-- WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'bio';
