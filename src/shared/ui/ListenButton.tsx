import * as Speech from 'expo-speech';
import { useEffect, useState } from 'react';

import { Button } from './Button';

type Props = {
  /** Texto que se leerá en voz alta. */
  text: string;
  label?: string;
};

/**
 * Lee un texto en voz alta con la voz del teléfono (español). Pensado para quien lee con dificultad
 * o tiene las manos ocupadas. Sin conexión también funciona. En iPhone no suena en modo silencio.
 */
export function ListenButton({ text, label = 'Escuchar' }: Props) {
  const [speaking, setSpeaking] = useState(false);

  // Si se sale de la pantalla mientras habla, se corta.
  useEffect(() => () => void Speech.stop(), []);

  const toggle = async () => {
    if (speaking) {
      await Speech.stop();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    Speech.speak(text, {
      language: 'es-PE',
      rate: 0.95,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  return (
    <Button
      label={speaking ? 'Detener lectura' : label}
      variant="tonal"
      icon={speaking ? 'stop-circle-outline' : 'volume-high'}
      onPress={() => void toggle()}
      accessibilityHint="Lee este aviso en voz alta"
    />
  );
}
