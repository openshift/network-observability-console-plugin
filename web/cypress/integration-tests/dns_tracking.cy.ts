import { Operator } from "@views/netobserv"
import { netflowPage, overviewSelectors, querySumSelectors, colSelectors } from "@views/netflow-page"

describe('(OCP-67087 Network_Observability) DNSTracking test', { tags: ['Network_Observability'] }, function () {

    before('any test', function () {
        cy.adminCLI(`oc adm policy add-cluster-role-to-user cluster-admin ${Cypress.env('LOGIN_USERNAME')}`)
        cy.uiLogin(Cypress.env('LOGIN_IDP'), Cypress.env('LOGIN_USERNAME'), Cypress.env('LOGIN_PASSWORD'))

        Operator.install()
        cy.checkStorageClass(this)
        Operator.createFlowcollector("DNSTracking")
    })

    beforeEach('any DNSTracking test', function () {
        netflowPage.visit()
    })

    it("(OCP-67087, aramesha, Network_Observability) Verify DNSTracking panels and Query Summary", function () {
        // verify default DNSTracking panels are visible
        cy.checkPanel(overviewSelectors.defaultDNSTrackingPanels)
        cy.checkPanelsNum(5);

        // open panels modal and verify all relevant panels are listed
        cy.openPanelsModal();
        cy.checkPopupItems(overviewSelectors.panelsModal, overviewSelectors.manageDNSTrackingPanelsList);

        // select all panels and verify they are rendered
        cy.get(overviewSelectors.panelsModal).contains('Select all').click();
        cy.get(overviewSelectors.panelsModal).contains('Save').click();
        netflowPage.waitForLokiQuery()
        cy.checkPanelsNum(10);

        netflowPage.waitForLokiQuery()
        cy.checkPanel(overviewSelectors.allDNSTrackingPanels)

        // restore default panels and verify they are visible
        cy.openPanelsModal()
        cy.byTestID(overviewSelectors.resetDefault).click()
        cy.byTestID(overviewSelectors.save).click()
        netflowPage.waitForLokiQuery()
        cy.checkPanel(overviewSelectors.defaultDNSTrackingPanels)
        cy.checkPanelsNum(5);

        // verify Query Summary stats for DNSTracking
        cy.get(querySumSelectors.dnsAvg).should('exist').then(DNSAvg => {
            cy.checkQuerySummary(DNSAvg)
        })
    })

    it("(OCP-67087, aramesha) Validate DNSTracking columns and DNSName", function () {
        cy.get('#tabs-container').contains('Traffic flows').click()
        cy.byTestID("table-composable").should('exist')
        netflowPage.stopAutoRefresh()

        // verify default DNS columns: DNS Latency and DNS Response Code
        cy.byTestID('table-composable').should('exist').within(() => {
            cy.get(colSelectors.dnsLatency).should('exist')
            cy.get(colSelectors.dnsResponseCode).should('exist')
        })

        const dns_name = "loki.netobserv.svc.cluster"
        // Filter with DNSLatency > 0
        cy.byTestID("column-filter-toggle").click().get('.pf-c-dropdown__menu').should('be.visible')
        cy.get('#group-2-toggle').click().should('be.visible')
        cy.byTestID('dns_name').click()
        cy.get('#search').type(dns_name + '{enter}')

        // select DNS Id, DNS Error and DNS Name columns
        cy.selectAndVerifyColumns([
            colSelectors.dnsId,
            colSelectors.dnsError,
            colSelectors.dnsName
        ])

        // Verify DNSName value for all rows
        cy.get('[data-test-td-column-id="DNSName"]').each((td) => {
            expect(td).to.contain(`${dns_name}`)
        })

        netflowPage.clearAllFilters()
    })

    afterEach("test", function () {
        netflowPage.resetClearFilters()
    })

    after("all tests", function () {
        Operator.deleteFlowCollector()
        cy.adminCLI(`oc adm policy remove-cluster-role-from-user cluster-admin ${Cypress.env('LOGIN_USERNAME')}`)
    })
})
