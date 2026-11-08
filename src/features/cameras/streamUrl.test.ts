import { parseCameraAddress, snapshotUrl } from './streamUrl';

describe('parseCameraAddress', () => {
  it('acepta la dirección que muestra IP Webcam', () => {
    expect(parseCameraAddress('http://192.168.1.20:8080')).toBe('192.168.1.20:8080');
    expect(parseCameraAddress('  http://192.168.1.20:8080/  ')).toBe('192.168.1.20:8080');
  });

  it('agrega el puerto 8080 si falta', () => {
    expect(parseCameraAddress('192.168.43.5')).toBe('192.168.43.5:8080');
  });

  it('acepta las redes privadas del hotspot o el Wi-Fi de casa', () => {
    expect(parseCameraAddress('10.0.0.7:8080')).toBe('10.0.0.7:8080');
    expect(parseCameraAddress('172.20.10.2:8080')).toBe('172.20.10.2:8080');
  });

  it('rechaza direcciones públicas, nombres y textos inválidos', () => {
    expect(parseCameraAddress('8.8.8.8:8080')).toBeNull();
    expect(parseCameraAddress('172.32.0.1')).toBeNull();
    expect(parseCameraAddress('camara.com')).toBeNull();
    expect(parseCameraAddress('192.168.1.300')).toBeNull();
    expect(parseCameraAddress('192.168.1.20:99999')).toBeNull();
    expect(parseCameraAddress('')).toBeNull();
  });
});

describe('snapshotUrl', () => {
  it('pide una foto nueva cada vez (sin caché)', () => {
    expect(snapshotUrl('192.168.1.20:8080', 42)).toBe('http://192.168.1.20:8080/shot.jpg?t=42');
  });
});
