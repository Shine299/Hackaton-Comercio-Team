# Prompt para Penpot — Red Vecinal Solidaria

Actúa como Senior Product Designer especializado en aplicaciones móviles inclusivas, diseño iOS/Android, sistemas de diseño y productos cívicos de alto impacto.

Diseña en Penpot un prototipo móvil de alta fidelidad para **Red Vecinal Solidaria**, una aplicación Android/iOS que conecta vecinos para resolver necesidades cotidianas y coordinar ayuda durante emergencias.

## Contexto y propuesta
La app tiene dos contextos:
1. **Día a Día:** explorar y publicar servicios, productos, oficios, trueques, movilidad compartida y recomendaciones vecinales.
2. **Modo Emergencia:** reportar incidentes, solicitar ayuda, ofrecer recursos, encontrar voluntarios y coordinar apoyo humanitario.

Promesa: “Tu comunidad, más cerca”.

## Dirección visual
- Estética limpia, cálida, moderna y minimalista, inspirada en la claridad y refinamiento de las interfaces Apple, sin copiar componentes propietarios.
- Sensación de confianza, proximidad y seguridad.
- Mucho espacio en blanco, jerarquía tipográfica clara, tarjetas ordenadas y esquinas suaves.
- Evitar apariencia de dashboard empresarial o aplicación gubernamental antigua.
- Paleta neutral para el modo cotidiano y acentos semánticos para estados.
- En emergencia, aumentar la jerarquía visual y el contraste sin crear pánico ni saturación.
- Diseñar para pantallas móviles actuales, con componentes adaptables a iOS y Android.

## Accesibilidad obligatoria
- Diseñar con accesibilidad integrada por defecto, no un “modo adulto mayor”.
- Botones grandes y áreas táctiles cómodas.
- Tipografía legible y escalable.
- Contraste suficiente; nunca depender solo del color.
- Iconos siempre acompañados por etiquetas cuando la acción no sea universal.
- Compatibilidad conceptual con lectores de pantalla.
- Estados claros, lenguaje cotidiano y mensajes cortos.
- Tutorial inicial amigable, repetible y omitible.
- Acciones por voz, notas de voz y tarjetas preconfiguradas.
- Formularios cortos y progresivos.
- Mostrar confirmaciones y errores comprensibles.

## Navegación principal
Crear una barra inferior de cinco destinos:
- Inicio
- Explorar
- Publicar (acción central destacada)
- Actividad
- Perfil

Incluir acceso evidente a Mensajes y a Modo Emergencia. No ocultar el acceso a ayuda urgente dentro de menús profundos.

## Pantallas que debes diseñar
1. Splash / bienvenida.
2. Tutorial de 3–4 pantallas, con Saltar y Repetir tutorial.
3. Permiso de ubicación explicado y alternativa manual.
4. Inicio inteligente con distrito/sector y acciones rápidas.
5. Explorar: lista como vista inicial y acceso a mapa.
6. Resultados con tarjetas híbridas y filtros esenciales; panel de filtros avanzados.
7. Detalle de publicación con perfil, confianza, distancia aproximada y CTA Contactar.
8. Flujo de publicación en máximo tres interacciones principales:
   - elegir Ofrecer o Solicitar;
   - categoría + tarjeta guiada con texto/foto/voz;
   - confirmar Publicar.
9. Colecciones de favoritos.
10. Actividad unificada con filtros.
11. Bandeja de mensajes y chat contextual.
12. Centro de emergencias, manteniendo las opciones ya definidas.
13. Flujo “Necesito ayuda” guiado y versión mínima para peligro inmediato.
13a. Opción visible «Ayudar a un vecino vulnerable» dentro del Centro de emergencias (no crear una pestaña o modo nuevo).
14. Formulario “Reportar incidente”.
15. Seguimiento de reporte con estados: Recibido, En revisión, Validado, Atención coordinada, Resuelto; alternativos Duplicado, No verificable y Pendiente de sincronización.
16. Mapa de emergencia con capas activables: Incidentes, Necesidades, Recursos, Voluntarios y Zonas afectadas.
17. Tablero humanitario con alertas prioritarias de personas vulnerables, mostrando solo ubicación aproximada y datos no identificables al público.
18. Reportar en representación de otra persona, accesible desde «Ayudar a un vecino vulnerable».
19. Ficha de necesidad/recurso con progreso de cobertura.
20. Oportunidades de voluntariado en vista híbrida lista + mapa.
21. Solicitud de participación en tarea.
22. Perfil progresivo de voluntario, habilidades declaradas y certificaciones verificadas.
23. Estado sin conexión con última sincronización y acciones pendientes.
24. Ajustes de accesibilidad y privacidad.

## Reglas de producto que deben reflejarse visualmente
- Exploración libre sin registro; registro para interactuar.
- Radio inicial de proximidad: 2 km, modelo geográfico híbrido.
- Ubicación pública aproximada; precisa solo para equipos autorizados.
- Chat integrado, pero se inicia con solicitud de contacto.
- Publicaciones con fotos y documentos según categoría; no videos.
- Vigencia configurable y vencimiento automático.
- Favoritos con colecciones personalizadas y “Todos los guardados”.
- Moderación híbrida.
- Disponibilidad voluntaria flexible; no asignar tareas automáticamente.
- Confirmación de ambas partes para completar interacciones.
- Resultados por relevancia inteligente, sin premiar solo popularidad.
- Offline-first con estados explícitos: Guardado en dispositivo, Pendiente de sincronización, Enviando, Recibido y Validado.
- La app no reemplaza servicios oficiales de emergencia.
- No afirmar que un reporte offline fue recibido.

## Modo emergencia y vulnerabilidad
- Mantener la arquitectura y navegación principal ya definida; no rediseñar la app ni agregar una pestaña principal nueva.
- Dentro del Centro de emergencias, incluir una tarjeta/acción clara llamada «Ayudar a un vecino vulnerable», junto a las acciones existentes.
- Su flujo debe ser breve: elegir la opción, seleccionar una necesidad preconfigurada y zona, revisar y enviar (máximo tres interacciones principales).
- Priorizar visualmente incidentes urgentes y necesidades de personas vulnerables.
- Permitir que un vecino reporte en representación de un adulto mayor, persona con movilidad reducida o alguien con necesidad médica.
- Diferenciar condición de vulnerabilidad, necesidad reportada y emergencia verificada.
- No mostrar nombres, teléfonos, diagnósticos ni dirección exacta públicamente.
- Mostrar ubicación aproximada en mapa público.
- Mostrar datos precisos solo a equipos autorizados.
- No representar reportes sin validar como incidentes confirmados.

## Entregables en Penpot
- Un sistema de diseño con colores, tipografía, espaciado, radios, elevación, iconos y estados.
- Componentes reutilizables: botones, campos, tarjetas, chips, navegación, banners, estados offline, alertas y modales.
- Pantallas en frames separados y ordenados por flujo.
- Prototipo navegable de los recorridos críticos.
- Variantes de estados normal, emergencia, offline, error, cargando y éxito.
- Diseños con contenido en español peruano natural.
- Datos ficticios de demostración, nunca información personal real.

## Flujos que deben quedar conectados en el prototipo
A. Visitante → Explorar → Detalle → Solicitud de contacto → Registro/inicio de sesión → Chat.
B. Inicio → Publicar → Ofrecer/Solicitar → Categoría y tarjeta guiada → Publicar.
C. Inicio → Modo emergencia → Necesito ayuda → Enviar alerta → Estado del reporte.
D. Modo emergencia → Reportar incidente → Confirmación → Seguimiento.
E. Modo emergencia → Mapa por capas → Seleccionar necesidad → Ofrecer recurso.
F. Voluntariado → Ver oportunidad → Quiero ayudar → Solicitud pendiente → Confirmación.
G. Sin conexión → Consultar datos guardados → Crear reporte local → Pendiente de sincronización.
H. Centro de emergencias → Ayudar a un vecino vulnerable → Seleccionar necesidad y zona → Enviar alerta → Ver estado real de sincronización/seguimiento.

Primero establece la arquitectura de pantallas y el sistema visual; después crea las pantallas y conecta los prototipos. No inventes nuevas funcionalidades ni cambies las decisiones descritas. Si una pantalla es demasiado compleja, prioriza la claridad y el flujo funcional sobre los adornos visuales.
