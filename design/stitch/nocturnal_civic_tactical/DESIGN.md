---
name: Nocturnal Civic Tactical
colors:
  surface: '#0f1417'
  surface-dim: '#0f1417'
  surface-bright: '#353a3d'
  surface-container-lowest: '#0a0f12'
  surface-container-low: '#171c1f'
  surface-container: '#1b2023'
  surface-container-high: '#262b2e'
  surface-container-highest: '#303539'
  on-surface: '#dfe3e7'
  on-surface-variant: '#bacbbf'
  inverse-surface: '#dfe3e7'
  inverse-on-surface: '#2c3134'
  outline: '#84958a'
  outline-variant: '#3b4a42'
  surface-tint: '#00e2a0'
  primary: '#6effc3'
  on-primary: '#003825'
  primary-container: '#00e5a3'
  on-primary-container: '#006143'
  inverse-primary: '#006c4b'
  secondary: '#ffbd58'
  on-secondary: '#442b00'
  secondary-container: '#ea9f00'
  on-secondary-container: '#5b3b00'
  tertiary: '#ffdedc'
  on-tertiary: '#68000c'
  tertiary-container: '#ffb8b3'
  on-tertiary-container: '#ac061d'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#43ffbb'
  primary-fixed-dim: '#00e2a0'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#005138'
  secondary-fixed: '#ffddb1'
  secondary-fixed-dim: '#ffba4b'
  on-secondary-fixed: '#291800'
  on-secondary-fixed-variant: '#624000'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ae'
  on-tertiary-fixed: '#410005'
  on-tertiary-fixed-variant: '#930016'
  background: '#0f1417'
  on-background: '#dfe3e7'
  surface-variant: '#303539'
typography:
  display-hero:
    fontFamily: Sora
    fontSize: 44px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Sora
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
  headline-lg-mobile:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Sora
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Sora
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  data-metric:
    fontFamily: Sora
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.03em
  label-tactical:
    fontFamily: Sora
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.08em
  button-text:
    fontFamily: Sora
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.25rem
---

## Brand & Style

This design system delivers an instrumental, tactical dark-mode interface built for nocturnal community emergencies—such as seismic events, urban blackouts, and localized mutual aid operations. The visual posture merges utilitarian precision with technological vanguard relief: it rejects ornamental visual noise in favor of instantaneous cognitive clarity, extreme visual hierarchy, and battery preservation on OLED screens.

The aesthetic fuses **Tactical HUD / Instrumental Utility** with **Refined Civic Warmth**:
- **Target Audience:** Neighbors, community block captains, civilian first-responders, and individuals operating under acute stress, low ambient light, or unstable physical conditions (e.g., walking through debris or operating one-handed with a flashlight).
- **Emotional Impact:** Immediate composure, institutional reliability, radical legibility, and uncompromising operational safety. The UI acts as a handheld emergency beacon that never blinds the user's night-adapted vision while providing unmistakable affordances.

## Colors

The palette is engineered specifically for high-stress nocturnal usability and low-power hardware performance:

- **OLED Surface Foundation (`#0a0f12`):** True-black adjacent canvas minimizes photon emission, preserving peripheral rod vision in dark environments and conserving critical device power during electrical grid failures.
- **Instrumental Containers (`#111a1e`, `#162228`):** Layered structural surfaces establishing depth without soft blurs, bounded by tactical containment strokes (`#1f333c`).
- **Primary Beacon (`#00e5a3`):** High-emission mint emerald serving as the core vital sign. Exceeds WCAG AAA contrast ratios on deep backgrounds, communicating vitality, safe zones, verified statuses, and technological assistance.
- **Priority Warning (`#ffb020`):** Phosphorescent amber reserved for urgent civilian needs (e.g., medical supplies required, gas leaks, priority logistics).
- **Critical SOS / Alert (`#ff4d4f`):** High-saturation crimson reserved strictly for panic triggers, direct civil defense calls, collapse alarms, and physical danger.
- **Text Layers:** Absolute White (`#ffffff`) for instant, uncompromised signal scanning, backed by muted slate (`#94a3b8`) for secondary operational metadata.

## Typography

The typographic hierarchy prioritizes rapid scannability and structural robustness:

- **Sora** serves as the display, header, and tactical identifier typeface. Its wide geometric footprint, open apertures, and crisp counters ensure that block numbers, street addresses, and emergency statuses remain distinct even on blurred, low-cost screens or when trembling.
- **Hanken Grotesk** governs narrative descriptions, operational instructions, and dynamic chat transmissions. Its humanized modernist geometry retains sharp rendering at small sizes without fatigue.
- **Tactical Data Formatting:** All critical metrics (triage counts, battery levels, proximity distances) utilize tabular numerical alignment via `data-metric`. Sub-labels (`label-tactical`) use disciplined all-caps tracking to establish instrumental cadence without overwhelming critical reading flow.

## Layout & Spacing

The layout is grounded in an **operational ergonomic grid** designed for single-handed mobile navigation during movement:

- **Screen Distribution:** Standard mobile viewport adheres to an edge-to-edge column system with `1rem` (16px) margins and `0.75rem` (12px) gutters, scaling up to an 8-column layout on tablets and a 12-column fixed grid on dashboard monitors (max width 1280px).
- **Thumb Zone Anchor:** Emergency priority actions (SOS, flashlight switch, quick-status broadcasts) are persistently anchored within the lower 35% of the mobile viewport.
- **Spacing Rhythm:** Standard layout uses an 8px base rhythm (`0.5rem` to `2.25rem`). Micro-clearances between badges and tactical tags rely on strict `space-xs` (4px) intervals to maintain structured density without visual collision.

## Elevation & Depth

Rather than conventional diffused blur shadows—which degrade contrast and feel ambiguous in low light—this system relies on **Tonal Stratification and High-Contrast Instrumental Borders**:

- **Ground Level (Elevation 0):** Pure `#0a0f12` background canvas.
- **Container Level (Elevation 1):** `#111a1e` with a solid `1.5px` border in `#1f333c`. Provides crisp physical separation between disparate operational modules.
- **Elevated Alert & Action (Elevation 2):** `#162228` containers accented with active perimeter framing in `#00e5a3` or `#ff4d4f` depending on urgency.
- **Tactical Luminescence:** When interactive states require attention, elements do not use soft dropshadows. Instead, they leverage a 1px inner keyline coupled with an outer 2px boundary glow of zero blur (`outline: 2px solid var(--state-color)`), maintaining razor-sharp geometric boundaries.

## Shapes

The design uses a balanced structural geometry defined by **Level 2 Roundedness** (`0.5rem` / 8px default radii):

- Standard components, operational cards, input fields, and action buttons employ an 8px corner radius. This prevents the harshness of completely sharp corners while avoiding the softness of pill shapes, which can compromise the serious, tactical nature of emergency software.
- High-priority operational badges and micro status markers utilize constrained internal radii (`0.25rem` / 4px) to signal dense, instrumental data packets.
- Modal dialogues and persistent bottom sheets scale to `1rem` (16px) top radius for physical enclosure without sacrificing internal usable real estate.

## Components

### Buttons
- **SOS Critical (`#ff4d4f`):** Minimum height 64px. Solid `#ff4d4f` surface with `#ffffff` bold Sora typography. Features a mandatory 2-second press-and-hold radial sweep mechanic with a `2px solid #ffffff` tactile boundary to prevent accidental activations.
- **Primary Assist (`#00e5a3`):** 52px height. High-emission `#00e5a3` fill with dark `#0a0f12` typography for maximum immediate legibility. Active state shifts background to `#00b882` with an inner 2px stroke in `#ffffff`.
- **Tactical Secondary:** `#162228` container, 1.5px `#1f333c` stroke, White Sora text. Active feedback triggers an instantaneous outline color swap to `#00e5a3`.

### Cards & Modules
- Built on `#111a1e` with distinct `1.5px solid #1f333c` borders.
- Cards incorporate top-right tactical status pills (e.g., `OFFLINE MESH`, `SAFE ZONE`, `SUPPLY POINT`).
- Urgent cards (unresolved medical need, structural risk) feature a persistent 4px left-border rail in `#ffb020` or `#ff4d4f`.

### Badges & Tactical Chips
- Ultra-dense layout: 6px vertical, 10px horizontal padding, 4px corner radius.
- Background uses a 15% opacity tint of the assigned semantic color, bounded by a 1px solid stroke of the pure color (`#00e5a3`, `#ffb020`, `#ff4d4f`), accompanied by uppercase `label-tactical` typography.

### Input Fields
- Enclosed in `#162228` with a 1.5px `#1f333c` baseline border.
- In-focus state transitions to a bold 2px `#00e5a3` stroke with zero blur.
- Placeholder text renders in `#94a3b8`; input text renders in crisp `#ffffff` at 16px minimum to eliminate browser zoom glitches on mobile.

### Checkboxes, Radio & Toggles
- Sized at a generous 24x24px for gloved or unsteady hand interaction.
- Checkboxes feature a 2px `#1f333c` frame that snaps to `#00e5a3` with a solid high-contrast tick icon.
- Toggles utilize an instrumental segmented slider design with clear visual `ON / OFF` monospaced indicators.

### Specialized Incident Feed List
- Strict separator lines composed of 1px `#1f333c`.
- Incident rows display time delta in relative tactical format (`T-00:04m`), immediate address highlight, and one-tap routing actions.