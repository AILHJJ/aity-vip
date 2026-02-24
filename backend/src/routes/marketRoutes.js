const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * 行情指数接口
 * GET /api/market/ticker
 *
 * 返回主要市场指数的实时行情数据
 * 包括上证指数、深证成指、沪深300、创业板指、科创50、北证50
 */
router.get('/ticker', async (req, res) => {
  try {
    const response = await axios.post(
      'http://123.60.27.66:7615/TQLEX?Entry=HQServ.PBCombHQ',
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

module.exports = router;
