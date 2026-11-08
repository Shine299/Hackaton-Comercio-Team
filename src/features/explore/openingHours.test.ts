import { openStateAt, todayHoursLabel } from './openingHours';

// SPEC-047 / D3: «Abierto ahora» solo si el horario de OSM se entiende. Fechas locales de noviembre 2026:
// lunes 9, martes 10, sábado 14, domingo 15.
const at = (day: number, hour: number, minute = 0) => new Date(2026, 10, day, hour, minute);
const MON = 9;
const TUE = 10;
const SAT = 14;
const SUN = 15;

describe('openStateAt', () => {
  it('sin horario o vacío: no se sabe', () => {
    expect(openStateAt(undefined, at(TUE, 10))).toBe('unknown');
    expect(openStateAt('  ', at(TUE, 10))).toBe('unknown');
  });

  it('24/7 siempre abierto; «off» siempre cerrado', () => {
    expect(openStateAt('24/7', at(SUN, 3))).toBe('open');
    expect(openStateAt('off', at(TUE, 10))).toBe('closed');
  });

  it('todos los días con un tramo', () => {
    expect(openStateAt('Mo-Su 08:00-22:00', at(TUE, 8))).toBe('open');
    expect(openStateAt('Mo-Su 08:00-22:00', at(TUE, 21, 59))).toBe('open');
    expect(openStateAt('Mo-Su 08:00-22:00', at(TUE, 22))).toBe('closed');
    expect(openStateAt('Mo-Su 08:00-22:00', at(TUE, 7, 59))).toBe('closed');
  });

  it('semana y sábado distintos; domingo cerrado', () => {
    const spec = 'Mo-Fr 08:00-17:30; Sa 09:00-13:00';
    expect(openStateAt(spec, at(TUE, 10))).toBe('open');
    expect(openStateAt(spec, at(SAT, 12))).toBe('open');
    expect(openStateAt(spec, at(SAT, 14))).toBe('closed');
    expect(openStateAt(spec, at(SUN, 10))).toBe('closed');
  });

  it('varios tramos en el día, con o sin espacio', () => {
    const spec = 'Tu-Sa 13:00-15:30, 19:30-23:00; Su 13:00-16:00';
    expect(openStateAt(spec, at(TUE, 14))).toBe('open');
    expect(openStateAt(spec, at(TUE, 17))).toBe('closed');
    expect(openStateAt(spec, at(TUE, 20))).toBe('open');
    expect(openStateAt(spec, at(MON, 14))).toBe('closed');
  });

  it('listas de días y «Mo off»', () => {
    expect(openStateAt('Mo-Fr 07:00-16:00; Sa,Su 08:00-12:00', at(SUN, 9))).toBe('open');
    expect(openStateAt('Mo off; Tu-Sa 08:00-22:00; Su 12:00-20:00', at(MON, 10))).toBe('closed');
  });

  it('una regla posterior reemplaza a la anterior para sus días', () => {
    expect(openStateAt('Mo-Su 08:00-22:00; Su off', at(SUN, 10))).toBe('closed');
    expect(openStateAt('Mo-Su 08:00-22:00; Su off', at(SAT, 10))).toBe('open');
  });

  it('rangos que dan la vuelta a la semana', () => {
    expect(openStateAt('Sa-Mo 10:00-14:00', at(SUN, 11))).toBe('open');
    expect(openStateAt('Sa-Mo 10:00-14:00', at(TUE, 11))).toBe('closed');
  });

  it('tramos que pasan la medianoche siguen abiertos de madrugada', () => {
    expect(openStateAt('Fr-Sa 18:00-02:00', at(SAT, 1))).toBe('open'); // viene del viernes
    expect(openStateAt('Fr-Sa 18:00-02:00', at(SUN, 1))).toBe('open'); // viene del sábado
    expect(openStateAt('Fr-Sa 18:00-02:00', at(MON, 1))).toBe('closed');
    expect(openStateAt('Mo-Su 12:00-24:00', at(TUE, 23, 30))).toBe('open');
  });

  it('acepta horas de un dígito y espacios alrededor del guion (formatos reales del barrio)', () => {
    expect(openStateAt('Mo-Su 8:00-20:30', at(TUE, 9))).toBe('open');
    expect(openStateAt('Tu-Su 12:30 - 17:00', at(TUE, 13))).toBe('open');
    expect(openStateAt('Mo 12:30-22:30; Tu-Su 9:00-22:30;', at(MON, 10))).toBe('closed');
  });

  it('horas sin días valen para todos los días', () => {
    expect(openStateAt('09:00-18:00', at(SUN, 10))).toBe('open');
  });

  it('lo que no entiende (feriados, meses, «+», texto) es «no se sabe», nunca «abierto»', () => {
    for (const spec of ['Mo-Fr 08:00-18:00; PH off', 'Jan-Mar Mo-Fr 08:00-12:00', 'Mo-Fr 08:00+', 'sunrise-sunset', 'abierto todo el día', 'Mo-Fr 8-18']) {
      expect(openStateAt(spec, at(TUE, 10))).toBe('unknown');
    }
  });
});

describe('todayHoursLabel', () => {
  it('dice el horario de hoy, o que hoy cierra', () => {
    expect(todayHoursLabel('Mo-Fr 08:00-17:30; Sa 09:00-13:00', at(TUE, 10))).toBe('Hoy 8:00–17:30');
    expect(todayHoursLabel('Mo-Fr 08:00-17:30; Sa 09:00-13:00', at(SUN, 10))).toBe('Hoy cerrado');
    expect(todayHoursLabel('Tu-Sa 13:00-15:30, 19:30-23:00', at(TUE, 10))).toBe('Hoy 13:00–15:30 y 19:30–23:00');
    expect(todayHoursLabel('24/7', at(TUE, 10))).toBe('Abierto las 24 horas');
  });

  it('sin horario entendible no dice nada', () => {
    expect(todayHoursLabel(undefined, at(TUE, 10))).toBeUndefined();
    expect(todayHoursLabel('Mo-Fr 08:00-18:00; PH off', at(TUE, 10))).toBeUndefined();
  });
});
