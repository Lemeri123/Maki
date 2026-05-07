/**
 * Memory Fragment definitions for Pixel Pals: The Town That Forgot Its Story
 *
 * Exactly 8 fragments spread across the town_map (800×800 pixels, 50×50 tiles × 16px).
 * Each fragment has:
 *   id   — unique string identifier (referenced by quests and GameState)
 *   x    — world pixel x position
 *   y    — world pixel y position
 *   text — the memory revealed when collected (short, evocative, 1–2 sentences)
 *
 * Fragment IDs referenced by quests:
 *   'fragment_fountain'  — near the fountain (x: 320, y: 256)
 *   'fragment_town_seal' — near the town hall (x: 480, y: 160)
 *   'fragment_recipe'    — in the café area  (x: 560, y: 320)
 */

const fragments = [
  {
    id: 'fragment_fountain',
    x: 320,
    y: 256,
    text: '"The fountain was built by the first mayor, who loved the sound of rain. Every spring, the whole town gathered here to hear it sing."',
  },
  {
    id: 'fragment_town_seal',
    x: 480,
    y: 160,
    text: '"Maplewood — Where Every Leaf Tells a Story. The seal was cast from bronze donated by every family in town."',
  },
  {
    id: 'fragment_recipe',
    x: 560,
    y: 320,
    text: '"Grandma Rosa\'s Maple Fog Cake: one cup of butter, two cups of flour, and enough love to make the kitchen smell like home."',
  },
  {
    id: 'fragment_old_bridge',
    x: 128,
    y: 480,
    text: '"The old bridge was built in a single weekend by the whole town. Nobody remembered whose idea it was, but everyone claimed credit."',
  },
  {
    id: 'fragment_market',
    x: 640,
    y: 480,
    text: '"Every Saturday, the market filled the square with colour and noise. Old Pete always sold the first fish of the morning for exactly one smile."',
  },
  {
    id: 'fragment_library',
    x: 192,
    y: 160,
    text: '"Lia catalogued every book by smell as well as title. She said a good library should be read with your nose first."',
  },
  {
    id: 'fragment_clocktower',
    x: 400,
    y: 400,
    text: '"The clock tower chimed thirteen times on the night the Fog arrived. Nobody has wound it since."',
  },
  {
    id: 'fragment_meadow',
    x: 704,
    y: 672,
    text: '"Children used to race through the meadow at dusk, chasing fireflies and calling them tiny memories. They weren\'t wrong."',
  },
]

export default fragments
