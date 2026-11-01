"""Tiles the frames from contact-sheet.mjs into labelled sheets of 20, one row of 5 per 10 seconds."""
import sys
from pathlib import Path

from PIL import Image, ImageDraw

every = int(sys.argv[1]) if len(sys.argv) > 1 else 60
start = int(sys.argv[2]) if len(sys.argv) > 2 else 0
frames = sorted(Path("out/contact").glob("element-*.jpeg"))
W, H, COLS, PER = 384, 216, 5, 20
for sheet in range(0, len(frames), PER):
    batch = frames[sheet : sheet + PER]
    rows = (len(batch) + COLS - 1) // COLS
    img = Image.new("RGB", (W * COLS, (H + 22) * rows), "white")
    draw = ImageDraw.Draw(img)
    for i, f in enumerate(batch):
        x, y = (i % COLS) * W, (i // COLS) * (H + 22)
        img.paste(Image.open(f).resize((W, H)), (x, y + 22))
        frame = start + (sheet + i) * every
        draw.text((x + 6, y + 4), f"f{frame}  {frame // 30 // 60}:{frame // 30 % 60:02d}", fill="black")
    out = Path(f"out/sheet-{sheet // PER + 1}.png")
    img.save(out)
    print(out)
