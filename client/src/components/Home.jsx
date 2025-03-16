import React, { useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { SessionContext } from '../context/SessionContext';
import Header from './Header';
import Footer from './Footer';

const Home = () => {
  const { clearSession } = useContext(SessionContext);
  
  // Clear session when home page is loaded
  useEffect(() => {
    clearSession();
  }, [clearSession]);

  return (
    <div className="d-flex flex-column min-vh-100 bg-pattern">
      <div className="home-container">
        <Header />
        
        <main>
          <section className="home-hero">
            <div className="container">
              <h2 className="display-4">Find Perfect Meeting Times</h2>
              <p className="lead">
                Schedule meetings effortlessly by sharing your availability and finding the perfect time that works for everyone.
              </p>
              
              <div className="d-flex justify-content-center gap-4">
                <Link to="/login" className="btn btn-primary btn-lg">
                  <i className="fas fa-sign-in-alt me-2"></i> Sign In
                </Link>
                <Link to="/register" className="btn btn-warning btn-lg">
                  <i className="fas fa-user-plus me-2"></i> Get Started
                </Link>
              </div>
            </div>
          </section>
          
          <section className="py-5">
            <div className="container">
              <div className="text-center mb-5">
                <h3 className="fw-bold">How It Works</h3>
                <p className="text-muted mx-auto" style={{ maxWidth: '700px' }}>
                  Our meeting scheduler makes finding common available times simple for everyone
                </p>
              </div>
              
              <div className="row g-4">
                <div className="col-md-4">
                  <div className="card feature-card">
                    <div className="feature-icon">
                      <i className="fas fa-calendar-plus"></i>
                    </div>
                    <h4>Create a Session</h4>
                    <p className="text-muted">
                      Start a new meeting session and invite participants with a unique code
                    </p>
                  </div>
                </div>
                
                <div className="col-md-4">
                  <div className="card feature-card">
                    <div className="feature-icon">
                      <i className="fas fa-clock"></i>
                    </div>
                    <h4>Share Availability</h4>
                    <p className="text-muted">
                      Everyone adds their available times throughout the week
                    </p>
                  </div>
                </div>
                
                <div className="col-md-4">
                  <div className="card feature-card">
                    <div className="feature-icon">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <h4>Find Optimal Times</h4>
                    <p className="text-muted">
                      Our system automatically finds the best meeting times for everyone
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          <section className="py-5">
            <div className="container">
              <div className="card p-5 text-center">
                <h3 className="fw-bold mb-3">Ready to simplify your scheduling?</h3>
                <p className="mb-4 text-muted">
                  Join thousands of teams already using Meeting Time Finder to coordinate their meetings
                </p>
                <div className="d-flex justify-content-center">
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Get Started Now
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
      
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default Home;