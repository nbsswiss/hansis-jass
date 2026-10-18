# Erzeugt die App-Icons (PNG) ohne Zusatzbibliotheken: zwei gefächerte Karten auf Filz.
import math, struct, zlib, os, sys

def png(path, w, h, rgb):
    raw = b''.join(b'\x00' + bytes(rgb[y * w * 3:(y + 1) * w * 3]) for y in range(h))
    def chunk(t, d):
        return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    with open(path, 'wb') as f:
        f.write(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0))
                + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b''))

def heart(x, y):  # Einheitsherz, Spitze unten
    y = -y
    return (x * x + y * y - 1) ** 3 - x * x * y ** 3 <= 0

def spade(x, y):
    if heart(x, -y + 0.25):
        return True
    return 0.5 < y < 1.75 and abs(x) < 0.08 + max(0.0, y - 1.15) * 0.75

def card_shape(px, py, cx, cy, ang, cw, ch, r):
    s, c = math.sin(-ang), math.cos(-ang)
    dx, dy = px - cx, py - cy
    x, y = dx * c - dy * s, dx * s + dy * c
    qx, qy = abs(x) - (cw / 2 - r), abs(y) - (ch / 2 - r)
    inside = math.hypot(max(qx, 0), max(qy, 0)) <= r and not (qx > 0 and qy > 0 and math.hypot(qx, qy) > r)
    if qx <= 0 or qy <= 0:
        inside = abs(x) <= cw / 2 and abs(y) <= ch / 2
    return inside, x, y

def render(size):
    S = 2
    W = size * S
    bg_top, bg_bot = (27, 107, 68), (11, 61, 36)
    cards = [
        (0.42, 0.52, -0.22, 'heart', (200, 16, 46)),
        (0.58, 0.50, 0.20, 'spade', (29, 29, 31)),
    ]
    cw, ch, r = 0.40, 0.58, 0.045
    acc = [0] * (size * size * 3)
    for Y in range(W):
        for X in range(W):
            px, py = (X + 0.5) / W, (Y + 0.5) / W
            t = py
            col = [bg_top[i] * (1 - t) + bg_bot[i] * t for i in range(3)]
            for cx, cy, ang, sym, scol in cards:
                # Schatten
                ins, _, _ = card_shape(px - 0.012, py - 0.018, cx, cy, ang, cw, ch, r)
                if ins:
                    col = [v * 0.6 for v in col]
                ins, x, y = card_shape(px, py, cx, cy, ang, cw, ch, r)
                if ins:
                    col = [255, 253, 247]
                    edge = min(cw / 2 - abs(x), ch / 2 - abs(y))
                    if edge < 0.006:
                        col = [200, 195, 185]
                    k = 0.105
                    ox = -0.07 if sym == 'heart' else 0.0
                    if (heart if sym == 'heart' else spade)((x - ox) / k, (y + 0.03) / k):
                        col = list(scol)
            i = ((Y // S) * size + (X // S)) * 3
            for j in range(3):
                acc[i + j] += col[j]
    return [min(255, int(v / (S * S) + 0.5)) for v in acc]

out = sys.argv[1]
for name, size in [('icon-512.png', 512), ('icon-192.png', 192), ('apple-touch-icon.png', 180)]:
    png(os.path.join(out, name), size, size, render(size))
    print('geschrieben', name)
