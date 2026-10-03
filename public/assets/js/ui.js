/* Terra Nova — interface commune : en-tête selon le rôle, fil d'Ariane, bandeau d'alertes,
   notifications, panneau d'accessibilité, contrôle d'accès, utilitaires.
   Attributs du <body> :
     data-page="services"                → entrée de menu active
     data-roles="agent,admin"            → page protégée (D09) ; "connecte" = tout utilisateur connecté
     data-ariane="nav.accueil|index.html;nav.services|services.html;Détail"  → fil d'Ariane (D15)
   Code de page : NT.pret(() => { ... })  — exécuté une fois l'interface prête. */
(function () {
  'use strict';
  const NT = window.NT;
  const t = NT.t;
  NT.i18n.ajouter({
    fr: { 'a11y.leger': 'Mode connexion lente (page allégée)', 'pied.sobriete': 'Sobriété numérique', 'leger.pied': 'Mode connexion lente activé.', 'leger.desactiver': 'Revenir à l’affichage complet',
      'leger.auto': 'Votre connexion semble lente : la page est allégée pour s’afficher plus vite (sans image décorative ni animation). Vous pouvez changer cela dans le menu ♿.' },
    en: { 'a11y.leger': 'Slow connection mode (lighter pages)', 'pied.sobriete': 'Digital sobriety', 'leger.pied': 'Slow connection mode is on.', 'leger.desactiver': 'Back to the full display',
      'leger.auto': 'Your connection seems slow: pages are lightened to load faster (no decorative image or animation). You can change this in the ♿ menu.' },
    es: { 'a11y.leger': 'Modo conexión lenta (páginas ligeras)', 'pied.sobriete': 'Sobriedad digital', 'leger.pied': 'Modo conexión lenta activado.', 'leger.desactiver': 'Volver a la vista completa',
      'leger.auto': 'Su conexión parece lenta: las páginas se aligeran para cargar más rápido (sin imagen decorativa ni animación). Puede cambiarlo en el menú ♿.' },
    ar: { 'a11y.leger': 'وضع الاتصال البطيء (صفحات أخف)', 'pied.sobriete': 'الاعتدال الرقمي', 'leger.pied': 'وضع الاتصال البطيء مفعّل.', 'leger.desactiver': 'العودة إلى العرض الكامل',
      'leger.auto': 'يبدو أن اتصالك بطيء: تم تخفيف الصفحات لتظهر أسرع (بدون صور زخرفية أو حركة). يمكنك تغيير ذلك من قائمة ♿.' }
  });
  const corps = document.body;
  const u = NT.auth.utilisateur();
  const enAttente = NT._attente;
  let pret = false;
  NT.pret = fn => (pret ? fn() : enAttente.push(fn));

  /* ---------- Utilitaires ---------- */
  const echap = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const locale = () => ({ fr: 'fr-FR', en: 'en-GB', es: 'es-ES', ar: 'ar' }[NT.i18n.langue] || 'fr-FR');
  const ui = {
    echap,
    date: (iso, opts) => new Date(iso).toLocaleDateString(locale(), opts || { day: 'numeric', month: 'long', year: 'numeric' }),
    dateHeure: iso => new Date(iso).toLocaleString(locale(), { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
    depuis(iso) {
      const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
      const rtf = new Intl.RelativeTimeFormat(locale(), { numeric: 'auto' });
      if (m < 60) return rtf.format(-m, 'minute');
      if (m < 1440) return rtf.format(-Math.round(m / 60), 'hour');
      return rtf.format(-Math.round(m / 1440), 'day');
    },
    statut: code => `<span class="statut statut-${echap(code)}">${echap(t('statut.' + code, null, NT.STATUTS[code] || code))}</span>`,
    param: nom => new URLSearchParams(location.search).get(nom),
    $: (sel, r) => (r || document).querySelector(sel),
    $$: (sel, r) => Array.from((r || document).querySelectorAll(sel)),
    annoncer(msg) { const z = document.getElementById('nt-annonce'); if (z) { z.textContent = ''; setTimeout(() => (z.textContent = msg), 50); } },
    toast(message, variante, duree) {
      ui.annoncer(message);
      customElements.whenDefined('sl-alert').then(() => {
        const a = Object.assign(document.createElement('sl-alert'), { variant: variante || 'primary', closable: true, duration: duree || 5000 });
        a.innerHTML = `<sl-icon slot="icon" name="${variante === 'danger' ? 'exclamation-octagon' : variante === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></sl-icon>${echap(message)}`;
        document.body.append(a); a.toast();
      });
    },
    /* Astuce contextuelle affichée une seule fois (F35) */
    astuce(conteneur, id, texte) {
      const vues = NT.store.lire('astuces', []);
      if (vues.includes(id) || !conteneur) return;
      const el = document.createElement('div');
      el.className = 'astuce'; el.setAttribute('role', 'note');
      el.innerHTML = `<i class="ph-duotone ph-lightbulb-filament" aria-hidden="true"></i><p>${echap(texte)}</p><button class="btn" type="button">${echap(t('ui.compris'))}</button>`;
      el.querySelector('button').addEventListener('click', () => { NT.store.ecrire('astuces', NT.store.lire('astuces', []).concat(id)); el.remove(); });
      conteneur.prepend(el);
    },
    ariane(segments, interne) {
      const nav = document.getElementById('nt-ariane'); if (!nav) return;
      if (!interne) corps.dataset.arianeDynamique = '1';   // fil posé par la page : ne plus l'écraser
      if (!segments.length) { nav.remove(); return; }
      nav.hidden = segments.length < 2;   // un fil d'un seul élément ne fait que répéter le titre de la page
      nav.innerHTML = `<div class="conteneur"><ol>${segments.map((s, i) => i === segments.length - 1
        ? `<li><span aria-current="page">${echap(s.label)}</span></li>`
        : `<li><a href="${echap(s.href)}">${echap(s.label)}</a></li>`).join('')}</ol></div>`;
      const dernier = segments[segments.length - 1];
      if (dernier && !document.title.includes(dernier.label)) document.title = dernier.label + ' — Terra Nova';
    }
  };
  NT.ui = ui;

  /* ---------- Contrôle d'accès (D09) ---------- */
  const roles = (corps.dataset.roles || '').split(',').map(s => s.trim()).filter(Boolean);
  if (roles.length) {
    if (!u) { location.replace('connexion.html?retour=' + encodeURIComponent(location.pathname.split('/').pop() + location.search)); return; }
    if (!roles.includes('connecte') && !roles.includes(u.role)) {
      sessionStorage.setItem('nt:refus', '1');
      NT.auth.ecrireJournal('acces_refuse', u.email, location.pathname.split('/').pop());
      location.replace(u.role === 'citoyen' ? 'espace.html' : 'agent.html'); return;
    }
  }

  /* ---------- En-tête ---------- */
  const page = corps.dataset.page || '';
  const liens = !u ? [['accueil', 'index.html'], ['services', 'services.html'], ['carte', 'carte.html'], ['annonces', 'annonces.html'], ['transports', 'transports.html']]
    : u.role === 'citoyen' ? [['accueil', 'index.html'], ['services', 'services.html'], ['carte', 'carte.html'], ['annonces', 'annonces.html'], ['soutenir', 'soutenir.html'], ['rdv', 'rendez-vous.html'], ['espace', 'espace.html']]
    : [['agent', 'agent.html'], ['tableau', 'agent-tableau.html'], ['demandesAgent', 'agent-demandes.html'], ['alertes', 'agent-alertes.html'], ['comptes', 'admin-comptes.html'], ['journal', 'agent-journal.html'], ['services', 'services.html']];
  if (u && u.role !== 'citoyen') liens.splice(5, 0, ['accueilAgent', 'agent-accueil.html']);   // vague 13 (F71) : inscription au guichet
  if (u && u.role === 'admin') liens.push(['securite', 'agent-securite.html']);   // vague 13 (F69, F70) : centre de sécurité
  if (u) NT.rdv.verifierRappels();   // avant le compteur de la cloche, pour que les rappels dus soient comptés
  const nbNotif = u ? NT.notif.nonLues(u.id) : 0;
  const optionsLangue = Object.entries(NT.i18n.LANGUES).map(([c, n]) => `<option value="${c}" ${c === NT.i18n.langue ? 'selected' : ''} lang="${c}">${n}</option>`).join('');

  const entete = document.createElement('header');
  entete.className = 'entete';
  entete.innerHTML = `
    <div class="capsule">
      <a class="logo" href="${u && u.role !== 'citoyen' ? 'agent.html' : 'index.html'}"><span class="logo-embleme" aria-hidden="true"></span><span class="logo-mot">Terra&nbsp;Nova</span></a>
      <nav class="nav-principale" aria-label="Navigation principale">
        ${liens.map(([cle, href]) => `<a href="${href}" ${cle === page ? 'aria-current="page"' : ''}>${echap(t('nav.' + cle))}</a>`).join('')}
      </nav>
      <div class="outils-entete">
        <label class="sr-only" for="nt-langue">${echap(t('ui.langue'))}</label>
        <button type="button" class="balise" id="nt-balise" aria-haspopup="dialog"><span class="feu" aria-hidden="true"></span><span class="libelle-balise">${echap(t('ui.alertes'))}</span><span id="nt-balise-nb"></span></button>
        <span class="champ-langue"><i class="ph ph-globe-simple" aria-hidden="true"></i><select id="nt-langue" class="select-langue">${optionsLangue}</select></span>
        <button type="button" class="bouton-rond" id="nt-btn-a11y" title="${echap(t('ui.accessibilite'))}"><i class="ph-duotone ph-person-arms-spread" aria-hidden="true"></i><span class="sr-only">${echap(t('ui.accessibilite'))}</span></button>
        ${u ? `
        <button type="button" class="bouton-rond" id="nt-btn-notif" title="${echap(t('ui.notifications'))}"><i class="ph-duotone ph-bell-simple" aria-hidden="true"></i>
          <span class="sr-only">${echap(t('ui.notifications'))}${nbNotif ? ' (' + nbNotif + ')' : ''}</span>
          ${nbNotif ? `<span class="pastille-compte" aria-hidden="true">${nbNotif}</span>` : ''}</button>
        <sl-dropdown placement="bottom-end">
          <sl-button slot="trigger" caret size="small">${echap(u.prenom)} <span class="badge-role">${echap(t('role.' + u.role))}</span></sl-button>
          <sl-menu>
            <sl-menu-item value="compte">${echap(t('nav.compte'))}</sl-menu-item>
            ${u.role === 'citoyen' ? `<sl-menu-item value="espace">${echap(t('nav.espace'))}</sl-menu-item>` : ''}
            <sl-divider></sl-divider>
            <sl-menu-item value="deconnexion">${echap(t('nav.deconnexion'))}</sl-menu-item>
          </sl-menu>
        </sl-dropdown>` : `
        <a class="btn" href="connexion.html">${echap(t('nav.connexion'))}</a>
        <a class="btn btn-primaire" href="inscription.html">${echap(t('nav.inscription'))}</a>`}
      </div>
    </div>`;

  const evitement = Object.assign(document.createElement('a'), { className: 'evitement', href: '#contenu', textContent: t('ui.evitement') });
  const ariane = Object.assign(document.createElement('nav'), { className: 'ariane', id: 'nt-ariane' });
  ariane.setAttribute('aria-label', t('ui.ariane'));
  const annonce = Object.assign(document.createElement('div'), { id: 'nt-annonce', className: 'sr-only' });
  annonce.setAttribute('aria-live', 'polite');
  corps.prepend(evitement, entete, ariane, annonce);

  /* En-tête sur une ligne tant que tout tient ; sinon deux niveaux nets (marque + outils, puis navigation).
     On mesure le contenu plutôt que de deviner un point de rupture : la longueur varie selon la langue et le profil. */
  const capsule = entete.querySelector('.capsule');
  // fondu au bord tant qu'il reste des liens à faire défiler
  const marquerDebord = () => { const nav = capsule.querySelector('.nav-principale'); nav.classList.toggle('deborde', Math.abs(nav.scrollLeft) + nav.clientWidth < nav.scrollWidth - 1); };
  capsule.querySelector('.nav-principale').addEventListener('scroll', marquerDebord, { passive: true });
  const ajusterEntete = () => {
    const nav = capsule.querySelector('.nav-principale');
    const largeurNav = [...nav.children].reduce((n, a) => n + a.getBoundingClientRect().width, 0) + (nav.children.length - 1) * 2;
    const style = getComputedStyle(capsule);
    const utile = capsule.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const besoin = capsule.querySelector('.logo').getBoundingClientRect().width + largeurNav
      + capsule.querySelector('.outils-entete').getBoundingClientRect().width + 2 * (parseFloat(style.columnGap) || 16) + 24;
    capsule.classList.toggle('deux-niveaux', besoin > utile || document.documentElement.classList.contains('grand'));
    marquerDebord();
  };
  ajusterEntete();
  new ResizeObserver(ajusterEntete).observe(capsule);
  if (document.fonts) document.fonts.ready.then(ajusterEntete);
  customElements.whenDefined('sl-dropdown').then(() => requestAnimationFrame(ajusterEntete));
  NT.ui.ajusterEntete = ajusterEntete;

  /* ---------- Fil d'Ariane depuis data-ariane ---------- */
  const arianeDepuisAttribut = () => ui.ariane(corps.dataset.ariane.split(';').map(seg => { const [label, href] = seg.split('|'); return { label: t(label.trim(), null, label.trim()), href: (href || '').trim() }; }), true);
  if (corps.dataset.ariane) {
    arianeDepuisAttribut();
    // les scripts de page (defer) ajoutent leurs traductions après ui.js : on retraduit une fois tout chargé
    document.addEventListener('DOMContentLoaded', () => { if (!corps.dataset.arianeDynamique) arianeDepuisAttribut(); NT.i18n.appliquer(); });
  } else ariane.remove();

  /* ---------- Bandeau d'alertes (D18, F29, F31) ---------- */
  /* Une balise lumineuse dans l'en-tête : elle pulse tant qu'une alerte est active,
     le clic ouvre le panneau des consignes. Moins invasif qu'un bandeau, toujours visible. */
  const balise = entete.querySelector('#nt-balise');
  const panneauAlertes = document.createElement('sl-drawer');
  panneauAlertes.label = t('ui.alertesTitre');
  corps.append(panneauAlertes);
  function rendreAlertes() {
    const liste = NT.annonces.actives();
    const alerte = liste.some(a => a.importance === 'alerte');
    balise.classList.toggle('active', alerte);
    balise.classList.toggle('importante', !alerte && liste.length > 0);
    balise.querySelector('#nt-balise-nb').textContent = liste.length ? liste.length : '';
    balise.setAttribute('aria-label', liste.length ? t('ui.alertesActives', { n: liste.length }) : t('ui.aucuneAlerte'));
    panneauAlertes.innerHTML = liste.length ? liste.map(a => `
      <article class="alerte-fiche niveau-${a.importance}">
        <h3><i class="ph-duotone ${a.importance === 'alerte' ? 'ph-warning-octagon' : 'ph-megaphone'}" aria-hidden="true"></i>${echap(a.titre)}</h3>
        <div class="zone"><i class="ph ph-map-pin" aria-hidden="true"></i> ${echap(a.zone)} · ${echap(ui.depuis(a.cree))}</div>
        <p style="margin:.6rem 0 0">${echap(a.resume || '')}</p>
        ${a.consignes && a.consignes.length ? `<strong style="display:block;margin-top:.7rem">${echap(t('ui.consignes'))}</strong><ul>${a.consignes.map(c => `<li>${echap(c)}</li>`).join('')}</ul>` : ''}
        ${a.publics && a.publics.length ? `<p class="doux" style="margin:.6rem 0 0">${echap(t('ui.publics'))} : ${a.publics.map(echap).join(', ')}</p>` : ''}
        <a class="btn" style="margin-top:.8rem" href="annonces.html#${echap(a.id)}">${echap(t('ui.detail'))}</a>
      </article>`).join('') : `<p class="vide">${echap(t('ui.aucuneAlerte'))}</p>`;
  }
  balise.addEventListener('click', () => panneauAlertes.show());
  rendreAlertes();
  NT.ui.rafraichirAlertes = rendreAlertes;

  /* Halo lumineux qui suit le pointeur sur les éléments .halo (inspiré SeraUI Spotlight) */
  document.addEventListener('pointermove', e => {
    const el = e.target.closest && e.target.closest('.halo'); if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  /* ---------- Pied de page ---------- */
  const pied = document.createElement('footer');
  pied.className = 'pied';
  pied.innerHTML = `<div class="conteneur"><span>${echap(t('pied.texte'))}</span>
    <span class="ligne"><a href="demande.html">${echap(t('pied.contact'))}</a><a href="aide.html">${echap(t('pied.aide'))}</a><a href="donnees.html">${echap(t('pied.donnees'))}</a><a href="sobriete.html">${echap(t('pied.sobriete'))}</a><a href="securite.html">${echap(t('pied.securite'))}</a><a href="bienvenue.html">${echap(t('pied.bienvenue'))}</a><a href="transports.html">${echap(t('nav.transports'))}</a>
      <a href="#" id="nt-lien-a11y">${echap(t('pied.accessibilite'))}</a><a href="#" id="nt-lien-clavier">${echap(t('clavier.titre'))}</a></span></div>`;
  corps.append(pied);
  /* F59 : le mode connexion lente se voit et se désactive en un clic ; s'il s'est activé tout seul, on le dit une fois */
  const indicateurLeger = document.createElement('span');
  indicateurLeger.className = 'pied-leger';
  pied.querySelector('.conteneur').append(indicateurLeger);
  const rendreLeger = () => {
    const actif = NT.leger.actif();
    indicateurLeger.hidden = !actif;
    indicateurLeger.innerHTML = actif ? `<i class="ph ph-feather" aria-hidden="true"></i>${echap(t('leger.pied'))} <button type="button" class="lien-bouton" id="nt-leger-off">${echap(t('leger.desactiver'))}</button>` : '';
  };
  rendreLeger();
  pied.addEventListener('click', e => { if (e.target.id === 'nt-leger-off') { majPrefs({ leger: false }); const sw = document.getElementById('nt-leger'); if (sw) sw.checked = false; } });
  NT.ui.rendreLeger = rendreLeger;
  if (NT.leger.auto && !NT.store.lire('legerPropose', false)) {
    NT.store.ecrire('legerPropose', true);
    setTimeout(() => ui.toast(t('leger.auto'), 'primary', 10000), 600);
  }

  /* ---------- Panneau d'accessibilité (F21, F23, F24) ---------- */
  const dialogue = document.createElement('sl-dialog');
  dialogue.label = t('a11y.titre');
  const prefs = () => NT.store.lire('prefs', {});
  // contraste (F23), espacement, animations, liens soulignés (F43), lexique des mots difficiles (D13, actif par défaut)
  const OPTIONS = ['contraste', 'espace', 'calme', 'souligne', 'lexique', 'leger'];   // leger : mode connexion lente (F59)
  const valeur = c => (c === 'lexique' ? prefs().lexique !== false : c === 'leger' ? NT.leger.actif() : !!prefs()[c]);
  dialogue.innerHTML = `
    <div class="reglage"><span id="nt-lbl-taille">${echap(t('a11y.taille'))} : <strong id="nt-val-taille">${prefs().taille || 100} %</strong></span>
      <div class="taille-btns" role="group" aria-labelledby="nt-lbl-taille">
        <button class="btn" type="button" data-taille="-1" aria-label="${echap(t('a11y.taille'))} −">A−</button>
        <button class="btn" type="button" data-taille="0">100 %</button>
        <button class="btn" type="button" data-taille="1" aria-label="${echap(t('a11y.taille'))} +" style="font-size:1.2rem">A+</button>
      </div></div>
    ${OPTIONS.map(c => `<div class="reglage"><sl-switch id="nt-${c}" ${valeur(c) ? 'checked' : ''} style="width:100%">${echap(t('a11y.' + c))}</sl-switch></div>`).join('')}
    <p class="doux" style="margin-top:1rem">${echap(t('a11y.aide'))}</p>
    <p style="margin:.5rem 0 0"><a href="#" id="nt-ouvrir-raccourcis">${echap(t('clavier.titre'))}</a></p>
    <sl-button slot="footer" id="nt-a11y-reinit">${echap(t('a11y.reinit'))}</sl-button>
    <sl-button slot="footer" variant="primary" id="nt-a11y-ok">${echap(t('ui.fermer'))}</sl-button>`;
  corps.append(dialogue);
  const PALIERS = [90, 100, 115, 130, 150, 175, 200];
  function majPrefs(patch) {
    const p = Object.assign(prefs(), patch); NT.store.ecrire('prefs', p);
    const h = document.documentElement;
    h.style.fontSize = (p.taille || 100) + '%';
    h.classList.toggle('grand', (p.taille || 100) >= 150);
    ['contraste', 'espace', 'calme', 'souligne'].forEach(c => h.classList.toggle(c, !!p[c]));
    if ('leger' in patch) { h.classList.toggle('leger', !!p.leger); const pol = document.getElementById('nt-polices'); if (pol && !p.leger) pol.media = 'all'; if (NT.ui.rendreLeger) NT.ui.rendreLeger(); if (!p.leger) document.querySelectorAll('img[data-srcset],img[data-src]').forEach(NT.leger.image); }
    dialogue.querySelector('#nt-val-taille').textContent = (p.taille || 100) + ' %';
    if ('lexique' in patch) activerLexique();
    requestAnimationFrame(ajusterEntete);   // la taille du texte change la place disponible dans l'en-tête
  }
  dialogue.addEventListener('click', e => {
    const b = e.target.closest('[data-taille]'); if (!b) return;
    const pas = +b.dataset.taille; const actuel = prefs().taille || 100;
    let i = PALIERS.indexOf(actuel); if (i < 0) i = 1;
    majPrefs({ taille: pas === 0 ? 100 : PALIERS[Math.max(0, Math.min(PALIERS.length - 1, i + pas))] });
    ui.annoncer(t('a11y.taille') + ' ' + (prefs().taille) + ' %');
  });
  OPTIONS.forEach(c => dialogue.querySelector('#nt-' + c).addEventListener('sl-change', e => majPrefs({ [c]: e.target.checked })));
  dialogue.querySelector('#nt-a11y-reinit').addEventListener('click', () => {
    majPrefs({ taille: 100, contraste: false, espace: false, calme: false, souligne: false, lexique: true });
    OPTIONS.forEach(c => (dialogue.querySelector('#nt-' + c).checked = c === 'lexique'));
  });
  dialogue.querySelector('#nt-a11y-ok').addEventListener('click', () => dialogue.hide());
  const ouvrirA11y = e => { e && e.preventDefault(); dialogue.show(); };
  entete.querySelector('#nt-btn-a11y').addEventListener('click', ouvrirA11y);
  pied.querySelector('#nt-lien-a11y').addEventListener('click', ouvrirA11y);
  NT.ui.ouvrirAccessibilite = ouvrirA11y;

  /* ---------- Navigation au clavier (F41) : raccourcis Alt + lettre, aide avec « ? » ---------- */
  const RACCOURCIS = [
    ['Alt + R', 'clavier.recherche', () => { const c = document.querySelector('main input[type="search"], main input[type="text"]'); c ? c.focus() : (location.href = 'services.html'); }],
    ['Alt + A', 'clavier.alertes', () => balise.click()],
    ['Alt + N', 'clavier.notifs', () => { const b = entete.querySelector('#nt-btn-notif'); b ? b.click() : ui.toast(t('clavier.connecte'), 'primary'); }],
    ['Alt + M', 'clavier.menu', () => entete.querySelector('.nav-principale a')?.focus()],
    ['Alt + C', 'clavier.contenu', () => { const m = document.getElementById('contenu'); m.setAttribute('tabindex', '-1'); m.focus(); }],
    ['Alt + V', 'clavier.affichage', () => dialogue.show()],
    ['?', 'clavier.aide', () => dialogueClavier.show()]
  ];
  const dialogueClavier = document.createElement('sl-dialog');
  dialogueClavier.label = t('clavier.titre');
  dialogueClavier.innerHTML = `<p class="doux">${echap(t('clavier.intro'))}</p>
    <table><caption class="sr-only">${echap(t('clavier.titre'))}</caption><thead><tr><th scope="col">${echap(t('clavier.touches'))}</th><th scope="col">${echap(t('clavier.action'))}</th></tr></thead>
    <tbody>${RACCOURCIS.map(([k, cle]) => `<tr><td><kbd style="font-family:var(--titre);font-size:.85rem;padding:.15rem .45rem;border:1px solid var(--trait-2);border-radius:6px">${k}</kbd></td><td>${echap(t(cle))}</td></tr>`).join('')}</tbody></table>`;
  corps.append(dialogueClavier);
  document.addEventListener('keydown', e => {
    const saisie = e.target.closest && e.target.closest('input, textarea, select, [contenteditable="true"]');
    if (e.key === '?' && !saisie && !e.ctrlKey && !e.altKey) { e.preventDefault(); dialogueClavier.show(); return; }
    if (!e.altKey || e.ctrlKey || e.metaKey) return;
    const r = RACCOURCIS.find(([k]) => k === 'Alt + ' + e.key.toUpperCase());
    if (r) { e.preventDefault(); r[2](); }
  });
  const ouvrirClavier = e => { e && e.preventDefault(); dialogue.hide(); dialogueClavier.show(); };
  pied.querySelector('#nt-lien-clavier').addEventListener('click', ouvrirClavier);
  dialogue.querySelector('#nt-ouvrir-raccourcis').addEventListener('click', ouvrirClavier);

  /* ---------- Mots difficiles expliqués (D13) : glossaire.js chargé à la demande ---------- */
  function activerLexique() {
    const actif = prefs().lexique !== false;
    document.querySelectorAll('.terme-glossaire-off').forEach(x => x.classList.remove('terme-glossaire-off'));
    if (!actif) { document.documentElement.classList.add('sans-lexique'); return; }
    document.documentElement.classList.remove('sans-lexique');
    const lancer = () => window.NT_activerGlossaire && window.NT_activerGlossaire(document.getElementById('contenu'));
    if (window.NT_activerGlossaire) return lancer();
    const s = document.createElement('script');
    s.src = 'assets/js/glossaire.js'; s.onload = lancer; s.onerror = () => {};
    document.head.append(s);
  }
  NT.ui.activerLexique = activerLexique;

  /* ---------- Langue ---------- */
  entete.querySelector('#nt-langue').addEventListener('change', e => NT.i18n.changer(e.target.value));

  /* ---------- Compte : menu + notifications (F30, F40) ---------- */
  if (u) {
    entete.querySelector('sl-menu').addEventListener('sl-select', e => {
      const v = e.detail.item.value;
      if (v === 'deconnexion') { NT.auth.deconnecter(); location.href = 'index.html'; }
      else location.href = v + '.html';
    });
    const tiroir = document.createElement('sl-drawer');
    tiroir.label = t('ui.notifications');
    corps.append(tiroir);
    function rendreNotifs() {
      const l = NT.notif.pour(u.id);
      tiroir.innerHTML = (l.length ? `<ul style="list-style:none;margin:0;padding:0">${l.map(n => `
        <li style="padding:.85rem 0;border-bottom:1px solid var(--trait)${n.lu ? ';opacity:.7' : ''}">
          <div class="ligne entre"><strong>${n.lu ? '' : '<span class="sr-only">Non lu : </span>●&nbsp;'}${echap(n.titre)}</strong><span class="doux" style="font-size:.8rem">${echap(ui.depuis(n.cree))}</span></div>
          <p style="margin:.3rem 0">${echap(n.texte)}</p>
          ${n.lien ? `<a href="${echap(n.lien)}" data-lu="${n.id}">${echap(t('ui.voir'))} →</a>` : ''}
        </li>`).join('')}</ul>` : `<p class="vide">${echap(t('ui.aucuneNotif'))}</p>`) +
        `<sl-button slot="footer" id="nt-tout-lu">${echap(t('ui.toutLu'))}</sl-button>`;
      tiroir.querySelector('#nt-tout-lu').addEventListener('click', () => { NT.notif.toutLire(u.id); rendreNotifs(); majCloche(); });
    }
    function majCloche() { const b = entete.querySelector('.pastille-compte'); if (b && !NT.notif.nonLues(u.id)) b.remove(); }
    tiroir.addEventListener('click', e => { const id = e.target.closest('[data-lu]')?.dataset.lu; if (id) NT.notif.lire(id); });
    entete.querySelector('#nt-btn-notif').addEventListener('click', () => { rendreNotifs(); tiroir.show(); });
    // Notifications importantes non encore présentées : toast immédiat
    const presentees = NT.store.lire('notifPresentees', []);
    const nouvelles = NT.notif.pour(u.id).filter(n => !n.lu && n.niveau !== 'info' && !presentees.includes(n.id));
    nouvelles.slice(0, 2).forEach(n => ui.toast(n.titre, n.niveau === 'alerte' ? 'danger' : 'warning', 8000));
    NT.store.ecrire('notifPresentees', presentees.concat(nouvelles.map(n => n.id)).slice(-200));

    /* F49 : information « au bon moment » — toutes les 30 s, les nouvelles notifications (changement d'état d'une demande,
       alerte diffusée, rappel…) apparaissent sans recharger la page : toast + cloche mise à jour. */
    let connues = new Set(NT.notif.pour(u.id).map(n => n.id));
    // toutes les 30 s, toutes les 2 min en mode connexion lente ; rien tant que l'onglet est caché
    let minuterie = null;
    const planifier = () => { clearTimeout(minuterie); minuterie = setTimeout(() => { verifier(); planifier(); }, NT.leger.actif() ? 120000 : 30000); };
    document.addEventListener('visibilitychange', () => { if (!document.hidden) { verifier(); planifier(); } });
    planifier();
    function verifier() {
      if (document.hidden) return;
      fetch('/api/etat', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(e => {
        if (!e || !e.moi) return;
        const neuves = (e.notifications || []).filter(n => !connues.has(n.id));
        if (!neuves.length) return;
        NT.recharger();
        neuves.forEach(n => { connues.add(n.id); ui.toast(n.titre + (n.texte ? ' — ' + n.texte : ''), n.niveau === 'alerte' ? 'danger' : n.niveau === 'importante' ? 'warning' : 'primary', 10000); });
        NT.store.ecrire('notifPresentees', NT.store.lire('notifPresentees', []).concat(neuves.map(n => n.id)).slice(-200));
        const nb = NT.notif.nonLues(u.id); let b = entete.querySelector('.pastille-compte');
        if (!b && nb) { b = document.createElement('span'); b.className = 'pastille-compte'; b.setAttribute('aria-hidden', 'true'); entete.querySelector('#nt-btn-notif').append(b); }
        if (b) b.textContent = nb;
        NT.ui.rafraichirAlertes && NT.ui.rafraichirAlertes();
      }).catch(() => {});
    }
  }
  if (sessionStorage.getItem('nt:refus')) { sessionStorage.removeItem('nt:refus'); ui.toast(t('garde.texte'), 'warning', 7000); }
  if (sessionStorage.getItem('nt:compteSupprime')) {
    sessionStorage.removeItem('nt:compteSupprime');
    ui.toast(t('compte.supprime', null, 'Votre compte a été supprimé. Vos données personnelles ont été effacées.'), 'success', 9000);
  }

  /* ---------- Démarrage ---------- */
  NT.i18n.appliquer();
  corps.classList.add('pret');
  pret = true;
  enAttente.forEach(fn => fn());
  // après le code de page (contenu dynamique rendu) : lexique des mots difficiles
  setTimeout(activerLexique, 300);
})();
