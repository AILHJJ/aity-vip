function resolveReplyPrivacy({ isAdmin, requestedIsPrivate }) {
  if (!isAdmin) {
    return 1;
  }

  return requestedIsPrivate ? 1 : 0;
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
