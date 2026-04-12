# ✝️ Impostor de Catequesis

> Un juego social educativo para grupos parroquiales, catequesis y jóvenes.

---

## 📖 ¿Qué es?

**Impostor de Catequesis** es una app multiplataforma (Android + Windows) inspirada en el juego social "Impostor" pero completamente adaptada a un contexto religioso y catequético.

Los jugadores reciben una palabra de la fe cristiana (Eucaristía, Rosario, Bautismo...) excepto uno que será el **Impostor**. Deben dar pistas sin decir la palabra y votar quién creen que no conocía la palabra.

---

## 🎮 Flujo del juego

```
Inicio → Jugadores → Revelación de roles → Discusión → Votación → Resultado
```

1. **Inicio**: Pantalla principal con título y botón de inicio
2. **Jugadores**: Agregar jugadores (mín. 3), configurar impostores, categorías y temporizador
3. **Revelación**: Cada jugador pasa el teléfono y ve su rol en privado
4. **Discusión**: Ronda de pistas con temporizador opcional (2, 3 o 5 minutos)
5. **Votación**: Cada jugador vota quién cree que es el impostor
6. **Resultado**: Se revela el impostor, la palabra y un mensaje reflexivo

---

## 🛠️ Stack tecnológico

| Plataforma | Tecnología        |
|------------|-------------------|
| Framework  | Ionic + Angular   |
| Android    | Capacitor         |
| Windows    | Electron          |
| Estilos    | SCSS + CSS Vars   |

---

## 📦 Instalación

### Requisitos previos

- Node.js 18+ 
- npm 9+
- Angular CLI: `npm install -g @angular/cli`
- Ionic CLI: `npm install -g @ionic/cli`
- (Para Android) Android Studio con SDK instalado

### 1. Instalar dependencias

```bash
npm install
```

### 2. Correr en el navegador (desarrollo)

```bash
npm start
# o
ionic serve
```

Abrí `http://localhost:4200` en el navegador.

---

## 📱 Android

### Preparar y abrir en Android Studio

```bash
# Compilar la app web
ionic build

# Sincronizar con Capacitor
npx cap sync android

# Abrir en Android Studio
npx cap open android
```

Desde Android Studio podés correr en un emulador o en tu dispositivo físico.

### Primera vez (agregar plataforma Android)

```bash
npx cap add android
ionic build
npx cap sync android
```

---

## 🖥️ Windows (Electron)

### Modo desarrollo (hot reload)

```bash
npm run electron:dev
```

### Modo producción

```bash
# Compilar con rutas relativas para Electron
ng build --base-href ./

# Correr Electron
npx electron electron/main.js
```

### Empaquetar como instalador .exe

```bash
# Instalar electron-builder
npm install -D electron-builder

# Configurar en package.json (agregar):
# "build": {
#   "appId": "com.catequesis.impostor",
#   "productName": "Impostor de Catequesis",
#   "win": { "target": "nsis" },
#   "directories": { "output": "dist-electron" }
# }

npx electron-builder --win
```

---

## 📂 Estructura del proyecto

```
impostor-catequesis/
├── electron/
│   └── main.js              # Punto de entrada de Electron
│
├── src/
│   ├── app/
│   │   ├── data/
│   │   │   └── words.ts     # ← AGREGAR PALABRAS AQUÍ
│   │   │
│   │   ├── services/
│   │   │   └── game.service.ts  # Lógica central del juego
│   │   │
│   │   └── pages/
│   │       ├── home/        # Pantalla de inicio
│   │       ├── players/     # Gestión de jugadores
│   │       ├── role-reveal/ # Revelación de roles
│   │       ├── discussion/  # Ronda de discusión
│   │       ├── voting/      # Votación
│   │       └── result/      # Resultado final
│   │
│   ├── theme/
│   │   └── variables.scss   # Colores y variables CSS
│   │
│   └── global.scss          # Estilos globales y animaciones
│
├── capacitor.config.ts      # Configuración de Capacitor (Android)
└── package.json
```

---

## ✏️ Agregar palabras nuevas

Abrí `src/app/data/words.ts` y agregá un objeto a la categoría que quieras:

```typescript
{ word: 'Pentecostés', hint: 'Fiesta del Espíritu Santo', difficulty: 'medium' },
```

### Agregar una categoría nueva

```typescript
{
  id: 'mi-categoria',
  name: 'Mi Categoría',
  icon: 'star-outline',       // Nombre de ícono de Ionicons
  color: '#2ec478',           // Color del badge
  words: [
    { word: 'MiPalabra', hint: 'Pista...', difficulty: 'easy' },
  ],
},
```

---

## 🎨 Personalizar colores

Editá `src/theme/variables.scss`:

```scss
--color-gold:  #d4a728;   // Dorado litúrgico
--color-blue:  #1a3a6b;   // Azul profundo
--color-navy:  #0d2251;   // Azul oscuro del fondo
```

---

## 📝 Categorías de palabras incluidas

| Categoría              | Palabras |
|------------------------|----------|
| Jesús y Evangelio      | 14       |
| Sacramentos            | 9        |
| Iglesia y Comunidad    | 12       |
| Biblia                 | 14       |
| Oración y Liturgia     | 13       |
| Virtudes y Valores     | 14       |
| Santos y Modelos       | 10       |
| **Total**              | **86**   |

---

## 🤝 Créditos y uso

Desarrollado con ♥ para grupos parroquiales, catequesis de niños y jóvenes, y reuniones de comunidad.

**No está destinado a ridiculizar ni trivializar la fe cristiana**, sino a fomentar el aprendizaje, la participación y la convivencia en comunidad.

> *"Donde dos o tres se reúnen en mi nombre, allí estoy yo."* — Mt 18,20
