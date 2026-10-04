/* Terra Nova — couche de données côté navigateur, branchée sur le serveur (Express + SQLite).
   Même interface qu'avant pour toutes les pages (NT.store, NT.auth, NT.demandes, NT.annonces, NT.services, NT.rdv, NT.notif, NT.audit).
   Au chargement : l'état autorisé pour le profil connecté est lu en une requête (GET /api/etat) et gardé en mémoire.
   Chaque écriture part au serveur, qui contrôle les droits (D09) et renvoie le document enregistré.
   Les appels sont synchrones (XHR) pour garder une interface simple et identique dans toutes les pages.
   Restent dans le navigateur : préférences d'affichage, langue, astuces vues (réglages propres à l'appareil). */
(function () {
  'use strict';
  const NT = (window.NT = window.NT || {});
  NT._attente = NT._attente || [];
  NT.pret = fn => NT._attente.push(fn);
  const PREFIXE = 'nt:';

  /* ---------- Préférences d'affichage appliquées au plus tôt (évite le flash) ---------- */
  function lire(cle, defaut) {
    try { const v = localStorage.getItem(PREFIXE + cle); return v === null ? defaut : JSON.parse(v); }
    catch (e) { return defaut; }
  }
  function ecrire(cle, val) {
    try { localStorage.setItem(PREFIXE + cle, JSON.stringify(val)); } catch (e) { /* stockage plein ou bloqué */ }
  }
  const prefs = lire('prefs', {});
  const html = document.documentElement;
  if (prefs.taille) html.style.fontSize = prefs.taille + '%';
  if ((prefs.taille || 100) >= 150) html.classList.add('grand');
  ['contraste', 'espace', 'calme', 'souligne'].forEach(c => prefs[c] && html.classList.add(c));
  /* F59 : mode connexion lente — choix de l'habitant, sinon proposé d'office si le navigateur signale
     une connexion lente ou l'économiseur de données (aucune image décorative, polices du système, pas d'animation) */
  const reseau = navigator.connection || {};
  const reseauLent = !!reseau.saveData || /(^|-)2g$/.test(reseau.effectiveType || '');
  NT.leger = { auto: prefs.leger === undefined && reseauLent };
  if (prefs.leger === true || NT.leger.auto) html.classList.add('leger');
  NT.leger.actif = () => html.classList.contains('leger');
  // image décorative : chargée seulement hors mode léger (appelée juste après la balise <img data-srcset>)
  NT.leger.image = img => {
    if (!img || NT.leger.actif()) return;
    if (img.dataset.srcset) img.srcset = img.dataset.srcset;
    if (img.dataset.src) img.src = img.dataset.src;
  };
  /* F61 : mode « appareil peu puissant » — moins de calculs pour le processeur (pas de flou, d'ombre lourde ni d'animation,
     mises à jour en direct espacées, listes longues dessinées à la demande). Proposé d'office si l'appareil a peu de cœurs
     ou peu de mémoire, ou si le système demande moins d'animations ; l'habitant garde la main (panneau ♿). */
  const coeurs = navigator.hardwareConcurrency || 0, memoire = navigator.deviceMemory || 0;
  const mouvementReduit = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const raisons = [];
  if (coeurs && coeurs <= 2) raisons.push('coeurs');
  if (memoire && memoire <= 2) raisons.push('memoire');
  if (mouvementReduit) raisons.push('mouvement');
  if (reseau.saveData) raisons.push('economie');
  NT.econome = { coeurs, memoire, raisons, auto: prefs.econome === undefined && raisons.length > 0 };
  if (prefs.econome === true || NT.econome.auto) html.classList.add('econome');
  NT.econome.actif = () => html.classList.contains('econome');
  /* Vague 15 (F77, F78) : forte affluence. Le serveur indique son niveau de charge dans l'en-tête X-Charge
     (normal / forte / critique) et répond 503 + Retry-After aux fonctions non essentielles quand il est surchargé.
     Ici : état partagé par toutes les pages. Les mises à jour en direct ralentissent (recul exponentiel + gigue pour que
     les navigateurs ne reviennent pas tous en même temps), les widgets non essentiels se mettent en pause.
     L'affichage (pied de page, tiroir des alertes), les brouillons et les nouveaux essais sont dans resilience.js. */
  const charge = NT.charge = { niveau: 'normal', echecs: 0, injoignable: 0, ecrituresOk: 0, echecsEcriture: 0, derniereReponse: 0, _ecoute: [] };
  charge.surChangement = fn => charge._ecoute.push(fn);
  charge.observer = (statut, niveau) => {
    const avant = charge.niveau + '|' + (charge.echecs > 0) + '|' + (charge.injoignable > 1);
    if (statut === 0 || statut === 502 || statut === 504) charge.injoignable++; else if (statut > 0) charge.injoignable = 0;   // aucune réponse de l'application
    if (niveau === 'normal' || niveau === 'forte' || niveau === 'critique') charge.niveau = niveau;
    if (statut === 0 || statut === 502 || statut === 503 || statut === 504) charge.echecs = Math.min(charge.echecs + 1, 6);
    else if (statut > 0 && statut < 500) { charge.echecs = 0; charge.derniereReponse = Date.now(); }
    if (avant !== charge.niveau + '|' + (charge.echecs > 0) + '|' + (charge.injoignable > 1)) charge._ecoute.forEach(fn => { try { fn(charge); } catch (e) { /* écouteur fautif */ } });
  };
  // Facteur appliqué aux intervalles des mises à jour en direct : 1 en temps normal, jusqu'à × 20 en surcharge
  charge.facteur = () => {
    const base = charge.niveau === 'critique' ? 4 : charge.niveau === 'forte' ? 2 : 1;
    const f = Math.min(20, base * Math.pow(2, charge.echecs));
    return f === 1 ? 1 : f * (0.8 + Math.random() * 0.4);
  };
  // Widgets non essentiels (tableaux de bord, flux, statistiques) : en pause tant que le serveur est surchargé
  charge.enPause = () => charge.niveau !== 'normal' || charge.echecs > 0;
  // Rythme des mises à jour en direct : espacées (× 3) sur appareil peu puissant, ralenties en cas de forte affluence (F77, F78)
  NT.econome.delai = ms => (NT.econome.actif() ? ms * 3 : ms) * charge.facteur();
  // Les requêtes fetch() vers l'API renseignent aussi le niveau de charge
  if (window.fetch) {
    const fetchOrigine = window.fetch.bind(window);
    window.fetch = (entree, init) => {
      let api = false;
      try { const u = new URL(typeof entree === 'string' ? entree : (entree && entree.url) || '', location.href); api = u.origin === location.origin && u.pathname.startsWith('/api'); } catch (e) { /* adresse illisible */ }
      return fetchOrigine(entree, init).then(r => { if (api) charge.observer(r.status, r.headers.get('X-Charge')); return r; },
        err => { if (api) charge.observer(0); throw err; });
    };
  }
  // Mesure concrète : tâches longues (> 50 ms) qui bloquent l'appareil pendant le chargement (Chrome, Edge)
  NT.econome.taches = { n: 0, ms: 0 };
  try {
    new PerformanceObserver(l => l.getEntries().forEach(e => { NT.econome.taches.n++; NT.econome.taches.ms += e.duration; }))
      .observe({ type: 'longtask', buffered: true });
  } catch (e) { NT.econome.taches = null; /* navigateur sans cette mesure */ }

  const langue = lire('langue', 'fr');
  html.lang = langue;
  html.dir = langue === 'ar' ? 'rtl' : 'ltr';

  const maintenant = () => new Date().toISOString();
  const uid = p => (p || 'id') + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const copie = o => (o === undefined ? undefined : JSON.parse(JSON.stringify(o)));

  /* ---------- Appels serveur ---------- */
  function api(methode, url, corps) {
    const x = new XMLHttpRequest();
    x.open(methode, url, false);
    x.setRequestHeader('Content-Type', 'application/json');
    try { x.send(corps === undefined ? null : JSON.stringify(corps)); }
    catch (e) { charge.observer(0); if (methode !== 'GET') charge.echecsEcriture++; return { statut: 0, donnees: { erreur: 'Serveur injoignable. Vérifiez votre connexion.' } }; }
    let donnees = null;
    try { donnees = x.responseText ? JSON.parse(x.responseText) : null; } catch (e) { /* réponse non JSON */ }
    charge.observer(x.status, x.getResponseHeader('X-Charge'));   // F77, F78
    if (methode !== 'GET') { if (x.status >= 200 && x.status < 300) charge.ecrituresOk++; else if (x.status === 0 || x.status >= 500 || x.status === 429) charge.echecsEcriture++; }
    return { statut: x.status, donnees };
  }
  NT.api = api;

  // État en mémoire, rechargé depuis le serveur
  let etat = {};
  /* F77, F78 : dernières informations publiques connues (état des services, annonces et alertes), gardées sur l'appareil
     pour rester lisibles si le serveur ne répond plus. Jamais de donnée personnelle dans cette copie. */
  function recharger() {
    let r = api('GET', '/api/etat');
    if (r.statut === 503 || r.statut === 0) r = api('GET', '/api/etat');   // un nouvel essai immédiat (file d'attente pleine, réseau qui flanche)
    if (r.statut === 200 && r.donnees) {
      etat = r.donnees;
      NT.horsLigne = null;
      ecrire('dernierEtat', { date: maintenant(), services: etat.services || [], annonces: (etat.annonces || []).filter(a => a.active) });
      return;
    }
    const dernier = lire('dernierEtat', null);
    etat = { moi: null };
    if (r.statut === 0 || r.statut >= 500) {
      NT.horsLigne = { statut: r.statut, depuis: dernier ? dernier.date : '' };
      if (dernier) Object.assign(etat, { services: dernier.services, annonces: dernier.annonces });
    }
  }
  recharger();
  NT.recharger = recharger;
  const liste = col => (etat[col] = etat[col] || []);
  function remplacer(col, doc) {
    const l = liste(col); const i = l.findIndex(x => x.id === doc.id);
    if (i < 0) l.push(doc); else l[i] = doc;
    if (col === 'utilisateurs' && etat.moi && etat.moi.id === doc.id) etat.moi = Object.assign({}, etat.moi, doc);
    return doc;
  }
  function refus(r) {
    const msg = (r.donnees && r.donnees.erreur) || 'Action impossible.';
    console.warn('[Terra Nova]', msg);
    // F77, F78 : serveur surchargé ou injoignable → message calme, brouillon gardé, nouvel essai automatique (resilience.js)
    if ((r.statut === 0 || r.statut === 429 || r.statut >= 502) && charge.reessayer) { charge.reessayer(r); return null; }
    if (NT.ui && NT.ui.toast) NT.ui.toast(msg, 'danger');
    return null;
  }

  /* ---------- Store générique (même interface que la maquette) ---------- */
  const store = {
    get: col => copie(liste(col)),
    find: (col, id) => { const o = liste(col).find(x => x.id === id); return o ? copie(o) : null; },
    add(col, obj) {
      const r = api('POST', '/api/docs/' + col, Object.assign({ cree: maintenant() }, obj));
      return r.statut === 200 ? copie(remplacer(col, r.donnees)) : refus(r);
    },
    update(col, id, patch) {
      const avant = liste(col).find(x => x.id === id); if (!avant) return null;
      const p = typeof patch === 'function' ? patch(copie(avant)) : patch;
      const r = api('PATCH', '/api/docs/' + col + '/' + encodeURIComponent(id), p);
      return r.statut === 200 ? copie(remplacer(col, r.donnees)) : refus(r);
    },
    remove(col, id) {
      const r = api('DELETE', '/api/docs/' + col + '/' + encodeURIComponent(id));
      if (r.statut === 200) etat[col] = liste(col).filter(x => x.id !== id); else refus(r);
    },
    // Écrit une liste complète : seuls les éléments modifiés sont envoyés
    set(col, nouvelle) {
      const ancienne = liste(col);
      nouvelle.forEach(o => {
        const a = ancienne.find(x => x.id === o.id);
        if (!a) store.add(col, o);
        else if (JSON.stringify(a) !== JSON.stringify(o)) store.update(col, o.id, o);
      });
    },
    lire(cle, defaut) { if (cle === 'session') return etat.moi ? { id: etat.moi.id, depuis: lire('depuis', '') } : null; return lire(cle, defaut); },
    ecrire, uid, maintenant,
    reset() { const r = api('POST', '/api/demo/reinitialiser'); if (r.statut === 200) recharger(); else refus(r); }
  };
  NT.store = store;

  /* ---------- Constantes métier ---------- */
  NT.QUARTIERS = ['Centre', 'Nord', 'Sud', 'Est', 'Ouest'];
  NT.ROLES = { citoyen: 'Citoyen', agent: 'Agent municipal', admin: 'Administrateur' };
  NT.STATUTS = { recue: 'Reçue', en_cours: 'En cours de traitement', traitee: 'Traitée', cloturee: 'Clôturée' };

  /* ---------- Authentification + protection (D01, D03, D08, D09, F37) : décidées par le serveur ---------- */
  const VIDE = { echecs: 0, verrouJusqu: 0, blocages: 0, echecsDepuisConnexion: 0 };
  const auth = {
    utilisateur: () => (etat.moi ? copie(etat.moi) : null),
    aRole: (...roles) => !!etat.moi && roles.includes(etat.moi.role),
    validerMotDePasse(mdp) {
      const manques = [];
      if (mdp.length < 8) manques.push('8 caractères minimum');
      if (!/[A-Z]/.test(mdp)) manques.push('une majuscule');
      if (!/[0-9]/.test(mdp)) manques.push('un chiffre');
      return manques;
    },
    inscrire(donnees) {
      const r = api('POST', '/api/auth/inscrire', donnees);
      const rep = r.donnees || { ok: false, erreur: 'Serveur injoignable.' };
      if (rep.ok) { ecrire('depuis', maintenant()); recharger(); }
      return rep;
    },
    connecter(email, motdepasse, verificationReussie) {
      const r = api('POST', '/api/auth/connecter', { email, motdepasse, verificationReussie: !!verificationReussie });
      const rep = r.donnees || { ok: false, erreur: 'Serveur injoignable.' };
      if (rep.ok) { ecrire('depuis', maintenant()); recharger(); }
      return rep;
    },
    deconnecter() {
      api('POST', '/api/auth/deconnecter');
      // poste partagé : la copie hors connexion (Service Worker) des pages personnelles est purgée, sans bloquer la déconnexion
      try { if (window.caches) caches.keys().then(l => Promise.all(l.filter(k => k.startsWith('terra-nova-')).map(k => caches.delete(k)))).catch(() => {}); } catch (e) { /* stockage bloqué */ }
      recharger();
    },
    verifierMotDePasse(u, mdp) { return !!(api('POST', '/api/auth/verifier', { motdepasse: mdp || '' }).donnees || {}).ok; },
    changerMotDePasse(u, mdp) { const r = api('POST', '/api/auth/mot-de-passe', { nouveau: mdp }); if (r.statut !== 200) refus(r); return r.statut === 200; },
    supprimerCompte() { const r = api('POST', '/api/auth/supprimer'); if (r.statut === 200) recharger(); else refus(r); return r.statut === 200; },
    debloquer(email) { api('POST', '/api/auth/debloquer', { email }); recharger(); },
    etatSecurite: email => Object.assign({}, VIDE, (etat.securite || {})[String(email || '').toLowerCase()]),
    journal: () => copie(etat.journal || []),
    ecrireJournal(type, email, detail) { if (etat.moi) api('POST', '/api/journal', { type, email, detail }); },
    SEUIL_VERIF: 3, SEUIL_BLOCAGE: 5
  };
  NT.auth = auth;

  /* ---------- Journal d'audit (F47, F48) : l'auteur est fixé par le serveur ---------- */
  NT.audit = {
    log(entree) { return store.add('audit', Object.assign({ id: uid('aud') }, entree)); },
    tous: () => copie(liste('audit')).sort((a, b) => String(b.date).localeCompare(String(a.date)))
  };

  /* ---------- Notifications (F30, F40, F49) ---------- */
  const notif = {
    ajouter(userId, titre, texte, lien, niveau) {
      return store.add('notifications', { userId, titre, texte, lien: lien || '', niveau: niveau || 'info', lu: false });
    },
    // Envoi groupé (une seule requête) aux utilisateurs filtrés — réservé aux agents par le serveur
    tous(titre, texte, lien, niveau, filtre) {
      const cibles = liste('utilisateurs').filter(u => !filtre || filtre(u));
      if (!cibles.length) return;
      const r = api('POST', '/api/docs/notifications', cibles.map(u => ({ id: uid('not'), userId: u.id, titre, texte, lien: lien || '', niveau: niveau || 'info', lu: false })));
      if (r.statut === 200) r.donnees.forEach(n => remplacer('notifications', n)); else refus(r);
    },
    pour: userId => copie(liste('notifications').filter(n => n.userId === userId)).sort((a, b) => b.cree.localeCompare(a.cree)),
    nonLues: userId => liste('notifications').filter(n => n.userId === userId && !n.lu).length,
    lire(id) { store.update('notifications', id, { lu: true }); },
    toutLire() { api('POST', '/api/notifications/tout-lire'); liste('notifications').forEach(n => (n.lu = true)); }
  };
  NT.notif = notif;

  /* ---------- Demandes citoyennes (D04, D11, D16, D17, F22, F25, F26) : numéro attribué par le serveur ---------- */
  const demandes = {
    creer(data) {
      // F83 : l'accusé de réception (notification comprise) est produit par le serveur, une seule fois même si l'envoi est rejoué (F82)
      const d = store.add('demandes', Object.assign({ type: 'contact', serviceId: '', objet: '', message: '', lieu: '', quartier: '', priorite: 'normale' }, data));
      if (d && auth.utilisateur()) NT.recharger();
      return d;
    },
    changerStatut(id, statut, note) {
      const agent = auth.utilisateur();
      const avant = store.find('demandes', id);
      if (avant) NT.audit.log({ categorie: 'demande', action: 'Changement de statut', objetId: id, objetLibelle: avant.objet, avant: NT.STATUTS[avant.statut], apres: NT.STATUTS[statut], motif: note });
      const d = store.update('demandes', id, x => ({ statut, agent: x.agent || (agent ? agent.prenom + ' ' + agent.nom : ''),
        historique: x.historique.concat([{ date: maintenant(), statut, note: note || '', par: agent ? agent.prenom + ' ' + agent.nom : 'Service' }]) }));
      // F49 : l'habitant est prévenu immédiatement, avec ce qu'il doit savoir ou faire
      if (d && d.userId) notif.ajouter(d.userId, 'Votre demande ' + d.id + ' avance', 'Nouveau statut : ' + NT.STATUTS[statut] + (note ? ' — ' + note : ''), 'suivi.html?id=' + d.id, statut === 'traitee' ? 'importante' : 'info');
      return d;
    },
    pour: userId => copie(liste('demandes').filter(d => d.userId === userId)).sort((a, b) => b.cree.localeCompare(a.cree)),
    toutes: () => copie(liste('demandes')).sort((a, b) => b.cree.localeCompare(a.cree)),
    enAttente: () => copie(liste('demandes').filter(d => d.statut === 'recue'))
  };
  NT.demandes = demandes;

  /* ---------- Annonces & alertes (D06, D18, F29, F30, F31) ---------- */
  const annonces = {
    toutes: () => copie(liste('annonces')).sort((a, b) => b.cree.localeCompare(a.cree)),
    publier(a) {
      const o = store.add('annonces', Object.assign({ categorie: 'municipale', importance: 'info', zone: 'Toute la ville', active: true, consignes: [], publics: [] }, a));
      if (!o) return null;
      NT.audit.log({ categorie: 'annonce', action: o.importance === 'alerte' ? 'Diffusion d’une alerte' : 'Publication d’une annonce', objetId: o.id, objetLibelle: o.titre, apres: o.importance + ' · ' + o.zone });
      if (o.importance !== 'info') {
        const zone = o.zone;
        notif.tous((o.importance === 'alerte' ? '⚠ Alerte : ' : 'Annonce importante : ') + o.titre, o.resume || '', 'annonces.html#' + o.id, o.importance, u => {
          if (u.role !== 'citoyen') return true;
          const dansZone = zone === 'Toute la ville' || u.quartier === zone;
          if (o.importance === 'alerte') return dansZone;
          const p = u.preferences;
          if (!p) return dansZone;
          if (p.quartierSeul && zone === 'Toute la ville') return false;
          if (p.categories && p.categories.length && !p.categories.includes(o.categorie)) return false;
          return dansZone;
        });
      }
      return o;
    },
    actives() {
      const u = auth.utilisateur(); const t = maintenant();
      return annonces.toutes().filter(a => a.active && a.importance !== 'info' && (!a.expire || a.expire > t) &&
        (a.zone === 'Toute la ville' || !u || u.role !== 'citoyen' || u.quartier === a.zone || a.importance === 'alerte'));
    }
  };
  NT.annonces = annonces;

  /* ---------- Services (D05, F28, F32, F38) ---------- */
  NT.services = {
    tous: () => store.get('services'),
    get: id => store.find('services', id),
    definirEtat(id, code, message, retour) {
      const s = store.find('services', id);
      if (s) NT.audit.log({ categorie: 'service', action: 'Changement d’état du service', objetId: id, objetLibelle: s.nom.fr, avant: s.etat.code, apres: code, motif: message });
      return store.update('services', id, { etat: { code, message: message || '', retour: retour || '' } });
    },
    // F63 : désactivation rapide d'un service défectueux, réservée à l'administrateur (contrôlée et journalisée par le serveur)
    desactiver(id, infos) {
      const r = api('POST', '/api/services/' + encodeURIComponent(id) + '/desactiver', infos);
      if (r.statut === 200) { recharger(); return copie(r.donnees); }
      return refus(r);
    },
    reactiver(id) {
      const r = api('POST', '/api/services/' + encodeURIComponent(id) + '/reactiver');
      if (r.statut === 200) { recharger(); return copie(r.donnees); }
      return refus(r);
    },
    vue(id) { const r = api('PATCH', '/api/docs/services/' + encodeURIComponent(id), { vues: 1 }); if (r.statut === 200) remplacer('services', r.donnees); }
  };

  /* ---------- Rendez-vous (F39, F40) ---------- */
  NT.rdv = {
    pour: userId => copie(liste('rdv').filter(r => r.userId === userId)).sort((a, b) => a.debut.localeCompare(b.debut)),
    // jour = 'AAAA-MM-JJ' en heure locale
    pris: (serviceId, jour) => liste('rdv').filter(r => {
      if (r.serviceId !== serviceId || r.statut === 'annule') return false;
      const d = new Date(r.debut);
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') === jour;
    }).map(r => r.debut),
    creer(data) {
      const u = auth.utilisateur();
      const r = store.add('rdv', Object.assign({ statut: 'confirme', rappel: { actif: true, avant: 24, envoye: false } }, data));
      if (r && u) notif.ajouter(u.id, 'Rendez-vous confirmé', r.libelle || 'Votre rendez-vous est enregistré.', 'rendez-vous.html', 'info');
      return r;
    },
    annuler: id => store.update('rdv', id, { statut: 'annule' }),
    verifierRappels() {
      const u = auth.utilisateur(); if (!u) return;
      const t = Date.now();
      NT.rdv.pour(u.id).forEach(r => {
        if (r.statut !== 'confirme' || !r.rappel || !r.rappel.actif) return;
        const debut = new Date(r.debut).getTime();
        if (debut <= t) return;
        const delais = (r.rappel.avants && r.rappel.avants.length ? r.rappel.avants : [r.rappel.avant]).slice().sort((a, b) => b - a);
        const envoyes = r.rappel.envoyes || (r.rappel.envoye ? [r.rappel.avant] : []);
        const dus = delais.filter(h => !envoyes.includes(h) && debut - t <= h * 3600 * 1000 && !(h === 2 && r.rappel.envoye2));
        if (!dus.length) return;
        notif.ajouter(u.id, '⏰ Rappel : rendez-vous ' + new Date(r.debut).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }),
          (r.libelle || '') + (r.lieu ? ' — ' + r.lieu : '') + (r.pieces && r.pieces.length ? '. À apporter : ' + r.pieces.join(', ') : ''), 'rendez-vous.html', 'importante');
        const tous = envoyes.concat(dus);
        store.update('rdv', r.id, x => ({ rappel: Object.assign({}, x.rappel, { envoyes: tous, envoye: tous.includes(x.rappel.avant), envoye2: x.rappel.envoye2 || tous.includes(2) }) }));
      });
    }
  };

  /* ---------- Vague 15 (F77, F78, F79) : styles, textes et page de secours ----------
     Styles propres à la vague (assets/css/vague15.css) et script de tenue en charge (assets/js/resilience.js) ajoutés ici,
     sans toucher aux pages ni au thème. Page de secours : affichée par ui.js sur une page réservée quand le serveur ne
     répond pas (au lieu d'une redirection vers la connexion qui échouerait aussi). */
  const feuille = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: 'assets/css/vague15.css' });
  document.head.append(feuille);
  const scriptResilience = Object.assign(document.createElement('script'), { src: 'assets/js/resilience.js' });
  document.head.append(scriptResilience);
  if (NT.i18n && NT.i18n.ajouter) NT.i18n.ajouter({
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
  charge.pageSecours = () => {
    const t = (k, v) => NT.t(k, v);
    const echap = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const main = document.getElementById('contenu') || document.body;
    const alertes = annonces.toutes().filter(a => a.active && a.importance !== 'info').slice(0, 4);
    const depuis = NT.horsLigne && NT.horsLigne.depuis ? new Date(NT.horsLigne.depuis).toLocaleString() : '';
    main.innerHTML = `<section class="panneau secours" aria-labelledby="secours-h">
      <h1 id="secours-h">${echap(t('secours.titre'))}</h1>
      <p>${echap(t('secours.texte'))}</p>
      <p><a class="btn btn-primaire" href="tel:15"><i class="ph ph-phone" aria-hidden="true"></i>${echap(t('secours.urgences'))}</a></p>
      <h2>${echap(t('secours.alertes'))}</h2>
      ${alertes.length ? `<ul>${alertes.map(a => `<li><strong>${echap(a.titre)}</strong> — ${echap(a.zone || '')}${a.resume ? '<br>' + echap(a.resume) : ''}</li>`).join('')}</ul>` : `<p class="doux">${echap(t('secours.aucune'))}</p>`}
      ${depuis ? `<p class="doux">${echap(t('secours.date', { d: depuis }))}</p>` : ''}
      <p class="ligne"><button type="button" class="btn" id="secours-reessayer"><i class="ph ph-arrow-clockwise" aria-hidden="true"></i>${echap(t('secours.reessayer'))}</button>
        <a class="btn" href="/simple?lang=${echap(NT.i18n.langue)}"><i class="ph ph-article" aria-hidden="true"></i>${echap(t('secours.simple'))}</a>
        <a class="btn" href="index.html">${echap(t('secours.accueil'))}</a></p></section>`;
    main.querySelector('#secours-reessayer').addEventListener('click', () => location.reload());
    document.body.classList.add('pret');
  };
})();
