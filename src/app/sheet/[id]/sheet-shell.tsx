"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import {
  useEffect,
  useLayoutEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { LocaleSwitch } from "@/components/locale-switch"
import { setStatBonus } from "../actions"
import {
  MAX_BONUS,
  MIN_BONUS,
  STAT_KEYS,
  StatStrip,
  type StatKey,
  type StatValues,
} from "./stats-panel"

/**
 * Screen order follows how often a screen is touched mid-scene, with the
 * default in second place: one swipe left reaches Strings, one right reaches
 * your moves. Basics and Notes sit furthest out — the first is what you stop
 * consulting after a few sessions, the second is written between them.
 */
const PANES = ["strings", "you", "moves", "basics", "notes"] as const
type Pane = (typeof PANES)[number]
const START_INDEX = 1

/** Fallback until the header is measured; only matters for the first paint. */
const ESTIMATED_HEADER = 168

export function SheetShell({
  characterId,
  editable,
  backLabel,
  skinName,
  characterName,
  identityLine,
  base,
  bonuses,
  panes,
}: {
  characterId: string
  editable: boolean
  backLabel: string
  skinName: string
  characterName: string
  identityLine: string
  base: StatValues
  bonuses: StatValues
  panes: Record<Pane, ReactNode>
}) {
  const t = useTranslations()
  const [api, setApi] = useState<CarouselApi>()
  const [active, setActive] = useState(START_INDEX)
  const [adjusting, setAdjusting] = useState<StatKey | null>(null)
  const headerRef = useRef<HTMLElement>(null)
  const [headerHeight, setHeaderHeight] = useState(ESTIMATED_HEADER)

  const [optimisticBonuses, applyBonus] = useOptimistic(
    bonuses,
    (state: StatValues, patch: { stat: StatKey; value: number }) => ({
      ...state,
      [patch.stat]: patch.value,
    }),
  )
  const [, startTransition] = useTransition()

  const values = Object.fromEntries(
    STAT_KEYS.map((key) => [key, base[key] + optimisticBonuses[key]]),
  ) as StatValues

  function bump(stat: StatKey, delta: number) {
    const next = optimisticBonuses[stat] + delta
    if (next < MIN_BONUS || next > MAX_BONUS) return
    startTransition(() => {
      applyBonus({ stat, value: next })
      void setStatBonus(characterId, stat, next)
    })
  }

  // Panes scroll inside a fixed viewport rather than the page, so the tabs
  // stay put. That needs the header's real height — it changes with a long
  // character name, and with the browser chrome on a phone.
  useLayoutEffect(() => {
    const node = headerRef.current
    if (!node) return
    const observer = new ResizeObserver(() => {
      setHeaderHeight(node.getBoundingClientRect().height)
    })
    observer.observe(node)
    setHeaderHeight(node.getBoundingClientRect().height)
    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!api) return
    const onSelect = () => {
      setActive(api.selectedScrollSnap())
      setAdjusting(null)
    }
    api.on("select", onSelect)
    onSelect()
    return () => {
      api.off("select", onSelect)
    }
  }, [api])

  return (
    <div className="flex h-dvh flex-col">
      <header ref={headerRef} className="bg-paper border-rule shrink-0 border-b pt-3 pb-1">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-2.5 px-5 sm:px-8">
          <Link
            href="/"
            aria-label={backLabel}
            className="text-ink-faint hover:text-ink -ml-1 flex h-9 w-7 shrink-0 items-center justify-center font-sans text-lg leading-none transition-colors"
          >
            ←
          </Link>
          <h1 className="font-display text-ink min-w-0 flex-1 truncate text-[1.85rem] leading-none tracking-tight">
            {characterName}
          </h1>
          <LocaleSwitch />
        </div>

        <div className="mx-auto w-full max-w-2xl px-5 sm:px-8">
          <p className="text-ink-soft mt-1.5 truncate font-sans text-[0.82rem] italic">
            <span className="text-ink-faint tracking-[0.14em] uppercase not-italic">
              {skinName}
            </span>
            {identityLine ? ` · ${identityLine}` : ""}
          </p>

          <div className="mt-2">
            <StatStrip
              values={values}
              bonuses={optimisticBonuses}
              editable={editable}
              active={adjusting}
              onSelect={setAdjusting}
              onBump={bump}
            />
          </div>

          {/* Buttons over ARIA tabs: the panes belong to a carousel that owns
              its own region/group semantics, and layering a tablist on top
              would announce two conflicting structures. */}
          <nav className="mt-1.5 flex" aria-label={t("sheet.screens")}>
            {PANES.map((pane, index) => {
              const isActive = index === active
              return (
                <button
                  key={pane}
                  type="button"
                  aria-current={isActive}
                  onClick={() => {
                    api?.scrollTo(index)
                  }}
                  className={`min-h-10 flex-1 border-b-2 px-0.5 font-sans text-[0.65rem] tracking-[0.06em] uppercase transition-colors ${
                    isActive
                      ? "border-ink text-ink"
                      : "text-ink-faint hover:text-ink border-transparent"
                  }`}
                >
                  {t(`sheet.pane.${pane}`)}
                </button>
              )
            })}
          </nav>
        </div>
      </header>

      <Carousel
        setApi={setApi}
        opts={{ startIndex: START_INDEX, align: "start" }}
        className="min-h-0 flex-1"
      >
        <CarouselContent className="ml-0">
          {PANES.map((pane) => (
            <CarouselItem
              key={pane}
              className="overflow-y-auto overscroll-contain pl-0"
              style={{ height: `calc(100dvh - ${String(headerHeight)}px)` }}
            >
              <div className="mx-auto w-full max-w-2xl px-5 pt-5 pb-24 sm:px-8 [&>*:first-child]:mt-0">
                {panes[pane]}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
}
