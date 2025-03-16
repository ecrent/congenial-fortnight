import React, { useEffect } from 'react';
import Header from '../Header';
import Footer from '../Footer';

const Cookies = () => {
  const lastUpdated = "May 1, 2023";
  
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
            <h2 className="mb-2 fw-bold">Cookie Policy</h2>
            <p className="text-muted mb-4">Last updated: {lastUpdated}</p>
            
            <div className="mb-4">
              <h5>What Are Cookies</h5>
              <p>
                Cookies are small text files that are stored on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the website owners.
              </p>
            </div>
            
            <div className="mb-4">
              <h5>How We Use Cookies</h5>
              <p>We use cookies for the following purposes:</p>
              <ul>
                <li>
                  <strong>Essential Cookies:</strong> These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and account access.
                </li>
                <li>
                  <strong>Functionality Cookies:</strong> These cookies allow us to remember choices you make and provide enhanced features and content.
                </li>
                <li>
                  <strong>Analytics Cookies:</strong> These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
                </li>
                <li>
                  <strong>Authentication Cookies:</strong> These cookies help us identify users when they are logged into our website and services.
                </li>
              </ul>
            </div>
            
            <div className="mb-4">
              <h5>Types of Cookies We Use</h5>
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Cookie Type</th>
                      <th>Purpose</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Session Cookies</td>
                      <td>Used to maintain your session with our website</td>
                      <td>Temporary (deleted when browser is closed)</td>
                    </tr>
                    <tr>
                      <td>Authentication Cookies</td>
                      <td>Remember your login status</td>
                      <td>30 days</td>
                    </tr>
                    <tr>
                      <td>Preference Cookies</td>
                      <td>Remember your preferences and settings</td>
                      <td>1 year</td>
                    </tr>
                    <tr>
                      <td>Analytics Cookies</td>
                      <td>Help us understand website usage patterns</td>
                      <td>2 years</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="mb-4">
              <h5>Managing Cookies</h5>
              <p>
                Most web browsers allow you to control cookies through their settings preferences. However, limiting cookies may prevent you from taking full advantage of our website.
              </p>
              <p>You can generally manage cookies in your browser through these methods:</p>
              <ul>
                <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
                <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies</li>
              </ul>
            </div>
            
            <div className="mb-4">
              <h5>Third-Party Cookies</h5>
              <p>
                Some cookies may be placed by third-party services that appear on our pages. We use these services to enhance your experience with our website. These third parties have their own privacy policies and cookie practices.
              </p>
            </div>
            
            <div className="mb-4">
              <h5>Changes to This Cookie Policy</h5>
              <p>
                We may update our Cookie Policy from time to time. We will notify you of any changes by posting the new Cookie Policy on this page and updating the "Last updated" date.
              </p>
            </div>
            
            <div className="mb-4">
              <h5>Contact Us</h5>
              <p>
                If you have any questions about our Cookie Policy, please contact us at privacy@meetingtimefinder.com.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Cookies;
