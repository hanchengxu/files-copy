const { Certificate } = require('crypto');
const { app, BrowserWindow, ipcMain, dialog, webUtils } = require('electron');
const fs = require('fs');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false
    }
  });

  // win.loadFile('index.html');
  // 开发环境加载 Vite 开发服务器
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    // 生产环境加载构建后的文件
    win.loadFile(path.join(__dirname, 'renderer/dist/index.html'))
  }
  
  win.setMenu(null);
}

app.whenReady().then(createWindow);

ipcMain.handle('select-files', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] });
  return canceled ? [] : filePaths;
});

ipcMain.handle('select-destination', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  return canceled ? null : filePaths[0];
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let isCancelled = false;
let cancelList = [];

ipcMain.handle('copy-file', async (event, file) => {
  isCancelled = false;

  try {
    const { path: inputPath, localName, outputFolder, copyCount, id } = file;

    const ext = path.extname(localName);
    const baseName = path.basename(localName, ext);

    let count = 0;
    
    for (let i = 1; i <= copyCount; i++) { 
      const cancelIndex = cancelList.indexOf(id);
      if (isCancelled && cancelIndex !== -1) {
          console.log('stop')
          cancelList.splice(cancelIndex, 1)
          return { status: 'wait', id: id };
      }
      const newName = `${baseName}_${i}${ext}`;
      const destPath = path.join(outputFolder, newName);

      fs.copyFileSync(inputPath, destPath);
      count++
      // await sleep(5000);
    }
    if (count === file.copyCount) {
      return { status: "success", id: id }
    } else {
      return { status: "fail", id: id }
    }
  } catch (error) {
    console.error(error)
    return { status: "fail", id: id }
  }
});

ipcMain.handle('cancel-copy', (event, file) => {
  isCancelled = true;
  cancelList.push(file.id);
});


ipcMain.on('files-dropped', (event, filePaths) => {
  console.log('接收到文件:', filePaths);
  // 在这里处理文件
});