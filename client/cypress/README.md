# E2E Testing with Cypress

This folder contains end-to-end tests for the Meeting Time Finder application using Cypress.

## Test Structure

The tests are organized as follows:

- `auth.cy.js` - Tests for registration, login, and authentication flows
- `session-flow.cy.js` - Tests for creating and joining sessions
- `schedule.cy.js` - Tests for managing availability schedules
- `results.cy.js` - Tests for viewing optimal meeting times
- `admin-flows.cy.js` - Tests for admin functionality

## Running Tests

To run the tests, use the following commands:

```bash
# Open Cypress in interactive mode
npm run cypress:open

# Run all tests headlessly
npm run cypress:run

# Run tests with the application automatically started
npm run test:e2e
```

## Custom Commands

See `support/commands.js` for custom commands that can be reused across tests.

## Test Data

Some tests require test users to be present in the system:
- Regular user: username: `testuser`, password: `password123`
- Admin user: username: `admin`, password: `adminpassword`

Make sure these users exist in your test environment before running the tests.
