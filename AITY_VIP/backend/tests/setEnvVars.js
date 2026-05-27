// 设置测试环境变量
const path = require('path');
const dotenv = require('dotenv');

// 加载测试环境配置
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });
