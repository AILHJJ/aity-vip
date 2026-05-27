-- ============================================
-- 投研图灵室_test 测试数据库创建脚本
-- 执行方式: 登录MySQL后执行 SOURCE create-test-db.sql
-- ============================================

-- 创建测试数据库
CREATE DATABASE IF NOT EXISTS `投研图灵室_test` 
    DEFAULT CHARACTER SET utf8mb4 
    DEFAULT COLLATE utf8mb4_unicode_ci;

-- 使用测试数据库
USE `投研图灵室_test`;

-- ============================================
-- 用户表
-- ============================================
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    `password` VARCHAR(255) NOT NULL COMMENT '密码(加密)',
    `nickname` VARCHAR(50) COMMENT '昵称',
    `avatar` VARCHAR(500) COMMENT '头像URL',
    `phone` VARCHAR(20) COMMENT '手机号',
    `role` ENUM('admin', 'user', 'vip') DEFAULT 'user' COMMENT '角色',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 0禁用 1启用',
    `last_login_at` DATETIME COMMENT '最后登录时间',
    `last_login_ip` VARCHAR(50) COMMENT '最后登录IP',
    `login_count` INT DEFAULT 0 COMMENT '登录次数',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` DATETIME COMMENT '软删除时间',
    INDEX `idx_username` (`username`),
    INDEX `idx_role` (`role`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- ============================================
-- 消息分类表
-- ============================================
CREATE TABLE IF NOT EXISTS `message_categories` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL COMMENT '分类名称',
    `icon` VARCHAR(100) COMMENT '图标',
    `color` VARCHAR(20) DEFAULT '#666666' COMMENT '颜色',
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    `status` TINYINT DEFAULT 1 COMMENT '状态',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='消息分类表';

-- ============================================
-- 消息表
-- ============================================
CREATE TABLE IF NOT EXISTS `messages` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL COMMENT '标题',
    `content` TEXT COMMENT '内容',
    `summary` VARCHAR(500) COMMENT '摘要',
    `category_id` INT COMMENT '分类ID',
    `sender_id` INT COMMENT '发送者ID',
    `tags` JSON COMMENT '标签数组',
    `attachments` JSON COMMENT '附件JSON数组',
    `is_pinned` TINYINT DEFAULT 0 COMMENT '是否置顶',
    `is_featured` TINYINT DEFAULT 0 COMMENT '是否精选',
    `view_count` INT DEFAULT 0 COMMENT '浏览次数',
    `like_count` INT DEFAULT 0 COMMENT '点赞次数',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 0草稿 1发布',
    `publish_at` DATETIME COMMENT '发布时间',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` DATETIME COMMENT '软删除时间',
    INDEX `idx_category` (`category_id`),
    INDEX `idx_sender` (`sender_id`),
    INDEX `idx_publish_at` (`publish_at`),
    INDEX `idx_status` (`status`),
    FULLTEXT INDEX `ft_title_content` (`title`, `content`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='消息表';

-- ============================================
-- 消息附件表
-- ============================================
CREATE TABLE IF NOT EXISTS `message_attachments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `message_id` INT NOT NULL COMMENT '消息ID',
    `file_name` VARCHAR(255) NOT NULL COMMENT '文件名',
    `file_url` VARCHAR(500) NOT NULL COMMENT '文件URL',
    `file_type` VARCHAR(50) COMMENT '文件类型',
    `file_size` INT COMMENT '文件大小(字节)',
    `file_path` VARCHAR(500) COMMENT '存储路径',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_message` (`message_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='消息附件表';

-- ============================================
-- 用户消息阅读记录表
-- ============================================
CREATE TABLE IF NOT EXISTS `user_message_reads` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL COMMENT '用户ID',
    `message_id` INT NOT NULL COMMENT '消息ID',
    `read_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '阅读时间',
    UNIQUE KEY `uk_user_message` (`user_id`, `message_id`),
    INDEX `idx_user` (`user_id`),
    INDEX `idx_message` (`message_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户消息阅读记录表';

-- ============================================
-- 用户收藏表
-- ============================================
CREATE TABLE IF NOT EXISTS `user_favorites` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL COMMENT '用户ID',
    `message_id` INT NOT NULL COMMENT '消息ID',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_user_favorite` (`user_id`, `message_id`),
    INDEX `idx_user` (`user_id`),
    INDEX `idx_message` (`message_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户收藏表';

-- ============================================
-- 讨论表
-- ============================================
CREATE TABLE IF NOT EXISTS `discussions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `message_id` INT NOT NULL COMMENT '关联消息ID',
    `user_id` INT NOT NULL COMMENT '用户ID',
    `content` TEXT NOT NULL COMMENT '讨论内容',
    `parent_id` INT COMMENT '父讨论ID(回复)',
    `like_count` INT DEFAULT 0 COMMENT '点赞数',
    `reply_count` INT DEFAULT 0 COMMENT '回复数',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 0删除 1正常',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` DATETIME COMMENT '软删除时间',
    INDEX `idx_message` (`message_id`),
    INDEX `idx_user` (`user_id`),
    INDEX `idx_parent` (`parent_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='讨论表';

-- ============================================
-- 讨论回复表
-- ============================================
CREATE TABLE IF NOT EXISTS `discussion_replies` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `discussion_id` INT NOT NULL COMMENT '讨论ID',
    `user_id` INT NOT NULL COMMENT '用户ID',
    `content` TEXT NOT NULL COMMENT '回复内容',
    `like_count` INT DEFAULT 0 COMMENT '点赞数',
    `status` TINYINT DEFAULT 1 COMMENT '状态',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` DATETIME COMMENT '软删除时间',
    INDEX `idx_discussion` (`discussion_id`),
    INDEX `idx_user` (`user_id`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='讨论回复表';

-- ============================================
-- 讨论收藏表
-- ============================================
CREATE TABLE IF NOT EXISTS `discussion_favorites` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL COMMENT '用户ID',
    `discussion_id` INT NOT NULL COMMENT '讨论ID',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_user_discussion` (`user_id`, `discussion_id`),
    INDEX `idx_user` (`user_id`),
    INDEX `idx_discussion` (`discussion_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='讨论收藏表';

-- ============================================
-- 分组表
-- ============================================
CREATE TABLE IF NOT EXISTS `groups` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL COMMENT '分组名称',
    `icon` VARCHAR(100) COMMENT '图标',
    `color` VARCHAR(20) DEFAULT '#666666' COMMENT '颜色',
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    `status` TINYINT DEFAULT 1 COMMENT '状态',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分组表';

-- ============================================
-- AI配置表
-- ============================================
CREATE TABLE IF NOT EXISTS `ai_configs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT COMMENT '用户ID(NULL表示全局配置)',
    `config_key` VARCHAR(100) NOT NULL COMMENT '配置键',
    `config_value` TEXT COMMENT '配置值',
    `description` VARCHAR(255) COMMENT '描述',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_user_config` (`user_id`, `config_key`),
    INDEX `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI配置表';

-- ============================================
-- 插入测试数据
-- ============================================

-- 测试用户 (密码: 123456)
INSERT INTO `users` (`username`, `password`, `nickname`, `role`, `status`) VALUES
('test001', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4H0VwuZm/0xqT5h.F3wOqF5K2yK', '测试用户001', 'user', 1),
('test002', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4H0VwuZm/0xqT5h.F3wOqF5K2yK', '测试用户002', 'vip', 1),
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4H0VwuZm/0xqT5h.F3wOqF5K2yK', '管理员', 'admin', 1);

-- 测试分类
INSERT INTO `message_categories` (`name`, `icon`, `color`, `sort_order`) VALUES
('技术分析', '📊', '#3b82f6', 1),
('基本面', '📈', '#10b981', 2),
('消息面', '📰', '#f59e0b', 3),
('风险提示', '⚠️', '#ef4444', 4);

-- 测试消息
INSERT INTO `messages` (`title`, `content`, `summary`, `category_id`, `sender_id`, `tags`, `status`, `publish_at`, `view_count`) VALUES
('测试消息001', '这是一条测试消息内容，用于验证系统功能是否正常。', '测试摘要001', 1, 3, '["测试", "技术"]', 1, NOW(), 100),
('测试消息002', '第二条测试消息，包含更多内容用于测试。', '测试摘要002', 2, 3, '["测试"]', 1, NOW(), 50);

-- 测试讨论
INSERT INTO `discussions` (`message_id`, `user_id`, `content`, `status`) VALUES
(1, 1, '这是一条测试讨论', 1),
(1, 2, '回复测试讨论', 1);

-- ============================================
-- 完成提示
-- ============================================
SELECT '========================================' AS '';
SELECT '✅ 测试数据库创建成功!' AS '';
SELECT '========================================' AS '';
SELECT '数据库名称: 投研图灵室_test' AS '';
SELECT '测试账号: test001 / 123456' AS '';
SELECT '========================================' AS '';
