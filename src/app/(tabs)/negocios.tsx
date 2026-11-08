import { Redirect } from 'expo-router';

/** Ruta vieja (SPEC-043): los negocios del barrio están ahora en Explorar. */
export default function NegociosRedirect() {
  return <Redirect href="/explorar" />;
}
