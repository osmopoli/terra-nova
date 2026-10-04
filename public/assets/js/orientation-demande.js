/* Terra Nova — vague 18 (F92, Citoyenne) : « Je ne sais pas quel service choisir » dans demande.html.
   L'habitant décrit son besoin avec ses mots → 1 à 3 services ou démarches probables, avec la raison (« parce que vous parlez
   de… ») → un appui pré-remplit le formulaire (type, service, catégorie ou nature, texte) ; tout reste modifiable.
   Reprend aussi les liens de l'assistant d'orientation (?categorie=, ?nature=) et la phrase de l'habitant (gardée dans l'onglet).
   F89 : version en langage clair de « Faire une démarche » et de la démarche choisie. Chargé par orientation.js. */
(function () {
  'use strict';
  const NT = window.NT;
  if (!NT || !NT.orientation || document.getElementById('or-guide')) return;
  const t = NT.t, E = NT.ui.echap;
  NT.i18n.ajouter({
    fr: { 'og.bouton': 'Je ne sais pas quel service choisir', 'og.label': 'Décrivez votre besoin avec vos mots', 'og.ph': 'Par exemple : ma poubelle déborde depuis trois jours',
      'og.aide': 'L’assistant d’orientation (automatique, sans intelligence artificielle générative) compare vos mots aux services de la ville. Vous pourrez toujours changer le choix.',
      'og.trouver': 'Trouver le bon service', 'og.recherche': 'Recherche…', 'og.choisir': 'Choisir', 'og.pourquoi': 'Parce que vous parlez de {m}.', 'og.service': 'Service : {s}',
      'og.aucun': 'Je n’ai pas trouvé de service précis. Choisissez « Contacter un service » puis « Je ne sais pas » : la mairie orientera votre demande.', 'og.court': 'Écrivez au moins quelques mots.',
      'og.choisi': 'Formulaire pré-rempli pour « {s} ». Vérifiez et complétez : vous pouvez tout modifier.', 'og.changer': 'Changer', 'og.repris': 'Votre phrase a été reprise dans le formulaire. Vous pouvez la modifier.',
      'og.erreur': 'La suggestion ne répond pas pour le moment. Choisissez le type de demande ci-dessous.' },
    en: { 'og.bouton': 'I don’t know which service to choose', 'og.label': 'Describe what you need in your own words', 'og.ph': 'For example: my bin has been overflowing for three days',
      'og.aide': 'The guidance assistant (automatic, no generative AI) compares your words with the city’s services. You can always change the choice.',
      'og.trouver': 'Find the right service', 'og.recherche': 'Searching…', 'og.choisir': 'Choose', 'og.pourquoi': 'Because you mention {m}.', 'og.service': 'Service: {s}',
      'og.aucun': 'I could not find a specific service. Choose “Contact a service” then “I don’t know”: city hall will route your request.', 'og.court': 'Write at least a few words.',
      'og.choisi': 'Form pre-filled for “{s}”. Check and complete it: you can change everything.', 'og.changer': 'Change', 'og.repris': 'Your sentence has been copied into the form. You can edit it.',
      'og.erreur': 'Suggestions are not responding right now. Choose the type of request below.' },
    es: { 'og.bouton': 'No sé qué servicio elegir', 'og.label': 'Describa lo que necesita con sus palabras', 'og.ph': 'Por ejemplo: mi contenedor desborda desde hace tres días',
      'og.aide': 'El asistente de orientación (automático, sin IA generativa) compara sus palabras con los servicios de la ciudad. Siempre podrá cambiar la elección.',
      'og.trouver': 'Encontrar el servicio adecuado', 'og.recherche': 'Buscando…', 'og.choisir': 'Elegir', 'og.pourquoi': 'Porque habla de {m}.', 'og.service': 'Servicio: {s}',
      'og.aucun': 'No he encontrado un servicio preciso. Elija «Contactar con un servicio» y luego «No lo sé»: el ayuntamiento orientará su solicitud.', 'og.court': 'Escriba al menos unas palabras.',
      'og.choisi': 'Formulario rellenado para «{s}». Revise y complete: puede cambiarlo todo.', 'og.changer': 'Cambiar', 'og.repris': 'Su frase se ha copiado en el formulario. Puede modificarla.',
      'og.erreur': 'Las sugerencias no responden ahora. Elija el tipo de solicitud abajo.' },
    ar: { 'og.bouton': 'لا أعرف أي خدمة أختار', 'og.label': 'صف حاجتك بكلماتك', 'og.ph': 'مثلاً: حاوية القمامة ممتلئة منذ ثلاثة أيام',
      'og.aide': 'مساعد التوجيه (آلي، دون ذكاء اصطناعي توليدي) يقارن كلماتك بخدمات المدينة. يمكنك دائماً تغيير الاختيار.',
      'og.trouver': 'إيجاد الخدمة المناسبة', 'og.recherche': 'جارٍ البحث…', 'og.choisir': 'اختيار', 'og.pourquoi': 'لأنك تتحدث عن {m}.', 'og.service': 'الخدمة: {s}',
      'og.aucun': 'لم أجد خدمة محددة. اختر «التواصل مع خدمة» ثم «لا أعرف»: ستوجّه البلدية طلبك.', 'og.court': 'اكتب بضع كلمات على الأقل.',
      'og.choisi': 'تم ملء النموذج لـ «{s}». تحقق وأكمل: يمكنك تغيير كل شيء.', 'og.changer': 'تغيير', 'og.repris': 'نُسخت جملتك في النموذج. يمكنك تعديلها.',
      'og.erreur': 'الاقتراحات لا تستجيب حالياً. اختر نوع الطلب أدناه.' }
  });
  const $ = (s) => document.querySelector(s);
  const declencher = (el) => { if (el) { el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); } };
  const NATURE_CLAIR = { naissance: 'demarche:naissance', mariage: 'demarche:mariage', adresse: 'demarche:adresse', identite: 'demarche:identite', logement: 'demarche:logement', travaux: 'demarche:travaux', ecole: 'demarche:ecole', aide: 'demarche:aide' };

  function choisirType(type) {
    // CSS.escape : la valeur peut venir de l’adresse (?type=, ?categorie=), un guillemet ne doit pas casser le sélecteur
    const r = document.querySelector(`input[name="type"][value="${CSS.escape(String(type))}"]`);
    if (r && !r.checked) { r.checked = true; declencher(r); }
  }
  function remplir(champ, valeur, forcer) { const el = $(champ); if (el && valeur && (forcer || !el.value.trim())) { el.value = valeur; declencher(el); } }
  // Pré-remplit le formulaire de demande.js sans rien bloquer : l'habitant garde la main sur chaque champ
  function preRemplir(p, texte, titre) {
    if (!p) return;
    choisirType(p.type);
    if (p.type === 'signalement') {
      const c = p.categorie && document.querySelector(`input[name="categorie"][value="${CSS.escape(String(p.categorie))}"]`);
      if (c && !c.checked) { c.checked = true; declencher(c); }
      remplir('#s-description', texte);
    } else if (p.type === 'demarche') {
      if (p.service) { const s = $('#d-service'); if (s && [...s.options].some((o) => o.value === p.service)) { s.value = p.service; declencher(s); } }
      if (p.nature) { const n = $('#d-nature'); if (n && [...n.options].some((o) => o.value === p.nature)) { n.value = p.nature; declencher(n); } }
      remplir('#d-precisions', texte);
    } else {
      const s = $('#c-service');
      if (s) { const v = p.service && [...s.options].some((o) => o.value === p.service) ? p.service : 'inconnu'; s.value = v; declencher(s); }
      remplir('#c-objet', titre ? titre.slice(0, 120) : '');
      remplir('#c-message', texte);
    }
  }

  /* ---------- Bloc « Je ne sais pas quel service choisir » ---------- */
  const zoneF = document.getElementById('zone-formulaire');
  const form = document.getElementById('form-demande');
  if (!zoneF || !form) return;
  const guide = document.createElement('section');
  guide.className = 'or-guide'; guide.id = 'or-guide'; guide.setAttribute('aria-labelledby', 'or-guide-btn');
  guide.innerHTML = `<button type="button" class="or-guide-bouton" id="or-guide-btn" aria-expanded="false" aria-controls="or-guide-corps">
      <i class="ph-duotone ph-compass" aria-hidden="true"></i><span>${E(t('og.bouton'))}</span><i class="ph ph-caret-down or-chevron" aria-hidden="true"></i></button>
    <div class="or-guide-corps" id="or-guide-corps" hidden>
      <div class="champ"><label for="or-guide-texte">${E(t('og.label'))}</label>
        <textarea id="or-guide-texte" maxlength="600" rows="3" placeholder="${E(t('og.ph'))}" aria-describedby="or-guide-aide"></textarea>
        <p class="aide" id="or-guide-aide">${E(t('og.aide'))}</p></div>
      <button type="button" class="btn btn-primaire" id="or-guide-go"><i class="ph ph-magnifying-glass" aria-hidden="true"></i><span>${E(t('og.trouver'))}</span></button>
      <div id="or-guide-res" aria-live="polite"></div>
    </div>`;
  zoneF.insertBefore(guide, form);
  const btn = guide.querySelector('#or-guide-btn'), corps = guide.querySelector('#or-guide-corps'), ta = guide.querySelector('#or-guide-texte'), res = guide.querySelector('#or-guide-res');
  const ouvrirGuide = (v) => { btn.setAttribute('aria-expanded', String(v)); corps.hidden = !v; if (v) ta.focus(); };
  btn.addEventListener('click', () => ouvrirGuide(btn.getAttribute('aria-expanded') !== 'true'));
  // « Je ne sais pas » choisi dans la liste des services : le guide s'ouvre tout seul
  const cSvc = $('#c-service');
  if (cSvc) cSvc.addEventListener('change', () => { if (cSvc.value === 'inconnu' && btn.getAttribute('aria-expanded') !== 'true' && !guide.dataset.choisi) ouvrirGuide(true); });

  let derniers = [];
  function chercher() {
    const texte = ta.value.trim();
    if (texte.split(/\s+/).filter(Boolean).length < 1 || texte.length < 3) { res.innerHTML = `<p class="erreur">${E(t('og.court'))}</p>`; ta.focus(); return; }
    const go = guide.querySelector('#or-guide-go'); go.disabled = true; go.setAttribute('aria-busy', 'true');
    res.innerHTML = `<p class="doux">${E(t('og.recherche'))}</p>`;
    NT.orientation.api.poster('/api/orientation/suggestions', { message: texte }).then((r) => {
      derniers = r.suggestions || [];
      let h = '';
      // urgence vitale : l'écran du 15 / 112 passe avant tout (F86)
      if (r.urgence) h += NT.urgenceMed ? NT.urgenceMed.ecran({}) : '';
      if (!derniers.length) h += `<p class="or-repli" style="margin-top:1rem">${E(t('og.aucun'))}</p>`;
      else h += `<ul class="or-sugg">${derniers.map((s, i) => `<li>
          <strong>${E(s.titre)}${s.service ? ` <span class="doux" style="font-weight:400">· ${E(t('og.service', { s: s.service.nom }))}</span>` : ''}</strong>
          <p class="or-pourquoi">${s.raisons && s.raisons.length ? E(t('og.pourquoi', { m: s.raisons.map((m) => '« ' + m + ' »').join(', ') })) : ''}</p>
          <button type="button" class="btn${i === 0 ? ' btn-primaire' : ''}" data-og="${i}" aria-label="${E(t('og.choisir') + ' : ' + s.titre)}">${E(t('og.choisir'))}</button></li>`).join('')}</ul>`;
      res.innerHTML = h;
      NT.ui.annoncer(derniers.length ? derniers.map((s) => s.titre).join(', ') : t('og.aucun'));
    }).catch(() => { res.innerHTML = `<p class="or-repli" style="margin-top:1rem">${E(t('og.erreur'))}</p>`; })
      .finally(() => { go.disabled = false; go.removeAttribute('aria-busy'); });
  }
  guide.querySelector('#or-guide-go').addEventListener('click', chercher);
  ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); chercher(); } });
  res.addEventListener('click', (e) => {
    const b = e.target.closest('[data-og]'); if (!b) return;
    const s = derniers[Number(b.dataset.og)]; if (!s) return;
    preRemplir(s.prefill, ta.value.trim(), s.titre);
    res.querySelectorAll('.or-sugg li').forEach((li, i) => li.classList.toggle('choisie', i === Number(b.dataset.og)));
    guide.dataset.choisi = '1';
    let note = res.querySelector('.or-choisi');
    if (!note) { note = document.createElement('p'); note.className = 'or-choisi'; note.setAttribute('role', 'status'); res.append(note); }
    note.innerHTML = `<i class="ph-duotone ph-check-circle" aria-hidden="true"></i><span>${E(t('og.choisi', { s: s.service ? s.service.nom + ' — ' + s.titre : s.titre }))}</span>`;
    NT.ui.annoncer(t('og.choisi', { s: s.titre }));
    // amène l'habitant au formulaire pré-rempli
    const cible = document.querySelector('.dm-bloc:not([hidden]) textarea, .dm-bloc:not([hidden]) select');
    if (cible) { cible.scrollIntoView({ block: 'center' }); setTimeout(() => cible.focus({ preventScroll: true }), 50); }
  });

  /* ---------- Liens de l'assistant : ?categorie=… / ?nature=… et phrase de l'habitant ---------- */
  NT.pret(() => setTimeout(() => {
    const p = new URLSearchParams(location.search);
    const type = p.get('type'), categorie = p.get('categorie'), nature = p.get('nature'), service = p.get('service');
    let texte = '';
    try { texte = sessionStorage.getItem('nt:orientation:texte') || ''; sessionStorage.removeItem('nt:orientation:texte'); } catch { /* stockage indisponible */ }
    if (categorie || nature || texte) {
      preRemplir({ type: type || (categorie ? 'signalement' : nature ? 'demarche' : 'contact'), categorie, nature, service }, texte, '');
      if (texte) NT.ui.annoncer(t('og.repris'));
    }
    /* F89 : « Faire une démarche » en langage clair, et la démarche choisie */
    const tete = document.querySelector('#contenu .titre-page');
    if (tete && NT.langageClair) { const z = document.createElement('div'); tete.after(z); NT.langageClair.bloc('page:demarches', z); }
    const nat = $('#d-nature');
    if (nat && NT.langageClair) {
      const hote = document.createElement('div'); hote.id = 'or-clair-nature';
      (nat.closest('.champ') || nat.parentElement).after(hote);
      const maj = () => { hote.innerHTML = ''; const id = NATURE_CLAIR[nat.value]; if (id) NT.langageClair.bloc(id, hote); };
      nat.addEventListener('change', maj); maj();
    }
  }, 50));
})();
