# ADR 0007 — Barra de 5 pestañas (con Chat) y burbuja flotante del asistente

- **Estado:** propuesta (rama `shay-4-espacios`)
- **Fecha:** 2026-11-08
- **Reemplaza en parte:** ADR 0006 (la barra de 5 «comunidad primero»)
- **Nota:** el nombre del archivo es histórico (nació como «barra de 4 servicios y chat flotante»).

## Contexto
ADR 0006 puso Inicio · Eventos · Explorar · Marketplace · Chat. El equipo prefiere nombres claros (Comunidad, Negocios, Ayuda)
y, una vez que Yunta tiene asistente virtual con voz y mascota, quiere que **ese** sea la burbuja flotante, y que el chat entre
vecinos vuelva a ser una pestaña.

## Decisión
1. La barra es **Inicio · Comunidad · Negocios · Ayuda · Chat**. Comunidad abre `/eventos`, Negocios `/explorar`, Chat `/mensajes`.
2. **«Marketplace» vuelve a llamarse «Ayuda»** en toda la interfaz. La ruta real es `/ayuda`; `/marketplace` redirige a ella.
3. **Emergencia sale de la barra.** Se abre con el SOS rojo de la cabecera (que está en todas las raíces). Estando en
   Emergencia, la barra sigue visible **sin pestaña resaltada**, para que siempre haya salida.
4. **La burbuja flotante es el asistente virtual** (`AssistantFab`, con la mascota de la marca): abre la conversación por voz (`/conversacion`). Se ve en el
   Inicio y en las 5 pestañas; no en Emergencia ni en el propio asistente. El contador de conversaciones sin leer pasa a la pestaña Chat.
5. **El Inicio no muestra la barra**: vuelven los 4 botones grandes (Comunidad, Negocios, Emergencia, Ayuda) y, primero, «Habla con
   Yunta». La pestaña «Inicio» queda en la barra de las demás pantallas, para volver.

## Consecuencias
- Cambio de bajo riesgo: `shell`, el diseño raíz, las rutas `ayuda`/`marketplace`, el asistente y el recorrido guiado.
- Las cabeceras de `/eventos` y `/explorar` dicen «Comunidad» y «Negocios» para coincidir con la barra.
- Quien guardó un enlace a `/marketplace` llega igual a Ayuda gracias a la redirección.
- Desde el Inicio (sin barra) el chat entre vecinos se alcanza por el menú ☰ → «Mensajes».
- En el Inicio la burbuja sube lo que mide el área segura, porque ahí no hay barra.
- Cinco pestañas dejan menos ancho por etiqueta: hay que revisar letra grande en Expo Go.
- La burbuja puede tapar el final de una lista; hay que revisarlo en Expo Go.
