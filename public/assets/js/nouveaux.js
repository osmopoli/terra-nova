/* Terra Nova — accueil (index.html), vague 13
   F71 : au tout premier passage (aucune langue choisie sur cet appareil), un encart discret propose les 4 langues,
         chacune écrite dans sa propre langue. Une seule fois : le choix (ou la fermeture) est mémorisé.
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
  const LANGUES = [['fr', 'Français', 'Bonjour'], ['en', 'English', 'Hello'], ['es', 'Español', 'Hola'], ['ar', 'العربية', 'مرحباً']];
  let langueChoisie = true;
  try { langueChoisie = localStorage.getItem('nt:langue') !== null; } catch (e) { /* stockage bloqué */ }

  NT.pret(() => {
    const u = NT.auth.utilisateur();
    const main = document.getElementById('contenu');

    // Premier passage : choix de la langue (multilingue, puisqu'on ne sait pas encore laquelle la personne lit)
    if (!langueChoisie && main) {
      const encart = document.createElement('section');
      encart.className = 'panneau premiere-langue';
      encart.setAttribute('aria-labelledby', 'nv-langue-titre');
      encart.innerHTML = `<div class="tete"><h2 id="nv-langue-titre"><i class="ph-duotone ph-translate" aria-hidden="true"></i>
          <span lang="fr">Choisissez votre langue</span> · <span lang="en">Choose your language</span> · <span lang="es">Elija su idioma</span> · <span lang="ar" dir="rtl">اختر لغتك</span></h2>
          <button type="button" class="bouton-rond" id="nv-fermer" title="${E(L('nv.fermer', 'Rester en français'))}"><i class="ph ph-x" aria-hidden="true"></i><span class="sr-only">${E(L('nv.fermer', 'Rester en français'))}</span></button></div>
        <div class="langues">${LANGUES.map(([c, nom, salut]) => `<button type="button" class="langue-choix" lang="${c}" dir="${c === 'ar' ? 'rtl' : 'ltr'}" data-langue="${c}">
          <span class="nom"><i class="ph ph-chat-circle-text" aria-hidden="true"></i>${E(nom)}</span><span class="salut">${E(salut)}</span></button>`).join('')}</div>`;
      main.prepend(encart);
      encart.addEventListener('click', e => {
        const b = e.target.closest('[data-langue]');
        if (b) { if (b.dataset.langue === NT.i18n.langue) { NT.store.ecrire('langue', b.dataset.langue); encart.remove(); } else NT.i18n.changer(b.dataset.langue); }
        if (e.target.closest('#nv-fermer')) { NT.store.ecrire('langue', NT.i18n.langue); encart.remove(); document.getElementById('recherche').focus(); }
      });
    }

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
