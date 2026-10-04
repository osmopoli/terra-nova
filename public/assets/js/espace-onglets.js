/* Terra Nova — « Mon espace » allégé : une section visible à la fois.
   Toutes les sections restent dans la page (D11, F26, F65-F68, F76, F79, F83) : les onglets ne font que choisir celle qu'on
   affiche. Onglets ARIA (flèches, Origine, Fin), lien direct (?onglet=historique ou #mes-avis-services), nombre d'éléments
   par onglet, demandes en cours repliées au-delà de 3. */
(function () {
  'use strict';
  NT.i18n.ajouter({
    fr: { 'esp.og.label': 'Sections de mon espace', 'esp.og.suivi': 'En cours', 'esp.og.historique': 'Historique', 'esp.og.contrib': 'Mes avis et idées',
      'esp.og.accuses': 'Accusés de réception', 'esp.og.videContrib': 'Vos avis sur les services, vos réponses aux consultations et vos idées apparaîtront ici, avec leur reçu.',
      'esp.og.plus': 'Afficher les {n} autres demandes en cours', 'esp.og.moins': 'Afficher moins' },
    en: { 'esp.og.label': 'Sections of my space', 'esp.og.suivi': 'In progress', 'esp.og.historique': 'History', 'esp.og.contrib': 'My feedback and ideas',
      'esp.og.accuses': 'Receipts', 'esp.og.videContrib': 'Your feedback on services, your answers to consultations and your ideas will appear here, with their receipt.',
      'esp.og.plus': 'Show the {n} other requests in progress', 'esp.og.moins': 'Show less' },
    es: { 'esp.og.label': 'Secciones de mi espacio', 'esp.og.suivi': 'En curso', 'esp.og.historique': 'Historial', 'esp.og.contrib': 'Mis opiniones e ideas',
      'esp.og.accuses': 'Acuses de recibo', 'esp.og.videContrib': 'Sus opiniones sobre los servicios, sus respuestas a las consultas y sus ideas aparecerán aquí, con su recibo.',
      'esp.og.plus': 'Mostrar las otras {n} solicitudes en curso', 'esp.og.moins': 'Mostrar menos' },
    ar: { 'esp.og.label': 'أقسام مساحتي', 'esp.og.suivi': 'قيد المتابعة', 'esp.og.historique': 'السجل', 'esp.og.contrib': 'آرائي وأفكاري',
      'esp.og.accuses': 'إشعارات الاستلام', 'esp.og.videContrib': 'ستظهر هنا آراؤك حول الخدمات وردودك على الاستشارات وأفكارك، مع إيصالاتها.',
      'esp.og.plus': 'عرض {n} طلبات أخرى قيد المتابعة', 'esp.og.moins': 'عرض أقل' }
  });

  const L = (k, d, v) => (NT.i18n && NT.i18n.t ? NT.i18n.t(k, v) : d) || d;
  // Ancres historiques → onglet qui les contient
  const ANCRES = { 'historique': 'historique', 'mes-avis-services': 'contrib', 'ma-participation': 'contrib', 'mes-accuses': 'accuses' };
  const VISIBLES_EN_COURS = 3;

  function init() {
    const liste = document.getElementById('onglets-espace');
    if (!liste) return;
    const onglets = [...liste.querySelectorAll('[role="tab"]')];
    const panneau = (o) => document.getElementById(o.getAttribute('aria-controls'));

    function choisir(o, { focus = false, memoriser = true } = {}) {
      onglets.forEach((x) => {
        const actif = x === o;
        x.setAttribute('aria-selected', String(actif));
        x.tabIndex = actif ? 0 : -1;
        panneau(x).hidden = !actif;
      });
      if (focus) o.focus();
      if (memoriser) {
        const p = new URLSearchParams(location.search);
        const nom = o.id.replace('og-', '');
        if (nom === 'suivi') p.delete('onglet'); else p.set('onglet', nom);
        const q = p.toString();
        history.replaceState(history.state, '', location.pathname + (q ? '?' + q : ''));
      }
    }

    onglets.forEach((o, i) => {
      o.addEventListener('click', () => choisir(o));
      o.addEventListener('keydown', (e) => {
        const rtl = document.documentElement.dir === 'rtl';
        const suiv = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[e.key];
        let cible = null;
        if (suiv) cible = onglets[(i + suiv + onglets.length) % onglets.length];
        else if (e.key === 'Home') cible = onglets[0];
        else if (e.key === 'End') cible = onglets[onglets.length - 1];
        if (cible) { e.preventDefault(); choisir(cible, { focus: true }); }
      });
    });

    // Onglet de départ : ?onglet=…, sinon ancre d'une section, sinon « En cours »
    const demande = new URLSearchParams(location.search).get('onglet') || ANCRES[location.hash.slice(1)];
    const depart = demande && document.getElementById('og-' + demande);
    if (depart) {
      choisir(depart, { memoriser: false });
      const ancre = location.hash && document.getElementById(location.hash.slice(1));
      if (ancre) requestAnimationFrame(() => ancre.scrollIntoView({ block: 'start' }));
    }

    // Nombre d'éléments par onglet et état vide, recalculés quand les listes se remplissent
    const compter = {
      suivi: () => document.querySelectorAll('#liste-encours > li.demande').length,
      historique: () => document.querySelectorAll('#tbody-hist > tr').length,
      contrib: () => document.querySelectorAll('#pn-contrib li:not(.vide), #pn-contrib article, #pn-contrib .avis-service').length,
      accuses: () => document.querySelectorAll('#pn-accuses li:not(.vide), #pn-accuses tbody tr, #pn-accuses article').length
    };
    function maj() {
      Object.entries(compter).forEach(([nom, f]) => {
        const el = liste.querySelector('[data-compte="' + nom + '"]');
        const n = f();
        if (el) el.textContent = n ? String(n) : '';
      });
      const vide = document.getElementById('vide-contrib');
      if (vide) vide.hidden = [...document.querySelectorAll('#pn-contrib > section')].some((s) => !s.hidden);
      replier();
    }

    // Demandes en cours : les 3 premières visibles, le reste derrière un bouton
    let deplie = false;
    function replier() {
      const ul = document.getElementById('liste-encours');
      if (!ul) return;
      const n = ul.querySelectorAll(':scope > li.demande').length;
      ul.classList.toggle('replie', !deplie && n > VISIBLES_EN_COURS);
      let b = document.getElementById('btn-plus-encours');
      if (n <= VISIBLES_EN_COURS) { if (b) b.hidden = true; return; }
      if (!b) {
        b = document.createElement('button');
        b.type = 'button'; b.id = 'btn-plus-encours'; b.className = 'btn petit plus-encours';
        b.setAttribute('aria-controls', 'liste-encours');
        b.addEventListener('click', () => { deplie = !deplie; replier(); if (!deplie) ul.scrollIntoView({ block: 'nearest' }); });
        ul.after(b);
      }
      b.hidden = false;
      b.setAttribute('aria-expanded', String(deplie));
      b.textContent = deplie ? L('esp.og.moins', 'Afficher moins') : L('esp.og.plus', 'Afficher les {n} autres demandes en cours', { n: n - VISIBLES_EN_COURS }).replace('{n}', n - VISIBLES_EN_COURS);
    }

    let attente = 0;
    const obs = new MutationObserver(() => { cancelAnimationFrame(attente); attente = requestAnimationFrame(maj); });
    obs.observe(document.getElementById('contenu'), { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
    maj();
  }

  if (window.NT && NT.pret) NT.pret(init); else document.addEventListener('DOMContentLoaded', init);
})();
