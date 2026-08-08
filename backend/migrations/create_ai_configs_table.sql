-- 创建AI配置表
CREATE TABLE IF NOT EXISTS `ai_configs` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `model_name` VARCHAR(50) NOT NULL UNIQUE COMMENT 'AI模型名称，如 glm-4-flash',
  `display_name` VARCHAR(100) NULL COMMENT '显示名称',
  `api_key` VARCHAR(255) NOT NULL COMMENT 'API密钥',
  `base_url` VARCHAR(255) NOT NULL COMMENT 'API基础URL',
  `prompt_template` TEXT NULL COMMENT '提示词模板',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否激活',
  `default_version` ENUM('original', 'ai_optimized') NOT NULL DEFAULT 'ai_optimized' COMMENT '默认版本',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_model_name` (`model_name`),
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI配置表';

-- 插入默认配置（智谱AI示例）
INSERT INTO `ai_configs` (
  `model_name`,
  `display_name`,
  `api_key`,
  `base_url`,
  `prompt_template`,
  `is_active`,
  `default_version`
) VALUES (
  'glm-4-flash',
  '智谱AI GLM-4 Flash',
  'your-api-key-here',
  'https://open.bigmodel.cn/api/paas/v4',
  '请优化以下文案，使其更加专业和流畅：',
  TRUE,
  'ai_optimized'
) ON DUPLICATE KEY UPDATE
  `display_name` = VALUES(`display_name`);
