import type { EmergencyNumber, EmergencyNumbersConfig } from '@/features/emergency';

import type { Need } from './phrases';

/** Textos y utilidades puras del despacho (SPEC-052): número, mensaje, enlace de mapa, SMS y aviso hablado. */

export type Coords = { latitude: number; longitude: number };

const NUMBER_ID: Record<Need, string> = { ambulance: 'ambulance', fire: 'firefighters', police: 'police' };

/** Número del servicio desde la configuración por territorio. Si falta, `null`: nunca se inventa un número. */
export function numberForNeed(need: Need, config: EmergencyNumbersConfig): EmergencyNumber | null {
  return config.entries.find((entry) => entry.id === NUMBER_ID[need]) ?? null;
}

const keepDialable = (value: string) => value.replace(/[^\d+]/g, '');

export const telUrl = (number: string) => `tel:${keepDialable(number)}`;

export const mapsLink = (latitude: number, longitude: number) => `https://maps.google.com/?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`;

const WRITTEN_HEAD: Record<Need, string> = {
  ambulance: 'Necesito ayuda médica',
  fire: 'Necesito ayuda: hay un incendio',
  police: 'Necesito ayuda de la policía',
};

const SPOKEN_HEAD: Record<Need, string> = {
  ambulance: 'Necesito ayuda médica',
  fire: 'Necesito ayuda, hay un incendio',
  police: 'Necesito ayuda de la policía',
};

/** Mensaje para el contacto de confianza. Con ubicación exacta lleva el enlace; sin ella, solo el sector. */
export function helpMessage({
  need,
  sectorName,
  coords,
  name,
}: {
  need: Need;
  sectorName: string;
  coords: Coords | null;
  name?: string;
}): string {
  const parts = [`${WRITTEN_HEAD[need]}.`];
  if (name?.trim()) parts.push(`Soy ${name.trim()}.`);
  parts.push(
    coords
      ? `Ubicación: ${mapsLink(coords.latitude, coords.longitude)}`
      : `Estoy en el sector ${sectorName}. No pude obtener mi ubicación exacta.`,
  );
  parts.push('Mensaje automático de Yunta.');
  return parts.join('\n');
}

/** Enlace para abrir el SMS ya escrito. Android usa «?body=» e iOS «&body=». */
export function smsUrl(phone: string, body: string, platform: 'android' | 'ios'): string {
  return `sms:${keepDialable(phone)}${platform === 'ios' ? '&' : '?'}body=${encodeURIComponent(body)}`;
}

/** Lo que dice el teléfono en voz alta para que lo oiga quien esté cerca. */
export function spokenAlert({ need, number, sectorName }: { need: Need; number: string; sectorName: string }): string {
  return `${SPOKEN_HEAD[need]} en ${sectorName}. Por favor, llamen al ${number}.`;
}
