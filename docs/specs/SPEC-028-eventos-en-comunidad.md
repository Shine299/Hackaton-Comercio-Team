# SPEC-028 — Avisos y eventos reales en Comunidad

- **Estado:** hecha (la migración `20261109000005_sector_events.sql` y las filas de `supabase/seed.sql` deben aplicarse en Supabase)
- **Sprint:** 2 (S2-10)

## Qué y por qué
Que Comunidad muestre también lo que pasa en el barrio (ferias, charlas, jornadas, avisos), no solo publicaciones y tablero.

## Criterios de aceptación
1. **Dado** eventos vigentes en el sector, **cuando** abro Comunidad, **entonces** veo los 2 más próximos arriba del feed, y el filtro «Eventos» muestra todos.
2. **Dado** un evento, **entonces** la tarjeta muestra bloque de calendario (mes, día, «Hoy/Mañana/En N días»), hora, lugar (solo texto de zona), quién lo organiza y «Escuchar».
3. **Dado** un evento que empezó hace más de 2 horas, **entonces** ya no aparece; uno en curso sí.
4. **Dado** que no hay servidor o no hay eventos reales, **entonces** se muestran eventos de demostración con la etiqueta «DATO DE DEMO».
5. **Dado** el Inicio, **cuando** hay un próximo evento, **entonces** aparece «Próximo en tu barrio» y al tocarlo abre Comunidad.

## Privacidad
Sin ubicación exacta (`place_label` es texto de zona). Tabla de solo lectura para la app.

## Pruebas
- Automáticas: `upcomingEvents`, `eventDateParts`, `demoSectorEvents` (`home/sectorEvents.test.ts`).
- Manuales: con y sin servidor; con letra grande y en Modo fácil.
