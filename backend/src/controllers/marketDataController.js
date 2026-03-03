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
    // 解析格式: [["3","4"],["0","002980","华盛昌","1","600108","亚盛集团",...],["2","27"],[...]]
    // 格式说明: [连板天数, 数量] 后面跟一个扁平化的股票数组
    // 股票数组每3个元素代表一只股票: [市场类型, 代码, 名称, 市场类型, 代码, 名称, ...]
    const parsed = JSON.parse(buf);
    const result = [];

    let i = 0;
    while (i < parsed.length) {
      const item = parsed[i];
      // [连板天数, 数量] 格式
      if (Array.isArray(item) && item.length === 2 && !isNaN(parseInt(item[0]))) {
        const days = parseInt(item[0]);
        const count = parseInt(item[1]);
        const stocks = [];

        // 下一个元素是扁平化的股票数据
        if (i + 1 < parsed.length) {
          const stockData = parsed[i + 1];
          if (Array.isArray(stockData)) {
            // 每3个元素解析一只股票
            for (let j = 0; j < stockData.length && stocks.length < count; j += 3) {
              if (j + 2 < stockData.length) {
                stocks.push({
                  code: stockData[j + 1],
                  name: stockData[j + 2],
                  market: stockData[j] === '0' ? '深市' : '沪市',
                  highDays: days,
                  // 板块接口没有详细数据，设置默认值
                  price: 0,
                  changePct: 0,
                  boardInfo: `${days}天${days}板`,
                  limitDays: days,
                  limitType: '',  // 涨停类型（一字板/换手板/T字板）
                  sealAmount: 0,
                  sealRatio: 0,
                  turnoverRate: 0,
                  volumeRatio: 0,
                  totalAmount: 0,
                  netInflow: 0,
                  mainInflow: 0,
                  reason: '',
                  isNew: false
                });
              }
            }
          }
        }

        result.push({
          days,
          count,
          stocks: stocks.slice(0, 10) // 每个层级最多显示10只
        });

        i += 2; // 跳过 [days, count] 和股票数据数组
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

// 获取连板天梯（涨停专题）- 优先使用NLP接口，fallback到板块接口
async function getLimitUpLadder(req, res) {
  try {
    let rawStocks = [];
    let useNLP = true;

    // 优先尝试NLP接口获取完整数据（使用正确的数组格式请求）
    try {
      const nlpData = await fetchFinanceData('HQServ.hq_nlp_app_misc', [{
        ReqId: '1100',
        Market: '0',
        blockstyle: '3',
        BkCode: '',
        FilterBkCode: '',
        Zdt: '7',
        ZdtOld: '0',
        ZfRange: '0',
        SortIndex: '5',
        Sort: '0',
        Page: '0',
        PageSize: '200',
        modname: 'module_misc.dll'
      }]);

      // 解析NLP返回格式: { ErrorCode, ResultSets: [{ColDes, Content}, ...] }
      if (nlpData.ErrorCode === 0 && nlpData.ResultSets && nlpData.ResultSets[1]) {
        rawStocks = nlpData.ResultSets[1].Content || [];
        console.log(`NLP接口返回 ${rawStocks.length} 只股票`);
      }

      if (rawStocks.length === 0) {
        console.log('NLP接口返回空数据，切换到板块接口');
        useNLP = false;
      }
    } catch (nlpErr) {
      console.log('NLP接口调用失败，切换到板块接口:', nlpErr.message);
      useNLP = false;
    }

    // 如果NLP数据为空，使用板块接口
    if (!useNLP || rawStocks.length === 0) {
      const blockData = await fetchFinanceData('HQServ.PBXmlBlock', {
        Head: { Target: 0 },
        Code: 'HY,1,0,500',
        Blockid: 'Stock_SCHIGH',
        Blockstyle: '3'
      });

      const levels = parseLadderData(blockData.Buf);
      let total = 0;
      let highestDays = 0;
      levels.forEach(l => {
        total += l.count;
        if (l.days > highestDays) highestDays = l.days;
      });

      return res.json(success({
        highestDays,
        total,
        levels,
        amount: 0,
        source: 'block',
        updateTime: new Date().toISOString()
      }));
    }

    // 使用NLP数据继续处理
    // 字段索引: N001=0, N002=1, N003=2, ..., N030=29
    // 按连板天数分组
    const stockMap = new Map();

    rawStocks.forEach(stock => {
      const limitDays = parseInt(stock[9]) || 1;  // N010: 连板天数 (索引9)
      const boardInfo = stock[8] || `${limitDays}天${limitDays}板`;  // N009: 几天几板 (索引8)

      if (!stockMap.has(limitDays)) {
        stockMap.set(limitDays, []);
      }

      stockMap.get(limitDays).push({
        code: stock[1] || '',              // N002: 证券代码 (索引1)
        name: stock[0] || '',              // N001: 证券名称 (索引0)
        price: parseFloat(stock[4]) || 0,  // N005: 现价 (索引4)
        changePct: (parseFloat(stock[5]) * 100) || 0,  // N006: 涨幅 (索引5, 转为百分比)
        boardInfo: boardInfo,              // N009: 几天几板 (索引8)
        limitDays: limitDays,              // N010: 连板天数 (索引9)
        limitType: stock[11] || '',        // N012: 涨停类型 (一字板/换手板/T字板) (索引11)
        sealAmount: parseFloat(stock[12]) || 0,  // N013: 封单额 (索引12)
        sealRatio: parseFloat(stock[13]) || 0,   // N014: 封成比 (索引13)
        firstLimitTime: stock[14] || '',   // N015: 首次涨停时间 (索引14)
        lastOpenTime: stock[16] || '',     // N017: 最后涨停打开时间 (索引16)
        openCount: parseInt(stock[18]) || 0,     // N019: 首次涨停后打开次数 (索引18)
        turnoverRate: parseFloat(stock[24]) || 0, // N025: 换手率 (索引24)
        volumeRatio: parseFloat(stock[25]) || 0,  // N026: 量比 (索引25)
        totalAmount: parseFloat(stock[26]) || 0,  // N027: 总金额 (索引26)
        netInflow: parseFloat(stock[27]) || 0,    // N028: 资金净流入 (索引27)
        mainInflow: parseFloat(stock[28]) || 0,   // N029: 主力资金净流入 (索引28)
        reason: stock[29] || '',           // N030: 涨停原因 (索引29)
        isNew: stock[2] === '1',           // N003: 次新标识 (索引2)
        market: stock[3] === '0' ? '深市' : '沪市'  // N004: 市场类型 (索引3)
      });
    });

    // 转换为数组并按连板天数降序排列
    const levels = [];
    let total = 0;
    let highestDays = 0;

    stockMap.forEach((stocks, days) => {
      // 按涨幅排序
      stocks.sort((a, b) => b.changePct - a.changePct);

      levels.push({
        days: days,
        count: stocks.length,
        stocks: stocks.slice(0, 10) // 每个级别最多显示10只
      });
      total += stocks.length;
      if (days > highestDays) highestDays = days;
    });

    // 按天数降序排列
    levels.sort((a, b) => b.days - a.days);

    // 计算总成交额
    const totalAmount = rawStocks.reduce((sum, s) => sum + (parseFloat(s[26]) || 0), 0);

    res.json(success({
      highestDays,
      total,
      levels,
      amount: totalAmount,
      source: 'nlp',
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
