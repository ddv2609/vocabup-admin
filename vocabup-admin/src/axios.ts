import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/api",
  // baseURL: "https://vocabup-api.up.railway.app/api",
  withCredentials: true,
});

export default axiosInstance;
