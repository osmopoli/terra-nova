/* Terra Nova — vague 18 (D10) : page de résultats de la recherche globale (recherche.html?q=…).
   Résultats groupés, « Vouliez-vous dire… », meilleur geste en tête, repli sans impasse (services proches, mairie, assistant). */
(function () {
  'use strict';
  const NT = window.NT;
  NT.i18n.ajouter({
    fr: { 'rc.titre': 'Rechercher', 'rc.sous': 'Services, démarches, réponses, annonces et associations : écrivez avec vos mots, même avec des fautes ou dans une autre langue.', 'rc.label': 'Que cherchez-vous ?', 'rc.ph': 'Ex. : ma poubelle déborde, papier pour me marier…', 'rc.chercher': 'Rechercher' },
    en: { 'rc.titre': 'Search', 'rc.sous': 'Services, procedures, answers, notices and associations: write in your own words, even with mistakes or in another language.', 'rc.label': 'What are you looking for?', 'rc.ph': 'E.g. my bin is overflowing, papers to get married…', 'rc.chercher': 'Search' },
    es: { 'rc.titre': 'Buscar', 'rc.sous': 'Servicios, trámites, respuestas, anuncios y asociaciones: escriba con sus palabras, incluso con faltas o en otro idioma.', 'rc.label': '¿Qué busca?', 'rc.ph': 'Ej.: mi basura desborda, papeles para casarme…', 'rc.chercher': 'Buscar' },
    ar: { 'rc.titre': 'بحث', 'rc.sous': 'الخدمات والإجراءات والإجابات والإعلانات والجمعيات: اكتب بكلماتك، حتى مع أخطاء أو بلغة أخرى.', 'rc.label': 'عمّ تبحث؟', 'rc.ph': 'مثال: حاوية القمامة ممتلئة، أوراق الزواج…', 'rc.chercher': 'بحث' }
  });
  NT.pret(() => {
    const champ = document.getElementById('rc-q'), zone = document.getElementById('rc-resultats');
    const lancer = (maj) => {
      const q = champ.value.trim();
      if (maj) try { history.replaceState(null, '', 'recherche.html' + (q ? '?q=' + encodeURIComponent(q) : '')); } catch { /* adresse inchangée */ }
      // orientation.js est chargé par ui.js juste après le code des pages : on l'attend (5 s au plus)
      const go = (n) => (NT.orientation ? NT.orientation.chercherDans(zone, q, {}) : n < 100 && setTimeout(() => go(n + 1), 50));
      go(0);
    };
    champ.value = NT.ui.param('q') || '';
    document.getElementById('rc-form').addEventListener('submit', (e) => { e.preventDefault(); lancer(true); });
    let m = null;
    champ.addEventListener('input', () => { clearTimeout(m); m = setTimeout(() => lancer(true), 300); });
    if (champ.value) lancer(false); else champ.focus();
  });
})();
