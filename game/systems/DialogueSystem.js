/**
 * DialogueSystem — Phaser-aware wrapper around DialogueLogic
 *
 * Creates a speech bubble UI using Phaser GameObjects (Graphics + Text).
 * All UI elements use setScrollFactor(0) so they stay fixed on screen.
 */

import { DialogueLogic } from '../logic/DialogueLogic.js'
import GameState from '../state/GameState.js'

export class DialogueSystem {
  constructor(scene) {
    this._scene = scene
    this._logic = null
    this._currentNpc = null

    // Background bubble
    this._bubble = scene.add.graphics()
    this._bubble.setScrollFactor(0)
    this._bubble.setDepth(100)
    this._bubble.setVisible(false)

    // NPC name text
    this._nameText = scene.add.text(20, 460, '', {
      fontSize: '14px', fill: '#ffdd88', fontStyle: 'bold'
    }).setScrollFactor(0).setDepth(101).setVisible(false)

    // Dialogue line text
    this._lineText = scene.add.text(20, 485, '', {
      fontSize: '13px', fill: '#ffffff', wordWrap: { width: 760 }
    }).setScrollFactor(0).setDepth(101).setVisible(false)

    // "Press E to continue" hint
    this._hintText = scene.add.text(700, 555, '[E] Next', {
      fontSize: '11px', fill: '#aaaaaa'
    }).setScrollFactor(0).setDepth(101).setVisible(false)
  }

  /**
   * Opens the dialogue bubble for the given NPC at their current phase.
   * @param {object} npc - NPC definition from npcs.js
   */
  show(npc) {
    const phaseIndex = GameState.npcDialogueState[npc.id] ?? 0
    const phase = npc.dialoguePhases[Math.min(phaseIndex, npc.dialoguePhases.length - 1)]
    this._logic = new DialogueLogic(phase.lines, phase.questOffer ?? null)
    this._currentNpc = npc
    this._renderBubble()
    this._updateText()
    this._setVisible(true)
    // Play soft pop SFX if available
    if (this._scene.sound && this._scene.cache.audio.has('sfx_pop')) {
      this._scene.sound.play('sfx_pop')
    }
  }

  /**
   * Advances to the next dialogue line, or closes the dialogue if exhausted.
   * Also handles NPC phase advancement when a quest is completed.
   */
  advance() {
    if (!this._logic || !this._logic.isOpen()) return
    this._logic.advance()
    if (this._logic.isOpen()) {
      this._updateText()
    } else {
      // Advance NPC phase in GameState if the associated quest is complete
      if (this._currentNpc) {
        const id = this._currentNpc.id
        const maxPhase = this._currentNpc.dialoguePhases.length - 1
        if (GameState.npcDialogueState[id] < maxPhase) {
          const phase = this._currentNpc.dialoguePhases[GameState.npcDialogueState[id]]
          if (phase.questComplete && GameState.quests[phase.questComplete] === 'complete') {
            GameState.npcDialogueState[id] = Math.min(GameState.npcDialogueState[id] + 1, maxPhase)
          }
        }
      }
      this.close()
    }
  }

  /** @returns {boolean} Whether the dialogue is currently open */
  isOpen() {
    return this._logic ? this._logic.isOpen() : false
  }

  /** @returns {boolean} Whether a quest offer is pending after the last line */
  hasPendingQuestOffer() {
    return this._logic ? this._logic.hasPendingQuestOffer() : false
  }

  /**
   * Returns the quest ID offered by the current NPC's active phase, or null.
   * @returns {string|null}
   */
  getPendingQuestOfferId() {
    if (!this._logic || !this._currentNpc) return null
    const phaseIndex = GameState.npcDialogueState[this._currentNpc.id] ?? 0
    const phase = this._currentNpc.dialoguePhases[Math.min(phaseIndex, this._currentNpc.dialoguePhases.length - 1)]
    return phase.questOffer ?? null
  }

  /** Hides the dialogue bubble and emits 'dialogue-closed'. */
  close() {
    this._setVisible(false)
    this._logic = null
    this._currentNpc = null
    if (this._scene.sound && this._scene.cache.audio.has('sfx_pop')) {
      this._scene.sound.play('sfx_pop')
    }
    this._scene.events.emit('dialogue-closed')
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  _renderBubble() {
    this._bubble.clear()
    this._bubble.fillStyle(0x1a1a2e, 0.92)
    this._bubble.fillRoundedRect(10, 450, 780, 130, 10)
    this._bubble.lineStyle(2, 0x6688cc, 1)
    this._bubble.strokeRoundedRect(10, 450, 780, 130, 10)
  }

  _updateText() {
    if (!this._logic || !this._currentNpc) return
    const lines = this._logic.lines
    const idx = Math.min(this._logic.currentIndex, lines.length - 1)
    this._nameText.setText(this._currentNpc.name)
    this._lineText.setText(lines[idx])
  }

  _setVisible(v) {
    this._bubble.setVisible(v)
    this._nameText.setVisible(v)
    this._lineText.setVisible(v)
    this._hintText.setVisible(v)
  }
}

export default DialogueSystem
