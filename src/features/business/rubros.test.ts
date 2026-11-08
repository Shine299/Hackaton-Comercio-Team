import { createDemoPosts } from '@/features/posts/demoPosts';

import { hasDelivery, rubroOf } from './rubros';

const posts = createDemoPosts(Date.UTC(2026, 10, 8, 12));
const byId = (id: string) => posts.find((p) => p.id === id)!;

describe('rubroOf', () => {
  it('lee el rubro declarado en los detalles', () => {
    expect(rubroOf(byId('demo-b2')).id).toBe('comida');
    expect(rubroOf(byId('demo-b3')).id).toBe('costura');
  });

  it('sin rubro declarado cae en «Otro»', () => {
    expect(rubroOf({ ...byId('demo-b1'), details: [] }).id).toBe('otro');
  });
});

describe('hasDelivery', () => {
  it('detecta delivery en la forma de entrega', () => {
    expect(hasDelivery(byId('demo-b1'))).toBe(true);
    expect(hasDelivery(byId('demo-b3'))).toBe(false);
  });
});
