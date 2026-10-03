import type { ContentLanguage } from '#constants/domain'
import type { ServiceTranslation } from '#models/service'

/**
 * F27 : contenus essentiels des services traduits (anglais, espagnol), par slug.
 * Utilisés par le seeder des services ; un champ absent retombe sur le français.
 */
export const SERVICE_TRANSLATIONS: Record<
  string,
  Partial<Record<Exclude<ContentLanguage, 'fr'>, ServiceTranslation>>
> = {
  'etat-civil': {
    en: {
      name: 'Civil registry and citizenship',
      summary: 'Birth, marriage and death certificates, identity documents and voter registration.',
      description:
        'The Civil Registry records births, marriages, civil partnerships and deaths in Terra Nova and issues copies of certificates. It also handles identity card and passport applications and keeps the city’s electoral roll.',
      hours: 'Monday to Friday: 8 am – 4 pm\nSaturday: 8 am – 12 pm (by appointment)',
      procedures: [
        {
          title: 'Request a civil status certificate',
          detail:
            'Give the type of certificate, the date of the event and the names involved. Sent free of charge within 5 days.',
        },
        {
          title: 'Identity card or passport',
          detail:
            'Fill in a pre-application online, then book an appointment to file your application and give your fingerprints.',
        },
        {
          title: 'Register to vote',
          detail: 'Bring an identity document and proof of address less than 3 months old.',
        },
      ],
    },
    es: {
      name: 'Registro civil y ciudadanía',
      summary:
        'Actas de nacimiento, matrimonio y defunción, documentos de identidad e inscripción en el censo electoral.',
      description:
        'El Registro civil inscribe los nacimientos, matrimonios, parejas de hecho y defunciones de Terra Nova y expide copias de actas. También tramita el documento de identidad y el pasaporte, y gestiona el censo electoral de la ciudad.',
      hours: 'Lunes a viernes: 8 h – 16 h\nSábado: 8 h – 12 h (con cita previa)',
      procedures: [
        {
          title: 'Solicitar un acta del registro civil',
          detail:
            'Indique el tipo de acta, la fecha del hecho y los nombres de las personas. Envío gratuito en 5 días.',
        },
        {
          title: 'Documento de identidad o pasaporte',
          detail:
            'Haga una solicitud previa en línea y pida cita para entregar el expediente y tomar las huellas.',
        },
        {
          title: 'Inscribirse en el censo electoral',
          detail:
            'Traiga un documento de identidad y un justificante de domicilio de menos de 3 meses.',
        },
      ],
    },
  },
  'enfance-education': {
    en: {
      name: 'Children and schools',
      summary: 'School enrolment, canteen, before and after-school care and holiday clubs.',
      description:
        'The Children’s desk supports families from nursery to the last year of primary school: enrolment in the city’s state schools, school meals, morning and evening childcare, and holiday clubs.',
      hours:
        'Monday, Tuesday, Thursday: 8 am – 3:30 pm\nWednesday: 8 am – 12 pm\nFriday: 8 am – 12 pm',
      procedures: [
        {
          title: 'Enrol your child at school',
          detail:
            'Family record book, proof of address and vaccination record. Enrolment runs from March to May.',
        },
        {
          title: 'Register for the school canteen',
          detail:
            'The price depends on household income: attach your latest family allowance statement.',
        },
        {
          title: 'Book the holiday club',
          detail: 'Book at least 10 days before each school holiday.',
        },
      ],
    },
    es: {
      name: 'Infancia y escuelas',
      summary:
        'Matrícula escolar, comedor, servicio de acogida antes y después de clase y campamentos.',
      description:
        'La ventanilla de Infancia acompaña a las familias desde la educación infantil hasta el último curso de primaria: matrícula en las escuelas públicas, comedor escolar, acogida de mañana y tarde y actividades durante las vacaciones.',
      hours: 'Lunes, martes y jueves: 8 h – 15 h 30\nMiércoles: 8 h – 12 h\nViernes: 8 h – 12 h',
      procedures: [
        {
          title: 'Matricular a su hijo en la escuela',
          detail:
            'Libro de familia, justificante de domicilio y cartilla de vacunación. Matrícula de marzo a mayo.',
        },
        {
          title: 'Inscripción en el comedor',
          detail:
            'El precio depende de los ingresos familiares: adjunte su último certificado de prestaciones.',
        },
        {
          title: 'Reservar el campamento de vacaciones',
          detail: 'Reserve como mínimo 10 días antes de cada periodo de vacaciones.',
        },
      ],
    },
  },
  'ccas': {
    en: {
      name: 'Social welfare centre (CCAS)',
      summary: 'Social support, help for older people and families facing difficulties.',
      description:
        'The CCAS advises and supports residents going through a difficult time: one-off financial help, a postal address for people without one, meal delivery, and a register of vulnerable people activated during heatwaves or weather alerts.',
      hours: 'Monday to Friday: 7:30 am – 3 pm\nWalk-in desk on Tuesday mornings',
      procedures: [
        {
          title: 'Ask for one-off financial help',
          detail: 'Book an appointment with a social worker and bring proof of income.',
        },
        {
          title: 'Join the register of vulnerable people',
          detail: 'For older, isolated or disabled people: the city calls you during an alert.',
        },
        {
          title: 'Get a postal address',
          detail: 'To receive your mail if you do not have a stable address.',
        },
      ],
    },
    es: {
      name: 'Centro municipal de acción social (CCAS)',
      summary: 'Ayudas sociales y acompañamiento de personas mayores y familias en dificultad.',
      description:
        'El CCAS informa y acompaña a los vecinos que atraviesan un momento difícil: ayudas económicas puntuales, domiciliación postal, reparto de comidas y registro de personas vulnerables que se activa en caso de ola de calor o alerta meteorológica.',
      hours: 'Lunes a viernes: 7 h 30 – 15 h\nAtención sin cita el martes por la mañana',
      procedures: [
        {
          title: 'Solicitar una ayuda puntual',
          detail: 'Pida cita con un trabajador social y traiga sus justificantes de ingresos.',
        },
        {
          title: 'Inscribirse en el registro de personas vulnerables',
          detail:
            'Para personas mayores, solas o con discapacidad: la ciudad le llama en caso de alerta.',
        },
        {
          title: 'Solicitar una domiciliación postal',
          detail: 'Para recibir su correo si no tiene una dirección estable.',
        },
      ],
    },
  },
  'proprete-dechets': {
    en: {
      name: 'Street cleaning and waste',
      summary: 'Rubbish collection, bulky items, recycling centre and clean streets.',
      description:
        'The Cleaning department organises household waste and recycling collection, bulky item pick-up by appointment and upkeep of public roads. It also runs the municipal recycling centre in the Brisants area.',
      hours:
        'Front desk: Monday to Friday, 7 am – 2 pm\nRecycling centre: Tuesday to Saturday, 7 am – 5 pm',
      procedures: [
        {
          title: 'Have a bulky item collected',
          detail: 'Free collection by appointment, up to 2 m³ per household per month.',
        },
        {
          title: 'Get a recycling bin',
          detail: 'Collect it at the technical centre with proof of address.',
        },
        {
          title: 'Report fly-tipping',
          detail: 'Give the exact location and, if possible, attach a photo.',
        },
      ],
    },
    es: {
      name: 'Limpieza y residuos',
      summary: 'Recogida de basura, enseres voluminosos, punto limpio y limpieza de calles.',
      description:
        'El servicio de Limpieza organiza la recogida de basura y de reciclaje, la retirada de enseres con cita previa y el mantenimiento de la vía pública. También gestiona el punto limpio municipal de la zona de los Brisants.',
      hours: 'Atención: lunes a viernes, 7 h – 14 h\nPunto limpio: martes a sábado, 7 h – 17 h',
      procedures: [
        {
          title: 'Retirar un enser voluminoso',
          detail: 'Retirada gratuita con cita previa, hasta 2 m³ por hogar y por mes.',
        },
        {
          title: 'Obtener un contenedor de reciclaje',
          detail: 'Recójalo en el centro técnico con un justificante de domicilio.',
        },
        {
          title: 'Denunciar un vertido ilegal',
          detail: 'Indique el lugar exacto y, si puede, adjunte una foto.',
        },
      ],
    },
  },
  'urbanisme': {
    en: {
      name: 'Planning and housing',
      summary: 'Building permits, works declarations and advice for your home.',
      description:
        'The Planning department processes permits to build or alter a building, in line with Terra Nova’s local development plan. A consultant architect meets residents free of charge to help them prepare their project.',
      hours: 'Monday to Thursday: 8 am – 12 pm, afternoons by appointment',
      procedures: [
        {
          title: 'File a prior declaration of works',
          detail: 'For a fence, a garden shed or a change of façade. Answer within 1 month.',
        },
        {
          title: 'Apply for a building permit',
          detail: 'For any construction over 20 m². Processing time: 2 to 3 months.',
        },
        {
          title: 'Meet the consultant architect',
          detail: 'Free appointment on Thursday afternoons, before you file your application.',
        },
      ],
    },
    es: {
      name: 'Urbanismo y vivienda',
      summary: 'Licencias de obra, declaraciones de obras y asesoramiento para su vivienda.',
      description:
        'El servicio de Urbanismo tramita las licencias para construir o modificar un edificio, conforme al plan urbanístico de Terra Nova. Un arquitecto asesor recibe gratuitamente a los vecinos para ayudarles a preparar su proyecto.',
      hours: 'Lunes a jueves: 8 h – 12 h, tardes con cita previa',
      procedures: [
        {
          title: 'Presentar una declaración previa de obras',
          detail:
            'Para una valla, un cobertizo de jardín o un cambio de fachada. Respuesta en 1 mes.',
        },
        {
          title: 'Solicitar una licencia de obra',
          detail: 'Para cualquier construcción de más de 20 m². Plazo de tramitación: 2 a 3 meses.',
        },
        {
          title: 'Reunirse con el arquitecto asesor',
          detail: 'Cita gratuita el jueves por la tarde, antes de presentar su expediente.',
        },
      ],
    },
  },
  'mediatheque': {
    en: {
      name: 'Étoile du Sud media library',
      summary: 'Book and game lending, digital space and workshops for all ages.',
      description:
        'The Étoile du Sud media library lends books, comics, films and board games. Its digital space offers free computer access and help with online procedures. Reading, storytelling and digital skills workshops every week.',
      hours:
        'Tuesday, Thursday, Friday: 9 am – 5 pm\nWednesday and Saturday: 9 am – 6 pm\nClosed on Mondays',
      procedures: [
        {
          title: 'Join the media library',
          detail: 'Free for residents: identity document and proof of address.',
        },
        {
          title: 'Book a computer',
          detail: 'One-hour slots, with a digital mediator if you need help.',
        },
      ],
    },
    es: {
      name: 'Mediateca Étoile du Sud',
      summary: 'Préstamo de libros y juegos, espacio digital y talleres para todas las edades.',
      description:
        'La mediateca Étoile du Sud presta libros, cómics, películas y juegos de mesa. Su espacio digital ofrece acceso gratuito a ordenadores y ayuda con los trámites en línea. Talleres de lectura, cuentacuentos e iniciación digital cada semana.',
      hours:
        'Martes, jueves y viernes: 9 h – 17 h\nMiércoles y sábado: 9 h – 18 h\nCerrada los lunes',
      procedures: [
        {
          title: 'Inscribirse en la mediateca',
          detail: 'Gratis para los vecinos: documento de identidad y justificante de domicilio.',
        },
        {
          title: 'Reservar un ordenador',
          detail: 'Turnos de una hora, con un mediador digital si lo necesita.',
        },
      ],
    },
  },
  'sports': {
    en: {
      name: 'Sports and facilities',
      summary: 'Swimming pool, sports halls, pitches and registration for city sports activities.',
      description:
        'The Sports department runs the municipal swimming pool, sports halls and neighbourhood pitches. It lends facilities to associations and runs the city sports school for children aged 6 to 12.',
      hours: 'Monday to Friday: 8 am – 4 pm\nSwimming pool: every day, 6:30 am – 7 pm',
      procedures: [
        {
          title: 'Enrol your child at the sports school',
          detail: 'Medical certificate less than 3 years old and proof of insurance.',
        },
        {
          title: 'Book a facility (associations)',
          detail: 'Apply at least 15 days before the requested date.',
        },
      ],
    },
    es: {
      name: 'Deportes e instalaciones',
      summary:
        'Piscina, polideportivos, pistas e inscripción en las actividades deportivas municipales.',
      description:
        'El servicio de Deportes gestiona la piscina municipal, los polideportivos y las pistas de barrio. Cede las instalaciones a las asociaciones y organiza la escuela municipal de deportes para niños de 6 a 12 años.',
      hours: 'Lunes a viernes: 8 h – 16 h\nPiscina: todos los días, 6 h 30 – 19 h',
      procedures: [
        {
          title: 'Inscribir a su hijo en la escuela de deportes',
          detail: 'Certificado médico de menos de 3 años y justificante de seguro.',
        },
        {
          title: 'Reservar una instalación (asociaciones)',
          detail: 'Solicítelo al menos 15 días antes de la fecha deseada.',
        },
      ],
    },
  },
  'police-municipale': {
    en: {
      name: 'Municipal police and public order',
      summary: 'Local safety, lost property, parking and holiday home watch.',
      description:
        'The municipal police keep neighbourhoods peaceful, enforce parking rules and keep school surroundings safe. They also handle lost property. In an emergency, call 17.',
      hours: 'Front desk: Monday to Saturday, 7 am – 7 pm\nPatrols 7 days a week',
      procedures: [
        {
          title: 'Holiday home watch',
          detail:
            'Register your home at least 48 hours before you leave: patrols check it while you are away.',
        },
        {
          title: 'Collect lost property',
          detail: 'Describe the item and show an identity document. Items are kept for 1 year.',
        },
      ],
    },
    es: {
      name: 'Policía municipal y convivencia',
      summary:
        'Seguridad de proximidad, objetos perdidos, estacionamiento y vigilancia en vacaciones.',
      description:
        'La policía municipal vela por la tranquilidad de los barrios, el respeto del estacionamiento y la seguridad en el entorno de las escuelas. También gestiona los objetos perdidos. En caso de urgencia, llame al 17.',
      hours: 'Atención: lunes a sábado, 7 h – 19 h\nPatrullas los 7 días de la semana',
      procedures: [
        {
          title: 'Vigilancia de vivienda en vacaciones',
          detail:
            'Inscriba su vivienda al menos 48 h antes de salir: las patrullas pasan durante su ausencia.',
        },
        {
          title: 'Recuperar un objeto perdido',
          detail: 'Describa el objeto y presente un documento de identidad. Se conservan 1 año.',
        },
      ],
    },
  },
}
