import { SignInButton } from "@/components/sign-in-button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Monsterhearts Skins
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Character sheets for Monsterhearts 2.
        </p>
      </div>
      <SignInButton />
    </main>
  );
}
