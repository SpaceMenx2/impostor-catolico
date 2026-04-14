/**
 * electron/preload.js
 * ─────────────────────────────────────────────────────────────────────────────
 * ¿Qué es el preload?
 *
 *   Es un script que corre en un contexto especial: tiene acceso a Node.js
 *   PERO también al DOM del renderer (Angular). Es el "puente seguro" entre
 *   los dos mundos.
 *
 *   Sin preload → para usar APIs de Electron tendrías que activar
 *   nodeIntegration: true, lo cual es PELIGROSO (cualquier XSS podría
 *   acceder a tu sistema de archivos).
 *
 *   Con preload + contextBridge → expones SOLO lo que querés, de forma
 *   controlada y segura.
 *
 * ¿Cómo usar desde Angular?
 *
 *   // En cualquier servicio/componente Angular:
 *   const electronAPI = (window as any).electronAPI;
 *   if (electronAPI) {
 *     // Estamos corriendo en Electron
 *     electronAPI.getVersion().then(v => console.log('Versión:', v));
 *   } else {
 *     // Estamos en el navegador web (no en Electron)
 *   }
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { contextBridge, ipcRenderer } = require('electron');

// contextBridge.exposeInMainWorld() hace disponible el objeto en window.electronAPI
contextBridge.exposeInMainWorld('electronAPI', {

  // ── Información de la app ─────────────────────────────────────────────────
  // Retorna la versión del package.json
  getVersion: () => ipcRenderer.invoke('app:version'),

  // ── Plataforma ─────────────────────────────────────────────────────────────
  // Útil para mostrar/ocultar features según el OS
  platform: process.platform, // 'win32', 'darwin', 'linux'
  isElectron: true,            // Para detectar si estamos en Electron vs browser

  // ── Ejemplo: guardar datos localmente ─────────────────────────────────────
  // (Descomenta y expande según necesites)
  // saveGame: (data) => ipcRenderer.invoke('game:save', data),
  // loadGame: () => ipcRenderer.invoke('game:load'),
});

// ── Log de confirmación (visible en la consola de DevTools) ──────────────────
console.log('✅ Preload cargado correctamente - electronAPI disponible en window');