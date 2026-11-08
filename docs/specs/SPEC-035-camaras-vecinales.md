# SPEC-035 — Cámaras vecinales (celular → cámara)

- **Estado:** implementada, fase 1 (sin servidor) · plan `docs/plan_integraciones_definitivo.md` §3.2
- **Dueño / revisor:** … / …
- **Sprint:** integraciones

## Qué y por qué
Un celular viejo con la app IP Webcam, apuntando a la calle, se convierte en cámara del sector. Los vecinos la
ven desde Yunta. Une la parte financiera con la de seguridad: la cámara 1 muestra «Financiada por N vecinos».

## Criterios de aceptación
1. **Dado** Inicio, **cuando** lo abro, **entonces** veo «Nuevas funcionalidades» (antes «Juntos por el barrio»; renombrada en SPEC-054) con el fondo destacado y el acceso «Cámaras del barrio» con cuántas están en vivo.
2. **Dado** una cámara de demostración, **cuando** la abro, **entonces** veo una vista ilustrada con «Vista de demostración», su estado en texto («En vivo» / «Sin señal») y `DemoTag`.
3. **Dado** una cámara financiada por un fondo, **cuando** la abro, **entonces** veo «Financiada por N vecinos» y al tocarlo llego al fondo.
4. **Dado** que escribo la dirección de IP Webcam (`http://192.168.x.x:8080`), **cuando** toco «Probar conexión» en la misma red, **entonces** veo la imagen refrescándose y «En vivo»; sin conexión, «Sin señal» y reintenta.
5. **Dado** una dirección pública, un nombre o un texto inválido, **entonces** no se puede guardar y el motivo está escrito.
6. **Dado** que no confirmo las tres reglas de privacidad, **entonces** el botón «Guardar cámara» queda deshabilitado.
7. **Dado** el mapa de Emergencia, **entonces** las cámaras aparecen como capa «Cámaras vecinales» en zona aproximada y abren su visor.
8. **Dado** que salgo de la pantalla de la cámara, **entonces** deja de pedir imágenes.

## Alcance
- **Toca:** `src/features/cameras/` (nueva), `src/features/map` (capa `cameras`), `src/features/home` (Inicio y Comunidad),
  `src/features/emergency/EmergencyCenterScreen.tsx` (acceso), `src/features/funds` (`useFundProgress`, `demoCamerasFundId`),
  rutas `src/app/camaras/…`.
- **Sin dependencias nuevas:** el video es la foto `/shot.jpg` pedida una tras otra con `expo-image` (doble búfer).
- **Fuera de esta fase:** tabla `cameras` en Supabase con RLS por sector (las cámaras registradas quedan «Solo en este teléfono»),
  video MJPEG con WebView, tráfico `http://` en el APK (`usesCleartextTraffic`, junto con SPEC-030).

## Pruebas
- Automáticas: `parseCameraAddress` (solo IP privadas, puerto por defecto 8080) y `snapshotUrl`.
- Manuales (Expo Go, 2 celulares en el mismo hotspot): registrar la cámara, verla en vivo en el otro, apagar el Wi-Fi y ver «Sin señal».

## Notas de accesibilidad y privacidad
- Estado con texto + punto/icono; el visor tiene `accessibilityLabel` con nombre, zona y estado.
- Solo espacios comunes, aviso de zona videovigilada y sin grabación: la app lo pide confirmar antes de guardar.
- La zona se escribe como calle y cuadra; nunca el número de una casa. En el mapa, siempre zona aproximada.
