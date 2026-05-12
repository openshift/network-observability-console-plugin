/**
 * Helper function to verify resource SVG icon exists in NetObserv topology view
 * Note: As of PF6 migration, icons use PatternFly components (e.g., GlobeRouteIcon for Gateway)
 * which may not use inline SVG paths, so we just verify the SVG element exists.
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
