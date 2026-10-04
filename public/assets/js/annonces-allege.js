/* Terra Nova — page Annonces allégée.
   Une alerte garde à l'écran ce qui sert tout de suite : le titre, la zone, le texte, « Que faire ? » et les numéros
   d'urgence. Les compléments (personnes à protéger, lieux où se rafraîchir, note) s'ouvrent d'un clic, sur place. */
(function () {
  'use strict';
  NT.i18n.ajouter({
    fr: { 'an.al.plus': 'Personnes à protéger, lieux utiles', 'an.al.moins': 'Masquer les compléments' },
    en: { 'an.al.plus': 'People to protect, useful places', 'an.al.moins': 'Hide the details' },
    es: { 'an.al.plus': 'Personas a proteger, lugares útiles', 'an.al.moins': 'Ocultar los complementos' },
    ar: { 'an.al.plus': 'أشخاص تجب حمايتهم، أماكن مفيدة', 'an.al.moins': 'إخفاء التفاصيل' }
  });
  const L = (k, d) => (NT.i18n && NT.i18n.t ? NT.i18n.t(k, null, d) : d);
  let n = 0;

  function alleger(art) {
    if (art.dataset.allege) return;
    // compléments : chaque bloc (titre h4 + liste) de « personnes à protéger » et « lieux », et la note qui suit
    const blocs = [];
    art.querySelectorAll(':scope > ul.an-publics, :scope > ul.an-lieux').forEach((ul) => {
      const h = ul.previousElementSibling;
      if (h && h.tagName === 'H4') blocs.push(h);
      blocs.push(ul);
      const note = ul.nextElementSibling;
      if (note && note.matches('p.an-petit')) blocs.push(note);
    });
    art.dataset.allege = '1';
    if (!blocs.length) return;
    const zone = document.createElement('div');
    zone.className = 'an-complements';
    zone.id = 'an-compl-' + (++n);
    zone.hidden = true;
    blocs[0].before(zone);
    blocs.forEach((b) => zone.appendChild(b));
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'an-plus';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', zone.id);
    btn.innerHTML = '<i class="ph ph-caret-down" aria-hidden="true"></i><span></span>';
    const texte = () => { btn.querySelector('span').textContent = zone.hidden ? L('an.al.plus', 'Personnes à protéger, lieux utiles') : L('an.al.moins', 'Masquer les compléments'); };
    btn.addEventListener('click', () => { zone.hidden = !zone.hidden; btn.setAttribute('aria-expanded', String(!zone.hidden)); texte(); });
    texte();
    zone.before(btn);
  }

  function init() {
    if (!document.getElementById('an-liste')) return;
    const maj = () => document.querySelectorAll('#an-liste article.an-alerte:not([data-allege])').forEach(alleger);
    // minuterie (et non requestAnimationFrame, suspendu en arrière-plan) ; aucune écriture si rien n'a changé
    let attente = 0;
    new MutationObserver(() => { clearTimeout(attente); attente = setTimeout(maj, 40); }).observe(document.getElementById('contenu') || document.body, { childList: true, subtree: true });
    maj();
  }
  if (window.NT && NT.pret) NT.pret(init); else document.addEventListener('DOMContentLoaded', init);
})();
