/**
 * GameState singleton for Pixel Pals: The Town That Forgot Its Story
 *
 * Plain JS module — no Phaser dependency.
 * Single source of truth for all cross-scene state.
 *
 * Fields:
 *   fragments.collected  — string[] of collected fragment IDs
 *   fragments.total      — 8 (constant)
 *   quests               — { [questId]: 'inactive' | 'active' | 'complete' }
 *   npcDialogueState     — { [npcId]: number } phase index, starts at 0
 *   currentLocation      — string, starts as 'town'
 *   townReturnPos        — { x, y } where Ash re-enters town from an interior
 */

import quests from '../data/quests.js'
import npcs from '../data/npcs.js'

// Build initial quests map: questId → 'inactive'
function buildInitialQuests() {
  const map = {}
  for (const quest of quests) {
    map[quest.id] = 'inactive'
  }
  return map
}

// Build initial NPC dialogue state map: npcId → 0
function buildInitialNpcDialogueState() {
  const map = {}
  for (const npc of npcs) {
    map[npc.id] = 0
  }
  return map
}

const GameState = {
  fragments: {
    collected: [],
    total: 8,
  },

  quests: buildInitialQuests(),

  npcDialogueState: buildInitialNpcDialogueState(),

  currentLocation: 'town',

  townReturnPos: { x: 80, y: 80 },

  /**
   * Restores all fields to their initial values.
   * Safe to call from EndScene on restart.
   */
  reset() {
    this.fragments.collected = []
    // fragments.total is a constant — no reset needed

    // Reset all quest states to 'inactive'
    for (const quest of quests) {
      this.quests[quest.id] = 'inactive'
    }

    // Reset all NPC dialogue phases to 0
    for (const npc of npcs) {
      this.npcDialogueState[npc.id] = 0
    }

    this.currentLocation = 'town'
    this.townReturnPos = { x: 80, y: 80 }
  },
}

export default GameState
