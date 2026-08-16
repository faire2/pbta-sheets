import type { Skin } from "@/types/skin"

/**
 * The Fae — worked example for the skin data layer.
 *
 * Mechanical data (identity options, stat lines, advances) is transcribed as-is;
 * it's short factual option lists. Prose is summarised in our own words. See
 * `src/types/skin.ts` for why `fullText` is absent.
 */
export const fae: Skin = {
  id: "fae",
  name: "The Fae",
  tagline: "Alluring, otherworldly, fickle, and vengeful.",

  identity: {
    names: [
      "Anders",
      "Aurora",
      "Crow",
      "Gail",
      "Harmony",
      "Iris",
      "Lilith",
      "Ping",
      "Selene",
      "Sienna",
      "Walthus",
    ],
    looks: ["dainty", "girlish", "gaunt", "mysterious", "dishevelled"],
    eyes: [
      "quick eyes",
      "lyrical eyes",
      "mesmerizing eyes",
      "laughing eyes",
      "piercing eyes",
    ],
    origins: [
      "fae born",
      "fae blooded",
      "swapped at birth",
      "stole the gift",
      "touched with the gift",
    ],
  },

  statLines: [
    { hot: 2, cold: -1, volatile: -1, dark: 1 },
    { hot: 1, cold: -1, volatile: 2, dark: -1 },
  ],

  startingMoveIds: ["faery-contract"],
  chooseMoveCount: 1,

  moves: [
    {
      id: "faery-contract",
      name: "Faery Contract",
      summary:
        "Take a String on anyone who breaks a promise or contract made to you. Spending that String for justice unlocks extra options: make them fumble something at a crucial moment for 1 Harm, or add 2 to an act of vengeance.",
    },
    {
      id: "lure",
      name: "Lure",
      summary:
        "When someone makes you a promise, they mark experience. When someone breaks a promise to you, you mark experience.",
    },
    {
      id: "guide",
      name: "Guide",
      summary:
        "Spend a String on someone willing to carry them across the veil into the faery realm, for a scene or two, before you both return.",
    },
    {
      id: "beyond-the-veil",
      name: "Beyond The Veil",
      summary:
        "Gaze Into the Abyss to seek audience with the Faery King. On a strong hit he also reveals a hidden String on someone, and you gain it; on a weak hit he also demands a favour.",
    },
    {
      id: "unashamed",
      name: "Unashamed",
      summary:
        "Give someone a String on you to add 3 to your attempt to Turn Them On.",
    },
    {
      id: "the-wild-hunt",
      name: "The Wild Hunt",
      summary:
        "Add 1 to Turn Someone On when you draw on your most feral manner, moving like a cat or a wolf.",
    },
  ],

  choiceGroups: [],

  backstory: [
    {
      id: "heart-on-sleeve",
      summary: "You wear your heart on your sleeve — give everyone one String.",
    },
    {
      id: "captured-fancy",
      summary: "You've captured someone's fancy — gain 2 Strings on them.",
    },
  ],

  darkestSelf: {
    summary:
      "Every word you say and hear registers as a promise, and any broken promise demands justice through trickery or blood. Human notions of mercy don't apply to you.",
    escape: "Re-balance the scales of justice in some way.",
  },

  sexMove: {
    summary:
      "When you lie naked with someone, you can ask them for a promise. If they refuse, take 2 Strings on them.",
  },

  advances: [
    { id: "stat-plus-one", summary: "Add +1 to one of your stats.", maxTimes: 1 },
    { id: "another-fae-move", summary: "Take another Fae move.", maxTimes: 2 },
    { id: "any-skin-move", summary: "Take a move from any Skin.", maxTimes: 2 },
    { id: "jury-of-fae", summary: "You belong to a Jury of Fae.", maxTimes: 1 },
  ],
}
