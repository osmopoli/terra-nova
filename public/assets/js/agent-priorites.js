/* Terra Nova — F80 : dossiers prioritaires dans l'espace des agents (agent-demandes.html, agent.html).
   Le niveau (Critique / Haute / Normale / Basse) est calculé par le serveur (GET /api/demandes/priorites) avec ses raisons :
   mots d'urgence, service sensible, ancienneté, demandes semblables (F75), personne vulnérable, soutiens, urgence déclarée.
   Ici : badge dans le tableau, filtre et tri par priorité, file « Mes dossiers prioritaires » (et « À prendre »),
   compteurs par niveau, et dans le tiroir de traitement les raisons + la correction motivée (journalisée par le serveur).
   Chargé dans <head> après agent.js ; la page branche ses hooks (filtre, tri, badge, tiroir). */
(function () {
  'use strict';
  const NT = window.NT;
  NT.i18n.ajouter({
    fr: { 'pr.n.critique': 'Critique', 'pr.n.haute': 'Haute', 'pr.n.normale': 'Normale', 'pr.n.basse': 'Basse', 'pr.auto': 'Automatique (calcul du serveur)',
      'pr.titre': 'Mes dossiers prioritaires', 'pr.intro': 'Niveau calculé par le serveur : mots d’urgence, service concerné, ancienneté, demandes semblables, personne vulnérable, soutiens. Chaque agent peut le corriger avec une justification.',
      'pr.mes': 'Pris en charge par moi', 'pr.aPrendre': 'À prendre (non assignés)', 'pr.aucunMes': 'Aucun dossier critique ou haute priorité à votre nom.', 'pr.aucunAPrendre': 'Aucun dossier urgent en attente d’un agent.',
      'pr.compte': 'Dossiers ouverts par priorité', 'pr.filtrer': 'Afficher les dossiers {n}', 'pr.fMes': 'Mes dossiers prioritaires', 'pr.tPriorite': 'Priorité (critique d’abord)',
      'pr.tiroir': 'Priorité du dossier', 'pr.manuel': 'Corrigée par {par} le {d}', 'pr.calcul': 'Calcul automatique : {n} (score {s})', 'pr.raisons': 'Pourquoi ce niveau',
      'pr.r.mot': 'Mot d’urgence : « {mot} »', 'pr.r.service': 'Service sensible : {service}', 'pr.r.declaree': 'Signalée urgente par l’habitant', 'pr.r.vulnerable': 'Personne vulnérable',
      'pr.r.attente': 'En attente depuis {n} jours', 'pr.r.groupe': '{n} demandes semblables (même problème)', 'pr.r.soutiens': '{n} habitant(s) soutiennent', 'pr.r.question': 'Simple question : moins urgent', 'pr.r.terminee': 'Dossier terminé',
      'pr.changer': 'Changer la priorité', 'pr.nouveau': 'Nouveau niveau', 'pr.justif': 'Justification (obligatoire, inscrite au journal)', 'pr.justifAide': 'Par exemple : « Câble sous tension confirmé par les pompiers ». 10 caractères minimum.',
      'pr.enregistrer': 'Enregistrer la priorité', 'pr.erreurJustif': 'Expliquez pourquoi vous changez la priorité (10 caractères minimum).', 'pr.ok': 'Priorité de {id} : {n}. Changement inscrit au journal.',
      'pr.k.critiques': 'Dossiers critiques', 'pr.k.hautes': 'Dossiers de priorité haute', 'pr.k.mes': 'Mes dossiers prioritaires', 'pr.colonne': 'Priorité', 'pr.modifiee': 'priorité corrigée par un agent' },
    en: { 'pr.n.critique': 'Critical', 'pr.n.haute': 'High', 'pr.n.normale': 'Normal', 'pr.n.basse': 'Low', 'pr.auto': 'Automatic (server calculation)',
      'pr.titre': 'My priority files', 'pr.intro': 'Level calculated by the server: urgency words, service concerned, age, similar requests, vulnerable person, supports. Any agent can correct it with a justification.',
      'pr.mes': 'Handled by me', 'pr.aPrendre': 'To take (unassigned)', 'pr.aucunMes': 'No critical or high priority file in your name.', 'pr.aucunAPrendre': 'No urgent file waiting for an agent.',
      'pr.compte': 'Open files by priority', 'pr.filtrer': 'Show {n} files', 'pr.fMes': 'My priority files', 'pr.tPriorite': 'Priority (critical first)',
      'pr.tiroir': 'File priority', 'pr.manuel': 'Corrected by {par} on {d}', 'pr.calcul': 'Automatic calculation: {n} (score {s})', 'pr.raisons': 'Why this level',
      'pr.r.mot': 'Urgency word: “{mot}”', 'pr.r.service': 'Sensitive service: {service}', 'pr.r.declaree': 'Reported as urgent by the resident', 'pr.r.vulnerable': 'Vulnerable person',
      'pr.r.attente': 'Waiting for {n} days', 'pr.r.groupe': '{n} similar requests (same problem)', 'pr.r.soutiens': '{n} resident(s) support it', 'pr.r.question': 'Simple question: less urgent', 'pr.r.terminee': 'File closed',
      'pr.changer': 'Change the priority', 'pr.nouveau': 'New level', 'pr.justif': 'Justification (required, recorded in the log)', 'pr.justifAide': 'For example: “Live cable confirmed by the fire brigade”. 10 characters minimum.',
      'pr.enregistrer': 'Save the priority', 'pr.erreurJustif': 'Explain why you change the priority (10 characters minimum).', 'pr.ok': 'Priority of {id}: {n}. Change recorded in the log.',
      'pr.k.critiques': 'Critical files', 'pr.k.hautes': 'High priority files', 'pr.k.mes': 'My priority files', 'pr.colonne': 'Priority', 'pr.modifiee': 'priority corrected by an agent' },
    es: { 'pr.n.critique': 'Crítica', 'pr.n.haute': 'Alta', 'pr.n.normale': 'Normal', 'pr.n.basse': 'Baja', 'pr.auto': 'Automática (cálculo del servidor)',
      'pr.titre': 'Mis expedientes prioritarios', 'pr.intro': 'Nivel calculado por el servidor: palabras de urgencia, servicio afectado, antigüedad, solicitudes parecidas, persona vulnerable, apoyos. Cada agente puede corregirlo con una justificación.',
      'pr.mes': 'A mi cargo', 'pr.aPrendre': 'Por asignar', 'pr.aucunMes': 'Ningún expediente crítico o de prioridad alta a su nombre.', 'pr.aucunAPrendre': 'Ningún expediente urgente esperando a un agente.',
      'pr.compte': 'Expedientes abiertos por prioridad', 'pr.filtrer': 'Mostrar los expedientes {n}', 'pr.fMes': 'Mis expedientes prioritarios', 'pr.tPriorite': 'Prioridad (crítica primero)',
      'pr.tiroir': 'Prioridad del expediente', 'pr.manuel': 'Corregida por {par} el {d}', 'pr.calcul': 'Cálculo automático: {n} (puntuación {s})', 'pr.raisons': 'Por qué este nivel',
      'pr.r.mot': 'Palabra de urgencia: «{mot}»', 'pr.r.service': 'Servicio sensible: {service}', 'pr.r.declaree': 'Señalada urgente por el habitante', 'pr.r.vulnerable': 'Persona vulnerable',
      'pr.r.attente': 'En espera desde hace {n} días', 'pr.r.groupe': '{n} solicitudes parecidas (mismo problema)', 'pr.r.soutiens': '{n} habitante(s) la apoyan', 'pr.r.question': 'Simple pregunta: menos urgente', 'pr.r.terminee': 'Expediente terminado',
      'pr.changer': 'Cambiar la prioridad', 'pr.nouveau': 'Nuevo nivel', 'pr.justif': 'Justificación (obligatoria, queda en el registro)', 'pr.justifAide': 'Por ejemplo: «Cable con tensión confirmado por los bomberos». 10 caracteres mínimo.',
      'pr.enregistrer': 'Guardar la prioridad', 'pr.erreurJustif': 'Explique por qué cambia la prioridad (10 caracteres mínimo).', 'pr.ok': 'Prioridad de {id}: {n}. Cambio registrado.',
      'pr.k.critiques': 'Expedientes críticos', 'pr.k.hautes': 'Expedientes de prioridad alta', 'pr.k.mes': 'Mis expedientes prioritarios', 'pr.colonne': 'Prioridad', 'pr.modifiee': 'prioridad corregida por un agente' },
    ar: { 'pr.n.critique': 'حرجة', 'pr.n.haute': 'عالية', 'pr.n.normale': 'عادية', 'pr.n.basse': 'منخفضة', 'pr.auto': 'تلقائي (حساب الخادم)',
      'pr.titre': 'ملفاتي ذات الأولوية', 'pr.intro': 'مستوى يحسبه الخادم: كلمات الاستعجال، الخدمة المعنية، الأقدمية، الطلبات المتشابهة، شخص هش، الدعم. يمكن لكل عون تصحيحه مع تبرير.',
      'pr.mes': 'أتولاها أنا', 'pr.aPrendre': 'للتكفل (غير مسندة)', 'pr.aucunMes': 'لا يوجد ملف حرج أو عالي الأولوية باسمك.', 'pr.aucunAPrendre': 'لا يوجد ملف عاجل ينتظر عوناً.',
      'pr.compte': 'الملفات المفتوحة حسب الأولوية', 'pr.filtrer': 'عرض الملفات {n}', 'pr.fMes': 'ملفاتي ذات الأولوية', 'pr.tPriorite': 'الأولوية (الحرجة أولاً)',
      'pr.tiroir': 'أولوية الملف', 'pr.manuel': 'صححها {par} بتاريخ {d}', 'pr.calcul': 'الحساب التلقائي: {n} (النقاط {s})', 'pr.raisons': 'لماذا هذا المستوى',
      'pr.r.mot': 'كلمة استعجال: «{mot}»', 'pr.r.service': 'خدمة حساسة: {service}', 'pr.r.declaree': 'أبلغ عنها الساكن كعاجلة', 'pr.r.vulnerable': 'شخص هش',
      'pr.r.attente': 'في الانتظار منذ {n} أيام', 'pr.r.groupe': '{n} طلبات متشابهة (المشكلة نفسها)', 'pr.r.soutiens': '{n} ساكن يدعمونها', 'pr.r.question': 'سؤال بسيط: أقل استعجالاً', 'pr.r.terminee': 'ملف منتهٍ',
      'pr.changer': 'تغيير الأولوية', 'pr.nouveau': 'المستوى الجديد', 'pr.justif': 'التبرير (إلزامي، يُسجَّل في السجل)', 'pr.justifAide': 'مثال: «كابل مكهرب أكده رجال الإطفاء». 10 أحرف على الأقل.',
      'pr.enregistrer': 'حفظ الأولوية', 'pr.erreurJustif': 'اشرح سبب تغيير الأولوية (10 أحرف على الأقل).', 'pr.ok': 'أولوية {id}: {n}. سُجل التغيير في السجل.',
      'pr.k.critiques': 'ملفات حرجة', 'pr.k.hautes': 'ملفات عالية الأولوية', 'pr.k.mes': 'ملفاتي ذات الأولوية', 'pr.colonne': 'الأولوية', 'pr.modifiee': 'أولوية صححها عون' }
  });

  const P = (NT.priorites = {});
  const NIVEAUX = ['critique', 'haute', 'normale', 'basse'];
  const ICONES = { critique: 'ph-warning-octagon', haute: 'ph-caret-double-up', normale: 'ph-minus', basse: 'ph-caret-down' };
  const t = (k, v) => NT.t(k, v);
  const e = s => NT.ui.echap(s);
  let donnees = { niveaux: {}, compte: { critique: 0, haute: 0, normale: 0, basse: 0 }, mes: [], aPrendre: [] };
  const etat = { mes: false };
  P.etat = etat;
  P.onChange = () => {};
  P.ouvrir = () => {};

  P.recharger = () => {
    const r = NT.api('GET', '/api/demandes/priorites');
    if (r.statut === 200 && r.donnees) donnees = r.donnees;
    return r.statut === 200;
  };
  P.info = d => donnees.niveaux[d.id || d] || null;
  P.niveau = d => (P.info(d) || {}).niveau || 'normale';
  P.rang = d => NIVEAUX.indexOf(P.niveau(d));
  P.comparer = (a, b) => P.rang(a) - P.rang(b) || ((P.info(b) || {}).score || 0) - ((P.info(a) || {}).score || 0) || a.cree.localeCompare(b.cree);
  P.compte = () => donnees.compte;
  P.mes = () => donnees.mes.slice();
  P.aPrendre = () => donnees.aPrendre.slice();
  P.filtre = d => !etat.mes || donnees.mes.includes(d.id);
  P.libelle = n => t('pr.n.' + n);
  P.badge = d => {
    const i = P.info(d); const n = i ? i.niveau : 'normale';
    return `<span class="pr-badge pr-${n}" title="${e(i && i.raisons.length ? i.raisons.map(raison).join(' · ') : '')}"><i class="ph ${ICONES[n]}" aria-hidden="true"></i>${e(P.libelle(n))}${i && i.manuel ? `<i class="ph ph-pencil-simple" aria-hidden="true"></i><span class="sr-only"> (${e(t('pr.modifiee'))})</span>` : ''}</span>`;
  };
  function raison(r) {
    const A = NT.agent;
    const v = { mot: r.mot, service: A ? A.service(r.service) || r.service : r.service, n: r.jours || r.n };
    return t('pr.r.' + r.code, v);
  }
  P.raison = raison;

  /* Panneau « Mes dossiers prioritaires » + compteurs par niveau (filtrer en un clic) */
  P.rendrePanneau = z => {
    if (!z) return;
    const c = donnees.compte;
    const item = id => { const d = NT.store.find('demandes', id); if (!d) return ''; const i = P.info(id);
      return `<li><button type="button" class="pr-ouvrir" data-pr-ouvrir="${e(id)}"><span class="ag-code">${e(id)}</span> ${e(d.objet)}</button> ${P.badge(d)}
        ${i && i.raisons[0] ? `<span class="pr-raison">${e(raison(i.raisons.slice().sort((a, b) => b.points - a.points)[0]))}</span>` : ''}</li>`; };
    z.innerHTML = `<h2 id="pr-h"><i class="ph-duotone ph-list-numbers" aria-hidden="true"></i> ${e(t('pr.titre'))} <span class="pastille-n">${donnees.mes.length}</span></h2>
      <p class="doux pr-intro">${e(t('pr.intro'))}</p>
      <div class="pr-comptes" role="group" aria-label="${e(t('pr.compte'))}">${NIVEAUX.map(n => `<button type="button" class="pr-compte pr-${n}" data-pr-niveau="${n}" aria-label="${e(t('pr.filtrer', { n: P.libelle(n) }))} (${c[n]})"><i class="ph ${ICONES[n]}" aria-hidden="true"></i><span class="valeur">${c[n]}</span><span>${e(P.libelle(n))}</span></button>`).join('')}</div>
      <p><button type="button" class="chip-sujet" data-pr-mes aria-pressed="${etat.mes}"><i class="ph ph-user-focus" aria-hidden="true"></i>${e(t('pr.fMes'))} <span class="n">${donnees.mes.length}</span></button></p>
      <div class="pr-files">
        <div><h3>${e(t('pr.mes'))}</h3>${donnees.mes.length ? `<ul class="pr-liste">${donnees.mes.map(item).join('')}</ul>` : `<p class="doux">${e(t('pr.aucunMes'))}</p>`}</div>
        <div><h3>${e(t('pr.aPrendre'))}</h3>${donnees.aPrendre.length ? `<ul class="pr-liste">${donnees.aPrendre.slice(0, 6).map(item).join('')}</ul>` : `<p class="doux">${e(t('pr.aucunAPrendre'))}</p>`}</div>
      </div>`;
  };

  /* Tiroir de traitement : raisons + correction motivée */
  P.tiroirHtml = d => {
    const i = P.info(d); if (!i) return '';
    return `<section class="pr-tiroir" aria-labelledby="pr-t-${e(d.id)}"><h3 id="pr-t-${e(d.id)}">${e(t('pr.tiroir'))}</h3>
      <p class="ligne">${P.badge(d)} <span class="doux">${e(t('pr.calcul', { n: P.libelle(i.auto), s: i.score }))}</span></p>
      ${i.manuel ? `<p class="pr-manuel"><i class="ph-duotone ph-pencil-simple" aria-hidden="true"></i><span>${e(t('pr.manuel', { par: i.manuel.par, d: NT.ui.dateHeure(i.manuel.date) }))} : « ${e(i.manuel.justification)} »</span></p>` : ''}
      <p class="pr-lbl">${e(t('pr.raisons'))}</p>
      <ul class="pr-raisons">${i.raisons.map(r => `<li><span>${e(raison(r))}</span>${r.points ? `<span class="pr-pts">${r.points > 0 ? '+' : ''}${r.points}</span>` : ''}</li>`).join('')}</ul>
      <details class="pr-changer"><summary>${e(t('pr.changer'))}</summary>
        <form class="pr-form" data-pr-form="${e(d.id)}" novalidate data-brouillon="non">
          <div class="champ"><label for="pr-niv-${e(d.id)}">${e(t('pr.nouveau'))}</label>
            <select id="pr-niv-${e(d.id)}">${NIVEAUX.map(n => `<option value="${n}" ${n === i.niveau ? 'selected' : ''}>${e(P.libelle(n))}</option>`).join('')}<option value="auto">${e(t('pr.auto'))}</option></select></div>
          <div class="champ"><label for="pr-just-${e(d.id)}">${e(t('pr.justif'))}</label>
            <textarea id="pr-just-${e(d.id)}" rows="3" maxlength="400" aria-describedby="pr-aide-${e(d.id)} pr-err-${e(d.id)}" required></textarea>
            <span class="aide" id="pr-aide-${e(d.id)}">${e(t('pr.justifAide'))}</span><p class="erreur" id="pr-err-${e(d.id)}" hidden></p></div>
          <button type="submit" class="btn btn-primaire"><i class="ph ph-floppy-disk" aria-hidden="true"></i>${e(t('pr.enregistrer'))}</button>
        </form></details></section>`;
  };

  document.addEventListener('submit', ev => {
    const f = ev.target.closest && ev.target.closest('[data-pr-form]'); if (!f) return;
    ev.preventDefault();
    const id = f.dataset.prForm;
    const niveau = f.querySelector('select').value, champ = f.querySelector('textarea'), err = f.querySelector('.erreur');
    const justification = champ.value.trim();
    if (justification.length < 10) { err.textContent = t('pr.erreurJustif'); err.hidden = false; champ.setAttribute('aria-invalid', 'true'); champ.focus(); return; }
    const r = NT.api('POST', '/api/demandes/' + encodeURIComponent(id) + '/priorite', { niveau, justification });
    if (r.statut !== 200) { err.textContent = (r.donnees && r.donnees.erreur) || t('pr.erreurJustif'); err.hidden = false; return; }
    P.recharger();
    NT.ui.toast(t('pr.ok', { id, n: P.libelle(P.niveau(id)) }), 'success', 7000);
    P.onChange(); P.ouvrir(id);
  });
  document.addEventListener('click', ev => {
    const m = ev.target.closest('[data-pr-mes]');
    if (m) { etat.mes = !etat.mes; P.rendrePanneau(document.getElementById('pr-panneau')); P.onChange(); const b = document.querySelector('[data-pr-mes]'); if (b) b.focus(); return; }
    const o = ev.target.closest('[data-pr-ouvrir]');
    if (o) { P.ouvrir(o.dataset.prOuvrir); return; }
    const n = ev.target.closest('[data-pr-niveau]');
    if (n) { const s = document.getElementById('f-prio'); if (s) { s.value = s.value === n.dataset.prNiveau ? '' : n.dataset.prNiveau; s.dispatchEvent(new Event('input', { bubbles: true })); } }
  });
})();
