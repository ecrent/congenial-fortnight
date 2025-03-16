import React, { useEffect } from 'react';
import Header from '../Header';
import Footer from '../Footer';

const Careers = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="d-flex flex-column min-vh-100 bg-pattern">
      <Header />
      
      <div className="home-container flex-grow-1 py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <h2 className="mb-4 fw-bold">Careers at Meeting Time Finder</h2>
            
            <div className="card mb-5">
              <div className="card-body">
                <h4 className="card-title mb-3">Join Our Mission</h4>
                <p className="card-text">
                  At Meeting Time Finder, we're building tools that help teams work better together by solving the universal challenge of scheduling. We're a remote-first company that values work-life balance, continuous learning, and creating impact through technology.
                </p>
              </div>
            </div>
            
            <h4 className="mb-4">Why Work With Us</h4>
            
            <div className="row g-4 mb-5">
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">Remote-First Culture</h5>
                    <p className="card-text">Work from anywhere with flexible hours. We focus on results, not time spent at a desk.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">Continuous Learning</h5>
                    <p className="card-text">We provide a learning stipend and encourage attending conferences and taking courses.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">Competitive Compensation</h5>
                    <p className="card-text">We offer competitive salaries, equity options, and comprehensive benefits.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">Make an Impact</h5>
                    <p className="card-text">Work on products used by thousands of teams to solve real problems.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <h4 className="mb-4">Our Hiring Process</h4>
            <ol className="mb-5">
              <li className="mb-2">Application review (1-2 business days)</li>
              <li className="mb-2">Initial video call with our People team (30 minutes)</li>
              <li className="mb-2">Technical or role-specific assessment (varies by position)</li>
              <li className="mb-2">Team interview with potential colleagues (1 hour)</li>
              <li>Final interview with leadership (45 minutes)</li>
            </ol>
            
            <div className="card bg-light mb-5">
              <div className="card-body text-center p-5">
                <h4 className="mb-3">We're Growing!</h4>
                <p className="mb-4">
                  While we don't have specific openings listed at the moment, we're always interested in connecting with talented individuals.
                </p>
                <a href="mailto:careers@meetingtimefinder.com" className="btn btn-primary">
                  Contact Our Recruiting Team
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Careers;
