/**
 * FogOverlay — animated fog effect drawn over the tilemap
 *
 * Sits above the tilemap (depth 50) but below the HUD (depth 200).
 * Alpha decreases as the player collects more memory fragments,
 * using FogLogic for the pure computation.
 */

import { computeFogAlpha } from '../logic/FogLogic.js'

export class FogOverlay {
  /**
   * @param {Phaser.Scene} scene - The scene to draw the fog in
   * @param {number} mapWidth - Width of the map in pixels
   * @param {number} mapHeight - Height of the map in pixels
   */
  constructor(scene, mapWidth, mapHeight) {
    this._scene = scene
    this._initialAlpha = 0.25
    this._currentAlpha = this._initialAlpha

    this._rect = scene.add.graphics()
    this._rect.setDepth(50) // above tilemap, below HUD
    this._drawFog(mapWidth, mapHeight, this._initialAlpha)

    this._mapWidth = mapWidth
    this._mapHeight = mapHeight
  }

  /**
   * Smoothly tweens the fog to the given alpha over 500ms.
   * @param {number} alpha - Target alpha value (0–1)
   */
  setOpacity(alpha) {
    this._scene.tweens.add({
      targets: this,
      _currentAlpha: alpha,
      duration: 500,
      onUpdate: () => {
        this._drawFog(this._mapWidth, this._mapHeight, this._currentAlpha)
      },
    })
  }

  /**
   * Recomputes the target fog alpha based on collected fragment count
   * and triggers a tween if the value has changed meaningfully.
   *
   * @param {number} collectedCount - Number of fragments collected so far
   * @param {number} total - Total number of fragments in the game
   */
  updateForFragments(collectedCount, total) {
    const target = computeFogAlpha(collectedCount, total, this._initialAlpha)
    if (Math.abs(target - this._currentAlpha) > 0.01) {
      this.setOpacity(target)
    }
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  _drawFog(w, h, alpha) {
    this._rect.clear()
    this._rect.fillStyle(0x0a0a1a, alpha)
    this._rect.fillRect(0, 0, w, h)
  }
}

export default FogOverlay
