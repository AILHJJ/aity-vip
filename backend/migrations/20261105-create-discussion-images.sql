-- 新增受保护的讨论图片元数据；不改写 discussions 或历史图片。
CREATE TABLE IF NOT EXISTS `discussion_images` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `filename` VARCHAR(80) NOT NULL,
  `user_id` INT NOT NULL,
  `discussion_id` INT NULL DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_discussion_images_filename` (`filename`),
  KEY `idx_discussion_images_user_discussion` (`user_id`, `discussion_id`),
  KEY `idx_discussion_images_discussion` (`discussion_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
