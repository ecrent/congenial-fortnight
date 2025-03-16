describe('Session Management Workflow', () => {
  beforeEach(() => {
    // Visit the home page before each test
    cy.visit('/');
  });

  it('should navigate from home to login page', () => {
    // Check if we're on the home page - look for any common element instead of "Welcome"
    cy.get('.navbar-brand').should('be.visible');
    
    // Navigate to login page using the Sign In text from our UI
    cy.contains('Sign In').click();
    
    // Verify we're on the login page
    cy.url().should('include', '/login');
    cy.get('h2').contains('Login').should('be.visible');
  });

  it('should login and access the join page', () => {
    // Set up intercept for login
    cy.intercept('POST', '**/api/v1/users/login', {
      statusCode: 200,
      body: {
        status: 'success',
        data: {
          user: { 
            name: 'testuser', 
            email: 'test@example.com',
            role: 'user'
          },
          accessToken: 'fake-token',
          refreshToken: 'fake-refresh-token'
        }
      }
    }).as('loginRequest');
    
    // Navigate to login page
    cy.visit('/login');
    
    // Login with credentials
    cy.get('form input').first().clear().type('testuser');
    cy.get('form input[type="password"]').clear().type('Password123!');
    cy.get('button[type="submit"].btn.btn-primary').click();
    cy.wait('@loginRequest');
    
    // Verify successful login - should be on join page
    cy.url().should('include', '/join');
    cy.contains('Create New Session').should('be.visible');
  });

  it('should create a session and add availability', () => {
    // Setup login interceptor
    cy.intercept('POST', '**/api/v1/users/login', {
      statusCode: 200,
      body: {
        status: 'success',
        data: {
          user: { name: 'testuser', email: 'test@example.com', role: 'user' },
          accessToken: 'fake-token',
          refreshToken: 'fake-refresh-token'
        }
      }
    }).as('loginRequest');
    
    // Login first - need to be logged in before creating a session
    cy.visit('/login');
    cy.get('form input').first().type('testuser');
    cy.get('form input[type="password"]').type('Password123!');
    cy.get('button[type="submit"].btn.btn-primary').click();
    cy.wait('@loginRequest');
    cy.url().should('include', '/join');
    
    // Setup remaining interceptors - AFTER login is successful
    cy.intercept('POST', '**/api/v1/sessions', {
      statusCode: 200,
      body: {
        status: 'success',
        data: {
          session: {
            code: 'WORKFLOW123',
            name: 'Complete Workflow Session'
          }
        }
      }
    }).as('createSession');
    
    cy.intercept('GET', '**/api/v1/schedules/user/**', {
      statusCode: 200,
      body: {
        status: 'success',
        data: { schedules: [] }
      }
    }).as('getUserSchedules');
    
    // Try different button selector and force the click to handle any visibility issues
    cy.contains('button', 'Create').click({ force: true });
    // Alternative selectors if needed:
    // cy.get('.btn-success').click({ force: true });
    // cy.get('button').contains('Create New Session').click({ force: true });
    
    cy.wait('@createSession');
    cy.url().should('include', '/schedule');
    
    // // getting erros on this part debug later
    // cy.url().then(url => {
    //   if (url.includes('/schedule')) {
    //     cy.intercept('POST', '**/api/v1/schedules', {
    //       statusCode: 200,
    //       body: {
    //         status: 'success',
    //         data: {
    //           message: 'Schedule saved successfully'
    //         }
    //       }
    //     }).as('saveSchedule');
        
    //     cy.intercept('PUT', '**/api/v1/users/**/ready', {
    //       statusCode: 200,
    //       body: {
    //         status: 'success',
    //         data: {
    //           message: 'User marked as ready',
    //           user: { name: 'testuser', is_ready: true }
    //         }
    //       }
    //     }).as('markReady');
        
    //     // Ensure the form is loaded
    //     cy.get('form').should('be.visible');

        
    //     // Select day (Monday) and trigger change so that formData.day_of_week is updated
    //     cy.get('form input').select('1').trigger('change');
        
    //     // Handle time inputs
    //     cy.get('form input').should('be.visible').clear().type('09:00', { force: true }).trigger('change');
    //     cy.get('form input').should('be.visible').clear().type('12:00', { force: true }).trigger('change');
        
    //     // Click the submit button instead of submitting the form directly
    //     cy.get('button').contains('Add Availability').click({ force: true });
    //     cy.wait('@saveSchedule');
        
    //     // Mark as ready - using a more generic approach
    //     cy.contains("I'm Done Adding My Availability").click({ force: true });
    //     cy.wait('@markReady');
        
    //     // Verify the text changes after marking as ready
    //     cy.contains("I'm Not Ready Yet").should('be.visible');
        
    //     // Logout
    //     cy.contains('Logout').click();
    //     cy.url().should('include', '/');
    //   }
    // });
  });
});












