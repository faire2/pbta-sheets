import type { Skin } from "@/types/skin"

export const infernal: Skin = {
  id: "infernal",
  name: "The Infernal",
  tagline: "Tempted, impulsive, and in over their head.",

  identity: {
    names: [
      "Baron",
      "Cain",
      "Chloe",
      "Damien",
      "Logan",
      "Mark",
      "Mika",
      "Omar",
      "Ophelia",
      "Poe",
      "Yoanna",
    ],
    looks: ["quiet", "frantic", "venomous", "spoiled", "spooked"],
    eyes: [
      "empty eyes",
      "calculating eyes",
      "burning eyes",
      "flickering eyes",
      "piercing eyes",
    ],
    origins: [
      "bartered soul",
      "emissary",
      "last-chancer",
      "legion",
      "lackey",
      "chosen",
    ],
  },

  statLines: [
    { hot: -1, cold: -1, volatile: 2, dark: 1 },
    { hot: 1, cold: -1, volatile: -1, dark: 2 },
  ],

  startingMoveIds: ["soul-debt"],
  chooseMoveCount: 1,

  moves: [
    {
      id: "soul-debt",
      name: "Soul Debt",
      summary:
        "Establish your debt to a named Dark Power and pick two Bargains it has already struck with you. The Dark Power collects Strings on you as the debt deepens, and if it ever holds 5 Strings on you, you trigger your Darkest Self.",
    },
    {
      id: "dark-recruiter",
      name: "Dark Recruiter",
      summary:
        "Mark experience each time you deliver an innocent soul to the Dark Power.",
    },
    {
      id: "under-pressure",
      name: "Under Pressure",
      summary:
        "While someone holds 3 or more Strings on you, add 1 to any roll made to carry out their bidding.",
    },
    {
      id: "cant-save-myself",
      name: "Can't Save Myself",
      summary:
        "When someone rescues you from a threat beyond your own strength, they mark experience and you gain a String on them.",
    },
  ],

  choiceGroups: [
    {
      id: "bargains",
      label: "Bargains",
      chooseCount: 2,
      options: [
        {
          id: "the-power-flows-through-you",
          name: "The Power Flows Through You",
          summary: "Hand the Dark Power a String to add 2 to your next roll.",
        },
        {
          id: "numbing-it-out",
          name: "Numbing It Out",
          summary:
            "Hand the Dark Power a String to clear a Condition or heal up to two Harm.",
        },
        {
          id: "elsewise-power",
          name: "Elsewise Power",
          summary:
            "Hand the Dark Power a String to borrow a move you don't have, from any Skin, for a single use.",
        },
        {
          id: "uncanny-voices",
          name: "Uncanny Voices",
          summary:
            "Hand the Dark Power a String to learn a secret about someone you're talking to — their player chooses to reveal a secret fear, desire, or strength.",
        },
        {
          id: "strings-attached",
          name: "Strings Attached",
          summary:
            "Ask the Dark Power for something you desperately want; the MC sets a price and hints at a hidden catch, and paying it gets you what you asked for.",
        },
      ],
    },
  ],

  backstory: [
    {
      id: "owe-debts",
      summary:
        "You owe debts — give away 3 Strings, split however you like between the Dark Power and the other characters.",
    },
    {
      id: "someone-thinks-they-can-save-you",
      summary: "Someone believes they can save you — gain a String on them.",
    },
  ],

  darkestSelf: {
    summary:
      "You become needy, shivering, and desperate for connection, while the Dark Power piles on daunting, open-ended demands. Satisfying each demand strips away one of its Strings on you and edges you back toward feeling whole.",
    escape:
      "You escape once the Dark Power holds no more Strings on you, or you strike a bargain with something even more dangerous.",
  },

  sexMove: {
    summary:
      "Having sex removes one of the Dark Power's Strings on you and gives it a new String on whoever you had sex with instead.",
  },

  advances: [
    { id: "stat-plus-one", summary: "Add +1 to one of your stats.", maxTimes: 1 },
    {
      id: "another-infernal-move",
      summary: "Take another Infernal move.",
      maxTimes: 1,
    },
    {
      id: "take-remaining-bargains",
      summary: "Take the remaining Bargains.",
      maxTimes: 1,
    },
    { id: "any-skin-move", summary: "Take a move from any Skin.", maxTimes: 2 },
    { id: "needy-fiends", summary: "You supply for Needy Fiends.", maxTimes: 1 },
  ],
}
