import { netflowPage, topologyPage } from "@views/netflow-page"
import { Operator } from "@views/netobserv"
import { networkHealth, networkHealthSelectors } from "@views/network-health"

const alertServerity = ["Info", "Warning", "Critical"]

describe('(OCP-84821) Network Health test', { tags: ['Network_Observability'] }, function () {

    before('any test', function () {
        cy.adminCLI(`oc adm policy add-cluster-role-to-user cluster-admin ${Cypress.env('LOGIN_USERNAME')}`)
        cy.uiLogin(Cypress.env('LOGIN_IDP'), Cypress.env('LOGIN_USERNAME'), Cypress.env('LOGIN_PASSWORD'))

        Operator.install()
        cy.checkStorageClass(this)
        Operator.createFlowcollector("NetworkAlertHealth")
        cy.adminCLI("oc apply -f cypress/fixtures/dns_errors.yaml")
    })

    beforeEach('test', function () {
        cy.clearLocalStorage()

    })

    it("(OCP-84821, memodi) Verify Network Health Alerts", function () {
        cy.visit('/monitoring/alertrules')
        cy.get('table', { timeout: 60000 }).should('exist')

        cy.get('#name').should('be.visible').clear().type('DNSNxDomain_PerDst{enter}')
        const variants = ["Namespace", "Workload"]
        variants.forEach(variant => {
            alertServerity.forEach(severity => {
                cy.contains(`DNSNxDomain_PerDst${variant}${severity}`).should('exist')
            })
        })
        cy.visit('/network-health')
        cy.get("#content-scrollable").should('exist')
        netflowPage.setAutoRefresh()
        cy.get(networkHealthSelectors.global).should('exist')
        cy.get(networkHealthSelectors.node).should('exist')
        cy.get(networkHealthSelectors.namespace).should('exist')
        cy.get(networkHealthSelectors.workload).should('exist')

        // Switch to namespace tab and wait for health cards to load
        cy.get(networkHealthSelectors.namespace).should('exist').click()
        // verifyAlert will wait up to 60s for the card to appear
        networkHealth.verifyAlert("dns-traffic")

        networkHealth.navigateToAlertPage("dns-traffic")
    })

    it("(OCP-84821, memodi) Verify RecordingRules", function () {
        cy.visit('/network-health')
        cy.get(networkHealthSelectors.node).should('exist').click()

        networkHealth.verifyAlert("ip", "recording", "Too many DNS NX_DOMAIN errors")
    })

    it("(OCP-84821, memodi) Verify Health Topology Integration", function () {
        cy.visit('/network-health')

        cy.get(networkHealthSelectors.namespace).should('exist').click()
        networkHealth.clickOnAlert("dns-traffic")

        cy.get(networkHealthSelectors.sidePanel).should('be.visible')
        // click the kebab button
        cy.get('div.rule-details-row').first().find('button').click({ force: true }).then(() => {
            cy.contains('Inspect network traffic', { timeout: 60000 }).click().then(() => {
                cy.checkNetflowTraffic()
                // select Owner group
                topologyPage.selectGroupWithSlider("Owner")
                topologyPage.selectGroupWithSlider("Namespace")
                // click on the NS and check Health tab in sidebar.
                cy.get('g[data-kind="node"] > g').eq(1).parent().should('exist').click()
                cy.get('#elementPanel').should('be.visible')
                cy.get('#drawer-tabs').contains('Health').should('exist').click()
                cy.get('div .rule-details-row').should('exist')
            })
        })
    })

    after("all tests", function () {
        cy.adminCLI('oc delete -f cypress/fixtures/dns_errors.yaml --ignore-not-found')
        Operator.deleteFlowCollector()
        cy.adminCLI(`oc adm policy remove-cluster-role-from-user cluster-admin ${Cypress.env('LOGIN_USERNAME')}`)
    })
})
