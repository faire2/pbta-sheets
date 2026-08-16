export { auth as middleware } from "@/auth"

export const config = {
  // Everything except Next internals, the auth API, and `/sheet/*` — share
  // links are read-only and public by design (ROADMAP → Sharing).
  //
  // NOTE: this wires the session into the request but does not by itself
  // *reject* signed-out users. Add a `callbacks.authorized` in `src/auth.ts`
  // (or an `auth()` check per page) before treating any route as gated.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sheet).*)"],
}
