-- ============================================================================
-- Migration: 20260227-insert-ai-models-v2.sql
-- Description: 插入所有可用的 AI 模型配置（完整版）
-- Date: 2025-02-27
-- Note: 通过 API 查询各厂商实际可用模型后整理
-- ============================================================================

-- 使用说明：
-- 1. 选择数据库：USE 投研图灵室; 或 USE 投研图灵室_test;
-- 2. 执行本脚本
-- ============================================================================

-- ============================================================================
-- 智谱 AI 模型 (API Key: 52757e59510747dca81bb32c60bfb445.l0eRqzr0XcRYKaFl)
-- Base URL: https://open.bigmodel.cn/api/paas/v4
-- ============================================================================

-- 1. GLM-4-Flash（推荐，性价比最高）
INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`)
VALUES ('glm-4-flash', '智谱GLM-4-Flash（推荐）', '52757e59510747dca81bb32c60bfb445.l0eRqzr0XcRYKaFl', 'https://open.bigmodel.cn/api/paas/v4',
'你是一位专业的投资分析师和财经编辑。请优化以下投资研究内容，使其：
1. 结构清晰：使用标题、段落、列表等格式组织内容
2. 重点突出：关键数据和观点用粗体标注
3. 语言精练：去除冗余，保留核心信息
4. 专业准确：保持金融术语的准确性
5. 易于理解：添加必要的解释说明

原文内容：
{content}

请直接输出优化后的内容，使用 Markdown 格式。',
TRUE, 'ai_optimized') ON DUPLICATE KEY UPDATE `api_key` = VALUES(`api_key`), `is_active` = TRUE;

-- 2. GLM-4.5
INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`)
VALUES ('glm-4.5', '智谱GLM-4.5', '52757e59510747dca81bb32c60bfb445.l0eRqzr0XcRYKaFl', 'https://open.bigmodel.cn/api/paas/v4',
'请优化以下投资研究内容，使其更加专业和易读。原文：{content}', FALSE, 'ai_optimized')
ON DUPLICATE KEY UPDATE `api_key` = VALUES(`api_key`);

-- 3. GLM-4.7
INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`)
VALUES ('glm-4.7', '智谱GLM-4.7', '52757e59510747dca81bb32c60bfb445.l0eRqzr0XcRYKaFl', 'https://open.bigmodel.cn/api/paas/v4',
'请优化以下投资研究内容，使其更加专业和易读。原文：{content}', FALSE, 'ai_optimized')
ON DUPLICATE KEY UPDATE `api_key` = VALUES(`api_key`);

-- 4. GLM-5（最新旗舰）
INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`)
VALUES ('glm-5', '智谱GLM-5（旗舰版）', '52757e59510747dca81bb32c60bfb445.l0eRqzr0XcRYKaFl', 'https://open.bigmodel.cn/api/paas/v4',
'请以最专业的投资分析师视角优化以下内容：{content}', FALSE, 'ai_optimized')
ON DUPLICATE KEY UPDATE `api_key` = VALUES(`api_key`);

-- ============================================================================
-- 火山引擎模型 (API Key: d2d9a61f-6c5a-4f48-a7e7-364c430b0219)
-- Base URL: https://ark.cn-beijing.volces.com/api/v3
-- ============================================================================

-- 5. DeepSeek-V3（推荐，分析能力强）
INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`)
VALUES ('deepseek-v3-250324', '火山引擎-DeepSeek-V3（推荐）', 'd2d9a61f-6c5a-4f48-a7e7-364c430b0219', 'https://ark.cn-beijing.volces.com/api/v3',
'你是一位专业的投资分析师。请用逻辑严密的方式优化以下内容，梳理核心观点、强化论证逻辑、数据支撑分析。原文：{content}', FALSE, 'ai_optimized')
ON DUPLICATE KEY UPDATE `api_key` = VALUES(`api_key`);

-- 6. DeepSeek-R1（推理增强版）
INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`)
VALUES ('deepseek-r1-250528', '火山引擎-DeepSeek-R1推理版', 'd2d9a61f-6c5a-4f48-a7e7-364c430b0219', 'https://ark.cn-beijing.volces.com/api/v3',
'请深度分析并优化以下投资内容，确保逻辑链条完整、推理严密。原文：{content}', FALSE, 'ai_optimized')
ON DUPLICATE KEY UPDATE `api_key` = VALUES(`api_key`);

-- 7. 豆包 1.5 Pro
INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`)
VALUES ('doubao-1-5-pro-32k-250115', '火山引擎-豆包1.5Pro', 'd2d9a61f-6c5a-4f48-a7e7-364c430b0219', 'https://ark.cn-beijing.volces.com/api/v3',
'请用通俗易懂的方式优化以下投资内容，让普通投资者也能轻松理解。原文：{content}', FALSE, 'ai_optimized')
ON DUPLICATE KEY UPDATE `api_key` = VALUES(`api_key`);

-- 8. 豆包 1.5 Lite（快速版）
INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`)
VALUES ('doubao-1-5-lite-32k-250115', '火山引擎-豆包1.5Lite快速版', 'd2d9a61f-6c5a-4f48-a7e7-364c430b0219', 'https://ark.cn-beijing.volces.com/api/v3',
'请快速优化以下内容，保持简洁有力。原文：{content}', FALSE, 'ai_optimized')
ON DUPLICATE KEY UPDATE `api_key` = VALUES(`api_key`);

-- ============================================================================
-- 阿里云通义千问 (API Key: sk-9bb1a10d39fc422bb488fab313d3ba23)
-- Base URL: https://dashscope.aliyuncs.com/compatible-mode/v1
-- 注意：此 API Key 可访问几乎所有国内主流模型！
-- ============================================================================

-- 9. Qwen3-Max（阿里云旗舰）
INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`)
VALUES ('qwen3-max', '阿里云-Qwen3-Max（旗舰）', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请以最专业的投资分析师视角优化以下内容：{content}', FALSE, 'ai_optimized')
ON DUPLICATE KEY UPDATE `api_key` = VALUES(`api_key`);

-- 10. Qwen3.5-Plus
INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`)
VALUES ('qwen3.5-plus', '阿里云-Qwen3.5-Plus', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请优化以下投资研究内容，使其专业且易读。原文：{content}', FALSE, 'ai_optimized')
ON DUPLICATE KEY UPDATE `api_key` = VALUES(`api_key`);

-- 11. Qwen3.5-Flash（快速版）
INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`)
VALUES ('qwen3.5-flash', '阿里云-Qwen3.5-Flash快速版', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请快速优化以下内容，保持简洁。原文：{content}', FALSE, 'ai_optimized')
ON DUPLICATE KEY UPDATE `api_key` = VALUES(`api_key`);

-- 12. Qwen-Plus（稳定版）
INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`)
VALUES ('qwen-plus', '阿里云-Qwen-Plus稳定版', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请优化以下内容，使其表达更加有力、重点突出。原文：{content}', FALSE, 'ai_optimized')
ON DUPLICATE KEY UPDATE `api_key` = VALUES(`api_key`);

-- 13. Qwen-Turbo（极速版）
INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`)
VALUES ('qwen-turbo', '阿里云-Qwen-Turbo极速版', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请快速优化：{content}', FALSE, 'ai_optimized')
ON DUPLICATE KEY UPDATE `api_key` = VALUES(`api_key`);

-- 14. DeepSeek-V3（阿里云托管）
INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`)
VALUES ('deepseek-v3', '阿里云-DeepSeek-V3', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请深度分析并优化以下投资内容。原文：{content}', FALSE, 'ai_optimized')
ON DUPLICATE KEY UPDATE `api_key` = VALUES(`api_key`);

-- 15. DeepSeek-R1（阿里云托管）
INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`)
VALUES ('deepseek-r1', '阿里云-DeepSeek-R1推理版', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请深度推理并优化以下内容。原文：{content}', FALSE, 'ai_optimized')
ON DUPLICATE KEY UPDATE `api_key` = VALUES(`api_key`);

-- 16. Kimi-K2.5（Moonshot）
INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`)
VALUES ('kimi-k2.5', '阿里云-Kimi-K2.5', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请优化以下投资研究内容。原文：{content}', FALSE, 'ai_optimized')
ON DUPLICATE KEY UPDATE `api_key` = VALUES(`api_key`);

-- 17. MiniMax-M2.5
INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`)
VALUES ('MiniMax-M2.5', '阿里云-MiniMax-M2.5', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请优化以下投资研究内容。原文：{content}', FALSE, 'ai_optimized')
ON DUPLICATE KEY UPDATE `api_key` = VALUES(`api_key`);

-- 18. GLM-4.7（阿里云托管）
INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`)
VALUES ('glm-4.7', '阿里云-GLM-4.7', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请优化以下投资研究内容。原文：{content}', FALSE, 'ai_optimized')
ON DUPLICATE KEY UPDATE `api_key` = VALUES(`api_key`);

-- ============================================================================
-- 验证插入结果
-- ============================================================================
SELECT id, model_name, display_name, is_active FROM ai_config ORDER BY id;

-- ============================================================================
-- Migration Complete - 共插入 18 个 AI 模型配置
-- 推荐使用：
-- 1. glm-4-flash（智谱，性价比高，已设为默认）
-- 2. deepseek-v3-250324（火山引擎，分析能力强）
-- 3. qwen3-max（阿里云旗舰，功能最强）
-- ============================================================================
