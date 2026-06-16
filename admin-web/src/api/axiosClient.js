import axios from "axios"


const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";   //just you can make put the linkin the vite.env

const axiosClient = axios.create({
  baseURL: BASE_URL,        
  headers: {
    "Content-Type": "application/json",
  },
});

//adding request interceptor
axiosClient.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");   //this checks for the access token in the local storage if it is there 

  if (accessToken) {                                            //if the access token is there it automatically attaches it to the request
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

//now we put a response interceptor in order to solve the problem with the refresh tokens 
axiosClient.interceptors.response.use(
  (response) => response,                       //if everything is okay keep it as it is

  async (error) => {          //if there is an error do this
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url!=="/auth/login") {     //if the request returns 401 and the request hasn't been retried we try refreshing
      originalRequest._retry = true;                                     //and if the original request is not in the login because we don't have tokens yet

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("No refresh token found");
        }

        const response = await axios.post(`${BASE_URL}/auth/refresh`, {   //get the refresh token and post it in the refresh token route
          refreshToken,
        });

        const newAccessToken = response.data.accessToken;       //get the new access token from the response and replace it

        localStorage.setItem("accessToken", newAccessToken);

        if (response.data.refreshToken) {
          localStorage.setItem("refreshToken", response.data.refreshToken); //I think here we replace the refresh token with a new refresh token if there was any with the response
        }

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return axiosClient(originalRequest);        //we do the original request again
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");    //if we do encounter an error we just reload

        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);


export default axiosClient;