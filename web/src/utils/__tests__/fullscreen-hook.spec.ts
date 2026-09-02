import { act, renderHook } from '@testing-library/react-hooks';
import { useFullScreen } from '../fullscreen-hook';

describe('useFullScreen', () => {
  let header: HTMLElement;
  let sidebar: HTMLElement;
  let masthead: HTMLElement;

  beforeEach(() => {
    header = document.createElement('div');
    header.id = 'page-main-header';
    document.body.appendChild(header);

    sidebar = document.createElement('div');
    sidebar.id = 'page-sidebar';
    document.body.appendChild(sidebar);

    masthead = document.createElement('div');
    masthead.classList.add('pf-v5-c-masthead');
    document.body.appendChild(masthead);
  });

  afterEach(() => {
    header.remove();
    sidebar.remove();
    masthead.remove();
  });

  it('should start not fullscreen', () => {
    const { result } = renderHook(() => useFullScreen());
    const [isFullScreen] = result.current;
    expect(isFullScreen).toBe(false);
  });

  it('should toggle fullscreen and add hidden class to chrome elements', () => {
    const { result } = renderHook(() => useFullScreen());

    act(() => {
      const setFullScreen = result.current[1];
      setFullScreen(true);
    });

    expect(result.current[0]).toBe(true);
    expect(header.classList.contains('hidden')).toBe(true);
    expect(sidebar.classList.contains('hidden')).toBe(true);
    expect(masthead.classList.contains('hidden')).toBe(true);
  });

  it('should remove hidden class when exiting fullscreen', () => {
    const { result } = renderHook(() => useFullScreen());

    act(() => result.current[1](true));
    expect(header.classList.contains('hidden')).toBe(true);

    act(() => result.current[1](false));
    expect(header.classList.contains('hidden')).toBe(false);
    expect(sidebar.classList.contains('hidden')).toBe(false);
    expect(masthead.classList.contains('hidden')).toBe(false);
  });

  it('should click nav-toggle when sidebar is expanded', () => {
    const navToggle = document.createElement('button');
    navToggle.id = 'nav-toggle';
    const clickSpy = jest.spyOn(navToggle, 'click');
    document.body.appendChild(navToggle);

    sidebar.classList.add('pf-v5-c-page__sidebar', 'pf-m-expanded');

    const { result } = renderHook(() => useFullScreen());

    act(() => result.current[1](true));
    expect(clickSpy).toHaveBeenCalled();

    navToggle.remove();
  });

  it('should not click nav-toggle when page sidebar is closed (aria-hidden=true)', () => {
    const navToggle = document.createElement('button');
    navToggle.id = 'nav-toggle';
    const clickSpy = jest.spyOn(navToggle, 'click');
    document.body.appendChild(navToggle);

    sidebar.classList.add('pf-v6-c-page__sidebar');
    sidebar.setAttribute('aria-hidden', 'true');

    const { result } = renderHook(() => useFullScreen());

    act(() => result.current[1](true));
    expect(clickSpy).not.toHaveBeenCalled();

    navToggle.remove();
  });

  it('should click VMs tree toggle when panel is open (aria-expanded=true)', () => {
    const panel = document.createElement('div');
    panel.id = 'vms-tree-view-panel';
    const toggle = document.createElement('button');
    toggle.className = 'vms-tree-view__panel-toggle-button';
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Fermer le panneau arborescence');
    const clickSpy = jest.spyOn(toggle, 'click');
    panel.appendChild(toggle);
    document.body.appendChild(panel);

    const { result } = renderHook(() => useFullScreen());

    act(() => result.current[1](true));
    expect(clickSpy).toHaveBeenCalled();

    panel.remove();
  });

  it('should not click VMs tree toggle when panel is closed (aria-expanded=false)', () => {
    const panel = document.createElement('div');
    panel.id = 'vms-tree-view-panel';
    const toggle = document.createElement('button');
    toggle.className = 'vms-tree-view__panel-toggle-button';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Close tree view panel');
    const clickSpy = jest.spyOn(toggle, 'click');
    panel.appendChild(toggle);
    document.body.appendChild(panel);

    const { result } = renderHook(() => useFullScreen());

    act(() => result.current[1](true));
    expect(clickSpy).not.toHaveBeenCalled();

    panel.remove();
  });

  it('should click VMs tree toggle when open without aria-expanded (search input present)', () => {
    const panel = document.createElement('div');
    panel.id = 'vms-tree-view-panel';
    const toggle = document.createElement('button');
    toggle.className = 'vms-tree-view__panel-toggle-button';
    const search = document.createElement('input');
    search.id = 'vms-tree-view-search-input';
    const clickSpy = jest.spyOn(toggle, 'click');
    panel.appendChild(toggle);
    panel.appendChild(search);
    document.body.appendChild(panel);

    const { result } = renderHook(() => useFullScreen());

    act(() => result.current[1](true));
    expect(clickSpy).toHaveBeenCalled();

    panel.remove();
  });

  it('should click VMs tree toggle when open without aria-expanded (pf-m-resizable)', () => {
    const panel = document.createElement('div');
    panel.id = 'vms-tree-view-panel';
    panel.classList.add('pf-m-resizable');
    const toggle = document.createElement('button');
    toggle.className = 'vms-tree-view__panel-toggle-button';
    const clickSpy = jest.spyOn(toggle, 'click');
    panel.appendChild(toggle);
    document.body.appendChild(panel);

    const { result } = renderHook(() => useFullScreen());

    act(() => result.current[1](true));
    expect(clickSpy).toHaveBeenCalled();

    panel.remove();
  });

  it('should not click VMs tree toggle when closed without aria-expanded', () => {
    const panel = document.createElement('div');
    panel.id = 'vms-tree-view-panel';
    const toggle = document.createElement('button');
    toggle.className = 'vms-tree-view__panel-toggle-button';
    const clickSpy = jest.spyOn(toggle, 'click');
    panel.appendChild(toggle);
    document.body.appendChild(panel);

    const { result } = renderHook(() => useFullScreen());

    act(() => result.current[1](true));
    expect(clickSpy).not.toHaveBeenCalled();

    panel.remove();
  });
});
