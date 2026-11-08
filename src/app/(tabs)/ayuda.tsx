import { Redirect } from 'expo-router';

/** Ruta vieja: Ayuda ahora se llama Marketplace y vive en /marketplace (SPEC-051). Se conserva para enlaces y notificaciones ya programadas. */
export default function AyudaRedirect() {
  return <Redirect href="/marketplace" />;
}
