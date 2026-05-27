-- =====================================================
-- AITY VIP 项目完整数据库建表脚本
-- =====================================================
-- 版本: v2.0
-- 创建时间: 2026-04-16
-- 说明: 包含完整表结构 + 用户数据 + AI配置 + 测试数据
-- =====================================================

-- 第一步：创建数据库
-- =====================================================
DROP DATABASE IF EXISTS `投研图灵室_v2`;
CREATE DATABASE `投研图灵室_v2`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `投研图灵室_v2`;

-- =====================================================
-- 第二步：创建表结构
-- =====================================================

-- -----------------------------------------------------
-- 1. 用户分组表 (groups_table)
-- -----------------------------------------------------
DROP TABLE IF EXISTS `groups_table`;
CREATE TABLE `groups_table` (
  `id` VARCHAR(50) PRIMARY KEY COMMENT '分组ID',
  `name` VARCHAR(100) NOT NULL COMMENT '分组名称',
  `description` TEXT COMMENT '分组描述',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户分组表';

-- -----------------------------------------------------
-- 2. 用户表 (users)
-- -----------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
  `name` VARCHAR(100) NOT NULL COMMENT '用户名称',
  `email` VARCHAR(100) UNIQUE COMMENT '邮箱地址（可选）',
  `password` VARCHAR(255) NOT NULL COMMENT '密码（bcrypt加密）',
  `role` ENUM('super_admin', 'admin', 'vip_mid', 'vip_short', 'trial') NOT NULL DEFAULT 'trial' COMMENT '用户角色',
  `group_id` VARCHAR(50) COMMENT '所属分组ID',
  `avatar` VARCHAR(100) COMMENT '头像URL',
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active' COMMENT '账户状态',
  `expire_date` DATE COMMENT 'VIP过期日期',
  `bio` TEXT COMMENT '用户简介（资产规模、分享偏好等）',
  `last_login_at` DATETIME COMMENT '上次登录时间',
  `password_changed_at` DATETIME COMMENT '密码最后修改时间',
  `is_initial_password` BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否使用初始密码',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  INDEX `idx_role` (`role`),
  INDEX `idx_group_id` (`group_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_expire_date` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- -----------------------------------------------------
-- 3. 消息附件表 (message_attachments)
-- -----------------------------------------------------
DROP TABLE IF EXISTS `message_attachments`;
CREATE TABLE `message_attachments` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '附件ID',
  `message_id` INT NOT NULL COMMENT '消息ID',
  `file_name` VARCHAR(255) NOT NULL COMMENT '文件名',
  `file_url` VARCHAR(500) NOT NULL COMMENT '文件URL',
  `file_type` VARCHAR(50) COMMENT '文件类型',
  `file_size` INT COMMENT '文件大小（字节）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

  INDEX `idx_message_id` (`message_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息附件表';

-- -----------------------------------------------------
-- 4. 消息表 (messages)
-- -----------------------------------------------------
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '消息ID',
  `title` VARCHAR(255) NOT NULL COMMENT '消息标题',
  `content` TEXT NOT NULL COMMENT '消息内容',
  `type` ENUM(
    'pre_market_comment',
    'morning_comment',
    'morning_focus',
    'afternoon_comment',
    'afternoon_focus',
    'close_comment',
    'risk_warning',
    'system',
    'important',
    'daily'
  ) NOT NULL DEFAULT 'daily' COMMENT '消息类型',
  `sender` VARCHAR(100) NOT NULL COMMENT '发送者名称',
  `sender_id` INT NOT NULL COMMENT '发送者用户ID',
  `group_id` VARCHAR(50) NOT NULL COMMENT '目标分组ID',
  `read_count` INT NOT NULL DEFAULT 0 COMMENT '已读人数',
  `total_count` INT NOT NULL DEFAULT 0 COMMENT '总人数',
  `tags` JSON COMMENT '消息标签数组',
  `theme` VARCHAR(50) NOT NULL DEFAULT 'default' COMMENT 'Markdown主题样式',
  `original_content` TEXT COMMENT '原始内容（AI优化前）',
  `ai_optimized_content` TEXT COMMENT 'AI优化后的内容',
  `publish_time` DATETIME COMMENT '定时发布时间',
  `status` ENUM('draft', 'scheduled', 'published') NOT NULL DEFAULT 'published' COMMENT '发布状态',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

  INDEX `idx_type` (`type`),
  INDEX `idx_group_id` (`group_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_publish_time` (`publish_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息表';

-- -----------------------------------------------------
-- 5. 用户收藏表 (user_favorites)
-- -----------------------------------------------------
DROP TABLE IF EXISTS `user_favorites`;
CREATE TABLE `user_favorites` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '收藏ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `message_id` INT NOT NULL COMMENT '消息ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

  UNIQUE KEY `unique_user_message` (`user_id`, `message_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_message_id` (`message_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户收藏表';

-- -----------------------------------------------------
-- 6. 用户消息已读表 (user_message_reads)
-- -----------------------------------------------------
DROP TABLE IF EXISTS `user_message_reads`;
CREATE TABLE `user_message_reads` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `message_id` INT NOT NULL COMMENT '消息ID',
  `read_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '阅读时间',

  UNIQUE KEY `unique_user_message_read` (`user_id`, `message_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_message_id` (`message_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户消息已读表';

-- -----------------------------------------------------
-- 7. 讨论表 (discussions)
-- -----------------------------------------------------
DROP TABLE IF EXISTS `discussions`;
CREATE TABLE `discussions` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '讨论ID',
  `message_id` INT NOT NULL COMMENT '关联消息ID',
  `user_id` INT NOT NULL COMMENT '发起用户ID',
  `user_name` VARCHAR(100) NOT NULL COMMENT '发起用户名',
  `title` VARCHAR(255) NOT NULL COMMENT '讨论标题',
  `content` TEXT NOT NULL COMMENT '讨论内容',
  `status` ENUM('pending', 'replied') NOT NULL DEFAULT 'pending' COMMENT '回复状态',
  `visibility` ENUM('private', 'public') NOT NULL DEFAULT 'private' COMMENT '可见性',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  INDEX `idx_message_id` (`message_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='讨论表';

-- -----------------------------------------------------
-- 8. 讨论回复表 (discussion_replies)
-- -----------------------------------------------------
DROP TABLE IF EXISTS `discussion_replies`;
CREATE TABLE `discussion_replies` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '回复ID',
  `discussion_id` INT NOT NULL COMMENT '讨论ID',
  `user_id` INT NOT NULL COMMENT '回复用户ID',
  `user_name` VARCHAR(100) NOT NULL COMMENT '回复用户名',
  `content` TEXT NOT NULL COMMENT '回复内容',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

  INDEX `idx_discussion_id` (`discussion_id`),
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='讨论回复表';

-- -----------------------------------------------------
-- 9. 讨论收藏表 (discussion_favorites)
-- -----------------------------------------------------
DROP TABLE IF EXISTS `discussion_favorites`;
CREATE TABLE `discussion_favorites` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `discussion_id` INT NOT NULL COMMENT '讨论ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

  UNIQUE KEY `unique_user_discussion` (`user_id`, `discussion_id`),
  INDEX `idx_discussion_id` (`discussion_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='讨论收藏表';

-- -----------------------------------------------------
-- 10. AI配置表 (ai_config)
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ai_config`;
CREATE TABLE `ai_config` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '配置ID',
  `model_name` VARCHAR(50) NOT NULL UNIQUE COMMENT 'AI模型名称',
  `display_name` VARCHAR(100) COMMENT '显示名称',
  `api_key` VARCHAR(255) NOT NULL COMMENT 'API密钥',
  `base_url` VARCHAR(255) NOT NULL COMMENT 'API基础URL',
  `prompt_template` TEXT COMMENT '提示词模板',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否激活',
  `default_version` ENUM('original', 'ai_optimized') NOT NULL DEFAULT 'ai_optimized' COMMENT '默认版本',
  `provider` VARCHAR(50) NOT NULL DEFAULT '' COMMENT '厂商代码',
  `provider_name` VARCHAR(100) NOT NULL DEFAULT '' COMMENT '厂商名称',
  `description` VARCHAR(500) NOT NULL DEFAULT '' COMMENT '模型简介',
  `features` VARCHAR(500) NOT NULL DEFAULT '' COMMENT '模型特点',
  `status` ENUM('available', 'insufficient_balance', 'error', 'unknown') NOT NULL DEFAULT 'unknown' COMMENT '可用状态',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序顺序',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  INDEX `idx_model_name` (`model_name`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI配置表';

-- =====================================================
-- 第三步：插入基础数据
-- =====================================================

-- -----------------------------------------------------
-- 1. 用户分组数据
-- -----------------------------------------------------
INSERT INTO `groups_table` (id, name, description) VALUES
('all', '全部用户', '包含所有用户的组'),
('vip_mid', 'VIP中线用户', '订阅中线策略的VIP用户'),
('vip_short', 'VIP短线用户', '订阅短线策略的VIP用户'),
('trial', '试用用户', '体验期用户');

-- -----------------------------------------------------
-- 2. 测试用户数据（密码统一为：123456）
-- -----------------------------------------------------
INSERT INTO `users` (id, name, email, password, role, group_id, avatar, status, expire_date, bio) VALUES
-- 超级管理员
(1, 'admin', 'admin@example.com', '$2a$10$oVsFX087m84JIdHdCeJL7uXwCX1I5EGOPEprFp33iLuPqVC.Tcr4G', 'super_admin', 'all', '/uploads/avatar/admin.png', 'active', NULL, '系统管理员'),
-- 普通管理员
(2, '管理员', 'manager@example.com', '$2a$10$oVsFX087m84JIdHdCeJL7uXwCX1I5EGOPEprFp33iLuPqVC.Tcr4G', 'admin', 'all', '/uploads/avatar/manager.png', 'active', NULL, '普通管理员'),
-- VIP中线用户
(3, '等风来', '625668823@qq.com', '$2a$10$oVsFX087m84JIdHdCeJL7uXwCX1I5EGOPEprFp33iLuPqVC.Tcr4G', 'vip_short', 'vip_short', '/uploads/avatar/vip_short.png', 'active', DATE_ADD(CURDATE(), INTERVAL 365 DAY), 'VIP短线策略订阅用户'),
-- VIP短线用户
(4, 'vip_test', 'vip_test@example.com', '$2a$10$oVsFX087m84JIdHdCeJL7uXwCX1I5EGOPEprFp33iLuPqVC.Tcr4G', 'vip_mid', 'vip_mid', '/uploads/avatar/vip_mid.png', 'active', DATE_ADD(CURDATE(), INTERVAL 365 DAY), 'VIP中线策略订阅用户'),
-- 试用用户
(5, '试用用户', 'trial@example.com', '$2a$10$oVsFX087m84JIdHdCeJL7uXwCX1I5EGOPEprFp33iLuPqVC.Tcr4G', 'trial', 'trial', '/uploads/avatar/trial.png', 'active', DATE_SUB(CURDATE(), INTERVAL 1 DAY), '体验期用户');

-- -----------------------------------------------------
-- 3. AI配置数据（16个已验证可用的AI模型）
-- -----------------------------------------------------
INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`, `provider`, `provider_name`, `description`, `features`, `sort_order`) VALUES
-- 智谱AI
('glm-4-flash', '智谱GLM-4-Flash（推荐）', '52757e59510747dca81bb32c60bfb445.l0eRqzr0XcRYKaFl', 'https://open.bigmodel.cn/api/paas/v4',
'你是一位专业的投资分析师和财经编辑。请优化以下投资研究内容，使其结构清晰、重点突出、语言精练、专业准确。原文：\n{content}\n\n请直接输出优化后的内容，使用 Markdown 格式。',
TRUE, 'ai_optimized', 'zhipu', '智谱AI', '高性能免费模型', '快速|免费|中文友好', 1),

('glm-4.7', '智谱GLM-4.7推理版', '52757e59510747dca81bb32c60bfb445.l0eRqzr0XcRYKaFl', 'https://open.bigmodel.cn/api/paas/v4',
'请深度分析并优化以下投资研究内容，确保逻辑严密、论证充分。原文：\n{content}\n\n优化后内容：',
FALSE, 'ai_optimized', 'zhipu', '智谱AI', '推理增强版', '强大|准确|多模态', 2),

-- 火山引擎
('deepseek-v3-250324', '火山引擎-DeepSeek-V3（推荐）', 'd2d9a61f-6c5a-4f48-a7e7-364c430b0219', 'https://ark.cn-beijing.volces.com/api/v3',
'你是一位专业的投资分析师。请用逻辑严密的方式优化以下内容：梳理核心观点、强化论证逻辑、数据支撑分析、结论清晰明确。原文：\n{content}\n\n优化后内容：',
FALSE, 'ai_optimized', 'volces', '火山引擎', '分析能力强', '强大|准确|推理', 3),

('deepseek-r1-250528', '火山引擎-DeepSeek-R1深度推理', 'd2d9a61f-6c5a-4f48-a7e7-364c430b0219', 'https://ark.cn-beijing.volces.com/api/v3',
'请深度分析并优化以下投资内容，确保逻辑链条完整、推理严密。原文：\n{content}\n\n优化后内容：',
FALSE, 'ai_optimized', 'volces', '火山引擎', '深度推理', '推理|逻辑|深度', 4),

('doubao-1-5-pro-32k-250115', '火山引擎-豆包1.5Pro', 'd2d9a61f-6c5a-4f48-a7e7-364c430b0219', 'https://ark.cn-beijing.volces.com/api/v3',
'请用通俗易懂的方式优化以下投资内容，让普通投资者也能轻松理解：简化专业术语、用生动比喻说明复杂概念、保持专业性但增强亲和力。原文：\n{content}\n\n优化后内容：',
FALSE, 'ai_optimized', 'volces', '火山引擎', '通俗易懂', '简单|易懂|亲和', 5),

('doubao-1-5-lite-32k-250115', '火山引擎-豆包1.5Lite快速版', 'd2d9a61f-6c5a-4f48-a7e7-364c430b0219', 'https://ark.cn-beijing.volces.com/api/v3',
'请快速优化以下内容，保持简洁有力。原文：\n{content}\n\n优化后：',
FALSE, 'ai_optimized', 'volces', '火山引擎', '快速版', '快速|简洁', 6),

-- 阿里云通义千问
('qwen3-max', '阿里云-Qwen3-Max（旗舰推荐）', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请以最专业的投资分析师视角优化以下内容：1. 结构清晰，层次分明 2. 重点突出，数据加粗 3. 语言精练，逻辑严密 4. 专业准确，易于理解。原文：\n{content}\n\n优化后内容：',
FALSE, 'ai_optimized', 'aliyun', '阿里云', '旗舰模型', '强大|全面|旗舰', 7),

('qwen3.5-plus', '阿里云-Qwen3.5-Plus', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请优化以下投资研究内容，使其专业且易读。原文：\n{content}',
FALSE, 'ai_optimized', 'aliyun', '阿里云', '高性能版', '快速|准确', 8),

('qwen3.5-flash', '阿里云-Qwen3.5-Flash快速版', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请快速优化：\n{content}',
FALSE, 'ai_optimized', 'aliyun', '阿里云', '快速版', '极速|低成本', 9),

('qwen-plus', '阿里云-Qwen-Plus稳定版', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请优化以下内容，使其表达更加有力、重点突出。原文：\n{content}',
FALSE, 'ai_optimized', 'aliyun', '阿里云', '稳定版', '稳定|可靠', 10),

('qwen-turbo', '阿里云-Qwen-Turbo极速版', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'快速优化：\n{content}',
FALSE, 'ai_optimized', 'aliyun', '阿里云', '极速版', '极速|性价比', 11),

('deepseek-v3', '阿里云-DeepSeek-V3', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请深度分析并优化以下投资内容。原文：\n{content}',
FALSE, 'ai_optimized', 'aliyun', '阿里云', 'DeepSeek V3', '分析|推理', 12),

('deepseek-r1', '阿里云-DeepSeek-R1推理版', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请深度推理并优化以下内容。原文：\n{content}',
FALSE, 'ai_optimized', 'aliyun', '阿里云', 'DeepSeek R1', '推理|逻辑', 13),

('kimi-k2.5', '阿里云-Kimi-K2.5', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请优化以下投资研究内容。原文：\n{content}',
FALSE, 'ai_optimized', 'aliyun', '阿里云', 'Kimi K2.5', '智能|对话', 14),

('MiniMax-M2.5', '阿里云-MiniMax-M2.5', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请优化以下投资研究内容。原文：\n{content}',
FALSE, 'ai_optimized', 'aliyun', '阿里云', 'MiniMax', '创意|灵活', 15),

('glm-4.7', '阿里云-GLM-4.7', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请优化以下投资研究内容。原文：\n{content}',
FALSE, 'ai_optimized', 'aliyun', '阿里云', 'GLM 4.7', '强大|准确', 16);

-- -----------------------------------------------------
-- 4. 示例消息数据
-- -----------------------------------------------------
INSERT INTO `messages` (title, content, type, sender, sender_id, group_id, tags, read_count, total_count, status, theme) VALUES
('欢迎使用AITY VIP系统', '欢迎使用投研图灵室VIP系统！本系统为您提供专业的投资研究和策略分享服务。', 'system', 'admin', 1, 'all', '["全部用户"]', 0, 5, 'published', 'default'),
('风险提示', '投资有风险，入市需谨慎。请各位投资者根据自身风险承受能力，理性投资。', 'risk_warning', 'admin', 1, 'all', '["全部用户"]', 0, 5, 'published', 'default');

-- =====================================================
-- 完成！
-- =====================================================
SELECT '========================================' AS '';
SELECT '✅ 数据库初始化完成！' AS '';
SELECT '========================================' AS '';
SELECT CONCAT('数据库名称: ', DATABASE()) AS '📊';
SELECT '表数量: 10' AS '📁';
SELECT '用户数量: 5' AS '👥';
SELECT 'AI模型: 16' AS '🤖';
SELECT '消息数量: 2' AS '💬';
SELECT '========================================' AS '';
SELECT '📝 测试账号信息:' AS '';
SELECT '----------------------------------------' AS '';
SELECT 'admin / admin@example.com / 123456 (超级管理员)' AS '   ';
SELECT '等风来 / 625668823@qq.com / 123456 (VIP短线)' AS '   ';
SELECT 'vip_test / vip_test@example.com / 123456 (VIP中线)' AS '   ';
SELECT '========================================' AS '';
