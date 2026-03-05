// API配置（修改成阿里云服务器ip）
export const API_CONFIG = {
  host: '47.110.126.229',
  port: 8200
};

export const getApiUrl = (path) => {
  return `http://${API_CONFIG.host}:${API_CONFIG.port}${path}`;
};

export default {
  BASE_URL: `http://${API_CONFIG.host}:${API_CONFIG.port}`,
  getApiUrl
};
