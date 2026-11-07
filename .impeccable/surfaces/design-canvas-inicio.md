---
version: 1
slug: "design-canvas-inicio"
primary_target: "design/canvas/Inicio"
related_targets: []
---

# Inicio (lienzo de rediseño) · Operate

Scope: Inicio de la app móvil (artboard 390x844 del lienzo Design) y la barra de 5 que comparten las 4 secciones. Audiencia: vecinos de todas las edades; modo estándar y modo fácil elegidos en la bienvenida. Tarea: saber en segundos a qué sección entrar, ver si hay alerta y retomar lo pendiente.

## Direction contract

THESIS: El Inicio hace una sola pregunta, «¿Qué necesitas hoy?», y responde con 4 botones-ilustración, uno por sección. Rechaza el dashboard de tarjetas iguales con métricas y el feed mezclado.

OWN-WORLD: Paleta del proyecto: fondo #f0f3ff, teal #004243 para acción y pestaña activa, suelos #aceeef/#dbeff0 en ilustraciones, azul #003b71 solo «Ayuda/Necesito», rojo #ba1a1a solo Emergencia, ámbar #8a5300 solo «sin enviar». Inter, Material Symbols Rounded, ilustraciones planas del barrio (assets/illustrations/seccion-*.svg), radios 24-28, sombra suave con desplazamiento.

STORY: El vecino lee la pregunta, reconoce su sección por el dibujo y el nombre, ve la alerta si existe y lo que tiene pendiente, y toca. Nunca lee un párrafo.

FIRST VIEWPORT: Arriba, sector «Lince · 2 km» y saludo a la izquierda; Mensajes, avisos y avatar a la derecha (44 px). Pregunta a 30 px. Alerta compacta (solo si existe). 4 botones 2x2 de ~170x196 px: ilustración de 96 px sobre suelo de color, nombre a 18 px, una línea de estado viva. Debajo, «Tienes pendiente» con 1-2 filas. Barra fija de 5 abajo.

FORM: «¿Qué necesitas hoy?», posición 5 de 7 en la lista propia; seed 09eb0fb8 (re-roll 1). Interacción firma: el botón se hunde al tocar (escala 0.97, sombra se acorta) y el modo fácil reorganiza a 1 columna con texto de 22 px.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
