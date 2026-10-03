/* Terra Nova — F75 : demandes semblables et « ce qui demande de l'attention » (agent-demandes.html).
   Les groupes sont calculés par le serveur (GET /api/demandes/groupes : texte normalisé, TF-IDF + cosinus, même service,
   même quartier, dates proches). Ici : panneau « N demandes semblables », filtres d'attention (urgentes, non assignées,
   dans un groupe), tri (action requise, attente la plus longue, plus récentes, plus gros groupes), badge dans le tableau
   et, dans le tiroir de traitement, les demandes semblables à rattacher à la demande principale (répondre une fois suffit).
   Chargé dans <head> après agent.js ; la page branche ses hooks (filtre, tri, badge, tiroir). */
(function () {
  'use strict';
  const NT = window.NT;
  NT.i18n.ajouter({
    fr: { 'sg.rattacherA': 'Rattacher cette demande au groupe de {id}', 'sg.titre': 'Demandes semblables', 'sg.intro': 'Regroupées par le serveur : mêmes mots, même service, même quartier, dates proches. Rattachez-les à une demande principale : votre réponse sera envoyée à tous les habitants concernés.',
      'sg.n': '{n} demandes semblables', 'sg.aucun': 'Aucun groupe de demandes semblables parmi les demandes ouvertes.', 'sg.principale': 'Principale', 'sg.rattachees': '{n} déjà rattachée(s)',
      'sg.mots': 'Mots communs', 'sg.periode': 'Du {d} au {f}', 'sg.habitants': '{n} habitant(s)', 'sg.urgent': 'Contient une demande urgente',
      'sg.rattacher': 'Rattacher {n} demande(s) à {id}', 'sg.voir': 'Voir dans le tableau', 'sg.ouvrir': 'Traiter {id}', 'sg.tout': 'Tout le groupe est rattaché : répondez sur {id}.',
      'sg.okLier': '{n} demande(s) rattachée(s) à {id} : répondez une fois, chaque habitant sera prévenu.', 'sg.okDelier': 'Demande {id} de nouveau traitée séparément.',
      'sg.attention': 'Attention :', 'sg.fUrgentes': 'Urgentes', 'sg.fNonAssignees': 'Non assignées', 'sg.fGroupes': 'Dans un groupe', 'sg.tri': 'Trier par',
      'sg.tAction': 'Action requise d’abord', 'sg.tAttente': 'Attente la plus longue', 'sg.tRecentes': 'Plus récentes', 'sg.tGroupes': 'Plus gros groupes',
      'sg.badge': '{n} semblables', 'sg.badgeLiee': 'Rattachée à {id}', 'sg.attend': 'attend depuis {d}', 'sg.filtreGroupe': 'Filtre : groupe de {id}', 'sg.effacer': 'Afficher toutes les demandes',
      'sg.tiroir': 'Demandes semblables', 'sg.tiroirAucune': 'Aucune demande ouverte ne ressemble à celle-ci.', 'sg.estLiee': 'Cette demande est rattachée à {id} : la réponse faite sur la demande principale lui est envoyée automatiquement.',
      'sg.ouvrirPrincipale': 'Ouvrir la demande principale', 'sg.detacher': 'Détacher', 'sg.choisir': 'Choisir {id}', 'sg.lierSel': 'Rattacher la sélection à cette demande',
      'sg.memeService': 'même service', 'sg.memeQuartier': 'même quartier', 'sg.jours': 'écart {n} j', 'sg.ressemblance': 'ressemblance {n} %', 'sg.liee': 'rattachée', 'sg.estPrincipale': 'Demande principale : {n} demande(s) rattachée(s). Votre réponse leur est envoyée.' },
    en: { 'sg.rattacherA': 'Link this request to the group of {id}', 'sg.titre': 'Similar requests', 'sg.intro': 'Grouped by the server: same words, same service, same district, close dates. Link them to a main request: your reply will be sent to every resident concerned.',
      'sg.n': '{n} similar requests', 'sg.aucun': 'No group of similar requests among open requests.', 'sg.principale': 'Main', 'sg.rattachees': '{n} already linked',
      'sg.mots': 'Common words', 'sg.periode': 'From {d} to {f}', 'sg.habitants': '{n} resident(s)', 'sg.urgent': 'Contains an urgent request',
      'sg.rattacher': 'Link {n} request(s) to {id}', 'sg.voir': 'Show in the table', 'sg.ouvrir': 'Handle {id}', 'sg.tout': 'The whole group is linked: reply on {id}.',
      'sg.okLier': '{n} request(s) linked to {id}: reply once, each resident will be notified.', 'sg.okDelier': 'Request {id} is handled separately again.',
      'sg.attention': 'Attention:', 'sg.fUrgentes': 'Urgent', 'sg.fNonAssignees': 'Unassigned', 'sg.fGroupes': 'In a group', 'sg.tri': 'Sort by',
      'sg.tAction': 'Action required first', 'sg.tAttente': 'Waiting longest', 'sg.tRecentes': 'Most recent', 'sg.tGroupes': 'Largest groups',
      'sg.badge': '{n} similar', 'sg.badgeLiee': 'Linked to {id}', 'sg.attend': 'waiting {d}', 'sg.filtreGroupe': 'Filter: group of {id}', 'sg.effacer': 'Show all requests',
      'sg.tiroir': 'Similar requests', 'sg.tiroirAucune': 'No open request looks like this one.', 'sg.estLiee': 'This request is linked to {id}: the reply given on the main request is sent to it automatically.',
      'sg.ouvrirPrincipale': 'Open the main request', 'sg.detacher': 'Unlink', 'sg.choisir': 'Select {id}', 'sg.lierSel': 'Link the selection to this request',
      'sg.memeService': 'same service', 'sg.memeQuartier': 'same district', 'sg.jours': '{n} d apart', 'sg.ressemblance': '{n} % similar', 'sg.liee': 'linked', 'sg.estPrincipale': 'Main request: {n} linked request(s). Your reply is sent to them.' },
    es: { 'sg.rattacherA': 'Vincular esta solicitud al grupo de {id}', 'sg.titre': 'Solicitudes parecidas', 'sg.intro': 'Agrupadas por el servidor: mismas palabras, mismo servicio, mismo barrio, fechas cercanas. Vincúlelas a una solicitud principal: su respuesta se enviará a todos los habitantes afectados.',
      'sg.n': '{n} solicitudes parecidas', 'sg.aucun': 'Ningún grupo de solicitudes parecidas entre las abiertas.', 'sg.principale': 'Principal', 'sg.rattachees': '{n} ya vinculada(s)',
      'sg.mots': 'Palabras comunes', 'sg.periode': 'Del {d} al {f}', 'sg.habitants': '{n} habitante(s)', 'sg.urgent': 'Contiene una solicitud urgente',
      'sg.rattacher': 'Vincular {n} solicitud(es) a {id}', 'sg.voir': 'Ver en la tabla', 'sg.ouvrir': 'Tratar {id}', 'sg.tout': 'Todo el grupo está vinculado: responda en {id}.',
      'sg.okLier': '{n} solicitud(es) vinculada(s) a {id}: responda una vez, cada habitante recibirá aviso.', 'sg.okDelier': 'La solicitud {id} vuelve a tratarse por separado.',
      'sg.attention': 'Atención:', 'sg.fUrgentes': 'Urgentes', 'sg.fNonAssignees': 'Sin asignar', 'sg.fGroupes': 'En un grupo', 'sg.tri': 'Ordenar por',
      'sg.tAction': 'Acción requerida primero', 'sg.tAttente': 'Espera más larga', 'sg.tRecentes': 'Más recientes', 'sg.tGroupes': 'Grupos más grandes',
      'sg.badge': '{n} parecidas', 'sg.badgeLiee': 'Vinculada a {id}', 'sg.attend': 'espera desde {d}', 'sg.filtreGroupe': 'Filtro: grupo de {id}', 'sg.effacer': 'Mostrar todas las solicitudes',
      'sg.tiroir': 'Solicitudes parecidas', 'sg.tiroirAucune': 'Ninguna solicitud abierta se parece a esta.', 'sg.estLiee': 'Esta solicitud está vinculada a {id}: la respuesta dada en la principal se le envía automáticamente.',
      'sg.ouvrirPrincipale': 'Abrir la solicitud principal', 'sg.detacher': 'Desvincular', 'sg.choisir': 'Seleccionar {id}', 'sg.lierSel': 'Vincular la selección a esta solicitud',
      'sg.memeService': 'mismo servicio', 'sg.memeQuartier': 'mismo barrio', 'sg.jours': '{n} d de diferencia', 'sg.ressemblance': 'parecido {n} %', 'sg.liee': 'vinculada', 'sg.estPrincipale': 'Solicitud principal: {n} solicitud(es) vinculada(s). Su respuesta se les envía.' },
    ar: { 'sg.rattacherA': 'ربط هذا الطلب بمجموعة {id}', 'sg.titre': 'طلبات متشابهة', 'sg.intro': 'جمعها الخادم: الكلمات نفسها، الخدمة نفسها، الحي نفسه، تواريخ متقاربة. اربطها بطلب رئيسي: يُرسل ردك إلى جميع السكان المعنيين.',
      'sg.n': '{n} طلبات متشابهة', 'sg.aucun': 'لا توجد مجموعة طلبات متشابهة بين الطلبات المفتوحة.', 'sg.principale': 'رئيسي', 'sg.rattachees': '{n} مرتبطة مسبقاً',
      'sg.mots': 'كلمات مشتركة', 'sg.periode': 'من {d} إلى {f}', 'sg.habitants': '{n} ساكن', 'sg.urgent': 'تتضمن طلباً عاجلاً',
      'sg.rattacher': 'ربط {n} طلب(ات) بـ {id}', 'sg.voir': 'عرض في الجدول', 'sg.ouvrir': 'معالجة {id}', 'sg.tout': 'المجموعة كلها مرتبطة: ردّ على {id}.',
      'sg.okLier': 'رُبط {n} طلب(ات) بـ {id}: ردّ مرة واحدة، وسيتم إعلام كل ساكن.', 'sg.okDelier': 'الطلب {id} يُعالج منفصلاً من جديد.',
      'sg.attention': 'انتباه:', 'sg.fUrgentes': 'عاجلة', 'sg.fNonAssignees': 'غير مسندة', 'sg.fGroupes': 'ضمن مجموعة', 'sg.tri': 'ترتيب حسب',
      'sg.tAction': 'الإجراء المطلوب أولاً', 'sg.tAttente': 'الانتظار الأطول', 'sg.tRecentes': 'الأحدث', 'sg.tGroupes': 'المجموعات الأكبر',
      'sg.badge': '{n} متشابهة', 'sg.badgeLiee': 'مرتبط بـ {id}', 'sg.attend': 'ينتظر منذ {d}', 'sg.filtreGroupe': 'تصفية: مجموعة {id}', 'sg.effacer': 'عرض كل الطلبات',
      'sg.tiroir': 'طلبات متشابهة', 'sg.tiroirAucune': 'لا يوجد طلب مفتوح يشبه هذا الطلب.', 'sg.estLiee': 'هذا الطلب مرتبط بـ {id}: الرد على الطلب الرئيسي يُرسل إليه تلقائياً.',
      'sg.ouvrirPrincipale': 'فتح الطلب الرئيسي', 'sg.detacher': 'فك الربط', 'sg.choisir': 'اختيار {id}', 'sg.lierSel': 'ربط المحدد بهذا الطلب',
      'sg.memeService': 'الخدمة نفسها', 'sg.memeQuartier': 'الحي نفسه', 'sg.jours': 'فارق {n} يوم', 'sg.ressemblance': 'تشابه {n} %', 'sg.liee': 'مرتبط', 'sg.estPrincipale': 'طلب رئيسي: {n} طلب(ات) مرتبطة. يُرسل ردك إليها.' }
  });

  const X = (NT.doublons = {});
  const t = (k, v) => NT.t(k, v);
  const e = s => NT.ui.echap(s);
  let groupes = [];
  const parDemande = new Map();   // id de demande → groupe
  const etat = { urgentes: false, nonAssignees: false, groupes: false, tri: 'action', groupe: '' };
  X.etat = etat;
  X.onChange = () => {};
  X.ouvrir = () => {};

  X.recharger = () => {
    const r = NT.api('GET', '/api/demandes/groupes');
    X.pause = r.statut === 503 ? ((r.donnees && r.donnees.erreur) || '') : '';   // vague 15 : regroupement mis en pause pendant la forte affluence
    if (X.pause) return;
    groupes = r.statut === 200 ? r.donnees.groupes : [];
    parDemande.clear();
    groupes.forEach(g => g.demandes.concat(g.rattachees).forEach(id => parDemande.set(id, g)));
  };
  X.groupeDe = id => parDemande.get(id) || null;

  /* Filtres d'attention, appelés par le filtre de la page */
  X.filtre = d => {
    const A = NT.agent;
    if (etat.groupe) { const g = X.groupeDe(d.id); if (!g || g.id !== etat.groupe) return false; }
    if (etat.urgentes && !(A.estHaute(d.priorite) && A.estOuverte(d))) return false;
    if (etat.nonAssignees && !(!d.agent && A.estOuverte(d))) return false;
    if (etat.groupes && !X.groupeDe(d.id)) return false;
    return true;
  };
  // Tri choisi (null = tri par défaut de la page : action requise d'abord)
  X.tri = () => {
    const A = NT.agent;
    if (etat.tri === 'attente') return (a, b) => (A.estOuverte(b) - A.estOuverte(a)) || A.dernierChangement(a).localeCompare(A.dernierChangement(b));
    if (etat.tri === 'recentes') return (a, b) => b.cree.localeCompare(a.cree);
    if (etat.tri === 'priorite' && NT.priorites) return NT.priorites.comparer;   // vague 15 (F80)
    if (etat.tri === 'groupes') return (a, b) => ((X.groupeDe(b.id) || {}).taille || 0) - ((X.groupeDe(a.id) || {}).taille || 0) || a.cree.localeCompare(b.cree);
    return null;
  };
  X.badge = d => {
    if (d.principale) return `<span class="sg-badge sg-liee"><i class="ph ph-link" aria-hidden="true"></i>${e(t('sg.badgeLiee', { id: d.principale }))}</span>`;
    const g = X.groupeDe(d.id);
    const attente = etat.tri === 'attente' && NT.agent.estOuverte(d) ? `<span class="sg-badge sg-attente"><i class="ph ph-hourglass-medium" aria-hidden="true"></i>${e(t('sg.attend', { d: NT.ui.depuis(NT.agent.dernierChangement(d)) }))}</span>` : '';
    return (g ? `<button type="button" class="sg-badge" data-sg-groupe="${e(g.id)}"><i class="ph ph-stack" aria-hidden="true"></i>${e(t('sg.badge', { n: g.taille }))}</button>` : '') + attente;
  };

  /* Panneau des groupes + barre d'attention, insérés avant le compteur du tableau */
  function panneau() {
    const z = document.getElementById('sg-groupes'); if (!z) return;
    const A = NT.agent;
    z.innerHTML = `<h2 id="sg-h"><i class="ph-duotone ph-stack" aria-hidden="true"></i> ${e(t('sg.titre'))} <span class="pastille-n">${groupes.length}</span></h2>
      <p class="doux" style="margin:.2rem 0 .8rem;font-size:.88rem">${e(t('sg.intro'))}</p>
      ${X.pause && !groupes.length ? `<p class="vide" role="status">${e(X.pause)}</p>` : groupes.length ? `<ul class="sg-liste">${groupes.map(g => `<li class="sg-groupe${g.urgente ? ' sg-urgente' : ''}">
        <div class="ligne entre"><strong class="sg-n">${e(t('sg.n', { n: g.taille }))}</strong>${g.urgente ? `<span class="ag-prio ag-prio-haute"><i class="ph ph-caret-double-up" aria-hidden="true"></i>${e(t('sg.urgent'))}</span>` : ''}</div>
        <p class="sg-objet">${e(g.objet)}</p>
        <p class="sg-meta">${e(A.service(g.serviceId) || '–')} · ${e(g.quartiers.join(', ') || '–')} · ${e(t('sg.habitants', { n: g.habitants }))} · ${e(t('sg.periode', { d: NT.ui.dateHeure(g.premier), f: NT.ui.dateHeure(g.dernier) }))}</p>
        ${g.motsCles.length ? `<p class="sg-meta">${e(t('sg.mots'))} : ${g.motsCles.map(m => `<span class="sg-mot">${e(m)}</span>`).join(' ')}</p>` : ''}
        <p class="sg-ids">${g.demandes.concat(g.rattachees).map(id => `<button type="button" class="sg-id${id === g.principale ? ' sg-princ' : ''}" data-sg-ouvrir="${e(id)}" aria-label="${e(t('sg.ouvrir', { id }))}">${e(id)}${id === g.principale ? ` · ${e(t('sg.principale'))}` : g.rattachees.includes(id) ? ' · ' + e(t('sg.liee')) : ''}</button>`).join('')}</p>
        <div class="ligne">${g.aRattacher.length ? `<button type="button" class="btn btn-primaire" data-sg-lier="${e(g.principale)}" data-sg-ids="${e(g.aRattacher.join(','))}"><i class="ph ph-link" aria-hidden="true"></i>${e(t('sg.rattacher', { n: g.aRattacher.length, id: g.principale }))}</button>`
          : `<span class="doux">${e(t('sg.tout', { id: g.principale }))}</span>`}
          <button type="button" class="btn" data-sg-groupe="${e(g.id)}"><i class="ph ph-funnel" aria-hidden="true"></i>${e(t('sg.voir'))}</button></div>
      </li>`).join('')}</ul>` : `<p class="vide">${e(t('sg.aucun'))}</p>`}`;
  }
  function barre() {
    const z = document.getElementById('sg-attention'); if (!z) return;
    const chip = (k, lib, ic) => `<button type="button" class="sv-filtre sg-chip" data-sg-filtre="${k}" aria-pressed="${!!etat[k]}"><i class="ph ${ic}" aria-hidden="true"></i> ${e(t(lib))}</button>`;
    z.innerHTML = `<span id="sg-lbl-att">${e(t('sg.attention'))}</span>
      <span class="sg-chips" role="group" aria-labelledby="sg-lbl-att">${chip('urgentes', 'sg.fUrgentes', 'ph-warning-circle')}${chip('nonAssignees', 'sg.fNonAssignees', 'ph-user-circle-dashed')}${chip('groupes', 'sg.fGroupes', 'ph-stack')}</span>
      <span class="champ sg-tri"><label for="sg-tri">${e(t('sg.tri'))}</label><select id="sg-tri">${[['action', 'sg.tAction'], ['attente', 'sg.tAttente'], ['recentes', 'sg.tRecentes'], ['groupes', 'sg.tGroupes']].concat(NT.priorites ? [['priorite', 'pr.tPriorite']] : []).map(([v, l]) => `<option value="${v}" ${etat.tri === v ? 'selected' : ''}>${e(t(l))}</option>`).join('')}</select></span>
      ${etat.groupe ? `<span class="sg-filtre-groupe">${e(t('sg.filtreGroupe', { id: etat.groupe.replace('GRP-', '') }))} <button type="button" class="lien-bouton" data-sg-effacer>${e(t('sg.effacer'))}</button></span>` : ''}`;
  }
  X.rendre = () => { panneau(); barre(); };

  function lier(principale, ids) {
    const r = NT.api('POST', '/api/demandes/' + encodeURIComponent(principale) + '/lier', { ids });
    if (r.statut !== 200) { NT.ui.toast((r.donnees && r.donnees.erreur) || 'Erreur', 'danger'); return false; }
    NT.recharger(); X.recharger(); X.rendre(); X.onChange();
    NT.ui.toast(t('sg.okLier', { n: ids.length, id: principale }), 'success', 8000);
    return true;
  }
  X.lier = lier;

  /* Section du tiroir de traitement */
  X.tiroirHtml = d => `<h3>${e(t('sg.tiroir'))}</h3><div class="sg-tiroir" data-sg-tiroir="${e(d.id)}"></div>`;
  X.remplirTiroir = (corps, d) => {
    const z = corps.querySelector('[data-sg-tiroir]'); if (!z) return;
    if (d.principale) {
      z.innerHTML = `<p class="sg-note"><i class="ph-duotone ph-link" aria-hidden="true"></i><span>${e(t('sg.estLiee', { id: d.principale }))}</span></p>
        <p class="ligne"><button type="button" class="btn" data-sg-ouvrir="${e(d.principale)}">${e(t('sg.ouvrirPrincipale'))}</button>
        <button type="button" class="btn btn-danger" data-sg-delier="${e(d.id)}"><i class="ph ph-link-break" aria-hidden="true"></i>${e(t('sg.detacher'))}</button></p>`;
      return;
    }
    const r = NT.api('GET', '/api/demandes/' + encodeURIComponent(d.id) + '/semblables');
    const l = r.statut === 200 ? r.donnees : [];
    const candidats = l.filter(x => !x.rattachee && !x.principale && !x.estPrincipale);
    // une demande semblable est déjà principale d'un groupe : proposer de rattacher celle-ci à ce groupe
    const groupeExistant = !(d.liees || []).length && l.find(x => x.estPrincipale);
    z.innerHTML = (d.liees && d.liees.length ? `<p class="sg-note"><i class="ph-duotone ph-stack" aria-hidden="true"></i><span>${e(t('sg.estPrincipale', { n: d.liees.length }))}</span></p>` : '')
      + (groupeExistant ? `<p><button type="button" class="btn btn-primaire" data-sg-lier="${e(groupeExistant.id)}" data-sg-ids="${e(d.id)}" data-sg-rouvrir="${e(d.id)}"><i class="ph ph-link" aria-hidden="true"></i>${e(t('sg.rattacherA', { id: groupeExistant.id }))}</button></p>` : '')
      + (l.length ? `<ul class="sg-semblables">${l.map(x => `<li>
        ${x.rattachee || x.principale || x.estPrincipale ? `<i class="ph ph-link" aria-hidden="true"></i>` : `<input type="checkbox" id="sg-c-${e(x.id)}" value="${e(x.id)}" aria-label="${e(t('sg.choisir', { id: x.id }))}">`}
        <div><button type="button" class="lien-bouton" data-sg-ouvrir="${e(x.id)}"><strong>${e(x.id)}</strong></button> ${e(x.objet)}
          <span class="sg-meta">${e(t('sg.ressemblance', { n: Math.round(x.score * 100) }))}${x.memeService ? ' · ' + e(t('sg.memeService')) : ''}${x.memeQuartier ? ' · ' + e(t('sg.memeQuartier')) : ''} · ${e(t('sg.jours', { n: x.ecartJours }))} · ${NT.agent.statutBadge(x.statut)}${x.rattachee ? ' · ' + e(t('sg.liee')) : x.principale ? ' · ' + e(t('sg.badgeLiee', { id: x.principale })) : x.estPrincipale ? ' · ' + e(t('sg.principale')) : ''}</span>
          ${x.rattachee ? `<button type="button" class="lien-bouton" data-sg-delier="${e(x.id)}">${e(t('sg.detacher'))}</button>` : ''}</div></li>`).join('')}</ul>
        ${candidats.length ? `<button type="button" class="btn btn-primaire" data-sg-lier-sel="${e(d.id)}"><i class="ph ph-link" aria-hidden="true"></i>${e(t('sg.lierSel'))}</button>` : ''}`
        : `<p class="doux">${e(t('sg.tiroirAucune'))}</p>`);
  };

  document.addEventListener('click', ev => {
    const g = ev.target.closest('[data-sg-groupe]');
    if (g) { etat.groupe = etat.groupe === g.dataset.sgGroupe ? '' : g.dataset.sgGroupe; barre(); X.onChange(); const tb = document.getElementById('compte'); if (tb) tb.scrollIntoView({ block: 'start' }); return; }
    if (ev.target.closest('[data-sg-effacer]')) { etat.groupe = ''; barre(); X.onChange(); return; }
    const f = ev.target.closest('[data-sg-filtre]');
    if (f) { etat[f.dataset.sgFiltre] = !etat[f.dataset.sgFiltre]; barre(); X.onChange(); const n = document.querySelector(`[data-sg-filtre="${f.dataset.sgFiltre}"]`); if (n) n.focus(); return; }
    const o = ev.target.closest('[data-sg-ouvrir]');
    if (o) { X.ouvrir(o.dataset.sgOuvrir); return; }
    const l = ev.target.closest('[data-sg-lier]');
    if (l) { if (lier(l.dataset.sgLier, l.dataset.sgIds.split(',')) && l.dataset.sgRouvrir) X.ouvrir(l.dataset.sgRouvrir); return; }
    const s = ev.target.closest('[data-sg-lier-sel]');
    if (s) {
      const ids = [...document.querySelectorAll(`[data-sg-tiroir="${CSS.escape(s.dataset.sgLierSel)}"] input[type=checkbox]:checked`)].map(c => c.value);
      if (!ids.length) { NT.ui.toast(t('sg.lierSel'), 'warning'); return; }
      if (lier(s.dataset.sgLierSel, ids)) X.ouvrir(s.dataset.sgLierSel);
      return;
    }
    const dl = ev.target.closest('[data-sg-delier]');
    if (dl) {
      const r = NT.api('POST', '/api/demandes/' + encodeURIComponent(dl.dataset.sgDelier) + '/delier', {});
      if (r.statut !== 200) { NT.ui.toast((r.donnees && r.donnees.erreur) || 'Erreur', 'danger'); return; }
      NT.recharger(); X.recharger(); X.rendre(); X.onChange(); NT.ui.toast(t('sg.okDelier', { id: dl.dataset.sgDelier }), 'success');
      X.ouvrir(dl.dataset.sgDelier);
    }
  });
  document.addEventListener('change', ev => { if (ev.target.id === 'sg-tri') { etat.tri = ev.target.value; X.onChange(); } });
})();
