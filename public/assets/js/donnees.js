/* F51 — Vos données : explication claire, contributions des habitants, réponses du personnel. */
(function () {
  'use strict';
  const NT = window.NT;
  NT.i18n.ajouter({
    fr: {},
    en: {
      'don.titre': 'Your data, explained simply', 'don.sous': 'What Terra Nova keeps about you, why, who can see it, and how to ask us a question or raise a concern.',
      'don.sommaire': 'On this page', 'don.collecte': 'What we keep', 'don.acces': 'Who can see it', 'don.droits': 'Your rights', 'don.question': 'Ask a question or raise a concern', 'don.mes': 'My contributions',
      'don.collecteCap': 'Data kept, the reason and how long it is kept', 'don.cDonnee': 'Data', 'don.cPourquoi': 'Why', 'don.cDuree': 'For how long',
      'don.d1': 'Your profile (name, e-mail, phone)', 'don.d1p': 'To recognise you and write to you about your requests.', 'don.d1d': 'As long as your account exists.',
      'don.d2': 'Your neighbourhood', 'don.d2p': 'To send you the alerts that concern your area.', 'don.d2d': 'As long as your account exists.',
      'don.d3': 'Your requests and reports', 'don.d3p': 'To process them and show you where they stand.', 'don.d3d': 'As long as your account exists, then deleted with it.',
      'don.d4': 'Your appointments', 'don.d4p': 'To book a slot and send you a reminder.', 'don.d4d': 'As long as your account exists.',
      'don.d5': 'Your notifications', 'don.d5p': 'To keep you informed of the progress of your requests.', 'don.d5d': 'As long as your account exists.',
      'don.d6': 'The login log', 'don.d6p': 'To detect hacking attempts and protect your account.', 'don.d6d': 'Kept for security, deleted with your account.',
      'don.jamais1a': 'Never sold', 'don.jamais1b': ': your data is not sold to anyone.', 'don.jamais2a': 'No advertising', 'don.jamais2b': ': no advertising profile is built.',
      'don.cookieA': 'A single cookie', 'don.cookieB': ', the one for your login. No audience measurement, no trackers.',
      'don.accesCap': 'Who has access to which data', 'don.aVous': 'You', 'don.aAgents': 'Municipal agents', 'don.aAdmins': 'Administrators',
      'don.r1': 'Profile and contact details', 'don.r2': 'Requests and appointments', 'don.r3': 'Notifications', 'don.r4': 'Login log',
      'don.oui': 'Yes', 'don.non': 'No', 'don.agentsRaison': 'Yes, to process your requests', 'don.audit': 'Every action by an agent or administrator is recorded in an audit log.',
      'don.dAccesA': 'See', 'don.dAccesB': 'what we keep: in', 'don.dAccesC': 'or with the download below.', 'don.votreCompte': 'your account',
      'don.dRectifA': 'Correct', 'don.dRectifB': 'inaccurate information: in', 'don.dSupprA': 'Delete', 'don.dSupprB': 'your account and your data: in',
      'don.dExportA': 'Take away', 'don.dExportB': 'your data in a readable file (JSON).',
      'don.questionD': 'Your message goes to the data protection officer. You get a tracking number and an answer within 15 days.',
      'don.sujet': 'Subject', 'don.s1': 'How my data is used', 'don.s2': 'Agents’ access to my data', 'don.s3': 'Deleting my data', 'don.s4': 'My account security', 'don.s5': 'Other',
      'don.message': 'Your message', 'don.messageAide': 'Describe your question or concern in a few sentences (10 characters minimum).',
      'don.contact': 'Your contact e-mail', 'don.contactAide': 'To send you the answer. It is used for nothing else.', 'don.envoyer': 'Send my contribution',
      'don.mesD': 'Each contribution keeps its history: you can see where it stands and the officer’s answer.',
      'don.recues': 'Contributions received', 'don.recuesD': 'Answer each resident: they are notified and your answer is recorded in the audit log.',
      'don.telecharger': 'Download my data', 'don.exportAide': 'Log in to download your data.', 'don.seConnecter': 'Log in',
      'don.sujet.donnees': 'How my data is used', 'don.sujet.agents': 'Agents’ access to my data', 'don.sujet.suppression': 'Deleting my data', 'don.sujet.securite': 'My account security', 'don.sujet.autre': 'Other',
      'don.st.recue': 'Received', 'don.st.en_cours': 'In progress', 'don.st.repondue': 'Answered',
      'don.errMessage': 'Describe your question or concern (10 characters minimum).', 'don.errEmail': 'Enter a valid e-mail address so we can answer you.',
      'don.resume1': 'One point to fix:', 'don.resumeN': '{n} points to fix:', 'don.errServeur': 'Your contribution could not be sent. Please try again.',
      'don.okTitre': 'Your contribution is registered', 'don.okNum': 'Tracking number', 'don.okDelai': 'You will get an answer within 15 days.',
      'don.okSuivi': 'You can follow it in “My contributions” below. A notification was added to your bell.', 'don.okVisiteur': 'Keep this number. We will answer at the e-mail address you gave.',
      'don.aucune': 'You have not sent any contribution yet.', 'don.aucuneRecue': 'No contribution received yet.',
      'don.reponse': 'Officer’s answer', 'don.historique': 'History', 'don.de': 'From {d}', 'don.par': 'by {p}',
      'don.rep.label': 'Your answer to the resident', 'don.rep.statut': 'New status', 'don.rep.repondue': 'Answered', 'don.rep.en_cours': 'In progress', 'don.rep.envoyer': 'Send the answer',
      'don.rep.vide': 'Write an answer before sending it.', 'don.rep.ok': 'Answer sent, the resident has been notified.', 'don.visiteur': 'Visitor', 'don.habitant': 'Resident'
    },
    es: {
      'don.titre': 'Sus datos, explicados de forma sencilla', 'don.sous': 'Lo que Terra Nova guarda sobre usted, por qué, quién puede verlo y cómo hacernos una pregunta o expresar una inquietud.',
      'don.sommaire': 'En esta página', 'don.collecte': 'Lo que guardamos', 'don.acces': 'Quién puede verlo', 'don.droits': 'Sus derechos', 'don.question': 'Hacer una pregunta o expresar una inquietud', 'don.mes': 'Mis contribuciones',
      'don.collecteCap': 'Datos conservados, motivo y duración de conservación', 'don.cDonnee': 'Dato', 'don.cPourquoi': 'Por qué', 'don.cDuree': 'Durante cuánto tiempo',
      'don.d1': 'Su perfil (nombre, correo, teléfono)', 'don.d1p': 'Para reconocerle y escribirle sobre sus trámites.', 'don.d1d': 'Mientras exista su cuenta.',
      'don.d2': 'Su barrio', 'don.d2p': 'Para enviarle las alertas que afectan a su zona.', 'don.d2d': 'Mientras exista su cuenta.',
      'don.d3': 'Sus solicitudes y avisos', 'don.d3p': 'Para tramitarlos y mostrarle en qué punto están.', 'don.d3d': 'Mientras exista su cuenta; después se borran con ella.',
      'don.d4': 'Sus citas', 'don.d4p': 'Para reservar una hora y enviarle un recordatorio.', 'don.d4d': 'Mientras exista su cuenta.',
      'don.d5': 'Sus notificaciones', 'don.d5p': 'Para mantenerle informado del avance de sus solicitudes.', 'don.d5d': 'Mientras exista su cuenta.',
      'don.d6': 'El registro de inicios de sesión', 'don.d6p': 'Para detectar intentos de pirateo y proteger su cuenta.', 'don.d6d': 'Conservado por seguridad, borrado con su cuenta.',
      'don.jamais1a': 'Nunca se venden', 'don.jamais1b': ': sus datos no se venden a nadie.', 'don.jamais2a': 'Nada de publicidad', 'don.jamais2b': ': no se crea ningún perfil publicitario.',
      'don.cookieA': 'Una sola cookie', 'don.cookieB': ', la de su inicio de sesión. Sin medición de audiencia, sin rastreadores.',
      'don.accesCap': 'Quién tiene acceso a qué datos', 'don.aVous': 'Usted', 'don.aAgents': 'Agentes municipales', 'don.aAdmins': 'Administradores',
      'don.r1': 'Perfil y datos de contacto', 'don.r2': 'Solicitudes y citas', 'don.r3': 'Notificaciones', 'don.r4': 'Registro de inicios de sesión',
      'don.oui': 'Sí', 'don.non': 'No', 'don.agentsRaison': 'Sí, para tramitar sus solicitudes', 'don.audit': 'Cada acción de un agente o de un administrador queda anotada en un registro de control.',
      'don.dAccesA': 'Ver', 'don.dAccesB': 'lo que guardamos: en', 'don.dAccesC': 'o con la descarga de abajo.', 'don.votreCompte': 'su cuenta',
      'don.dRectifA': 'Corregir', 'don.dRectifB': 'una información inexacta: en', 'don.dSupprA': 'Eliminar', 'don.dSupprB': 'su cuenta y sus datos: en',
      'don.dExportA': 'Llevarse', 'don.dExportB': 'sus datos en un archivo legible (JSON).',
      'don.questionD': 'Su mensaje se transmite al delegado de protección de datos. Recibirá un número de seguimiento y una respuesta en un plazo de 15 días.',
      'don.sujet': 'Asunto', 'don.s1': 'Uso de mis datos', 'don.s2': 'Acceso de los agentes a mis datos', 'don.s3': 'Eliminación de mis datos', 'don.s4': 'Seguridad de mi cuenta', 'don.s5': 'Otro',
      'don.message': 'Su mensaje', 'don.messageAide': 'Describa su pregunta o su inquietud en unas frases (10 caracteres como mínimo).',
      'don.contact': 'Su correo de contacto', 'don.contactAide': 'Para enviarle la respuesta. No se usa para nada más.', 'don.envoyer': 'Enviar mi contribución',
      'don.mesD': 'Cada contribución conserva su historial: puede ver en qué punto está y la respuesta del delegado.',
      'don.recues': 'Contribuciones recibidas', 'don.recuesD': 'Responda a cada vecino: se le avisa por notificación y su respuesta queda anotada en el registro de control.',
      'don.telecharger': 'Descargar mis datos', 'don.exportAide': 'Inicie sesión para descargar sus datos.', 'don.seConnecter': 'Iniciar sesión',
      'don.sujet.donnees': 'Uso de mis datos', 'don.sujet.agents': 'Acceso de los agentes a mis datos', 'don.sujet.suppression': 'Eliminación de mis datos', 'don.sujet.securite': 'Seguridad de mi cuenta', 'don.sujet.autre': 'Otro',
      'don.st.recue': 'Recibida', 'don.st.en_cours': 'En curso', 'don.st.repondue': 'Respondida',
      'don.errMessage': 'Describa su pregunta o su inquietud (10 caracteres como mínimo).', 'don.errEmail': 'Indique una dirección de correo válida para que podamos responderle.',
      'don.resume1': 'Un punto por corregir:', 'don.resumeN': '{n} puntos por corregir:', 'don.errServeur': 'No se ha podido enviar su contribución. Vuelva a intentarlo.',
      'don.okTitre': 'Su contribución se ha registrado', 'don.okNum': 'Número de seguimiento', 'don.okDelai': 'Recibirá una respuesta en un plazo de 15 días.',
      'don.okSuivi': 'Puede seguirla en «Mis contribuciones», más abajo. Se ha añadido una notificación a su campana.', 'don.okVisiteur': 'Conserve este número. Le responderemos a la dirección de correo que ha indicado.',
      'don.aucune': 'Todavía no ha enviado ninguna contribución.', 'don.aucuneRecue': 'Ninguna contribución recibida por el momento.',
      'don.reponse': 'Respuesta del delegado', 'don.historique': 'Historial', 'don.de': 'Del {d}', 'don.par': 'por {p}',
      'don.rep.label': 'Su respuesta al vecino', 'don.rep.statut': 'Nuevo estado', 'don.rep.repondue': 'Respondida', 'don.rep.en_cours': 'En curso', 'don.rep.envoyer': 'Enviar la respuesta',
      'don.rep.vide': 'Escriba una respuesta antes de enviarla.', 'don.rep.ok': 'Respuesta enviada; el vecino ha sido avisado.', 'don.visiteur': 'Visitante', 'don.habitant': 'Vecino'
    },
    ar: {
      'don.titre': 'بياناتك، مشروحة ببساطة', 'don.sous': 'ما تحتفظ به تيرا نوفا عنك، ولماذا، ومن يستطيع رؤيته، وكيف تطرح علينا سؤالاً أو تعبّر عن قلق.',
      'don.sommaire': 'في هذه الصفحة', 'don.collecte': 'ما نحتفظ به', 'don.acces': 'من يستطيع رؤيته', 'don.droits': 'حقوقك', 'don.question': 'طرح سؤال أو الإبلاغ عن قلق', 'don.mes': 'مساهماتي',
      'don.collecteCap': 'البيانات المحفوظة وسببها ومدة الاحتفاظ بها', 'don.cDonnee': 'البيان', 'don.cPourquoi': 'لماذا', 'don.cDuree': 'لأي مدة',
      'don.d1': 'ملفك الشخصي (الاسم، البريد الإلكتروني، الهاتف)', 'don.d1p': 'للتعرف عليك ومراسلتك بشأن إجراءاتك.', 'don.d1d': 'ما دام حسابك موجوداً.',
      'don.d2': 'حيّك', 'don.d2p': 'لإرسال التنبيهات التي تخص منطقتك.', 'don.d2d': 'ما دام حسابك موجوداً.',
      'don.d3': 'طلباتك وبلاغاتك', 'don.d3p': 'لمعالجتها وإطلاعك على مآلها.', 'don.d3d': 'ما دام حسابك موجوداً، ثم تُمحى معه.',
      'don.d4': 'مواعيدك', 'don.d4p': 'لحجز موعد وإرسال تذكير إليك.', 'don.d4d': 'ما دام حسابك موجوداً.',
      'don.d5': 'إشعاراتك', 'don.d5p': 'لإبقائك على اطلاع بتقدم طلباتك.', 'don.d5d': 'ما دام حسابك موجوداً.',
      'don.d6': 'سجل تسجيلات الدخول', 'don.d6p': 'لكشف محاولات الاختراق وحماية حسابك.', 'don.d6d': 'يُحفظ لأغراض الأمان، ويُمحى مع حسابك.',
      'don.jamais1a': 'لا بيع أبداً', 'don.jamais1b': ': لا تُباع بياناتك لأي أحد.', 'don.jamais2a': 'لا إعلانات أبداً', 'don.jamais2b': ': لا يُبنى أي ملف إعلاني.',
      'don.cookieA': 'ملف تعريف ارتباط واحد فقط', 'don.cookieB': '، وهو الخاص بتسجيل دخولك. لا قياس للجمهور، ولا متتبعات.',
      'don.accesCap': 'من يملك الوصول إلى أي بيانات', 'don.aVous': 'أنت', 'don.aAgents': 'الأعوان البلديون', 'don.aAdmins': 'المسؤولون',
      'don.r1': 'الملف الشخصي وبيانات الاتصال', 'don.r2': 'الطلبات والمواعيد', 'don.r3': 'الإشعارات', 'don.r4': 'سجل تسجيلات الدخول',
      'don.oui': 'نعم', 'don.non': 'لا', 'don.agentsRaison': 'نعم، لمعالجة طلباتك', 'don.audit': 'كل إجراء يقوم به عون أو مسؤول يُدوَّن في سجل رقابة.',
      'don.dAccesA': 'الاطلاع على', 'don.dAccesB': 'ما نحتفظ به: في', 'don.dAccesC': 'أو عبر التنزيل أدناه.', 'don.votreCompte': 'حسابك',
      'don.dRectifA': 'تصحيح', 'don.dRectifB': 'معلومة غير دقيقة: في', 'don.dSupprA': 'حذف', 'don.dSupprB': 'حسابك وبياناتك: في',
      'don.dExportA': 'أخذ', 'don.dExportB': 'بياناتك في ملف مقروء (JSON).',
      'don.questionD': 'تُحال رسالتك إلى مندوب حماية البيانات. تتلقى رقم متابعة ورداً في غضون 15 يوماً.',
      'don.sujet': 'الموضوع', 'don.s1': 'استخدام بياناتي', 'don.s2': 'وصول الأعوان إلى بياناتي', 'don.s3': 'حذف بياناتي', 'don.s4': 'أمان حسابي', 'don.s5': 'أخرى',
      'don.message': 'رسالتك', 'don.messageAide': 'صف سؤالك أو قلقك في بضع جمل (10 أحرف على الأقل).',
      'don.contact': 'بريدك الإلكتروني للتواصل', 'don.contactAide': 'لإرسال الرد إليك. لا يُستخدم لأي غرض آخر.', 'don.envoyer': 'إرسال مساهمتي',
      'don.mesD': 'تحتفظ كل مساهمة بسجلها: ترى أين وصلت ورد المندوب عليها.',
      'don.recues': 'المساهمات الواردة', 'don.recuesD': 'رد على كل ساكن: يُبلَّغ بإشعار ويُدوَّن ردك في سجل الرقابة.',
      'don.telecharger': 'تنزيل بياناتي', 'don.exportAide': 'سجّل الدخول لتنزيل بياناتك.', 'don.seConnecter': 'تسجيل الدخول',
      'don.sujet.donnees': 'استخدام بياناتي', 'don.sujet.agents': 'وصول الأعوان إلى بياناتي', 'don.sujet.suppression': 'حذف بياناتي', 'don.sujet.securite': 'أمان حسابي', 'don.sujet.autre': 'أخرى',
      'don.st.recue': 'مستلمة', 'don.st.en_cours': 'قيد المعالجة', 'don.st.repondue': 'تم الرد',
      'don.errMessage': 'صف سؤالك أو قلقك (10 أحرف على الأقل).', 'don.errEmail': 'أدخل عنوان بريد إلكتروني صالحاً حتى نتمكن من الرد عليك.',
      'don.resume1': 'نقطة واحدة يجب تصحيحها:', 'don.resumeN': '{n} نقاط يجب تصحيحها:', 'don.errServeur': 'تعذر إرسال مساهمتك. حاول مجدداً.',
      'don.okTitre': 'تم تسجيل مساهمتك', 'don.okNum': 'رقم المتابعة', 'don.okDelai': 'ستتلقى رداً في غضون 15 يوماً.',
      'don.okSuivi': 'يمكنك متابعتها في «مساهماتي» أدناه. أُضيف إشعار إلى جرسك.', 'don.okVisiteur': 'احتفظ بهذا الرقم. سنرد عليك على عنوان البريد الإلكتروني الذي قدمته.',
      'don.aucune': 'لم ترسل أي مساهمة بعد.', 'don.aucuneRecue': 'لا توجد مساهمة واردة حالياً.',
      'don.reponse': 'رد المندوب', 'don.historique': 'السجل', 'don.de': 'بتاريخ {d}', 'don.par': 'بواسطة {p}',
      'don.rep.label': 'ردك على الساكن', 'don.rep.statut': 'الحالة الجديدة', 'don.rep.repondue': 'تم الرد', 'don.rep.en_cours': 'قيد المعالجة', 'don.rep.envoyer': 'إرسال الرد',
      'don.rep.vide': 'اكتب رداً قبل إرساله.', 'don.rep.ok': 'أُرسل الرد وتم إبلاغ الساكن.', 'don.visiteur': 'زائر', 'don.habitant': 'ساكن'
    }
  });
  const L = (cle, fr, vars) => NT.t(cle, vars, fr);
  const E = s => NT.ui.echap(s);
  const $ = (sel, r) => (r || document).querySelector(sel);
  const $$ = (sel, r) => Array.from((r || document).querySelectorAll(sel));
  const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  const SUJETS = { donnees: 'Utilisation de mes données', agents: 'Accès des agents à mes données', suppression: 'Suppression de mes données', securite: 'Sécurité de mon compte', autre: 'Autre' };
  const STATUTS = { recue: 'Reçue', en_cours: 'En cours', repondue: 'Répondue' };
  const sujet = c => L('don.sujet.' + c, SUJETS[c] || c);
  const badge = s => `<span class="statut statut-${s === 'repondue' ? 'traitee' : s === 'en_cours' ? 'en_cours' : 'recue'}">${E(L('don.st.' + s, STATUTS[s] || s))}</span>`;

  NT.pret(() => {
    const u = NT.auth.utilisateur();
    const personnel = !!u && (u.role === 'agent' || u.role === 'admin');

    /* ---------- Export ---------- */
    $('#zone-export').innerHTML = u
      ? `<a class="btn btn-primaire" href="/api/mes-donnees" download="mes-donnees-terra-nova.json"><i class="ph-duotone ph-download-simple" aria-hidden="true"></i> ${E(L('don.telecharger', 'Télécharger mes données'))}</a>`
      : `<span class="doux">${E(L('don.exportAide', 'Connectez-vous pour télécharger vos données.'))}</span> <a class="btn" href="connexion.html?retour=donnees.html">${E(L('don.seConnecter', 'Se connecter'))}</a>`;

    /* ---------- Formulaire ---------- */
    if (!u) $('#bloc-contact').hidden = false;
    const form = $('#form-contrib');

    function poserErreurs(erreurs) {
      $$('[aria-invalid]', form).forEach(el => { el.removeAttribute('aria-invalid'); el.setAttribute('aria-describedby', el.dataset.base || ''); if (!el.dataset.base) el.removeAttribute('aria-describedby'); });
      $$('.erreur[data-erreur]', form).forEach(p => p.remove());
      const resume = $('.resume-erreurs', form);
      resume.innerHTML = '';
      if (!erreurs.length) return;
      erreurs.forEach(e => {
        const c = document.getElementById(e.id);
        if (c.dataset.base === undefined) c.dataset.base = c.getAttribute('aria-describedby') || '';
        c.setAttribute('aria-invalid', 'true');
        c.setAttribute('aria-describedby', (c.dataset.base + ' err-' + e.id).trim());
        const p = document.createElement('p');
        p.className = 'erreur'; p.id = 'err-' + e.id; p.dataset.erreur = '1'; p.textContent = e.msg;
        c.closest('.champ').append(p);
      });
      const n = erreurs.length;
      resume.innerHTML = `<p><strong>${E(n > 1 ? L('don.resumeN', '{n} points à corriger :', { n }) : L('don.resume1', 'Un point à corriger :'))}</strong></p><ul>` +
        erreurs.map(e => `<li><a href="#${E(e.id)}" data-champ="${E(e.id)}">${E(e.msg)}</a></li>`).join('') + '</ul>';
      document.getElementById(erreurs[0].id).focus();
    }
    form.addEventListener('click', e => {
      const a = e.target.closest('.resume-erreurs a[data-champ]'); if (!a) return;
      e.preventDefault(); document.getElementById(a.dataset.champ).focus();
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      const message = $('#c-message').value.trim();
      const contact = $('#c-contact').value.trim();
      const erreurs = [];
      if (message.length < 10) erreurs.push({ id: 'c-message', msg: L('don.errMessage', 'Décrivez votre question ou votre inquiétude (10 caractères minimum).') });
      if (!u && !EMAIL.test(contact)) erreurs.push({ id: 'c-contact', msg: L('don.errEmail', 'Saisissez une adresse e-mail valide pour que nous puissions vous répondre.') });
      poserErreurs(erreurs);
      if (erreurs.length) return;
      const r = NT.api('POST', '/api/contributions', { sujet: $('#c-sujet').value, message, contact });
      if (r.statut !== 200 || !r.donnees || !r.donnees.id) {
        poserErreurs([{ id: 'c-message', msg: (r.donnees && r.donnees.erreur) || L('don.errServeur', 'Votre contribution n’a pas pu être envoyée. Réessayez.') }]);
        return;
      }
      const c = r.donnees;
      const zone = $('#confirmation');
      zone.innerHTML = `<div class="confirm-don"><p><i class="ph-duotone ph-check-circle" aria-hidden="true"></i> <strong>${E(L('don.okTitre', 'Votre contribution est enregistrée'))}</strong></p>
        <p>${E(L('don.okNum', 'Numéro de suivi'))} : <span class="numero">${E(c.id)}</span></p>
        <p>${E(L('don.okDelai', 'Vous recevrez une réponse sous 15 jours.'))}</p>
        <p class="doux">${E(u ? L('don.okSuivi', 'Vous la suivez dans « Mes contributions » plus bas. Une notification a été ajoutée à votre cloche.') : L('don.okVisiteur', 'Conservez ce numéro. Nous répondrons à l’adresse e-mail indiquée.'))}</p></div>`;
      zone.focus();
      form.reset();
      NT.ui.annoncer(L('don.okTitre', 'Votre contribution est enregistrée') + ' — ' + c.id);
      if (u) { rendreMes(); rendreRecues(); }
    });

    /* ---------- Mes contributions ---------- */
    function historique(c) {
      return `<h4 class="sr-only">${E(L('don.historique', 'Historique'))}</h4><ol class="histo">${(c.historique || []).map(h =>
        `<li><span>${E(NT.ui.dateHeure(h.date))}</span>${badge(h.statut)}<span>${E(h.note || '')}</span><span>${E(L('don.par', 'par {p}', { p: h.par || '' }))}</span></li>`).join('')}</ol>`;
    }
    function carte(c, avecForm) {
      return `<li><article class="contrib" id="${E(c.id)}" aria-labelledby="t-${E(c.id)}">
        <div class="contrib-tete"><h3 id="t-${E(c.id)}">${E(c.id)} · ${E(sujet(c.sujet))}</h3>${badge(c.statut)}</div>
        <p class="doux">${E(L('don.de', 'Du {d}', { d: NT.ui.date(c.cree) }))}${avecForm ? ' · ' + E(c.userId ? L('don.habitant', 'Habitant') : L('don.visiteur', 'Visiteur')) + (c.contact ? ' · ' + E(c.contact) : '') : ''}</p>
        <p class="msg">${E(c.message)}</p>
        ${c.reponse ? `<div class="reponse-del"><strong>${E(L('don.reponse', 'Réponse du délégué'))}</strong><p>${E(c.reponse)}</p></div>` : ''}
        ${historique(c)}
        ${avecForm ? `<form class="form-rep" data-id="${E(c.id)}" novalidate>
          <div class="champ"><label for="rep-${E(c.id)}">${E(L('don.rep.label', 'Votre réponse à l’habitant'))}</label>
            <textarea id="rep-${E(c.id)}" rows="3" maxlength="2000"></textarea></div>
          <div class="champ"><label for="st-${E(c.id)}">${E(L('don.rep.statut', 'Nouveau statut'))}</label>
            <select id="st-${E(c.id)}"><option value="repondue">${E(L('don.rep.repondue', 'Répondue'))}</option><option value="en_cours">${E(L('don.rep.en_cours', 'En cours'))}</option></select></div>
          <button class="btn btn-primaire" type="submit">${E(L('don.rep.envoyer', 'Envoyer la réponse'))}</button></form>` : ''}
      </article></li>`;
    }
    function charger() { const r = NT.api('GET', '/api/contributions'); return r.statut === 200 && Array.isArray(r.donnees) ? r.donnees : []; }
    function rendreMes() {
      if (!u || personnel) return;
      const l = charger();
      $('#mes-contributions').hidden = false; $('#lien-mes').hidden = false;
      $('#liste-mes').innerHTML = l.length ? l.map(c => carte(c, false)).join('') : `<li class="vide">${E(L('don.aucune', 'Vous n’avez pas encore envoyé de contribution.'))}</li>`;
    }
    function rendreRecues() {
      if (!personnel) return;
      const l = charger();
      $('#contributions-recues').hidden = false;
      $('#liste-recues').innerHTML = l.length ? l.map(c => carte(c, true)).join('') : `<li class="vide">${E(L('don.aucuneRecue', 'Aucune contribution reçue pour l’instant.'))}</li>`;
    }

    /* ---------- Réponse du personnel ---------- */
    $('#liste-recues').addEventListener('submit', e => {
      const f = e.target.closest('.form-rep'); if (!f) return;
      e.preventDefault();
      const id = f.dataset.id;
      const champ = $('#rep-' + CSS.escape(id));
      const reponse = champ.value.trim();
      const ancien = $('.erreur[data-erreur]', f); if (ancien) ancien.remove();
      champ.removeAttribute('aria-invalid');
      if (!reponse) {
        const p = document.createElement('p');
        p.className = 'erreur'; p.id = 'err-rep-' + id; p.dataset.erreur = '1'; p.setAttribute('role', 'alert');
        p.textContent = L('don.rep.vide', 'Écrivez une réponse avant de l’envoyer.');
        champ.setAttribute('aria-invalid', 'true'); champ.setAttribute('aria-describedby', p.id);
        champ.closest('.champ').append(p); champ.focus(); return;
      }
      const r = NT.api('PATCH', '/api/contributions/' + encodeURIComponent(id), { statut: $('#st-' + CSS.escape(id)).value, reponse });
      if (r.statut !== 200) { NT.ui.toast((r.donnees && r.donnees.erreur) || L('don.errServeur', 'Action impossible. Réessayez.'), 'danger'); return; }
      rendreRecues();
      NT.ui.toast(L('don.rep.ok', 'Réponse envoyée, l’habitant est prévenu.'), 'success');
      const t = document.getElementById('t-' + id); if (t) { t.setAttribute('tabindex', '-1'); t.focus(); }
    });

    rendreMes();
    rendreRecues();
    if (location.hash) { const c = document.getElementById(location.hash.slice(1)); if (c && c.scrollIntoView) c.scrollIntoView(); }
  });
})();
