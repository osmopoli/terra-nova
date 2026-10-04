/* Terra Nova — vague 18 (F89, F90) : « Version en langage clair » des informations administratives essentielles.
   Chaque contenu : texte officiel (paragraphes, qui font foi) + version claire inspirée du FALC (phrases courtes, encadrés
   Qui ? Quoi ? Quand ? Combien ? Documents ?) + une explication simple par paragraphe officiel (« Expliquer plus simplement »).
   Les éléments obligatoires du texte officiel (dates, délais, montants, horaires, téléphones, références juridiques, documents)
   doivent rester présents dans la version claire : verifier() le contrôle au serveur avant tout enregistrement par un agent.
   Contenus de démonstration : français pour tous, anglais / espagnol / arabe pour les plus importants. */
'use strict';
const T = require('./texte');

const MOIS = ['janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre'];
const DOCUMENTS = [
  ['piece d identite', 'identite'], ['carte d identite', 'identite'], ['passeport', 'passeport'], ['justificatif de domicile', 'domicile'], ['justificatif d adresse', 'adresse'],
  ['livret de famille', 'livret'], ['photo', 'photo'], ['acte de naissance', 'naissance'], ['avis de revenus', 'revenus'], ['justificatifs de revenus', 'revenus'],
  ['justificatifs de ressources', 'ressources'], ['attestation de ressources', 'ressources'], ['bail', 'bail'], ['facture', 'facture'], ['certificat medical', 'certificat'],
  ['carnet de sante', 'carnet'], ['cv', 'cv'], ['plan', 'plan'], ['releve d identite bancaire', 'bancaire'], ['attribution du module', 'attribution']
];

/* ---------- Éléments obligatoires d'un texte officiel ---------- */
function elementsRequis(texte) {
  const brut = String(texte || '');
  const n = T.normaliser(brut);
  const els = [];
  const ajouter = (type, valeur, test) => { if (!els.some((e) => e.type === type && e.valeur === valeur)) els.push({ type, valeur, test }); };
  // montants : 25 €, 120 euros, 10 crédits
  for (const m of brut.matchAll(/(\d[\d  .,]*)\s?(€|euros?|crédits?)/gi)) { const v = m[1].replace(/[\s  ]/g, ''); ajouter('montant', m[0].trim(), (c) => c.compact.includes(v) && /€|euro|crédit|credit/i.test(c.brut)); }
  // pourcentages
  for (const m of brut.matchAll(/(\d+(?:[.,]\d+)?)\s?(%|pour ?cent)/gi)) ajouter('pourcentage', m[0].trim(), (c) => new RegExp('(^|\\D)' + m[1].replace(/[.,]/, '[.,]') + '\\s?(%|pour ?cent)').test(c.brut));
  // téléphones (au moins 8 chiffres groupés) et numéros d'urgence 15 / 112
  for (const m of brut.matchAll(/\b\d{2}(?:[\s.]\d{2}){3,4}\b/g)) { const v = m[0].replace(/\D/g, ''); ajouter('telephone', m[0], (c) => c.chiffres.includes(v)); }
  // délais et durées : 30 jours, 5 jours ouvrés, 3 mois, 48 heures, 2 ans, 10 minutes
  for (const m of n.matchAll(/(?:^|\s)(\d+)\s(jours?|mois|ans?|annees?|semaines?|heures?|minutes?)(?=\s|$)/g)) {
    const unite = m[2].replace(/s$/, '').replace(/^annee$/, 'an');
    ajouter('delai', `${m[1]} ${m[2]}`, (c) => new RegExp(`(^|\\s)${m[1]}\\s(\\S+\\s){0,2}?${unite}`).test(c.norm));
  }
  // horaires : 8h, 17h30, 9h–12h
  for (const m of n.matchAll(/(?:^|\s)(\d{1,2}h(?:\d{2})?)(?=\s|$)/g)) ajouter('horaire', m[1], (c) => (' ' + c.norm + ' ').includes(' ' + m[1] + ' ') || c.norm.includes(m[1]));
  // dates : 1er mars, 31 decembre 2026, 15/06/2026
  for (const m of n.matchAll(new RegExp(`(?:^|\\s)(\\d{1,2})(?:er)?\\s(${MOIS.join('|')})(?:\\s(\\d{4}))?`, 'g'))) ajouter('date', m[0].trim(), (c) => new RegExp(`(^|\\s)${m[1]}(er)?\\s${m[2]}`).test(c.norm) && (!m[3] || c.norm.includes(m[3])));
  for (const m of brut.matchAll(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/g)) ajouter('date', m[0], (c) => c.brut.includes(m[0]));
  // références juridiques : article 12, art. 4, règlement municipal n° 2024-07, délibération n° 2025-031, arrêté…
  for (const m of n.matchAll(/(?:^|\s)((?:article|art)\s[a-z]?\s?\d+(?:\s\d+)*)/g)) { const v = m[1].replace(/^art\s/, 'article '); ajouter('reference', v, (c) => c.norm.includes(v) || c.norm.includes(v.replace('article ', 'art '))); }
  for (const m of n.matchAll(/(?:^|\s)((?:reglement|deliberation|arrete|decret|loi|charte)(?:\s[a-z]+){0,2}\sn\s\d+(?:\s\d+)*)/g)) ajouter('reference', ((brut.match(new RegExp('(?:règlement|délibération|arrêté|décret|loi|charte)[^,;()]*?n°\\s?' + m[1].split(' n ').pop().replace(/ /g, '-'), 'i')) || [])[0]) || m[1], (c) => c.norm.includes(m[1].split(' n ').pop()) );
  // documents demandés
  for (const [doc, cle] of DOCUMENTS) if ((' ' + n + ' ').includes(' ' + doc + ' ')) ajouter('document', doc, (c) => c.norm.includes(cle));
  return els;
}
const formes = (texte) => { const brut = String(texte || ''); const norm = T.normaliser(brut); return { brut, norm, compact: brut.replace(/[\s  ]/g, ''), chiffres: brut.replace(/\D/g, '') }; };

// Texte complet d'une version claire (tous les encadrés)
function texteClair(c) {
  if (!c) return '';
  return [c.resume, c.qui, c.quoi, c.quand, c.combien, c.documents, c.ou, ...(c.paragraphes || []), ...(c.etapes || [])].filter(Boolean).join('\n');
}
/* Contrôle : chaque élément obligatoire du texte officiel est-il encore présent dans la version claire ?
   Français : tous les types ; autres langues : les éléments chiffrés (montants, délais, horaires, téléphones, dates, références). */
function verifier(officiel, clair, langue) {
  const els = elementsRequis(Array.isArray(officiel) ? officiel.join('\n') : officiel);
  const c = formes(texteClair(clair));
  const aVerifier = langue && langue !== 'fr' ? els.filter((e) => e.type !== 'document' && e.type !== 'delai' && e.type !== 'date') : els;
  // en langue étrangère, un délai ou une date se vérifie sur son nombre seulement
  const chiffresSeuls = langue && langue !== 'fr' ? els.filter((e) => e.type === 'delai' || e.type === 'date').map((e) => ({ type: e.type, valeur: e.valeur, test: (x) => new RegExp('(^|\\D)' + e.valeur.match(/\d+/)[0] + '(\\D|$)').test(x.brut) })) : [];
  const manquants = aVerifier.concat(chiffresSeuls).filter((e) => !e.test(c)).map((e) => ({ type: e.type, valeur: e.valeur }));
  return { ok: manquants.length === 0, requis: els.map((e) => ({ type: e.type, valeur: e.valeur })), manquants };
}

/* ---------- Contenus de démonstration ---------- */
const C = [];
const ajouter = (id, titre, officiel, clair, extra) => C.push(Object.assign({ id, titre, officiel, clair }, extra || {}));

ajouter('page:demarches', { fr: 'Faire une démarche en ligne', en: 'Doing a procedure online', es: 'Hacer un trámite en línea', ar: 'القيام بإجراء عبر الإنترنت' },
  { fr: ['Toute demande adressée à la mairie de Terra Nova par voie électronique fait l’objet d’un accusé de réception mentionnant sa date d’enregistrement, le service destinataire et un code de vérification (règlement municipal n° 2024-07, article 3).',
    'Les délais de traitement indicatifs sont de 3 jours ouvrés pour une demande d’information, de 48 heures pour un signalement (4 heures en cas de danger) et de 5 jours ouvrés pour une démarche administrative. L’absence de réponse ne vaut pas acceptation.',
    'Le demandeur peut à tout moment compléter son dossier ou demander l’état d’avancement de sa demande à l’aide de son numéro de suivi.'],
    en: ['Every request sent to Terra Nova city hall online receives an acknowledgement of receipt showing its registration date, the receiving service and a verification code (municipal regulation no. 2024-07, article 3).',
      'Indicative processing times are 3 working days for an information request, 48 hours for a report (4 hours if there is danger) and 5 working days for an administrative procedure. No answer does not mean acceptance.',
      'The applicant may complete the file or ask for the progress of the request at any time using the tracking number.'],
    es: ['Toda solicitud enviada en línea al ayuntamiento de Terra Nova recibe un acuse de recibo con la fecha de registro, el servicio destinatario y un código de verificación (reglamento municipal n.º 2024-07, artículo 3).',
      'Los plazos indicativos son de 3 días laborables para una solicitud de información, 48 horas para un aviso (4 horas si hay peligro) y 5 días laborables para un trámite. La falta de respuesta no equivale a aceptación.',
      'El solicitante puede completar su expediente o pedir el estado de su solicitud en cualquier momento con su número de seguimiento.'],
    ar: ['كل طلب يُرسل إلكترونياً إلى بلدية تيرا نوفا يحصل على إشعار استلام يذكر تاريخ تسجيله والخدمة المستلمة ورمز تحقق (النظام البلدي رقم 2024-07، المادة 3).',
      'المهل التقريبية: 3 أيام عمل لطلب معلومة، 48 ساعة لبلاغ (4 ساعات في حالة الخطر) و5 أيام عمل لإجراء إداري. عدم الرد لا يعني القبول.',
      'يمكن لصاحب الطلب في أي وقت استكمال ملفه أو السؤال عن تقدم طلبه برقم المتابعة.'] },
  { fr: { resume: 'Vous faites votre demande sur Terra Nova. La mairie vous répond.', qui: 'Tous les habitants, avec ou sans compte.', quoi: 'Une question, un signalement ou une démarche.',
      quand: 'Réponse en 3 jours ouvrés pour une question. 48 heures pour un signalement (4 heures si c’est dangereux). 5 jours ouvrés pour une démarche.', combien: 'C’est gratuit.',
      documents: 'Cela dépend de la démarche. La liste est indiquée avant de commencer.',
      paragraphes: ['Après l’envoi, vous recevez un accusé de réception : c’est la preuve que la mairie a reçu votre demande. Il a une date, le nom du service et un code. Règle : règlement municipal n° 2024-07, article 3.',
        'La mairie répond en 3 jours ouvrés pour une question, en 48 heures pour un signalement (4 heures si c’est dangereux), en 5 jours ouvrés pour une démarche. Attention : sans réponse, votre demande n’est pas acceptée pour autant.',
        'Avec votre numéro de suivi, vous pouvez ajouter des informations ou voir où en est votre demande.'] },
    en: { resume: 'You make your request on Terra Nova. City hall answers you.', qui: 'All residents, with or without an account.', quoi: 'A question, a report or a procedure.',
      quand: 'Answer within 3 working days for a question. 48 hours for a report (4 hours if dangerous). 5 working days for a procedure.', combien: 'It is free.', documents: 'It depends on the procedure. The list is shown before you start.',
      paragraphes: ['After sending, you get an acknowledgement of receipt: proof that city hall got your request. It has a date, the service name and a code. Rule: municipal regulation no. 2024-07, article 3.',
        'City hall answers within 3 working days for a question, 48 hours for a report (4 hours if dangerous), 5 working days for a procedure. Careful: no answer does not mean yes.', 'With your tracking number, you can add information or see where your request stands.'] },
    es: { resume: 'Hace su solicitud en Terra Nova. El ayuntamiento le responde.', qui: 'Todos los habitantes, con o sin cuenta.', quoi: 'Una pregunta, un aviso o un trámite.',
      quand: 'Respuesta en 3 días laborables para una pregunta. 48 horas para un aviso (4 horas si es peligroso). 5 días laborables para un trámite.', combien: 'Es gratis.', documents: 'Depende del trámite. La lista aparece antes de empezar.',
      paragraphes: ['Tras el envío recibe un acuse de recibo: la prueba de que el ayuntamiento tiene su solicitud. Tiene fecha, servicio y código. Norma: reglamento municipal n.º 2024-07, artículo 3.',
        'El ayuntamiento responde en 3 días laborables (pregunta), 48 horas (aviso; 4 horas si es peligroso), 5 días laborables (trámite). Ojo: sin respuesta no significa sí.', 'Con su número de seguimiento puede añadir información o ver el estado.'] },
    ar: { resume: 'تقدّم طلبك على تيرا نوفا وتجيبك البلدية.', qui: 'كل السكان، بحساب أو بدونه.', quoi: 'سؤال أو بلاغ أو إجراء.',
      quand: 'الرد خلال 3 أيام عمل للسؤال، 48 ساعة للبلاغ (4 ساعات إذا كان خطيراً)، 5 أيام عمل للإجراء.', combien: 'مجاناً.', documents: 'حسب الإجراء. تظهر القائمة قبل البدء.',
      paragraphes: ['بعد الإرسال يصلك إشعار استلام: دليل على أن البلدية تلقت طلبك. فيه تاريخ واسم الخدمة ورمز. القاعدة: النظام البلدي رقم 2024-07، المادة 3.',
        'تجيب البلدية خلال 3 أيام عمل للسؤال، و48 ساعة للبلاغ (4 ساعات إذا كان خطيراً)، و5 أيام عمل للإجراء. انتبه: عدم الرد لا يعني الموافقة.', 'برقم المتابعة يمكنك إضافة معلومات أو معرفة حالة طلبك.'] } });

ajouter('page:droits', { fr: 'Vos droits face à l’administration', en: 'Your rights with the administration', es: 'Sus derechos ante la administración', ar: 'حقوقك أمام الإدارة' },
  { fr: ['Conformément à la charte municipale des droits des usagers n° 2023-02, toute décision défavorable prise par un service municipal est motivée par écrit et mentionne les voies et délais de recours.',
    'L’usager dispose d’un délai de 2 mois à compter de la notification de la décision pour former un recours gracieux auprès du maire. Le recours est gratuit et peut être déposé en ligne ou à l’accueil de l’hôtel de ville.',
    'Toute personne peut se faire accompagner par la personne de son choix ou par une association partenaire dans ses démarches.'],
    en: ['Under the municipal charter of user rights no. 2023-02, any unfavourable decision taken by a city service is explained in writing and states how and when to appeal.',
      'Users have 2 months from the notification of the decision to file an informal appeal with the mayor. The appeal is free and can be filed online or at the city hall reception.', 'Anyone may be accompanied by a person of their choice or by a partner association in their procedures.'],
    es: ['Conforme a la carta municipal de derechos de los usuarios n.º 2023-02, toda decisión desfavorable de un servicio municipal se motiva por escrito e indica las vías y plazos de recurso.',
      'El usuario dispone de 2 meses desde la notificación para presentar un recurso ante el alcalde. El recurso es gratuito y puede presentarse en línea o en la recepción del ayuntamiento.', 'Toda persona puede hacerse acompañar por quien elija o por una asociación colaboradora.'],
    ar: ['وفق الميثاق البلدي لحقوق المرتفقين رقم 2023-02، كل قرار غير مواتٍ تتخذه خدمة بلدية يُعلَّل كتابياً ويذكر طرق الطعن ومهله.',
      'للمرتفق مهلة شهرين (2) من تاريخ تبليغ القرار لتقديم طعن ودّي لدى رئيس البلدية. الطعن مجاني ويمكن تقديمه عبر الإنترنت أو في استقبال دار البلدية.', 'يمكن لأي شخص أن يرافقه من يختار أو جمعية شريكة في إجراءاته.'] },
  { fr: { resume: 'Si la mairie dit non, elle doit expliquer pourquoi. Vous pouvez contester.', qui: 'Toute personne qui reçoit une décision de la mairie.', quoi: 'Demander à la mairie de revoir sa décision : c’est un recours.',
      quand: 'Vous avez 2 mois après avoir reçu la décision.', combien: 'C’est gratuit.', documents: 'La décision reçue. Une lettre qui explique pourquoi vous n’êtes pas d’accord.', ou: 'En ligne ou à l’accueil de l’hôtel de ville.',
      paragraphes: ['Si la mairie refuse, elle doit l’écrire et dire pourquoi. Elle doit aussi dire comment contester et en combien de temps. Règle : charte municipale n° 2023-02.',
        'Pour contester, vous écrivez au maire : c’est un recours. Vous avez 2 mois après la décision. C’est gratuit. En ligne ou à l’accueil de l’hôtel de ville.', 'Vous pouvez venir avec quelqu’un : un proche ou une association.'] },
    en: { resume: 'If city hall says no, it must explain why. You can challenge it.', qui: 'Anyone who receives a decision from city hall.', quoi: 'Ask city hall to review its decision: an appeal.', quand: 'You have 2 months after receiving the decision.',
      combien: 'It is free.', documents: 'The decision you received. A letter saying why you disagree.', ou: 'Online or at the city hall reception.',
      paragraphes: ['If city hall refuses, it must write it down and say why, and explain how and when to challenge it. Rule: municipal charter no. 2023-02.', 'To challenge, write to the mayor: this is an appeal. You have 2 months. It is free. Online or at city hall reception.', 'You can bring someone with you: a relative or an association.'] },
    es: { resume: 'Si el ayuntamiento dice que no, debe explicar por qué. Puede recurrir.', qui: 'Toda persona que recibe una decisión del ayuntamiento.', quoi: 'Pedir que revisen la decisión: es un recurso.', quand: 'Tiene 2 meses tras recibir la decisión.',
      combien: 'Es gratis.', documents: 'La decisión recibida. Una carta que explique por qué no está de acuerdo.', ou: 'En línea o en la recepción del ayuntamiento.',
      paragraphes: ['Si el ayuntamiento rechaza, debe escribirlo y decir por qué, y cómo y cuándo recurrir. Norma: carta municipal n.º 2023-02.', 'Para recurrir, escriba al alcalde. Tiene 2 meses. Es gratis. En línea o en la recepción.', 'Puede ir acompañado: un familiar o una asociación.'] },
    ar: { resume: 'إذا رفضت البلدية فعليها أن تشرح السبب. يمكنك الاعتراض.', qui: 'كل شخص يتلقى قراراً من البلدية.', quoi: 'أن تطلب من البلدية مراجعة قرارها: هذا هو الطعن.', quand: 'لديك شهران (2) بعد استلام القرار.',
      combien: 'مجاناً.', documents: 'القرار الذي استلمته ورسالة تشرح سبب اعتراضك.', ou: 'عبر الإنترنت أو في استقبال دار البلدية.',
      paragraphes: ['إذا رفضت البلدية فعليها أن تكتب ذلك وتذكر السبب وكيف ومتى تعترض. القاعدة: الميثاق البلدي رقم 2023-02.', 'للاعتراض اكتب إلى رئيس البلدية. لديك شهران (2). مجاناً. عبر الإنترنت أو في الاستقبال.', 'يمكنك أن تأتي مع شخص: قريب أو جمعية.'] } });

ajouter('page:donnees', { fr: 'Vos données personnelles', en: 'Your personal data', es: 'Sus datos personales', ar: 'بياناتك الشخصية' },
  { fr: ['Les données personnelles recueillies par la plateforme Terra Nova sont traitées par la mairie pour la seule gestion des demandes, rendez-vous et alertes des habitants (délibération n° 2024-031). Elles ne sont ni vendues ni cédées à des tiers.',
    'Les demandes et leurs échanges sont conservés 3 ans après leur clôture, les journaux de connexion 12 mois. Les téléphones et dossiers administratifs sont chiffrés.',
    'Chaque habitant dispose d’un droit d’accès, de rectification et d’effacement de ses données. Il peut exercer ce droit depuis la page « Vos données » ; une réponse lui est apportée dans un délai de 30 jours.'],
    en: ['Personal data collected by the Terra Nova platform is processed by city hall only to manage residents’ requests, appointments and alerts (deliberation no. 2024-031). It is never sold or given to third parties.',
      'Requests and their exchanges are kept 3 years after closure, sign-in logs 12 months. Phone numbers and administrative files are encrypted.',
      'Every resident has the right to access, correct and erase their data, from the “Your data” page; an answer is given within 30 days.'],
    es: ['Los datos personales recogidos por la plataforma Terra Nova los trata el ayuntamiento solo para gestionar solicitudes, citas y alertas (deliberación n.º 2024-031). Nunca se venden ni se ceden a terceros.',
      'Las solicitudes y sus intercambios se conservan 3 años tras su cierre, los registros de conexión 12 meses. Teléfonos y expedientes están cifrados.',
      'Cada habitante tiene derecho de acceso, rectificación y supresión desde la página «Sus datos»; se le responde en un plazo de 30 días.'],
    ar: ['تعالج البلدية البيانات الشخصية التي تجمعها منصة تيرا نوفا فقط لإدارة طلبات السكان ومواعيدهم وتنبيهاتهم (المداولة رقم 2024-031). لا تُباع ولا تُعطى لأي جهة.',
      'تُحفظ الطلبات ومراسلاتها 3 سنوات بعد إغلاقها، وسجلات الدخول 12 شهراً. الهواتف والملفات الإدارية مشفرة.',
      'لكل ساكن حق الاطلاع على بياناته وتصحيحها ومحوها من صفحة «بياناتك»؛ ويصله الرد خلال 30 يوماً.'] },
  { fr: { resume: 'La mairie garde quelques informations sur vous pour traiter vos demandes. Elle ne les vend pas.', qui: 'Tous les habitants qui utilisent Terra Nova.', quoi: 'Vos demandes, rendez-vous, alertes. Votre téléphone et vos dossiers sont protégés (chiffrés).',
      quand: 'Vos demandes sont gardées 3 ans après la fin. Les connexions : 12 mois. Réponse à vos questions en 30 jours.', combien: 'C’est gratuit.', documents: 'Aucun : tout se fait depuis la page « Vos données ».',
      paragraphes: ['La mairie utilise vos informations seulement pour vos demandes, vos rendez-vous et les alertes. Elle ne les vend pas et ne les donne à personne. Règle : délibération n° 2024-031.',
        'Vos demandes sont gardées 3 ans après la fin. Les traces de connexion sont gardées 12 mois. Votre téléphone et vos dossiers sont protégés par un code secret (chiffrés).',
        'Vous pouvez voir, corriger ou effacer vos informations, depuis la page « Vos données ». La mairie répond en 30 jours.'] },
    en: { resume: 'City hall keeps some information about you to handle your requests. It does not sell it.', qui: 'All residents using Terra Nova.', quoi: 'Your requests, appointments, alerts. Your phone and files are protected (encrypted).',
      quand: 'Requests are kept 3 years after they end. Sign-ins: 12 months. Answer to your questions within 30 days.', combien: 'It is free.', documents: 'None: everything is done from the “Your data” page.',
      paragraphes: ['City hall uses your information only for your requests, appointments and alerts. It never sells or gives it away. Rule: deliberation no. 2024-031.', 'Requests are kept 3 years after they end; sign-in traces 12 months. Your phone and files are protected (encrypted).', 'You can see, correct or erase your information from the “Your data” page. City hall answers within 30 days.'] },
    es: { resume: 'El ayuntamiento guarda algunos datos suyos para tramitar sus solicitudes. No los vende.', qui: 'Todos los habitantes que usan Terra Nova.', quoi: 'Sus solicitudes, citas, alertas. Su teléfono y expedientes están protegidos (cifrados).',
      quand: 'Las solicitudes se guardan 3 años tras su fin. Conexiones: 12 meses. Respuesta en 30 días.', combien: 'Es gratis.', documents: 'Ninguno: todo desde la página «Sus datos».',
      paragraphes: ['El ayuntamiento usa sus datos solo para solicitudes, citas y alertas. No los vende ni los cede. Norma: deliberación n.º 2024-031.', 'Las solicitudes se guardan 3 años; las conexiones 12 meses. Teléfono y expedientes cifrados.', 'Puede ver, corregir o borrar sus datos desde «Sus datos». Respuesta en 30 días.'] },
    ar: { resume: 'تحتفظ البلدية ببعض معلوماتك لمعالجة طلباتك. ولا تبيعها.', qui: 'كل السكان الذين يستعملون تيرا نوفا.', quoi: 'طلباتك ومواعيدك وتنبيهاتك. هاتفك وملفاتك محمية (مشفرة).',
      quand: 'تُحفظ الطلبات 3 سنوات بعد انتهائها، والدخول 12 شهراً. الرد على أسئلتك خلال 30 يوماً.', combien: 'مجاناً.', documents: 'لا شيء: كل شيء من صفحة «بياناتك».',
      paragraphes: ['تستعمل البلدية معلوماتك فقط لطلباتك ومواعيدك والتنبيهات. لا تبيعها ولا تعطيها لأحد. القاعدة: المداولة رقم 2024-031.', 'تُحفظ الطلبات 3 سنوات، وآثار الدخول 12 شهراً. هاتفك وملفاتك مشفرة.', 'يمكنك رؤية معلوماتك أو تصحيحها أو محوها من صفحة «بياناتك». تجيب البلدية خلال 30 يوماً.'] } });

/* Services (texte officiel court + version claire, français ; quatre langues pour état civil et aide sociale) */
ajouter('service:etat-civil', { fr: 'État civil', en: 'Civil registry', es: 'Registro civil', ar: 'الحالة المدنية' },
  { fr: ['Le service de l’état civil délivre les copies et extraits d’actes de naissance, de mariage et de décès, enregistre les changements d’adresse et instruit les demandes de titres d’identité (règlement municipal n° 2024-07, article 5).',
    'L’accueil du public a lieu à l’hôtel de ville, niveau 1, du lundi au vendredi de 8h à 17h et le jeudi jusqu’à 19h. La délivrance d’une copie d’acte est gratuite ; le délai de traitement est de 5 jours ouvrés.'],
    en: ['The civil registry issues copies and extracts of birth, marriage and death certificates, records changes of address and handles ID applications (municipal regulation no. 2024-07, article 5).',
      'The public desk is at city hall, level 1, Monday to Friday from 8h to 17h and Thursday until 19h. A copy of a certificate is free; processing takes 5 working days.'],
    es: ['El registro civil expide copias y extractos de actas de nacimiento, matrimonio y defunción, registra los cambios de domicilio y tramita los documentos de identidad (reglamento municipal n.º 2024-07, artículo 5).',
      'Atención al público en el ayuntamiento, nivel 1, de lunes a viernes de 8h a 17h y el jueves hasta las 19h. La copia de un acta es gratuita; el plazo es de 5 días laborables.'],
    ar: ['تسلّم مصلحة الحالة المدنية نسخ ومستخرجات شهادات الميلاد والزواج والوفاة، وتسجل تغييرات العنوان، وتعالج طلبات وثائق الهوية (النظام البلدي رقم 2024-07، المادة 5).',
      'الاستقبال في دار البلدية، الطابق 1، من الاثنين إلى الجمعة من 8h إلى 17h، والخميس حتى 19h. نسخة الشهادة مجانية؛ مدة المعالجة 5 أيام عمل.'] },
  { fr: { resume: 'Ce service s’occupe de vos papiers officiels : naissance, mariage, décès, adresse, carte d’identité.', qui: 'Tous les habitants.', quoi: 'Demander un acte (naissance, mariage, décès), changer d’adresse, faire sa carte d’identité.',
      quand: 'Hôtel de ville, niveau 1 : du lundi au vendredi, de 8h à 17h. Le jeudi jusqu’à 19h. Réponse en 5 jours ouvrés.', combien: 'Une copie d’acte est gratuite.', documents: 'Votre pièce d’identité. Les autres documents dépendent de la démarche.',
      paragraphes: ['Ce service donne vos papiers officiels : acte de naissance, de mariage ou de décès. Il note votre nouvelle adresse. Il prépare votre carte d’identité. Règle : règlement municipal n° 2024-07, article 5.',
        'Venez à l’hôtel de ville, niveau 1, du lundi au vendredi de 8h à 17h (le jeudi jusqu’à 19h). Une copie d’acte est gratuite. Réponse en 5 jours ouvrés.'] },
    en: { resume: 'This service handles your official papers: birth, marriage, death, address, ID card.', qui: 'All residents.', quoi: 'Ask for a certificate, change your address, get your ID card.',
      quand: 'City hall, level 1: Monday to Friday, 8h to 17h. Thursday until 19h. Answer within 5 working days.', combien: 'A copy of a certificate is free.', documents: 'Your ID. Other documents depend on the procedure.',
      paragraphes: ['This service gives your official papers: birth, marriage or death certificate. It records your new address and prepares your ID card. Rule: municipal regulation no. 2024-07, article 5.', 'Come to city hall, level 1, Monday to Friday 8h to 17h (Thursday until 19h). A copy is free. Answer within 5 working days.'] },
    es: { resume: 'Este servicio se ocupa de sus papeles oficiales: nacimiento, matrimonio, defunción, domicilio, documento de identidad.', qui: 'Todos los habitantes.', quoi: 'Pedir un acta, cambiar de domicilio, hacer su documento de identidad.',
      quand: 'Ayuntamiento, nivel 1: de lunes a viernes, de 8h a 17h. Jueves hasta las 19h. Respuesta en 5 días laborables.', combien: 'La copia de un acta es gratuita.', documents: 'Su documento de identidad. Lo demás depende del trámite.',
      paragraphes: ['Este servicio entrega sus papeles oficiales y registra su nuevo domicilio. Norma: reglamento municipal n.º 2024-07, artículo 5.', 'Venga al ayuntamiento, nivel 1, de lunes a viernes de 8h a 17h (jueves hasta las 19h). La copia es gratuita. Respuesta en 5 días laborables.'] },
    ar: { resume: 'هذه المصلحة تهتم بأوراقك الرسمية: الميلاد، الزواج، الوفاة، العنوان، بطاقة الهوية.', qui: 'كل السكان.', quoi: 'طلب شهادة، تغيير العنوان، إعداد بطاقة الهوية.',
      quand: 'دار البلدية، الطابق 1: من الاثنين إلى الجمعة من 8h إلى 17h، والخميس حتى 19h. الرد خلال 5 أيام عمل.', combien: 'نسخة الشهادة مجانية.', documents: 'وثيقة هويتك. الباقي حسب الإجراء.',
      paragraphes: ['تعطيك هذه المصلحة أوراقك الرسمية وتسجل عنوانك الجديد. القاعدة: النظام البلدي رقم 2024-07، المادة 5.', 'تعال إلى دار البلدية، الطابق 1، من الاثنين إلى الجمعة من 8h إلى 17h (الخميس حتى 19h). النسخة مجانية. الرد خلال 5 أيام عمل.'] } });

ajouter('service:social', { fr: 'Aide sociale', en: 'Social support', es: 'Ayuda social', ar: 'المساعدة الاجتماعية' },
  { fr: ['Le centre social instruit les demandes d’aide financière d’urgence dans la limite de 150 € par foyer et par trimestre, sur présentation des justificatifs de ressources du foyer (délibération n° 2025-012, article 2).',
    'Toute demande complète reçoit une réponse dans un délai de 10 jours ouvrés. Le centre social est ouvert du lundi au vendredi de 9h à 17h, place des Pionniers ; il est joignable au 01 55 00 14 10.'],
    en: ['The social centre handles emergency financial aid requests up to 150 € per household per quarter, on presentation of the household’s proof of resources (deliberation no. 2025-012, article 2).',
      'Every complete request is answered within 10 working days. The social centre is open Monday to Friday from 9h to 17h, Pioneers square; phone 01 55 00 14 10.'],
    es: ['El centro social tramita ayudas económicas de urgencia de hasta 150 € por hogar y trimestre, presentando los justificantes de ingresos del hogar (deliberación n.º 2025-012, artículo 2).',
      'Toda solicitud completa recibe respuesta en 10 días laborables. Abierto de lunes a viernes de 9h a 17h, plaza de los Pioneros; teléfono 01 55 00 14 10.'],
    ar: ['يعالج المركز الاجتماعي طلبات المساعدة المالية العاجلة في حدود 150 € لكل أسرة في كل ثلاثة أشهر، مع تقديم إثباتات موارد الأسرة (المداولة رقم 2025-012، المادة 2).',
      'كل طلب كامل يتلقى رداً خلال 10 أيام عمل. المركز مفتوح من الاثنين إلى الجمعة من 9h إلى 17h، ساحة الرواد؛ الهاتف 01 55 00 14 10.'] },
  { fr: { resume: 'Si vous avez du mal à payer l’essentiel, le centre social peut vous aider.', qui: 'Les familles et les personnes seules qui ont peu d’argent.', quoi: 'Une aide en argent, en urgence. Un rendez-vous avec un travailleur social.',
      quand: 'Réponse en 10 jours ouvrés. Ouvert du lundi au vendredi, de 9h à 17h.', combien: 'Jusqu’à 150 € par foyer, tous les 3 mois.', documents: 'Les papiers qui montrent vos ressources (ce que vous gagnez).', ou: 'Place des Pionniers. Téléphone : 01 55 00 14 10.',
      paragraphes: ['Le centre social peut vous donner de l’argent en urgence : jusqu’à 150 € par foyer, tous les 3 mois. Il faut montrer ce que vous gagnez (justificatifs de ressources). Règle : délibération n° 2025-012, article 2.',
        'Si votre dossier est complet, la réponse arrive en 10 jours ouvrés. Le centre est ouvert du lundi au vendredi, de 9h à 17h, place des Pionniers. Téléphone : 01 55 00 14 10.'] },
    en: { resume: 'If you struggle to pay for essentials, the social centre can help.', qui: 'Families and single people with little money.', quoi: 'Emergency money. An appointment with a social worker.',
      quand: 'Answer within 10 working days. Open Monday to Friday, 9h to 17h.', combien: 'Up to 150 € per household, every 3 months.', documents: 'Papers showing your resources (what you earn).', ou: 'Pioneers square. Phone: 01 55 00 14 10.',
      paragraphes: ['The social centre can give you emergency money: up to 150 € per household every 3 months. Show what you earn (proof of resources). Rule: deliberation no. 2025-012, article 2.', 'If your file is complete, you get an answer within 10 working days. Open Monday to Friday 9h to 17h, Pioneers square. Phone: 01 55 00 14 10.'] },
    es: { resume: 'Si le cuesta pagar lo básico, el centro social puede ayudarle.', qui: 'Familias y personas solas con pocos ingresos.', quoi: 'Dinero de urgencia. Una cita con un trabajador social.',
      quand: 'Respuesta en 10 días laborables. Abierto de lunes a viernes, de 9h a 17h.', combien: 'Hasta 150 € por hogar, cada 3 meses.', documents: 'Papeles que muestren sus ingresos.', ou: 'Plaza de los Pioneros. Teléfono: 01 55 00 14 10.',
      paragraphes: ['El centro social puede darle dinero de urgencia: hasta 150 € por hogar cada 3 meses. Muestre sus ingresos. Norma: deliberación n.º 2025-012, artículo 2.', 'Con el expediente completo, respuesta en 10 días laborables. De lunes a viernes de 9h a 17h, plaza de los Pioneros. Teléfono: 01 55 00 14 10.'] },
    ar: { resume: 'إذا كنت تجد صعوبة في دفع الضروريات، يمكن للمركز الاجتماعي مساعدتك.', qui: 'الأسر والأشخاص الذين لديهم دخل قليل.', quoi: 'مال عاجل. موعد مع عامل اجتماعي.',
      quand: 'الرد خلال 10 أيام عمل. مفتوح من الاثنين إلى الجمعة من 9h إلى 17h.', combien: 'حتى 150 € لكل أسرة كل 3 أشهر.', documents: 'أوراق تبيّن مواردك (ما تكسبه).', ou: 'ساحة الرواد. الهاتف: 01 55 00 14 10.',
      paragraphes: ['يمكن للمركز أن يعطيك مالاً عاجلاً: حتى 150 € لكل أسرة كل 3 أشهر. أظهر ما تكسبه. القاعدة: المداولة رقم 2025-012، المادة 2.', 'إذا كان ملفك كاملاً يصلك الرد خلال 10 أيام عمل. من الاثنين إلى الجمعة من 9h إلى 17h، ساحة الرواد. الهاتف: 01 55 00 14 10.'] } });

const svcFr = (id, titre, off, cl) => ajouter('service:' + id, { fr: titre }, { fr: off }, { fr: cl });
svcFr('sante', 'Santé & dispensaires',
  ['Le dispensaire central assure les consultations de médecine générale sur rendez-vous du lundi au samedi de 8h à 19h et un accueil des urgences 24 heures sur 24 (arrêté municipal n° 2024-019). Les vaccinations du calendrier obligatoire sont gratuites.',
    'En cas d’urgence vitale, composer le 15 ou le 112 ; le dispensaire ne se substitue pas aux services de secours.'],
  { resume: 'Le dispensaire vous soigne. Pour une urgence grave, appelez d’abord le 15 ou le 112.', qui: 'Tous les habitants.', quoi: 'Voir un médecin, se faire vacciner, être soigné en urgence.',
    quand: 'Consultations du lundi au samedi, de 8h à 19h, sur rendez-vous. Urgences : 24 heures sur 24.', combien: 'Les vaccins obligatoires sont gratuits.', documents: 'Votre pièce d’identité et votre carte de santé.',
    paragraphes: ['Au dispensaire central, vous voyez un médecin sur rendez-vous, du lundi au samedi de 8h à 19h. Les urgences sont ouvertes 24 heures sur 24. Les vaccins obligatoires sont gratuits. Règle : arrêté municipal n° 2024-019.',
      'Si une vie est en danger, appelez le 15 ou le 112. Le dispensaire ne remplace pas les secours.'] });
svcFr('logement', 'Logement & habitat',
  ['Les demandes d’attribution d’un module d’habitation sont examinées par la commission d’attribution qui se réunit le premier mardi de chaque mois (règlement municipal n° 2024-07, article 11). Le dossier comprend les justificatifs de revenus et la composition du foyer.',
    'L’aide au logement est versée mensuellement ; son montant ne peut excéder 30 % du loyer. Le pôle habitat reçoit du lundi au vendredi de 9h à 16h.'],
  { resume: 'Ce service vous aide à trouver un logement et à payer votre loyer.', qui: 'Les habitants qui cherchent un logement ou qui ont du mal à payer le loyer.', quoi: 'Demander un module d’habitation. Demander une aide au loyer. Signaler des travaux à faire.',
    quand: 'Une commission décide le premier mardi de chaque mois. Pôle habitat : du lundi au vendredi, de 9h à 16h.', combien: 'L’aide au logement est payée chaque mois. Elle peut aller jusqu’à 30 % du loyer.', documents: 'Vos justificatifs de revenus et la liste des personnes du foyer.',
    paragraphes: ['Une commission étudie les demandes de logement le premier mardi de chaque mois. Il faut donner vos justificatifs de revenus et dire qui vit avec vous. Règle : règlement municipal n° 2024-07, article 11.',
      'L’aide au logement est payée chaque mois. Elle paie au maximum 30 % du loyer. Le pôle habitat est ouvert du lundi au vendredi, de 9h à 16h.'] });
svcFr('transports', 'Transports municipaux',
  ['Le réseau de navettes comporte 4 lignes (N1 à N4) exploitées de 5h à 23h avec une fréquence de 10 minutes. L’abonnement mensuel est fixé à 20 € ; un tarif réduit de 50 % est accordé aux étudiants, aux plus de 65 ans et aux foyers à faibles ressources (délibération n° 2024-044).'],
  { resume: 'Les navettes sont les bus de la ville.', qui: 'Tout le monde.', quoi: '4 lignes : N1, N2, N3, N4.', quand: 'De 5h à 23h. Une navette toutes les 10 minutes.',
    combien: 'Abonnement : 20 € par mois. Moitié prix (50 %) pour les étudiants, les plus de 65 ans et les foyers qui ont peu d’argent.', documents: 'Pour le tarif réduit : un justificatif de votre situation.',
    paragraphes: ['Il y a 4 lignes de navettes, de 5h à 23h, une toutes les 10 minutes. L’abonnement coûte 20 € par mois. C’est 50 % moins cher pour les étudiants, les plus de 65 ans et les foyers qui ont peu d’argent. Règle : délibération n° 2024-044.'] });
svcFr('eau-energie', 'Eau & énergie',
  ['Les coupures programmées sont annoncées au moins 48 heures à l’avance. Toute contestation de facture doit être adressée au service dans un délai de 2 mois suivant sa réception, accompagnée de la facture et d’un relevé de compteur (règlement du service de l’eau n° 2023-09, article 14).'],
  { resume: 'Ce service gère l’eau et l’électricité de votre module.', qui: 'Tous les habitants.', quoi: 'Raccorder un module, prévenir des coupures, répondre aux questions sur les factures.',
    quand: 'Les coupures prévues sont annoncées 48 heures avant. Pour contester une facture : 2 mois après l’avoir reçue.', combien: 'Le prix est sur votre facture.', documents: 'Pour contester : la facture et un relevé de compteur.',
    paragraphes: ['Les coupures prévues sont annoncées au moins 48 heures avant. Une facture vous semble fausse ? Écrivez au service dans les 2 mois, avec la facture et un relevé de compteur. Règle : règlement du service de l’eau n° 2023-09, article 14.'] });
svcFr('voirie', 'Voirie & éclairage',
  ['Les signalements relatifs à l’éclairage public et à la voirie sont traités dans un délai de 48 heures, ramené à 4 heures en cas de danger pour les personnes (arrêté municipal n° 2024-022). En cas de danger immédiat, composer le 112.'],
  { resume: 'Ce service répare les lampadaires, les routes et les trottoirs.', qui: 'Tout le monde peut signaler un problème.', quoi: 'Un lampadaire éteint, un trou, un trottoir abîmé.',
    quand: 'Intervention en 48 heures. En 4 heures si c’est dangereux. Danger immédiat : appelez le 112.', combien: 'C’est gratuit.', documents: 'Aucun. Une photo aide.',
    paragraphes: ['La ville répare en 48 heures. Si quelqu’un peut se blesser, c’est en 4 heures. Si le danger est immédiat, appelez le 112. Règle : arrêté municipal n° 2024-022.'] });
svcFr('education', 'École & petite enfance',
  ['Les inscriptions scolaires pour la rentrée sont reçues du 1er mars au 30 avril à la Maison de l’enfance, sur présentation du livret de famille, d’un justificatif de domicile et du carnet de santé de l’enfant (règlement municipal n° 2024-07, article 18).'],
  { resume: 'Ce service inscrit vos enfants à l’école, à la crèche et à la cantine.', qui: 'Les parents d’enfants de 3 mois à 11 ans.', quoi: 'Inscription à l’école, à la crèche, à la cantine.',
    quand: 'Inscriptions pour la rentrée : du 1er mars au 30 avril.', combien: 'L’école est gratuite. La cantine dépend de vos revenus.', documents: 'Le livret de famille, un justificatif de domicile, le carnet de santé de l’enfant.',
    paragraphes: ['Pour inscrire votre enfant à l’école, venez du 1er mars au 30 avril à la Maison de l’enfance. Apportez le livret de famille, un justificatif de domicile et le carnet de santé. Règle : règlement municipal n° 2024-07, article 18.'] });
svcFr('dechets', 'Déchets & recyclage',
  ['La collecte des ordures ménagères est quotidienne. Les encombrants sont collectés le samedi sur dépôt avant 8h devant le module, dans la limite de 3 objets par foyer (arrêté municipal n° 2024-030). Tout dépôt sauvage est passible d’une amende de 135 €.'],
  { resume: 'Ce service ramasse les poubelles et les gros objets.', qui: 'Tous les habitants.', quoi: 'Poubelles tous les jours. Gros objets (encombrants) le samedi.',
    quand: 'Poubelles : tous les jours. Encombrants : le samedi, posés devant le module avant 8h.', combien: 'Gratuit. Jeter ses déchets n’importe où coûte une amende de 135 €.', documents: 'Aucun.',
    paragraphes: ['Les poubelles sont ramassées tous les jours. Les gros objets (encombrants) sont ramassés le samedi : posez-les devant votre module avant 8h, 3 objets au maximum. Jeter ses déchets n’importe où : amende de 135 €. Règle : arrêté municipal n° 2024-030.'] });
svcFr('emploi', 'Emploi & formation',
  ['La Maison de l’emploi accompagne toute personne en recherche d’emploi : entretien d’orientation sous 15 jours après l’inscription, ateliers CV hebdomadaires et accès aux formations financées par la ville (délibération n° 2025-008).'],
  { resume: 'La Maison de l’emploi vous aide à trouver un travail ou une formation.', qui: 'Toute personne qui cherche un travail.', quoi: 'Un rendez-vous pour faire le point, de l’aide pour le CV, des formations.',
    quand: 'Premier rendez-vous dans les 15 jours après l’inscription. Ateliers CV chaque semaine.', combien: 'C’est gratuit. Certaines formations sont payées par la ville.', documents: 'Votre CV (même simple) et votre pièce d’identité.',
    paragraphes: ['Après votre inscription, vous avez un premier rendez-vous dans les 15 jours. Il y a des ateliers pour faire votre CV chaque semaine. La ville paie certaines formations. Règle : délibération n° 2025-008.'] });
svcFr('culture', 'Culture & loisirs',
  ['La médiathèque et les équipements sportifs du dôme culturel sont ouverts du mardi au dimanche de 10h à 20h. Le prêt de documents est gratuit pour les habitants inscrits, dans la limite de 5 documents pour 3 semaines.'],
  { resume: 'Livres, sport et sorties au dôme culturel.', qui: 'Tous les habitants.', quoi: 'Emprunter des livres, faire du sport, voir des spectacles.',
    quand: 'Du mardi au dimanche, de 10h à 20h.', combien: 'Le prêt est gratuit : 5 documents pour 3 semaines.', documents: 'Votre compte habitant.',
    paragraphes: ['Le dôme culturel est ouvert du mardi au dimanche, de 10h à 20h. Vous pouvez emprunter 5 documents pour 3 semaines, gratuitement.'] });
svcFr('urbanisme', 'Urbanisme',
  ['Toute extension de module ou modification de façade est soumise à autorisation préalable (règlement d’urbanisme n° 2023-15, article 7). Le dossier comprend un plan du projet ; l’administration dispose d’un délai d’instruction de 2 mois. Accueil le mardi et le jeudi de 9h à 12h, hôtel de ville, niveau 2.'],
  { resume: 'Avant d’agrandir ou de modifier votre module, il faut une autorisation.', qui: 'Les habitants qui veulent faire des travaux à l’extérieur de leur module.', quoi: 'Demander une autorisation de travaux.',
    quand: 'Réponse en 2 mois. Accueil le mardi et le jeudi, de 9h à 12h.', combien: 'La demande est gratuite.', documents: 'Un plan du projet.', ou: 'Hôtel de ville, niveau 2.',
    paragraphes: ['Vous voulez agrandir votre module ou changer sa façade ? Demandez d’abord une autorisation, avec un plan du projet. La mairie répond en 2 mois. Accueil le mardi et le jeudi de 9h à 12h, hôtel de ville, niveau 2. Règle : règlement d’urbanisme n° 2023-15, article 7.'] });

/* Démarches */
ajouter('demarche:mariage', { fr: 'Se marier à Terra Nova', en: 'Getting married in Terra Nova', es: 'Casarse en Terra Nova', ar: 'الزواج في تيرا نوفا' },
  { fr: ['Le dossier de mariage est déposé à l’état civil au moins 30 jours avant la date de la cérémonie. Il comprend la pièce d’identité de chacun des futurs époux, un justificatif de domicile et un acte de naissance de moins de 3 mois (règlement municipal n° 2024-07, article 6).',
    'La publication des bans est affichée pendant 10 jours. La célébration est gratuite.'],
    en: ['The marriage file is handed in at the civil registry at least 30 days before the ceremony. It includes each future spouse’s ID, a proof of address and a birth certificate less than 3 months old (municipal regulation no. 2024-07, article 6).', 'The banns are displayed for 10 days. The ceremony is free.'],
    es: ['El expediente de matrimonio se entrega en el registro civil al menos 30 días antes de la ceremonia. Incluye el documento de identidad de cada contrayente, un justificante de domicilio y un acta de nacimiento de menos de 3 meses (reglamento municipal n.º 2024-07, artículo 6).', 'Los edictos se publican durante 10 días. La ceremonia es gratuita.'],
    ar: ['يُودع ملف الزواج لدى الحالة المدنية قبل 30 يوماً على الأقل من الحفل. يتضمن وثيقة هوية كل من الزوجين وإثبات سكن وشهادة ميلاد لا تتجاوز 3 أشهر (النظام البلدي رقم 2024-07، المادة 6).', 'يُعلَّق الإعلان عن الزواج مدة 10 أيام. الحفل مجاني.'] },
  { fr: { resume: 'Pour vous marier, déposez votre dossier à la mairie au moins 30 jours avant.', qui: 'Les deux futurs époux.', quoi: 'Déposer le dossier de mariage à l’état civil.', quand: 'Au moins 30 jours avant le mariage. L’annonce (les bans) est affichée 10 jours.',
      combien: 'Le mariage est gratuit.', documents: 'La pièce d’identité de chacun, un justificatif de domicile, un acte de naissance de moins de 3 mois.',
      paragraphes: ['Déposez votre dossier à l’état civil au moins 30 jours avant le mariage. Il faut : la pièce d’identité de chacun, un justificatif de domicile, un acte de naissance de moins de 3 mois. Règle : règlement municipal n° 2024-07, article 6.', 'La mairie affiche l’annonce du mariage (les bans) pendant 10 jours. Le mariage est gratuit.'] },
    en: { resume: 'To get married, hand in your file at city hall at least 30 days before.', qui: 'Both future spouses.', quoi: 'Hand in the marriage file at the civil registry.', quand: 'At least 30 days before. The banns are displayed for 10 days.', combien: 'It is free.',
      documents: 'Each person’s ID, a proof of address, a birth certificate less than 3 months old.',
      paragraphes: ['Hand in your file at least 30 days before the wedding: each person’s ID, a proof of address, a birth certificate less than 3 months old. Rule: municipal regulation no. 2024-07, article 6.', 'City hall displays the announcement (banns) for 10 days. The wedding is free.'] },
    es: { resume: 'Para casarse, entregue su expediente al menos 30 días antes.', qui: 'Los dos contrayentes.', quoi: 'Entregar el expediente en el registro civil.', quand: 'Al menos 30 días antes. Los edictos se publican 10 días.', combien: 'Es gratis.',
      documents: 'El documento de identidad de cada uno, un justificante de domicilio, un acta de nacimiento de menos de 3 meses.',
      paragraphes: ['Entregue su expediente al menos 30 días antes: documentos de identidad, justificante de domicilio, acta de nacimiento de menos de 3 meses. Norma: reglamento municipal n.º 2024-07, artículo 6.', 'El ayuntamiento publica los edictos 10 días. La boda es gratuita.'] },
    ar: { resume: 'للزواج، سلّم ملفك إلى البلدية قبل 30 يوماً على الأقل.', qui: 'الزوجان.', quoi: 'إيداع ملف الزواج لدى الحالة المدنية.', quand: 'قبل 30 يوماً على الأقل. يُعلَّق الإعلان 10 أيام.', combien: 'مجاناً.',
      documents: 'وثيقة هوية كل منكما، إثبات سكن، شهادة ميلاد لا تتجاوز 3 أشهر.',
      paragraphes: ['سلّم ملفك قبل 30 يوماً على الأقل: وثائق الهوية، إثبات السكن، شهادة ميلاد لا تتجاوز 3 أشهر. القاعدة: النظام البلدي رقم 2024-07، المادة 6.', 'تعلّق البلدية الإعلان مدة 10 أيام. الزواج مجاني.'] } });

ajouter('demarche:aide', { fr: 'Aide d’urgence', en: 'Emergency aid', es: 'Ayuda de urgencia', ar: 'المساعدة العاجلة' },
  { fr: ['L’aide financière d’urgence est accordée après examen de la situation du foyer, dans la limite de 150 € par trimestre (délibération n° 2025-012, article 2). La demande est accompagnée des justificatifs de ressources et d’une pièce d’identité.', 'La décision est notifiée dans un délai de 10 jours ouvrés.'],
    en: ['Emergency financial aid is granted after reviewing the household situation, up to 150 € per quarter (deliberation no. 2025-012, article 2). The request comes with proof of resources and an ID.', 'The decision is notified within 10 working days.'],
    es: ['La ayuda económica de urgencia se concede tras estudiar la situación del hogar, hasta 150 € por trimestre (deliberación n.º 2025-012, artículo 2). Se presenta con justificantes de ingresos y documento de identidad.', 'La decisión se notifica en 10 días laborables.'],
    ar: ['تُمنح المساعدة المالية العاجلة بعد دراسة وضع الأسرة، في حدود 150 € كل ثلاثة أشهر (المداولة رقم 2025-012، المادة 2). يُرفق الطلب بإثباتات الموارد ووثيقة هوية.', 'يُبلَّغ القرار خلال 10 أيام عمل.'] },
  { fr: { resume: 'Vous n’avez plus assez d’argent pour l’essentiel ? Demandez une aide d’urgence.', qui: 'Les foyers en difficulté.', quoi: 'Une aide en argent.', quand: 'Réponse en 10 jours ouvrés.', combien: 'Jusqu’à 150 € tous les 3 mois.', documents: 'Vos justificatifs de ressources et votre pièce d’identité.',
      paragraphes: ['La mairie regarde votre situation. Elle peut vous donner jusqu’à 150 € tous les 3 mois. Apportez vos justificatifs de ressources et votre pièce d’identité. Règle : délibération n° 2025-012, article 2.', 'Vous avez la réponse en 10 jours ouvrés.'] },
    en: { resume: 'Not enough money for essentials? Ask for emergency aid.', qui: 'Households in difficulty.', quoi: 'Money aid.', quand: 'Answer within 10 working days.', combien: 'Up to 150 € every 3 months.', documents: 'Your proof of resources and your ID.',
      paragraphes: ['City hall looks at your situation and can give up to 150 € every 3 months. Bring proof of resources and ID. Rule: deliberation no. 2025-012, article 2.', 'You get the answer within 10 working days.'] },
    es: { resume: '¿No le alcanza para lo básico? Pida una ayuda de urgencia.', qui: 'Hogares en dificultad.', quoi: 'Una ayuda económica.', quand: 'Respuesta en 10 días laborables.', combien: 'Hasta 150 € cada 3 meses.', documents: 'Justificantes de ingresos y documento de identidad.',
      paragraphes: ['El ayuntamiento estudia su situación y puede darle hasta 150 € cada 3 meses. Traiga justificantes e identidad. Norma: deliberación n.º 2025-012, artículo 2.', 'Respuesta en 10 días laborables.'] },
    ar: { resume: 'ليس لديك ما يكفي للضروريات؟ اطلب مساعدة عاجلة.', qui: 'الأسر في صعوبة.', quoi: 'مساعدة مالية.', quand: 'الرد خلال 10 أيام عمل.', combien: 'حتى 150 € كل 3 أشهر.', documents: 'إثباتات مواردك ووثيقة هويتك.',
      paragraphes: ['تدرس البلدية وضعك ويمكن أن تعطيك حتى 150 € كل 3 أشهر. أحضر إثباتات الموارد والهوية. القاعدة: المداولة رقم 2025-012، المادة 2.', 'يصلك الرد خلال 10 أيام عمل.'] } });

const demFr = (id, titre, off, cl) => ajouter('demarche:' + id, { fr: titre }, { fr: off }, { fr: cl });
demFr('naissance', 'Acte de naissance',
  ['La déclaration de naissance est obligatoire dans les 5 jours qui suivent l’accouchement, sur présentation d’une pièce d’identité du déclarant et du livret de famille s’il existe (règlement municipal n° 2024-07, article 4). La copie intégrale ou l’extrait d’acte est délivré gratuitement sous 5 jours ouvrés.'],
  { resume: 'Déclarez la naissance de votre bébé dans les 5 jours. Ensuite, vous pouvez demander une copie de l’acte.', qui: 'Un parent, ou la personne présente à la naissance.', quoi: 'Déclarer la naissance. Demander une copie de l’acte de naissance.',
    quand: 'Dans les 5 jours après la naissance. Copie envoyée en 5 jours ouvrés.', combien: 'C’est gratuit.', documents: 'Votre pièce d’identité. Le livret de famille si vous en avez un.',
    paragraphes: ['Vous devez déclarer la naissance dans les 5 jours. Apportez votre pièce d’identité et le livret de famille si vous en avez un. La copie de l’acte est gratuite et arrive en 5 jours ouvrés. Règle : règlement municipal n° 2024-07, article 4.'] });
demFr('adresse', 'Changement d’adresse',
  ['Tout changement de module d’habitation est déclaré à l’état civil dans un délai d’un mois, sur présentation de l’attribution du module ou du bail et d’une pièce d’identité (règlement municipal n° 2024-07, article 8).'],
  { resume: 'Vous changez de module ? Dites-le à la mairie dans le mois.', qui: 'Toute personne qui déménage dans la ville.', quoi: 'Donner votre nouvelle adresse.', quand: 'Dans un mois après le déménagement.', combien: 'C’est gratuit.',
    documents: 'L’attribution du module ou le bail, et votre pièce d’identité.',
    paragraphes: ['Vous avez changé de module ? Dites-le à l’état civil dans un mois. Apportez l’attribution du module (ou le bail) et votre pièce d’identité. Règle : règlement municipal n° 2024-07, article 8.'] });
demFr('identite', 'Carte d’identité ou passeport',
  ['La demande de titre d’identité est déposée sur rendez-vous ; elle comprend une photo d’identité de moins de 6 mois, l’ancien titre ou une déclaration de perte, et un justificatif de domicile. Le titre est délivré dans un délai de 3 semaines. Le renouvellement d’un titre perdu ou volé coûte 25 €.'],
  { resume: 'Pour faire votre carte d’identité, prenez rendez-vous avec les bons papiers.', qui: 'Tous les habitants.', quoi: 'Faire ou refaire sa carte d’identité ou son passeport.', quand: 'Sur rendez-vous. La carte est prête en 3 semaines.',
    combien: 'Gratuit, sauf si l’ancienne carte est perdue ou volée : 25 €.', documents: 'Une photo de moins de 6 mois, l’ancienne carte (ou la déclaration de perte), un justificatif de domicile.',
    paragraphes: ['Prenez rendez-vous. Apportez une photo de moins de 6 mois, votre ancienne carte (ou la déclaration de perte) et un justificatif de domicile. La carte est prête en 3 semaines. Si elle a été perdue ou volée, cela coûte 25 €.'] });
demFr('logement', 'Aide au logement',
  ['L’aide au logement est calculée selon les ressources du foyer et ne peut excéder 30 % du loyer. La demande est accompagnée de l’avis de revenus, de l’attribution du module ou du bail et d’un relevé d’identité bancaire ; la décision intervient dans un délai de 2 mois (règlement municipal n° 2024-07, article 12).'],
  { resume: 'L’aide au logement paie une partie de votre loyer.', qui: 'Les foyers qui ont peu de revenus.', quoi: 'Une aide chaque mois pour le loyer.', quand: 'Réponse en 2 mois.', combien: 'Au maximum 30 % du loyer, selon vos revenus.',
    documents: 'Votre avis de revenus, l’attribution du module ou le bail, un relevé d’identité bancaire.',
    paragraphes: ['L’aide dépend de vos revenus. Elle paie au maximum 30 % du loyer. Donnez votre avis de revenus, l’attribution du module (ou le bail) et un relevé d’identité bancaire. Réponse en 2 mois. Règle : règlement municipal n° 2024-07, article 12.'] });
demFr('logement-demande', 'Demande de logement',
  ['La demande d’attribution d’un module d’habitation est examinée par la commission d’attribution réunie le premier mardi de chaque mois. Le dossier comprend les justificatifs de revenus, la composition du foyer et une pièce d’identité (règlement municipal n° 2024-07, article 11).'],
  { resume: 'Vous cherchez un logement ? Faites une demande : une commission décide chaque mois.', qui: 'Toute personne qui n’a pas de logement adapté.', quoi: 'Demander un module d’habitation.', quand: 'La commission se réunit le premier mardi de chaque mois.', combien: 'La demande est gratuite.',
    documents: 'Vos justificatifs de revenus, la liste des personnes du foyer, votre pièce d’identité.',
    paragraphes: ['Une commission étudie les demandes le premier mardi de chaque mois. Donnez vos justificatifs de revenus, la liste des personnes qui vivent avec vous et votre pièce d’identité. Règle : règlement municipal n° 2024-07, article 11.'] });
demFr('ecole', 'Inscription scolaire',
  ['Les inscriptions scolaires pour la rentrée sont reçues du 1er mars au 30 avril, sur présentation du livret de famille, d’un justificatif de domicile et du carnet de santé de l’enfant attestant des vaccinations obligatoires (règlement municipal n° 2024-07, article 18).'],
  { resume: 'Inscrivez votre enfant à l’école entre le 1er mars et le 30 avril.', qui: 'Les parents.', quoi: 'Inscrire un enfant à l’école.', quand: 'Du 1er mars au 30 avril, pour la rentrée.', combien: 'L’école est gratuite.',
    documents: 'Le livret de famille, un justificatif de domicile, le carnet de santé de l’enfant (avec les vaccins).',
    paragraphes: ['Inscrivez votre enfant entre le 1er mars et le 30 avril. Apportez le livret de famille, un justificatif de domicile et le carnet de santé avec les vaccins. Règle : règlement municipal n° 2024-07, article 18.'] });
demFr('travaux', 'Autorisation de travaux',
  ['Toute extension de module est soumise à autorisation préalable ; le dossier comprend un plan du projet et des photographies de l’existant. Le délai d’instruction est de 2 mois ; l’absence de réponse dans ce délai vaut refus (règlement d’urbanisme n° 2023-15, article 7).'],
  { resume: 'Avant de construire, demandez une autorisation.', qui: 'Les habitants qui veulent agrandir leur module.', quoi: 'Demander une autorisation de travaux.', quand: 'Réponse en 2 mois. Sans réponse après 2 mois, c’est non.', combien: 'La demande est gratuite.',
    documents: 'Un plan du projet et des photos de votre module.',
    paragraphes: ['Avant d’agrandir votre module, demandez une autorisation. Donnez un plan du projet et des photos. La mairie a 2 mois pour répondre. Attention : sans réponse après 2 mois, c’est un refus. Règle : règlement d’urbanisme n° 2023-15, article 7.'] });
demFr('deces', 'Déclaration de décès',
  ['Le décès est déclaré à l’état civil dans les 24 heures, sur présentation du certificat médical de décès et d’une pièce d’identité du défunt et du déclarant (règlement municipal n° 2024-07, article 9). Les copies d’acte de décès sont délivrées gratuitement.'],
  { resume: 'Quand une personne meurt, un proche le déclare à la mairie dans les 24 heures.', qui: 'Un proche, ou les pompes funèbres.', quoi: 'Déclarer le décès.', quand: 'Dans les 24 heures.', combien: 'C’est gratuit.',
    documents: 'Le certificat médical de décès, la pièce d’identité de la personne décédée et la vôtre.',
    paragraphes: ['Déclarez le décès à l’état civil dans les 24 heures. Apportez le certificat médical de décès, la pièce d’identité de la personne et la vôtre. Les copies de l’acte sont gratuites. Règle : règlement municipal n° 2024-07, article 9.'] });

module.exports = { CONTENUS: C, elementsRequis, verifier, texteClair };
