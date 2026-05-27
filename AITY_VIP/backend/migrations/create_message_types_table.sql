-- =====================================================
-- 消息类型管理表迁移脚本
-- 创建日期: 2026-04-23
-- 描述: 支持管理员动态管理消息类型
-- =====================================================

-- 创建 message_types 表
CREATE TABLE IF NOT EXISTS `message_types` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  `type` VARCHAR(50) NOT NULL UNIQUE COMMENT '类型标识（英文）',
  `label` VARCHAR(100) NOT NULL COMMENT '显示名称（中文）',
  `color` VARCHAR(20) NOT NULL DEFAULT '#667eea' COMMENT '标签颜色',
  `icon` VARCHAR(50) DEFAULT '' COMMENT '图标（emoji或图标名）',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序顺序',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用: 0-否, 1-是',
  `description` VARCHAR(255) DEFAULT '' COMMENT '类型描述',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_type` (`type`),
  KEY `idx_sort_order` (`sort_order`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息类型配置表';

-- 插入默认消息类型
INSERT IGNORE INTO `message_types` (`type`, `label`, `color`, `icon`, `sort_order`, `is_active`, `description`) VALUES
('position_handle', '持仓处理', '#ef4444', '📊', 1, 1, '持仓处理相关消息'),
('pre_market_comment', '盘前点评', '#f59e0b', '🌅', 2, 1, '开盘前的市场点评'),
('morning_comment', '早盘点评', '#10b981', '☀️', 3, 1, '早盘市场分析'),
('morning_focus', '早盘关注', '#06b6d4', '🎯', 4, 1, '早盘重点关注标的'),
('afternoon_comment', '午盘点评', '#8b5cf6', '🌤️', 5, 1, '午盘市场分析'),
('afternoon_focus', '午盘关注', '#ec4899', '💫', 6, 1, '午盘重点关注标的'),
('close_comment', '收盘点评', '#6366f1', '🌙', 7, 1, '收盘总结与分析'),
('risk_warning', '风险提示', '#dc2626', '⚠️', 8, 1, '风险警示消息'),
('system', '系统消息', '#64748b', '🔔', 9, 1, '系统通知类消息'),
('important', '重要消息', '#eab308', '⭐', 10, 1, '重要通知'),
('daily', '日常消息', '#667eea', '📝', 11, 1, '日常消息');

-- 验证插入结果
SELECT * FROM `message_types` ORDER BY `sort_order`;
