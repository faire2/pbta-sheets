import type { Skin } from "@/types/skin"

export const hollow: Skin = {
  id: "hollow",
  name: "The Hollow",
  tagline: "Uncertain, unstable, impressionable, and lost.",

  identity: {
    names: [
      "Adam",
      "Baby",
      "Bryce",
      "Dorothy",
      "Eva",
      "Franklin",
      "January",
      "Max",
      "Nix",
      "Raymond",
      "Summer",
    ],
    looks: ["immaculate", "disheveled", "haunted", "inexperienced", "earnest"],
    eyes: [
      "shifty eyes",
      "soulless eyes",
      "wide eyes",
      "vacant eyes",
      "desperate eyes",
    ],
    origins: [
      "born of a wish",
      "a failed experiment",
      "once a toy",
      "amnesiac",
      "machine",
    ],
  },

  statLines: [
    { hot: 1, cold: -1, volatile: -1, dark: 2 },
    { hot: -1, cold: -1, volatile: 2, dark: 1 },
  ],

  startingMoveIds: [],
  chooseMoveCount: 2,

  moves: [
    {
      id: "better-than-nothing",
      name: "Better Than Nothing",
      summary: "Mark experience any time you pick up a new Condition.",
    },
    {
      id: "a-blank-canvas",
      name: "A Blank Canvas",
      summary:
        "When you act in a way that lets one of your Conditions reshape who you are, cross that Condition off and add 1 to the roll.",
    },
    {
      id: "try-harder-next-time",
      name: "Try Harder Next Time",
      summary:
        "After you botch something, take a fitting Condition and gain 1 Forward.",
    },
    {
      id: "fake",
      name: "Fake",
      summary: "Add 1 to any roll made while you're lying.",
    },
    {
      id: "metamorphosis",
      name: "Metamorphosis",
      summary:
        "On a 7+ when you Gaze Into the Abyss, the abyss also reveals what you must become, and you may permanently swap two of your stats.",
    },
    {
      id: "strange-impressions",
      name: "Strange Impressions",
      summary:
        "When a main character hurts or heals you, you can stare at them and temporarily borrow one of their Skin moves onto your sheet — it disappears once you use it.",
    },
  ],

  choiceGroups: [],

  backstory: [
    {
      id: "learned-their-cues",
      summary:
        "You've learned to mimic someone by watching them closely — take 2 Strings on them.",
    },
    {
      id: "invented-past-exposed",
      summary:
        "Someone caught on that your backstory is fabricated — they gain 2 Strings on you.",
    },
  ],

  darkestSelf: {
    summary:
      "You feel trapped in your own body and need to punish it, and you need to track down whoever made you and hold them accountable.",
    escape: "Recognize that someone else is even more trapped than you are.",
  },

  sexMove: {
    summary:
      "After sex, each of you privately writes down whether it felt confusing or soothing to your character; if you both wrote the same word, you each mark experience.",
  },

  advances: [
    { id: "stat-plus-one", summary: "Add +1 to one of your stats.", maxTimes: 1 },
    { id: "another-hollow-move", summary: "Take another Hollow move.", maxTimes: 2 },
    { id: "any-skin-move", summary: "Take a move from any Skin.", maxTimes: 2 },
    { id: "hollow-siblings", summary: "You've found Hollow Siblings.", maxTimes: 1 },
  ],
}
