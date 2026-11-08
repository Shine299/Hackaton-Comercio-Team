# SPEC-038 — Perrito comunitario

- **Estado:** implementada, fase 1 (sin servidor) · plan `docs/plan_integraciones_definitivo.md` §3.5
- **Dueño / revisor:** … / …

## Qué y por qué
Muchos barrios cuidan a un perrito «de todos». Yunta le da un perfil con su zona aproximada, su fondo permanente
(veterinaria y comida) y dos botones: «Lo vi» y «Necesita ayuda». Un QR en el collar abre el perfil.

## Criterios de aceptación
1. **Dado** Inicio o Comunidad, **entonces** veo el acceso al perrito con «Visto hace … · zona».
2. **Dado** el perfil, **cuando** toco «Lo vi» y elijo una zona, **entonces** se actualiza «Visto ahora · zona» con «Lo marcaste tú · guardado en tu teléfono».
3. **Dado** el perfil, **cuando** toco «Necesita ayuda» y elijo la zona, **entonces** queda el aviso guardado y paso a publicar un pedido de ayuda.
4. **Dado** el enlace `yunta://perrito/negrito` (QR del collar), **cuando** lo abro, **entonces** veo su perfil.
5. **Dado** el perfil, **entonces** veo la tarjeta de su fondo y llego al fondo al tocarla.
6. Nunca se pide ni se guarda una dirección exacta: solo zonas para elegir.

## Alcance
- **Toca:** `src/features/pets/` (nueva), `src/app/perrito/[slug].tsx`, Inicio y Comunidad, `funds` (`demoPetFundId`).
- **Fuera de esta fase:** tablas `pets` y `pet_sightings` en Supabase (los avistamientos quedan en el teléfono), collar GPS.

## Pruebas
- Automáticas: `lastSeen` (perfil vs. avistamiento propio más reciente).
- Manuales: abrir `npx uri-scheme open yunta://perrito/negrito --android` o escanear un QR con ese enlace.
