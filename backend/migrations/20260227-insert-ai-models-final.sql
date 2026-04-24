-- ============================================================================
-- Migration: 20260227-insert-ai-models-final.sql
-- Description: 插入已验证可用的 AI 模型配置
-- Date: 2025-02-27
-- Note: 所有模型已通过 API 连接测试，确认可用
-- ============================================================================

-- 使用说明：
-- 1. 选择数据库：USE 投研图灵室; 或 USE 投研图灵室_test;
-- 2. 执行本脚本
-- ============================================================================

-- 先清空现有配置
DELETE FROM ai_config;

-- ============================================================================
-- 智谱 AI (2个可用)
-- API Key: 52757e59510747dca81bb32c60bfb445.l0eRqzr0XcRYKaFl
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
TRUE, 'ai_optimized');

-- 2. GLM-4.7（推理增强版）
INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`)
VALUES ('glm-4.7', '智谱GLM-4.7推理版', '52757e59510747dca81bb32c60bfb445.l0eRqzr0XcRYKaFl', 'https://open.bigmodel.cn/api/paas/v4',
'请深度分析并优化以下投资研究内容，确保逻辑严密、论证充分。

原文：{content}

优化后内容：',
FALSE, 'ai_optimized');

-- ============================================================================
-- 火山引擎 (4个可用)
-- API Key: d2d9a61f-6c5a-4f48-a7e7-364c430b0219
-- Base URL: https://ark.cn-beijing.volces.com/api/v3
-- ============================================================================

-- 3. DeepSeek-V3（分析能力强，推荐）
INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`)
VALUES ('deepseek-v3-250324', '火山引擎-DeepSeek-V3（推荐）', 'd2d9a61f-6c5a-4f48-a7e7-364c430b0219', 'https://ark.cn-beijing.volces.com/api/v3',
'你是一位专业的投资分析师。请用逻辑严密的方式优化以下内容：
- 梳理核心观点
- 强化论证逻辑
- 数据支撑分析
- 结论清晰明确

原文：{content}

优化后内容：',
FALSE, 'ai_optimized');

-- 4. DeepSeek-R1（深度推理版）
INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`)
VALUES ('deepseek-r1-250528', '火山引擎-DeepSeek-R1深度推理', 'd2d9a61f-6c5a-4f48-a7e7-364c430b0219', 'https://ark.cn-beijing.volces.com/api/v3',
'请深度分析并优化以下投资内容，确保逻辑链条完整、推理严密。

原文：{content}

优化后内容：',
FALSE, 'ai_optimized');

-- 5. 豆包 1.5 Pro（通俗易懂）
INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`)
VALUES ('doubao-1-5-pro-32k-250115', '火山引擎-豆包1.5Pro', 'd2d9a61f-6c5a-4f48-a7e7-364c430b0219', 'https://ark.cn-beijing.volces.com/api/v3',
'请用通俗易懂的方式优化以下投资内容，让普通投资者也能轻松理解：
- 简化专业术语
- 用生动比喻说明复杂概念
- 保持专业性但增强亲和力

原文：{content}

优化后内容：',
FALSE, 'ai_optimized');

-- 6. 豆包 1.5 Lite（快速版）
INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`)
VALUES ('doubao-1-5-lite-32k-250115', '火山引擎-豆包1.5Lite快速版', 'd2d9a61f-6c5a-4f48-a7e7-364c430b0219', 'https://ark.cn-beijing.volces.com/api/v3',
'请快速优化以下内容，保持简洁有力。原文：{content}

优化后：',
FALSE, 'ai_optimized');

-- ============================================================================
-- 阿里云通义千问 (10个可用) - 推荐！一个 Key 访问多厂商模型
-- API Key: sk-9bb1a10d39fc422bb488fab313d3ba23
-- Base URL: https://dashscope.aliyuncs.com/compatible-mode/v1
-- ============================================================================

-- 7. Qwen3-Max（阿里云旗舰，推荐）
INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`)
VALUES ('qwen3-max', '阿里云-Qwen3-Max（旗舰推荐）', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请以最专业的投资分析师视角优化以下内容：
1. 结构清晰，层次分明
2. 重点突出，数据加粗
3. 语言精练，逻辑严密
4. 专业准确，易于理解

原文：{content}

优化后内容：',
FALSE, 'ai_optimized');

-- 8. Qwen3.5-Plus（高性能版）
INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`)
VALUES ('qwen3.5-plus', '阿里云-Qwen3.5-Plus', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请优化以下投资研究内容，使其专业且易读。原文：{content}',
FALSE, 'ai_optimized');

-- 9. Qwen3.5-Flash（快速版）
INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`)
VALUES ('qwen3.5-flash', '阿里云-Qwen3.5-Flash快速版', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请快速优化：{content}',
FALSE, 'ai_optimized');

-- 10. Qwen-Plus（稳定版）
INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`)
VALUES ('qwen-plus', '阿里云-Qwen-Plus稳定版', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请优化以下内容，使其表达更加有力、重点突出。原文：{content}',
FALSE, 'ai_optimized');

-- 11. Qwen-Turbo（极速版，性价比高）
INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`)
VALUES ('qwen-turbo', '阿里云-Qwen-Turbo极速版', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'快速优化：{content}',
FALSE, 'ai_optimized');

-- 12. DeepSeek-V3（阿里云托管）
INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`)
VALUES ('deepseek-v3', '阿里云-DeepSeek-V3', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请深度分析并优化以下投资内容。原文：{content}',
FALSE, 'ai_optimized');

-- 13. DeepSeek-R1（阿里云托管，推理版）
INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`)
VALUES ('deepseek-r1', '阿里云-DeepSeek-R1推理版', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请深度推理并优化以下内容。原文：{content}',
FALSE, 'ai_optimized');

-- 14. Kimi-K2.5（Moonshot）
INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`)
VALUES ('kimi-k2.5', '阿里云-Kimi-K2.5', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请优化以下投资研究内容。原文：{content}',
FALSE, 'ai_optimized');

-- 15. MiniMax-M2.5
INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`)
VALUES ('MiniMax-M2.5', '阿里云-MiniMax-M2.5', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请优化以下投资研究内容。原文：{content}',
FALSE, 'ai_optimized');

-- 16. GLM-4.7（阿里云托管）
INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`)
VALUES ('glm-4.7', '阿里云-GLM-4.7', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请优化以下投资研究内容。原文：{content}',
FALSE, 'ai_optimized');

-- ============================================================================
-- 验证插入结果
-- ============================================================================
SELECT id, model_name, display_name, is_active FROM ai_config ORDER BY id;

-- ============================================================================
-- Migration Complete
-- 共插入 16 个已验证可用的 AI 模型配置
--
-- 推荐使用：
-- 1. glm-4-flash（智谱，性价比高，默认启用）
-- 2. deepseek-v3-250324（火山引擎，分析能力强）
-- 3. qwen3-max（阿里云旗舰，功能最强）
-- 4. qwen-turbo（阿里云，速度快、成本低）
-- ============================================================================
