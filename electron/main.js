/**
 * electron/main.js - Proceso principal de Electron para "Impostor de Catequesis"
 */

const { app, BrowserWindow, Menu, dialog, shell } = require("electron");
const appInfo = require("../package.json");
const path = require("path");
const { existsSync } = require("fs");

let mainWindow = null;
const isDev =
  process.argv.includes("--dev") || process.env.NODE_ENV === "development";

function getIconPath() {
  if (isDev) {
    return path.join(__dirname, "../src/assets/icons/favicon.ico");
  }
  const prodIcon = path.join(process.resourcesPath, "assets/icons/favicon.ico");
  if (existsSync(prodIcon)) return prodIcon;
  return path.join(process.resourcesPath, "assets/icons/favicon.png");
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 480,
    height: 900,
    minWidth: 360,
    minHeight: 640,
    title: "Impostor de Catequesis",
    icon: getIconPath(),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      preload: path.join(__dirname, "preload.js"),
    },
    backgroundColor: "#1a3a6b",
    show: false,
  });
  const session = mainWindow.webContents.session;
  session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          "default-src 'self';",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval';",
          "style-src 'self' 'unsafe-inline';",
          "img-src 'self' data: https:;",
          "connect-src 'self' http://localhost:4200;",
        ].join(" "),
      },
    });
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:4200");
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, "../www/index.html");
    mainWindow.loadFile(indexPath).catch((err) => {
      dialog.showErrorBox(
        "Error al cargar la aplicación",
        `No se encontró www/index.html.\n\nAsegúrate de haber ejecutado:\nnpm run build:angular\n\nDetalle: ${err.message}`,
      );
    });
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    if (!isDev) mainWindow.focus();
  });

  mainWindow.webContents.on("did-fail-load", (event, errorCode, errorDesc) => {
    console.error("❌ Error al cargar:", errorCode, errorDesc);
    if (isDev && errorCode === -102) {
      dialog
        .showMessageBox(mainWindow, {
          type: "warning",
          title: "Servidor no encontrado",
          message: "No se puede conectar a http://localhost:4200",
          detail:
            'Asegúrate de que "ng serve" esté corriendo en otra terminal.\n\nEjecuta: npm start',
          buttons: ["Reintentar", "Cerrar"],
        })
        .then(({ response }) => {
          if (response === 0) mainWindow.reload();
          else mainWindow.close();
        });
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http")) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  buildMenu();
}

function buildMenu() {
  const template = [
    {
      label: "Aplicación",
      submenu: [
        {
          label: "Acerca de Impostor de Catequesis",
          accelerator: "F1",
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "Acerca de",
              message: "Impostor de Catequesis",
              detail:
                "Versión " +
                appInfo.version +
                "\nJuego social catequético creado con mucho amor ❤️",
              buttons: ["Cerrar"],
            });
          },
        },
        { type: "separator" },
        {
          label: "Salir",
          accelerator: "Alt+F4",
          click: () => app.quit(),
        },
      ],
    },
    ...(isDev
      ? [
          {
            label: "🔧 Desarrollo",
            submenu: [
              {
                label: "Recargar",
                accelerator: "Ctrl+R",
                click: () => mainWindow?.reload(),
              },
              {
                label: "DevTools",
                accelerator: "F12",
                click: () => mainWindow?.webContents.toggleDevTools(),
              },
            ],
          },
        ]
      : []),
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});

process.on("uncaughtException", (error) => {
  console.error("💥 Error no capturado:", error);
  dialog.showErrorBox("Error inesperado", error.message);
});
