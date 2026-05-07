# Requirements Document

## Introduction

"Pixel Pals: The Town That Forgot Its Story" is a 2D pixel RPG built with the Maki framework for the Maki Hackathon 2026. The player controls Ash, a wandering archivist who arrives in the town of Maplewood to find that every resident has lost their memory due to a mysterious "Memory Fog." The player explores the town, talks to NPCs, collects Memory Fragments, and restores the town's lost history — unlocking new areas, quests, and story beats along the way. The game is cozy, funny, and community-focused, with a meta twist: the town's story is literally being written as the player discovers it.

## Glossary

- **Game**: The Maki-based Phaser application running in the browser
- **Player**: The human operating the keyboard/gamepad
- **Ash**: The player-controlled character sprite; a wandering archivist
- **Lia**: A key NPC — the town librarian who remembers fragments of the old story
- **Maplewood**: The fictional town setting, rendered as a tiled 2D pixel map
- **Memory_Fragment**: A collectible item scattered across the map that restores a piece of the town's history
- **Memory_Fog**: The in-game antagonist force that erased the town's memories; represented visually as a fog overlay
- **NPC**: A non-player character with dialogue and optional quest logic
- **Quest**: A structured task given by an NPC that rewards the player upon completion
- **Dialogue_System**: The subsystem that displays NPC speech bubbles and branching dialogue trees
- **Inventory**: The in-game panel showing collected Memory Fragments and key items
- **Scene**: A Phaser/Maki Scene class representing a distinct game screen (menu, town, interior, etc.)
- **HUD**: Heads-Up Display showing player stats, fragment count, and active quest
- **Tilemap**: A JSON-based map file loaded via the Maki framework defining terrain and collision layers
- **Collision_Layer**: The tilemap layer that blocks player movement
- **Manager**: The Maki `manager` object responsible for loading maps, sprites, and assets

## Requirements

### Requirement 1: Game Bootstrap and Entry Scene

**User Story:** As a player, I want to see a polished title screen when I launch the game, so that I feel immediately drawn into the world before gameplay begins.

#### Acceptance Criteria

1. WHEN the game loads, THE Game SHALL display a MenuScene with the game title "Pixel Pals: The Town That Forgot Its Story", a start prompt, and atmospheric pixel art background.
2. WHEN the player presses the Enter key or clicks "Start" on the MenuScene, THE Game SHALL transition to the TownScene.
3. THE Game SHALL register MenuScene as the first scene and TownScene as the second scene in the Phaser scene list.
4. IF the game assets fail to load, THEN THE Game SHALL display a loading error message on screen rather than a blank canvas.

---

### Requirement 2: Town Map and Player Movement

**User Story:** As a player, I want to explore Maplewood freely using keyboard controls, so that I can discover the town and find Memory Fragments.

#### Acceptance Criteria

1. THE TownScene SHALL load a Tilemap named `town_map` via `manager.map(this, 'town_map')`.
2. WHEN the TownScene is created, THE Manager SHALL place Ash at the town entrance coordinates (tile position 5, 5).
3. WHILE the TownScene is active, THE Game SHALL move Ash in response to arrow key or WASD input via `this.maki.move(ash)`.
4. WHILE Ash is moving, THE Game SHALL enforce collision between Ash's sprite and the Collision_Layer of `town_map` via `this.physics.add.collider()`.
5. THE TownScene SHALL configure a camera that follows Ash and is bounded by the full dimensions of `town_map`.
6. IF Ash reaches the boundary of `town_map`, THEN THE Game SHALL prevent Ash from moving outside the map bounds.

---

### Requirement 3: NPC Dialogue System

**User Story:** As a player, I want to talk to NPCs in Maplewood, so that I can learn about the Memory Fog, receive quests, and experience the story.

#### Acceptance Criteria

1. THE TownScene SHALL place at least four NPCs (including Lia) at fixed tile positions on `town_map`.
2. WHEN Ash moves within 40 pixels of an NPC, THE Dialogue_System SHALL display an interaction prompt (e.g., "Press E to talk").
3. WHEN the player presses the E key while the interaction prompt is visible, THE Dialogue_System SHALL display the NPC's dialogue in a speech bubble overlay.
4. WHILE a dialogue is open, THE Game SHALL pause Ash's movement input.
5. WHEN the player presses the E key or Space key to advance dialogue, THE Dialogue_System SHALL display the next line of the NPC's dialogue sequence.
6. WHEN the last line of an NPC's dialogue is reached, THE Dialogue_System SHALL close the speech bubble and resume Ash's movement.
7. IF an NPC has a Quest attached, THEN THE Dialogue_System SHALL display a quest offer prompt at the end of the NPC's dialogue sequence.
8. WHEN an NPC's dialogue changes state (e.g., after a quest is completed), THE Dialogue_System SHALL display updated dialogue lines reflecting the new state.

---

### Requirement 4: Memory Fragment Collection

**User Story:** As a player, I want to collect Memory Fragments scattered around Maplewood, so that I can restore the town's history and progress the story.

#### Acceptance Criteria

1. THE TownScene SHALL place at least eight Memory_Fragment collectibles at distinct positions on `town_map`.
2. WHEN Ash's sprite overlaps a Memory_Fragment sprite, THE Game SHALL remove the Memory_Fragment from the scene and add it to the Inventory.
3. WHEN a Memory_Fragment is collected, THE Game SHALL display a brief pop-up message revealing the memory text associated with that fragment.
4. THE HUD SHALL display the current count of collected Memory_Fragments out of the total available (e.g., "Memories: 3 / 8").
5. IF a Memory_Fragment has already been collected, THEN THE Game SHALL not display it again on subsequent visits to the TownScene.
6. WHEN all eight Memory_Fragments are collected, THE Game SHALL trigger the final story sequence.

---

### Requirement 5: Quest System

**User Story:** As a player, I want to receive and complete quests from NPCs, so that I have structured goals that reward exploration and story progression.

#### Acceptance Criteria

1. THE Game SHALL support at least three distinct Quests, each assigned to a different NPC.
2. WHEN a Quest is accepted by the player, THE HUD SHALL display the active quest name and objective.
3. WHEN the player fulfills a Quest's objective (e.g., collects a specific Memory_Fragment or visits a location), THE Game SHALL mark the Quest as complete.
4. WHEN a Quest is marked complete and the player speaks to the quest-giver NPC, THE Dialogue_System SHALL display a completion dialogue and grant the player a reward (e.g., a new Memory_Fragment location hint or unlocked area).
5. THE Game SHALL track quest state persistently within the current game session so that completed quests are not re-offered.
6. IF the player has not yet accepted a Quest, THEN THE Dialogue_System SHALL offer it during the NPC's dialogue sequence.

---

### Requirement 6: Indoor Scene Transitions

**User Story:** As a player, I want to enter buildings in Maplewood, so that I can explore interiors and find hidden Memory Fragments or NPCs.

#### Acceptance Criteria

1. THE TownScene SHALL define at least two building entrance trigger zones on `town_map`.
2. WHEN Ash walks into a building entrance trigger zone, THE Game SHALL transition to the corresponding interior Scene (e.g., LibraryScene or CafeScene).
3. WHEN an interior Scene is loaded, THE Manager SHALL load the corresponding interior Tilemap and place Ash at the interior entrance position.
4. WHEN Ash reaches the exit trigger zone of an interior Scene, THE Game SHALL transition back to the TownScene and place Ash at the building entrance position.
5. WHILE transitioning between Scenes, THE Game SHALL display a brief fade-to-black animation of 300ms duration.

---

### Requirement 7: HUD and Inventory Display

**User Story:** As a player, I want to see my progress at a glance, so that I always know how many memories I've found and what quest I'm on.

#### Acceptance Criteria

1. THE HUD SHALL be rendered as a fixed overlay that does not scroll with the camera.
2. THE HUD SHALL display the Memory_Fragment count, the active Quest name, and Ash's current location name.
3. WHEN the player presses the I key, THE Inventory SHALL open as a panel listing all collected Memory_Fragments with their associated memory text.
4. WHILE the Inventory panel is open, THE Game SHALL pause Ash's movement input.
5. WHEN the player presses the I key or Escape key while the Inventory is open, THE Inventory SHALL close and resume Ash's movement.

---

### Requirement 8: Final Story Sequence

**User Story:** As a player, I want a satisfying ending when I restore all memories, so that the game feels complete and rewarding.

#### Acceptance Criteria

1. WHEN all eight Memory_Fragments are collected, THE Game SHALL trigger a cutscene sequence in which all NPCs gather in the town square.
2. WHEN the cutscene begins, THE Game SHALL disable player movement and display a series of full-screen dialogue panels narrating the restored town history.
3. WHEN the final dialogue panel is dismissed, THE Game SHALL display an end screen with the message "Maplewood remembers. Thanks for playing." and a prompt to restart.
4. WHEN the player selects restart on the end screen, THE Game SHALL reset all quest states, collected fragments, and NPC dialogue states, then transition back to the MenuScene.

---

### Requirement 9: Audio and Visual Atmosphere

**User Story:** As a player, I want the game to feel alive with sound and visual effects, so that Maplewood feels like a real, charming place.

#### Acceptance Criteria

1. THE Game SHALL play a looping background music track during the TownScene.
2. WHEN a Memory_Fragment is collected, THE Game SHALL play a short chime sound effect.
3. WHEN a dialogue opens or closes, THE Game SHALL play a soft pop sound effect.
4. THE TownScene SHALL render a subtle animated fog overlay on top of the Tilemap to represent the Memory_Fog.
5. WHERE a player has collected more than half of the Memory_Fragments, THE Game SHALL reduce the fog overlay opacity by 50% to visually reflect the town's recovery.

---

### Requirement 10: Maki Framework Compliance

**User Story:** As a hackathon judge, I want the game to correctly use the Maki framework APIs, so that the submission demonstrates proper use of the required technology.

#### Acceptance Criteria

1. THE Game SHALL extend the Maki `Scene` class for all game scenes.
2. THE Game SHALL create the player character using `this.maki.player('ash')`.
3. THE Game SHALL load all Tilemaps using `manager.map(this, 'map-name')`.
4. THE Game SHALL handle player movement using `this.maki.move(player)` inside the `update()` method.
5. THE Game SHALL register all maps in `maki.config.js` under the `maps` array.
6. THE Game SHALL register all sprites in `maki.config.js` under the `sprites` array.
