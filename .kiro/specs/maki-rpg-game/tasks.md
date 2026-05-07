# Implementation Plan: Pixel Pals — The Town That Forgot Its Story

## Overview

Incremental implementation of the full Maki RPG game. Each task builds on the previous, wiring everything together at the end. Pure logic modules are implemented early so property-based tests can run before Phaser scenes are built.

## Tasks

- [x] 1. Project setup and configuration
  - Update `game/maki.config.js` to register all maps (`default_map`, `town_map`, `library_map`, `cafe_map`) and sprites (`ash`, `lia`) per the design
  - Update `game/game.js` to import and register all scenes: `MenuScene`, `TownScene`, `LibraryScene`, `CafeScene`, `EndScene` (stubs are fine at this stage)
  - Add `vitest` and `fast-check` as dev dependencies in `package.json` and add a `"test": "vitest --run"` script
  - Create `game/tests/` directory with a placeholder `setup.js` (empty or minimal vitest config)
  - _Requirements: 1.3, 10.5, 10.6_

- [x] 2. Data files — NPCs, fragments, and quests
  - [x] 2.1 Create `game/data/npcs.js` exporting an array of at least four NPC definitions (Lia, plus three others) following the NPC definition schema from the design, with `dialoguePhases` arrays including `questOffer` fields where applicable
    - _Requirements: 3.1, 5.1_
  - [x] 2.2 Create `game/data/fragments.js` exporting an array of exactly eight Memory Fragment definitions (`id`, `x`, `y`, `text`) placed at distinct world-pixel positions on `town_map`
    - _Requirements: 4.1_
  - [x] 2.3 Create `game/data/quests.js` exporting an array of at least three Quest definitions with `id`, `name`, `objective`, and `completionCondition` (`type: 'fragment_collected'` or `type: 'location_visited'`)
    - _Requirements: 5.1, 5.3_

- [x] 3. GameState singleton
  - Create `game/state/GameState.js` as a plain JS module (no Phaser dependency) with fields: `fragments.collected` (array), `fragments.total` (8), `quests` (object keyed by questId → `'inactive'|'active'|'complete'`), `npcDialogueState` (object keyed by npcId → phase index int), `currentLocation`, `townReturnPos`, and a `reset()` method that restores all fields to initial values
  - Pre-populate `quests` and `npcDialogueState` keys from the data files so `reset()` can restore them cleanly
  - _Requirements: 5.5, 8.4_

- [x] 4. Pure logic modules (no Phaser dependency)
  - [x] 4.1 Create `game/logic/DialogueLogic.js` — a plain class with `constructor(lines)`, `advance()`, `isOpen()`, `hasPendingQuestOffer()`, and static `getLinesForNpc(npc, phaseIndex)` — no Phaser objects, operates only on arrays and booleans
    - _Requirements: 3.5, 3.6, 3.7, 3.8_
  - [x] 4.2 Create `game/logic/QuestLogic.js` — a plain class with `constructor(questId)`, `accept(questId)`, `complete(questId)`, `isActive(questId)`, `isComplete(questId)`, `getState()`, and `checkCompletion(questId, gameState)` — state machine enforcing `inactive → active → complete` monotonicity
    - _Requirements: 5.3, 5.5_
  - [x] 4.3 Create `game/logic/FogLogic.js` — export a pure function `computeFogAlpha(collected, total, initialAlpha)` that returns `initialAlpha` when `collected <= total / 2` and `initialAlpha * 0.5` when `collected > total / 2`
    - _Requirements: 9.5_
  - [x] 4.4 Create `game/logic/HUDLogic.js` — export pure functions `buildFragmentText(gameState)` (returns e.g. `"Memories: 3 / 8"`) and `buildQuestText(gameState)` (returns active quest name or empty string)
    - _Requirements: 4.4, 7.2_
  - [x] 4.5 Create `game/logic/FragmentLogic.js` — export `collectFragment(state, fragmentId)` (idempotent push) and `getSpawnableFragments(definitions, collectedIds)` (filters out already-collected IDs)
    - _Requirements: 4.2, 4.5_
  - [x] 4.6 Create `game/logic/MovementLogic.js` — export `canMove(overlayState)` where `overlayState = { dialogueOpen, inventoryOpen, cutsceneActive }` returns `true` only when all are `false`
    - _Requirements: 3.4, 7.4, 8.2_

- [ ] 5. Property-based tests for all correctness properties
  - [ ] 5.1 Write property test for Property 1 — Fragment collection is idempotent
    - Use `fc.string()` and `fc.uniqueArray(fc.string())` to generate arbitrary fragment IDs and existing collected arrays; assert `collectFragment` never introduces duplicates
    - **Property 1: Fragment collection is idempotent**
    - **Validates: Requirements 4.2, 4.5**
  - [ ] 5.2 Write property test for Property 2 — Collected fragments are not re-spawned
    - Use `fc.uniqueArray(fc.string({ minLength: 1 }))` to generate collected IDs; assert `getSpawnableFragments` returns empty array when all definitions are already collected
    - **Property 2: Collected fragments are not re-spawned**
    - **Validates: Requirements 4.5**
  - [ ] 5.3 Write property test for Property 3 — UI overlay gates player movement
    - Use `fc.record({ dialogueOpen: fc.boolean(), inventoryOpen: fc.boolean(), cutsceneActive: fc.boolean() })` to generate overlay states; assert `canMove` returns `!anyOpen`
    - **Property 3: UI overlay gates player movement**
    - **Validates: Requirements 3.4, 7.4, 8.2**
  - [ ] 5.4 Write property test for Property 4 — Dialogue advance exhausts in exactly N steps
    - Use `fc.array(fc.string(), { minLength: 1, maxLength: 10 })` to generate line arrays; assert that calling `advance()` N times results in `isOpen()` returning `false`
    - **Property 4: Dialogue advance sequence exhausts in exactly N steps**
    - **Validates: Requirements 3.5, 3.6**
  - [ ] 5.5 Write property test for Property 5 — Quest-bearing NPC exposes quest offer after final line
    - Generate NPC definitions with a `questOffer` field in the current phase; assert `hasPendingQuestOffer()` is `true` after all lines are advanced through
    - **Property 5: Quest-bearing NPC exposes quest offer after final line**
    - **Validates: Requirements 3.7, 5.6**
  - [ ] 5.6 Write property test for Property 6 — Quest state is monotonically non-decreasing
    - Use `fc.array(fc.constantFrom('accept', 'complete'), { minLength: 1, maxLength: 20 })` to generate operation sequences; assert state never decreases
    - **Property 6: Quest state is monotonically non-decreasing**
    - **Validates: Requirements 5.3, 5.5**
  - [ ] 5.7 Write property test for Property 7 — HUD text reflects current GameState
    - Generate arbitrary `collected` counts and quest states; assert `buildFragmentText` contains the correct count and `buildQuestText` contains the active quest name
    - **Property 7: HUD text reflects current GameState**
    - **Validates: Requirements 4.4, 7.2**
  - [ ] 5.8 Write property test for Property 8 — Fog alpha computation follows the 50% threshold rule
    - Use `fc.integer({ min: 0, max: 8 })` for collected count; assert `computeFogAlpha` returns `initialAlpha` at or below half and `initialAlpha * 0.5` above half
    - **Property 8: Fog alpha computation follows the 50% threshold rule**
    - **Validates: Requirements 9.5**
  - [ ] 5.9 Write property test for Property 9 — GameState.reset() restores initial state
    - Apply arbitrary dirty state (collected fragments, quest states, NPC phase indices) then call `reset()`; assert all fields return to initial values
    - **Property 9: GameState.reset() restores initial state**
    - **Validates: Requirements 8.4**
  - [ ] 5.10 Write property test for Property 10 — NPC dialogue lines match current phase
    - Generate arbitrary `dialoguePhases` arrays and phase indices; assert `getLinesForNpc` returns exactly the lines for the given phase
    - **Property 10: NPC dialogue lines match current phase**
    - **Validates: Requirements 3.8**

- [x] 6. Checkpoint — run all property tests
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Tilemap JSON files
  - [x] 7.1 Create `game/assets/maps/town_map.json` — a 50×50 tile map using `assets/rooms/room1.png` as tileset, with a `floor` layer, a `furniture` layer, and a `collisions` array; include at least two open areas and two building-entrance collision-free zones matching the trigger zone positions defined in `game/data/npcs.js` and `game/data/fragments.js`
    - _Requirements: 2.1, 6.1, 10.3, 10.5_
  - [x] 7.2 Create `game/assets/maps/library_map.json` — a 20×15 tile interior map using `assets/rooms/room2.png`, with `floor`, `furniture`, and `collisions` layers; include an exit trigger zone near the bottom edge
    - _Requirements: 6.3, 10.3, 10.5_
  - [x] 7.3 Create `game/assets/maps/cafe_map.json` — a 20×15 tile interior map using `assets/rooms/room3.png`, with `floor`, `furniture`, and `collisions` layers; include an exit trigger zone near the bottom edge
    - _Requirements: 6.3, 10.3, 10.5_

- [x] 8. SceneTransition utility
  - Create `game/utils/SceneTransition.js` exporting `transitionTo(fromScene, targetSceneKey, data = {})` — fades camera to black over 300 ms then calls `fromScene.scene.start(targetSceneKey, data)`; include an `isTransitioning` guard to prevent duplicate calls
  - _Requirements: 6.5_

- [x] 9. GameState singleton — wire data files
  - Update `game/state/GameState.js` to import quest IDs from `game/data/quests.js` and NPC IDs from `game/data/npcs.js` so `quests` and `npcDialogueState` are pre-populated with correct keys at module load time, and `reset()` restores them all
  - _Requirements: 5.5, 8.4_

- [x] 10. DialogueSystem (Phaser-aware wrapper)
  - Create `game/systems/DialogueSystem.js` — a class that wraps `DialogueLogic`; `constructor(scene)` creates a Phaser `Graphics` rounded-rect bubble and `Text` objects added to a fixed-camera UI layer (`setScrollFactor(0)`); `show(npc)` reads the NPC's current phase from `GameState.npcDialogueState` and delegates to `DialogueLogic`; `advance()` delegates and emits a `'dialogue-closed'` event when done; `isOpen()` delegates; plays a soft pop SFX on open and close
  - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 9.3_

- [x] 11. FragmentSystem
  - Create `game/systems/FragmentSystem.js` — `constructor(scene, playerSprite)` sets up a Phaser static physics group; `spawnFragments(definitions)` calls `getSpawnableFragments` from `FragmentLogic`, creates sprites for each spawnable fragment, and registers `physics.add.overlap(playerSprite, group, onCollect)`; `onCollect` calls `collectFragment`, removes the sprite, shows a pop-up `Text` object with the fragment's memory text (auto-destroys after 2 s), plays a chime SFX, and updates `GameState`
  - _Requirements: 4.1, 4.2, 4.3, 4.5, 9.2_

- [x] 12. QuestSystem
  - Create `game/systems/QuestSystem.js` — thin wrapper around `QuestLogic` and `GameState.quests`; `accept(questId)` delegates to `QuestLogic` and updates `GameState`; `isActive` / `isComplete` read from `GameState`; `checkCompletion(questId, gameState)` evaluates `completionCondition` from the quest definition and calls `complete()` if met
  - _Requirements: 5.2, 5.3, 5.4, 5.5_

- [x] 13. HUD
  - Create `game/ui/HUD.js` — `constructor(scene)` creates three `Text` objects with `setScrollFactor(0)` positioned in the top-left corner for fragment count, active quest, and location name; `update(gameState)` calls `buildFragmentText` and `buildQuestText` from `HUDLogic` and sets the text values; `show()` / `hide()` toggle visibility; `openInventory()` creates a full-screen panel listing all collected fragments with their memory text; `closeInventory()` destroys the panel
  - _Requirements: 4.4, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 14. FogOverlay
  - Create `game/ui/FogOverlay.js` — `constructor(scene, mapWidth, mapHeight)` creates a Phaser `Graphics` rectangle covering the full map at depth above the tilemap but below the HUD, initial alpha 0.6; `setOpacity(alpha)` tweens to the target alpha over 500 ms; `updateForFragments(collectedCount, total)` calls `computeFogAlpha` from `FogLogic` and calls `setOpacity` with the result
  - _Requirements: 9.4, 9.5_

- [x] 15. MenuScene
  - Create `game/scenes/MenuScene.js` extending Maki `Scene`; `preload()` calls `super.preload()` and `manager.preload(this)`; `create()` renders the game title text, a "Press Enter to Start" prompt, and a background using `assets/rooms/room1.png`; listens for Enter key and click on the start prompt to call `transitionTo(this, 'TownScene')`; registers a `loaderror` handler that displays an error message on canvas
  - _Requirements: 1.1, 1.2, 1.4_

- [x] 16. TownScene
  - Create `game/scenes/TownScene.js` extending Maki `Scene`; `preload()` loads `town_map` via `manager.map(this, 'town_map')` and calls `manager.preload(this)`; `create()` calls `manager.create(this)`, creates Ash via `this.maki.player('ash')`, places Ash at tile (5, 5), adds collision with the wall group, configures camera to follow Ash and clamp to map bounds, instantiates `DialogueSystem`, `FragmentSystem`, `QuestSystem`, `HUD`, and `FogOverlay`, spawns NPCs from `game/data/npcs.js` at their tile positions, spawns fragments via `FragmentSystem.spawnFragments`, sets up E-key proximity interaction prompt, sets up building entrance trigger zones, and listens for I-key to open/close inventory; `update()` calls `this.maki.move(ash)` only when `canMove(overlayState)` is `true`, calls `HUD.update(GameState)`, calls `QuestSystem.checkCompletion` for active quests, and checks if all 8 fragments are collected to trigger `transitionTo(this, 'EndScene')`
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 4.1, 4.4, 5.2, 6.1, 6.2, 7.1, 9.1, 9.4, 10.1, 10.2, 10.3, 10.4_

- [x] 17. LibraryScene
  - Create `game/scenes/LibraryScene.js` extending Maki `Scene`; `preload()` loads `library_map`; `create()` places Ash at the interior entrance position (passed via scene `data`), spawns any library-specific NPCs or fragments, sets up an exit trigger zone that calls `transitionTo(this, 'TownScene', { returnPos: GameState.townReturnPos })`; updates `GameState.currentLocation` to `'library'` on create and back to `'town'` on exit
  - _Requirements: 6.2, 6.3, 6.4, 6.5, 10.1_

- [x] 18. CafeScene
  - Create `game/scenes/CafeScene.js` extending Maki `Scene`; same structure as `LibraryScene` but loads `cafe_map`, places Ash at the café entrance, and updates `GameState.currentLocation` to `'cafe'`
  - _Requirements: 6.2, 6.3, 6.4, 6.5, 10.1_

- [x] 19. EndScene
  - Create `game/scenes/EndScene.js` extending Maki `Scene`; `create()` disables player movement, displays a series of full-screen dialogue panels narrating the restored town history (driven by a simple array of strings advanced with Enter/Space), then shows the end screen with "Maplewood remembers. Thanks for playing." and a restart prompt; on restart, calls `GameState.reset()` then `transitionTo(this, 'MenuScene')`
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 20. Checkpoint — wire all scenes together
  - Ensure all scenes are imported and registered in `game/game.js`
  - Verify `maki.config.js` lists all four maps and both sprites
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 1.3, 10.5, 10.6_

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests (tasks 5.1–5.10) target pure logic modules only — no Phaser dependency required
- All Phaser-dependent behavior (camera, collision, audio, fog animation) requires manual browser testing per the design's integration test list
- `GameState` is the single source of truth — all scenes read from and write to it directly
- `SceneTransition.transitionTo` must be used for all scene changes to ensure the 300 ms fade
