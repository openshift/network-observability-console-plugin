export namespace networkHealthSelectors {
    export const global = '[id^="pf-tab-global"]'
    export const node = '[id^="pf-tab-per-node"]'
    export const namespace = '[id^="pf-tab-per-namespace"]'
    export const workload = '[id^="pf-tab-per-owner"]'
    export const nodeCard = '[id^=health-card-ip]'
    export const sidePanel = '.health-gallery-drawer-content'
}


export const networkHealth = {
    clickOnAlert: (name: string) => {
        // pick the first from the list
        cy.get(`label[for^="health-card-selectable-${name}"]`).eq(0).should('be.visible').click()
    },
    verifyAlert: (name: string, mode: string = "alert", alertText?: string) => {
        // click force since node cards are covered
        cy.get(`label[for^="health-card-selectable-${name}"]`).eq(0).should('be.visible').click({ force: true }).then(() => {
            cy.get(networkHealthSelectors.sidePanel).should('be.visible')
            cy.contains(mode).should('exist')
            if (alertText) {
                cy.contains(alertText).should('exist')

            }
            cy.get(`label[for^="health-card-selectable-${name}"]`).eq(0).click()
            cy.get(networkHealthSelectors.sidePanel).should('not.exist')
        })
    },
    navigateToAlertPage: (name: string) => {
        networkHealth.clickOnAlert(name)
        cy.get(networkHealthSelectors.sidePanel).should('be.visible').then(() => {
            cy.get('div.rule-details-row').first().find('button').click().then(() => {
                // verify Runbooks
                cy.contains('View runbook').should('have.attr', 'href').and('include', 'https');
                cy.contains('Inspect alert').click().then(() => {
                    cy.byTestID('empty-box').should('not.exist')
                })
            })
        })
    },
    navigateToNetflowTrafficPage: (name: string) => {
        networkHealth.clickOnAlert(name)
        cy.get(networkHealthSelectors.sidePanel).should('be.visible').then(() => {
            cy.get('div.rule-details-row').first().find('button').click().then(() => {
                cy.contains('Inspect network traffic').click().then(() => {

                })
            })
        })
    }
}
