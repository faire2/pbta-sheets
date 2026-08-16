import type { Skin } from "@/types/skin"

export const ghoul: Skin = {
  id: "ghoul",
  name: "The Ghoul",
  tagline: "Obsessive, dangerous, morbid, and quiet.",

  identity: {
    names: [
      "Akuji",
      "Cage",
      "Cole",
      "Georgia",
      "Horace",
      "Iggy",
      "Mara",
      "Morrigan",
      "Silas",
      "Sharona",
      "Victor",
      "Zed",
    ],
    looks: ["gaunt", "stiff", "disfigured", "detached", "wrecked"],
    eyes: [
      "hollow eyes",
      "quiet eyes",
      "calculating eyes",
      "harsh eyes",
      "hungry eyes",
    ],
    origins: ["resurrected", "constructed", "disturbed", "rejected", "sent"],
  },

  statLines: [
    { hot: -1, cold: 1, volatile: 2, dark: -1 },
    { hot: -1, cold: 2, volatile: -1, dark: 1 },
  ],

  startingMoveIds: ["the-hunger"],
  chooseMoveCount: 2,

  moves: [
    {
      id: "the-hunger",
      name: "The Hunger",
      summary:
        "Circle one Hunger — fear, power, plunder, or thrills. Chasing it recklessly adds 1 to your roll; passing up a good chance to feed means rolling to Keep Your Cool instead.",
    },
    {
      id: "what-the-right-hand-wants",
      name: "What the Right Hand Wants",
      summary:
        "Your body craves more than one thing — take an additional Hunger of your choice.",
    },
    {
      id: "satiety",
      name: "Satiety",
      summary:
        "Whenever you satisfy a Hunger, pick one: heal 1 Harm, mark experience, or take 1 Forward.",
    },
    {
      id: "short-rest-for-the-wicked",
      name: "Short Rest for the Wicked",
      summary:
        "Death doesn't stick — a few hours after you die, you rise again fully healed.",
    },
    {
      id: "watchful-golem",
      name: "Watchful Golem",
      summary:
        "Mark experience whenever you protect someone in secret, without them ever finding out you did it.",
    },
    {
      id: "ending",
      name: "Ending",
      summary:
        "You recall your own death in perfect detail. Sharing that story with someone gives them the Condition morbid, and you roll to Turn Them On using Cold.",
    },
    {
      id: "esprit-de-corpse",
      name: "Esprit de Corpse",
      summary:
        "When you Gaze Into the Abyss, it hands you one of its own Hungers to carry as your own; satiating it later also marks experience.",
    },
  ],

  choiceGroups: [
    {
      id: "hunger",
      label: "Hunger",
      chooseCount: 1,
      // The sheet prints these as bare labels with no description, so none is
      // given here. Don't add one — it would be invented rules text.
      options: [
        { id: "fear", name: "Fear" },
        { id: "power", name: "Power" },
        { id: "plunder", name: "Plunder" },
        { id: "thrills", name: "Thrills" },
      ],
    },
  ],

  backstory: [
    {
      id: "reminded-you-love-remained",
      summary:
        "Someone showed you that love hadn't been stolen from you by death after all — give them a String.",
    },
    {
      id: "watched-you-die",
      summary:
        "If someone witnessed your death, you and they each take 2 Strings on the other.",
    },
  ],

  darkestSelf: {
    summary:
      "Feeding is all you can think about, and your usual craving gives way to a deeper, more primal hunger for flesh and blood itself.",
    escape:
      "Escape it by overindulging, or by staying locked away long enough to regain your composure.",
  },

  sexMove: {
    summary: "Having sex with someone gives you a new Hunger.",
  },

  advances: [
    { id: "stat-plus-one", summary: "Add +1 to one of your stats.", maxTimes: 1 },
    { id: "another-ghoul-move", summary: "Take another Ghoul move.", maxTimes: 2 },
    { id: "any-skin-move", summary: "Take a move from any Skin.", maxTimes: 2 },
    { id: "reckless-crew", summary: "You're part of a Reckless Crew.", maxTimes: 1 },
  ],
}
