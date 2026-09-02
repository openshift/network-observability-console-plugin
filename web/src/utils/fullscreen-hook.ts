import * as React from 'react';

const VMS_TREE_PANEL_ID = 'vms-tree-view-panel';
const VMS_TREE_SEARCH_ID = 'vms-tree-view-search-input';
const VMS_TREE_TOGGLE_SELECTOR = '.vms-tree-view__panel-toggle-button';

const isVmsTreeOpen = (panel: Element, toggle: HTMLButtonElement): boolean => {
  const expanded = toggle.getAttribute('aria-expanded');
  if (expanded === 'true') {
    return true;
  }
  if (expanded === 'false') {
    return false;
  }
  // Fallback when kubevirt has not yet exposed aria-expanded on the toggle:
  // open tree renders the search input and marks the panel resizable.
  return panel.classList.contains('pf-m-resizable') || !!panel.querySelector(`#${VMS_TREE_SEARCH_ID}`);
};

const closeOpenPanels = () => {
  const pageSidebar = document.querySelector('.pf-v5-c-page__sidebar, .pf-v6-c-page__sidebar');
  const sidebarOpen =
    pageSidebar?.classList.contains('pf-m-expanded') || pageSidebar?.getAttribute('aria-hidden') === 'false';
  if (sidebarOpen) {
    document.getElementById('nav-toggle')?.click();
  }

  // Close kubevirt VMs tree drawer when present and open (same idea as nav-toggle)
  const vmsTreePanel = document.getElementById(VMS_TREE_PANEL_ID);
  const vmsTreeToggle = vmsTreePanel?.querySelector<HTMLButtonElement>(VMS_TREE_TOGGLE_SELECTOR);
  if (vmsTreePanel && vmsTreeToggle && isVmsTreeOpen(vmsTreePanel, vmsTreeToggle)) {
    vmsTreeToggle.click();
  }
};

export function useFullScreen(): [boolean, React.Dispatch<React.SetStateAction<boolean>>] {
  const [isFullScreen, setFullScreen] = React.useState(false);

  React.useEffect(() => {
    if (isFullScreen) {
      closeOpenPanels();
    }

    const elements = document.querySelectorAll(
      '#page-main-header, .pf-v5-c-masthead, .pf-v6-c-masthead, #page-sidebar, .pf-v5-c-page__sidebar, .pf-v6-c-page__sidebar'
    );

    elements.forEach(e => {
      if (isFullScreen) {
        e.classList.add('hidden');
      } else {
        e.classList.remove('hidden');
      }
    });
  }, [isFullScreen]);

  return [isFullScreen, setFullScreen];
}
