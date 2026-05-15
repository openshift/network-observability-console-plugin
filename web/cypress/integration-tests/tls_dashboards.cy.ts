import { Operator } from "@views/netobserv"
import { dashboard } from "@views/dashboards-page"

const TLSPanels = [
    "flows-rate-per-tls-version-chart",
    "flows-rate-per-tls-group-chart",
]

describe('(OCP-88966) TLSTracking test', { tags: ['Network_Observability'] }, function () {

    before('any test', function () {
        cy.adminCLI(`oc adm policy add-cluster-role-to-user cluster-admin ${Cypress.env('LOGIN_USERNAME')}`)
        cy.uiLogin(Cypress.env('LOGIN_IDP'), Cypress.env('LOGIN_USERNAME'), Cypress.env('LOGIN_PASSWORD'))

        Operator.install()
        cy.checkStorageClass(this)
        Operator.createFlowcollector("TLSTracking")
    })

    // TODO: TLS in topology is still Dev InProgress. Will implement test here once its complete 

    it("(OCP-88966, aramesha) Validate TLSTracking dashboards", function () {
        // navigate to 'NetObserv / Main' Dashboard page
        dashboard.visit()
        dashboard.visitDashboard("netobserv-main")

        // verify 'TLS Traffic' panel
        cy.checkDashboards(['tls-traffic-chart'])

        cy.get('#content-scrollable').scrollTo('bottom')

        cy.checkDashboards(TLSPanels)
    })

    after("all tests", function () {
        Operator.deleteFlowCollector()
        cy.adminCLI(`oc adm policy remove-cluster-role-from-user cluster-admin ${Cypress.env('LOGIN_USERNAME')}`)
    })
})
