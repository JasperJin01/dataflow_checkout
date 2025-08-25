const { contextBridge } = require('electron');

// 暴露必要的API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 保留基本的electron环境标识
  isElectron: true
});