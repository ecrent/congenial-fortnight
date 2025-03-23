import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer mt-auto py-5 bg-light">
      <div className="container">
        <div className="row mb-4">
          <div className="col-md-5 mb-4">
            <h5 className="fw-bold mb-3">Free Time Finder</h5>
            <p className="text-muted">
              The easiest way to find the perfect meeting time for your team or group.
              Our scheduling tool helps teams coordinate across time zones and busy calendars.
            </p>
            <div className="social-links mt-3">
              <a href="https://facebook.com/freetimefinder" className="text-decoration-none me-3" aria-label="Facebook">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="https://linkedin.com/company/freetimefinder" className="text-decoration-none me-3" aria-label="LinkedIn">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
          
          <div className="col-md-3 mb-4">
            <h6 className="fw-bold mb-3">Company</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/about" className="text-decoration-none text-muted">About</Link></li>
              <li className="mb-2"><Link to="/team" className="text-decoration-none text-muted">Team</Link></li>
              <li className="mb-2"><Link to="/careers" className="text-decoration-none text-muted">Careers</Link></li>
            </ul>
          </div>
          
          <div className="col-md-4 mb-4">
            <h6 className="fw-bold mb-3">Contact Us</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <i className="fas fa-envelope me-2 text-muted"></i>
                <a href="mailto:contact@freetimefinder.com" className="text-decoration-none text-muted">contact@freetimefinder.com</a>
              </li>
              <li className="mb-2">
                <i className="fas fa-phone me-2 text-muted"></i>
                <a href="tel:+1234567890" className="text-decoration-none text-muted">+1 (234) 567-890</a>
              </li>
              <li>
                <i className="fas fa-map-marker-alt me-2 text-muted"></i>
                <span className="text-muted">123 Calendar Street, Schedule City</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom py-3 border-top">
          <div className="d-flex flex-wrap justify-content-between align-items-center">
            <p className="text-muted mb-2 mb-md-0">© {currentYear} Free Time Finder. All rights reserved.</p>
            <div className="footer-links">
              <Link to="/privacy" className="text-decoration-none text-muted me-3">Privacy</Link>
              <Link to="/terms" className="text-decoration-none text-muted me-3">Terms</Link>
              <Link to="/cookies" className="text-decoration-none text-muted">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
