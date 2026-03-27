import axios from "axios";
const API = axios.create({
    baseURL:"http://localhost:9091/api/v1",
    withCredentials: true

})
API.interceptors.request.use((req) => {
    if (req.url.includes('/auth/login') || req.url.includes('/auth/signup') || req.url.includes('/hotels/all') ) {
    return req;
  }
    const token = localStorage.getItem("token");
    if (token && token !== 'undefined' && token !== 'null') {
    req.headers.Authorization = `Bearer ${token}`;
  }
    return req;
});
API.interceptors.response.use(
  (response) => {
    // If the request succeeds, just pass it through normally
    return response;
  },
  async (error) => {
    // Grab the original request that just failed
    const originalRequest = error.config;

    // Check if the error is 401, AND it's not the login route, AND we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/')) {
      originalRequest._retry = true; // Mark as retried to prevent an infinite loop

      try {
        // 1. Silently ask the backend for a new access token
        // (We use a standard axios call here, NOT our custom API instance, to avoid interceptor loops)
        const refreshResponse = await axios.post('http://localhost:9091/api/v1/auth/refresh', {}, {
          withCredentials: true // Crucial if your refresh token is in an HttpOnly cookie
        });

        // 2. Grab the fresh token from the backend
        const newToken = refreshResponse.data.token; 

        // 3. Save it to localStorage
        localStorage.setItem('token', newToken);

        // 4. Update the failed original request with the brand new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // 5. Re-run the original request! The user won't even notice it failed the first time.
        return API(originalRequest);
        
      } catch (refreshError) {
        // If the refresh token ALSO fails (e.g., they haven't logged in for 30 days)
        console.error('Session expired. Please log in again.');
        
        // Wipe the completely dead storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Kick them to the homepage/login screen
        window.location.href = '/'; 
        
        return Promise.reject(refreshError);
      }
    }

    // If it's a different error (like a 404 or 500), just reject it normally
    return Promise.reject(error);
  }
);

export default API;
