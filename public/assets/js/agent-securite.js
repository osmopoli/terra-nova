/* Terra Nova — Centre de sécurité (administrateur)
   F69 : tentatives bloquées par le bouclier (CSRF, débit, validation, accès refusés), comptes verrouillés, protections actives.
   F70 : habilitations aux données réservées (accorder / retirer avec motif) et journal des consultations. */
(function () {
  'use strict';
  const NT = window.NT;
  const EN = {
    'cs.surtitre': 'Digital security centre', 'cs.titre': 'Security centre', 'cs.sous': 'Attempts blocked by the platform, active protections, authorisations for restricted data and a log of every access.',
    'cs.blocages': 'Blocked attempts', 'cs.blocagesD': 'Requests from another site, bursts of attempts, malformed data, denied access. IP addresses are truncated.',
    'cs.fType': 'Type', 'cs.csv': 'Export (CSV)', 'cs.blocagesCap': 'Log of blocked attempts', 'cs.cDate': 'Date', 'cs.cType': 'Type', 'cs.cRequete': 'Request', 'cs.cOrigine': 'Origin', 'cs.cDetail': 'Detail',
    'cs.hab': 'Authorisations for restricted data', 'cs.habD': 'On top of the role: only authorised staff can show a resident’s phone and administrative file, with a reason every time. Administrators are authorised by their role.',
    'cs.habCap': 'Staff and authorisations', 'cs.hNom': 'Person', 'cs.hRole': 'Role', 'cs.hEtat': 'Authorisation', 'cs.hDecision': 'Decision', 'cs.hAction': 'Action',
    'cs.acces': 'Access to restricted data', 'cs.accesD': 'Who showed what, when and why. This log cannot be modified.', 'cs.accesCap': 'Log of access to restricted data',
    'cs.aAgent': 'Staff member', 'cs.aPersonne': 'Person concerned', 'cs.aChamps': 'Data', 'cs.aMotif': 'Reason', 'cs.prot': 'Active protections',
    'cs.k24': 'Attempts blocked (24 h)', 'cs.kDebit': 'Bursts stopped (24 h)', 'cs.kCsrf': 'Outside requests refused (24 h)', 'cs.kEchecs': 'Failed logins (24 h)', 'cs.kVerrou': 'Accounts locked now', 'cs.kAcces': 'Restricted data views (7 days)',
    'cs.t.tous': 'All types', 'cs.t.debit': 'Too many attempts', 'cs.t.csrf': 'Outside request', 'cs.t.validation': 'Invalid data', 'cs.t.acces': 'Access denied', 'cs.t.robot': 'Automated submission',
    'cs.nb': '{n} attempt(s) shown.', 'cs.aucun': 'No blocked attempt. Everything is calm.', 'cs.aucunAcces': 'No access to restricted data yet.',
    'cs.habOui': 'Authorised', 'cs.habNon': 'Not authorised', 'cs.habRole': 'Authorised (administrator)', 'cs.accorder': 'Grant', 'cs.retirer': 'Withdraw', 'cs.par': 'by {p}, {d}',
    'cs.motifTitre': 'Reason for this decision', 'cs.motifAide': 'Mission or service justifying the decision (5 characters minimum).', 'cs.confirmer': 'Confirm', 'cs.annuler': 'Cancel',
    'cs.okAccorde': 'Authorisation granted to {n}.', 'cs.okRetire': 'Authorisation withdrawn from {n}.', 'cs.champ.telephone': 'phone', 'cs.champ.dossier': 'administrative file',
    'cs.p.entetes': 'Strict security headers: {l}', 'cs.p.csp': 'Content policy: only listed scripts (Shoelace, Phosphor, fonts) and inline scripts identified by fingerprint', 'cs.p.csrf': 'Writes accepted only from Terra Nova itself, in JSON',
    'cs.p.debit': 'Rate limit “{n}”: {m} per {d} min', 'cs.p.chiffre': 'Phone and administrative file encrypted at rest ({a})', 'cs.p.cle': 'Encryption key provided by the server environment', 'cs.p.cleFichier': 'Encryption key stored outside the code (key file next to the database)',
    'cs.p.hsts': 'HTTPS enforced (HSTS) online', 'cs.p.filtre': 'Restricted fields never sent to the page (server filtering)', 'cs.p.hash': 'Passwords and codes hashed (scrypt), progressive lockout'
  };
  const ES = {
    'cs.surtitre': 'Centro de seguridad digital', 'cs.titre': 'Centro de seguridad', 'cs.sous': 'Intentos bloqueados por la plataforma, protecciones activas, habilitaciones para datos reservados y registro de cada consulta.',
    'cs.blocages': 'Intentos bloqueados', 'cs.blocagesD': 'Solicitudes de otro sitio, ráfagas de intentos, datos malformados, accesos denegados. Las direcciones IP están truncadas.',
    'cs.fType': 'Tipo', 'cs.csv': 'Exportar (CSV)', 'cs.blocagesCap': 'Registro de intentos bloqueados', 'cs.cDate': 'Fecha', 'cs.cType': 'Tipo', 'cs.cRequete': 'Solicitud', 'cs.cOrigine': 'Origen', 'cs.cDetail': 'Detalle',
    'cs.hab': 'Habilitaciones para datos reservados', 'cs.habD': 'Además del rol: solo el personal habilitado puede mostrar el teléfono y el expediente administrativo de un vecino, con un motivo cada vez. Los administradores están habilitados por su rol.',
    'cs.habCap': 'Personal y habilitaciones', 'cs.hNom': 'Persona', 'cs.hRole': 'Rol', 'cs.hEtat': 'Habilitación', 'cs.hDecision': 'Decisión', 'cs.hAction': 'Acción',
    'cs.acces': 'Consultas de datos reservados', 'cs.accesD': 'Quién mostró qué, cuándo y por qué. Este registro no se puede modificar.', 'cs.accesCap': 'Registro de consultas de datos reservados',
    'cs.aAgent': 'Agente', 'cs.aPersonne': 'Persona afectada', 'cs.aChamps': 'Datos', 'cs.aMotif': 'Motivo', 'cs.prot': 'Protecciones activas',
    'cs.k24': 'Intentos bloqueados (24 h)', 'cs.kDebit': 'Ráfagas detenidas (24 h)', 'cs.kCsrf': 'Solicitudes externas rechazadas (24 h)', 'cs.kEchecs': 'Conexiones fallidas (24 h)', 'cs.kVerrou': 'Cuentas bloqueadas ahora', 'cs.kAcces': 'Consultas reservadas (7 días)',
    'cs.t.tous': 'Todos los tipos', 'cs.t.debit': 'Demasiados intentos', 'cs.t.csrf': 'Solicitud externa', 'cs.t.validation': 'Datos no válidos', 'cs.t.acces': 'Acceso denegado', 'cs.t.robot': 'Envío automático',
    'cs.nb': '{n} intento(s) mostrado(s).', 'cs.aucun': 'Ningún intento bloqueado. Todo está tranquilo.', 'cs.aucunAcces': 'Todavía no hay consultas de datos reservados.',
    'cs.habOui': 'Habilitado', 'cs.habNon': 'No habilitado', 'cs.habRole': 'Habilitado (administrador)', 'cs.accorder': 'Conceder', 'cs.retirer': 'Retirar', 'cs.par': 'por {p}, {d}',
    'cs.motifTitre': 'Motivo de esta decisión', 'cs.motifAide': 'Misión o servicio que justifica la decisión (mínimo 5 caracteres).', 'cs.confirmer': 'Confirmar', 'cs.annuler': 'Cancelar',
    'cs.okAccorde': 'Habilitación concedida a {n}.', 'cs.okRetire': 'Habilitación retirada a {n}.', 'cs.champ.telephone': 'teléfono', 'cs.champ.dossier': 'expediente administrativo',
    'cs.p.entetes': 'Cabeceras de seguridad estrictas: {l}', 'cs.p.csp': 'Política de contenido: solo los scripts listados (Shoelace, Phosphor, fuentes) y scripts en línea identificados por huella', 'cs.p.csrf': 'Escrituras aceptadas solo desde Terra Nova, en JSON',
    'cs.p.debit': 'Límite «{n}»: {m} cada {d} min', 'cs.p.chiffre': 'Teléfono y expediente cifrados en reposo ({a})', 'cs.p.cle': 'Clave de cifrado proporcionada por el entorno del servidor', 'cs.p.cleFichier': 'Clave de cifrado guardada fuera del código (archivo junto a la base)',
    'cs.p.hsts': 'HTTPS obligatorio (HSTS) en línea', 'cs.p.filtre': 'Campos reservados nunca enviados a la página (filtrado en el servidor)', 'cs.p.hash': 'Contraseñas y códigos con hash (scrypt), bloqueo progresivo'
  };
  const AR = {
    'cs.surtitre': 'مركز الأمن الرقمي', 'cs.titre': 'مركز الأمان', 'cs.sous': 'المحاولات التي صدّتها المنصة، والحمايات المفعّلة، والتأهيلات للبيانات المحمية، وسجل كل اطلاع.',
    'cs.blocages': 'المحاولات المحظورة', 'cs.blocagesD': 'طلبات من موقع آخر، محاولات متتالية، بيانات مشوّهة، وصول مرفوض. عناوين IP مختصرة.',
    'cs.fType': 'النوع', 'cs.csv': 'تصدير (CSV)', 'cs.blocagesCap': 'سجل المحاولات المحظورة', 'cs.cDate': 'التاريخ', 'cs.cType': 'النوع', 'cs.cRequete': 'الطلب', 'cs.cOrigine': 'المصدر', 'cs.cDetail': 'التفاصيل',
    'cs.hab': 'التأهيل للبيانات المحمية', 'cs.habD': 'إضافة إلى الدور: لا يمكن إلا للأعوان المؤهلين عرض هاتف الساكن وملفه الإداري، مع ذكر السبب في كل مرة. المسؤولون مؤهلون بحكم دورهم.',
    'cs.habCap': 'الموظفون والتأهيلات', 'cs.hNom': 'الشخص', 'cs.hRole': 'الدور', 'cs.hEtat': 'التأهيل', 'cs.hDecision': 'القرار', 'cs.hAction': 'إجراء',
    'cs.acces': 'الاطلاع على البيانات المحمية', 'cs.accesD': 'من عرض ماذا، ومتى، ولماذا. لا يمكن تعديل هذا السجل.', 'cs.accesCap': 'سجل الاطلاع على البيانات المحمية',
    'cs.aAgent': 'العون', 'cs.aPersonne': 'الشخص المعني', 'cs.aChamps': 'البيانات', 'cs.aMotif': 'السبب', 'cs.prot': 'الحمايات المفعّلة',
    'cs.k24': 'محاولات محظورة (24 س)', 'cs.kDebit': 'موجات محاولات أوقفت (24 س)', 'cs.kCsrf': 'طلبات خارجية مرفوضة (24 س)', 'cs.kEchecs': 'دخول فاشل (24 س)', 'cs.kVerrou': 'حسابات مقفلة الآن', 'cs.kAcces': 'اطلاعات محمية (7 أيام)',
    'cs.t.tous': 'كل الأنواع', 'cs.t.debit': 'محاولات كثيرة', 'cs.t.csrf': 'طلب خارجي', 'cs.t.validation': 'بيانات غير صالحة', 'cs.t.acces': 'وصول مرفوض', 'cs.t.robot': 'إرسال آلي',
    'cs.nb': '{n} محاولة معروضة.', 'cs.aucun': 'لا توجد محاولات محظورة. كل شيء هادئ.', 'cs.aucunAcces': 'لا يوجد اطلاع على بيانات محمية بعد.',
    'cs.habOui': 'مؤهل', 'cs.habNon': 'غير مؤهل', 'cs.habRole': 'مؤهل (مسؤول)', 'cs.accorder': 'منح', 'cs.retirer': 'سحب', 'cs.par': 'من طرف {p}، {d}',
    'cs.motifTitre': 'سبب هذا القرار', 'cs.motifAide': 'المهمة أو المصلحة التي تبرر القرار (5 أحرف على الأقل).', 'cs.confirmer': 'تأكيد', 'cs.annuler': 'إلغاء',
    'cs.okAccorde': 'تم منح التأهيل إلى {n}.', 'cs.okRetire': 'تم سحب التأهيل من {n}.', 'cs.champ.telephone': 'الهاتف', 'cs.champ.dossier': 'الملف الإداري',
    'cs.p.entetes': 'ترويسات أمان صارمة: {l}', 'cs.p.csp': 'سياسة المحتوى: البرامج المدرجة فقط (Shoelace وPhosphor والخطوط) والبرامج المضمّنة المعرّفة ببصمتها', 'cs.p.csrf': 'لا تُقبل الكتابة إلا من تيرا نوفا نفسها وبصيغة JSON',
    'cs.p.debit': 'حد «{n}»: {m} كل {d} دقيقة', 'cs.p.chiffre': 'الهاتف والملف الإداري مشفّران في قاعدة البيانات ({a})', 'cs.p.cle': 'مفتاح التشفير مقدَّم من بيئة الخادم', 'cs.p.cleFichier': 'مفتاح التشفير محفوظ خارج الشيفرة (ملف بجانب قاعدة البيانات)',
    'cs.p.hsts': 'HTTPS إلزامي (HSTS) على الإنترنت', 'cs.p.filtre': 'الحقول المحمية لا تُرسل أبداً إلى الصفحة (تصفية في الخادم)', 'cs.p.hash': 'كلمات المرور والرموز مجزّأة (scrypt) مع قفل تدريجي'
  };
  EN['cs.resume24'] = 'Summary of the last 24 hours'; ES['cs.resume24'] = 'Resumen de las últimas 24 horas'; AR['cs.resume24'] = 'ملخص آخر 24 ساعة';
  NT.i18n.ajouter({ fr: { 'cs.resume24': 'Résumé des dernières 24 heures' }, en: EN, es: ES, ar: AR });
  const L = (cle, fr, vars) => NT.t(cle, vars, fr);
  const E = s => NT.ui.echap(s);
  const $ = s => document.querySelector(s);
  const TYPES = { debit: ['ph-gauge', 'Trop de tentatives'], csrf: ['ph-arrows-left-right', 'Requête extérieure'], validation: ['ph-brackets-curly', 'Données invalides'], acces: ['ph-prohibit', 'Accès refusé'], robot: ['ph-robot', 'Envoi automatique'] };   // vague 16 (F81)
  const MOTIFS = { instruction: 'Instruction d’une demande', contact: 'Contact au sujet du dossier', eligibilite: 'Vérification d’une aide', habitant: 'À la demande de l’habitant', urgence: 'Situation d’urgence', autre: 'Autre motif' };
  const typeLib = t => L('cs.t.' + t, (TYPES[t] || ['', t])[1]);
  const kpi = (v, lib, fort) => `<div class="kpi${fort ? ' fort' : ''}"><div class="valeur">${E(v)}</div><div class="libelle">${E(lib)}</div></div>`;
  let donnees = null, hab = null;

  function charger() {
    const a = NT.api('GET', '/api/bouclier'), b = NT.api('GET', '/api/habilitations');
    donnees = a.statut === 200 ? a.donnees : null;
    hab = b.statut === 200 ? b.donnees : null;
  }
  function rendreKpis() {
    if (!donnees) return;
    const p = donnees.parType || {};
    $('#cs-kpis').innerHTML = kpi(donnees.total24h, L('cs.k24', 'Tentatives bloquées (24 h)'), donnees.total24h > 0) + kpi(p.debit || 0, L('cs.kDebit', 'Rafales stoppées (24 h)')) +
      kpi(p.csrf || 0, L('cs.kCsrf', 'Requêtes extérieures refusées (24 h)')) + kpi(donnees.echecs24h, L('cs.kEchecs', 'Connexions échouées (24 h)')) +
      kpi(donnees.verrouilles.length, L('cs.kVerrou', 'Comptes verrouillés en ce moment'), donnees.verrouilles.length > 0) + kpi(donnees.acces7j, L('cs.kAcces', 'Consultations réservées (7 jours)'));
  }
  function filtres() {
    $('#cs-type').innerHTML = `<option value="">${E(L('cs.t.tous', 'Tous les types'))}</option>` + Object.keys(TYPES).map(t => `<option value="${t}">${E(typeLib(t))}</option>`).join('');
    $('#cs-type').addEventListener('change', rendreBlocages);
  }
  const visibles = () => { const t = $('#cs-type').value; return (donnees ? donnees.blocages : []).filter(b => !t || b.type === t); };
  function rendreBlocages() {
    const l = visibles();
    $('#cs-nb').textContent = L('cs.nb', '{n} tentative(s) affichée(s).', { n: l.length });
    $('#cs-blocages').innerHTML = l.length ? l.slice(0, 300).map(b => `<tr>
      <td data-label="${E(L('cs.cDate', 'Date'))}"><time datetime="${E(b.date)}">${E(NT.ui.dateHeure(b.date))}</time></td>
      <td data-label="${E(L('cs.cType', 'Type'))}"><span class="type-blocage ${E(b.type)}"><i class="ph-duotone ${(TYPES[b.type] || ['ph-shield'])[0]}" aria-hidden="true"></i>${E(typeLib(b.type))}</span></td>
      <td data-label="${E(L('cs.cRequete', 'Requête'))}"><code>${E(b.methode)} ${E(b.chemin)}</code></td>
      <td data-label="${E(L('cs.cOrigine', 'Origine'))}"><code>${E(b.ip)}</code>${b.compte ? `<br><span class="doux">${E(b.compte)}</span>` : ''}</td>
      <td data-label="${E(L('cs.cDetail', 'Détail'))}">${E(b.detail)}</td></tr>`).join('')
      : `<tr><td colspan="5"><p class="vide">${E(L('cs.aucun', 'Aucune tentative bloquée. Tout est calme.'))}</p></td></tr>`;
  }
  function rendreHab() {
    if (!hab) return;
    $('#cs-hab').innerHTML = hab.personnel.map(p => {
      const etat = p.parRole ? `<span class="badge-hab oui"><i class="ph-duotone ph-shield-check" aria-hidden="true"></i>${E(L('cs.habRole', 'Habilité (administrateur)'))}</span>`
        : p.habilite ? `<span class="badge-hab oui"><i class="ph-duotone ph-shield-check" aria-hidden="true"></i>${E(L('cs.habOui', 'Habilité'))}</span>`
          : `<span class="badge-hab non"><i class="ph-duotone ph-shield-slash" aria-hidden="true"></i>${E(L('cs.habNon', 'Non habilité'))}</span>`;
      const h = p.habilitation;
      return `<tr><td data-label="${E(L('cs.hNom', 'Personne'))}"><strong>${E(p.nom)}</strong><br><span class="doux">${E(p.email)}</span></td>
        <td data-label="${E(L('cs.hRole', 'Rôle'))}"><span class="badge-role">${E(L('role.' + p.role, p.role))}</span></td>
        <td data-label="${E(L('cs.hEtat', 'Habilitation'))}">${etat}</td>
        <td data-label="${E(L('cs.hDecision', 'Décision'))}">${h ? `${E(h.motif)}<br><span class="doux">${E(L('cs.par', 'par {p}, {d}', { p: h.par, d: NT.ui.date(h.le) }))}</span>` : '—'}</td>
        <td data-label="${E(L('cs.hAction', 'Action'))}">${p.parRole ? '—' : `<button class="btn petit" type="button" data-hab="${E(p.id)}" data-active="${p.habilite ? '0' : '1'}">${E(p.habilite ? L('cs.retirer', 'Retirer') : L('cs.accorder', 'Accorder'))}</button>`}</td></tr>`;
    }).join('');
    const acces = hab.acces || [];
    $('#cs-acces').innerHTML = acces.length ? acces.map(a => `<tr>
      <td data-label="${E(L('cs.cDate', 'Date'))}"><time datetime="${E(a.date)}">${E(NT.ui.dateHeure(a.date))}</time></td>
      <td data-label="${E(L('cs.aAgent', 'Agent'))}">${E(a.agentNom)}</td>
      <td data-label="${E(L('cs.aPersonne', 'Personne concernée'))}">${E(a.cibleNom)}</td>
      <td data-label="${E(L('cs.aChamps', 'Données'))}">${E((a.champs || []).map(c => L('cs.champ.' + c, c === 'dossier' ? 'dossier administratif' : 'téléphone')).join(', '))}</td>
      <td data-label="${E(L('cs.aMotif', 'Motif'))}">${E(L('sens.m.' + a.motif, MOTIFS[a.motif] || a.motif))}${a.precision ? `<br><span class="doux">${E(a.precision)}</span>` : ''}</td></tr>`).join('')
      : `<tr><td colspan="5"><p class="vide">${E(L('cs.aucunAcces', 'Aucune consultation de données réservées pour le moment.'))}</p></td></tr>`;
  }
  function rendreProtections() {
    if (!donnees) return;
    const p = donnees.protections;
    const items = [
      L('cs.p.entetes', 'En-têtes de sécurité stricts : {l}', { l: p.entetes.join(', ') }),
      L('cs.p.csp', 'Politique de contenu : seuls les scripts listés (Shoelace, Phosphor, polices) et les scripts en ligne identifiés par empreinte'),
      L('cs.p.csrf', 'Écritures acceptées seulement depuis Terra Nova elle-même, en JSON'),
      ...p.regles.map(r => L('cs.p.debit', 'Limite « {n} » : {m} par {d} min', { n: r.nom, m: r.max, d: r.minutes })),
      L('cs.p.chiffre', 'Téléphone et dossier administratif chiffrés au repos ({a})', { a: p.chiffrement }),
      p.cleEnv ? L('cs.p.cle', 'Clé de chiffrement fournie par l’environnement du serveur') : L('cs.p.cleFichier', 'Clé de chiffrement gardée hors du code (fichier à côté de la base)'),
      L('cs.p.filtre', 'Champs réservés jamais envoyés à la page (filtrage serveur)'),
      L('cs.p.hash', 'Mots de passe et codes hachés (scrypt), verrouillage progressif'),
      L('cs.p.hsts', 'HTTPS imposé (HSTS) en ligne')
    ];
    $('#cs-prot').innerHTML = items.map(t => `<li><i class="ph-duotone ph-check-circle" aria-hidden="true"></i><span>${E(t)}</span></li>`).join('');
  }
  function exporter() {
    const cel = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    const lignes = [['date', 'type', 'methode', 'chemin', 'ip', 'compte', 'detail']].concat(visibles().map(b => [b.date, b.type, b.methode, b.chemin, b.ip, b.compte, b.detail]));
    const blob = new Blob(['﻿' + lignes.map(l => l.map(cel).join(';')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'tentatives-bloquees-terra-nova.csv' });
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  /* Accorder / retirer une habilitation : motif obligatoire */
  let dialogue = null;
  function decider(id, active) {
    const p = hab.personnel.find(x => x.id === id); if (!p) return;
    if (!dialogue) {
      dialogue = document.createElement('sl-dialog');
      dialogue.innerHTML = `<form id="cs-form" novalidate><div class="champ"><label for="cs-motif">${E(L('cs.motifTitre', 'Motif de cette décision'))}</label>
        <textarea id="cs-motif" rows="3" maxlength="300" aria-describedby="cs-motif-aide"></textarea><p class="aide" id="cs-motif-aide">${E(L('cs.motifAide', 'Mission ou service qui justifie la décision (5 caractères minimum).'))}</p>
        <p class="erreur" id="cs-erreur" role="alert"></p></div></form>
        <sl-button slot="footer" id="cs-annuler">${E(L('cs.annuler', 'Annuler'))}</sl-button><sl-button slot="footer" variant="primary" id="cs-ok">${E(L('cs.confirmer', 'Confirmer'))}</sl-button>`;
      document.body.append(dialogue);
      dialogue.querySelector('#cs-annuler').addEventListener('click', () => dialogue.hide());
      dialogue.querySelector('#cs-form').addEventListener('submit', e => { e.preventDefault(); dialogue.querySelector('#cs-ok').click(); });
      dialogue.querySelector('#cs-ok').addEventListener('click', () => {
        const d = dialogue.dataset;
        const motif = dialogue.querySelector('#cs-motif').value.trim();
        const err = dialogue.querySelector('#cs-erreur');
        if (motif.length < 5) { err.textContent = L('cs.motifAide', 'Mission ou service qui justifie la décision (5 caractères minimum).'); return; }
        const r = NT.api('POST', '/api/habilitations/' + encodeURIComponent(d.id), { active: d.active === '1', motif });
        if (r.statut !== 200) { err.textContent = (r.donnees && r.donnees.erreur) || 'Action impossible.'; return; }
        dialogue.hide();
        NT.ui.toast(d.active === '1' ? L('cs.okAccorde', 'Habilitation accordée à {n}.', { n: d.nom }) : L('cs.okRetire', 'Habilitation retirée à {n}.', { n: d.nom }), 'success');
        charger(); rendreKpis(); rendreHab();
      });
    }
    Object.assign(dialogue.dataset, { id, active: active ? '1' : '0', nom: p.nom });
    dialogue.label = (active ? L('cs.accorder', 'Accorder') : L('cs.retirer', 'Retirer')) + ' — ' + p.nom;
    dialogue.querySelector('#cs-form').reset();
    dialogue.querySelector('#cs-erreur').textContent = '';
    customElements.whenDefined('sl-dialog').then(() => dialogue.show());
  }

  NT.pret(() => {
    charger();
    filtres();
    rendreKpis(); rendreBlocages(); rendreHab(); rendreProtections();
    $('#cs-csv').addEventListener('click', exporter);
    $('#cs-hab').addEventListener('click', e => { const b = e.target.closest('[data-hab]'); if (b) decider(b.dataset.hab, b.dataset.active === '1'); });
  });
})();
