const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const Discussion = require('../models/Discussion');
const DiscussionImage = require('../models/DiscussionImage');
const { detectDiscussionImageType, createImageSignature, verifyImageSignature } = require('../utils/discussionImagePolicy');

const uploadDir = path.join(__dirname, '../../uploads/discussion-images');
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function signingKey() {
  const key = process.env.JWT_SECRET;
  if (!key || key === 'your-secret-key' || key.length < 32) {
    throw new Error('A strong JWT_SECRET is required for private discussion images');
  }
  return key;
}

function createSignedImageUrl(discussionId, imageId) {
  const expiresAt = Math.floor(Date.now() / 1000) + 10 * 60;
  const signature = createImageSignature({ discussionId, imageId, expiresAt, key: signingKey() });
  return `/api/discussions/images/${imageId}?discussionId=${discussionId}&expires=${expiresAt}&signature=${signature}`;
}

async function cleanupExpiredPendingImages() {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const expired = await DiscussionImage.findAll({
    where: { discussionId: null, createdAt: { [require('sequelize').Op.lt]: cutoff } }
  });
  for (const image of expired) {
    await fs.promises.unlink(path.join(uploadDir, image.filename)).catch(() => {});
    await image.destroy();
  }
}

async function upload(req, res) {
  let savedPath;
  try {
    const file = req.files && req.files.file;
    if (!file || Array.isArray(file)) return res.status(400).json({ code: 400, message: '请选择一张图片' });
    if (file.size > MAX_IMAGE_SIZE) return res.status(413).json({ code: 413, message: '单张图片不能超过5MB' });
    if (!file.tempFilePath) return res.status(400).json({ code: 400, message: '无法读取图片文件，请重试' });

    const bytes = await fs.promises.readFile(file.tempFilePath);
    const type = detectDiscussionImageType(bytes);
    if (!type) return res.status(415).json({ code: 415, message: '仅支持有效的JPG、PNG、GIF或WebP图片' });

    await cleanupExpiredPendingImages();
    await fs.promises.mkdir(uploadDir, { recursive: true });
    const filename = `${crypto.randomBytes(24).toString('hex')}${type.extension}`;
    savedPath = path.join(uploadDir, filename);
    await fs.promises.copyFile(file.tempFilePath, savedPath, fs.constants.COPYFILE_EXCL);
    const image = await DiscussionImage.create({ filename, userId: req.user.userId, discussionId: null });
    await fs.promises.unlink(file.tempFilePath).catch(() => {});
    return res.status(201).json({ code: 200, message: '上传成功', data: { id: image.id, filename } });
  } catch (err) {
    if (savedPath) await fs.promises.unlink(savedPath).catch(() => {});
    console.error('[讨论图片上传] 失败:', err.message);
    return res.status(500).json({ code: 500, message: '图片上传失败，请稍后重试' });
  }
}

async function deletePending(req, res) {
  try {
    const image = await DiscussionImage.findByPk(req.params.imageId);
    if (!image) return res.status(404).json({ code: 404, message: '图片不存在' });
    if (Number(image.userId) !== Number(req.user.userId) || image.discussionId != null) {
      return res.status(403).json({ code: 403, message: '无权删除此图片' });
    }
    await image.destroy();
    await fs.promises.unlink(path.join(uploadDir, image.filename)).catch(() => {});
    return res.json({ code: 200, message: '已删除', data: null });
  } catch (err) {
    console.error('[讨论图片清理] 失败:', err.message);
    return res.status(500).json({ code: 500, message: '图片清理失败' });
  }
}

async function serveSigned(req, res) {
  try {
    const { discussionId, expires, signature } = req.query;
    const valid = verifyImageSignature({
      discussionId,
      imageId: req.params.imageId,
      expiresAt: expires,
      signature,
      key: signingKey()
    });
    if (!valid) return res.status(403).end();

    const [discussion, image] = await Promise.all([
      Discussion.findByPk(discussionId),
      DiscussionImage.findByPk(req.params.imageId)
    ]);
    if (!discussion || !image || Number(image.discussionId) !== Number(discussionId)) return res.status(404).end();

    const filePath = path.join(uploadDir, image.filename);
    const type = detectDiscussionImageType(await fs.promises.readFile(filePath));
    if (!type) return res.status(404).end();
    res.set({
      'Content-Type': type.mimeType,
      'Content-Disposition': 'inline',
      'Cache-Control': 'private, max-age=60',
      'X-Content-Type-Options': 'nosniff'
    });
    return res.sendFile(filePath);
  } catch (err) {
    if (err.code === 'ENOENT') return res.status(404).end();
    console.error('[讨论图片读取] 失败:', err.message);
    return res.status(500).end();
  }
}

module.exports = { upload, deletePending, serveSigned, createSignedImageUrl, uploadDir };
