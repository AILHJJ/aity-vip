-- Add discussion category without overloading reply status.
-- Run on test database first, then production after verification.

ALTER TABLE discussions
ADD COLUMN category VARCHAR(50) NOT NULL DEFAULT 'interaction' COMMENT '讨论分类: interaction=互动交流'
AFTER status;

UPDATE discussions
SET category = 'interaction'
WHERE category IS NULL OR category = '';
