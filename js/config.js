// JB-SQUAD: Configuración y Constantes Estáticas
// v1.0.0 - 2026-04-13 | 15:50

const POSITIONS = ['POR', 'DFC', 'CAD', 'CAI', 'LI', 'LD', 'MCD', 'MC', 'MVI', 'MVD', 'MD', 'MI', 'MCO', 'ED', 'EI', 'DC'];

const FORMATIONS = {
    '4-4-2': [
        { id: 'GK', pos: 'POR', x: 50, y: 92 },
        { id: 'LD', pos: 'LD', x: 85, y: 70 }, { id: 'DFC1', pos: 'DFC', x: 62, y: 70 }, { id: 'DFC2', pos: 'DFC', x: 38, y: 70 }, { id: 'LI', pos: 'LI', x: 15, y: 70 },
        { id: 'MD', pos: 'MD', x: 85, y: 44 }, { id: 'MC1', pos: 'MC', x: 62, y: 44 }, { id: 'MC2', pos: 'MC', x: 38, y: 44 }, { id: 'MI', pos: 'MI', x: 15, y: 44 },
        { id: 'DC1', pos: 'DC', x: 62, y: 18 }, { id: 'DC2', pos: 'DC', x: 38, y: 18 }
    ],
    '4-2-3-1': [
        { id: 'GK', pos: 'POR', x: 50, y: 92 },
        { id: 'LD', pos: 'LD', x: 85, y: 72 }, { id: 'DFC1', pos: 'DFC', x: 62, y: 72 }, { id: 'DFC2', pos: 'DFC', x: 38, y: 72 }, { id: 'LI', pos: 'LI', x: 15, y: 72 },
        { id: 'MCD1', pos: 'MCD', x: 65, y: 55 }, { id: 'MCD2', pos: 'MCD', x: 35, y: 55 },
        { id: 'MD', pos: 'MD', x: 85, y: 36 }, { id: 'MCO', pos: 'MCO', x: 50, y: 36 }, { id: 'MI', pos: 'MI', x: 15, y: 36 },
        { id: 'DC', pos: 'DC', x: 50, y: 16 }
    ],
    '3-5-2': [
        { id: 'GK', pos: 'POR', x: 50, y: 92 },
        { id: 'DFC1', pos: 'DFC', x: 75, y: 68 }, { id: 'DFC2', pos: 'DFC', x: 50, y: 68 }, { id: 'DFC3', pos: 'DFC', x: 25, y: 68 },
        { id: 'MCD1', pos: 'MCD', x: 68, y: 51 }, { id: 'MCD2', pos: 'MCD', x: 32, y: 51 },
        { id: 'MD', pos: 'MD', x: 86, y: 34 }, { id: 'MC', pos: 'MC', x: 50, y: 36 }, { id: 'MI', pos: 'MI', x: 14, y: 34 },
        { id: 'DC1', pos: 'DC', x: 62, y: 15 }, { id: 'DC2', pos: 'DC', x: 38, y: 15 }
    ],
    '3-4-1-2': [
        { id: 'GK', pos: 'POR', x: 50, y: 92 },
        { id: 'DFC1', pos: 'DFC', x: 75, y: 72 }, { id: 'DFC2', pos: 'DFC', x: 50, y: 72 }, { id: 'DFC3', pos: 'DFC', x: 25, y: 72 },
        { id: 'MD', pos: 'MD', x: 86, y: 51 }, { id: 'MC1', pos: 'MC', x: 62, y: 51 }, { id: 'MC2', pos: 'MC', x: 38, y: 51 }, { id: 'MI', pos: 'MI', x: 14, y: 51 },
        { id: 'MCO', pos: 'MCO', x: 50, y: 32 },
        { id: 'DC1', pos: 'DC', x: 62, y: 14 }, { id: 'DC2', pos: 'DC', x: 38, y: 14 }
    ],
    '3-1-4-2': [
        { id: 'GK', pos: 'POR', x: 50, y: 92 },
        { id: 'DFC1', pos: 'DFC', x: 75, y: 78 }, { id: 'DFC2', pos: 'DFC', x: 50, y: 78 }, { id: 'DFC3', pos: 'DFC', x: 25, y: 78 },
        { id: 'MCD', pos: 'MCD', x: 50, y: 62 },
        { id: 'MD', pos: 'MD', x: 86, y: 44 }, { id: 'MC1', pos: 'MC', x: 65, y: 44 }, { id: 'MC2', pos: 'MC', x: 35, y: 44 }, { id: 'MI', pos: 'MI', x: 14, y: 44 },
        { id: 'DC1', pos: 'DC', x: 62, y: 16 }, { id: 'DC2', pos: 'DC', x: 38, y: 16 }
    ]
};

const AVATARS = [
    { id: 1, svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 6C13.66 6 15 7.34 15 9C15 10.66 13.66 12 12 12C10.34 12 9 10.66 9 9C9 7.34 10.34 6 12 6ZM12 20C9.11 20 6.57 18.52 5.12 16.32C5.16 14.04 8.72 12.8 12 12.8C15.26 12.8 18.84 14.04 18.88 16.32C17.43 18.52 14.89 20 12 20Z" fill="#F0A500"/></svg>` },
    { id: 2, svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#F0A500"/></svg>` },
    { id: 3, svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z" fill="#FCA500"/></svg>` },
    { id: 4, svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 14C15.3137 14 18 11.3137 18 8C18 4.68629 15.3137 2 12 2C8.68629 2 6 4.68629 6 8C6 11.3137 8.68629 14 12 14Z" fill="#F0A500"/><path d="M12 16C7.99 16 0 18.01 0 22V24H24V22C24 18.01 16.01 16 12 16Z" fill="#F0A500"/></svg>` },
    { id: 5, svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM12 8C15.33 8 22 9.67 22 13V18H20V22H18V18H16V22H14V18H10V22H8V18H6V22H4V18H2V13C2 9.67 8.67 8 12 8Z" fill="#F0A500"/></svg>` },
    { id: 6, svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 4C13.1 4 14 4.9 14 6C14 7.1 13.1 8 12 8C10.9 8 10 7.1 10 6C10 4.9 10.9 4 12 4ZM12 20C9.11 20 6.57 18.52 5.12 16.32C5.16 14.04 8.72 12.8 12 12.8C15.26 12.8 18.84 14.04 18.88 16.32C17.43 18.52 14.89 20 12 20Z" fill="#F0A500"/></svg>` },
    { id: 7, svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="4" fill="#F0A500"/><path d="M20 19C20 16.24 16.42 14 12 14C7.58 14 4 16.24 4 19V20H20V19Z" fill="#F0A500"/></svg>` },
    { id: 8, svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 6C13.66 6 15 7.34 15 9C15 10.66 13.66 12 12 12C10.34 12 9 10.66 9 9C9 7.34 10.34 6 12 6ZM12 20C9.11 20 6.57 18.52 5.12 16.32C5.16 14.04 8.72 12.8 12 12.8C15.26 12.8 18.84 14.04 18.88 16.32C17.43 18.52 14.89 20 12 20Z" fill="#B8860B"/></svg>` }
];
