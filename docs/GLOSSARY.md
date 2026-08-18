This way. # Glossary — canonical terms

**EN is the source language. CS is the translation.**

Game vocabulary must be translated *once* and then used consistently. A move that
calls a String a *Provázek* in one place and a *Nitka* in another makes the sheet
unusable at speed, which is the one thing this app exists to avoid.

Every term below lives in the `terms` namespace of `messages/*.json`. Reference it —
never retype a term inline, in either language.

## ⚠ The Czech column needs a native review

These are first-pass choices, not settled translations. There is **no official Czech
edition of Monsterhearts**, so nothing here is authoritative — it's a set of decisions
made to keep the app consistent until a Czech speaker rules on them. Where a choice was
genuinely contested, the alternatives and the reasoning are recorded below. Change them
freely; just change them *here and in `messages/`*, not ad hoc in components.

## Core vocabulary

| EN | CS | Key | Note |
|---|---|---|---|
| Skin | Kůže | `terms.skin` | Monsterhearts' word for a playbook. The literal translation keeps the monster-skin metaphor, which the game intends. |
| Season | Sezóna | `terms.season` | The campaign, framed as a season of teen TV. |
| Character | Postava | `terms.characters` | |
| Move | Tah | `terms.moves` | Standard PbtA rendering in Czech play. |
| Strings | Páky | `terms.strings` | **See note below.** |
| Condition | Stav | `terms.conditions` | |
| Harm | Zranění | `terms.harm` | |
| Experience | Zkušenost | `terms.experience` | |
| Advance | Postup | `terms.advance` | |
| Darkest Self | Nejtemnější já | `terms.darkestSelf` | |
| Escape | Únik | `terms.escape` | The condition for leaving your Darkest Self. |
| Backstory | Pozadí | `terms.backstory` | |
| Granted | Získáno | `terms.granted` | A move the skin gives you, not one you chose. |
| Forward | vpřed | — | PbtA's *take 1 forward*: a bonus on your **next** relevant roll. Render as *„vezmi si +1 vpřed"*. Deliberately NOT *postup* — that's reserved for Advance, and conflating them would make two different mechanics read alike. |
| Ongoing | trvale | — | The sibling of *forward* — a bonus lasting a whole scene rather than one roll. Not used by the core ten skins, listed so it doesn't get invented twice. |
Here we go.
## Identity fields

| EN | CS | Key |
|---|---|---|
| Identity | Identita | `terms.identity` |
| Name | Jméno | `terms.name` |
| Look | Vzhled | `terms.look` |
| Eyes | Oči | `terms.eyes` |
| Origin | Původ | `terms.origin` |

## Stats

| EN | CS | Key | Note |
|---|---|---|---|
| Stats | Vlastnosti | `terms.stats` | |
| Hot | Žár | `terms.hot` | **Contested.** *Žár* is literal heat; the stat means sexual magnetism. *Svůdnost* is more accurate but long and breaks the four-column stat row. Kept short deliberately — reconsider if the row can take it. |
| Cold | Chlad | `terms.cold` | |
| Volatile | Výbušnost | `terms.volatile` | |
| Dark | Temnota | `terms.dark` | |

## Notes on contested choices

**Strings → Páky.** Settled after review. The deciding test was how each reads in a
sentence someone actually says at the table:

- *„Mám na tebe dvě páky."* — idiomatic, and names the mechanic exactly
- *„Mám na tebe dva provázky."* — literal and odd

*Mít na někoho páku* is established Czech for holding leverage over someone, which is
what spending a String does: tempt them, condition them, add to a roll against them.
The register is rougher than the English — closer to slang than to *Strings* — and that
was accepted knowingly. Monsterhearts is not a polite game.

Rejected alternatives:

- *Provázky* / *Nitky* — faithful to the puppet-strings metaphor, unusable as countable
  nouns. The idiom *tahat za nitky* exists, but *„mám na tebe dva provázky"* doesn't.
- *Vlivy* — neutral, idiomatic (*mít na někoho vliv*), and covers Strings gained through
  attraction as well as coercion. Rejected as too clinical for the game's tone, and it
  collides with Masks' *Influence* if a second system is added.

**Skin → Kůže.** Note the plural collides: *kůže* is both singular and plural in the
nominative, so `terms.skin` and `terms.skins` carry the same string. That's correct
Czech, not a copy-paste error — don't "fix" it.

**Hot → Žár.** See the table. This is the weakest translation here and the one most
worth revisiting.

## Rules

0. **`terms.strings` exists before the mechanic does.** Strings aren't built yet —
   the key is canonical now so the UI can't invent its own wording later.
1. **Never inline a term.** `t("terms.harm")`, never the literal word, in either language.
2. **Add new terms here first**, then to both catalogs, then use them.
3. **Czech plurals need four forms** where English needs two — `one` / `few` / `other`
   at minimum (1 / 2–4 / 5+). Use ICU plural syntax; don't concatenate.
4. **Don't translate `Monsterhearts`, `PbtA`, or `Powered by the Apocalypse`.** They're
   proper nouns and stay in English in both catalogs.

## Grammatical gender — known issue, deliberately deferred

**Czech requires gender agreement where English has none.** Past-tense verbs and
predicate adjectives must be masculine or feminine, so every line of second-person
address on a sheet has to pick one. English simply doesn't.

**Current state:** each skin's text is gendered by its Czech skin noun. *Pekelník*,
*Vlkodlak*, *Duch*, *Ghúl* and *Smrtelník* use masculine agreement; *Víla*, *Prázdná*,
*Královna* and *Čarodějnice* use feminine. The **Vampire is internally inconsistent** —
called *Upír* (masculine) but written with feminine self-address, because it followed the
Fae file's convention rather than its own name.

**The consequence:** the sheet addresses a player in a gender chosen by their *skin*,
not their *character*. A boy playing the Víla reads feminine verb forms about himself.
For Monsterhearts — a game substantially about gender, sexuality and identity — that is
more than a grammar wrinkle.

**This is accepted for now** and flagged for future work (see ROADMAP → Backlog). If it
gets revisited, the options are:

1. **Generic masculine throughout** — conventional in Czech, and exclusionary in exactly
   the way this game is about.
2. **Rewrite to avoid gendered constructions** — achievable (present tense, imperatives,
   nominal phrasing) at some cost in naturalness. No schema change.
3. **A per-character gender setting that swaps forms** — correct, and a real feature:
   it needs a field on the character, two variants of every affected string, and a
   resolver that picks. The catalogue already has the shape for it.

Whoever picks this up: fix the Vampire's inconsistency first regardless of which route
is chosen — it's wrong under every convention.

## Skin content: translated

`src/data/skins/*.ts` holds the **mechanical** source of truth — ids, counts, stat
numbers — and is Zod-validated and audited against the reference PDF. Its **display
text** is lifted into catalogues:

- `messages/skins.en.json` — **generated**, never hand-edited. Run
  `yarn generate-skin-messages` after changing any skin data file; `yarn validate-data`
  fails if the two drift.
- `messages/skins.cs.json` — hand-written. All ten skins translated.

`localizeSkin(skin, locale)` in `src/data/skins/localize.ts` returns the same `Skin`
shape with text swapped, so components render unchanged. Resolution is per-field
(`cs` → `en`), which means a partial translation is useful immediately rather than
all-or-nothing.

**Positional lists.** `identity.looks`, `eyes` and `origins` resolve by index. A
translated list of a different length is rejected wholesale and falls back to English —
`validate-data` checks lengths so this fails loudly instead of silently.

### Still worth a native pass

- **Puns that didn't survive:** *Esprit de Corpse* (→ *Duch mrtvol*) and *Short Rest for
  the Wicked* both lost their wordplay to literal renderings.
- **Queen's *parta*** covers both "gang" and "The Clique", where English had two words —
  a couple of lines read redundantly as a result.
- **Sex Move** → *Sex tah*, not yet a canonical glossary term.
- **Vampire's *lord*** origin → *šlechtična*, which gendered a title the English left open.
