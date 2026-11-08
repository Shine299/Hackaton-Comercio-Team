import type { EmergencyNumbersConfig } from '@/features/emergency';

import { helpMessage, mapsLink, numberForNeed, smsUrl, spokenAlert, telUrl } from './dispatch';

const NUMBERS: EmergencyNumbersConfig = {
  territory: 'Prueba',
  reviewedAt: '2026-11-07',
  entries: [
    { id: 'police', label: 'Policía', number: '105' },
    { id: 'firefighters', label: 'Bomberos', number: '116' },
    { id: 'ambulance', label: 'Ambulancia (SAMU)', number: '106' },
  ],
};

describe('numberForNeed', () => {
  it('elige el número según el servicio, desde la configuración', () => {
    expect(numberForNeed('ambulance', NUMBERS)).toMatchObject({ number: '106', label: 'Ambulancia (SAMU)' });
    expect(numberForNeed('fire', NUMBERS)).toMatchObject({ number: '116' });
    expect(numberForNeed('police', NUMBERS)).toMatchObject({ number: '105' });
  });

  it('si falta la entrada, no inventa un número', () => {
    expect(numberForNeed('fire', { ...NUMBERS, entries: [] })).toBeNull();
  });
});

describe('telUrl', () => {
  it('deja solo dígitos y +', () => {
    expect(telUrl('106')).toBe('tel:106');
    expect(telUrl(' +51 (1) 106 ')).toBe('tel:+511106');
  });
});

describe('mapsLink', () => {
  it('arma el enlace con 6 decimales', () => {
    expect(mapsLink(-12.0464, -77.0428)).toBe('https://maps.google.com/?q=-12.046400,-77.042800');
  });
});

describe('helpMessage', () => {
  it('con ubicación incluye el enlace y el servicio', () => {
    const text = helpMessage({ need: 'ambulance', sectorName: 'Miraflores', coords: { latitude: -12.12, longitude: -77.03 } });
    expect(text).toContain('Necesito ayuda médica');
    expect(text).toContain('https://maps.google.com/?q=-12.120000,-77.030000');
    expect(text).toContain('Yunta');
  });

  it('sin ubicación dice el sector y que no hubo ubicación exacta', () => {
    const text = helpMessage({ need: 'fire', sectorName: 'Miraflores', coords: null });
    expect(text).toContain('incendio');
    expect(text).toContain('Miraflores');
    expect(text).toContain('No pude obtener mi ubicación exacta');
    expect(text).not.toContain('maps.google.com');
  });

  it('incluye el nombre si se conoce', () => {
    expect(helpMessage({ need: 'police', sectorName: 'Lince', coords: null, name: 'Rosa' })).toContain('Soy Rosa');
  });
});

describe('smsUrl', () => {
  it('Android usa «?body=» e iOS usa «&body=», con el texto codificado', () => {
    expect(smsUrl('999 111 222', 'Hola ¿qué tal?', 'android')).toBe('sms:999111222?body=Hola%20%C2%BFqu%C3%A9%20tal%3F');
    expect(smsUrl('999111222', 'Hola', 'ios')).toBe('sms:999111222&body=Hola');
  });
});

describe('spokenAlert', () => {
  it('dice qué pasa y a qué número llamar', () => {
    expect(spokenAlert({ need: 'ambulance', number: '106', sectorName: 'Miraflores' })).toBe(
      'Necesito ayuda médica en Miraflores. Por favor, llamen al 106.',
    );
    expect(spokenAlert({ need: 'fire', number: '116', sectorName: 'Lince' })).toContain('incendio');
  });
});
