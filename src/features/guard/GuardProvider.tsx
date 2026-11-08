import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Modal } from 'react-native';

import { GuardAlert } from './GuardAlert';
import { GuardContext } from './guardContext';
import { useGuardMode } from './useGuardMode';

/** «Hola Yunta» (sin pedir ayuda) abre la conversación por voz del asistente (SPEC-053). `t` distingue cada pedido. */
const openConversation = () => router.navigate({ pathname: '/conversacion', params: { t: String(Date.now()) } });

/**
 * Pone el Modo guardia a escuchar en TODA la app (SPEC-052), no solo en su pantalla. Va en el diseño raíz.
 * Cuando oye una petición de ayuda, la pregunta y el pedido se ven sobre la pantalla que esté abierta; cuando oye
 * «Hola Yunta», abre la conversación con el asistente.
 */
export function GuardProvider({ children }: { children: ReactNode }) {
  const guard = useGuardMode({ onWake: openConversation });
  const alerting = guard.state.phase === 'confirming' || guard.state.phase === 'dispatching';

  return (
    <GuardContext.Provider value={guard}>
      {children}
      {/* Atrás no cierra la alerta: hay botones claros para cancelar («Estoy bien») o seguir pidiendo ayuda. */}
      <Modal visible={alerting} animationType="fade" statusBarTranslucent onRequestClose={() => undefined}>
        <GuardAlert />
      </Modal>
    </GuardContext.Provider>
  );
}
