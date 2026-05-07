# Design Document: Pixel Pals — The Town That Forgot Its Story

## Overview

"Pixel Pals: The Town That Forgot Its Story" is a 2D pixel RPG built on the Maki framework (which wraps Phaser with arcade physics). The player controls Ash, a wandering archivist who restores Maplewood's lost history by collecting Memory Fragments and completing NPC quests.

The game runs entirely in the browser. All state is in-memory for the session. There are no network calls, no backend, and no external libraries beyond Phaser and Maki.

### Design Goals

- Hackathon-feasible: every system is the simplest thing that works
- Maki-compliant: all scenes extend `Scene`, all maps/sprites go through `manager`
- Single source of truth: one `GameState` singleton shared across all scenes
- No scene re-creation cost: scenes are started/stopped, not destroyed and rebuilt

---

## Architecture

### Scene Graph

```
Phaser.Game
├── MenuScene       (entry point, title screen)
├── TownScene       (main overworld, Ash + NPCs + fragments)
├── LibraryScene    (interior — Lia's library)
├── CafeScene       (interior — town café)
└── EndScene        (cutscene + end screen)
```

All scenes are registered in `game.js` at startup. Maki's `Scene` base class handles `preload`/`create` lifecycle hooks.

### Scene Lifecycle

```
MenuScene
  → [Enter / Start] → TownScene
      → [walk into library door] → LibraryScene
          → [walk to exit] → TownScene (resume)
      → [walk into café door] → CafeScene
          → [walk to exit] → TownScene (resume)
      → [all 8 fragments collected] → EndScene
          → [restart] → MenuScene (GameState.reset())
```

Transitions use Phaser's `this.scene.start()` / `this.scene.stop()` with a 300 ms fade-to-black camera effect.

### Maki Config Updates

`maki.config.js` must be updated to register all maps and sprites:

```js
export default {
  width: 800,
  height: 600,
  maps: ['default_map', 'town_map', 'library_map', 'cafe_map'],
  sprites: ['ash', 'lia'],
  debug: false
}
```

---

## Components and Interfaces

### GameState (Singleton)

A plain JS module that holds all cross-scene state. Imported wherever needed — no Phaser dependency.

```js
// game/state/GameState.js
const GameState = {
  fragments: {
    collected: [],      // string[] — fragment IDs already picked up
    total: 8
  },
  quests: {
    // questId → 'inactive' | 'active' | 'complete'
  },
  npcDialogueState: {
    // npcId → dialogue phase index (int)
  },
  currentLocation: 'town',  // 'town' | 'library' | 'cafe'
  townReturnPos: { x: 80, y: 80 },  // where Ash re-enters town from an interior

  reset() { /* restore all fields to initial values */ }
}
export default GameState
```

### DialogueSystem

A self-contained class instantiated once per scene. It owns the speech bubble graphics and text objects, and drives the dialogue sequence.

```js
// game/systems/DialogueSystem.js
class DialogueSystem {
  constructor(scene)       // creates Phaser GameObjects, sets them invisible
  show(npc)                // starts dialogue for an NPC object
  advance()                // moves to next line; closes when exhausted
  isOpen()                 // boolean — used by scenes to gate movement
  close()                  // hides bubble, emits 'dialogue-closed' event
}
```

Speech bubble is built from Phaser `Graphics` (rounded rect) + `Text` objects, added to a fixed-camera UI layer so they don't scroll.

### FragmentSystem

Manages collectible sprites and overlap detection.

```js
// game/systems/FragmentSystem.js
class FragmentSystem {
  constructor(scene, playerSprite)
  spawnFragments(definitions)   // [{id, x, y, text}, ...]
  // internally uses this.scene.physics.add.overlap(playerSprite, group, onCollect)
}
```

On overlap: removes sprite from group, pushes `id` to `GameState.fragments.collected`, shows pop-up text, plays SFX.

### QuestSystem

Thin wrapper around `GameState.quests` that evaluates completion conditions.

```js
// game/systems/QuestSystem.js
class QuestSystem {
  accept(questId)
  isActive(questId)
  isComplete(questId)
  checkCompletion(questId, gameState)  // returns bool; called each update
  complete(questId)
}
```

### HUD

A Phaser `Scene` running in parallel (added to the scene list as an always-on overlay), or alternatively a set of fixed-camera Text objects created in each scene. For hackathon simplicity: fixed-camera Text objects created in `TownScene.create()` and updated each frame.

```js
// game/ui/HUD.js
class HUD {
  constructor(scene)
  update(gameState)   // refreshes fragment count + quest name text
  show() / hide()
}
```

HUD text objects use `setScrollFactor(0)` so they stay fixed regardless of camera movement.

### SceneTransition

A utility that wraps the fade-to-black pattern.

```js
// game/utils/SceneTransition.js
function transitionTo(fromScene, targetSceneKey, data = {}) {
  fromScene.cameras.main.fadeOut(300, 0, 0, 0)
  fromScene.cameras.main.once('camerafadeoutcomplete', () => {
    fromScene.scene.start(targetSceneKey, data)
  })
}
```

### FogOverlay

A Phaser `Graphics` rectangle covering the full map, rendered above the tilemap but below the HUD.

```js
// game/ui/FogOverlay.js
class FogOverlay {
  constructor(scene, mapWidth, mapHeight)
  setOpacity(alpha)   // tweens to target alpha
  updateForFragments(collectedCount, total)  // auto-reduces at >50% collected
}
```

---

## Data Models

### NPC Definition

```js
{
  id: 'lia',
  name: 'Lia',
  sprite: 'lia',          // key in maki.config sprites
  tileX: 12, tileY: 8,   // spawn position in tiles
  dialoguePhases: [
    {
      // phase 0 — before quest accepted
      lines: ['The fog... it came one morning.', 'I can barely remember my own name.'],
      questOffer: 'quest_library_key'   // optional
    },
    {
      // phase 1 — quest active
      lines: ['Please find the old journal. It might be near the fountain.']
    },
    {
      // phase 2 — quest complete
      lines: ['You found it! I remember now... thank you, Ash.'],
      questComplete: 'quest_library_key'
    }
  ]
}
```

### Memory Fragment Definition

```js
{
  id: 'fragment_fountain',
  x: 320,   // world pixel x
  y: 256,   // world pixel y
  text: '"The fountain was built by the first mayor, who loved rain."'
}
```

### Quest Definition

```js
{
  id: 'quest_library_key',
  name: 'The Lost Journal',
  objective: 'Find the journal near the fountain',
  completionCondition: {
    type: 'fragment_collected',
    fragmentId: 'fragment_fountain'
  }
}
```

Quest `completionCondition.type` can be:
- `'fragment_collected'` — checks `GameState.fragments.collected`
- `'location_visited'` — checks `GameState.currentLocation`

### Trigger Zone Definition

```js
{
  id: 'library_entrance',
  x: 160, y: 80,   // world pixel position
  w: 32, h: 32,
  targetScene: 'LibraryScene',
  returnPos: { x: 160, y: 96 }  // where Ash lands back in TownScene
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Fragment collection is idempotent

*For any* fragment ID that is already present in `GameState.fragments.collected`, attempting to collect it again should leave `collected.length` unchanged and introduce no duplicate entries.

**Validates: Requirements 4.2, 4.5**

---

### Property 2: Collected fragments are not re-spawned

*For any* set of fragment IDs stored in `GameState.fragments.collected`, calling `FragmentSystem.spawnFragments()` with a superset of definitions should result in none of those already-collected IDs appearing in the spawned physics group.

**Validates: Requirements 4.5**

---

### Property 3: UI overlay gates player movement

*For any* UI overlay that is open — dialogue (`DialogueSystem.isOpen()`), inventory panel, or cutscene — the movement guard should return `false`, preventing `this.maki.move(ash)` from processing input. When all overlays are closed, the guard should return `true`.

**Validates: Requirements 3.4, 7.4, 8.2**

---

### Property 4: Dialogue advance sequence exhausts in exactly N steps

*For any* NPC whose current dialogue phase has N lines, calling `DialogueSystem.advance()` exactly N times should result in `DialogueSystem.isOpen()` returning `false` and the dialogue being closed.

**Validates: Requirements 3.5, 3.6**

---

### Property 5: Quest-bearing NPC exposes quest offer after final line

*For any* NPC definition that includes a `questOffer` field in its current dialogue phase, after all lines in that phase have been displayed, the dialogue system should expose the quest offer (i.e., `DialogueSystem.hasPendingQuestOffer()` returns `true`).

**Validates: Requirements 3.7, 5.6**

---

### Property 6: Quest state is monotonically non-decreasing

*For any* quest, its state transitions only in the direction `inactive → active → complete`. Calling `accept()` on an already-active or complete quest, or `complete()` on an already-complete quest, should leave the state unchanged.

**Validates: Requirements 5.3, 5.5**

---

### Property 7: HUD text reflects current GameState

*For any* game state, the string produced by `HUD.buildFragmentText(gameState)` should contain the exact collected count and total, and `HUD.buildQuestText(gameState)` should contain the active quest name (or an empty/default string when no quest is active).

**Validates: Requirements 4.4, 7.2**

---

### Property 8: Fog alpha computation follows the 50% threshold rule

*For any* integer `collected` in `[0, total]`, `computeFogAlpha(collected, total, initialAlpha)` should return `initialAlpha` when `collected <= total / 2`, and `initialAlpha * 0.5` when `collected > total / 2`.

**Validates: Requirements 9.5**

---

### Property 9: GameState.reset() restores initial state

*For any* game state reached by an arbitrary sequence of fragment collections, quest acceptances, quest completions, and NPC dialogue advances, calling `GameState.reset()` should produce a state deeply equal to the module's initial state — empty `collected` array, all quests `'inactive'`, all NPC phase indices at `0`.

**Validates: Requirements 8.4**

---

### Property 10: NPC dialogue lines match current phase

*For any* NPC and any phase index stored in `GameState.npcDialogueState`, the lines returned by `DialogueSystem.getLinesForNpc(npcId)` should be exactly the lines defined in `npc.dialoguePhases[phaseIndex]`.

**Validates: Requirements 3.8**

---

## Error Handling

| Scenario | Handling |
|---|---|
| Asset fails to load (map/sprite) | Phaser `this.load.on('loaderror', ...)` — display error text on canvas, do not crash |
| Fragment ID not found in definitions | Log warning, skip spawn — do not throw |
| NPC dialogue phase out of bounds | Clamp to last phase, log warning |
| Scene transition called while transition in progress | Guard flag `isTransitioning` — ignore duplicate calls |
| `GameState` accessed before init | Module-level defaults ensure safe initial state |

---

## Testing Strategy

### Unit Tests

Use Vitest (already available via Vite). Focus on pure logic with no Phaser dependency:

- `GameState.reset()` restores all fields to initial values
- `QuestSystem` state machine transitions (inactive → active → complete)
- `DialogueSystem.getLinesForNpc()` returns correct phase lines
- `DialogueSystem.advance()` increments phase and closes at end
- Fragment deduplication in `FragmentSystem.spawnFragments()`
- `computeFogAlpha(collected, total, initialAlpha)` pure function
- `HUD.buildFragmentText()` and `HUD.buildQuestText()` string builders

Keep unit tests focused on specific examples and edge cases. Property tests handle broad input coverage.

### Property-Based Tests

Use [fast-check](https://github.com/dubzzz/fast-check) for property-based testing. Each test runs a minimum of 100 iterations.

**Property 1 — Fragment collection idempotence**
```js
// Feature: maki-rpg-game, Property 1: Fragment collection is idempotent
fc.assert(fc.property(
  fc.string(), fc.uniqueArray(fc.string()),
  (fragmentId, existingCollected) => {
    const state = { collected: [...existingCollected, fragmentId] }
    collectFragment(state, fragmentId)  // attempt duplicate collect
    return state.collected.filter(id => id === fragmentId).length === 1
  }
), { numRuns: 100 })
```

**Property 2 — Collected fragments not re-spawned**
```js
// Feature: maki-rpg-game, Property 2: Collected fragments are not re-spawned
fc.assert(fc.property(
  fc.uniqueArray(fc.string({ minLength: 1 })),
  (collectedIds) => {
    const allDefs = collectedIds.map(id => ({ id, x: 0, y: 0, text: '' }))
    const spawned = getSpawnableFragments(allDefs, collectedIds)
    return spawned.length === 0
  }
), { numRuns: 100 })
```

**Property 3 — UI overlay gates movement**
```js
// Feature: maki-rpg-game, Property 3: UI overlay gates player movement
fc.assert(fc.property(
  fc.record({ dialogueOpen: fc.boolean(), inventoryOpen: fc.boolean(), cutsceneActive: fc.boolean() }),
  (overlayState) => {
    const anyOpen = overlayState.dialogueOpen || overlayState.inventoryOpen || overlayState.cutsceneActive
    return canMove(overlayState) === !anyOpen
  }
), { numRuns: 100 })
```

**Property 4 — Dialogue advance exhausts in N steps**
```js
// Feature: maki-rpg-game, Property 4: Dialogue advance sequence exhausts in exactly N steps
fc.assert(fc.property(
  fc.array(fc.string(), { minLength: 1, maxLength: 10 }),
  (lines) => {
    const ds = new DialogueLogic(lines)
    for (let i = 0; i < lines.length; i++) ds.advance()
    return !ds.isOpen()
  }
), { numRuns: 100 })
```

**Property 6 — Quest state monotonicity**
```js
// Feature: maki-rpg-game, Property 6: Quest state is monotonically non-decreasing
const ORDER = { inactive: 0, active: 1, complete: 2 }
fc.assert(fc.property(
  fc.array(fc.constantFrom('accept', 'complete'), { minLength: 1, maxLength: 20 }),
  (ops) => {
    const qs = new QuestLogic('q1')
    let prev = ORDER[qs.getState()]
    for (const op of ops) {
      if (op === 'accept') qs.accept('q1')
      else qs.complete('q1')
      const curr = ORDER[qs.getState()]
      if (curr < prev) return false
      prev = curr
    }
    return true
  }
), { numRuns: 100 })
```

**Property 8 — Fog alpha computation**
```js
// Feature: maki-rpg-game, Property 8: Fog alpha computation follows the 50% threshold rule
fc.assert(fc.property(
  fc.integer({ min: 0, max: 8 }),
  (collected) => {
    const INITIAL = 0.6
    const alpha = computeFogAlpha(collected, 8, INITIAL)
    if (collected > 4) return alpha <= INITIAL * 0.5
    return alpha === INITIAL
  }
), { numRuns: 100 })
```

**Property 9 — GameState reset**
```js
// Feature: maki-rpg-game, Property 9: GameState.reset() restores initial state
fc.assert(fc.property(
  fc.record({
    collected: fc.uniqueArray(fc.string()),
    quests: fc.dictionary(fc.string(), fc.constantFrom('inactive','active','complete')),
    npcPhases: fc.dictionary(fc.string(), fc.integer({ min: 0, max: 5 }))
  }),
  (dirtyState) => {
    applyDirtyState(GameState, dirtyState)
    GameState.reset()
    return (
      GameState.fragments.collected.length === 0 &&
      Object.values(GameState.quests).every(s => s === 'inactive') &&
      Object.values(GameState.npcDialogueState).every(p => p === 0)
    )
  }
), { numRuns: 100 })
```

**Property 10 — NPC dialogue lines match phase**
```js
// Feature: maki-rpg-game, Property 10: NPC dialogue lines match current phase
fc.assert(fc.property(
  fc.array(fc.array(fc.string(), { minLength: 1 }), { minLength: 1, maxLength: 5 }),
  fc.integer({ min: 0 }),
  (phases, rawPhaseIndex) => {
    const phaseIndex = rawPhaseIndex % phases.length
    const npc = { dialoguePhases: phases.map(lines => ({ lines })) }
    const result = getLinesForNpc(npc, phaseIndex)
    return JSON.stringify(result) === JSON.stringify(phases[phaseIndex])
  }
), { numRuns: 100 })
```

### Integration / Manual Tests

The following require a running browser and cannot be unit tested:

- Camera follows Ash and stays within map bounds (Req 2.5, 2.6)
- Collision layer blocks movement (Req 2.4)
- Fade-to-black transition is 300 ms (Req 6.5)
- HUD does not scroll with camera — `setScrollFactor(0)` (Req 7.1)
- Audio plays on fragment collect and dialogue open/close (Req 9.2, 9.3)
- Fog overlay is visually present and animates (Req 9.4)
- Scene transition fires when Ash enters trigger zone (Req 6.2)
- Ash placed at correct entrance position after interior scene loads (Req 6.3)
