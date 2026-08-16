import type { Skin } from "@/types/skin"

export const werewolf: Skin = {
  id: "werewolf",
  name: "The Werewolf",
  tagline: "Aggressive, domineering, primal, and amorous.",

  identity: {
    names: [
      "Cassidy",
      "Candika",
      "Flinch",
      "Levi",
      "Margot",
      "Lorrie",
      "Luna",
      "Peter",
      "Tucker",
      "Zachary",
    ],
    looks: ["primal", "unkempt", "wiry", "rugged", "feisty"],
    eyes: [
      "cunning eyes",
      "predatory eyes",
      "fierce eyes",
      "savage eyes",
      "wolf eyes",
    ],
    origins: [
      "born a wolf",
      "bitten",
      "raised by wolves",
      "ancestral power",
      "awoken",
      "favoured by the moon",
    ],
  },

  statLines: [
    { hot: 1, cold: -1, volatile: 2, dark: -1 },
    { hot: 2, cold: -1, volatile: 1, dark: -1 },
  ],

  startingMoveIds: [],
  chooseMoveCount: 2,

  moves: [
    {
      id: "primal-dominance",
      name: "Primal Dominance",
      summary: "Whenever you harm someone, take a String on them.",
    },
    {
      id: "scent-of-blood",
      name: "Scent of Blood",
      summary:
        "Add 1 to any roll made against someone who has already been harmed earlier in the current scene.",
    },
    {
      id: "howl-at-the-moon",
      name: "Howl at the Moon",
      summary:
        "While bathed in moonlight, you may treat your Dark stat as if it were 3.",
    },
    {
      id: "spirit-armour",
      name: "Spirit Armour",
      summary:
        "While bathed in moonlight, reduce all harm you suffer by 1, and add 2 to all rolls to Keep Your Cool.",
    },
    {
      id: "heightened-senses",
      name: "Heightened Senses",
      summary:
        "When you lean on your animal instincts to read a charged situation, roll with Dark. On a 10 up, ask the MC three questions from a fixed list and take 1 Forward; on a 7-9, ask one question and take 1 Forward. The list covers things like your best escape route or way in, who's most vulnerable to you, their secret weakness, what poses the biggest threat, and who's really in control.",
    },
    {
      id: "unstable",
      name: "Unstable",
      summary: "Mark experience whenever you become your Darkest Self.",
    },
  ],

  choiceGroups: [],

  backstory: [
    {
      id: "lack-subtlety",
      summary: "You lack subtlety — give everyone a String.",
    },
    {
      id: "watched-from-a-distance",
      summary:
        "You've spent weeks quietly watching someone, and now know their scent and mannerisms by heart — gain two Strings on them.",
    },
  ],

  darkestSelf: {
    summary:
      "You become a monstrous wolf-creature consumed by a hunger for power and dominance, which you pursue through bloodshed — anyone who stands in your way must be brought down and made to bleed.",
    escape:
      "Ends when you wound someone you truly care about, or when the sun rises — whichever happens first.",
  },

  sexMove: {
    summary:
      "Having sex with someone forges a deep spirit connection between you: while it holds, add 1 to all rolls made to defend them. Either of you can break the connection by having sex with someone else, and you'll know when it breaks.",
  },

  advances: [
    { id: "stat-plus-one", summary: "Add +1 to one of your stats.", maxTimes: 1 },
    { id: "another-werewolf-move", summary: "Take another Werewolf move.", maxTimes: 2 },
    { id: "any-skin-move", summary: "Take a move from any Skin.", maxTimes: 2 },
    { id: "wolf-pack", summary: "You belong to a Wolf Pack.", maxTimes: 1 },
  ],
}
