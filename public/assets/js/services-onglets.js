/* Terra Nova — page Services allégée.
   - Deux onglets : services de la ville (recherche, filtres, liste) et associations partenaires (F74). Les liens
     services.html#associations et #asso-… ouvrent directement le second onglet.
   - Liste « Tous les autres services » repliée à 4 tant qu'aucune recherche ni filtre n'est actif.
   - Dans la liste, l'encart d'interruption (F63, F64) garde son titre et « ce qui est indisponible » ; le reste
     (quand revenir, que faire) s'ouvre d'un clic. La fiche détaillée du service le montre toujours en entier. */
(function () {
  'use strict';
  NT.i18n.ajouter({
    fr: { 'sv.og.label': 'Services et associations', 'sv.og.services': 'Services de la ville', 'sv.og.assos': 'Associations partenaires',
      'sv.og.plus': 'Afficher les {n} autres services', 'sv.og.plus1': 'Afficher l’autre service', 'sv.og.moins': 'Afficher moins', 'sv.og.detail': 'Quand revenir, que faire', 'sv.og.masquer': 'Masquer le détail' },
    en: { 'sv.og.label': 'Services and associations', 'sv.og.services': 'City services', 'sv.og.assos': 'Partner associations',
      'sv.og.plus': 'Show the {n} other services', 'sv.og.plus1': 'Show the other service', 'sv.og.moins': 'Show less', 'sv.og.detail': 'When to come back, what to do', 'sv.og.masquer': 'Hide details' },
    es: { 'sv.og.label': 'Servicios y asociaciones', 'sv.og.services': 'Servicios de la ciudad', 'sv.og.assos': 'Asociaciones colaboradoras',
      'sv.og.plus': 'Mostrar los otros {n} servicios', 'sv.og.plus1': 'Mostrar el otro servicio', 'sv.og.moins': 'Mostrar menos', 'sv.og.detail': 'Cuándo volver, qué hacer', 'sv.og.masquer': 'Ocultar el detalle' },
    ar: { 'sv.og.label': 'الخدمات والجمعيات', 'sv.og.services': 'خدمات المدينة', 'sv.og.assos': 'الجمعيات الشريكة',
      'sv.og.plus': 'عرض {n} خدمات أخرى', 'sv.og.plus1': 'عرض الخدمة الأخرى', 'sv.og.moins': 'عرض أقل', 'sv.og.detail': 'متى أعود وماذا أفعل', 'sv.og.masquer': 'إخفاء التفاصيل' }
  });
  const L = (k, d, v) => (NT.i18n && NT.i18n.t ? NT.i18n.t(k, v, d) : d);
  const VISIBLES_AUTRES = 4;
  // N'écrit que si le texte change : sinon chaque écriture relancerait l'observateur de la page (boucle)
  const ecrire = (el, t) => { if (el && el.textContent !== t) el.textContent = t; };
  const versAssos = (h) => h === 'associations' || h === 'sv-associations' || h.startsWith('asso-');

  function init() {
    const liste = document.getElementById('onglets-services');
    if (!liste) return;
    const onglets = [...liste.querySelectorAll('[role="tab"]')];
    const panneau = (o) => document.getElementById(o.getAttribute('aria-controls'));
    const ogAssos = document.getElementById('og-sv-assos');

    function choisir(o, focus) {
      onglets.forEach((x) => { const actif = x === o; x.setAttribute('aria-selected', String(actif)); x.tabIndex = actif ? 0 : -1; panneau(x).hidden = !actif; });
      if (focus) o.focus();
    }
    onglets.forEach((o, i) => {
      o.addEventListener('click', () => {
        choisir(o);
        // l'ancre suit l'onglet (retour arrière et partage du lien), sans faire défiler la page
        const h = o === ogAssos ? '#associations' : '';
        if (location.hash !== h && (o === ogAssos || versAssos(location.hash.slice(1)))) history.replaceState(history.state, '', location.pathname + location.search + h);
      });
      o.addEventListener('keydown', (e) => {
        const rtl = document.documentElement.dir === 'rtl';
        const pas = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[e.key];
        const cible = pas ? onglets[(i + pas + onglets.length) % onglets.length] : e.key === 'Home' ? onglets[0] : e.key === 'End' ? onglets[onglets.length - 1] : null;
        if (cible) { e.preventDefault(); choisir(cible, true); }
      });
    });
    const selonAncre = () => { if (versAssos(decodeURIComponent(location.hash.slice(1)))) choisir(ogAssos); };
    selonAncre();
    window.addEventListener('hashchange', selonAncre);

    // Compteurs, repli de la liste, encarts compacts : réappliqués à chaque nouveau rendu (recherche, filtre, langue)
    let deplie = false;
    function filtreActif() {
      const q = document.getElementById('sv-q');
      const presse = document.querySelector('#sv-boutons [aria-pressed="true"]');
      return !!(q && q.value.trim()) || !!(presse && presse !== document.querySelector('#sv-boutons .sv-filtre'));
    }
    function replierAutres() {
      const ul = document.querySelector('.sv-autres .sv-liste');
      let b = document.getElementById('btn-plus-services');
      const n = ul ? ul.querySelectorAll(':scope > li').length : 0;
      const actif = !filtreActif() && n > VISIBLES_AUTRES;
      if (ul) { ul.dataset.visibles = String(VISIBLES_AUTRES); ul.classList.toggle('replie', actif && !deplie); if (!ul.id) ul.id = 'sv-liste-autres'; }
      if (!actif) { if (b) b.hidden = true; return; }
      if (!b || !b.isConnected) {
        b = document.createElement('button');
        b.type = 'button'; b.id = 'btn-plus-services'; b.className = 'btn petit plus-liste';
        b.addEventListener('click', () => { deplie = !deplie; replierAutres(); if (!deplie) document.querySelector('.sv-autres').scrollIntoView({ block: 'nearest' }); });
        ul.after(b);
      }
      b.hidden = false;
      b.setAttribute('aria-controls', ul.id);
      b.setAttribute('aria-expanded', String(deplie));
      ecrire(b, deplie ? L('sv.og.moins', 'Afficher moins') : (n - VISIBLES_AUTRES === 1 ? L('sv.og.plus1', 'Afficher l’autre service') : L('sv.og.plus', 'Afficher les {n} autres services', { n: n - VISIBLES_AUTRES })));
    }
    function encartsCompacts() {
      document.querySelectorAll('#sv-resultats .sv-encart').forEach((enc) => {
        const lignes = enc.querySelectorAll(':scope > dl > div');
        if (lignes.length < 2 || enc.querySelector('.sv-encart-plus')) return;
        enc.classList.add('compact');
        const dl = enc.querySelector(':scope > dl');
        if (!dl.id) dl.id = 'sv-enc-' + Math.random().toString(36).slice(2, 8);
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'sv-encart-plus'; b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', dl.id);
        b.innerHTML = '<i class="ph ph-caret-down" aria-hidden="true"></i><span></span>';
        const texte = () => { b.querySelector('span').textContent = enc.classList.contains('compact') ? L('sv.og.detail', 'Quand revenir, que faire') : L('sv.og.masquer', 'Masquer le détail'); };
        b.addEventListener('click', () => { enc.classList.toggle('compact'); b.setAttribute('aria-expanded', String(!enc.classList.contains('compact'))); texte(); });
        texte();
        dl.after(b);
      });
    }
    function compter() {
      const ns = document.querySelectorAll('#sv-resultats li.sv-carte, #sv-resultats article.sv-carte').length;
      const na = document.querySelectorAll('#sv-associations .as-carte').length;
      const cs = liste.querySelector('[data-compte="services"]'), ca = liste.querySelector('[data-compte="assos"]');
      ecrire(cs, ns ? String(ns) : '');
      ecrire(ca, na ? String(na) : '');
    }
    function maj() { encartsCompacts(); replierAutres(); compter(); }

    let attente = 0;
    // minuterie plutôt que requestAnimationFrame : celle-ci est suspendue quand l'onglet est en arrière-plan
    const obs = new MutationObserver(() => { clearTimeout(attente); attente = setTimeout(maj, 40); });
    obs.observe(document.getElementById('contenu') || document.body, { childList: true, subtree: true });
    const q = document.getElementById('sv-q'); if (q) q.addEventListener('input', () => { deplie = false; });
    maj();
  }

  if (window.NT && NT.pret) NT.pret(init); else document.addEventListener('DOMContentLoaded', init);
})();
