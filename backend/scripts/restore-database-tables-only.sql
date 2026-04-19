-- =====================================================
-- AITY VIP 项目数据库恢复脚本（表结构+数据）
-- =====================================================
-- 说明：
--   请先在Navicat中手动创建数据库：投研图灵室_v2
--   字符集：utf8mb4
--   排序规则：utf8mb4_unicode_ci
--   然后运行此脚本
-- =====================================================

USE `投研图灵室_v2`;

-- =====================================================
-- 第一步：创建表结构
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
-- 第二步：插入基础数据
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
-- 2. 测试用户数据
-- -----------------------------------------------------
-- 密码：123456 的bcrypt哈希值
INSERT INTO `users` (id, name, email, password, role, group_id, avatar, status, expire_date, bio) VALUES
-- 超级管理员
(1, '超级管理员', 'admin@aity.com', '$2a$10$oVsFX087m84JIdHdCeJL7uXwCX1I5EGOPEprFp33iLuPqVC.Tcr4G', 'super_admin', 'all', '/uploads/avatar/admin.png', 'active', NULL, '系统管理员，拥有所有权限'),
-- 普通管理员
(2, '管理员', 'manager@aity.com', '$2a$10$oVsFX087m84JIdHdCeJL7uXwCX1I5EGOPEprFp33iLuPqVC.Tcr4G', 'admin', 'all', '/uploads/avatar/manager.png', 'active', NULL, '普通管理员，负责日常运营'),
-- VIP中线用户
(3, '中线VIP用户', 'vip_mid@aity.com', '$2a$10$oVsFX087m84JIdHdCeJL7uXwCX1I5EGOPEprFp33iLuPqVC.Tcr4G', 'vip_mid', 'vip_mid', '/uploads/avatar/vip_mid.png', 'active', DATE_ADD(CURDATE(), INTERVAL 365 DAY), 'VIP中线策略订阅用户'),
-- VIP短线用户
(4, '短线VIP用户', 'vip_short@aity.com', '$2a$10$oVsFX087m84JIdHdCeJL7uXwCX1I5EGOPEprFp33iLuPqVC.Tcr4G', 'vip_short', 'vip_short', '/uploads/avatar/vip_short.png', 'active', DATE_ADD(CURDATE(), INTERVAL 365 DAY), 'VIP短线策略订阅用户'),
-- 试用用户
(5, '试用用户', 'trial@aity.com', '$2a$10$oVsFX087m84JIdHdCeJL7uXwCX1I5EGOPEprFp33iLuPqVC.Tcr4G', 'trial', 'trial', '/uploads/avatar/trial.png', 'active', DATE_SUB(CURDATE(), INTERVAL 1 DAY), '体验期用户');

-- -----------------------------------------------------
-- 3. AI配置数据（占位符，需要更新实际API密钥）
-- -----------------------------------------------------
INSERT INTO `ai_config` (
  model_name, display_name, api_key, base_url, prompt_template,
  is_active, default_version, provider, provider_name, description, features
) VALUES
('glm-4-flash', '智谱AI GLM-4 Flash', 'your-api-key-here', 'https://open.bigmodel.cn/api/paas/v4', '请优化以下文案：', TRUE, 'ai_optimized', 'zhipu', '智谱AI', '高性能免费模型', '快速|免费|中文友好'),
('glm-4-plus', '智谱AI GLM-4 Plus', 'your-api-key-here', 'https://open.bigmodel.cn/api/paas/v4', '请优化以下文案：', TRUE, 'ai_optimized', 'zhipu', '智谱AI', '增强版付费模型', '强大|准确|多模态');

-- -----------------------------------------------------
-- 4. 示例消息数据
-- -----------------------------------------------------
INSERT INTO `messages` (title, content, type, sender, sender_id, group_id, tags, read_count, total_count, status, theme) VALUES
('欢迎使用AITY VIP系统', '欢迎使用投研图灵室VIP系统！本系统为您提供专业的投资研究和策略分享服务。', 'system', '超级管理员', 1, 'all', '["全部用户"]', 0, 5, 'published', 'default'),
('风险提示', '投资有风险，入市需谨慎。请各位投资者根据自身风险承受能力，理性投资。', 'risk_warning', '超级管理员', 1, 'all', '["全部用户"]', 0, 5, 'published', 'default');

-- =====================================================
-- 完成！
-- =====================================================
SELECT '========================================' AS '';
SELECT '✅ 数据库初始化完成！' AS '';
SELECT '========================================' AS '';
SELECT CONCAT('数据库名称: ', DATABASE()) AS '📊';
SELECT '表数量: 10' AS '📁';
SELECT '用户数量: 5' AS '👥';
SELECT '消息数量: 2' AS '💬';
SELECT '========================================' AS '';
