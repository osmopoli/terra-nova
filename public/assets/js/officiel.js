/* Terra Nova — F73 : « Message officiel » du Haut Conseil de la Ville.
   Chargé par ui.js sur toutes les pages. Les messages en cours (GET /api/officiels, le serveur décide qui les voit et quand)
   sont relus toutes les 30 s sans recharger la page (même rythme que les notifications F49 : 2 min en connexion lente,
   espacé sur appareil peu puissant, en pause quand l'onglet est caché).
   - la balise « Alertes » les met en évidence et le tiroir s'ouvre UNE fois tout seul par message (mémorisé sur l'appareil) ;
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
      'off.baliseNonLu': 'message officiel à lire', 'off.epingle': 'Message officiel en cours', 'off.voir': 'Voir dans les alertes', 'off.versionFr': 'Ce message n’est pas encore traduit : version française.' },
    en: { 'off.sceau': 'City High Council', 'off.type': 'Official message', 'off.quoi': 'What you need to do', 'off.compris': 'I understand',
      'off.dejaCompris': 'You have confirmed that you understood this message.', 'off.merci': 'Thank you, noted.', 'off.jusqua': 'In force until {d}', 'off.depuis': 'Published {d}',
      'off.toute': 'Whole city', 'off.quartier': '{q} district', 'off.votreQuartier': 'Your district is concerned', 'off.nouveau': 'New official message from the High Council: {t}',
      'off.baliseNonLu': 'official message to read', 'off.epingle': 'Current official message', 'off.voir': 'See in alerts', 'off.versionFr': 'This message is not translated yet: French version.' },
    es: { 'off.sceau': 'Alto Consejo de la Ciudad', 'off.type': 'Mensaje oficial', 'off.quoi': 'Lo que debe hacer', 'off.compris': 'Lo he entendido',
      'off.dejaCompris': 'Ha indicado que entendió este mensaje.', 'off.merci': 'Gracias, queda anotado.', 'off.jusqua': 'Vigente hasta el {d}', 'off.depuis': 'Publicado {d}',
      'off.toute': 'Toda la ciudad', 'off.quartier': 'Barrio {q}', 'off.votreQuartier': 'Su barrio está afectado', 'off.nouveau': 'Nuevo mensaje oficial del Alto Consejo: {t}',
      'off.baliseNonLu': 'mensaje oficial por leer', 'off.epingle': 'Mensaje oficial en curso', 'off.voir': 'Ver en las alertas', 'off.versionFr': 'Este mensaje aún no está traducido: versión en francés.' },
    ar: { 'off.sceau': 'المجلس الأعلى للمدينة', 'off.type': 'رسالة رسمية', 'off.quoi': 'ما يجب عليك فعله', 'off.compris': 'فهمت',
      'off.dejaCompris': 'لقد أكدت أنك فهمت هذه الرسالة.', 'off.merci': 'شكراً، تم التسجيل.', 'off.jusqua': 'سارية حتى {d}', 'off.depuis': 'نُشرت {d}',
      'off.toute': 'كل المدينة', 'off.quartier': 'حي {q}', 'off.votreQuartier': 'حيّك معني', 'off.nouveau': 'رسالة رسمية جديدة من المجلس الأعلى: {t}',
      'off.baliseNonLu': 'رسالة رسمية للقراءة', 'off.epingle': 'رسالة رسمية جارية', 'off.voir': 'عرض في التنبيهات', 'off.versionFr': 'هذه الرسالة غير مترجمة بعد: النسخة الفرنسية.' }
  });

  const t = NT.t, { echap } = NT.ui;
  const lireL = (cle) => { try { return JSON.parse(localStorage.getItem('nt:' + cle)) || []; } catch (e) { return []; } };
  const ecrireL = (cle, v) => { try { localStorage.setItem('nt:' + cle, JSON.stringify(v.slice(-100))); } catch (e) { /* stockage bloqué */ } };
  let messages = [];
  let connus = null;   // identifiants déjà vus pendant cette visite (annonce vocale des nouveaux)
  const comprisLocal = () => lireL('officielsCompris');
  const estCompris = m => m.compris || comprisLocal().includes(m.id);

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
    if (compact) return `<article class="off-carte off-${mode} off-compact${compris ? ' off-lu' : ''}" aria-labelledby="${id}" data-off="${echap(m.id)}">
      <div class="off-sceau"><span class="off-sceau-ic" aria-hidden="true"><i class="ph-duotone ph-seal-check"></i></span>
        <span><strong>${echap(t('off.sceau'))}</strong><small>${echap(t('off.type'))} · ${echap(zone(m))}</small></span></div>
      <h3 id="${id}" lang="${c.langue}" dir="${c.langue === 'ar' ? 'rtl' : 'ltr'}">${echap(c.titre)}</h3>
      <p class="off-texte off-court" lang="${c.langue}" dir="${c.langue === 'ar' ? 'rtl' : 'ltr'}">${echap(c.message)}</p>
      <div class="off-pied"><button type="button" class="btn${compris ? ' btn-primaire' : ''}" data-off-voir><i class="ph-duotone ph-list-checks" aria-hidden="true"></i>${echap(t('off.quoi'))} (${c.actions.length})</button>
        ${compris ? `<p class="off-ok" role="status"><i class="ph-duotone ph-check-circle" aria-hidden="true"></i>${echap(t('off.merci'))}</p>`
          : `<button type="button" class="btn btn-primaire" data-off-compris="${echap(m.id)}"><i class="ph ph-check" aria-hidden="true"></i>${echap(t('off.compris'))}</button>`}</div>
    </article>`;
    return `<article class="off-carte off-${mode}${compris ? ' off-lu' : ''}" aria-labelledby="${id}" data-off="${echap(m.id)}">
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
      ep.hidden = !messages.length;
      ep.innerHTML = messages.length ? `<h2 class="sr-only">${echap(t('off.epingle'))}</h2>` + messages.map(m => carte(m, 'epingle', ep.dataset.mode === 'compact')).join('') : '';
    }
  }

  // Le tiroir s'ouvre tout seul une seule fois par message (et pas pour un message déjà compris)
  function ouvrirUneFois() {
    const ouverts = lireL('officielsOuverts');
    const neufs = messages.filter(m => !estCompris(m) && !ouverts.includes(m.id));
    if (!neufs.length) return;
    ecrireL('officielsOuverts', ouverts.concat(neufs.map(m => m.id)));
    customElements.whenDefined('sl-drawer').then(() => { const d = NT.ui.tiroirAlertes; if (d && !document.querySelector('sl-dialog[open]')) d.show(); });
  }

  function charger() {
    return fetch('/api/officiels', { cache: 'no-store', credentials: 'same-origin' }).then(r => (r.ok ? r.json() : null)).then(j => {
      if (!j) return;
      const avant = JSON.stringify(messages);
      messages = j.messages || [];
      const nouveaux = connus ? messages.filter(m => !connus.has(m.id)) : [];
      connus = new Set(messages.map(m => m.id));
      if (JSON.stringify(messages) !== avant) rendre();
      nouveaux.forEach(m => NT.ui.annoncer(t('off.nouveau', { t: contenu(m).titre })));
      ouvrirUneFois();
    }).catch(() => {});
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
    if (e.target.closest('[data-off-voir]') && NT.ui.tiroirAlertes) NT.ui.tiroirAlertes.show();
  });

  let minuterie = null;
  const planifier = () => { clearTimeout(minuterie); minuterie = setTimeout(() => { if (!document.hidden) charger(); planifier(); }, NT.leger.actif() ? 120000 : NT.econome.delai(30000)); };
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { charger(); planifier(); } });
  NT.officiel = { charger, messages: () => messages.slice() };
  charger(); planifier();
})();
