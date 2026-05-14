# Pixel Pals: The Town That Forgot Its Story

A 2D pixel RPG built with the [Maki framework](https://github.com/tial-ops/maki) for the **Maki Hackathon 2026**.

You play as **Ash**, a wandering archivist who arrives in Maplewood to find that every resident has lost their memory due to a mysterious **Memory Fog**. Explore the town, talk to the locals, collect lost Memory Fragments, and restore the town's history before it's forgotten forever.

<img width="1113" height="863" alt="image" src="https://github.com/user-attachments/assets/0f5ac6fa-a442-4113-aca2-61c2aa16baf3" />
<img width="1113" height="863" alt="Screenshot from 2026-05-07 22-35-55" src="https://github.com/user-attachments/assets/fbba3e36-cba5-4a62-9560-872546697f5b" />



---

## Getting Started

```bash
npm install
maki dev
```

Then open your browser at the local URL shown in the terminal (usually `http://localhost:5173`).

---

## How to Play

### Movement
| Key | Action |
|-----|--------|
| Arrow keys or WASD | Move Ash around Maplewood |

### Talking to NPCs
Walk up to any character until you see the **[E] Talk** prompt appear above them, then press **E** to start a conversation. Press **E** or **Space** to advance through dialogue lines.

There are 4 characters to find:
- **Lia** (blue) — the town librarian. She remembers fragments of the old story.
- **Mayor Bram** (gold) — the confused mayor who can't remember the town's name.
- **Chef Rosa** (orange) — the café owner searching for her grandmother's lost recipe.
- **Old Pete** (green) — a fisherman by the lake who speaks in riddles.

### Collecting Memories
Yellow glowing circles scattered around the map are **Memory Fragments**. Walk into one to collect it. A pop-up will reveal the memory it contains.

The top-left HUD shows your progress: **Memories: X / 8**
Collect all 8 to trigger the ending.

### Quests
Some NPCs will offer you a quest after their dialogue. Accepting a quest adds it to your HUD. Complete it by finding the Memory Fragment they're looking for, then talk to them again to see their reaction.

### Inventory
Press **I** at any time to open your **Memory Archive** — a list of all the memories you've collected so far. Press **I** or **Escape** to close it.

### Entering Buildings
Walk through the glowing doorways (marked with a **▼** arrow) to enter the **Library** or the **Café**. Walk to the bottom exit to return to town.

### The Fog
Maplewood is shrouded in a Memory Fog. As you collect more fragments, the fog gradually lifts and the town becomes clearer.

---

## Ending

Collect all 8 Memory Fragments to trigger the final cutscene. Watch the town remember its story, then choose to play again from the title screen.

---

## Controls Summary

| Key | Action |
|-----|--------|
| Arrow keys / WASD | Move |
| E | Talk / Advance dialogue |
| Space | Advance dialogue |
| I | Open / close Memory Archive |
| Escape | Close Memory Archive |
| Enter | Start game (title screen) / advance cutscene |

---

## Running Tests

```bash
npm test
```

Runs the property-based test suite (10 correctness properties, 100 iterations each) using Vitest + fast-check.

---

## Built With

- [Maki](https://github.com/tial-ops/maki) — 2D pixel RPG framework
- [Phaser 3](https://phaser.io) — game engine (via Maki)
- [Vite](https://vitejs.dev) — dev server
- [Vitest](https://vitest.dev) + [fast-check](https://github.com/dubzzz/fast-check) — property-based testing
