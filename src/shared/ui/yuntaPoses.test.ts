import { isYuntaPose, resolvePose, YUNTA_POSE_LABELS, YUNTA_POSES } from './yuntaPoses';

describe('yuntaPoses', () => {
  it('cada pose tiene una descripción accesible en español', () => {
    for (const pose of YUNTA_POSES) expect(YUNTA_POSE_LABELS[pose].length).toBeGreaterThan(5);
  });

  it('una pose desconocida cae en «wave» y no falla', () => {
    expect(resolvePose('no-existe')).toBe('wave');
    expect(resolvePose(undefined)).toBe('wave');
    expect(resolvePose('shield')).toBe('shield');
  });

  it('isYuntaPose distingue poses válidas', () => {
    expect(isYuntaPose('point')).toBe(true);
    expect(isYuntaPose('otra')).toBe(false);
  });
});
