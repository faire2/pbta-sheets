import type { Skin } from "@/types/skin"

export const queen: Skin = {
  id: "queen",
  name: "The Queen",
  tagline: "Popular, dangerous, bitchy, and commanding.",

  identity: {
    names: [
      "Burton",
      "Brittany",
      "Cordelia",
      "Drake",
      "Jacqueline",
      "Kimball",
      "Raymond",
      "Reyes",
      "Varun",
      "Veronica",
    ],
    looks: ["stunning", "domineering", "icy", "neurotic", "talkative"],
    eyes: [
      "calculating eyes",
      "captivating eyes",
      "murky eyes",
      "vacant eyes",
      "pretty eyes",
    ],
    origins: [
      "most popular",
      "most dangerous",
      "cult leader",
      "source of the infection",
      "firstborn of the hive mind",
    ],
  },

  statLines: [
    { hot: 2, cold: 1, volatile: -1, dark: -1 },
    { hot: -1, cold: 2, volatile: -1, dark: 1 },
  ],

  startingMoveIds: ["the-clique"],
  chooseMoveCount: 1,

  moves: [
    {
      id: "the-clique",
      name: "The Clique",
      summary:
        "You head the toughest, coolest clique around, and it counts as a gang. Pick one strength for it from the Gang Strength choices.",
    },
    {
      id: "the-shield",
      name: "The Shield",
      summary:
        "While you're surrounded by your gang, subtract 1 from any roll made against you.",
    },
    {
      id: "bought-loyalty",
      name: "Bought Loyalty",
      summary:
        "Give a side character a String on you to strong-arm them into doing something for you right now; the MC decides what bribe, threat, or coaxing it takes.",
    },
    {
      id: "and-your-enemies-closer",
      name: "And Your Enemies Closer",
      summary: "Whenever someone betrays you, take a String on them.",
    },
    {
      id: "many-bodies",
      name: "Many Bodies",
      summary:
        "Promise one of your gang members to someone and add 2 to your roll to Turn Them On. Separately: whenever any of your gang members has sex with anyone, your Sex Move triggers.",
    },
    {
      id: "streaming",
      name: "Streaming",
      summary:
        "You share a telepathic link with your gang and always sense their emotions and fears. To pick out specific thoughts, Gaze Into the Abyss and add 1 to the roll.",
    },
  ],

  choiceGroups: [
    {
      id: "gang-strength",
      label: "Gang Strength",
      chooseCount: 1,
      options: [
        {
          id: "armed",
          name: "Armed",
          summary: "Your gang is packing guns and other genuinely dangerous weapons.",
        },
        {
          id: "connected",
          name: "Connected",
          summary: "Your gang has money and access to designer drugs.",
        },
        {
          id: "talented",
          name: "Talented",
          summary: "Your gang is genuinely good at something, like a band or a sports team.",
        },
        {
          id: "cultists",
          name: "Cultists",
          summary: "Your gang is bound by dark oaths and would die for you.",
        },
      ],
    },
  ],

  backstory: [
    {
      id: "gang-members",
      summary:
        "Name three side characters who belong to your gang, and gain a String on each of them.",
    },
    {
      id: "someone-threatening",
      summary:
        "Pick someone you find threatening. Give them a String on you, and take a String on them in return.",
    },
  ],

  darkestSelf: {
    summary:
      "Every failure by the people around you becomes unforgivable, and you feel entitled to make a harsh, cruel example out of whoever let you down rather than accept any consequences yourself.",
    escape:
      "Hand over part of your power to someone who deserves it more, or destroy an innocent person to prove your dominance.",
  },

  sexMove: {
    summary:
      "When you have sex with someone, they gain the Condition one of them; for as long as they hold it, they count as part of your gang.",
  },

  advances: [
    { id: "stat-plus-one", summary: "Add +1 to one of your stats.", maxTimes: 1 },
    { id: "another-queen-move", summary: "Take another Queen move.", maxTimes: 2 },
    { id: "any-skin-move", summary: "Take a move from any Skin.", maxTimes: 2 },
    {
      id: "clique-again",
      summary: "Take The Clique again and detail another gang.",
      maxTimes: 1,
    },
  ],
}
