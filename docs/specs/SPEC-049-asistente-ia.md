# SPEC-049 — Asistente de Yunta con IA gratuita (Mistral → Groq → respuestas fijas)

- **Estado:** implementada (8 nov 2026); `npm run check` en verde y `deno check` de la función en verde. **Falta:** crear
  las claves, cargar los secretos, aplicar la migración 11, desplegar la función y probar con IA real (nunca se llamó a
  un proveedor real desde este repo)
- **Dueño / revisor:** … / …
- **Sprint:** Etapa 14 (después de la 13). Regla del proyecto: solo servicios gratuitos.

## Qué y por qué
Un asistente que responde dudas sobre Yunta y el barrio («¿cómo publico?», «¿qué es el SOS?», «¿qué hay esta
semana?») con IA, **sin gastar dinero**: usa planes gratuitos en cadena y, si todos fallan, respuestas fijas.
No reemplaza al chat entre vecinos ni a los servicios de emergencia.

## Cadena de proveedores (servidor)
1. **Mistral** (`MISTRAL_API_KEY`, `MISTRAL_MODEL`, por defecto `mistral-small-latest`) — principal: cupo gratuito
   amplio y entrenamiento con los datos **desactivable** (desactivarlo en la consola de Mistral es parte de la puesta
   en marcha).
2. **Groq** (`GROQ_API_KEY`, `GROQ_MODEL`, por defecto `llama-3.3-70b-versatile`) — respaldo rápido. La misma clave
   activa la voz a texto (SPEC-050), así que conviene configurarla siempre.
3. **Respuestas fijas** (sin IA) — siempre funcionan, también sin red.

Un proveedor sin clave configurada se salta. Si uno falla (error, tiempo agotado de 12 s, cupo agotado o respuesta
vacía), se prueba el siguiente.

> **Decisión (8 nov 2026):** Gemini salió de la cadena; el equipo no lo usará. Mistral y Groq usan el mismo formato
> de chat (compatible con OpenAI), así que el servidor tiene una sola forma de pedir y leer respuestas.

## Criterios de aceptación
1. **Dado** una pregunta normal, **cuando** la envío, **entonces** responde el primer proveedor que funcione y la
   respuesta dice «Asistente con IA · puede equivocarse».
2. **Dado** que Mistral falla, **entonces** responde Groq; si los dos fallan, una respuesta fija con el aviso
   «El asistente con IA no está disponible ahora».
3. **Dado** un mensaje que suena a emergencia («se está quemando», «no respira», «me están robando»…), **entonces**
   **no se llama a la IA**: se muestra al instante la guía para usar el SOS y llamar al 105, con botón a Emergencia.
4. **Dado** un mensaje con teléfono, correo o DNI, **entonces** esos datos se reemplazan por «[dato oculto]» **antes**
   de salir del teléfono, y se avisa.
5. **Dado** 20 mensajes de la misma persona en el día (o 400 en total en el día), **entonces** el servidor no llama a
   la IA y responde con las respuestas fijas, diciendo que el cupo del día se acabó.
6. **Dado** que no hay servidor configurado o no hay red, **entonces** contestan las respuestas fijas, marcadas
   «DATO DE DEMO» / «Sin conexión»; nunca se simula una respuesta de IA.
7. **Dado** la conversación, **entonces** se guarda solo en el teléfono; el servidor no guarda mensajes (solo cuenta
   cuántos hubo por persona y día).
8. **Dado** un mensaje vacío o de más de 500 caracteres, **entonces** se rechaza con un texto claro.
9. **Dado** el Inicio, **entonces** hay un acceso «Pregúntale a Yunta» que abre `/asistente`.

## Instrucciones fijas al modelo (en el servidor)
Español de Perú, breve y cálido; solo sobre Yunta y la vida en el barrio; nunca consejos médicos, legales ni
financieros; ante una emergencia, derivar al SOS y al 105; no pedir datos personales; si no sabe, decirlo; no
inventar funciones de la app.

## Servidor
- `supabase/functions/_shared/assistantCore.ts` (puro, sin Deno): instrucciones, armado del pedido y lectura de la
  respuesta por proveedor, cadena con «siguiente si falla».
- `supabase/functions/asistente/index.ts` (Deno): exige sesión, aplica el límite, recorre la cadena.
- Migración `20261111000011_assistant_usage.sql`: `assistant_usage (user_id, day, count)` sin políticas;
  `bump_assistant_usage(p_user, p_daily, p_global)` solo para `service_role`.

## Cliente (`features/assistant`)
- Puro: `redactPersonalData`, `looksLikeEmergency`, `faqAnswer`, `checkQuestion`.
- `AssistantScreen` (`/asistente`), historial local, sugerencias rápidas, avisos fijos.

## Pruebas
- **Automáticas (primero):** `assistant/logic.test.ts` (criterios 3, 4, 6, 8) y `assistant/assistantCore.test.ts`
  (orden de la cadena, saltar sin clave, Gemini ignorado, siguiente si falla, lectura de la respuesta).
- **Manual:** con las 2 claves; quitando la de Mistral para ver que responde Groq; sin ninguna; modo avión.

## Puesta en marcha (la hace el equipo)
1. Crear claves gratuitas en Mistral y Groq (sin tarjeta). En Mistral, **desactivar el uso de datos para
   entrenamiento**.
2. `npx supabase secrets set MISTRAL_API_KEY=… GROQ_API_KEY=…`
3. Aplicar la migración 11 y `npx supabase functions deploy asistente`.
