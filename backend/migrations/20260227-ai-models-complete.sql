-- ============================================================================
-- Migration: 20260227-ai-models-complete.sql
-- Description: AI 模型配置完整版（含厂商分组、模型特点、可用状态）
-- Date: 2025-02-27
-- Note: 所有模型已通过 API 测试，包含可用和欠费状态
-- ============================================================================

-- 使用说明：
-- 1. 选择数据库：USE 投研图灵室; 或 USE 投研图灵室_test;
-- 2. 执行本脚本
-- ============================================================================

-- 清空现有配置
DELETE FROM ai_config;

-- ============================================================================
-- 厂商1：智谱 AI (Zhipu AI)
-- API Key: 52757e59510747dca81bb32c60bfb445.l0eRqzr0XcRYKaFl
-- Base URL: https://open.bigmodel.cn/api/paas/v4
-- 官网：https://open.bigmodel.cn
-- ============================================================================

INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`, `provider`, `provider_name`, `description`, `features`, `status`, `sort_order`) VALUES
('glm-4-flash', '智谱GLM-4-Flash', '52757e59510747dca81bb32c60bfb445.l0eRqzr0XcRYKaFl', 'https://open.bigmodel.cn/api/paas/v4',
'你是一位专业的投资分析师和财经编辑。请优化以下投资研究内容，使其：
1. 结构清晰：使用标题、段落、列表等格式组织内容
2. 重点突出：关键数据和观点用粗体标注
3. 语言精练：去除冗余，保留核心信息
4. 专业准确：保持金融术语的准确性
5. 易于理解：添加必要的解释说明

原文内容：
{content}

请直接输出优化后的内容，使用 Markdown 格式。',
TRUE, 'ai_optimized', 'zhipu', '智谱AI',
'智谱最新一代快速模型，性价比之王',
'快速响应|低成本|稳定可靠|中文优化', 'available', 1),

('glm-4.5', '智谱GLM-4.5', '52757e59510747dca81bb32c60bfb445.l0eRqzr0XcRYKaFl', 'https://open.bigmodel.cn/api/paas/v4',
'请优化以下投资研究内容，使其更加专业和易读。原文：{content}',
FALSE, 'ai_optimized', 'zhipu', '智谱AI',
'GLM-4的升级版，性能更强',
'性能提升|理解力强|多任务处理', 'insufficient_balance', 2),

('glm-4.7', '智谱GLM-4.7推理版', '52757e59510747dca81bb32c60bfb445.l0eRqzr0XcRYKaFl', 'https://open.bigmodel.cn/api/paas/v4',
'请深度分析并优化以下投资研究内容，确保逻辑严密、论证充分。原文：{content}

优化后内容：',
FALSE, 'ai_optimized', 'zhipu', '智谱AI',
'内置思维链的推理增强模型，逻辑性强',
'深度推理|逻辑严密|复杂任务', 'available', 3),

('glm-5', '智谱GLM-5旗舰版', '52757e59510747dca81bb32c60bfb445.l0eRqzr0XcRYKaFl', 'https://open.bigmodel.cn/api/paas/v4',
'请以最专业的投资分析师视角优化以下内容：{content}',
FALSE, 'ai_optimized', 'zhipu', '智谱AI',
'智谱最新旗舰模型，能力最强',
'最强性能|多模态|旗舰品质', 'insufficient_balance', 4);

-- ============================================================================
-- 厂商2：火山引擎 (Volcengine / 字节跳动)
-- API Key: d2d9a61f-6c5a-4f48-a7e7-364c430b0219
-- Base URL: https://ark.cn-beijing.volces.com/api/v3
-- 官网：https://www.volcengine.com
-- ============================================================================

INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`, `provider`, `provider_name`, `description`, `features`, `status`, `sort_order`) VALUES
('deepseek-v3-250324', 'DeepSeek-V3', 'd2d9a61f-6c5a-4f48-a7e7-364c430b0219', 'https://ark.cn-beijing.volces.com/api/v3',
'你是一位专业的投资分析师。请用逻辑严密的方式优化以下内容：
- 梳理核心观点
- 强化论证逻辑
- 数据支撑分析
- 结论清晰明确

原文：{content}

优化后内容：',
FALSE, 'ai_optimized', 'volcengine', '火山引擎',
'DeepSeek最新V3模型，分析能力极强',
'逻辑严密|分析深入|专业性强|开源模型', 'available', 10),

('deepseek-r1-250528', 'DeepSeek-R1深度推理', 'd2d9a61f-6c5a-4f48-a7e7-364c430b0219', 'https://ark.cn-beijing.volces.com/api/v3',
'请深度分析并优化以下投资内容，确保逻辑链条完整、推理严密。原文：{content}

优化后内容：',
FALSE, 'ai_optimized', 'volcengine', '火山引擎',
'DeepSeek推理增强版，带思维链输出',
'深度推理|思维链|复杂分析|数学能力强', 'available', 11),

('doubao-1-5-pro-32k-250115', '豆包1.5Pro', 'd2d9a61f-6c5a-4f48-a7e7-364c430b0219', 'https://ark.cn-beijing.volces.com/api/v3',
'请用通俗易懂的方式优化以下投资内容，让普通投资者也能轻松理解：
- 简化专业术语
- 用生动比喻说明复杂概念
- 保持专业性但增强亲和力

原文：{content}

优化后内容：',
FALSE, 'ai_optimized', 'volcengine', '火山引擎',
'字节跳动豆包1.5 Pro，32K上下文，通俗易懂',
'通俗易懂|亲和力强|长上下文|中文友好', 'available', 12),

('doubao-1-5-lite-32k-250115', '豆包1.5Lite快速版', 'd2d9a61f-6c5a-4f48-a7e7-364c430b0219', 'https://ark.cn-beijing.volces.com/api/v3',
'请快速优化以下内容，保持简洁有力。原文：{content}

优化后：',
FALSE, 'ai_optimized', 'volcengine', '火山引擎',
'豆包轻量版，速度更快成本更低',
'极速响应|低成本|简洁高效', 'available', 13);

-- ============================================================================
-- 厂商3：阿里云通义千问 (Alibaba Cloud / Qwen)
-- API Key: sk-9bb1a10d39fc422bb488fab313d3ba23
-- Base URL: https://dashscope.aliyuncs.com/compatible-mode/v1
-- 官网：https://dashscope.aliyun.com
-- 特点：一个 API Key 可访问多厂商模型！
-- ============================================================================

INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`, `provider`, `provider_name`, `description`, `features`, `status`, `sort_order`) VALUES
-- 通义千问系列
('qwen3-max', '通义千问3-Max', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请以最专业的投资分析师视角优化以下内容：
1. 结构清晰，层次分明
2. 重点突出，数据加粗
3. 语言精练，逻辑严密
4. 专业准确，易于理解

原文：{content}

优化后内容：',
FALSE, 'ai_optimized', 'aliyun', '阿里云',
'通义千问3旗舰版，阿里云最强模型',
'旗舰性能|多模态|长上下文|企业级', 'available', 20),

('qwen3.5-plus', '通义千问3.5-Plus', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请优化以下投资研究内容，使其专业且易读。原文：{content}',
FALSE, 'ai_optimized', 'aliyun', '阿里云',
'通义千问3.5增强版，性能与成本平衡',
'性能均衡|推理增强|性价比高', 'available', 21),

('qwen3.5-flash', '通义千问3.5-Flash', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请快速优化：{content}',
FALSE, 'ai_optimized', 'aliyun', '阿里云',
'通义千问3.5快速版，速度极快',
'极速响应|超低成本|适合批量', 'available', 22),

('qwen-plus', '通义千问-Plus', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请优化以下内容，使其表达更加有力、重点突出。原文：{content}',
FALSE, 'ai_optimized', 'aliyun', '阿里云',
'通义千问稳定版，久经考验',
'稳定可靠|成熟模型|广泛使用', 'available', 23),

('qwen-turbo', '通义千问-Turbo', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'快速优化：{content}',
FALSE, 'ai_optimized', 'aliyun', '阿里云',
'通义千问极速版，最快最便宜',
'极速|超低成本|海量处理', 'available', 24),

-- 阿里云托管的其他厂商模型
('deepseek-v3', 'DeepSeek-V3(阿里云)', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请深度分析并优化以下投资内容。原文：{content}',
FALSE, 'ai_optimized', 'aliyun', '阿里云',
'DeepSeek V3阿里云托管版，稳定可靠',
'阿里云托管|稳定可靠|DeepSeek品质', 'available', 30),

('deepseek-r1', 'DeepSeek-R1(阿里云)', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请深度推理并优化以下内容。原文：{content}',
FALSE, 'ai_optimized', 'aliyun', '阿里云',
'DeepSeek R1推理版阿里云托管',
'深度推理|阿里云托管|思维链', 'available', 31),

('kimi-k2.5', 'Kimi-K2.5', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请优化以下投资研究内容。原文：{content}',
FALSE, 'ai_optimized', 'aliyun', '阿里云',
'Moonshot Kimi K2.5，长文本处理专家',
'超长上下文|文档理解|Kimi品牌', 'available', 32),

('MiniMax-M2.5', 'MiniMax-M2.5', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请优化以下投资研究内容。原文：{content}',
FALSE, 'ai_optimized', 'aliyun', '阿里云',
'MiniMax最新模型，创意能力强',
'创意生成|多样化|MiniMax品牌', 'available', 33),

('glm-4.7', 'GLM-4.7(阿里云)', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请优化以下投资研究内容。原文：{content}',
FALSE, 'ai_optimized', 'aliyun', '阿里云',
'智谱GLM-4.7阿里云托管版',
'阿里云托管|GLM品质|推理增强', 'available', 34);

-- ============================================================================
-- 验证插入结果
-- ============================================================================
SELECT
    id,
    provider_name as '厂商',
    display_name as '模型名称',
    description as '简介',
    CASE status
        WHEN 'available' THEN '✅ 可用'
        WHEN 'insufficient_balance' THEN '⚠️ 欠费'
        ELSE status
    END as '状态',
    CASE is_active WHEN TRUE THEN '✅ 已启用' ELSE '未启用' END as '默认'
FROM ai_config
ORDER BY provider, sort_order;

-- ============================================================================
-- 统计
-- ============================================================================
SELECT
    provider_name as '厂商',
    COUNT(*) as '模型数量',
    SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as '可用',
    SUM(CASE WHEN status = 'insufficient_balance' THEN 1 ELSE 0 END) as '欠费'
FROM ai_config
GROUP BY provider_name;

-- ============================================================================
-- Migration Complete
-- 共 18 个模型配置
-- - 智谱 AI: 4个 (2可用, 2欠费)
-- - 火山引擎: 4个 (4可用)
-- - 阿里云: 10个 (10可用)
--
-- 默认启用: glm-4-flash (智谱，性价比高)
-- ============================================================================
