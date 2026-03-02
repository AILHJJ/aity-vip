-- =====================================================
-- AI配置提示词更新说明
-- 执行时间: 2026-03-02
-- =====================================================

-- 说明：
-- 后端已内置智能优化提示词，无需在数据库中配置
-- AI会根据内容特点自动调整优化方式：
--   - 突出核心观点
--   - 结构化呈现
--   - 如有操作建议/标的，会特别醒目

-- 清空数据库中的提示词（使用后端内置）
UPDATE ai_config SET prompt_template = NULL WHERE prompt_template IS NOT NULL;

-- 验证更新结果
SELECT id, model_name, display_name, provider_name, is_active, status
FROM ai_config
ORDER BY provider, sort_order;
