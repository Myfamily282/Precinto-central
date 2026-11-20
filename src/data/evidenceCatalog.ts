import type { EvidencePair, PrivateClue } from '../shared/types.ts';

export const EVIDENCE_PAIRS: EvidencePair[] = [
  {
    id: 'watch_compass',
    caseCode: 'ROBO #001',
    title: 'El Robo del Reloj del Alcalde',
    caseDescription:
      'Se reportó un robo durante un evento nocturno en el edificio municipal. Solo los detectives poseen el expediente detallado.',
    detectiveBriefing:
      'Anoche a las 22:15, en plena gala del salón principal del Ayuntamiento, alguien desconectó la alarma trasera, cortó el cristal de la vitrina central y sustrajo la pieza dorada heredada del alcalde antes de huir por la escalera de servicio. Necesitamos identificar con precisión qué objeto se robó y quién miente sobre su descripción.',
    impostorBriefing:
      'Hubo un robo reciente en un evento de la ciudad (~10% de datos: desconoces la hora exacta, el lugar preciso y los detalles de la vitrina).',
    detectiveItem: {
      id: 'pocket_watch',
      name: 'Reloj de Bolsillo',
      category: 'Botín de Oro',
      subtleHint: 'Pieza circular dorada recuperada del inventario del robo.',
    },
    impostorItem: {
      id: 'brass_compass',
      name: 'Brújula Antigua',
      category: 'Instrumento de Latón',
      subtleHint: 'Pieza circular metálica con tapa bisagrada y aguja interior.',
    },
    cluesPool: [
      {
        id: 'wc1',
        title: 'Hora del Sabotaje',
        detail: 'Las cámaras se apagaron exactamente a las 22:15; el botín detenido quedó marcando las 10:15 en números romanos.',
      },
      {
        id: 'wc2',
        title: 'Testimonio del Guardia',
        detail: 'El ladrón murmuró que llegaba tarde y miró la esfera de su bolsillo antes de forzar la cerradura.',
      },
      {
        id: 'wc3',
        title: 'Nota del Ladrón',
        detail: 'En un papel rasgado decía: "Nos vemos cuando las dos manecillas marquen medianoche".',
      },
      {
        id: 'wc4',
        title: 'Registro de Vitrina',
        detail: 'El alcalde confirmó que solo le robaron la joya heredada con cadena que da la hora exacta.',
      },
      {
        id: 'wc5',
        title: 'Audio de Pasillo',
        detail: 'El micrófono captó un leve tic-tac metálico alejándose hacia la escalera de emergencia.',
      },
      {
        id: 'wc6',
        title: 'Rastro en Terciopelo',
        detail: 'Sobre la almohadilla vacía quedó la marca de un botón de cuerda superior, sin puntos cardinales.',
      },
      {
        id: 'wc7',
        title: 'Informe de Seguro',
        detail: 'La póliza valora el objeto robado en $40,000 por su maquinaria suiza de engranajes.',
      },
      {
        id: 'wc8',
        title: 'Descarte Forense',
        detail: 'No había mapas ni rutas marítimas en la sala; el objetivo del ladrón no era de orientación.',
      },
    ],
  },
  {
    id: 'espresso_teapot',
    caseCode: 'ROBO #002',
    title: 'Hurto en la Cafetería del Banco',
    caseDescription:
      'Ocurrió un incidente vinculado a un robo bancario matutino. El expediente completo es confidencial para detectives.',
    detectiveBriefing:
      'A las 08:40 de la mañana, minutos antes de vaciar la caja menor de la sucursal central, el sospechoso se sentó 3 minutos en la cafetería de enfrente para vigilar al gerente y dejó abandonada una pieza blanca de mesa con huellas frescas y ADN en el borde. Confirma exactamente qué pieza manipuló.',
    impostorBriefing:
      'Se investiga un hurto matutino cerca de un local comercial (~10% de datos: no sabes qué pasó antes ni el tiempo ni el rastro exacto).',
    detectiveItem: {
      id: 'espresso_cup',
      name: 'Taza de Café Expreso',
      category: 'Evidencia de Mesa',
      subtleHint: 'Porcelana blanca pequeña hallada en la mesa del sospechoso.',
    },
    impostorItem: {
      id: 'ceramic_teapot',
      name: 'Tetera de Porcelana',
      category: 'Vajilla de Mesa',
      subtleHint: 'Porcelana blanca con asa lateral usada en la misma cafetería.',
    },
    cluesPool: [
      {
        id: 'et1',
        title: 'Ticket de Compra',
        detail: 'El sospechoso pagó a las 08:40 un único café corto individual antes de cruzar al banco.',
      },
      {
        id: 'et2',
        title: 'Huella Dactilar',
        detail: 'Se levantó una huella de pulgar en el borde de un platillo redondo pequeño bajo la pieza.',
      },
      {
        id: 'et3',
        title: 'Residuo Químico',
        detail: 'En el interior abierto quedó espuma oscura de café recién servido, sin hojas de té.',
      },
      {
        id: 'et4',
        title: 'Informe del Mesero',
        detail: 'El ladrón bebió de un solo trago rápido porque tenía prisa antes de que abriera la bóveda.',
      },
      {
        id: 'et5',
        title: 'Resto en el Suelo',
        detail: 'No se encontró ninguna tapa caída ni pico roto; era una sola pieza abierta por arriba.',
      },
      {
        id: 'et6',
        title: 'Cámara de Barra',
        detail: 'El sospechoso sostuvo la pieza con solo dos dedos por una oreja diminuta.',
      },
      {
        id: 'et7',
        title: 'Tiempo de Huida',
        detail: 'Solo estuvo sentado 3 minutos: imposible que pidiera un recipiente grande para compartir.',
      },
      {
        id: 'et8',
        title: 'Traza de ADN',
        detail: 'Se obtuvo muestra biológica directamente del borde superior donde apoyó los labios.',
      },
    ],
  },
  {
    id: 'camera_binoculars',
    caseCode: 'ROBO #003',
    title: 'Robo de Secretos en el Muelle',
    caseDescription:
      'Se registró un robo nocturno en el puerto comercial. La información técnica está restringida a los detectives.',
    detectiveBriefing:
      'Un infiltrado subió a la azotea del almacén 4 del muelle para registrar en secreto la combinación de la caja fuerte mientras el guardia abría la puerta blindada, y luego robó el cargamento de madrugada dejando restos ópticos junto al respiradero. Deben deducir con qué dispositivo obtuvo los códigos.',
    impostorBriefing:
      'Alguien robó mercancía en la zona del puerto (~10% de datos: no conoces desde dónde vigiló ni cómo capturó la información).',
    detectiveItem: {
      id: 'vintage_camera',
      name: 'Cámara Fotográfica',
      category: 'Equipo de Vigilancia',
      subtleHint: 'Dispositivo óptico oscuro con detalles plateados hallado en la azotea.',
    },
    impostorItem: {
      id: 'field_binoculars',
      name: 'Binoculares de Campo',
      category: 'Óptica de Largo Alcance',
      subtleHint: 'Equipo óptico oscuro con lentes frontales utilizado para vigilar desde lejos.',
    },
    cluesPool: [
      {
        id: 'cb1',
        title: 'Evidencia en Basura',
        detail: 'Junto al respiradero encontraron un rollo de película negativa con 4 disparos usados.',
      },
      {
        id: 'cb2',
        title: 'Sonido Reportado',
        detail: 'El vigilante oyó un clic mecánico de obturador justo cuando abrió la puerta blindada.',
      },
      {
        id: 'cb3',
        title: 'Marca en el Trípode',
        detail: 'El equipo se apoyó sobre una base plana rectangular con un solo lente central.',
      },
      {
        id: 'cb4',
        title: 'Destello Nocturno',
        detail: 'Un vecino vio un breve reflejo desde la zapata superior del aparato en la cornisa.',
      },
      {
        id: 'cb5',
        title: 'Cómplice Externo',
        detail: 'El ladrón necesitaba pruebas impresas en papel para entregárselas al comprador del robo.',
      },
      {
        id: 'cb6',
        title: 'Tapa Perdida',
        detail: 'Recogieron una sola tapa circular de lente caída en el charco, no un par doble.',
      },
      {
        id: 'cb7',
        title: 'Huella de Dedo Índice',
        detail: 'El ladrón usó el botón disparador superior derecho mientras miraba por un visor pequeño.',
      },
      {
        id: 'cb8',
        title: 'Motivo del Robo',
        detail: 'No bastaba con mirar de lejos: el plan exigía capturar una imagen fija de los códigos.',
      },
    ],
  },
  {
    id: 'key_padlock',
    caseCode: 'ROBO #004',
    title: 'El Atraco Silencioso de la Joyería',
    caseDescription:
      'Sucedió un robo sin fuerza bruta en un comercio del centro. Solo los detectives acceden al informe pericial.',
    detectiveBriefing:
      'Entre las 02:00 y las 02:30, un ladrón entró por la reja trasera de la joyería sin romper vidrios ni cortar cadenas: abrió tanto la puerta exterior como el despacho del gerente limpiamente y vació la bandeja de collares, dejando virutas metálicas en el cerrojo.',
    impostorBriefing:
      'Se denunció un robo nocturno en una tienda (~10% de datos: ignoras cómo entraron, qué puertas abrieron y qué rastros quedaron).',
    detectiveItem: {
      id: 'skeleton_key',
      name: 'Llave Maestra de Bronce',
      category: 'Herramienta del Robo',
      subtleHint: 'Pieza de bronce antiguo recogida cerca de la puerta trasera.',
    },
    impostorItem: {
      id: 'brass_padlock',
      name: 'Candado Antiguo',
      category: 'Cierre Metálico',
      subtleHint: 'Pieza pesada de bronce asociada a la seguridad de la reja trasera.',
    },
    cluesPool: [
      {
        id: 'kp1',
        title: 'Informe de Cerrajería',
        detail: 'La cerradura no fue golpeada ni cortada: alguien giró los pistones internos con una pieza dentada.',
      },
      {
        id: 'kp2',
        title: 'Rastro en el Bolsillo',
        detail: 'El ladrón llevaba una pieza larga y delgada oculta en el forro de su abrigo.',
      },
      {
        id: 'kp3',
        title: 'Testigo en la Esquina',
        detail: 'Vio al sospechoso insertar un objeto fino en la puerta y girar la muñeca una sola vez.',
      },
      {
        id: 'kp4',
        title: 'Aro de Llavero',
        detail: 'La pieza tenía una cabeza redonda plana para hacer palanca al girar dentro del cerrojo.',
      },
      {
        id: 'kp5',
        title: 'Copia Ilegal',
        detail: 'Un ex empleado duplicó el acceso maestro semanas antes del robo.',
      },
      {
        id: 'kp6',
        title: 'Ausencia de Cizalla',
        detail: 'No usaron pinzas ni rompieron ningún arco de acero; el cierre original quedó intacto en su sitio.',
      },
      {
        id: 'kp7',
        title: 'Virutas de Bronce',
        detail: 'Dentro del ojo de la cerradura quedaron partículas frescas de bronce tallado.',
      },
      {
        id: 'kp8',
        title: 'Acceso Múltiple',
        detail: 'Con esa misma pieza el ladrón abrió también el despacho del gerente sin forzarlo.',
      },
    ],
  },
  {
    id: 'fountain_brush',
    caseCode: 'ROBO #005',
    title: 'Falsificación y Robo en el Museo',
    caseDescription:
      'Falta una pieza histórica en una sala de exposición. Los detalles del engaño son exclusivos para detectives.',
    detectiveBriefing:
      'Durante el cambio de guardia en el ala oeste del museo, el ladrón sustituyó un manuscrito histórico por una copia y falsificó la firma del director en el libro de registro para retirar el archivo sin alarmas, manchándose los guantes con tinta oscura.',
    impostorBriefing:
      'Desapareció un artículo cultural de una sala (~10% de datos: no sabes qué documento fue ni cómo autorizaron la salida).',
    detectiveItem: {
      id: 'fountain_pen',
      name: 'Pluma Estilográfica',
      category: 'Instrumento de Falsificación',
      subtleHint: 'Herramienta delgada oscura hallada junto al libro de visitas.',
    },
    impostorItem: {
      id: 'paint_brush',
      name: 'Pincel de Madera',
      category: 'Herramienta de Taller',
      subtleHint: 'Herramienta delgada con virola metálica usada en restauración artística.',
    },
    cluesPool: [
      {
        id: 'fb1',
        title: 'Análisis Caligráfico',
        detail: 'La firma falsa en el registro muestra trazo fino de punta metálica rígida partida al centro.',
      },
      {
        id: 'fb2',
        title: 'Mancha en el Guante',
        detail: 'El ladrón se manchó los dedos al recargar un cartucho interno de tinta azul negra.',
      },
      {
        id: 'fb3',
        title: 'Capuchón Olvidado',
        detail: 'Bajo la vitrina apareció una tapa cilíndrica con clip dorado de bolsillo.',
      },
      {
        id: 'fb4',
        title: 'Sin Pintura al Óleo',
        detail: 'No robaron ningún cuadro pintado: el objetivo fue un contrato histórico escrito.',
      },
      {
        id: 'fb5',
        title: 'Prueba de Papel',
        detail: 'El papel presenta una leve hendidura por la presión de una punta dura, sin cerdas suaves.',
      },
      {
        id: 'fb6',
        title: 'Grabado Personal',
        detail: 'La pieza tenía un anillo dorado alrededor de un cuerpo liso lacado en negro.',
      },
      {
        id: 'fb7',
        title: 'Cámara de Recepción',
        detail: 'El sospechoso desenroscó el objeto frente al mostrador para anotar un código.',
      },
      {
        id: 'fb8',
        title: 'Motivo del Hurto',
        detail: 'Necesitaba imitar la firma exacta del director para autorizar el retiro del archivo.',
      },
    ],
  },
  {
    id: 'lamp_lantern',
    caseCode: 'ROBO #006',
    title: 'Asalto Durante el Apagón',
    caseDescription:
      'Se produjo un robo de documentos durante una falla eléctrica. El reporte completo solo lo ven los detectives.',
    detectiveBriefing:
      'Anoche a las 21:50, aprovechando el apagón del distrito, un intruso entró al despacho del director, usó la toma conectada al generador de respaldo para iluminar directamente los cajones de roble y robó los sobres confidenciales antes de arrancar el cable al huir.',
    impostorBriefing:
      'Hubo un robo en unas oficinas durante la noche (~10% de datos: desconoces el contexto del apagón, el mobiliario y la evidencia eléctrica).',
    detectiveItem: {
      id: 'desk_lamp',
      name: 'Lámpara de Escritorio',
      category: 'Escena del Robo',
      subtleHint: 'Fuente de luz con estructura metálica ubicada junto al escritorio asaltado.',
    },
    impostorItem: {
      id: 'hand_lantern',
      name: 'Farol Portátil',
      category: 'Fuente de Luz',
      subtleHint: 'Fuente de luz metálica utilizada en zonas oscuras durante el apagón.',
    },
    cluesPool: [
      {
        id: 'll1',
        title: 'Generador de Respaldo',
        detail: 'El enchufe de la pared funcionaba con batería de emergencia y alimentó una bombilla eléctrica.',
      },
      {
        id: 'll2',
        title: 'Huella en la Pantalla',
        detail: 'El ladrón inclinó un brazo articulado metálico para dirigir el foco directo sobre los cajones.',
      },
      {
        id: 'll3',
        title: 'Base Pesada',
        detail: 'La pieza no salió de la oficina: permaneció apoyada sobre el escritorio de roble.',
      },
      {
        id: 'll4',
        title: 'Sin Olor a Queroseno',
        detail: 'Los peritos descartaron llama abierta, mecha o vidrio protector alrededor de la luz.',
      },
      {
        id: 'll5',
        title: 'Testigo en la Ventana',
        detail: 'Desde la calle solo vio un cono de luz azulada apuntando hacia abajo sobre unos papeles.',
      },
      {
        id: 'll6',
        title: 'Cable Cortado',
        detail: 'Al huir, el asaltante tropezó y arrancó el cable eléctrico de la toma inferior.',
      },
      {
        id: 'll7',
        title: 'Sin Asa de Transporte',
        detail: 'El sospechoso no cargaba ningún gancho colgante en la mano al salir corriendo.',
      },
      {
        id: 'll8',
        title: 'Detalle de Huellas',
        detail: 'Las huellas aparecieron justo en el interruptor de la base circular negra.',
      },
    ],
  },
  {
    id: 'briefcase_safe',
    caseCode: 'ROBO #007',
    title: 'Robo en el Vagón Blindado',
    caseDescription:
      'Desaparecieron valores durante un traslado ferroviario. Los detalles del operativo son exclusivos para detectives.',
    detectiveBriefing:
      'En el tramo final hacia la estación central, alguien sustrajo del vagón blindado los bonos al portador de menos de 3 kilos y saltó por la ventanilla sujetando el bulto con una sola mano, dejando un broche dorado roto en el andén y un rastro hacia los taxis.',
    impostorBriefing:
      'Se reportó la pérdida de un envío en tránsito (~10% de datos: ignoras el vehículo, el peso del botín y cómo escapó el ladrón).',
    detectiveItem: {
      id: 'leather_briefcase',
      name: 'Maletín de Cuero',
      category: 'Objeto Sustraído',
      subtleHint: 'Contenedor oscuro con cierres metálicos vinculado al traslado.',
    },
    impostorItem: {
      id: 'steel_safe',
      name: 'Caja Fuerte de Dial',
      category: 'Resguardo Blindado',
      subtleHint: 'Contenedor metálico con mecanismo de seguridad ubicado en el vagón.',
    },
    cluesPool: [
      {
        id: 'bs1',
        title: 'Carga Ligera',
        detail: 'El ladrón escapó saltando por la ventanilla cargando el objeto con una sola mano desde el asa superior.',
      },
      {
        id: 'bs2',
        title: 'Rastro de Costura',
        detail: 'En el marco de la puerta quedó enganchado un hilo marrón de cuero curtido.',
      },
      {
        id: 'bs3',
        title: 'Broche Roto',
        detail: 'Se encontró uno de los dos pestillos dorados frontales arrancado sobre el andén.',
      },
      {
        id: 'bs4',
        title: 'Sin Dial Numérico',
        detail: 'El contenedor robado no tenía ninguna rueda combinatoria; se abría con pestillos simples.',
      },
      {
        id: 'bs5',
        title: 'Contenido en Papel',
        detail: 'Llevaba únicamente carpetas delgadas y bonos planos, sin lingotes pesados.',
      },
      {
        id: 'bs6',
        title: 'Cámara del Andén',
        detail: 'Se ve al sospechoso caminar rápido simulando ser un ejecutivo con equipaje plano.',
      },
      {
        id: 'bs7',
        title: 'Peso Estimado',
        detail: 'El bulto pesaba menos de 3 kilos; nadie podría cargar un cubo de acero corriendo así.',
      },
      {
        id: 'bs8',
        title: 'Perro Rastreador',
        detail: 'El sabueso siguió el olor característico de piel tratada hasta el taxi de la salida.',
      },
    ],
  },
  {
    id: 'badge_seal',
    caseCode: 'ROBO #008',
    title: 'El Robo con Credencial Falsa',
    caseDescription:
      'Un intruso engañó al control de acceso de un depósito policial. El informe de seguridad es solo para detectives.',
    detectiveBriefing:
      'A las 23:10, un sujeto vestido de traje engañó al guardia del depósito de evidencias fingiendo ser inspector federal: sacó rápido una pieza metálica con estrella dorada de su cartera sin entregar cartas ni documentos escritos y se llevó una caja sellada.',
    impostorBriefing:
      'Alguien entró sin permiso a un archivo restringido (~10% de datos: no sabes qué truco usó ni qué dijo en la entrada).',
    detectiveItem: {
      id: 'detective_badge',
      name: 'Placa de Detective',
      category: 'Prueba de Engaño',
      subtleHint: 'Emblema oficial utilizado durante la entrada fraudulenta.',
    },
    impostorItem: {
      id: 'wax_seal',
      name: 'Sello de Lacre Rojo',
      category: 'Acreditación de Archivo',
      subtleHint: 'Emblema oficial carmesí utilizado para validar documentos del depósito.',
    },
    cluesPool: [
      {
        id: 'bd1',
        title: 'Declaración del Guardia',
        detail: 'El sospechoso abrió su cartera y le brilló en la cara un escudo metálico dorado.',
      },
      {
        id: 'bd2',
        title: 'Detalle Grabado',
        detail: 'El testigo recuerda claramente una estrella dorada en el centro sobre un círculo azul.',
      },
      {
        id: 'bd3',
        title: 'Sin Sobres ni Cartas',
        detail: 'El ladrón no entregó ninguna orden escrita ni papel sellado en recepción.',
      },
      {
        id: 'bd4',
        title: 'Sonido en el Suelo',
        detail: 'Al caer del bolsillo sonó como metal sólido golpeando la baldosa, no cera ni papel.',
      },
      {
        id: 'bd5',
        title: 'Denuncia Interna',
        detail: 'Un agente real reportó días antes que le habían robado su insignia de solapa.',
      },
      {
        id: 'bd6',
        title: 'Sin Cera Roja',
        detail: 'No se hallaron fragmentos carmesíes ni restos derretidos en el escritorio de entrada.',
      },
      {
        id: 'bd7',
        title: 'Forma Heráldica',
        detail: 'Tenía forma de escudo puntiagudo abajo, típico de identificación policial.',
      },
      {
        id: 'bd8',
        title: 'Cámara de Acceso',
        detail: 'El impostor sujetó la pieza en la mano izquierda sin mostrar ningún documento.',
      },
    ],
  },
];

export function distributeCluesToDetectives(
  cluesPool: PrivateClue[],
  detectiveIds: string[]
): Map<string, PrivateClue[]> {
  const result = new Map<string, PrivateClue[]>();
  detectiveIds.forEach((id) => result.set(id, []));
  if (detectiveIds.length === 0) return result;

  const shuffledClues = [...cluesPool].sort(() => Math.random() - 0.5);
  shuffledClues.forEach((clue, idx) => {
    const targetDetectiveId = detectiveIds[idx % detectiveIds.length];
    result.get(targetDetectiveId)?.push(clue);
  });

  return result;
}

export const PLAYER_COLORS = [
  '#2563EB', // Azul comisaría
  '#D97706', // Ámbar evidencia
  '#059669', // Esmeralda
  '#DC2626', // Carmesí
  '#7C3AED', // Violeta
  '#0891B2', // Cian técnico
  '#DB2777', // Magenta sobrio
  '#4F46E5', // Índigo
  '#EA580C', // Naranja
  '#0D9488', // Verde azulado
];
