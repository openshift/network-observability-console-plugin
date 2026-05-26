import { act, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { useTheme } from '../theme-hook';

describe('useTheme', () => {
  let unmountHook: (() => void) | undefined;

  afterEach(() => {
    act(() => {
      unmountHook?.();
      unmountHook = undefined;
      document.documentElement.classList.remove('pf-v5-theme-dark', 'pf-v5-theme-dark');
    });
  });

  it('should return false when no dark theme class is present', () => {
    const { result, unmount } = renderHook(() => useTheme());
    unmountHook = unmount;
    expect(result.current).toBe(false);
  });

  it('should return true when pf-v5-theme-dark class is present', () => {
    document.documentElement.classList.add('pf-v5-theme-dark');
    const { result, unmount } = renderHook(() => useTheme());
    unmountHook = unmount;
    expect(result.current).toBe(true);
  });

  it('should react to dark theme being added', async () => {
    const { result, unmount } = renderHook(() => useTheme());
    unmountHook = unmount;
    expect(result.current).toBe(false);

    act(() => {
      document.documentElement.classList.add('pf-v5-theme-dark');
    });

    await waitFor(() => expect(result.current).toBe(true));
  });

  it('should react to dark theme being removed', async () => {
    document.documentElement.classList.add('pf-v5-theme-dark');
    const { result, unmount } = renderHook(() => useTheme());
    unmountHook = unmount;
    expect(result.current).toBe(true);

    act(() => {
      document.documentElement.classList.remove('pf-v5-theme-dark');
    });

    await waitFor(() => expect(result.current).toBe(false));
  });

  it('should disconnect observer on unmount', () => {
    const { unmount } = renderHook(() => useTheme());
    act(() => {
      unmount();
      document.documentElement.classList.add('pf-v5-theme-dark');
    });
  });
});
