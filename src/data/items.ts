/**
 * Els ítems de l'autotest.
 *
 * Set dimensions del Narcissistic Personality Inventory (Raskin i Terry, 1988),
 * tres ítems propis per dimensió. Els ítems marcats `rev` són inversos: estar-hi
 * poc d'acord és la resposta "narcisista", i la puntuació s'inverteix en calcular.
 *
 * Es presenten intercalats (un de cada dimensió per ronda) i sense dir quina
 * dimensió mesuren, perquè qui respon no endevini què s'està mesurant.
 */

export const DIMS = [
  'Autoritat',
  'Autosuficiència',
  'Superioritat',
  'Exhibicionisme',
  'Explotació',
  'Vanitat',
  'Dret adquirit',
] as const;

export type Dim = (typeof DIMS)[number];

export const DIM_HELP: Record<Dim, string> = {
  Autoritat: "tendència a voler manar, dirigir i tenir l'última paraula.",
  Autosuficiència: 'confiança en les pròpies capacitats i sensació de no necessitar ningú.',
  Superioritat: "creure's especial o per sobre de la mitjana.",
  Exhibicionisme: "gust per ser el centre d'atenció.",
  Explotació: 'facilitat per convèncer els altres i treure profit de les situacions.',
  Vanitat: "preocupació per la pròpia imatge i l'aspecte físic.",
  'Dret adquirit': 'sensació de merèixer un tracte millor que els altres.',
};

export interface Item {
  dim: Dim;
  text: string;
  rev?: boolean;
}

const BANK: Record<Dim, ReadonlyArray<{ text: string; rev?: boolean }>> = {
  Autoritat: [
    { text: "M'agrada tenir l'última paraula en les decisions de grup." },
    { text: 'Em sento còmode dirigint els altres i dient-los què han de fer.' },
    { text: 'Quan treballo en equip, sovint acabo agafant jo el comandament.' },
  ],
  Autosuficiència: [
    { text: 'Confio moltíssim en les meves capacitats, gairebé per a tot.' },
    { text: "Rarament necessito l'ajuda de ningú per aconseguir el que vull." },
    { text: 'Sovint dubto de si seré capaç de fer bé les coses.', rev: true },
  ],
  Superioritat: [
    { text: 'En el fons, em considero una persona especial, per sobre de la mitjana.' },
    { text: 'Tinc qualitats que la majoria de gent no té.' },
    { text: 'Em veig com una persona bastant corrent, com qualsevol altra.', rev: true },
  ],
  Exhibicionisme: [
    { text: "M'agrada ser el centre d'atenció en una festa o una reunió." },
    { text: 'Disfruto quan la gent es fixa en mi.' },
    { text: "Prefereixo passar desapercebut abans que cridar l'atenció.", rev: true },
  ],
  Explotació: [
    { text: "Se'm dona bé convèncer la gent perquè faci el que jo vull." },
    { text: 'Sé aprofitar les situacions al meu favor, encara que altres hi surtin perdent.' },
    { text: 'Puc fer que la gent vegi les coses com jo vull que les vegin.' },
  ],
  Vanitat: [
    { text: "M'importa força la meva imatge i quedar bé a les fotos." },
    { text: "Em miro sovint abans de sortir de casa i m'agrada anar impecable." },
    { text: 'El meu aspecte físic no és una cosa que em preocupi gaire.', rev: true },
  ],
  'Dret adquirit': [
    { text: 'Crec que mereixo coses millors que la majoria de la gent.' },
    { text: "M'irrita haver de complir normes que, al meu parer, no s'haurien d'aplicar a mi." },
    { text: 'Espero que els altres tinguin en compte les meves necessitats abans que les seves.' },
  ],
};

/** Els 21 ítems en l'ordre de presentació: ronda 1 de cada dimensió, ronda 2, ronda 3. */
export const ITEMS: ReadonlyArray<Item> = [0, 1, 2].flatMap((round) =>
  DIMS.map((dim) => ({ dim, ...BANK[dim][round] })),
);

export const N_ITEMS = ITEMS.length;

/** Els cinc punts de l'escala, amb l'etiqueta que es veu sota cada número. */
export const SCALE: ReadonlyArray<{ v: number; label: string; short: string }> = [
  { v: 1, label: "Gens d'acord", short: 'Gens' },
  { v: 2, label: 'Poc', short: 'Poc' },
  { v: 3, label: 'Ni sí ni no', short: 'Ni sí ni no' },
  { v: 4, label: 'Bastant', short: 'Bastant' },
  { v: 5, label: "Totalment d'acord", short: 'Totalment' },
];

export interface Band {
  /** Percentatge màxim inclòs en la banda. */
  max: number;
  name: string;
  short: string;
  range: string;
  text: string;
}

export const BANDS: ReadonlyArray<Band> = [
  {
    max: 30,
    name: 'Tret baix',
    short: 'baix',
    range: '0 a 30',
    text: 'Has marcat poques respostes en la línia narcisista. Tendeixes a no posar-te per davant dels altres i a no necessitar gaire reconeixement. És un perfil baix en el tret, cosa perfectament normal i sana.',
  },
  {
    max: 50,
    name: 'Tret moderat',
    short: 'moderat',
    range: '31 a 50',
    text: 'Ets a la zona on hi ha la major part de la població. Una mica de narcisisme sa forma part de tenir bona autoestima i confiança en un mateix; no és cap problema.',
  },
  {
    max: 70,
    name: 'Tret marcat',
    short: 'marcat',
    range: '51 a 70',
    text: 'Has marcat bastantes respostes narcisistes, per sobre de la mitjana. Recorda que el tret, per si sol, no és cap trastorn: el que compta de veritat és si aquesta manera de ser et fa mal a tu o a la gent del teu voltant.',
  },
  {
    max: 100,
    name: 'Tret alt',
    short: 'alt',
    range: '71 a 100',
    text: "Has marcat moltes respostes en la línia narcisista, cosa que indica trets molt visibles. Continua sense ser cap diagnòstic: moltíssima gent amb trets alts té una vida i unes relacions perfectament sanes, sobretot si manté l'empatia i sap acceptar les crítiques.",
  },
];

/** Patró d'exemple per a `?demo=1` (captures del treball i defensa): 54 %, tret marcat. */
export const DEMO_ANSWERS: ReadonlyArray<number> = [4, 3, 5, 2, 3, 4, 3, 2, 4, 5, 3, 2, 3, 4, 2, 3, 4, 3, 2, 3, 4];
