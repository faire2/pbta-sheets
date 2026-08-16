import type { Skin } from "@/types/skin"

export const mortal: Skin = {
  id: "mortal",
  name: "The Mortal",
  tagline: "Vulnerable, magnetic, and beautiful.",

  identity: {
    names: [
      "Anne",
      "Carla",
      "Deirdre",
      "James",
      "Jonathan",
      "Laeli",
      "Patrick",
      "Robin",
      "Shen",
      "Timothy",
      "Wendy",
    ],
    looks: ["quiet", "desperate", "awkward", "beautiful", "displaced"],
    eyes: ["doe eyes", "sad eyes", "darting eyes", "nervous eyes", "human eyes"],
    origins: [
      "new kid in town",
      "kid next door",
      "your barista",
      "someone's girlfriend",
      "someone's boyfriend",
      "nobody",
    ],
  },

  statLines: [
    { hot: 2, cold: -1, volatile: -1, dark: 1 },
    { hot: 2, cold: -1, volatile: 1, dark: -1 },
  ],

  startingMoveIds: ["true-love"],
  chooseMoveCount: 2,

  moves: [
    {
      id: "true-love",
      name: "True Love",
      summary:
        "You always have exactly one Lover, chosen during your backstory. If you fall for someone else instead, give them a String and they become your new Lover. You always carry 1 forward toward earning your Lover's heart or fancy.",
    },
    {
      id: "mess-with-me-mess-with-him",
      name: "Mess With Me, Mess With Him",
      summary:
        "Invoking your Lover's name as a threat adds 2 to your roll to Shut Someone Down or Keep Your Cool, but your Lover gains a String on you for it.",
    },
    {
      id: "entrenched",
      name: "Entrenched",
      summary:
        "When you and another character hold a combined total of 5 or more Strings on each other, gain 1 to all rolls against them.",
    },
    {
      id: "sympathy-is-my-weapon",
      name: "Sympathy is My Weapon",
      summary:
        "Every time you forgive someone for hurting you and excuse their base nature, gain a String on them.",
    },
    {
      id: "excuses-are-my-armour",
      name: "Excuses Are My Armour",
      summary:
        "When you ignore some blatant problem with your Lover or how they treat you, mark experience.",
    },
    {
      id: "downward-spiral",
      name: "Downward Spiral",
      summary:
        "When you Gaze Into the Abyss, you may take 1 Harm to add 2 to your roll.",
    },
    {
      id: "down-the-rabbit-hole",
      name: "Down the Rabbit Hole",
      summary:
        "When you go poking your nose into affairs not meant for your kind, someone involved in the situation gains a String on you, and you mark experience.",
    },
  ],

  choiceGroups: [],

  backstory: [
    {
      id: "chosen-lover",
      summary:
        "Choose one person to be your Lover. Give them three Strings on you, and take one String on them.",
    },
  ],

  darkestSelf: {
    summary:
      "Nobody understands you or even tries, and you're tired of being walked over by the people you love. You lash out and betray them, exposing their monstrosity along with your own.",
    escape:
      "You escape your Darkest Self only by recognizing the pain you're causing your Lover.",
  },

  sexMove: {
    summary:
      "Having sex with someone stirs something sinister in you. The next time you take your eyes off them, they become their Darkest Self.",
  },

  advances: [
    { id: "stat-plus-one", summary: "Add +1 to one of your stats.", maxTimes: 1 },
    { id: "another-mortal-move", summary: "Take another Mortal move.", maxTimes: 2 },
    { id: "any-skin-move", summary: "Take a move from any Skin.", maxTimes: 3 },
  ],
}
