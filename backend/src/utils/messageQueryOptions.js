const { getVisibleTagsForRole } = require('./messageTagRules');

function normalizeReadStatus(readStatus) {
  const normalized = String(readStatus || '').trim().toLowerCase();
  return ['read', 'unread'].includes(normalized) ? normalized : '';
}

function isAdminRole(role) {
  return role === 'super_admin' || role === 'admin';
}

function buildVisibleMessageWhere({ user, query = {}, readMessageIds = [], sequelize, Op }) {
  const { type, groupId, status, tag } = query;
  const readStatus = normalizeReadStatus(query.readStatus);
  const where = {};
  const andConditions = [];

  if (status && isAdminRole(user.role)) {
    where.status = status;
  } else {
    andConditions.push({
      [Op.or]: [
        { status: 'published' },
        { status: { [Op.is]: null } },
        {
          status: 'scheduled',
          publishTime: { [Op.lte]: new Date() }
        }
      ]
    });
  }

  if (type) where.type = type;
  if (groupId) where.groupId = groupId;

  if (tag) {
    andConditions.push(
      sequelize.where(
        sequelize.fn('JSON_CONTAINS', sequelize.col('tags'), JSON.stringify(tag)),
        1
      )
    );
  }

  if (user.role !== 'trial' && !isAdminRole(user.role)) {
    const allowedTags = getVisibleTagsForRole(user.role);

    andConditions.push({
      [Op.or]: [
        { tags: null },
        ...allowedTags.map(allowedTag =>
          sequelize.where(
            sequelize.fn('JSON_CONTAINS', sequelize.col('tags'), JSON.stringify(allowedTag)),
            1
          )
        )
      ]
    });
  }

  if (readStatus === 'unread' && readMessageIds.length > 0) {
    where.id = { [Op.notIn]: readMessageIds };
  }

  if (readStatus === 'unread' && user.id) {
    andConditions.push({
      [Op.or]: [
        { senderId: { [Op.ne]: user.id } },
        { senderId: { [Op.is]: null } }
      ]
    });
  }

  if (readStatus === 'read') {
    where.id = { [Op.in]: readMessageIds };
  }

  if (andConditions.length > 0) {
    where[Op.and] = andConditions;
  }

  return where;
}

module.exports = {
  buildVisibleMessageWhere,
  isAdminRole,
  normalizeReadStatus
};
