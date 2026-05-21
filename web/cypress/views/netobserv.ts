import { catalogSources } from "../views/catalog-source"
import { operatorHubPage } from "../views/operator-hub-page"

declare global {
    namespace Cypress {
        interface Chainable {
            enableFLPMetrics(tag: string[]): Chainable<Element>
            checkStorageClass(context: Mocha.Context): Chainable<Element>
            deployFlowcollectorFromFixture(fixtureFile: string): Chainable<Element>
        }
    }
}

// Types
type FlowCollectorParameter =
    | 'PacketDrop'
    | 'FlowRTT'
    | 'DNSTracking'
    | 'LokiDisabled'
    | 'Conversations'
    | 'ZonesAndMultiCluster'
    | 'BytesMetrics'
    | 'PacketsMetrics'
    | 'SubnetLabels'
    | 'NetworkAlertHealth'

// Constants
export const project = "netobserv"

// Environment variables
const catSrc = Cypress.env('NOO_CATALOG_SOURCE')
const catSrcImage: string = Cypress.env('NOO_CS_IMAGE')

// Default catalog images
const DEFAULT_UPSTREAM_IMAGE = 'quay.io/netobserv/network-observability-operator-catalog:v0.0.0-sha-main'
const DEFAULT_DOWNSTREAM_IMAGE = "quay.io/redhat-user-workloads/ocp-network-observab-tenant/catalog-ystream:latest"

// FlowCollector fixture paths
const FIXTURE_PATHS = {
    default: 'cypress/fixtures/flowcollector/fc.yaml',
    bytesMetrics: 'cypress/fixtures/flowcollector/fc_bytesMetrics.yaml',
    packetsMetrics: 'cypress/fixtures/flowcollector/fc_packetsMetrics.yaml',
    packetDrop: 'cypress/fixtures/flowcollector/fc_packetDrop.yaml',
    dnsTracking: 'cypress/fixtures/flowcollector/fc_DNSTracking.yaml',
    flowRTT: 'cypress/fixtures/flowcollector/fc_flowRTT.yaml',
    lokiDisabled: 'cypress/fixtures/flowcollector/fc_lokiDisabled.yaml',
    conversations: 'cypress/fixtures/flowcollector/fc_conversations.yaml',
    subnetLabels: 'cypress/fixtures/flowcollector/fc_subnetLabel.yaml',
    zonesMultiCluster: 'cypress/fixtures/flowcollector/fc_zoneMulticluster.yaml',
    networkAlertHealth: 'cypress/fixtures/flowcollector/fc_networkalert.yaml'
} as const

export const Operator = {
    name: () => {
        if (`${Cypress.env('NOO_CATALOG_SOURCE')}` === "upstream") {
            return "NetObserv Operator"
        }
        else {
            return "Network Observability"
        }
    },
    install_catalogsource: () => {
        let catalogDisplayName = "Production Operators"
        let catalogImg: string
        let catalogSource: string

        if (catSrc === "upstream") {
            catalogImg = catSrcImage ? catSrcImage : DEFAULT_UPSTREAM_IMAGE
            catalogSource = "netobserv-test"
            catalogDisplayName = "NetObserv QE"
            catalogSources.createCustomCatalog(catalogImg, catalogSource, catalogDisplayName)
        }
        else {
            catalogImg = catSrcImage ? catSrcImage : DEFAULT_DOWNSTREAM_IMAGE
            catalogSource = "netobserv-konflux-fbc"
            catalogDisplayName = "NetObserv Konflux"
            catalogSources.createCustomCatalog(catalogImg, catalogSource, catalogDisplayName)
            // deploy ImageDigetMirrorSet
            cy.adminCLI('oc apply -f cypress/fixtures/image-digest-mirror-set.yaml')
        }
        return catalogSource
    },
    install: () => {
        if (`${Cypress.env('SKIP_NOO_INSTALL')}` === "true") {
            return null
        }
        // Check operator status via CLI
        cy.adminCLI('oc get csv -n openshift-netobserv-operator --no-headers -o custom-columns=":metadata.name" 2>/dev/null || echo "NotFound"')
            .then((result: any) => {
                const stdout = result.stdout ? result.stdout.trim() : ''
                const csvName = stdout.split('\n').find((line: string) =>
                    line.includes('netobserv-operator') || line.includes('network-observability-operator')
                )

                if (csvName && !stdout.includes('NotFound') && !stdout.includes('No resources found')) {
                    // CSV exists, check if it's in Succeeded state
                    cy.adminCLI(`oc wait csv ${csvName.trim()} -n openshift-netobserv-operator --for=jsonpath='{.status.phase}'=Succeeded --timeout=120s`)
                        .then(() => {
                            cy.log('NetObserv Operator already installed')
                        })
                } else {
                    cy.log('Installing NetObserv Operator')
                    var catalogSource = Operator.install_catalogsource()

                    if (catSrc === "upstream") {
                        // metrics checkbox is not available for upstream operators
                        operatorHubPage.install("netobserv-operator", catalogSource, false)
                    } else {
                        operatorHubPage.install("netobserv-operator", catalogSource, true)
                    }
                }
            })
    },
    visitFlowcollector: () => {
        cy.adminCLI('oc get csv -n openshift-netobserv-operator --no-headers -o custom-columns=":metadata.name" 2>/dev/null || echo "NotFound"')
            .then((result: any) => {
                const stdout = result.stdout ? result.stdout.trim() : ''
                const csvName = stdout.split('\n').find((line: string) =>
                    line.includes('netobserv-operator') || line.includes('network-observability-operator')
                )

                if (csvName && !stdout.includes('NotFound') && !stdout.includes('No resources found')) {
                    cy.visit(`/k8s/ns/openshift-netobserv-operator/operators.coreos.com~v1alpha1~ClusterServiceVersion/${csvName.trim()}/flows.netobserv.io~v1beta2~FlowCollector`)
                    cy.get('div.loading-box__loaded', { timeout: 30000 }).should('exist')
                } else {
                    throw new Error('NetObserv CSV not found')
                }
            })
    },
    createFlowcollector: (parameters?: FlowCollectorParameter) => {
        Operator.visitFlowcollector()
        cy.get('div.loading-box__loaded:nth-child(2)').should('exist')
        cy.wait(3000)
        cy.get("#yaml-create").should('exist').then(() => {
            if ((Cypress.$('td[role="gridcell"]').length > 0) && (parameters != null)) {
                Operator.deleteFlowCollector()
                // come back to flowcollector tab after deletion
                Operator.visitFlowcollector()
            }
        })
        // don't create flowcollector if already exists
        cy.get('div.loading-box:nth-child(1)').should('be.visible').then(() => {
            if (Cypress.$('td[role="gridcell"]').length === 0) {
                cy.log("Deploying flowcollector")
                switch (parameters) {
                    case "PacketDrop":
                        cy.deployFlowcollectorFromFixture(FIXTURE_PATHS.packetDrop)
                        break;
                    case "FlowRTT":
                        cy.deployFlowcollectorFromFixture(FIXTURE_PATHS.flowRTT)
                        break;
                    case "DNSTracking":
                        cy.deployFlowcollectorFromFixture(FIXTURE_PATHS.dnsTracking)
                        break;
                    case "LokiDisabled":
                        cy.deployFlowcollectorFromFixture(FIXTURE_PATHS.lokiDisabled)
                        break;
                    case "Conversations":
                        cy.deployFlowcollectorFromFixture(FIXTURE_PATHS.conversations)
                        break;
                    case "ZonesAndMultiCluster":
                        cy.deployFlowcollectorFromFixture(FIXTURE_PATHS.zonesMultiCluster)
                        break;
                    case "BytesMetrics":
                        cy.deployFlowcollectorFromFixture(FIXTURE_PATHS.bytesMetrics)
                        break;
                    case "PacketsMetrics":
                        cy.deployFlowcollectorFromFixture(FIXTURE_PATHS.packetsMetrics)
                        break;
                    case "SubnetLabels":
                        cy.deployFlowcollectorFromFixture(FIXTURE_PATHS.subnetLabels)
                        break;
                    case "NetworkAlertHealth":
                        // Flowcollector deployed with DNSTracking enabled
                        cy.deployFlowcollectorFromFixture(FIXTURE_PATHS.networkAlertHealth)
                        break;
                    default:
                        cy.deployFlowcollectorFromFixture(FIXTURE_PATHS.default)
                        break;
                }
                cy.byTestID('refresh-web-console', { timeout: 80000 }).should('exist')
                cy.reload(true)
                if (parameters !== "LokiDisabled") {
                    cy.adminCLI(`oc wait --for=condition=Ready pod -l app=loki -n ${project} --timeout=180s`)
                }
                // Check FlowCollector status and wait for plugin pod to be Ready
                cy.contains('tr', 'cluster').within(() => {
                    cy.byTestID('status-text', { timeout: 60000 }).should('contain.text', 'Ready')
                })
                cy.adminCLI(`oc wait --for=condition=Ready pod -l app=netobserv-plugin -n ${project} --timeout=180s`)
            }
        })
    },
    deleteFlowCollector: () => {
        cy.adminCLI(`oc delete flowcollector cluster --ignore-not-found`)
    },
    uninstall: () => {
        cy.visit('k8s/all-namespaces/operators.coreos.com~v1alpha1~ClusterServiceVersion')

        cy.contains(Operator.name()).should('exist').invoke('attr', 'href').then(href => {
            cy.visit(href)
        })
        cy.get('.co-actions-menu > .pf-c-dropdown__toggle').should('exist').click()
        cy.byTestActionID('Uninstall Operator').should('exist').click()
        cy.byTestID('confirm-action').should('exist').click()
    },
    deleteCatalogSource: (catalogSource: string) => {
        cy.visit('k8s/cluster/config.openshift.io~v1~OperatorHub/cluster/sources')
        cy.byTestID(catalogSource).should('exist').invoke('attr', 'href').then(href => {
            cy.visit(href)
        })
        cy.get('.co-actions-menu > .pf-c-dropdown__toggle').should('exist').click()
        cy.byTestActionID('Delete CatalogSource').should('exist').click()
        cy.byTestID('confirm-action').should('exist').click()
    }
}

Cypress.Commands.add('enableFLPMetrics', (tags: string[]) => {
    for (let i = 0; i < tags.length; i++) {
        const tag = tags[i];
        cy.get('#root_spec_processor_metrics_includeList_add-btn').should('exist').click()
        cy.get(`#root_spec_processor_metrics_includeList_${i}`).should('exist').click().then(metrics => {
            cy.get(`#${tag}-link`).should('exist').click()
        })
    }
});

Cypress.Commands.add('checkStorageClass', (context: Mocha.Context) => {
    let storageClassCheck = false
    const kubeconfig = Cypress.env('KUBECONFIG_PATH');
    expect(kubeconfig, 'KUBECONFIG_PATH').to.be.a('string').and.not.be.empty
    cy.exec(`oc get sc --kubeconfig ${kubeconfig}`).then(result => {
        if (result.stderr.includes('No resources found')) {
            cy.log('StorageClass not deployed, skipping')
            storageClassCheck = true
        }
        cy.wrap(storageClassCheck).then(scCheck => {
            if (scCheck) {
                context.skip()
            }
        })
    })
});

Cypress.Commands.add('deployFlowcollectorFromFixture', (fixtureFile: string) => {
    cy.adminCLI(`oc apply -f ${fixtureFile}`)
})
