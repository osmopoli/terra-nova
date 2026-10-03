/* Terra Nova — page Services (D05, F27, F28, F32, F38).
   Chargé en fin de <body> (avant ui.js defer) : ajoute ses traductions puis enregistre le code de page. */
(function () {
  'use strict';
  const NT = window.NT;

  /* ---------- Traductions de l'interface de la page ---------- */
  NT.i18n.ajouter({
    fr: {
      'sv.titre': 'Les services de la ville', 'sv.intro': 'Trouvez le bon service, ses horaires, son contact et les démarches possibles. Les services indisponibles sont signalés avant que vous commenciez.',
      'sv.rechercheLabel': 'Rechercher un service', 'sv.recherchePh': 'Santé, logement, acte de naissance…', 'sv.effacer': 'Effacer', 'sv.filtrer': 'Filtrer par thème :', 'sv.tous': 'Tous les thèmes',
      'sv.nb0': 'Aucun service ne correspond à votre recherche.', 'sv.nb1': '1 service trouvé.', 'sv.nbN': '{n} services trouvés.',
      'sv.prioTitre': 'Les services les plus utilisés', 'sv.prioIntro': 'Mis en avant par la mairie, puis classés par fréquentation.', 'sv.autresTitre': 'Tous les autres services', 'sv.resultatsTitre': 'Résultats',
      'sv.voir': 'Voir le détail', 'sv.voirDe': 'Voir le détail du service {nom}', 'sv.demande': 'Faire une demande', 'sv.rdv': 'Prendre rendez-vous', 'sv.contacter': 'Écrire au service',
      'sv.etat.ok': 'Disponible', 'sv.etat.maintenance': 'En maintenance', 'sv.etat.incident': 'Incident en cours',
      'sv.indispo': 'Ce service est indisponible', 'sv.indispoMaint': 'Service en maintenance', 'sv.quoi': 'Ce qui est indisponible', 'sv.retour': 'Quand revenir', 'sv.alternative': 'Quoi faire en attendant',
      'sv.retourInconnu': 'Date de retour non communiquée. Cette page se met à jour dès que le service rouvre.',
      'sv.horaires': 'Horaires', 'sv.lieu': 'Lieu', 'sv.contact': 'Contact', 'sv.demarches': 'Démarches courantes', 'sv.pieces': 'À prévoir :', 'sv.aucuneDemarche': 'Écrivez au service pour connaître les démarches possibles.',
      'sv.lienGenerique': 'Accéder au service en ligne', 'sv.lienTransports': 'Voir les horaires des navettes', 'sv.lienSignalement': 'Faire un signalement', 'sv.fermer': 'Fermer', 'sv.cat': 'Thème',
      'sv.altGenerique': 'Écrivez-nous ou contactez le service à l’adresse ci-dessous : une réponse vous sera donnée dès que possible.',
      'sv.vuesLabel': '{n} consultations', 'sv.carte': 'Voir sur la carte',
      'cat.demarches': 'Démarches', 'cat.sante': 'Santé', 'cat.vie-quotidienne': 'Vie quotidienne', 'cat.mobilite': 'Mobilité', 'cat.famille': 'Famille', 'cat.environnement': 'Environnement', 'cat.solidarite': 'Solidarité', 'cat.loisirs': 'Loisirs'
    },
    en: {
      'sv.titre': 'City services', 'sv.intro': 'Find the right service, its opening hours, contact and available procedures. Unavailable services are flagged before you start.',
      'sv.rechercheLabel': 'Search for a service', 'sv.recherchePh': 'Health, housing, birth certificate…', 'sv.effacer': 'Clear', 'sv.filtrer': 'Filter by theme:', 'sv.tous': 'All themes',
      'sv.nb0': 'No service matches your search.', 'sv.nb1': '1 service found.', 'sv.nbN': '{n} services found.',
      'sv.prioTitre': 'Most used services', 'sv.prioIntro': 'Highlighted by the city hall, then sorted by popularity.', 'sv.autresTitre': 'All other services', 'sv.resultatsTitre': 'Results',
      'sv.voir': 'See details', 'sv.voirDe': 'See details of the {nom} service', 'sv.demande': 'Make a request', 'sv.rdv': 'Book an appointment', 'sv.contacter': 'Write to the service',
      'sv.etat.ok': 'Available', 'sv.etat.maintenance': 'Under maintenance', 'sv.etat.incident': 'Incident in progress',
      'sv.indispo': 'This service is unavailable', 'sv.indispoMaint': 'Service under maintenance', 'sv.quoi': 'What is unavailable', 'sv.retour': 'When to come back', 'sv.alternative': 'What to do meanwhile',
      'sv.retourInconnu': 'No return date announced. This page updates as soon as the service reopens.',
      'sv.horaires': 'Opening hours', 'sv.lieu': 'Place', 'sv.contact': 'Contact', 'sv.demarches': 'Common procedures', 'sv.pieces': 'Bring:', 'sv.aucuneDemarche': 'Write to the service to learn about available procedures.',
      'sv.lienGenerique': 'Go to the online service', 'sv.lienTransports': 'See shuttle timetables', 'sv.lienSignalement': 'Report a problem', 'sv.fermer': 'Close', 'sv.cat': 'Theme',
      'sv.altGenerique': 'Write to us or contact the service at the address below: you will get an answer as soon as possible.',
      'sv.vuesLabel': '{n} views', 'sv.carte': 'See on the map',
      'cat.demarches': 'Procedures', 'cat.sante': 'Health', 'cat.vie-quotidienne': 'Daily life', 'cat.mobilite': 'Mobility', 'cat.famille': 'Family', 'cat.environnement': 'Environment', 'cat.solidarite': 'Solidarity', 'cat.loisirs': 'Leisure'
    },
    es: {
      'sv.titre': 'Servicios de la ciudad', 'sv.intro': 'Encuentre el servicio adecuado, sus horarios, su contacto y los trámites posibles. Los servicios no disponibles se indican antes de empezar.',
      'sv.rechercheLabel': 'Buscar un servicio', 'sv.recherchePh': 'Salud, vivienda, acta de nacimiento…', 'sv.effacer': 'Borrar', 'sv.filtrer': 'Filtrar por tema:', 'sv.tous': 'Todos los temas',
      'sv.nb0': 'Ningún servicio coincide con su búsqueda.', 'sv.nb1': '1 servicio encontrado.', 'sv.nbN': '{n} servicios encontrados.',
      'sv.prioTitre': 'Los servicios más usados', 'sv.prioIntro': 'Destacados por el ayuntamiento y ordenados por uso.', 'sv.autresTitre': 'Todos los demás servicios', 'sv.resultatsTitre': 'Resultados',
      'sv.voir': 'Ver el detalle', 'sv.voirDe': 'Ver el detalle del servicio {nom}', 'sv.demande': 'Hacer una solicitud', 'sv.rdv': 'Pedir cita', 'sv.contacter': 'Escribir al servicio',
      'sv.etat.ok': 'Disponible', 'sv.etat.maintenance': 'En mantenimiento', 'sv.etat.incident': 'Incidencia en curso',
      'sv.indispo': 'Este servicio no está disponible', 'sv.indispoMaint': 'Servicio en mantenimiento', 'sv.quoi': 'Qué no está disponible', 'sv.retour': 'Cuándo volver', 'sv.alternative': 'Qué hacer mientras tanto',
      'sv.retourInconnu': 'Fecha de reapertura no comunicada. Esta página se actualiza en cuanto el servicio reabra.',
      'sv.horaires': 'Horarios', 'sv.lieu': 'Lugar', 'sv.contact': 'Contacto', 'sv.demarches': 'Trámites habituales', 'sv.pieces': 'Lleve:', 'sv.aucuneDemarche': 'Escriba al servicio para conocer los trámites posibles.',
      'sv.lienGenerique': 'Acceder al servicio en línea', 'sv.lienTransports': 'Ver los horarios de las lanzaderas', 'sv.lienSignalement': 'Señalar un problema', 'sv.fermer': 'Cerrar', 'sv.cat': 'Tema',
      'sv.altGenerique': 'Escríbanos o contacte con el servicio en la dirección indicada: le responderemos lo antes posible.',
      'sv.vuesLabel': '{n} consultas', 'sv.carte': 'Ver en el mapa',
      'cat.demarches': 'Trámites', 'cat.sante': 'Salud', 'cat.vie-quotidienne': 'Vida cotidiana', 'cat.mobilite': 'Movilidad', 'cat.famille': 'Familia', 'cat.environnement': 'Medio ambiente', 'cat.solidarite': 'Solidaridad', 'cat.loisirs': 'Ocio'
    },
    ar: {
      'sv.titre': 'خدمات المدينة', 'sv.intro': 'اعثر على الخدمة المناسبة ومواعيدها وطرق الاتصال بها والإجراءات الممكنة. تظهر الخدمات غير المتاحة قبل أن تبدأ.',
      'sv.rechercheLabel': 'البحث عن خدمة', 'sv.recherchePh': 'الصحة، السكن، شهادة الميلاد…', 'sv.effacer': 'مسح', 'sv.filtrer': 'تصفية حسب الموضوع:', 'sv.tous': 'كل المواضيع',
      'sv.nb0': 'لا توجد خدمة مطابقة لبحثك.', 'sv.nb1': 'تم العثور على خدمة واحدة.', 'sv.nbN': 'تم العثور على {n} خدمات.',
      'sv.prioTitre': 'الخدمات الأكثر استعمالاً', 'sv.prioIntro': 'أبرزتها البلدية ثم رتبت حسب الاستعمال.', 'sv.autresTitre': 'بقية الخدمات', 'sv.resultatsTitre': 'النتائج',
      'sv.voir': 'عرض التفاصيل', 'sv.voirDe': 'عرض تفاصيل خدمة {nom}', 'sv.demande': 'تقديم طلب', 'sv.rdv': 'حجز موعد', 'sv.contacter': 'مراسلة الخدمة',
      'sv.etat.ok': 'متاحة', 'sv.etat.maintenance': 'قيد الصيانة', 'sv.etat.incident': 'عطل جارٍ',
      'sv.indispo': 'هذه الخدمة غير متاحة', 'sv.indispoMaint': 'الخدمة قيد الصيانة', 'sv.quoi': 'ما هو غير متاح', 'sv.retour': 'متى تعود', 'sv.alternative': 'ماذا تفعل في الأثناء',
      'sv.retourInconnu': 'لم يُعلن تاريخ العودة. تتحدث هذه الصفحة فور إعادة فتح الخدمة.',
      'sv.horaires': 'المواعيد', 'sv.lieu': 'المكان', 'sv.contact': 'الاتصال', 'sv.demarches': 'الإجراءات الشائعة', 'sv.pieces': 'أحضر:', 'sv.aucuneDemarche': 'راسل الخدمة لمعرفة الإجراءات الممكنة.',
      'sv.lienGenerique': 'الدخول إلى الخدمة عبر الإنترنت', 'sv.lienTransports': 'عرض مواعيد الحافلات', 'sv.lienSignalement': 'الإبلاغ عن مشكلة', 'sv.fermer': 'إغلاق', 'sv.cat': 'الموضوع',
      'sv.altGenerique': 'راسلنا أو اتصل بالخدمة على العنوان أدناه وسنجيبك في أقرب وقت.',
      'sv.vuesLabel': '{n} مشاهدة', 'sv.carte': 'عرض على الخريطة',
      'cat.demarches': 'الإجراءات', 'cat.sante': 'الصحة', 'cat.vie-quotidienne': 'الحياة اليومية', 'cat.mobilite': 'التنقل', 'cat.famille': 'الأسرة', 'cat.environnement': 'البيئة', 'cat.solidarite': 'التضامن', 'cat.loisirs': 'الترفيه'
    }
  });

  /* F63 : raccourci administrateur depuis la fiche d'un service */
  NT.i18n.ajouter({
    fr: { 'sv.adminDes': 'Désactiver ce service (administrateur)', 'sv.adminRea': 'Réactiver ce service (administrateur)' },
    en: { 'sv.adminDes': 'Disable this service (administrator)', 'sv.adminRea': 'Re-enable this service (administrator)' },
    es: { 'sv.adminDes': 'Desactivar este servicio (administrador)', 'sv.adminRea': 'Reactivar este servicio (administrador)' },
    ar: { 'sv.adminDes': 'تعطيل هذه الخدمة (المسؤول)', 'sv.adminRea': 'إعادة تفعيل هذه الخدمة (المسؤول)' }
  });

  /* ---------- F27 : contenus des démarches courantes en 4 langues ---------- */
  // Chaque démarche : [titre, pièces à prévoir]
  const DEM = {
    'etat-civil': {
      fr: [['Acte de naissance ou de mariage', 'Pièce d’identité, livret de famille'], ['Changement d’adresse', 'Justificatif du nouveau module'], ['Carte d’identité', 'Photo, ancien titre, justificatif d’adresse']],
      en: [['Birth or marriage certificate', 'ID, family record book'], ['Change of address', 'Proof of your new module'], ['ID card', 'Photo, previous card, proof of address']],
      es: [['Acta de nacimiento o matrimonio', 'Documento de identidad, libro de familia'], ['Cambio de domicilio', 'Justificante del nuevo módulo'], ['Documento de identidad', 'Foto, documento anterior, justificante de domicilio']],
      ar: [['شهادة ميلاد أو زواج', 'وثيقة الهوية، دفتر العائلة'], ['تغيير العنوان', 'إثبات السكن في الوحدة الجديدة'], ['بطاقة الهوية', 'صورة، البطاقة القديمة، إثبات العنوان']]
    },
    'sante': {
      fr: [['Vaccination', 'Carnet de santé, pièce d’identité'], ['Consultation au dispensaire', 'Pièce d’identité, carte de santé'], ['Urgence médicale', 'Appelez le 15 ou rendez-vous au dispensaire central, ouvert 24 h/24']],
      en: [['Vaccination', 'Health record, ID'], ['Clinic consultation', 'ID, health card'], ['Medical emergency', 'Call 15 or go to the central clinic, open 24/7']],
      es: [['Vacunación', 'Cartilla de salud, documento de identidad'], ['Consulta en el dispensario', 'Documento de identidad, tarjeta de salud'], ['Urgencia médica', 'Llame al 15 o acuda al dispensario central, abierto 24 h']],
      ar: [['التطعيم', 'دفتر الصحة، وثيقة الهوية'], ['استشارة في المستوصف', 'وثيقة الهوية، بطاقة الصحة'], ['طوارئ طبية', 'اتصل بالرقم 15 أو توجه إلى المستوصف المركزي المفتوح على مدار الساعة']]
    },
    'logement': {
      fr: [['Demande de module d’habitation', 'Justificatifs de revenus, composition du foyer'], ['Aide au logement', 'Avis de revenus, attribution ou bail'], ['Demande de travaux', 'Description du problème, photos']],
      en: [['Housing module application', 'Proof of income, household composition'], ['Housing aid', 'Income statement, allocation or lease'], ['Repair request', 'Description of the problem, photos']],
      es: [['Solicitud de módulo de vivienda', 'Justificantes de ingresos, composición del hogar'], ['Ayuda a la vivienda', 'Declaración de ingresos, asignación o contrato'], ['Solicitud de obras', 'Descripción del problema, fotos']],
      ar: [['طلب وحدة سكنية', 'إثبات الدخل، تركيبة الأسرة'], ['مساعدة السكن', 'كشف الدخل، قرار التخصيص أو عقد الإيجار'], ['طلب أشغال', 'وصف المشكلة، صور']]
    },
    'transports': {
      fr: [['Abonnement mensuel', 'Pièce d’identité, photo'], ['Tarif réduit', 'Justificatif de situation'], ['Objet perdu dans une navette', 'Description, ligne et heure du trajet']],
      en: [['Monthly pass', 'ID, photo'], ['Reduced fare', 'Proof of eligibility'], ['Item lost on a shuttle', 'Description, line and time of the trip']],
      es: [['Abono mensual', 'Documento de identidad, foto'], ['Tarifa reducida', 'Justificante de situación'], ['Objeto perdido en una lanzadera', 'Descripción, línea y hora del trayecto']],
      ar: [['اشتراك شهري', 'وثيقة الهوية، صورة'], ['تعرفة مخفضة', 'إثبات الوضعية'], ['شيء مفقود في حافلة', 'وصف، الخط ووقت الرحلة']]
    },
    'voirie': {
      fr: [['Signaler un éclairage en panne', 'Adresse précise, numéro du lampadaire'], ['Signaler un trou ou un équipement abîmé', 'Lieu exact, photo si possible'], ['Danger immédiat sur la voie', 'Appelez le 112, puis signalez le lieu']],
      en: [['Report a broken streetlight', 'Exact address, lamp number'], ['Report a pothole or damaged equipment', 'Exact place, photo if possible'], ['Immediate danger on the road', 'Call 112, then report the location']],
      es: [['Señalar una farola averiada', 'Dirección exacta, número de la farola'], ['Señalar un bache o un equipo dañado', 'Lugar exacto, foto si es posible'], ['Peligro inmediato en la vía', 'Llame al 112 y después indique el lugar']],
      ar: [['الإبلاغ عن عطل في الإنارة', 'العنوان الدقيق، رقم عمود الإنارة'], ['الإبلاغ عن حفرة أو معدات تالفة', 'المكان الدقيق، صورة إن أمكن'], ['خطر فوري على الطريق', 'اتصل بالرقم 112 ثم أبلغ عن المكان']]
    },
    'education': {
      fr: [['Inscription scolaire', 'Livret de famille, justificatif de domicile'], ['Inscription à la cantine', 'Attestation de ressources']],
      en: [['School enrolment', 'Family record book, proof of residence'], ['Canteen registration', 'Income certificate']]
    },
    'social': {
      fr: [['Aide d’urgence', 'Justificatifs de ressources, pièce d’identité'], ['Accompagnement personnalisé', 'Prenez rendez-vous avec un travailleur social']],
      en: [['Emergency aid', 'Proof of resources, ID'], ['Personal support', 'Book an appointment with a social worker']]
    },
    'emploi': {
      fr: [['Inscription à la Maison de l’emploi', 'CV, pièce d’identité'], ['Demande de formation', 'Projet professionnel, dernier diplôme']],
      en: [['Register at the Jobs centre', 'CV, ID'], ['Training request', 'Career plan, latest diploma']]
    },
    'eau-energie': {
      fr: [['Raccordement d’un module', 'Attribution du module, pièce d’identité'], ['Contester une facture', 'Facture concernée, relevé de compteur']],
      en: [['Module connection', 'Module allocation, ID'], ['Dispute a bill', 'The bill, meter reading']]
    }
  };

  /* F38 : que faire à la place, par service (repli générique sinon) */
  const ALT = {
    'urbanisme': {
      fr: 'Déposez votre dossier papier à l’accueil de l’hôtel de ville (niveau 2, mardi et jeudi de 9h à 12h) ou prenez rendez-vous avec un agent.',
      en: 'Hand in your paper file at the city hall reception (level 2, Tuesday and Thursday 9am–12pm) or book an appointment with a staff member.',
      es: 'Entregue su expediente en papel en la recepción del ayuntamiento (nivel 2, martes y jueves de 9 a 12 h) o pida cita con un agente.',
      ar: 'سلّم ملفك الورقي في استقبال دار البلدية (الطابق 2، الثلاثاء والخميس من 9 إلى 12) أو احجز موعداً مع عون.'
    },
    'culture': {
      fr: 'L’observatoire et les salles de sport restent ouverts. Pour toute question sur la médiathèque, écrivez-nous : une réponse vous sera donnée sous deux jours.',
      en: 'The observatory and sports halls remain open. For any question about the library, write to us: you will get an answer within two days.',
      es: 'El observatorio y los gimnasios siguen abiertos. Para cualquier duda sobre la mediateca, escríbanos: responderemos en dos días.',
      ar: 'يبقى المرصد والقاعات الرياضية مفتوحة. لأي سؤال عن المكتبة راسلنا وسنجيبك في غضون يومين.'
    }
  };

  /* Lieu principal de chaque service sur la carte (carte.html?lieu=…) */
  const LIEU_CARTE = { 'etat-civil': 'hotel-ville', 'sante': 'dispensaire-central', 'logement': 'pole-habitat', 'transports': 'gare-orbitale', 'voirie': 'centre-technique', 'education': 'maison-enfance', 'dechets': 'centre-tri', 'emploi': 'maison-emploi', 'social': 'centre-social', 'culture': 'mediatheque', 'urbanisme': 'hotel-ville' };

  /* ---------- Outils ---------- */
  const { echap } = NT.ui;
  const t = NT.t;
  const norm = s => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  const slug = s => norm(s).replace(/[^a-z0-9]+/g, '-');
  const lang = () => NT.i18n.langue;
  const catCle = c => 'cat.' + slug(c);
  const catLibelle = c => t(catCle(c), null, c);
  const choisir = NT.i18n.choisir;
  const etatCode = s => (s.etat && s.etat.code) || 'ok';
  const degrade = s => etatCode(s) !== 'ok';
  const demarchesDe = s => { const d = DEM[s.id]; return d ? (d[lang()] || d.fr) : []; };
  const alternativeDe = s => { const a = ALT[s.id]; return a ? (a[lang()] || a.fr) : t('sv.altGenerique'); };
  const iconeEtat = { ok: 'ph-check-circle', maintenance: 'ph-wrench', incident: 'ph-warning-octagon' };
  // F63 : trois niveaux compris par tous (Disponible, Perturbé, Indisponible), texte + icône + couleur
  const badge = s => NT.ui.niveauBadge(s);

  /* Texte de recherche : langue courante ET français, catégorie, démarches ; sans accents ni casse */
  function texteRecherche(s) {
    const langues = Array.from(new Set([lang(), 'fr']));
    const parts = [];
    langues.forEach(l => {
      parts.push(s.nom[l] || '', s.description[l] || '');
      const d = DEM[s.id]; if (d && d[l]) d[l].forEach(x => parts.push(x[0], x[1]));
    });
    parts.push(s.categorie || '', catLibelle(s.categorie || ''), s.id.replace(/-/g, ' '));
    return norm(parts.join(' | '));
  }

  /* ---------- Rendu ---------- */
  const racine = document.getElementById('sv-resultats');
  const champ = document.getElementById('sv-q');
  const effacer = document.getElementById('sv-effacer');
  const compteur = document.getElementById('sv-compteur');
  const boutons = document.getElementById('sv-boutons');
  let categorie = '';            // '' = tous

  function actionPrincipale(s) {
    if (degrade(s)) return '';
    if (s.lien) {
      const lib = s.lien.indexOf('transports') === 0 ? 'sv.lienTransports' : s.lien.indexOf('signalement') >= 0 ? 'sv.lienSignalement' : 'sv.lienGenerique';
      return `<a class="btn btn-primaire" href="${echap(s.lien)}">${echap(t(lib))}</a>`;
    }
    return `<a class="btn btn-primaire" href="demande.html?type=demarche&amp;service=${encodeURIComponent(s.id)}">${echap(t('sv.demande'))}</a>`;
  }

  // F38 : bloc d'indisponibilité (icône + texte, jamais la couleur seule)
  function encart(s, complet) {
    if (etatCode(s) === 'desactive') return NT.ui.encartService(s);   // F63 : désactivé par l'administrateur
    if (!degrade(s)) return '';
    const code = etatCode(s), e = s.etat;
    const titre = code === 'maintenance' ? t('sv.indispoMaint') : t('sv.indispo');
    return `<div class="sv-encart sv-encart-${echap(code)}" role="group" aria-label="${echap(titre)}">
      <p class="sv-encart-titre"><i class="ph-duotone ${iconeEtat[code] || 'ph-warning'}" aria-hidden="true"></i><strong>${echap(titre)}</strong></p>
      <dl>
        <div><dt>${echap(t('sv.quoi'))}</dt><dd>${echap(e.message || t('sv.etat.' + code))}</dd></div>
        <div><dt>${echap(t('sv.retour'))}</dt><dd>${echap(e.retour || t('sv.retourInconnu'))}</dd></div>
        ${complet ? `<div><dt>${echap(t('sv.alternative'))}</dt><dd>${echap(alternativeDe(s))}</dd></div>` : ''}
      </dl>
    </div>`;
  }

  // L'alternative remplace le bouton de démarche quand le service est dégradé
  function actionsAlternatives(s) {
    if (!degrade(s)) return '';
    if (etatCode(s) === 'desactive') return NT.ui.actionsService(s);   // F63 : la démarche est remplacée par l'alternative
    const rdv = s.rdv ? `<a class="btn btn-primaire" href="rendez-vous.html?service=${encodeURIComponent(s.id)}"><i class="ph ph-calendar-check" aria-hidden="true"></i>${echap(t('sv.rdv'))}</a>` : '';
    const contact = `<a class="btn${rdv ? '' : ' btn-primaire'}" href="demande.html?type=contact&amp;service=${encodeURIComponent(s.id)}"><i class="ph ph-envelope-simple" aria-hidden="true"></i>${echap(t('sv.contacter'))}</a>`;
    return rdv + contact;
  }

  function carte(s) {
    const nom = choisir(s.nom);
    return `<li class="sv-carte sv-etat-${echap(etatCode(s))}" id="svc-${echap(s.id)}">
      <div class="sv-tete">
        <span class="icone-ronde" aria-hidden="true"><i class="ph-duotone ${echap(s.icone)}"></i></span>
        <div class="sv-titre">
          <h3>${echap(nom)}</h3>
          <p class="sv-meta"><span class="sv-cat">${echap(catLibelle(s.categorie))}</span>${badge(s)}</p>
        </div>
      </div>
      <p class="sv-desc">${echap(choisir(s.description))}</p>
      ${encart(s, false)}
      <div class="ligne sv-actions">
        <button type="button" class="btn" data-detail="${echap(s.id)}" aria-label="${echap(t('sv.voirDe', { nom }))}">${echap(t('sv.voir'))}</button>
        ${degrade(s) ? actionsAlternatives(s) : actionPrincipale(s)}
      </div>
    </li>`;
  }

  function bloc(titre, intro, liste, classe, id) {
    if (!liste.length) return '';
    return `<section class="section sv-section ${classe}" aria-labelledby="${id}">
      <div class="titre-section"><div><h2 id="${id}">${echap(titre)}</h2>${intro ? `<p>${echap(intro)}</p>` : ''}</div></div>
      <ul class="sv-liste">${liste.map(carte).join('')}</ul>
    </section>`;
  }

  function rendreBoutons() {
    const cats = Array.from(new Set(NT.services.tous().map(s => s.categorie).filter(Boolean)));
    const b = (val, lib) => `<button type="button" class="sv-filtre" data-cat="${echap(val)}" aria-pressed="${categorie === val ? 'true' : 'false'}">${echap(lib)}</button>`;
    boutons.innerHTML = b('', t('sv.tous')) + cats.map(c => b(c, catLibelle(c))).join('');
  }

  function filtrer() {
    const mots = norm(champ.value).split(/\s+/).filter(Boolean);
    return NT.services.tous().filter(s => (!categorie || s.categorie === categorie) && (!mots.length || (() => { const txt = texteRecherche(s); return mots.every(m => txt.includes(m)); })()));
  }

  function rendre() {
    const liste = filtrer().sort((a, b) => ((b.prioritaire ? 1 : 0) - (a.prioritaire ? 1 : 0)) || ((b.vues || 0) - (a.vues || 0)));
    const prio = liste.filter(s => s.prioritaire), autres = liste.filter(s => !s.prioritaire);
    // F28 : prioritaires d'abord. Sans filtre, deux sections ; sinon le même ordre, titre « Résultats ».
    const recherche = !!(norm(champ.value) || categorie);
    racine.innerHTML = liste.length
      ? (recherche && !prio.length ? bloc(t('sv.resultatsTitre'), '', autres, 'sv-autres', 'sv-h-res') : bloc(t('sv.prioTitre'), t('sv.prioIntro'), prio, 'sv-prio', 'sv-h-prio') + bloc(t('sv.autresTitre'), '', autres, 'sv-autres', 'sv-h-autres'))
      : `<p class="vide"><i class="ph-duotone ph-magnifying-glass" aria-hidden="true"></i><br>${echap(t('sv.nb0'))}</p>`;
    effacer.hidden = !champ.value;
    const msg = liste.length === 0 ? t('sv.nb0') : liste.length === 1 ? t('sv.nb1') : t('sv.nbN', { n: liste.length });
    compteur.textContent = msg;
  }

  /* ---------- Détail d'un service (D05) ---------- */
  const tiroir = document.getElementById('sv-detail');

  function detailHtml(s) {
    const mail = s.contact && s.contact.includes('@');
    const dem = demarchesDe(s);
    const lienDedie = s.lien && !degrade(s)
      ? `<a class="btn" href="${echap(s.lien)}"><i class="ph ph-arrow-square-out" aria-hidden="true"></i>${echap(t(s.lien.indexOf('transports') === 0 ? 'sv.lienTransports' : s.lien.indexOf('signalement') >= 0 ? 'sv.lienSignalement' : 'sv.lienGenerique'))}</a>` : '';
    const demande = !degrade(s)
      ? `<a class="btn btn-primaire" href="demande.html?type=demarche&amp;service=${encodeURIComponent(s.id)}"><i class="ph ph-file-text" aria-hidden="true"></i>${echap(t('sv.demande'))}</a>`
      : '';
    const rdv = !degrade(s) && s.rdv ? `<a class="btn" href="rendez-vous.html?service=${encodeURIComponent(s.id)}"><i class="ph ph-calendar-check" aria-hidden="true"></i>${echap(t('sv.rdv'))}</a>` : '';
    return `
      <div class="sv-detail-tete">
        <span class="icone-ronde" aria-hidden="true"><i class="ph-duotone ${echap(s.icone)}"></i></span>
        <div><p class="sv-meta"><span class="sv-cat">${echap(catLibelle(s.categorie))}</span>${badge(s)}</p>
          <p class="sv-desc">${echap(choisir(s.description))}</p></div>
      </div>
      ${degrade(s) ? encart(s, true) : NT.ui.encartService(s, { siDisponible: true })}
      <dl class="sv-infos">
        ${s.horaires ? `<div><dt><i class="ph ph-clock" aria-hidden="true"></i>${echap(t('sv.horaires'))}</dt><dd>${echap(s.horaires)}</dd></div>` : ''}
        ${s.lieu ? `<div><dt><i class="ph ph-map-pin" aria-hidden="true"></i>${echap(t('sv.lieu'))}</dt><dd>${echap(s.lieu)}</dd></div>` : ''}
        ${s.contact ? `<div><dt><i class="ph ph-envelope-simple" aria-hidden="true"></i>${echap(t('sv.contact'))}</dt><dd>${mail ? `<a href="mailto:${echap(s.contact)}">${echap(s.contact)}</a>` : echap(s.contact)}</dd></div>` : ''}
      </dl>
      <h3 class="sv-h3">${echap(t('sv.demarches'))}</h3>
      ${dem.length ? `<ul class="sv-demarches">${dem.map(d => `<li><strong>${echap(d[0])}</strong><span>${echap(t('sv.pieces'))} ${echap(d[1])}</span></li>`).join('')}</ul>` : `<p class="doux">${echap(t('sv.aucuneDemarche'))}</p>`}
      <div class="ligne sv-actions sv-actions-detail">
        ${degrade(s) ? actionsAlternatives(s) : demande + rdv + lienDedie}
        ${LIEU_CARTE[s.id] ? `<a class="btn" href="carte.html?lieu=${encodeURIComponent(LIEU_CARTE[s.id])}"><i class="ph ph-map-pin" aria-hidden="true"></i>${echap(t('sv.carte'))}</a>` : ''}
      </div>
      ${NT.auth.aRole('admin') ? `<p style="margin-top:1rem"><a href="agent-alertes.html?desactiver=${encodeURIComponent(s.id)}#t-services"><i class="ph ph-${etatCode(s) === 'desactive' ? 'play-circle' : 'prohibit'}" aria-hidden="true"></i> ${echap(t(etatCode(s) === 'desactive' ? 'sv.adminRea' : 'sv.adminDes'))}</a></p>` : ''}`;
  }

  let ouvertId = null;
  function ouvrir(id) {
    const s = NT.services.get(id);
    if (!s) return;
    if (ouvertId !== id) NT.services.vue(id);       // compte la consultation une fois par ouverture
    ouvertId = id;
    tiroir.setAttribute('label', choisir(s.nom));
    tiroir.innerHTML = detailHtml(s);
    tiroir.show();
  }
  function selonAncre() {
    const id = decodeURIComponent(location.hash.replace(/^#/, ''));
    if (id && NT.services.get(id)) ouvrir(id);
    else if (tiroir.open) tiroir.hide();
  }
  tiroir.addEventListener('sl-after-hide', e => {
    if (e.target !== tiroir) return;
    ouvertId = null;
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  });

  /* ---------- Démarrage ---------- */
  NT.pret(() => {
    const q0 = NT.ui.param('q');
    if (q0) champ.value = q0;
    rendreBoutons();
    rendre();

    champ.addEventListener('input', () => { rendre(); });
    document.getElementById('sv-form').addEventListener('submit', e => { e.preventDefault(); rendre(); });
    effacer.addEventListener('click', () => { champ.value = ''; rendre(); champ.focus(); });
    boutons.addEventListener('click', e => {
      const b = e.target.closest('[data-cat]'); if (!b) return;
      // Bouton actif recliqué = retour à « tous les thèmes »
      categorie = (categorie === b.dataset.cat) ? '' : b.dataset.cat;
      rendreBoutons(); rendre();
      const nouveau = boutons.querySelector(`[data-cat="${CSS.escape(categorie)}"]`); if (nouveau) nouveau.focus();
    });
    racine.addEventListener('click', e => {
      const b = e.target.closest('[data-detail]'); if (!b) return;
      location.hash = b.dataset.detail;       // déclenche hashchange → ouverture + retour arrière possible
    });
    window.addEventListener('hashchange', selonAncre);
    // Le composant Shoelace doit être défini avant d'appeler show()
    customElements.whenDefined('sl-drawer').then(selonAncre);
  });
})();
