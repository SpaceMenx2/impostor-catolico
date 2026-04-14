/**
 * electron/main.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Proceso principal de Electron para "Impostor de Catequesis"
 *
 * ¿Qué es el proceso principal?
 *   Electron tiene DOS tipos de procesos:
 *   1. Main process  → Este archivo. Corre en Node.js. Controla ventanas.
 *   2. Renderer process → La app Angular que corre dentro del BrowserWindow.
 *
 * MODOS:
 *   --dev  → Carga desde http://localhost:4200 (ng serve corriendo)
 *   prod   → Carga desde www/index.html (build de Angular)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { app, BrowserWindow, Menu, dialog, shell } = require('electron');
const path = require('path');

// ── Variables globales ────────────────────────────────────────────────────────
let mainWindow = null;

// ¿Estamos en modo desarrollo?
// Se activa con: npx electron electron/main.js --dev
const isDev = process.argv.includes('--dev') || process.env.NODE_ENV === 'development';

// ── Función para resolver íconos ──────────────────────────────────────────────
function getIconPath() {
  if (isDev) {
    // En desarrollo, los assets están en src/
    return path.join(__dirname, '../src/assets/icons/favicon.ico');
  }
  // En producción (instalador), electron-builder copia los assets a resourcesPath
  const prodIcon = path.join(process.resourcesPath, 'assets/icons/favicon.ico');
  // Fallback: si no encontró el .ico, intenta con .png
  const { existsSync } = require('fs');
  if (existsSync(prodIcon)) return prodIcon;
  return path.join(process.resourcesPath, 'assets/icons/favicon.png');
}

// ── Función principal: crea la ventana ───────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    // Tamaño inicial — simula pantalla de móvil (el diseño es Ionic)
    width: 480,
    height: 900,
    minWidth: 360,
    minHeight: 640,

    title: 'Impostor de Catequesis',
    icon: getIconPath(),

    webPreferences: {
      /**
       * nodeIntegration: false  → Angular NO puede usar require() de Node.
       *   Esto es SEGURO. Sin esto cualquier script en la web podría leer
       *   archivos de tu computadora.
       *
       * contextIsolation: true  → El preload.js corre en su propio contexto
       *   aislado. Es la forma MODERNA y segura de comunicar main ↔ renderer.
       *
       * preload → Script que se ejecuta ANTES de que cargue Angular.
       *   Úsalo para exponer APIs seguras al renderer vía contextBridge.
       */
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: !isDev, // En dev desactivamos para evitar errores de CORS con localhost
      preload: path.join(__dirname, 'preload.js'),
    },

    backgroundColor: '#1a3a6b', // Color de fondo mientras carga (tu color de app)
    show: false, // No mostrar hasta que esté lista (evita el parpadeo blanco)
  });

  // ── Carga del contenido ─────────────────────────────────────────────────────
  if (isDev) {
    // DESARROLLO: carga desde el servidor de Angular (ng serve)
    console.log('🔧 Modo desarrollo → http://localhost:4200');
    mainWindow.loadURL('http://localhost:4200');
    mainWindow.webContents.openDevTools(); // Abre DevTools automáticamente
  } else {
    // PRODUCCIÓN: carga desde el build de Angular (carpeta www/)
    const indexPath = path.join(__dirname, '../www/index.html');
    console.log('🚀 Modo producción →', indexPath);

    /**
     * ¡IMPORTANTE! Usamos loadFile() y NO loadURL('file://...')
     * loadFile() maneja correctamente las rutas relativas de Angular.
     */
    mainWindow.loadFile(indexPath).catch((err) => {
      dialog.showErrorBox(
        'Error al cargar la aplicación',
        `No se encontró www/index.html.\n\nAsegúrate de haber ejecutado:\nnpm run build:angular\n\nDetalle: ${err.message}`
      );
    });
  }

  // ── Eventos de la ventana ───────────────────────────────────────────────────

  // Mostrar ventana recién cuando terminó de cargar (sin parpadeo)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (!isDev) {
      mainWindow.focus();
    }
  });

  // Error al cargar (URL no responde, archivo no existe, etc.)
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDesc, validatedURL) => {
    console.error('❌ Error al cargar:', errorCode, errorDesc);

    if (isDev && errorCode === -102) {
      // -102 = CONNECTION_REFUSED → ng serve no está corriendo
      dialog.showMessageBox(mainWindow, {
        type: 'warning',
        title: 'Servidor no encontrado',
        message: 'No se puede conectar a http://localhost:4200',
        detail: 'Asegúrate de que "ng serve" esté corriendo en otra terminal.\n\nEjecuta: npm start',
        buttons: ['Reintentar', 'Cerrar'],
      }).then(({ response }) => {
        if (response === 0) mainWindow.reload();
        else mainWindow.close();
      });
    }
  });

  // Limpiar referencia cuando se cierra
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Abrir links externos en el navegador (no en Electron)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // ── Menú de la aplicación ───────────────────────────────────────────────────
  buildMenu();
}

// ── Menú personalizado ────────────────────────────────────────────────────────
function buildMenu() {
  const template = [
    {
      label: 'Aplicación',
      submenu: [
        {
          label: 'Acerca de Impostor de Catequesis',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Acerca de',
              message: 'Impostor de Catequesis',
              detail: 'Versión ' + app.getVersion() + '\nJuego social catequético',
              buttons: ['Cerrar'],
            });
          },
        },
        { type: 'separator' },
        {
          label: 'Salir',
          accelerator: 'Alt+F4',
          click: () => app.quit(),
        },
      ],
    },
    ...(isDev
      ? [
          {
            label: '🔧 Desarrollo',
            submenu: [
              {
                label: 'Recargar',
                accelerator: 'Ctrl+R',
                click: () => mainWindow?.reload(),
              },
              {
                label: 'DevTools',
                accelerator: 'F12',
                click: () => mainWindow?.webContents.toggleDevTools(),
              },
            ],
          },
        ]
      : []),
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ── Ciclo de vida de la app ───────────────────────────────────────────────────

// 'ready' se dispara cuando Electron terminó de inicializar
app.on('ready', createWindow);

// En Windows/Linux: cerrar todas las ventanas = salir de la app
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// En macOS: hacer click en el ícono del dock re-abre la ventana
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Manejo global de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('💥 Error no capturado:', error);
  dialog.showErrorBox('Error inesperado', error.message);
});