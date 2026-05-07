/**
 * TownRenderer — draws the Maplewood town layout using Phaser graphics.
 *
 * Renders buildings, paths, the fountain, decorations, and entrance markers
 * directly onto the scene so the town looks like an actual place rather than
 * an empty dark field.
 *
 * All coordinates are in world pixels (16px per tile, 50×50 tile map = 800×800px).
 */

export class TownRenderer {
  constructor(scene) {
    this._scene = scene
    this._draw()
  }

  _draw() {
    const s = this._scene

    // ── Ground / grass base ──────────────────────────────────────────────────
    const ground = s.add.graphics().setDepth(0)
    // Dark grass fill for the whole map
    ground.fillStyle(0x1a2e1a, 1)
    ground.fillRect(0, 0, 800, 800)

    // Lighter grass patches for variety
    ground.fillStyle(0x1e3520, 1)
    for (const [x, y, w, h] of [
      [50, 50, 200, 150], [300, 100, 180, 120], [500, 50, 200, 180],
      [100, 350, 160, 200], [400, 300, 200, 180], [600, 400, 160, 200],
      [50, 600, 250, 160], [400, 550, 200, 200], [650, 600, 130, 160],
    ]) {
      ground.fillRect(x, y, w, h)
    }

    // ── Stone paths ──────────────────────────────────────────────────────────
    const paths = s.add.graphics().setDepth(1)
    paths.fillStyle(0x4a4a5a, 1)

    // Main horizontal path across the middle
    paths.fillRect(0, 370, 800, 24)
    // Main vertical path
    paths.fillRect(370, 0, 24, 800)
    // Path to library (top-left area)
    paths.fillRect(160, 160, 24, 210)
    paths.fillRect(160, 160, 120, 24)
    // Path to café (right area)
    paths.fillRect(544, 320, 56, 24)
    paths.fillRect(544, 320, 24, 80)
    // Path to Old Pete (bottom-left)
    paths.fillRect(80, 460, 24, 120)
    paths.fillRect(80, 460, 100, 24)

    // Path edge highlights
    paths.fillStyle(0x5a5a6a, 1)
    paths.fillRect(0, 368, 800, 3)
    paths.fillRect(0, 394, 800, 3)
    paths.fillRect(368, 0, 3, 800)
    paths.fillRect(394, 0, 3, 800)

    // ── Fountain (town center) ───────────────────────────────────────────────
    this._drawFountain(s, 382, 382)

    // ── Library building ─────────────────────────────────────────────────────
    this._drawBuilding(s, 144, 112, 96, 80, 0x2a3a5a, 0x3a4a7a, 'Library', 0x88aaff)

    // ── Café building ────────────────────────────────────────────────────────
    this._drawBuilding(s, 528, 272, 96, 80, 0x3a2a1a, 0x5a3a2a, 'Café', 0xff9966)

    // ── Town Hall (decorative, center-top) ───────────────────────────────────
    this._drawBuilding(s, 352, 80, 80, 64, 0x3a2a4a, 0x5a3a6a, 'Town Hall', 0xffdd88)

    // ── Pete's fishing hut (bottom-left) ─────────────────────────────────────
    this._drawBuilding(s, 64, 464, 64, 48, 0x2a3a2a, 0x3a5a3a, "Pete's Hut", 0x99ff99)

    // ── Decorative trees ─────────────────────────────────────────────────────
    const trees = s.add.graphics().setDepth(2)
    for (const [x, y] of [
      [60, 60], [120, 80], [700, 60], [740, 100], [60, 700], [100, 740],
      [700, 700], [740, 660], [280, 140], [460, 140], [280, 600], [500, 620],
      [640, 280], [660, 560], [140, 300], [160, 500],
    ]) {
      this._drawTree(trees, x, y)
    }

    // ── Flower patches ───────────────────────────────────────────────────────
    const flowers = s.add.graphics().setDepth(2)
    const FLOWER_COLORS = [0xff6688, 0xffaa44, 0xffff66, 0xaa88ff, 0x88ffcc]
    for (const [x, y] of [
      [340, 340], [420, 340], [340, 420], [420, 420],
      [220, 200], [240, 220], [580, 200], [600, 220],
      [200, 560], [220, 580], [560, 560], [580, 580],
    ]) {
      flowers.fillStyle(FLOWER_COLORS[Math.floor((x + y) % FLOWER_COLORS.length)], 1)
      flowers.fillCircle(x, y, 4)
      flowers.fillStyle(0xffff88, 1)
      flowers.fillCircle(x, y, 2)
    }

    // ── Well (near town hall) ────────────────────────────────────────────────
    this._drawWell(s, 460, 120)

    // ── Bench near fountain ──────────────────────────────────────────────────
    this._drawBench(s, 330, 382)
    this._drawBench(s, 450, 382)

    // ── Building entrance markers ────────────────────────────────────────────
    // These show players where to walk to enter buildings
    const markers = s.add.graphics().setDepth(3)
    markers.fillStyle(0x88aaff, 0.4)
    markers.fillRect(184, 188, 16, 8)   // library door
    markers.fillStyle(0xff9966, 0.4)
    markers.fillRect(568, 348, 16, 8)   // café door

    // Door labels
    s.add.text(192, 182, '▼', { fontSize: '10px', fill: '#88aaff' }).setOrigin(0.5).setDepth(4)
    s.add.text(576, 342, '▼', { fontSize: '10px', fill: '#ff9966' }).setOrigin(0.5).setDepth(4)
  }

  _drawBuilding(scene, x, y, w, h, wallColor, roofColor, label, labelColor) {
    const g = scene.add.graphics().setDepth(3)

    // Shadow
    g.fillStyle(0x000000, 0.3)
    g.fillRect(x + 4, y + 4, w, h)

    // Wall
    g.fillStyle(wallColor, 1)
    g.fillRect(x, y, w, h)

    // Roof (top strip)
    g.fillStyle(roofColor, 1)
    g.fillRect(x, y, w, 14)

    // Roof ridge line
    g.fillStyle(0xffffff, 0.15)
    g.fillRect(x, y, w, 2)

    // Door
    g.fillStyle(0x1a1a1a, 1)
    const doorW = 12, doorH = 18
    const doorX = x + w / 2 - doorW / 2
    g.fillRect(doorX, y + h - doorH, doorW, doorH)

    // Door handle
    g.fillStyle(0xffdd88, 1)
    g.fillCircle(doorX + doorW - 3, y + h - doorH / 2, 2)

    // Windows
    g.fillStyle(0x88ccff, 0.6)
    g.fillRect(x + 8, y + 20, 14, 12)
    g.fillRect(x + w - 22, y + 20, 14, 12)

    // Window cross
    g.fillStyle(wallColor, 1)
    g.fillRect(x + 8, y + 25, 14, 2)
    g.fillRect(x + 14, y + 20, 2, 12)
    g.fillRect(x + w - 22, y + 25, 14, 2)
    g.fillRect(x + w - 16, y + 20, 2, 12)

    // Border
    g.lineStyle(1, 0xffffff, 0.2)
    g.strokeRect(x, y, w, h)

    // Label
    scene.add.text(x + w / 2, y - 8, label, {
      fontSize: '9px', fill: `#${labelColor.toString(16).padStart(6, '0')}`,
      backgroundColor: '#00000099', padding: { x: 3, y: 1 }
    }).setOrigin(0.5, 1).setDepth(4)
  }

  _drawFountain(scene, cx, cy) {
    const g = scene.add.graphics().setDepth(3)

    // Outer basin
    g.fillStyle(0x3a4a6a, 1)
    g.fillCircle(cx, cy, 28)

    // Water
    g.fillStyle(0x4488cc, 0.8)
    g.fillCircle(cx, cy, 22)

    // Water shimmer
    g.fillStyle(0x66aaee, 0.5)
    g.fillCircle(cx - 6, cy - 4, 8)
    g.fillCircle(cx + 8, cy + 6, 5)

    // Center pillar
    g.fillStyle(0x5a6a8a, 1)
    g.fillCircle(cx, cy, 6)

    // Water spout top
    g.fillStyle(0x88ccff, 0.9)
    g.fillCircle(cx, cy - 2, 3)

    // Basin rim highlight
    g.lineStyle(2, 0x6688aa, 0.8)
    g.strokeCircle(cx, cy, 28)

    scene.add.text(cx, cy + 36, 'Fountain', {
      fontSize: '8px', fill: '#6688aa', backgroundColor: '#00000088', padding: { x: 2, y: 1 }
    }).setOrigin(0.5).setDepth(4)
  }

  _drawTree(g, x, y) {
    // Trunk
    g.fillStyle(0x5a3a1a, 1)
    g.fillRect(x - 3, y, 6, 10)
    // Canopy layers
    g.fillStyle(0x1a4a1a, 1)
    g.fillTriangle(x, y - 20, x - 14, y + 2, x + 14, y + 2)
    g.fillStyle(0x226622, 1)
    g.fillTriangle(x, y - 28, x - 10, y - 8, x + 10, y - 8)
    g.fillStyle(0x2a7a2a, 1)
    g.fillTriangle(x, y - 34, x - 7, y - 18, x + 7, y - 18)
  }

  _drawWell(scene, x, y) {
    const g = scene.add.graphics().setDepth(3)
    // Base
    g.fillStyle(0x4a4a5a, 1)
    g.fillCircle(x, y, 12)
    g.fillStyle(0x2a2a3a, 1)
    g.fillCircle(x, y, 8)
    // Roof posts
    g.fillStyle(0x5a3a1a, 1)
    g.fillRect(x - 14, y - 18, 4, 18)
    g.fillRect(x + 10, y - 18, 4, 18)
    // Roof
    g.fillStyle(0x3a2a1a, 1)
    g.fillTriangle(x, y - 28, x - 18, y - 16, x + 18, y - 16)
    g.lineStyle(1, 0x6a5a3a, 0.6)
    g.strokeCircle(x, y, 12)
  }

  _drawBench(scene, x, y) {
    const g = scene.add.graphics().setDepth(3)
    g.fillStyle(0x5a3a1a, 1)
    g.fillRect(x - 14, y - 3, 28, 5)   // seat
    g.fillRect(x - 12, y + 2, 4, 6)    // left leg
    g.fillRect(x + 8, y + 2, 4, 6)     // right leg
    g.fillStyle(0x4a2a0a, 1)
    g.fillRect(x - 14, y - 8, 28, 4)   // backrest
  }
}

export default TownRenderer
