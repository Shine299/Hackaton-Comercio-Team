# Brief de producto — Red Vecinal Solidaria

## 1. Visión
Red Vecinal Solidaria conecta a vecinos para resolver necesidades cotidianas y coordinar apoyo comunitario durante emergencias. Su diseño prioriza cercanía, confianza, inclusión, claridad y resiliencia.

**Promesa:** Tu comunidad, más cerca.

## 2. Dos contextos de uso
### Modo Día a Día
- Descubrir servicios, productos, oficios y recomendaciones.
- Ofrecer o solicitar ayuda y bienes.
- Trueque de herramientas y movilidad compartida.
- Contacto mediante solicitud previa y chat integrado.
- Recomendaciones comunitarias y perfiles con confianza progresiva.

### Modo Emergencia
- Alertas e incidentes comunitarios.
- Solicitudes urgentes de ayuda.
- Necesidades y recursos humanitarios.
- Voluntariado, tareas y brigadas.
- Priorización de personas vulnerables.
- Opción integrada «Ayudar a un vecino vulnerable» para reportar en representación de otra persona.
- Información crítica disponible sin conexión.

## 3. Decisiones UX confirmadas
| Área | Decisión |
|---|---|
| Plataforma | Android e iOS; React Native como opción de frontend |
| Cobertura | Modelo híbrido; radio inicial de 2 km |
| Acceso | Exploración libre sin registro; registro para interactuar |
| Explorar | Lista de publicaciones como vista inicial, con acceso al mapa |
| Comunicación | Chat integrado |
| Identidad | Verificación progresiva según acciones y confianza |
| Reportes de emergencia | Reportar sin registro; registro para seguimiento y coordinación |
| Privacidad geográfica | Ubicación aproximada pública; precisa solo para equipos autorizados |
| Activación de emergencia | Activación comunitaria automática mediante reportes coincidentes |
| Activación territorial | Por sector o zona afectada |
| Asignación de ayuda | Modelo híbrido |
| Disponibilidad voluntaria | Perfil progresivo y disponibilidad flexible |
| Finalización de interacciones | Confirmación de ambas partes |
| Recomendaciones | Indicadores y comentarios |
| Privacidad de recomendaciones | Visibilidad configurable |
| Moderación | Híbrida |
| Offline | Descarga inteligente |
| Inicio | Inicio inteligente |
| Tarjetas Explorar | Diseño híbrido |
| Publicación | Formulario progresivo e inteligente |
| Inicio de chat | Solicitud antes de abrir chat |
| Notificaciones de emergencia | Prioridad alta por defecto |
| Perfil | Público con privacidad configurable |
| Orden de resultados | Relevancia inteligente |
| Filtros | Esenciales visibles + avanzados en panel |
| Multimedia | Fotografías y documentos según categoría; sin videos |
| Vigencia | Configurable con vencimiento automático |
| Favoritos | Colecciones personalizadas + “Todos los guardados” |
| Actividad | Bandeja unificada con filtros |
| Chat | Completo y contextual |
| Necesito ayuda | Solicitud guiada y rápida, con envío mínimo para peligro inmediato |
| Reportes de incidentes | Seguimiento transparente |
| Mapa de emergencias | Capas activables |
| Recursos | Coordinación híbrida |
| Voluntariado | Vista híbrida lista + mapa |
| Participación en tareas | Solicitud de participación |
| Habilidades | Declaración voluntaria; verificación adicional para certificadas |
| Disponibilidad | Flexible |
| Seguridad | Protección híbrida |
| Offline UX | Estados explícitos y visibles |
| Accesibilidad | Universal, integrada por defecto |
| Soporte vulnerable | Prioridad humanitaria y reportes en representación de terceros |

## 4. Relevancia inteligente
Ordenar resultados considerando:
- Distancia y radio de proximidad.
- Coincidencia con la búsqueda y categoría.
- Disponibilidad y vigencia.
- Señales de confianza comunitaria.
- Contexto y urgencia.

No convertir popularidad en único criterio. Evitar que vecinos nuevos queden invisibilizados. Las necesidades urgentes pueden recibir prioridad contextual sin confundir urgencia con validación.

## 5. Modelo geográfico
- Radio inicial: 2 km.
- Cobertura híbrida: proximidad local con posibilidad de ampliar a sectores contiguos cuando el contexto lo justifique.
- Detectar distrito/sector mediante ubicación del dispositivo, solicitar permiso y ofrecer selección manual.
- No bloquear el uso si GPS está desactivado o denegado.
- Mostrar ubicación pública aproximada; ubicación precisa solo a roles autorizados y con necesidad operativa.

## 6. Roles conceptuales
- Visitante: explora sin registro.
- Vecino registrado: publica, solicita, conversa y participa.
- Voluntario: perfil progresivo, habilidades y disponibilidad.
- Coordinador autorizado: coordina tareas y recursos dentro de permisos definidos.
- Moderador: revisa reportes y casos de seguridad.
- Administrador: configura sectores, roles y catálogos.

## 7. Principios no negociables
1. Claridad antes que densidad funcional.
2. Publicar o solicitar en máximo 3 interacciones principales.
3. Accesibilidad integrada por defecto.
4. Offline-first con estados honestos.
5. Privacidad por diseño, especialmente en crisis.
6. No prometer rescate ni recepción de alertas sin confirmación del servidor.
7. La app no reemplaza a servicios oficiales de emergencia.
