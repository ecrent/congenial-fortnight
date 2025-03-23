import React, { useEffect } from 'react';
import Header from '../Header';
import Footer from '../Footer';

const Team = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Sample team members (removed images)
  const teamMembers = [
    {
      name: 'Alex Johnson',
      role: 'Founder & CEO',
      bio: 'Alex has over 15 years of experience in software development and project management. Before founding Meeting Time Finder, Alex led engineering teams at several tech companies.'
    },
    {
      name: 'Sam Rivera',
      role: 'CTO',
      bio: 'Sam brings expertise in developing scalable web applications and machine learning algorithms that power our scheduling optimization engine.'
    },
    {
      name: 'Jamie Chen',
      role: 'Head of Design',
      bio: 'With a background in user experience design, Jamie ensures that Meeting Time Finder is both beautiful and functional for all users.'
    },
    {
      name: 'Taylor Williams',
      role: 'Head of Customer Success',
      bio: 'Taylor works closely with our clients to ensure they get the most out of Free Time Finder and their feedback shapes our product roadmap.'
    }
  ];

  return (
    <div className="d-flex flex-column min-vh-100 bg-pattern">
      <Header />
      
      <div className="home-container flex-grow-1 py-5">
        <h2 className="mb-4 text-center fw-bold">Our Team</h2>
        <p className="text-center mb-5 text-muted mx-auto" style={{ maxWidth: '700px' }}>
          Meet the passionate people behind Free Time Finder who are dedicated to making scheduling easier for teams worldwide.
        </p>
        
        <div className="row g-4">
          {teamMembers.map((member, index) => (
            <div className="col-md-6" key={index}>
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title fw-bold">{member.name}</h5>
                  <p className="card-subtitle text-primary mb-2">{member.role}</p>
                  <p className="card-text">{member.bio}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-5">
          <h3 className="mb-4">Join Our Team</h3>
          <p className="mb-4 mx-auto" style={{ maxWidth: '700px' }}>
            We're always looking for talented individuals who are passionate about creating great software and solving real-world problems.
          </p>
          <a href="/careers" className="btn btn-primary">View Open Positions</a>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Team;
