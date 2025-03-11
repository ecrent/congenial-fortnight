import React from 'react'
import { Link } from 'react-router-dom'
import Header from './Header'

const Home = () => {
  return (
    <div>
      <Header />
      <div className="text-center my-5">
        <h2>Meeting Time Finder</h2>
        <p className="lead">Please login or register to continue.</p>
        <div className="mt-4">
          <Link to="/login" className="btn btn-primary me-2">Login</Link>
          <Link to="/register" className="btn btn-success">Register</Link>
        </div>
      </div>
    </div>
  )
}

export default Home