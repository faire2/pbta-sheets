import { redirect } from "next/navigation"

/**
 * Entry point for character creation.
 *
 * Today there is one system, so this goes straight to the Monsterhearts skin
 * list. When a second system arrives this becomes the system picker instead —
 * a redirect turning into a page, which is purely additive and breaks no
 * bookmarked URL. See ROADMAP → Multi-system rollout.
 */
export default function NewCharacterPage() {
  redirect("/characters/new/monsterhearts")
}
