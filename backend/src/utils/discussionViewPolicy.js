function isAdminRole(role) {
  return role === 'admin' || role === 'super_admin';
}

function canCountDiscussionViewer(reader, discussion) {
  return !!reader && Number(reader.userId) !== Number(discussion.userId) && !isAdminRole(reader.role);
}

function canRevealDiscussionViews(role) {
  return isAdminRole(role);
}

function canReadDiscussion({ discussion, currentUserId, currentUserRole }) {
  if (!discussion) return false;
  return canRevealDiscussionViews(currentUserRole)
    || discussion.visibility === 'public'
    || Number(discussion.userId) === Number(currentUserId);
}

function countUniqueDiscussionViewers(readers, discussion) {
  return new Set(
    (readers || [])
      .filter((reader) => canCountDiscussionViewer(reader, discussion))
      .map((reader) => Number(reader.userId))
  ).size;
}

module.exports = {
  isAdminRole,
  canCountDiscussionViewer,
  canRevealDiscussionViews,
  canReadDiscussion,
  countUniqueDiscussionViewers
};
