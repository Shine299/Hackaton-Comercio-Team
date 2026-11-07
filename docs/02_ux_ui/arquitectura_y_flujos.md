# Arquitectura UX y flujos

## 1. Navegación principal propuesta
Barra inferior de cinco destinos:
1. Inicio
2. Explorar
3. Publicar (acción central destacada)
4. Actividad
5. Perfil

Mensajes puede ser acceso persistente desde Inicio/Actividad y desde el perfil. El modo emergencia debe estar accesible desde Inicio y desde un acceso persistente claramente reconocible cuando exista una emergencia en el sector.

## 2. Inicio inteligente
- Saludo y distrito/sector detectado, editable manualmente.
- Búsqueda.
- Acciones rápidas: Explorar, Publicar, Necesito ayuda.
- Resumen de actividad local.
- Aviso contextual de emergencia si aplica.
- Accesos a categorías cercanas.

## 3. Explorar
- Vista inicial: lista de publicaciones.
- Acceso alternativo al mapa.
- Tarjetas híbridas: imagen cuando exista, título, categoría, distancia aproximada, estado, precio si aplica, confianza y acción.
- Filtros esenciales: tipo de publicación, categoría y distancia.
- Filtros avanzados: disponibilidad, verificación, recomendaciones, distrito y fecha.
- Relevancia inteligente, no solo popularidad.

## 4. Publicación en máximo 3 interacciones
Diseñar un flujo de tres acciones principales:
1. Elegir “Ofrecer” o “Solicitar”.
2. Elegir categoría y completar tarjeta guiada (texto, fotografía o voz).
3. Confirmar “Publicar”.

Requisitos:
- Tarjetas preconfiguradas y plantillas por categoría.
- Voz opcional con transcripción editable.
- Título y descripción sugeridos automáticamente, siempre editables.
- Campos opcionales no deben bloquear la publicación.
- Guardado automático como borrador.
- La cifra de tres interacciones se refiere al flujo principal; permisos del sistema, teclado y pasos opcionales no deben convertirse en barreras.
- Si falta información indispensable para una categoría, explicar el motivo y pedir solo ese dato.

## 5. Detalle de publicación
- Título, categoría, descripción, fotografías/documentos permitidos.
- Autor y señales de identidad/confianza.
- Distancia aproximada y sector.
- Estado y vigencia.
- Guardar en colección.
- Contactar mediante solicitud previa.
- Reportar publicación.
- Campos dinámicos por categoría.

## 6. Ciclo de vida de publicaciones
Borrador → Activa → Pausada / En coordinación → Completada / Cerrada / Vencida.
- Vigencia configurable con vencimiento automático.
- Aviso previo para renovar.
- Vencida pasa al archivo, no se elimina automáticamente.
- Estado de publicación separado del estado de cada interacción.

## 7. Favoritos
- Colección predeterminada “Todos los guardados”.
- Colecciones personalizadas.
- Guardar publicaciones y perfiles.
- Avisos opcionales si cambia el estado de un guardado.

## 8. Actividad
Bandeja unificada cronológica con filtros:
- Todo
- Solicitudes
- Mensajes
- Comunidad
- Alertas
Las alertas críticas conservan prioridad visual. Diferenciar leído/no leído.

## 9. Mensajería
- Solicitud antes de abrir chat.
- Chat contextual vinculado a publicación/interacción.
- Texto, fotos y documentos permitidos.
- Respuestas, notificaciones, lectura configurable.
- Acceso a publicación original.
- Bloquear, reportar y silenciar.
- No incluir llamadas/video en MVP.
- Flujo de ayuda urgente con acceso prioritario y sin depender del contacto comercial convencional.

## 10. Emergencias
Pantalla principal:
- Necesito ayuda.
- Reportar incidente.
- Ofrecer ayuda.
- Necesidades y recursos.
- Mapa comunitario.
- **Ayudar a un vecino vulnerable**: acceso visible dentro del mismo Modo Emergencia, sin crear una sección principal nueva ni alterar la navegación general.

### Ayudar a un vecino vulnerable
- Permitir que un vecino registre una alerta en representación de un adulto mayor, persona con movilidad reducida o alguien que necesita apoyo para comunicarse, desplazarse o atender una necesidad médica.
- Flujo breve: (1) elegir “Ayudar a un vecino vulnerable”; (2) seleccionar la necesidad en una tarjeta preconfigurada y señalar la zona; (3) revisar y enviar.
- El detalle adicional, la nota de voz y la fotografía son opcionales; no exigir diagnóstico ni datos personales para la alerta inicial.
- Diferenciar claramente condición de vulnerabilidad, necesidad reportada y emergencia verificada.
- Mostrar estas alertas con prioridad en el tablero humanitario, conservando revisión y validación humana.
- El público ve solo ubicación aproximada y una descripción general no identificable; la ubicación precisa queda restringida a equipos autorizados.
- No crear un nuevo modo, pestaña inferior ni flujo paralelo: es una opción integrada en la pantalla de Emergencias.

### Necesito ayuda
- Solicitud guiada rápida: tipo de ayuda, ubicación aproximada, detalle opcional y foto opcional.
- Para peligro inmediato, enviar alerta mínima sin completar formulario.
- Mostrar accesos a servicios oficiales de emergencia.
- La app no sustituye servicios oficiales.

### Reportar incidente
- Categorías: incendio, inundación, derrumbe, riesgo eléctrico, vía bloqueada y otro peligro.
- Ubicación aproximada o manual.
- Descripción/foto opcional.
- Seguimiento: recibido, en revisión, validado, atención coordinada, resuelto.
- Estados alternativos: duplicado, no verificable, descartado, pendiente de sincronización.
- “Recibido” nunca significa “validado”.

### Mapa de emergencia
Capas activables:
- Incidentes.
- Necesidades.
- Recursos.
- Voluntarios.
- Zonas afectadas.
Mostrar ubicación aproximada a público. Ubicación precisa solo a equipos autorizados.

### Recursos
Coordinación híbrida. Ciclo:
Ofrecido → Reservado → Asignado → Entregado → Confirmado.
Admitir cancelaciones, ofertas duplicadas y entregas parciales.

### Voluntariado
- Vista híbrida lista + mapa.
- Solicitud de participación.
- Perfil progresivo.
- Habilidades declaradas; certificaciones con verificación.
- Disponibilidad flexible.
- No asignar tareas automáticamente por estar “disponible”.
- Tareas especializadas/peligrosas requieren validación y supervisión.

## 11. Perfil
- Perfil público con privacidad configurable.
- Identidad progresiva.
- Indicadores y comentarios de recomendaciones.
- Configuración de visibilidad.
- Colecciones, publicaciones, actividad y disponibilidad voluntaria.
- Controles de privacidad y seguridad.
