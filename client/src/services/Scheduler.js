import axios from 'axios';

// Create an axios instance with the correct base URL
const Scheduler = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default Scheduler;
