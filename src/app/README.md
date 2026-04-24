# 🎭 Impostor de Catequesis — Guía de Build Completa

> **¿Sos principiante? Perfecto.** Esta guía explica *por qué* cada paso,
> no solo *qué* ejecutar.

---

## 📋 Tabla de Contenidos

1. [Arquitectura del proyecto](#arquitectura)
2. [Prerequisitos](#prerequisitos)
3. [Setup inicial](#setup-inicial)
4. [Generar ícono .ico para Windows](#iconos)
5. [Build para Windows (.exe)](#windows)
6. [Build para Android (.apk)](#android)
7. [Desarrollo con hot-reload](#desarrollo)
8. [Errores comunes y soluciones](#errores)
9. [Checklist de archivos](#checklist)
10. [Conceptos clave](#conceptos)

---

## 🏗️ Arquitectura del proyecto {#arquitectura}

```
Tu app Angular/Ionic
        │
        ├── 🌐 NAVEGADOR WEB → ng serve / ng build
        │
        ├── 🖥️ WINDOWS (.exe)
        │       └── Electron envuelve tu app en una ventana de escritorio
        │           Tu app Angular corre adentro como si fuera un navegador.
        │
        └── 📱 ANDROID (.apk)
                └── Capacitor envuelve tu app en un WebView nativo.
                    Android Studio genera el APK firmado.
```

### ¿Por qué Angular + Electron + Capacitor?

| Tecnología | Rol | Output |
|-----------|-----|--------|
| **Angular** | Framework web | Genera `www/` con HTML/CSS/JS |
| **Ionic** | Componentes UI mobile-first | Estilos nativos en web |
| **Electron** | Wrapper de escritorio | `dist-electron/*.exe` |
| **Capacitor** | Bridge nativo | APK vía Android Studio |

**Flujo unificado:**
1. Angular genera `www/` (una sola vez para ambos targets)
2. Electron toma `www/` y lo empaqueta como app de escritorio
3. Capacitor toma `www/` y lo sincroniza con el proyecto Android

---

## ✅ Prerequisitos {#prerequisitos}

### Para Windows (.exe)

| Herramienta | Versión | Cómo instalar |
|------------|---------|---------------|
| **Node.js** | 18 o 20 LTS | [nodejs.org](https://nodejs.org) |
| **npm** | 9+ (viene con Node) | — |
| **Git** | cualquiera | [git-scm.com](https://git-scm.com) |

> **¿Cómo verificar?** Abrí PowerShell y ejecutá:
> ```powershell
> node --version   # debe mostrar v18.x.x o v20.x.x
> npm --version    # debe mostrar 9.x.x o superior
> ```

### Para Android (.apk)

| Herramienta | Por qué | Cómo instalar |
|------------|---------|---------------|
| **Android Studio** | Compila y firma el APK | [developer.android.com/studio](https://developer.android.com/studio) |
| **Java 17** | Requerido por Gradle | Incluido en Android Studio |
| **Android SDK 33+** | APIs de Android | Se instala desde Android Studio |

> **Consejo:** Al instalar Android Studio, elegí "Standard" y dejá que instale
> todo automáticamente. Después podés agregar más SDKs desde
> `Tools → SDK Manager`.

---

## 🚀 Setup inicial {#setup-inicial}

### Paso 1: Instalar dependencias

```powershell
# En la carpeta del proyecto:
npm install
```

**¿Qué hace esto?**
- Lee `package.json` y descarga todo en `node_modules/`
- El script `postinstall` corre automáticamente y descarga las
  dependencias nativas de Electron (binarios para tu plataforma)

> ⏱️ Primera vez puede tardar 5-10 minutos. Normal.

### Paso 2: Verificar que la app web funciona

```powershell
npm start
# Abrí http://localhost:4200 en el navegador
```

Si ves la app, todo está bien. Si no, revisá los errores en la terminal
antes de continuar.

---

## 🎨 Generar ícono .ico para Windows {#iconos}

Windows requiere un archivo `.ico` (diferente al `.png` que usás en web).

### Opción A: Script automático (recomendado)

```powershell
# Instalar la herramienta de conversión
npm install --save-dev png-to-ico

# Generar el .ico
node scripts/generate-icons.js
```

Esto crea `src/assets/icons/favicon.ico` a partir de tu `favicon.png`.

### Opción B: Online (si el script falla)

1. Ir a [icoconvert.com](https://icoconvert.com/)
2. Subir `src/assets/icons/favicon.png`
3. Seleccionar tamaños: `16x16`, `32x32`, `48x48`, `256x256`
4. Descargar y guardar como `src/assets/icons/favicon.ico`

> ⚠️ **Sin el .ico, el build de Windows falla.** Este paso es obligatorio.

---

## 🖥️ Build para Windows (.exe) {#windows}

### Modo rápido (todo en un comando)

```powershell
npm run build:win
```

**¿Qué hace esto internamente?**
```
npm run clean:build     → Borra dist-electron/ y www/ (limpia restos anteriores)
npm run build:angular   → ng build --configuration production --base-href ./
electron-builder --win  → Empaqueta Electron + tu app = instalador .exe
```

### El instalador aparece en:
```
dist-electron/
└── Impostor de Catequesis-Setup-1.0.0.exe   ← Este es tu instalador
```

### Modo "prueba rápida" (sin crear instalador)

Si solo querés ver cómo se ve la app en Electron antes de generar el instalador:

```powershell
npm run electron:prod
```

> Esto tarda menos porque no empaqueta el instalador, solo abre la ventana.

### ¿Qué significa cada flag?

| Flag | Significado |
|------|-------------|
| `--win` | Target = Windows |
| `--x64` | Arquitectura 64-bit |
| `--publish=never` | No subir a GitHub Releases |
| `--dir` | No crear instalador, solo carpeta (útil para probar) |

---

## 📱 Build para Android (.apk) {#android}

### Paso 1: Agregar la plataforma Android (solo la primera vez)

```powershell
npx cap add android
```

Esto crea la carpeta `android/` con el proyecto nativo de Android Studio.

> Si `android/` ya existe, saltear este paso.

### Paso 2: Compilar Angular y sincronizar

```powershell
npm run android
# Equivale a:
# ionic build              → Genera www/
# npx cap sync android     → Copia www/ a android/app/src/main/assets/public/
# npx cap open android     → Abre Android Studio
```

### Paso 3: Generar el APK en Android Studio

Una vez en Android Studio:

1. Esperar que termine el "Gradle sync" (barra de progreso abajo)
2. Ir a **Build → Generate Signed Bundle / APK...**
3. Elegir **APK**
4. Si es la primera vez: **Create new keystore** (guardá bien el archivo `.jks` y la contraseña, ¡los necesitás para futuras versiones!)
5. En "Build Variants" elegir **release**
6. Click en **Finish**

El APK se genera en:
```
android/app/release/app-release.apk
```

### Paso 4: Instalar en el celular

**Por cable (ADB):**
```powershell
# Conectá el celular con USB, activá "Depuración USB" en el celular
npx cap run android
```

**Manualmente:**
Copiá el `.apk` al celular y abrilo desde el administrador de archivos.
(Necesitás activar "Instalar apps de fuentes desconocidas" en Ajustes)

---

## 🔄 Desarrollo con hot-reload {#desarrollo}

### Electron (app de escritorio en tiempo real)

```powershell
npm run electron:dev
```

**¿Qué hace?**
- Terminal 1: `ng serve` → servidor web en localhost:4200
- Terminal 2: espera que ng serve esté listo, luego abre Electron apuntando a localhost:4200
- Cada cambio en tu código Angular recarga la app en Electron automáticamente

### Android (en dispositivo físico con live reload)

1. Activar el live reload en `capacitor.config.ts`:
   ```typescript
   server: {
     url: 'http://TU_IP_LOCAL:4200',  // ej: http://192.168.1.5:4200
     cleartext: true,
   }
   ```
2. Correr `ng serve` en la PC
3. `npx cap sync android && npx cap run android`

> ⚠️ **Acordate de comentar `server.url`** antes de generar el APK final.
> Si no, la app intentará conectarse a tu PC y no funcionará sola.

---

## 🚨 Errores comunes y soluciones {#errores}

### ❌ `Error: ENOENT: no such file or directory, 'www/index.html'`

**Causa:** No compilaste Angular antes de correr Electron Builder.

**Solución:**
```powershell
npm run build:angular   # Primero esto
npm run build:electron  # Luego esto
# O directamente:
npm run build:win       # Hace los dos pasos automáticamente
```

---

### ❌ `icon.ico: Unable to load image`

**Causa:** Falta el archivo `src/assets/icons/favicon.ico`.

**Solución:**
```powershell
node scripts/generate-icons.js
# O manual: convertí tu .png a .ico en icoconvert.com
```

---

### ❌ `Error: spawn electron ENOENT` o `electron not found`

**Causa:** Electron no está instalado en `node_modules`.

**Solución:**
```powershell
npm install
# Si persiste:
npm install electron --save-dev
```

---

### ❌ `App sandbox is not enabled`  o errores de firma en Windows

**Causa:** electron-builder intenta firmar el ejecutable pero no tenés certificado.

**Solución:** El `package.json` ya tiene `"forceCodeSigning": false` para evitar esto.
Si igual aparece, asegurate que el build section del `package.json` tenga:
```json
"win": {
  "forceCodeSigning": false,
  "publish": null
}
```

---

### ❌ `ng: command not found` en PowerShell

**Causa:** `@angular/cli` no está en el PATH global.

**Solución:**
```powershell
# Opción 1: usar npx (sin instalar globalmente)
npx ng serve

# Opción 2: instalar globalmente
npm install -g @angular/cli
```

---

### ❌ `Gradle build failed` en Android Studio

**Causas comunes y soluciones:**

| Síntoma | Solución |
|---------|---------|
| `SDK not found` | Instalá Android SDK 33 desde `Tools → SDK Manager` |
| `Java version mismatch` | En `File → Project Structure → SDK Location` verificá Java 17 |
| `Could not resolve dependencies` | Revisá tu conexión a internet y corré Build → Clean Project |
| `www/ folder empty` | Corrí `npm run android:sync` antes de abrir Android Studio |

---

### ❌ La app en Electron muestra pantalla en blanco

**Pasos de diagnóstico:**
1. Presioná `F12` para abrir DevTools
2. Mirá la pestaña "Console" para ver errores
3. Mirá la pestaña "Network" para ver si hay recursos que no cargan
4. Revisá que `www/index.html` exista y no esté vacío

**Causa más común:** El `<base href>` de Angular no coincide.
El script `build:angular` ya incluye `--base-href ./` que lo corrige.

---

### ❌ `Error: EACCES` o permisos al instalar paquetes

**En Windows con PowerShell:**
```powershell
# Correr PowerShell como Administrador, luego:
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

---

## 📁 Checklist de archivos {#checklist}

Antes de hacer el build, verificá que existen todos estos archivos:

### Archivos obligatorios para Electron/Windows

```
✅ package.json                          ← Configuración del proyecto
✅ electron/main.js                      ← Proceso principal de Electron
✅ electron/preload.js                   ← Bridge seguro main ↔ renderer
✅ src/assets/icons/favicon.ico          ← Ícono para Windows (¡NO .png!)
✅ www/index.html                        ← Build de Angular (generado con ng build)
```

### Archivos obligatorios para Android

```
✅ capacitor.config.ts                   ← Configuración de Capacitor
✅ android/                              ← Proyecto Android (generado con cap add android)
✅ www/index.html                        ← Build de Angular (igual que Electron)
```

### Estructura de carpetas esperada

```
impostor-catequesis/
├── electron/
│   ├── main.js          ← Proceso principal
│   └── preload.js       ← Bridge seguro (¡NUEVO! crear si no existe)
├── scripts/
│   └── generate-icons.js
├── src/
│   └── assets/
│       └── icons/
│           ├── favicon.png  ← Fuente (ya existe)
│           └── favicon.ico  ← Para Windows (GENERAR con el script)
├── android/             ← Generado por: npx cap add android
├── www/                 ← Generado por: ng build
├── dist-electron/       ← Generado por: electron-builder
├── capacitor.config.ts
└── package.json
```

---

## 📚 Conceptos clave {#conceptos}

### ¿Por qué `--base-href ./`?

Normalmente Angular genera URLs absolutas como `/assets/icons/logo.png`.
En un servidor web esto funciona. Pero en Electron (o Android WebView) cargamos
desde un archivo local, así que la URL raíz es el propio `www/`.

`--base-href ./` le dice a Angular: *"generá URLs relativas al archivo actual"*.
Así `./assets/icons/logo.png` funciona tanto en Electron como en Capacitor.

### ¿Qué es el proceso main vs renderer?

```
┌─────────────────────────────────────────────┐
│  PROCESO MAIN (electron/main.js)             │
│  • Corre en Node.js                          │
│  • Controla ventanas y menus                 │
│  • Accede al sistema de archivos             │
│  • Un solo proceso por app                   │
│                                              │
│  ← comunica via IPC →                        │
│                                              │
│  PROCESO RENDERER (tu app Angular)           │
│  • Corre en Chromium (como un navegador)     │
│  • NO tiene acceso a Node.js (por seguridad) │
│  • Uno por ventana                           │
└─────────────────────────────────────────────┘
```

### ¿Qué hace `contextBridge` en preload.js?

Es el portero seguro. En lugar de darle acceso total a Node.js al renderer,
exponés solo las funciones específicas que necesitás:

```javascript
// preload.js - esto SÍ puede hacer el renderer
contextBridge.exposeInMainWorld('electronAPI', {
  getVersion: () => ipcRenderer.invoke('app:version'),
  platform: process.platform,
});

// Desde Angular:
const version = await window.electronAPI.getVersion();
```

### ¿Cuándo usar `cap sync` vs `cap open`?

| Comando | Cuándo usarlo |
|---------|---------------|
| `npx cap sync android` | Cada vez que hacés cambios en el código Angular |
| `npx cap open android` | Para abrir Android Studio (solo cuando necesitás tocar código nativo) |
| `npx cap run android` | Para correr directamente en el dispositivo (sin Android Studio) |

---

## 🔖 Referencia rápida de comandos

```powershell
# ── Desarrollo ──────────────────────────────────────────
npm start                    # Servidor web (navegador)
npm run electron:dev         # App de escritorio con hot-reload

# ── Build Windows ───────────────────────────────────────
npm run build:win            # Build completo → instalador .exe
npm run electron:prod        # Solo probar en Electron (sin instalador)

# ── Build Android ───────────────────────────────────────
npx cap add android          # Primera vez (crea carpeta android/)
npm run android              # Build + sync + abrir Android Studio
npm run android:sync         # Solo sincronizar www/ → android/

# ── Utilidades ──────────────────────────────────────────
node scripts/generate-icons  # PNG → ICO
npm run clean:build          # Limpiar dist-electron/ y www/
```

---

*¿Encontraste un error en la guía? El aprendizaje es un proceso — cada error
es una oportunidad de entender mejor cómo funcionan las herramientas.*