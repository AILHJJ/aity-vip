const { Op } = require('sequelize');
const User = require('../models/User');
const {
  isValidNotificationEmail,
  resolveTargetRoles
} = require('../utils/notificationRules');

async function getEmailTargetsByTags(tags = [], senderId) {
  const roles = resolveTargetRoles(tags, {
    notifyAdmins: process.env.MAIL_NOTIFY_ADMINS === 'true'
  });
  if (roles.length === 0) return [];

  const where = {
    status: 'active',
    role: { [Op.in]: roles }
  };

  if (senderId) {
    where.id = { [Op.ne]: senderId };
  }

  const users = await User.findAll({
    where,
    attributes: ['id', 'name', 'email', 'role']
  });

  return users
    .filter(user => isValidNotificationEmail(user.email))
    .map(user => ({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }));
}

module.exports = {
  resolveTargetRoles,
  getEmailTargetsByTags
};
