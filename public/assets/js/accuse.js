/* Terra Nova — vague 16 (F83) : accusé de réception d'une demande.
   - NT.accuse.bloc(d) : encadré « Accusé de réception » (confirmation d'envoi) ;
   - NT.accuse.suivi(zone, d) : rappel dans le suivi d'une demande ; NT.accuse.espace(zone) : « Mes accusés de réception » ;
   - accuse.html?id=NT-xxxx : accusé imprimable / PDF (habitant connecté, agent, ou visiteur avec ?code=) ;
   - verifier-accuse.html : vérification publique par référence + code, sans aucune donnée personnelle. */
(function () {
  'use strict';
  const NT = window.NT;
  NT.i18n.ajouter({
    fr: { 'acc.ariane': 'Accusé de réception', 'acc.titre': 'Accusé de réception', 'acc.sous': 'La preuve que la ville a bien reçu votre demande, à garder, imprimer ou citer.',
      'acc.ref': 'Référence', 'acc.recu': 'Reçue le', 'acc.service': 'Service destinataire', 'acc.type': 'Nature', 'acc.objet': 'Objet', 'acc.resume': 'Résumé', 'acc.canal': 'Canal',
      'acc.code': 'Code de vérification', 'acc.statut': 'État actuel', 'acc.aDeterminer': 'À déterminer : la mairie oriente la demande',
      'acc.phrase': 'La ville de Terra Nova certifie avoir reçu la demande ci-dessous. Toute personne peut vérifier cet accusé avec la référence et le code de vérification.',
      'acc.verifierSur': 'Vérifier cet accusé : {url}', 'acc.imprimer': 'Télécharger (PDF / imprimer)', 'acc.voir': 'Voir, imprimer ou enregistrer en PDF', 'acc.verifierLien': 'Vérifier un accusé de réception',
      'acc.aide': 'Pour le PDF, choisissez « Enregistrer au format PDF » dans la fenêtre d’impression.', 'acc.suivre': 'Suivre la demande', 'acc.introuvable': 'Accusé de réception introuvable',
      'acc.introuvableTxt': 'Cet accusé est réservé à la personne qui a envoyé la demande. Connectez-vous, ou ouvrez le lien reçu après l’envoi.', 'acc.seConnecter': 'Me connecter',
      'acc.garder': 'Gardez ce code : avec la référence, il prouve que la ville a reçu votre demande.', 'acc.edite': 'Document édité le {d}',
      'acc.mes': 'Mes accusés de réception', 'acc.mesD': 'Une preuve de réception pour chacune de vos demandes, à imprimer ou citer.', 'acc.aucun': 'Aucune demande envoyée pour le moment.',
      'acc.vTitre': 'Vérifier un accusé de réception', 'acc.vSous': 'Vous avez reçu un accusé de réception de Terra Nova ? Saisissez sa référence et son code pour vérifier qu’il est authentique.',
      'acc.vRef': 'Référence de la demande', 'acc.vRefAide': 'Exemple : NT-1041', 'acc.vCode': 'Code de vérification', 'acc.vCodeAide': '8 caractères, avec ou sans tiret. Exemple : K7PM-Q2XD',
      'acc.vBouton': 'Vérifier', 'acc.vOk': 'Accusé authentique', 'acc.vOkTxt': 'La ville de Terra Nova a bien reçu la demande {ref} le {d}.', 'acc.vKo': 'Accusé non reconnu',
      'acc.vPrive': 'Pour protéger la vie privée, cette vérification n’affiche ni le nom, ni le message de la personne.', 'acc.vErrRef': 'Indiquez une référence au format NT-1234.', 'acc.vErrCode': 'Le code compte 8 caractères (lettres et chiffres).' },
    en: { 'acc.ariane': 'Acknowledgement of receipt', 'acc.titre': 'Acknowledgement of receipt', 'acc.sous': 'Proof that the city received your request, to keep, print or quote.',
      'acc.ref': 'Reference', 'acc.recu': 'Received on', 'acc.service': 'Receiving service', 'acc.type': 'Type', 'acc.objet': 'Subject', 'acc.resume': 'Summary', 'acc.canal': 'Channel',
      'acc.code': 'Verification code', 'acc.statut': 'Current status', 'acc.aDeterminer': 'To be determined: the city hall routes the request',
      'acc.phrase': 'The city of Terra Nova certifies it received the request below. Anyone can check this acknowledgement with the reference and the verification code.',
      'acc.verifierSur': 'Check this acknowledgement: {url}', 'acc.imprimer': 'Download (PDF / print)', 'acc.voir': 'View, print or save as PDF', 'acc.verifierLien': 'Check an acknowledgement of receipt',
      'acc.aide': 'For a PDF, choose “Save as PDF” in the print window.', 'acc.suivre': 'Track the request', 'acc.introuvable': 'Acknowledgement not found',
      'acc.introuvableTxt': 'This acknowledgement is reserved for the person who sent the request. Sign in, or open the link received after sending.', 'acc.seConnecter': 'Sign in',
      'acc.garder': 'Keep this code: with the reference, it proves the city received your request.', 'acc.edite': 'Document issued on {d}',
      'acc.mes': 'My acknowledgements of receipt', 'acc.mesD': 'A proof of receipt for each of your requests, to print or quote.', 'acc.aucun': 'No request sent yet.',
      'acc.vTitre': 'Check an acknowledgement of receipt', 'acc.vSous': 'Received an acknowledgement from Terra Nova? Enter its reference and code to check it is genuine.',
      'acc.vRef': 'Request reference', 'acc.vRefAide': 'Example: NT-1041', 'acc.vCode': 'Verification code', 'acc.vCodeAide': '8 characters, with or without a dash. Example: K7PM-Q2XD',
      'acc.vBouton': 'Check', 'acc.vOk': 'Genuine acknowledgement', 'acc.vOkTxt': 'The city of Terra Nova received request {ref} on {d}.', 'acc.vKo': 'Acknowledgement not recognised',
      'acc.vPrive': 'To protect privacy, this check shows neither the name nor the message of the person.', 'acc.vErrRef': 'Enter a reference like NT-1234.', 'acc.vErrCode': 'The code has 8 characters (letters and digits).' },
    es: { 'acc.ariane': 'Acuse de recibo', 'acc.titre': 'Acuse de recibo', 'acc.sous': 'La prueba de que el ayuntamiento recibió su solicitud, para guardar, imprimir o citar.',
      'acc.ref': 'Referencia', 'acc.recu': 'Recibida el', 'acc.service': 'Servicio destinatario', 'acc.type': 'Tipo', 'acc.objet': 'Asunto', 'acc.resume': 'Resumen', 'acc.canal': 'Canal',
      'acc.code': 'Código de verificación', 'acc.statut': 'Estado actual', 'acc.aDeterminer': 'Por determinar: el ayuntamiento orienta la solicitud',
      'acc.phrase': 'La ciudad de Terra Nova certifica haber recibido la solicitud siguiente. Cualquier persona puede verificar este acuse con la referencia y el código de verificación.',
      'acc.verifierSur': 'Verificar este acuse: {url}', 'acc.imprimer': 'Descargar (PDF / imprimir)', 'acc.voir': 'Ver, imprimir o guardar en PDF', 'acc.verifierLien': 'Verificar un acuse de recibo',
      'acc.aide': 'Para el PDF, elija «Guardar como PDF» en la ventana de impresión.', 'acc.suivre': 'Seguir la solicitud', 'acc.introuvable': 'Acuse de recibo no encontrado',
      'acc.introuvableTxt': 'Este acuse está reservado a la persona que envió la solicitud. Inicie sesión o abra el enlace recibido tras el envío.', 'acc.seConnecter': 'Iniciar sesión',
      'acc.garder': 'Guarde este código: con la referencia, prueba que el ayuntamiento recibió su solicitud.', 'acc.edite': 'Documento emitido el {d}',
      'acc.mes': 'Mis acuses de recibo', 'acc.mesD': 'Una prueba de recepción para cada una de sus solicitudes, para imprimir o citar.', 'acc.aucun': 'Aún no ha enviado ninguna solicitud.',
      'acc.vTitre': 'Verificar un acuse de recibo', 'acc.vSous': '¿Ha recibido un acuse de recibo de Terra Nova? Introduzca su referencia y su código para comprobar que es auténtico.',
      'acc.vRef': 'Referencia de la solicitud', 'acc.vRefAide': 'Ejemplo: NT-1041', 'acc.vCode': 'Código de verificación', 'acc.vCodeAide': '8 caracteres, con o sin guion. Ejemplo: K7PM-Q2XD',
      'acc.vBouton': 'Verificar', 'acc.vOk': 'Acuse auténtico', 'acc.vOkTxt': 'La ciudad de Terra Nova recibió la solicitud {ref} el {d}.', 'acc.vKo': 'Acuse no reconocido',
      'acc.vPrive': 'Para proteger la privacidad, esta verificación no muestra ni el nombre ni el mensaje de la persona.', 'acc.vErrRef': 'Indique una referencia con el formato NT-1234.', 'acc.vErrCode': 'El código tiene 8 caracteres (letras y cifras).' },
    ar: { 'acc.ariane': 'إشعار بالاستلام', 'acc.titre': 'إشعار بالاستلام', 'acc.sous': 'إثبات أن المدينة استلمت طلبك، للاحتفاظ به أو طباعته أو الاستشهاد به.',
      'acc.ref': 'المرجع', 'acc.recu': 'استُلم في', 'acc.service': 'الخدمة المستلمة', 'acc.type': 'النوع', 'acc.objet': 'الموضوع', 'acc.resume': 'ملخص', 'acc.canal': 'القناة',
      'acc.code': 'رمز التحقق', 'acc.statut': 'الحالة الحالية', 'acc.aDeterminer': 'قيد التحديد: البلدية توجّه الطلب',
      'acc.phrase': 'تشهد مدينة تيرا نوفا أنها استلمت الطلب أدناه. يمكن لأي شخص التحقق من هذا الإشعار بالمرجع ورمز التحقق.',
      'acc.verifierSur': 'التحقق من هذا الإشعار: {url}', 'acc.imprimer': 'تنزيل (PDF / طباعة)', 'acc.voir': 'عرض أو طباعة أو حفظ بصيغة PDF', 'acc.verifierLien': 'التحقق من إشعار بالاستلام',
      'acc.aide': 'للحصول على PDF، اختر «حفظ بصيغة PDF» في نافذة الطباعة.', 'acc.suivre': 'متابعة الطلب', 'acc.introuvable': 'الإشعار غير موجود',
      'acc.introuvableTxt': 'هذا الإشعار مخصص للشخص الذي أرسل الطلب. سجّل الدخول أو افتح الرابط الذي وصلك بعد الإرسال.', 'acc.seConnecter': 'تسجيل الدخول',
      'acc.garder': 'احتفظ بهذا الرمز: مع المرجع، يثبت أن المدينة استلمت طلبك.', 'acc.edite': 'وثيقة صادرة في {d}',
      'acc.mes': 'إشعارات الاستلام الخاصة بي', 'acc.mesD': 'إثبات استلام لكل طلب من طلباتك، للطباعة أو الاستشهاد.', 'acc.aucun': 'لم ترسل أي طلب بعد.',
      'acc.vTitre': 'التحقق من إشعار بالاستلام', 'acc.vSous': 'هل وصلك إشعار بالاستلام من تيرا نوفا؟ أدخل مرجعه ورمزه للتحقق من صحته.',
      'acc.vRef': 'مرجع الطلب', 'acc.vRefAide': 'مثال: NT-1041', 'acc.vCode': 'رمز التحقق', 'acc.vCodeAide': '8 خانات، مع الشرطة أو بدونها. مثال: K7PM-Q2XD',
      'acc.vBouton': 'تحقق', 'acc.vOk': 'إشعار صحيح', 'acc.vOkTxt': 'استلمت مدينة تيرا نوفا الطلب {ref} في {d}.', 'acc.vKo': 'إشعار غير معروف',
      'acc.vPrive': 'حمايةً للخصوصية، لا يعرض هذا التحقق اسم الشخص ولا رسالته.', 'acc.vErrRef': 'أدخل مرجعاً بصيغة NT-1234.', 'acc.vErrCode': 'يتكون الرمز من 8 خانات (حروف وأرقام).' }
  });
  const t = (k, v) => NT.t(k, v);
  const e = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const locale = () => ({ fr: 'fr-FR', en: 'en-GB', es: 'es-ES', ar: 'ar' }[NT.i18n.langue] || 'fr-FR');
  const quand = iso => new Date(iso).toLocaleString(locale(), { dateStyle: 'long', timeStyle: 'short' });
  const TYPES_FR = { contact: ['Contact', 'Contact', 'Contacto', 'تواصل'], signalement: ['Signalement', 'Problem report', 'Aviso', 'بلاغ'], demarche: ['Démarche', 'Procedure', 'Trámite', 'إجراء'] };
  const typeLib = k => { const l = TYPES_FR[k] || TYPES_FR.contact; return l[['fr', 'en', 'es', 'ar'].indexOf(NT.i18n.langue)] || l[0]; };
  const nomService = (id, nom) => { const s = nom || (id && NT.services && NT.services.get(id) && NT.services.get(id).nom); return s ? NT.i18n.choisir(s) : t('acc.aDeterminer'); };
  const lien = (d, avecCode) => 'accuse.html?id=' + encodeURIComponent(d.id) + (avecCode && d.accuse ? '&code=' + encodeURIComponent(d.accuse.code) : '');

  const A = (NT.accuse = {});
  // Encadré affiché juste après l'envoi (demande.html)
  A.bloc = d => {
    if (!d || !d.accuse) return '';
    const u = NT.auth.utilisateur();
    return `<section class="tn-accuse" aria-labelledby="tn-acc-h">
      <h3 id="tn-acc-h"><i class="ph-duotone ph-seal-check" aria-hidden="true"></i>${e(t('acc.titre'))}</h3>
      <dl class="tn-accuse-dl">
        <dt>${e(t('acc.ref'))}</dt><dd><strong>${e(d.id)}</strong></dd>
        <dt>${e(t('acc.recu'))}</dt><dd>${e(quand(d.cree))}</dd>
        <dt>${e(t('acc.service'))}</dt><dd>${e(nomService(d.serviceId))}</dd>
        <dt>${e(t('acc.code'))}</dt><dd><code class="tn-code">${e(d.accuse.code)}</code></dd>
      </dl>
      <p class="doux">${e(t('acc.garder'))}</p>
      <p class="ligne"><a class="btn" href="${e(lien(d, !u))}"><i class="ph ph-printer" aria-hidden="true"></i>${e(t('acc.voir'))}</a>
        <a href="verifier-accuse.html?ref=${encodeURIComponent(d.id)}">${e(t('acc.verifierLien'))}</a></p>
    </section>`;
  };
  // Rappel dans le suivi d'une demande
  A.suivi = (zone, d) => {
    if (!zone || !d) return;
    const div = document.createElement('section');
    div.className = 'tn-accuse-suivi';
    div.setAttribute('aria-labelledby', 'tn-acc-s');
    div.innerHTML = `<h3 id="tn-acc-s"><i class="ph-duotone ph-seal-check" aria-hidden="true"></i> ${e(t('acc.titre'))}</h3>
      <p class="doux" style="margin:.2rem 0 .6rem">${e(t('acc.recu'))} ${e(quand(d.cree))}${d.accuse ? ` · ${e(t('acc.code'))} <code class="tn-code">${e(d.accuse.code)}</code>` : ''}</p>
      <a class="btn" href="${e(lien(d, false))}"><i class="ph ph-printer" aria-hidden="true"></i>${e(t('acc.voir'))}</a>`;
    zone.append(div);
  };
  // Espace citoyen : un accusé par demande
  A.espace = zone => {
    const u = NT.auth.utilisateur();
    if (!zone || !u || u.role !== 'citoyen') return;
    const l = NT.demandes.pour(u.id);
    zone.innerHTML = `<h2 id="tn-acc-esp"><i class="ph-duotone ph-seal-check" aria-hidden="true"></i> ${e(t('acc.mes'))}</h2>
      <p class="doux">${e(t('acc.mesD'))}</p>
      ${l.length ? `<ul class="tn-accuses">${l.slice(0, 20).map(d => `<li><a href="${e(lien(d, false))}"><strong>${e(d.id)}</strong> · ${e(d.objet)}</a>
        <span class="doux"> · ${e(quand(d.cree))}${d.accuse ? ` · <code class="tn-code">${e(d.accuse.code)}</code>` : ''}</span></li>`).join('')}</ul>`
        : `<p class="doux">${e(t('acc.aucun'))}</p>`}
      <p><a href="verifier-accuse.html">${e(t('acc.verifierLien'))}</a></p>`;
  };

  /* ---------- Page accuse.html ---------- */
  function pageAccuse() {
    const zone = document.getElementById('zone-accuse');
    const id = NT.ui.param('id') || '', code = NT.ui.param('code') || '';
    const r = NT.api('GET', '/api/accuses/' + encodeURIComponent(id) + (code ? '?code=' + encodeURIComponent(code) : ''));
    if (r.statut !== 200) {
      zone.innerHTML = `<div class="vide" role="alert"><i class="ph-duotone ph-lock-key" aria-hidden="true" style="font-size:2.5rem"></i>
        <h2>${e(t('acc.introuvable'))}</h2><p>${e(t('acc.introuvableTxt'))}</p>
        <p class="ligne" style="justify-content:center">${NT.auth.utilisateur() ? '' : `<a class="btn btn-primaire" href="connexion.html?retour=${encodeURIComponent(location.pathname.slice(1) + location.search)}">${e(t('acc.seConnecter'))}</a>`}
        <a class="btn" href="verifier-accuse.html">${e(t('acc.verifierLien'))}</a></p></div>`;
      document.getElementById('actions-accuse').hidden = true;
      return;
    }
    const v = r.donnees;
    const url = location.origin + v.verification;
    zone.innerHTML = `<article class="info-bloc tn-accuse-doc" aria-labelledby="tn-acc-doc">
      <header class="tn-accuse-entete">
        <img src="assets/img/logo-embleme-96.webp" alt="" width="48" height="48">
        <div><p class="tn-accuse-ville">Terra Nova</p><h2 id="tn-acc-doc">${e(t('acc.titre'))}</h2></div>
        <p class="tn-accuse-num">${e(v.reference)}</p>
      </header>
      <p>${e(t('acc.phrase'))}</p>
      <dl class="tn-accuse-dl">
        <dt>${e(t('acc.ref'))}</dt><dd><strong>${e(v.reference)}</strong></dd>
        <dt>${e(t('acc.recu'))}</dt><dd>${e(quand(v.recuLe))}</dd>
        <dt>${e(t('acc.service'))}</dt><dd>${e(nomService(v.serviceId, v.service))}</dd>
        <dt>${e(t('acc.type'))}</dt><dd>${e(typeLib(v.type))}</dd>
        ${v.objet ? `<dt>${e(t('acc.objet'))}</dt><dd>${e(v.objet)}</dd>` : ''}
        ${v.resume ? `<dt>${e(t('acc.resume'))}</dt><dd>${e(v.resume)}${v.resume.length >= 280 ? '…' : ''}</dd>` : ''}
        <dt>${e(t('acc.canal'))}</dt><dd>${e(v.canal)}</dd>
        <dt>${e(t('acc.statut'))}</dt><dd>${NT.ui.statut(v.statut)}</dd>
        <dt>${e(t('acc.code'))}</dt><dd><code class="tn-code tn-code-grand">${e(v.code)}</code></dd>
      </dl>
      <p class="tn-accuse-verif">${e(t('acc.verifierSur', { url }))}</p>
      <p class="doux tn-accuse-edition">${e(t('acc.edite', { d: quand(new Date().toISOString()) }))}</p>
    </article>`;
    const suivre = document.getElementById('lien-suivi');
    if (suivre && NT.auth.utilisateur()) { suivre.href = 'suivi.html?id=' + encodeURIComponent(v.reference); suivre.hidden = false; }
    document.title = t('acc.titre') + ' ' + v.reference + ' — Terra Nova';
  }

  /* ---------- Page verifier-accuse.html ---------- */
  function pageVerifier() {
    const f = document.getElementById('form-verifier'), ref = document.getElementById('v-ref'), code = document.getElementById('v-code'), res = document.getElementById('resultat');
    if (NT.ui.param('ref')) ref.value = NT.ui.param('ref');
    const err = (champ, msg) => { const p = document.getElementById('err-' + champ.id); p.textContent = msg; p.hidden = !msg; if (msg) champ.setAttribute('aria-invalid', 'true'); else champ.removeAttribute('aria-invalid'); };
    [ref, code].forEach(c => c.addEventListener('input', () => err(c, '')));
    f.addEventListener('submit', ev => {
      ev.preventDefault();
      const r1 = ref.value.trim().toUpperCase().replace(/\s+/g, ''), c1 = code.value.trim().toUpperCase().replace(/[^0-9A-Z]/g, '');
      err(ref, /^NT-\d{1,8}$/.test(r1) ? '' : t('acc.vErrRef'));
      err(code, c1.length === 8 ? '' : t('acc.vErrCode'));
      if (!/^NT-\d{1,8}$/.test(r1)) { ref.focus(); return; }
      if (c1.length !== 8) { code.focus(); return; }
      const r = NT.api('GET', '/api/accuses/verifier?ref=' + encodeURIComponent(r1) + '&code=' + encodeURIComponent(c1));
      if (r.statut === 200 && r.donnees && r.donnees.authentique) {
        const v = r.donnees;
        res.innerHTML = `<div class="tn-verif tn-verif-ok" role="status"><h2><i class="ph-duotone ph-seal-check" aria-hidden="true"></i> ${e(t('acc.vOk'))}</h2>
          <p>${e(t('acc.vOkTxt', { ref: v.reference, d: quand(v.recuLe) }))}</p>
          <dl class="tn-accuse-dl"><dt>${e(t('acc.service'))}</dt><dd>${e(nomService(v.serviceId, v.service))}</dd>
            <dt>${e(t('acc.type'))}</dt><dd>${e(typeLib(v.type))}</dd><dt>${e(t('acc.statut'))}</dt><dd>${NT.ui.statut(v.statut)}</dd></dl>
          <p class="doux">${e(t('acc.vPrive'))}</p></div>`;
      } else {
        res.innerHTML = `<div class="tn-verif tn-verif-ko" role="alert"><h2><i class="ph-duotone ph-warning-circle" aria-hidden="true"></i> ${e(t('acc.vKo'))}</h2>
          <p>${e((r.donnees && r.donnees.erreur) || '')}</p></div>`;
      }
      res.querySelector('h2').setAttribute('tabindex', '-1'); res.querySelector('h2').focus();
    });
  }

  NT.pret(() => {
    const p = document.body.dataset.page;
    if (p === 'accuse') {
      pageAccuse();
      const b = document.getElementById('btn-imprimer'); if (b) b.addEventListener('click', () => window.print());
    }
    if (p === 'verifier-accuse') pageVerifier();
    const hist = document.getElementById('historique');   // espace citoyen : « Mes accusés de réception »
    if (hist && NT.auth.aRole('citoyen') && !document.getElementById('mes-accuses')) {
      const sec = document.createElement('section');
      sec.className = 'bloc'; sec.id = 'mes-accuses'; sec.setAttribute('aria-labelledby', 'tn-acc-esp');
      const onglet = document.getElementById('pn-accuses');   // espace allégé : onglet « Accusés de réception »
      if (onglet) onglet.appendChild(sec); else hist.after(sec);
      A.espace(sec);
    }
  });
})();
