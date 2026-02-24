-- ============================================
-- 创建讨论功能数据库优化脚本
-- ============================================
-- 用途：检查并优化相关数据表的索引，提升查询性能
-- 执行时间：预计 < 1秒
-- ============================================

USE `投研图灵室_test`;

-- ============================================
-- 1. 检查discussions表的现有索引
-- ============================================
SHOW INDEX FROM discussions;

-- ============================================
-- 2. 检查discussion_replies表的现有索引
-- ============================================
SHOW INDEX FROM discussion_replies;

-- ============================================
-- 3. 检查messages表的现有索引
-- ============================================
SHOW INDEX FROM messages;

-- ============================================
-- 4. 检查users表的现有索引
-- ============================================
SHOW INDEX FROM users;

-- ============================================
-- 5. 如果索引不存在，创建以下索引
-- ============================================

-- discussions表索引
-- 消息ID索引（用于按消息查询讨论）
ALTER TABLE discussions ADD INDEX idx_message_id (message_id);

-- 用户ID索引（用于按用户查询讨论）
ALTER TABLE discussions ADD INDEX idx_user_id (user_id);

-- 可见性索引（用于筛选公开/私密讨论）
ALTER TABLE discussions ADD INDEX idx_visibility (visibility);

-- 状态索引（用于按状态筛选讨论）
ALTER TABLE discussions ADD INDEX idx_status (status);

-- 复合索引（用于获取用户的某种状态的讨论）
ALTER TABLE discussions ADD INDEX idx_user_status (user_id, status);

-- 创建时间索引（用于按时间排序）
ALTER TABLE discussions ADD INDEX idx_created_at (created_at);

-- discussion_replies表索引
-- 讨论ID索引（用于获取某个讨论的所有回复）
ALTER TABLE discussion_replies ADD INDEX idx_discussion_id (discussion_id);

-- 发送者ID索引（用于查询某个用户的所有回复）
ALTER TABLE discussion_replies ADD INDEX idx_sender_id (sender_id);

-- 创建时间索引（用于按时间排序回复）
ALTER TABLE discussion_replies ADD INDEX idx_created_at (created_at);

-- messages表索引
-- 类型索引（用于按类型筛选消息）
ALTER TABLE messages ADD INDEX idx_type (type);

-- 状态索引（用于按状态筛选消息）
ALTER TABLE messages ADD INDEX idx_status (status);

-- 发布时间索引（用于按时间排序）
ALTER TABLE messages ADD INDEX idx_publish_time (publish_time);

-- ============================================
-- 6. 分析表以更新索引统计信息
-- ============================================
ANALYZE TABLE discussions;
ANALYZE TABLE discussion_replies;
ANALYZE TABLE messages;
ANALYZE TABLE users;

-- ============================================
-- 7. 检查表的存储引擎和字符集
-- ============================================
SHOW TABLE STATUS WHERE Name IN ('discussions', 'discussion_replies', 'messages', 'users');

-- ============================================
-- 8. 查看表的大小和行数
-- ============================================
SELECT
    TABLE_NAME,
    TABLE_ROWS,
    DATA_LENGTH / 1024 / 1024 AS 'Data Size (MB)',
    INDEX_LENGTH / 1024 / 1024 AS 'Index Size (MB)',
    (DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024 AS 'Total Size (MB)'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = '投研图灵室_test'
    AND TABLE_NAME IN ('discussions', 'discussion_replies', 'messages', 'users');

-- ============================================
-- 9. 测试查询性能（执行前记录时间）
-- ============================================

-- 测试1：按消息ID查询讨论
EXPLAIN SELECT * FROM discussions WHERE message_id = 1;

-- 测试2：按用户ID查询讨论
EXPLAIN SELECT * FROM discussions WHERE user_id = 1;

-- 测试3：查询公开讨论
EXPLAIN SELECT * FROM discussions WHERE visibility = 'public';

-- 测试4：查询讨论的回复
EXPLAIN SELECT * FROM discussion_replies WHERE discussion_id = 1;

-- ============================================
-- 10. 检查慢查询日志配置
-- ============================================
SHOW VARIABLES LIKE 'slow_query_log';
SHOW VARIABLES LIKE 'long_query_time';

-- 如果需要启用慢查询日志
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;  -- 记录执行超过2秒的查询

-- ============================================
-- 说明
-- ============================================
-- 1. ALTER TABLE ADD INDEX 如果索引已存在会报错，可以忽略
-- 2. 索引会占用额外磁盘空间，但能显著提升查询速度
-- 3. 写入操作（INSERT/UPDATE/DELETE）会稍微变慢
-- 4. 对于读多写少的场景，索引带来的收益远大于成本
-- 5. 建议在业务低峰期执行，避免影响生产环境
-- ============================================

-- ============================================
-- 回滚脚本（如果需要删除索引）
-- ============================================
-- USE `投研图灵室_test`;
--
-- DROP INDEX idx_message_id ON discussions;
-- DROP INDEX idx_user_id ON discussions;
-- DROP INDEX idx_visibility ON discussions;
-- DROP INDEX idx_status ON discussions;
-- DROP INDEX idx_user_status ON discussions;
-- DROP INDEX idx_created_at ON discussions;
--
-- DROP INDEX idx_discussion_id ON discussion_replies;
-- DROP INDEX idx_sender_id ON discussion_replies;
-- DROP INDEX idx_created_at ON discussion_replies;
--
-- DROP INDEX idx_type ON messages;
-- DROP INDEX idx_status ON messages;
-- DROP INDEX idx_publish_time ON messages;
-- ============================================
