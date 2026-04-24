-- 创建讨论收藏表
-- 用于存储用户收藏的讨论

CREATE TABLE IF NOT EXISTS `discussion_favorites` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL COMMENT '用户ID',
  `discussion_id` INT NOT NULL COMMENT '讨论ID',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY `unique_user_discussion` (`user_id`, `discussion_id`) COMMENT '同一用户对同一讨论只能收藏一次',
  KEY `idx_user_id` (`user_id`) COMMENT '用户ID索引',
  KEY `idx_discussion_id` (`discussion_id`) COMMENT '讨论ID索引',
  CONSTRAINT `fk_discussion_favorites_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_discussion_favorites_discussion` FOREIGN KEY (`discussion_id`) REFERENCES `discussions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='讨论收藏表';

-- 验证表是否创建成功
SELECT
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_KEY,
    EXTRA
FROM
    INFORMATION_SCHEMA.COLUMNS
WHERE
    TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'discussion_favorites'
ORDER BY
    ORDINAL_POSITION;
