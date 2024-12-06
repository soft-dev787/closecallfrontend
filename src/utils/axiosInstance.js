import axios from "axios";
import { getBackendURL } from "./getBackendURL";

export const axiosInstance = axios.create({
  baseURL: getBackendURL(),
  headers: {
    "ngrok-skip-browser-warning": "1234",
  },
});
