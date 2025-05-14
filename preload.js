const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  selectFiles: () => ipcRenderer.invoke('select-files'),
  selectDestination: () => ipcRenderer.invoke('select-destination'),
  copyFile: (file) => ipcRenderer.invoke('copy-file', file),
  cancelCopy: (file) => ipcRenderer.invoke('cancel-copy', file),
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  receive: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
  getFilePath: (file) => {
    return webUtils.getPathForFile(file)
  }
});
