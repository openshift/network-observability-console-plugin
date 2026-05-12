import { Operator } from "@views/netobserv"
import { netflowPage, colSelectors, querySumSelectors, filterSelectors } from "@views/netflow-page"

function getTableLimitURL(limit: string): string {
    return `**/netflow-traffic**limit=${limit}`
}

describe('(OCP-50532, OCP-50531, OCP-50530, OCP-59408) Netflow Table Query Options', { tags: ['Network_Observability'] }, function () {

    before('any test', function () {
        cy.adminCLI(`oc adm policy add-cluster-role-to-user cluster-admin ${Cypress.env('LOGIN_USERNAME')}`)
        cy.uiLogin(Cypress.env('LOGIN_IDP'), Cypress.env('LOGIN_USERNAME'), Cypress.env('LOGIN_PASSWORD'))

        Operator.install()
        cy.checkStorageClass(this)
        Operator.createFlowcollector()
    })

    beforeEach('any netflow table test', function () {
        netflowPage.visit()
        cy.get('#tabs-container').contains('Traffic flows').click()
        cy.byTestID("table-composable").should('exist')
    })

    it("(OCP-50532, aramesha) should verify Query Options dropdown", { tags: ['@smoke'] }, function () {
        // toggle between the page limits
        cy.changeQueryOption('500')
        netflowPage.waitForLokiQuery()
        cy.intercept('GET', getTableLimitURL('500'), {
            fixture: 'flowmetrics/table_500.json'
        }).as('matchedUrl')

        cy.changeQueryOption('100')
        netflowPage.waitForLokiQuery()
        cy.intercept('GET', getTableLimitURL('100'), {
            fixture: 'flowmetrics/table_100.json'
        }).as('matchedUrl')

        cy.changeQueryOption('50')
        netflowPage.waitForLokiQuery()
        cy.intercept('GET', getTableLimitURL('50'), {
            fixture: 'flowmetrics/table_50.json'
        }).as('matchedUrl')
    })

    it("(OCP-50532, memodi) should validate query summary panel", { tags: ['@smoke'] }, function () {
        let warningExists = false
        cy.get(querySumSelectors.queryStatsPanel).should('exist').then(qrySum => {
            if (Cypress.$(querySumSelectors.queryStatsPanel + ' svg.query-summary-warning').length > 0) {
                warningExists = true
            }
        })

        cy.get(querySumSelectors.flowsCount).should('exist').then(flowsCnt => {
            // parseFloat handles formats: "123 Flows", "123+ Flows", "1.5k Flows", "1.5k+ Flows"
            const nflows = parseFloat(flowsCnt.text())
            cy.wait(10)
            expect(nflows).to.be.greaterThan(0)
        })

        cy.get(querySumSelectors.bytesCount).should('exist').then(bytesCnt => {
            const nbytes = parseFloat(bytesCnt.text())
            expect(nbytes).to.be.greaterThan(0)
        })

        cy.get(querySumSelectors.packetsCount).should('exist').then(pktsCnt => {
            const npkts = parseFloat(pktsCnt.text())
            expect(npkts).to.be.greaterThan(0)
        })
        cy.get('#query-summary-toggle').should('exist').click()
        cy.get('#summaryPanel').should('be.visible')

        cy.contains('Results').should('exist')
        cy.contains('Average time').should('exist')
        cy.contains('Duration').should('exist')
        cy.contains('Collection latency').should('exist')
        cy.contains('Cardinality').should('exist')
        cy.contains('Configuration').should('exist')
        cy.contains('Sampling').should('exist')
        cy.contains('Version').should('exist')
        cy.contains('Number').should('exist')
        cy.contains('Date').should('exist')
    })

    it("(OCP-68125, aramesha) should verify DSCP column", function () {
        netflowPage.stopAutoRefresh()
        cy.openColumnsModal().then(col => {
            cy.get(colSelectors.columnsModal).should('be.visible')
            cy.get('#Dscp').check()
            cy.byTestID(colSelectors.save).click()
        })
        cy.reload()

        cy.byTestID('table-composable').should('exist').within(() => {
            cy.get(colSelectors.dscp).should('exist')
        })

        // filter on DSCP values
        cy.get(filterSelectors.filterInput).type("dscp=0" + '{enter}').click()
        cy.get('#dscp-0-toggle').should('contain.text', 'Standard')

        // Verify DSCP value is Standard for all rows
        cy.get('[data-test-td-column-id=Dscp]').each((td) => {
            cy.wrap(td).should('have.attr', 'data-test-td-value').and('contain', '0')
            cy.wrap(td).should('contain.text', 'Standard')
        })
        netflowPage.clearAllFilters()
    })

    afterEach("test", function () {
        netflowPage.resetClearFilters()
    })

    after("all tests", function () {
        cy.adminCLI(`oc adm policy remove-cluster-role-from-user cluster-admin ${Cypress.env('LOGIN_USERNAME')}`)
    })
})
