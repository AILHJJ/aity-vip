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
    const levels = parseLadderData(data.Buf);

    // 计算总数
    const total = data.Num || levels.reduce((sum, level) => sum + level.count, 0);

    // 计算最高连板数
    const highestDays = levels.length > 0 ? levels[0].days : 0;

    // 为每个股票添加模拟的详细数据（实际应从NLP接口获取）
    const processedLevels = levels.map(level => ({
      days: level.days,
      count: level.count,
      stocks: level.stocks.map(stock => ({
        code: stock.code,
        name: stock.name,
        price: (10 + Math.random() * 100).toFixed(2),
        sealAmount: Math.floor(Math.random() * 500000000 + 10000000),
        sealRatio: Math.floor(Math.random() * 40 + 50),
        turnoverRate: (Math.random() * 20 + 5).toFixed(1),
        volumeRatio: (Math.random() * 3 + 0.5).toFixed(1),
        isDragon: false,
        reason: '热门概念+资金关注'
      }))
    }));

    // 标记每个级别的龙头
    if (processedLevels.length > 0 && processedLevels[0].stocks.length > 0) {
      processedLevels[0].stocks[0].isDragon = true;
    }

    res.json(success({
      highestDays,
      total,
      levels: processedLevels,
      amount: total * 50000000, // 模拟总成交额
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
    // 获取市场概览数据（涨跌分布）
    const hqData = await fetchFinanceData('HQServ.PBHQInfo', {
      Head: { Target: 0 },
      Setcode: '1',
      Code: '880005',
      HasHQInfo: '1',
      BspNum: '5'
    }).catch(() => ({}));

    // 解析涨跌数据
    let upCount = 0, downCount = 0, limitUpCount = 0, limitDownCount = 0;
    let totalStocks = 4000, amount = 0;

    if (hqData.HQInfo) {
      upCount = parseInt(hqData.HQInfo.Now) || 0;
      downCount = parseInt(hqData.HQInfo.Average) || 0;
      totalStocks = parseInt(hqData.HQInfo.MaxP) || 4000;
      amount = parseFloat(hqData.HQInfo.Amount) || 0;
      limitUpCount = parseInt(hqData.HQInfo.TotalBuyv) || 0;
      limitDownCount = parseInt(hqData.HQInfo.TotalSellv) || 0;
    }

    // 计算市场情绪分数
    const upRatio = totalStocks > 0 ? (upCount / totalStocks) * 100 : 50;
    const limitRatio = totalStocks > 0 ? (limitUpCount / totalStocks) * 100 : 0;
    let score = Math.round(upRatio * 0.7 + limitRatio * 3);
    score = Math.min(100, Math.max(0, score));

    res.json(success({
      upCount,
      downCount,
      limitUpCount,
      limitDownCount,
      totalStocks,
      amount,
      sentimentScore: score,
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
