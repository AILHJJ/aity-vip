-- =====================================================
-- AITY VIP 项目完整测试数据 SQL 脚本
-- =====================================================
-- 说明：
-- 1. 本脚本用于创建完整的测试数据，覆盖所有功能场景
-- 2. 包含清理旧数据、创建测试数据两个步骤
-- 3. 测试账号密码统一为：123456（bcrypt加密）
-- 4. 支持的功能测试：用户权限、消息标签、讨论回复、收藏、已读状态等
-- =====================================================

-- =====================================================
-- 第一部分：清理旧数据（可选）
-- =====================================================
-- 注意：根据需要决定是否执行以下清理语句
-- =====================================================

-- SET FOREIGN_KEY_CHECKS = 0;

-- -- 清理数据（按照依赖关系倒序）
-- DELETE FROM discussion_replies;
-- DELETE FROM discussions;
-- DELETE FROM user_favorites;
-- DELETE FROM user_message_reads;
-- DELETE FROM message_attachments;
-- DELETE FROM messages;
-- DELETE FROM users;
-- DELETE FROM groups_table;

-- SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 第二部分：创建测试数据
-- =====================================================

-- =====================================================
-- 1. 用户分组数据（groups_table）
-- =====================================================
INSERT INTO groups_table (id, name, description) VALUES
('all', '全部用户', '包含所有用户的组'),
('vip_mid', 'VIP中线用户', '订阅中线策略的VIP用户'),
('vip_short', 'VIP短线用户', '订阅短线策略的VIP用户'),
('trial', '试用用户', '体验期用户')
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description);

-- =====================================================
-- 2. 测试用户数据（users）
-- =====================================================
-- 密码：123456 的bcrypt哈希值
-- 生成命令：bcrypt.hash('123456', 10)
INSERT INTO users (id, name, email, password, role, group_id, avatar, status, expire_date, created_at, updated_at) VALUES
-- 超级管理员
(1, '超级管理员', 'admin@aity.com', '$2a$10$YourHashedPasswordHere', 'super_admin', 'all', '/uploads/avatar/admin.png', 'active', NULL, NOW(), NOW()),
-- 普通管理员
(2, '管理员', 'manager@aity.com', '$2a$10$YourHashedPasswordHere', 'admin', 'all', '/uploads/avatar/manager.png', 'active', NULL, NOW(), NOW()),
-- VIP中线用户（未过期）
(3, '中线VIP用户', 'vip_mid@aity.com', '$2a$10$YourHashedPasswordHere', 'vip_mid', 'vip_mid', '/uploads/avatar/vip_mid.png', 'active', DATE_ADD(NOW(), INTERVAL 365 DAY), NOW(), NOW()),
-- VIP短线用户（未过期）
(4, '短线VIP用户', 'vip_short@aity.com', '$2a$10$YourHashedPasswordHere', 'vip_short', 'vip_short', '/uploads/avatar/vip_short.png', 'active', DATE_ADD(NOW(), INTERVAL 365 DAY), NOW(), NOW()),
-- 体验用户（已过期）
(5, '试用用户', 'trial@aity.com', '$2a$10$YourHashedPasswordHere', 'trial', 'trial', '/uploads/avatar/trial.png', 'active', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW(), NOW()),
-- 新测试用户
(6, '测试用户', 'vip_test@aity.com', '$2a$10$YourHashedPasswordHere', 'vip_mid', 'vip_mid', '/uploads/avatar/test.png', 'active', DATE_ADD(NOW(), INTERVAL 180 DAY), NOW(), NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  password = VALUES(password),
  role = VALUES(role),
  group_id = VALUES(group_id),
  status = VALUES(status),
  expire_date = VALUES(expire_date),
  updated_at = NOW();

-- =====================================================
-- 3. 消息数据（messages）
-- =====================================================

-- 3.1 全部用户可见消息（标签：["全部用户"]）
INSERT INTO messages (id, title, content, type, sender, sender_id, group_id, tags, read_count, total_count, status, created_at) VALUES
-- 盘前点评
(1, '盘前点评：市场情绪回暖，关注科技板块',
'今日盘前分析：隔夜美股三大指数集体收涨，科技股表现强劲。A股市场预计将延续反弹态势，重点关注科技、新能源等板块机会。',
'pre_market_comment', '超级管理员', 1, 'all', '["全部用户"]', 5, 5, 'published',
DATE_SUB(NOW(), INTERVAL 2 HOUR)),

-- 早盘点评
(2, '早盘点评：开盘平稳，科技股领涨',
'早盘市场表现平稳，科技板块表现活跃，芯片、人工智能概念股涨幅居前。建议关注相关龙头股的交易机会。',
'morning_comment', '超级管理员', 1, 'all', '["全部用户"]', 4, 5, 'published',
DATE_SUB(NOW(), INTERVAL 1 HOUR)),

-- 风险提示
(3, '风险提示：注意市场波动风险',
'近期市场波动加大，请各位投资者注意控制仓位，做好风险管理。建议设置止损位，避免追高。',
'risk_warning', '超级管理员', 1, 'all', '["全部用户"]', 5, 5, 'published',
DATE_SUB(NOW(), INTERVAL 3 HOUR)),

-- 系统消息
(4, '系统消息：平台维护通知',
'系统将于本周六凌晨2:00-4:00进行例行维护，届时将暂停服务。请各位用户提前做好安排。',
'system', '管理员', 2, 'all', '["全部用户"]', 5, 5, 'published',
DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- 重要消息
(5, '重要消息：央行降准政策解读',
'央行宣布降准0.5个百分点，释放长期资金约1万亿元。这将有利于降低实体经济融资成本，提振市场信心。',
'important', '超级管理员', 1, 'all', '["全部用户"]', 5, 5, 'published',
DATE_SUB(NOW(), INTERVAL 6 HOUR))
ON DUPLICATE KEY UPDATE content = VALUES(content), updated_at = NOW();

-- 3.2 VIP中线专属消息（标签：["中线策略"]）
INSERT INTO messages (id, title, content, type, sender, sender_id, group_id, tags, read_count, total_count, status, created_at) VALUES
(6, '中线策略：新能源板块布局机会',
'从中长期角度看，新能源行业仍处于高速发展期。建议关注光伏、储能、新能源汽车产业链的优质标的，适合中线布局。',
'important', '超级管理员', 1, 'vip_mid', '["中线策略"]', 2, 2, 'published',
DATE_SUB(NOW(), INTERVAL 5 HOUR)),

(7, '中线持仓：医药板块价值分析',
'医药板块经过前期调整，估值已回到合理区间。创新药、医疗器械等细分领域具备中长期投资价值，建议逢低布局。',
'daily', '管理员', 2, 'vip_mid', '["中线策略"]', 2, 2, 'published',
DATE_SUB(NOW(), INTERVAL 4 HOUR)),

(8, '收盘点评：中线持仓策略调整',
'今日市场震荡整理，中线持仓建议保持耐心。重点关注业绩稳定、估值合理的优质标的，避免频繁交易。',
'close_comment', '超级管理员', 1, 'vip_mid', '["中线策略"]', 2, 2, 'published',
DATE_SUB(NOW(), INTERVAL 30 MINUTE)),

(9, '中线关注：消费板块价值投资',
'消费板块经过持续调整，部分优质标的已具备投资价值。建议关注白酒、家电、食品饮料等细分龙头。',
'morning_focus', '管理员', 2, 'vip_mid', '["中线策略"]', 1, 2, 'published',
NOW())
ON DUPLICATE KEY UPDATE content = VALUES(content), updated_at = NOW();

-- 3.3 VIP短线专属消息（标签：["短线策略"]）
INSERT INTO messages (id, title, content, type, sender, sender_id, group_id, tags, read_count, total_count, status, created_at) VALUES
(10, '早盘关注：热点题材短线机会',
'今日关注AI概念、数字经济等热点题材。重点标的：XXX、YYY、ZZZ。建议快进快出，严格止损。',
'morning_focus', '超级管理员', 1, 'vip_short', '["短线策略"]', 2, 2, 'published',
DATE_SUB(NOW(), INTERVAL 1 HOUR)),

(11, '尾盘关注：短线强势股跟踪',
'尾盘关注今日强势股的持续性。XXX股午后放量上涨，有望继续冲高。建议关注尾盘走势，择机介入。',
'afternoon_focus', '管理员', 2, 'vip_short', '["短线策略"]', 2, 2, 'published',
DATE_SUB(NOW(), INTERVAL 15 MINUTE)),

(12, '尾盘点评：短线操作总结',
'今日短线操作回顾：AI概念股表现活跃，XXX涨停。明日继续关注板块轮动机会，保持灵活操作。',
'afternoon_comment', '超级管理员', 1, 'vip_short', '["短线策略"]', 2, 2, 'published',
NOW())
ON DUPLICATE KEY UPDATE content = VALUES(content), updated_at = NOW();

-- 3.4 混合标签消息（多种标签组合）
INSERT INTO messages (id, title, content, type, sender, sender_id, group_id, tags, read_count, total_count, status, created_at) VALUES
(13, '重要提示：市场风格切换信号',
'近期市场风格出现切换迹象，成长股表现强于价值股。中线投资者可适当调整持仓结构，短线投资者注意把握轮动机会。',
'important', '超级管理员', 1, 'all', '["全部用户", "中线策略", "短线策略"]', 5, 5, 'published',
DATE_SUB(NOW(), INTERVAL 8 HOUR)),

(14, '日常消息：本周市场展望',
'本周市场预计将维持震荡格局，关注政策面和资金面变化。中线投资者保持耐心，短线投资者注意控制仓位。',
'daily', '超级管理员', 1, 'all', '["全部用户", "中线策略", "短线策略"]', 5, 5, 'published',
DATE_SUB(NOW(), INTERVAL 12 HOUR)),

(15, '午盘点评：市场震荡整理',
'上午市场维持震荡格局，成交量略有放大。板块方面，科技、医药领涨，金融、地产调整。建议控制仓位，等待明确信号。',
'afternoon_comment', '管理员', 2, 'vip_mid', '["中线策略", "全部用户"]', 3, 3, 'published',
DATE_SUB(NOW(), INTERVAL 45 MINUTE)),

(16, '早盘点评：指数高开高走',
'今日两市指数高开高走，市场情绪有所恢复。建议关注成交量变化和板块轮动情况。',
'morning_comment', '超级管理员', 1, 'vip_short', '["短线策略", "全部用户"]', 2, 2, 'published',
DATE_SUB(NOW(), INTERVAL 90 MINUTE))
ON DUPLICATE KEY UPDATE content = VALUES(content), updated_at = NOW();

-- 3.5 不同消息类型的消息（覆盖所有类型）
INSERT INTO messages (id, title, content, type, sender, sender_id, group_id, tags, read_count, total_count, status, created_at) VALUES
-- 已有类型：pre_market_comment, morning_comment, risk_warning, system, important, daily, morning_focus, afternoon_focus, afternoon_comment, close_comment
-- 补充更多类型的消息
(17, '市场热点：数字经济政策利好',
'国家发改委等部门发布数字经济相关政策，云计算、大数据、人工智能等板块迎来发展机遇。',
'important', '超级管理员', 1, 'all', '["全部用户"]', 5, 5, 'published',
DATE_SUB(NOW(), INTERVAL 10 HOUR)),

(18, '盘中点评：板块轮动加快',
'上午板块轮动明显加快，资金在科技、新能源、消费等板块间快速切换。建议关注持续性较好的板块。',
'afternoon_comment', '管理员', 2, 'all', '["全部用户", "短线策略"]', 4, 5, 'published',
DATE_SUB(NOW(), INTERVAL 20 MINUTE)),

(19, '收盘点评：市场缩量调整',
'今日市场缩量调整，观望情绪浓厚。短期可能继续震荡，建议保持谨慎，控制仓位。',
'close_comment', '超级管理员', 1, 'all', '["全部用户"]', 3, 5, 'published',
NOW())
ON DUPLICATE KEY UPDATE content = VALUES(content), updated_at = NOW();

-- 3.6 定时发布消息和草稿消息（测试定时发布功能）
INSERT INTO messages (title, content, type, sender, sender_id, group_id, tags, read_count, total_count, status, publish_time, created_at) VALUES
('定时消息：明日操作策略', '明天市场预计将延续震荡走势，建议关注量能变化。中线持仓保持耐心，短线操作注意快进快出。',
'daily', '超级管理员', 1, 'all', '["全部用户"]', 0, 0, 'scheduled',
DATE_ADD(NOW(), INTERVAL 1 DAY), NOW()),

('草稿消息：待完善的分析报告', '这是一份草稿消息，内容还在完善中...', 'daily', '管理员', 2, 'all', '["全部用户"]', 0, 0, 'draft', NULL, NOW());

-- =====================================================
-- 4. 消息附件数据（message_attachments）
-- =====================================================
INSERT INTO message_attachments (message_id, type, url, name) VALUES
-- 消息1的附件（盘前点评图表）
(1, 'image', '/uploads/messages/market_chart_20250206.png', '市场走势图.png'),
(1, 'image', '/uploads/messages/tech_sector.png', '科技板块分析.png'),

-- 消息5的附件（央行政策文件）
(5, 'image', '/uploads/messages/policy_chart.png', '降准政策影响图.png'),
(5, 'pdf', '/uploads/messages/policy_document.pdf', '央行政策解读.pdf'),

-- 消息6的附件（新能源行业分析）
(6, 'image', '/uploads/messages/new_energy_chart.png', '新能源板块走势.png'),
(6, 'image', '/uploads/messages/solar_analysis.png', '光伏行业分析.png'),

-- 消息10的附件（短线操作图解）
(10, 'image', '/uploads/messages/ai_concept.png', 'AI概念热点图.png'),
(10, 'image', '/uploads/messages/trading_strategy.png', '短线操作策略图.png')
ON DUPLICATE KEY UPDATE url = VALUES(url);

-- =====================================================
-- 5. 讨论数据（discussions）
-- =====================================================
INSERT INTO discussions (id, message_id, user_id, user_name, title, content, status, visibility, created_at, updated_at) VALUES
-- 关于消息1的讨论（公开，已回复）
(1, 1, 3, '中线VIP用户', '关于科技板块的投资疑问',
'请问老师，当前科技板块的估值是否合理？是否适合中长期布局？',
'replied', 'public', DATE_SUB(NOW(), INTERVAL 1 HOUR), NOW()),

-- 关于消息2的讨论（公开，已回复）
(2, 2, 4, '短线VIP用户', '芯片股短线操作建议',
'今天芯片股涨幅较大，明天是否还有机会？',
'replied', 'public', DATE_SUB(NOW(), INTERVAL 30 MINUTE), NOW()),

-- 关于消息5的讨论（公开，已回复）
(3, 5, 5, '试用用户', '降准政策对市场的影响',
'请问降准政策会对哪些板块产生积极影响？',
'replied', 'public', DATE_SUB(NOW(), INTERVAL 2 HOUR), NOW()),

-- 关于消息6的讨论（私密，待回复）
(4, 6, 3, '中线VIP用户', '新能源板块的投资时机',
'新能源板块最近调整较多，现在是否是好的买入时机？',
'pending', 'private', DATE_SUB(NOW(), INTERVAL 3 HOUR), NOW()),

-- 关于消息7的讨论（公开，已回复）
(5, 7, 3, '中线VIP用户', '医药股的选股思路',
'医药板块标的众多，应该如何选择优质标的？',
'replied', 'public', DATE_SUB(NOW(), INTERVAL 4 HOUR), NOW()),

-- 关于消息10的讨论（公开，已回复）
(6, 10, 4, '短线VIP用户', 'AI概念股操作策略',
'AI概念最近很火，但波动也大，如何把握短线机会？',
'replied', 'public', DATE_SUB(NOW(), INTERVAL 50 MINUTE), NOW()),

-- 关于消息11的讨论（私密，待回复）
(7, 11, 4, '短线VIP用户', '短线止损设置问题',
'请问老师，短线操作的止损位应该如何设置？',
'pending', 'private', DATE_SUB(NOW(), INTERVAL 20 MINUTE), NOW()),

-- 关于消息13的讨论（公开，已回复）
(8, 13, 3, '中线VIP用户', '市场风格切换应对策略',
'面对市场风格切换，应该如何调整投资策略？',
'replied', 'public', DATE_SUB(NOW(), INTERVAL 6 HOUR), NOW()),

-- 关于消息1的另一个讨论（公开，待回复）
(9, 1, 4, '短线VIP用户', '科技股短线机会',
'科技股今天表现不错，明天还有短线机会吗？',
'pending', 'public', DATE_SUB(NOW(), INTERVAL 15 MINUTE), NOW()),

-- 关于消息3的讨论（公开，待回复）
(10, 3, 6, '测试用户', '风险控制的具体建议',
'请问具体如何设置止损位？有没有参考标准？',
'pending', 'public', NOW(), NOW())
ON DUPLICATE KEY UPDATE content = VALUES(content), updated_at = NOW();

-- =====================================================
-- 6. 讨论回复数据（discussion_replies）
-- =====================================================
INSERT INTO discussion_replies (id, discussion_id, sender_id, sender_name, content, created_at) VALUES
-- 讨论1的回复
(1, 1, 1, '超级管理员',
'科技板块当前估值处于合理区间，部分龙头标的具备中长期投资价值。建议关注业绩确定性强、研发投入高的优质企业。',
DATE_SUB(NOW(), INTERVAL 50 MINUTE)),

(2, 1, 3, '中线VIP用户',
'明白了，谢谢老师！我会关注您提到的那几个方向。',
DATE_SUB(NOW(), INTERVAL 40 MINUTE)),

(3, 1, 2, '管理员',
'补充一点：科技板块波动较大，建议分批建仓，控制单只个股仓位不超过20%。',
DATE_SUB(NOW(), INTERVAL 30 MINUTE)),

-- 讨论2的回复
(4, 2, 1, '超级管理员',
'芯片股短期涨幅较大，建议关注回调后的低吸机会。不建议追高，可以等待调整后再介入。重点看行业龙头和基本面改善的标的。',
DATE_SUB(NOW(), INTERVAL 25 MINUTE)),

(5, 2, 4, '短线VIP用户',
'明白了，谢谢老师！我会等待回调机会。',
DATE_SUB(NOW(), INTERVAL 20 MINUTE)),

-- 讨论3的回复
(6, 3, 1, '超级管理员',
'降准政策主要利好银行、地产、基建等板块。同时也会提振整体市场信心，对成长股也有积极影响。建议关注直接受益板块和超跌反弹机会。',
DATE_SUB(NOW(), INTERVAL 90 MINUTE)),

(7, 3, 5, '试用用户',
'感谢老师详细解答！',
DATE_SUB(NOW(), INTERVAL 80 MINUTE)),

-- 讨论5的回复
(8, 5, 2, '管理员',
'医药股选股建议关注三个方向：1) 创新药企业 2) 医疗器械龙头 3) 医药流通企业。重点看研发能力、产品管线和业绩增长。',
DATE_SUB(NOW(), INTERVAL 3 HOUR)),

(9, 5, 3, '中线VIP用户',
'非常感谢！这个思路很清晰。',
DATE_SUB(NOW(), INTERVAL 2 HOUR)),

(10, 5, 2, '管理员',
'另外要注意医药政策风险，特别是集采政策对仿制药企业的影响。建议重点关注创新药和高端医疗器械。',
DATE_SUB(NOW(), INTERVAL 1 HOUR)),

-- 讨论6的回复
(11, 6, 1, '超级管理员',
'AI概念短线操作要点：1) 选择龙头股 2) 控制仓位 3) 设置止损 4) 快进快出。不要贪心，见好就收。建议单只个股仓位不超过15%，止损位设置在5%以内。',
DATE_SUB(NOW(), INTERVAL 40 MINUTE)),

(12, 6, 4, '短线VIP用户',
'记住了，谢谢老师提醒！',
DATE_SUB(NOW(), INTERVAL 30 MINUTE)),

-- 讨论8的回复
(13, 8, 1, '超级管理员',
'市场风格切换时，建议：1) 中线投资者适当增加成长股配置 2) 短线投资者关注热点轮动 3) 保持灵活，及时调整。注意不要频繁追涨杀跌。',
DATE_SUB(NOW(), INTERVAL 5 HOUR)),

(14, 8, 3, '中线VIP用户',
'明白了，我会根据市场变化及时调整。',
DATE_SUB(NOW(), INTERVAL 4 HOUR)),

(15, 8, 2, '管理员',
'补充一点：风格切换往往伴随着板块轮动，要注意资金流向的变化。可以关注成交量和龙虎榜数据。',
DATE_SUB(NOW(), INTERVAL 3 HOUR)),

(16, 8, 3, '中线VIP用户',
'好的，我会密切关注资金动向。感谢两位老师！',
DATE_SUB(NOW(), INTERVAL 2 HOUR))
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- =====================================================
-- 7. 用户收藏数据（user_favorites）
-- =====================================================
INSERT INTO user_favorites (user_id, message_id) VALUES
-- 中线VIP用户的收藏
(3, 1),  -- 盘前点评
(3, 5),  -- 重要消息
(3, 6),  -- 中线策略
(3, 7),  -- 医药板块
(3, 13), -- 市场风格切换

-- 短线VIP用户的收藏
(4, 1),  -- 盘前点评
(4, 3),  -- 风险提示
(4, 10), -- 早盘关注
(4, 13), -- 市场风格切换

-- 试用用户的收藏
(5, 1),  -- 盘前点评
(5, 4),  -- 系统消息
(5, 5),  -- 重要消息

-- 测试用户的收藏
(6, 2),  -- 早盘点评
(6, 3),  -- 风险提示
(6, 14)  -- 日常消息
ON DUPLICATE KEY UPDATE user_id = user_id;

-- =====================================================
-- 8. 用户消息已读记录（user_message_reads）
-- =====================================================
INSERT INTO user_message_reads (user_id, message_id) VALUES
-- 中线VIP用户的已读记录
(3, 1), (3, 2), (3, 3), (3, 4), (3, 5), (3, 6), (3, 7), (3, 13), (3, 14), (3, 15),

-- 短线VIP用户的已读记录
(4, 1), (4, 2), (4, 3), (4, 10), (4, 11), (4, 12), (4, 13), (4, 14), (4, 16),

-- 试用用户的已读记录
(5, 1), (5, 2), (5, 3), (5, 4), (5, 5), (5, 13),

-- 管理员的已读记录（全部已读）
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10),
(1, 11), (1, 12), (1, 13), (1, 14), (1, 15), (1, 16), (1, 17), (1, 18), (1, 19),

-- 测试用户的已读记录
(6, 2), (6, 3), (6, 14)
ON DUPLICATE KEY UPDATE user_id = user_id;

-- =====================================================
-- 9. 更新消息的read_count和total_count
-- =====================================================
-- 根据实际用户数量更新total_count
UPDATE messages m
SET total_count = (
  SELECT COUNT(DISTINCT u.id)
  FROM users u
  WHERE u.status = 'active'
  AND (
    m.group_id = 'all'
    OR (m.group_id = 'vip_mid' AND u.role IN ('vip_mid', 'super_admin', 'admin'))
    OR (m.group_id = 'vip_short' AND u.role IN ('vip_short', 'super_admin', 'admin'))
    OR (m.group_id = 'trial' AND u.role IN ('trial', 'super_admin', 'admin'))
  )
);

-- 根据实际已读记录更新read_count
UPDATE messages m
SET read_count = (
  SELECT COUNT(DISTINCT r.user_id)
  FROM user_message_reads r
  WHERE r.message_id = m.id
);

-- =====================================================
-- 脚本执行完成
-- =====================================================
SELECT '测试数据创建完成！' AS message;
SELECT COUNT(*) AS user_count FROM users;
SELECT COUNT(*) AS message_count FROM messages;
SELECT COUNT(*) AS discussion_count FROM discussions;
SELECT COUNT(*) AS reply_count FROM discussion_replies;
SELECT COUNT(*) AS favorite_count FROM user_favorites;
SELECT COUNT(*) AS read_count FROM user_message_reads;
SELECT COUNT(*) AS attachment_count FROM message_attachments;
