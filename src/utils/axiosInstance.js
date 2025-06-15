import axios from "axios";

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API}`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// 요청 인터셉터: 토큰 설정
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 토큰 갱신 또는 401 처리
axiosInstance.interceptors.response.use(
  (response) => {
    const authHeader =
      response.headers["authorization"] || response.headers["Authorization"];

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const newToken = authHeader.substring(7).trim();

      localStorage.setItem("token", newToken);
    }
    return response;
  },
  (error) => {
    if (error.response) {

      if (error.response.status === 401) {
        localStorage.removeItem("token");

        try {

          if (window.location.pathname !== "/login") {

            window.location.replace("/login");

            setTimeout(() => {
              if (window.location.pathname !== "/login") {
                window.location.href = "/login";
              }
            }, 100);
          }
        } catch (redirectError) {
          console.error("리다이렉트 에러:", redirectError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
