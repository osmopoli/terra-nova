/* Terra Nova — vague 18 : langage clair.
   F89 (Service Inclusion) : « Version en langage clair » des informations administratives essentielles (fiches des services,
        démarches, pages Vos données / Vos droits / Faire une démarche). Bascule « Texte officiel / Langage clair » par bloc ;
        la version claire garde visibles les chiffres, délais et références du texte officiel. Contenus servis par /api/langage-clair.
   F90 (Citoyen) : « Expliquer plus simplement » sur les passages administratifs, et « Expliquer » sur une sélection de texte
        (Alt + X au clavier) : l'explication s'ouvre sur place (version claire du paragraphe, mots difficiles, phrase reformulée),
        « Masquer » la referme. Aucun mode global : seul le passage demandé change. Compteur anonyme pour les agents.
   API : NT.langageClair.monter(racine) — remplit les [data-clair="id"] et équipe les paragraphes administratifs de racine. */
(function () {
  'use strict';
  const NT = window.NT;
  if (!NT || !NT.ui || NT.langageClair) return;
  const t = NT.t, E = NT.ui.echap;
  NT.i18n.ajouter({
    fr: { 'lc.officiel': 'Texte officiel', 'lc.clair': 'Langage clair', 'lc.version': 'Version du texte', 'lc.qui': 'Qui ?', 'lc.quoi': 'Quoi ?', 'lc.quand': 'Quand ?', 'lc.combien': 'Combien ?', 'lc.documents': 'Documents ?', 'lc.ou': 'Où ?',
      'lc.gardes': 'Chiffres, délais et références officiels (les mêmes dans les deux versions)', 'lc.pied': 'Version claire relue par la mairie · mise à jour le {d}. En cas de doute, le texte officiel fait foi.',
      'lc.fr': 'Cette version n’existe pas encore dans votre langue : elle est affichée en français.', 'lc.expliquer': 'Expliquer plus simplement', 'lc.masquer': 'Masquer', 'lc.enClair': 'En clair :',
      'lc.mots': 'Les mots difficiles :', 'lc.autrement': 'Autrement dit :', 'lc.rien': 'Ce passage n’a pas encore d’explication toute prête.', 'lc.demander': 'Demander à l’assistant d’orientation',
      'lc.selection': 'Expliquer', 'lc.selectionTitre': 'Expliquer la sélection (Alt + X)', 'lc.bulle': 'Explication simple', 'lc.titreBloc': 'L’essentiel' },
    en: { 'lc.officiel': 'Official text', 'lc.clair': 'Plain language', 'lc.version': 'Text version', 'lc.qui': 'Who?', 'lc.quoi': 'What?', 'lc.quand': 'When?', 'lc.combien': 'How much?', 'lc.documents': 'Documents?', 'lc.ou': 'Where?',
      'lc.gardes': 'Official figures, deadlines and references (the same in both versions)', 'lc.pied': 'Plain version reviewed by city hall · updated on {d}. If in doubt, the official text prevails.',
      'lc.fr': 'This version is not yet available in your language: it is shown in French.', 'lc.expliquer': 'Explain more simply', 'lc.masquer': 'Hide', 'lc.enClair': 'In plain words:',
      'lc.mots': 'Difficult words:', 'lc.autrement': 'In other words:', 'lc.rien': 'This passage has no ready-made explanation yet.', 'lc.demander': 'Ask the guidance assistant',
      'lc.selection': 'Explain', 'lc.selectionTitre': 'Explain the selection (Alt + X)', 'lc.bulle': 'Simple explanation', 'lc.titreBloc': 'The essentials' },
    es: { 'lc.officiel': 'Texto oficial', 'lc.clair': 'Lenguaje claro', 'lc.version': 'Versión del texto', 'lc.qui': '¿Quién?', 'lc.quoi': '¿Qué?', 'lc.quand': '¿Cuándo?', 'lc.combien': '¿Cuánto?', 'lc.documents': '¿Documentos?', 'lc.ou': '¿Dónde?',
      'lc.gardes': 'Cifras, plazos y referencias oficiales (iguales en las dos versiones)', 'lc.pied': 'Versión clara revisada por el ayuntamiento · actualizada el {d}. En caso de duda, prevalece el texto oficial.',
      'lc.fr': 'Esta versión aún no existe en su idioma: se muestra en francés.', 'lc.expliquer': 'Explicar más sencillo', 'lc.masquer': 'Ocultar', 'lc.enClair': 'En claro:',
      'lc.mots': 'Palabras difíciles:', 'lc.autrement': 'Dicho de otro modo:', 'lc.rien': 'Este pasaje aún no tiene una explicación preparada.', 'lc.demander': 'Preguntar al asistente de orientación',
      'lc.selection': 'Explicar', 'lc.selectionTitre': 'Explicar la selección (Alt + X)', 'lc.bulle': 'Explicación sencilla', 'lc.titreBloc': 'Lo esencial' },
    ar: { 'lc.officiel': 'النص الرسمي', 'lc.clair': 'لغة واضحة', 'lc.version': 'نسخة النص', 'lc.qui': 'من؟', 'lc.quoi': 'ماذا؟', 'lc.quand': 'متى؟', 'lc.combien': 'كم؟', 'lc.documents': 'الوثائق؟', 'lc.ou': 'أين؟',
      'lc.gardes': 'الأرقام والمهل والمراجع الرسمية (نفسها في النسختين)', 'lc.pied': 'نسخة واضحة راجعتها البلدية · حُدّثت في {d}. عند الشك، النص الرسمي هو المرجع.',
      'lc.fr': 'هذه النسخة غير متوفرة بلغتك بعد: تُعرض بالفرنسية.', 'lc.expliquer': 'اشرح ببساطة', 'lc.masquer': 'إخفاء', 'lc.enClair': 'بوضوح:',
      'lc.mots': 'الكلمات الصعبة:', 'lc.autrement': 'بعبارة أخرى:', 'lc.rien': 'لا يوجد بعد شرح جاهز لهذا المقطع.', 'lc.demander': 'اسأل مساعد التوجيه',
      'lc.selection': 'اشرح', 'lc.selectionTitre': 'اشرح النص المحدد (Alt + X)', 'lc.bulle': 'شرح بسيط', 'lc.titreBloc': 'الأساسي' }
  });
  const langue = () => NT.i18n.langue;
  const page = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '') || 'index';
  const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[’'`]/g, ' ');

  /* ---------- Règles pour les mots administratifs (F90) : terme → explication simple ---------- */
  const TERMES = {
    fr: [
      [['piece justificative', 'pieces justificatives', 'justificatif', 'justificatifs'], 'un document qui prouve ce que vous dites (facture, contrat, attestation).'],
      [['justificatif de domicile', 'justificatif d adresse'], 'un papier qui prouve où vous habitez : facture, bail ou attribution du module.'],
      [['jours ouvres', 'jours ouvrables'], 'les jours de travail : du lundi au vendredi, sans les jours fériés.'],
      [['delai'], 'le temps maximum pour faire quelque chose ou pour recevoir une réponse.'],
      [['accuse de reception'], 'la preuve que votre demande est bien arrivée.'],
      [['notification', 'notifiee', 'notifie'], 'le moment où on vous prévient officiellement.'],
      [['recours gracieux', 'recours', 'voies de recours'], 'demander à la mairie de revoir sa décision.'],
      [['instruit', 'instruction', 'instruire', 'instruction du dossier'], 'la mairie étudie votre dossier.'],
      [['delivre', 'delivrance', 'delivrer', 'delivree'], 'donner un document officiel.'],
      [['attestation'], 'un papier officiel qui confirme quelque chose.'],
      [['beneficiaire', 'beneficiaires'], 'la personne qui reçoit l’aide.'],
      [['ressources'], 'l’argent que reçoit votre foyer : salaire, aides, pensions.'],
      [['foyer'], 'les personnes qui vivent ensemble dans le même logement.'],
      [['motivee', 'motive'], 'expliquée : on vous dit pourquoi.'],
      [['prealable', 'prealablement', 'autorisation prealable'], 'avant de commencer.'],
      [['a compter de'], 'à partir de.'],
      [['dans la limite de'], 'au maximum.'],
      [['exceder', 'excede'], 'dépasser.'],
      [['conformement a'], 'selon cette règle.'],
      [['vaut refus'], 'veut dire non.'],
      [['vaut acceptation'], 'veut dire oui.'],
      [['deliberation'], 'une décision votée par le conseil de la ville.'],
      [['arrete municipal', 'arrete'], 'une décision écrite du maire.'],
      [['reglement municipal', 'reglement d urbanisme', 'reglement'], 'les règles écrites de la ville.'],
      [['charte'], 'un texte qui liste des droits et des règles.'],
      [['titre d identite', 'titres d identite'], 'la carte d’identité ou le passeport.'],
      [['commission d attribution'], 'un groupe de personnes de la mairie qui décide qui reçoit un logement.'],
      [['trimestre'], 'une période de 3 mois.'],
      [['mensuellement'], 'chaque mois.'],
      [['usager', 'usagers'], 'la personne qui utilise un service public : vous.'],
      [['demandeur', 'declarant'], 'la personne qui fait la demande : vous.'],
      [['rectification'], 'corriger une information fausse.'],
      [['effacement'], 'supprimer vos informations.'],
      [['passible d une amende'], 'vous risquez de payer une amende.'],
      [['se substitue', 'substituer'], 'remplacer.'],
      [['copie integrale'], 'la copie complète du document.'],
      [['extrait d acte', 'extrait'], 'un résumé officiel d’un acte.'],
      [['publication des bans'], 'l’annonce officielle du mariage, affichée à la mairie.'],
      [['chiffres', 'chiffrees', 'chiffre'], 'protégé par un code secret : personne d’autre ne peut le lire.'],
      [['tiers'], 'une autre personne ou une autre entreprise.'],
      [['traitement'], 'le travail de la mairie sur votre demande, ou l’utilisation de vos données.'],
      [['echeance'], 'la date limite.'],
      [['en vigueur'], 'valable aujourd’hui.']
    ],
    en: [
      [['proof of address'], 'a paper showing where you live: bill, lease or module allocation.'], [['proof of resources', 'proof of income'], 'papers showing the money your household receives.'],
      [['working days'], 'Monday to Friday, without public holidays.'], [['acknowledgement of receipt'], 'proof that your request has arrived.'],
      [['appeal'], 'asking city hall to review its decision.'], [['notification', 'notified'], 'when you are officially told.'],
      [['deliberation'], 'a decision voted by the city council.'], [['regulation'], 'the written rules of the city.'], [['household'], 'the people living together in the same home.'],
      [['issues', 'issued'], 'gives an official document.'], [['processing'], 'the work done on your request.'], [['encrypted'], 'protected by a secret code: nobody else can read it.'],
      [['third parties'], 'other people or companies.'], [['quarter'], 'a period of 3 months.'], [['prevails'], 'is the one that counts.']
    ],
    es: [
      [['justificante', 'justificantes'], 'un documento que prueba lo que dice.'], [['dias laborables'], 'de lunes a viernes, sin festivos.'],
      [['acuse de recibo'], 'la prueba de que su solicitud ha llegado.'], [['recurso'], 'pedir al ayuntamiento que revise su decisión.'],
      [['notificacion', 'notifica'], 'cuando le avisan oficialmente.'], [['deliberacion'], 'una decisión votada por el consejo de la ciudad.'],
      [['reglamento'], 'las normas escritas de la ciudad.'], [['hogar'], 'las personas que viven juntas.'], [['expide', 'expedir'], 'entregar un documento oficial.'],
      [['plazo', 'plazos'], 'el tiempo máximo para hacer algo.'], [['cifrados', 'cifrado'], 'protegido con un código secreto.'], [['trimestre'], 'un periodo de 3 meses.']
    ],
    ar: [
      [['اثبات', 'اثباتات'], 'وثيقة تثبت ما تقوله.'], [['ايام عمل'], 'من الاثنين إلى الجمعة دون أيام العطل.'], [['اشعار استلام'], 'دليل على أن طلبك وصل.'],
      [['طعن'], 'أن تطلب من البلدية مراجعة قرارها.'], [['مهله', 'المهل'], 'أقصى وقت لفعل شيء.'], [['موارد'], 'المال الذي تتلقاه أسرتك.'],
      [['مداوله'], 'قرار صوّت عليه مجلس المدينة.'], [['مشفره'], 'محمية برمز سري لا يقرؤها غيرك.']
    ]
  };
  // Reformulations simples (phrase → mots courants), appliquées au texte d'origine
  const REECRITURES = {
    fr: [[/dans un délai de/gi, 'en'], [/à compter de/gi, 'à partir de'], [/est tenue? de/gi, 'doit'], [/préalablement/gi, 'avant'], [/conformément à/gi, 'selon'],
      [/dans la limite de/gi, 'au maximum'], [/ne peut excéder/gi, 'ne dépasse pas'], [/sur présentation d[e’']\s?/gi, 'en montrant '], [/fait l[’']objet d[’']un/gi, 'reçoit un'],
      [/est délivrée?/gi, 'est donné'], [/délivre/gi, 'donne'], [/est notifiée?/gi, 'vous est envoyée'], [/procéder à/gi, 'faire'], [/afin de/gi, 'pour'], [/en vue de/gi, 'pour'],
      [/auprès d[eu]/gi, 'à'], [/vaut refus/gi, 'veut dire non'], [/vaut acceptation/gi, 'veut dire oui'], [/est soumise? à/gi, 'demande'], [/le demandeur/gi, 'vous'], [/l[’']usager/gi, 'vous'],
      [/il convient de/gi, 'il faut'], [/ne se substitue pas aux/gi, 'ne remplace pas les'], [/instruit/gi, 'étudie'], [/mensuellement/gi, 'chaque mois'], [/par trimestre/gi, 'tous les 3 mois'],
      [/; /g, '. ']],
    en: [[/within a period of/gi, 'within'], [/on presentation of/gi, 'by showing'], [/is notified/gi, 'is sent to you'], [/in order to/gi, 'to'], [/the applicant/gi, 'you'], [/per quarter/gi, 'every 3 months'], [/; /g, '. ']],
    es: [[/en un plazo de/gi, 'en'], [/presentando/gi, 'mostrando'], [/se notifica/gi, 'se le envía'], [/el solicitante/gi, 'usted'], [/por trimestre/gi, 'cada 3 meses'], [/; /g, '. ']],
    ar: [[/؛ /g, '. ']]
  };
  function glossaire() {
    try { return window.NT_glossaireLangue ? window.NT_glossaireLangue().map((g) => [[g.terme].concat(g.synonymes || []).map(norm), g.definition]) : []; } catch { return []; }
  }
  // Le terme tel qu'il est écrit dans le passage (accents et apostrophes compris), pour l'afficher
  function surface(texte, variante) {
    const cible = norm(variante).replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
    const n = cible.split(' ').length;
    const re = /[\p{L}\p{N}]+/gu;
    const mots = [];
    let m;
    while ((m = re.exec(texte))) mots.push({ m: m[0], i: m.index, f: m.index + m[0].length });
    for (let i = 0; i + n <= mots.length; i++) {
      const bloc = mots.slice(i, i + n);
      if (norm(bloc.map((x) => x.m).join(' ')) === cible) return texte.slice(bloc[0].i, bloc[n - 1].f);
    }
    return variante;
  }
  function termesDans(texte) {
    const n = ' ' + norm(texte).replace(/[^\p{L}\p{N}]+/gu, ' ') + ' ';
    const trouves = [];
    const vus = new Set();
    for (const [variantes, def] of (TERMES[langue()] || []).concat(glossaire())) {
      const v = variantes.find((x) => n.includes(' ' + norm(x) + ' '));
      if (v && !vus.has(def)) { vus.add(def); trouves.push({ terme: surface(texte, v), def }); }
      if (trouves.length >= 5) break;
    }
    return trouves;
  }
  function reecrire(texte) {
    let r = String(texte || '');
    for (const [re, par] of REECRITURES[langue()] || []) r = r.replace(re, par);
    r = r.replace(/\s{2,}/g, ' ').trim();
    return r !== String(texte || '').trim() ? r : '';
  }
  const hash = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return 'h' + (h >>> 0).toString(36); };
  function compter(cle, type, extrait, termes) {
    try { fetch('/api/explications', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, keepalive: true,
      body: JSON.stringify({ cle, page, type, extrait: (extrait || '').slice(0, 140), termes: (termes || []).join(', ').slice(0, 120) }) }).catch(() => {}); } catch { /* sans réseau : rien à compter */ }
  }
  // Contenu d'une explication : version claire du paragraphe (F89), mots difficiles, phrase reformulée
  function explicationHtml(texte, clair) {
    const termes = termesDans(texte);
    const autrement = clair ? '' : reecrire(texte);
    let h = '';
    if (clair) h += `<p><strong>${E(t('lc.enClair'))}</strong> ${E(clair)}</p>`;
    if (autrement) h += `<p><strong>${E(t('lc.autrement'))}</strong> ${E(autrement)}</p>`;
    if (termes.length) h += `<p style="margin-bottom:.1rem"><strong>${E(t('lc.mots'))}</strong></p><ul>${termes.map((x) => `<li><strong>${E(x.terme)}</strong> : ${E(x.def)}</li>`).join('')}</ul>`;
    if (!h) h = `<p>${E(t('lc.rien'))}</p><button type="button" class="btn petit" data-or-assistant="">${E(t('lc.demander'))}</button> `;
    return { html: h, termes: termes.map((x) => x.terme) };
  }

  /* ---------- F90 : « Expliquer plus simplement » par paragraphe ---------- */
  let compteurId = 0;
  function ajouterBouton(el, cle, clair) {
    if (el.dataset.lcEquipe) return;
    el.dataset.lcEquipe = '1';
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'lc-expliquer'; b.setAttribute('aria-expanded', 'false');
    b.dataset.lcCle = cle; if (clair) b.dataset.lcClair = clair;
    b.innerHTML = `<i class="ph ph-lightbulb" aria-hidden="true"></i>${E(t('lc.expliquer'))}`;
    el.append(b);
  }
  const EXCLUS = '.lc-clair, .lc-explication, .lc-bulle, nav, .entete, .pied, form, .or-dialogue, .or-suggestions, [data-lc-non], .urg-ecran, button, a.btn, sl-drawer[label=""], .ariane';
  function equiper(racine) {
    if (!racine) return;
    let n = 0;
    for (const el of racine.querySelectorAll('p, li, dd')) {
      if (n >= 15) break;
      if (el.dataset.lcEquipe || el.closest(EXCLUS) || el.querySelector('p, ul, ol, input, select, textarea')) continue;
      if (el.closest('a') || (el.firstElementChild && el.firstElementChild.tagName === 'A' && el.firstElementChild.textContent.trim() === el.textContent.trim())) continue;   // carte-lien (accueil, listes) : le bouton sortirait de la carte
      const texte = el.textContent.trim();
      if (texte.length < 60 || !termesDans(texte).length) continue;
      ajouterBouton(el, hash(texte), '');
      n++;
    }
  }
  function basculer(b) {
    const el = b.parentElement;
    const id = b.getAttribute('aria-controls');
    const ouvert = id && document.getElementById(id);
    if (ouvert) { ouvert.remove(); b.setAttribute('aria-expanded', 'false'); b.removeAttribute('aria-controls'); return; }
    const texte = el.textContent.replace(b.textContent, '').trim();
    const ex = explicationHtml(texte, b.dataset.lcClair || '');
    const div = document.createElement(el.tagName === 'P' ? 'div' : 'span');
    div.className = 'lc-explication'; div.id = 'lc-ex-' + (++compteurId); div.setAttribute('role', 'note'); div.tabIndex = -1;
    div.innerHTML = ex.html + `<button type="button" class="lc-masquer">${E(t('lc.masquer'))}</button>`;
    if (el.tagName === 'P') el.after(div); else el.append(div);
    b.setAttribute('aria-expanded', 'true'); b.setAttribute('aria-controls', div.id);
    div.querySelector('.lc-masquer').addEventListener('click', () => { div.remove(); b.setAttribute('aria-expanded', 'false'); b.removeAttribute('aria-controls'); b.focus(); });
    NT.ui.annoncer(div.textContent.replace(t('lc.masquer'), '').slice(0, 400));
    compter(b.dataset.lcCle, 'paragraphe', texte, ex.termes);
  }
  document.addEventListener('click', (e) => { const b = e.target.closest('.lc-expliquer'); if (b) { e.preventDefault(); basculer(b); } });

  /* ---------- F90 : « Expliquer » sur une sélection (souris, doigt ou clavier, Alt + X) ---------- */
  let flottant = null, bulle = null;
  function selectionUtile() {
    const s = window.getSelection && window.getSelection();
    if (!s || s.isCollapsed || !s.rangeCount) return null;
    const texte = s.toString().replace(/\s+/g, ' ').trim();
    if (texte.length < 2 || texte.length > 400) return null;
    const noeud = s.anchorNode && (s.anchorNode.nodeType === 1 ? s.anchorNode : s.anchorNode.parentElement);
    if (!noeud || !noeud.closest('#contenu, .or-dialogue') || noeud.closest('input, textarea, .lc-bulle, .entete')) return null;
    return { texte, rect: s.getRangeAt(0).getBoundingClientRect() };
  }
  function cacherFlottant() { if (flottant) flottant.hidden = true; }
  function montrerFlottant() {
    const sel = selectionUtile();
    if (!sel) return cacherFlottant();
    if (!flottant) {
      flottant = document.createElement('button');
      flottant.type = 'button'; flottant.className = 'lc-flottant'; flottant.title = t('lc.selectionTitre');
      flottant.innerHTML = `<i class="ph ph-lightbulb" aria-hidden="true"></i>${E(t('lc.selection'))}`;
      flottant.addEventListener('mousedown', (e) => e.preventDefault());   // garde la sélection
      flottant.addEventListener('click', () => expliquerSelection());
      document.body.append(flottant);
    }
    flottant.hidden = false;
    const x = Math.max(8, Math.min(window.innerWidth - 120, sel.rect.left + sel.rect.width / 2 - 50));
    const y = sel.rect.bottom + 8 > window.innerHeight - 50 ? Math.max(8, sel.rect.top - 44) : sel.rect.bottom + 8;
    flottant.style.left = x + 'px'; flottant.style.top = y + 'px';
  }
  function fermerBulle(retour) { if (bulle) { bulle.remove(); bulle = null; if (retour && retour.focus) retour.focus(); } }
  function expliquerSelection() {
    const sel = selectionUtile();
    if (!sel) return;
    const retour = document.activeElement;
    cacherFlottant(); fermerBulle();
    const ex = explicationHtml(sel.texte, '');
    bulle = document.createElement('div');
    bulle.className = 'lc-bulle'; bulle.setAttribute('role', 'dialog'); bulle.setAttribute('aria-label', t('lc.bulle')); bulle.tabIndex = -1;
    bulle.innerHTML = `<h3><i class="ph-duotone ph-lightbulb" aria-hidden="true"></i>${E(t('lc.bulle'))}</h3><p class="doux" style="font-size:var(--t-xs)">« ${E(sel.texte.slice(0, 160))}${sel.texte.length > 160 ? '…' : ''} »</p>${ex.html}
      <button type="button" class="lc-masquer btn petit">${E(t('lc.masquer'))}</button>`;
    document.body.append(bulle);
    const w = bulle.offsetWidth, h = bulle.offsetHeight;
    bulle.style.left = Math.max(8, Math.min(window.innerWidth - w - 8, sel.rect.left)) + 'px';
    bulle.style.top = (sel.rect.bottom + h + 16 < window.innerHeight ? sel.rect.bottom + 8 : Math.max(8, sel.rect.top - h - 8)) + 'px';
    bulle.querySelector('.lc-masquer').addEventListener('click', () => fermerBulle(retour));
    bulle.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); fermerBulle(retour); } });
    bulle.focus();
    // la sélection libre n'est jamais envoyée : seuls les mots administratifs reconnus sont comptés
    compter('sel:' + (ex.termes[0] ? hash(ex.termes.join('|')) : 'aucun'), 'selection', '', ex.termes);
  }
  document.addEventListener('mouseup', () => setTimeout(montrerFlottant, 10));
  document.addEventListener('touchend', () => setTimeout(montrerFlottant, 250), { passive: true });
  document.addEventListener('keyup', (e) => { if (e.shiftKey || e.key === 'Shift') montrerFlottant(); });
  document.addEventListener('selectionchange', () => { const s = window.getSelection(); if (!s || s.isCollapsed) cacherFlottant(); });
  window.addEventListener('scroll', cacherFlottant, { passive: true });
  document.addEventListener('keydown', (e) => {
    if (e.altKey && !e.ctrlKey && !e.metaKey && (e.key === 'x' || e.key === 'X' || e.code === 'KeyX')) { if (selectionUtile()) { e.preventDefault(); expliquerSelection(); } }
    else if (e.key === 'Escape' && bulle) fermerBulle();
  });
  document.addEventListener('mousedown', (e) => { if (bulle && !bulle.contains(e.target)) fermerBulle(); });

  /* ---------- F89 : bloc « Texte officiel / Langage clair » ---------- */
  const cache = new Map();
  const charger = (id) => {
    if (!cache.has(id)) cache.set(id, fetch('/api/langage-clair/' + encodeURIComponent(id), { credentials: 'same-origin' }).then((r) => (r.ok ? r.json() : null)).catch(() => null));
    return cache.get(id);
  };
  const RE_GARDES = /(?:règlement|délibération|arrêté|charte|regulation|deliberation|charter|reglamento|deliberación|carta)[^.;()]{0,40}?n[°º.o]{1,2}\s?[\d-]+|(?:article|artículo)\s\d+|(?:رقم|المادة)\s?[\d-]+|\d[\d  ]*\s?(?:€|%)|\d+\s?(?:jours? ouvrés|jours?|mois|ans|semaines?|heures?|minutes?|working days|days|months|hours|weeks|years|días laborables|días|meses|horas|semanas|años|أيام عمل|أيام|يوماً|ساعة|ساعات|أشهر|شهراً|سنوات)|\d{1,2}h(?:\d{2})?|\d{1,2}(?:er)?\s(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)|\b\d{2}(?:\s\d{2}){4}\b/gi;
  const gardes = (paras) => [...new Set(paras.join(' ').match(RE_GARDES) || [])].map((x) => x.trim()).slice(0, 14);
  const preference = () => { try { return localStorage.getItem('nt:lc:mode') || 'officiel'; } catch { return 'officiel'; } };
  function rendreBloc(el, c) {
    const l = langue();
    const off = (c.officiel && (c.officiel[l] || c.officiel.fr)) || [];
    const cl = (c.clair && (c.clair[l] || c.clair.fr)) || {};
    const enFr = !(c.clair && c.clair[l]) && l !== 'fr';
    const titre = (c.titre && (c.titre[l] || c.titre.fr)) || t('lc.titreBloc');
    const uid = 'lc-' + c.id.replace(/[^\w]/g, '-');
    const mode = preference();
    const cases = [['qui', 'ph-users'], ['quoi', 'ph-file-text'], ['quand', 'ph-calendar'], ['combien', 'ph-coins'], ['documents', 'ph-files'], ['ou', 'ph-map-pin']].filter(([k]) => cl[k]);
    const g = gardes(off);
    el.innerHTML = `<section class="lc-bloc" aria-labelledby="${uid}-h">
      <div class="lc-tete"><h3 id="${uid}-h"><i class="ph-duotone ph-article" aria-hidden="true"></i>${E(titre)}</h3>
        <div class="lc-bascule" role="group" aria-label="${E(t('lc.version'))}">
          <button type="button" data-lc-v="officiel" aria-pressed="${mode !== 'clair'}">${E(t('lc.officiel'))}</button>
          <button type="button" data-lc-v="clair" aria-pressed="${mode === 'clair'}">${E(t('lc.clair'))}</button></div></div>
      <div class="lc-officiel" ${mode === 'clair' ? 'hidden' : ''}${enFr && !(c.officiel && c.officiel[l]) ? ' lang="fr" dir="ltr"' : ''}>${off.map((p, i) => `<p data-lc-p="${i}">${E(p)}</p>`).join('')}</div>
      <div class="lc-clair" ${mode === 'clair' ? '' : 'hidden'}${enFr ? ' lang="fr" dir="ltr"' : ''}>
        ${enFr ? `<p class="doux" style="font-size:var(--t-xs)">${E(t('lc.fr'))}</p>` : ''}
        ${cl.resume ? `<p class="lc-resume">${E(cl.resume)}</p>` : ''}
        ${cases.length ? `<dl class="lc-cases">${cases.map(([k, ico]) => `<div><dt><i class="ph ${ico}" aria-hidden="true"></i>${E(t('lc.' + k))}</dt><dd>${E(cl[k])}</dd></div>`).join('')}</dl>` : ''}
        ${g.length ? `<div class="lc-gardes"><strong>${E(t('lc.gardes'))}</strong><ul>${g.map((x) => `<li dir="auto">${E(x)}</li>`).join('')}</ul></div>` : ''}</div>
      <p class="lc-pied">${E(t('lc.pied', { d: c.maj ? NT.ui.date(c.maj) : '' }))}</p></section>`;
    // F90 : chaque paragraphe officiel a son explication simple (le paragraphe correspondant de la version claire)
    el.querySelectorAll('.lc-officiel [data-lc-p]').forEach((p) => ajouterBouton(p, c.id + '#p' + p.dataset.lcP, (cl.paragraphes || [])[Number(p.dataset.lcP)] || ''));
    el.querySelector('.lc-bascule').addEventListener('click', (e) => {
      const b = e.target.closest('[data-lc-v]'); if (!b) return;
      const v = b.dataset.lcV;
      el.querySelectorAll('[data-lc-v]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      el.querySelector('.lc-officiel').hidden = v !== 'officiel';
      el.querySelector('.lc-clair').hidden = v !== 'clair';
      try { localStorage.setItem('nt:lc:mode', v); } catch { /* préférence non gardée */ }
      NT.ui.annoncer(t(v === 'clair' ? 'lc.clair' : 'lc.officiel'));
    });
  }
  function monter(racine) {
    const r = racine || document;
    r.querySelectorAll('[data-clair]:not([data-lc-monte])').forEach((el) => {
      el.dataset.lcMonte = '1';
      charger(el.dataset.clair).then((c) => { if (c) rendreBloc(el, c); else el.remove(); });
    });
    equiper(r.id === 'contenu' || r === document ? document.getElementById('contenu') : r);
  }
  function bloc(id, parent, avant) {
    const el = document.createElement('div');
    el.dataset.clair = id;
    if (avant) parent.insertBefore(el, avant); else parent.append(el);
    monter(el.parentElement);
    return el;
  }
  NT.langageClair = { monter, bloc, explicationHtml, termesDans };

  NT.pret(() => setTimeout(() => {
    // Pages clés : vos données et vos droits
    if (page === 'donnees') {
      const tete = document.querySelector('#contenu .titre-page') || document.querySelector('#contenu h1');
      if (tete) { const z = document.createElement('div'); tete.after(z); bloc('page:donnees', z); bloc('page:droits', z); }
    }
    monter(document.getElementById('contenu'));
  }, 700));
})();
