/**
 * Helper function to verify resource SVG icon exists in NetObserv topology view
 *
 * @param resourceType - Kubernetes resource type (e.g., 'Gateway', 'Service')
 * @param resourceName - Name of the resource instance
 * @param timeout - Timeout in milliseconds (default: 60000)
 */
export function verifyResourceSVGLogo(resourceType: string, resourceName: string, timeout: number = 60000) {
    const selector = `g[data-id*="o=${resourceType}.${resourceName}"]`;
    cy.get(`${selector} svg`, { timeout })
      .should('have.length.greaterThan', 0)
      .first()
      .should('be.visible');
}
