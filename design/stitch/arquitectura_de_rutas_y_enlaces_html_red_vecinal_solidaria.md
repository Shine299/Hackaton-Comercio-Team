# Arquitectura de Rutas y Enlaces (Router Map)
## Proyecto: Red Vecinal Solidaria

Este documento define la estructura de archivos `.html`, los enlaces cruzados de navegación (`<a href="...">`) y el flujo interactivo de punta a punta para enlazar todas las pantallas exportadas.

---

### 📂 Estructura de Archivos Recomendada

```text
/red-vecinal-solidaria/
├── index.html                   # Bienvenida y Acceso Vecinal (Onboarding)
├── registro.html                # Registro y Verificación Vecinal
├── home.html                    # Inicio Inteligente (Feed Barrial y Acciones)
├── explorar.html                # Explorar Publicaciones (Lista / Mapa)
├── publicacion-detalle.html     # Detalle de Publicación y Ficha de Contacto
├── publicar.html                # Publicar u Ofrecer Ayuda
├── mensajes.html                # Mensajes y Solicitudes Vecinales (Bandeja)
├── chat.html                    # Chat Individual y Coordinación Vecinal
├── actividad.html               # Actividad, Préstamos y Seguimiento
├── notificaciones.html          # Centro de Alertas y Notificaciones Barriales
├── perfil.html                  # Perfil Vecinal y Confianza Cívica
├── accesibilidad.html           # Ajustes de Accesibilidad y Modo Offline / P2P
│
└── emergencias/                 # Flujo Modo Emergencia (Resiliencia Urbana)
    ├── index.html               # Centro de Emergencias (SOS)
    ├── vecino-vulnerable.html   # Reporte: Ayudar a un Vecino Vulnerable
    ├── tablero-humanitario.html # Tablero Humanitario de Necesidades Críticas
    ├── coordinacion-ayuda.html  # Ficha de Coordinación y Logística Humanitaria
    ├── reportar-incidente.html  # Reportar Incidente Físico (Cables, Anegamiento)
    ├── confirmacion-reporte.html# Confirmación de Incidente y Trazabilidad P2P
    ├── seguimiento-incidente.html# Seguimiento de Incidente y Rutas Seguras
    └── mapa-emergencia.html     # Mapa de Emergencia con Capas (Albergues y Zonas Seguras)
```

---

### 🗺️ Matriz de Navegación Global (Barra Inferior Persistente)

Cada pantalla del ecosistema normal incluye la barra inferior de 5 accesos con las siguientes rutas relativas:

| Ícono / Tab | Etiqueta | Enlace Relativo | Destino |
| :--- | :--- | :--- | :--- |
| `home` | **Inicio** | `home.html` | Tablero de bienvenida y accesos rápidos |
| `explore` | **Explorar** | `explorar.html` | Feed de favores, préstamos y trueques |
| `add_circle` (FAB central) | **Publicar** | `publicar.html` | Crear nuevo pedido u ofrecimiento |
| `notifications` | **Actividad** | `actividad.html` | Mis favores activos y trazabilidad |
| `person` | **Perfil** | `perfil.html` | Reputación cívica y credencial |

> **Nota para el botón SOS del Header (`Top Bar`):** En todas las pantallas normales, el botón rojo de emergencia enlaza a:  
> `<a href="emergencias/index.html" class="sos-btn">SOS</a>`

---

### 🔗 Mapa Detallado de Enlaces por Pantalla

#### 1. Onboarding y Acceso
- **`index.html` (Bienvenida y Acceso Vecinal)**:
  - Botón *"Comenzar Validación Vecinal"*: `href="registro.html"`
  - Enlace rápido *"Ingresar en modo invitado"*: `href="home.html"`
  - Botón crítico *"Ingresar al SOS sin validación previa"*: `href="emergencias/index.html"`
  - Conmutador *"Accesibilidad"* en cabecera: `href="accesibilidad.html"`

- **`registro.html` (Registro y Verificación Vecinal)**:
  - Flecha atrás `←`: `href="index.html"`
  - Botón *"Verificar mi Cuenta Vecinal"*: `href="home.html"`
  - Botón de salvaguarda *"¿En peligro? Ingresar al SOS"*: `href="emergencias/index.html"`

---

#### 2. Ecosistema Diario Comunitario
- **`home.html` (Inicio Inteligente)**:
  - Banner *"Centro de Ayuda / SOS"* o botón de cabecera: `href="emergencias/index.html"`
  - Botón táctil *"Pedir apoyo / Ofrecer ayuda"*: `href="publicar.html"`
  - Botón táctil *"Ver mapa barrial"*: `href="explorar.html"`
  - Tarjetas de publicaciones en feed: `href="publicacion-detalle.html"`
  - Ícono de mensajes en cabecera: `href="mensajes.html"`
  - Ícono de notificaciones / alertas: `href="notificaciones.html"`

- **`explorar.html` (Explorar Publicaciones)**:
  - Tarjeta de item (ej. *"Préstamo de Escalera Telescópica"*): `href="publicacion-detalle.html"`
  - Selector de vista (Lista / Mapa): activa filtro en el DOM o enlaza a `mapa-emergencia.html`

- **`publicacion-detalle.html` (Detalle de Publicación y Contacto)**:
  - Flecha atrás `←`: `href="explorar.html"`
  - Botón *"Solicitar Préstamo / Enviar Mensaje"*: `href="chat.html"`
  - Ficha de perfil del prestador: `href="perfil.html"`

- **`publicar.html` (Publicar u Ofrecer Ayuda)**:
  - Flecha atrás `←` / Botón Cancelar: `href="home.html"`
  - Botón *"Publicar en mi Cuadrante"*: `href="explorar.html"` (o redirección a `home.html`)

- **`mensajes.html` (Mensajes y Solicitudes Vecinales)**:
  - Flecha atrás `←`: `href="home.html"`
  - Tarjeta de chat de Carmen V. / Marcos R.: `href="chat.html"`
  - Botón *"Nueva conversación vecinal"*: `href="explorar.html"`

- **`chat.html` (Chat Individual y Coordinación Vecinal)**:
  - Flecha atrás `←`: `href="mensajes.html"`
  - Botón de tarjeta *"Detalles del acuerdo"*: `href="publicacion-detalle.html"`
  - Botón *"Ver mapa del punto de encuentro"*: `href="emergencias/mapa-emergencia.html"`

- **`actividad.html` (Actividad y Seguimiento)**:
  - Tarjeta de favor en curso: `href="chat.html"`
  - Botón *"Ver alertas del barrio"*: `href="notificaciones.html"`

- **`notificaciones.html` (Centro de Alertas)**:
  - Flecha atrás `←`: `href="home.html"`
  - Alerta de Poste Inclinado (*"Ver en Mapa"*): `href="emergencias/mapa-emergencia.html"`
  - Solicitud de Botiquín (*"Ofrecer ayuda"*): `href="chat.html"`
  - Aval recibido (*"Ver perfil cívico"*): `href="perfil.html"`

- **`perfil.html` (Perfil Vecinal y Confianza)**:
  - Botón o enlace *"Accesibilidad y Modo Offline"*: `href="accesibilidad.html"`
  - Botón *"Mis préstamos y actividad"*: `href="actividad.html"`

- **`accesibilidad.html` (Ajustes de Accesibilidad y Modo Offline)**:
  - Flecha atrás `←`: `href="perfil.html"`
  - Botón *"Actualizar Mapa Barrial Offline"*: dispara caché local o redirige a `emergencias/mapa-emergencia.html`

---

#### 3. Modo Emergencia (Subdirectorio `/emergencias/`)
En el Modo Emergencia, la cabecera roja cuenta con el botón *"← Salir"*, que retorna a la app ordinaria:  
`<a href="../home.html" class="exit-sos-btn">← Salir</a>`

- **`emergencias/index.html` (Centro de Emergencias)**:
  - Botón *"Salir / Volver"*: `href="../home.html"`
  - Botón táctil *"Ayudar a un Vecino Vulnerable"*: `href="vecino-vulnerable.html"`
  - Botón táctil *"Reportar Incidente Barrial"*: `href="reportar-incidente.html"`
  - Botón táctil *"Tablero Humanitario"*: `href="tablero-humanitario.html"`
  - Botón táctil *"Mapa de Zonas Seguras y Refugios"*: `href="mapa-emergencia.html"`
  - Botones de discado telefónico directo:  
    - PNP: `href="tel:105"`  
    - Bomberos: `href="tel:116"`  
    - SAMU: `href="tel:106"`

- **`emergencias/vecino-vulnerable.html` (Ayudar a un Vecino Vulnerable)**:
  - Flecha atrás `←`: `href="index.html"`
  - Botón *"Enviar Alerta Protegida a Brigadistas"*: `href="tablero-humanitario.html"`

- **`emergencias/tablero-humanitario.html` (Tablero Humanitario)**:
  - Flecha atrás `←`: `href="index.html"`
  - Tarjeta de incidente o caso verificado: `href="coordinacion-ayuda.html"`
  - Botón *"Ver mapa de suministros"*: `href="mapa-emergencia.html"`

- **`emergencias/coordinacion-ayuda.html` (Coordinación de Ayuda Humanitaria)**:
  - Flecha atrás `←`: `href="tablero-humanitario.html"`
  - Botón *"Abrir ruta segura en mapa"*: `href="seguimiento-incidente.html"`
  - Botón *"Contactar nodo de brigada"*: `href="../chat.html"`

- **`emergencias/reportar-incidente.html` (Reportar Incidente Barrial)**:
  - Flecha atrás `←`: `href="index.html"`
  - Botón *"Confirmar y Alertar Cuadrante"*: `href="confirmacion-reporte.html"`

- **`emergencias/confirmacion-reporte.html` (Confirmación y Estado de Reporte)**:
  - Botón *"Seguir Incidente en Vivo"*: `href="seguimiento-incidente.html"`
  - Botón *"Compartir Alerta de Desvío con Vecinos"*: `href="../mensajes.html"`
  - Enlace *"Volver al Inicio"*: `href="../home.html"`

- **`emergencias/seguimiento-incidente.html` (Seguimiento de Incidente Barrial)**:
  - Flecha atrás `←`: `href="index.html"`
  - Botón *"Ver mapa ampliado"*: `href="mapa-emergencia.html"`
  - Botón *"Notificar ruta despejada"*: `href="confirmacion-reporte.html"`

- **`emergencias/mapa-emergencia.html` (Mapa de Emergencia con Capas)**:
  - Flecha atrás `←`: `href="index.html"`
  - Botón *"Reportar obstáculo en vía"*: `href="reportar-incidente.html"`
  - Botón *"Ver lista humanitaria"*: `href="tablero-humanitario.html"`

---

### 💡 Ejemplo Rápido de Snippet de Navegación (HTML)

```html
<!-- Barra inferior en home.html, explorar.html, etc. -->
<nav class="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-surface border-t border-outline-variant flex justify-around py-2 z-50">
  <a href="home.html" class="flex flex-col items-center text-primary">
    <span class="material-symbols-outlined text-2xl">home</span>
    <span class="text-xs font-medium">Inicio</span>
  </a>
  <a href="explorar.html" class="flex flex-col items-center text-on-surface-variant hover:text-primary">
    <span class="material-symbols-outlined text-2xl">explore</span>
    <span class="text-xs font-medium">Explorar</span>
  </a>
  <a href="publicar.html" class="flex flex-col items-center -mt-5 bg-primary text-on-primary rounded-full p-3 shadow-lg">
    <span class="material-symbols-outlined text-3xl">add</span>
  </a>
  <a href="actividad.html" class="flex flex-col items-center text-on-surface-variant hover:text-primary">
    <span class="material-symbols-outlined text-2xl">notifications</span>
    <span class="text-xs font-medium">Actividad</span>
  </a>
  <a href="perfil.html" class="flex flex-col items-center text-on-surface-variant hover:text-primary">
    <span class="material-symbols-outlined text-2xl">person</span>
    <span class="text-xs font-medium">Perfil</span>
  </a>
</nav>
```
