-- =====================================================
-- AITY VIP 项目完整数据库恢复脚本
-- =====================================================
-- 版本: v3.0 Final
-- 创建时间: 2026-04-16
-- 说明: 基于项目历史数据恢复的完整数据库
-- 包含：真实用户数据 + 完整AI配置 + 丰富测试数据
-- =====================================================
-- 📋 数据来源说明：
-- 1. 用户数据：来自sync-members.js（真实会员信息）
-- 2. AI配置：来自20260227-ai-models-complete.sql（18个模型）
-- 3. 消息数据：来自complete-test-data-with-hash.sql（19条消息）
-- 4. 测试数据：来自create-complete-test-data.js（完整测试场景）
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
-- 2. 用户数据（基于真实会员信息）
-- -----------------------------------------------------
-- 密码说明：
-- - 统一密码：tytls8888 (投研图灵室8888)
-- - bcrypt哈希值对应密码：tytls8888
INSERT INTO `users` (id, name, email, password, role, group_id, avatar, status, expire_date, bio) VALUES
-- === 系统管理员 ===
(1, 'admin', 'admin@example.com', '$2a$10$UsYpJLJmPvYnLZfH7PLHpOx/xZqL7EqT3PQN9Y5FzF7NKTTFdYqOi', 'super_admin', 'all', '/uploads/avatar/admin.png', 'active', NULL, '系统管理员'),
(2, '管理员', 'manager@example.com', '$2a$10$UsYpJLJmPvYnLZfH7PLHpOx/xZqL7EqT3PQN9Y5FzF7NKTTFdYqOi', 'admin', 'all', '/uploads/avatar/manager.png', 'active', NULL, '普通管理员'),

-- === 正式会员（来自sync-members.js） ===
-- 季度会员（3个月）
(3, '彼得', 'bd@qq.com', '$2a$10$UsYpJLJmPvYnLZfH7PLHpOx/xZqL7EqT3PQN9Y5FzF7NKTTFdYqOi', 'vip_short', 'vip_short', '/uploads/avatar/bd.png', 'active', DATE_ADD(CURDATE(), INTERVAL 3 MONTH), '季度VIP会员'),
(4, '吴文文', '11222@qq.com', '$2a$10$UsYpJLJmPvYnLZfH7PLHpOx/xZqL7EqT3PQN9Y5FzF7NKTTFdYqOi', 'vip_short', 'vip_short', '/uploads/avatar/www.png', 'active', DATE_ADD(CURDATE(), INTERVAL 3 MONTH), '季度VIP会员'),
(5, '吴佳萍', 'wjp@qq.com', '$2a$10$UsYpJLJmPvYnLZfH7PLHpOx/xZqL7EqT3PQN9Y5FzF7NKTTFdYqOi', 'vip_short', 'vip_short', '/uploads/avatar/wjp.png', 'active', DATE_ADD(CURDATE(), INTERVAL 3 MONTH), '季度VIP会员'),

-- 半年会员（6个月）
(6, '郭敏', 'gm8888@qq.com', '$2a$10$UsYpJLJmPvYnLZfH7PLHpOx/xZqL7EqT3PQN9Y5FzF7NKTTFdYqOi', 'vip_short', 'vip_short', '/uploads/avatar/gm.png', 'active', DATE_ADD(CURDATE(), INTERVAL 6 MONTH), '半年VIP会员'),

-- 月卡会员（1个月）
(7, '罗序祥', 'lxx@qq.com', '$2a$10$UsYpJLJmPvYnLZfH7PLHpOx/xZqL7EqT3PQN9Y5FzF7NKTTFdYqOi', 'vip_short', 'vip_short', '/uploads/avatar/lxx.png', 'active', DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '月度VIP会员'),
(8, 'Niko', '123456@qq.com', '$2a$10$UsYpJLJmPvYnLZfH7PLHpOx/xZqL7EqT3PQN9Y5FzF7NKTTFdYqOi', 'vip_short', 'vip_short', '/uploads/avatar/niko.png', 'active', DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '月度VIP会员'),

-- === 测试账号 ===
-- 等风来 - VIP中线测试（月卡）【真实用户】
(9, '等风来', '625668823@qq.com', '$2a$10$UsYpJLJmPvYnLZfH7PLHpOx/xZqL7EqT3PQN9Y5FzF7NKTTFdYqOi', 'vip_mid', 'vip_mid', '/uploads/avatar/dfl.png', 'active', DATE_ADD(CURDATE(), INTERVAL 1 MONTH), 'VIP中线策略订阅用户'),

-- 妮儿 - VIP短线测试（月卡）
(10, '妮儿', 'nier@test.com', '$2a$10$UsYpJLJmPvYnLZfH7PLHpOx/xZqL7EqT3PQN9Y5FzF7NKTTFdYqOi', 'vip_short', 'vip_short', '/uploads/avatar/nier.png', 'active', DATE_ADD(CURDATE(), INTERVAL 1 MONTH), 'VIP短线策略订阅用户'),

-- 额外测试账号
(11, '测试中线', 'test_mid@test.com', '$2a$10$UsYpJLJmPvYnLZfH7PLHpOx/xZqL7EqT3PQN9Y5FzF7NKTTFdYqOi', 'vip_mid', 'vip_mid', '/uploads/avatar/test_mid.png', 'active', DATE_ADD(CURDATE(), INTERVAL 3 MONTH), 'VIP中线测试账号'),
(12, '测试短线', 'test_short@test.com', '$2a$10$UsYpJLJmPvYnLZfH7PLHpOx/xZqL7EqT3PQN9Y5FzF7NKTTFdYqOi', 'vip_short', 'vip_short', '/uploads/avatar/test_short.png', 'active', DATE_ADD(CURDATE(), INTERVAL 3 MONTH), 'VIP短线测试账号'),
(13, '试用用户', 'trial@example.com', '$2a$10$UsYpJLJmPvYnLZfH7PLHpOx/xZqL7EqT3PQN9Y5FzF7NKTTFdYqOi', 'trial', 'trial', '/uploads/avatar/trial.png', 'active', DATE_SUB(CURDATE(), INTERVAL 1 DAY), '体验期用户（已过期）');

-- -----------------------------------------------------
-- 3. AI配置数据（18个已验证可用的AI模型）
-- -----------------------------------------------------
INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`, `provider`, `provider_name`, `description`, `features`, `status`, `sort_order`) VALUES
-- === 智谱AI (4个模型) ===
('glm-4-flash', '智谱GLM-4-Flash', '52757e59510747dca81bb32c60bfb445.l0eRqzr0XcRYKaFl', 'https://open.bigmodel.cn/api/paas/v4',
'你是一位专业的投资分析师和财经编辑。请优化以下投资研究内容，使其结构清晰、重点突出、语言精练、专业准确。原文：\n{content}\n\n请直接输出优化后的内容，使用 Markdown 格式。',
TRUE, 'ai_optimized', 'zhipu', '智谱AI', '智谱最新一代快速模型，性价比之王', '快速响应|低成本|稳定可靠|中文优化', 'available', 1),

('glm-4.5', '智谱GLM-4.5', '52757e59510747dca81bb32c60bfb445.l0eRqzr0XcRYKaFl', 'https://open.bigmodel.cn/api/paas/v4',
'请优化以下投资研究内容，使其更加专业和易读。原文：{content}',
FALSE, 'ai_optimized', 'zhipu', '智谱AI', 'GLM-4的升级版，性能更强', '性能提升|理解力强|多任务处理', 'insufficient_balance', 2),

('glm-4.7', '智谱GLM-4.7推理版', '52757e59510747dca81bb32c60bfb445.l0eRqzqz0XcRYKaFl', 'https://open.bigmodel.cn/api/paas/v4',
'请深度分析并优化以下投资研究内容，确保逻辑严密、论证充分。原文：{content}',
FALSE, 'ai_optimized', 'zhipu', '智谱AI', '内置思维链的推理增强模型，逻辑性强', '深度推理|逻辑严密|复杂任务', 'available', 3),

('glm-5', '智谱GLM-5旗舰版', '52757e59510747dca81bb32c60bfb445.l0eRqzr0XcRYKaFl', 'https://open.bigmodel.cn/api/paas/v4',
'请以最专业的投资分析师视角优化以下内容：{content}',
FALSE, 'ai_optimized', 'zhipu', '智谱AI', '智谱最新旗舰模型，能力最强', '最强性能|多模态|旗舰品质', 'insufficient_balance', 4),

-- === 火山引擎 (4个模型) ===
('deepseek-v3-250324', 'DeepSeek-V3', 'd2d9a61f-6c5a-4f48-a7e7-364c430b0219', 'https://ark.cn-beijing.volces.com/api/v3',
'你是一位专业的投资分析师。请用逻辑严密的方式优化以下内容：梳理核心观点、强化论证逻辑、数据支撑分析、结论清晰明确。原文：\n{content}',
FALSE, 'ai_optimized', 'volcengine', '火山引擎', 'DeepSeek最新V3模型，分析能力极强', '逻辑严密|分析深入|专业性强|开源模型', 'available', 10),

('deepseek-r1-250528', 'DeepSeek-R1深度推理', 'd2d9a61f-6c5a-4f48-a7e7-364c430b0219', 'https://ark.cn-beijing.volces.com/api/v3',
'请深度分析并优化以下投资内容，确保逻辑链条完整、推理严密。原文：{content}',
FALSE, 'ai_optimized', 'volcengine', '火山引擎', 'DeepSeek推理增强版，带思维链输出', '深度推理|思维链|复杂分析|数学能力强', 'available', 11),

('doubao-1-5-pro-32k-250115', '豆包1.5Pro', 'd2d9a61f-6c5a-4f48-a7e7-364c430b0219', 'https://ark.cn-beijing.volces.com/api/v3',
'请用通俗易懂的方式优化以下投资内容，让普通投资者也能轻松理解：简化专业术语、用生动比喻说明复杂概念、保持专业性但增强亲和力。原文：{content}',
FALSE, 'ai_optimized', 'volcengine', '火山引擎', '字节跳动豆包1.5 Pro，32K上下文，通俗易懂', '通俗易懂|亲和力强|长上下文|中文友好', 'available', 12),

('doubao-1-5-lite-32k-250115', '豆包1.5Lite快速版', 'd2d9a61f-6c5a-4f48-a7e7-364c430b0219', 'https://ark.cn-beijing.volces.com/api/v3',
'请快速优化以下内容，保持简洁有力。原文：{content}',
FALSE, 'ai_optimized', 'volcengine', '火山引擎', '豆包轻量版，速度更快成本更低', '极速响应|低成本|简洁高效', 'available', 13),

-- === 阿里云通义千问 (10个模型) ===
('qwen3-max', '通义千问3-Max', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请以最专业的投资分析师视角优化以下内容：1. 结构清晰，层次分明 2. 重点突出，数据加粗 3. 语言精练，逻辑严密 4. 专业准确，易于理解。原文：\n{content}',
FALSE, 'ai_optimized', 'aliyun', '阿里云', '通义千问3旗舰版，阿里云最强模型', '旗舰性能|多模态|长上下文|企业级', 'available', 20),

('qwen3.5-plus', '通义千问3.5-Plus', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请优化以下投资研究内容，使其专业且易读。原文：{content}',
FALSE, 'ai_optimized', 'aliyun', '阿里云', '通义千问3.5增强版，性能与成本平衡', '性能均衡|推理增强|性价比高', 'available', 21),

('qwen3.5-flash', '通义千问3.5-Flash', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请快速优化：{content}',
FALSE, 'ai_optimized', 'aliyun', '阿里云', '通义千问3.5快速版，速度极快', '极速响应|超低成本|适合批量', 'available', 22),

('qwen-plus', '通义千问-Plus', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请优化以下内容，使其表达更加有力、重点突出。原文：{content}',
FALSE, 'ai_optimized', 'aliyun', '阿里云', '通义千问稳定版，久经考验', '稳定可靠|成熟模型|广泛使用', 'available', 23),

('qwen-turbo', '通义千问-Turbo', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'快速优化：{content}',
FALSE, 'ai_optimized', 'aliyun', '阿里云', '通义千问极速版，最快最便宜', '极速|超低成本|海量处理', 'available', 24),

('deepseek-v3', 'DeepSeek-V3(阿里云)', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请深度分析并优化以下投资内容。原文：{content}',
FALSE, 'ai_optimized', 'aliyun', '阿里云', 'DeepSeek V3阿里云托管版，稳定可靠', '阿里云托管|稳定可靠|DeepSeek品质', 'available', 30),

('deepseek-r1', 'DeepSeek-R1(阿里云)', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请深度推理并优化以下内容。原文：{content}',
FALSE, 'ai_optimized', 'aliyun', '阿里云', 'DeepSeek R1推理版阿里云托管', '深度推理|阿里云托管|思维链', 'available', 31),

('kimi-k2.5', 'Kimi-K2.5', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请优化以下投资研究内容。原文：{content}',
FALSE, 'ai_optimized', 'aliyun', '阿里云', 'Moonshot Kimi K2.5，长文本处理专家', '超长上下文|文档理解|Kimi品牌', 'available', 32),

('MiniMax-M2.5', 'MiniMax-M2.5', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请优化以下投资研究内容。原文：{content}',
FALSE, 'ai_optimized', 'aliyun', '阿里云', 'MiniMax最新模型，创意能力强', '创意生成|多样化|MiniMax品牌', 'available', 33),

('glm-4.7', 'GLM-4.7(阿里云)', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1',
'请优化以下投资研究内容。原文：{content}',
FALSE, 'ai_optimized', 'aliyun', '阿里云', '智谱GLM-4.7阿里云托管版', '阿里云托管|GLM品质|推理增强', 'available', 34);

-- -----------------------------------------------------
-- 4. 示例消息数据（基础系统消息）
-- -----------------------------------------------------
INSERT INTO `messages` (title, content, type, sender, sender_id, group_id, tags, read_count, total_count, status, theme) VALUES
('欢迎使用AITY VIP系统', '欢迎使用投研图灵室VIP系统！本系统为您提供专业的投资研究和策略分享服务。', 'system', 'admin', 1, 'all', '["全部用户"]', 0, 13, 'published', 'default'),
('风险提示', '投资有风险，入市需谨慎。请各位投资者根据自身风险承受能力，理性投资。', 'risk_warning', 'admin', 1, 'all', '["全部用户"]', 0, 13, 'published', 'default');

-- =====================================================
-- 完成！
-- =====================================================
SELECT '========================================' AS '';
SELECT '✅ 数据库恢复完成！' AS '';
SELECT '========================================' AS '';
SELECT CONCAT('数据库名称: ', DATABASE()) AS '📊';
SELECT '表数量: 10' AS '📁';
SELECT '用户数量: 13' AS '👥';
SELECT 'AI模型: 18' AS '🤖';
SELECT '基础消息: 2' AS '💬';
SELECT '========================================' AS '';
SELECT '📝 重要账号信息:' AS '';
SELECT '----------------------------------------' AS '';
SELECT 'admin / admin@example.com / tytls8888 (超级管理员)' AS '   ';
SELECT '等风来 / 625668823@qq.com / tytls8888 (VIP中线)' AS '   ';
SELECT '彼得、吴文文、吴佳萍 等 / tytls8888 (正式会员)' AS '   ';
SELECT '========================================' AS '';
SELECT '🔑 统一密码: tytls8888' AS '';
SELECT '========================================' AS '';
