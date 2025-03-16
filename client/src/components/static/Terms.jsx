import React, { useEffect } from 'react';
import Header from '../Header';
import Footer from '../Footer';

const Terms = () => {
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
            <h2 className="mb-2 fw-bold">Terms of Service</h2>
            <p className="text-muted mb-4">Last updated: {lastUpdated}</p>
            
            <div className="mb-4">
              <h5>1. Acceptance of Terms</h5>
              <p>
                By accessing or using the Meeting Time Finder website and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </div>
            
            <div className="mb-4">
              <h5>2. Description of Service</h5>
              <p>
                Meeting Time Finder provides a platform for coordinating meeting times among groups of people. We reserve the right to modify, suspend, or discontinue any aspect of our services at any time.
              </p>
            </div>
            
            <div className="mb-4">
              <h5>3. User Accounts</h5>
              <p>
                To use certain features of our services, you may need to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
              </p>
              <p>
                You agree to provide accurate and complete information when creating your account and to update your information to keep it accurate and current.
              </p>
            </div>
            
            <div className="mb-4">
              <h5>4. User Conduct</h5>
              <p>You agree not to:</p>
              <ul>
                <li>Use the services for any illegal purpose</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Impersonate any person or entity</li>
                <li>Interfere with or disrupt the services or servers</li>
                <li>Attempt to gain unauthorized access to any part of the services</li>
                <li>Use the services to transmit harmful code or malware</li>
                <li>Collect or harvest user data without permission</li>
              </ul>
            </div>
            
            <div className="mb-4">
              <h5>5. Intellectual Property</h5>
              <p>
                The Meeting Time Finder services, including all content, features, and functionality, are owned by us or our licensors and are protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p>
                You may not copy, modify, distribute, sell, or lease any part of our services without our explicit permission.
              </p>
            </div>
            
            <div className="mb-4">
              <h5>6. Limitation of Liability</h5>
              <p>
                To the maximum extent permitted by law, Meeting Time Finder shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, resulting from your access to or use of our services.
              </p>
            </div>
            
            <div className="mb-4">
              <h5>7. Disclaimers</h5>
              <p>
                The services are provided "as is" and "as available" without warranties of any kind, either express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, or non-infringement.
              </p>
              <p>
                We do not warrant that the services will be uninterrupted or error-free, that defects will be corrected, or that the services are free of viruses or other harmful components.
              </p>
            </div>
            
            <div className="mb-4">
              <h5>8. Termination</h5>
              <p>
                We may terminate or suspend your access to our services immediately, without prior notice or liability, for any reason, including if you breach these Terms of Service.
              </p>
            </div>
            
            <div className="mb-4">
              <h5>9. Changes to Terms</h5>
              <p>
                We reserve the right to modify these Terms of Service at any time. We will provide notice of significant changes by updating the "Last updated" date at the top of these terms.
              </p>
              <p>
                Your continued use of our services after any such changes constitutes your acceptance of the new Terms of Service.
              </p>
            </div>
            
            <div className="mb-4">
              <h5>10. Governing Law</h5>
              <p>
                These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction in which we operate, without regard to its conflict of law provisions.
              </p>
            </div>
            
            <div className="mb-4">
              <h5>11. Contact Us</h5>
              <p>
                If you have any questions about these Terms of Service, please contact us at legal@meetingtimefinder.com.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Terms;
