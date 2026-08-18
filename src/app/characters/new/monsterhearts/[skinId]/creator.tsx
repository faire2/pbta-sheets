"use client"

import { useTranslations } from "next-intl"
import { useMemo, useState, useTransition } from "react"
import type { Skin, Stats } from "@/types/skin"
import { createCharacter } from "../../actions"

/** Stat labels come from the catalogue — see docs/GLOSSARY.md. */
const STAT_KEYS = ["hot", "cold", "volatile", "dark"] as const

function signed(n: number): string {
  return n > 0 ? `+${String(n)}` : String(n)
}

/** A single tappable option from one of the sheet's identity lists. */
function Chip({
  label,
  selected,
  onSelect,
}: {
  label: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`border-rule focus-visible:outline-ink min-h-11 border px-3 py-2 font-sans text-[1.067rem] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 ${
        selected ? "border-ink bg-ink text-paper" : "text-ink-soft hover:border-ink hover:text-ink"
      }`}
    >
      {label}
    </button>
  )
}

function Section({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-10">
      <h2 className="sheet-heading">{title}</h2>
      {hint ? (
        <p className="text-ink-faint mt-2 font-sans text-[0.951rem] tracking-wide">{hint}</p>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  )
}

export function Creator({ skin }: { skin: Skin }) {
  const t = useTranslations()
  const [name, setName] = useState("")
  const [look, setLook] = useState("")
  const [eyes, setEyes] = useState("")
  const [origin, setOrigin] = useState("")
  const [statLineIndex, setStatLineIndex] = useState<number | null>(null)
  const [chosenMoves, setChosenMoves] = useState<string[]>([])
  const [choices, setChoices] = useState<Record<string, string[]>>({})
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const granted = useMemo(() => new Set(skin.startingMoveIds), [skin.startingMoveIds])
  const movesLeft = skin.chooseMoveCount - chosenMoves.length
  const groupsComplete = skin.choiceGroups.every(
    (g) => (choices[g.id] ?? []).length === g.chooseCount,
  )
  const ready = statLineIndex !== null && movesLeft === 0 && groupsComplete

  function toggleMove(id: string) {
    setChosenMoves((prev) => {
      if (prev.includes(id)) return prev.filter((m) => m !== id)
      if (prev.length >= skin.chooseMoveCount) return prev
      return [...prev, id]
    })
  }

  function toggleChoice(groupId: string, optionId: string, max: number) {
    setChoices((prev) => {
      const current = prev[groupId] ?? []
      if (current.includes(optionId)) {
        return { ...prev, [groupId]: current.filter((o) => o !== optionId) }
      }
      if (current.length >= max) return prev
      return { ...prev, [groupId]: [...current, optionId] }
    })
  }

  function submit() {
    // `ready` already asserts statLineIndex is set — TypeScript infers that
    // predicate from the const, so it narrows to a number below.
    if (!ready) return
    setError(null)
    startTransition(() => {
      void createCharacter({
        skinId: skin.id,
        name,
        look,
        eyes,
        origin,
        statLineIndex,
        moveIds: [...skin.startingMoveIds, ...chosenMoves],
        choiceSelections: choices,
      }).then((result) => {
        if (result.error) setError(result.error)
      })
    })
  }

  return (
    <div>
      <Section title={t("terms.identity")}>
        <label className="block">
          <span className="text-ink-faint font-sans text-[1.03rem] tracking-[0.16em] uppercase">
            {t("terms.name")}
          </span>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value)
            }}
            placeholder={t("creator.namePlaceholder")}
            className="border-rule focus:border-ink font-display text-ink placeholder:text-ink-faint mt-1.5 min-h-11 w-full border-0 border-b bg-transparent pb-1 text-2xl tracking-wide transition-colors outline-none placeholder:font-sans placeholder:text-base placeholder:tracking-normal placeholder:italic"
          />
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          {skin.identity.names.map((n) => (
            <Chip
              key={n}
              label={n}
              selected={name === n}
              onSelect={() => {
                setName(n)
              }}
            />
          ))}
        </div>

        {(
          [
            [t("terms.look"), skin.identity.looks, look, setLook],
            [t("terms.eyes"), skin.identity.eyes, eyes, setEyes],
            [t("terms.origin"), skin.identity.origins, origin, setOrigin],
          ] as const
        ).map(([label, options, value, set]) => (
          <div key={label} className="mt-6">
            <span className="text-ink-faint font-sans text-[1.03rem] tracking-[0.16em] uppercase">
              {label}
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              {options.map((option) => (
                <Chip
                  key={option}
                  label={option}
                  selected={value === option}
                  onSelect={() => {
                    set(value === option ? "" : option)
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </Section>

      <Section title={t("terms.stats")} hint={t("creator.statsHint")}>
        <div className="border-rule border-t">
          {skin.statLines.map((line: Stats, i) => {
            const selected = statLineIndex === i
            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setStatLineIndex(i)
                }}
                aria-pressed={selected}
                className={`border-rule press focus-visible:outline-ink flex min-h-14 w-full items-center gap-4 border-b px-1 focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  selected ? "bg-paper-deep" : ""
                }`}
              >
                <span aria-hidden className="mark" data-state={selected ? "on" : "off"} />
                <span className="grid flex-1 grid-cols-4 gap-2">
                  {STAT_KEYS.map((key) => (
                    <span key={key} className="text-left">
                      <span className="font-display text-ink block text-[1.334rem] leading-none">
                        {t(`terms.${key}`)}
                      </span>
                      <span className="text-ink-soft mt-1 block font-sans text-[1.218rem] leading-none tabular-nums">
                        {signed(line[key])}
                      </span>
                    </span>
                  ))}
                </span>
              </button>
            )
          })}
        </div>
      </Section>

      <Section
        title={t("terms.moves")}
        hint={
          skin.startingMoveIds.length > 0
            ? t("creator.movesHintGranted", {
                count: skin.startingMoveIds.length,
                choose: skin.chooseMoveCount,
              })
            : t("creator.movesHintPlain", { choose: skin.chooseMoveCount })
        }
      >
        <ul className="border-rule border-t">
          {skin.moves.map((move) => {
            const isGranted = granted.has(move.id)
            const isChosen = chosenMoves.includes(move.id)
            const atLimit = !isChosen && movesLeft === 0
            return (
              <li key={move.id} className="border-rule border-b">
                <button
                  type="button"
                  disabled={isGranted}
                  onClick={() => {
                    toggleMove(move.id)
                  }}
                  aria-pressed={isGranted || isChosen}
                  className={`press focus-visible:outline-ink flex w-full items-start gap-4 py-4 pr-1 pl-1 text-left focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    isGranted ? "cursor-default" : ""
                  } ${atLimit ? "opacity-45" : ""}`}
                >
                  <span
                    aria-hidden
                    className="mark mt-1.5"
                    data-state={isGranted ? "granted" : isChosen ? "on" : "off"}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="font-display text-ink flex items-baseline gap-2 text-[1.392rem] leading-tight tracking-wide">
                      {move.name}
                      {isGranted ? (
                        <span className="text-ink-faint font-sans text-[0.871rem] tracking-[0.18em] uppercase">
                          {t("terms.granted")}
                        </span>
                      ) : null}
                    </span>
                    <span className="text-ink-soft mt-1 block font-sans text-[1.079rem] leading-snug">
                      {move.summary}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </Section>

      {skin.choiceGroups.map((group) => {
        const picked = choices[group.id] ?? []
        return (
          <Section
            key={group.id}
            title={group.label}
            hint={t("creator.chooseCount", { count: group.chooseCount })}
          >
            <ul className="border-rule border-t">
              {group.options.map((option) => {
                const isOn = picked.includes(option.id)
                const atLimit = !isOn && picked.length >= group.chooseCount
                return (
                  <li key={option.id} className="border-rule border-b">
                    <button
                      type="button"
                      onClick={() => {
                        toggleChoice(group.id, option.id, group.chooseCount)
                      }}
                      aria-pressed={isOn}
                      className={`press focus-visible:outline-ink flex w-full items-start gap-4 py-4 pr-1 pl-1 text-left focus-visible:outline-2 focus-visible:outline-offset-2 ${
                        atLimit ? "opacity-45" : ""
                      }`}
                    >
                      <span aria-hidden className="mark mt-1.5" data-state={isOn ? "on" : "off"} />
                      <span className="min-w-0 flex-1">
                        <span className="font-display text-ink block text-[1.334rem] leading-tight tracking-wide">
                          {option.name}
                        </span>
                        {option.summary ? (
                          <span className="text-ink-soft mt-1 block font-sans text-[1.079rem] leading-snug">
                            {option.summary}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </Section>
        )
      })}

      <Section title={t("terms.backstory")} hint={t("creator.backstoryHint")}>
        <ul className="space-y-3">
          {skin.backstory.map((entry) => (
            <li
              key={entry.id}
              className="border-ink-faint text-ink-soft border-l-2 pl-4 font-sans text-[1.102rem] leading-snug"
            >
              {entry.summary}
            </li>
          ))}
        </ul>
      </Section>

      {/* Sticky commit bar — the sheet's bottom edge, always in reach. */}
      <div className="bg-paper/95 border-rule sticky bottom-0 mt-12 -mx-5 border-t px-5 py-4 backdrop-blur-sm sm:-mx-8 sm:px-8">
        {error ? <p className="text-oxblood mb-3 font-sans text-[1.044rem]">{error}</p> : null}
        <div className="flex items-center justify-between gap-4">
          <p className="text-ink-faint font-sans text-[0.951rem] leading-tight">
            {ready
              ? t("creator.statusReady")
              : statLineIndex === null
                ? t("creator.statusPickStats")
                : movesLeft > 0
                  ? t("creator.statusMovesLeft", { count: movesLeft })
                  : t("creator.statusFinishChoices")}
          </p>
          <button
            type="button"
            disabled={!ready || pending}
            onClick={submit}
            className="bg-ink text-paper focus-visible:outline-ink min-h-12 shrink-0 px-7 font-sans text-[1.102rem] tracking-[0.1em] uppercase transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-30"
          >
            {pending ? t("common.saving") : t("common.create")}
          </button>
        </div>
      </div>
    </div>
  )
}
