// 行情数据路由
const express = require('express');
const router = express.Router();
const marketDataController = require('../controllers/marketDataController');

// 获取指数行情
router.get('/index-quote', marketDataController.getIndexQuote);

// 获取连板天梯（涨停专题）
router.get('/limit-up-ladder', marketDataController.getLimitUpLadder);

// 获取行业资金流向
router.get('/industry-fund-flow', marketDataController.getIndustryFundFlow);

// 获取市场概览
router.get('/overview', marketDataController.getMarketOverview);

module.exports = router;
