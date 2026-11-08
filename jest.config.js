/** Pruebas de lógica pura (sin pantallas). Las pantallas se verifican a mano en Expo Go. */
module.exports = {
  preset: 'jest-expo',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
};
