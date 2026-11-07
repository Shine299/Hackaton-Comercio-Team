import { useCallback, useRef, useState, type ReactNode } from 'react';

import { RegistrationSheet } from './RegistrationSheet';
import { useSessionStore } from './store';

/**
 * Pide registro simulado solo cuando la acción lo exige (publicar, contactar, guardar, reportar).
 * Explorar sigue siendo libre.
 */
export function useRegistrationGate(): {
  registered: boolean;
  requireRegistration: (reason: string, onRegistered: () => void) => void;
  sheet: ReactNode;
} {
  const registered = useSessionStore((s) => s.registered);
  const [visible, setVisible] = useState(false);
  const [reason, setReason] = useState('');
  const pending = useRef<(() => void) | null>(null);

  const requireRegistration = useCallback((why: string, onOk: () => void) => {
    if (useSessionStore.getState().registered) {
      onOk();
      return;
    }
    setReason(why);
    pending.current = onOk;
    setVisible(true);
  }, []);

  const sheet = (
    <RegistrationSheet
      visible={visible}
      reason={reason}
      onClose={() => {
        setVisible(false);
        pending.current = null;
      }}
      onRegistered={() => {
        setVisible(false);
        const next = pending.current;
        pending.current = null;
        next?.();
      }}
    />
  );

  return { registered, requireRegistration, sheet };
}
