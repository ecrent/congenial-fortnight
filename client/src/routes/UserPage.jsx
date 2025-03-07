import React from 'react';
import Header from '../components/Header';

function UserPage() {
  return (
    <div>
      <Header />
      <h1 className="text-center">User Profile</h1>
      <div className="card p-4 my-4">
        <p className="text-center">User profile information will be displayed here.</p>
      </div>
    </div>
  );
}

export default UserPage;
