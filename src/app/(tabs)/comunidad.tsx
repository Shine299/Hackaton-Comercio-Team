import { Redirect } from 'expo-router';

/** Ruta vieja (SPEC-043): lo de Comunidad vive ahora en el Inicio. */
export default function ComunidadRedirect() {
  return <Redirect href="/" />;
}
