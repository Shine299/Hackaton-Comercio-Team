# Product

<!-- impeccable:product-schema 1 -->

## Platform

android

(Expo / React Native app for Android and iOS with one shared design language; Android recorded as the primary target for the Peruvian neighborhood audience. Inferred from docs/01_producto, not separately confirmed.)

## Users

Vecinos of a city sector (demo: Lince, Lima, 2 km radius) of every age. The user confirmed the app must work both for young, app-savvy people and for older adults or people with access needs, and that each person chooses at the start how they want to use it (standard vs. easier mode: larger text and buttons, fewer options, read-aloud). In emergencies the same people use it under stress, sometimes on behalf of someone who cannot use a phone.

## Product Purpose

Yunta — "Tu comunidad, más cerca." It connects neighbors to solve everyday needs and to coordinate community support during emergencies. Success: anyone finds where to go within seconds, asks for or offers help in a few taps, and an emergency report is never shown as received or verified when it was not.

## Positioning

One app, four separate spaces for the neighborhood: Comunidad (news, notices, events), Emprendimientos (local marketplace and barter), Emergencia (report, alerts, coordination board) and Ayuda (need help / want to help, including reporting on behalf of a vulnerable neighbor). Trust is progressive and local; location is public only as an approximate zone.

## Operating Context

- Hackathon prototype (deadline 2026-11-08, final 2026-11-17); demo data must be labeled as demo.
- Navigation decided by the user: an Inicio with the 4 sections as large buttons plus a summary, and a fixed bottom bar of 5: Inicio · Comunidad · Emprendimientos · Emergencia · Ayuda. Messages, notifications, profile and settings are secondary (header), never competing with the sections.
- Visual redesign lives in a Design canvas (https://claude.ai/artifact/Y19oyYK3zMX5j8ir5UikDv); code implementation waits for the user's explicit go-ahead and must adapt to existing functionality.

## Capabilities and Constraints

- Report emergencies without an account; account needed to follow up and coordinate.
- Report states: Reportado → Pendiente de verificación → Verificado (only after a coordinator) → En atención → Resuelto; "Prioritaria" is a separate flag.
- Offline: distinguish "Guardado en tu teléfono", "Pendiente de envío" and "Recibido"; never simulate that an alert was sent.
- Chat opens only after a request is accepted; one central inbox across sections.
- "Ayudar a un vecino vulnerable" belongs to Ayuda (3 steps: ¿A quién? ¿Qué necesita? ¿Dónde?) with a contextual entry from Emergencia.
- Map with layers per section. Official emergency numbers: 116 Bomberos, 106 SAMU, 105 Policía.
- The app coordinates help and does not replace official emergency services.

## Brand Commitments

- Name and promise: "Yunta — Tu comunidad, más cerca."
- Greens/teal as primary, light grounds and neutrals; alert red reserved for Emergencia only (from src/global.css and the user's brief).
- Illustrations in assets/illustrations/ (neighbors, items, vulnerable-person types, neighborhood map).

## Evidence on Hand

No real users, businesses, testimonials or statistics. All listings, people and counts are demo data and must be labeled "DATO DE DEMO". No official-source claims (e.g., INDECI) without the real source.

## Product Principles

1. One screen, one purpose; the primary action is unmistakable.
2. Never lie about state: sent, received and verified are different things.
3. Protect the vulnerable: approximate location in public, precise only for authorized responders.
4. Accessible by default, easier mode by choice.
5. Sections stay separate; cross-links are contextual, never duplicated screens.

## Accessibility & Inclusion

Touch targets ≥ 44 px (primary buttons 56 px), text minimum 13 px (larger in easy mode), contrast ≥ 4.5:1, screen-reader labels on every icon-only control, read-aloud for critical info, predefined options instead of free typing, works offline for critical information.
