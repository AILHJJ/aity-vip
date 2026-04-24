-- ============================================
-- 创建测试数据库（投研图灵室_test）
-- 从生产库复制表结构和数据
-- 生成时间: 2026/4/19 12:42:37
-- 生产库共 10 张表
-- 
-- 使用方法：在宝塔面板 → phpMyAdmin 中以 root 身份执行
-- 或在服务器上执行: mysql -u root -p < create-test-db.sql
-- ============================================

DROP DATABASE IF EXISTS `投研图灵室_test`;
CREATE DATABASE `投研图灵室_test` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `投研图灵室_test`.`ai_config` LIKE `投研图灵室`.`ai_config`;
INSERT INTO `投研图灵室_test`.`ai_config` SELECT * FROM `投研图灵室`.`ai_config`;

CREATE TABLE `投研图灵室_test`.`discussions` LIKE `投研图灵室`.`discussions`;
INSERT INTO `投研图灵室_test`.`discussions` SELECT * FROM `投研图灵室`.`discussions`;

CREATE TABLE `投研图灵室_test`.`discussion_favorites` LIKE `投研图灵室`.`discussion_favorites`;
INSERT INTO `投研图灵室_test`.`discussion_favorites` SELECT * FROM `投研图灵室`.`discussion_favorites`;

CREATE TABLE `投研图灵室_test`.`discussion_replies` LIKE `投研图灵室`.`discussion_replies`;
INSERT INTO `投研图灵室_test`.`discussion_replies` SELECT * FROM `投研图灵室`.`discussion_replies`;

CREATE TABLE `投研图灵室_test`.`groups_table` LIKE `投研图灵室`.`groups_table`;
INSERT INTO `投研图灵室_test`.`groups_table` SELECT * FROM `投研图灵室`.`groups_table`;

CREATE TABLE `投研图灵室_test`.`messages` LIKE `投研图灵室`.`messages`;
INSERT INTO `投研图灵室_test`.`messages` SELECT * FROM `投研图灵室`.`messages`;

CREATE TABLE `投研图灵室_test`.`message_attachments` LIKE `投研图灵室`.`message_attachments`;
INSERT INTO `投研图灵室_test`.`message_attachments` SELECT * FROM `投研图灵室`.`message_attachments`;

CREATE TABLE `投研图灵室_test`.`users` LIKE `投研图灵室`.`users`;
INSERT INTO `投研图灵室_test`.`users` SELECT * FROM `投研图灵室`.`users`;

CREATE TABLE `投研图灵室_test`.`user_favorites` LIKE `投研图灵室`.`user_favorites`;
INSERT INTO `投研图灵室_test`.`user_favorites` SELECT * FROM `投研图灵室`.`user_favorites`;

CREATE TABLE `投研图灵室_test`.`user_message_reads` LIKE `投研图灵室`.`user_message_reads`;
INSERT INTO `投研图灵室_test`.`user_message_reads` SELECT * FROM `投研图灵室`.`user_message_reads`;

-- 授权用户访问测试库
GRANT ALL PRIVILEGES ON `投研图灵室_test`.* TO '投研图灵室'@'58.49.104.171';
GRANT ALL PRIVILEGES ON `投研图灵室_test`.* TO '投研图灵室'@'localhost';
GRANT ALL PRIVILEGES ON `投研图灵室_test`.* TO '投研图灵室'@'%';
FLUSH PRIVILEGES;

-- 验证
SELECT '测试数据库创建完成！' AS status;
SELECT TABLE_NAME, TABLE_ROWS FROM information_schema.tables WHERE table_schema = '投研图灵室_test';
