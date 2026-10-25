# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.



# Brand & UI Styling Guide

## Overview

This project uses a **Better Beer Australia-inspired visual identity** built around deep navy, warm cream, bold orange, and golden yellow.

The goal is to create a bold, friendly, distinctly Australian look while maintaining accessible contrast and consistent UI patterns.

The project uses:

- **Tailwind CSS v4** for utility-first styling.
- **shadcn/ui** for reusable UI components and semantic design tokens.
- **Space Grotesk Variable** for typography.
- **CSS custom properties in `index.css`** as the source of truth for the colour system.
- **Class-based dark mode** using the `.dark` class.

> The palette is brand-inspired, not an official or exact reproduction of Better Beer Australia's brand specifications.

## 1. Brand Colour Palette

| Colour | Hex | Purpose |
| --- | --- | --- |
| Deep Navy | `#102B4E` | Primary brand colour, headings, buttons, navigation |
| Warm Cream | `#FFF8E8` | Main backgrounds, light surfaces |
| Bold Orange | `#F36B35` | Calls to action, highlights, emphasis |
| Golden Yellow | `#FFD447` | Secondary actions, badges, decorative accents |
| Muted Green | `#78966A` | Positive states, success indicators, supporting charts |

### Colour Usage Principles

**Deep navy — the foundation**

Use navy for primary actions, navigation, headings, icons, and important text on light surfaces.

**Warm cream — the canvas**

Use cream for page backgrounds and warm, approachable surfaces. Prefer cream over stark white where the design benefits from a softer appearance.

**Orange — the highlight**

Use orange selectively for prominent calls to action, highlighted information, promotional elements, and visual emphasis.

**Golden yellow — the supporting accent**

Use yellow for secondary actions, badges, small decorative elements, and selected states. Avoid using yellow for small text on a cream background.

**Muted green — the supporting colour**

Use green for success states and selected data visualisations. Do not use it as a replacement for the primary navy colour.

## 2. Using Tailwind CSS

Prefer Tailwind's semantic theme utilities over hardcoded colours.

### Preferred Utilities

| Intent | Tailwind classes |
| --- | --- |
| Page background | `bg-background text-foreground` |
| Card surface | `bg-card text-card-foreground` |
| Primary button | `bg-primary text-primary-foreground` |
| Secondary surface | `bg-secondary text-secondary-foreground` |
| Highlighted surface | `bg-accent text-accent-foreground` |
| Subdued content | `bg-muted text-muted-foreground` |
| Standard borders | `border-border` |
| Form controls | `border-input` |
| Focus indicators | `outline-ring/50` |
| Popover surface | `bg-popover text-popover-foreground` |

These classes resolve through the design tokens in `index.css`, allowing the theme to change without updating every component.

### Example: Page Layout

```tsx
export function Page() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="font-heading text-4xl font-bold tracking-tight">
          Better days ahead.
        </h1>

        <p className="mt-4 max-w-2xl text-muted-foreground">
          A bold, approachable experience with a consistent brand identity.
        </p>
      </section>
    </main>
  );
}
```

## 3. Buttons and Calls to Action

Use navy for the primary action and orange for a prominent alternative or promotional action. Use yellow for secondary actions where contrast is sufficient.

### Primary Action

```tsx
<button className="rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
  Get started
</button>
```

### Orange Highlight Action

```tsx
<button className="rounded-lg bg-accent px-5 py-3 font-semibold text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
  Explore more
</button>
```

### Secondary Action

```tsx
<button className="rounded-lg bg-secondary px-5 py-3 font-semibold text-secondary-foreground transition-colors hover:brightness-95">
  Learn more
</button>
```

When using shadcn/ui `Button`, prefer the component's existing variants rather than duplicating button styles. Add a variant only when the design requires a reusable new pattern.

## 4. Typography

The project uses **Space Grotesk Variable** for the primary font.

Use `font-heading` or `font-sans` rather than declaring a separate font family in individual components.

Recommended conventions:

- Page headings: `font-heading text-4xl font-bold tracking-tight`
- Section headings: `font-heading text-2xl font-semibold`
- Body text: `text-base leading-7`
- Supporting text: `text-sm text-muted-foreground`
- Buttons: `font-semibold`

Example:

```tsx
<div className="space-y-3">
  <h1 className="font-heading text-4xl font-bold tracking-tight">
    Made for better days.
  </h1>

  <h2 className="font-heading text-2xl font-semibold">
    Find your next favourite.
  </h2>

  <p className="max-w-prose leading-7 text-muted-foreground">
    Keep copy clear, friendly, confident, and easy to scan.
  </p>
</div>
```

Keep headings bold and confident, but avoid excessive font sizes, all-caps text everywhere, or overly decorative typography.

## 5. Cards, Surfaces, and Borders

Cards should feel clean and structured. Use cream or card surfaces, navy text, and subtle borders.

```tsx
<article className="rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
  <span className="text-sm font-semibold text-muted-foreground">
    FEATURED
  </span>

  <h2 className="mt-2 font-heading text-xl font-bold">
    Product highlight
  </h2>

  <p className="mt-2 text-sm leading-6 text-muted-foreground">
    Use a concise description with enough space to breathe.
  </p>

  <button className="mt-5 rounded-lg bg-primary px-4 py-2 text-primary-foreground">
    Discover more
  </button>
</article>
```

Guidelines:

- Prefer `rounded-lg` or `rounded-xl` for most UI surfaces.
- Use `border-border` instead of arbitrary grey borders.
- Use shadows sparingly.
- Avoid adding a different background colour to every card.
- Reserve orange and yellow for elements that need attention.

## 6. Forms and Inputs

Inputs should use semantic tokens so their appearance remains consistent in light and dark mode.

```tsx
<input
  type="text"
  placeholder="Enter your search"
  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
/>
```

For shadcn/ui form components, use the existing component styles and tokens wherever possible.

Ensure that:

- Labels remain visible and descriptive.
- Focus states are easy to identify.
- Validation errors use the destructive colour token.
- Placeholder text remains distinguishable from the background.
- Form controls do not rely on colour alone to communicate their state.

## 7. Dark Mode

Dark mode is activated by applying the `.dark` class to an appropriate ancestor, commonly the root HTML element.

Use semantic classes rather than selecting colours based on assumptions about the current theme.

```tsx
<div className="bg-background text-foreground">
  <section className="rounded-xl border border-border bg-card p-6">
    <h2 className="font-heading text-xl font-bold">
      Consistent in every theme
    </h2>

    <p className="mt-2 text-muted-foreground">
      These colours adapt automatically when dark mode is enabled.
    </p>
  </section>
</div>
```

The theme tokens in `index.css` define the light and dark appearances. Avoid adding component-specific `.dark` overrides unless a genuine exception is required.

For brand-specific decorations, use explicit brand colours only when necessary, and ensure they remain legible in both themes.

## 8. Charts and Data Visualisation

The theme defines five chart tokens:

- `--chart-1`: navy
- `--chart-2`: orange
- `--chart-3`: golden yellow
- `--chart-4`: muted green
- `--chart-5`: blue supporting accent

Use these tokens for chart series instead of introducing unrelated colours.

For example, with a chart library that accepts CSS variables:

```tsx
<div
  className="h-2 w-full rounded-full"
  style={{ backgroundColor: "var(--chart-1)" }}
/>
```

When using SVG-based charts, apply the CSS variables to the chart's fill or stroke attributes as supported by the library.

Always retain readable labels, legends, and sufficient contrast. Do not use colour as the sole means of distinguishing data series.

## 9. Using Brand Colours Directly

Semantic tokens should be the default. Explicit brand colours are appropriate for brand assets, illustrations, promotional artwork, or elements that must retain the same colour across themes.

If needed, use Tailwind's arbitrary-value syntax:

```tsx
<div className="bg-[#102B4E] text-[#FFF8E8]">
  Brand-specific surface
</div>
```

For repeated use, prefer defining reusable theme tokens in `index.css` rather than repeating arbitrary values throughout the codebase.

Avoid mixing several approaches to the same colour in different components.

## 10. Accessibility Requirements

All UI must remain accessible and usable across themes.

- Maintain sufficient foreground/background contrast.
- Use navy text on yellow and cream wherever practical.
- Do not assume white text will be readable on yellow.
- Use visible keyboard focus indicators.
- Include hover, focus, disabled, and error states where relevant.
- Do not communicate success, errors, or selection through colour alone.
- Check orange combinations individually, particularly for small text.
- Test important components in both light and dark modes.

## 11. Guidance for Developers and Coding Agents

When creating or modifying UI, follow these rules:

1. **Use existing design tokens first.** Prefer `bg-primary`, `text-foreground`, `border-border`, and related semantic utilities.
2. **Keep the palette consistent.** Navy and cream are the foundation; orange and yellow are accents.
3. **Reuse existing components.** Prefer the project's shadcn/ui components and established variants over custom implementations.
4. **Avoid arbitrary colours.** Do not introduce unrelated blues, purples, greens, or greys without a clear design requirement.
5. **Respect dark mode.** Components should use semantic tokens and adapt automatically.
6. **Keep typography consistent.** Use Space Grotesk and the existing typography scale.
7. **Prioritise accessibility.** Maintain readable contrast, keyboard navigation, and visible focus states.
8. **Keep CSS centralised.** Update `index.css` or shared component variants when introducing a reusable design decision.
9. **Avoid unnecessary dependencies.** Do not add a new styling library to implement a pattern that Tailwind or shadcn/ui already supports.
10. **Validate the result.** Run the relevant linting, type-checking, and build commands after making changes, and inspect the UI in both themes when possible.

### Before Introducing a New Style

Ask:

- Can an existing semantic token or component variant achieve this?
- Will the component look correct in dark mode?
- Is the chosen colour consistent with the brand palette?
- Is the text and interactive state accessible?
- Will this style be reusable, or should it remain local to the component?

If a new reusable colour or pattern is needed, update the central theme rather than introducing inconsistent one-off styles.

## 12. Source of Truth

The canonical design tokens live in `index.css`.

When updating the brand palette, keep the following in sync:

- Light theme tokens under `:root`
- Dark theme tokens under `.dark`
- Tailwind mappings under `@theme inline`
- Shared shadcn/ui component variants, if required
- This README, if the design conventions change

**The guiding principle:** Build a consistent, accessible interface with a confident navy-and-cream foundation and restrained orange and yellow accents. Use Tailwind utilities and shared theme tokens to keep the entire application visually coherent.
