# ADR 0007 — Barra de los 4 servicios y chat como burbuja flotante

- **Estado:** propuesta (rama `shay-4-espacios`)
- **Fecha:** 2026-11-08
- **Reemplaza en parte:** ADR 0006 (la barra de 5 «comunidad primero»)

## Contexto
ADR 0006 puso Inicio · Eventos · Explorar · Marketplace · Chat y sacó Emergencia de la barra. La identidad de Yunta
son 4 servicios (Comunidad, Negocios, Emergencia, Marketplace) y el equipo prefiere ver los cuatro siempre, con el chat
como burbuja, como antes.

## Decisión
1. La barra es **Inicio + los 4 servicios**. Cada uno usa la pantalla raíz que ya existe; las rutas no cambian.
2. Emergencia vuelve a la barra (en rojo, el único color de urgencia). El SOS de la cabecera se mantiene.
3. El chat es una **burbuja flotante** (`ChatFab`, dentro del contenido para quedar sobre la barra), con las conversaciones
   sin leer. No aparece en Emergencia.
4. `/mensajes` deja de ser pestaña: muestra la barra sin resaltar para tener salida.

## Consecuencias
- Cambio de bajo riesgo: solo `shell`, `chat/ChatFab`, el layout raíz y el recorrido guiado.
- Las cabeceras de `/eventos` y `/explorar` pasan a decir «Comunidad» y «Negocios» para coincidir con la barra.
- La burbuja puede tapar el final de una lista; hay que revisarlo en Expo Go.
