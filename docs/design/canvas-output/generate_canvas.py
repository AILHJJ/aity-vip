from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

# Create output directory
os.makedirs.makedirs('D:/your-mcp-proxy/AITY_VIP/docs/design/canvas-output', exist_ok=True)

# Create canvas - 390x844 (mobile phone aspect ratio)
width, height = 390, 844
dpi = 150
bg_color = (15, 18, 30)
img = Image.new('RGBA', (width, height, dpi), bg_color)
draw = ImageDraw.Draw(img)

# Define colors - Neon Flux palette
DEEP_NAVY = (10, 15, 25)
MIDNIGHT = (15, 20, 32)
DUSK_BLUE = (20, 30, 50)
ACCENT_CYAN = (0, 180, 200)
ELECTRIC_GREEN = (50, 200, 130)
WARNING_AMBER = (240, 160, 60)
ALERT_RED = (220, 50, 60)
GLOW_RED = (255, 70, 90)

# Draw glowing background with radial gradient
for i in range(height):
    for j in range(width):
        distance = ((i - height/2)**2 + (j - width/2)**2
        intensity = int((1 - distance/1000) * 10)
        if intensity > 0:
            gradient = draw.radial_gradient((width//2, i//2), [MIDNIGHT, ACCENT_CYAN, ELECTRIC_GREEN])
            draw.ellipse((j, i), radius=100, fill=gradient)

# Draw vertical grid lines (subtle)
for x in range(30, width - 30, 10):
    draw.line([(x, 0), (x, height)], fill=(40, 50, 70), width=1)

for x in range(30, width - 30, 13):
    draw.line([(x, 0), (x, height)], fill=(40, 50, 70), width=1)

# Draw horizontal grid lines
for y in range(30, height - 30, 15):
    draw.line([(0, y), (width, y)], fill=(40, 50, 70), width=1)

for y in range(30, height - 30, 20):
    draw.line([(0, y), (width, y)], fill=(40, 50, 70), width=1)

# Title area
try:
    title_font = ImageFont.truetype("/c/Windows/Fonts/Arial.ttf")
except:
    title_font = ImageFont.load_default()

# Small title at top
draw.text("PULSE", (180, 25), font=title_font, fill=(100, 180, 200), anchor="mm", font_size=14)
draw.text("HIERARCHY", (180, 45), font=title_font, fill=(0, 160, 180), anchor="mm", font_size=10)

# Subtitle
draw.text("Market Limit-Up Ladder Visualization", (180, 65), font=title_font, fill=(80, 100, 120), anchor="mm", font_size=8)

# Stats cards
stats_y = 90
stats = [
    ("UP", "2,847", ELECTRIC_GREEN),
    ("DOWN", "1,256", ALERT_RED),
    ("LIMIT", "53", GLOW_RED),
    ("SCORE", "78", WARNING_AMBER)
]

card_width = 70
card_start_x = 30
for i in range(4):
    stat = stats[i]
    x = card_start_x + i * (card_width + 15)
    y = stats_y

    # Card background with glow
    glow_color = DUSK_BLUE
    draw.rounded_rectangle(x, y, card_width, 55, fill=glow_color, radius=8)

    # Value
    draw.text(stat[1], (x + 25, y + 20), font=title_font, fill=stat[2], anchor="mm", font_size=16)

    # Label
    draw.text(stat[0], (x + 25, y + 45), font=title_font, fill=(100, 150, 180), anchor="mm", font_size=9)

stats_y += 70

# Main ladder visualization
ladder_y = 170
ladder_levels = [
    (3, "3L", "4 stocks", [(255, 70, 90), (230, 50, 70)]),
    (2, "2L", "27 stocks", [(240, 160, 60), (200, 100, 50)]),
    (1, "1L", "22 stocks", [(50, 200, 130), (100, 180, 200)])
]

# Ladder section background
ladder_bg = draw.rounded_rectangle(20, ladder_y, 350, 500, fill=(12, 16, 24), radius=12)

# Draw each level
for level_data in ladder_levels:
    level, title, count, colors = level_data
    color1, color2 = colors

    # Level badge
    badge_color = color1
    draw.rounded_rectangle(30, ladder_y, 60, 60, fill=badge_color, radius=8)
    draw.text(str(level), (35, ladder_y + 15), font=title_font, fill="white", anchor="mm", font_size=20)

    # Level title
    draw.text(title, (105, ladder_y + 10), font=title_font, fill="white", anchor="mm", font_size=14)

    # Count
    draw.text(count, (200, ladder_y + 15), font=title_font, fill=color2, anchor="mm", font_size=10)

    # Stocks preview (simplified rectangles)
    stock_x = 35
    for i in range(4):
        draw.rounded_rectangle(110, ladder_y + 35 + stock_x, 50, 15, fill=color1, radius=4)
        draw.text(f"+{10.0}%", (115, ladder_y + stock_x + 8), font=title_font, fill="white", anchor="mm", font_size=7)
        stock_x += 20

    ladder_y += 80

# Bottom info bar
info_y = ladder_y + 100
draw.text("53 TOTAL", (21, info_y + 10), font=title_font, fill=(80, 120, 140), anchor="mm", font_size=9)
draw.text("2,534 B", (100, info_y + 10), font=title_font, fill=(60, 90, 110), anchor="mm", font_size=9)
draw.text("source: NLP API", (180, info_y + 10), font=title_font, fill=(60, 90, 110), anchor="mm", font_size=8)
draw.text("Updated: 12:32:48", (280, info_y + 10), font=title_font, fill=(60, 90, 110), anchor="mm", font_size=7)

# Save the image
output_path = 'D:/your-mcp-proxy/AITY_VIP/docs/design/canvas-output/market-center-pulse-hierarchy.png'
img.save(output_path)
print(f"Canvas created: {output_path}")
