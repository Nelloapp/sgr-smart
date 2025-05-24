import { MenuItem, Category, Table } from '@/types';

// Sample categories
export const SAMPLE_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Antipasti',
    type: 'food',
    order: 1
  },
  {
    id: 'cat-2',
    name: 'Primi Piatti',
    type: 'food',
    order: 2
  },
  {
    id: 'cat-3',
    name: 'Secondi Piatti',
    type: 'food',
    order: 3
  },
  {
    id: 'cat-4',
    name: 'Contorni',
    type: 'food',
    order: 4
  },
  {
    id: 'cat-5',
    name: 'Dolci',
    type: 'food',
    order: 5
  },
  {
    id: 'cat-6',
    name: 'Bevande Analcoliche',
    type: 'drink',
    order: 6
  },
  {
    id: 'cat-7',
    name: 'Vini',
    type: 'drink',
    order: 7
  },
  {
    id: 'cat-8',
    name: 'Birre',
    type: 'drink',
    order: 8
  },
  {
    id: 'cat-9',
    name: 'Cocktail',
    type: 'drink',
    order: 9
  }
];

// Sample menu items
export const SAMPLE_MENU_ITEMS: MenuItem[] = [
  // Antipasti
  {
    id: 'item-1',
    name: 'Bruschetta al Pomodoro',
    description: 'Pane tostato con pomodoro fresco, aglio, basilico e olio d\'oliva',
    price: 6.50,
    categoryId: 'cat-1',
    type: 'food',
    available: true
  },
  {
    id: 'item-2',
    name: 'Tagliere di Salumi e Formaggi',
    description: 'Selezione di salumi e formaggi locali con miele e confetture',
    price: 14.00,
    categoryId: 'cat-1',
    type: 'food',
    available: true
  },
  {
    id: 'item-3',
    name: 'Carpaccio di Manzo',
    description: 'Sottili fette di manzo crudo con rucola, parmigiano e tartufo',
    price: 12.00,
    categoryId: 'cat-1',
    type: 'food',
    available: true
  },
  
  // Primi Piatti
  {
    id: 'item-4',
    name: 'Spaghetti alla Carbonara',
    description: 'Spaghetti con uova, guanciale, pecorino romano e pepe nero',
    price: 12.00,
    categoryId: 'cat-2',
    type: 'food',
    available: true
  },
  {
    id: 'item-5',
    name: 'Risotto ai Funghi Porcini',
    description: 'Risotto cremoso con funghi porcini freschi e parmigiano',
    price: 14.00,
    categoryId: 'cat-2',
    type: 'food',
    available: true
  },
  {
    id: 'item-6',
    name: 'Lasagne alla Bolognese',
    description: 'Strati di pasta con ragù di carne, besciamella e parmigiano',
    price: 13.00,
    categoryId: 'cat-2',
    type: 'food',
    available: true
  },
  
  // Secondi Piatti
  {
    id: 'item-7',
    name: 'Tagliata di Manzo',
    description: 'Controfiletto di manzo con rucola e scaglie di parmigiano',
    price: 22.00,
    categoryId: 'cat-3',
    type: 'food',
    available: true
  },
  {
    id: 'item-8',
    name: 'Branzino al Forno',
    description: 'Branzino intero al forno con patate, pomodorini e olive',
    price: 24.00,
    categoryId: 'cat-3',
    type: 'food',
    available: true
  },
  {
    id: 'item-9',
    name: 'Scaloppine al Limone',
    description: 'Fettine di vitello con salsa al limone e prezzemolo',
    price: 18.00,
    categoryId: 'cat-3',
    type: 'food',
    available: true
  },
  
  // Contorni
  {
    id: 'item-10',
    name: 'Patate Arrosto',
    description: 'Patate al forno con rosmarino e aglio',
    price: 5.00,
    categoryId: 'cat-4',
    type: 'food',
    available: true
  },
  {
    id: 'item-11',
    name: 'Verdure Grigliate',
    description: 'Selezione di verdure di stagione grigliate',
    price: 6.00,
    categoryId: 'cat-4',
    type: 'food',
    available: true
  },
  {
    id: 'item-12',
    name: 'Insalata Mista',
    description: 'Insalata verde con pomodoro, carote e cetrioli',
    price: 4.50,
    categoryId: 'cat-4',
    type: 'food',
    available: true
  },
  
  // Dolci
  {
    id: 'item-13',
    name: 'Tiramisù',
    description: 'Classico dolce italiano con mascarpone, caffè e cacao',
    price: 7.00,
    categoryId: 'cat-5',
    type: 'food',
    available: true
  },
  {
    id: 'item-14',
    name: 'Panna Cotta',
    description: 'Crema cotta con salsa ai frutti di bosco',
    price: 6.50,
    categoryId: 'cat-5',
    type: 'food',
    available: true
  },
  {
    id: 'item-15',
    name: 'Cannolo Siciliano',
    description: 'Dolce siciliano con crema di ricotta e scaglie di cioccolato',
    price: 6.00,
    categoryId: 'cat-5',
    type: 'food',
    available: true
  },
  
  // Bevande Analcoliche
  {
    id: 'item-16',
    name: 'Acqua Minerale (0.75L)',
    description: 'Acqua minerale naturale o frizzante',
    price: 3.00,
    categoryId: 'cat-6',
    type: 'drink',
    available: true
  },
  {
    id: 'item-17',
    name: 'Coca Cola (0.33L)',
    description: 'Bevanda gassata',
    price: 3.50,
    categoryId: 'cat-6',
    type: 'drink',
    available: true
  },
  {
    id: 'item-18',
    name: 'Succo di Frutta',
    description: 'Arancia, pesca o mela',
    price: 4.00,
    categoryId: 'cat-6',
    type: 'drink',
    available: true
  },
  
  // Vini
  {
    id: 'item-19',
    name: 'Chianti Classico',
    description: 'Vino rosso toscano (bottiglia)',
    price: 28.00,
    categoryId: 'cat-7',
    type: 'drink',
    available: true
  },
  {
    id: 'item-20',
    name: 'Pinot Grigio',
    description: 'Vino bianco del Veneto (bottiglia)',
    price: 24.00,
    categoryId: 'cat-7',
    type: 'drink',
    available: true
  },
  {
    id: 'item-21',
    name: 'Prosecco',
    description: 'Spumante del Veneto (bottiglia)',
    price: 26.00,
    categoryId: 'cat-7',
    type: 'drink',
    available: true
  },
  
  // Birre
  {
    id: 'item-22',
    name: 'Moretti (0.33L)',
    description: 'Birra chiara italiana',
    price: 4.50,
    categoryId: 'cat-8',
    type: 'drink',
    available: true
  },
  {
    id: 'item-23',
    name: 'Ichnusa (0.33L)',
    description: 'Birra sarda non filtrata',
    price: 5.00,
    categoryId: 'cat-8',
    type: 'drink',
    available: true
  },
  {
    id: 'item-24',
    name: 'Peroni (0.33L)',
    description: 'Birra chiara italiana',
    price: 4.50,
    categoryId: 'cat-8',
    type: 'drink',
    available: true
  },
  
  // Cocktail
  {
    id: 'item-25',
    name: 'Spritz',
    description: 'Prosecco, Aperol e soda',
    price: 7.00,
    categoryId: 'cat-9',
    type: 'drink',
    available: true
  },
  {
    id: 'item-26',
    name: 'Negroni',
    description: 'Gin, Vermouth rosso e Campari',
    price: 8.00,
    categoryId: 'cat-9',
    type: 'drink',
    available: true
  },
  {
    id: 'item-27',
    name: 'Mojito',
    description: 'Rum, lime, zucchero, menta e soda',
    price: 8.00,
    categoryId: 'cat-9',
    type: 'drink',
    available: true
  }
];

// Sample tables
export const SAMPLE_TABLES: Table[] = [
  {
    id: 'table-1',
    number: 1,
    seats: 4,
    status: 'available'
  },
  {
    id: 'table-2',
    number: 2,
    seats: 2,
    status: 'available'
  },
  {
    id: 'table-3',
    number: 3,
    seats: 6,
    status: 'available'
  },
  {
    id: 'table-4',
    number: 4,
    seats: 4,
    status: 'available'
  },
  {
    id: 'table-5',
    number: 5,
    seats: 8,
    status: 'available'
  }
];