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
      {
        Head: { Target: 0 },
        ...params
      },
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

// 获取指数行情
async function getIndexQuote(req, res) {
  try {
    const data = await fetchFinanceData('HQServ.IndexQuote', {
      Code: '000001.SZ,399001.SZ,000300.SH,000016.SH,000688.SH,000905.SH'
    });

    res.json(success(data.Data || []));
  } catch (err) {
    res.status(500).json(error('获取指数行情失败'));
  }
}

// 获取连板天梯（涨停专题）
async function getLimitUpLadder(req, res) {
  try {
    const data = await fetchFinanceData('HQServ.PBXmlBlock', {
      Blocktype: '0',
      Blockstyle: '3',
      Blockid: 'Stock_SCHIGH'
    });

    // 按连板天数分组
    const ladderData = {};
    const stocks = data.Data || [];

    stocks.forEach(stock => {
      const days = stock.HighDays || 1;
      if (!ladderData[days]) {
        ladderData[days] = [];
      }
      ladderData[days].push({
        code: stock.Code,
        name: stock.Name,
        price: stock.Price,
        change: stock.Change,
        changePct: stock.ChangePct,
        highDays: stock.HighDays,
        limitStatus: stock.LimitStatus,
        volume: stock.Volume,
        amount: stock.Amount,
        industry: stock.Industry,
        reason: stock.Reason,
        firstLimitTime: stock.FirstLimitTime,
        openCount: stock.OpenCount
      });
    });

    // 转换为数组并按天数降序排列
    const result = Object.keys(ladderData)
      .map(days => ({
        days: parseInt(days),
        count: ladderData[days].length,
        stocks: ladderData[days].slice(0, 10) // 每个层级最多显示10只
      }))
      .sort((a, b) => b.days - a.days);

    res.json(success({
      ladder: result,
      total: stocks.length,
      updateTime: data.Head?.Time
    }));
  } catch (err) {
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
      Code: `HY,1,0,${top}`,
      Blockid: blockId
    });

    const industries = (data.Data || []).map(item => ({
      code: item.Code,
      name: item.Name,
      netInflow: item.NetInflow || item.NetOutflow || 0,
      netInflowPct: item.NetInflowPct || item.NetOutflowPct || 0,
      mainInflow: item.MainInflow || item.MainOutflow || 0,
      stockCount: item.StockCount,
      upCount: item.UpCount,
      downCount: item.DownCount,
      limitUpCount: item.LimitUpCount || item.LimitDownCount || 0,
      avgChangePct: item.AvgChangePct
    }));

    res.json(success({
      type,
      industries,
      updateTime: data.Head?.Time
    }));
  } catch (err) {
    res.status(500).json(error('获取行业资金流向失败'));
  }
}

// 获取市场概览（综合数据）
async function getMarketOverview(req, res) {
  try {
    // 并行获取多个数据
    const [indexData, inflowData, outflowData] = await Promise.all([
      fetchFinanceData('HQServ.IndexQuote', {
        Code: '000001.SZ,399001.SZ,000300.SH'
      }).catch(() => ({ Data: [] })),
      fetchFinanceData('HQServ.PBXmlBlock', {
        Code: 'HY,1,0,5',
        Blockid: 'MStock_ZLJX_ADDE_R'
      }).catch(() => ({ Data: [] })),
      fetchFinanceData('HQServ.PBXmlBlock', {
        Code: 'HY,1,0,5',
        Blockid: 'MStock_ZLJX_ADDE'
      }).catch(() => ({ Data: [] }))
    ]);

    res.json(success({
      index: indexData.Data || [],
      topInflow: (inflowData.Data || []).slice(0, 5),
      topOutflow: (outflowData.Data || []).slice(0, 5),
      updateTime: indexData.Head?.Time
    }));
  } catch (err) {
    res.status(500).json(error('获取市场概览失败'));
  }
}

module.exports = {
  getIndexQuote,
  getLimitUpLadder,
  getIndustryFundFlow,
  getMarketOverview
};
