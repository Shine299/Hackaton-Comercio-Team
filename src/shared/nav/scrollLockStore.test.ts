import { useScrollLockStore } from './scrollLockStore';

describe('scrollLockStore', () => {
  beforeEach(() => useScrollLockStore.setState({ locked: false }));

  it('empieza desbloqueado', () => {
    expect(useScrollLockStore.getState().locked).toBe(false);
  });

  it('lock y unlock cambian el estado', () => {
    useScrollLockStore.getState().lock();
    expect(useScrollLockStore.getState().locked).toBe(true);
    useScrollLockStore.getState().unlock();
    expect(useScrollLockStore.getState().locked).toBe(false);
  });

  it('repetir lock no cambia la referencia del estado (sin renders de más)', () => {
    useScrollLockStore.getState().lock();
    const before = useScrollLockStore.getState();
    useScrollLockStore.getState().lock();
    expect(useScrollLockStore.getState()).toBe(before);
  });
});
