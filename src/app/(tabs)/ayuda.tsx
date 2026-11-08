import { Redirect } from 'expo-router';

/** Ruta vieja (SPEC-043): Ayuda ahora es Marketplace. Se conserva para enlaces y notificaciones ya programadas. */
export default function AyudaRedirect() {
  return <Redirect href="/marketplace" />;
}
