# SPEC-052 — Modo guardia por voz: pedir ayuda sin tocar el celular

- **Estado:** implementada en código (8 nov 2026); `npm run check` en verde. Función `guardia` y migración `guard_usage` **desplegadas** en Supabase. **Falta** cargar `GROQ_API_KEY` y probar en un celular real
- **Dueño / revisor:** … / … (quien revisa no es quien escribe)
- **Sprint:** Etapa 13 — historia S13-7. **Decisión:** ADR 0008.

## Qué y por qué
Una persona mayor se cae y no alcanza el teléfono. Con el **Modo guardia** activado dice «Hola Yunta, ayúdame, me pasó
algo»; la app **pide confirmación por voz**, **abre el marcador** con el número del servicio que corresponde (ambulancia,
bomberos o policía), **deja listo un mensaje con la ubicación exacta** para su contacto de confianza y **avisa al sector**.
Se enciende con un botón en el **Inicio** y **escucha en toda la app mientras se usa**, no solo en su pantalla.
Todo gratis y probable en Expo Go.

## Límites (se dicen claros en la pantalla)
- Escucha **mientras la app está a la vista** y la pantalla encendida: Expo Go no escucha en segundo plano y en iOS tampoco es fiable.
  Con el teléfono bloqueado o la app en segundo plano, **se pausa** y se reanuda al volver.
- **Alguien debe tocar «Llamar»**: la app solo abre el marcador con el número. Para que lo oiga quien esté cerca, repite el
  aviso en voz alta.
- La voz a texto usa un cupo gratuito compartido: solo se sube audio cuando **hay sonido**, con tope por sesión.
- Si otra función graba (nota de voz o asistente), la guardia **se aparta** un momento.
- Yunta **no reemplaza** a los servicios oficiales de emergencia.

## Cómo funciona
1. **Activar:** botón **«Modo guardia»** en el Inicio (la 1.ª vez abre la pantalla de Modo guardia para el consentimiento y el
   contacto de confianza opcional). Queda activa y **se acuerda al volver a abrir la app**. «Ajustes» abre la pantalla
   `/emergencias/guardia`; «Apagar» la detiene.
2. **Siempre visible:** mientras escucha, la cabecera muestra «Guardia activa · escuchando» (texto + icono). La pantalla se
   mantiene encendida.
3. **Escuchar:** clips de ≈ 4 s; si el volumen no pasa el umbral, se descartan sin subirlos.
4. **Disparador:** el texto debe contener «Yunta» (o una variante que Whisper suele escribir: junta, yunda, yuta…) **y** una
   palabra de ayuda (ayuda, ayúdame, auxilio, socorro, me caí, me pasó algo). Una sola cosa no basta.
5. **Confirmación por voz** (10 s), **sobre la pantalla que esté abierta**: «Te escuché. ¿Necesitas ayuda? Di sí o no. Si no
   respondes, pediré ayuda.» «No / estoy bien» cancela; «sí / ayuda» sigue; **el silencio sigue** (puede estar inconsciente).
6. **Servicio:** fuego, humo, gas → Bomberos 116 · robo, ladrón, me persiguen → Policía 105 · todo lo demás → Ambulancia SAMU 106.
7. **Despacho** (a la vez): abre el marcador **sin esperar a nada más**; busca la **ubicación exacta una sola vez**; deja el SMS al
   contacto con el enlace de mapa **listo detrás de un botón** (así no retrasa la llamada); encola el pedido con **solo el
   sector**; repite el aviso hablado cada ~15 s hasta «Ya me ayudan». Al abrirse el marcador la app pasa a segundo plano:
   los botones esperan al volver.

## Criterios de aceptación
1. **Dado** «hola yunta ayúdame me pasó algo», «junta ayuda» o «yunta auxilio», **entonces** se detecta la frase de ayuda.
2. **Dado** «hola yunta» o «ayúdame» solos, o una conversación sin ninguna de las dos, **entonces** no se dispara nada.
3. **Dado** el Inicio, **entonces** hay un botón «Modo guardia» que enciende y apaga la escucha, y muestra si está activa.
4. **Dado** que la guardia está activa, **cuando** navego a cualquier pantalla, **entonces** sigue escuchando y la cabecera muestra «Guardia activa · escuchando».
5. **Dado** la app en segundo plano o el teléfono bloqueado, **entonces** deja de escuchar, y **cuando** vuelvo, **entonces** reanuda sola.
6. **Dado** que grabo una nota de voz o hablo con el asistente, **entonces** la guardia se aparta y vuelve al terminar.
7. **Dado** que la dejé activa y cierro la app, **cuando** la abro de nuevo, **entonces** sigue activa (si ya no hay permiso de micrófono, se apaga y lo explica).
8. **Dado** una frase detectada en cualquier pantalla, **entonces** se oye la pregunta de confirmación y se ve, sobre esa pantalla, una cuenta regresiva grande de 10 s con el botón «Estoy bien».
9. **Dado** que digo «no, estoy bien» o toco «Estoy bien», **entonces** se cancela y vuelve a escuchar, sin marcador ni avisos.
10. **Dado** que digo «sí» o paso 10 s sin responder, **entonces** se hace el despacho completo (paso 7).
11. **Dado** que dije «fuego», «humo», «gas», **entonces** el marcador abre el 116; **dado** «robo» o «ladrón», el 105; **en cualquier otro caso**, el 106. Los números salen de `EMERGENCY_NUMBERS`.
12. **Dado** sin red o sin cupo de voz, **entonces** la cuenta regresiva y los botones siguen funcionando, el silencio despacha igual, y el Inicio avisa que no puede pasar la voz a texto.
13. **Dado** el permiso de ubicación denegado o sin señal, **entonces** el despacho sigue con «solo el sector» y se dice por qué.
14. **Dado** audio sin sonido (silencio o ruido bajo), **entonces** no se sube a ningún servidor.
15. **Dado** el despacho, **entonces** la ubicación exacta **no se guarda** ni se publica en el tablero: solo va al marcador/contacto y se descarta.
16. **Dado** letra al máximo y lector de pantalla, **entonces** los botones miden ≥ 48 dp, tienen etiqueta, y la cuenta regresiva se anuncia (`accessibilityLiveRegion`).

## Alcance
- **Toca:** `src/features/guard/` (nueva), `src/app/emergencias/guardia.tsx`, `src/app/_layout.tsx` (`GuardProvider`),
  `home/HomeScreen.tsx` (botón), `shell/SectionHeader.tsx` (indicador) y `shell/sections.ts` (la ruta no resalta pestaña),
  `shared/nav/micStore.ts` y `guardStatusStore.ts`, `assistant/useVoiceInput.ts` y `emergency/components/VoiceNoteField.tsx`
  (avisan que usan el micrófono), tarjeta en `EmergencyCenterScreen`, exports en `assistant` y `emergency`, `app.json`
  (permisos), `supabase/functions/guardia/` y `20261111000012_guard_usage.sql`.
- **No debe cambiar:** el SOS, los reportes existentes, la regla de ubicación pública (sigue siendo el sector).
- **Reglas de arquitectura:** `emergency` y `shell` **no** importan `guard` (hablan por rutas y por `shared/nav`); `guard`
  importa `emergency`, `assistant`, `sector`, `session`, `onboarding` por su `index.ts`. Sin ciclos.
- **La emergencia nunca pasa por la IA:** solo voz a texto y reglas de palabras.

## Pruebas
- **Automáticas:** `phrases.test.ts`, `flow.test.ts`, `audioGate.test.ts`, `dispatch.test.ts`, `listening.test.ts` (cuándo escucha),
  `micStore.test.ts` (reparto del micrófono) y la ruta en `sections.test.ts`.
- **Manuales (Expo Go, celular real):** activar desde el Inicio y navegar por la app; decir la frase en otra pantalla;
  «no, estoy bien» cancela; sin responder a los 10 s abre el marcador con 106, deja el SMS y repite el aviso; bloquear el
  teléfono y volver; grabar una nota de voz y ver que la guardia se aparta; cerrar y abrir la app; modo avión; ubicación
  denegada; letra grande y TalkBack; que el silencio no suba audio.

## Notas de accesibilidad y privacidad
- Estado con texto + icono + vibración, no solo color. El micrófono solo se usa con la guardia activa, siempre se ve en la
  cabecera, y además el teléfono muestra su propio indicador de micrófono.
- Los clips con sonido se mandan a Groq Whisper para transcribirse y se descartan; el servidor guarda solo un conteo diario.
- El contacto de confianza (nombre y teléfono) se guarda **solo en el teléfono**, igual que si la guardia está activa.
- La ubicación exacta se usa **una vez**, solo en una emergencia confirmada, y no se guarda (ADR 0008).
