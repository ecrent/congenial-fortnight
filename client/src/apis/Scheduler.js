import axios from 'axios';

// Check that this URL is correct and accessible from your client
const Scheduler = axios.create({
  baseURL: 'https://bug-free-space-waffle-r9v99g7q49jc5wj7-3000.app.github.dev/api/v1',
});

// Add a request interceptor to include the JWT token
Scheduler.interceptors.request.use(
  (config) => {
    // Get token from sessionStorage
    const accessToken = sessionStorage.getItem('accessToken');
    
    // If token exists, add to headers
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
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
        
        // Try to get new tokens
        const response = await axios.post(
          `${Scheduler.defaults.baseURL}/users/refresh-token`,
          { refreshToken }
        );
        
        // If refresh successful, update tokens and retry original request
        if (response.data.status === 'success') {
          sessionStorage.setItem('accessToken', response.data.data.accessToken);
          sessionStorage.setItem('refreshToken', response.data.data.refreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
          return axios(originalRequest);
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