const { Op } = require('sequelize');
const User = require('../models/User');
const {
  isAdminRole,
  syncUserExpiryStatus
} = require('../utils/userAccessPolicy');

async function syncExpiredUsers() {
  const users = await User.findAll({
    where: {
      status: 'active',
      role: { [Op.notIn]: ['admin', 'super_admin'] },
      expireDate: { [Op.not]: null }
    }
  });

  let changed = 0;
  for (const user of users) {
    if (isAdminRole(user.role)) continue;
    const result = await syncUserExpiryStatus(user);
    if (result.changed) changed += 1;
  }

  return {
    scanned: users.length,
    changed
  };
}

function startUserExpirySync(options = {}) {
  const intervalMs = Number(options.intervalMs || 15 * 60 * 1000);
  const run = async () => {
    try {
      const result = await syncExpiredUsers();
      if (result.changed > 0) {
        console.log(`[用户到期] 已自动停用 ${result.changed} 个到期账号`);
      }
    } catch (error) {
      console.error('[用户到期] 自动同步失败:', error.message);
    }
  };

  void run();
  const timer = setInterval(run, intervalMs);
  timer.unref?.();
  return timer;
}

module.exports = {
  syncExpiredUsers,
  startUserExpirySync
};
