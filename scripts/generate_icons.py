import os
from PIL import Image, ImageDraw, ImageFont

icons_dir = os.path.join("src-tauri", "icons")
os.makedirs(icons_dir, exist_ok=True)

# Tạo ảnh 512x512 gradient/blue bo tròn với chữ Hán '汉'
size = (512, 512)
img = Image.new("RGBA", size, (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Vẽ nền bo góc màu xanh blue-600 (#2563eb)
box = [16, 16, 496, 496]
draw.rounded_rectangle(box, radius=96, fill=(37, 99, 235, 255))

# Thử nạp font hoặc vẽ ký hiệu
try:
    font = ImageFont.truetype("msyh.ttc", 260) # Microsoft YaHei font on Windows
    # Vẽ chữ '汉' căn giữa
    draw.text((256, 230), "汉", font=font, fill=(255, 255, 255, 255), anchor="mm")
except Exception as e:
    print("Font fallback:", e)
    draw.rectangle([120, 120, 392, 392], fill=(255, 255, 255, 255))

# Lưu app-icon.png
img.save("app-icon.png")

# Tạo các kích thước cần thiết cho Tauri
img.resize((32, 32), Image.Resampling.LANCZOS).save(os.path.join(icons_dir, "32x32.png"))
img.resize((128, 128), Image.Resampling.LANCZOS).save(os.path.join(icons_dir, "128x128.png"))
img.resize((256, 256), Image.Resampling.LANCZOS).save(os.path.join(icons_dir, "128x128@2x.png"))
img.resize((512, 512), Image.Resampling.LANCZOS).save(os.path.join(icons_dir, "icon.png"))

# Tạo icon.ico chứa nhiều kích thước (16, 32, 48, 64, 128, 256)
ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
img.save(os.path.join(icons_dir, "icon.ico"), format="ICO", sizes=ico_sizes)

# Tạo icon.icns rỗng hoặc dummy
with open(os.path.join(icons_dir, "icon.icns"), "wb") as f:
    f.write(b"")

print("Generated all icons successfully!")
