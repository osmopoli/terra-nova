/* Terra Nova — glossaire (D13 : « certains mots sont difficiles à comprendre »).
   - window.NT_GLOSSAIRE : liste des termes (français simple + versions en, es, ar)
   - window.NT_glossaireLangue() : liste normalisée pour la langue courante (fr, en, es, ar) ; `cle` = terme français normalisé, stable
     d'une langue à l'autre (ancres aide.html#mot-…)
   - window.NT_activerGlossaire(racine) : dans les paragraphes de `racine`, entoure la 1re occurrence de chaque terme
     par un <button class="terme"> qui ouvre une infobulle (survol, focus clavier, clic ; Échap la ferme).
   Usage : NT.pret(() => NT_activerGlossaire(document.querySelector('main')));  (idempotent, à rappeler après un rendu dynamique) */
(function () {
  'use strict';

  window.NT_GLOSSAIRE = [
    { terme: 'Démarche', synonymes: ['démarches'], definition: 'Une action à faire auprès de la mairie : demander un document, déclarer un changement, déposer un dossier.',
      en: { terme: 'Procedure', synonymes: ['procedures'], definition: 'Something you do with the city hall: ask for a document, declare a change, hand in a file.' },
      es: { terme: 'Trámite', synonymes: ['trámites', 'gestión'], definition: 'Una acción que se hace ante el ayuntamiento: pedir un documento, declarar un cambio, presentar un expediente.' },
      ar: { terme: 'إجراء', synonymes: ['إجراءات', 'معاملة', 'الإجراء'], definition: 'عمل تقوم به لدى البلدية: طلب وثيقة، أو التصريح بتغيير، أو إيداع ملف.' } },
    { terme: 'Signalement', synonymes: ['signalements'], definition: 'Un message pour prévenir la ville d’un problème dans la rue : lampadaire éteint, trou dans la route, déchets.',
      en: { terme: 'Report', synonymes: ['reports'], definition: 'A message that warns the city about a problem in the street: broken light, pothole, rubbish.' },
      es: { terme: 'Aviso de problema', synonymes: ['avisos de problema', 'aviso'], definition: 'Un mensaje para avisar a la ciudad de un problema en la calle: farola apagada, bache, basura.' },
      ar: { terme: 'بلاغ', synonymes: ['بلاغات', 'إبلاغ', 'البلاغ'], definition: 'رسالة لإخبار المدينة بمشكلة في الشارع: مصباح مطفأ، حفرة في الطريق، نفايات.' } },
    { terme: 'Pièce justificative', synonymes: ['pièces justificatives', 'justificatif', 'justificatifs'], definition: 'Un document qui prouve ce que vous déclarez : pièce d’identité, facture, contrat de logement.',
      en: { terme: 'Supporting document', synonymes: ['supporting documents', 'proof of address'], definition: 'A paper that proves what you declare: ID, bill, housing contract.' },
      es: { terme: 'Documento justificativo', synonymes: ['documentos justificativos', 'justificante', 'justificantes'], definition: 'Un documento que prueba lo que usted declara: documento de identidad, factura, contrato de vivienda.' },
      ar: { terme: 'وثيقة إثبات', synonymes: ['وثائق إثبات', 'مستند', 'مستندات'], definition: 'وثيقة تثبت ما تصرّح به: بطاقة هوية، فاتورة، عقد سكن.' } },
    { terme: 'État civil', synonymes: ['état-civil'], definition: 'Le service qui enregistre les naissances, les mariages et les décès, et qui délivre vos actes officiels.',
      en: { terme: 'Civil registry', synonymes: ['civil status'], definition: 'The service that records births, marriages and deaths and issues your official certificates.' },
      es: { terme: 'Registro civil', synonymes: ['estado civil'], definition: 'El servicio que registra los nacimientos, los matrimonios y las defunciones, y que expide sus actas oficiales.' },
      ar: { terme: 'الحالة المدنية', synonymes: ['السجل المدني'], definition: 'المصلحة التي تسجّل الولادات والزواج والوفيات وتصدر وثائقك الرسمية.' } },
    { terme: 'Statut', synonymes: ['statuts'], definition: 'L’étape où en est votre demande : reçue, en cours, traitée ou clôturée.',
      en: { terme: 'Status', synonymes: [], definition: 'Where your request stands: received, in progress, resolved or closed.' },
      es: { terme: 'Estado', synonymes: ['estados'], definition: 'La etapa en la que está su solicitud: recibida, en curso, resuelta o cerrada.' },
      ar: { terme: 'الحالة', synonymes: ['حالة الطلب'], definition: 'المرحلة التي وصل إليها طلبك: مستلم، قيد المعالجة، تمت المعالجة أو مغلق.' } },
    { terme: 'Clôturée', synonymes: ['clôturé', 'clôturées', 'clôturés', 'clôture'], definition: 'Votre demande est terminée. Il n’y a plus rien à faire de votre côté.',
      en: { terme: 'Closed', synonymes: [], definition: 'Your request is finished. Nothing more is needed from you.' },
      es: { terme: 'Cerrada', synonymes: ['cerrado', 'cerradas', 'cerrados', 'cierre'], definition: 'Su solicitud ha terminado. No tiene que hacer nada más.' },
      ar: { terme: 'مغلقة', synonymes: ['مغلق', 'إغلاق'], definition: 'انتهى طلبك. لم يبق شيء عليك فعله.' } },
    { terme: 'Quartier', synonymes: ['quartiers'], definition: 'Une des cinq zones de la ville : Centre, Nord, Sud, Est et Ouest.',
      en: { terme: 'District', synonymes: ['districts'], definition: 'One of the five areas of the city: Centre, North, South, East and West.' },
      es: { terme: 'Barrio', synonymes: ['barrios'], definition: 'Una de las cinco zonas de la ciudad: Centro, Norte, Sur, Este y Oeste.' },
      ar: { terme: 'الحي', synonymes: ['حي', 'أحياء', 'حيّك', 'حيّي'], definition: 'إحدى مناطق المدينة الخمس: الوسط، الشمال، الجنوب، الشرق والغرب.' } },
    { terme: 'Navette', synonymes: ['navettes'], definition: 'Le bus de la ville. Il existe quatre lignes, de N1 à N4.',
      en: { terme: 'Shuttle', synonymes: ['shuttles'], definition: 'The city bus. There are four lines, N1 to N4.' },
      es: { terme: 'Lanzadera', synonymes: ['lanzaderas'], definition: 'El autobús de la ciudad. Hay cuatro líneas, de la N1 a la N4.' },
      ar: { terme: 'الحافلة', synonymes: ['حافلة', 'حافلات', 'الحافلات'], definition: 'حافلة المدينة. توجد أربعة خطوط، من N1 إلى N4.' } },
    { terme: 'Prise en charge', synonymes: ['pris en charge', 'prise en charge'], definition: 'Un agent a commencé à s’occuper de votre demande.',
      en: { terme: 'Taken in charge', synonymes: ['being handled'], definition: 'A staff member has started working on your request.' },
      es: { terme: 'Atención iniciada', synonymes: ['atendida', 'en tratamiento'], definition: 'Un agente ha empezado a ocuparse de su solicitud.' },
      ar: { terme: 'التكفّل', synonymes: ['تكفّل', 'قيد التكفل'], definition: 'بدأ عون بمعالجة طلبك.' } },
    { terme: 'Créneau', synonymes: ['créneaux'], definition: 'Une plage horaire réservée pour un rendez-vous, par exemple jeudi de 10h à 10h30.',
      en: { terme: 'Time slot', synonymes: ['time slots', 'slot', 'slots'], definition: 'A reserved period for an appointment, for example Thursday from 10:00 to 10:30.' },
      es: { terme: 'Franja horaria', synonymes: ['franjas horarias', 'franja'], definition: 'Un tramo de tiempo reservado para una cita, por ejemplo el jueves de 10:00 a 10:30.' },
      ar: { terme: 'الفترة الزمنية', synonymes: ['فترة زمنية', 'فترة', 'وقت الموعد'], definition: 'مدة زمنية محجوزة لموعد، مثلاً الخميس من 10:00 إلى 10:30.' } },
    { terme: 'Notification', synonymes: ['notifications'], definition: 'Un petit message qui vous prévient. Vous le trouvez dans la cloche, en haut de la page.',
      en: { terme: 'Notification', synonymes: ['notifications'], definition: 'A short message that tells you something. You find it in the bell at the top of the page.' },
      es: { terme: 'Notificación', synonymes: ['notificaciones'], definition: 'Un mensaje corto que le avisa de algo. Lo encontrará en la campana, en la parte superior de la página.' },
      ar: { terme: 'الإشعار', synonymes: ['إشعار', 'إشعارات', 'الإشعارات'], definition: 'رسالة قصيرة تنبّهك. تجدها في الجرس أعلى الصفحة.' } },
    { terme: 'Administrateur', synonymes: ['administrateurs'], definition: 'Une personne de la mairie qui gère les comptes et les réglages de la plateforme.',
      en: { terme: 'Administrator', synonymes: ['administrators'], definition: 'A city hall person who manages accounts and settings of the platform.' },
      es: { terme: 'Administrador', synonymes: ['administradores', 'administradora'], definition: 'Una persona del ayuntamiento que gestiona las cuentas y los ajustes de la plataforma.' },
      ar: { terme: 'المسؤول', synonymes: ['مسؤول', 'المسؤولون'], definition: 'شخص من البلدية يدير الحسابات وإعدادات المنصة.' } },
    { terme: 'Agent municipal', synonymes: ['agents municipaux', 'agent'], definition: 'Un employé de la mairie qui traite vos demandes et répond à vos questions.',
      en: { terme: 'City staff member', synonymes: ['staff member', 'staff'], definition: 'A city hall employee who handles your requests and answers your questions.' },
      es: { terme: 'Agente municipal', synonymes: ['agentes municipales', 'agente'], definition: 'Un empleado del ayuntamiento que trata sus solicitudes y responde a sus preguntas.' },
      ar: { terme: 'عون البلدية', synonymes: ['أعوان البلدية', 'عون', 'الأعوان'], definition: 'موظف في البلدية يعالج طلباتك ويجيب عن أسئلتك.' } },
    { terme: 'Urbanisme', synonymes: [], definition: 'Les règles de construction et d’aménagement : permis, extension d’un module, travaux.',
      en: { terme: 'Urban planning', synonymes: ['planning permit'], definition: 'The rules for building and development: permits, extending a module, building work.' },
      es: { terme: 'Urbanismo', synonymes: [], definition: 'Las reglas de construcción y ordenación: permisos, ampliación de un módulo, obras.' },
      ar: { terme: 'التعمير', synonymes: ['التهيئة العمرانية'], definition: 'قواعد البناء والتهيئة: الرخص، توسيع وحدة سكنية، الأشغال.' } },
    { terme: 'Aide sociale', synonymes: ['aides sociales'], definition: 'Un soutien en argent ou un accompagnement pour les personnes qui ont des difficultés.',
      en: { terme: 'Social aid', synonymes: ['social support'], definition: 'Money or guidance for people who are in difficulty.' },
      es: { terme: 'Ayuda social', synonymes: ['ayudas sociales'], definition: 'Un apoyo económico o un acompañamiento para las personas con dificultades.' },
      ar: { terme: 'المساعدة الاجتماعية', synonymes: ['مساعدة اجتماعية', 'المساعدات الاجتماعية'], definition: 'دعم مالي أو مرافقة للأشخاص الذين يواجهون صعوبات.' } },
    { terme: 'Alerte', synonymes: ['alertes'], definition: 'Un message urgent qui prévient d’un danger et dit quoi faire. Les alertes passent avant toutes les autres annonces.',
      en: { terme: 'Alert', synonymes: ['alerts'], definition: 'An urgent message that warns of a danger and says what to do. Alerts come before all other notices.' },
      es: { terme: 'Alerta', synonymes: ['alertas'], definition: 'Un mensaje urgente que avisa de un peligro y dice qué hacer. Las alertas van antes que todos los demás anuncios.' },
      ar: { terme: 'التنبيه', synonymes: ['تنبيه', 'تنبيهات', 'التنبيهات'], definition: 'رسالة عاجلة تحذّر من خطر وتقول ما يجب فعله. تأتي التنبيهات قبل كل الإعلانات الأخرى.' } },
    { terme: 'Personne vulnérable', synonymes: ['personnes vulnérables', 'vulnérable', 'vulnérables'], definition: 'Quelqu’un qui risque davantage en cas de danger : personne âgée, jeune enfant, femme enceinte, personne malade.',
      en: { terme: 'Vulnerable person', synonymes: ['vulnerable people', 'vulnerable'], definition: 'Someone at greater risk in a danger: older person, young child, pregnant woman, sick person.' },
      es: { terme: 'Persona vulnerable', synonymes: ['personas vulnerables', 'vulnerable', 'vulnerables'], definition: 'Alguien que corre más riesgo en caso de peligro: persona mayor, niño pequeño, mujer embarazada, persona enferma.' },
      ar: { terme: 'شخص هش', synonymes: ['أشخاص هشّون', 'وضع هش', 'هش'], definition: 'شخص أكثر عرضة للخطر: مسنّ، طفل صغير، امرأة حامل، مريض.' } },
    { terme: 'Maintenance', synonymes: [], definition: 'Un service est arrêté un moment pour être réparé ou amélioré. La page du service dit quand revenir.',
      en: { terme: 'Maintenance', synonymes: [], definition: 'A service is stopped for a while to be repaired or improved. The service page tells you when to come back.' },
      es: { terme: 'Mantenimiento', synonymes: [], definition: 'Un servicio se detiene un momento para repararlo o mejorarlo. La página del servicio dice cuándo volver.' },
      ar: { terme: 'الصيانة', synonymes: ['صيانة'], definition: 'تتوقف خدمة لبعض الوقت لإصلاحها أو تحسينها. تخبرك صفحة الخدمة متى تعود.' } },
    { terme: 'Module d’habitation', synonymes: ['modules d’habitation', 'module'], definition: 'Votre logement sur Terra Nova, construit sous le dôme.',
      en: { terme: 'Housing module', synonymes: ['housing modules', 'module'], definition: 'Your home on Terra Nova, built under the dome.' },
      es: { terme: 'Módulo de vivienda', synonymes: ['módulos de vivienda', 'módulo'], definition: 'Su vivienda en Terra Nova, construida bajo la cúpula.' },
      ar: { terme: 'الوحدة السكنية', synonymes: ['وحدة سكنية', 'وحدات سكنية', 'وحدتك السكنية'], definition: 'مسكنك في تيرا نوفا، المبني تحت القبة.' } },
    { terme: 'Dôme', synonymes: ['dômes'], definition: 'La grande structure transparente qui protège la ville et ses habitants.',
      en: { terme: 'Dome', synonymes: ['domes'], definition: 'The large transparent structure that protects the city and its residents.' },
      es: { terme: 'Cúpula', synonymes: ['cúpulas'], definition: 'La gran estructura transparente que protege la ciudad y a sus habitantes.' },
      ar: { terme: 'القبة', synonymes: ['قبة', 'القباب'], definition: 'الهيكل الشفاف الكبير الذي يحمي المدينة وسكانها.' } },
    { terme: 'Gare orbitale', synonymes: [], definition: 'La grande gare du centre-ville : les navettes de la ville y passent et elle relie Terra Nova aux vaisseaux en orbite.',
      en: { terme: 'Orbital station', synonymes: ['orbital terminal'], definition: 'The big downtown station: city shuttles stop there and it links Terra Nova to ships in orbit.' },
      es: { terme: 'Estación orbital', synonymes: ['terminal orbital'], definition: 'La gran estación del centro de la ciudad: las lanzaderas de la ciudad pasan por ella y conecta Terra Nova con las naves en órbita.' },
      ar: { terme: 'المحطة المدارية', synonymes: ['محطة مدارية'], definition: 'المحطة الكبرى في وسط المدينة: تمر بها حافلات المدينة وتربط تيرا نوفا بالمركبات في المدار.' } },
    { terme: 'Rappel', synonymes: ['rappels'], definition: 'Un message envoyé avant votre rendez-vous pour ne pas l’oublier.',
      en: { terme: 'Reminder', synonymes: ['reminders'], definition: 'A message sent before your appointment so you do not forget it.' },
      es: { terme: 'Recordatorio', synonymes: ['recordatorios'], definition: 'Un mensaje enviado antes de su cita para que no la olvide.' },
      ar: { terme: 'التذكير', synonymes: ['تذكير', 'تذكيرات'], definition: 'رسالة تُرسل قبل موعدك حتى لا تنساه.' } },
    { terme: 'Accusé de réception', synonymes: ['accusés de réception'], definition: 'Un message qui confirme que la mairie a bien reçu votre demande. Il contient votre numéro de suivi.',
      en: { terme: 'Acknowledgement of receipt', synonymes: ['confirmation of receipt'], definition: 'A message confirming the city hall received your request. It contains your tracking number.' },
      es: { terme: 'Acuse de recibo', synonymes: ['acuses de recibo'], definition: 'Un mensaje que confirma que el ayuntamiento ha recibido su solicitud. Contiene su número de seguimiento.' },
      ar: { terme: 'إشعار بالاستلام', synonymes: ['إشعار الاستلام', 'تأكيد الاستلام'], definition: 'رسالة تؤكد أن البلدية استلمت طلبك. تحتوي على رقم المتابعة.' } }
  ];

  /* Liste normalisée pour la langue courante */
  window.NT_glossaireLangue = function () {
    const l = (window.NT && NT.i18n && NT.i18n.langue) || 'fr';
    return window.NT_GLOSSAIRE.map(g => {
      const v = (l !== 'fr' && g[l]) || g;
      return { terme: v.terme, synonymes: v.synonymes || [], definition: v.definition, cle: norm(g.terme) };
    });
  };

  const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const echapRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const EXCLU = 'a,button,input,textarea,select,option,label,h1,h2,h3,h4,h5,h6,summary,script,style,noscript,code,pre,abbr,nav,th,time,sl-button,sl-tab,sl-dialog,.terme,.statut,.sr-only,[data-no-glossaire],[contenteditable],[aria-hidden="true"]';
  const DANS = 'p,li,dd';
  let numero = 0, pose = false, tip, actif = null, delai = null;

  function style() {
    if (document.getElementById('nt-glossaire-css')) return;
    const s = document.createElement('style'); s.id = 'nt-glossaire-css';
    s.textContent = `
      .terme{ font:inherit; color:inherit; background:none; border:0; padding:0; margin:0; display:inline; cursor:help; text-align:inherit;
        text-decoration:underline dotted var(--iono,#79E6FF); text-decoration-thickness:2px; text-underline-offset:.22em; }
      @media (hover:hover){ .terme:hover{ color:var(--iono,#79E6FF); } }
      #nt-glossaire-tip{ position:fixed; z-index:3000; left:0; top:0; max-width:min(21rem,calc(100vw - 1rem)); padding:.75rem .95rem; border-radius:12px;
        background:#0E1338; color:var(--givre,#E8F1FF); border:2px solid var(--iono,#79E6FF); box-shadow:0 18px 40px -12px rgba(0,0,0,.8); font-size:.93rem; line-height:1.5; font-weight:500; }
      #nt-glossaire-tip[hidden]{ display:none; }
      #nt-glossaire-tip strong{ display:block; font-family:var(--titre,inherit); font-size:.95rem; margin-bottom:.2rem; color:var(--iono,#79E6FF); }
      html.contraste #nt-glossaire-tip{ background:#000; border-color:#fff; }`;
    document.head.appendChild(s);
  }

  function infobulle() {
    if (tip) return tip;
    tip = document.createElement('div'); tip.id = 'nt-glossaire-tip'; tip.setAttribute('role', 'tooltip'); tip.hidden = true;
    tip.innerHTML = '<strong></strong><span></span>';
    tip.addEventListener('mouseenter', () => clearTimeout(delai));
    tip.addEventListener('mouseleave', () => retarder());
    document.body.appendChild(tip);
    return tip;
  }
  function afficher(btn) {
    clearTimeout(delai); infobulle();
    if (actif && actif !== btn) actif._epingle = false;
    actif = btn;
    tip.querySelector('strong').textContent = btn.dataset.terme;
    tip.querySelector('span').textContent = btn.dataset.def;
    tip.hidden = false;
    const r = btn.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight;
    let x = r.left + r.width / 2 - w / 2; x = Math.max(8, Math.min(x, window.innerWidth - w - 8));
    let y = r.bottom + 8; if (y + h > window.innerHeight - 8) y = Math.max(8, r.top - h - 8);
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  }
  function masquer() {
    clearTimeout(delai);
    if (tip) tip.hidden = true;
    if (actif) actif._epingle = false;
    actif = null;
  }
  function retarder() { clearTimeout(delai); delai = setTimeout(() => { if (!actif || !actif._epingle) masquer(); }, 160); }

  function brancher() {
    if (pose) return; pose = true;
    const terme = e => e.target.closest && e.target.closest('.terme');
    document.addEventListener('mouseover', e => { const b = terme(e); if (b) afficher(b); });
    document.addEventListener('mouseout', e => { const b = terme(e); if (b && !b._epingle && document.activeElement !== b) retarder(); });
    document.addEventListener('pointerdown', e => { const b = terme(e); if (b) b._souris = true; });
    document.addEventListener('focusin', e => { const b = terme(e); if (b && !b._souris) afficher(b); });
    document.addEventListener('focusout', e => { const b = terme(e); if (b) { b._souris = false; if (actif === b) masquer(); } });
    document.addEventListener('click', e => {
      const b = terme(e);
      if (b) {                                       // clic / Entrée / Espace : épingle l'infobulle (utile au tactile)
        if (actif === b && b._epingle && !tip.hidden) masquer(); else { afficher(b); b._epingle = true; }
        return;
      }
      if (actif && !(e.target.closest && e.target.closest('#nt-glossaire-tip'))) masquer();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && tip && !tip.hidden) masquer(); });
    window.addEventListener('scroll', () => { if (actif && !actif._epingle) masquer(); }, { passive: true });
  }

  /* Premier nœud texte contenant le motif, dans les paragraphes de la racine */
  function trouver(racine, re) {
    const w = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        if (!n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const p = n.parentElement;
        if (!p || p.closest(EXCLU) || !p.closest(DANS) || !racine.contains(p)) return NodeFilter.FILTER_REJECT;
        // dans un conteneur flex/grid (pastilles, badges), découper le texte ferait sauter les espaces
        const aff = getComputedStyle(p).display;
        if (aff.includes('flex') || aff.includes('grid')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    let n;
    while ((n = w.nextNode())) { re.lastIndex = 0; const m = re.exec(n.nodeValue); if (m) return { n, m }; }
    return null;
  }

  window.NT_activerGlossaire = function (racine) {
    racine = racine || document.querySelector('main') || document.body;
    style(); infobulle(); brancher();
    const liste = window.NT_glossaireLangue().map(g => {
      const formes = [g.terme].concat(g.synonymes).sort((a, b) => b.length - a.length);
      const motif = formes.map(f => echapRe(f).replace(/[’']/g, "[’']").replace(/\s+/g, '\\s+')).join('|');
      let re;
      try { re = new RegExp('(?<![\\p{L}\\p{N}_])(?:' + motif + ')(?![\\p{L}\\p{N}_])', 'iu'); } catch (e) { return null; }
      return { g, re, cle: norm(g.terme), longueur: Math.max.apply(null, formes.map(f => f.length)) };
    }).filter(Boolean).sort((a, b) => b.longueur - a.longueur);

    liste.forEach(({ g, re, cle }) => {
      if (racine.querySelector('.terme[data-gl="' + cle.replace(/"/g, '') + '"]')) return;      // déjà fait : idempotent
      const t = trouver(racine, re);
      if (!t) return;
      const { n, m } = t, txt = n.nodeValue;
      const bouton = document.createElement('button');
      bouton.type = 'button'; bouton.className = 'terme'; bouton.dataset.gl = cle; bouton.dataset.terme = g.terme; bouton.dataset.def = g.definition;
      bouton.textContent = m[0];
      const id = 'gl-def-' + (++numero);
      bouton.setAttribute('aria-describedby', id);
      const lecteur = document.createElement('span'); lecteur.hidden = true; lecteur.id = id; lecteur.textContent = g.terme + ' : ' + g.definition;   // masqué mais lu via aria-describedby
      const frag = document.createDocumentFragment();
      if (m.index > 0) frag.appendChild(document.createTextNode(txt.slice(0, m.index)));
      frag.appendChild(bouton); frag.appendChild(lecteur);
      if (m.index + m[0].length < txt.length) frag.appendChild(document.createTextNode(txt.slice(m.index + m[0].length)));
      n.parentNode.replaceChild(frag, n);
    });
  };
})();
