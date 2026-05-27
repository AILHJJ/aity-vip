-- 数据库索引优化脚本
-- 执行前请备份数据库

-- 用户表索引优化
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_group_id ON users(group_id);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- 消息表索引优化
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(type);
CREATE INDEX IF NOT EXISTS idx_messages_group_id ON messages(group_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);

-- 讨论表索引优化
CREATE INDEX IF NOT EXISTS idx_discussions_group_id ON discussions(group_id);
CREATE INDEX IF NOT EXISTS idx_discussions_author_id ON discussions(author_id);
CREATE INDEX IF NOT EXISTS idx_discussions_created_at ON discussions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_discussions_status ON discussions(status);

-- 分组表索引优化
CREATE INDEX IF NOT EXISTS idx_groups_name ON groups(name);
CREATE INDEX IF NOT EXISTS idx_groups_created_at ON groups(created_at DESC);

-- 消息附件表索引优化
CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_message_attachments_type ON message_attachments(type);

-- 讨论回复表索引优化
CREATE INDEX IF NOT EXISTS idx_discussion_replies_discussion_id ON discussion_replies(discussion_id);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_author_id ON discussion_replies(author_id);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_created_at ON discussion_replies(created_at DESC);

-- 用户消息阅读表索引优化（已存在唯一索引，无需重复创建）

-- 用户收藏表索引优化（已存在唯一索引，无需重复创建）

-- 查看索引创建结果
SHOW INDEX FROM users;
SHOW INDEX FROM messages;
SHOW INDEX FROM discussions;
SHOW INDEX FROM groups;
SHOW INDEX FROM message_attachments;
SHOW INDEX FROM discussion_replies;
SHOW INDEX FROM user_message_reads;
SHOW INDEX FROM user_favorites;
