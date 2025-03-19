import axios from 'axios';

// Use the environment variable instead of hardcoded URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
console.log('Using API URL:', API_URL);

const Scheduler = axios.create({
  baseURL: `${API_URL}/api/v1`,
  withCredentials: true // Important for CORS with credentials
});

// Add this function before the axios interceptor
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

// Add a request interceptor to include the JWT token
Scheduler.interceptors.request.use(
  (config) => {
    // Get token from sessionStorage
    const accessToken = sessionStorage.getItem('accessToken');
    
    // If token exists, add to headers
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      console.log('Token added to request:', accessToken.substring(0, 10) + '...');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
Scheduler.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Check if response exists to avoid TypeError
    if (!error.response) {
      return Promise.reject(error);
    }
    
    const originalRequest = error.config;
    
    // If the error is due to an expired token and we haven't tried to refresh yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Get refresh token
        const refreshToken = sessionStorage.getItem('refreshToken');
        if (!refreshToken) {
          // No refresh token, user needs to login again
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('refreshToken');
          return Promise.reject(error);
        }

        // Consider adding a refresh token expiration check
        if (refreshToken && !isTokenExpired(refreshToken)) {
          // Try refresh flow
          const response = await axios.post(
            `${Scheduler.defaults.baseURL}/users/refresh-token`,
            { refreshToken },
            { withCredentials: true } // Make sure this request also has withCredentials
          );
          
          // If refresh successful, update tokens and retry original request
          if (response.data.status === 'success') {
            sessionStorage.setItem('accessToken', response.data.data.accessToken);
            sessionStorage.setItem('refreshToken', response.data.data.refreshToken);
            
            originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
            return axios(originalRequest);
          }
        } else {
          // Redirect to login immediately
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('refreshToken');
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // Token refresh failed, clear tokens and redirect to login
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        return Promise.reject(refreshError);
      }
    }
    
    // For other errors, just pass them through
    return Promise.reject(error);
  }
);

export default Scheduler;