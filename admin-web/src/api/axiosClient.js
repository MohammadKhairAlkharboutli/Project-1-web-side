import axios from "axios"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";   //just you can make put the linkin the vite.env

const ARABIC_CHARACTER = /[\u0600-\u06FF]/;

function getUiLocale() {
  return typeof document !== "undefined" && document.documentElement.lang === "ar"
    ? "ar"
    : "en";
}

function containsArabicText(message) {
  if (Array.isArray(message)) {
    return message.some(containsArabicText);
  }

  return typeof message === "string" && ARABIC_CHARACTER.test(message);
}

function getEnglishErrorMessage(status) {
  const messages = {
    400: "We couldn't process that request. Please review the information and try again.",
    401: "Your session has expired. Please sign in again.",
    403: "You don't have permission to perform this action.",
    404: "The requested item could not be found.",
    409: "This action conflicts with the current information. Refresh the page and try again.",
    413: "The submitted file is too large. Please choose a smaller file.",
    422: "Please correct the highlighted information and try again.",
    429: "Too many requests were made. Please wait a moment and try again.",
  };

  return messages[status] || "We couldn't complete that request. Please try again.";
}

function normalizeErrorForEnglishUi(error) {
  const response = error?.response;
  const message = response?.data?.message;

  // Every screen reads errors from this client, but many still display the
  // backend message directly. Keep an English UI from exposing a localized
  // backend message if the API does not honor the language request.
  if (getUiLocale() !== "en" || !containsArabicText(message)) {
    return error;
  }

  const englishMessage = getEnglishErrorMessage(response.status);
  response.data.message = englishMessage;
  error.message = englishMessage;

  return error;
}

const axiosClient = axios.create({
  baseURL: BASE_URL,        
  headers: {
    "Content-Type": "application/json",
  },
});

//adding request interceptor
axiosClient.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");   //this checks for the access token in the local storage if it is there 

  // Keep the API response language aligned with the active portal language.
  config.headers["Accept-Language"] = getUiLocale();

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

        const response = await axios.post(
          `${BASE_URL}/auth/refresh`,
          { refreshToken },
          { headers: { "Accept-Language": getUiLocale() } },
        );

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

    return Promise.reject(normalizeErrorForEnglishUi(error));
  }
);


export default axiosClient;
