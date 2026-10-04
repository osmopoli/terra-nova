/* Terra Nova — vague 20 (F97) : page agents « Lignes interrompues ».
   Déclarer une interruption (une ou plusieurs lignes, tronçon, début maintenant ou programmé, fin ou « jusqu'à nouvel ordre »,
   raison, précision en langage simple, remplacement : navette / bus-relais / aucun, arrêts desservis, fréquence, transport
   à la demande), la modifier, rétablir la ligne. Aperçu de ce que verront les habitants. Le serveur contrôle le rôle et
   journalise chaque action (journal d'audit). */
(function () {
  'use strict';
  const NT = window.NT;
  NT.i18n.ajouter({
    fr: { 'am.titre': 'Lignes interrompues', 'nav.mobiliteAgent': 'Mobilité', 'am.intro': 'Déclarez une interruption (ligne, tronçon, période, raison, remplacement) : les habitants voient tout de suite les solutions de remplacement et les abonnés de la ligne sont prévenus.',
      'am.enCours': 'En cours et prévues', 'am.declarer': 'Déclarer une interruption', 'am.modifier': 'Modifier l’interruption {id}', 'am.terminees': 'Terminées', 'am.aucune': 'Aucune interruption en cours : toutes les lignes circulent.', 'am.aucuneFin': 'Aucune interruption terminée.',
      'am.s.en_cours': 'En cours', 'am.s.programmee': 'Prévue', 'am.s.terminee': 'Terminée', 'am.du': 'Du {d}', 'am.au': 'au {d}', 'am.nouvelOrdre': 'jusqu’à nouvel ordre', 'am.abonnes': '{n} habitant(s) suivent ces lignes',
      'am.par': 'Déclarée par {p}', 'am.leveePar': 'Rétablie par {p} le {d}', 'am.btnModifier': 'Modifier', 'am.btnLever': 'Rétablir la ligne', 'am.leverMotif': 'Message aux habitants (facultatif)', 'am.leverOk': 'Confirmer le rétablissement', 'am.annuler': 'Annuler',
      'am.leve': 'Ligne rétablie. {n} habitant(s) prévenu(s).', 'am.cree': 'Interruption déclarée. {n} habitant(s) prévenu(s).', 'am.majOk': 'Interruption mise à jour.',
      'am.troncons': 'Ligne(s) interrompue(s)', 'am.ligne': 'Ligne', 'am.de': 'De l’arrêt', 'am.a': 'À l’arrêt', 'am.ajouterLigne': 'Ajouter une autre ligne', 'am.retirer': 'Retirer cette ligne',
      'am.periode': 'Période', 'am.debut': 'Début', 'am.maintenant': 'Maintenant', 'am.programmer': 'Programmer', 'am.debutDate': 'Date et heure de début', 'am.fin': 'Fin', 'am.finDate': 'Jusqu’à (date et heure)', 'am.finInconnue': 'Jusqu’à nouvel ordre',
      'am.raison': 'Raison', 'am.precision': 'Précision pour les habitants (langage simple, sans sigle)', 'am.precisionAide': 'Exemple : « Travaux de réparation de la voie entre Lycée Kepler et Quai des Arrivées ».',
      'am.remplacement': 'Remplacement', 'am.r.aucun': 'Aucun remplacement', 'am.r.navette': 'Navette de remplacement', 'am.r.bus-relais': 'Bus-relais', 'am.frequence': 'Passage toutes les (minutes)', 'am.arretsRelais': 'Arrêts desservis par le remplacement',
      'am.texteRelais': 'Où le prendre (facultatif)', 'am.tad': 'Proposer le transport à la demande aux personnes à mobilité réduite', 'am.apercu': 'Ce que verront les habitants', 'am.enregistrer': 'Déclarer l’interruption', 'am.enregistrerMaj': 'Enregistrer les modifications',
      'am.erreur': 'Corrigez : {e}', 'am.toute': 'toute la ligne', 'am.m.travaux': 'Travaux sur la voie', 'am.m.panne': 'Navette en panne', 'am.m.meteo': 'Conditions météo', 'am.m.evenement': 'Événement dans la ville', 'am.m.securite': 'Raison de sécurité', 'am.m.autre': 'Autre raison',
      'am.solutions': 'Meilleure solution calculée : {s}', 'am.chargement': 'Chargement…',
      'am.titreLigne': 'Ligne {l} interrompue jusqu’à {fin}', 'am.titreLigneSans': 'Ligne {l} interrompue jusqu’à nouvel ordre', 'am.o.marche': 'À pied', 'am.o.velo': 'Vélo en libre-service', 'am.o.tad': 'Transport à la demande' },
    en: { 'am.titre': 'Interrupted lines', 'nav.mobiliteAgent': 'Mobility', 'am.intro': 'Declare an interruption (line, section, period, reason, replacement): residents immediately see replacement options and subscribers to the line are notified.',
      'am.enCours': 'Current and planned', 'am.declarer': 'Declare an interruption', 'am.modifier': 'Edit interruption {id}', 'am.terminees': 'Finished', 'am.aucune': 'No current interruption: all lines are running.', 'am.aucuneFin': 'No finished interruption.',
      'am.s.en_cours': 'Current', 'am.s.programmee': 'Planned', 'am.s.terminee': 'Finished', 'am.du': 'From {d}', 'am.au': 'to {d}', 'am.nouvelOrdre': 'until further notice', 'am.abonnes': '{n} resident(s) follow these lines',
      'am.par': 'Declared by {p}', 'am.leveePar': 'Restored by {p} on {d}', 'am.btnModifier': 'Edit', 'am.btnLever': 'Restore the line', 'am.leverMotif': 'Message to residents (optional)', 'am.leverOk': 'Confirm restoration', 'am.annuler': 'Cancel',
      'am.leve': 'Line restored. {n} resident(s) notified.', 'am.cree': 'Interruption declared. {n} resident(s) notified.', 'am.majOk': 'Interruption updated.',
      'am.troncons': 'Interrupted line(s)', 'am.ligne': 'Line', 'am.de': 'From stop', 'am.a': 'To stop', 'am.ajouterLigne': 'Add another line', 'am.retirer': 'Remove this line',
      'am.periode': 'Period', 'am.debut': 'Start', 'am.maintenant': 'Now', 'am.programmer': 'Schedule', 'am.debutDate': 'Start date and time', 'am.fin': 'End', 'am.finDate': 'Until (date and time)', 'am.finInconnue': 'Until further notice',
      'am.raison': 'Reason', 'am.precision': 'Details for residents (plain language, no acronyms)', 'am.precisionAide': 'Example: “Track repairs between Kepler high school and Arrivals quay”.',
      'am.remplacement': 'Replacement', 'am.r.aucun': 'No replacement', 'am.r.navette': 'Replacement shuttle', 'am.r.bus-relais': 'Relay bus', 'am.frequence': 'Every (minutes)', 'am.arretsRelais': 'Stops served by the replacement',
      'am.texteRelais': 'Where to board (optional)', 'am.tad': 'Offer on-demand transport to people with reduced mobility', 'am.apercu': 'What residents will see', 'am.enregistrer': 'Declare the interruption', 'am.enregistrerMaj': 'Save changes',
      'am.erreur': 'Please fix: {e}', 'am.toute': 'the whole line', 'am.m.travaux': 'Track works', 'am.m.panne': 'Shuttle breakdown', 'am.m.meteo': 'Weather conditions', 'am.m.evenement': 'Event in the city', 'am.m.securite': 'Safety reasons', 'am.m.autre': 'Other reason',
      'am.solutions': 'Best computed option: {s}', 'am.chargement': 'Loading…',
      'am.titreLigne': 'Line {l} interrupted until {fin}', 'am.titreLigneSans': 'Line {l} interrupted until further notice', 'am.o.marche': 'On foot', 'am.o.velo': 'Self-service bike', 'am.o.tad': 'On-demand transport' },
    es: { 'am.titre': 'Líneas interrumpidas', 'nav.mobiliteAgent': 'Movilidad', 'am.intro': 'Declare una interrupción (línea, tramo, periodo, motivo, sustitución): los habitantes ven al instante las soluciones y se avisa a quienes siguen la línea.',
      'am.enCours': 'En curso y previstas', 'am.declarer': 'Declarar una interrupción', 'am.modifier': 'Modificar la interrupción {id}', 'am.terminees': 'Terminadas', 'am.aucune': 'Ninguna interrupción en curso: todas las líneas circulan.', 'am.aucuneFin': 'Ninguna interrupción terminada.',
      'am.s.en_cours': 'En curso', 'am.s.programmee': 'Prevista', 'am.s.terminee': 'Terminada', 'am.du': 'Del {d}', 'am.au': 'al {d}', 'am.nouvelOrdre': 'hasta nuevo aviso', 'am.abonnes': '{n} habitante(s) siguen estas líneas',
      'am.par': 'Declarada por {p}', 'am.leveePar': 'Restablecida por {p} el {d}', 'am.btnModifier': 'Modificar', 'am.btnLever': 'Restablecer la línea', 'am.leverMotif': 'Mensaje a los habitantes (opcional)', 'am.leverOk': 'Confirmar el restablecimiento', 'am.annuler': 'Cancelar',
      'am.leve': 'Línea restablecida. {n} habitante(s) avisado(s).', 'am.cree': 'Interrupción declarada. {n} habitante(s) avisado(s).', 'am.majOk': 'Interrupción actualizada.',
      'am.troncons': 'Línea(s) interrumpida(s)', 'am.ligne': 'Línea', 'am.de': 'Desde la parada', 'am.a': 'Hasta la parada', 'am.ajouterLigne': 'Añadir otra línea', 'am.retirer': 'Quitar esta línea',
      'am.periode': 'Periodo', 'am.debut': 'Inicio', 'am.maintenant': 'Ahora', 'am.programmer': 'Programar', 'am.debutDate': 'Fecha y hora de inicio', 'am.fin': 'Fin', 'am.finDate': 'Hasta (fecha y hora)', 'am.finInconnue': 'Hasta nuevo aviso',
      'am.raison': 'Motivo', 'am.precision': 'Detalle para los habitantes (lenguaje sencillo, sin siglas)', 'am.precisionAide': 'Ejemplo: «Obras de reparación de la vía entre el Instituto Kepler y el Muelle de Llegadas».',
      'am.remplacement': 'Sustitución', 'am.r.aucun': 'Sin sustitución', 'am.r.navette': 'Lanzadera de sustitución', 'am.r.bus-relais': 'Autobús de relevo', 'am.frequence': 'Pasa cada (minutos)', 'am.arretsRelais': 'Paradas de la sustitución',
      'am.texteRelais': 'Dónde tomarlo (opcional)', 'am.tad': 'Ofrecer transporte a demanda a las personas con movilidad reducida', 'am.apercu': 'Lo que verán los habitantes', 'am.enregistrer': 'Declarar la interrupción', 'am.enregistrerMaj': 'Guardar los cambios',
      'am.erreur': 'Corrija: {e}', 'am.toute': 'toda la línea', 'am.m.travaux': 'Obras en la vía', 'am.m.panne': 'Lanzadera averiada', 'am.m.meteo': 'Condiciones meteorológicas', 'am.m.evenement': 'Evento en la ciudad', 'am.m.securite': 'Motivo de seguridad', 'am.m.autre': 'Otro motivo',
      'am.solutions': 'Mejor solución calculada: {s}', 'am.chargement': 'Cargando…',
      'am.titreLigne': 'Línea {l} interrumpida hasta {fin}', 'am.titreLigneSans': 'Línea {l} interrumpida hasta nuevo aviso', 'am.o.marche': 'A pie', 'am.o.velo': 'Bicicleta compartida', 'am.o.tad': 'Transporte a demanda' },
    ar: { 'am.titre': 'الخطوط المتوقفة', 'nav.mobiliteAgent': 'التنقل', 'am.intro': 'صرّح بتوقف (الخط، المقطع، الفترة، السبب، البديل): يرى السكان الحلول البديلة فوراً ويُنبَّه متابعو الخط.',
      'am.enCours': 'الجارية والمقررة', 'am.declarer': 'التصريح بتوقف', 'am.modifier': 'تعديل التوقف {id}', 'am.terminees': 'المنتهية', 'am.aucune': 'لا يوجد توقف جارٍ: كل الخطوط تعمل.', 'am.aucuneFin': 'لا يوجد توقف منتهٍ.',
      'am.s.en_cours': 'جارٍ', 'am.s.programmee': 'مقرر', 'am.s.terminee': 'منتهٍ', 'am.du': 'من {d}', 'am.au': 'إلى {d}', 'am.nouvelOrdre': 'حتى إشعار آخر', 'am.abonnes': '{n} ساكن يتابعون هذه الخطوط',
      'am.par': 'صرّح به {p}', 'am.leveePar': 'أعاده {p} في {d}', 'am.btnModifier': 'تعديل', 'am.btnLever': 'إعادة تشغيل الخط', 'am.leverMotif': 'رسالة إلى السكان (اختياري)', 'am.leverOk': 'تأكيد إعادة التشغيل', 'am.annuler': 'إلغاء',
      'am.leve': 'أُعيد تشغيل الخط. تم تنبيه {n} ساكن.', 'am.cree': 'تم التصريح بالتوقف. تم تنبيه {n} ساكن.', 'am.majOk': 'تم تحديث التوقف.',
      'am.troncons': 'الخط(وط) المتوقفة', 'am.ligne': 'الخط', 'am.de': 'من محطة', 'am.a': 'إلى محطة', 'am.ajouterLigne': 'إضافة خط آخر', 'am.retirer': 'إزالة هذا الخط',
      'am.periode': 'الفترة', 'am.debut': 'البداية', 'am.maintenant': 'الآن', 'am.programmer': 'برمجة', 'am.debutDate': 'تاريخ ووقت البداية', 'am.fin': 'النهاية', 'am.finDate': 'حتى (التاريخ والوقت)', 'am.finInconnue': 'حتى إشعار آخر',
      'am.raison': 'السبب', 'am.precision': 'توضيح للسكان (لغة بسيطة بدون اختصارات)', 'am.precisionAide': 'مثال: «أشغال إصلاح الطريق بين ثانوية كيبلر ورصيف الوصول».',
      'am.remplacement': 'البديل', 'am.r.aucun': 'بدون بديل', 'am.r.navette': 'حافلة استبدال', 'am.r.bus-relais': 'حافلة بديلة', 'am.frequence': 'كل (دقائق)', 'am.arretsRelais': 'المحطات التي يخدمها البديل',
      'am.texteRelais': 'مكان الركوب (اختياري)', 'am.tad': 'اقتراح النقل حسب الطلب لذوي الحركة المحدودة', 'am.apercu': 'ما سيراه السكان', 'am.enregistrer': 'التصريح بالتوقف', 'am.enregistrerMaj': 'حفظ التعديلات',
      'am.erreur': 'يرجى التصحيح: {e}', 'am.toute': 'الخط بأكمله', 'am.m.travaux': 'أشغال على الطريق', 'am.m.panne': 'عطل في الحافلة', 'am.m.meteo': 'ظروف جوية', 'am.m.evenement': 'حدث في المدينة', 'am.m.securite': 'سبب أمني', 'am.m.autre': 'سبب آخر',
      'am.solutions': 'أفضل حل محسوب: {s}', 'am.chargement': 'جارٍ التحميل…',
      'am.titreLigne': 'الخط {l} متوقف حتى {fin}', 'am.titreLigneSans': 'الخط {l} متوقف حتى إشعار آخر', 'am.o.marche': 'سيراً على الأقدام', 'am.o.velo': 'دراجة ذاتية الخدمة', 'am.o.tad': 'نقل حسب الطلب' }
  });
  const t = (k, v) => NT.t(k, v);
  const E = (s) => NT.ui.echap(s == null ? '' : String(s));
  const $ = (id) => document.getElementById(id);
  let D = null, edition = null;
  const nom = (a) => NT.t('tr.arret.' + a, null, (D && D.arrets[a] && D.arrets[a].nom) || a);
  const dh = (iso) => (iso ? NT.ui.dateHeure(iso) : '');
  const fleche = () => (document.documentElement.dir === 'rtl' ? ' ← ' : ' → ');   // « de → à » dans le sens de lecture
  const local = (iso) => { if (!iso) return ''; const d = new Date(iso); const p = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; };

  function charger() {
    const r = NT.api('GET', '/api/mobilite/interruptions');
    if (r.statut !== 200) { $('am-cours').innerHTML = `<p class="vide">${E((r.donnees && r.donnees.erreur) || '')}</p>`; return; }
    D = r.donnees;
    rendreListes();
    if (!$('am-form')) rendreFormulaire();
  }
  function meilleure(i) {
    const s = (i.solutions || [])[0]; const o = s && s.options[0]; if (!o) return '';
    const lib = { relais: t('am.r.' + (o.sousType || 'navette')), 'autres-lignes': (o.lignes || []).join(' + '), marche: t('am.o.marche'), velo: t('am.o.velo'), tad: t('am.o.tad') }[o.type] || o.type;
    return t('am.solutions', { s: `${lib}${o.perte != null ? ` (+${o.perte} min)` : ''}` });
  }
  function carte(i) {
    const s = i.statut;
    return `<article class="am-carte am-${s}" data-id="${E(i.id)}">
      <div class="am-tete">${i.troncons.map((tr) => `<span class="tr-ligne tr-${E(tr.ligne)}">${E(tr.ligne)}</span>`).join('')}
        <div><h3>${i.troncons.map((tr) => `${E(tr.ligne)} · ${E(tr.touteLaLigne ? t('am.toute') : nom(tr.de) + fleche() + nom(tr.a))}`).join(' ; ')}</h3>
        <p class="doux">${E(i.id)} · <strong class="statut ${s === 'en_cours' ? 'statut-incident' : s === 'programmee' ? 'statut-maintenance' : 'statut-ok'}">${E(t('am.s.' + s))}</strong> · ${E(t('am.du', { d: dh(i.debut && i.debut.iso) }))} ${E(i.fin ? t('am.au', { d: dh(i.fin.iso) }) : t('am.nouvelOrdre'))}</p></div></div>
      <p>${E(t('am.m.' + i.motif))}${i.precision ? ' — ' + E(i.precision) : ''}</p>
      <p class="doux">${E(t('am.r.' + ((i.remplacement && i.remplacement.type) || 'aucun')))}${i.remplacement && i.remplacement.type !== 'aucun' ? ` · ${i.remplacement.frequence} min · ${E(i.remplacement.arrets.map(nom).join(' › '))}` : ''}${i.tad ? ' · ' + E(t('am.o.tad')) : ''}</p>
      ${s !== 'terminee' ? `<p class="doux">${E(meilleure(i))}</p>` : ''}
      <p class="doux">${E(i.declarePar ? t('am.par', { p: i.declarePar }) : '')}${i.leveePar ? ' · ' + E(t('am.leveePar', { p: i.leveePar, d: dh(i.leveeLe) })) : ''} · ${E(t('am.abonnes', { n: i.abonnes || 0 }))}</p>
      ${s !== 'terminee' ? `<div class="am-actions"><button type="button" class="btn" data-am-modifier="${E(i.id)}"><i class="ph ph-pencil-simple" aria-hidden="true"></i>${E(t('am.btnModifier'))}</button>
        <button type="button" class="btn btn-primaire" data-am-lever="${E(i.id)}" aria-expanded="false"><i class="ph ph-check-circle" aria-hidden="true"></i>${E(t('am.btnLever'))}</button></div>
        <form class="am-lever" data-am-lever-form="${E(i.id)}" hidden><div class="champ"><label for="am-lm-${E(i.id)}">${E(t('am.leverMotif'))}</label><input id="am-lm-${E(i.id)}" maxlength="200"></div>
        <div class="am-actions"><button class="btn btn-primaire" type="submit">${E(t('am.leverOk'))}</button><button class="btn" type="button" data-am-annuler>${E(t('am.annuler'))}</button></div></form>` : ''}
    </article>`;
  }
  function rendreListes() {
    const cours = D.interruptions.filter((i) => i.statut !== 'terminee'), fin = D.interruptions.filter((i) => i.statut === 'terminee');
    $('am-cours').innerHTML = cours.length ? cours.map(carte).join('') : `<p class="vide">${E(t('am.aucune'))}</p>`;
    $('am-fin').innerHTML = fin.length ? fin.slice(0, 20).map(carte).join('') : `<p class="vide">${E(t('am.aucuneFin'))}</p>`;
  }

  /* ---------- Formulaire ---------- */
  const optLignes = (sel) => D.lignes.map((l) => `<option value="${l.id}"${l.id === sel ? ' selected' : ''}>${E(l.id)} · ${E(NT.t('tr.ligne.' + l.id, null, l.nom))}</option>`).join('');
  const optArrets = (ligne, sel) => (D.lignes.find((l) => l.id === ligne) || D.lignes[0]).arrets.map((a) => `<option value="${a}"${a === sel ? ' selected' : ''}>${E(nom(a))}</option>`).join('');
  function ligneTroncon(k, tr) {
    const L = D.lignes.find((l) => l.id === tr.ligne) || D.lignes[0];
    return `<fieldset class="am-troncon" data-k="${k}"><legend class="sr-only">${E(t('am.ligne'))} ${k + 1}</legend>
      <div class="champ"><label for="am-l-${k}">${E(t('am.ligne'))}</label><select id="am-l-${k}" data-role="ligne">${optLignes(L.id)}</select></div>
      <div class="champ"><label for="am-de-${k}">${E(t('am.de'))}</label><select id="am-de-${k}" data-role="de">${optArrets(L.id, tr.de || L.arrets[0])}</select></div>
      <div class="champ"><label for="am-a-${k}">${E(t('am.a'))}</label><select id="am-a-${k}" data-role="a">${optArrets(L.id, tr.a || L.arrets[L.arrets.length - 1])}</select></div>
      ${k ? `<button type="button" class="btn petit" data-am-retirer="${k}"><i class="ph ph-x" aria-hidden="true"></i>${E(t('am.retirer'))}</button>` : ''}</fieldset>`;
  }
  function rendreFormulaire(i) {
    edition = i || null;
    const v = i || { troncons: [{ ligne: 'N4', de: '', a: '' }], motif: 'travaux', precision: '', remplacement: { type: 'bus-relais', frequence: 10, arrets: [], texte: '' }, tad: true };
    $('am-form-titre').textContent = i ? t('am.modifier', { id: i.id }) : t('am.declarer');
    $('am-form-zone').innerHTML = `<form id="am-form" novalidate>
      <div class="am-erreur" id="am-erreur" role="alert" tabindex="-1" hidden></div>
      <fieldset class="am-groupe"><legend>${E(t('am.troncons'))}</legend><div id="am-troncons">${v.troncons.map((tr, k) => ligneTroncon(k, tr)).join('')}</div>
        <button type="button" class="btn petit" id="am-ajouter"><i class="ph ph-plus" aria-hidden="true"></i>${E(t('am.ajouterLigne'))}</button></fieldset>
      <fieldset class="am-groupe"><legend>${E(t('am.periode'))}</legend>
        <div class="am-radios" role="radiogroup" aria-label="${E(t('am.debut'))}"><span class="am-lbl">${E(t('am.debut'))}</span>
          <label><input type="radio" name="am-debut" value="maintenant" ${i ? '' : 'checked'}> ${E(t('am.maintenant'))}</label>
          <label><input type="radio" name="am-debut" value="date" ${i ? 'checked' : ''}> ${E(t('am.programmer'))}</label></div>
        <div class="champ"><label for="am-debut-date">${E(t('am.debutDate'))}</label><input type="datetime-local" id="am-debut-date" value="${E(local(i && i.debut && i.debut.iso))}" ${i ? '' : 'disabled'}></div>
        <div class="am-radios" role="radiogroup" aria-label="${E(t('am.fin'))}"><span class="am-lbl">${E(t('am.fin'))}</span>
          <label><input type="radio" name="am-fin" value="date" ${!i || i.fin ? 'checked' : ''}> ${E(t('am.finDate'))}</label>
          <label><input type="radio" name="am-fin" value="aucune" ${i && !i.fin ? 'checked' : ''}> ${E(t('am.finInconnue'))}</label></div>
        <div class="champ"><label for="am-fin-date">${E(t('am.finDate'))}</label><input type="datetime-local" id="am-fin-date" value="${E(local(i ? i.fin && i.fin.iso : new Date(Date.now() + 4 * 3600e3).toISOString()))}" ${i && !i.fin ? 'disabled' : ''}></div></fieldset>
      <fieldset class="am-groupe"><legend>${E(t('am.raison'))}</legend>
        <div class="champ"><label for="am-motif">${E(t('am.raison'))}</label><select id="am-motif">${D.motifs.map((m) => `<option value="${m}"${m === v.motif ? ' selected' : ''}>${E(t('am.m.' + m))}</option>`).join('')}</select></div>
        <div class="champ"><label for="am-precision">${E(t('am.precision'))}</label><input id="am-precision" maxlength="240" value="${E(v.precision)}" aria-describedby="am-precision-aide"><p class="aide" id="am-precision-aide">${E(t('am.precisionAide'))}</p></div></fieldset>
      <fieldset class="am-groupe"><legend>${E(t('am.remplacement'))}</legend>
        <div class="am-radios">${D.remplacements.map((r) => `<label><input type="radio" name="am-r" value="${r}" ${r === v.remplacement.type ? 'checked' : ''}> ${E(t('am.r.' + r))}</label>`).join('')}</div>
        <div id="am-relais"><div class="champ"><label for="am-freq">${E(t('am.frequence'))}</label><input id="am-freq" type="number" min="3" max="60" value="${E(v.remplacement.frequence || 15)}"></div>
          <fieldset class="champ am-arrets-relais"><legend>${E(t('am.arretsRelais'))}</legend><div id="am-arrets-relais"></div></fieldset>
          <div class="champ"><label for="am-texte">${E(t('am.texteRelais'))}</label><input id="am-texte" maxlength="200" value="${E(v.remplacement.texte || '')}"></div></div>
        <label class="am-case"><input type="checkbox" id="am-tad" ${v.tad !== false ? 'checked' : ''}> ${E(t('am.tad'))}</label></fieldset>
      <div class="am-apercu" aria-live="polite"><p class="am-lbl">${E(t('am.apercu'))}</p><div id="am-apercu"></div></div>
      <div class="am-actions"><button class="btn btn-primaire" type="submit"><i class="ph ph-paper-plane-tilt" aria-hidden="true"></i>${E(t(i ? 'am.enregistrerMaj' : 'am.enregistrer'))}</button>
        ${i ? `<button class="btn" type="button" id="am-annuler-edition">${E(t('am.annuler'))}</button>` : ''}</div></form>`;
    relaisArrets(v.remplacement.arrets);
    majEtat();
  }
  function lireTroncons() { return [...document.querySelectorAll('.am-troncon')].map((f) => ({ ligne: f.querySelector('[data-role="ligne"]').value, de: f.querySelector('[data-role="de"]').value, a: f.querySelector('[data-role="a"]').value })); }
  function arretsSection(tr) { const L = D.lignes.find((l) => l.id === tr.ligne); const i = L.arrets.indexOf(tr.de), j = L.arrets.indexOf(tr.a); return L.arrets.slice(Math.min(i, j), Math.max(i, j) + 1); }
  function relaisArrets(choisis) {
    const trs = lireTroncons();
    const proposes = [...new Set(trs.flatMap((tr) => D.lignes.find((l) => l.id === tr.ligne).arrets))];
    const coches = choisis && choisis.length ? choisis : [...new Set(trs.flatMap(arretsSection))];
    $('am-arrets-relais').innerHTML = proposes.map((a) => `<label class="am-case"><input type="checkbox" value="${a}" ${coches.includes(a) ? 'checked' : ''}> ${E(nom(a))}</label>`).join('');
  }
  function majEtat() {
    const r = (document.querySelector('input[name="am-r"]:checked') || {}).value;
    $('am-relais').hidden = r === 'aucun';
    $('am-debut-date').disabled = (document.querySelector('input[name="am-debut"]:checked') || {}).value !== 'date';
    $('am-fin-date').disabled = (document.querySelector('input[name="am-fin"]:checked') || {}).value !== 'date';
    // aperçu : même formulation que la page Transports
    const fin = $('am-fin-date').disabled ? null : $('am-fin-date').value;
    const finTxt = fin ? new Date(fin).toLocaleString(NT.i18n.langue === 'en' ? 'en-GB' : NT.i18n.langue, { weekday: 'short', hour: '2-digit', minute: '2-digit' }) : '';
    $('am-apercu').innerHTML = lireTroncons().map((tr) => `<p class="am-apercu-ligne"><span class="tr-ligne tr-${E(tr.ligne)}">${E(tr.ligne)}</span><strong>${E(fin ? t('am.titreLigne', { l: tr.ligne, fin: finTxt }) : t('am.titreLigneSans', { l: tr.ligne }))}</strong>
      <span class="doux">${E(arretsSection(tr).length === D.lignes.find((l) => l.id === tr.ligne).arrets.length ? t('am.toute') : nom(tr.de) + fleche() + nom(tr.a))} · ${E(t('am.m.' + $('am-motif').value))}</span></p>`).join('');
  }
  function envoyer(e) {
    e.preventDefault();
    const r = (document.querySelector('input[name="am-r"]:checked') || {}).value || 'aucun';
    const debutDate = (document.querySelector('input[name="am-debut"]:checked') || {}).value === 'date' && $('am-debut-date').value;
    const finDate = (document.querySelector('input[name="am-fin"]:checked') || {}).value === 'date' ? $('am-fin-date').value : '';
    const corps = { troncons: lireTroncons(), motif: $('am-motif').value, precision: $('am-precision').value,
      debut: debutDate ? new Date(debutDate).toISOString() : (edition ? edition.debut.iso : new Date().toISOString()), fin: finDate ? new Date(finDate).toISOString() : null,
      remplacement: { type: r, frequence: Number($('am-freq').value) || 15, arrets: [...document.querySelectorAll('#am-arrets-relais input:checked')].map((x) => x.value), texte: $('am-texte').value },
      tad: $('am-tad').checked };
    const rep = edition ? NT.api('PATCH', '/api/mobilite/interruptions/' + encodeURIComponent(edition.id), corps) : NT.api('POST', '/api/mobilite/interruptions', corps);
    if (rep.statut !== 200) { const z = $('am-erreur'); z.hidden = false; z.textContent = t('am.erreur', { e: (rep.donnees && rep.donnees.erreur) || rep.statut }); z.focus(); return; }
    NT.ui.toast(edition ? t('am.majOk') : t('am.cree', { n: rep.donnees.prevenus || 0 }), 'success', 7000);
    edition = null;
    charger(); rendreFormulaire();
    const c = document.querySelector(`.am-carte[data-id="${rep.donnees.id}"]`); if (c) { c.setAttribute('tabindex', '-1'); c.focus(); }
  }

  document.addEventListener('change', (e) => {
    if (!e.target.closest || !e.target.closest('#am-form')) return;
    const f = e.target.closest('.am-troncon');
    if (f && e.target.dataset.role === 'ligne') { const L = D.lignes.find((l) => l.id === e.target.value); f.querySelector('[data-role="de"]').innerHTML = optArrets(L.id, L.arrets[0]); f.querySelector('[data-role="a"]').innerHTML = optArrets(L.id, L.arrets[L.arrets.length - 1]); }
    if (f) relaisArrets();
    majEtat();
  });
  document.addEventListener('input', (e) => { if (e.target.closest && e.target.closest('#am-form')) majEtat(); });
  document.addEventListener('submit', (e) => {
    if (e.target.id === 'am-form') return envoyer(e);
    const lf = e.target.closest('[data-am-lever-form]');
    if (lf) {
      e.preventDefault();
      const id = lf.dataset.amLeverForm;
      const r = NT.api('POST', '/api/mobilite/interruptions/' + encodeURIComponent(id) + '/lever', { motif: lf.querySelector('input').value });
      if (r.statut !== 200) { NT.ui.toast((r.donnees && r.donnees.erreur) || NT.t('ui.erreur'), 'danger'); return; }
      NT.ui.toast(t('am.leve', { n: r.donnees.prevenus || 0 }), 'success', 7000);
      charger(); $('am-t-cours').setAttribute('tabindex', '-1'); $('am-t-cours').focus();
    }
  });
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('button'); if (!b) return;
    if (b.id === 'am-ajouter') { const n = document.querySelectorAll('.am-troncon').length; if (n >= 4) return; $('am-troncons').insertAdjacentHTML('beforeend', ligneTroncon(n, { ligne: D.lignes[n % D.lignes.length].id })); relaisArrets(); majEtat(); document.getElementById('am-l-' + n).focus(); return; }
    if (b.dataset.amRetirer) { b.closest('.am-troncon').remove(); relaisArrets(); majEtat(); $('am-ajouter').focus(); return; }
    if (b.dataset.amModifier) { const i = D.interruptions.find((x) => x.id === b.dataset.amModifier); rendreFormulaire(i); $('declarer').scrollIntoView({ block: 'start' }); $('am-l-0').focus(); return; }
    if (b.id === 'am-annuler-edition') { rendreFormulaire(); return; }
    if (b.dataset.amLever) { const f = document.querySelector(`[data-am-lever-form="${b.dataset.amLever}"]`); f.hidden = !f.hidden; b.setAttribute('aria-expanded', String(!f.hidden)); if (!f.hidden) f.querySelector('input').focus(); return; }
    if (b.hasAttribute('data-am-annuler')) { const f = b.closest('form'); f.hidden = true; const bt = document.querySelector(`[data-am-lever="${f.dataset.amLeverForm}"]`); bt.setAttribute('aria-expanded', 'false'); bt.focus(); }
  });

  if (document.readyState === 'complete') charger(); else document.addEventListener('DOMContentLoaded', charger);
})();
