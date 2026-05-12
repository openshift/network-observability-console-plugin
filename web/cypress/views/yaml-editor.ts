export const isLoaded = () => cy.get('.monaco-editor .view-lines').should('exist');
export const clickSaveCreateButton = () => cy.byTestID('save-changes').click();
