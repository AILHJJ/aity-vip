CREATE TABLE IF NOT EXISTS agent_settings (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  default_agent_id VARCHAR(255) NOT NULL,
  default_agent_name VARCHAR(255) NOT NULL DEFAULT '',
  default_agent_description VARCHAR(1000) NOT NULL DEFAULT '',
  default_agent_icon VARCHAR(500) NOT NULL DEFAULT '',
  default_agent_class TINYINT NOT NULL DEFAULT 1,
  updated_by INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AITY VIP 默认 Agent 配置';

CREATE TABLE IF NOT EXISTS agent_usage_records (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  request_id VARCHAR(100) NOT NULL,
  user_id INT NOT NULL,
  agent_id VARCHAR(255) NOT NULL,
  agent_name VARCHAR(255) NOT NULL DEFAULT '',
  conversation_id VARCHAR(255) NULL,
  status ENUM('success', 'failed', 'timeout') NOT NULL DEFAULT 'failed',
  elapsed_ms INT NOT NULL DEFAULT 0,
  mcp_calls INT NOT NULL DEFAULT 0,
  error_code VARCHAR(100) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_agent_usage_request_id (request_id),
  KEY idx_agent_usage_user_created (user_id, created_at),
  KEY idx_agent_usage_agent_created (agent_id, created_at),
  KEY idx_agent_usage_status_created (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AITY VIP Agent 调用统计';
