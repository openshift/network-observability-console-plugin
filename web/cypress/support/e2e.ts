// ***********************************************************
// This support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import types to enable tags in describe/it blocks
import '@cypress/grep'
import './commands'

// Global exception handler to suppress known OCP 4.22 console plugin errors
// These are known bugs in OCP 4.22 EC builds that don't affect NetObserv functionality
Cypress.on('uncaught:exception', (err) => {
    const errorMsg = err.message

    // Ignore specific networking-console-plugin errors
    if (errorMsg.includes('networking-console-plugin') || errorMsg.includes('networkingFlags')) {
        return false
    }

    // Ignore monitoring-plugin errors
    if (errorMsg.includes('monitoring-plugin') || errorMsg.includes('MonitoringReducer')) {
        return false
    }

    // Let other errors fail the test
    return true
})
