import axios, { AxiosError } from "axios";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_BASE_URI!,
  withCredentials: true,
});

axios.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<{ message: string }>) => {
    const isJWTError = error.response?.data.message;
    if (isJWTError === "jwt expired") {
      await axiosInstance.post("/auth/refresh-token");
    }
    return Promise.reject(error);
  }
);
