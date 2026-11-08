import type { IconName } from '@/shared/ui';

/**
 * Políticas de servicios de Yunta (SPEC-056). BORRADOR escrito a partir de lo que la app ya hace (código, specs y ADR 0005 y
 * 0008); está pendiente de revisión legal antes de publicar la app. Si una función cambia, se actualiza el texto y su prueba.
 */
export type PolicyId = 'terminos' | 'privacidad' | 'emergencias' | 'ia-pagos';

export type PolicySection = { heading: string; body: string[] };

export type Policy = {
  id: PolicyId;
  title: string;
  /** Una línea para la tarjeta cerrada. */
  summary: string;
  icon: IconName;
  sections: PolicySection[];
};

export const POLICIES_VERSION = { label: 'Versión 1 · 8 de noviembre de 2026' } as const;

export const POLICIES: Policy[] = [
  {
    id: 'terminos',
    title: 'Términos de uso',
    summary: 'Qué es Yunta, cómo convivir y qué esperar de las publicaciones.',
    icon: 'file-document-outline',
    sections: [
      {
        heading: 'Qué es Yunta',
        body: [
          'Yunta es una app para que vecinos se coordinen: pedir y ofrecer ayuda, enterarse de lo que pasa en el barrio y encontrar negocios cercanos.',
          'Yunta conecta a las personas; no verifica a quienes publican ni lo que publican, y no es una empresa de servicios ni una autoridad.',
        ],
      },
      {
        heading: 'Tu cuenta',
        body: [
          'Puedes explorar y pedir ayuda de emergencia sin cuenta.',
          'Para publicar, escribir a un vecino o guardar cosas, se pide solo un nombre público. Tu perfil se guarda en tu teléfono.',
        ],
      },
      {
        heading: 'Convivencia',
        body: [
          'Trata a los demás con respeto. No publiques datos personales de otras personas ni direcciones exactas.',
          'En el chat puedes bloquear a alguien y reportar un mensaje. Hay un límite de mensajes por minuto para evitar abusos.',
        ],
      },
      {
        heading: 'Publicaciones y avisos',
        body: [
          'Cada publicación es responsabilidad de quien la crea. Una necesidad marcada «Urgente · sin validar» la declara esa persona: Yunta no la valida.',
          'Todo lo marcado «DATO DE DEMO» es ficticio y sirve para mostrar cómo funciona la app.',
        ],
      },
      {
        heading: 'Cambios',
        body: ['Estas políticas pueden cambiar. Siempre verás arriba la versión y la fecha vigentes.'],
      },
    ],
  },
  {
    id: 'privacidad',
    title: 'Uso de tus datos',
    summary: 'Qué se guarda en tu teléfono, qué sale y qué nunca se muestra.',
    icon: 'shield-lock-outline',
    sections: [
      {
        heading: 'Lo que se guarda en tu teléfono',
        body: [
          'Tu perfil, tus borradores, tus guardados y lo que aún no se envió se guardan en tu teléfono.',
          '«Guardado en tu teléfono» no significa «recibido»: solo decimos «recibido» cuando el servidor respondió de verdad.',
        ],
      },
      {
        heading: 'Tu ubicación',
        body: [
          'Lo que otros ven de tu ubicación es solo tu sector aproximado. Nunca mostramos tu dirección exacta ni tu GPS en publicaciones o mapas.',
          'La única excepción es el Modo guardia, que usa tu ubicación exacta una sola vez si confirmas una emergencia (ver «Emergencias y Modo guardia»).',
        ],
      },
      {
        heading: 'Lo que sale de tu teléfono',
        body: [
          'Se envían las publicaciones y los mensajes que tú decides enviar.',
          'En un aviso de emergencia, el detalle, el diagnóstico, la foto y la nota de voz nunca salen de tu teléfono.',
        ],
      },
      {
        heading: 'Eventos y tu control',
        body: [
          'En un evento, nadie ve quién va: solo cuántas personas.',
          'Puedes ocultar tu sector en tus ajustes, cambiarlo cuando quieras y quitar de tu teléfono las cámaras que registraste.',
        ],
      },
    ],
  },
  {
    id: 'emergencias',
    title: 'Emergencias y Modo guardia',
    summary: 'Yunta no reemplaza a los servicios oficiales. Cómo funciona el SOS y la guardia por voz.',
    icon: 'alarm-light-outline',
    sections: [
      {
        heading: 'Yunta no es un servicio de emergencia',
        body: [
          'Yunta no reemplaza a los servicios oficiales de emergencia. Si hay peligro para la vida, llama a los números oficiales que aparecen en Emergencia.',
          'El SOS y el reporte de emergencia funcionan sin cuenta. Los avisos que declara un vecino se marcan como «No validada»: Yunta no los confirma.',
        ],
      },
      {
        heading: 'Modo guardia (por voz)',
        body: [
          'Es opcional y empieza apagado: tú lo activas después de leer un aviso y dar tu consentimiento. Puedes apagarlo cuando quieras; mientras escucha, se ve un indicador en la cabecera.',
          'Escucha solo mientras usas la app y está a la vista, con la pantalla encendida. No escucha con el teléfono bloqueado ni con la app cerrada.',
          'Solo se envían a transcribir clips cortos donde hay sonido, a un servicio externo de voz a texto, y se descartan. La emergencia no pasa por la IA.',
          'Si confirmas una emergencia (o no respondes a tiempo), la app abre el marcador con el número que corresponde; alguien debe tocar «Llamar». Tu ubicación exacta se usa una sola vez, solo para eso, y no se guarda ni se publica. Pueden ocurrir falsos avisos: por eso hay una cuenta regresiva que puedes cancelar.',
        ],
      },
      {
        heading: 'Acompáñame',
        body: [
          'Si no marcas «Llegué bien» a tiempo, la app te pregunta y te deja avisar a tus vecinos de confianza con un toque. No comparte tu ubicación en vivo: el mensaje solo dice tu sector.',
        ],
      },
    ],
  },
  {
    id: 'ia-pagos',
    title: 'Asistente con IA y pagos',
    summary: 'La IA es externa y puede equivocarse. Yunta no guarda dinero.',
    icon: 'creation-outline',
    sections: [
      {
        heading: 'Asistente con IA',
        body: [
          'El asistente usa una IA gratuita que puede equivocarse. Tus preguntas pasan por servicios de IA externos: no compartas datos personales.',
          'Si hablas con el asistente, tu voz se envía a un servicio externo solo para pasarla a texto, y no la guardamos.',
          'Las emergencias nunca pasan por la IA: en una emergencia usa el SOS o llama a los números oficiales.',
        ],
      },
      {
        heading: 'Fondos vecinales y pagos',
        body: [
          'Yunta no guarda dinero. Tu aporte va de la pasarela de pago a la cuenta de quien organiza el fondo, y cada gasto se muestra en la rendición de cuentas.',
          'Los pagos se hacen solo con conexión y en un solo intento: sin red o sin respuesta no se cobra nada. Nunca mostramos «confirmado» sin la respuesta del proveedor.',
          'Cuando un pago es de prueba o simulado, se muestra una etiqueta que lo dice.',
        ],
      },
    ],
  },
];

export function getPolicy(id: PolicyId): Policy {
  const policy = POLICIES.find((p) => p.id === id);
  if (!policy) throw new Error(`Política desconocida: ${id}`);
  return policy;
}

export function isPolicyId(value: string | undefined): value is PolicyId {
  return POLICIES.some((p) => p.id === value);
}
