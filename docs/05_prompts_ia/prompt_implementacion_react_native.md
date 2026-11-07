# Prompt para IA de desarrollo — React Native

Actúa como Lead Mobile Engineer y Product Engineer. Implementa Red Vecinal Solidaria usando React Native + Expo + TypeScript.

Antes de escribir código:
1. Lee todos los documentos de este paquete.
2. Resume arquitectura, entidades y flujos.
3. Propón un plan incremental de implementación.
4. No cambies decisiones UX sin señalar el conflicto y pedir confirmación.

## Stack objetivo
- Expo + React Native + TypeScript.
- Expo Router.
- Supabase (Auth, PostgreSQL, Storage, Realtime).
- SQLite con expo-sqlite para datos offline.
- SecureStore para secretos/tokens.
- Expo Location.
- React Native Maps.
- React Hook Form + Zod.
- TanStack Query.
- Zustand solo para estado global ligero.

## Reglas
- Componentes accesibles, tipados y reutilizables.
- Separar UI, dominio, datos y servicios.
- No incluir secretos en el cliente.
- RLS para datos protegidos.
- Ubicación precisa solo por autorización y necesidad operativa.
- Cola offline idempotente, con UUID y estado de sincronización.
- No marcar como recibido lo que solo está en SQLite.
- Manejar GPS denegado con selección manual de sector.
- Publicación en máximo tres interacciones principales.
- No usar datos reales de personas vulnerables en demos.
- Implementar «Ayudar a un vecino vulnerable» como una acción integrada en el Centro de emergencias, no como una nueva pestaña ni como una app/módulo independiente.
- El reporte por terceros debe minimizar datos, permitir envío inicial sin diagnóstico y distinguir vulnerabilidad reportada, necesidad y emergencia validada.
- No afirmar que la app reemplaza servicios oficiales.

## Orden de implementación
1. Design system y navegación.
2. Onboarding accesible y selección de sector.
3. Inicio y Explorar.
4. Detalle y publicación de tres interacciones.
5. Perfil y confianza.
6. Modo emergencia.
7. Reporte y seguimiento, incluida la opción «Ayudar a un vecino vulnerable» dentro del Modo Emergencia existente.
8. Mapa por capas.
9. Persistencia local y estados offline.
10. Integración backend y permisos.

Entrega código funcional por etapas, con instrucciones de ejecución, `.env.example`, esquema SQL y datos semilla ficticios. No simules funcionalidades como si fueran servicios reales; etiqueta claramente los mocks.
