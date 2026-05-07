/**
 * HUDLogic — pure HUD text builders (no Phaser dependency)
 *
 * Produces display strings from the current game state.
 */

import quests from '../data/quests.js'

/**
 * Builds the fragment count display string.
 *
 * @param {object} gameState - Current game state
 * @returns {string} e.g. "Memories: 3 / 8"
 */
export function buildFragmentText(gameState) {
  const count = gameState.fragments.collected.length
  const total = gameState.fragments.total
  return `Memories: ${count} / ${total}`
}

/**
 * Builds the active quest display string.
 * Returns the name of the first active quest, or '' if none are active.
 *
 * @param {object} gameState - Current game state with a quests map (questId → state)
 * @returns {string} Active quest name, or empty string
 */
export function buildQuestText(gameState) {
  for (const quest of quests) {
    if (gameState.quests[quest.id] === 'active') {
      return quest.name
    }
  }
  return ''
}
