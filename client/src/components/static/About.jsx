import React, { useEffect } from 'react';
import Header from '../Header';
import Footer from '../Footer';

const About = () => {
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
            <h2 className="mb-4 fw-bold">About Meeting Time Finder</h2>
            
            <p className="mb-4">
              Meeting Time Finder was founded in 2023 with a simple mission: to eliminate the pain of scheduling meetings across teams, time zones, and busy calendars.
            </p>
            
            <div className="card mb-5">
              <div className="card-body">
                <h4 className="card-title mb-3">Our Mission</h4>
                <p className="card-text">
                  To create the most intuitive and efficient scheduling experience that helps teams collaborate more effectively by finding the perfect time for everyone.
                </p>
              </div>
            </div>
            
            <h4 className="mb-3">Our Story</h4>
            <p className="mb-3">
              After experiencing the frustration of coordinating meetings across multiple time zones and calendars, our founder set out to create a better solution. What began as a simple tool for internal use quickly evolved into a comprehensive platform designed to solve the universal problem of finding common availability.
            </p>
            
            <p className="mb-3">
              Today, Free Time Finder helps thousands of teams worldwide save time and reduce the friction of scheduling. Our platform's unique approach focuses on finding optimal meeting times based on everyone's real availability, rather than endless back-and-forth communications.
            </p>
            
            <h4 className="mb-3 mt-5">Our Values</h4>
            <div className="row g-4 mb-5">
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">Simplicity</h5>
                    <p className="card-text">We believe powerful tools should be simple to use. Our interface is designed to be intuitive and straightforward.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">Efficiency</h5>
                    <p className="card-text">We respect your time. Our platform is optimized to help you schedule meetings quickly and find the best times.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">Collaboration</h5>
                    <p className="card-text">We build tools that bring teams together and make working across distances and time zones easier.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">Innovation</h5>
                    <p className="card-text">We continuously improve our platform based on user feedback and emerging technologies.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default About;
