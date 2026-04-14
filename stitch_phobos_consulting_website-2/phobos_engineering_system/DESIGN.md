```markdown
# Design System Strategy: Phobos Consulting

## 1. Overview & Creative North Star
**The Creative North Star: "Precision Engineering"**

This design system is built to bridge the gap between heavy industrial logistics and high-velocity cloud computing. It rejects the "generic SaaS" look in favor of a sophisticated, editorial aesthetic that mirrors the blueprints of a master engineer. 

To move beyond the template, we utilize **Intentional Asymmetry** and **Tonal Depth**. Instead of standard centered layouts, we lean into technical compositions—using heavy left-aligned typography, hairline grid accents, and staggered data modules that suggest a high-functioning dashboard. We aren't just displaying data; we are orchestrating a yard.

---

## 2. Colors: Tonal Logic & The No-Line Rule
Our palette is rooted in deep slates and high-visibility industrial orange. The goal is "Atmospheric Professionalism."

### The "No-Line" Rule
To achieve a premium feel, **1px solid borders are strictly prohibited for sectioning.** Boundaries must be defined by background color shifts or subtle tonal transitions.
- **Surface Hierarchy:** Place a `surface-container-lowest` card on a `surface-container` background to create a "soft lift."
- **Ghost Borders:** If containment is functionally required (e.g., in complex data tables), use `outline-variant` at **15% opacity**. Never use 100% opaque lines.

### Signature Textures & Glassmorphism
- **Blueprint Underlay:** Use a subtle SVG grid pattern (1px stroke, 24px intervals) in `outline-variant` at 5% opacity behind hero sections.
- **Glass Overlays:** Floating menus or tooltips should use a semi-transparent `surface-container-highest` (80% opacity) with a `20px backdrop-blur`. This makes the UI feel like a sophisticated lens over a technical machine.
- **The Glow:** Primary CTAs should utilize a subtle radial gradient: `primary` at the center to `primary-container` at the edges to add "soul" to the button.

---

## 3. Typography: The Editorial Blueprint
We use a high-contrast pairing of **Space Grotesk** (Technical Display) and **Inter** (High-Utility Sans).

- **Display-LG (56px) / Headline-MD (28px):** *Space Grotesk*. These are our "Industrial Headers." They should feel authoritative, slightly wider, and impeccably spaced. Use `-0.02em` letter spacing for a tighter, more "printed" look.
- **Body-MD (14px) / Label-SM (11px):** *Inter*. Used for all data points and descriptions. Inter provides the legibility required for high-density logistics dashboards.
- **The Hierarchy Rule:** Headlines should always be `on-primary-fixed` (the deepest slate) to command attention, while body text sits at `on-surface-variant` for a softer, more readable contrast.

---

## 4. Elevation & Depth: Tonal Layering
We eschew traditional "drop shadows" for **Tonal Layering**. Depth is a result of light behavior, not artificial strokes.

- **The Stacking Principle:** 
    1. Base: `surface` (#F7F9FB)
    2. Section: `surface-container-low` 
    3. Component/Card: `surface-container-lowest` (#FFFFFF)
- **Ambient Shadows:** When a card must float (e.g., a modal), use a custom shadow: `0px 20px 40px rgba(15, 23, 42, 0.06)`. Note the tint—the shadow uses the `primary` color (Slate 900) at a very low opacity, making it feel integrated with the environment.

---

## 5. Components

### Industrial Buttons
Our buttons aren't rounded pills; they are precision tools.
- **Shape:** `DEFAULT` roundedness (0.25rem).
- **Primary:** `primary` background with `on-primary` text. Add a 2px "notch" look by using a subtle `on-tertiary-fixed` left-border accent for high-priority actions.
- **Secondary:** `surface-container-highest` background. No border. Text in `on-surface`.
- **States:** On hover, shift background color by one tonal tier (e.g., `primary` moves to `primary-container`).

### Stat Cards (Logistics Modules)
- **Style:** Forbid dividers. Use `title-sm` for the metric label and `display-sm` for the value.
- **Visual Accent:** Use an `accent` (#FF6A1A) hairline (2px height) at the very top of the card to indicate "active" or "live" status.
- **Background:** Always `surface-container-lowest`.

### Precision Data Tables
- **Header:** `surface-container-high` with `label-md` typography in all-caps.
- **Rows:** No horizontal lines. Alternate row colors using `surface` and `surface-container-low`.
- **Spacing:** Use "Comfortable" vertical padding (16px) to allow the data to breathe, preventing "visual noise" in high-density yard reports.

### Selection Chips
- **Aesthetic:** Minimalist. `surface-container-highest` background with a `sm` (0.125rem) corner radius. Use `on-surface-variant` for text.

---

## 6. Do’s and Don’ts

### Do:
- **Use Vertical White Space:** Separate content blocks with 48px or 64px gaps rather than lines.
- **Layer with Intent:** Ensure every "floating" element has a backdrop-blur to maintain the "Glassmorphism" depth.
- **Accent Sparingly:** Use the `accent` (Orange) only for critical status changes, warnings, or the primary "Action" button. It is a high-visibility tool, not a decoration.

### Don’t:
- **No Pure Black:** Never use #000000. Use `primary-fixed-variant` for the deepest blacks to maintain tonal warmth.
- **No Heavy Borders:** If you feel the need to add a border to separate two areas, you haven't used enough background color contrast. Re-evaluate the `surface` tiers.
- **No Default Inter Headlines:** Large headlines must always be *Space Grotesk*. Using Inter for headlines makes the system feel like a generic dashboard.