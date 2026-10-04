/* Terra Nova — F73 : « Message officiel » du Haut Conseil de la Ville.
   Chargé par ui.js sur toutes les pages. Les messages en cours (GET /api/officiels, le serveur décide qui les voit et quand)
   sont relus toutes les 30 s sans recharger la page (même rythme que les notifications F49 : 2 min en connexion lente,
   espacé sur appareil peu puissant, en pause quand l'onglet est caché).
   - la balise « Alertes » les met en évidence ; à l'arrivée, un message pas encore compris apparaît dans une fenêtre
     discrète (une fois par visite), qui s'efface seule ; il reste ensuite dans le tiroir « Alertes » ;
   - sceau « Haut Conseil de la Ville », ce qu'il faut savoir, « Ce que vous devez faire », bouton « J'ai compris »
     (enregistré sur le compte si connecté, sur l'appareil sinon) ;
   - carte épinglée en haut de l'accueil et des annonces tant que le message est en cours (#nt-officiel-epingle).
   Jamais de bandeau pleine largeur. */
(function () {
  'use strict';
  const NT = window.NT;
  if (!NT || !NT.ui || NT.officiel) return;

  NT.i18n.ajouter({
    fr: { 'off.sceau': 'Haut Conseil de la Ville', 'off.type': 'Message officiel', 'off.quoi': 'Ce que vous devez faire', 'off.compris': 'J’ai compris',
      'off.dejaCompris': 'Vous avez indiqué avoir compris ce message.', 'off.merci': 'Merci, c’est noté.', 'off.jusqua': 'En vigueur jusqu’au {d}', 'off.depuis': 'Publié {d}',
      'off.toute': 'Toute la ville', 'off.quartier': 'Quartier {q}', 'off.votreQuartier': 'Votre quartier est concerné', 'off.nouveau': 'Nouveau message officiel du Haut Conseil : {t}',
      'off.baliseNonLu': 'message officiel à lire', 'off.epingle': 'Message officiel en cours', 'off.voir': 'Voir dans les alertes', 'off.masquer': 'Masquer ce message (il reste dans les alertes)', 'off.masque': 'Message masqué. Il reste disponible dans « Alertes ».', 'off.versionFr': 'Ce message n’est pas encore traduit : version française.',
      'off.voirAlerte': 'Voir l’alerte', 'off.fermer': 'Fermer', 'off.dansAlertes': 'Toujours disponible dans Alertes' },
    en: { 'off.sceau': 'City High Council', 'off.type': 'Official message', 'off.quoi': 'What you need to do', 'off.compris': 'I understand',
      'off.dejaCompris': 'You have confirmed that you understood this message.', 'off.merci': 'Thank you, noted.', 'off.jusqua': 'In force until {d}', 'off.depuis': 'Published {d}',
      'off.toute': 'Whole city', 'off.quartier': '{q} district', 'off.votreQuartier': 'Your district is concerned', 'off.nouveau': 'New official message from the High Council: {t}',
      'off.baliseNonLu': 'official message to read', 'off.epingle': 'Current official message', 'off.voir': 'See in alerts', 'off.masquer': 'Hide this message (it stays in alerts)', 'off.masque': 'Message hidden. It is still available in “Alerts”.', 'off.versionFr': 'This message is not translated yet: French version.',
      'off.voirAlerte': 'See the alert', 'off.fermer': 'Close', 'off.dansAlertes': 'Always available in Alerts' },
    es: { 'off.sceau': 'Alto Consejo de la Ciudad', 'off.type': 'Mensaje oficial', 'off.quoi': 'Lo que debe hacer', 'off.compris': 'Lo he entendido',
      'off.dejaCompris': 'Ha indicado que entendió este mensaje.', 'off.merci': 'Gracias, queda anotado.', 'off.jusqua': 'Vigente hasta el {d}', 'off.depuis': 'Publicado {d}',
      'off.toute': 'Toda la ciudad', 'off.quartier': 'Barrio {q}', 'off.votreQuartier': 'Su barrio está afectado', 'off.nouveau': 'Nuevo mensaje oficial del Alto Consejo: {t}',
      'off.baliseNonLu': 'mensaje oficial por leer', 'off.epingle': 'Mensaje oficial en curso', 'off.voir': 'Ver en las alertas', 'off.masquer': 'Ocultar este mensaje (sigue en las alertas)', 'off.masque': 'Mensaje oculto. Sigue disponible en «Alertas».', 'off.versionFr': 'Este mensaje aún no está traducido: versión en francés.',
      'off.voirAlerte': 'Ver la alerta', 'off.fermer': 'Cerrar', 'off.dansAlertes': 'Siempre disponible en Alertas' },
    ar: { 'off.sceau': 'المجلس الأعلى للمدينة', 'off.type': 'رسالة رسمية', 'off.quoi': 'ما يجب عليك فعله', 'off.compris': 'فهمت',
      'off.dejaCompris': 'لقد أكدت أنك فهمت هذه الرسالة.', 'off.merci': 'شكراً، تم التسجيل.', 'off.jusqua': 'سارية حتى {d}', 'off.depuis': 'نُشرت {d}',
      'off.toute': 'كل المدينة', 'off.quartier': 'حي {q}', 'off.votreQuartier': 'حيّك معني', 'off.nouveau': 'رسالة رسمية جديدة من المجلس الأعلى: {t}',
      'off.baliseNonLu': 'رسالة رسمية للقراءة', 'off.epingle': 'رسالة رسمية جارية', 'off.voir': 'عرض في التنبيهات', 'off.masquer': 'إخفاء هذه الرسالة (تبقى في التنبيهات)', 'off.masque': 'تم إخفاء الرسالة. ما زالت متاحة في «التنبيهات».', 'off.versionFr': 'هذه الرسالة غير مترجمة بعد: النسخة الفرنسية.',
      'off.voirAlerte': 'عرض التنبيه', 'off.fermer': 'إغلاق', 'off.dansAlertes': 'متاح دائماً في التنبيهات' }
  });

  const t = NT.t, { echap } = NT.ui;
  const lireL = (cle) => { try { return JSON.parse(localStorage.getItem('nt:' + cle)) || []; } catch (e) { return []; } };
  const ecrireL = (cle, v) => { try { localStorage.setItem('nt:' + cle, JSON.stringify(v.slice(-100))); } catch (e) { /* stockage bloqué */ } };
  let messages = [];
  let connus = null;   // identifiants déjà vus pendant cette visite (annonce vocale des nouveaux)
  const comprisLocal = () => lireL('officielsCompris');
  const estCompris = m => m.compris || comprisLocal().includes(m.id);
  // Croix de la carte épinglée : masque le message sur cette page pour cet appareil ; il reste dans le tiroir « Alertes »
  const masquesLocal = () => lireL('officielsMasques');
  const croix = m => `<button type="button" class="off-masquer" data-off-masquer="${echap(m.id)}" aria-label="${echap(t('off.masquer'))}" title="${echap(t('off.masquer'))}"><i class="ph ph-x" aria-hidden="true"></i></button>`;

  // Contenu dans la langue de l'habitant si l'agent l'a traduit, sinon en français (signalé)
  function contenu(m) {
    const l = NT.i18n.langue, tr = l !== 'fr' && m.traductions && m.traductions[l];
    const ok = tr && tr.titre && tr.message;
    return { titre: ok ? tr.titre : m.titre, message: ok ? tr.message : m.message, actions: ok && tr.actions && tr.actions.length ? tr.actions : m.actions,
      langue: ok || l === 'fr' ? l : 'fr', nonTraduit: l !== 'fr' && !ok };
  }
  const zone = m => (m.audience === 'Toute la ville' ? t('off.toute') : t('off.quartier', { q: t('cm.q.' + m.audience, null, m.audience) }));

  function carte(m, mode, compact) {
    const c = contenu(m), compris = estCompris(m), id = 'off-' + mode + '-' + m.id;
    // version compacte (accueil) : l'essentiel sur deux lignes, « Ce que vous devez faire » ouvre le tiroir des alertes
    if (compact) return `<article class="off-carte off-${mode} off-compact${compris ? ' off-lu' : ''}" aria-labelledby="${id}" data-off="${echap(m.id)}">${mode === 'epingle' ? croix(m) : ''}
      <div class="off-sceau"><span class="off-sceau-ic" aria-hidden="true"><i class="ph-duotone ph-seal-check"></i></span>
        <span><strong>${echap(t('off.sceau'))}</strong><small>${echap(t('off.type'))} · ${echap(zone(m))}</small></span></div>
      <h3 id="${id}" lang="${c.langue}" dir="${c.langue === 'ar' ? 'rtl' : 'ltr'}">${echap(c.titre)}</h3>
      <p class="off-texte off-court" lang="${c.langue}" dir="${c.langue === 'ar' ? 'rtl' : 'ltr'}">${echap(c.message)}</p>
      <div class="off-pied"><button type="button" class="btn${compris ? ' btn-primaire' : ''}" data-off-voir><i class="ph-duotone ph-list-checks" aria-hidden="true"></i>${echap(t('off.quoi'))} (${c.actions.length})</button>
        ${compris ? `<p class="off-ok" role="status"><i class="ph-duotone ph-check-circle" aria-hidden="true"></i>${echap(t('off.merci'))}</p>`
          : `<button type="button" class="btn btn-primaire" data-off-compris="${echap(m.id)}"><i class="ph ph-check" aria-hidden="true"></i>${echap(t('off.compris'))}</button>`}</div>
    </article>`;
    return `<article class="off-carte off-${mode}${compris ? ' off-lu' : ''}" aria-labelledby="${id}" data-off="${echap(m.id)}">${mode === 'epingle' ? croix(m) : ''}
      <div class="off-sceau"><span class="off-sceau-ic" aria-hidden="true"><i class="ph-duotone ph-seal-check"></i></span>
        <span><strong>${echap(t('off.sceau'))}</strong><small>${echap(t('off.type'))} · ${echap(m.id)}</small></span></div>
      <h3 id="${id}" lang="${c.langue}" dir="${c.langue === 'ar' ? 'rtl' : 'ltr'}">${echap(c.titre)}</h3>
      <p class="off-meta"><span><i class="ph ph-map-pin" aria-hidden="true"></i>${echap(zone(m))}${m.monQuartier ? ' · <strong>' + echap(t('off.votreQuartier')) + '</strong>' : ''}</span>
        <span><i class="ph ph-clock" aria-hidden="true"></i>${echap(t('off.jusqua', { d: NT.ui.dateHeure(m.fin) }))}</span></p>
      ${c.nonTraduit ? `<p class="off-note">${echap(t('off.versionFr'))}</p>` : ''}
      <p class="off-texte" lang="${c.langue}" dir="${c.langue === 'ar' ? 'rtl' : 'ltr'}">${echap(c.message)}</p>
      <h4 class="off-quoi"><i class="ph-duotone ph-list-checks" aria-hidden="true"></i>${echap(t('off.quoi'))}</h4>
      <ol class="off-actions" lang="${c.langue}" dir="${c.langue === 'ar' ? 'rtl' : 'ltr'}">${c.actions.map(a => `<li>${echap(a)}</li>`).join('')}</ol>
      <div class="off-pied">${compris
        ? `<p class="off-ok" role="status"><i class="ph-duotone ph-check-circle" aria-hidden="true"></i>${echap(t('off.dejaCompris'))}</p>`
        : `<button type="button" class="btn btn-primaire" data-off-compris="${echap(m.id)}"><i class="ph ph-check" aria-hidden="true"></i>${echap(t('off.compris'))}</button>`}
        ${mode === 'epingle' ? `<button type="button" class="btn" data-off-voir><i class="ph ph-broadcast" aria-hidden="true"></i>${echap(t('off.voir'))}</button>` : ''}</div>
    </article>`;
  }

  // Pour ui.js : section en tête du tiroir des alertes et état de la balise
  NT.ui.officiels = () => ({ n: messages.length, nonLus: messages.filter(m => !estCompris(m)).length, html: messages.map(m => carte(m, 'tiroir')).join('') });

  function rendre() {
    if (NT.ui.rafraichirAlertes) NT.ui.rafraichirAlertes();
    const ep = document.getElementById('nt-officiel-epingle');
    if (ep) {
      const masques = masquesLocal(), visibles = messages.filter(m => !masques.includes(m.id));
      ep.hidden = !visibles.length;
      ep.innerHTML = visibles.length ? `<h2 class="sr-only">${echap(t('off.epingle'))}</h2>` + visibles.map(m => carte(m, 'epingle', ep.dataset.mode === 'compact')).join('') : '';
      // arrivée par annonces.html#off-epingle-<id> (repli sans CDN) : la carte est rendue après la page, on y défile une fois
      const anc = /^#off-epingle-(.+)$/.exec(location.hash || '');
      if (anc && !ep.dataset.ancre && versEpingle(decodeURIComponent(anc[1]))) ep.dataset.ancre = '1';
    }
  }

  /* À l'arrivée : une fenêtre discrète (pas une modale) présente le message pas encore compris, une fois par visite.
     Elle s'efface seule après 9 s (minuterie en pause au survol, au focus et onglet caché), sauf message marqué critique.
     En partant, elle « rentre » vers la balise Alertes, qui s'allume une fois : on voit où retrouver l'information. */
  const lireS = (cle) => { try { return JSON.parse(sessionStorage.getItem('nt:' + cle)) || []; } catch (e) { return []; } };
  const ecrireS = (cle, v) => { try { sessionStorage.setItem('nt:' + cle, JSON.stringify(v.slice(-50))); } catch (e) { /* stockage bloqué */ } };
  let fenetre = null;
  function fermerFenetre(versBalise) {
    const el = fenetre; if (!el) return;
    fenetre = null; clearTimeout(el._minuterie);
    const balise = document.getElementById('nt-balise');
    el.classList.add('sortie');
    const fini = () => el.remove();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || NT.leger.actif() || NT.econome.actif()) fini();
    else { el.addEventListener('transitionend', fini, { once: true }); setTimeout(fini, 400); }
    if (versBalise && balise) { balise.classList.remove('signale'); void balise.offsetWidth; balise.classList.add('signale'); setTimeout(() => balise.classList.remove('signale'), 1600); }
  }
  function montrerFenetre() {
    if (fenetre || document.querySelector('sl-dialog[open], sl-drawer[open]')) return;
    const vus = lireS('officielsVus');
    const m = messages.find(x => !estCompris(x) && !vus.includes(x.id));
    if (!m) return;
    ecrireS('officielsVus', vus.concat(m.id));
    const c = contenu(m), dir = c.langue === 'ar' ? 'rtl' : 'ltr';
    const el = document.createElement('section');
    el.className = 'off-fenetre';
    el.dataset.off = m.id;
    el.setAttribute('role', m.critique ? 'alert' : 'status');
    el.setAttribute('aria-labelledby', 'off-fenetre-titre');
    el.innerHTML = `<div class="off-fenetre-tete">
        <span class="off-fenetre-sceau" aria-hidden="true"><i class="ph-duotone ph-seal-check"></i></span>
        <p class="off-fenetre-source">${echap(t('off.sceau'))}<span>${echap(t('off.type'))} · ${echap(zone(m))}</span></p>
        <button type="button" class="off-fenetre-x" data-off-fermer><i class="ph ph-x" aria-hidden="true"></i><span class="sr-only">${echap(t('off.fermer'))}</span></button>
      </div>
      <h2 id="off-fenetre-titre" lang="${c.langue}" dir="${dir}">${echap(c.titre)}</h2>
      <p class="off-fenetre-texte" lang="${c.langue}" dir="${dir}">${echap(c.message)}</p>
      <div class="off-fenetre-pied">
        <button type="button" class="btn btn-primaire" data-off-voir-fenetre><i class="ph-duotone ph-broadcast" aria-hidden="true"></i>${echap(t('off.voirAlerte'))}</button>
        <span class="off-fenetre-note"><i class="ph ph-bell-simple" aria-hidden="true"></i>${echap(t('off.dansAlertes'))}</span>
      </div>
      ${m.critique ? '' : '<span class="off-fenetre-temps" aria-hidden="true"></span>'}`;
    document.body.append(el);
    fenetre = el;
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('visible')));
    if (m.critique) return;
    // disparition automatique : 9 s de lecture réelle (pause au survol, au focus, onglet caché)
    let reste = 9000, depart = Date.now();
    const lancer = () => { depart = Date.now(); el.classList.remove('pause'); el._minuterie = setTimeout(() => fermerFenetre(true), reste); };
    const pause = () => { clearTimeout(el._minuterie); reste = Math.max(1500, reste - (Date.now() - depart)); el.classList.add('pause'); };
    el.style.setProperty('--off-duree', reste + 'ms');
    el.addEventListener('pointerenter', pause); el.addEventListener('pointerleave', lancer);
    el.addEventListener('focusin', pause); el.addEventListener('focusout', e => { if (!el.contains(e.relatedTarget)) lancer(); });
    document.addEventListener('visibilitychange', () => { if (fenetre !== el) return; if (document.hidden) pause(); else lancer(); });
    lancer();
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && fenetre) fermerFenetre(true); });

  function charger() {
    return fetch('/api/officiels', { cache: 'no-store', credentials: 'same-origin' }).then(r => (r.ok ? r.json() : null)).then(traiter).catch(() => {});
  }
  function traiter(j) {   // vague 19 (F95) : aussi alimenté par le « pouls » groupé (NT.pouls, assets/js/continuite.js)
    {
      if (!j) return;
      const avant = JSON.stringify(messages);
      messages = j.messages || [];
      const nouveaux = connus ? messages.filter(m => !connus.has(m.id)) : [];
      connus = new Set(messages.map(m => m.id));
      if (JSON.stringify(messages) !== avant) rendre();
      nouveaux.forEach(m => NT.ui.annoncer(t('off.nouveau', { t: contenu(m).titre })));
      montrerFenetre();
    }
  }

  /* « Ce que vous devez faire » / « Voir l'alerte » : le tiroir des alertes quand Shoelace est prêt ; sans CDN, le message complet
     est montré sur la page des annonces (carte épinglée, ancre off-epingle-<id>), ou l'on défile jusqu'à lui s'il y est déjà. */
  function versEpingle(id) {
    const el = document.getElementById('off-epingle-' + id);
    if (!el) return false;
    el.scrollIntoView({ block: 'start' }); el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true });
    return true;
  }
  function ouvrirAlertes(src) {
    const id = src && src.dataset.off || (messages[0] || {}).id || '';
    const repli = () => { if (!versEpingle(id)) location.href = 'annonces.html#off-epingle-' + encodeURIComponent(id); };
    if (NT.ui.ouvrirAlertes) NT.ui.ouvrirAlertes(repli); else repli();
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-off-compris]');
    if (b) {
      const id = b.dataset.offCompris, local = comprisLocal(), dansTiroir = !!(NT.ui.tiroirAlertes && NT.ui.tiroirAlertes.contains(b));
      b.disabled = true;
      fetch('/api/officiels/' + encodeURIComponent(id) + '/compris', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dejaCompte: local.includes(id) }) })
        .catch(() => {}).finally(() => {
          ecrireL('officielsCompris', local.concat(local.includes(id) ? [] : [id]));
          messages = messages.map(m => (m.id === id ? Object.assign({}, m, { compris: true }) : m));
          rendre(); NT.ui.toast(t('off.merci'), 'success', 3000);
          const el = (dansTiroir ? NT.ui.tiroirAlertes : document.getElementById('nt-officiel-epingle') || document).querySelector(`[data-off="${CSS.escape(id)}"] .off-ok`); if (el) { el.setAttribute('tabindex', '-1'); el.focus(); }
        });
      return;
    }
    const x = e.target.closest('[data-off-masquer]');
    if (x) {   // la carte s'efface vite (160 ms), puis la page se resserre ; le focus va au contenu qui suit
      const id = x.dataset.offMasquer, art = x.closest('.off-carte');
      ecrireL('officielsMasques', masquesLocal().concat([id]));
      const fin = () => { rendre(); NT.ui.toast(t('off.masque'), 'success', 4000); const suite = document.querySelector('#an-q, main h2:not(.sr-only), main h1'); if (suite) { if (!suite.matches('input')) suite.setAttribute('tabindex', '-1'); suite.focus({ preventScroll: true }); } };
      if (!art || matchMedia('(prefers-reduced-motion: reduce)').matches) return fin();
      art.classList.add('off-sortie'); setTimeout(fin, 160);
      return;
    }
    if (e.target.closest('[data-off-voir]')) ouvrirAlertes(e.target.closest('[data-off]'));
    if (e.target.closest('[data-off-fermer]')) fermerFenetre(true);
    if (e.target.closest('[data-off-voir-fenetre]')) { const src = e.target.closest('[data-off]'); fermerFenetre(false); ouvrirAlertes(src); }
  });

  let minuterie = null;
  const planifier = () => { clearTimeout(minuterie); minuterie = setTimeout(() => { if (!document.hidden) charger(); planifier(); }, NT.leger.actif() ? 120000 : NT.econome.delai(30000)); };
  NT.officiel = { charger, messages: () => messages.slice() };
  // vague 19 (F95) : une seule lecture périodique pour toute la page (« pouls ») ; sinon (hors connexion, ancien script) comme avant
  if (NT.pouls && !NT.horsLigne) NT.pouls.ecouter('officiels', l => traiter({ messages: l }));
  else {
    document.addEventListener('visibilitychange', () => { if (!document.hidden) { charger(); planifier(); } });
    charger(); planifier();
  }
})();
