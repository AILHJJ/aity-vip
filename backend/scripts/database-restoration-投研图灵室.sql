-- =====================================================
-- AITY VIP 数据库恢复脚本 - 投研图灵室专用版本
-- =====================================================
-- 版本: v3.1 - 投研图灵室专用
-- 创建时间: 2026-04-16
-- 数据库: 投研图灵室
-- 说明: 完整恢复脚本，包含13个用户 + 18个AI配置
-- =====================================================
-- 使用方法：
-- 1. 在phpMyAdmin中选择数据库：投研图灵室
-- 2. 点击"SQL"标签
-- 3. 复制本文件全部内容粘贴到SQL编辑器
-- 4. 点击"执行"按钮
-- =====================================================

-- =====================================================
-- 第1批：创建所有表结构
-- =====================================================

-- 用户分组表
DROP TABLE IF EXISTS `groups_table`;
CREATE TABLE `groups_table` (
  `id` VARCHAR(50) PRIMARY KEY COMMENT '分组ID',
  `name` VARCHAR(100) NOT NULL COMMENT '分组名称',
  `description` TEXT COMMENT '分组描述',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户分组表';

-- 用户表
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

-- AI配置表
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

-- 消息表
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '消息ID',
  `title` VARCHAR(255) NOT NULL COMMENT '消息标题',
  `content` TEXT NOT NULL COMMENT '消息内容',
  `type` ENUM('pre_market_comment', 'morning_comment', 'morning_focus', 'afternoon_comment', 'afternoon_focus', 'close_comment', 'risk_warning', 'system', 'important', 'daily') NOT NULL DEFAULT 'daily' COMMENT '消息类型',
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

-- 消息附件表
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

-- 用户收藏表
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

-- 用户消息已读表
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

-- 讨论表
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

-- 讨论回复表
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

-- 讨论收藏表
DROP TABLE IF EXISTS `discussion_favorites`;
CREATE TABLE `discussion_favorites` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `discussion_id` INT NOT NULL COMMENT '讨论ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY `unique_user_discussion` (`user_id`, `discussion_id`),
  INDEX `idx_discussion_id` (`discussion_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='讨论收藏表';

-- =====================================================
-- 第2批：插入用户分组和系统管理员
-- =====================================================

-- 插入用户分组
INSERT INTO `groups_table` (id, name, description) VALUES
('all', '全部用户', '包含所有用户的组'),
('vip_mid', 'VIP中线用户', '订阅中线策略的VIP用户'),
('vip_short', 'VIP短线用户', '订阅短线策略的VIP用户'),
('trial', '试用用户', '体验期用户');

-- 插入系统管理员（2个）
INSERT INTO `users` (id, name, email, password, role, group_id, avatar, status, expire_date, bio) VALUES
(1, 'admin', 'admin@example.com', '$2a$10$UsYpJLJmPvYnLZfH7PLHpOx/xZqL7EqT3PQN9Y5FzF7NKTTFdYqOi', 'super_admin', 'all', '/uploads/avatar/admin.png', 'active', NULL, '系统管理员'),
(2, '管理员', 'manager@example.com', '$2a$10$UsYpJLJmPvYnLZfH7PLHpOx/xZqL7EqT3PQN9Y5FzF7NKTTFdYqOi', 'admin', 'all', '/uploads/avatar/manager.png', 'active', NULL, '普通管理员');

-- =====================================================
-- 第3批：插入正式会员（6个）
-- =====================================================

-- 季度会员（3个月）
INSERT INTO `users` (id, name, email, password, role, group_id, avatar, status, expire_date, bio) VALUES
(3, '彼得', 'bd@qq.com', '$2a$10$UsYpJLJmPvYnLZfH7PLHpOx/xZqL7EqT3PQN9Y5FzF7NKTTFdYqOi', 'vip_short', 'vip_short', '/uploads/avatar/bd.png', 'active', DATE_ADD(CURDATE(), INTERVAL 3 MONTH), '季度VIP会员'),
(4, '吴文文', '11222@qq.com', '$2a$10$UsYpJLJmPvYnLZfH7PLHpOx/xZqL7EqT3PQN9Y5FzF7NKTTFdYqOi', 'vip_short', 'vip_short', '/uploads/avatar/www.png', 'active', DATE_ADD(CURDATE(), INTERVAL 3 MONTH), '季度VIP会员'),
(5, '吴佳萍', 'wjp@qq.com', '$2a$10$UsYpJLJmPvYnLZfH7PLHpOx/xZqL7EqT3PQN9Y5FzF7NKTTFdYqOi', 'vip_short', 'vip_short', '/uploads/avatar/wjp.png', 'active', DATE_ADD(CURDATE(), INTERVAL 3 MONTH), '季度VIP会员');

-- 半年会员（6个月）
INSERT INTO `users` (id, name, email, password, role, group_id, avatar, status, expire_date, bio) VALUES
(6, '郭敏', 'gm8888@qq.com', '$2a$10$UsYpJLJmPvYnLZfH7PLHpOx/xZqL7EqT3PQN9Y5FzF7NKTTFdYqOi', 'vip_short', 'vip_short', '/uploads/avatar/gm.png', 'active', DATE_ADD(CURDATE(), INTERVAL 6 MONTH), '半年VIP会员');

-- 月度会员（1个月）
INSERT INTO `users` (id, name, email, password, role, group_id, avatar, status, expire_date, bio) VALUES
(7, '罗序祥', 'lxx@qq.com', '$2a$10$UsYpJLJmPvYnLZfH7PLHpOx/xZqL7EqT3PQN9Y5FzF7NKTTFdYqOi', 'vip_short', 'vip_short', '/uploads/avatar/lxx.png', 'active', DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '月度VIP会员'),
(8, 'Niko', '123456@qq.com', '$2a$10$UsYpJLJmPvYnLZfH7PLHpOx/xZqL7EqT3PQN9Y5FzF7NKTTFdYqOi', 'vip_short', 'vip_short', '/uploads/avatar/niko.png', 'active', DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '月度VIP会员');

-- =====================================================
-- 第4批：插入测试账号（5个，含真实用户）
-- =====================================================

-- 等风来 - 真实用户 ⭐
INSERT INTO `users` (id, name, email, password, role, group_id, avatar, status, expire_date, bio) VALUES
(9, '等风来', '625668823@qq.com', '$2a$10$UsYpJLJmPvYnLZfH7PLHpOx/xZqL7EqT3PQN9Y5FzF7NKTTFdYqOi', 'vip_mid', 'vip_mid', '/uploads/avatar/dfl.png', 'active', DATE_ADD(CURDATE(), INTERVAL 1 MONTH), 'VIP中线策略订阅用户');

-- 其他测试账号
INSERT INTO `users` (id, name, email, password, role, group_id, avatar, status, expire_date, bio) VALUES
(10, '妮儿', 'nier@test.com', '$2a$10$UsYpJLJmPvYnLZfH7PLHpOx/xZqL7EqT3PQN9Y5FzF7NKTTFdYqOi', 'vip_short', 'vip_short', '/uploads/avatar/nier.png', 'active', DATE_ADD(CURDATE(), INTERVAL 1 MONTH), 'VIP短线策略订阅用户'),
(11, '测试中线', 'test_mid@test.com', '$2a$10$UsYpJLJmPvYnLZfH7PLHpOx/xZqL7EqT3PQN9Y5FzF7NKTTFdYqOi', 'vip_mid', 'vip_mid', '/uploads/avatar/test_mid.png', 'active', DATE_ADD(CURDATE(), INTERVAL 3 MONTH), 'VIP中线测试账号'),
(12, '测试短线', 'test_short@test.com', '$2a$10$UsYpJLJmPvYnLZfH7PLHpOx/xZqL7EqT3PQN9Y5FzF7NKTTFdYqOi', 'vip_short', 'vip_short', '/uploads/avatar/test_short.png', 'active', DATE_ADD(CURDATE(), INTERVAL 3 MONTH), 'VIP短线测试账号'),
(13, '试用用户', 'trial@example.com', '$2a$10$UsYpJLJmPvYnLZfH7PLHpOx/xZqL7EqT3PQN9Y5FzF7NKTTFdYqOi', 'trial', 'trial', '/uploads/avatar/trial.png', 'active', DATE_SUB(CURDATE(), INTERVAL 1 DAY), '体验期用户（已过期）');

-- =====================================================
-- 第5批：插入AI配置（18个模型）
-- =====================================================

-- === 智谱AI (4个模型) ===
INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`, `provider`, `provider_name`, `description`, `features`, `status`, `sort_order`) VALUES
('glm-4-flash', '智谱GLM-4-Flash', '52757e59510747dca81bb32c60bfb445.l0eRqzr0XcRYKaFl', 'https://open.bigmodel.cn/api/paas/v4', '请优化以下投资研究内容', TRUE, 'ai_optimized', 'zhipu', '智谱AI', '性价比之王', '快速|低成本', 'available', 1),
('glm-4.5', '智谱GLM-4.5', '52757e59510747dca81bb32c60bfb445.l0eRqzr0XcRYKaFl', 'https://open.bigmodel.cn/api/paas/v4', '请优化以下投资研究内容', FALSE, 'ai_optimized', 'zhipu', '智谱AI', '升级版', '性能提升', 'insufficient_balance', 2),
('glm-4.7', '智谱GLM-4.7推理版', '52757e59510747dca81bb32c60bfb445.l0eRqzr0XcRYKaFl', 'https://open.bigmodel.cn/api/paas/v4', '请深度分析并优化以下投资研究内容', FALSE, 'ai_optimized', 'zhipu', '智谱AI', '推理增强版', '深度推理', 'available', 3),
('glm-5', '智谱GLM-5旗舰版', '52757e59510747dca81bb32c60bfb445.l0eRqzr0XcRYKaFl', 'https://open.bigmodel.cn/api/paas/v4', '请以最专业的投资分析师视角优化以下内容', FALSE, 'ai_optimized', 'zhipu', '智谱AI', '旗舰版', '最强性能', 'insufficient_balance', 4);

-- === 火山引擎 (4个模型) ===
INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`, `provider`, `provider_name`, `description`, `features`, `status`, `sort_order`) VALUES
('deepseek-v3-250324', 'DeepSeek-V3', 'd2d9a61f-6c5a-4f48-a7e7-364c430b0219', 'https://ark.cn-beijing.volces.com/api/v3', '请用逻辑严密的方式优化以下内容', FALSE, 'ai_optimized', 'volcengine', '火山引擎', '分析能力强', '逻辑严密', 'available', 10),
('deepseek-r1-250528', 'DeepSeek-R1深度推理', 'd2d9a61f-6c5a-4f48-a7e7-364c430b0219', 'https://ark.cn-beijing.volces.com/api/v3', '请深度分析并优化以下投资内容', FALSE, 'ai_optimized', 'volcengine', '火山引擎', '推理增强版', '深度推理', 'available', 11),
('doubao-1-5-pro-32k-250115', '豆包1.5Pro', 'd2d9a61f-6c5a-4f48-a7e7-364c430b0219', 'https://ark.cn-beijing.volces.com/api/v3', '请用通俗易懂的方式优化以下投资内容', FALSE, 'ai_optimized', 'volcengine', '火山引擎', '通俗易懂', '亲和力强', 'available', 12),
('doubao-1-5-lite-32k-250115', '豆包1.5Lite快速版', 'd2d9a61f-6c5a-4f48-a7e7-364c430b0219', 'https://ark.cn-beijing.volces.com/api/v3', '请快速优化以下内容', FALSE, 'ai_optimized', 'volcengine', '火山引擎', '快速版', '极速响应', 'available', 13);

-- === 阿里云通义千问 (10个模型) ===
INSERT INTO `ai_config` (`model_name`, `display_name`, `api_key`, `base_url`, `prompt_template`, `is_active`, `default_version`, `provider`, `provider_name`, `description`, `features`, `status`, `sort_order`) VALUES
('qwen3-max', '通义千问3-Max', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1', '请以最专业的投资分析师视角优化以下内容', FALSE, 'ai_optimized', 'aliyun', '阿里云', '旗舰版', '强大|全面', 'available', 20),
('qwen3.5-plus', '通义千问3.5-Plus', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1', '请优化以下投资研究内容', FALSE, 'ai_optimized', 'aliyun', '阿里云', '增强版', '性能均衡', 'available', 21),
('qwen3.5-flash', '通义千问3.5-Flash', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1', '请快速优化', FALSE, 'ai_optimized', 'aliyun', '阿里云', '快速版', '极速响应', 'available', 22),
('qwen-plus', '通义千问-Plus', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1', '请优化以下内容', FALSE, 'ai_optimized', 'aliyun', '阿里云', '稳定版', '稳定可靠', 'available', 23),
('qwen-turbo', '通义千问-Turbo', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1', '快速优化', FALSE, 'ai_optimized', 'aliyun', '阿里云', '极速版', '极速', 'available', 24),
('deepseek-v3', 'DeepSeek-V3(阿里云)', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1', '请深度分析并优化以下投资内容', FALSE, 'ai_optimized', 'aliyun', '阿里云', '托管版', '稳定可靠', 'available', 30),
('deepseek-r1', 'DeepSeek-R1(阿里云)', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1', '请深度推理并优化以下内容', FALSE, 'ai_optimized', 'aliyun', '阿里云', '推理版', '深度推理', 'available', 31),
('kimi-k2.5', 'Kimi-K2.5', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1', '请优化以下投资研究内容', FALSE, 'ai_optimized', 'aliyun', '阿里云', '长文本专家', '超长上下文', 'available', 32),
('MiniMax-M2.5', 'MiniMax-M2.5', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1', '请优化以下投资研究内容', FALSE, 'ai_optimized', 'aliyun', '阿里云', '创意版', '创意生成', 'available', 33),
('glm-4.7', 'GLM-4.7(阿里云)', 'sk-9bb1a10d39fc422bb488fab313d3ba23', 'https://dashscope.aliyuncs.com/compatible-mode/v1', '请优化以下投资研究内容', FALSE, 'ai_optimized', 'aliyun', '阿里云', '推理版', '推理增强', 'available', 34);

-- =====================================================
-- 第6批：插入基础系统消息
-- =====================================================

INSERT INTO `messages` (title, content, type, sender, sender_id, group_id, tags, read_count, total_count, status, theme) VALUES
('欢迎使用AITY VIP系统', '欢迎使用投研图灵室VIP系统！本系统为您提供专业的投资研究和策略分享服务。', 'system', 'admin', 1, 'all', '["全部用户"]', 0, 13, 'published', 'default'),
('风险提示', '投资有风险，入市需谨慎。请各位投资者根据自身风险承受能力，理性投资。', 'risk_warning', 'admin', 1, 'all', '["全部用户"]', 0, 13, 'published', 'default');

-- =====================================================
-- 恢复完成！验证数据
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
SELECT '📝 统一密码: tytls8888' AS '';
SELECT '👤 真实用户: 等风来 (625668823@qq.com)' AS '';
SELECT '========================================' AS '';

-- 查看用户列表
SELECT id, name, email, role FROM users ORDER BY id;

-- 查看AI配置
SELECT id, model_name, display_name, is_active FROM ai_config ORDER BY sort_order;
