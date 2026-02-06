-- =====================================================
-- AITY VIP 测试数据验证脚本
-- =====================================================
-- 用途：验证测试数据是否正确插入
-- 执行时机：在 complete-test-data-with-hash.sql 执行后
-- =====================================================

-- =====================================================
-- 1. 数据库连接验证
-- =====================================================
SELECT '========================================' AS '';
SELECT '1. 数据库连接验证' AS '';
SELECT '========================================' AS '';
SELECT DATABASE() AS current_database;
SELECT VERSION() AS mysql_version;
SELECT NOW() AS current_time;

-- =====================================================
-- 2. 用户数据验证
-- =====================================================
SELECT '========================================' AS '';
SELECT '2. 用户数据验证' AS '';
SELECT '========================================' AS '';

-- 用户总数
SELECT '用户总数' AS check_item, COUNT(*) AS count FROM users;

-- 按角色统计
SELECT
  role AS 用户角色,
  COUNT(*) AS 数量,
  GROUP_CONCAT(name) AS 用户名列表
FROM users
GROUP BY role
ORDER BY role;

-- 用户状态统计
SELECT
  status AS 用户状态,
  COUNT(*) AS 数量
FROM users
GROUP BY status;

-- 过期用户
SELECT
  '过期用户' AS check_item,
  COUNT(*) AS count,
  GROUP_CONCAT(CONCAT(name, '(', email, ')')) AS users
FROM users
WHERE expire_date IS NOT NULL AND expire_date < NOW();

-- 活跃用户
SELECT
  '活跃用户' AS check_item,
  COUNT(*) AS count,
  GROUP_CONCAT(CONCAT(name, '(', email, ')')) AS users
FROM users
WHERE status = 'active' AND (expire_date IS NULL OR expire_date > NOW());

-- =====================================================
-- 3. 消息数据验证
-- =====================================================
SELECT '========================================' AS '';
SELECT '3. 消息数据验证' AS '';
SELECT '========================================' AS '';

-- 消息总数
SELECT '消息总数' AS check_item, COUNT(*) AS count FROM messages;

-- 按类型统计
SELECT
  type AS 消息类型,
  COUNT(*) AS 数量,
  GROUP_CONCAT(title) AS 消息列表
FROM messages
GROUP BY type
ORDER BY type;

-- 按状态统计
SELECT
  status AS 消息状态,
  COUNT(*) AS 数量
FROM messages
GROUP BY status;

-- 按分组统计
SELECT
  group_id AS 用户组,
  COUNT(*) AS 消息数量
FROM messages
GROUP BY group_id
ORDER BY group_id;

-- 定时发布的消息
SELECT
  '定时发布消息' AS check_item,
  COUNT(*) AS count,
  GROUP_CONCAT(title) AS messages
FROM messages
WHERE status = 'scheduled';

-- 草稿消息
SELECT
  '草稿消息' AS check_item,
  COUNT(*) AS count,
  GROUP_CONCAT(title) AS messages
FROM messages
WHERE status = 'draft';

-- =====================================================
-- 4. 讨论数据验证
-- =====================================================
SELECT '========================================' AS '';
SELECT '4. 讨论数据验证' AS '';
SELECT '========================================' AS '';

-- 讨论总数
SELECT '讨论总数' AS check_item, COUNT(*) AS count FROM discussions;

-- 按状态统计
SELECT
  status AS 讨论状态,
  COUNT(*) AS 数量
FROM discussions
GROUP BY status;

-- 按可见性统计
SELECT
  visibility AS 可见性,
  COUNT(*) AS 数量
FROM discussions
GROUP BY visibility;

-- 交叉统计
SELECT
  status AS 状态,
  visibility AS 可见性,
  COUNT(*) AS 数量
FROM discussions
GROUP BY status, visibility;

-- =====================================================
-- 5. 讨论回复验证
-- =====================================================
SELECT '========================================' AS '';
SELECT '5. 讨论回复验证' AS '';
SELECT '========================================' AS '';

-- 回复总数
SELECT '回复总数' AS check_item, COUNT(*) AS count FROM discussion_replies;

-- 每个讨论的回复数
SELECT
  d.id AS 讨论ID,
  d.title AS 讨论标题,
  COUNT(r.id) AS 回复数量,
  GROUP_CONCAT(r.sender_name) AS 回复者列表
FROM discussions d
LEFT JOIN discussion_replies r ON d.id = r.discussion_id
GROUP BY d.id, d.title
ORDER BY d.id;

-- =====================================================
-- 6. 用户收藏验证
-- =====================================================
SELECT '========================================' AS '';
SELECT '6. 用户收藏验证' AS '';
SELECT '========================================' AS '';

-- 收藏总数
SELECT '收藏总数' AS check_item, COUNT(*) AS count FROM user_favorites;

-- 每个用户的收藏数
SELECT
  u.name AS 用户名,
  u.email AS 邮箱,
  COUNT(f.id) AS 收藏数量
FROM users u
LEFT JOIN user_favorites f ON u.id = f.user_id
GROUP BY u.id, u.name, u.email
ORDER BY COUNT(f.id) DESC;

-- 收藏最多的消息
SELECT
  m.title AS 消息标题,
  COUNT(f.id) AS 收藏次数
FROM messages m
INNER JOIN user_favorites f ON m.id = f.message_id
GROUP BY m.id, m.title
ORDER BY COUNT(f.id) DESC;

-- =====================================================
-- 7. 已读记录验证
-- =====================================================
SELECT '========================================' AS '';
SELECT '7. 已读记录验证' AS '';
SELECT '========================================' AS '';

-- 已读记录总数
SELECT '已读记录总数' AS check_item, COUNT(*) AS count FROM user_message_reads;

-- 每个用户的已读数
SELECT
  u.name AS 用户名,
  COUNT(r.id) AS 已读消息数
FROM users u
LEFT JOIN user_message_reads r ON u.id = r.user_id
GROUP BY u.id, u.name
ORDER BY COUNT(r.id) DESC;

-- 每条消息的已读数
SELECT
  m.id AS 消息ID,
  m.title AS 消息标题,
  m.read_count AS 应读数,
  COUNT(r.id) AS 实际已读数,
  CASE
    WHEN m.read_count = COUNT(r.id) THEN '✓ 正确'
    ELSE '✗ 不一致'
  END AS 状态
FROM messages m
LEFT JOIN user_message_reads r ON m.id = r.message_id
GROUP BY m.id, m.title, m.read_count
ORDER BY m.id;

-- =====================================================
-- 8. 消息附件验证
-- =====================================================
SELECT '========================================' AS '';
SELECT '8. 消息附件验证' AS '';
SELECT '========================================' AS '';

-- 附件总数
SELECT '附件总数' AS check_item, COUNT(*) AS count FROM message_attachments;

-- 按类型统计
SELECT
  type AS 附件类型,
  COUNT(*) AS 数量
FROM message_attachments
GROUP BY type;

-- 每条消息的附件数
SELECT
  m.title AS 消息标题,
  COUNT(a.id) AS 附件数量,
  GROUP_CONCAT(a.name) AS 附件列表
FROM messages m
LEFT JOIN message_attachments a ON m.id = a.message_id
GROUP BY m.id, m.title
HAVING COUNT(a.id) > 0
ORDER BY m.id;

-- =====================================================
-- 9. 数据完整性验证
-- =====================================================
SELECT '========================================' AS '';
SELECT '9. 数据完整性验证' AS '';
SELECT '========================================' AS '';

-- 检查孤立讨论（消息不存在）
SELECT
  '孤立讨论' AS check_item,
  COUNT(*) AS count,
  GROUP_CONCAT(id) AS discussion_ids
FROM discussions
WHERE message_id NOT IN (SELECT id FROM messages);

-- 检查孤立回复（讨论不存在）
SELECT
  '孤立回复' AS check_item,
  COUNT(*) AS count,
  GROUP_CONCAT(id) AS reply_ids
FROM discussion_replies
WHERE discussion_id NOT IN (SELECT id FROM discussions);

-- 检查孤立收藏（用户不存在）
SELECT
  '孤立收藏(用户)' AS check_item,
  COUNT(*) AS count
FROM user_favorites
WHERE user_id NOT IN (SELECT id FROM users);

-- 检查孤立收藏（消息不存在）
SELECT
  '孤立收藏(消息)' AS check_item,
  COUNT(*) AS count
FROM user_favorites
WHERE message_id NOT IN (SELECT id FROM messages);

-- 检查孤立附件（消息不存在）
SELECT
  '孤立附件' AS check_item,
  COUNT(*) AS count,
  GROUP_CONCAT(id) AS attachment_ids
FROM message_attachments
WHERE message_id NOT IN (SELECT id FROM messages);

-- =====================================================
-- 10. 综合统计
-- =====================================================
SELECT '========================================' AS '';
SELECT '10. 综合统计' AS '';
SELECT '========================================' AS '';

SELECT
  '用户' AS 数据类型,
  COUNT(*) AS 数量,
  '个测试账号' AS 说明
FROM users
UNION ALL
SELECT
  '消息',
  COUNT(*),
  '条消息（覆盖10种类型）'
FROM messages
UNION ALL
SELECT
  '讨论',
  COUNT(*),
  '个讨论（公开+私密）'
FROM discussions
UNION ALL
SELECT
  '回复',
  COUNT(*),
  '条讨论回复'
FROM discussion_replies
UNION ALL
SELECT
  '收藏',
  COUNT(*),
  '条收藏记录'
FROM user_favorites
UNION ALL
SELECT
  '已读',
  COUNT(*),
  '条已读记录'
FROM user_message_reads
UNION ALL
SELECT
  '附件',
  COUNT(*),
  '个消息附件'
FROM message_attachments;

-- =====================================================
-- 11. 验证完成
-- =====================================================
SELECT '========================================' AS '';
SELECT '验证完成！' AS '';
SELECT '========================================' AS '';
SELECT
  CASE
    WHEN (SELECT COUNT(*) FROM users) = 6 THEN '✓ 用户数据正确'
    ELSE CONCAT('✗ 用户数据异常，预期6个，实际', (SELECT COUNT(*) FROM users), '个')
  END AS 验证结果
UNION ALL
SELECT
  CASE
    WHEN (SELECT COUNT(*) FROM messages) >= 19 THEN '✓ 消息数据正确'
    ELSE CONCAT('✗ 消息数据异常，预期>=19条，实际', (SELECT COUNT(*) FROM messages), '条')
  END
UNION ALL
SELECT
  CASE
    WHEN (SELECT COUNT(*) FROM discussions) = 10 THEN '✓ 讨论数据正确'
    ELSE CONCAT('✗ 讨论数据异常，预期10个，实际', (SELECT COUNT(*) FROM discussions), '个')
  END
UNION ALL
SELECT
  CASE
    WHEN (SELECT COUNT(*) FROM discussion_replies) = 16 THEN '✓ 回复数据正确'
    ELSE CONCAT('✗ 回复数据异常，预期16条，实际', (SELECT COUNT(*) FROM discussion_replies), '条')
  END;

-- =====================================================
-- 12. 测试账号信息
-- =====================================================
SELECT '========================================' AS '';
SELECT '测试账号信息' AS '';
SELECT '========================================' AS '';

SELECT
  id AS 序号,
  name AS 用户名,
  email AS 邮箱,
  role AS 角色,
  status AS 状态,
  CASE
    WHEN expire_date IS NULL THEN '永不过期'
    WHEN expire_date > NOW() THEN CONCAT('有效期至: ', DATE(expire_date))
    ELSE '已过期'
  END AS 过期信息
FROM users
ORDER BY id;

SELECT '所有账号密码统一为: 123456' AS '密码提示';
