import { Redirect } from 'expo-router';

/** Ruta vieja: Comunidad abre sus eventos y novedades (SPEC-051). */
export default function ComunidadRedirect() {
  return <Redirect href="/eventos" />;
}
