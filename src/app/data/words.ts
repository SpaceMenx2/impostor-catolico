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
      { word: "Jesús", hint: "Alguien muy importante", difficulty: "easy" },
      { word: "Evangelio", hint: "Se lee en misa", difficulty: "easy" },
      {
        word: "Resurrección",
        hint: "Después del viernes",
        difficulty: "medium",
      },
      { word: "Encarnación", hint: "Dios se hizo...", difficulty: "hard" },
      { word: "Nazaret", hint: "Un pueblo de allá", difficulty: "medium" },
      { word: "Belén", hint: "No es ciudad cualquiera", difficulty: "easy" },
      { word: "Galileo", hint: "Región del norte", difficulty: "medium" },
      { word: "Milagro", hint: "Algo increíble pasa", difficulty: "easy" },
      { word: "Parábola", hint: "Historia con mensaje", difficulty: "medium" },
      {
        word: "Sermón",
        hint: "Se habla desde el púlpito",
        difficulty: "medium",
      },
      { word: "Última Cena", hint: "Fue la última vez", difficulty: "easy" },
      { word: "Getsemaní", hint: "Jardín de la noche", difficulty: "hard" },
      { word: "Ascensión", hint: "Subió, no bajó", difficulty: "hard" },
      { word: "Pentecostés", hint: "Fiesta con viento", difficulty: "medium" },
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
      { word: "Bautismo", hint: "Agua que marca", difficulty: "easy" },
      { word: "Eucaristía", hint: "Pan que se parte", difficulty: "easy" },
      { word: "Confirmación", hint: "Se recibe de grande", difficulty: "easy" },
      { word: "Confesión", hint: "Se habla en secreto", difficulty: "easy" },
      { word: "Matrimonio", hint: "Dos se hacen uno", difficulty: "easy" },
      {
        word: "Orden Sagrado",
        hint: "Vestimenta especial",
        difficulty: "medium",
      },
      { word: "Unción", hint: "Aceite que consagra", difficulty: "hard" },
      { word: "Comunión", hint: "Se recibe de rodillas", difficulty: "easy" },
      {
        word: "Penitencia",
        hint: "Se hace para reparar",
        difficulty: "medium",
      },
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
      { word: "Iglesia", hint: "Donde nos reunimos", difficulty: "easy" },
      { word: "Papa", hint: "Viste de blanco", difficulty: "easy" },
      { word: "Obispo", hint: "Tiene un bastón", difficulty: "medium" },
      { word: "Sacerdote", hint: "Celebra la misa", difficulty: "easy" },
      { word: "Diácono", hint: "Ayuda en el altar", difficulty: "hard" },
      { word: "Catequesis", hint: "Se aprende de a poco", difficulty: "easy" },
      { word: "Parroquia", hint: "La iglesia del barrio", difficulty: "easy" },
      { word: "Misa", hint: "Se va los domingos", difficulty: "easy" },
      { word: "Homilía", hint: "Se escucha sentado", difficulty: "medium" },
      { word: "Misión", hint: "Salir a anunciar", difficulty: "medium" },
      { word: "Comunidad", hint: "No estamos solos", difficulty: "easy" },
      { word: "Concilio", hint: "Reunión muy importante", difficulty: "hard" },
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
      { word: "Biblia", hint: "Libro grueso sagrado", difficulty: "easy" },
      { word: "Apóstol", hint: "Fueron doce", difficulty: "easy" },
      { word: "Discípulo", hint: "Aprendiz de maestro", difficulty: "easy" },
      { word: "Profeta", hint: "Anunciaba el futuro", difficulty: "medium" },
      { word: "Génesis", hint: "Todo empieza acá", difficulty: "medium" },
      { word: "Salmo", hint: "Se canta o reza", difficulty: "medium" },
      { word: "Proverbio", hint: "Frase con sabiduría", difficulty: "hard" },
      { word: "Epístola", hint: "Carta antigua", difficulty: "hard" },
      { word: "Pentateuco", hint: "Cinco libros juntos", difficulty: "hard" },
      { word: "Abraham", hint: "Padre de muchos", difficulty: "medium" },
      { word: "Moisés", hint: "Lideró una salida", difficulty: "easy" },
      { word: "David", hint: "Pastor con honda", difficulty: "easy" },
      { word: "María", hint: "Nombre muy especial", difficulty: "easy" },
      {
        word: "Juan Bautista",
        hint: "Vivía en el desierto",
        difficulty: "medium",
      },
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
      { word: "Oración", hint: "Hablar en silencio", difficulty: "easy" },
      { word: "Rosario", hint: "Cuentas que se tocan", difficulty: "easy" },
      {
        word: "Padrenuestro",
        hint: "La oración principal",
        difficulty: "easy",
      },
      { word: "Avemaría", hint: "Se le dice a ella", difficulty: "easy" },
      { word: "Gloria", hint: "Se canta con alegría", difficulty: "medium" },
      { word: "Credo", hint: "Decimos 'creo'", difficulty: "medium" },
      { word: "Adviento", hint: "Tiempo de espera", difficulty: "medium" },
      { word: "Cuaresma", hint: "Tiempo de cambio", difficulty: "medium" },
      { word: "Pascua", hint: "Fiesta de fiesta", difficulty: "easy" },
      { word: "Pentecostés", hint: "Fuego que baja", difficulty: "medium" },
      { word: "Navidad", hint: "Noche de luces", difficulty: "easy" },
      { word: "Vigilia", hint: "Esperar despierto", difficulty: "hard" },
      { word: "Novena", hint: "Nueve veces lo mismo", difficulty: "medium" },
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
      { word: "Fe", hint: "Creer sin ver", difficulty: "easy" },
      {
        word: "Esperanza",
        hint: "Confiar en lo que viene",
        difficulty: "easy",
      },
      { word: "Caridad", hint: "Amor en acción", difficulty: "easy" },
      { word: "Amor", hint: "Lo más importante", difficulty: "easy" },
      { word: "Perdón", hint: "Dejar ir lo malo", difficulty: "easy" },
      {
        word: "Misericordia",
        hint: "Compasión en acción",
        difficulty: "medium",
      },
      { word: "Humildad", hint: "No creerse más", difficulty: "medium" },
      {
        word: "Justicia",
        hint: "Dar lo que corresponde",
        difficulty: "medium",
      },
      { word: "Prudencia", hint: "Pensar antes de actuar", difficulty: "hard" },
      { word: "Templanza", hint: "No exagerar en nada", difficulty: "hard" },
      { word: "Fortaleza", hint: "No rendirse nunca", difficulty: "medium" },
      {
        word: "Solidaridad",
        hint: "Ponerse en el lugar",
        difficulty: "medium",
      },
      { word: "Servicio", hint: "Ayudar sin esperar", difficulty: "easy" },
      { word: "Paz", hint: "Tranquilidad interior", difficulty: "easy" },
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
      { word: "San Pedro", hint: "Tuvo llaves", difficulty: "easy" },
      { word: "San Pablo", hint: "Cayó del caballo", difficulty: "easy" },
      {
        word: "San Francisco",
        hint: "Amigo de los pajaritos",
        difficulty: "easy",
      },
      { word: "Santa Teresa", hint: "Escribía mucho", difficulty: "medium" },
      {
        word: "San Juan Bosco",
        hint: "Amigo de los chicos",
        difficulty: "medium",
      },
      { word: "San Martín", hint: "Compartió su capa", difficulty: "medium" },
      { word: "San Ignacio", hint: "Fundó una compañía", difficulty: "hard" },
      { word: "San Agustín", hint: "Buscó la verdad", difficulty: "hard" },
      {
        word: "Madre Teresa",
        hint: "Ayudó a los más pobres",
        difficulty: "easy",
      },
      {
        word: "Santo Tomás",
        hint: "Necesitó ver para creer",
        difficulty: "medium",
      },
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
