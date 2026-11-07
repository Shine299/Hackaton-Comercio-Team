---
name: Civic Trust System
colors:
  surface: '#f9f9ff'
  surface-dim: '#d0daf0'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d9e3f9'
  on-surface: '#121c2c'
  on-surface-variant: '#3e4946'
  inverse-surface: '#273141'
  inverse-on-surface: '#ebf1ff'
  outline: '#6e7976'
  outline-variant: '#bdc9c5'
  surface-tint: '#006b5f'
  primary: '#005b51'
  on-primary: '#ffffff'
  primary-container: '#107569'
  on-primary-container: '#a2f8e9'
  inverse-primary: '#80d6c7'
  secondary: '#006a60'
  on-secondary: '#ffffff'
  secondary-container: '#8cf5e4'
  on-secondary-container: '#007166'
  tertiary: '#47534a'
  on-tertiary: '#ffffff'
  tertiary-container: '#5f6b62'
  on-tertiary-container: '#deebe0'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9cf2e3'
  primary-fixed-dim: '#80d6c7'
  on-primary-fixed: '#00201c'
  on-primary-fixed-variant: '#005047'
  secondary-fixed: '#8cf5e4'
  secondary-fixed-dim: '#6fd8c8'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005048'
  tertiary-fixed: '#d9e6da'
  tertiary-fixed-dim: '#bdcabe'
  on-tertiary-fixed: '#131e17'
  on-tertiary-fixed-variant: '#3e4a41'
  background: '#f9f9ff'
  on-background: '#121c2c'
  surface-variant: '#d9e3f9'
typography:
  display:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system establishes a calm, ultra-accessible, and community-centered visual identity for mutual aid and civic solidarity. It bridges the organic warmth of neighborhood support with the clarity, efficiency, and structural reliability of high-standard civic technology.

### Aesthetic Philosophy
- **Calm Minimalism:** Whitespace takes precedence over ornamentation. Visual clutter is stripped away to minimize cognitive fatigue during community coordination or high-stress neighborhood events.
- **Human & Organic Utility:** Combining rich forest tones with soft sage surfaces builds instinctive psychological safety, stability, and neighborhood trust without feeling cold or bureaucratic.
- **Visual-First Hierarchy:** Microcopy is direct, concise, and scannable. Interface status is communicated through clear spatial grouping, iconography, and distinct state badges rather than dense paragraphs.
- **Ergonomic Tactility:** Action zones prioritize generous touch targets, distinct surface lifts, and balanced rounded geometry inspired by modern wellness and civic platforms.

## Colors

The palette is engineered around organic reliability, legibility, and critical civic contrast:

- **Primary (`#107569`):** Deep Forest Green. Serves as the bedrock of visual trust, utilized for primary calls-to-action, key headers, verified identity seals, and brand anchors.
- **Secondary (`#2A9D8F`):** Gentle Sage Teal. Used for secondary interactive highlights, progress indicators, and non-critical active toggles.
- **Tertiary (`#E8F5E9`):** Soft Mint / Sage Surface. Serves as a supportive background for active chips, non-critical status badges, and subtle callout containers.
- **Neutral Core (`#2D3748`):** Deep Slate Charcoal. Formulates readable text hierarchy while avoiding the harshness of pure black.
- **Backgrounds:** Canvas background utilizes a muted warmth (`#F8FAF9`), layering against pure white (`#FFFFFF`) card containers to provide natural, resting depth without harsh contrast lines.
- **Critical Alert (`#DC2626` / `#B91C1C`):** Reserved exclusively for emergency alerts, high-priority neighbor SOS calls, and immediate safety escalations. High-contrast white text on critical red ensures immediate recognition under distress.

## Typography

The type system uses `Inter` across all structural layers to maximize legibility and screen neutrality across varying device resolutions.

### Hierarchy & Rules
- **Headline Restraint:** Large headlines (`display` and `headline-lg`) are applied sparingly for primary screen milestones or key dashboard overviews. Mobile surfaces scale display headers down to prevent awkward line breaks in rapid-use scenarios.
- **Microcopy Discipline:** Explanatory text should never exceed three lines in standard cards. Rely on short, active phrasing ("Pedido entregado", "Solicitud activa", "Alerta cercana").
- **Labels & Badges:** Labels leverage uppercase or medium weights with slight positive letter spacing (`0.01em` to `0.04em`) to maintain sharp legibility when rendered inside small contextual badges.

## Layout & Spacing

The layout model is anchored on an 8pt spatial grid with generous vertical respiration, preventing neighborhood coordination screens from feeling crowded.

### Grid & Form Factors
- **Mobile (Up to 640px):** Single-column fluid view with `1rem` outer canvas margins. Elements stretch edge-to-edge within safe zones. Action buttons span full width at base docks.
- **Tablet (641px - 1024px):** 6-column grid with `1rem` gutters and `2rem` outer margins. Content groups divide into dual-column operational dashboards (e.g., map context alongside community stream).
- **Desktop (> 1024px):** 12-column grid constrained to a 1200px max canvas width, utilizing `1.5rem` gutters and `3rem` margins.

### Vertical Rhythm
- Component interior padding relies strictly on `space-md` (`1rem`) and `space-lg` (`1.5rem`).
- Related grouping gap defaults to `space-sm` (`0.5rem`), while discrete module separation employs `space-xl` (`2rem`).

## Elevation & Depth

Visual hierarchy uses ambient diffusion rather than harsh shadows or intrusive borders. Elevation reinforces reassurance and soft physical tactility.

### Elevation Levels
- **Canvas Level (Ground):** Tinted warm sage background (`#F8FAF9`). Non-interactive, baseline layer.
- **Layer 1 (Card & Container Surface):** Pure `#FFFFFF` resting on canvas, accented with an ambient shadow: `0 2px 12px -2px rgba(16, 117, 105, 0.04), 0 1px 3px 0 rgba(0, 0, 0, 0.02)`. Outlines are avoided; separation is created purely through surface shift.
- **Layer 2 (Floating & Interactive Elements):** Lifted cards, filter bars, and contextual tooltips use an expanded ambient elevation: `0 8px 24px -4px rgba(16, 117, 105, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.03)`.
- **Layer 3 (Modals, Bottom Sheets & Overlays):** Softened dark scrim (`rgba(17, 24, 39, 0.35)`) supporting elevated sheets with deep ambient diffusion: `0 16px 40px -8px rgba(16, 117, 105, 0.12)`.

## Shapes

The geometric personality balances organic curves with functional reliability. Utilizing Level 2 roundedness provides soft, welcoming contours that keep interfaces approachable and tactile.

### Corner Application
- **Base Components (`rounded` / 0.5rem):** Used for micro-elements including checkboxes, utility badges, text fields, and segmented pill tab items.
- **Containers & Controls (`rounded-lg` / 1rem):** Primary buttons, interactive form fields, chip containers, and sub-panels.
- **Cards & Modals (`rounded-xl` / 1.5rem):** Neighborhood activity cards, community notice panels, bottom sheets, and floating action prompts.

## Components

### Buttons
- **Primary:** Minimum 48px height on mobile (scaling to 56px for critical calls-to-action). Background `#107569`, text `#FFFFFF`, font-weight 600. Corner radius `1rem`. Active state uses a slight internal shade (`#0E6251`).
- **Secondary:** Surface `#E8F5E9`, text `#107569`, borderless. Hover shifts to `#DCEDDC`.
- **Emergency Button:** Distinct `#DC2626` background with pure white text and an explicit warning icon. Applied strictly to urgent SOS or immediate hazard reporting.

### Cards
- Pure white background (`#FFFFFF`) with `1.5rem` (`rounded-xl`) corner radius. 
- Padding strictly set to `1.25rem` or `1.5rem`.
- Free of rigid outlines. Borderless by default, using Layer 1 ambient shadows to float naturally on `#F8FAF9`.

### Chips & Badges
- **Status Chips:** Height 32px, `rounded-lg` geometry. Normal assistance chips use `#E8F5E9` background with `#107569` text.
- **Emergency Badges:** Solid `#DC2626` background, white label typography, high-contrast, compact padding (4px vertical, 10px horizontal), pill geometry.

### Inputs & Form Fields
- Height 48px to 52px with 16px horizontal internal padding.
- Background uses subtle warm tint (`#FFFFFF` or `#F4F7F5`) with no stark black borders. Unfocused state utilizes an almost imperceptible border (`rgba(16, 117, 105, 0.12)`).
- Focused state applies a clear 2px `#107569` ring without layout shift.

### Checkboxes & Radios
- Size 22px × 22px to facilitate touch accuracy.
- Unchecked uses a soft `#CBD5E1` contour. Checked state fills with `#107569` and a clean white checkmark.

### Community Specific Components
- **Neighborhood Trust Card:** Displays verified neighbor avatar, distance badge (e.g., "A 200m"), short assistance description, and a single one-tap action button ("Ayudar" or "Conectar").
- **Quick-Access Action Grid:** 2-column or 3-column rounded tile layout on home views with bold iconography and short 1-word or 2-word descriptors for swift emergency or volunteer navigation.