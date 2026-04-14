import { CapacitorConfig } from '@capacitor/cli';

/**
 * capacitor.config.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Configuración de Capacitor para compilar a Android (.apk)
 *
 * ¿Qué es Capacitor?
 *   Capacitor es el puente entre tu app Angular/Ionic y las APIs nativas
 *   del dispositivo (cámara, notificaciones, almacenamiento, etc.).
 *   Envuelve tu web app en un WebView nativo de Android/iOS.
 *
 * Flujo de build para Android:
 *   1. ng build           → Genera www/ (tu app Angular compilada)
 *   2. npx cap sync       → Copia www/ a android/app/src/main/assets/public/
 *   3. npx cap open android → Abre Android Studio
 *   4. En Android Studio: Build → Generate Signed APK
 * ─────────────────────────────────────────────────────────────────────────────
 */

const config: CapacitorConfig = {
  // ── Identificador único de la app ─────────────────────────────────────────
  // Formato: com.empresa.nombreapp (todo en minúsculas, sin espacios)
  // ⚠️  Una vez publicada en Google Play, NO se puede cambiar
  appId: 'com.catequesis.impostor',

  // ── Nombre de la app (aparece debajo del ícono en el celular) ────────────
  appName: 'Impostor Catequesis',

  // ── Carpeta donde Angular genera el build ───────────────────────────────
  // Debe coincidir con "outputPath" en angular.json
  webDir: 'www',

  // ── Configuración del servidor ───────────────────────────────────────────
  server: {
    /**
     * androidScheme: 'https'
     *
     * Hace que la app en Android use https:// internamente en lugar de
     * file://. Esto es importante porque:
     *   - Permite usar localStorage y cookies correctamente
     *   - Evita errores de Mixed Content
     *   - Requerido para algunas APIs modernas del navegador
     *
     * Con file:// muchas cosas dejan de funcionar en Android.
     */
    androidScheme: 'https',

    /**
     * Para desarrollo con Live Reload en dispositivo físico:
     * Descomenta la línea de abajo y reemplazá la IP con la de tu PC.
     *
     * ¿Cómo encontrar tu IP? En Windows: ipconfig (busca IPv4)
     *
     * ⚠️  Comentá esta línea antes de compilar el APK final,
     *     si no la app intentará conectarse a tu PC y no funcionará
     *     sin estar en la misma red.
     */
    // url: 'http://192.168.1.100:4200',
    // cleartext: true, // Necesario para HTTP en Android
  },

  // ── Plugins nativos ──────────────────────────────────────────────────────
  plugins: {
    /**
     * SplashScreen: pantalla de inicio mientras carga la app
     *
     * Para que funcione necesitás agregar el plugin:
     * npm install @capacitor/splash-screen
     * npx cap sync
     *
     * Y agregar el ícono en:
     * android/app/src/main/res/drawable/splash.png
     */
    SplashScreen: {
      launchShowDuration: 2000,      // ms que se muestra el splash
      backgroundColor: '#1a3a6b',   // Tu color azul corporativo
      showSpinner: false,            // Sin spinner de carga
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,        // Oculta la barra de estado
      splashImmersive: true,         // Modo inmersivo (oculta botones de navegación)
    },

    /**
     * Keyboard: comportamiento del teclado virtual
     * Útil para que el teclado no tape los inputs
     */
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
  },

  // ── Configuración específica de Android ──────────────────────────────────
  android: {
    /**
     * buildOptions se usa cuando compilás desde línea de comandos.
     * El signing (firma del APK) se recomienda hacerlo desde Android Studio.
     */
    // buildOptions: {
    //   keystorePath: 'my-release-key.jks',
    //   keystoreAlias: 'key0',
    // },

    /**
     * allowMixedContent: true permite cargar recursos HTTP en una app HTTPS.
     * Solo habilitalo si sabés lo que hacés. En producción debería ser false.
     */
    allowMixedContent: false,
  },
};

export default config;