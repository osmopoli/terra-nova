/* Terra Nova — vague 20 (F97-F100), chargé par ui.js sur toutes les pages, après l'en-tête.
   - F97 : lignes interrompues dans le tiroir « Alertes » (et lignes suivies mises en avant), lignes coupées sur la carte ;
   - F98 : balise anonyme d'usage (fiche d'un service ouverte, étapes d'une démarche) — aucun cookie, aucun identifiant ;
   - F99 : offres des partenaires sur la page des services, lien « Espace partenaire » pour un compte partenaire ;
   - F100 : menu des agents « Sécurité » avec le nombre d'événements non vus, « Mobilité », « Usage », « Partenaires ».
   Lit GET /api/vague20/resume (léger) au chargement puis toutes les 60 s, en pause quand l'onglet est caché. */
(function () {
  'use strict';
  const NT = window.NT;
  if (!NT || !NT.ui || NT.v20) return;
  NT.v20 = true;

  NT.i18n.ajouter({
    fr: { 'nav.mobiliteAgent': 'Mobilité', 'nav.usage': 'Usage', 'nav.partenairesAgent': 'Partenaires', 'nav.evenements': 'Sécurité', 'nav.espacePartenaire': 'Espace partenaire',
      'v20.nonVus': '{n} événement(s) de sécurité non vu(s)', 'v20.aVerifier': '{n} offre(s) à vérifier',
      'v20.dTitre': 'Transports : lignes interrompues ({n})', 'v20.dSuivie': 'Ligne suivie', 'v20.dMeilleure': 'Meilleure solution : {s}', 'v20.dVoir': 'Solutions et itinéraire',
      'v20.s.relais': 'remplacement en place', 'v20.s.autres-lignes': 'ligne(s) {l}', 'v20.s.marche': 'à pied', 'v20.s.velo': 'vélo en libre-service', 'v20.s.tad': 'transport à la demande',
      'v20.perte0': 'aussi rapide', 'v20.perte': '+{n} min',
      'v20.offresTitre': 'Offres des partenaires', 'v20.offresD': 'Des structures partenaires proposent aussi leurs services. Chaque offre est vérifiée par la ville.', 'v20.offresTout': 'Voir toutes les offres ({n})',
      'v20.carteTitre': 'Lignes interrompues en ce moment', 'v20.carteVoir': 'Solutions de remplacement', 'v20.pied': 'Offres des partenaires',
      'v20.donnees': 'Comptage anonyme de l’usage des services : seulement des totaux (par service, jour, heure et quartier), sans cookie, sans identifiant ni adresse IP conservée, pour améliorer les services.',
      'or.a.offre': 'Voir l’offre' },
    en: { 'nav.mobiliteAgent': 'Mobility', 'nav.usage': 'Usage', 'nav.partenairesAgent': 'Partners', 'nav.evenements': 'Security', 'nav.espacePartenaire': 'Partner area',
      'v20.nonVus': '{n} unseen security event(s)', 'v20.aVerifier': '{n} offer(s) to check',
      'v20.dTitre': 'Transport: interrupted lines ({n})', 'v20.dSuivie': 'Line you follow', 'v20.dMeilleure': 'Best option: {s}', 'v20.dVoir': 'Options and route',
      'v20.s.relais': 'replacement service running', 'v20.s.autres-lignes': 'line(s) {l}', 'v20.s.marche': 'on foot', 'v20.s.velo': 'self-service bike', 'v20.s.tad': 'on-demand transport',
      'v20.perte0': 'just as fast', 'v20.perte': '+{n} min',
      'v20.offresTitre': 'Partner offers', 'v20.offresD': 'Partner organisations also offer their services. Every offer is checked by the city.', 'v20.offresTout': 'See all offers ({n})',
      'v20.carteTitre': 'Lines interrupted right now', 'v20.carteVoir': 'Replacement options', 'v20.pied': 'Partner offers',
      'v20.donnees': 'Anonymous count of service use: totals only (per service, day, hour and district), no cookie, no identifier, no stored IP address, to improve services.',
      'or.a.offre': 'See the offer' },
    es: { 'nav.mobiliteAgent': 'Movilidad', 'nav.usage': 'Uso', 'nav.partenairesAgent': 'Socios', 'nav.evenements': 'Seguridad', 'nav.espacePartenaire': 'Espacio socio',
      'v20.nonVus': '{n} evento(s) de seguridad sin ver', 'v20.aVerifier': '{n} oferta(s) por verificar',
      'v20.dTitre': 'Transporte: líneas interrumpidas ({n})', 'v20.dSuivie': 'Línea que sigue', 'v20.dMeilleure': 'Mejor solución: {s}', 'v20.dVoir': 'Soluciones e itinerario',
      'v20.s.relais': 'servicio de sustitución', 'v20.s.autres-lignes': 'línea(s) {l}', 'v20.s.marche': 'a pie', 'v20.s.velo': 'bicicleta compartida', 'v20.s.tad': 'transporte a demanda',
      'v20.perte0': 'igual de rápido', 'v20.perte': '+{n} min',
      'v20.offresTitre': 'Ofertas de los socios', 'v20.offresD': 'Entidades asociadas también ofrecen sus servicios. Cada oferta la verifica el ayuntamiento.', 'v20.offresTout': 'Ver todas las ofertas ({n})',
      'v20.carteTitre': 'Líneas interrumpidas ahora', 'v20.carteVoir': 'Soluciones alternativas', 'v20.pied': 'Ofertas de los socios',
      'v20.donnees': 'Recuento anónimo del uso de los servicios: solo totales (por servicio, día, hora y barrio), sin cookie, sin identificador ni dirección IP conservada, para mejorar los servicios.',
      'or.a.offre': 'Ver la oferta' },
    ar: { 'nav.mobiliteAgent': 'التنقل', 'nav.usage': 'الاستخدام', 'nav.partenairesAgent': 'الشركاء', 'nav.evenements': 'الأمن', 'nav.espacePartenaire': 'فضاء الشريك',
      'v20.nonVus': '{n} حدث(أحداث) أمنية غير مطّلع عليها', 'v20.aVerifier': '{n} عرض(عروض) للتحقق',
      'v20.dTitre': 'النقل: خطوط متوقفة ({n})', 'v20.dSuivie': 'خط تتابعه', 'v20.dMeilleure': 'أفضل حل: {s}', 'v20.dVoir': 'الحلول والمسار',
      'v20.s.relais': 'خدمة بديلة متاحة', 'v20.s.autres-lignes': 'الخط(وط) {l}', 'v20.s.marche': 'سيراً', 'v20.s.velo': 'دراجة ذاتية الخدمة', 'v20.s.tad': 'نقل حسب الطلب',
      'v20.perte0': 'بنفس السرعة', 'v20.perte': '+{n} د',
      'v20.offresTitre': 'عروض الشركاء', 'v20.offresD': 'تقدم هيئات شريكة خدماتها أيضاً. كل عرض تتحقق منه المدينة.', 'v20.offresTout': 'عرض كل العروض ({n})',
      'v20.carteTitre': 'الخطوط المتوقفة حالياً', 'v20.carteVoir': 'الحلول البديلة', 'v20.pied': 'عروض الشركاء',
      'v20.donnees': 'عدّ مجهول لاستخدام الخدمات: مجاميع فقط (حسب الخدمة واليوم والساعة والحي)، بدون ملفات تعريف ارتباط ولا معرّف ولا حفظ لعنوان IP، لتحسين الخدمات.',
      'or.a.offre': 'عرض العرض' }
  });
  const t = (k, v) => NT.t(k, v);
  const E = (s) => NT.ui.echap(s == null ? '' : String(s));
  const u = NT.auth.utilisateur();
  const staff = !!u && u.role !== 'citoyen';
  const page = document.body.dataset.page || '';
  if (!document.querySelector('link[href*="vague20.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'assets/css/vague20.css'; document.head.append(l); }
  let R = null;

  /* ---------- Menu : liens des agents et du compte partenaire ---------- */
  const nav = document.querySelector('.nav-principale');
  function lien(cle, href, pageCle) {
    if (!nav || nav.querySelector('a[href="' + href + '"]')) return nav && nav.querySelector('a[href="' + href + '"]');
    const a = document.createElement('a');
    a.href = href; a.dataset.v20 = cle;
    a.innerHTML = `<span>${E(t('nav.' + cle))}</span><span class="v20-pastille" hidden></span>`;
    if (page === pageCle) a.setAttribute('aria-current', 'page');
    nav.append(a);
    return a;
  }
  if (staff) { lien('mobiliteAgent', 'agent-mobilite.html', 'agent-mobilite'); lien('usage', 'agent-usage.html', 'agent-usage'); lien('partenairesAgent', 'agent-partenaires.html', 'agent-partenaires'); lien('evenements', 'agent-evenements.html', 'agent-evenements'); }
  if (NT.ui.ajusterEntete) requestAnimationFrame(NT.ui.ajusterEntete);
  function pastille(cle, n, libelle) {
    const a = nav && nav.querySelector('a[data-v20="' + cle + '"]'); if (!a) return;
    const p = a.querySelector('.v20-pastille');
    p.hidden = !n; p.textContent = n ? String(n) : '';
    a.setAttribute('aria-label', t('nav.' + cle) + (n ? ' — ' + libelle : ''));
  }

  /* ---------- F97 : lignes interrompues dans le tiroir « Alertes » ---------- */
  const NOM_ARRET = (id) => NT.t('tr.arret.' + id, null, id);
  function heure(hhmm) { const [h, m] = String(hhmm).split(':').map(Number), l = NT.i18n.langue; return l === 'fr' ? h + ' h' + (m ? ' ' + String(m).padStart(2, '0') : '') : l === 'en' ? (h % 12 || 12) + (m ? ':' + String(m).padStart(2, '0') : '') + (h < 12 ? ' am' : ' pm') : h + ':' + String(m).padStart(2, '0'); }
  function quand(q) { if (!q) return ''; const LOC = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES', ar: 'ar' }[NT.i18n.langue] || 'fr-FR';
    return q.jour === 'auj' ? heure(q.heure) : (q.jour === 'demain' ? NT.t('tr.demain', null, 'demain') : new Date(q.date + 'T12:00:00Z').toLocaleDateString(LOC, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })) + ' ' + heure(q.heure); }
  const TITRES = { fr: ['Ligne {l} interrompue jusqu’à {fin}', 'Ligne {l} interrompue jusqu’à nouvel ordre'], en: ['Line {l} interrupted until {fin}', 'Line {l} interrupted until further notice'],
    es: ['Línea {l} interrumpida hasta {fin}', 'Línea {l} interrumpida hasta nuevo aviso'], ar: ['الخط {l} متوقف حتى {fin}', 'الخط {l} متوقف حتى إشعار آخر'] };
  const titreLigne = (i, l) => { const tt = TITRES[NT.i18n.langue] || TITRES.fr; return (i.fin ? tt[0] : tt[1]).replace('{l}', l).replace('{fin}', quand(i.fin)); };
  function solution(o) {
    if (!o) return '';
    const s = o.type === 'autres-lignes' ? t('v20.s.autres-lignes', { l: (o.lignes || []).join(' + ') }) : t('v20.s.' + o.type);
    return o.perte == null ? s : s + ' (' + (o.perte === 0 ? t('v20.perte0') : t('v20.perte', { n: o.perte })) + ')';
  }
  function tiroir() {
    const m = R && R.mobilite;
    if (!m || !m.interruptions.length) return { n: 0, html: '' };
    const suivies = m.abonnements || [];
    const items = [];
    m.interruptions.forEach((i) => i.troncons.forEach((tr, k) => items.push({ i, tr, k, suivie: suivies.includes(tr.ligne) })));
    items.sort((a, b) => (b.suivie ? 1 : 0) - (a.suivie ? 1 : 0));
    const html = `<article class="v20-tiroir" aria-labelledby="v20-d-t"><h3 id="v20-d-t"><i class="ph-duotone ph-bus" aria-hidden="true"></i>${E(t('v20.dTitre', { n: items.length }))}</h3><ul>${items.map(({ i, tr, k, suivie }) => {
      const best = (i.meilleure || [])[k];
      return `<li class="${suivie ? 'v20-suivie' : ''}"><span class="tr-ligne tr-${E(tr.ligne)}">${E(tr.ligne)}</span><div><strong>${E(titreLigne(i, tr.ligne))}</strong>${suivie ? ` <span class="v20-badge">${E(t('v20.dSuivie'))}</span>` : ''}
        ${best && best.option ? `<p>${E(t('v20.dMeilleure', { s: solution(best.option) }))}</p>` : ''}<a href="transports.html#int-${E(i.id)}">${E(t('v20.dVoir'))} →</a></div></li>`;
    }).join('')}</ul></article>`;
    return { n: items.length, html };
  }
  // La veille (veille.js, chargée en parallèle) et ce module partagent le même point d'accroche du tiroir
  let veilleOrigine = NT.ui.veille;
  const combine = () => { const v = veilleOrigine ? veilleOrigine() : { n: 0, html: '', urgent: false }; const m = tiroir(); return { n: (v.n || 0) + m.n, html: (v.html || '') + m.html, urgent: !!v.urgent }; };
  try { Object.defineProperty(NT.ui, 'veille', { configurable: true, get: () => combine, set: (f) => { veilleOrigine = f; } }); } catch (e) { /* navigateur ancien : pas de fusion */ }

  /* ---------- Lecture du résumé ---------- */
  function lire() {
    if (document.hidden) return;
    fetch('/api/vague20/resume', { cache: 'no-store', credentials: 'same-origin' }).then((r) => (r.ok ? r.json() : null)).then((d) => {
      if (!d) return;
      R = d;
      if (d.partenaire && d.partenaire.statut === 'actif') lien('espacePartenaire', 'partenaire.html', 'partenaire');
      if (staff && d.securite) pastille('evenements', d.securite.nonVus, t('v20.nonVus', { n: d.securite.nonVus }));
      if (staff && d.moderation != null) pastille('partenairesAgent', d.moderation, t('v20.aVerifier', { n: d.moderation }));
      if (NT.ui.rafraichirAlertes) NT.ui.rafraichirAlertes();
      if (page === 'carte') carte();
      document.dispatchEvent(new CustomEvent('nt:v20', { detail: d }));
    }).catch(() => {});
  }
  let minuterie = null;
  const planifier = () => { clearTimeout(minuterie); minuterie = setTimeout(() => { lire(); planifier(); }, NT.econome ? NT.econome.delai(60000) : 60000); };
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { lire(); planifier(); } });
  document.addEventListener('nt:v20-maj', lire);
  NT.v20lire = lire;
  lire(); planifier();

  /* ---------- F98 : balise anonyme d'usage ---------- */
  function balise(evenement, service, etape) {
    if (!service || service === 'inconnu') return;
    try { fetch('/api/usage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ evenement, service, etape }), keepalive: true, credentials: 'same-origin' }).catch(() => {}); } catch (e) { /* ignoré */ }
  }
  if (page === 'services') {
    const vue = () => { const id = decodeURIComponent(location.hash.replace(/^#/, '')); if (id && NT.services && NT.services.get && NT.services.get(id)) balise('vue', id); };
    window.addEventListener('hashchange', vue); vue();
  }
  if (page === 'demande') {
    const faites = new Set();
    const etape = (nom) => { const s = document.getElementById('d-service'); const svc = s && s.value; if (!svc || faites.has(svc + nom)) return; faites.add(svc + nom); balise('etape', svc, nom); };
    document.addEventListener('change', (e) => { if (e.target.id === 'd-service' && e.target.value) etape('choix'); if (e.target.id === 'd-nature' && e.target.value) etape('nature'); });
    document.addEventListener('input', (e) => { if (e.target.id === 'd-precisions' && e.target.value.trim().length > 3) etape('informations'); });
    setTimeout(() => { const s = document.getElementById('d-service'); const choisi = document.querySelector('input[name="type"][value="demarche"]'); if (s && s.value && choisi && choisi.checked) etape('choix'); }, 800);
  }

  /* ---------- F99 : offres des partenaires sur la page des services ---------- */
  function sectionOffres() {
    if (page !== 'services' || document.getElementById('v20-offres')) return;
    fetch('/api/partenaires/offres', { credentials: 'same-origin' }).then((r) => (r.ok ? r.json() : null)).then((d) => {
      if (!d || !d.offres.length) return;
      const s = document.createElement('section');
      s.className = 'section sv-section v20-offres'; s.id = 'v20-offres'; s.dataset.lcNon = ''; s.setAttribute('aria-labelledby', 'v20-offres-t');
      const BADGE = { disponible: ['disponible', 'ph-check-circle'], complet: ['perturbe', 'ph-hourglass'], suspendu: ['indisponible', 'ph-pause-circle'] };
      const LIB = { fr: { disponible: 'Disponible', complet: 'Complet', suspendu: 'Suspendu', par: 'Proposé par {p}, vérifié par la ville' }, en: { disponible: 'Available', complet: 'Full', suspendu: 'Suspended', par: 'Offered by {p}, checked by the city' },
        es: { disponible: 'Disponible', complet: 'Completo', suspendu: 'Suspendido', par: 'Propuesto por {p}, verificado por el ayuntamiento' }, ar: { disponible: 'متاح', complet: 'مكتمل', suspendu: 'معلّق', par: 'يقدمه {p}، تحققت منه المدينة' } }[NT.i18n.langue] || {};
      s.innerHTML = `<div class="titre-section"><div><h2 id="v20-offres-t">${E(t('v20.offresTitre'))}</h2><p>${E(t('v20.offresD'))}</p></div></div>
        <ul class="v20-offres-liste">${d.offres.slice(0, 3).map((o) => { const b = BADGE[o.disponibilite.statut]; return `<li><a href="partenaires.html#${E(o.id)}"><strong lang="fr">${E(o.titre)}</strong></a>
          <span class="niveau-svc niveau-svc-${b[0]}"><i class="ph ${b[1]}" aria-hidden="true"></i>${E(LIB[o.disponibilite.statut])}</span><span class="doux v20-verifie"><i class="ph ph-seal-check" aria-hidden="true"></i>${E(String(LIB.par).replace('{p}', o.partenaire.nom))}</span></li>`; }).join('')}</ul>
        <p><a class="btn" href="partenaires.html"><i class="ph ph-handshake" aria-hidden="true"></i>${E(t('v20.offresTout', { n: d.offres.length }))}</a></p>`;
      const assos = document.getElementById('sv-associations');
      if (assos && assos.parentNode) assos.after(s); else (document.getElementById('contenu') || document.body).append(s);
    }).catch(() => {});
  }
  sectionOffres();

  /* ---------- F97 : lignes coupées sur la carte ---------- */
  function carte() {
    const m = R && R.mobilite; if (!m) return;
    const lignes = new Map();
    m.interruptions.forEach((i) => i.troncons.forEach((tr) => lignes.set(tr.ligne, i)));
    document.querySelectorAll('.cm-ligne[data-ligne]').forEach((g) => g.classList.toggle('v20-coupee', lignes.has(g.dataset.ligne)));
    let z = document.getElementById('v20-carte');
    if (!lignes.size) { if (z) z.remove(); return; }
    if (!z) { z = document.createElement('div'); z.id = 'v20-carte'; z.className = 'v20-carte'; const leg = document.getElementById('cm-legende'); if (leg) leg.before(z); else return; }
    z.innerHTML = `<p><i class="ph-duotone ph-warning" aria-hidden="true"></i><strong>${E(t('v20.carteTitre'))}</strong></p><ul>${[...lignes].map(([l, i]) => `<li><span class="tr-ligne tr-${E(l)}">${E(l)}</span> <a href="transports.html#int-${E(i.id)}">${E(titreLigne(i, l))}</a></li>`).join('')}</ul>`;
  }

  /* ---------- Pied de page et page « Vos données » ---------- */
  const pied = document.querySelector('.pied-colonnes ul');
  if (pied && !pied.querySelector('a[href="partenaires.html"]')) { const li = document.createElement('li'); li.innerHTML = `<a href="partenaires.html">${E(t('v20.pied'))}</a>`; pied.append(li); }
  if (page === 'donnees') {
    const cookie = document.querySelector('[data-i18n="don.cookieB"]');
    const li = cookie && cookie.closest('li');
    if (li && !document.getElementById('v20-comptage')) { const n = document.createElement('li'); n.id = 'v20-comptage'; n.innerHTML = `<i class="ph-duotone ph-chart-bar" aria-hidden="true"></i><span>${E(t('v20.donnees'))}</span>`; li.after(n); }
  }
  void NOM_ARRET;
})();
