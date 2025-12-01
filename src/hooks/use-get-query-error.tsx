import { AxiosError } from "axios";

export const useGetQueryError = (error: AxiosError<{ message: string }>) => {
  const errorMessage =
    error.response?.data.message ||
    "Something went wrong. Please try again later!";
  return { errorMessage };
};
