# SPEC-050 — Hablarle al asistente por voz (Groq Whisper) + aviso del dictado del teclado

- **Estado:** implementada (8 nov 2026); `npm run check`, `deno check` y `expo-doctor` en verde. **Falta:** clave de Groq
  cargada y función desplegada para probar la transcripción real (nunca se llamó a Groq desde este repo); prueba en celular
- **Dueño / revisor:** … / …
- **Depende de:** SPEC-049 (asistente). Regla del proyecto: solo servicios gratuitos.

## Qué y por qué
Escribir cuesta, sobre todo a adultos mayores. El asistente acepta **voz**: se graba en la app, se transcribe con
**Groq Whisper** (`whisper-large-v3-turbo`, plan gratuito) y el texto aparece **editable** en la caja; la persona lo
revisa y lo envía. Las respuestas se pueden **escuchar** con `expo-speech` (en el teléfono, gratis). Además, se avisa
que el micrófono del teclado (Gboard / iOS) también sirve para dictar.

## Criterios de aceptación
1. **Dado** el asistente, **cuando** toco 🎤 y hablo, **entonces** veo «Grabando… 0:05» con texto (no solo color) y
   un botón «Terminar»; al terminar veo «Pasando tu voz a texto…» y luego el texto en la caja, **sin enviarse solo**.
2. **Dado** una grabación de menos de 0,7 s, **entonces** no se envía y se explica «Mantén… habla un poco más».
   **Dado** 30 s, **entonces** se detiene sola.
3. **Dado** el texto transcrito que suena a emergencia, **entonces** aparece al instante el aviso con «Abrir
   Emergencia» y el 105 (además del flujo normal al enviar, que nunca pasa por la IA).
4. **Dado** sin permiso de micrófono, sin red, sin servidor o sin cupo, **entonces** se explica el motivo y se sugiere
   escribir o dictar con el teclado; nunca se simula una transcripción.
5. **Dado** una respuesta del asistente, **entonces** tiene «Escuchar» (y «Detener»), leída en español en el teléfono.
6. **Dado** el asistente, **entonces** se ve el aviso «También puedes dictar con el micrófono de tu teclado» y «Tu voz
   se envía a un servicio externo solo para pasarla a texto; no la guardamos».
7. **Dado** el servidor, **entonces** el audio no se guarda en ningún lado (ni en Supabase ni en registros), cuenta
   para el mismo límite diario del asistente (SPEC-049) y se rechaza si pesa más de 3 MB.
8. La nota de voz de **Emergencia** no cambia: sigue sin salir del teléfono.

## Servidor
- `_shared/assistantCore.ts`: `transcriberFromEnv` (`GROQ_API_KEY`, `GROQ_STT_MODEL`, por defecto
  `whisper-large-v3-turbo`), campos del pedido (`language: es`) y lectura de la respuesta (`text`).
- `asistente/index.ts`: si llega `multipart/form-data` con el campo `audio`, transcribe; si llega JSON, responde como
  antes. Mismo límite diario. Sin clave de Groq → `{ text: null, reason: 'unavailable' }`.

## Cliente
- `assistant/voice.ts` (puro): `checkRecording`, `cleanTranscript`, `audioMimeFromUri`.
- `assistant/repository.ts`: `transcribeAudio(uri)` con `FormData` (archivo `.m4a`).
- `AssistantScreen`: botón 🎤 (≥ 48 dp, tocar para empezar / tocar para terminar), estados con texto, «Escuchar» en
  las respuestas (`ListenButton`), avisos de privacidad y del teclado.
- Grabación: `.m4a` AAC mono 16 kHz 32 kbps (el preset `LOW_QUALITY` de Android graba `.3gp`, que Whisper no acepta).

## Pruebas
- **Automáticas (primero):** `assistant/voice.test.ts` y casos nuevos en `assistant/assistantCore.test.ts`.
- **Manuales (celular):** criterios 1–6; ruido de fondo; acento; letra grande; TalkBack sobre el botón 🎤.

## Por verificar en la puesta en marcha
- Cupos de Groq Whisper (fuentes de terceros: ~2.000 pedidos/día, 7.200 s de audio/hora).
- Condiciones de uso de datos de Groq para el audio (no revisadas).
