# Stack recomendado y alcance MVP de 48 horas

## 1. Stack recomendado
### Frontend
- React Native con Expo y TypeScript.
- Expo Router para navegación.
- React Native Paper o NativeWind (elegir uno; evitar mezclar sistemas de diseño).
- React Hook Form + Zod para formularios progresivos.
- TanStack Query para sincronización remota y caché.
- Zustand para estado global ligero.

### Backend/BaaS
- Supabase: Auth, PostgreSQL, Storage y Realtime.
- Row Level Security desde el inicio para separar vecinos, coordinadores y moderadores.
- Edge Functions solo para operaciones que requieran lógica privilegiada.
- No colocar claves secretas en la app.

### Persistencia local
- SQLite con expo-sqlite para datos estructurados y cola offline.
- SecureStore para tokens/secretos locales.
- Cache de imágenes y documentos con límites.
- Cola de sincronización idempotente con identificadores únicos y reintentos.

### Mapas y ubicación
- Expo Location para permisos y ubicación.
- React Native Maps para mapa.
- Proveedor de mapas configurable según disponibilidad, términos y presupuesto.
- Guardar sector/distrito seleccionado manualmente si GPS no está disponible.
- Geocodificación inversa no debe bloquear la experiencia.

## 2. Modelo de datos inicial
- profiles
- neighborhoods / sectors
- posts
- post_media
- saved_collections
- saved_items
- conversations
- messages
- interaction_requests
- emergency_reports
- vulnerability_support_flags
- resource_needs
- resource_offers
- volunteer_profiles
- volunteer_tasks
- volunteer_applications
- activity_events
- moderation_reports
- sync_queue (local)

## 3. Offline-first
- Separar datos locales de estado del servidor.
- Cada operación local lleva UUID, created_at, device_id, sync_status.
- Sincronización idempotente.
- Resolver conflictos con reglas por entidad; no sobrescribir silenciosamente reportes críticos.
- Cola priorizada: reportes de emergencia, solicitudes urgentes, resto.
- Enviar adjuntos cuando haya conectividad; comprimir imágenes.
- Indicar claramente si una acción solo está guardada localmente.

## 4. MVP viable en 48 horas
Priorizar un prototipo demostrable, no construir todas las capacidades de producción.

### Imprescindible para demo
1. Onboarding/tutorial accesible y exploración sin registro.
2. Inicio inteligente y distrito/sector.
3. Explorar lista + mapa.
4. Publicar/ofrecer/solicitar en tres interacciones.
5. Detalle de publicación y solicitud de contacto.
6. Perfil básico y confianza visual.
7. Modo emergencia con reportar incidente y necesito ayuda.
8. Tablero de vulnerabilidad con datos ficticios claramente identificados en demo.
9. Mapa por capas.
10. Estado offline visible y cola local demostrable.
11. Números e instrucciones de emergencia configurables y revisados para el territorio de despliegue.

### Simular o dejar para siguiente iteración
- Chat completo con adjuntos.
- Moderación avanzada con IA.
- Activación automática robusta por reportes coincidentes.
- Verificación documental de certificaciones.
- Asignación logística avanzada.
- Push notifications de producción.
- Encriptación extremo a extremo de chat.
- Integraciones con autoridades/servicios oficiales.

## 5. Riesgos y mitigaciones
- GPS denegado: selector manual de distrito/sector.
- Red caída: datos esenciales locales y estados explícitos.
- Reportes falsos: rate limits, duplicados, revisión humana y trazabilidad.
- Ubicación sensible: aproximación pública y acceso preciso restringido.
- Alcance excesivo: priorizar flujos demo y simular módulos complejos.
- Datos de emergencia incorrectos: no hardcodear números sin validación local y fecha de verificación.
