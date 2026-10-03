/* Terra Nova — F71 : inscription des nouveaux arrivants au guichet (agents)
   Une personne à la fois (formulaire qui se vide pour la suivante) ou un groupe (une ligne par personne).
   Le serveur crée l'identifiant TN-xxxxxx et un code provisoire, montrés UNE seule fois (gardés en mémoire de la page,
   jamais dans le navigateur) ; la fiche d'accueil s'affiche ou s'imprime dans la langue de la personne. */
(function () {
  'use strict';
  const NT = window.NT;
  const COMMUN = { en: { 'bv.prenom': 'First name', 'bv.nom': 'Last name', 'bv.tel': 'Phone', 'bv.facultatif': '(optional)', 'bv.quartier': 'Neighbourhood' },
    es: { 'bv.prenom': 'Nombre', 'bv.nom': 'Apellido', 'bv.tel': 'Teléfono', 'bv.facultatif': '(opcional)', 'bv.quartier': 'Barrio' },
    ar: { 'bv.prenom': 'الاسم', 'bv.nom': 'اللقب', 'bv.tel': 'الهاتف', 'bv.facultatif': '(اختياري)', 'bv.quartier': 'الحي' } };
  NT.i18n.ajouter({
    fr: {},
    en: Object.assign({ 'ga.surtitre': 'Newcomers reception service', 'ga.titre': 'Register at the desk', 'ga.sous': 'For people without an e-mail address: an identifier and a temporary code are created, and the welcome sheet is printed in the person’s language.',
      'ga.une': 'One person', 'ga.langue': 'Person’s language', 'ga.situation': 'Situation', 'ga.creer': 'Create the account and the sheet', 'ga.enchainer': 'After saving, the form is cleared for the next person.',
      'ga.lot': 'A group', 'ga.lotLabel': 'One person per line: first name ; last name ; phone ; language', 'ga.lotAide': 'Phone and language optional (fr, en, es or ar; French by default). A list copied from a spreadsheet works too. 50 people maximum per batch.',
      'ga.creerLot': 'Create all accounts', 'ga.inscrits': 'Registered during this session', 'ga.toutImprimer': 'Print all sheets',
      'ga.unique': 'Temporary codes are shown only here, once: print or show the sheet before leaving the page. The person will choose their own code when signing in for the first time.',
      'ga.aucun': 'Nobody has been registered during this session yet.', 'ga.apercu': '{n} person(s) ready to be registered.', 'ga.apercuErr': 'Line {l}: first name and last name required.',
      'ga.nsp': 'Not specified', 'ga.s.seul': 'On their own', 'ga.s.couple': 'Couple', 'ga.s.famille': 'Family with children', 'ga.choisirQuartier': 'Not known yet',
      'ga.code': 'Temporary code', 'ga.afficher': 'Show the sheet', 'ga.imprimer': 'Print', 'ga.ok': 'Account created: {id}.', 'ga.okLot': '{n} account(s) created, {e} error(s).',
      'ga.e.nom': 'First name and last name are required.', 'ga.e.vide': 'Add at least one line.', 'ga.e.trop': '50 people maximum per batch.', 'ga.erreurLigne': 'Line {l}' }, COMMUN.en),
    es: Object.assign({ 'ga.surtitre': 'Servicio de acogida de recién llegados', 'ga.titre': 'Inscribir en la ventanilla', 'ga.sous': 'Para las personas sin correo electrónico: se crean un identificador y un código provisional, y la ficha de bienvenida se imprime en el idioma de la persona.',
      'ga.une': 'Una persona', 'ga.langue': 'Idioma de la persona', 'ga.situation': 'Situación', 'ga.creer': 'Crear la cuenta y la ficha', 'ga.enchainer': 'Tras guardar, el formulario se vacía para la siguiente persona.',
      'ga.lot': 'Un grupo', 'ga.lotLabel': 'Una persona por línea: nombre ; apellido ; teléfono ; idioma', 'ga.lotAide': 'Teléfono e idioma opcionales (fr, en, es o ar; francés por defecto). También funciona una lista copiada de una hoja de cálculo. 50 personas como máximo por envío.',
      'ga.creerLot': 'Crear todas las cuentas', 'ga.inscrits': 'Inscritos durante esta sesión', 'ga.toutImprimer': 'Imprimir todas las fichas',
      'ga.unique': 'Los códigos provisionales solo se muestran aquí, una vez: imprima o muestre la ficha antes de salir de la página. La persona elegirá su propio código en su primera conexión.',
      'ga.aucun': 'Todavía no se ha inscrito a nadie en esta sesión.', 'ga.apercu': '{n} persona(s) lista(s) para inscribir.', 'ga.apercuErr': 'Línea {l}: nombre y apellido obligatorios.',
      'ga.nsp': 'Sin indicar', 'ga.s.seul': 'Sola', 'ga.s.couple': 'En pareja', 'ga.s.famille': 'Familia con hijos', 'ga.choisirQuartier': 'Todavía no se sabe',
      'ga.code': 'Código provisional', 'ga.afficher': 'Mostrar la ficha', 'ga.imprimer': 'Imprimir', 'ga.ok': 'Cuenta creada: {id}.', 'ga.okLot': '{n} cuenta(s) creada(s), {e} error(es).',
      'ga.e.nom': 'El nombre y el apellido son obligatorios.', 'ga.e.vide': 'Añada al menos una línea.', 'ga.e.trop': '50 personas como máximo por envío.', 'ga.erreurLigne': 'Línea {l}' }, COMMUN.es),
    ar: Object.assign({ 'ga.surtitre': 'مصلحة استقبال الوافدين الجدد', 'ga.titre': 'التسجيل في الشباك', 'ga.sous': 'للأشخاص الذين ليس لديهم بريد إلكتروني: يُنشأ معرّف ورمز مؤقت، وتُطبع بطاقة الاستقبال بلغة الشخص.',
      'ga.une': 'شخص واحد', 'ga.langue': 'لغة الشخص', 'ga.situation': 'الوضع', 'ga.creer': 'إنشاء الحساب والبطاقة', 'ga.enchainer': 'بعد الحفظ، يُفرغ النموذج للشخص التالي.',
      'ga.lot': 'مجموعة', 'ga.lotLabel': 'شخص في كل سطر: الاسم ؛ اللقب ؛ الهاتف ؛ اللغة', 'ga.lotAide': 'الهاتف واللغة اختياريان (fr أو en أو es أو ar؛ الفرنسية افتراضياً). تعمل أيضاً قائمة منسوخة من جدول. 50 شخصاً كحد أقصى في كل إرسال.',
      'ga.creerLot': 'إنشاء كل الحسابات', 'ga.inscrits': 'المسجلون خلال هذه الجلسة', 'ga.toutImprimer': 'طباعة كل البطاقات',
      'ga.unique': 'لا تظهر الرموز المؤقتة إلا هنا ومرة واحدة: اطبع البطاقة أو اعرضها قبل مغادرة الصفحة. سيختار الشخص رمزه الخاص عند أول دخول.',
      'ga.aucun': 'لم يُسجَّل أحد بعد خلال هذه الجلسة.', 'ga.apercu': '{n} شخص جاهز للتسجيل.', 'ga.apercuErr': 'السطر {l}: الاسم واللقب إلزاميان.',
      'ga.nsp': 'غير محدد', 'ga.s.seul': 'وحده', 'ga.s.couple': 'زوجان', 'ga.s.famille': 'عائلة مع أطفال', 'ga.choisirQuartier': 'غير معروف بعد',
      'ga.code': 'الرمز المؤقت', 'ga.afficher': 'عرض البطاقة', 'ga.imprimer': 'طباعة', 'ga.ok': 'تم إنشاء الحساب: {id}.', 'ga.okLot': 'تم إنشاء {n} حساب، {e} خطأ.',
      'ga.e.nom': 'الاسم واللقب إلزاميان.', 'ga.e.vide': 'أضف سطراً واحداً على الأقل.', 'ga.e.trop': '50 شخصاً كحد أقصى في كل إرسال.', 'ga.erreurLigne': 'السطر {l}' }, COMMUN.ar)
  });
  const L = (cle, fr, vars) => NT.t(cle, vars, fr);
  const E = s => NT.ui.echap(s);
  const $ = s => document.querySelector(s);
  const LANGUES = { fr: 'Français', en: 'English', es: 'Español', ar: 'العربية' };
  const inscrits = [];   // en mémoire seulement : les codes provisoires ne sont jamais stockés dans le navigateur
  const agent = () => { const u = NT.auth.utilisateur(); return u ? u.prenom + ' ' + u.nom : ''; };

  function rendre() {
    $('#aucun-inscrit').hidden = inscrits.length > 0;
    $('#tout-imprimer').hidden = !inscrits.some(p => p.ok);
    $('#inscrits').innerHTML = inscrits.map((p, i) => p.ok
      ? `<li class="inscrit"><div class="qui"><strong>${E(p.prenom)} ${E(p.nom)}</strong><span class="ident" dir="ltr">${E(p.identifiant)}</span>
          <span class="doux">${E(L('ga.code', 'Code provisoire'))} : <span class="code-saisie" dir="ltr">${E(p.code)}</span> · ${E(LANGUES[p.langue] || p.langue)}</span></div>
          <div class="actions"><button class="btn petit" type="button" data-voir="${i}"><i class="ph-duotone ph-eye" aria-hidden="true"></i>${E(L('ga.afficher', 'Afficher la fiche'))}</button>
          <button class="btn petit btn-primaire" type="button" data-imprimer="${i}"><i class="ph-duotone ph-printer" aria-hidden="true"></i>${E(L('ga.imprimer', 'Imprimer'))}</button></div></li>`
      : `<li class="inscrit echec"><div class="qui"><strong>${E(p.prenom || '—')} ${E(p.nom || '')}</strong><span class="doux">${E(L('ga.erreurLigne', 'Ligne {l}', { l: p.ligne }))} : ${E(p.erreur)}</span></div></li>`).reverse().join('');
  }
  function enregistrer(personnes) {
    const r = NT.api('POST', '/api/accueil/agent/inscrire', { personnes });
    if (r.statut !== 200 || !r.donnees) return { erreur: (r.donnees && r.donnees.erreur) || 'Action impossible.' };
    r.donnees.resultats.forEach(x => inscrits.push(Object.assign(x, { agent: agent() })));
    rendre();
    return r.donnees;
  }

  let dialogue = null;
  function voir(p) {
    if (!dialogue) { dialogue = document.createElement('sl-dialog'); dialogue.style.setProperty('--width', '46rem'); document.body.append(dialogue); }
    dialogue.label = p.prenom + ' ' + p.nom;
    dialogue.innerHTML = NT.ficheAccueil.html(p) + `<sl-button slot="footer" variant="primary" data-imp>${E(L('ga.imprimer', 'Imprimer'))}</sl-button>`;
    dialogue.querySelector('[data-imp]').addEventListener('click', () => NT.ficheAccueil.imprimer([p]));
    customElements.whenDefined('sl-dialog').then(() => dialogue.show());
  }

  // « Prénom ; Nom ; Téléphone ; Langue » — séparateurs ; , ou tabulation (copier-coller depuis un tableur)
  function lireLot(texte) {
    return texte.split(/\r?\n/).map(l => l.trim()).filter(Boolean).map((l, i) => {
      const c = l.split(/\t|;/).map(x => x.trim());
      const langue = (c[3] || '').toLowerCase().slice(0, 2);
      return { ligne: i + 1, prenom: c[0] || '', nom: c[1] || '', telephone: c[2] || '', langue: LANGUES[langue] ? langue : 'fr' };
    });
  }
  function apercu() {
    const l = lireLot($('#g-lot').value);
    const mauvaise = l.find(p => !p.prenom || !p.nom);
    $('#g-lot-apercu').textContent = !l.length ? '' : mauvaise ? L('ga.apercuErr', 'Ligne {l} : prénom et nom obligatoires.', { l: mauvaise.ligne }) : L('ga.apercu', '{n} personne(s) prête(s) à être inscrite(s).', { n: l.length });
  }
  const resume = (form, msg) => { form.querySelector('.resume-arr').textContent = msg || ''; };

  NT.pret(() => {
    const langueEcran = NT.i18n.langue;
    $('#g-langue').innerHTML = Object.entries(LANGUES).map(([c, n]) => `<option value="${c}" lang="${c}" ${c === langueEcran ? 'selected' : ''}>${E(n)}</option>`).join('');
    $('#g-quartier').innerHTML = `<option value="">${E(L('ga.choisirQuartier', 'Pas encore connu'))}</option>` + NT.QUARTIERS.map(q => `<option>${E(q)}</option>`).join('');
    $('#g-situation').innerHTML = `<option value="">${E(L('ga.nsp', 'Non précisée'))}</option>` + [['seul', 'Seule'], ['couple', 'En couple'], ['famille', 'Famille avec enfants']].map(([v, fr]) => `<option value="${v}">${E(L('ga.s.' + v, fr))}</option>`).join('');
    rendre();

    $('#form-une').addEventListener('submit', e => {
      e.preventDefault();
      const v = id => document.getElementById(id).value.trim();
      if (!v('g-prenom') || !v('g-nom')) { resume(e.target, L('ga.e.nom', 'Le prénom et le nom sont obligatoires.')); document.getElementById(v('g-prenom') ? 'g-nom' : 'g-prenom').focus(); return; }
      const r = enregistrer([{ prenom: v('g-prenom'), nom: v('g-nom'), telephone: v('g-tel'), langue: v('g-langue'), quartier: v('g-quartier'), situation: v('g-situation') }]);
      if (r.erreur) { resume(e.target, r.erreur); return; }
      const res = r.resultats[0];
      if (!res.ok) { resume(e.target, res.erreur); return; }
      resume(e.target, '');
      NT.ui.toast(L('ga.ok', 'Compte créé : {id}.', { id: res.identifiant }), 'success');
      ['g-prenom', 'g-nom', 'g-tel'].forEach(id => { document.getElementById(id).value = ''; });
      $('#g-situation').value = '';
      voir(inscrits[inscrits.length - 1]);
      document.getElementById('g-prenom').focus();
    });
    $('#g-lot').addEventListener('input', apercu);
    $('#form-lot').addEventListener('submit', e => {
      e.preventDefault();
      const l = lireLot($('#g-lot').value);
      if (!l.length) { resume(e.target, L('ga.e.vide', 'Ajoutez au moins une ligne.')); return; }
      if (l.length > 50) { resume(e.target, L('ga.e.trop', '50 personnes au plus par envoi.')); return; }
      const r = enregistrer(l);
      if (r.erreur) { resume(e.target, r.erreur); return; }
      resume(e.target, '');
      const ok = r.resultats.filter(x => x.ok).length;
      NT.ui.toast(L('ga.okLot', '{n} compte(s) créé(s), {e} erreur(s).', { n: ok, e: r.resultats.length - ok }), ok === r.resultats.length ? 'success' : 'warning', 8000);
      $('#g-lot').value = r.resultats.filter(x => !x.ok).map(x => l[x.ligne - 1]).map(p => [p.prenom, p.nom, p.telephone, p.langue].join(' ; ')).join('\n');   // ne restent que les lignes à corriger
      apercu();
    });
    $('#inscrits').addEventListener('click', e => {
      const v = e.target.closest('[data-voir]'), im = e.target.closest('[data-imprimer]');
      if (v) voir(inscrits[+v.dataset.voir]);
      if (im) NT.ficheAccueil.imprimer([inscrits[+im.dataset.imprimer]]);
    });
    $('#tout-imprimer').addEventListener('click', () => NT.ficheAccueil.imprimer(inscrits.filter(p => p.ok)));
    window.addEventListener('beforeunload', e => { if (inscrits.some(p => p.ok)) { e.preventDefault(); e.returnValue = ''; } });
  });
})();
