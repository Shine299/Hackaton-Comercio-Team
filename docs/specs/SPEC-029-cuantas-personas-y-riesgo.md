# SPEC-029 — «¿Cuántas personas?» y «¿Hay personas en riesgo?»

- **Estado:** hecha (la migración `20261109000004_people_counts.sql` debe aplicarse en Supabase)
- **Sprint:** 2 (S2-11)

## Qué y por qué
Dos datos opcionales que ayudan a priorizar un aviso, sin pedir nada identificable.

## Criterios de aceptación
1. **Dado** el formulario «Necesito ayuda» o «Reportar», **cuando** lo abro, **entonces** veo «¿Cuántas personas?» (1 · 2 a 5 · 6 o más) y «¿Hay personas en riesgo?» (Sí · No · No sé), ambas opcionales.
2. **Dado** que no respondo, **cuando** envío, **entonces** el reporte se guarda igual (y «Estoy en peligro inmediato» sigue sin formulario).
3. **Dado** que toco la opción elegida otra vez, **entonces** se quita.
4. **Dado** un reporte con «Sí», **cuando** se ordena el tablero, **entonces** sube respecto a uno igual sin riesgo.
5. **Dado** un reporte con datos, **entonces** la tarjeta y la pantalla de estado muestran un resumen con texto e icono (p. ej. «2 a 5 personas · Hay personas en riesgo»).
6. **Dado** el envío al servidor, **entonces** solo salen valores válidos del catálogo (nunca texto libre).

## Privacidad
Solo rangos y una respuesta de tres valores; nada de nombres, edades ni condiciones médicas.

## Pruebas
- Automáticas: `atRiskWeightBonus`, `peopleSummary`, `sanitizePeople` (`emergency/people.test.ts`).
- Manuales: formularios con letra grande; el resumen aparece en «Mis reportes» y en el estado.
