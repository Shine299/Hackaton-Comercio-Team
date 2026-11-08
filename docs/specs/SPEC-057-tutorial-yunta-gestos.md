# SPEC-057 — Tutorial con Yunta (gestos) y letra grande

- **Estado:** borrador
- **Dueño / revisor:** Shay / …
- **Sprint:** …

## Qué y por qué
El onboarding y el recorrido guiado usan solo íconos, textos funcionales y letra pequeña. Queremos que Yunta
acompañe cada paso con un gesto que refuerce su objetivo, con textos cálidos (como un buen amigo que te ayuda) y
letra más grande para personas mayores.

## Criterios de aceptación

1. **Dado** que abro el onboarding **cuando** veo cualquiera de sus pasos **entonces** aparece Yunta con la pose
   del paso (saludando, curiosa, señalando, protegiendo, etc.) y una descripción accesible.
2. **Dado** que abro el recorrido guiado **cuando** se muestra el globo de un paso **entonces** Yunta aparece al
   lado con la pose de ese paso.
3. **Dado** cualquier paso del onboarding **cuando** se lee el título y el cuerpo **entonces** el título mide al
   menos 28 dp y el cuerpo al menos 20 dp (en el recorrido: 20 y 18 dp).
4. **Dado** el Modo Fácil o la letra del sistema al máximo **cuando** recorro los pasos **entonces** nada se corta
   y los botones siguen siendo ≥ 48 dp (64 dp en Modo Fácil).
5. **Dado** una pose cuyo archivo falte **cuando** se muestra **entonces** se usa la pose `wave` y no falla.
6. **Dado** el paso de modo avión **cuando** leo el texto **entonces** «guardado en el teléfono» nunca se
   presenta como «recibido».

## Alcance
- **Toca:** `src/features/onboarding`, `src/features/tour`, `src/shared/ui` (`YuntaMascot`, `yuntaPoses`,
  `Text`), `src/global.css`, `assets/images/yunta/`.
- **No debe cambiar:** variantes de texto existentes (otras pantallas); lógica de store del onboarding; SOS.
- **Reglas de arquitectura:** import solo por `index.ts`, `shared/` no importa de `features/`
  (`npm run arch:check`).

## Pruebas
- Automáticas: `src/shared/ui/yuntaPoses.test.ts` (toda pose tiene asset; fallback), `src/features/tour/steps.test.ts`
  y nuevo `src/features/onboarding/steps.test.ts` (cada paso referencia una pose válida; textos no vacíos).
- Manuales (Expo Go, celular): cada paso muestra su pose; Modo Fácil; letra del sistema al máximo; deslizar y
  botones; tour sobre la app real.

## Notas de accesibilidad y privacidad
Cada imagen de Yunta lleva `accessibilityLabel`. El estado nunca depende solo del color. Ubicación siempre
aproximada. Yunta no reemplaza a los servicios oficiales de emergencia (se mantiene el aviso).
