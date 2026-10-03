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
  /* Vague 11 : appareil peu puissant (F61), version simple (F62), état des services en trois niveaux (F63, F64) */
  NT.i18n.ajouter({
    fr: { 'a11y.econome': 'Mode appareil peu puissant (plus fluide, moins d’effets)',
      'econome.auto': 'Votre appareil semble peu puissant : les effets visuels sont réduits pour que tout reste fluide. Toutes les informations et actions restent là. Vous pouvez changer cela dans le menu ♿.',
      'econome.mesure': 'Cet appareil : {coeurs} cœurs, mémoire {mem}. Page prête en {ms} ms ; {n} blocage(s) de plus de 50 ms ({total} ms au total).',
      'econome.inconnu': 'non communiquée', 'econome.go': '{n} Go',
      'pied.simple': 'Version simple', 'a11y.simple': 'Version simple et rapide des pages essentielles',
      'es.disponible': 'Disponible', 'es.perturbe': 'Perturbé', 'es.indisponible': 'Indisponible',
      'es.t.disponible': 'Service disponible : vous pouvez commencer votre démarche.',
      'es.t.perturbe': 'Service perturbé : il fonctionne en partie pour le moment.',
      'es.t.indisponible': 'Service indisponible : la ville a suspendu les démarches en ligne de ce service.',
      'es.pourquoi': 'Pourquoi', 'es.retour': 'Retour prévu', 'es.retourInconnu': 'Date de retour non communiquée : cette page se met à jour dès la réouverture.',
      'es.prochaine': 'Prochaine action possible', 'es.ecrire': 'Écrire au service',
      'es.alt.telephone': 'Appeler le {v}', 'es.alt.en-ligne': 'Utiliser l’autre canal', 'es.alt.guichet': 'Voir les guichets sur la carte',
      'es.altDefaut': 'Écrivez au service : votre message sera traité dès que possible.' },
    en: { 'a11y.econome': 'Low-power device mode (smoother, fewer effects)',
      'econome.auto': 'Your device seems to have limited power: visual effects are reduced so everything stays smooth. All information and actions remain. You can change this in the ♿ menu.',
      'econome.mesure': 'This device: {coeurs} cores, memory {mem}. Page ready in {ms} ms; {n} freeze(s) longer than 50 ms ({total} ms in total).',
      'econome.inconnu': 'not reported', 'econome.go': '{n} GB',
      'pied.simple': 'Simple version', 'a11y.simple': 'Simple, fast version of the essential pages',
      'es.disponible': 'Available', 'es.perturbe': 'Disrupted', 'es.indisponible': 'Unavailable',
      'es.t.disponible': 'Service available: you can start your procedure.',
      'es.t.perturbe': 'Service disrupted: it is only partly working for now.',
      'es.t.indisponible': 'Service unavailable: the city has suspended this service’s online procedures.',
      'es.pourquoi': 'Why', 'es.retour': 'Expected return', 'es.retourInconnu': 'No return date announced: this page updates as soon as it reopens.',
      'es.prochaine': 'Next possible action', 'es.ecrire': 'Write to the service',
      'es.alt.telephone': 'Call {v}', 'es.alt.en-ligne': 'Use the other channel', 'es.alt.guichet': 'See the counters on the map',
      'es.altDefaut': 'Write to the service: your message will be handled as soon as possible.' },
    es: { 'a11y.econome': 'Modo dispositivo poco potente (más fluido, menos efectos)',
      'econome.auto': 'Su dispositivo parece poco potente: los efectos visuales se reducen para que todo siga fluido. Toda la información y las acciones siguen disponibles. Puede cambiarlo en el menú ♿.',
      'econome.mesure': 'Este dispositivo: {coeurs} núcleos, memoria {mem}. Página lista en {ms} ms; {n} bloqueo(s) de más de 50 ms ({total} ms en total).',
      'econome.inconnu': 'no indicada', 'econome.go': '{n} GB',
      'pied.simple': 'Versión sencilla', 'a11y.simple': 'Versión sencilla y rápida de las páginas esenciales',
      'es.disponible': 'Disponible', 'es.perturbe': 'Con incidencias', 'es.indisponible': 'No disponible',
      'es.t.disponible': 'Servicio disponible: puede empezar su trámite.',
      'es.t.perturbe': 'Servicio con incidencias: por ahora funciona solo en parte.',
      'es.t.indisponible': 'Servicio no disponible: el ayuntamiento ha suspendido los trámites en línea de este servicio.',
      'es.pourquoi': 'Por qué', 'es.retour': 'Vuelta prevista', 'es.retourInconnu': 'Fecha de vuelta no comunicada: esta página se actualiza en cuanto reabra.',
      'es.prochaine': 'Próxima acción posible', 'es.ecrire': 'Escribir al servicio',
      'es.alt.telephone': 'Llamar al {v}', 'es.alt.en-ligne': 'Usar el otro canal', 'es.alt.guichet': 'Ver las ventanillas en el mapa',
      'es.altDefaut': 'Escriba al servicio: su mensaje se tratará lo antes posible.' },
    ar: { 'a11y.econome': 'وضع الجهاز محدود القدرة (أكثر سلاسة، مؤثرات أقل)',
      'econome.auto': 'يبدو أن جهازك محدود القدرة: تم تقليل المؤثرات البصرية ليبقى كل شيء سلساً. كل المعلومات والإجراءات تبقى متاحة. يمكنك تغيير ذلك من قائمة ♿.',
      'econome.mesure': 'هذا الجهاز: {coeurs} أنوية، الذاكرة {mem}. الصفحة جاهزة في {ms} ميلي ثانية؛ {n} توقف أطول من 50 ميلي ثانية ({total} ميلي ثانية إجمالاً).',
      'econome.inconnu': 'غير معروفة', 'econome.go': '{n} غيغابايت',
      'pied.simple': 'النسخة المبسطة', 'a11y.simple': 'نسخة مبسطة وسريعة من الصفحات الأساسية',
      'es.disponible': 'متاحة', 'es.perturbe': 'مضطربة', 'es.indisponible': 'غير متاحة',
      'es.t.disponible': 'الخدمة متاحة: يمكنك بدء إجرائك.',
      'es.t.perturbe': 'الخدمة مضطربة: تعمل جزئياً في الوقت الحالي.',
      'es.t.indisponible': 'الخدمة غير متاحة: علّقت المدينة الإجراءات الإلكترونية لهذه الخدمة.',
      'es.pourquoi': 'السبب', 'es.retour': 'العودة المتوقعة', 'es.retourInconnu': 'لم يُعلن تاريخ العودة: تتحدث هذه الصفحة فور إعادة الفتح.',
      'es.prochaine': 'الإجراء الممكن التالي', 'es.ecrire': 'مراسلة الخدمة',
      'es.alt.telephone': 'اتصل بالرقم {v}', 'es.alt.en-ligne': 'استعمل القناة الأخرى', 'es.alt.guichet': 'عرض الشبابيك على الخريطة',
      'es.altDefaut': 'راسل الخدمة: ستتم معالجة رسالتك في أقرب وقت.' }
  });
  /* Vague 15 (F77, F78) : forte affluence, serveur injoignable, page « État de la plateforme » */
  NT.i18n.ajouter({
    fr: { 'nav.plateforme': 'Plateforme', 'secours.titre': 'Le serveur ne répond pas pour le moment', 'secours.texte': 'Votre espace revient dès que possible. Rien n’est perdu : vos brouillons restent sur cet appareil. L’essentiel en attendant :',
      'secours.urgences': 'Urgences : SAMU 15 · numéro européen 112', 'secours.alertes': 'Dernières alertes connues', 'secours.aucune': 'Aucune alerte en cours lors de la dernière connexion.', 'secours.date': 'Informations enregistrées le {d}.',
      'secours.simple': 'Version simple et rapide', 'secours.reessayer': 'Réessayer', 'secours.accueil': 'Accueil' },
    en: { 'nav.plateforme': 'Platform', 'secours.titre': 'The server is not responding right now', 'secours.texte': 'Your space will be back as soon as possible. Nothing is lost: your drafts stay on this device. The essentials meanwhile:',
      'secours.urgences': 'Emergencies: ambulance 15 · European number 112', 'secours.alertes': 'Last known alerts', 'secours.aucune': 'No alert in progress at the last connection.', 'secours.date': 'Information saved on {d}.',
      'secours.simple': 'Simple, fast version', 'secours.reessayer': 'Try again', 'secours.accueil': 'Home' },
    es: { 'nav.plateforme': 'Plataforma', 'secours.titre': 'El servidor no responde por ahora', 'secours.texte': 'Su espacio volverá lo antes posible. No se pierde nada: sus borradores quedan en este dispositivo. Lo esencial mientras tanto:',
      'secours.urgences': 'Urgencias: SAMU 15 · número europeo 112', 'secours.alertes': 'Últimas alertas conocidas', 'secours.aucune': 'Ninguna alerta en curso en la última conexión.', 'secours.date': 'Información guardada el {d}.',
      'secours.simple': 'Versión sencilla y rápida', 'secours.reessayer': 'Reintentar', 'secours.accueil': 'Inicio' },
    ar: { 'nav.plateforme': 'المنصة', 'secours.titre': 'الخادم لا يستجيب حالياً', 'secours.texte': 'سيعود فضاؤك في أقرب وقت. لن يضيع شيء: تبقى مسوداتك على هذا الجهاز. الأساسي في الأثناء:',
      'secours.urgences': 'الطوارئ: الإسعاف 15 · الرقم الأوروبي 112', 'secours.alertes': 'آخر التنبيهات المعروفة', 'secours.aucune': 'لا يوجد تنبيه جارٍ عند آخر اتصال.', 'secours.date': 'معلومات محفوظة بتاريخ {d}.',
      'secours.simple': 'النسخة المبسطة والسريعة', 'secours.reessayer': 'إعادة المحاولة', 'secours.accueil': 'الرئيسية' }
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

  /* ---------- F63 / F64 : état d'un service compris par tous, en trois niveaux ----------
     ok → Disponible · maintenance / incident (agents) → Perturbé · desactive (administrateur) → Indisponible.
     Toujours accompagné de la prochaine action possible. */
  const ICONE_NIVEAU = { disponible: 'ph-check-circle', perturbe: 'ph-warning', indisponible: 'ph-prohibit' };
  ui.etatService = s => {
    const e = (s && s.etat) || { code: 'ok' };
    const niveau = e.code === 'ok' ? 'disponible' : e.code === 'desactive' ? 'indisponible' : 'perturbe';
    return { niveau, code: e.code, message: e.message || '', retour: e.retour || '', alternative: e.alternative || null, demarchePossible: niveau !== 'indisponible' };
  };
  ui.niveauBadge = s => { const n = ui.etatService(s).niveau; return `<span class="niveau-svc niveau-svc-${n}"><i class="ph ${ICONE_NIVEAU[n]}" aria-hidden="true"></i>${echap(t('es.' + n))}</span>`; };
  // Boutons de la prochaine action possible quand le service est indisponible (canal de remplacement + écrire au service)
  ui.actionsService = s => {
    const a = ui.etatService(s).alternative || {};
    const v = String(a.valeur || '').trim();
    let principal = '';
    if (a.type === 'telephone' && v) principal = `<a class="btn btn-primaire" href="tel:${echap(v.replace(/[^\d+]/g, ''))}"><i class="ph ph-phone" aria-hidden="true"></i>${echap(t('es.alt.telephone', { v }))}</a>`;
    else if (a.type === 'en-ligne' && /^(?:[a-z0-9-]+\.html|\/)[^\s"'<>]*$/i.test(v)) principal = `<a class="btn btn-primaire" href="${echap(v)}"><i class="ph ph-arrow-square-out" aria-hidden="true"></i>${echap(t('es.alt.en-ligne'))}</a>`;
    else if (a.type === 'guichet') principal = `<a class="btn btn-primaire" href="carte.html"><i class="ph ph-map-pin" aria-hidden="true"></i>${echap(t('es.alt.guichet'))}</a>`;
    return principal + `<a class="btn${principal ? '' : ' btn-primaire'}" href="demande.html?type=contact&amp;service=${encodeURIComponent(s.id)}"><i class="ph ph-envelope-simple" aria-hidden="true"></i>${echap(t('es.ecrire'))}</a>`;
  };
  /* Encadré d'état à placer AVANT toute démarche. opts.siDisponible : l'afficher aussi quand tout va bien ;
     opts.actions : boutons de la prochaine action quand le service est indisponible. */
  ui.encartService = (s, opts) => {
    const o = opts || {}, e = ui.etatService(s);
    if (!s || (e.niveau === 'disponible' && !o.siDisponible)) return '';
    const alt = e.alternative && e.alternative.texte ? e.alternative.texte : (e.niveau === 'indisponible' ? t('es.altDefaut') : '');
    return `<div class="etat-svc etat-svc-${e.niveau}" role="group" aria-label="${echap(t('es.' + e.niveau))}">
      <i class="ph-duotone ${ICONE_NIVEAU[e.niveau]}" aria-hidden="true"></i>
      <div><p class="etat-svc-titre">${echap(t('es.t.' + e.niveau))}</p>
        ${e.niveau === 'disponible' ? '' : `<dl>
          ${e.message ? `<div><dt>${echap(t('es.pourquoi'))}</dt><dd>${echap(e.message)}</dd></div>` : ''}
          <div><dt>${echap(t('es.retour'))}</dt><dd>${echap(e.retour || t('es.retourInconnu'))}</dd></div>
          ${alt ? `<div><dt>${echap(t('es.prochaine'))}</dt><dd>${echap(alt)}</dd></div>` : ''}
        </dl>`}
        ${o.actions && e.niveau === 'indisponible' ? `<div class="etat-svc-actions">${ui.actionsService(s)}</div>` : ''}</div>
    </div>`;
  };
  // F62 : adresse de la version simple de la page courante, dans la langue choisie
  ui.lienSimple = () => {
    const p = location.pathname.split('/').pop() || 'index.html';
    const id = new URLSearchParams(location.search).get('id');
    const svc = decodeURIComponent(location.hash.replace(/^#/, ''));
    const chemin = p === 'services.html' ? (svc && NT.services.get(svc) ? '/simple/services/' + encodeURIComponent(svc) : '/simple/services')
      : p === 'suivi.html' ? '/simple/suivi' + (id ? '?id=' + encodeURIComponent(id) : '') : '/simple';
    return chemin + (chemin.includes('?') ? '&' : '?') + 'lang=' + NT.i18n.langue;
  };

  /* ---------- Contrôle d'accès (D09) ---------- */
  const roles = (corps.dataset.roles || '').split(',').map(s => s.trim()).filter(Boolean);
  /* F77, F78 : serveur injoignable sur une page réservée → page de secours (urgences, dernières alertes connues, version simple)
     au lieu d'une redirection vers la connexion qui échouerait aussi */
  function pageSecours() {
    const main = document.getElementById('contenu') || corps;
    const alertes = NT.annonces.toutes().filter(a => a.active && a.importance !== 'info').slice(0, 4);
    main.innerHTML = `<section class="panneau secours" aria-labelledby="secours-h">
      <h1 id="secours-h">${echap(t('secours.titre'))}</h1>
      <p>${echap(t('secours.texte'))}</p>
      <p><a class="btn btn-primaire" href="tel:15"><i class="ph ph-phone" aria-hidden="true"></i>${echap(t('secours.urgences'))}</a></p>
      <h2>${echap(t('secours.alertes'))}</h2>
      ${alertes.length ? `<ul>${alertes.map(a => `<li><strong>${echap(a.titre)}</strong> — ${echap(a.zone || '')}${a.resume ? '<br>' + echap(a.resume) : ''}</li>`).join('')}</ul>` : `<p class="doux">${echap(t('secours.aucune'))}</p>`}
      ${NT.horsLigne && NT.horsLigne.depuis ? `<p class="doux">${echap(t('secours.date', { d: ui.dateHeure(NT.horsLigne.depuis) }))}</p>` : ''}
      <p class="ligne"><button type="button" class="btn" id="secours-reessayer"><i class="ph ph-arrow-clockwise" aria-hidden="true"></i>${echap(t('secours.reessayer'))}</button>
        <a class="btn" href="/simple?lang=${echap(NT.i18n.langue)}"><i class="ph ph-article" aria-hidden="true"></i>${echap(t('secours.simple'))}</a>
        <a class="btn" href="index.html">${echap(t('secours.accueil'))}</a></p></section>`;
    main.querySelector('#secours-reessayer').addEventListener('click', () => location.reload());
    corps.classList.add('pret');
  }
  if (roles.length) {
    if (!u && NT.horsLigne) { pageSecours(); return; }
    if (!u) { location.replace('connexion.html?retour=' + encodeURIComponent(location.pathname.split('/').pop() + location.search)); return; }
    if (!roles.includes('connecte') && !roles.includes(u.role)) {
      sessionStorage.setItem('nt:refus', '1');
      NT.auth.ecrireJournal('acces_refuse', u.email, location.pathname.split('/').pop());
      location.replace(u.role === 'citoyen' ? 'espace.html' : 'agent.html'); return;
    }
  }

  /* ---------- En-tête ---------- */
  const page = corps.dataset.page || '';
  const liens = !u ? [['accueil', 'index.html'], ['services', 'services.html'], ['carte', 'carte.html'], ['annonces', 'annonces.html'], ['participer', 'participer.html'], ['transports', 'transports.html']]
    : u.role === 'citoyen' ? [['accueil', 'index.html'], ['services', 'services.html'], ['carte', 'carte.html'], ['annonces', 'annonces.html'], ['soutenir', 'soutenir.html'], ['participer', 'participer.html'], ['rdv', 'rendez-vous.html'], ['espace', 'espace.html']]
    : [['agent', 'agent.html'], ['tableau', 'agent-tableau.html'], ['demandesAgent', 'agent-demandes.html'], ['alertes', 'agent-alertes.html'], ['comptes', 'admin-comptes.html'], ['journal', 'agent-journal.html'], ['participer', 'participer.html'], ['services', 'services.html']];
  if (u && u.role !== 'citoyen') liens.splice(5, 0, ['accueilAgent', 'agent-accueil.html']);   // vague 13 (F71) : inscription au guichet
  if (u && u.role === 'admin') liens.push(['securite', 'agent-securite.html']);   // vague 13 (F69, F70) : centre de sécurité
  if (u && u.role === 'admin') liens.push(['plateforme', 'agent-plateforme.html']);   // vague 15 (F77, F78) : état de la plateforme
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
    // F73 : messages officiels du Haut Conseil (assets/js/officiel.js) en tête du tiroir, la balise les met en évidence
    const off = NT.ui.officiels ? NT.ui.officiels() : { n: 0, nonLus: 0, html: '' };
    const total = liste.length + off.n;
    const alerte = liste.some(a => a.importance === 'alerte');
    // F77, F78 : forte affluence ou serveur injoignable — carte calme en tête du tiroir, balise discrète (resilience.js)
    const carteCharge = NT.ui.carteCharge ? NT.ui.carteCharge() : '';
    balise.classList.toggle('charge', !!carteCharge);
    balise.classList.toggle('active', alerte);
    balise.classList.toggle('importante', !alerte && liste.length > 0);
    balise.classList.toggle('officiel', off.nonLus > 0);
    balise.querySelector('#nt-balise-nb').textContent = total ? total : '';
    balise.setAttribute('aria-label', total ? t('ui.alertesActives', { n: total }) + (off.nonLus ? ' · ' + t('off.baliseNonLu', null, 'message officiel à lire') : '') : t('ui.aucuneAlerte'));
    panneauAlertes.innerHTML = carteCharge + off.html + (liste.length ? liste.map(a => `
      <article class="alerte-fiche niveau-${a.importance}">
        <h3><i class="ph-duotone ${a.importance === 'alerte' ? 'ph-warning-octagon' : 'ph-megaphone'}" aria-hidden="true"></i>${echap(a.titre)}</h3>
        <div class="zone"><i class="ph ph-map-pin" aria-hidden="true"></i> ${echap(a.zone)} · ${echap(ui.depuis(a.cree))}</div>
        <p style="margin:.6rem 0 0">${echap(a.resume || '')}</p>
        ${a.consignes && a.consignes.length ? `<strong style="display:block;margin-top:.7rem">${echap(t('ui.consignes'))}</strong><ul>${a.consignes.map(c => `<li>${echap(c)}</li>`).join('')}</ul>` : ''}
        ${a.publics && a.publics.length ? `<p class="doux" style="margin:.6rem 0 0">${echap(t('ui.publics'))} : ${a.publics.map(echap).join(', ')}</p>` : ''}
        <a class="btn" style="margin-top:.8rem" href="annonces.html#${echap(a.id)}">${echap(t('ui.detail'))}</a>
      </article>`).join('') : (off.n || carteCharge ? '' : `<p class="vide">${echap(t('ui.aucuneAlerte'))}</p>`));
  }
  balise.addEventListener('click', () => panneauAlertes.show());
  rendreAlertes();
  NT.ui.rafraichirAlertes = rendreAlertes;
  NT.ui.tiroirAlertes = panneauAlertes;

  /* Halo lumineux qui suit le pointeur sur les éléments .halo (inspiré SeraUI Spotlight) */
  document.addEventListener('pointermove', e => {
    if (NT.econome.actif()) return;   // F61 : aucun calcul au survol sur appareil peu puissant
    const el = e.target.closest && e.target.closest('.halo'); if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  /* ---------- Pied de page ---------- */
  const pied = document.createElement('footer');
  pied.className = 'pied';
  pied.innerHTML = `<div class="conteneur"><span>${echap(t('pied.texte'))}</span>
    <span class="ligne"><a href="demande.html">${echap(t('pied.contact'))}</a><a href="aide.html">${echap(t('pied.aide'))}</a><a href="donnees.html">${echap(t('pied.donnees'))}</a><a href="sobriete.html">${echap(t('pied.sobriete'))}</a><a href="${echap(ui.lienSimple())}" class="pied-simple" id="nt-lien-simple"><i class="ph ph-article" aria-hidden="true"></i>${echap(t('pied.simple'))}</a><a href="securite.html">${echap(t('pied.securite'))}</a><a href="bienvenue.html">${echap(t('pied.bienvenue'))}</a><a href="transports.html">${echap(t('nav.transports'))}</a>
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
  } else if (NT.econome.auto && !NT.store.lire('economePropose', false)) {
    // F61 : proposé une seule fois, sans bandeau ; l'interrupteur reste dans le panneau ♿
    NT.store.ecrire('economePropose', true);
    setTimeout(() => ui.toast(t('econome.auto'), 'primary', 10000), 600);
  }
  // le lien « Version simple » suit la page et le service ouverts
  window.addEventListener('hashchange', () => { const a = document.getElementById('nt-lien-simple'); if (a) a.href = ui.lienSimple(); });

  /* ---------- Panneau d'accessibilité (F21, F23, F24) ---------- */
  const dialogue = document.createElement('sl-dialog');
  dialogue.label = t('a11y.titre');
  const prefs = () => NT.store.lire('prefs', {});
  // contraste (F23), espacement, animations, liens soulignés (F43), lexique des mots difficiles (D13, actif par défaut)
  const OPTIONS = ['contraste', 'espace', 'calme', 'souligne', 'lexique', 'leger', 'econome'];   // leger : connexion lente (F59) ; econome : appareil peu puissant (F61)
  const valeur = c => (c === 'lexique' ? prefs().lexique !== false : c === 'leger' ? NT.leger.actif() : c === 'econome' ? NT.econome.actif() : !!prefs()[c]);
  dialogue.innerHTML = `
    <div class="reglage"><span id="nt-lbl-taille">${echap(t('a11y.taille'))} : <strong id="nt-val-taille">${prefs().taille || 100} %</strong></span>
      <div class="taille-btns" role="group" aria-labelledby="nt-lbl-taille">
        <button class="btn" type="button" data-taille="-1" aria-label="${echap(t('a11y.taille'))} −">A−</button>
        <button class="btn" type="button" data-taille="0">100 %</button>
        <button class="btn" type="button" data-taille="1" aria-label="${echap(t('a11y.taille'))} +" style="font-size:1.2rem">A+</button>
      </div></div>
    ${OPTIONS.map(c => `<div class="reglage"${c === 'econome' ? ' style="flex-wrap:wrap"' : ''}><sl-switch id="nt-${c}" ${valeur(c) ? 'checked' : ''} style="width:100%">${echap(t('a11y.' + c))}</sl-switch>${c === 'econome' ? '<p class="a11y-mesure" id="nt-econome-mesure"></p>' : ''}</div>`).join('')}
    <p style="margin:.9rem 0 0"><a href="${echap(ui.lienSimple())}" id="nt-a11y-simple"><i class="ph ph-article" aria-hidden="true"></i> ${echap(t('a11y.simple'))}</a></p>
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
    if ('econome' in patch) h.classList.toggle('econome', !!p.econome);
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
  /* F61 : mesure concrète affichée sous l'interrupteur — capacités de l'appareil, temps de préparation de la page,
     blocages de plus de 50 ms (tâches longues) depuis l'ouverture de la page */
  let pretEnMs = 0;
  function afficherMesure() {
    const z = dialogue.querySelector('#nt-econome-mesure'); if (!z) return;
    const tc = NT.econome.taches;
    z.textContent = t('econome.mesure', { coeurs: NT.econome.coeurs || '?', mem: NT.econome.memoire ? t('econome.go', { n: NT.econome.memoire }) : t('econome.inconnu'),
      ms: Math.round(pretEnMs || performance.now()), n: tc ? tc.n : '?', total: tc ? Math.round(tc.ms) : '?' });
  }
  const ouvrirA11y = e => { e && e.preventDefault(); afficherMesure(); const a = dialogue.querySelector('#nt-a11y-simple'); if (a) a.href = ui.lienSimple(); dialogue.show(); };
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
    ['Alt + V', 'clavier.affichage', () => ouvrirA11y()],
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
    const planifier = () => { clearTimeout(minuterie); minuterie = setTimeout(() => { verifier(); planifier(); }, NT.leger.actif() ? 120000 : NT.econome.delai(30000)); };
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
  // F61 : sur appareil peu puissant, ce script non essentiel attend que l'appareil soit libre
  if (NT.econome.actif() && window.requestIdleCallback) requestIdleCallback(activerLexique, { timeout: 4000 }); else setTimeout(activerLexique, 300);
  pretEnMs = performance.now();
  // F73 : message officiel du Haut Conseil, sur toutes les pages, mis à jour en direct (même rythme que les notifications F49)
  const scriptOfficiel = document.createElement('script');
  scriptOfficiel.src = 'assets/js/officiel.js';
  document.head.append(scriptOfficiel);
  // F77, F78 : tenue en charge côté navigateur (état de charge, brouillons, nouveaux essais, copie hors connexion)
  const scriptResilience = document.createElement('script');
  scriptResilience.src = 'assets/js/resilience.js';
  document.head.append(scriptResilience);
})();
