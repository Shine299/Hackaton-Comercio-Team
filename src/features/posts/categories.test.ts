import { categoriesOfGroup, helpGroupOf } from './categories';

describe('helpGroupOf', () => {
  it('las mascotas van a Animales', () => {
    expect(helpGroupOf('pets')).toBe('animals');
  });

  it('herramientas, servicios, trueque y el resto van a Objetos y favores', () => {
    for (const id of ['tools', 'services', 'products', 'barter', 'mobility', 'care'] as const) {
      expect(helpGroupOf(id)).toBe('objects');
    }
  });
});

describe('categoriesOfGroup', () => {
  it('cada grupo muestra solo sus categorías; «Todo» muestra las de ayuda', () => {
    expect(categoriesOfGroup('animals').map((c) => c.id)).toEqual(['pets']);
    expect(categoriesOfGroup('objects').some((c) => c.id === 'pets')).toBe(false);
    expect(categoriesOfGroup('all').some((c) => c.id === 'business')).toBe(false);
    expect(categoriesOfGroup('all').length).toBe(categoriesOfGroup('objects').length + 1);
  });
});
