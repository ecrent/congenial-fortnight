describe('Results Page', () => {
  beforeEach(() => {
    // We need to mock the authentication and session state
    // since reaching this page naturally requires multiple users
    cy.visit('/');
    
    // Mock the session storage
    cy.window().then((window) => {
      const mockUser = {
        id: 1,
        name: 'testuser',
        role: 'user',
        email: 'test@example.com'
      };
      
      const mockSession = {
        session_code: 'TEST1234',
        created_at: new Date().toISOString()
      };
      
      window.sessionStorage.setItem('userData', JSON.stringify(mockUser));
      window.sessionStorage.setItem('sessionData', JSON.stringify(mockSession));
      window.sessionStorage.setItem('accessToken', 'mock-token');
    });
    
    // Now navigate to results page
    cy.visit('/results');
    
    // Mock the API calls
    cy.intercept('GET', '/api/v1/users/session/*', {
      statusCode: 200,
      body: {
        status: 'success',
        data: {
          users: [
            { id: 1, name: 'testuser', is_ready: true }
          ]
        }
      }
    });
    
    cy.intercept('GET', '/api/v1/optimal-times/*', {
      statusCode: 200,
      body: {
        status: 'success',
        data: {
          optimalTimes: [
            {
              day_of_week: 1,
              start_time: '09:00',
              end_time: '12:00',
              user_count: 1,
              total_users: 1,
              available_users: ['testuser']
            }
          ]
        }
      }
    });
  });
  
  it('should display optimal meeting times', () => {
    // Check if times are displayed
    cy.get('table tbody').should('contain', 'Monday');
    cy.get('table tbody').should('contain', '9:00 AM');
    cy.get('table tbody').should('contain', '12:00 PM');
  });
  
  it('should change duration filter', () => {
    // Change duration
    cy.get('#duration').select('30 minutes');
    
    // This should trigger the API call again
    cy.get('.spinner-border').should('be.visible');
    cy.get('.spinner-border').should('not.exist');
    
    // Results should still be there
    cy.get('table tbody').should('contain', 'Monday');
  });
  
  it('should navigate back to schedule', () => {
    // Click back button
    cy.get('button').contains('Back to Schedule').click();
    
    // Should navigate back to schedule
    cy.url().should('include', '/schedule');
  });
});
