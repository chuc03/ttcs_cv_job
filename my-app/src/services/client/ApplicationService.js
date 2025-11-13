import axios from "axios";
import { BASE_API } from "@types/api";
import { ApiResponse } from "@types/response/ApiResponse";
import { a } from "framer-motion/client";

const axiosClient = axios.create({
  baseURL: BASE_API,
  withCredentials: true,
});

export const applyJob = async (data) => {
  try {
    const response = await axiosClient.post("/application", data);
    const result = response.data;
    if (!result.success) {
      throw new Error(result.message || "Ứng tuyển thất bại!");
    }
    return new ApiResponse(result.success, result.data);
  } catch (error) {
    console.error("Error applying job:", error);
    const message = error.response?.data?.message || error.message;
    return new ApiResponse(false, null, [message]);
  }
};

export const getApplicationsByUser = async () => {
  try {
    const response = await axiosClient.get("/application/my-applications");
    const result = response.data;
    if (!result.success) {
      throw new Error(result.message || "Ứng tuyển thất bại!");
    }
    return new ApiResponse(result.success, result.data);
  } catch (error) {
    console.error("Error applying job:", error);
    const message = error.response?.data?.message || error.message;
    return new ApiResponse(false, null, [message]);
  }
};
