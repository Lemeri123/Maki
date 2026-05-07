/**
 * QuestSystem — Phaser-aware quest management
 *
 * Wraps QuestLogic instances (one per quest) and keeps them in sync with
 * GameState. Provides accept/check/query methods for use by scenes.
 */

import { QuestLogic } from '../logic/QuestLogic.js'
import GameState from '../state/GameState.js'
import quests from '../data/quests.js'

export class QuestSystem {
  constructor() {
    // One QuestLogic instance per quest, synced with GameState
    this._logics = {}
    for (const quest of quests) {
      this._logics[quest.id] = new QuestLogic(quest.id)
      // Sync initial state from GameState (in case of re-entry after scene restart)
      const state = GameState.quests[quest.id]
      if (state === 'active') {
        this._logics[quest.id].accept()
      }
      if (state === 'complete') {
        this._logics[quest.id].accept()
        this._logics[quest.id].complete()
      }
    }
  }

  /**
   * Accepts a quest, transitioning it from 'inactive' to 'active'.
   * Updates both the QuestLogic instance and GameState.
   *
   * @param {string} questId
   */
  accept(questId) {
    if (!this._logics[questId]) return
    this._logics[questId].accept()
    GameState.quests[questId] = this._logics[questId].getState()
  }

  /**
   * @param {string} questId
   * @returns {boolean} Whether the quest is currently active
   */
  isActive(questId) {
    return GameState.quests[questId] === 'active'
  }

  /**
   * @param {string} questId
   * @returns {boolean} Whether the quest is complete
   */
  isComplete(questId) {
    return GameState.quests[questId] === 'complete'
  }

  /**
   * Checks whether a single quest's completion condition is met.
   * If met, marks it complete in both QuestLogic and GameState.
   *
   * @param {string} questId
   * @returns {boolean} True if the quest was just completed
   */
  checkCompletion(questId) {
    if (!this._logics[questId]) return false
    if (this.isComplete(questId)) return false
    if (!this.isActive(questId)) return false
    const questDef = quests.find(q => q.id === questId)
    if (!questDef) return false
    const met = QuestLogic.checkCompletion(questDef, GameState)
    if (met) {
      this._logics[questId].complete()
      GameState.quests[questId] = 'complete'
      return true
    }
    return false
  }

  /**
   * Checks completion conditions for all quests.
   * Useful to call once per frame or after any state-changing event.
   */
  checkAllCompletions() {
    for (const quest of quests) {
      this.checkCompletion(quest.id)
    }
  }
}

export default QuestSystem
