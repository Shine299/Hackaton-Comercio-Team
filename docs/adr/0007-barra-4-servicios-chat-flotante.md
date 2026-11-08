# ADR 0007 — Barra de 4 pestañas (Inicio · Comunidad · Negocios · Ayuda) y chat como burbuja flotante

- **Estado:** propuesta (rama `shay-4-espacios`)
- **Fecha:** 2026-11-08
- **Reemplaza en parte:** ADR 0006 (la barra de 5 «comunidad primero»)

## Contexto
ADR 0006 puso Inicio · Eventos · Explorar · Marketplace · Chat. El equipo prefiere una barra de **4 pestañas** con
nombres claros, y el chat como burbuja, como antes.

## Decisión
1. La barra es **Inicio · Comunidad · Negocios · Ayuda**. Comunidad abre `/eventos` y Negocios abre `/explorar`.
2. **«Marketplace» vuelve a llamarse «Ayuda»** en toda la interfaz. La ruta real es `/ayuda`; `/marketplace` redirige a ella.
3. **Emergencia sale de la barra.** Se abre con el SOS rojo de la cabecera (que está en todas las raíces). Estando en
   Emergencia, la barra sigue visible **sin pestaña resaltada**, para que siempre haya salida.
4. El chat es una **burbuja flotante** (`ChatFab`, dentro del contenido para quedar sobre la barra), con las conversaciones
   sin leer. Se ve en las 4 pestañas; no en Emergencia.
5. `/mensajes` deja de ser pestaña: muestra la barra sin resaltar para tener salida.
6. **El Inicio no muestra la barra**: vuelven los 4 botones grandes (Comunidad, Negocios, Emergencia, Ayuda) que llevan a cada sección. La pestaña «Inicio» queda en la barra de las demás pantallas, para volver.

## Consecuencias
- Cambio de bajo riesgo: `shell`, `chat/ChatFab`, el layout raíz, las rutas `ayuda`/`marketplace` y el recorrido guiado.
- Las cabeceras de `/eventos` y `/explorar` dicen «Comunidad» y «Negocios» para coincidir con la barra.
- Quien guardó un enlace a `/marketplace` llega igual a Ayuda gracias a la redirección.
- En el Inicio la burbuja sube lo que mide el área segura, porque ahí no hay barra.
- La burbuja puede tapar el final de una lista; hay que revisarlo en Expo Go.
