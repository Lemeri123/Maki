/**
 * QuestLogic — pure quest state machine (no Phaser dependency)
 *
 * Enforces monotonic state transitions: inactive → active → complete.
 * Ignores operations that would violate monotonicity.
 */
export class QuestLogic {
  /**
   * @param {string} questId - The quest identifier
   */
  constructor(questId) {
    this.questId = questId
    this.state = 'inactive'
  }

  /**
   * Transitions state from 'inactive' to 'active'.
   * No-op if already 'active' or 'complete'.
   */
  accept() {
    if (this.state === 'inactive') {
      this.state = 'active'
    }
  }

  /**
   * Transitions state from 'active' to 'complete'.
   * No-op if already 'complete' or still 'inactive'.
   */
  complete() {
    if (this.state === 'active') {
      this.state = 'complete'
    }
  }

  /**
   * @returns {boolean} Whether the quest is currently active
   */
  isActive() {
    return this.state === 'active'
  }

  /**
   * @returns {boolean} Whether the quest is complete
   */
  isComplete() {
    return this.state === 'complete'
  }

  /**
   * @returns {string} The current state string: 'inactive' | 'active' | 'complete'
   */
  getState() {
    return this.state
  }

  /**
   * Evaluates whether a quest's completion condition is met given the current game state.
   *
   * @param {object} questDef - Quest definition with a completionCondition field
   * @param {object} gameState - Current game state (fragments, currentLocation, etc.)
   * @returns {boolean}
   */
  static checkCompletion(questDef, gameState) {
    const condition = questDef.completionCondition
    if (!condition) return false

    if (condition.type === 'fragment_collected') {
      return gameState.fragments.collected.includes(condition.fragmentId)
    }

    if (condition.type === 'location_visited') {
      return gameState.currentLocation === condition.location
    }

    return false
  }
}

export default QuestLogic
