/**
 * Shared lookup for the generated text catalogues.
 *
 * Both the per-skin catalogue and the basic-moves/rules one resolve the same
 * way: walk a path, take the first locale that has it, fall back to the data
 * file's own text. Kept here so the two can't drift apart.
 */

export type Catalogue = Record<string, unknown>

function walk(cat: Catalogue | undefined, path: string[]): unknown {
  let node: unknown = cat
  for (const key of path) {
    if (typeof node !== "object" || node === null) return undefined
    node = (node as Record<string, unknown>)[key]
  }
  return node
}

export function pick(
  cat: Catalogue | undefined,
  path: string[],
): string | undefined {
  const node = walk(cat, path)
  return typeof node === "string" ? node : undefined
}

/**
 * Options lists are POSITIONAL — item 3 of the translation labels item 3 of
 * the data. A wrong-length list means the translation drifted, so the whole
 * list is rejected and the caller falls back rather than mis-labelling.
 */
export function pickList(
  cat: Catalogue | undefined,
  path: string[],
  expected: number,
): string[] | undefined {
  const node = walk(cat, path)
  if (!Array.isArray(node)) return undefined
  if (node.length !== expected) return undefined
  return node.every((v) => typeof v === "string") ? node : undefined
}

/** Resolvers over an ordered list of catalogues: preferred locale, then English. */
export function resolvers(cats: (Catalogue | undefined)[]): {
  first: (path: string[], fallback: string) => string
  firstList: (path: string[], fallback: string[]) => string[]
} {
  return {
    first: (path, fallback) => {
      for (const cat of cats) {
        const hit = pick(cat, path)
        if (hit !== undefined) return hit
      }
      return fallback
    },
    firstList: (path, fallback) => {
      for (const cat of cats) {
        const hit = pickList(cat, path, fallback.length)
        if (hit !== undefined) return hit
      }
      return fallback
    },
  }
}
