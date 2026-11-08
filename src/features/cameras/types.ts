/** Cámara vecinal: un celular viejo con IP Webcam mirando a un espacio común. Sin grabación. */
export type Camera = {
  id: string;
  sectorId: string;
  name: string;
  /** Zona aproximada en texto («Jr. Pachacútec, cuadra 4»). Nunca coordenadas exactas. */
  placeLabel: string;
  /** `host:puerto` en la red local, o `null` en las cámaras de demostración (sin video real). */
  host: string | null;
  /** Fondo que la financió, si hay uno. */
  fundId: string | null;
  /** `false` si la cámara dejó de responder (se muestra «Sin señal»). */
  active: boolean;
  isDemo: boolean;
  /** `true` si se registró en este teléfono (todavía no se comparte con el servidor). */
  isLocal: boolean;
};
