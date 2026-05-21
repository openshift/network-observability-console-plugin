import { colSelectors, netflowPage, setupTopologyViewWithNamespaceFilter, topologyPage, topologySelectors } from "@views/netflow-page"
import { Operator } from "@views/netobserv"

function getTopologyScopeURL(scope: string): string {
    return `**/flow/metrics**aggregateBy=${scope}*`
}

describe('Netflow Zone and multiCluster test', { tags: ['Network_Observability'] }, function () {

    before('any test', function () {
        cy.adminCLI(`oc adm policy add-cluster-role-to-user cluster-admin ${Cypress.env('LOGIN_USERNAME')}`)
        cy.uiLogin(Cypress.env('LOGIN_IDP'), Cypress.env('LOGIN_USERNAME'), Cypress.env('LOGIN_PASSWORD'))

        Operator.install()
        cy.checkStorageClass(this)
        Operator.createFlowcollector("ZonesAndMultiCluster")
    })

    beforeEach('any netflow zone and multiCluster test', function () {
        netflowPage.visit()
    })

    it("(OCP-71525, aramesha, Network_Observability) should validate zone/multiCluster columns", function () {
        cy.get('#tabs-container').contains('Traffic flows').click()
        cy.byTestID("table-composable").should('exist')

        // Check zone and multiCluster columns
        cy.selectAndVerifyColumns([
            colSelectors.srcZone,
            colSelectors.dstZone,
            colSelectors.clusterName
        ])
    })

    it("(OCP-71524, aramesha, Network_Observability) should verify zone/cluster scope topology", function () {
        setupTopologyViewWithNamespaceFilter()

        // Verify Zone scope
        var scope = "zone"
        cy.intercept('GET', getTopologyScopeURL(scope), {
            fixture: 'flowmetrics/zone.json'
        }).as('matchedUrl')

        topologyPage.selectScopeGroup(scope, undefined)
        cy.wait('@matchedUrl').then(({ response }) => {
            expect(response?.statusCode).to.eq(200)
        })
        topologyPage.isViewRendered()

        // verify number of edges and nodes.
        cy.get('#drawer ' + topologySelectors.edge).should('have.length', 6)
        cy.get('#drawer ' + topologySelectors.node).should('have.length', 4)

        // Verify Cluster scope
        scope = "cluster"
        cy.intercept('GET', getTopologyScopeURL(scope), {
            fixture: 'flowmetrics/cluster.json'
        }).as('matchedUrl')

        topologyPage.selectScopeGroup(scope, undefined)
        cy.wait('@matchedUrl').then(({ response }) => {
            expect(response?.statusCode).to.eq(200)
        })
        topologyPage.isViewRendered()

        // verify number of edges and nodes.
        cy.get('#drawer ' + topologySelectors.edge).should('have.length', 0)
        cy.get('#drawer ' + topologySelectors.node).should('have.length', 1)
    })

    afterEach("each test", function () {
        netflowPage.resetClearFilters()
    })

    after("all tests", function () {
        Operator.deleteFlowCollector()
        cy.adminCLI(`oc adm policy remove-cluster-role-from-user cluster-admin ${Cypress.env('LOGIN_USERNAME')}`)
    })
})
