const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs/promises');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  win.loadFile('index.html');
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

ipcMain.handle('copy-files', async (event, files, destination, count) => {
   try {
    for (const file of files) {
      const ext = path.extname(file);
      const baseName = path.basename(file, ext);

      for (let i = 1; i <= count; i++) {
        const newName = `${baseName}_${i}${ext}`;
        const targetPath = path.join(destination, newName);
        await fs.copyFile(file, targetPath);
      }
    }

    return { success: true };
  } catch (err) {
    return { success: false, message: err.message };
  }
});