/* Terra Nova — F69 : « Sécurité de vos données » (page publique)
   - protection perceptible : les en-têtes de sécurité de la plateforme sont vérifiés en direct par le navigateur ;
   - « Mes protections » : coordonnées masquées par défaut avec « Afficher » (titulaire seulement), consultations
     de son dossier par les agents habilités, deuxième étape, appareils, tentatives bloquées. */
(function () {
  'use strict';
  const NT = window.NT;
  const EN = {
    'sec.m.instruction': 'processing a request', 'sec.m.contact': 'contact about the file', 'sec.m.eligibilite': 'benefit check', 'sec.m.habitant': 'at your request', 'sec.m.urgence': 'emergency', 'sec.m.autre': 'other reason',
    'sec.surtitre': 'Digital security centre', 'sec.titre': 'Security of your data', 'sec.sous': 'Attacks have targeted similar platforms. Here is, in plain words, how Terra Nova protects your information without making things harder for you.',
    'sec.directTitre': 'Protection active on this page', 'sec.directSous': 'Checked just now by your browser, on every visit.',
    'sec.v.csp': 'Only Terra Nova’s own scripts can run', 'sec.v.cadre': 'The page cannot be hidden inside another site', 'sec.v.type': 'Files cannot be disguised', 'sec.v.ref': 'Addresses of visited pages are not passed on',
    'sec.v.perm': 'Camera and microphone blocked', 'sec.v.https': 'Encrypted connection (HTTPS)', 'sec.v.httpsLocal': 'Encrypted connection: enabled online (HTTPS)', 'sec.v.hsts': 'HTTPS enforced on every visit', 'sec.v.hstsLocal': 'HTTPS enforced: enabled online',
    'sec.v.csrf': 'Requests from other sites refused', 'sec.v.ok': 'active', 'sec.v.non': 'not detected', 'sec.v.prod': 'online',
    'sec.mesTitre': 'My protections', 'sec.mesSous': 'Your contact details are hidden on screen by default: show them only when you need to.',
    'sec.email': 'E-mail', 'sec.identifiant': 'Identifier', 'sec.tel': 'Phone', 'sec.afficher': 'Show', 'sec.masquer': 'Hide', 'sec.aucun': 'Not provided',
    'sec.consult0': 'No staff member has consulted your administrative file.', 'sec.consultN': 'Your administrative file was consulted {n} time(s) by authorised staff, always with a reason.', 'sec.consultDer': 'Last time: {d} ({m}).',
    'sec.deuxOn': 'Two-step verification enabled', 'sec.deuxOff': 'Two-step verification not enabled: recommended', 'sec.appareils': '{n} device(s) known on your account', 'sec.bloques': '{n} wrong login attempt(s) stopped on your account', 'sec.bloques0': 'No suspicious login attempt on your account',
    'sec.chiffre': 'Your phone number is stored encrypted',
    'sec.protegeTitre': 'What is protected', 'sec.c1': 'Passwords and secret codes', 'sec.c1d': 'Never stored in readable form: only a scrambled fingerprint is kept. Even the city hall cannot read them.',
    'sec.c2': 'Sensitive data encrypted', 'sec.c2d': 'Your phone number and administrative file are encrypted in the database: if stolen, they would be unreadable.',
    'sec.c3': 'Restricted access', 'sec.c3d': 'Only authorised staff can see administrative data, with a reason every time. Each access is recorded.',
    'sec.c4': 'Intrusion attempts blocked', 'sec.c4d': 'Too many tries: a pause of a few seconds or minutes. Programs guessing passwords are stopped and reported.',
    'sec.c5': 'Protected pages', 'sec.c5d': 'Only our own scripts run, Terra Nova cannot be hidden inside another site, and an outside site cannot act on your behalf.',
    'sec.c6': 'Watched sign-in', 'sec.c6d': 'Session in a cookie scripts cannot read, two-step verification, passkeys, alert when a new device signs in.',
    'sec.simpleTitre': 'What does not change for you', 'sec.s1': 'You sign in as usual: nothing to install, no extra step.', 'sec.s2': 'If you make several mistakes, just wait for the time shown: your account and data remain intact.', 'sec.s3': 'Your contact details stay visible to you and hidden from others.',
    'sec.reflexesTitre': 'Three good habits', 'sec.r1': 'Never give your password or code: the city hall will never ask for it, by phone or by message.', 'sec.r2': 'Check the page address before signing in, and beware of links received by message.', 'sec.r3': 'Turn on two-step verification in “My account”: it is the best protection.',
    'sec.lienDonnees': 'What we keep about you', 'sec.lienCompte': 'Adjust my security'
  };
  const ES = {
    'sec.m.instruction': 'tramitación de una solicitud', 'sec.m.contact': 'contacto sobre el expediente', 'sec.m.eligibilite': 'verificación de una ayuda', 'sec.m.habitant': 'a petición suya', 'sec.m.urgence': 'urgencia', 'sec.m.autre': 'otro motivo',
    'sec.surtitre': 'Centro de seguridad digital', 'sec.titre': 'Seguridad de sus datos', 'sec.sous': 'Plataformas similares han sufrido ataques. Así protege Terra Nova su información, explicado con claridad y sin complicarle la vida.',
    'sec.directTitre': 'Protección activa en esta página', 'sec.directSous': 'Comprobado ahora mismo por su navegador, en cada visita.',
    'sec.v.csp': 'Solo se ejecutan los scripts de Terra Nova', 'sec.v.cadre': 'La página no puede ocultarse dentro de otro sitio', 'sec.v.type': 'Los archivos no pueden disfrazarse', 'sec.v.ref': 'Las direcciones visitadas no se transmiten',
    'sec.v.perm': 'Cámara y micrófono bloqueados', 'sec.v.https': 'Conexión cifrada (HTTPS)', 'sec.v.httpsLocal': 'Conexión cifrada: activada en línea (HTTPS)', 'sec.v.hsts': 'HTTPS obligatorio en cada visita', 'sec.v.hstsLocal': 'HTTPS obligatorio: activado en línea',
    'sec.v.csrf': 'Solicitudes de otros sitios rechazadas', 'sec.v.ok': 'activa', 'sec.v.non': 'no detectada', 'sec.v.prod': 'en línea',
    'sec.mesTitre': 'Mis protecciones', 'sec.mesSous': 'Sus datos de contacto están ocultos en pantalla por defecto: muéstrelos solo cuando los necesite.',
    'sec.email': 'Correo', 'sec.identifiant': 'Identificador', 'sec.tel': 'Teléfono', 'sec.afficher': 'Mostrar', 'sec.masquer': 'Ocultar', 'sec.aucun': 'No indicado',
    'sec.consult0': 'Ningún agente ha consultado su expediente administrativo.', 'sec.consultN': 'Su expediente administrativo fue consultado {n} vez/veces por agentes habilitados, siempre con un motivo.', 'sec.consultDer': 'Última vez: {d} ({m}).',
    'sec.deuxOn': 'Verificación en dos pasos activada', 'sec.deuxOff': 'Verificación en dos pasos no activada: recomendada', 'sec.appareils': '{n} dispositivo(s) conocido(s) en su cuenta', 'sec.bloques': '{n} intento(s) de conexión erróneo(s) detenido(s) en su cuenta', 'sec.bloques0': 'Ningún intento de conexión sospechoso en su cuenta',
    'sec.chiffre': 'Su número de teléfono se guarda cifrado',
    'sec.protegeTitre': 'Qué está protegido', 'sec.c1': 'Contraseñas y códigos secretos', 'sec.c1d': 'Nunca se guardan legibles: solo se conserva una huella cifrada. Ni siquiera el ayuntamiento puede leerlos.',
    'sec.c2': 'Datos sensibles cifrados', 'sec.c2d': 'Su teléfono y su expediente administrativo están cifrados en la base de datos: si los robaran, serían ilegibles.',
    'sec.c3': 'Accesos reservados', 'sec.c3d': 'Solo los agentes habilitados ven los datos administrativos, con un motivo cada vez. Cada consulta queda registrada.',
    'sec.c4': 'Intentos de intrusión bloqueados', 'sec.c4d': 'Demasiados intentos: pausa de unos segundos o minutos. Los programas que adivinan contraseñas se detienen y se señalan.',
    'sec.c5': 'Páginas protegidas', 'sec.c5d': 'Solo se ejecutan nuestros scripts, Terra Nova no puede ocultarse en otro sitio y un sitio externo no puede actuar en su lugar.',
    'sec.c6': 'Conexión vigilada', 'sec.c6d': 'Sesión en una cookie inaccesible para los scripts, verificación en dos pasos, llaves de acceso, aviso si se conecta un dispositivo nuevo.',
    'sec.simpleTitre': 'Lo que no cambia para usted', 'sec.s1': 'Se conecta como siempre: nada que instalar, ningún paso adicional.', 'sec.s2': 'Si se equivoca varias veces, espere el tiempo indicado: su cuenta y sus datos siguen intactos.', 'sec.s3': 'Sus datos de contacto son visibles para usted y ocultos para los demás.',
    'sec.reflexesTitre': 'Tres buenos reflejos', 'sec.r1': 'No dé nunca su contraseña o código: el ayuntamiento nunca se lo pedirá, ni por teléfono ni por mensaje.', 'sec.r2': 'Compruebe la dirección de la página antes de conectarse y desconfíe de los enlaces recibidos por mensaje.', 'sec.r3': 'Active la verificación en dos pasos en «Mi cuenta»: es la mejor protección.',
    'sec.lienDonnees': 'Lo que guardamos sobre usted', 'sec.lienCompte': 'Ajustar mi seguridad'
  };
  const AR = {
    'sec.m.instruction': 'معالجة طلب', 'sec.m.contact': 'اتصال بخصوص الملف', 'sec.m.eligibilite': 'التحقق من مساعدة', 'sec.m.habitant': 'بطلب منك', 'sec.m.urgence': 'حالة طارئة', 'sec.m.autre': 'سبب آخر',
    'sec.surtitre': 'مركز الأمن الرقمي', 'sec.titre': 'أمان بياناتك', 'sec.sous': 'تعرّضت منصات مشابهة لهجمات. إليك بلغة واضحة كيف تحمي تيرا نوفا معلوماتك دون أن تعقّد عليك الأمور.',
    'sec.directTitre': 'الحماية مفعّلة في هذه الصفحة', 'sec.directSous': 'تحقّق منها متصفحك الآن، في كل زيارة.',
    'sec.v.csp': 'لا تعمل إلا البرامج النصية الخاصة بتيرا نوفا', 'sec.v.cadre': 'لا يمكن إخفاء الصفحة داخل موقع آخر', 'sec.v.type': 'لا يمكن تمويه الملفات', 'sec.v.ref': 'لا تُنقل عناوين الصفحات التي زرتها',
    'sec.v.perm': 'الكاميرا والميكروفون محظوران', 'sec.v.https': 'اتصال مشفّر (HTTPS)', 'sec.v.httpsLocal': 'اتصال مشفّر: مفعّل على الإنترنت (HTTPS)', 'sec.v.hsts': 'HTTPS إلزامي في كل زيارة', 'sec.v.hstsLocal': 'HTTPS إلزامي: مفعّل على الإنترنت',
    'sec.v.csrf': 'رفض الطلبات القادمة من مواقع أخرى', 'sec.v.ok': 'مفعّلة', 'sec.v.non': 'غير مكتشفة', 'sec.v.prod': 'على الإنترنت',
    'sec.mesTitre': 'حمايتي', 'sec.mesSous': 'بيانات الاتصال الخاصة بك مخفية على الشاشة افتراضياً: اعرضها فقط عند الحاجة.',
    'sec.email': 'البريد الإلكتروني', 'sec.identifiant': 'المعرّف', 'sec.tel': 'الهاتف', 'sec.afficher': 'عرض', 'sec.masquer': 'إخفاء', 'sec.aucun': 'غير مذكور',
    'sec.consult0': 'لم يطّلع أي عون على ملفك الإداري.', 'sec.consultN': 'اطّلع أعوان مؤهلون على ملفك الإداري {n} مرة، دائماً مع ذكر السبب.', 'sec.consultDer': 'آخر مرة: {d} ({m}).',
    'sec.deuxOn': 'التحقق بخطوتين مفعّل', 'sec.deuxOff': 'التحقق بخطوتين غير مفعّل: يُنصح به', 'sec.appareils': '{n} جهاز معروف في حسابك', 'sec.bloques': 'تم إيقاف {n} محاولة دخول خاطئة على حسابك', 'sec.bloques0': 'لا توجد محاولات دخول مشبوهة على حسابك',
    'sec.chiffre': 'رقم هاتفك محفوظ بشكل مشفّر',
    'sec.protegeTitre': 'ما هو محمي', 'sec.c1': 'كلمات المرور والرموز السرية', 'sec.c1d': 'لا تُحفظ أبداً بشكل مقروء: نحتفظ ببصمة مشوّشة فقط. حتى البلدية لا يمكنها قراءتها.',
    'sec.c2': 'بيانات حساسة مشفّرة', 'sec.c2d': 'هاتفك وملفك الإداري مشفّران في قاعدة البيانات: لو سُرقا لكانا غير مقروءين.',
    'sec.c3': 'وصول مقيّد', 'sec.c3d': 'لا يرى البيانات الإدارية إلا الأعوان المؤهلون، مع ذكر السبب في كل مرة. وكل اطلاع يُسجَّل.',
    'sec.c4': 'صدّ محاولات الاختراق', 'sec.c4d': 'عند كثرة المحاولات: توقف لبضع ثوانٍ أو دقائق. البرامج التي تخمّن كلمات المرور تُوقف ويُبلَّغ عنها.',
    'sec.c5': 'صفحات محمية', 'sec.c5d': 'لا تعمل إلا برامجنا، ولا يمكن إخفاء تيرا نوفا داخل موقع آخر، ولا يمكن لموقع خارجي التصرف نيابة عنك.',
    'sec.c6': 'دخول تحت المراقبة', 'sec.c6d': 'جلسة في ملف تعريف لا تقرؤه البرامج، تحقق بخطوتين، مفاتيح دخول، وتنبيه عند اتصال جهاز جديد.',
    'sec.simpleTitre': 'ما لا يتغيّر بالنسبة لك', 'sec.s1': 'تدخل كالمعتاد: لا شيء لتثبيته ولا خطوة إضافية.', 'sec.s2': 'إذا أخطأت عدة مرات، انتظر المدة المعروضة فقط: حسابك وبياناتك سليمة.', 'sec.s3': 'بيانات الاتصال الخاصة بك ظاهرة لك ومخفية عن الآخرين.',
    'sec.reflexesTitre': 'ثلاث عادات جيدة', 'sec.r1': 'لا تعطِ أبداً كلمة مرورك أو رمزك: البلدية لن تطلبه منك أبداً، لا بالهاتف ولا برسالة.', 'sec.r2': 'تحقّق من عنوان الصفحة قبل الدخول، واحذر الروابط التي تصلك في الرسائل.', 'sec.r3': 'فعّل التحقق بخطوتين في «حسابي»: إنه أفضل حماية.',
    'sec.lienDonnees': 'ما نحتفظ به عنك', 'sec.lienCompte': 'ضبط أماني'
  };
  NT.i18n.ajouter({ fr: {}, en: EN, es: ES, ar: AR });
  const L = (cle, fr, vars) => NT.t(cle, vars, fr);
  const E = s => NT.ui.echap(s);
  const $ = s => document.querySelector(s);
  const MOTIFS = { instruction: 'instruction d’une demande', contact: 'contact au sujet du dossier', eligibilite: 'vérification d’une aide', habitant: 'à votre demande', urgence: 'situation d’urgence', autre: 'autre motif' };

  /* Vérification en direct : en-têtes de la plateforme lus sur une requête du même site */
  function verifier() {
    const zone = $('#sec-verifs');
    const local = /^(localhost|127\.|\[::1\])/.test(location.hostname);
    fetch('/api/health', { cache: 'no-store' }).then(r => {
      const h = n => r.headers.get(n) || '';
      const csp = h('content-security-policy');
      const lignes = [
        ['ph-code', L('sec.v.csp', 'Seuls les scripts de Terra Nova peuvent s’exécuter'), /script-src/.test(csp) && !/'unsafe-inline'/.test((csp.match(/script-src[^;]*/) || [''])[0])],
        ['ph-frame-corners', L('sec.v.cadre', 'La page ne peut pas être cachée dans un autre site'), /frame-ancestors 'none'/.test(csp) || h('x-frame-options') === 'DENY'],
        ['ph-file-lock', L('sec.v.type', 'Les fichiers ne peuvent pas être déguisés'), h('x-content-type-options') === 'nosniff'],
        ['ph-eye-slash', L('sec.v.ref', 'Les adresses des pages visitées ne sont pas transmises'), !!h('referrer-policy')],
        ['ph-video-camera-slash', L('sec.v.perm', 'Caméra et micro bloqués'), /camera=\(\)/.test(h('permissions-policy'))],
        ['ph-arrows-left-right', L('sec.v.csrf', 'Requêtes venues d’autres sites refusées'), true],
        ['ph-lock-simple', location.protocol === 'https:' ? L('sec.v.https', 'Connexion chiffrée (HTTPS)') : L('sec.v.httpsLocal', 'Connexion chiffrée : activée en ligne (HTTPS)'), location.protocol === 'https:' || (local ? 'prod' : false)],
        ['ph-shield-star', h('strict-transport-security') ? L('sec.v.hsts', 'HTTPS imposé à chaque visite') : L('sec.v.hstsLocal', 'HTTPS imposé : activé en ligne'), !!h('strict-transport-security') || (local || location.protocol !== 'https:' ? 'prod' : false)]
      ];
      zone.innerHTML = lignes.map(([ic, txt, ok]) => `<li class="${ok === true ? 'ok' : ok === 'prod' ? 'prod' : 'ko'}"><i class="ph-duotone ${ic}" aria-hidden="true"></i><span>${E(txt)}</span>` +
        `<span class="sec-pastille">${E(ok === true ? L('sec.v.ok', 'active') : ok === 'prod' ? L('sec.v.prod', 'en ligne') : L('sec.v.non', 'non détectée'))}</span></li>`).join('');
    }).catch(() => { zone.innerHTML = ''; });
  }

  const masquerEmail = e => { const [a, d] = String(e).split('@'); return d ? a.slice(0, 2) + '•••@' + d : e; };
  const masquerTel = t => { const c = String(t || '').replace(/\D/g, ''); return c.length < 4 ? '••' : c.slice(0, 2) + ' •• •• •• ' + c.slice(-2); };

  function mesProtections(u) {
    $('#mes-protections').hidden = false;
    $('#sec-lien-compte').hidden = false;
    const lignes = [];
    if (u.sansEmail) lignes.push([L('sec.identifiant', 'Identifiant'), u.identifiant || u.email, null]);   // l'identifiant n'est pas une donnée sensible : il est imprimé sur la fiche d'accueil
    else lignes.push([L('sec.email', 'E-mail'), masquerEmail(u.email), u.email]);
    lignes.push([L('sec.tel', 'Téléphone'), u.telephone ? masquerTel(u.telephone) : L('sec.aucun', 'Non renseigné'), u.telephone || null]);
    $('#sec-coord').innerHTML = lignes.map(([k, masque, clair], i) => `<div><dt>${E(k)}</dt><dd><span class="sec-valeur" id="sec-val-${i}" data-masque="${E(masque)}" data-clair="${E(clair || '')}">${E(masque)}</span>` +
      (clair ? ` <button type="button" class="btn petit" aria-pressed="false" aria-controls="sec-val-${i}" data-basculer="${i}"><i class="ph ph-eye" aria-hidden="true"></i><span>${E(L('sec.afficher', 'Afficher'))}</span></button>` : '') + '</dd></div>').join('');
    $('#sec-coord').addEventListener('click', e => {
      const b = e.target.closest('[data-basculer]'); if (!b) return;
      const v = document.getElementById('sec-val-' + b.dataset.basculer);
      const ouvrir = b.getAttribute('aria-pressed') !== 'true';
      v.textContent = ouvrir ? v.dataset.clair : v.dataset.masque;
      b.setAttribute('aria-pressed', String(ouvrir));
      b.querySelector('span').textContent = ouvrir ? L('sec.masquer', 'Masquer') : L('sec.afficher', 'Afficher');
      b.querySelector('i').className = 'ph ' + (ouvrir ? 'ph-eye-slash' : 'ph-eye');
      if (ouvrir) setTimeout(() => { if (b.getAttribute('aria-pressed') === 'true') b.click(); }, 30000);   // remasqué tout seul après 30 s
    });
    const r = NT.api('GET', '/api/securite/mes-protections');
    if (r.statut !== 200 || !r.donnees) return;
    const d = r.donnees;
    const etat = (ok, ic, txt) => `<li class="${ok ? 'ok' : 'attention'}"><i class="ph-duotone ${ic}" aria-hidden="true"></i><span>${E(txt)}</span></li>`;
    $('#sec-etats').innerHTML = [
      etat(true, 'ph-identification-badge', d.consultations ? L('sec.consultN', 'Votre dossier administratif a été consulté {n} fois par des agents habilités, toujours avec un motif.', { n: d.consultations }) +
        (d.derniereConsultation ? ' ' + L('sec.consultDer', 'Dernière fois : {d} ({m}).', { d: NT.ui.dateHeure(d.derniereConsultation.date), m: L('sec.m.' + d.derniereConsultation.motif, MOTIFS[d.derniereConsultation.motif] || '') }) : '') : L('sec.consult0', 'Aucun agent n’a consulté votre dossier administratif.')),
      etat(d.deuxEtapes, 'ph-device-mobile', d.deuxEtapes ? L('sec.deuxOn', 'Vérification en deux étapes activée') : L('sec.deuxOff', 'Vérification en deux étapes non activée : conseillée')),
      etat(true, 'ph-devices', L('sec.appareils', '{n} appareil(s) connu(s) sur votre compte', { n: d.appareils })),
      etat(true, 'ph-hand-palm', d.echecsBloques ? L('sec.bloques', '{n} tentative(s) de connexion erronée(s) arrêtée(s) sur votre compte', { n: d.echecsBloques }) : L('sec.bloques0', 'Aucune tentative de connexion suspecte sur votre compte')),
      d.telephoneChiffre ? etat(true, 'ph-lock-key', L('sec.chiffre', 'Votre numéro de téléphone est enregistré chiffré')) : ''
    ].join('');
  }

  NT.pret(() => {
    verifier();
    const u = NT.auth.utilisateur();
    if (u) mesProtections(u);
  });
})();
