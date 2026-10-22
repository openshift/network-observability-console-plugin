export const searchPage = {
  navToSearchPage: () => cy.visit('/search/all-namespaces'),
  chooseResourceType: (resourceType: string) => {
    cy.get('input[placeholder="Resources"]').clear().type(`${resourceType}`);
    cy.get(`label[id$="~${resourceType}"]`).click();
  },
  clearAllFilters: () => {
    cy.byButtonText('Clear all filters').click({force: true});
  },
}
