function resolveReplyPrivacy({ isAdmin, requestedIsPrivate, discussionVisibility }) {
  // 公开帖：任何人可选择公开/私密回复
  if (isAdmin || discussionVisibility === 'public') {
    return requestedIsPrivate ? 1 : 0;
  }

  // 私密帖（如持仓帖）：回复强制私密，保护持仓隐私
  return 1;
}

function canViewPrivateReply({ isAdmin, discussion, reply, currentUserId }) {
  if (isAdmin) return true;

  const userId = Number(currentUserId);
  return Number(discussion?.userId) === userId || Number(reply?.userId) === userId;
}

module.exports = {
  canViewPrivateReply,
  resolveReplyPrivacy
};
