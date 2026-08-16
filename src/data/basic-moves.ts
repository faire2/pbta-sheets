import type { BasicMove, RulesEntry } from "@/types/rules"

/**
 * The six basic moves, available to every character whatever their skin.
 * Source: the Player Sheet (p1 of the reference PDF in `docs/`).
 * Wording is our own rules-shorthand; see `src/types/skin.ts` on `fullText`.
 */
export const basicMoves: BasicMove[] = [
  {
    id: "turn-someone-on",
    name: "Turn Someone On",
    stat: "hot",
    trigger: "You turn someone on.",
    strongHit: "Gain a String on them, and they pick a reaction below.",
    weakHit: "They choose: give you a String, or pick a reaction below.",
    options: [
      "I give myself to you",
      "I promise something I think you want",
      "I get embarrassed and act awkward",
    ],
  },
  {
    id: "shut-someone-down",
    name: "Shut Someone Down",
    stat: "cold",
    trigger: "You shut someone down.",
    strongHit: "Choose one option below.",
    weakHit:
      "Choose one option below, but you come off badly and they hand you a Condition in return.",
    options: [
      "They lose a String on you",
      "If they have no Strings on you, gain one on them",
      "They gain a Condition",
      "You take 1 Forward",
    ],
  },
  {
    id: "keep-your-cool",
    name: "Keep Your Cool",
    stat: "cold",
    trigger: "You act despite fear. Name what you're afraid of.",
    strongHit:
      "You hold it together and gain insight: ask the MC a question about the situation, and take 1 Forward acting on the answer.",
    weakHit:
      "The MC tells you how this would leave you vulnerable; you choose whether to back down or push on regardless.",
    options: [],
  },
  {
    id: "lash-out-physically",
    name: "Lash Out Physically",
    stat: "volatile",
    trigger: "You lash out physically.",
    strongHit: "You deal harm, and they freeze up before they can react.",
    weakHit: "You deal harm, but choose one option below.",
    options: [
      "They learn something about your true nature and gain a String on you",
      "The MC decides how badly the harm lands",
      "You become your Darkest Self",
    ],
  },
  {
    id: "run-away",
    name: "Run Away",
    stat: "volatile",
    trigger: "You run away.",
    strongHit: "You reach somewhere safe.",
    weakHit: "You get away, but choose one option below.",
    options: [
      "You run into something worse",
      "You cause a big scene",
      "You leave something behind",
    ],
  },
  {
    id: "gaze-into-the-abyss",
    name: "Gaze Into the Abyss",
    stat: "dark",
    trigger: "You gaze into the abyss. Name what you're looking for.",
    strongHit:
      "The abyss answers in clear visions, and you take 1 Forward to acting on them.",
    weakHit:
      "The visions are confusing and alarming, but you get your answer all the same.",
    options: [],
  },
]

/** The non-move rules boxes from the Player Sheet. */
export const rulesEntries: RulesEntry[] = [
  {
    id: "pulling-strings",
    name: "Pulling Strings",
    summary: "When you spend a String on someone, choose one:",
    options: [
      "Tempt them to do what you want",
      "Give them a Condition",
      "Add 1 to your roll against them",
      "Add 1 to the harm you deal them",
    ],
  },
  {
    id: "healing",
    name: "Healing",
    summary:
      "Take time to tend your wounds and heal 1 Harm, once per session. If someone else tends them — delicately, intimately — heal 1 more.",
    options: [],
  },
  {
    id: "skirting-death",
    name: "Skirting Death",
    summary: "To cheat death, erase all harm and choose one:",
    options: [
      "Become your Darkest Self",
      "Lose every String you hold on everybody",
    ],
  },
  {
    id: "conditions",
    name: "Conditions",
    summary:
      "Exploiting someone's Condition in a move against them adds 1 to your roll. A Condition lifts once its bearer takes action that addresses it.",
    options: [],
  },
  {
    id: "experience",
    name: "Experience",
    summary: "Mark experience every time you fail a roll.",
    options: [],
  },
  {
    id: "gangs",
    name: "Gangs",
    summary: "A gang adds +1 to your rolls and to your harm, where applicable.",
    options: [],
  },
]
