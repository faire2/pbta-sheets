import type { Skin } from "@/types/skin"

export const witch: Skin = {
  id: "witch",
  name: "The Witch",
  tagline: "Brooding, vengeful, secretive, and occult.",

  identity: {
    names: [
      "Abrielle",
      "Annalee",
      "Cordelia",
      "Darius",
      "Evelyn",
      "Gerard",
      "Lucca",
      "Merrill",
      "Sabrina",
      "Vanessa",
    ],
    looks: ["lithe", "guarded", "coy", "edgy", "meticulous"],
    eyes: [
      "calculating eyes",
      "smirking eyes",
      "playful eyes",
      "wicked eyes",
      "deep eyes",
    ],
    origins: [
      "taught by grandma",
      "awoken",
      "pagan initiate",
      "tumblr",
      "avid reader",
    ],
  },

  statLines: [
    { hot: -1, cold: 2, volatile: -1, dark: 1 },
    { hot: 1, cold: -1, volatile: -1, dark: 2 },
  ],

  startingMoveIds: ["sympathetic-tokens", "hex-casting"],
  // UNVERIFIED. The sheet states that the Witch starts with Sympathetic Tokens
  // and Hex-Casting, and "Choose two:" over the Hexes — but it never says how
  // many of Transgressive Magic / Sanctuary you pick. 1 is inferred from the
  // other skins' totals, not read off the page. Confirm against the book.
  chooseMoveCount: 1,

  moves: [
    {
      id: "sympathetic-tokens",
      name: "Sympathetic Tokens",
      summary:
        "Sympathetic Tokens — items of personal significance taken from others — are your source of power, and count as Strings on the people they belong to.",
    },
    {
      id: "hex-casting",
      name: "Hex-Casting",
      summary:
        "Know two Hexes. To cast one, either expend a Sympathetic Token during a secret ritual, or meet the target's gaze and chant at them, then roll with Dark. On a 10 up, it works and can easily be reversed. On a 7-9, it works, but choose one: you take 1 Harm; the Hex has weird side effects; you trigger your Darkest Self.",
    },
    {
      id: "transgressive-magic",
      name: "Transgressive Magic",
      summary:
        "Add 1 to a Hex-Casting roll when the ritual behind it transgresses the community's moral or sexual standards.",
    },
    {
      id: "sanctuary",
      name: "Sanctuary",
      summary:
        "You have a secret place for practicing witchcraft. Add 1 to all rolls you make within it.",
    },
  ],

  choiceGroups: [
    {
      id: "hexes",
      label: "Hexes",
      chooseCount: 2,
      options: [
        {
          id: "wither",
          name: "Wither",
          summary:
            "Inflicts a nasty physical affliction on the hexed — hair loss, rotting teeth, a sudden heavy period, sickly yellowed skin. The specifics vary, but it's bad.",
        },
        {
          id: "binding",
          name: "Binding",
          summary: "The hexed target becomes physically unable to harm others.",
        },
        {
          id: "ring-of-lies",
          name: "Ring of Lies",
          summary:
            "Whenever the hexed target tries to lie, they hear a piercing ringing noise. Big lies disorient them and can make their knees buckle; severe lies can cause harm or even brain damage.",
        },
        {
          id: "watching",
          name: "Watching",
          summary:
            "You fall into a deep sleep and begin seeing through the hexed target's eyes, sensing their reactions to and impressions of what they see.",
        },
        {
          id: "illusions",
          name: "Illusions",
          summary:
            "Pick one theme — snakes and bugs, demonic visages, false prophecies, non-existent subtext. The hexed sees that thing everywhere, though you don't control the exact manifestations.",
        },
      ],
    },
  ],

  backstory: [
    {
      id: "two-sympathetic-tokens",
      summary:
        "You start the game with two Sympathetic Tokens — decide whose they are and what they are.",
    },
    {
      id: "caught-rummaging",
      summary:
        "One of the others caught you rummaging through their friend's stuff, but hasn't said anything — they get a String on you.",
    },
  ],

  darkestSelf: {
    summary:
      "You hex anyone who slights you, without restraint or subtlety. Every hex you cast has unexpected side effects and is stronger than you're comfortable with.",
    escape: "Offer peace to the person you've hurt the most.",
  },

  sexMove: {
    summary:
      "After sex, you can take a Sympathetic Token from your partner — openly, and they're fine with it.",
  },

  advances: [
    { id: "stat-plus-one", summary: "Add +1 to one of your stats.", maxTimes: 1 },
    { id: "another-witch-move", summary: "Take another Witch move.", maxTimes: 1 },
    {
      id: "remaining-hexes",
      summary: "Take all the remaining Hexes.",
      maxTimes: 1,
    },
    { id: "new-hex", summary: "Create a new Hex.", maxTimes: 1 },
    { id: "any-skin-move", summary: "Take a move from any Skin.", maxTimes: 2 },
    { id: "coven", summary: "You belong to a Coven.", maxTimes: 1 },
  ],
}
