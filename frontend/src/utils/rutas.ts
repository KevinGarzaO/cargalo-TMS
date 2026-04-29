export const RUTAS_MOCK = [
  { 
    id: 'R-101', 
    nombre: 'Ruta CDMX Norte - Matutina', 
    cliente: 'Mercado El Sol',
    driver: 'Esteban Carrillo',
    estado: 'Activa', 
    paradasCount: 5, 
    distanciaEstimada: '42 km',
    paradas: [
      { id: 'S1', tipo: 'recoleccion', direccion: 'Av. Insurgentes 1500, CDMX', contacto: 'Andrés López', tel: '5511223344' },
      { id: 'S2', tipo: 'entrega', direccion: 'Calle 5 de Mayo, Centro Histórico', contacto: 'María García', tel: '5599887766' },
      { id: 'S3', tipo: 'entrega', direccion: 'Av. Reforma 222, CDMX', contacto: 'Jorge Ortiz', tel: '5544332211' }
    ]
  },
  { 
    id: 'R-102', 
    nombre: 'Ruta Guadalajara - Zapopan', 
    cliente: 'TecnoStock',
    driver: 'María Olivares',
    estado: 'Activa', 
    paradasCount: 3, 
    distanciaEstimada: '18 km',
    paradas: [
      { id: 'S4', tipo: 'recoleccion', direccion: 'Parque Industrial Zapopan', contacto: 'Roberto Gómez', tel: '3311223344' },
      { id: 'S5', tipo: 'entrega', direccion: 'Plaza Andares, Zapopan', contacto: 'Sofia Ruiz', tel: '3399887766' }
    ]
  },
  { 
    id: 'R-103', 
    nombre: 'Ruta Monterrey - Santa Catarina', 
    cliente: 'Boutique Camelia',
    driver: 'Jorge Ibáñez',
    estado: 'Inactiva', 
    paradasCount: 4, 
    distanciaEstimada: '35 km',
    paradas: []
  },
  { 
    id: 'R-999', 
    nombre: 'Ruta Masiva de Prueba (10 Paradas)', 
    cliente: 'Logística Total',
    driver: 'Laura Mendoza',
    estado: 'Activa', 
    paradasCount: 10, 
    distanciaEstimada: '---',
    paradas: [
      { id: 'SM1', tipo: 'recoleccion', direccion: 'Libramiento Norte 12, Tepotzotlán, Méx.', contacto: 'Bodega Principal', tel: '55112233' },
      { id: 'SM2', tipo: 'entrega', direccion: 'Circuito Ingenieros, Cd. Satélite, Naucalpan', contacto: 'Sucursal Satélite', tel: '55223344' },
      { id: 'SM3', tipo: 'entrega', direccion: 'Av. Ejército Nacional Mexicano 843, Granada, CDMX', contacto: 'Antara Fashion Hall', tel: '55334455' },
      { id: 'SM4', tipo: 'entrega', direccion: 'Vasco de Quiroga 3800, Lomas de Santa Fe, CDMX', contacto: 'Santa Fe Mall', tel: '55445566' },
      { id: 'SM5', tipo: 'recoleccion', direccion: 'Michoacán 121, Hipódromo Condesa, CDMX', contacto: 'Pick-up Condesa', tel: '55556677' },
      { id: 'SM6', tipo: 'entrega', direccion: 'Av. Álvaro Obregón 110, Roma Nte., CDMX', contacto: 'Roma Market', tel: '55667788' },
      { id: 'SM7', tipo: 'entrega', direccion: 'Calle de Tacuba 8, Centro Histórico, CDMX', contacto: 'Palacio Postal', tel: '55778899' },
      { id: 'SM8', tipo: 'entrega', direccion: 'Calle de la Amargura 5, San Ángel, CDMX', contacto: 'Mercado del Carmen', tel: '55889900' },
      { id: 'SM9', tipo: 'entrega', direccion: 'Calz. de Tlalpan 3000, Coyoacán, CDMX', contacto: 'Estadio Azteca', tel: '55990011' },
      { id: 'SM10', tipo: 'entrega', direccion: 'Av. Insurgentes Sur 3500, Peña Pobre, CDMX', contacto: 'Cuicuilco', tel: '55001122' }
    ]
  },
];
