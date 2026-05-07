/**
 * Quest definitions for Pixel Pals: The Town That Forgot Its Story
 *
 * Each quest has:
 *   id                  — unique string identifier
 *   name                — display name shown in the HUD
 *   objective           — short description of what the player must do
 *   completionCondition — { type, fragmentId? | location? }
 *
 * completionCondition.type values:
 *   'fragment_collected' — quest completes when the given fragmentId is in GameState.fragments.collected
 *   'location_visited'   — quest completes when GameState.currentLocation matches the given location
 */

const quests = [
  {
    id: 'quest_lost_journal',
    name: 'The Lost Journal',
    objective: 'Find Lia\'s journal near the fountain',
    completionCondition: {
      type: 'fragment_collected',
      fragmentId: 'fragment_fountain',
    },
  },
  {
    id: 'quest_town_seal',
    name: 'The Town Seal',
    objective: 'Recover the town seal near the town hall',
    completionCondition: {
      type: 'fragment_collected',
      fragmentId: 'fragment_town_seal',
    },
  },
  {
    id: 'quest_recipe',
    name: 'Grandma\'s Recipe',
    objective: 'Find the lost recipe in the café area',
    completionCondition: {
      type: 'fragment_collected',
      fragmentId: 'fragment_recipe',
    },
  },
]

/**
 * Returns the quest definition with the given id, or undefined if not found.
 * @param {string} id
 * @returns {object|undefined}
 */
export function getQuestById(id) {
  return quests.find(q => q.id === id)
}

export default quests
