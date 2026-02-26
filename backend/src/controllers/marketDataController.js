// 行情数据控制器
const axios = require('axios');

const FINANCE_API_BASE = 'http://123.60.27.66:7615/TQLEX';

// 统一响应格式
function success(data, message = 'Success') {
  return {
    code: 200,
    message,
    data
  };
}

function error(message, code = 500) {
  return {
    code,
    message
  };
}

// 通用请求函数
async function fetchFinanceData(entry, params) {
  try {
    const response = await axios.post(
      `${FINANCE_API_BASE}?Entry=${entry}`,
      params,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      }
    );

    if (response.data?.Head?.Error) {
      throw new Error(response.data.Head.Error);
    }

    return response.data;
  } catch (err) {
    console.error(`Finance API error (${entry}):`, err.message);
    throw err;
  }
}

// 解析连板天梯压缩数据格式
function parseLadderData(buf) {
  if (!buf || typeof buf !== 'string') return [];

  try {
    // 解析格式: [["6","1"],["0","001896","豫能控股"],["4","1"],...]
    // 格式说明: [连板天数, 数量] 后面跟相应数量的股票 [类型, 代码, 名称]
    const parsed = JSON.parse(buf);
    const result = [];

    let i = 0;
    while (i < parsed.length) {
      const item = parsed[i];
      if (item.length === 2) {
        // [连板天数, 数量]
        const days = parseInt(item[0]);
        const count = parseInt(item[1]);
        const stocks = [];

        // 读取后面count个股票
        for (let j = 0; j < count && i + 1 + j < parsed.length; j++) {
          const stockItem = parsed[i + 1 + j];
          if (stockItem.length >= 3) {
            stocks.push({
              code: stockItem[1],
              name: stockItem[2],
              highDays: days
            });
          } else if (stockItem.length >= 2) {
            stocks.push({
              code: stockItem[1],
              name: stockItem[2] || '',
              highDays: days
            });
          }
        }

        result.push({
          days,
          count,
          stocks: stocks.slice(0, 10) // 每个层级最多显示10只
        });

        i += 1 + count;
      } else {
        i++;
      }
    }

    // 按天数降序排列
    return result.sort((a, b) => b.days - a.days);
  } catch (e) {
    console.error('解析连板天梯数据失败:', e);
    return [];
  }
}

// 获取指数行情（使用PBCombHQ接口）
async function getIndexQuote(req, res) {
  try {
    const data = await fetchFinanceData('HQServ.PBCombHQ', {
      Head: { Target: 0 },
      WantCol: ['VOL', 'NOW', 'CLOSE'],
      Setcode: ['1', '0', '1', '0', '1', '2'],
      Code: ['999999', '399001', '000300', '399006', '000688', '899050']
    });

    if (data.ListItem) {
      const indexData = data.ListItem.map(item => ({
        code: item.Item[0],
        setcode: item.Item[1],
        name: item.Item[2],
        lastClose: item.Item[3],
        price: item.Item[4],
        volume: item.Item[5],
        changePct: item.Item[8] || '0'
      }));

      res.json(success(indexData));
    } else {
      res.json(success([]));
    }
  } catch (err) {
    console.error('获取指数行情失败:', err.message);
    res.status(500).json(error('获取指数行情失败'));
  }
}

// 获取连板天梯（涨停专题）
async function getLimitUpLadder(req, res) {
  try {
    const data = await fetchFinanceData('HQServ.PBXmlBlock', {
      Head: { Target: 0 },
      Blocktype: '0',
      Blockstyle: '3',
      Blockid: 'Stock_SCHIGH'
    });

    // 解析压缩格式的数据
    const ladder = parseLadderData(data.Buf);

    // 计算总数
    const total = data.Num || ladder.reduce((sum, level) => sum + level.count, 0);

    res.json(success({
      ladder,
      total,
      updateTime: new Date().toISOString()
    }));
  } catch (err) {
    console.error('获取连板天梯失败:', err.message);
    res.status(500).json(error('获取连板天梯失败'));
  }
}

// 获取行业资金流向
async function getIndustryFundFlow(req, res) {
  try {
    const type = req.query.type || 'inflow'; // inflow 或 outflow
    const top = parseInt(req.query.top) || 10;

    const blockId = type === 'inflow' ? 'MStock_ZLJX_ADDE_R' : 'MStock_ZLJX_ADDE';

    const data = await fetchFinanceData('HQServ.PBXmlBlock', {
      Head: { Target: 0 },
      Code: `HY,1,0,${top}`,
      Blockid: blockId
    });

    // 处理返回数据
    const industries = [];
    if (data.Data && Array.isArray(data.Data)) {
      data.Data.forEach(item => {
        industries.push({
          code: item.Code || '',
          name: item.Name || '',
          netInflow: item.NetInflow || item.NetOutflow || 0,
          netInflowPct: item.NetInflowPct || item.NetOutflowPct || 0,
          mainInflow: item.MainInflow || item.MainOutflow || 0,
          stockCount: item.StockCount || 0,
          upCount: item.UpCount || 0,
          downCount: item.DownCount || 0,
          limitUpCount: item.LimitUpCount || item.LimitDownCount || 0,
          avgChangePct: item.AvgChangePct || 0
        });
      });
    }

    res.json(success({
      type,
      industries,
      updateTime: new Date().toISOString()
    }));
  } catch (err) {
    console.error('获取行业资金流向失败:', err.message);
    res.status(500).json(error('获取行业资金流向失败'));
  }
}

// 获取市场概览（综合数据）
async function getMarketOverview(req, res) {
  try {
    // 获取指数数据
    const indexData = await fetchFinanceData('HQServ.PBCombHQ', {
      Head: { Target: 0 },
      WantCol: ['VOL', 'NOW', 'CLOSE'],
      Setcode: ['1', '0', '1'],
      Code: ['999999', '399001', '000300']
    }).catch(() => ({ ListItem: [] }));

    const index = indexData.ListItem ? indexData.ListItem.map(item => ({
      code: item.Item[0],
      name: item.Item[2],
      price: item.Item[4],
      changePct: item.Item[8] || '0'
    })) : [];

    res.json(success({
      index,
      updateTime: new Date().toISOString()
    }));
  } catch (err) {
    console.error('获取市场概览失败:', err.message);
    res.status(500).json(error('获取市场概览失败'));
  }
}

module.exports = {
  getIndexQuote,
  getLimitUpLadder,
  getIndustryFundFlow,
  getMarketOverview
};
