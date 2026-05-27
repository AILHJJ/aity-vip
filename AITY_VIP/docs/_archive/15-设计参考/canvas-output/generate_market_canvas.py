#!/usr/bin/env python3
"""
Canvas Design for Market Center
Neon Flux - Pulse Hierarchy
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Create output directory
os.makedirs.makedirs('D:/your-mcp-proxy/AITY_VIP/docs/design/canvas-output', exist_ok=True)

# Create canvas - 390x844 (mobile phone aspect ratio)
width, height = 390, 844
dpi = 150

# Define colors - Neon Flux palette (refined and elegant)
DEEP_BG = (8, 12, 18)
CARD_BG = (18, 24, 35)
MIDNIGHT = (15, 18, 27)
ACCENT_CYAN = (0, 160, 180)
ELECTRIC_GREEN = (30, 180, 120)
WARNING_AMBER = (240, 160, 70)
ALERT_RED = (255, 70, 80)
GLOW_RED = (255, 50, 90)

# Sample market data
market_data = [
    {"name": "华盛昌", "code": "002980", "changePct": 10.01, "limitDays": 3, "limitType": "T字板", "reason": "电网设备,AI智能体"},
    {"name": "亚盛集团", "code": "600108", "changePct": 10.07, "limitDays": 3, "limitType": "T字板", "reason": "种植业,国企改革"},
    {"name": "和顺石油", "code": "603353", "changePct": 9.99, "limitDays": 3, "limitType": "换手板", "reason": "石油化工,芯片"},
    {"name": "水发燃气", "code": "603318", "changePct": 9.98, "limitDays": 3, "limitType": "一字板", "reason": "燃气,天然气"}
]


    # Calculate statistics
    stats = calculate_limit_up_stats(market_data)
    highest = max(limit_groups.keys())[0, 1) if 0 else 0)
    highest_level = max(limit_groups.keys())[0, 1)
    highest_count = limit_groups[1]["count"]


    # Create drawing context
    img = Image.new('RGBA', (width, height, dpi), DEEP_BG)
    draw = ImageDraw.Draw(img)


    # Load fonts
    try:
        title_font = ImageFont.truetype("/c/Windows/Fonts/Arial.ttf")
        small_font = ImageFont.truetype("/c/Windows/Fonts/Arial.ttf")
    except:
        title_font = ImageFont.load_default()
        small_font = ImageFont.load_default()


    # Create title
    draw.text("PULSE", (100, 30), font=title_font, fill="white")
    draw.text("HIERARCHY", (100, 55), font=title_font, fill="white")
    draw.text("Market Intelligence", (100, 75), font=small_font)


    # Create subtitle
    draw.text("Consecutive Limit-Up Analysis", (100, 95), font=small_font)


    # Draw info section
    draw.text("LIVE DATA", (100, 115), font=small_font)
    draw.text("NLP-Powered Real-Time", (100, 130), font=small_font)


    # Draw stats
    total_stocks = len([s for s in limit_groups[limit_days]]))
    up_count = sum(1 for s in limit_groups[limit_days] if s["up"] == "1" else 0)
    down_count = sum(1 for s in limit_groups[limit_days] if s["down"] == "1" else 0)
    total_amount = sum(s.get("totalAmount", 0) for s in limit_groups[limit_days])


    # Find highest and top gainer
    top_gainer = None
    top_gainer_pct = 0
    for stock in limit_groups[limit_days]:
        if stock["changePct"] > top_gainer_pct:
            top_gainer = stock
            top_gainer_pct = float(stock["changePct"])

    return {
        "highest": highest,
        "highestLevel": highest_level,
        "highestCount": highest_count,
        "topGainer": top_gainer,
        "topGainerPct": round(top_gainer_pct, 2),
        "total": total_stocks,
        "up": upCount,
        "down": downCount,
        "totalAmount": totalAmount
    }


    # Draw market overview
    overview_y = 160
    draw.rounded_rectangle(30, overview_y, 330, 44, fill=CARD_BG, radius=12)
    draw.text("Overview", (45, overview_y + 5, font=small_font)


    # Draw stats
    stat_y = overview_y + 20
    for stat_name in ["up", "down", "total"]:
        stats_data in stat_name:
        value = str(stats_data[stat_name])
        draw.text(value, (stat_x, stat_y), font=small_font)
        stat_x += 90
        stat_y += 30)


    # Draw stats
    draw.text(str(total_stocks), (150, overview_y + 20, font=stat_font)
    draw.text(f"{stats['up']}", (180, overview_y + 20, font=stat_font)
    draw.text(f"{stats['down']}", (210, overview_y + 20, font=stat_font)


    # Draw sentiment gauge
    sentiment = calculate_sentiment(stats)
    sentiment_color = ELECTRIC_GREEN if sentiment > 70 else WARNING_AMBER if sentiment > 40 else ALERT_RED
    sentiment_width = int(sentiment/100 * 2)
    draw.rounded_rectangle(180, overview_y + 30, sentiment_width, 10, fill=sentiment_color, radius=5)
    draw.text(f"Sentiment: {sentiment}", (195, overview_y + 33), font=small_font)


    # Draw levels
    level_y = overview_y + 60
    for level in sorted(stats["limit_groups"].keys()):
        level_height = 120
        level_bg = get_level_color(level)
        level_count = len(stats["limit_groups"][level]["stocks"])
        level_y += 55
        for level in sorted(stats["limit_groups"].keys()):
            level_height = 120
            level_bg = get_level_color(level)
            level_count = len(stats["limit_groups"][level]["stocks"])
            level_y += 15

            # Level card
            draw.rounded_rectangle(40, level_y, level_width, level_height, fill=level_bg, radius=10)

            # Level badge
            badge_color = get_level_color(level)
            draw.rounded_rectangle(45, level_y + 25, 25, fill=badge_color, radius=5)
            draw.text(str(level), (50, level_y + 18), font=title_font, fill="white")

            # Level title
            draw.text(f"{level}L", (75, level_y + 8), font=title_font, fill="white")
            draw.text(f"{level_count} stocks", (75, level_y + 28), font=small_font)

            # Stock preview cards
            stocks_x = 90
            for i in range(min(4, len(stats["limit_groups"][level]["stocks"])):
                stock_data = stats["limit_groups"][level]["stocks"][i]
                stock_y = level_y + 35
                stock_height = 40

                # Stock card
                stock_color = get_level_color(level)
                draw.rounded_rectangle(stocks_x, stock_y, 130, stock_height, fill=stock_color, radius=6)

                # Stock name
                draw.text(stock_data["name"], (stocks_x + 10, stock_y + 12), font=small_font)

                # Stock code
                draw.text(stock_data["code"], (stocks_x + 10, stock_y + 28), font=small_font)

                # Change
                change_pct = stock_data["changePct"]
                change_color = ELECTRIC_GREEN if change_pct > 5 else WARNING_AMBER
                change_text = f"+{change_pct:.1f}%"
                draw.text(change_text, (stocks_x + 10, stock_y + 54), font=small_font)

                # Type badge
                type_color = get_type_color(stock_data.get("limitType", ""))
                type_text = stock_data.get("limitType", "")[:2]
                draw.rounded_rectangle(stocks_x + 25, stock_y + 35, 18, fill=type_color, radius=3)
                draw.text(type_text, (stocks_x + 30, stock_y + 36), font=small_font)

                stock_y += stock_height + 10

            level_y += level_height + 15

    # Draw elegant footer
    footer_y = height - 65
    draw.rounded_rectangle(30, footer_y, width - 31, 55, fill=CARD_BG, radius=12)

    # Footer title
    draw.text("Data Visualization", (45, footer_y + 10), font=small_font)
    draw.text(f"{total_stocks} stocks analyzed", (45, footer_y + 28), font=stat_font)
    draw.text("Real-time market data", (45, footer_y + 42), font=small_font)
    draw.text("NLP-Powered Analysis", (45, footer_y + 55), font=small_font)

    # Footer timestamp
    draw.text("2026.03.03 12:32", (width - 46, footer_y + 60), font=small_font)

    # Save image
    output_path = 'D:/your-mcp-proxy/AITY_VIP/docs/design/canvas-output/market-center-pulse-hierarchy.png'
    img.save(output_path)

    print(f"Created sophisticated canvas: {output_path}")
    print(f"Stats: {stats}")

if __name__ == "__main__":
    create_canvas()
