export const listPage = {
  rows: {
    clickKebabAction: (resourceName: string, actionName: string) => {
      cy.get('[data-test-rows="resource-row"]')
        .contains(resourceName)
        .parents('tr')
        .within(() => {
          cy.byLegacyTestID('kebab-button').click();
        });
      cy.byTestActionID(actionName).click();
    },
  },
};
