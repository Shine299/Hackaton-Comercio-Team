import { Redirect } from 'expo-router';

/** Ruta vieja: «Marketplace» ahora se llama Ayuda y vive en /ayuda (SPEC-051). Se conserva para enlaces y notificaciones ya programadas. */
export default function MarketplaceRedirect() {
  return <Redirect href="/ayuda" />;
}
