import type { Skin } from "@/types/skin"

export const ghost: Skin = {
  id: "ghost",
  name: "The Ghost",
  tagline: "Lonely, wounded, caring, and creepy.",

  identity: {
    names: [
      "Alastor",
      "Avira",
      "Catherine",
      "Daniel",
      "Kara",
      "Lenora",
      "Orville",
      "Rufus",
      "Spencer",
      "Tien",
    ],
    looks: ["forlorn", "scared", "stuffy", "out of place", "brooding"],
    eyes: [
      "hollow eyes",
      "pained eyes",
      "dull eyes",
      "unnerving eyes",
      "piercing eyes",
    ],
    origins: [
      "left to die",
      "murdered in cold blood",
      "murdered in hot passion",
      "a tragic accident",
      "a confused death",
    ],
  },

  statLines: [
    { hot: -1, cold: 2, volatile: -1, dark: 1 },
    { hot: -1, cold: -1, volatile: 1, dark: 2 },
  ],

  startingMoveIds: ["unresolved-trauma"],
  chooseMoveCount: 2,

  moves: [
    {
      id: "unresolved-trauma",
      name: "Unresolved Trauma",
      summary:
        "Anything that reminds you of your death gives you the Condition traumatized. When someone helps you resolve it, you both mark experience.",
    },
    {
      id: "helpful-spirit",
      name: "Helpful Spirit",
      summary: "Gain a String on anyone you help resolve a Condition.",
    },
    {
      id: "transference",
      name: "Transference",
      summary:
        "Truly listen to someone's struggles: they heal 1 Harm and their remaining harm transfers to you.",
    },
    {
      id: "projected-blame",
      name: "Projected Blame",
      summary:
        "While you hold the Condition traumatized, you may treat others as though they had the Condition at fault for my death.",
    },
    {
      id: "creep",
      name: "Creep",
      summary:
        "Silently witness someone in a private moment — sleeping, putting on makeup — and gain a String on them.",
    },
    {
      id: "limitless",
      name: "Limitless",
      summary: "You can walk through walls and fly.",
    },
  ],

  choiceGroups: [],

  backstory: [
    {
      id: "knows-you-died",
      summary:
        "Someone knows you're dead and how it happened — they gain 2 Strings on you.",
    },
    {
      id: "watched-them-sleep",
      summary:
        "You've been in someone's bedroom while they slept — take a String on them.",
    },
  ],

  darkestSelf: {
    summary:
      "You become invisible and unnoticeable — unseen, unheard, untouchable. Inanimate objects are your only way to communicate.",
    escape:
      "Someone acknowledges your presence and shows how much they want you around.",
  },

  sexMove: {
    summary:
      "After sex you each ask one another a question, in character or player-to-player, and both must answer honestly and directly.",
  },

  advances: [
    { id: "stat-plus-one", summary: "Add +1 to one of your stats.", maxTimes: 1 },
    { id: "another-ghost-move", summary: "Take another Ghost move.", maxTimes: 2 },
    { id: "any-skin-move", summary: "Take a move from any Skin.", maxTimes: 2 },
    { id: "haunted-house", summary: "You reside in a Haunted House.", maxTimes: 1 },
  ],
}
