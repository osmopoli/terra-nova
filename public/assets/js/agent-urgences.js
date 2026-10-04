/* Terra Nova — vague 17 (F86) : panneau « Urgences médicales » des agents (agent.html, agent-demandes.html).
   Hors de la file normale : en tête de page, minuteur de prise en charge (« à prendre en charge dans 3 min » / « en retard,
   escaladée »), statuts signalée → prise en charge → transmise aux secours → close, en direct toutes les 10 s.
   Dans le tableau des demandes : urgences en cours toujours en premier (NT.urgences.avant), badge, filtre « Urgences »
   (?urgences=1). Le serveur contrôle les rôles et journalise chaque changement. */
(function () {
  'use strict';
  const NT = window.NT;
  NT.i18n.ajouter({
    fr: { 'ua.titre': 'Urgences médicales', 'ua.intro': 'Signalements d’urgence médicale : hors de la file normale, priorité Critique, jamais regroupés. La mairie relaie et suit ; les secours sont le 15 et le 112.',
      'ua.aucune': 'Aucune urgence médicale en cours.', 'ua.c.signalee': '{n} à prendre en charge', 'ua.c.prise': '{n} prise(s) en charge', 'ua.c.transmise': '{n} transmise(s) aux secours', 'ua.c.esc': '{n} escaladée(s)',
      'ua.moyenne': 'Prise en charge moyenne : {n} min', 'ua.signalee': 'Signalée à {h} (il y a {n} min)', 'ua.aPrendre': 'À prendre en charge dans {n} min', 'ua.retard': 'En retard de {n} min — escaladée au responsable de garde',
      'ua.prise': 'Pris en charge en {n} min par {par}', 'ua.prendre': 'Prendre en charge', 'ua.transmettre': 'Transmise aux secours', 'ua.clore': 'Clore', 'ua.note': 'Comment l’urgence a-t-elle été close ?',
      'ua.noteAide': 'Exemple : SAMU arrivé sur place, personne prise en charge.', 'ua.confirmerClore': 'Confirmer la clôture', 'ua.annuler': 'Annuler', 'ua.ouvrir': 'Voir la demande',
      'ua.closes': 'Urgences closes récemment ({n})', 'ua.filtrer': 'N’afficher que les urgences dans le tableau', 'ua.tout': 'Afficher toutes les demandes', 'ua.ok': 'Urgence {id} : {s}.',
      'ua.badge': 'Urgence médicale', 'ua.choix': 'choix « urgence vitale »', 'ua.mot': 'mot « {m} »', 'ua.anonyme': 'Visiteur',
      's.signalee': 'Signalée', 's.prise_en_charge': 'Prise en charge', 's.transmise': 'Transmise aux secours', 's.close': 'Close', 'pr.r.urgenceMedicale': 'Urgence médicale signalée : hors file normale' },
    en: { 'ua.titre': 'Medical emergencies', 'ua.intro': 'Medical emergency reports: outside the normal queue, Critical priority, never grouped. City hall relays and follows up; emergency services are 15 and 112.',
      'ua.aucune': 'No medical emergency in progress.', 'ua.c.signalee': '{n} to handle', 'ua.c.prise': '{n} being handled', 'ua.c.transmise': '{n} passed to emergency services', 'ua.c.esc': '{n} escalated',
      'ua.moyenne': 'Average handling time: {n} min', 'ua.signalee': 'Reported at {h} ({n} min ago)', 'ua.aPrendre': 'To be handled within {n} min', 'ua.retard': '{n} min late — escalated to the duty manager',
      'ua.prise': 'Handled within {n} min by {par}', 'ua.prendre': 'Take charge', 'ua.transmettre': 'Passed to emergency services', 'ua.clore': 'Close', 'ua.note': 'How was the emergency closed?',
      'ua.noteAide': 'Example: SAMU on site, person taken care of.', 'ua.confirmerClore': 'Confirm closing', 'ua.annuler': 'Cancel', 'ua.ouvrir': 'See the request',
      'ua.closes': 'Recently closed emergencies ({n})', 'ua.filtrer': 'Show only emergencies in the table', 'ua.tout': 'Show all requests', 'ua.ok': 'Emergency {id}: {s}.',
      'ua.badge': 'Medical emergency', 'ua.choix': '“life-threatening” choice', 'ua.mot': 'word “{m}”', 'ua.anonyme': 'Visitor',
      's.signalee': 'Reported', 's.prise_en_charge': 'Being handled', 's.transmise': 'Passed to emergency services', 's.close': 'Closed', 'pr.r.urgenceMedicale': 'Medical emergency reported: outside the normal queue' },
    es: { 'ua.titre': 'Urgencias médicas', 'ua.intro': 'Avisos de urgencia médica: fuera de la cola normal, prioridad Crítica, nunca agrupados. El ayuntamiento transmite y sigue; los servicios de emergencia son el 15 y el 112.',
      'ua.aucune': 'Ninguna urgencia médica en curso.', 'ua.c.signalee': '{n} por atender', 'ua.c.prise': '{n} en atención', 'ua.c.transmise': '{n} transmitida(s) a emergencias', 'ua.c.esc': '{n} escalada(s)',
      'ua.moyenne': 'Tiempo medio de atención: {n} min', 'ua.signalee': 'Señalada a las {h} (hace {n} min)', 'ua.aPrendre': 'A atender en {n} min', 'ua.retard': '{n} min de retraso — escalada al responsable de guardia',
      'ua.prise': 'Atendida en {n} min por {par}', 'ua.prendre': 'Hacerse cargo', 'ua.transmettre': 'Transmitida a emergencias', 'ua.clore': 'Cerrar', 'ua.note': '¿Cómo se cerró la urgencia?',
      'ua.noteAide': 'Ejemplo: SAMU en el lugar, persona atendida.', 'ua.confirmerClore': 'Confirmar el cierre', 'ua.annuler': 'Cancelar', 'ua.ouvrir': 'Ver la solicitud',
      'ua.closes': 'Urgencias cerradas recientemente ({n})', 'ua.filtrer': 'Mostrar solo las urgencias en la tabla', 'ua.tout': 'Mostrar todas las solicitudes', 'ua.ok': 'Urgencia {id}: {s}.',
      'ua.badge': 'Urgencia médica', 'ua.choix': 'elección «urgencia vital»', 'ua.mot': 'palabra «{m}»', 'ua.anonyme': 'Visitante',
      's.signalee': 'Señalada', 's.prise_en_charge': 'En atención', 's.transmise': 'Transmitida a emergencias', 's.close': 'Cerrada', 'pr.r.urgenceMedicale': 'Urgencia médica señalada: fuera de la cola normal' },
    ar: { 'ua.titre': 'الحالات الطبية الطارئة', 'ua.intro': 'بلاغات الحالات الطبية الطارئة: خارج قائمة الانتظار العادية، أولوية حرجة، ولا تُجمع أبداً. البلدية تنقل وتتابع؛ أرقام الإسعاف هي 15 و112.',
      'ua.aucune': 'لا توجد حالة طبية طارئة جارية.', 'ua.c.signalee': '{n} بانتظار التكفل', 'ua.c.prise': '{n} قيد التكفل', 'ua.c.transmise': '{n} أُحيلت إلى الإسعاف', 'ua.c.esc': '{n} تم تصعيدها',
      'ua.moyenne': 'متوسط مدة التكفل: {n} دقيقة', 'ua.signalee': 'أُبلغ عنها الساعة {h} (قبل {n} دقيقة)', 'ua.aPrendre': 'يجب التكفل بها خلال {n} دقيقة', 'ua.retard': 'متأخرة {n} دقيقة — صُعّدت إلى المسؤول المناوب',
      'ua.prise': 'تم التكفل بها خلال {n} دقيقة من طرف {par}', 'ua.prendre': 'التكفل بها', 'ua.transmettre': 'أُحيلت إلى الإسعاف', 'ua.clore': 'إغلاق', 'ua.note': 'كيف أُغلقت الحالة الطارئة؟',
      'ua.noteAide': 'مثال: وصل الإسعاف إلى المكان وتم التكفل بالشخص.', 'ua.confirmerClore': 'تأكيد الإغلاق', 'ua.annuler': 'إلغاء', 'ua.ouvrir': 'عرض الطلب',
      'ua.closes': 'حالات طارئة أُغلقت مؤخراً ({n})', 'ua.filtrer': 'عرض الحالات الطارئة فقط في الجدول', 'ua.tout': 'عرض جميع الطلبات', 'ua.ok': 'الحالة الطارئة {id}: {s}.',
      'ua.badge': 'حالة طبية طارئة', 'ua.choix': 'اختيار «حالة تهدد الحياة»', 'ua.mot': 'كلمة «{m}»', 'ua.anonyme': 'زائر',
      's.signalee': 'تم الإبلاغ', 's.prise_en_charge': 'قيد التكفل', 's.transmise': 'أُحيلت إلى الإسعاف', 's.close': 'مغلقة', 'pr.r.urgenceMedicale': 'حالة طبية طارئة: خارج قائمة الانتظار العادية' }
  });
  const t = (k, v) => NT.t(k, v);
  const E = (s) => NT.ui.echap(s == null ? '' : String(s));
  const param = (k) => new URLSearchParams(location.search).get(k);
  const etat = { filtre: param('urgences') === '1', liste: [], delai: 5, ouvertForm: null };
  const enCours = (d) => !!(d && d.urgenceMedicale && d.urgenceMedicale.statut !== 'close');

  // Outils pour le tableau des demandes (agent-demandes.html)
  NT.urgences = {
    avant: (cmp) => (a, b) => (enCours(b) - enCours(a)) || cmp(a, b),
    filtre: (d) => !etat.filtre || !!d.urgenceMedicale,
    badge: (d) => (d.urgenceMedicale ? `<span class="urg-badge-ligne"><i class="ph ph-siren" aria-hidden="true"></i>${E(t('ua.badge'))} · ${E(t('s.' + d.urgenceMedicale.statut))}</span>` : ''),
    classe: (d) => (enCours(d) ? 'urg-ligne' : '')
  };

  const heure = (iso) => new Date(iso).toLocaleTimeString(NT.i18n.langue === 'ar' ? 'ar' : NT.i18n.langue, { hour: '2-digit', minute: '2-digit' });
  const min = (a) => Math.max(0, Math.round((Date.now() - Date.parse(a)) / 60000));
  function minuteur(u) {
    if (u.priseEnCharge) return `<span class="urg-minuteur">${E(t('ua.prise', { n: u.priseEnCharge.minutes, par: u.priseEnChargePar || u.priseEnCharge.par || '' }))}</span>`;
    const reste = Math.ceil((Date.parse(u.echeance) - Date.now()) / 60000);
    return reste > 0 ? `<span class="urg-minuteur">${E(t('ua.aPrendre', { n: reste }))}</span>` : `<span class="urg-minuteur retard">${E(t('ua.retard', { n: -reste }))}</span>`;
  }
  function motifs(u) { return (u.motifs || []).map((m) => (m.type === 'choix' ? t('ua.choix') : m.type === 'mot' ? t('ua.mot', { m: m.mot }) : m.type)).join(', '); }
  function item(u) {
    const auteur = u.userId && NT.agent && NT.agent.utilisateur ? NT.agent.utilisateur(u.userId) : null;
    const qui = auteur ? `${auteur.prenom} ${auteur.nom}${auteur.telephone ? ' · ' + auteur.telephone : ''}` : u.contactNom || t('ua.anonyme');
    const form = etat.ouvertForm === u.id;
    return `<li class="urg-item ${E(u.statut)}" id="urg-${E(u.id)}">
      <div class="tete"><span class="v17-num">${E(u.id)}</span><span class="urg-marque"><i class="ph ph-siren" aria-hidden="true"></i>${E(t('s.' + u.statut))}</span>${u.statut !== 'close' ? minuteur(u) : ''}</div>
      <h3>${E(u.objet)}</h3>
      <p class="doux">${E(t('ua.signalee', { h: heure(u.signaleeLe), n: min(u.signaleeLe) }))}${u.quartier ? ' · ' + E(u.quartier) : ''}${u.lieu ? ' · ' + E(u.lieu) : ''}</p>
      ${u.message ? `<p>${E(u.message)}</p>` : ''}
      <p class="doux">${E(qui)} · ${E(motifs(u))}</p>
      ${u.statut !== 'close' ? `<div class="actions">
        ${u.statut === 'signalee' ? `<button type="button" class="btn btn-primaire petit" data-ua="prise_en_charge" data-id="${E(u.id)}">${E(t('ua.prendre'))}</button>` : ''}
        ${u.statut !== 'transmise' ? `<button type="button" class="btn petit" data-ua="transmise" data-id="${E(u.id)}">${E(t('ua.transmettre'))}</button>` : ''}
        <button type="button" class="btn petit" data-ua="ouvrir-clore" data-id="${E(u.id)}" aria-expanded="${form}">${E(t('ua.clore'))}</button>
        <a class="btn petit" href="agent-demandes.html?q=${encodeURIComponent(u.id)}">${E(t('ua.ouvrir'))}</a></div>
        ${form ? `<form data-ua-form="${E(u.id)}"><label for="ua-note-${E(u.id)}">${E(t('ua.note'))}</label><textarea id="ua-note-${E(u.id)}" required minlength="5" aria-describedby="ua-aide-${E(u.id)}"></textarea>
          <span class="doux" id="ua-aide-${E(u.id)}">${E(t('ua.noteAide'))}</span><div class="actions"><button class="btn btn-primaire petit" type="submit">${E(t('ua.confirmerClore'))}</button><button class="btn petit" type="button" data-ua="annuler">${E(t('ua.annuler'))}</button></div></form>` : ''}` : ''}
    </li>`;
  }
  let panneau = null, donnees = null;
  function rendre() {
    if (!panneau || !donnees) return;
    const l = donnees.urgences || [];
    const ouvertes = l.filter((u) => u.statut !== 'close');
    const closes = l.filter((u) => u.statut === 'close' && Date.now() - Date.parse(u.closeLe || u.signaleeLe) < 7 * 864e5);
    const c = donnees.compte || {};
    const focus = document.activeElement && panneau.contains(document.activeElement) && document.activeElement.id;
    panneau.className = 'panneau urg-panneau' + (ouvertes.length ? '' : ' calme');
    panneau.innerHTML = `<h2 id="urg-t"><i class="ph-duotone ph-first-aid-kit" aria-hidden="true"></i>${E(t('ua.titre'))}</h2>
      <p class="doux">${E(t('ua.intro'))}</p>
      <div class="urg-compteurs">${c.signalee ? `<span>${E(t('ua.c.signalee', { n: c.signalee }))}</span>` : ''}${c.prise_en_charge ? `<span>${E(t('ua.c.prise', { n: c.prise_en_charge }))}</span>` : ''}${c.transmise ? `<span>${E(t('ua.c.transmise', { n: c.transmise }))}</span>` : ''}${c.escaladees ? `<span>${E(t('ua.c.esc', { n: c.escaladees }))}</span>` : ''}${donnees.delaiMoyenPriseEnCharge != null ? `<span>${E(t('ua.moyenne', { n: donnees.delaiMoyenPriseEnCharge }))}</span>` : ''}</div>
      ${ouvertes.length ? `<ul class="urg-liste">${ouvertes.map(item).join('')}</ul>` : `<p>${E(t('ua.aucune'))}</p>`}
      ${document.getElementById('lignes') ? `<div class="v17-boutons"><button type="button" class="btn petit" data-ua="filtre" aria-pressed="${etat.filtre}">${E(t(etat.filtre ? 'ua.tout' : 'ua.filtrer'))}</button></div>` : ''}
      ${closes.length ? `<details style="margin-top:1rem"><summary>${E(t('ua.closes', { n: closes.length }))}</summary><ul class="urg-liste" style="margin-top:.7rem">${closes.map(item).join('')}</ul></details>` : ''}`;
    if (focus) { const el = document.getElementById(focus); if (el) el.focus(); }
  }
  function lire() {
    return fetch('/api/urgences', { cache: 'no-store', credentials: 'same-origin' }).then((r) => (r.ok ? r.json() : null)).then((d) => { if (d) { donnees = d; if (!etat.ouvertForm) rendre(); } }).catch(() => {});
  }
  function changer(id, statut, note) {
    const r = NT.api('POST', '/api/urgences/' + encodeURIComponent(id) + '/statut', { statut, note: note || '' });
    if (r.statut !== 200) { NT.ui.toast((r.donnees && r.donnees.erreur) || 'Erreur', 'danger'); return; }
    NT.ui.toast(t('ua.ok', { id, s: t('s.' + statut) }), 'success');
    NT.ui.annoncer && NT.ui.annoncer(t('ua.ok', { id, s: t('s.' + statut) }));
    etat.ouvertForm = null;
    NT.recharger();
    lire().then(() => document.dispatchEvent(new CustomEvent('nt:urgences')));
  }

  NT.pret(() => {
    if (!NT.auth.aRole('agent') && !NT.auth.aRole('admin')) return;
    const main = document.getElementById('contenu');
    if (!main) return;
    panneau = document.createElement('section');
    panneau.id = 'urgences';
    panneau.setAttribute('aria-labelledby', 'urg-t');
    const tete = main.querySelector('.titre-page');
    if (tete) tete.after(panneau); else main.prepend(panneau);
    panneau.addEventListener('click', (e) => {
      const b = e.target.closest('[data-ua]'); if (!b) return;
      const a = b.dataset.ua;
      if (a === 'prise_en_charge' || a === 'transmise') changer(b.dataset.id, a);
      if (a === 'ouvrir-clore') { etat.ouvertForm = b.dataset.id; rendre(); const z = document.getElementById('ua-note-' + b.dataset.id); if (z) z.focus(); }
      if (a === 'annuler') { etat.ouvertForm = null; rendre(); }
      if (a === 'filtre') { etat.filtre = !etat.filtre; rendre(); document.dispatchEvent(new CustomEvent('nt:urgences')); }
    });
    panneau.addEventListener('submit', (e) => {
      const f = e.target.closest('[data-ua-form]'); if (!f) return;
      e.preventDefault();
      const note = f.querySelector('textarea').value.trim();
      if (note.length < 5) { f.querySelector('textarea').focus(); return; }
      changer(f.dataset.uaForm, 'close', note);
    });
    lire();
    setInterval(() => { if (!document.hidden) lire(); }, 10000);
    setInterval(() => { if (!document.hidden && !etat.ouvertForm) rendre(); }, 30000);   // minuteurs
    if (location.hash === '#urgences') setTimeout(() => panneau.scrollIntoView({ block: 'start' }), 300);
  });
})();
