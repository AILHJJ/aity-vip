const { Op, QueryTypes } = require('sequelize');
const sequelize = require('../config/db');
const DiscussionImage = require('../models/DiscussionImage');
const { canRevealDiscussionViews } = require('../utils/discussionViewPolicy');
const { createSignedImageUrl } = require('../controllers/discussionImageController');

async function getDiscussionPresentation(discussions, role) {
  const rows = discussions || [];
  const ids = [...new Set(rows.map((item) => Number(item.id)).filter(Number.isSafeInteger))];
  if (!ids.length) return new Map();

  const storedImages = await DiscussionImage.findAll({
    where: { discussionId: { [Op.in]: ids } },
    order: [['id', 'ASC']]
  });
  const imagesByDiscussion = new Map(ids.map((id) => [id, []]));
  for (const image of storedImages) {
    imagesByDiscussion.get(Number(image.discussionId)).push({
      id: image.id,
      filename: image.filename,
      url: createSignedImageUrl(image.discussionId, image.id)
    });
  }

  let counts = new Map();
  if (canRevealDiscussionViews(role)) {
    const rows = await sequelize.query(
      `SELECT dr.discussion_id AS discussionId, COUNT(DISTINCT dr.user_id) AS viewCount
       FROM discussion_reads dr
       INNER JOIN users u ON u.id = dr.user_id
       INNER JOIN discussions d ON d.id = dr.discussion_id
       WHERE dr.discussion_id IN (:ids)
         AND dr.user_id <> d.user_id
         AND u.role NOT IN ('admin', 'super_admin')
       GROUP BY dr.discussion_id`,
      { replacements: { ids }, type: QueryTypes.SELECT }
    );
    counts = new Map(rows.map((row) => [Number(row.discussionId), Number(row.viewCount)]));
  }

  return new Map(rows.map((discussion) => {
    const id = Number(discussion.id);
    const legacy = Array.isArray(discussion.images) ? discussion.images : [];
    const presentation = { images: [...legacy, ...(imagesByDiscussion.get(id) || [])] };
    if (canRevealDiscussionViews(role)) presentation.viewCount = counts.get(id) || 0;
    return [id, presentation];
  }));
}

module.exports = { getDiscussionPresentation };
