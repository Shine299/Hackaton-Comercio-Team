import { greetingFor } from './greeting';

describe('greetingFor', () => {
  it('saluda según la hora', () => {
    expect(greetingFor(5).text).toBe('Buenos días');
    expect(greetingFor(11).text).toBe('Buenos días');
    expect(greetingFor(12).text).toBe('Buenas tardes');
    expect(greetingFor(18).text).toBe('Buenas tardes');
    expect(greetingFor(19).text).toBe('Buenas noches');
    expect(greetingFor(0).text).toBe('Buenas noches');
    expect(greetingFor(4).text).toBe('Buenas noches');
  });
});
