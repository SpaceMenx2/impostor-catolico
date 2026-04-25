// src/app/data/words.ts
// ============================================================
// Base de palabras del juego — Impostor de Catequesis
// Para agregar nuevas palabras: simplemente añadí un objeto
// a la categoría correspondiente con { word, hint }
// ============================================================

export interface WordEntry {
  word: string; // La palabra secreta del juego
  hint: string; // Pista para el catequista/moderador (opcional)
  difficulty: string;
}

export interface WordCategory {
  id: string;
  name: string;
  icon: string; // Nombre de ícono de Ionicons
  color: string; // Color del badge de categoría
  words: WordEntry[];
}

// ============================================================
// CATEGORÍAS Y PALABRAS
// ============================================================

export const WORD_CATEGORIES: WordCategory[] = [
  // ----------------------------------------------------------
  // 1. JESÚS Y EVANGELIO
  // ----------------------------------------------------------
  {
    id: "jesus",
    name: "Jesús y Evangelio",
    icon: "sunny-outline",
    color: "#d4a728",
    words: [
      { word: "Jesús", hint: "El maestro de Nazaret", difficulty: "easy" },
      { word: "Evangelio", hint: "Buenas noticias escritas", difficulty: "easy" },
      { word: "Resurrección", hint: "Volvió a vivir al tercer día", difficulty: "medium" },
      { word: "Encarnación", hint: "Dios tomó forma humana", difficulty: "hard" },
      { word: "Nazaret", hint: "Donde creció el maestro", difficulty: "medium" },
      { word: "Belén", hint: "Ciudad del nacimiento", difficulty: "easy" },
      { word: "Galileo", hint: "Tierra de lagos y maestros", difficulty: "medium" },
      { word: "Milagro", hint: "Señal del poder divino", difficulty: "easy" },
      { word: "Parábola", hint: "Enseñanza con ejemplo", difficulty: "medium" },
      { word: "Sermón", hint: "Palabras para reflexionar", difficulty: "medium" },
      { word: "Última Cena", hint: "Compartió pan antes del final", difficulty: "easy" },
      { word: "Getsemaní", hint: "Donde oró en agonía", difficulty: "hard" },
      { word: "Ascensión", hint: "Regresó al cielo en gloria", difficulty: "hard" },
      { word: "Pentecostés", hint: "Espíritu que baja en fuego", difficulty: "medium" },
    ],
  },

  // ----------------------------------------------------------
  // 2. SACRAMENTOS
  // ----------------------------------------------------------
  {
    id: "sacramentos",
    name: "Sacramentos",
    icon: "water-outline",
    color: "#3e88dd",
    words: [
      { word: "Bautismo", hint: "Agua que da nueva vida", difficulty: "easy" },
      { word: "Eucaristía", hint: "Pan y vino que se transforman", difficulty: "easy" },
      { word: "Confirmación", hint: "Fuego del Espíritu en ti", difficulty: "easy" },
      { word: "Confesión", hint: "Perdón en diálogo sincero", difficulty: "easy" },
      { word: "Matrimonio", hint: "Alianza bendecida para siempre", difficulty: "easy" },
      { word: "Orden Sagrado", hint: "Servicio consagrado al altar", difficulty: "medium" },
      { word: "Unción", hint: "Aceite para sanar y fortalecer", difficulty: "hard" },
      { word: "Comunión", hint: "Recibir el cuerpo y la sangre", difficulty: "easy" },
      { word: "Penitencia", hint: "Camino para volver a empezar", difficulty: "medium" },
    ],
  },

  // ----------------------------------------------------------
  // 3. IGLESIA Y COMUNIDAD
  // ----------------------------------------------------------
  {
    id: "iglesia",
    name: "Iglesia y Comunidad",
    icon: "business-outline",
    color: "#8b7bca",
    words: [
      { word: "Iglesia", hint: "Casa de oración y comunidad", difficulty: "easy" },
      { word: "Papa", hint: "Pastor de la Iglesia universal", difficulty: "easy" },
      { word: "Obispo", hint: "Sucesor de los apóstoles", difficulty: "medium" },
      { word: "Sacerdote", hint: "Ministro del altar y la palabra", difficulty: "easy" },
      { word: "Diácono", hint: "Servidor de la comunidad", difficulty: "hard" },
      { word: "Catequesis", hint: "Camino de formación en la fe", difficulty: "easy" },
      { word: "Parroquia", hint: "Comunidad local de fe", difficulty: "easy" },
      { word: "Misa", hint: "Celebración del sacrificio y la cena", difficulty: "easy" },
      { word: "Homilía", hint: "Reflexión sobre la palabra", difficulty: "medium" },
      { word: "Misión", hint: "Llevar el mensaje a otros", difficulty: "medium" },
      { word: "Comunidad", hint: "Cuerpo unido en la fe", difficulty: "easy" },
      { word: "Concilio", hint: "Asamblea que decide en la fe", difficulty: "hard" },
    ],
  },

  // ----------------------------------------------------------
  // 4. BIBLIA
  // ----------------------------------------------------------
  {
    id: "biblia",
    name: "Biblia",
    icon: "book-outline",
    color: "#8b5a2b",
    words: [
      { word: "Biblia", hint: "Palabra de Dios escrita", difficulty: "easy" },
      { word: "Apóstol", hint: "Enviados a anunciar", difficulty: "easy" },
      { word: "Discípulo", hint: "Seguidor que aprende", difficulty: "easy" },
      { word: "Profeta", hint: "Voz que habla en nombre de Dios", difficulty: "medium" },
      { word: "Génesis", hint: "Libro de los orígenes", difficulty: "medium" },
      { word: "Salmo", hint: "Oración en verso", difficulty: "medium" },
      { word: "Proverbio", hint: "Consejo breve y sabio", difficulty: "hard" },
      { word: "Epístola", hint: "Carta de enseñanza apostólica", difficulty: "hard" },
      { word: "Pentateuco", hint: "Los cinco primeros libros", difficulty: "hard" },
      { word: "Abraham", hint: "Padre de la fe", difficulty: "medium" },
      { word: "Moisés", hint: "Liberador del pueblo", difficulty: "easy" },
      { word: "David", hint: "Rey poeta y guerrero", difficulty: "easy" },
      { word: "María", hint: "Madre del Salvador", difficulty: "easy" },
      { word: "Juan Bautista", hint: "Preparó el camino", difficulty: "medium" },
    ],
  },

  // ----------------------------------------------------------
  // 5. ORACIÓN Y LITURGIA
  // ----------------------------------------------------------
  {
    id: "oracion",
    name: "Oración y Liturgia",
    icon: "heart-outline",
    color: "#c0392b",
    words: [
      { word: "Oración", hint: "Diálogo con el Creador", difficulty: "easy" },
      { word: "Rosario", hint: "Meditación con cuentas", difficulty: "easy" },
      { word: "Padrenuestro", hint: "La oración que enseñó Jesús", difficulty: "easy" },
      { word: "Avemaría", hint: "Saludo a la Madre de Dios", difficulty: "easy" },
      { word: "Gloria", hint: "Alabanza en la misa", difficulty: "medium" },
      { word: "Credo", hint: "Profesión de nuestra fe", difficulty: "medium" },
      { word: "Adviento", hint: "Preparación para la llegada", difficulty: "medium" },
      { word: "Cuaresma", hint: "Cuarenta días de conversión", difficulty: "medium" },
      { word: "Pascua", hint: "Celebración de la victoria", difficulty: "easy" },
      { word: "Pentecostés", hint: "Venida del Espíritu Santo", difficulty: "medium" },
      { word: "Navidad", hint: "Nacimiento del Salvador", difficulty: "easy" },
      { word: "Vigilia", hint: "Noche de espera en oración", difficulty: "hard" },
      { word: "Novena", hint: "Oración durante nueve días", difficulty: "medium" },
    ],
  },

  // ----------------------------------------------------------
  // 6. VIRTUDES Y VALORES
  // ----------------------------------------------------------
  {
    id: "virtudes",
    name: "Virtudes y Valores",
    icon: "star-outline",
    color: "#27ae60",
    words: [
      { word: "Fe", hint: "Confianza en lo invisible", difficulty: "easy" },
      { word: "Esperanza", hint: "Certeza de lo prometido", difficulty: "easy" },
      { word: "Caridad", hint: "Amor que se entrega", difficulty: "easy" },
      { word: "Amor", hint: "El mandamiento nuevo", difficulty: "easy" },
      { word: "Perdón", hint: "Liberar la ofensa", difficulty: "easy" },
      { word: "Misericordia", hint: "Amor que perdona", difficulty: "medium" },
      { word: "Humildad", hint: "Reconocer el propio lugar", difficulty: "medium" },
      { word: "Justicia", hint: "Dar a cada uno lo suyo", difficulty: "medium" },
      { word: "Prudencia", hint: "Saber elegir el bien", difficulty: "hard" },
      { word: "Templanza", hint: "Moderación en el deseo", difficulty: "hard" },
      { word: "Fortaleza", hint: "Firmeza en la dificultad", difficulty: "medium" },
      { word: "Solidaridad", hint: "Compartir la carga del otro", difficulty: "medium" },
      { word: "Servicio", hint: "Entregarse por los demás", difficulty: "easy" },
      { word: "Paz", hint: "Armonía con Dios y otros", difficulty: "easy" },
    ],
  },

  // ----------------------------------------------------------
  // 7. SANTOS Y MODELOS
  // ----------------------------------------------------------
  {
    id: "santos",
    name: "Santos y Modelos",
    icon: "person-outline",
    color: "#ffffff",
    words: [
      { word: "San Pedro", hint: "Roca de la Iglesia", difficulty: "easy" },
      { word: "San Pablo", hint: "Apóstol de los gentiles", difficulty: "easy" },
      { word: "San Francisco", hint: "Hermano de la creación", difficulty: "easy" },
      { word: "Santa Teresa", hint: "Doctora de la oración", difficulty: "medium" },
      { word: "San Juan Bosco", hint: "Padre de la juventud", difficulty: "medium" },
      { word: "San Martín", hint: "Soldado que compartió", difficulty: "medium" },
      { word: "San Ignacio", hint: "Fundador de los jesuitas", difficulty: "hard" },
      { word: "San Agustín", hint: "Doctor de la gracia", difficulty: "hard" },
      { word: "Madre Teresa", hint: "Madre de los más pobres", difficulty: "easy" },
      { word: "Santo Tomás", hint: "Apóstol que dudó", difficulty: "medium" },
    ],
  },
];

// ============================================================
// FUNCIÓN AUXILIAR: Obtener una palabra aleatoria
// ============================================================
export function getRandomWord(
  categoryIds?: string[],
  difficultyIds?: string[], // ← NUEVO: parámetro opcional
): { word: WordEntry; category: WordCategory } {
  let categories = WORD_CATEGORIES;

  // Filtrar categorías si se especificaron
  if (categoryIds && categoryIds.length > 0) {
    categories = WORD_CATEGORIES.filter((c) => categoryIds.includes(c.id));
  }

  if (categories.length === 0) {
    categories = WORD_CATEGORIES;
  }

  const randomCategory =
    categories[Math.floor(Math.random() * categories.length)];

  // ← NUEVO: Filtrar palabras por dificultad dentro de la categoría elegida
  let availableWords = randomCategory.words;
  if (difficultyIds && difficultyIds.length > 0) {
    const filtered = randomCategory.words.filter((w) =>
      difficultyIds.includes(w.difficulty),
    );
    // Si hay coincidencias, usarlas; si no, mantener todas como fallback
    if (filtered.length > 0) {
      availableWords = filtered;
    }
  }

  const randomWord =
    availableWords[Math.floor(Math.random() * availableWords.length)];

  return { word: randomWord, category: randomCategory };
}

// ============================================================
// MENSAJES INSPIRADORES (aparecen a lo largo del juego)
// ============================================================
export const INSPIRE_MESSAGES: string[] = [
  '"Donde dos o tres se reúnen en mi nombre, allí estoy yo." — Mt 18,20',
  '"La fe se vive en comunidad."',
  '"Aprendemos de Jesús también jugando y compartiendo."',
  '"Sed luz del mundo." — Mt 5,14',
  '"El amor es la medida de todo." — San Agustín',
  '"Ama a tu prójimo como a ti mismo." — Mt 22,39',
  '"La alegría del Señor es vuestra fortaleza." — Neh 8,10',
  '"Cada persona es un regalo de Dios."',
  '"Busca la verdad y la verdad te hará libre." — Jn 8,32',
  '"Juntos somos Iglesia, juntos somos familia."',
  '"Dios, que es amor, nos creó por amor" - Papa Francisco',
];

export function getRandomInspireMessage(): string {
  return INSPIRE_MESSAGES[Math.floor(Math.random() * INSPIRE_MESSAGES.length)];
}
