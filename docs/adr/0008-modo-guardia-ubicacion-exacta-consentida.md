# ADR 0008 — Modo guardia por voz: ubicación exacta consentida y llamada por marcador

- **Estado:** propuesta
- **Fecha:** 2026-11-08
- **Relacionada con:** SPEC-052, SPEC-050 (voz), `docs/03_accesibilidad_emergencias/requisitos_inclusion_y_crisis.md`

## Contexto
Una persona mayor que se cae y no alcanza el teléfono necesita pedir ayuda con la voz. Hoy la regla del proyecto es
«ubicación siempre aproximada (sector), nunca exacta», y la app solo abre el marcador con `tel:`. Expo Go no permite
escuchar en segundo plano ni llamar sin que alguien toque «Llamar», y la voz a texto gratuita tiene cupo.

## Decisión
1. **Excepción acotada a la ubicación:** en una emergencia **confirmada** (por voz, por silencio o por botón) la app obtiene
   la ubicación exacta **una sola vez**, solo para el marcador/contacto de confianza. **No se guarda, no se publica en el
   tablero y no entra a la cola.** Lo público sigue siendo el sector. Es coherente con los requisitos: la ubicación precisa
   se restringe a quien auxilia, por necesidad.
2. **Escucha en toda la app, pero solo con la app a la vista** (Modo guardia: botón en el Inicio, `GuardProvider` en el diseño raíz,
   pantalla encendida con `expo-keep-awake`). Con la app en segundo plano o el teléfono bloqueado se pausa. Indicador visible en la
   cabecera y botón «Apagar». Se aparta cuando otra función graba (`shared/nav/micStore`). Sin servicios en segundo plano.
3. **La llamada abre el marcador ya marcado** (`Linking.openURL('tel:…')`); alguien debe tocar «Llamar». La app repite el aviso
   en voz alta (TTS gratuito) para que lo oiga quien esté cerca. Los números salen de `EMERGENCY_NUMBERS`.
4. **Voz a texto por servidor gratuito (Groq Whisper)**, con una función propia `guardia` y su propio contador de uso, y
   **solo se sube audio con sonido** (umbral de volumen) y con tope por sesión, para no agotar el cupo del asistente.
5. **El silencio confirma:** si no hay respuesta en 10 s se pide ayuda, porque la persona puede estar inconsciente. El
   riesgo de falsos avisos se baja exigiendo «Yunta» **y** una palabra de ayuda, y con la cuenta regresiva cancelable.
6. La emergencia **no pasa por la IA**: solo transcripción y reglas de palabras.

## Consecuencias
- Funciona en Expo Go, pero no sustituye a una alarma personal: depende de que el celular esté abierto y cerca.
- Se envían a un tercero (Groq) clips cortos con sonido; hay que decirlo en el consentimiento.
- **Fase 2** (no incluida): development build + reconocimiento **en el teléfono** (sin subir audio ni cuota), escucha en
  segundo plano en Android, llamada directa con `CALL_PHONE` (no existe en iOS) y detección de caídas con acelerómetro.
- Habrá que revisar con quien despliegue los topes del contador y las políticas de Google Play si se agrega llamada directa.
