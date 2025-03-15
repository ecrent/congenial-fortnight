// Custom command to fill out the registration form
Cypress.Commands.add('fillRegistrationForm', (user) => {
  // Fill out the form based on what we know about the component
  if (user.name) {
    cy.get('form input').first().clear().type(user.name);
  }
  
  if (user.email) {
    cy.get('form input').eq(1).clear().type(user.email);
  }
  
  if (user.password) {
    cy.get('form input[type="password"], form input').eq(2).clear().type(user.password);
  }
});

// Custom command to log in
Cypress.Commands.add('login', (name, password) => {
  cy.visit('/login');
  
  // Use input order since we now know the form structure
  cy.get('form input').first().clear().type(name);
  cy.get('form input[type="password"]').clear().type(password);
  
  // Submit button - using specific selector
  cy.get('button[type="submit"].btn.btn-primary').click();
});

// Custom command to create and join a session
Cypress.Commands.add('createAndJoinSession', (sessionName) => {
  cy.intercept('POST', '**/api/v1/sessions', {
    statusCode: 200,
    body: {
      status: 'success',
      data: {
        session: { name: sessionName, code: 'TEST123' }
      }
    }
  }).as('createSessionRequest');
  
  cy.visit('/join');
  cy.get('input').first().clear().type(sessionName);
  cy.contains('button', 'Create').click();
  
  // Wait for the intercepted request
  cy.wait('@createSessionRequest');
  
  // Verify successful session creation
  cy.contains(sessionName).should('be.visible');
});
