export interface DifferenceSpot {
  id: string;
  label: string;
  x: number; // 0..100 percentage in scene viewBox (400x300 -> x/4)
  y: number; // 0..100 percentage in scene viewBox (400x300 -> y/3)
  radius: number; // hit radius in percentage units
}

export interface SpotDifferenceCase {
  id: string;
  title: string;
  subtitle: string;
  difficulty: 'Fácil' | 'Media' | 'Experto';
  differences: DifferenceSpot[];
}

export const SPOT_DIFFERENCE_CASES: SpotDifferenceCase[] = [
  {
    id: 'office_precinct',
    title: 'Despacho del Comisario',
    subtitle: 'Alguien entró durante el cambio de turno y alteró 6 detalles clave.',
    difficulty: 'Fácil',
    differences: [
      { id: 'clock', label: 'Hora del reloj de pared', x: 20, y: 22, radius: 9 },
      { id: 'frame', label: 'Cuadro inclinado en la pared', x: 52, y: 24, radius: 10 },
      { id: 'lamp', label: 'Color de la lámpara de mesa', x: 77, y: 39, radius: 9 },
      { id: 'mug', label: 'Taza volcada y café derramado', x: 35, y: 54, radius: 9 },
      { id: 'drawer', label: 'Cajón del escritorio abierto', x: 64, y: 72, radius: 9 },
      { id: 'footprint', label: 'Huella de bota en la alfombra', x: 26, y: 84, radius: 9 },
    ],
  },
  {
    id: 'museum_hall',
    title: 'Sala de Exhibición',
    subtitle: 'El robo ocurrió en 40 segundos. Detecta las 6 anomalías tras el atraco.',
    difficulty: 'Media',
    differences: [
      { id: 'spotlight', label: 'Foco superior apagado', x: 50, y: 12, radius: 9 },
      { id: 'painting', label: 'Obra del marco izquierdo cambiada', x: 19, y: 34, radius: 10 },
      { id: 'gem', label: 'Diamante reemplazado por cubo', x: 50, y: 46, radius: 9 },
      { id: 'glass', label: 'Grieta en la vitrina central', x: 56, y: 53, radius: 9 },
      { id: 'rope', label: 'Cordón de seguridad desatado', x: 27, y: 74, radius: 9 },
      { id: 'note', label: 'Nota anónima junto al pedestal', x: 76, y: 82, radius: 9 },
    ],
  },
  {
    id: 'station_cafe',
    title: 'Cafetería de la Estación',
    subtitle: 'Último paradero del sospechoso. Ubica los 6 rastros manipulados.',
    difficulty: 'Experto',
    differences: [
      { id: 'menu', label: 'Cartel del menú alterado', x: 24, y: 24, radius: 10 },
      { id: 'pendant', label: 'Lámpara colgante derecha distinta', x: 74, y: 19, radius: 9 },
      { id: 'umbrella', label: 'Paraguas desaparecido del perchero', x: 86, y: 56, radius: 9 },
      { id: 'newspaper', label: 'Titular del periódico invertido', x: 46, y: 55, radius: 9 },
      { id: 'bill', label: 'Billete dejado sobre la barra', x: 63, y: 57, radius: 9 },
      { id: 'suitcase', label: 'Maletín cambiado de lado', x: 32, y: 82, radius: 10 },
    ],
  },
];
