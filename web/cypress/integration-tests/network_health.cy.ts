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
        cy.get('[data-test="loading-indicator"]', { timeout: 30000 }).should('not.exist')
        cy.byTestID('name-filter-input').type('DNSNxDomain_PerDst' + '{enter}')
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

        // wait a min for alert to show up
        cy.wait(60000)
        cy.get(networkHealthSelectors.namespace).should('exist').click()
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
        cy.get('div.rule-details-row').first().find('button').click().then(() => {
            cy.contains('Inspect network traffic').click().then(() => {
                cy.checkNetflowTraffic()
                topologyPage.selectGroupWithSlider("Owner")
                topologyPage.selectGroupWithSlider("Namespace")
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
