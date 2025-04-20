import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_NODE_ENV == "development" ? import.meta.env.VITE_API_URL : "/api/v1",
    withCredentials: true

})
