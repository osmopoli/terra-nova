/* Terra Nova — accueil (index.html), vague 13
   F71 : la langue se choisit dans l'en-tête et, en grand, sur bienvenue.html (l'encart du premier passage est retiré : il repoussait l'accueil).
   F72 : « Je viens d'arriver » accessible depuis l'accueil (raccourci sous la recherche + bloc « Vous venez d'arriver ? »). */
(function () {
  'use strict';
  const NT = window.NT;
  NT.i18n.ajouter({
    fr: {},
    en: { 'nv.raccourci': 'I just arrived', 'nv.guide': 'Where to start? 3 questions', 'nv.sansEmail': 'No e-mail address? Create an account with an identifier', 'nv.fermer': 'Keep French' },
    es: { 'nv.raccourci': 'Acabo de llegar', 'nv.guide': '¿Por dónde empezar? 3 preguntas', 'nv.sansEmail': '¿Sin correo electrónico? Cree una cuenta con un identificador', 'nv.fermer': 'Seguir en francés' },
    ar: { 'nv.raccourci': 'وصلت للتو', 'nv.guide': 'من أين أبدأ؟ 3 أسئلة', 'nv.sansEmail': 'ليس لديك بريد إلكتروني؟ أنشئ حساباً بمعرّف', 'nv.fermer': 'البقاء بالفرنسية' }
  });
  const L = (cle, fr) => NT.t(cle, null, fr);
  const E = s => NT.ui.echap(s);

  NT.pret(() => {
    const u = NT.auth.utilisateur();

    // Le choix de la langue reste dans l'en-tête (et en grand sur bienvenue.html) : plus d'encart au premier passage
    // Raccourci visible sans défiler, sous la recherche
    const raccourcis = document.querySelector('.raccourcis');
    if (raccourcis) raccourcis.insertAdjacentHTML('beforeend', `<a class="raccourci-arrivee" href="bienvenue.html"><i class="ph-duotone ph-suitcase-rolling" aria-hidden="true"></i> ${E(L('nv.raccourci', 'Je viens d’arriver'))}</a>`);

    // Bloc « Vous venez d'arriver ? » : le guide en premier, la création de compte sans e-mail juste dessous
    const bloc = document.getElementById('bloc-arrivee');
    if (bloc && (!u || u.role === 'citoyen')) {
      const existant = bloc.querySelector('a.btn');
      if (existant) existant.classList.remove('btn-primaire');
      const guide = Object.assign(document.createElement('a'), { className: 'btn btn-primaire', href: 'bienvenue.html#guide' });
      guide.innerHTML = `<i class="ph-duotone ph-compass" aria-hidden="true"></i><span>${E(L('nv.guide', 'Par où commencer ? 3 questions'))}</span>`;
      const zone = document.createElement('p');
      zone.className = 'ligne';
      zone.append(guide);
      if (existant) zone.append(existant);
      bloc.append(zone);
      if (!u) bloc.insertAdjacentHTML('beforeend', `<p class="doux"><a href="bienvenue.html#sans-email">${E(L('nv.sansEmail', 'Pas d’adresse e-mail ? Créez un compte avec un identifiant'))}</a></p>`);
    }
  });
})();
