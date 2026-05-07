/**
 * FragmentSystem — Phaser-aware fragment spawning and collection
 *
 * Spawns collectible memory fragment sprites on the map and handles
 * overlap detection with the player. Uses FragmentLogic for pure state updates.
 */

import { collectFragment, getSpawnableFragments } from '../logic/FragmentLogic.js'
import GameState from '../state/GameState.js'

export class FragmentSystem {
  /**
   * @param {Phaser.Scene} scene - The scene to spawn fragments in
   * @param {Phaser.GameObjects.Sprite} playerSprite - The player physics body
   */
  constructor(scene, playerSprite) {
    this._scene = scene
    this._playerSprite = playerSprite
    this._group = scene.physics.add.staticGroup()
  }

  /**
   * Spawns all uncollected fragments from the given definitions array.
   * Sets up overlap detection with the player sprite.
   *
   * @param {{ id: string, x: number, y: number, text: string }[]} definitions
   */
  spawnFragments(definitions) {
    const spawnable = getSpawnableFragments(definitions, GameState.fragments.collected)
    for (const def of spawnable) {
      // Use a simple circle graphic as the fragment sprite (no external asset needed)
      const gfx = this._scene.add.graphics()
      gfx.fillStyle(0xffdd44, 1)
      gfx.fillCircle(8, 8, 8)
      gfx.generateTexture('fragment_tex', 16, 16)
      gfx.destroy()

      const sprite = this._scene.physics.add.staticImage(def.x, def.y, 'fragment_tex')
      sprite.setData('fragmentDef', def)
      this._group.add(sprite)
    }

    this._scene.physics.add.overlap(
      this._playerSprite,
      this._group,
      (player, fragmentSprite) => this._onCollect(fragmentSprite)
    )
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  _onCollect(fragmentSprite) {
    const def = fragmentSprite.getData('fragmentDef')
    if (!def) return

    collectFragment(GameState.fragments, def.id)
    fragmentSprite.destroy()

    // Show pop-up memory text
    const popup = this._scene.add.text(
      fragmentSprite.x - 100, fragmentSprite.y - 40,
      def.text,
      {
        fontSize: '11px',
        fill: '#ffdd44',
        wordWrap: { width: 220 },
        backgroundColor: '#000000cc',
        padding: { x: 6, y: 4 },
      }
    ).setDepth(90)

    this._scene.time.delayedCall(2500, () => popup.destroy())

    // Play chime SFX if available
    if (this._scene.sound && this._scene.cache.audio.has('sfx_chime')) {
      this._scene.sound.play('sfx_chime')
    }
  }
}

export default FragmentSystem
