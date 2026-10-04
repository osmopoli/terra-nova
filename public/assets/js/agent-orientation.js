/* Terra Nova — vague 18 : page des agents « Orientation et langage clair » (agent-orientation.html).
   F91 : questions sans réponse (anonymes, agrégées) → « Associer » à une démarche ou un service : l'expression est apprise par le moteur.
   F90 : passages souvent expliqués (compteur anonyme). F89 : édition des versions en langage clair, contrôlée par le serveur
   (refus 422 si un élément obligatoire du texte officiel manque). Droits vérifiés par le serveur : agent ou administrateur. */
(function () {
  'use strict';
  const NT = window.NT;
  const L = (fr, en, es, ar) => ({ fr, en, es, ar });
  const textes = {
    'ao.surtitre': L('Mairie · Haut Conseil · Service Inclusion', 'City hall · High Council · Inclusion service', 'Ayuntamiento · Alto Consejo · Servicio de Inclusión', 'البلدية · المجلس الأعلى · خدمة الإدماج'),
    'ao.titre': L('Orientation et langage clair', 'Guidance and plain language', 'Orientación y lenguaje claro', 'التوجيه واللغة الواضحة'),
    'ao.sous': L('Ce que les habitants cherchent sans trouver, pour enrichir l’assistant d’orientation ; les passages qu’ils demandent souvent à expliquer ; les versions en langage clair.', 'What residents look for without finding it, to enrich the guidance assistant; passages they often ask to explain; plain-language versions.', 'Lo que los habitantes buscan sin encontrar, para enriquecer el asistente; los pasajes que piden explicar; las versiones en lenguaje claro.', 'ما يبحث عنه السكان دون أن يجدوه لإثراء مساعد التوجيه، والمقاطع التي يطلبون شرحها، والنسخ بلغة واضحة.'),
    'ao.questions': L('Questions sans réponse', 'Unanswered questions', 'Preguntas sin respuesta', 'أسئلة بلا إجابة'),
    'ao.questionsD': L('Phrases de la recherche et de l’assistant restées sans bonne réponse. Elles sont anonymes : chiffres, e-mails et liens retirés, aucun compte, aucune adresse IP. « Associer » apprend l’expression au moteur, tout de suite.', 'Search and assistant phrases left without a good answer. They are anonymous: numbers, e-mails and links removed, no account, no IP address. “Link” teaches the phrase to the engine immediately.', 'Frases sin buena respuesta. Son anónimas: sin cifras, correos ni enlaces, sin cuenta ni IP. «Asociar» enseña la expresión al motor al instante.', 'عبارات بقيت دون إجابة جيدة. مجهولة الهوية: دون أرقام أو بريد أو روابط، دون حساب أو عنوان IP. «ربط» يعلّم المحرك العبارة فوراً.'),
    'ao.filtre': L('Filtrer par état', 'Filter by status', 'Filtrar por estado', 'تصفية حسب الحالة'),
    'ao.s.ouverte': L('À traiter', 'To handle', 'Por tratar', 'للمعالجة'), 'ao.s.associee': L('Associées', 'Linked', 'Asociadas', 'مربوطة'), 'ao.s.ignoree': L('Ignorées', 'Ignored', 'Ignoradas', 'متجاهلة'),
    'ao.c.question': L('Question (anonymisée)', 'Question (anonymised)', 'Pregunta (anónima)', 'السؤال (مجهول)'), 'ao.c.fois': L('Fois', 'Times', 'Veces', 'مرات'), 'ao.c.source': L('Où', 'Where', 'Dónde', 'أين'),
    'ao.c.dernier': L('Dernière fois', 'Last time', 'Última vez', 'آخر مرة'), 'ao.c.piste': L('Associer à', 'Link to', 'Asociar a', 'ربط بـ'), 'ao.c.action': L('Action', 'Action', 'Acción', 'إجراء'),
    'ao.associer': L('Associer', 'Link', 'Asociar', 'ربط'), 'ao.ignorer': L('Ignorer', 'Ignore', 'Ignorar', 'تجاهل'), 'ao.retirer': L('Retirer', 'Remove', 'Quitar', 'إزالة'),
    'ao.aucune': L('Aucune question dans cette liste.', 'No question in this list.', 'Ninguna pregunta en esta lista.', 'لا أسئلة في هذه القائمة.'),
    'ao.nbQuestions': L('{n} questions affichées.', '{n} questions shown.', '{n} preguntas mostradas.', '{n} أسئلة معروضة.'), 'ao.nbQuestion1': L('1 question affichée.', '1 question shown.', '1 pregunta mostrada.', 'سؤال واحد معروض.'),
    'ao.sansContenu': L('Aucun contenu chargé : rechargez la page.', 'No content loaded: reload the page.', 'Ningún contenido cargado: recargue la página.', 'لم يُحمَّل أي محتوى: أعد تحميل الصفحة.'),
    'ao.associee': L('Expression apprise : « {e} » → {c}', 'Phrase learned: “{e}” → {c}', 'Expresión aprendida: «{e}» → {c}', 'عبارة مُتعلَّمة: «{e}» ← {c}'),
    'ao.synonymes': L('Expressions apprises', 'Learned phrases', 'Expresiones aprendidas', 'عبارات مُتعلَّمة'), 'ao.c.expression': L('Expression', 'Phrase', 'Expresión', 'العبارة'), 'ao.c.cible': L('Démarche ou service', 'Procedure or service', 'Trámite o servicio', 'الإجراء أو الخدمة'), 'ao.c.par': L('Par', 'By', 'Por', 'بواسطة'),
    'ao.expl': L('Passages souvent expliqués', 'Passages often explained', 'Pasajes a menudo explicados', 'مقاطع يُطلب شرحها كثيراً'),
    'ao.explD': L('Combien de fois les habitants ont demandé « Expliquer plus simplement » (compteur anonyme). Un passage très demandé mérite d’être réécrit.', 'How often residents asked “Explain more simply” (anonymous counter). A passage asked often deserves a rewrite.', 'Cuántas veces se pidió «Explicar más sencillo» (contador anónimo).', 'عدد مرات طلب «اشرح ببساطة» (عداد مجهول).'),
    'ao.t.paragraphe': L('Paragraphe', 'Paragraph', 'Párrafo', 'فقرة'), 'ao.t.selection': L('Passage sélectionné', 'Selected passage', 'Pasaje seleccionado', 'مقطع محدد'), 'ao.t.terme': L('Mot', 'Word', 'Palabra', 'كلمة'),
    'ao.c.page': L('Page', 'Page', 'Página', 'الصفحة'), 'ao.c.passage': L('Passage ou mots', 'Passage or words', 'Pasaje o palabras', 'المقطع أو الكلمات'), 'ao.c.type': L('Type', 'Type', 'Tipo', 'النوع'),
    'ao.clair': L('Versions en langage clair', 'Plain-language versions', 'Versiones en lenguaje claro', 'نسخ بلغة واضحة'),
    'ao.clairD': L('Phrases courtes, un encadré par question. Le serveur refuse d’enregistrer si une date, un délai, un montant, une référence ou un document du texte officiel a disparu.', 'Short sentences, one box per question. The server refuses to save if a date, deadline, amount, reference or document of the official text is missing.', 'Frases cortas. El servidor rechaza guardar si falta una fecha, un plazo, un importe, una referencia o un documento.', 'جمل قصيرة. يرفض الخادم الحفظ إذا اختفى تاريخ أو مهلة أو مبلغ أو مرجع أو وثيقة.'),
    'ao.contenu': L('Contenu', 'Content', 'Contenido', 'المحتوى'), 'ao.langue': L('Langue', 'Language', 'Idioma', 'اللغة'), 'ao.officiel': L('Texte officiel (fait foi)', 'Official text (prevails)', 'Texto oficial (prevalece)', 'النص الرسمي (المرجع)'),
    'ao.motif': L('Motif de la modification (journal)', 'Reason for the change (log)', 'Motivo del cambio (registro)', 'سبب التعديل (السجل)'),
    'ao.verifier': L('Vérifier les éléments obligatoires', 'Check required elements', 'Comprobar elementos obligatorios', 'التحقق من العناصر الإلزامية'), 'ao.enregistrer': L('Enregistrer', 'Save', 'Guardar', 'حفظ'),
    'ao.f.resume': L('Résumé en une ou deux phrases (obligatoire)', 'Summary in one or two sentences (required)', 'Resumen en una o dos frases (obligatorio)', 'ملخص في جملة أو جملتين (إلزامي)'),
    'ao.f.qui': L('Qui ?', 'Who?', '¿Quién?', 'من؟'), 'ao.f.quoi': L('Quoi ?', 'What?', '¿Qué?', 'ماذا؟'), 'ao.f.quand': L('Quand ?', 'When?', '¿Cuándo?', 'متى؟'), 'ao.f.combien': L('Combien ?', 'How much?', '¿Cuánto?', 'كم؟'),
    'ao.f.documents': L('Documents ?', 'Documents?', '¿Documentos?', 'الوثائق؟'), 'ao.f.ou': L('Où ?', 'Where?', '¿Dónde?', 'أين؟'), 'ao.f.p': L('Explication simple du paragraphe officiel {n}', 'Simple explanation of official paragraph {n}', 'Explicación sencilla del párrafo oficial {n}', 'شرح بسيط للفقرة الرسمية {n}'),
    'ao.ok': L('Tous les éléments obligatoires sont présents : {l}.', 'All required elements are present: {l}.', 'Están todos los elementos obligatorios: {l}.', 'كل العناصر الإلزامية موجودة: {l}.'),
    'ao.manque': L('Éléments obligatoires absents de la version claire : {l}.', 'Required elements missing from the plain version: {l}.', 'Faltan elementos obligatorios: {l}.', 'عناصر إلزامية غائبة: {l}.'),
    'ao.enregistre': L('Version claire enregistrée (version {v}).', 'Plain version saved (version {v}).', 'Versión clara guardada (versión {v}).', 'تم حفظ النسخة الواضحة (النسخة {v}).'),
    'ao.erreur': L('Action impossible : {e}', 'Action failed: {e}', 'Acción imposible: {e}', 'تعذّر الإجراء: {e}')
  };
  const paquet = { fr: {}, en: {}, es: {}, ar: {} };
  for (const [k, v] of Object.entries(textes)) for (const l of Object.keys(paquet)) paquet[l][k] = v[l];
  NT.i18n.ajouter(paquet);

  const SOURCES = { recherche: L('Recherche', 'Search', 'Búsqueda', 'البحث'), assistant: L('Assistant', 'Assistant', 'Asistente', 'المساعد'), demande: L('Formulaire', 'Form', 'Formulario', 'النموذج'), 'pas-utile': L('« Pas utile »', '“Not helpful”', '«No útil»', '«غير مفيد»') };
  const CHAMPS = ['resume', 'qui', 'quoi', 'quand', 'combien', 'documents', 'ou'];

  NT.pret(() => {
    const t = NT.t, E = NT.ui.echap, $ = (s) => document.querySelector(s);
    const appel = (methode, url, corps) => fetch(url, { method: methode, credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: corps ? JSON.stringify(corps) : undefined })
      .then((r) => r.json().catch(() => ({})).then((d) => (r.ok ? d : Promise.reject(Object.assign(new Error(d.erreur || 'HTTP ' + r.status), { donnees: d })))));
    let statut = 'ouverte', donnees = null;

    /* ---------- Questions sans réponse ---------- */
    function rendreStatuts() {
      const c = (donnees && donnees.compte) || {};
      $('#ao-statuts').innerHTML = ['ouverte', 'associee', 'ignoree'].map((s) => `<button type="button" class="btn petit" data-statut="${s}" aria-pressed="${s === statut}">${E(t('ao.s.' + s))} (${(c[s] && c[s].questions) || 0})</button>`).join('');
    }
    const options = (sel) => (donnees.cibles || []).map((c) => `<option value="${E(c.id)}" ${c.id === sel ? 'selected' : ''}>${E(c.titre)}</option>`).join('');
    function rendreQuestions() {
      const l = donnees.questions || [];
      $('#ao-questions').innerHTML = !l.length ? `<p class="vide">${E(t('ao.aucune'))}</p>` : `<table class="ao-table"><caption class="sr-only">${E(t('ao.questions'))}</caption>
        <thead><tr><th scope="col">${E(t('ao.c.question'))}</th><th scope="col">${E(t('ao.c.fois'))}</th><th scope="col">${E(t('ao.c.source'))}</th><th scope="col">${E(t('ao.c.dernier'))}</th>
        ${statut === 'ouverte' ? `<th scope="col">${E(t('ao.c.piste'))}</th><th scope="col">${E(t('ao.c.action'))}</th>` : `<th scope="col">${E(t('ao.c.cible'))}</th>`}</tr></thead>
        <tbody>${l.map((q, i) => `<tr><td><strong dir="auto">${E(q.texte)}</strong> <span class="doux">(${E(q.langue || 'fr')})</span></td><td>${q.n}</td><td>${E(NT.i18n.choisir(SOURCES[q.source] || { fr: q.source }))}</td><td>${E(NT.ui.dateHeure(q.dernier))}</td>
          ${statut === 'ouverte' ? `<td><label class="sr-only" for="ao-c-${i}">${E(t('ao.c.piste'))} : ${E(q.texte)}</label><select id="ao-c-${i}"><option value="">—</option>${options(q.piste && q.piste.id)}</select></td>
          <td class="ligne" style="gap:.4rem"><button type="button" class="btn petit btn-primaire" data-associer="${i}">${E(t('ao.associer'))}</button><button type="button" class="btn petit" data-ignorer="${i}">${E(t('ao.ignorer'))}</button></td>`
          : `<td>${E(((donnees.cibles || []).find((c) => c.id === q.cible) || {}).titre || q.cible || '—')}${q.par ? ` <span class="doux">· ${E(q.par)}</span>` : ''}</td>`}</tr>`).join('')}</tbody></table>`;
      // un résumé pour le lecteur d'écran plutôt qu'un tableau entier en zone vivante
      NT.ui.annoncer(!l.length ? t('ao.aucune') : l.length === 1 ? t('ao.nbQuestion1') : t('ao.nbQuestions', { n: l.length }));
    }
    function rendreSynonymes() {
      const l = donnees.synonymes || [];
      $('#ao-synonymes').innerHTML = !l.length ? `<p class="vide">${E(t('ao.aucune'))}</p>` : `<table class="ao-table"><caption class="sr-only">${E(t('ao.synonymes'))}</caption>
        <thead><tr><th scope="col">${E(t('ao.c.expression'))}</th><th scope="col">${E(t('ao.c.cible'))}</th><th scope="col">${E(t('ao.c.par'))}</th><th scope="col">${E(t('ao.c.action'))}</th></tr></thead>
        <tbody>${l.map((s) => `<tr><td dir="auto">« ${E(s.expression)} »</td><td>${E(((donnees.cibles || []).find((c) => c.id === s.cible) || {}).titre || s.cible)}</td><td>${E(s.par)} · ${E(NT.ui.dateHeure(s.date))}</td>
          <td><button type="button" class="btn petit" data-retirer="${E(s.id)}">${E(t('ao.retirer'))}</button></td></tr>`).join('')}</tbody></table>`;
    }
    function charger() {
      return appel('GET', '/api/orientation/questions?statut=' + statut).then((d) => { donnees = d; rendreStatuts(); rendreQuestions(); rendreSynonymes(); })
        .catch((e) => { $('#ao-questions').innerHTML = `<p class="erreur">${E(t('ao.erreur', { e: e.message }))}</p>`; });
    }
    $('#ao-statuts').addEventListener('click', (e) => { const b = e.target.closest('[data-statut]'); if (b) { statut = b.dataset.statut; charger().then(() => { const n = $(`[data-statut="${statut}"]`); if (n) n.focus(); }); } });
    $('#ao-questions').addEventListener('click', (e) => {
      const a = e.target.closest('[data-associer]'), ig = e.target.closest('[data-ignorer]');
      if (!a && !ig) return;
      const i = Number((a || ig).dataset.associer || (a || ig).dataset.ignorer);
      const q = donnees.questions[i];
      if (ig) return appel('POST', '/api/orientation/questions/ignorer', { cle: q.cle }).then(charger).catch((er) => NT.ui.toast(t('ao.erreur', { e: er.message }), 'danger'));
      const cible = $('#ao-c-' + i).value;
      appel('POST', '/api/orientation/questions/associer', { cle: q.cle, cible }).then((r) => {
        NT.ui.toast(t('ao.associee', { e: r.synonyme.expression, c: ((donnees.cibles || []).find((c) => c.id === cible) || {}).titre || cible }), 'success');
        return charger();
      }).catch((er) => NT.ui.toast(t('ao.erreur', { e: er.message }), 'danger'));
    });
    $('#ao-synonymes').addEventListener('click', (e) => { const b = e.target.closest('[data-retirer]'); if (b) appel('DELETE', '/api/orientation/synonymes/' + encodeURIComponent(b.dataset.retirer)).then(charger).catch((er) => NT.ui.toast(t('ao.erreur', { e: er.message }), 'danger')); });

    /* ---------- Passages souvent expliqués ---------- */
    appel('GET', '/api/explications/stats').then((l) => {
      $('#ao-explications').innerHTML = !l.length ? `<p class="vide">${E(t('ao.aucune'))}</p>` : `<table class="ao-table"><caption class="sr-only">${E(t('ao.expl'))}</caption>
        <thead><tr><th scope="col">${E(t('ao.c.page'))}</th><th scope="col">${E(t('ao.c.passage'))}</th><th scope="col">${E(t('ao.c.type'))}</th><th scope="col">${E(t('ao.c.fois'))}</th></tr></thead>
        <tbody>${l.map((x) => `<tr><td>${E(x.page)}</td><td dir="auto">${E(x.extrait || x.cle.split('|').pop())}</td><td class="ao-type">${E(['paragraphe', 'selection', 'terme'].includes(x.type) ? t('ao.t.' + x.type) : x.type)}</td><td>${x.n}</td></tr>`).join('')}</tbody></table>`;
    }).catch(() => {});

    /* ---------- Langage clair : édition contrôlée ---------- */
    let contenu = null;
    const lireForm = () => {
      const c = {};
      CHAMPS.forEach((k) => { const v = $('#ao-f-' + k).value.trim(); if (v) c[k] = v; });
      c.paragraphes = [...document.querySelectorAll('[data-ao-p]')].map((x) => x.value.trim());
      return c;
    };
    function rendreContenu() {
      const l = $('#ao-lc-langue').value;
      const off = (contenu.officiel && (contenu.officiel[l] || contenu.officiel.fr)) || [];
      const cl = (contenu.clair && contenu.clair[l]) || {};
      $('#ao-lc-officiel').innerHTML = off.map((p, i) => `<p dir="auto"><strong>§${i + 1}</strong> ${E(p)}</p>`).join('');
      $('#ao-lc-champs').innerHTML = CHAMPS.map((k) => `<div class="ao-champ"><label for="ao-f-${k}">${E(t('ao.f.' + k))}</label><textarea id="ao-f-${k}" dir="auto" maxlength="600">${E(cl[k] || '')}</textarea></div>`).join('')
        + off.map((p, i) => `<div class="ao-champ"><label for="ao-f-p${i}">${E(t('ao.f.p', { n: i + 1 }))}</label><textarea id="ao-f-p${i}" data-ao-p dir="auto" maxlength="900">${E((cl.paragraphes || [])[i] || '')}</textarea></div>`).join('');
      $('#ao-lc-verif').innerHTML = '';
    }
    function chargerContenu() {
      appel('GET', '/api/langage-clair/' + encodeURIComponent($('#ao-lc-id').value)).then((c) => { contenu = c; rendreContenu(); }).catch(() => {});
    }
    const resultat = (v) => {
      $('#ao-lc-verif').innerHTML = v.ok ? `<p class="ao-ok" role="status">${E(t('ao.ok', { l: v.requis.map((x) => x.valeur).join(' · ') || '—' }))}</p>`
        : `<p class="ao-manquants" role="alert">${E(t('ao.manque', { l: v.manquants.map((x) => x.valeur).join(' · ') }))}</p>`;
    };
    appel('GET', '/api/langage-clair').then((l) => {
      $('#ao-lc-id').innerHTML = l.map((c) => `<option value="${E(c.id)}">${E(NT.i18n.choisir(c.titre) || c.id)} (${E(c.langues.join(', '))})</option>`).join('');
      chargerContenu();
    }).catch(() => {});
    $('#ao-lc-id').addEventListener('change', chargerContenu);
    $('#ao-lc-langue').addEventListener('change', () => contenu && rendreContenu());
    $('#ao-lc-verifier').addEventListener('click', () => { if (!contenu) { NT.ui.annoncer(t('ao.sansContenu')); return; } appel('POST', '/api/langage-clair/' + encodeURIComponent(contenu.id) + '/verifier', { langue: $('#ao-lc-langue').value, clair: lireForm() }).then(resultat).catch((e) => NT.ui.toast(t('ao.erreur', { e: e.message }), 'danger')); });
    $('#ao-form-lc').addEventListener('submit', (e) => {
      e.preventDefault();
      if (!contenu) { NT.ui.annoncer(t('ao.sansContenu')); return; }
      appel('PUT', '/api/langage-clair/' + encodeURIComponent(contenu.id), { langue: $('#ao-lc-langue').value, clair: lireForm(), motif: $('#ao-lc-motif').value })
        .then((c) => { contenu = c; NT.ui.toast(t('ao.enregistre', { v: c.version }), 'success'); $('#ao-lc-verif').innerHTML = `<p class="ao-ok" role="status">${E(t('ao.enregistre', { v: c.version }))}</p>`; })
        .catch((er) => { if (er.donnees && er.donnees.manquants) resultat({ ok: false, manquants: er.donnees.manquants, requis: er.donnees.requis || [] }); else NT.ui.toast(t('ao.erreur', { e: er.message }), 'danger'); });
    });
    charger();
  });
})();
