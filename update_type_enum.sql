-- 添加 position_handle 到 messages.type ENUM
ALTER TABLE messages MODIFY COLUMN type ENUM('position_handle','pre_market_comment','morning_comment','morning_focus','afternoon_comment','afternoon_focus','close_comment','risk_warning','system','important','daily') NOT NULL DEFAULT 'daily';
