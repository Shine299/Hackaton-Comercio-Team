# SPEC-053 — Conversación por voz con Yunta (pantalla completa con estela, «Hola Yunta» y diagnóstico)

- **Estado:** implementada en código (8 nov 2026): pruebas, compilador y lint en verde. **Falta** probarla en un celular real. El micrófono ya se comprobó en el celular con la «Prueba de micrófono» del asistente; la escucha de la guardia se rehízo y hay que volver a probarla.
- **Dueño / revisor:** … / … (quien revisa no es quien escribe)
- **Sprint:** Etapa 14. **Depende de:** SPEC-049/050 (asistente), SPEC-052 (Modo guardia).

## Qué y por qué
Hasta ahora el bot se manejaba escribiendo (o dictando y tocando «Enviar»). Se quiere hablar con Yunta **como en una charla de
voz en vivo**: una pantalla completa, sin botones que tocar para enviar, con una **estela que sube desde abajo** que muestra que
te está oyendo y que Yunta está hablando. Se puede abrir con la burbuja, con el botón del Inicio o diciendo «Hola Yunta».

## Cómo funciona
1. **Entrar:** la burbuja flotante (la mascota), el botón **«Habla con Yunta»** del Inicio, «Conversar con Yunta por voz» del chat
   escrito, o decir **«Hola Yunta»** con el Modo guardia activo. Todos abren `/conversacion` y la charla empieza sola.
2. **Pantalla completa:** la mascota al centro (se mueve cuando Yunta habla), el estado en texto, **subtítulos** de lo último que
   dijiste y de lo que respondió Yunta, y abajo la **estela de barras** que sube desde el borde inferior. Botones: **Silenciar**,
   **Terminar**, cerrar (✕) y **escribir** (pasa al chat de texto).
3. **Saludo corto:** Yunta habla primero, en pocos segundos: te saluda según la hora, se presenta y pregunta qué quieres. El resumen
   del barrio no se recita: la IA recibe los datos reales (alerta, eventos, ofertas y pedidos, tus reportes pendientes) como contexto
   y lo cuenta **cuando se lo pides** («cuéntame qué hay hoy»).
4. **Charla fluida y automática:** escucha un turno, lo corta sola cuando te callas (~1 s), lo pasa a texto, responde (IA, o respuestas
   fijas si no hay red o cupo), **lo lee en voz alta** y vuelve a escuchar. No hay que tocar «enviar».
5. **Estela:** al escuchar sigue el **volumen real** del micrófono y un texto dice «Te estoy oyendo» o «Te escucho…»; mientras
   Yunta habla la estela se anima (la voz del teléfono no entrega su volumen: es una animación, no una medición).
6. **Emergencia dentro de la conversación:** si dices algo que suena a emergencia, **no pasa por la IA**: Yunta lee el aviso fijo
   (SOS y 105) y aparece «Abrir Emergencia».
7. **Salir:** «adiós», «chau», «eso es todo», **Terminar**, ✕, o dos turnos seguidos sin que hables.
8. **«Hola Yunta» en el Modo guardia:** con la guardia activa, «Hola Yunta» abre esta pantalla. «Yunta, ayúdame…» sigue siendo la
   emergencia de SPEC-052 y **tiene prioridad**.
9. **Escucha de la guardia, sin huecos:** la guardia graba **sin parar** y corta cada frase cuando te callas (ya no son clips fijos de
   4 s que se partían o caían en un hueco mientras se subía el audio). La frase se sube en segundo plano mientras sigue escuchando.
10. **Diagnóstico** (Ajustes de la guardia): si escucha o por qué está en pausa, volumen de la última frase frente al umbral, frases
    enviadas, último texto entendido y último error. En el chat escrito, una **«Prueba de micrófono»** graba 4 s, te deja escuchar lo
    grabado y dice qué entendió el servidor.

## Criterios de aceptación
1. **Dado** «hola yunta» o «Yunta, ¿qué hay hoy?», **entonces** se detecta el nombre; **dado** «la junta vecinal se reúne», **entonces** no.
2. **Dado** «Yunta, ayúdame…», **entonces** corre la emergencia de SPEC-052 y **no** se abre la conversación.
3. **Dado** el Modo guardia activo, **cuando** digo «Hola Yunta», **entonces** se abre `/conversacion` y la guardia se aparta del micrófono.
4. **Dado** que abro la burbuja, el botón del Inicio o el del chat, **entonces** llego a `/conversacion` y la charla empieza sola.
5. **Dado** la pantalla de conversación, **entonces** se ven la mascota, el estado en texto, los subtítulos, la estela y los botones Silenciar y Terminar (≥ 48 dp, con etiqueta).
6. **Dado** el saludo, **entonces** es corto (menos de 140 caracteres), habla **antes** que yo, y Yunta **no escucha mientras habla**.
7. **Dado** que hablo y me callo ~1 s, **entonces** el turno termina solo y se envía **sin tocar nada**; **dado** que no hablo en 7 s, **entonces** cuenta como turno en silencio.
8. **Dado** dos turnos seguidos en silencio, **entonces** Yunta se despide y la conversación termina.
9. **Dado** «adiós» o «eso es todo», **entonces** se despide y termina; **dado** una pregunta que contiene «terminar», **entonces** no termina.
10. **Dado** «cuéntame qué hay hoy», **entonces** la respuesta usa los datos reales del barrio (la IA los recibe como contexto).
11. **Dado** una frase de emergencia en la conversación, **entonces** no se llama a la IA, se lee el aviso fijo y aparece «Abrir Emergencia».
12. **Dado** que no hay red, servidor o cupo, **entonces** Yunta responde con las respuestas fijas, leídas en voz alta y marcadas.
13. **Dado** que el teléfono no entrega medición de volumen, **entonces** el turno termina por tiempo fijo en vez de quedarse sin escuchar, y la guardia no descarta todo como «silencio».
14. **Dado** que hablo, **entonces** la estela sube desde abajo con el volumen real y dice «Te estoy oyendo»; **cuando** habla Yunta, **entonces** se anima y dice «Yunta está hablando».
15. **Dado** «Silenciar», **entonces** no graba ni cuenta turnos en silencio hasta que lo active de nuevo.
16. **Dado** la app en segundo plano, **entonces** la conversación se corta.
17. **Dado** la guardia activa y una frase dicha de corrido, **entonces** el archivo trae la frase **completa** (no partida) y la grabación no se detiene mientras se transcribe.
18. **Dado** los Ajustes de la guardia, **entonces** se ve el diagnóstico descrito arriba; **dado** el chat escrito, **entonces** la «Prueba de micrófono» muestra duración, tamaño, volumen y lo que entendió el servidor, y deja escuchar la grabación.
19. **Dado** un audio que no se entendió, **entonces** el chat escrito muestra una línea con su duración, su volumen máximo y lo que respondió el servidor.
20. **Dado** el Inicio, **entonces** el orden es: saludo, alerta (si hay), **«¿En qué te ayudamos hoy?»**, **Modo guardia**, «Habla con Yunta» y el **feed de novedades** (5 más recientes y «Ver más»).
21. **Dado** voces, letra grande y lector de pantalla, **entonces** el estado y los subtítulos se anuncian, y cada botón tiene etiqueta.

## Alcance
- **Toca:** `src/features/assistant/` (`ConversationScreen.tsx`, `VoiceWaves.tsx`, `VoiceTrail.tsx`, `MicTest.tsx`, `useVoiceConversation.ts`,
  `useConversationSummary.ts`, `summary.ts`, `conversation.ts`, `levels.ts`, `voice.ts`), `src/app/conversacion.tsx` y su entrada en `_layout`,
  `src/features/guard/` (`phrases.ts` → `matchName`, `useGuardMode.ts`, `audioGate.ts`, `GuardProvider.tsx`, `GuardScreen.tsx`),
  `home/HomeScreen.tsx`, `assistant/AssistantFab.tsx`.
- **No debe cambiar:** el servidor, la regla «la emergencia no pasa por la IA», los datos que salen del teléfono.
- **Reglas de arquitectura:** `assistant` no importa `guard` (el despertar navega por ruta); `guard` importa `createEndpointer` y `appendAudio`
  por el `index.ts` de `assistant`. Sin ciclos.

## Pruebas
- **Automáticas:** `summary.test.ts` (resumen y saludo), `levels.test.ts` (estela), `voice.test.ts` (diagnóstico, formatos de audio),
  `conversation.test.ts` (despedidas, fin de turno por silencio, máquina de estados), `guard/phrases.test.ts` (`matchName`),
  `guard/audioGate.test.ts` (sin medición), `guard/listening.test.ts` (por qué está en pausa).
- **Manuales (Expo Go, celular real):** abrir con la burbuja y charlar dos o tres turnos sin tocar nada; pedir «cuéntame qué hay
  hoy»; silenciar; callarse; «adiós»; emergencia dentro de la charla; modo avión; con la guardia activa decir «Hola Yunta» y
  «Hola Yunta, ayúdame» y mirar el diagnóstico.

## Notas de accesibilidad y privacidad
- Cada turno hablado también se ve como texto. La conversación se guarda solo en el teléfono (como el chat escrito).
- Cada turno gasta 2 usos del cupo diario del asistente (voz a texto + respuesta): el límite de 20 al día es corto para conversar y
  conviene subirlo en el servidor.
- Los datos del barrio van a la IA como contexto (sin teléfonos, correos ni DNI, que se ocultan antes de enviar).
- **Límites conocidos:** no se puede interrumpir a Yunta mientras habla (el teléfono se escucharía a sí mismo); se escucha solo
  con la app a la vista.
