import { flowcollectorStatusPage, flowcollectorStatusSelectors } from "@views/flowcollector-status";
import { netflowPage, overviewSelectors, pluginSelectors } from "@views/netflow-page";
import { Operator } from "@views/netobserv";

describe('(OCP-84156 OCP-88744) StaticPlugin test with Status Check', { tags: ['Network_Observability'] }, function () {

    before('any test', function () {
        cy.adminCLI(`oc adm policy add-cluster-role-to-user cluster-admin ${Cypress.env('LOGIN_USERNAME')}`)
        cy.uiLogin(Cypress.env('LOGIN_IDP'), Cypress.env('LOGIN_USERNAME'), Cypress.env('LOGIN_PASSWORD'))

        Operator.install()
        cy.checkStorageClass(this)
        Operator.createFlowcollector("StaticPlugin")
    })

    it("(OCP-84156, OCP-88744 aramesha) Edit flowcollector form view with Status Check", function () {
        // Edit flowcollector form view to update sampling to 1
        flowcollectorStatusPage.visit()

        // Verify status page title with status icon and tooltip on hover
        cy.contains('Network Observability FlowCollector status').should('exist')
        cy.get(flowcollectorStatusSelectors.statusButton).should('exist')
            .find('span').first().trigger('mouseenter', { force: true })
        cy.get(flowcollectorStatusSelectors.statusTooltip, { timeout: 10000 })
            .should('contain.text', 'FlowCollector is ready')

        // Verify component statuses table headers
        cy.contains('Component statuses').should('exist')
        cy.contains('th', 'Component').should('exist')
        cy.contains('th', 'State').should('exist')
        cy.contains('th', 'Replicas').should('exist')
        cy.contains('th', 'Details').should('exist')

        // Verify component rows
        cy.contains('eBPF Agent').should('exist')
        cy.contains('Flowlogs Pipeline').should('exist')
        cy.contains('Console Plugin').should('exist')
        cy.contains('Loki').should('exist')
        cy.contains('Monitoring').should('exist')

        // Verify "Open Network Traffic page" button is enabled when FC is ready
        cy.byLegacyTestID('open-network-traffic').should('exist')
            .should('not.have.attr', 'aria-disabled', 'true')

        // Verify demoloki install warning alert at top of status page
        cy.get(flowcollectorStatusSelectors.configIssueRow).should('exist')
            .should('have.attr', 'data-test-status', 'True')
            .should('have.attr', 'data-test-reason', 'Warnings')
        cy.contains('Configuration warnings').should('exist')

        // Verify Conditions
        cy.contains('Conditions').should('exist')
        cy.get(flowcollectorStatusSelectors.readyRow)
            .should('have.attr', 'data-test-status', 'True')
        cy.get(flowcollectorStatusSelectors.agentReadyRow).should('exist')
        cy.get(flowcollectorStatusSelectors.pluginReadyRow).should('exist')
        cy.get(flowcollectorStatusSelectors.monitoringReadyRow).should('exist')

        // Updating ebpf Sampling to 1
        cy.get(pluginSelectors.editFlowcollector).click()
        cy.get('#root_spec_agent_accordion-toggle').click()
        cy.get('#root_spec_agent_ebpf_sampling').clear().type('1')
        cy.get(pluginSelectors.update).click()

        // Wait for flowcollector to get ready
        cy.wait(20000)
        cy.get(flowcollectorStatusSelectors.readyRow,{ timeout: 60000 }).should('exist')
            .should('have.attr', 'data-test-status', 'True')
            .should('have.attr', 'data-test-reason', 'Ready')
        cy.get(pluginSelectors.openNetworkTraffic).click()

        // Verify PacketDrop data is seen in Packet Drops view
        cy.get('li.overviewTabButton', { timeout: 30000 }).trigger('click')
        netflowPage.clearAllFilters()
        netflowPage.setAutoRefresh()
        netflowPage.selectView('pktdrop')
        cy.checkPanel(overviewSelectors.defaultPacketDropPanels)
        cy.checkPanelsNum(overviewSelectors.defaultPacketDropPanels.length);
        netflowPage.selectView('all')
        cy.checkNetflowTraffic()
        netflowPage.resetClearFilters()
    })

        it("(OCP-88744 kapjain) Verify status indicator on Network Health page", function () {
            cy.visit('/network-health')

            cy.get(flowcollectorStatusSelectors.statusIndicator).should('exist')
                .find('span').first().trigger('mouseenter', { force: true })
            cy.get(flowcollectorStatusSelectors.statusTooltip, { timeout: 10000 })
                .should('contain.text', 'FlowCollector is ready')
            cy.get(flowcollectorStatusSelectors.statusIndicator).click()
            cy.contains('Network Observability FlowCollector status', { timeout: 30000 }).should('exist')
        })

        it("(OCP-88744 kapjain) Verify status indicator on Network Traffic page", function () {
            cy.visit('/netflow-traffic')

            cy.get(flowcollectorStatusSelectors.statusIndicator).should('exist')
                .find('span').first().trigger('mouseenter', { force: true })
            cy.get(flowcollectorStatusSelectors.statusTooltip, { timeout: 10000 })
                .should('contain.text', 'FlowCollector is ready')
            cy.get(flowcollectorStatusSelectors.statusIndicator).click()
            cy.contains('Network Observability FlowCollector status', { timeout: 30000 }).should('exist')
        })
    after("after all tests", function () {
        Operator.deleteFlowCollector()
        cy.adminCLI(`oc adm policy remove-cluster-role-from-user cluster-admin ${Cypress.env('LOGIN_USERNAME')}`)
    })
})
