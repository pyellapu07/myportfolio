#!/usr/bin/env python3
"""Video thumbnails, AIRLA-style: a screen recording inside a desktop window,
set on a terracotta gradient, exported as a short silent loop.

    # From a screen recording (trimmed to --start/--duration):
    python3 scripts/video-thumb.py --video ~/jeevy.mp4 --start 2 --duration 12 --out public/thumbs/jeevy-os
    # A project with its own colours: --palette xylem (see PALETTES)

    # Or from still screenshots (slow pan + crossfade between them):
    python3 scripts/video-thumb.py --images public/jeevy/a.webp public/jeevy/b.webp --out public/thumbs/jeevy-os

Writes <out>.mp4 (H.264), <out>.webm (VP9; the site tries it first) and <out>-poster.webp.
Needs Pillow and ffmpeg.
"""
import argparse
import math
import os
import subprocess
import tempfile

from PIL import Image, ImageDraw, ImageFilter

W, H = 1280, 800  # output, 16:10 like the other thumbnails
FPS = 30
BAR = 34  # title bar height
RADIUS = 14
# The window, set by layout(): for a 16:10 screen it sits low and bleeds off
# the bottom edge; a wider recording keeps its own shape and sits centred.
WIN_W = WIN_X = WIN_Y = CONTENT_W = CONTENT_H = 0


def layout(aspect):
    global WIN_W, WIN_X, WIN_Y, CONTENT_W, CONTENT_H
    wide = aspect > 1.75 or W / H < 1.4  # wide recording, or a squarer canvas
    WIN_W = int(W * (0.86 if W / H >= 1.4 else 0.84) if wide else W * 0.8)
    WIN_X = (W - WIN_W) // 2
    CONTENT_W = WIN_W
    CONTENT_H = round(CONTENT_W / aspect)
    WIN_Y = (H - BAR - CONTENT_H) // 2 + 24 if wide else int(H * 0.14)


# Background palettes, each a project's own colours: (light top-left, mid,
# deep bottom-right, bloom behind the window, bloom strength 0-255).
PALETTES = {
    # Jeevy: terracotta.
    "terracotta": ((244, 176, 140), (214, 112, 78), (176, 74, 48), (255, 214, 190), 90),
    # Xylem Lab, light: its beige (#EFE7DA) to a pale lime, settling into a
    # soft leaf green, with a near-white glow behind the window.
    "xylem": ((246, 241, 230), (228, 233, 178), (176, 204, 120), (252, 252, 236), 95),
}
PALETTE = PALETTES["terracotta"]


def gradient_bg():
    """Diagonal gradient: light at the top-left, deep at the bottom-right."""
    bg = Image.new("RGB", (W, H))
    px = bg.load()
    light, mid, deep, bloom, bloom_a = PALETTE
    for y in range(H):
        for x in range(W):
            t = (x / W) * 0.45 + (y / H) * 0.55  # diagonal
            if t < 0.5:
                u = t / 0.5
                c = [light[i] + (mid[i] - light[i]) * u for i in range(3)]
            else:
                u = (t - 0.5) / 0.5
                c = [mid[i] + (deep[i] - mid[i]) * u for i in range(3)]
            px[x, y] = tuple(int(v) for v in c)
    # A soft bloom behind the window so it lifts off the colour.
    glow = Image.new("L", (W, H), 0)
    ImageDraw.Draw(glow).ellipse((W * 0.2, H * 0.25, W * 0.8, H * 1.1), fill=bloom_a)
    glow = glow.filter(ImageFilter.GaussianBlur(120))
    bg = Image.composite(Image.new("RGB", (W, H), bloom), bg, glow)
    return bg


def window_layers():
    """Chrome (shadow, title bar) under the content, and a mask for the content."""
    win_h = BAR + CONTENT_H
    under = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    # Shadow.
    sh = Image.new("L", (W, H), 0)
    ImageDraw.Draw(sh).rounded_rectangle((WIN_X, WIN_Y + 18, WIN_X + WIN_W, WIN_Y + win_h + 18), RADIUS, fill=110)
    sh = sh.filter(ImageFilter.GaussianBlur(28))
    under.paste((60, 20, 10, 255), (0, 0), sh)
    # Window body and title bar.
    d = ImageDraw.Draw(under)
    d.rounded_rectangle((WIN_X, WIN_Y, WIN_X + WIN_W, WIN_Y + win_h), RADIUS, fill=(246, 245, 243, 255))
    d.line((WIN_X, WIN_Y + BAR, WIN_X + WIN_W, WIN_Y + BAR), fill=(226, 224, 220, 255), width=1)
    for i, col in enumerate([(255, 95, 87), (254, 188, 46), (40, 200, 64)]):
        cx, cy = WIN_X + 20 + i * 18, WIN_Y + BAR // 2
        d.ellipse((cx - 5, cy - 5, cx + 5, cy + 5), fill=col + (255,))
    # Content mask: square top (under the bar), rounded bottom corners.
    mask = Image.new("L", (CONTENT_W, CONTENT_H), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle((0, -RADIUS, CONTENT_W, CONTENT_H), RADIUS, fill=255)
    return under, mask


def fit(img, w, h, zoom=1.0, fx=0.5, fy=0.0):
    """Cover-crop img to w×h at a zoom, focused on (fx, fy) of the spare area."""
    s = max(w / img.width, h / img.height) * zoom
    r = img.resize((math.ceil(img.width * s), math.ceil(img.height * s)), Image.LANCZOS)
    x = int((r.width - w) * fx)
    y = int((r.height - h) * fy)
    return r.crop((x, y, x + w, y + h))


def slideshow(paths, seconds_each=2.6, fade=0.45):
    """Frames for stills: each pans slowly, crossfading into the next."""
    imgs = [Image.open(p).convert("RGB") for p in paths]
    per = int(seconds_each * FPS)
    nf = int(fade * FPS)
    total = per * len(imgs)
    ease = lambda u: u * u * (3 - 2 * u)
    for f in range(total):
        i, k = divmod(f, per)
        u = k / per
        cur = fit(imgs[i], CONTENT_W, CONTENT_H, 1.06 - 0.06 * ease(u), 0.5, 0.15 * u)
        if k >= per - nf:  # crossfade into the next (wraps, so the loop is seamless)
            nxt = fit(imgs[(i + 1) % len(imgs)], CONTENT_W, CONTENT_H, 1.06, 0.5, 0.0)
            cur = Image.blend(cur, nxt, ease((k - (per - nf)) / nf))
        yield cur


def probe_aspect(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
                          "-of", "csv=p=0", path], capture_output=True, text=True, check=True).stdout.strip()
    w, h = (int(v) for v in out.split(",")[:2])
    return w / h


def video_frames(path, start, duration, speed, loop_fade, tmp):
    """Frames from a recording, fitted to the screen, slowed by `speed`, with
    the end crossfaded into the start so the loop has no jump."""
    pat = os.path.join(tmp, "src_%05d.png")
    subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-y", "-ss", str(start), "-t", str(duration), "-i", path,
         "-vf", f"setpts=PTS/{speed},fps={FPS},scale={CONTENT_W}:{CONTENT_H}:force_original_aspect_ratio=increase:flags=lanczos,crop={CONTENT_W}:{CONTENT_H}",
         pat], check=True)
    names = sorted(n for n in os.listdir(tmp) if n.startswith("src_"))
    load = lambda i: Image.open(os.path.join(tmp, names[i])).convert("RGB")
    total = len(names)
    nf = min(int(loop_fade * FPS), total // 3)
    # Play frames nf..end; over the last nf, blend towards frames 0..nf-1, so
    # the last frame leads straight into frame nf at the top of the loop.
    for i in range(nf, total):
        j = i - (total - nf)
        yield Image.blend(load(i), load(j), (j + 1) / nf) if j >= 0 else load(i)


def main():
    ap = argparse.ArgumentParser()
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument("--video")
    src.add_argument("--images", nargs="+")
    ap.add_argument("--start", type=float, default=0)
    ap.add_argument("--duration", type=float, default=12)
    ap.add_argument("--speed", type=float, default=1.0, help="playback speed, e.g. 0.75 to slow a short clip")
    ap.add_argument("--loop-fade", type=float, default=0.5, help="seconds of end-to-start crossfade")
    ap.add_argument("--out", required=True)
    ap.add_argument("--palette", choices=sorted(PALETTES), default="terracotta")
    ap.add_argument("--size", default="1280x800", help="canvas WxH, e.g. 1100x1000 for a squarer card")
    a = ap.parse_args()

    global W, H, PALETTE
    PALETTE = PALETTES[a.palette]
    W, H = (int(v) for v in a.size.lower().split("x"))
    layout(probe_aspect(a.video) if a.video else 16 / 10)
    bg = gradient_bg()
    under, mask = window_layers()
    base = bg.convert("RGBA")
    base.alpha_composite(under)
    base = base.convert("RGB")

    with tempfile.TemporaryDirectory() as tmp:
        frames = video_frames(a.video, a.start, a.duration, a.speed, a.loop_fade, tmp) if a.video else slideshow(a.images)
        for n, content in enumerate(frames):
            frame = base.copy()
            frame.paste(content, (WIN_X, WIN_Y + BAR), mask)
            frame.save(os.path.join(tmp, f"out_{n:05d}.png"))
            if n == 10:  # poster: an early frame, past any fade-in
                frame.save(f"{a.out}-poster.webp", "WEBP", quality=82)
        pat = os.path.join(tmp, "out_%05d.png")
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-framerate", str(FPS), "-i", pat,
                        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "26", "-preset", "slow",
                        "-movflags", "+faststart", "-an", f"{a.out}.mp4"], check=True)
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", f"{a.out}.mp4", "-c:v", "libvpx-vp9", "-b:v", "0",
                        "-crf", "42", "-row-mt", "1", "-deadline", "good", "-an", f"{a.out}.webm"], check=True)
    for ext in (".mp4", ".webm", "-poster.webp"):
        print(f"{a.out}{ext}", os.path.getsize(f"{a.out}{ext}") // 1024, "KB")


if __name__ == "__main__":
    main()
