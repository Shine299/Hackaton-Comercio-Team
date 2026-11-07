---
name: Civic Mutual Aid System
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf1'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fa'
  on-surface: '#111c2c'
  on-surface-variant: '#3f4948'
  inverse-surface: '#263142'
  inverse-on-surface: '#ebf1ff'
  outline: '#6f7979'
  outline-variant: '#bfc8c8'
  surface-tint: '#226869'
  primary: '#004243'
  on-primary: '#ffffff'
  primary-container: '#0f5b5c'
  on-primary-container: '#8fd0d1'
  inverse-primary: '#91d2d2'
  secondary: '#a0401c'
  on-secondary: '#ffffff'
  secondary-container: '#fe875d'
  on-secondary-container: '#722200'
  tertiary: '#003b71'
  on-tertiary: '#ffffff'
  tertiary-container: '#005299'
  on-tertiary-container: '#a3c7ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#aceeef'
  primary-fixed-dim: '#91d2d2'
  on-primary-fixed: '#002020'
  on-primary-fixed-variant: '#004f50'
  secondary-fixed: '#ffdbcf'
  secondary-fixed-dim: '#ffb59c'
  on-secondary-fixed: '#390c00'
  on-secondary-fixed-variant: '#802a05'
  tertiary-fixed: '#d4e3ff'
  tertiary-fixed-dim: '#a5c8ff'
  on-tertiary-fixed: '#001c3a'
  on-tertiary-fixed-variant: '#004786'
  background: '#f9f9ff'
  on-background: '#111c2c'
  surface-variant: '#d8e3fa'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg-bold:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-md-medium:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
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
  gutter-sm: 0.75rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2rem
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system establishes an inclusive, universally accessible civic utility built for neighborhood solidarity, mutual care, and synchronized crisis response. The aesthetic balances the rigorous information hierarchy of Swiss graphic design and the refined utilitarian clarity of universal modern OS interfaces with community-centric human warmth.

### Brand Personality & Tone
- **Dependable & Institutional yet Warm:** Grounded in a commanding, civic deep teal paired with comforting terracotta and earthen undertones, eliminating bureaucratic chill without losing authoritative clarity.
- **Unambiguous & Legible Under Pressure:** Information density is controlled strictly; visual hierarchy reduces cognitive friction during distress while remaining calm, welcoming, and dignifying during everyday neighborly exchange.
- **Community-First Dignity:** Avoiding paternalistic or alarming visual tropes. Requests for medical support, elder assistance, or resources are presented with neutral, protective dignity.

### Contextual Modes
1. **Día a Día (Everyday Mutual Aid):** A luminous, low-stress environment using gentle warm-gray canvases, crisp structural cards, deep civic teal accents, and terracotta touches for neighborly activities, announcements, and proactive community planning.
2. **Modo Emergencia (Humanitarian / Crisis Response):** A high-visibility, high-contrast operational layout activated dynamically. Surfaces simplify, borders become distinct, and strict semantic color coding governs triage cards, status indicators, and tactical quick-response triggers without inducing irrational panic.

## Colors

The palette is engineered to meet WCAG 2.1 AAA contrast ratios across text, icons, and interactive focus states. Colors operate under a strict semantic taxonomy tailored for both daytime neighborhood browsing and acute emergency alerts.

### Primary Palette
- **Civic Teal (`#0F5B5C`):** The primary anchor. Communicates civic institutionality, communal calm, and reliable governance. Used for primary buttons, structural chrome, key headers, and core active states.
- **Terracotta Sun (`#D96B43`):** The secondary anchor. Imparts Andean and coastal warmth, vital community connection, and neighborly engagement. Used for secondary CTAs, everyday requests, and communal progress markers.
- **Civic Blue (`#1976D2`):** Tertiary communicative shade. Reserved for public notices, verified civic announcements, and logistical community coordinates.
- **Muted Slate (`#4A5568`):** Balanced neutral tone for structural borders, secondary metadata, and resting icons.

### Humanitarian Semantic Tokens (Modo Emergencia)
- **Urgent / Safety Crimson (`#D32F2F`):** Critical life-safety signals, evacuation requests, urgent medical alarms, and SOS triggers.
- **Attention / Protective Marigold (`#E65100`):** Vulnerable neighbor flags, mobility limitations, urgent supply needs.
- **Verified / Safe Green (`#2E7D32`):** Resolved cases, verified responders, authenticated aid centers, secure status.
- **Offline / Protected Neutral (`#546E7A`):** Low-connectivity states, cached local updates, privacy masks.

### Surface Architecture
- **Surface Canvas:** `#F8F9FA` (Warm off-white eliminating harsh screen glare).
- **Surface Card / Modal:** `#FFFFFF` (Pristine elevation plane).
- **Surface Subdued:** `#F1F3F5` (Segmented controls, input fill, resting badges).
- **Text High-Contrast:** `#1A202C` (Minimum 11.5:1 contrast against white).
- **Text Muted:** `#546E7A` (Minimum 4.8:1 contrast against white).

## Typography

Inter serves as the single typographic family across all hierarchies to guarantee instant font rendering over low-bandwidth mobile connections, consistent tabular figures, and wide apertures crucial for readability under direct sunlight and among elderly community members.

### Typographic Principles
- **Apertures & Legibility:** Punctuation marks, numbers, and diacritics (crucial in Spanish) are robust and distinct.
- **Optical Hierarchy:** Critical status headers prioritize `headline-md` (20px) and `headline-lg` (24px) paired with heavy visual weights (`600` or `700`) so that low-literacy or high-stress users can immediately comprehend emergency and mutual-aid categories.
- **Dynamic Type Scalability:** All line heights maintain proportional baseline multiples, accommodating system font enlargements up to 200% without overlapping badges or truncation of vital contact numbers.

## Layout & Spacing

The layout employs an 8-point spatial grid on top of a 4-column fluid mobile grid, widening to 8 columns on tablet devices. 

### Touch Target Standard
All interactive elements (buttons, chip dismissals, expandable cards, privacy toggles) strictly enforce a minimum tap boundary of `48x48px` regardless of visual bounding box, ensuring effortless interaction for tremors, aging hands, or one-handed use during emergencies.

### Mobile-First Reflow Rules
- **Canvas Edge Margins:** `1rem` (16px) on mobile viewports (<600px), expanding to `1.5rem` on tablet, and capped at 720px max-width centered on wider screens to prevent visual strain.
- **Component Breathing Room:** Card-to-card vertical gaps use `space-md` (16px). Inner padding of active emergency action cards defaults to `space-lg` (24px) to keep icon glyphs, emergency descriptions, and CTA buttons from crowding.
- **Bottom Navigation Clearance:** Always append a `space-2xl` plus platform-safe-area padding at the document base so interactive cards are never occluded by floating action components or sticky system bars.

## Elevation & Depth

To preserve pristine performance on lower-tier smartphones and prevent muddy contrast outdoors, depth is realized through disciplined tonal layer shifts, purposeful contrast borders, and ultra-soft tinted ambient shadows.

### Spatial Planes
- **Ground Floor (Canvas):** Tone `#F8F9FA`. Recessed, non-interactive foundation.
- **Level 1 (Resting Cards & Feeds):** Pure `#FFFFFF` surface backed by a hairline border (`1px solid #E2E8F0`) and an ambient shadow: `0 2px 4px -1px rgba(15, 91, 92, 0.04), 0 4px 6px -1px rgba(0, 0, 0, 0.03)`. The subtle teal tint keeps elevations integrated with the brand palette.
- **Level 2 (Interactive Floating Actions & Sheets):** Elevated `#FFFFFF` with `0 8px 16px -2px rgba(15, 91, 92, 0.08), 0 4px 8px -2px rgba(0, 0, 0, 0.04)`. Used for bottom sheets, quick filter bar drawers, and sticky emergency toggles.
- **Level 3 (Urgent Overlays & Dialogs):** `#FFFFFF` bordered with semantic intent (`2px solid #D32F2F` in emergency states) cast with high-def shadow `0 20px 24px -4px rgba(0, 0, 0, 0.16)`.
- **Modo Emergencia Elevation Overhaul:** Shadows flatten to reduce visual confusion; components switch to high-contrast `1.5px` or `2px` crisp solid borders matching the designated humanitarian severity color.

## Shapes

A roundedness rating of `2` anchors the UI. Base elements use a radius of `0.5rem` (8px), card containers scale to `1rem` (16px), and high-level interactive panels scale to `1.25rem` (20px).

### Curvature Taxonomy
- **Micro UI (Badges, Checkboxes, Micro-chips):** `rounded-md` (6px–8px) to retain structural clarity and avoid feeling toy-like.
- **Action Buttons & Inputs:** `rounded-lg` (12px–16px) yielding friendly, tactile press states that signal approachable software.
- **Feed & Emergency Request Cards:** `rounded-lg` (16px) creating cleanly defined modular neighborhood blocks.
- **Persistent Bottom Bar & Modal Sheets:** `rounded-xl` (20px) top corners providing smooth sheet transitions.
- **Status Pills (e.g., 'Validado', 'Offline'):** Full pill curvature (`9999px`) to maintain clear visual distinction from rectangular functional cards.

## Components

### 1. Action Cards (Accessible Action Units)
- **Visual Spec:** White background, 16px corner radius, 16px to 20px internal padding, `1px solid #E2E8F0`.
- **Composition:** 
  - Leading anchor: 44x44px rounded container in tinted primary/accent (`#E6F0F0` for teal, `#FBEAE4` for terracotta) hosting a clear 24px Lucide or Material symbol.
  - Body: `headline-sm` title above a `body-md` secondary descriptor (max 2 lines).
  - Explicit trailing indicator: Text badge or chevron with at least 48px touch zone.
- **Touch States:** Press states transition to `#F1F3F5` with immediate scale down (`scale: 0.99`) for tactile feedback.

### 2. Pre-Configured Emergency Request Cards
- **Types:** *Adulto mayor*, *Movilidad reducida*, *Evacuación*, *Urgencia médica*.
- **Visual Spec:** Solid white base with a prominent 6px left semantic border strip:
  - Urgencia médica / Evacuación: Crimson (`#D32F2F`).
  - Movilidad reducida / Adulto mayor: Protective Marigold (`#E65100`).
- **Layout:** Generous horizontal layout, bold headline (18px), explicit timestamp, distance marker, and two full-width tap targets: **'Ofrecer Ayuda'** (solid fill) and **'Contactar'** (outlined, 48px height).

### 3. Humanitarian Badges & Status Chips
- Height of 28px, pill-shaped (`9999px` radius), with `space-sm` horizontal padding. Accompanied by a 14px semantic icon.
- **'Vulnerabilidad reportada':** Surface `#FFF3E0`, text `#E65100`, border `#FFE0B2`.
- **'Emergencia verificada':** Surface `#FFEBEE`, text `#D32F2F`, border `#FFCDD2`.
- **'Validado / Atendido':** Surface `#E8F5E9`, text `#2E7D32`, border `#C8E6C9`.
- **'Guardado localmente (Offline)':** Surface `#ECEFF1`, text `#546E7A`, border `#CFD8DC`.
- **'Ubicación aproximada (2 km)':** Surface `#E0F2F1`, text `#0F5B5C`, border `#B2DFDB`, accompanied by a protective shield icon.

### 4. Buttons
- **Primary Civic Button:** Solid `#0F5B5C`, text `#FFFFFF`, height 52px, `rounded-lg` (12px), `body-lg-bold`. High-contrast focus ring (`3px solid rgba(15, 91, 92, 0.4)`).
- **Secondary Solidarity Button:** Solid `#D96B43`, text `#FFFFFF`, height 52px. Used for community creation flows and volunteering.
- **Crisis SOS Action Button:** Solid `#D32F2F`, text `#FFFFFF`, minimum height 56px, bold uppercase `16px` text, pulse ripple accessibility indicator.
- **Outlined / Neutral Button:** Background `#FFFFFF`, border `1.5px solid #CBD5E0`, text `#1A202C`.

### 5. Input Fields
- Height 52px, surface fill `#FFFFFF`, border `1.5px solid #CBD5E0`, corner radius `10px`.
- In-focus state: Border turns `2px solid #0F5B5C` with zero interior color shift.
- Accompanying helper text must always render at `13px` (`label-md`) with high contrast `#546E7A`. Placeholders must not replace persistent floating field labels.

### 6. Lists & Neighborhood Feed Items
- Separated by `12px` gaps rather than thin dividing lines for superior finger targeting.
- Each row contains an explicit avatar or category icon, author credential (e.g., *'Vecino verificado'*), relative timestamp (*'Hace 10 min'*), and distance indicator (*'A 250m'*).

### 7. Bottom Navigation & Modo Emergencia Quick Switch
- Fixed bottom dock at 64px height + device safe area, surfaced in `#FFFFFF` with a crisp `1px` top edge border (`#E2E8F0`).
- Navigation items (5): *Inicio*, *Explorar*, *Publicar*, *Actividad*, *Perfil*. Icons at 24px with explicit 11px persistent text labels below.
- **Modo Emergencia Toggle:** Centered or anchored top-right banner. High-contrast pill toggle featuring vivid red badge warning label. In emergency state, the navigation bar receives a 2px top safety crimson accent informing the user that low-bandwidth triage mode is active.