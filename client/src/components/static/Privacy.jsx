import React, { useEffect } from 'react';
import Header from '../Header';
import Footer from '../Footer';

const Privacy = () => {
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
            <h2 className="mb-2 fw-bold">Privacy Policy</h2>
            <p className="text-muted mb-4">Last updated: {lastUpdated}</p>
            
            <div className="mb-4">
              <h5>Introduction</h5>
              <p>
                Meeting Time Finder ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
              </p>
              <p>
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
              </p>
            </div>
            
            <div className="mb-4">
              <h5>Information We Collect</h5>
              <p>We may collect information about you in various ways, including:</p>
              <ul>
                <li>
                  <strong>Personal Data:</strong> Name, email address, and other contact information you provide when registering for an account or contacting us.
                </li>
                <li>
                  <strong>Usage Data:</strong> Information about how you use our website and services, including your browser type, IP address, pages visited, and time spent on the site.
                </li>
                <li>
                  <strong>Schedule Data:</strong> Information about your availability that you provide to coordinate meetings.
                </li>
              </ul>
            </div>
            
            <div className="mb-4">
              <h5>How We Use Your Information</h5>
              <p>We may use the information we collect for various purposes, including to:</p>
              <ul>
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and manage user accounts</li>
                <li>Respond to comments, questions, and requests</li>
                <li>Send you technical notices, updates, security alerts, and support messages</li>
                <li>Develop new products and services</li>
                <li>Protect against, identify, and prevent fraud and other illegal activity</li>
              </ul>
            </div>
            
            <div className="mb-4">
              <h5>Sharing Your Information</h5>
              <p>We may share your information in the following situations:</p>
              <ul>
                <li>With other users as part of the meeting coordination process</li>
                <li>With service providers who perform services on our behalf</li>
                <li>If required by law or in response to legal process</li>
                <li>To protect our rights, privacy, safety, or property</li>
                <li>In connection with a business transaction such as a merger or acquisition</li>
              </ul>
            </div>
            
            <div className="mb-4">
              <h5>Data Security</h5>
              <p>
                We implement appropriate technical and organizational measures to protect the information we collect. However, no method of transmission over the Internet or electronic storage is 100% secure, so we cannot guarantee absolute security.
              </p>
            </div>
            
            <div className="mb-4">
              <h5>Your Rights</h5>
              <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
              <ul>
                <li>Right to access the personal information we hold about you</li>
                <li>Right to correct inaccurate or incomplete information</li>
                <li>Right to delete your personal information</li>
                <li>Right to restrict or object to our processing of your information</li>
                <li>Right to data portability</li>
              </ul>
              <p>
                To exercise these rights, please contact us at privacy@meetingtimefinder.com.
              </p>
            </div>
            
            <div className="mb-4">
              <h5>Changes to This Privacy Policy</h5>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </div>
            
            <div className="mb-4">
              <h5>Contact Us</h5>
              <p>
                If you have any questions about this Privacy Policy, please contact us at privacy@meetingtimefinder.com.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Privacy;
