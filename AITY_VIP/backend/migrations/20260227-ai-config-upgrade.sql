-- ============================================================================
-- Migration: 20260227-ai-config-upgrade.sql
-- Description: 升级 ai_config 表结构，添加厂商和模型描述字段
-- Date: 2025-02-27
-- ============================================================================

-- 添加厂商相关字段
ALTER TABLE ai_config ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT '' COMMENT '厂商代码，如 zhipu, volcengine, aliyun';
ALTER TABLE ai_config ADD COLUMN IF NOT EXISTS provider_name VARCHAR(100) DEFAULT '' COMMENT '厂商名称，如 智谱AI, 火山引擎, 阿里云';

-- 添加模型描述字段
ALTER TABLE ai_config ADD COLUMN IF NOT EXISTS description VARCHAR(500) DEFAULT '' COMMENT '模型简介';
ALTER TABLE ai_config ADD COLUMN IF NOT EXISTS features VARCHAR(500) DEFAULT '' COMMENT '模型特点，用|分隔';

-- 添加状态字段
ALTER TABLE ai_config ADD COLUMN IF NOT EXISTS status ENUM('available', 'insufficient_balance', 'error', 'unknown') DEFAULT 'unknown' COMMENT '可用状态';

-- 添加排序字段
ALTER TABLE ai_config ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0 COMMENT '排序顺序';

-- 添加索引
ALTER TABLE ai_config ADD INDEX IF NOT EXISTS idx_provider (provider);
ALTER TABLE ai_config ADD INDEX IF NOT EXISTS idx_status (status);

-- ============================================================================
-- 完成
-- ============================================================================
