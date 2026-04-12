// electron/main.js
// Punto de entrada de Electron para la versión de escritorio (Windows/Mac/Linux)

const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow;

function createWindow() {
  // Crear la ventana principal del juego
  mainWindow = new BrowserWindow({
    width: 480,
    height: 900,
    minWidth: 360,
    minHeight: 640,
    title: 'Impostor de Catequesis',
    icon: path.join(__dirname, '../src/assets/icon/favicon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
    backgroundColor: '#1a3a6b',
    show: false, // Esperar a que cargue para mostrar
  });

  // En desarrollo: cargar desde servidor Angular
  const isDev = process.argv.includes('--dev');
  const startUrl = isDev
    ? 'http://localhost:4200'
    : url.format({
        pathname: path.join(__dirname, '../www/index.html'),
        protocol: 'file:',
        slashes: true,
      });

  mainWindow.loadURL(startUrl);

  // Mostrar ventana cuando esté lista (evita parpadeo blanco)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Menú minimalista
  const menuTemplate = [
    {
      label: 'Juego',
      submenu: [
        { label: 'Inicio', click: () => mainWindow.webContents.executeJavaScript("window.location.href='/'") },
        { type: 'separator' },
        { label: 'Salir', role: 'quit' },
      ],
    },
    {
      label: 'Ver',
      submenu: [
        { label: 'Pantalla completa', role: 'togglefullscreen' },
        { label: 'Recargar', role: 'reload' },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
