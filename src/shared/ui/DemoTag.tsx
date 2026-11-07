import { Badge } from './Badge';

/**
 * Marca explícita para datos ficticios/simulados (regla: «etiquetar claramente los mocks»).
 * Úsala en cualquier tarjeta cuyo contenido no venga de un servicio real.
 */
export function DemoTag({ label = 'DATO DE DEMO' }: { label?: string }) {
  return <Badge label={label} tone="warning" icon="flask-outline" />;
}
