const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    autoHideMenuBar: true, // Masque le menu tant que la touche Alt n'est pas pressée
    webPreferences: {
      // Pour production avec le bundle, vous pouvez désactiver nodeIntegration si vous n'en avez pas besoin
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Chargez le fichier index.html construit par Vite depuis le dossier "dist"
  mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  //mainWindow.webContents.openDevTools();  // Ouvre automatiquement la console
  
}

app.whenReady().then(createWindow);

