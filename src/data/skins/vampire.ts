import type { Skin } from "@/types/skin"

export const vampire: Skin = {
  id: "vampire",
  name: "The Vampire",
  tagline: "Icy, manipulative, hypnotic, and cruel.",

  identity: {
    names: [
      "Amanda",
      "Cassius",
      "Clayton",
      "Helene",
      "Isaiah",
      "Jessamine",
      "Jong",
      "Lucian",
      "Marcell",
      "Morana",
      "Serina",
    ],
    looks: ["intense", "aloof", "predatory", "smoldering", "old-fashioned"],
    eyes: ["dead eyes", "lusty eyes", "pained eyes", "hungry eyes", "thirsty eyes"],
    origins: [
      "newly reborn",
      "taken this century",
      "many ages old",
      "lord",
      "cursed blood",
    ],
  },

  statLines: [
    { hot: 2, cold: 1, volatile: -1, dark: -1 },
    { hot: 1, cold: 2, volatile: -1, dark: -1 },
  ],

  startingMoveIds: [],
  chooseMoveCount: 2,

  moves: [
    {
      id: "invited",
      name: "Invited",
      summary:
        "You can't enter a home uninvited. Whenever someone invites you in, gain a String on them.",
    },
    {
      id: "hypnotic",
      name: "Hypnotic",
      summary:
        "Roll with Hot to hypnotize someone who has no Strings on you. On a 10+ they obey your wishes exactly, unaware anything happened. On a 7-9 the hypnosis works, but choose one: they realize what you did to them, they botch your commands, or their sanity is left unhinged.",
    },
    {
      id: "cold-as-ice",
      name: "Cold as Ice",
      summary:
        "When you Shut Someone Down and roll a 7 or higher, choose an extra option from that move's list.",
    },
    {
      id: "the-feeding",
      name: "The Feeding",
      summary:
        "Feed directly on someone's hot blood. The first time you feed on them, you both mark experience. Each time you feed, choose two: heal 1 Harm, take 1 Forward, or ensure they definitely don't die.",
    },
    {
      id: "marked-for-the-hunt",
      name: "Marked for the Hunt",
      summary:
        "Feeding on someone creates a lasting, preternatural bond. Afterward, when you Gaze Into the Abyss about their whereabouts or well-being, roll as though your Dark were 3.",
    },
    {
      id: "inescapable",
      name: "Inescapable",
      summary:
        "Spend a String on someone to demand they remain in your presence. If they walk out on you anyway, gain 2 Strings on them.",
    },
  ],

  choiceGroups: [],

  backstory: [
    {
      id: "beautiful",
      summary: "Your beauty is undeniable — gain a String on everyone.",
    },
    {
      id: "saved-your-unlife",
      summary: "Someone once saved your unlife — they gain 2 Strings on you.",
    },
  ],

  darkestSelf: {
    summary:
      "Everyone around you becomes a pawn or a plaything, to be hurt and toyed with for your own amusement before you're through with them.",
    escape: "Someone more powerful than you puts you in your rightful place.",
  },

  sexMove: {
    summary:
      "When you deny someone sexually, gain a String on them. When you have sex with someone, lose all Strings on them.",
  },

  advances: [
    { id: "stat-plus-one", summary: "Add +1 to one of your stats.", maxTimes: 1 },
    { id: "another-vampire-move", summary: "Take another Vampire move.", maxTimes: 2 },
    { id: "any-skin-move", summary: "Take a move from any Skin.", maxTimes: 2 },
    { id: "vampiric-coterie", summary: "You're in a Vampiric Coterie.", maxTimes: 1 },
  ],
}
