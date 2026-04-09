def main(
    arg1: str = "",  # 行业主力净流入
    arg2: str = "",  # 行业主力净流出
    arg3: str = "",  # 涨跌分布（含 HQInfo 和 BspInfo）
    arg4: str = "",  # 主要指数行情数据
    arg5: str = ""   # 连板情况数据
) -> dict:

    import json
    from datetime import datetime
    from collections import defaultdict

    def safe_parse(s):
        if not s or not s.strip():
            return {}
        try:
            return json.loads(s)
        except:
            return {}

    def parse_buf(buf):
        """优化后的Buf解析函数，支持多种数据结构"""
        if not buf:
            return []
        
        # 处理字符串类型的Buf
        if isinstance(buf, str):
            try:
                # 处理双重转义问题
                buf = buf.replace('\\"', '"').replace('\\\\', '\\')
                # 处理缺少外层括号的情况
                if not buf.startswith('['):
                    buf = '[' + buf + ']'
                return json.loads(buf)
            except:
                return []
        
        # 处理列表类型的Buf
        elif isinstance(buf, list):
            try:
                raw = ''.join(str(x) for x in buf if x not in ("", None))
                if not raw.strip():
                    return []
                if not raw.startswith('['):
                    raw = '[' + raw + ']'
                return json.loads(raw)
            except:
                return []
        
        return []

    def safe_int(value, default=0):
        try:
            return int(value) if value not in ("", None) else default
        except:
            return default

    def format_volume(vol):
        try:
            vol = float(vol)
            if vol >= 1e8:
                return f"{vol / 1e8:.2f}亿手"
            elif vol >= 1e4:
                return f"{vol / 1e4:.2f}万手"
            else:
                return f"{int(vol)}手"
        except:
            return "未知"

    # 初始化输出
    fund_flow_summary = "主力资金流向：暂无数据。"
    limit_summary = "涨跌停及涨幅分布：暂无数据。"
    market_overview = "市场概况：暂无数据。"
    consecutive_boards_summary = "连板情况：暂无数据。"

    # ================== 1. 主力资金流向 ==================
    try:
        inflow_data = safe_parse(arg1)
        outflow_data = safe_parse(arg2)

        inflow_buf = parse_buf(inflow_data.get("Buf", []))
        outflow_buf = parse_buf(outflow_data.get("Buf", []))

        top3_in = []
        for i in range(min(3, len(inflow_buf))):
            row = inflow_buf[i]
            name = str(row[2]) if len(row) > 2 else "未知"
            inflow_val = row[6] if len(row) > 6 else 0
            try:
                inflow = float(inflow_val) if inflow_val not in ("", None) else 0.0
                inflow亿 = inflow / 1e8
                top3_in.append(f"{name}（{inflow亿:.2f}亿）")
            except:
                top3_in.append(f"{name}（数据异常）")

        top3_out = []
        for i in range(min(3, len(outflow_buf))):
            row = outflow_buf[i]
            name = str(row[2]) if len(row) > 2 else "未知"
            inflow_val = row[6] if len(row) > 6 else 0
            try:
                inflow = float(inflow_val) if inflow_val not in ("", None) else 0.0
                inflow亿 = inflow / 1e8
                top3_out.append(f"{name}（{inflow亿:.2f}亿）")
            except:
                top3_out.append(f"{name}（数据异常）")

        fund_flow_summary = (
            "主力资金流向：\n"
            f"净流入前三：{'; '.join(top3_in) or '无'}\n"
            f"净流出前三：{'; '.join(top3_out) or '无'}"
        )

    except Exception as e:
        fund_flow_summary = f"主力资金流向：解析失败（{str(e)[:50]}...）"

    # ================== 2. 涨跌停及涨幅分布 ==================
    try:
        price_data = safe_parse(arg3)
        bsp_info = price_data.get("BspInfo", [])
        hq_info = price_data.get("HQInfo", {}) or {}

        # 提取各区间涨跌家数
        up_0_3 = safe_int(bsp_info[0].get("BuyV") if len(bsp_info) > 0 else None)
        down_0_3 = safe_int(bsp_info[0].get("SellV") if len(bsp_info) > 0 else None)

        up_3_5 = safe_int(bsp_info[1].get("BuyV") if len(bsp_info) > 1 else None)
        down_3_5 = safe_int(bsp_info[1].get("SellV") if len(bsp_info) > 1 else None)

        up_5_7 = safe_int(bsp_info[2].get("BuyV") if len(bsp_info) > 2 else None)
        down_5_7 = safe_int(bsp_info[2].get("SellV") if len(bsp_info) > 2 else None)

        up_7_plus = safe_int(bsp_info[3].get("BuyV") if len(bsp_info) > 3 else None)
        down_7_plus = safe_int(bsp_info[3].get("SellV") if len(bsp_info) > 3 else None)

        # 涨跌停数据处理（双来源校验）
        # 从BspInfo获取
        limit_up_from_bsp = safe_int(bsp_info[4].get("BuyV") if len(bsp_info) > 4 else None)
        limit_down_from_bsp = safe_int(bsp_info[4].get("SellV") if len(bsp_info) > 4 else None)
        
        # 从HQInfo获取
        limit_up_from_hq = safe_int(hq_info.get("TotalBuyv"))
        limit_down_from_hq = safe_int(hq_info.get("TotalSellv"))
        
        # 优先使用BspInfo数据（更精确），否则用HQInfo
        limit_up = limit_up_from_bsp if limit_up_from_bsp > 0 else (limit_up_from_hq if limit_up_from_hq > 0 else 0)
        limit_down = limit_down_from_bsp if limit_down_from_bsp > 0 else (limit_down_from_hq if limit_down_from_hq > 0 else 0)

        # 直接使用HQInfo中的全市场/涨/跌家数（无需重新计算）
        total_count = safe_int(hq_info.get("MaxP"), 0)  # 总股票数
        up_count = safe_int(hq_info.get("Now"), 0)       # 上涨家数
        down_count = safe_int(hq_info.get("Average"), 0) # 下跌家数

        # 涨幅>3% 的统计（直接使用区间数据）
        strong_up = up_3_5 + up_5_7 + up_7_plus
        total_stocks = total_count  # 使用HQInfo中的总股票数
        strong_up_ratio_total = round(strong_up / total_stocks * 100, 2) if total_stocks > 0 else 0  # 全市场比
        strong_up_ratio_rising = round(strong_up / up_count * 100, 2) if up_count > 0 else 0  # 上涨家数比

        # 跌幅>3% 的统计（直接使用区间数据）
        strong_down = down_3_5 + down_5_7 + down_7_plus
        strong_down_ratio_total = round(strong_down / total_stocks * 100, 2) if total_stocks > 0 else 0  # 全市场比
        strong_down_ratio_falling = round(strong_down / down_count * 100, 2) if down_count > 0 else 0  # 下跌家数比

        # 构建输出
        limit_summary = (
            "涨跌停及涨幅分布：\n"
            f"涨停 {limit_up} 家，跌停 {limit_down} 家\n"
            f"上涨分布：0~3%:{up_0_3}家, 3~5%:{up_3_5}家, 5~7%:{up_5_7}家, >7%(不含涨停):{up_7_plus}家\n"
            f"下跌分布：0~3%:{down_0_3}家, 3~5%:{down_3_5}家, 5~7%:{down_5_7}家, >7%(不含跌停):{down_7_plus}家\n"
            f"【涨幅>3%】全市场占比{strong_up_ratio_total:.2f}%｜上涨占比{strong_up_ratio_rising:.2f}%\n"
            f"【跌幅>3%】全市场占比{strong_down_ratio_total:.2f}%｜下跌占比{strong_down_ratio_falling:.2f}%"
        )

    except Exception as e:
        limit_summary = f"涨跌停分布：解析失败（{str(e)[:50]}...）"

    # ================== 3. 市场概况 ==================
    try:
        hq_info = price_data.get("HQInfo", {}) or {}

        # 解析指数行情数据
        index_lines = []
        try:
            index_data = safe_parse(arg4)
            list_items = index_data.get("ListItem", [])
            for item in list_items:
                fields = item.get("Item", [])
                if len(fields) >= 9:
                    name = fields[2]
                    now = float(fields[4]) if fields[4].replace('.', '').isdigit() else 0.0
                    zf = fields[8]
                    index_lines.append(f"{name} {now:.2f}点（{zf}%）")
            index_summary = "主要指数表现：" + "；".join(index_lines) if index_lines else "主要指数表现：无数据"
        except:
            index_summary = "指数表现：解析失败"

        # 基础市场概况
        if not hq_info:
            base_overview = "市场概况：HQInfo 数据为空。"
        else:
            date_str = hq_info.get("HQDate", "")
            time_str = hq_info.get("HQTime", "")
            datetime_str = "未知"
            if date_str and time_str:
                try:
                    dt = datetime.strptime(f"{date_str} {time_str}", "%Y%m%d %H%M%S")
                    datetime_str = dt.strftime("%Y年%m月%d日 %H:%M:%S")
                except:
                    datetime_str = f"{date_str} {time_str}"

            amount = hq_info.get("Amount", 0)
            try:
                amount亿 = float(amount) / 1e8
                amount_str = f"{amount亿:.2f}亿元"
            except:
                amount_str = "未知"

            volume = safe_int(hq_info.get("Volume"), 0)

            lead_ratio = round(up_count / down_count, 2) if down_count > 0 else float('inf')
            lead_str = f"{lead_ratio:.2f}" if lead_ratio != float('inf') else "正无穷"

            overview_parts = [
                f"时间：{datetime_str}",
                f"总家数：{total_count}",
                f"上涨：{up_count}家",
                f"下跌：{down_count}家",
                f"成交额：{amount_str}",
                f"成交量：{format_volume(volume)}",
                f"涨跌比：{lead_str}",
                f"涨停家数：{limit_up}",
                f"跌停家数：{limit_down}"
            ]

            base_overview = "市场概况：\n" + "\n".join(overview_parts)

        # 合并输出
        market_overview = f"{base_overview}\n\n{index_summary}"

    except Exception as e:
        market_overview = f"市场概况：解析失败（{str(e)[:50]}...）"

    # ================== 4. 连板情况解析（优化版） ==================
    try:
        consecutive_info = safe_parse(arg5)
        consecutive_buf = parse_buf(consecutive_info.get("Buf", []))
        
        # 专业解析连板数据结构
        board_dict = defaultdict(list)
        current_height = None
        
        for item in consecutive_buf:
            if not item:
                continue
                
            # 连板高度标记（如 ["5","1"]）
            if len(item) == 2 and item[0].isdigit() and item[1].isdigit():
                current_height = int(item[0])
                
            # 个股数据标记（如 ["0","002941","新疆交建",...]）
            elif current_height is not None:
                i = 0
                while i + 2 < len(item):
                    # 每3个元素为一组（市场标识，股票代码，股票名称）
                    # 市场标识（0/1）可能包含有用信息，但这里我们只关心代码和名称
                    code = item[i+1]
                    name = item[i+2]
                    if code and name:
                        board_dict[current_height].append(f"{code} {name}")
                    i += 3
        
        # 情绪分析
        total_boards = sum(len(stocks) for stocks in board_dict.values())
        max_height = max(board_dict.keys()) if board_dict else 0
        
        # 生成展示文本
        display_lines = [f"连板概况（总计{total_boards}只，最高{max_height}连板）"]
        
        # 情绪判断交由大模型自行判断
        # if max_height >= 7:
        #     display_lines.append("🔥 妖股横行，市场情绪狂热")
        # elif max_height >= 5:
        #     display_lines.append("🚀 龙头强势，市场情绪高涨")
        # elif max_height >= 3:
        #     display_lines.append("📈 连板效应明显，市场活跃")
        # elif max_height >= 2:
        #     display_lines.append("↗️ 有连板个股，市场情绪回暖")
        # else:
        #     display_lines.append("➖ 市场情绪平淡，缺乏龙头")
        
        # 各连板级别详情
        for height in sorted(board_dict.keys(), reverse=True):
            stocks = board_dict[height]
            if stocks:  # 只展示有股票的连板级别
                display_lines.append(
                    f"{height}连板（{len(stocks)}家）：{'、'.join(stocks[:3])}"
                    + (f" 等{len(stocks)}只" if len(stocks) > 3 else "")
                )
        
        consecutive_boards_summary = "\n".join(display_lines)

    except Exception as e:
        consecutive_boards_summary = f"连板情况：解析失败（{str(e)[:50]}...）"

    # ================== 5. 返回结构化数据 ==================
    return {
        "fund_flow_summary": fund_flow_summary,
        "limit_summary": limit_summary,
        "market_overview": market_overview,
        "consecutive_boards_summary": consecutive_boards_summary,
        "raw_data": {
            "涨跌分布": {
                "上涨区间": {
                    "0~3%": up_0_3,
                    "3~5%": up_3_5,
                    "5~7%": up_5_7,
                    ">7%": up_7_plus
                },
                "下跌区间": {
                    "0~3%": down_0_3,
                    "3~5%": down_3_5,
                    "5~7%": down_5_7,
                    ">7%": down_7_plus
                },
                "涨停": limit_up,
                "跌停": limit_down,
                "全市场家数": total_count,
                "上涨家数": up_count,
                "下跌家数": down_count,
                "涨幅>3%": {
                    "数量": strong_up,
                    "全市场占比": strong_up_ratio_total,
                    "上涨家数占比": strong_up_ratio_rising
                },
                "跌幅>3%": {
                    "数量": strong_down,
                    "全市场占比": strong_down_ratio_total,
                    "下跌家数占比": strong_down_ratio_falling
                }
            },
            "市场概况": {
                "时间": datetime_str,
                "成交额": amount_str,
                "成交量": format_volume(volume),
                "涨跌比": lead_str
            },
            "指数行情": index_summary,
            "连板情况": {
                "total": total_boards,
                "max_height": max_height,
                "boards": {
                    str(h): {
                        "count": len(s),
                        "stocks": s
                    } for h, s in board_dict.items()
                }
            }
        }
    }