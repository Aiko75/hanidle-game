// src/utils/baseJsonApi.js
import Cookies from "js-cookie";

class BaseJsonApi {
  /**
   * Phương thức chung xử lý fetch với Relative Path
   */
  async request(path, options = {}) {
    const currentMode = Cookies.get("app_mode") || "anime";

    // Cấu hình Header mặc định
    const headers = {
      "Content-Type": "application/json",
      "x-app-mode": currentMode,
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
    };

    // Tự động stringify nếu body là object
    if (config.body && typeof config.body === "object") {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(path, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`[API Error at ${path}]:`, error.message);
      throw error;
    }
  }

  // Các phương thức dưới giữ nguyên
  get(path, headers = {}) {
    return this.request(path, { method: "GET", headers });
  }

  post(path, data, headers = {}) {
    return this.request(path, { method: "POST", body: data, headers });
  }

  put(path, data, headers = {}) {
    return this.request(path, { method: "PUT", body: data, headers });
  }

  delete(path, headers = {}) {
    return this.request(path, { method: "DELETE", headers });
  }
}

export const api = new BaseJsonApi();
