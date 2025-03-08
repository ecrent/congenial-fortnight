import React from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'

const Home = () => {
  return (
    <div>
      <Header />
      <div className="text-center my-5">
        <h2>Find the perfect meeting time with your group</h2>
        <p className="lead">Create a session, share the session code, and easily find times when everyone is available.</p>
        <div className="mt-4">
          <Link to="/join" className="btn btn-primary btn-lg">Start Scheduling</Link>
        </div>
      </div>
    </div>
  )
}

export default Home