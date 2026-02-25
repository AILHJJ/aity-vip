// 用户管理控制器
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

// 导入用户模型
const User = require('../models/User');