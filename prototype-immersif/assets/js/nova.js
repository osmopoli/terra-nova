/* Terra Nova — coque d'application et comportements (maquette : aucune donnée envoyée, aucune clé ici) */
(function () {
  "use strict";
  var I = window.TN_ICONES, SERVICES = window.TN_SERVICES || [], ANNONCES = window.TN_ANNONCES || [];
  var reduit = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var souris = matchMedia("(hover: hover) and (pointer: fine)").matches;
  var page = document.body.getAttribute("data-page");
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  function stocker(cle, val) { try { if (val === undefined) return sessionStorage.getItem(cle); sessionStorage.setItem(cle, val); } catch (e) { return null; } }
  function echapper(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function sansAccents(s) { return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }

  var IC = {
    accueil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10M10 20v-5h4v5"/></svg>',
    loupe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    etincelle: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c.4 4.6 2.6 7.6 8 8.6v.8c-5.4 1-7.6 4-8 8.6h-.8c-.4-4.6-2.6-7.6-8-8.6v-.8c5.4-1 7.6-4 8-8.6z"/></svg>',
    coche: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 8 3.5 3.5L13 5"/></svg>',
    fermer: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>'
  };
  // Logo provisoire : à remplacer par le fichier officiel Terra Nova dès réception.
  var LOGO = '<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="1" y="1" width="38" height="38" rx="11" fill="#0B1118" stroke="#B4F04A" stroke-opacity=".45"/><circle cx="26" cy="14" r="4.5" fill="#FFB48A"/><path d="M8 27h24" stroke="#B4F04A" stroke-width="1.8" stroke-linecap="round"/><path d="M12.5 27a7.5 7.5 0 0 1 15 0" fill="none" stroke="#B4F04A" stroke-width="2.2"/><path d="M20 10v17" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>';
  var MARQUE = '<a class="marque" href="app.html" aria-label="Terra Nova, accueil">' + LOGO + '<div><b>Terra<span>Nova</span></b><small>Portail des habitants</small></div></a>';
  var PAGES = [
    { id: "accueil", href: "app.html", nom: "Accueil", ic: IC.accueil, aide: "Vue d’ensemble de la ville" },
    { id: "services", href: "services.html", nom: "Services", ic: I.grille, aide: "Services municipaux" },
    { id: "annonces", href: "annonces.html", nom: "Annonces", ic: I.annonce, aide: "Publications de la mairie" },
    { id: "contact", href: "contact.html", nom: "Contact", ic: I.message, aide: "Écrire à la mairie" }
  ];
  var courante = PAGES.filter(function (p) { return p.id === page; })[0] || PAGES[0];

  /* ---------- Coque : barre latérale, barre haute, navigation basse ---------- */
  var main = $("main");
  var liens = function (cls) {
    return PAGES.map(function (p) { return '<a href="' + p.href + '"' + (p.id === page ? ' aria-current="page"' : "") + ">" + p.ic + "<span>" + p.nom + "</span></a>"; }).join("");
  };
  var coque = document.createElement("div");
  coque.className = "coque";
  coque.innerHTML =
    '<aside class="barre" aria-label="Navigation">' + MARQUE +
      '<button class="barre-recherche" type="button" data-palette>' + IC.loupe + '<span>Rechercher</span><span class="kbd">Ctrl K</span></button>' +
      '<nav class="menu" aria-label="Navigation principale"><p class="menu-titre">Espace habitant</p><span class="menu-actif" aria-hidden="true"></span>' + liens() + "</nav>" +
      '<div class="carte-etat"><strong><span class="point" aria-hidden="true"></span>Dôme 04</strong>Conditions normales. Données d’exemple.' +
        '<div class="jauge" aria-hidden="true"><i></i></div>Réserves d’eau : 72 %</div>' +
    "</aside>" +
    '<div class="zone"><header class="haut">' + MARQUE +
      '<div class="haut-titre">Terra Nova <span aria-hidden="true">/</span> <b>' + courante.nom + "</b></div>" +
      '<div class="haut-droite"><span class="puce"><span class="point" aria-hidden="true"></span>Liaison stable</span>' +
      '<span class="puce horloge" title="Heure locale"></span><span class="puce puce-demo">Prototype</span>' +
      '<button class="bouton-icone" type="button" data-palette aria-label="Rechercher">' + IC.loupe + "</button></div>" +
    "</header></div>";
  main.parentNode.insertBefore(coque, main);
  $(".zone", coque).appendChild(main);
  main.insertAdjacentHTML("beforeend", '<footer class="pied"><span>Terra Nova, portail des habitants. Maquette : contenus d’exemple, aucune donnée transmise.</span><span>Visuels issus du sujet 24h By Webcup 2026.</span></footer>');
  document.body.insertAdjacentHTML("afterbegin", '<a class="lien-evitement" href="#contenu">Aller au contenu</a>');
  document.body.insertAdjacentHTML("beforeend", '<nav class="nav-bas" aria-label="Navigation principale"><span class="nav-bas-actif" aria-hidden="true"></span>' + liens() + "</nav>");

  function placerIndicateurs() {
    var a = $('.menu a[aria-current="page"]'), ind = $(".menu-actif");
    if (a && ind) ind.style.transform = "translateY(" + a.offsetTop + "px)";
    var b = $('.nav-bas a[aria-current="page"]'), ind2 = $(".nav-bas-actif");
    if (b && ind2) { ind2.style.width = b.offsetWidth + "px"; ind2.style.transform = "translateX(" + b.offsetLeft + "px)"; }
  }
  placerIndicateurs();
  addEventListener("resize", placerIndicateurs);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placerIndicateurs);

  var horloge = $(".horloge");
  function heure() { horloge.textContent = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }); }
  heure(); setInterval(heure, 15000);

  /* ---------- Toasts ---------- */
  var pile = document.createElement("div");
  pile.className = "toasts"; pile.setAttribute("role", "status"); pile.setAttribute("aria-live", "polite");
  document.body.appendChild(pile);
  function toast(texte) {
    var t = document.createElement("div");
    t.className = "toast"; t.innerHTML = IC.coche + "<span></span>"; t.lastChild.textContent = texte;
    pile.appendChild(t);
    var reste = 4000, debut, minuteur;
    function lancer() { debut = Date.now(); minuteur = setTimeout(fermer, reste); }
    function pause() { clearTimeout(minuteur); reste -= Date.now() - debut; }
    function fermer() { t.classList.add("sortie"); setTimeout(function () { t.remove(); }, 220); }
    t.addEventListener("pointerenter", pause); t.addEventListener("pointerleave", lancer);
    document.addEventListener("visibilitychange", function () { if (document.hidden) pause(); else lancer(); });
    lancer();
  }
  function copier(texte, message) {
    if (navigator.clipboard) navigator.clipboard.writeText(texte).then(function () { toast(message); }, function () { toast("Copie impossible sur ce navigateur"); });
    else toast("Copie impossible sur ce navigateur");
  }

  /* ---------- Tiroir de détail ---------- */
  var tiroir = document.createElement("dialog");
  tiroir.className = "tiroir"; tiroir.setAttribute("aria-labelledby", "tiroir-titre");
  document.body.appendChild(tiroir);
  tiroir.addEventListener("click", function (e) { if (e.target === tiroir) tiroir.close(); });
  var BOUTON_FERMER = '<button class="fermer" type="button" aria-label="Fermer">' + IC.fermer + "</button>";
  function ouvrirTiroir(html) {
    tiroir.innerHTML = '<div class="tiroir-interieur">' + html + "</div>";
    $(".fermer", tiroir).addEventListener("click", function () { tiroir.close(); });
    tiroir.showModal();
  }
  function trouver(liste, id) { return liste.filter(function (x) { return x.id === id; })[0]; }
  function ficheService(s) {
    ouvrirTiroir(
      '<div class="tiroir-tete"><span class="icone ' + s.couleur + '">' + I[s.id] + "</span>" + BOUTON_FERMER + "</div>" +
      '<div class="tiroir-corps"><h2 id="tiroir-titre">' + echapper(s.nom) + "</h2><p>" + echapper(s.description) + "</p>" +
      '<dl class="infos"><div><dt>Lieu</dt><dd>' + echapper(s.lieu) + "</dd></div><div><dt>Horaires</dt><dd>" + echapper(s.horaires) + "</dd></div><div><dt>Délai habituel</dt><dd>" + echapper(s.delai) + "</dd></div></dl>" +
      "<h3>Démarches possibles</h3><ul>" + s.demarches.map(function (d) { return "<li>" + echapper(d) + "</li>"; }).join("") + "</ul></div>" +
      '<div class="tiroir-pied"><a class="btn btn-lime" href="contact.html?service=' + s.id + '">Écrire à ce service ' + I.fleche + "</a></div>"
    );
  }
  function ficheAnnonce(a) {
    ouvrirTiroir(
      '<div class="tiroir-visuel"><img src="assets/terra-nova/backgrounds/planete-orbite.svg" alt="" width="1380" height="430"></div>' +
      '<div class="tiroir-tete"><span class="type type-' + a.type + '">' + echapper(a.typeNom) + ' · <time datetime="' + a.date + '">' + a.jour + " " + a.mois + "</time></span>" + BOUTON_FERMER + "</div>" +
      '<div class="tiroir-corps"><h2 id="tiroir-titre">' + echapper(a.titre) + "</h2>" + a.corps.map(function (p) { return "<p>" + echapper(p) + "</p>"; }).join("") +
      "<h3>À retenir</h3><ul>" + a.points.map(function (p) { return "<li>" + echapper(p) + "</li>"; }).join("") + "</ul></div>" +
      '<div class="tiroir-pied"><button class="btn btn-verre" type="button" data-partager>Copier le lien</button></div>'
    );
    $("[data-partager]", tiroir).addEventListener("click", function () {
      copier(location.href.replace(/[^/]*$/, "") + "annonces.html#" + a.id, "Lien de l’annonce copié");
    });
  }

  /* ---------- Rendus ---------- */
  function carteService(s, compact) {
    return '<button class="carte-service lueur" type="button" data-service="' + s.id + '" style="view-transition-name:svc-' + s.id + '">' +
      '<span class="icone ' + s.couleur + '" aria-hidden="true">' + I[s.id] + "</span><strong>" + echapper(s.nom) + "</strong><small>" + echapper(s.accroche) + "</small>" +
      (compact ? "" : '<span class="meta"><span class="etiquette ouvert">' + echapper(s.horaires) + "</span></span>") + "</button>";
  }
  function carteAnnonce(a) {
    return '<button class="annonce lueur" type="button" data-annonce="' + a.id + '" style="view-transition-name:ann-' + a.id + '">' +
      '<span class="date" aria-hidden="true">' + a.jour + "<small>" + a.mois + "</small></span>" +
      '<span><span class="type type-' + a.type + '">' + echapper(a.typeNom) + "</span><h3>" + echapper(a.titre) + "</h3><p>" + echapper(a.resume) + "</p></span>" +
      '<span class="fleche" aria-hidden="true">' + I.fleche + "</span></button>";
  }
  $$("[data-services]").forEach(function (el) {
    var compact = el.hasAttribute("data-compact");
    el.innerHTML = SERVICES.map(function (s) { return carteService(s, compact); }).join("");
  });
  $$("[data-annonces]").forEach(function (el) {
    var n = +el.getAttribute("data-annonces") || ANNONCES.length;
    el.innerHTML = ANNONCES.slice(0, n).map(carteAnnonce).join("");
  });
  document.addEventListener("click", function (e) {
    var s = e.target.closest("[data-service]"), a = e.target.closest("[data-annonce]");
    if (s) ficheService(trouver(SERVICES, s.dataset.service));
    if (a) ficheAnnonce(trouver(ANNONCES, a.dataset.annonce));
  });
  function ouvrirDepuisAncre() {
    var id = location.hash.slice(1), cible = trouver(SERVICES, id) || trouver(ANNONCES, id);
    if (cible) (cible.nom ? ficheService : ficheAnnonce)(cible);
  }
  if (location.hash) setTimeout(ouvrirDepuisAncre, 300);
  addEventListener("hashchange", ouvrirDepuisAncre);

  /* ---------- Lueur qui suit le pointeur (souris uniquement) ---------- */
  if (souris && !reduit) {
    document.addEventListener("pointermove", function (e) {
      var el = e.target.closest && e.target.closest(".lueur");
      if (!el) return;
      var r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (e.clientX - r.left) + "px");
      el.style.setProperty("--my", (e.clientY - r.top) + "px");
    }, { passive: true });
  }

  /* ---------- Palette de commandes (Ctrl+K) : ouverture instantanée, action clavier fréquente ---------- */
  var palette = document.createElement("dialog");
  palette.className = "palette"; palette.setAttribute("aria-label", "Recherche rapide");
  palette.innerHTML =
    '<div class="palette-champ">' + IC.loupe + '<input type="text" role="combobox" aria-expanded="true" aria-controls="palette-liste" aria-autocomplete="list" placeholder="Rechercher un service, une annonce, une page…" autocomplete="off"></div>' +
    '<ul id="palette-liste" role="listbox" aria-label="Résultats"></ul>' +
    '<div class="palette-pied"><span><span class="kbd">↑ ↓</span> naviguer</span><span><span class="kbd">Entrée</span> ouvrir</span><span><span class="kbd">Échap</span> fermer</span></div>';
  document.body.appendChild(palette);
  var pInput = $("input", palette), pListe = $("ul", palette), pItems = [], pIndex = 0;
  var ENTREES = PAGES.map(function (p) { return { groupe: "Pages", titre: p.nom, aide: p.aide, ic: p.ic, couleur: "", href: p.href }; })
    .concat(SERVICES.map(function (s) { return { groupe: "Services", titre: s.nom, aide: s.accroche, ic: I[s.id], couleur: s.couleur, href: "services.html#" + s.id, mots: s.description + " " + s.demarches.join(" ") }; }))
    .concat(ANNONCES.map(function (a) { return { groupe: "Annonces", titre: a.titre, aide: a.typeNom + ", " + a.jour + " " + a.mois, ic: I.annonce, couleur: "peche", href: "annonces.html#" + a.id, mots: a.resume }; }));
  function rendrePalette() {
    var q = sansAccents(pInput.value.trim());
    pItems = ENTREES.filter(function (e) { return !q || sansAccents(e.titre + " " + e.aide + " " + (e.mots || "")).indexOf(q) > -1; });
    pIndex = 0;
    if (!pItems.length) { pListe.innerHTML = '<li class="palette-vide">Aucun résultat pour « ' + echapper(pInput.value) + " ».</li>"; pInput.removeAttribute("aria-activedescendant"); return; }
    var groupe = "", html = "";
    pItems.forEach(function (e, i) {
      if (e.groupe !== groupe) { groupe = e.groupe; html += '<li class="groupe" role="presentation">' + groupe + "</li>"; }
      html += '<li role="option" id="po-' + i + '" data-i="' + i + '" aria-selected="' + (i === 0) + '"><span class="icone ' + e.couleur + '" aria-hidden="true">' + e.ic + "</span><span>" + echapper(e.titre) + "<small>" + echapper(e.aide) + "</small></span></li>";
    });
    pListe.innerHTML = html;
    pInput.setAttribute("aria-activedescendant", "po-0");
  }
  function selectionner(i) {
    if (!pItems.length) return;
    pIndex = (i + pItems.length) % pItems.length;
    $$('[role="option"]', pListe).forEach(function (li) { li.setAttribute("aria-selected", String(+li.dataset.i === pIndex)); });
    var li = $("#po-" + pIndex, pListe);
    pInput.setAttribute("aria-activedescendant", "po-" + pIndex);
    if (li) li.scrollIntoView({ block: "nearest" });
  }
  function aller(i) {
    var e = pItems[i]; if (!e) return;
    palette.close();
    var cible = e.href.split("#");
    if (location.pathname.split("/").pop() === cible[0] && cible[1]) { location.hash = cible[1]; ouvrirDepuisAncre(); }
    else location.href = e.href;
  }
  function ouvrirPalette() { pInput.value = ""; rendrePalette(); palette.showModal(); pInput.focus(); }
  pInput.addEventListener("input", rendrePalette);
  pInput.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") { e.preventDefault(); selectionner(pIndex + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); selectionner(pIndex - 1); }
    else if (e.key === "Enter") { e.preventDefault(); aller(pIndex); }
  });
  pListe.addEventListener("click", function (e) { var li = e.target.closest('[role="option"]'); if (li) aller(+li.dataset.i); });
  palette.addEventListener("click", function (e) { if (e.target === palette) palette.close(); });
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); if (palette.open) palette.close(); else ouvrirPalette(); }
  });
  $$("[data-palette]").forEach(function (b) { b.addEventListener("click", ouvrirPalette); });

  /* ---------- Filtres et recherche (réorganisation animée) ---------- */
  function avecTransition(maj) {
    if (reduit || !document.startViewTransition) return maj();
    document.documentElement.classList.add("vt-filtre");
    var vt = document.startViewTransition(maj);
    vt.finished.finally(function () { document.documentElement.classList.remove("vt-filtre"); });
  }
  function curseurPuces(groupe) {
    var c = $(".curseur", groupe), b = $('[aria-pressed="true"]', groupe);
    if (!c || !b) return;
    c.style.width = b.offsetWidth + "px";
    c.style.transform = "translate(" + b.offsetLeft + "px," + b.offsetTop + "px)";
  }
  $$(".puces-filtre").forEach(function (g) {
    curseurPuces(g);
    addEventListener("resize", function () { curseurPuces(g); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { curseurPuces(g); });
  });
  function brancherFiltre(items, correspond) {
    var groupe = $(".puces-filtre"), champ = $("[data-recherche]"), vide = $(".vide"), filtre = "tout";
    function appliquer() {
      var q = champ ? sansAccents(champ.value.trim()) : "", n = 0;
      avecTransition(function () {
        items().forEach(function (el) { var ok = correspond(el, filtre, q); el.hidden = !ok; if (ok) n++; });
        if (vide) vide.classList.toggle("visible", n === 0);
      });
    }
    function choisir(valeur) {
      $$("button[data-filtre]", groupe).forEach(function (x) { x.setAttribute("aria-pressed", String(x.dataset.filtre === valeur)); });
      curseurPuces(groupe); filtre = valeur; appliquer();
    }
    if (groupe) groupe.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-filtre]");
      if (b && b.getAttribute("aria-pressed") !== "true") choisir(b.dataset.filtre);
    });
    if (champ) {
      var attente;
      champ.addEventListener("input", function () { clearTimeout(attente); attente = setTimeout(appliquer, 120); });
      var q0 = new URLSearchParams(location.search).get("q");
      if (q0) { champ.value = q0; appliquer(); }
    }
    var reinit = $("[data-reinitialiser]");
    if (reinit) reinit.addEventListener("click", function () { if (champ) champ.value = ""; if (groupe) choisir("tout"); else appliquer(); if (champ) champ.focus(); });
  }
  if (page === "services") {
    brancherFiltre(function () { return $$("[data-service]"); }, function (el, f, q) {
      var s = trouver(SERVICES, el.dataset.service);
      return (f === "tout" || s.theme === f) && (!q || sansAccents(s.nom + " " + s.accroche + " " + s.description + " " + s.demarches.join(" ")).indexOf(q) > -1);
    });
  }
  if (page === "annonces") {
    brancherFiltre(function () { return $$("[data-annonce]"); }, function (el, f) { return f === "tout" || trouver(ANNONCES, el.dataset.annonce).type === f; });
  }

  /* ---------- Accueil : première visite + parallaxe ---------- */
  if (page === "accueil" && !stocker("tn-vu-3")) { document.body.classList.add("premiere-visite"); stocker("tn-vu-3", "1"); }
  var hublot = $(".hublot");
  if (hublot && souris && !reduit) {
    var img = $("img", hublot), cx = 0, cy = 0, x = 0, y = 0, anim = null;
    var boucle = function () {
      x += (cx - x) * 0.08; y += (cy - y) * 0.08;
      img.style.transform = "translate3d(" + x.toFixed(2) + "px," + y.toFixed(2) + "px,0) scale(1.04)";
      anim = (Math.abs(cx - x) > 0.05 || Math.abs(cy - y) > 0.05) ? requestAnimationFrame(boucle) : null;
    };
    var viser = function (nx, ny) { cx = nx; cy = ny; if (!anim) anim = requestAnimationFrame(boucle); };
    hublot.addEventListener("pointermove", function (e) {
      var r = hublot.getBoundingClientRect();
      viser(((e.clientX - r.left) / r.width - 0.5) * -14, ((e.clientY - r.top) / r.height - 0.5) * -10);
    });
    hublot.addEventListener("pointerleave", function () { viser(0, 0); });
  }

  /* ---------- Révélations au défilement (une seule fois) ---------- */
  var aReveler = $$(".revele, .revele-image");
  if (aReveler.length && "IntersectionObserver" in window) {
    document.documentElement.classList.add("js-revele");
    var io = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("vu"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    aReveler.forEach(function (el) {
      if (el.getBoundingClientRect().top < innerHeight) el.classList.add("vu");
      else { el.style.transitionDelay = (el.dataset.decalage || 0) + "ms"; io.observe(el); }
    });
  }

  /* ---------- Contact ---------- */
  var form = $("#form-contact");
  if (form) {
    var choix = $("[data-choix-services]");
    choix.innerHTML = SERVICES.map(function (s) {
      return '<label><input type="radio" name="service" value="' + s.id + '"><span class="icone ' + s.couleur + '" aria-hidden="true">' + I[s.id] + "</span>" + echapper(s.nom) + "</label>";
    }).join("") + '<label><input type="radio" name="service" value="accueil" checked><span class="icone" aria-hidden="true">' + I.grille + "</span>Je ne sais pas</label>";
    var pre = new URLSearchParams(location.search).get("service");
    if (pre) { var r = $('input[value="' + pre + '"]', choix); if (r) r.checked = true; }

    var message = $("#message"), compteur = $("[data-compteur]"), MAX = 1000;
    function compter() { compteur.textContent = message.value.length + " / " + MAX; }
    ["objet", "message", "email"].forEach(function (id) {
      var el = $("#" + id), v = stocker("tn-brouillon-" + id);
      if (v) el.value = v;
      el.addEventListener("input", function () { stocker("tn-brouillon-" + id, el.value); });
    });
    message.addEventListener("input", compter); compter();

    var regles = {
      objet: function (v) { return v.trim().length >= 4 || "Indiquez un objet d’au moins 4 caractères."; },
      message: function (v) { return v.trim().length >= 20 || "Décrivez votre demande en 20 caractères au moins."; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || "Saisissez une adresse e-mail valide, par exemple nom@exemple.tn."; }
    };
    function verifier(id) {
      var el = $("#" + id), ok = regles[id](el.value), champ = el.closest(".champ");
      champ.classList.toggle("erreur", ok !== true);
      el.setAttribute("aria-invalid", String(ok !== true));
      $(".msg-erreur", champ).textContent = ok === true ? "" : ok;
      return ok === true;
    }
    Object.keys(regles).forEach(function (id) {
      $("#" + id).addEventListener("blur", function () { if (this.value) verifier(id); });
      $("#" + id).addEventListener("input", function () { if (this.closest(".champ").classList.contains("erreur")) verifier(id); });
    });

    var bouton = $(".btn-envoi"), etat = $(".etat", bouton);
    function changerEtat(html, ensuite) {
      if (reduit) { etat.innerHTML = html; if (ensuite) ensuite(); return; }
      etat.classList.add("change");
      setTimeout(function () { etat.innerHTML = html; etat.classList.remove("change"); if (ensuite) ensuite(); }, 160);
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var invalides = Object.keys(regles).filter(function (id) { return !verifier(id); });
      if (invalides.length) { $("#" + invalides[0]).focus(); return; }
      bouton.disabled = true;
      changerEtat('<span class="rotation" aria-hidden="true"></span>Envoi en cours…');
      setTimeout(function () { changerEtat(IC.coche + "Message envoyé", function () { setTimeout(afficherRecu, 450); }); }, 900);
    });
    function afficherRecu() {
      var s = trouver(SERVICES, $('input[name="service"]:checked', form).value);
      var numero = "TN-" + new Date().getFullYear() + "-" + String(Math.floor(1000 + Math.random() * 9000));
      var recu = $(".recu");
      $("[data-recu-service]", recu).textContent = s ? "au service " + s.nom : "à l’accueil de la mairie, qui l’orientera";
      $("[data-recu-numero]", recu).textContent = numero;
      $("[data-recu-email]", recu).textContent = $("#email").value.trim();
      form.hidden = true; recu.classList.add("visible"); $("h2", recu).focus();
      ["objet", "message", "email"].forEach(function (id) { stocker("tn-brouillon-" + id, ""); });
      $("[data-copier]", recu).onclick = function () { copier(numero, "Numéro " + numero + " copié"); };
    }
    $("[data-nouveau]").addEventListener("click", function () {
      form.reset(); compter();
      $$(".champ.erreur", form).forEach(function (c) { c.classList.remove("erreur"); });
      bouton.disabled = false; etat.innerHTML = "Envoyer le message " + I.fleche;
      $(".recu").classList.remove("visible"); form.hidden = false; $("#objet").focus();
    });
  }
})();

