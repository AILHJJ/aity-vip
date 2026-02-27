-- ============================================================================
-- Migration: 20260227-insert-ai-models.sql
-- Description: 插入可用的 AI 模型配置
-- Date: 2025-02-27
-- ============================================================================

-- 使用说明：
-- 1. 选择数据库：USE 投研图灵室; 或 USE 投研图灵室_test;
-- 2. 执行本脚本
-- ============================================================================

-- 先清空现有配置（可选，如果需要重置）
-- TRUNCATE TABLE ai_config;

-- ============================================================================
-- 插入所有可用的 AI 模型配置
-- ============================================================================

-- 1. 智谱 GLM-4-Flash（推荐，性价比高）
INSERT INTO `ai_config` (
  `model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`
) VALUES (
  'glm-4-flash',
  '智谱GLM-4-Flash（推荐）',
  '52757e59510747dca81bb32c60bfb445.l0eRqzr0XcRYKaFl',
  'https://open.bigmodel.cn/api/paas/v4',
  '你是一位专业的投资分析师和财经编辑。请优化以下投资研究内容，使其：
1. 结构清晰：使用标题、段落、列表等格式组织内容
2. 重点突出：关键数据和观点用粗体标注
3. 语言精练：去除冗余，保留核心信息
4. 专业准确：保持金融术语的准确性
5. 易于理解：添加必要的解释说明

原文内容：
{content}

请直接输出优化后的内容，使用 Markdown 格式。',
  TRUE,
  'ai_optimized'
) ON DUPLICATE KEY UPDATE `api_key` = VALUES(`api_key`), `is_active` = TRUE;

-- 2. 智谱 GLM-4（专业版）
INSERT INTO `ai_config` (
  `model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`
) VALUES (
  'glm-4',
  '智谱GLM-4',
  '52757e59510747dca81bb32c60bfb445.l0eRqzr0XcRYKaFl',
  'https://open.bigmodel.cn/api/paas/v4',
  '你是一位资深的投资分析师。请以专业、严谨的风格优化以下内容：
- 保持专业术语准确性
- 强化逻辑结构
- 突出关键数据
- 确保信息完整性

原文：
{content}

请输出优化后的内容：',
  FALSE,
  'ai_optimized'
) ON DUPLICATE KEY UPDATE `api_key` = VALUES(`api_key`);

-- 3. 火山引擎 DeepSeek-V3（分析型）
INSERT INTO `ai_config` (
  `model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`
) VALUES (
  'deepseek-v3',
  '火山引擎-DeepSeek-V3',
  'd2d9a61f-6c5a-4f48-a7e7-364c430b0219',
  'https://ark.cn-beijing.volces.com/api/v3',
  '你是一位专业的投资分析师。请用逻辑严密的方式优化以下内容：

1. 梳理核心观点
2. 强化论证逻辑
3. 数据支撑分析
4. 结论清晰明确

原文内容：
{content}

请输出优化后的专业分析：',
  FALSE,
  'ai_optimized'
) ON DUPLICATE KEY UPDATE `api_key` = VALUES(`api_key`);

-- 4. 火山引擎 GLM-4.7（策略型）
INSERT INTO `ai_config` (
  `model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`
) VALUES (
  'glm-4-7',
  '火山引擎-GLM-4.7',
  'd2d9a61f-6c5a-4f48-a7e7-364c430b0219',
  'https://ark.cn-beijing.volces.com/api/v3',
  '请优化以下投资研究内容，使其精准有力：

- 突出核心观点
- 精简冗余表达
- 强化关键数据
- 提升可读性

原文：
{content}

优化后内容：',
  FALSE,
  'ai_optimized'
) ON DUPLICATE KEY UPDATE `api_key` = VALUES(`api_key`);

-- 5. 火山引擎 豆包 1.5 Pro（通俗型）
INSERT INTO `ai_config` (
  `model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`
) VALUES (
  'doubao-1-5-pro',
  '火山引擎-豆包1.5Pro',
  'd2d9a61f-6c5a-4f48-a7e7-364c430b0219',
  'https://ark.cn-beijing.volces.com/api/v3',
  '请用通俗易懂的方式优化以下投资内容，让普通投资者也能轻松理解：

1. 简化专业术语，必要时加解释
2. 用生动的比喻说明复杂概念
3. 保持专业性但增强亲和力
4. 结构清晰，重点突出

原文内容：
{content}

请输出优化后的内容：',
  FALSE,
  'ai_optimized'
) ON DUPLICATE KEY UPDATE `api_key` = VALUES(`api_key`);

-- 6. 阿里云 Qwen-Plus（激进型）
INSERT INTO `ai_config` (
  `model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`
) VALUES (
  'qwen-plus',
  '阿里云-通义千问Plus',
  'sk-9bb1a10d39fc422bb488fab313d3ba23',
  'https://dashscope.aliyuncs.com/compatible-mode/v1',
  '请优化以下内容，使其表达更加有力：

- 观点鲜明，不含糊
- 重点突出，一目了然
- 语言有力，有冲击力
- 结构紧凑，逻辑清晰

原文：
{content}

优化后内容：',
  FALSE,
  'ai_optimized'
) ON DUPLICATE KEY UPDATE `api_key` = VALUES(`api_key`);

-- 7. 阿里云 Qwen3-14B（简洁型）
INSERT INTO `ai_config` (
  `model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`
) VALUES (
  'qwen3-14b',
  '阿里云-通义千问3-14B',
  'sk-9bb1a10d39fc422bb488fab313d3ba23',
  'https://dashscope.aliyuncs.com/compatible-mode/v1',
  '请简洁地优化以下内容：

1. 去除冗余，保留精华
2. 结构清晰，层次分明
3. 表达精准，不拖泥带水
4. 重点数据加粗标注

原文内容：
{content}

请输出优化后的简洁版本：',
  FALSE,
  'ai_optimized'
) ON DUPLICATE KEY UPDATE `api_key` = VALUES(`api_key`);

-- ============================================================================
-- 验证插入结果
-- ============================================================================
SELECT id, model_name, display_name, is_active FROM ai_config;

-- ============================================================================
-- Migration Complete
-- ============================================================================
