# Component Catalog

Reusable components in this project. Read this BEFORE creating new UI components — reuse existing ones whenever possible.

## shadcn/ui Primitives

Installed via `npx shadcn@latest add <name>`. Source lives in `src/components/ui/`. Customize directly — these files are part of this repo, not a node_modules dependency.

Currently installed:

- `Button` — primary, secondary, outline, ghost, destructive variants
- `Card` — Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- `Dialog` — modal dialogs
- `Form` — react-hook-form integration with FormField, FormItem, FormLabel, FormControl, FormMessage
- `Input` — text input
- `Label` — form label
- `Sonner` — toast notifications (use `toast()` from `sonner`)

Add more as needed. Never reimplement these.

## Project-Specific Components

<!-- Document custom reusable components here as they are created. Format: -->
<!-- ### ComponentName -->
<!-- Path: `src/components/component-name.tsx` -->
<!-- Use when: ... -->
<!-- Variants: ... -->
<!-- Don't use for: ... -->

## Anti-Patterns

- Creating a one-off `<MyButton />` instead of using `<Button variant="...">`
- Reimplementing modal/sheet behavior instead of using `<Dialog />`
- Building toast logic instead of `toast()` from sonner
- Hardcoding colors or spacing — always use design tokens from `DESIGN-SYSTEM.md`
- Prop-drilling style variants — use `cva` (class-variance-authority) instead
