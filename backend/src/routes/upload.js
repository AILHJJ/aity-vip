/**
 * 文件上传路由
 * 使用express-fileupload中间件
 */
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../uploads/images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * @route   POST /api/upload
 * @desc    上传单个图片文件
 * @access  Private
 */
router.post('/', (req, res) => {
  try {
    // express-fileupload将文件放在req.files中
    if (!req.files || !req.files.file) {
      return res.status(400).json({
        code: 400,
        message: '请选择文件'
      });
    }

    const file = req.files.file;

    // 验证文件类型
    const allowedTypes = /jpeg|jpg|png|gif|webp|bmp/;
    const extname = allowedTypes.test(path.extname(file.name).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (!mimetype || !extname) {
      return res.status(400).json({
        code: 400,
        message: '只允许上传图片文件 (jpeg, jpg, png, gif, webp, bmp)'
      });
    }

    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.random().toString(36).substring(2, 15);
    const ext = path.extname(file.name);
    const filename = 'img-' + uniqueSuffix + ext;
    const filepath = path.join(uploadDir, filename);

    // 移动文件到上传目录
    file.mv(filepath, (err) => {
      if (err) {
        console.error('文件保存错误:', err);
        return res.status(500).json({
          code: 500,
          message: '文件保存失败'
        });
      }

      // 构建文件URL
      const fileUrl = `/uploads/images/${filename}`;

      res.json({
        code: 200,
        message: '上传成功',
        data: {
          url: fileUrl,
          filename: filename,
          originalname: file.name,
          size: file.size,
          mimetype: file.mimetype
        }
      });
    });
  } catch (error) {
    console.error('上传错误:', error);
    res.status(500).json({
      code: 500,
      message: '上传失败'
    });
  }
});

module.exports = router;
