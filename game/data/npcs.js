/**
 * NPC definitions for Pixel Pals: The Town That Forgot Its Story
 *
 * Each NPC has:
 *   id            — unique string identifier
 *   name          — display name
 *   sprite        — key registered in maki.config sprites
 *   tileX/tileY   — spawn position in tiles (multiply by 16 for pixel pos)
 *   dialoguePhases — array of { lines[], questOffer?, questComplete? }
 *
 * Dialogue phases advance when a quest is accepted or completed.
 * Phase 0 = before quest, Phase 1 = quest active, Phase 2 = quest complete.
 */

const npcs = [
  {
    id: 'lia',
    name: 'Lia',
    sprite: 'lia',
    tileX: 12,
    tileY: 8,
    dialoguePhases: [
      {
        // Phase 0 — before quest accepted
        lines: [
          'Oh! A visitor. How... unusual.',
          'I\'m Lia. I think. The librarian? Probably.',
          'Everything feels like soup in my head lately.',
          'I had a journal — full of the town\'s history. Now I can\'t find it.',
          'I last saw it near the fountain, but that was... before the Fog.',
        ],
        questOffer: 'quest_lost_journal',
      },
      {
        // Phase 1 — quest active
        lines: [
          'The journal! Yes, please find it.',
          'It should be near the fountain — I used to read there on sunny days.',
          'Or was that someone else? Ugh, the Fog is so rude.',
        ],
      },
      {
        // Phase 2 — quest complete
        lines: [
          'You found it! Oh, this handwriting... it\'s mine!',
          '"Day one in Maplewood: the fountain sang when the wind blew just right."',
          'I remember now. Thank you, Ash. Truly.',
          'The Fog can\'t take what\'s written down.',
        ],
        questComplete: 'quest_lost_journal',
      },
    ],
  },

  {
    id: 'mayor',
    name: 'Mayor Bram',
    sprite: 'lia',
    tileX: 25,
    tileY: 10,
    dialoguePhases: [
      {
        // Phase 0 — before quest accepted
        lines: [
          'Ah, a newcomer! Welcome to... to...',
          'Hmm. What\'s the name of this place again?',
          'I\'m the mayor. I have a sash that says so. Very official.',
          'The town seal used to hang in the hall. It had the name on it.',
          'Without it, I keep introducing myself as "Mayor of Somewhere Nice."',
        ],
        questOffer: 'quest_town_seal',
      },
      {
        // Phase 1 — quest active
        lines: [
          'The seal! Yes, find the seal!',
          'It should be near the town hall — big bronze thing, very shiny.',
          'Or was it gold? I can\'t remember. The Fog is very inconvenient for governance.',
        ],
      },
      {
        // Phase 2 — quest complete
        lines: [
          'MAPLEWOOD! That\'s it! We\'re in Maplewood!',
          'I\'ve been calling it "The Place" for three weeks.',
          'The seal reads: "Maplewood — Where Every Leaf Tells a Story."',
          'Poetic. I definitely wrote that myself. Probably.',
        ],
        questComplete: 'quest_town_seal',
      },
    ],
  },

  {
    id: 'chef',
    name: 'Chef Rosa',
    sprite: 'lia',
    tileX: 35,
    tileY: 20,
    dialoguePhases: [
      {
        // Phase 0 — before quest accepted
        lines: [
          'Welcome to the café! I think. Is this a café?',
          'I\'m Rosa. I cook things. At least, I used to.',
          'My grandmother\'s recipe book vanished with the Fog.',
          'Now everything I make tastes like... competent sadness.',
          'If you find any trace of it, I\'d be forever grateful.',
        ],
        questOffer: 'quest_recipe',
      },
      {
        // Phase 1 — quest active
        lines: [
          'The recipe! It might be near the café — I always kept it close.',
          'Look for something that smells faintly of cinnamon and regret.',
          'That\'s how grandma described her cooking, anyway.',
        ],
      },
      {
        // Phase 2 — quest complete
        lines: [
          'The secret ingredient was love! And also a lot of butter.',
          'Grandma\'s Maple Fog Cake — I remember it now!',
          'Ironic name, given the circumstances.',
          'Here, take a slice. It\'s the least I can do for the town\'s archivist.',
        ],
        questComplete: 'quest_recipe',
      },
    ],
  },

  {
    id: 'pete',
    name: 'Old Pete',
    sprite: 'lia',
    tileX: 8,
    tileY: 30,
    dialoguePhases: [
      {
        // Phase 0 — before player has collected 4+ fragments
        lines: [
          'Hmm? Oh, don\'t mind me. Just fishing.',
          'The lake used to have a name. Something with an "L".',
          'Or maybe a "B". Could\'ve been a number.',
          'The Fog took the name but left the fish. Fair trade, I suppose.',
        ],
      },
      {
        // Phase 1 — after player has collected 4+ fragments
        lines: [
          'You\'ve been busy, haven\'t you? I can feel the Fog thinning.',
          'Lake Bellmere. That\'s what it\'s called. Just remembered.',
          'My father taught me to fish here. Said the water remembers everything.',
          'Turns out he was right. Keep going, kid. The town needs you.',
        ],
      },
    ],
  },
]

export default npcs
