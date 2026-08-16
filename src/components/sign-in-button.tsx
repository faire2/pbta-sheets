import { signIn, signOut, auth } from "@/auth"
import { Button } from "@/components/ui/button"

export async function SignInButton() {
  const session = await auth()
  if (session?.user) {
    return (
      <form
        action={async () => {
          "use server"
          await signOut()
        }}
      >
        <Button type="submit" variant="outline">
          Sign out
        </Button>
      </form>
    )
  }
  return (
    <form
      action={async () => {
        "use server"
        await signIn("google")
      }}
    >
      <Button type="submit">Sign in with Google</Button>
    </form>
  )
}
