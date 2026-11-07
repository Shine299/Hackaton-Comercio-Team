import type { PostCategoryId, PostKind } from '@/features/posts';

export type PublishTemplate = { title: string; description: string };

export type CategoryGuide = {
  extra1: { label: string; placeholder: string };
  extra2: { label: string; placeholder: string };
  templates: Record<PostKind, PublishTemplate[]>;
  voice: string;
};

export const CATEGORY_GUIDE: Record<PostCategoryId, CategoryGuide> = {
  tools: {
    extra1: { label: 'Duración del préstamo (opcional)', placeholder: 'Unas horas, el fin de semana…' },
    extra2: { label: 'Estado (opcional)', placeholder: 'Buen estado, le falta un tornillo…' },
    templates: {
      offer: [
        {
          title: 'Presto mi escalera por unas horas',
          description: 'Escalera de aluminio. La recojo cuando termines. Coordinamos en el barrio.',
        },
        {
          title: 'Taladro disponible este fin de semana',
          description: 'Taladro con brocas básicas. Préstamo por el sábado o el domingo.',
        },
      ],
      request: [
        {
          title: 'Necesito una escalera para un rato',
          description: 'Quiero cambiar un foco. La devuelvo el mismo día.',
        },
        {
          title: 'Busco prestarme un taladro',
          description: 'Necesito colgar un estante. Puedo recogerlo y devolverlo en el día.',
        },
      ],
    },
    voice: 'Hola, presto mi escalera de aluminio por la tarde. Está en buen estado y la recojo cuando termines.',
  },
  services: {
    extra1: { label: 'Cuándo (opcional)', placeholder: 'Esta semana, sábados por la mañana…' },
    extra2: { label: 'Duración estimada (opcional)', placeholder: 'Una hora, una visita…' },
    templates: {
      offer: [
        {
          title: 'Ofrezco una mano con plomería básica',
          description: 'Puedo revisar una fuga menor o cambiar un empaque. Coordinamos horario.',
        },
        {
          title: 'Clases de reforzamiento de matemáticas',
          description: 'Apoyo para primaria. Dos tardes a la semana en un lugar público del barrio.',
        },
      ],
      request: [
        {
          title: 'Busco apoyo con un arreglo menor',
          description: 'Se trabó una puerta. Puedo pagar un monto vecinal o devolver el favor.',
        },
        {
          title: 'Necesito una clase de reforzamiento',
          description: 'Busco apoyo puntual para un examen de secundaria. Preferible cerca.',
        },
      ],
    },
    voice: 'Puedo ayudar con un arreglo menor en casa. Digo con claridad qué sé hacer y coordinamos el día.',
  },
  products: {
    extra1: { label: 'Estado (opcional)', placeholder: 'Como nuevo, usado con detalle…' },
    extra2: { label: 'Precio o condición (opcional)', placeholder: 'Gratis, S/ 20, a coordinar…' },
    templates: {
      offer: [
        {
          title: 'Regalo silla de oficina en buen estado',
          description: 'Silla giratoria. La recojes por Lince. No hago envíos.',
        },
        {
          title: 'Mesa pequeña a precio vecinal',
          description: 'Mesa de 80 cm. Preferible recogerla esta semana.',
        },
      ],
      request: [
        {
          title: 'Busco una silla para estudiar',
          description: 'Puede ser usada. La recojo yo. Puedo ofrecer un monto pequeño.',
        },
        {
          title: 'Necesito cajas para una mudanza corta',
          description: 'Unas 8 cajas medianas. Las devuelvo o las paso a otro vecino.',
        },
      ],
    },
    voice: 'Tengo un objeto en buen estado para regalar o dejar a precio vecinal. Se recoge en el barrio.',
  },
  barter: {
    extra1: { label: 'Ofrezco (opcional)', placeholder: 'Libros, plantas, herramientas…' },
    extra2: { label: 'Busco (opcional)', placeholder: 'Macetas, pintura, una mano…' },
    templates: {
      offer: [
        {
          title: 'Trueque: libros infantiles por macetas',
          description: 'Seis cuentos ilustrados. Busco macetas o plantas en buen estado.',
        },
        {
          title: 'Cambio herramientas por materiales de pintura',
          description: 'Tengo un juego de destornilladores. Busco rodillo o pintura sobrante.',
        },
      ],
      request: [
        {
          title: 'Busco trueque: ropa por utensilios',
          description: 'Tengo ropa en buen estado talla M. Busco ollas o cubiertos.',
        },
        {
          title: 'Cambio plantas por libros',
          description: 'Tengo esquejes de suculentas. Busco novelas o cuentos.',
        },
      ],
    },
    voice: 'Propongo un trueque claro: digo qué ofrezco y qué busco, sin dirección exacta.',
  },
  mobility: {
    extra1: { label: 'Cuándo (opcional)', placeholder: 'Mañana a las 9, el sábado…' },
    extra2: { label: 'Cuántas personas (opcional)', placeholder: '1 asiento, 2 personas…' },
    templates: {
      offer: [
        {
          title: 'Ofrezco un viaje al mercado el sábado',
          description: 'Salgo a las 8. Hay un asiento. Punto de encuentro en el barrio, no puerta a puerta.',
        },
        {
          title: 'Puedo acompañar en taxi al centro de salud',
          description: 'Si coincidimos de horario, vamos juntos y repartimos el pasaje.',
        },
      ],
      request: [
        {
          title: 'Busco compartir taxi al hospital',
          description: 'Cita mañana por la mañana. Prefiero ir con alguien del sector.',
        },
        {
          title: 'Necesito un asiento de ida al mercado',
          description: 'El sábado temprano. Puedo aportar para el combustible o el pasaje.',
        },
      ],
    },
    voice: 'Puedo compartir un viaje corto en el sector. Coordinamos punto de encuentro aproximado, no la casa.',
  },
  care: {
    extra1: { label: 'Cuándo (opcional)', placeholder: 'Hoy por la tarde, entre semana…' },
    extra2: { label: 'Qué se necesita (opcional)', placeholder: 'Acompañamiento, recado, compañía…' },
    templates: {
      offer: [
        {
          title: 'Puedo acompañar a un vecino al centro de salud',
          description: 'Tengo una tarde libre esta semana. No sustituyo atención médica.',
        },
        {
          title: 'Ofrezco compañía para un recado cercano',
          description: 'Puedo ir a la farmacia o al mercado con alguien del barrio.',
        },
      ],
      request: [
        {
          title: 'Necesito que recojan a mi hijo del colegio un rato',
          description: 'Es un apoyo puntual. Coordinamos en un punto visible, no en la casa.',
        },
        {
          title: 'Busco compañía para un trámite cercano',
          description: 'Me cuesta ir sola. Es un trámite corto en el distrito.',
        },
      ],
    },
    voice: 'Puedo ofrecer o pedir un apoyo puntual de cuidado. Sin datos médicos ni direcciones exactas.',
  },
  business: {
    extra1: { label: 'Horario de atención (opcional)', placeholder: 'Lun a sáb, 8 a. m. a 7 p. m.…' },
    extra2: { label: 'Cómo se entrega (opcional)', placeholder: 'Recojo en tienda, delivery en el sector…' },
    templates: {
      offer: [
        {
          title: 'Bodega del barrio: abarrotes y delivery en el sector',
          description: 'Productos de primera necesidad y entrega a vecinos del sector. Atención de lunes a sábado.',
        },
        {
          title: 'Almuerzos caseros por encargo',
          description: 'Menú del día para vecinos. Pedidos hasta las 10 a. m. y recojo en un punto del barrio.',
        },
      ],
      request: [
        {
          title: 'Busco quien me haga tortas para un cumpleaños',
          description: 'Para unas 15 personas el sábado. Prefiero un emprendimiento del barrio.',
        },
        {
          title: 'Necesito un costurero o costurera cercano',
          description: 'Arreglos de ropa sencillos. Pago el trabajo; prefiero apoyar un negocio local.',
        },
      ],
    },
    voice: 'Soy emprendedor del barrio. Cuento qué vendo, mi horario y cómo entrego, sin dar mi dirección exacta.',
  },
};

export const PRICE_CHIPS = ['Gratis', 'Préstamo', 'Trueque', 'A coordinar'] as const;

export const EXPIRY_OPTIONS = [
  { days: 1 as const, label: '1 día' },
  { days: 3 as const, label: '3 días' },
  { days: 7 as const, label: '7 días' },
  { days: 14 as const, label: '14 días' },
];
