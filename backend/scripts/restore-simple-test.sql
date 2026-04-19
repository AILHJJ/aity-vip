-- 简化版测试SQL - 先创建核心表
USE `投研图灵室_v2`;

-- 1. 用户分组表
CREATE TABLE IF NOT EXISTS `groups_table` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. 用户表
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('super_admin', 'admin', 'vip_mid', 'vip_short', 'trial') NOT NULL DEFAULT 'trial',
  `group_id` VARCHAR(50),
  `avatar` VARCHAR(100),
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `expire_date` DATE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 测试插入数据
INSERT INTO `groups_table` (id, name, description) VALUES
('all', '全部用户', '包含所有用户的组'),
('vip_mid', 'VIP中线用户', '订阅中线策略的VIP用户');

INSERT INTO `users` (name, email, password, role, group_id, status) VALUES
('超级管理员', 'admin@aity.com', '$2a$10$oVsFX087m84JIdHdCeJL7uXwCX1I5EGOPEprFp33iLuPqVC.Tcr4G', 'super_admin', 'all', 'active');

-- 验证
SELECT '数据库创建成功！' AS '状态';
SELECT COUNT(*) AS '分组数量' FROM groups_table;
SELECT COUNT(*) AS '用户数量' FROM users;
SELECT name, email, role FROM users;
