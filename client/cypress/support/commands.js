// Custom commands for Cypress tests

// Login command for reuse
Cypress.Commands.add('login', (username, password) => {
  cy.visit('/login');
  cy.get('#loginName').type(username || 'testuser');
  cy.get('#loginPassword').type(password || 'password123');
  cy.get('button[type="submit"]').click();
});

// Admin login command
Cypress.Commands.add('adminLogin', () => {
  cy.login('admin', 'adminpassword');
});

// Create a new session
Cypress.Commands.add('createSession', () => {
  cy.visit('/join');
  cy.get('.btn-success').contains('Create New Session').click();
});

// Add availability
Cypress.Commands.add('addAvailability', (day, startTime, endTime) => {
  cy.get('#day_of_week').select(day || 'Monday');
  cy.get('#start_time').type(startTime || '09:00');
  cy.get('#end_time').type(endTime || '17:00');
  cy.get('button').contains('Add Availability').click();
});
