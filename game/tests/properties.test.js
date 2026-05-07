/**
 * Property-based tests for all 10 correctness properties.
 * Uses fast-check + vitest.
 *
 * Feature: maki-rpg-game
 */

import { describe, it } from 'vitest'
import * as fc from 'fast-check'

import { collectFragment, getSpawnableFragments } from '../logic/FragmentLogic.js'
import { canMove } from '../logic/MovementLogic.js'
import { DialogueLogic } from '../logic/DialogueLogic.js'
import { QuestLogic } from '../logic/QuestLogic.js'
import { buildFragmentText, buildQuestText } from '../logic/HUDLogic.js'
import { computeFogAlpha } from '../logic/FogLogic.js'
import GameState from '../state/GameState.js'
import quests from '../data/quests.js'
import npcs from '../data/npcs.js'

// ─── Property 1: Fragment collection is idempotent ───────────────────────────
// Validates: Requirements 4.2, 4.5

describe('Property 1: Fragment collection is idempotent', () => {
  it('collectFragment never introduces duplicates', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.uniqueArray(fc.string()),
        (fragmentId, otherCollected) => {
          // Build a collected array that does NOT already contain fragmentId,
          // then add it once — so we start with exactly one occurrence.
          const withoutDuplicate = otherCollected.filter(id => id !== fragmentId)
          const state = { collected: [...withoutDuplicate, fragmentId] }
          const lengthBefore = state.collected.length

          // Attempt to collect the same fragment again
          collectFragment(state, fragmentId)

          // Length must not grow and there must be exactly one occurrence
          const occurrences = state.collected.filter(id => id === fragmentId).length
          return state.collected.length === lengthBefore && occurrences === 1
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ─── Property 2: Collected fragments are not re-spawned ──────────────────────
// Validates: Requirements 4.5

describe('Property 2: Collected fragments are not re-spawned', () => {
  it('getSpawnableFragments returns empty when all defs are already collected', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.string({ minLength: 1 })),
        (collectedIds) => {
          const allDefs = collectedIds.map(id => ({ id, x: 0, y: 0, text: '' }))
          const spawnable = getSpawnableFragments(allDefs, collectedIds)
          return spawnable.length === 0
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ─── Property 3: UI overlay gates player movement ────────────────────────────
// Validates: Requirements 3.4, 7.4, 8.2

describe('Property 3: UI overlay gates player movement', () => {
  it('canMove returns !anyOpen for all overlay combinations', () => {
    fc.assert(
      fc.property(
        fc.record({
          dialogueOpen: fc.boolean(),
          inventoryOpen: fc.boolean(),
          cutsceneActive: fc.boolean(),
        }),
        (overlayState) => {
          const anyOpen =
            overlayState.dialogueOpen ||
            overlayState.inventoryOpen ||
            overlayState.cutsceneActive
          return canMove(overlayState) === !anyOpen
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ─── Property 4: Dialogue advance exhausts in exactly N steps ────────────────
// Validates: Requirements 3.5, 3.6

describe('Property 4: Dialogue advance sequence exhausts in exactly N steps', () => {
  it('calling advance() N times closes the dialogue', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string(), { minLength: 1, maxLength: 10 }),
        (lines) => {
          const dl = new DialogueLogic(lines)
          for (let i = 0; i < lines.length; i++) {
            dl.advance()
          }
          return !dl.isOpen()
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ─── Property 5: Quest-bearing NPC exposes quest offer after final line ───────
// Validates: Requirements 3.7, 5.6

describe('Property 5: Quest-bearing NPC exposes quest offer after final line', () => {
  it('hasPendingQuestOffer() is true after all lines are advanced through', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string(), { minLength: 1, maxLength: 10 }),
        fc.string({ minLength: 1 }),
        (lines, questOffer) => {
          const dl = new DialogueLogic(lines, questOffer)
          for (let i = 0; i < lines.length; i++) {
            dl.advance()
          }
          return dl.hasPendingQuestOffer() === true
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ─── Property 6: Quest state is monotonically non-decreasing ─────────────────
// Validates: Requirements 5.3, 5.5

describe('Property 6: Quest state is monotonically non-decreasing', () => {
  it('quest state never decreases across arbitrary accept/complete sequences', () => {
    const ORDER = { inactive: 0, active: 1, complete: 2 }

    fc.assert(
      fc.property(
        fc.array(fc.constantFrom('accept', 'complete'), { minLength: 1, maxLength: 20 }),
        (ops) => {
          const qs = new QuestLogic('q1')
          let prev = ORDER[qs.getState()]

          for (const op of ops) {
            if (op === 'accept') qs.accept()
            else qs.complete()

            const curr = ORDER[qs.getState()]
            if (curr < prev) return false
            prev = curr
          }
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ─── Property 7: HUD text reflects current GameState ─────────────────────────
// Validates: Requirements 4.4, 7.2

describe('Property 7: HUD text reflects current GameState', () => {
  it('buildFragmentText contains the correct collected count', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 8 }),
        (collectedCount) => {
          const fakeState = {
            fragments: {
              collected: Array.from({ length: collectedCount }, (_, i) => `frag_${i}`),
              total: 8,
            },
            quests: {},
          }
          const text = buildFragmentText(fakeState)
          return text.includes(String(collectedCount))
        }
      ),
      { numRuns: 100 }
    )
  })

  it('buildQuestText returns active quest name or empty string', () => {
    // Build a quests map using the real quest IDs so HUDLogic can look them up
    const questIds = quests.map(q => q.id)

    fc.assert(
      fc.property(
        // Pick one quest to be 'active', or -1 for none active
        fc.integer({ min: -1, max: questIds.length - 1 }),
        (activeIndex) => {
          const questsMap = {}
          questIds.forEach((id, i) => {
            questsMap[id] = i === activeIndex ? 'active' : 'inactive'
          })

          const fakeState = {
            fragments: { collected: [], total: 8 },
            quests: questsMap,
          }

          const text = buildQuestText(fakeState)

          if (activeIndex === -1) {
            return text === ''
          }
          // The active quest's name must appear in the text
          return text === quests[activeIndex].name
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ─── Property 8: Fog alpha computation follows the 50% threshold rule ─────────
// Validates: Requirements 9.5

describe('Property 8: Fog alpha computation follows the 50% threshold rule', () => {
  it('returns initialAlpha at/below half and initialAlpha*0.5 above half', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 8 }),
        fc.float({ min: Math.fround(0.1), max: Math.fround(1.0), noNaN: true }),
        (collected, initialAlpha) => {
          const total = 8
          const alpha = computeFogAlpha(collected, total, initialAlpha)

          if (collected > total / 2) {
            // Allow small floating-point tolerance
            return Math.abs(alpha - initialAlpha * 0.5) < 1e-9
          }
          return Math.abs(alpha - initialAlpha) < 1e-9
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ─── Property 9: GameState.reset() restores initial state ────────────────────
// Validates: Requirements 8.4

describe('Property 9: GameState.reset() restores initial state', () => {
  it('reset() clears collected fragments, resets all quests to inactive, and all NPC phases to 0', () => {
    const questIds = quests.map(q => q.id)
    const npcIds = npcs.map(n => n.id)

    fc.assert(
      fc.property(
        // Dirty state: some collected fragments
        fc.uniqueArray(fc.string({ minLength: 1 }), { maxLength: 5 }),
        // Which quests to dirty (subset of real quest IDs)
        fc.subarray(questIds),
        // Which NPC phases to advance (subset of real NPC IDs)
        fc.subarray(npcIds),
        (dirtyFragments, dirtyQuestIds, dirtyNpcIds) => {
          // Apply dirty state
          GameState.fragments.collected = [...dirtyFragments]
          for (const id of dirtyQuestIds) {
            GameState.quests[id] = 'active'
          }
          for (const id of dirtyNpcIds) {
            GameState.npcDialogueState[id] = 2
          }

          // Reset
          GameState.reset()

          // Verify initial state
          const fragmentsClean = GameState.fragments.collected.length === 0
          const questsClean = questIds.every(id => GameState.quests[id] === 'inactive')
          const npcsClean = npcIds.every(id => GameState.npcDialogueState[id] === 0)

          return fragmentsClean && questsClean && npcsClean
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ─── Property 10: NPC dialogue lines match current phase ─────────────────────
// Validates: Requirements 3.8

describe('Property 10: NPC dialogue lines match current phase', () => {
  it('getLinesForNpc returns exactly the lines for the given phase index', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary dialogue phases (each phase has at least 1 line)
        fc.array(
          fc.array(fc.string(), { minLength: 1, maxLength: 5 }),
          { minLength: 1, maxLength: 5 }
        ),
        fc.integer({ min: 0, max: 100 }),
        (phasesLines, rawPhaseIndex) => {
          const phaseIndex = rawPhaseIndex % phasesLines.length
          const npc = {
            dialoguePhases: phasesLines.map(lines => ({ lines })),
          }

          const result = DialogueLogic.getLinesForNpc(npc, phaseIndex)

          // Must return exactly the lines for the given phase
          return (
            result.length === phasesLines[phaseIndex].length &&
            result.every((line, i) => line === phasesLines[phaseIndex][i])
          )
        }
      ),
      { numRuns: 100 }
    )
  })
})
