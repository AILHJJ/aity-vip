-- Allow dynamic message types managed by message_types.
-- Run on test database first, then production after verification.

ALTER TABLE messages
MODIFY COLUMN `type` VARCHAR(50) NOT NULL DEFAULT 'daily' COMMENT '消息类型';
