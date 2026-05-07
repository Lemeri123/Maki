/**
 * DialogueLogic — pure dialogue state machine (no Phaser dependency)
 *
 * Tracks the current line index, open/closed state, and pending quest offers
 * for a single dialogue sequence.
 */
export class DialogueLogic {
  /**
   * @param {string[]} lines - The lines to display in order
   * @param {string|null} questOffer - Optional quest ID to offer after all lines are shown
   */
  constructor(lines, questOffer = null) {
    this.lines = lines
    this.questOffer = questOffer
    this.currentIndex = 0
    this.open = true
    this.pendingQuestOffer = false
  }

  /**
   * Advance to the next line.
   * When all lines are exhausted: if a questOffer exists, sets pendingQuestOffer = true,
   * then sets open = false.
   */
  advance() {
    this.currentIndex++
    if (this.currentIndex >= this.lines.length) {
      if (this.questOffer) {
        this.pendingQuestOffer = true
      }
      this.open = false
    }
  }

  /**
   * @returns {boolean} Whether the dialogue is still open
   */
  isOpen() {
    return this.open
  }

  /**
   * @returns {boolean} Whether a quest offer is pending
   */
  hasPendingQuestOffer() {
    return this.pendingQuestOffer
  }

  /**
   * Clears the pending quest offer flag.
   */
  clearQuestOffer() {
    this.pendingQuestOffer = false
  }

  /**
   * Returns the lines for the given NPC at the given phase index.
   * Clamps phaseIndex to the valid range — never throws.
   *
   * @param {object} npc - NPC definition with dialoguePhases array
   * @param {number} phaseIndex - Desired phase index
   * @returns {string[]} Lines for the clamped phase
   */
  static getLinesForNpc(npc, phaseIndex) {
    const phases = npc.dialoguePhases
    if (!phases || phases.length === 0) return []
    const clamped = Math.max(0, Math.min(phaseIndex, phases.length - 1))
    return phases[clamped].lines
  }
}

export default DialogueLogic
