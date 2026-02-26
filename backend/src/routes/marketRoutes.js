// 行情数据路由
const express = require('express');
const router = express.Router();
const axios = require('axios');
const marketDataController = require('../controllers/marketDataController');

const FINANCE_API_BASE = 'http://123.60.27.66:7615/TQLEX';

/**
 * 行情指数接口（原有接口保留兼容）
 * GET /api/market/ticker
 */
router.get('/ticker', async (req, res) => {
  try {
    const response = await axios.post(
      `${FINANCE_API_BASE}?Entry=HQServ.PBCombHQ`,
      {
        Head: { Target: 0 },
        WantCol: ['VOL', 'NOW', 'CLOSE'],
        Setcode: ['1', '0', '1', '0', '1', '2'],
        Code: ['999999', '399001', '000300', '399006', '000688', '899050']
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      }
    );

    const data = response.data;
    if (data.Ans && data.ListItem) {
      return res.json({
        code: 200,
        message: 'Success',
        data: data.ListItem.map(item => ({
          code: item.Item[0],
          setcode: item.Item[1],
          name: item.Item[2],
          close: item.Item[3],
          now: item.Item[4],
          vol: item.Item[5],
          EXT_ZF: item.Item[8] || '0'
        }))
      });
    }

    res.json({ code: 500, message: 'Failed to fetch market data' });
  } catch (error) {
    console.error('Market API error:', error.message);
    res.json({ code: 500, message: 'Market data unavailable' });
  }
});

// ========== 新增行情数据接口 ==========

// 获取指数行情（新版）
router.get('/index-quote', marketDataController.getIndexQuote);

// 获取连板天梯（涨停专题）
router.get('/limit-up-ladder', marketDataController.getLimitUpLadder);

// 获取行业资金流向
router.get('/industry-fund-flow', marketDataController.getIndustryFundFlow);

// 获取市场概览（综合数据）
router.get('/overview', marketDataController.getMarketOverview);

module.exports = router;
