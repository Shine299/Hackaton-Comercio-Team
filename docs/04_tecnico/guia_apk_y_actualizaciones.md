# Guía — APK instalable y actualizaciones gratis (EAS)

Estado: preparada el 8 nov 2026. Fuente: documentación oficial de Expo (SDK 58). Solo Android: un APK no se instala en
iPhone (ahí queda Expo Go; instalar en iOS exige cuenta de Apple de pago).

## Cómo funciona

| Qué | Con qué | Cuándo |
|---|---|---|
| **APK nuevo** | `eas build` (nube de Expo; no hace falta Android Studio) | La primera vez y cuando cambie algo **nativo** |
| **Actualización** | `eas update` (por aire, llega al abrir la app 1–2 veces) | Cambios de código JS, textos, estilos, imágenes |

Cambia algo **nativo** (hay que generar un APK nuevo) si: se instala una librería con código nativo, se tocan permisos,
`package`, `scheme`, la clave de Google Maps o los plugins de `app.json`, o se sube de versión el SDK. En ese caso,
además, hay que subir `runtimeVersion` en `app.json` (por ejemplo `1.0.0` → `1.1.0`).

## Límites del plan gratis (expo.dev/pricing, nov 2026)
- Hasta **15 builds de Android** (cuenta total, salvo que el panel diga otra cosa), en **cola de baja prioridad**
  (en horas pico puede tardar más de 90 min). Límite de 45 min por build.
- **Actualizaciones ilimitadas** con hasta **1 000 usuarios activos al mes**, 100 GiB de ancho de banda. Sin cargos extra
  en el plan gratis.
- Regla del proyecto: todo gratis. Si Expo cambia estos límites, avisar antes de seguir.

## Una sola vez

Desde la carpeta del proyecto, en la terminal:

1. **Entrar a Expo** (crea la cuenta gratis en expo.dev si no la tienes):
   `npx eas-cli@latest login`
2. **Vincular el proyecto y activar actualizaciones** (escribe `extra.eas.projectId` y `updates.url` en `app.json`):
   `npx eas-cli@latest update:configure`
3. **Subir las variables públicas** (el `.env` no sube a la nube). Son valores `EXPO_PUBLIC_*`, públicos por diseño
   (la protección real de datos es RLS en Supabase). Desde Git Bash:
   ```bash
   while IFS='=' read -r k v; do
     case "$k" in EXPO_PUBLIC_*) npx eas-cli@latest env:set --name "$k" --value "$v" --environment preview --visibility plaintext ;; esac
   done < .env
   ```
   Comprobar: `npx eas-cli@latest env:list --environment preview`
4. **Clave de Google Maps (opcional):** sin ella el APK funciona y muestra la lista en vez del mapa. Si la usas, restríngela
   en Google Cloud al paquete `com.yunta.app` y al SHA-1 de la build.

## Generar el APK y compartirlo

```bash
npx eas-cli@latest build --platform android --profile preview
```

- La primera vez pregunta si generar un **keystore** nuevo: responder **Y** (Expo lo guarda; no lo pierdas de vista, sirve
  para firmar siempre igual).
- Al terminar, el comando imprime un **enlace**. También está en expo.dev → tu proyecto → Builds → **Install** (muestra QR
  y «Enviar enlace»). Ese enlace se manda por WhatsApp.
- Quien lo abra en un Android descarga el APK y acepta «instalar apps de origen desconocido» (aviso normal fuera de Play Store).

## Actualizar sin reinstalar

```bash
npm run check
npx eas-cli@latest update --channel preview --environment preview --message "qué cambió"
```

- Las personas con el APK reciben el cambio **al abrir la app** (a veces al segundo reinicio).
- Un cambio nativo **no** viaja por aquí: hay que repetir el build y subir `runtimeVersion`.
- Para revertir: publicar de nuevo el commit anterior con `eas update`.

## Revisar antes de cada build
- `npm run check` y `npx expo-doctor` en verde.
- `app.json`: `version` y `runtimeVersion` coherentes con lo que cambió.
- Probar el APK en un celular real: SOS sin cuenta, modo avión (cola offline), permisos de ubicación y micrófono.
- Cámaras con `http://` en red local necesitan permitir tráfico sin cifrar en Android (S2b-13, aún pendiente).
