-- VIP持仓追踪功能 - 数据库迁移脚本
-- 日期：2026-05-04
-- 用法：mysql -u 投研图灵室 -pfl10b312 -h 124.221.119.134 "投研图灵室_test" < 20260504-add-position-tracking.sql

-- 1. discussions 表：message_id 改为可空（支持独立发帖，不关联消息）
ALTER TABLE discussions
  MODIFY COLUMN message_id INT NULL
  COMMENT '关联消息ID，NULL表示自主发帖（持仓帖）';

-- 2. discussion_replies 表：增加私密回复字段
ALTER TABLE discussion_replies
  ADD COLUMN is_private TINYINT(1) NOT NULL DEFAULT 0
  COMMENT '1=私密回复(仅管理员和发帖人可见), 0=公开(所有人可见)';
