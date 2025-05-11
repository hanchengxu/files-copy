const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  selectFiles: () => ipcRenderer.invoke('select-files'),
  selectDestination: () => ipcRenderer.invoke('select-destination'),
  copyFiles: (files, destination, count) => ipcRenderer.invoke('copy-files', files, destination, count)
});
