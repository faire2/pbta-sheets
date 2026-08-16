# Design System

The visual language and interaction patterns for this project. Populate as decisions are made.

## Tokens

Defined in `tailwind.config.ts` and `src/app/globals.css` (Next.js) / `src/index.css` (Vite). Always reference tokens semantically — `bg-primary`, `text-muted-foreground`, etc. — never raw colors.

### Colors

<!-- Document brand color decisions, dark mode handling, semantic mappings (primary, secondary, destructive, muted, accent). -->

### Typography

<!-- Font families, scale, line heights, weight usage. -->

### Spacing

<!-- Standard scale. Stick to Tailwind's defaults unless there's a reason. -->

### Radii

<!-- shadcn defaults or overrides. -->

## Layout

<!-- Container widths, breakpoints in use, grid conventions. -->

## Motion

<!-- Transition durations, easing, when motion is used vs avoided. -->

## Interaction Patterns

<!-- Form behavior (validation timing, error display), loading states (skeletons vs spinners), empty states, error states, optimistic updates. -->

## Accessibility Baseline

- Keyboard navigation is mandatory for all interactive elements
- Focus visible at all times — do not remove default focus rings without replacement
- Color contrast meets WCAG AA at minimum
- Form inputs have associated labels (visible or aria-label)
