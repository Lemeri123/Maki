/**
 * HUD — heads-up display for Pixel Pals
 *
 * Shows fragment count, active quest name, and current location.
 * Also manages the inventory overlay (Memory Archive).
 */

import { buildFragmentText, buildQuestText } from '../logic/HUDLogic.js'
import fragments from '../data/fragments.js'
import GameState from '../state/GameState.js'

export class HUD {
  /**
   * @param {Phaser.Scene} scene - The scene to attach HUD elements to
   */
  constructor(scene) {
    this._scene = scene
    this._inventoryOpen = false
    this._inventoryPanel = null
    this._inventoryOverlay = null

    const style = {
      fontSize: '13px',
      fill: '#ffffff',
      backgroundColor: '#00000088',
      padding: { x: 6, y: 3 },
    }

    this._fragmentText = scene.add.text(10, 10, 'Memories: 0 / 8', style)
      .setScrollFactor(0).setDepth(200)

    this._questText = scene.add.text(10, 32, '', style)
      .setScrollFactor(0).setDepth(200)

    this._locationText = scene.add.text(10, 54, 'Maplewood', style)
      .setScrollFactor(0).setDepth(200)
  }

  /**
   * Refreshes all HUD text from the given game state.
   * Call this once per frame (or whenever state changes).
   *
   * @param {object} gameState - Current GameState
   */
  update(gameState) {
    this._fragmentText.setText(buildFragmentText(gameState))
    const qt = buildQuestText(gameState)
    this._questText.setText(qt ? `Quest: ${qt}` : '')
    this._locationText.setText(this._getLocationName(gameState.currentLocation))
  }

  /** Shows all HUD elements. */
  show() {
    this._fragmentText.setVisible(true)
    this._questText.setVisible(true)
    this._locationText.setVisible(true)
  }

  /** Hides all HUD elements (e.g. during cutscenes). */
  hide() {
    this._fragmentText.setVisible(false)
    this._questText.setVisible(false)
    this._locationText.setVisible(false)
  }

  /** @returns {boolean} Whether the inventory panel is currently open */
  isInventoryOpen() {
    return this._inventoryOpen
  }

  /**
   * Opens the Memory Archive inventory overlay.
   * No-op if already open.
   */
  openInventory() {
    if (this._inventoryOpen) return
    this._inventoryOpen = true

    // Build inventory text from collected fragments
    const collected = GameState.fragments.collected
    let content = '=== Memory Archive ===\n\n'
    if (collected.length === 0) {
      content += 'No memories collected yet.'
    } else {
      for (const id of collected) {
        const def = fragments.find(f => f.id === id)
        if (def) content += `• ${def.text}\n\n`
      }
    }
    content += '\n[I / ESC] Close'

    // Dark overlay
    this._inventoryOverlay = this._scene.add.rectangle(400, 300, 800, 600, 0x000000, 0.85)
      .setScrollFactor(0).setDepth(300)

    this._inventoryPanel = this._scene.add.text(80, 60, content, {
      fontSize: '13px',
      fill: '#ffffff',
      wordWrap: { width: 640 },
      lineSpacing: 4,
    }).setScrollFactor(0).setDepth(301)
  }

  /**
   * Closes the Memory Archive inventory overlay.
   * No-op if already closed.
   */
  closeInventory() {
    if (!this._inventoryOpen) return
    this._inventoryOpen = false
    if (this._inventoryOverlay) {
      this._inventoryOverlay.destroy()
      this._inventoryOverlay = null
    }
    if (this._inventoryPanel) {
      this._inventoryPanel.destroy()
      this._inventoryPanel = null
    }
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  _getLocationName(loc) {
    const names = {
      town: 'Maplewood',
      library: 'Maplewood Library',
      cafe: 'The Foggy Cup Café',
    }
    return names[loc] ?? loc
  }
}

export default HUD
