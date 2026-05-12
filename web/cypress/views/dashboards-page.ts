export const dashboard = {
    visit: () => {
        cy.visit('/monitoring/dashboards')
        cy.byTestID('dashboard-dropdown', { timeout: 120000 }).should('exist').click()
    },
    visitDashboard: (dashboardName: string) => {
        cy.visit(`/monitoring/dashboards/${dashboardName}`)

        // Handle different DOM structures between PF5 (OCP 4.18) and PF6 (OCP 4.19+)
        // PF5: label and button are in the same parent div
        // PF6: label is in one div, button is in the first sibling div
        cy.contains('label', 'Refresh interval').parent().then($parent => {
            if (Cypress.$($parent).find('button').length > 0) {
                // PF5: button is in the same parent
                cy.wrap($parent).within(() => cy.get('button').click())
            } else {
                // PF6: button is in the first sibling
                cy.wrap($parent).siblings().first().find('button').click()
            }
        })
        cy.contains('15 seconds').should('exist').click()

        cy.contains('label', 'Time range').parent().then($parent => {
            if (Cypress.$($parent).find('button').length > 0) {
                // PF5: button is in the same parent
                cy.wrap($parent).within(() => cy.get('button').click())
            } else {
                // PF6: button is in the first sibling
                cy.wrap($parent).siblings().first().find('button').click()
            }
        })
        cy.contains('Last 5 minutes').should('exist').click()

        // to load all the graphs on the dashboard
        cy.wait(1000)
        cy.get('#content-scrollable').scrollTo('bottom')
        cy.wait(1000)
    }
}

export namespace dashboardSelectors {
    export const flowStatsToggle = '[data-test-id=panel-flowlogs-pipeline-statistics] button:first'
    export const ebpfStatsToggle = '[data-test-id=panel-e-bpf-agent-statistics] button:first'
    export const operatorStatsToggle = '[data-test-id=panel-operator-statistics] button:first'
    export const resourceStatsToggle = '[data-test-id=panel-resource-usage] button:first'
    export const top10PerRouteToggle = '[data-test-id=panel-top-10-per-route] button:first'
    export const top10PerNamespaceToggle = '[data-test-id=panel-top-10-per-namespace] button:first'
    export const top10PerShardToggle = '[data-test-id=panel-top-10-per-shard] button:first'
}

export const graphSelector = {
    graphBody: '[role="region"]'
}

Cypress.Commands.add('checkDashboards', (names) => {
    for (let i = 0; i < names.length; i++) {
        // Wait for panel to exist
        cy.byTestID(names[i], { timeout: 120000 }).should('exist').first().then($panel => {
            // Scroll panel into view to ensure it loads
            cy.wrap($panel).scrollIntoView()
        })

        // Add wait to allow metrics to populate
        cy.wait(2000)

        // Check that graph body doesn't have empty state - use a custom retry mechanism
        cy.byTestID(names[i], { timeout: 120000 }).first().within(() => {
            cy.get(graphSelector.graphBody, { timeout: 120000 }).should($body => {
                const hasEmptyState = $body.find('[data-test="empty-state"]').length > 0
                if (hasEmptyState) {
                    // Force a retry by throwing an error
                    throw new Error('Dashboard panel still showing empty state, retrying...')
                }
            })
        })
    }
})

declare global {
    namespace Cypress {
        interface Chainable {
            checkDashboards(names: string[]): Chainable<Element>
        }
    }
}
