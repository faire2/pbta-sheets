import type { Skin } from "@/types/skin"
import { fae } from "./fae"
import { ghost } from "./ghost"
import { ghoul } from "./ghoul"
import { hollow } from "./hollow"
import { infernal } from "./infernal"
import { mortal } from "./mortal"
import { queen } from "./queen"
import { vampire } from "./vampire"
import { werewolf } from "./werewolf"
import { witch } from "./witch"

/**
 * The 10 core skins, in the order they appear in the reference PDF.
 *
 * The Chosen and the Serpentine are in the Monsterhearts 2 book but not in the
 * free core-skins PDF, so they're absent here. Adding them means dropping a
 * file in this directory and one line below — nothing else changes.
 */
export const skins: Skin[] = [
  fae,
  ghost,
  ghoul,
  hollow,
  infernal,
  mortal,
  queen,
  vampire,
  werewolf,
  witch,
]

const skinsById = new Map(skins.map((skin) => [skin.id, skin]))

export function getSkin(id: string): Skin | undefined {
  return skinsById.get(id)
}

export {
  fae,
  ghost,
  ghoul,
  hollow,
  infernal,
  mortal,
  queen,
  vampire,
  werewolf,
  witch,
}
