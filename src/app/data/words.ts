// src/app/data/words.ts
// ============================================================
// Base de palabras del juego — Impostor de Catequesis
// Para agregar nuevas palabras: simplemente añadí un objeto
// a la categoría correspondiente con { word, hint }
// ============================================================

export interface WordEntry {
  word: string;       // La palabra secreta del juego
  hint: string;       // Pista para el catequista/moderador (opcional)
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface WordCategory {
  id: string;
  name: string;
  icon: string;       // Nombre de ícono de Ionicons
  color: string;      // Color del badge de categoría
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
    id: 'jesus',
    name: 'Jesús y Evangelio',
    icon: 'sunny-outline',
    color: '#d4a728',
    words: [
      { word: 'Jesús',         hint: 'El Hijo de Dios hecho hombre',           difficulty: 'easy' },
      { word: 'Evangelio',     hint: 'Buena Noticia, palabra de vida',          difficulty: 'easy' },
      { word: 'Resurrección',  hint: 'Jesús venció a la muerte el tercer día',  difficulty: 'medium' },
      { word: 'Encarnación',   hint: 'Dios se hizo hombre en María',            difficulty: 'hard' },
      { word: 'Nazaret',       hint: 'Ciudad donde creció Jesús',               difficulty: 'medium' },
      { word: 'Belén',         hint: 'Ciudad donde nació Jesús',                difficulty: 'easy' },
      { word: 'Galileo',       hint: 'Región donde Jesús predicó',              difficulty: 'medium' },
      { word: 'Milagro',       hint: 'Señal del poder de Dios',                 difficulty: 'easy' },
      { word: 'Parábola',      hint: 'Historia que Jesús usaba para enseñar',   difficulty: 'medium' },
      { word: 'Sermón',        hint: 'Jesús habló en el monte',                 difficulty: 'medium' },
      { word: 'Última Cena',   hint: 'La noche antes de morir con sus apóstoles', difficulty: 'easy' },
      { word: 'Getsemaní',     hint: 'Jardín donde Jesús oró antes de ser prendido', difficulty: 'hard' },
      { word: 'Ascensión',     hint: 'Jesús subió al cielo ante sus discípulos', difficulty: 'hard' },
      { word: 'Pentecostés',   hint: 'Llegada del Espíritu Santo a los apóstoles', difficulty: 'medium' },
    ],
  },

  // ----------------------------------------------------------
  // 2. SACRAMENTOS
  // ----------------------------------------------------------
  {
    id: 'sacramentos',
    name: 'Sacramentos',
    icon: 'water-outline',
    color: '#2a6bb5',
    words: [
      { word: 'Bautismo',      hint: 'Primer sacramento, agua y Espíritu',      difficulty: 'easy' },
      { word: 'Eucaristía',    hint: 'Pan y vino, cuerpo y sangre de Cristo',   difficulty: 'easy' },
      { word: 'Confirmación',  hint: 'Don del Espíritu Santo, madurez en la fe', difficulty: 'easy' },
      { word: 'Confesión',     hint: 'Sacramento del perdón y reconciliación',  difficulty: 'easy' },
      { word: 'Matrimonio',    hint: 'Sacramento de la unión entre esposos',     difficulty: 'easy' },
      { word: 'Orden Sagrado', hint: 'Sacramento del sacerdocio',               difficulty: 'medium' },
      { word: 'Unción',        hint: 'Sacramento para los enfermos y moribundos', difficulty: 'hard' },
      { word: 'Comunión',      hint: 'Recibir a Jesús en la Eucaristía',        difficulty: 'easy' },
      { word: 'Penitencia',    hint: 'Acto de reparar el pecado',               difficulty: 'medium' },
    ],
  },

  // ----------------------------------------------------------
  // 3. IGLESIA Y COMUNIDAD
  // ----------------------------------------------------------
  {
    id: 'iglesia',
    name: 'Iglesia y Comunidad',
    icon: 'business-outline',
    color: '#5a4a9c',
    words: [
      { word: 'Iglesia',       hint: 'Comunidad de creyentes en Cristo',        difficulty: 'easy' },
      { word: 'Papa',          hint: 'Sucesor de Pedro, cabeza visible',         difficulty: 'easy' },
      { word: 'Obispo',        hint: 'Pastor de una diócesis',                  difficulty: 'medium' },
      { word: 'Sacerdote',     hint: 'Ministro ordenado que celebra la Misa',   difficulty: 'easy' },
      { word: 'Diácono',       hint: 'Ministro ordenado al servicio',           difficulty: 'hard' },
      { word: 'Catequesis',    hint: 'Enseñanza de la fe cristiana',            difficulty: 'easy' },
      { word: 'Parroquia',     hint: 'Comunidad local de la Iglesia',           difficulty: 'easy' },
      { word: 'Misa',          hint: 'Celebración central del culto cristiano',  difficulty: 'easy' },
      { word: 'Homilía',       hint: 'Explicación del Evangelio en la Misa',    difficulty: 'medium' },
      { word: 'Misión',        hint: 'Llamada a anunciar el Evangelio',         difficulty: 'medium' },
      { word: 'Comunidad',     hint: 'Grupo de personas unidas en la fe',       difficulty: 'easy' },
      { word: 'Concilio',      hint: 'Gran asamblea de la Iglesia',             difficulty: 'hard' },
    ],
  },

  // ----------------------------------------------------------
  // 4. BIBLIA
  // ----------------------------------------------------------
  {
    id: 'biblia',
    name: 'Biblia',
    icon: 'book-outline',
    color: '#8b5a2b',
    words: [
      { word: 'Biblia',        hint: 'Libro sagrado de la fe cristiana',        difficulty: 'easy' },
      { word: 'Apóstol',       hint: 'Enviado, elegido por Jesús',              difficulty: 'easy' },
      { word: 'Discípulo',     hint: 'Seguidor y aprendiz de Jesús',            difficulty: 'easy' },
      { word: 'Profeta',       hint: 'Mensajero de Dios en el Antiguo Testamento', difficulty: 'medium' },
      { word: 'Génesis',       hint: 'Primer libro de la Biblia, la creación',  difficulty: 'medium' },
      { word: 'Salmo',         hint: 'Poema o canto sagrado de la Biblia',      difficulty: 'medium' },
      { word: 'Proverbio',     hint: 'Dicho de sabiduría en la Biblia',         difficulty: 'hard' },
      { word: 'Epístola',      hint: 'Carta de los apóstoles en el Nuevo Testamento', difficulty: 'hard' },
      { word: 'Pentateuco',    hint: 'Los primeros cinco libros de la Biblia',  difficulty: 'hard' },
      { word: 'Abraham',       hint: 'Padre de la fe, partió de Ur',            difficulty: 'medium' },
      { word: 'Moisés',        hint: 'Liberó al pueblo de la esclavitud',       difficulty: 'easy' },
      { word: 'David',         hint: 'Rey pastor, autor de muchos salmos',      difficulty: 'easy' },
      { word: 'María',         hint: 'Madre de Jesús, llena de gracia',         difficulty: 'easy' },
      { word: 'Juan Bautista', hint: 'Precursor de Jesús, bautizaba en el Jordán', difficulty: 'medium' },
    ],
  },

  // ----------------------------------------------------------
  // 5. ORACIÓN Y LITURGIA
  // ----------------------------------------------------------
  {
    id: 'oracion',
    name: 'Oración y Liturgia',
    icon: 'heart-outline',
    color: '#c0392b',
    words: [
      { word: 'Oración',       hint: 'Hablar con Dios desde el corazón',        difficulty: 'easy' },
      { word: 'Rosario',       hint: 'Corona de avemarías y misterios',         difficulty: 'easy' },
      { word: 'Padrenuestro',  hint: 'La oración que Jesús nos enseñó',         difficulty: 'easy' },
      { word: 'Avemaría',      hint: 'Saludo del ángel Gabriel a María',        difficulty: 'easy' },
      { word: 'Gloria',        hint: 'Himno de alabanza a la Trinidad',         difficulty: 'medium' },
      { word: 'Credo',         hint: 'Profesión de fe de la Iglesia',           difficulty: 'medium' },
      { word: 'Adviento',      hint: 'Tiempo de espera antes de Navidad',       difficulty: 'medium' },
      { word: 'Cuaresma',      hint: 'Tiempo de penitencia antes de Pascua',    difficulty: 'medium' },
      { word: 'Pascua',        hint: 'Fiesta de la Resurrección de Jesús',      difficulty: 'easy' },
      { word: 'Pentecostés',   hint: 'Fiesta del Espíritu Santo',               difficulty: 'medium' },
      { word: 'Navidad',       hint: 'Fiesta del nacimiento de Jesús',          difficulty: 'easy' },
      { word: 'Vigilia',       hint: 'Oración nocturna o tiempo de espera',     difficulty: 'hard' },
      { word: 'Novena',        hint: 'Oración por nueve días consecutivos',     difficulty: 'medium' },
    ],
  },

  // ----------------------------------------------------------
  // 6. VIRTUDES Y VALORES
  // ----------------------------------------------------------
  {
    id: 'virtudes',
    name: 'Virtudes y Valores',
    icon: 'star-outline',
    color: '#27ae60',
    words: [
      { word: 'Fe',            hint: 'Creer sin ver, confiar en Dios',          difficulty: 'easy' },
      { word: 'Esperanza',     hint: 'Virtud que aguarda el bien futuro',       difficulty: 'easy' },
      { word: 'Caridad',       hint: 'Amor al prójimo como a uno mismo',        difficulty: 'easy' },
      { word: 'Amor',          hint: 'Dios es amor, mandamiento de Jesús',      difficulty: 'easy' },
      { word: 'Perdón',        hint: 'Dejar ir el resentimiento, como Dios hace', difficulty: 'easy' },
      { word: 'Misericordia',  hint: 'Amor compasivo de Dios hacia el pecador', difficulty: 'medium' },
      { word: 'Humildad',      hint: 'Reconocer los propios límites ante Dios', difficulty: 'medium' },
      { word: 'Justicia',      hint: 'Dar a cada uno lo que le corresponde',    difficulty: 'medium' },
      { word: 'Prudencia',     hint: 'Virtud de actuar con sabiduría y reflexión', difficulty: 'hard' },
      { word: 'Templanza',     hint: 'Moderación en los placeres',              difficulty: 'hard' },
      { word: 'Fortaleza',     hint: 'Valor para hacer el bien en las pruebas', difficulty: 'medium' },
      { word: 'Solidaridad',   hint: 'Hacernos cargo del otro, especialmente el pobre', difficulty: 'medium' },
      { word: 'Servicio',      hint: 'El más grande es el que sirve',           difficulty: 'easy' },
      { word: 'Paz',           hint: 'Don de Dios, fruto de la justicia',       difficulty: 'easy' },
    ],
  },

  // ----------------------------------------------------------
  // 7. SANTOS Y MODELOS
  // ----------------------------------------------------------
  {
    id: 'santos',
    name: 'Santos y Modelos',
    icon: 'person-outline',
    color: '#8e44ad',
    words: [
      { word: 'San Pedro',       hint: 'Primer Papa, apóstol pescador',           difficulty: 'easy' },
      { word: 'San Pablo',       hint: 'Apóstol de los gentiles, viajero incansable', difficulty: 'easy' },
      { word: 'San Francisco',   hint: 'Amigo de la naturaleza y los pobres',     difficulty: 'easy' },
      { word: 'Santa Teresa',    hint: 'Doctora de la Iglesia, mística española', difficulty: 'medium' },
      { word: 'San Juan Bosco',  hint: 'Padre y maestro de la juventud',          difficulty: 'medium' },
      { word: 'San Martín',      hint: 'Compartió su capa con el pobre',          difficulty: 'medium' },
      { word: 'San Ignacio',     hint: 'Fundó la Compañía de Jesús',              difficulty: 'hard' },
      { word: 'San Agustín',     hint: '"Nos hiciste para Ti, Señor"',             difficulty: 'hard' },
      { word: 'Madre Teresa',    hint: 'Misionera de la caridad en Calcuta',      difficulty: 'easy' },
      { word: 'Santo Tomás',     hint: 'Apóstol que dudó y luego creyó',          difficulty: 'medium' },
    ],
  },
];

// ============================================================
// FUNCIÓN AUXILIAR: Obtener una palabra aleatoria
// ============================================================
export function getRandomWord(categoryIds?: string[]): { word: WordEntry; category: WordCategory } {
  let categories = WORD_CATEGORIES;

  if (categoryIds && categoryIds.length > 0) {
    categories = WORD_CATEGORIES.filter(c => categoryIds.includes(c.id));
  }

  if (categories.length === 0) {
    categories = WORD_CATEGORIES;
  }

  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  const randomWord = randomCategory.words[Math.floor(Math.random() * randomCategory.words.length)];

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
];

export function getRandomInspireMessage(): string {
  return INSPIRE_MESSAGES[Math.floor(Math.random() * INSPIRE_MESSAGES.length)];
}
