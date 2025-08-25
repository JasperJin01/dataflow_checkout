// API配置
export const API_CONFIG = {
  host: '10.12.60.75',
  port: 8200
};

export const getApiUrl = (path) => {
  return `http://${API_CONFIG.host}:${API_CONFIG.port}${path}`;
};

export default {
  BASE_URL: `http://${API_CONFIG.host}:${API_CONFIG.port}`,
  getApiUrl
};
