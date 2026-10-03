/* Terra Nova — F70 : données administratives réservées aux agents habilités.
   Le serveur n'envoie jamais ces champs dans l'état de la page (téléphone masqué, dossier remplacé par la liste
   de ses rubriques). Un agent habilité les affiche à la demande, avec un motif obligatoire : chaque consultation
   est journalisée (qui, quand, pourquoi). Un agent non habilité voit « Accès réservé aux agents habilités ».
   Utilisé par le tiroir « Détail du compte » de admin-comptes.html (NT.sensible.telephone / NT.sensible.dossier). */
(function () {
  'use strict';
  const NT = window.NT;
  NT.i18n.ajouter({
    fr: {},
    en: { 'sens.reserve': 'Restricted to authorised staff', 'sens.afficher': 'Show', 'sens.afficherDossier': 'Show the file', 'sens.dossier': 'Administrative file',
      'sens.dossierAide': 'Restricted data: encrypted, never sent to the page, shown on request with a reason. Each access is logged.', 'sens.aucun': 'No administrative file.',
      'sens.f.naissance': 'Date of birth', 'sens.f.situation': 'Family situation', 'sens.f.quotientFamilial': 'Family quotient', 'sens.f.numeroAllocataire': 'Benefit number', 'sens.f.aides': 'Current benefits', 'sens.f.noteService': 'Service note',
      'sens.titre': 'Why are you viewing this data?', 'sens.intro': 'This access is recorded in the log (who, when, why). The person can find out how many times their file was consulted.',
      'sens.m.instruction': 'Processing a request from this resident', 'sens.m.contact': 'Contacting the resident about their file', 'sens.m.eligibilite': 'Checking eligibility for a benefit', 'sens.m.habitant': 'At the resident’s request (present at the desk)', 'sens.m.urgence': 'Emergency (heatwave, flood…)', 'sens.m.autre': 'Other reason (please specify)',
      'sens.precision': 'Details', 'sens.precisionAide': 'Required for “Other reason” (10 characters minimum).', 'sens.valider': 'Show and log', 'sens.annuler': 'Cancel',
      'sens.choisir': 'Choose a reason.', 'sens.preciser': 'Specify the reason (10 characters minimum).', 'sens.consulte': 'Shown at {h} · access logged ({m})', 'sens.ok': 'Data shown. Your access has been logged.', 'sens.vide': 'Not provided' },
    es: { 'sens.reserve': 'Acceso reservado al personal habilitado', 'sens.afficher': 'Mostrar', 'sens.afficherDossier': 'Mostrar el expediente', 'sens.dossier': 'Expediente administrativo',
      'sens.dossierAide': 'Datos reservados: cifrados, nunca enviados a la página, mostrados a petición con un motivo. Cada consulta queda registrada.', 'sens.aucun': 'Sin expediente administrativo.',
      'sens.f.naissance': 'Fecha de nacimiento', 'sens.f.situation': 'Situación familiar', 'sens.f.quotientFamilial': 'Cociente familiar', 'sens.f.numeroAllocataire': 'N.º de beneficiario', 'sens.f.aides': 'Ayudas en curso', 'sens.f.noteService': 'Nota del servicio',
      'sens.titre': '¿Por qué consulta estos datos?', 'sens.intro': 'Esta consulta queda registrada (quién, cuándo, por qué). La persona puede saber cuántas veces se consultó su expediente.',
      'sens.m.instruction': 'Tramitar una solicitud de este vecino', 'sens.m.contact': 'Contactar al vecino sobre su expediente', 'sens.m.eligibilite': 'Verificar el derecho a una ayuda', 'sens.m.habitant': 'A petición del vecino (presente en la ventanilla)', 'sens.m.urgence': 'Urgencia (ola de calor, crecida…)', 'sens.m.autre': 'Otro motivo (precisar)',
      'sens.precision': 'Precisión', 'sens.precisionAide': 'Obligatoria para «Otro motivo» (mínimo 10 caracteres).', 'sens.valider': 'Mostrar y registrar', 'sens.annuler': 'Cancelar',
      'sens.choisir': 'Elija un motivo.', 'sens.preciser': 'Precise el motivo (mínimo 10 caracteres).', 'sens.consulte': 'Mostrado a las {h} · consulta registrada ({m})', 'sens.ok': 'Datos mostrados. Su consulta ha quedado registrada.', 'sens.vide': 'No indicado' },
    ar: { 'sens.reserve': 'الوصول مقصور على الأعوان المؤهلين', 'sens.afficher': 'عرض', 'sens.afficherDossier': 'عرض الملف', 'sens.dossier': 'الملف الإداري',
      'sens.dossierAide': 'بيانات محمية: مشفّرة، لا تُرسل أبداً إلى الصفحة، وتُعرض عند الطلب مع ذكر السبب. كل اطلاع يُسجَّل.', 'sens.aucun': 'لا يوجد ملف إداري.',
      'sens.f.naissance': 'تاريخ الميلاد', 'sens.f.situation': 'الوضع العائلي', 'sens.f.quotientFamilial': 'الحاصل العائلي', 'sens.f.numeroAllocataire': 'رقم المستفيد', 'sens.f.aides': 'المساعدات الجارية', 'sens.f.noteService': 'ملاحظة المصلحة',
      'sens.titre': 'لماذا تطّلع على هذه البيانات؟', 'sens.intro': 'يُسجَّل هذا الاطلاع (من، متى، لماذا). ويمكن للشخص معرفة عدد مرات الاطلاع على ملفه.',
      'sens.m.instruction': 'معالجة طلب من هذا الساكن', 'sens.m.contact': 'الاتصال بالساكن بخصوص ملفه', 'sens.m.eligibilite': 'التحقق من الأهلية لمساعدة', 'sens.m.habitant': 'بطلب من الساكن (حاضر في الشباك)', 'sens.m.urgence': 'حالة طارئة (موجة حر، فيضان…)', 'sens.m.autre': 'سبب آخر (يُرجى التوضيح)',
      'sens.precision': 'توضيح', 'sens.precisionAide': 'إلزامي عند اختيار «سبب آخر» (10 أحرف على الأقل).', 'sens.valider': 'عرض وتسجيل', 'sens.annuler': 'إلغاء',
      'sens.choisir': 'اختر سبباً.', 'sens.preciser': 'وضّح السبب (10 أحرف على الأقل).', 'sens.consulte': 'عُرض في {h} · تم تسجيل الاطلاع ({m})', 'sens.ok': 'تم عرض البيانات وتسجيل اطلاعك.', 'sens.vide': 'غير مذكور' }
  });
  const L = (cle, fr, vars) => NT.t(cle, vars, fr);
  const E = s => NT.ui.echap(s);
  const CHAMPS = { naissance: 'Date de naissance', situation: 'Situation familiale', quotientFamilial: 'Quotient familial', numeroAllocataire: 'N° d’allocataire', aides: 'Aides en cours', noteService: 'Note du service' };
  const MOTIFS = { instruction: 'Instruction d’une demande de l’habitant', contact: 'Contacter l’habitant au sujet de son dossier', eligibilite: 'Vérifier l’éligibilité à une aide',
    habitant: 'À la demande de l’habitant (présent au guichet)', urgence: 'Situation d’urgence (canicule, crue…)', autre: 'Autre motif (à préciser)' };
  const moi = () => NT.auth.utilisateur();
  const habilite = () => { const u = moi(); return !!u && (u.role === 'admin' || (u.role === 'agent' && !!(u.habilitation && u.habilitation.active))); };
  const reserve = () => `<span class="sens-reserve"><i class="ph-duotone ph-lock-key" aria-hidden="true"></i>${E(L('sens.reserve', 'Accès réservé aux agents habilités'))}</span>`;

  const sensible = {
    habilite,
    telephone(u) {
      if (!u.telephone) return '—';
      if (!u.telephoneMasque) return E(u.telephone);
      return `<span class="sens-ligne" data-sens-tel="${E(u.id)}"><span class="sens-masque">${E(u.telephone)}</span>` +
        (habilite() ? `<button class="btn petit" type="button" data-reveler="${E(u.id)}" data-champs="telephone">${E(L('sens.afficher', 'Afficher'))}</button>` : reserve()) + '</span>';
    },
    dossier(u) {
      const rubriques = u.dossierProtege || [];
      const tete = `<h3><i class="ph-duotone ph-folder-lock" aria-hidden="true"></i> ${E(L('sens.dossier', 'Dossier administratif'))}</h3>`;
      if (!rubriques.length) return `<section class="sens-dossier">${tete}<p class="doux">${E(L('sens.aucun', 'Aucun dossier administratif.'))}</p></section>`;
      return `<section class="sens-dossier" data-sens-dossier="${E(u.id)}">${tete}<p class="doux">${E(L('sens.dossierAide', 'Données réservées : chiffrées, jamais envoyées à la page, affichées à la demande avec un motif. Chaque consultation est journalisée.'))}</p>` +
        `<dl class="fiche">${Object.keys(CHAMPS).filter(k => rubriques.includes(k)).map(k => `<div><dt>${E(L('sens.f.' + k, CHAMPS[k]))}</dt><dd data-champ="${k}"><span class="sens-masque">••••••</span></dd></div>`).join('')}</dl>` +
        (habilite() ? `<button class="btn" type="button" data-reveler="${E(u.id)}" data-champs="dossier"><i class="ph-duotone ph-eye" aria-hidden="true"></i>${E(L('sens.afficherDossier', 'Afficher le dossier'))}</button>` : `<p>${reserve()}</p>`) +
        '<p class="doux sens-trace" aria-live="polite"></p></section>';
    }
  };
  NT.sensible = sensible;

  /* Fenêtre « Pourquoi consultez-vous ces données ? » */
  let dialogue = null, cible = null;
  function ouvrir(bouton) {
    cible = { id: bouton.dataset.reveler, champs: bouton.dataset.champs.split(','), bouton };
    if (!dialogue) {
      dialogue = document.createElement('sl-dialog');
      dialogue.label = L('sens.titre', 'Pourquoi consultez-vous ces données ?');
      dialogue.innerHTML = `<form id="sens-form" novalidate><p class="doux">${E(L('sens.intro', 'Cette consultation est enregistrée au journal (qui, quand, pourquoi). La personne peut savoir combien de fois son dossier a été consulté.'))}</p>
        <fieldset class="sans-cadre sens-motifs"><legend class="sr-only">${E(L('sens.titre', 'Pourquoi consultez-vous ces données ?'))}</legend>
        ${Object.keys(MOTIFS).map(k => `<label class="sens-motif"><input type="radio" name="sens-motif" value="${k}"> ${E(L('sens.m.' + k, MOTIFS[k]))}</label>`).join('')}</fieldset>
        <div class="champ"><label for="sens-precision">${E(L('sens.precision', 'Précision'))}</label><textarea id="sens-precision" rows="2" maxlength="300" aria-describedby="sens-precision-aide"></textarea>
        <p class="aide" id="sens-precision-aide">${E(L('sens.precisionAide', 'Obligatoire pour « Autre motif » (10 caractères minimum).'))}</p></div>
        <p class="erreur" id="sens-erreur" role="alert"></p></form>
        <sl-button slot="footer" id="sens-annuler">${E(L('sens.annuler', 'Annuler'))}</sl-button>
        <sl-button slot="footer" variant="primary" id="sens-valider">${E(L('sens.valider', 'Afficher et journaliser'))}</sl-button>`;
      document.body.append(dialogue);
      dialogue.querySelector('#sens-annuler').addEventListener('click', () => dialogue.hide());
      dialogue.querySelector('#sens-valider').addEventListener('click', valider);
      dialogue.querySelector('#sens-form').addEventListener('submit', e => { e.preventDefault(); valider(); });
      dialogue.addEventListener('sl-after-hide', e => { if (e.target === dialogue && cible && cible.bouton.isConnected) cible.bouton.focus(); });
    }
    dialogue.querySelector('#sens-form').reset();
    dialogue.querySelector('#sens-erreur').textContent = '';
    customElements.whenDefined('sl-dialog').then(() => dialogue.show());
  }
  function valider() {
    const choisi = dialogue.querySelector('input[name="sens-motif"]:checked');
    const precision = dialogue.querySelector('#sens-precision').value.trim();
    const err = dialogue.querySelector('#sens-erreur');
    if (!choisi) { err.textContent = L('sens.choisir', 'Choisissez un motif.'); return; }
    if (choisi.value === 'autre' && precision.length < 10) { err.textContent = L('sens.preciser', 'Précisez le motif (10 caractères minimum).'); dialogue.querySelector('#sens-precision').focus(); return; }
    const r = NT.api('POST', '/api/sensible/' + encodeURIComponent(cible.id), { motif: choisi.value, precision, champs: cible.champs });
    if (r.statut !== 200 || !r.donnees || !r.donnees.ok) { err.textContent = (r.donnees && r.donnees.erreur) || 'Action impossible.'; return; }
    const d = r.donnees.donnees;
    const heure = new Date(r.donnees.acces.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    const trace = L('sens.consulte', 'Affiché à {h} · consultation journalisée ({m})', { h: heure, m: L('sens.m.' + choisi.value, MOTIFS[choisi.value]) });
    if ('telephone' in d) document.querySelectorAll(`[data-sens-tel="${CSS.escape(cible.id)}"]`).forEach(el => { el.innerHTML = `<span class="sens-revele">${E(d.telephone || '—')}</span> <span class="doux">${E(trace)}</span>`; });
    if (d.dossier) document.querySelectorAll(`[data-sens-dossier="${CSS.escape(cible.id)}"]`).forEach(sec => {
      sec.querySelectorAll('[data-champ]').forEach(dd => { dd.innerHTML = `<span class="sens-revele">${E(d.dossier[dd.dataset.champ] || L('sens.vide', 'Non renseigné'))}</span>`; });
      const b = sec.querySelector('[data-reveler]'); if (b) b.remove();
      sec.querySelector('.sens-trace').textContent = trace;
    });
    dialogue.hide();
    NT.ui.toast(L('sens.ok', 'Données affichées. Votre consultation est journalisée.'), 'success');
  }
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-reveler]'); if (b) ouvrir(b); });
})();
