/* Terra Nova — Carte des services (F45) et urgences / hôpitaux (F46).
   Plan SVG vectoriel dessiné depuis les données ci-dessous ; marqueurs = vrais <button> ; liste synchronisée ;
   fiche du lieu sur le même écran. Chargé en fin de <body> avec defer (après ui.js) : tout le code dans NT.pret. */
(function () {
  'use strict';
  const NT = window.NT;

  /* ---------- Traductions ---------- */
  NT.i18n.ajouter({
    fr: {
      'cm.ariane': 'Carte des services', 'cm.titre': 'Carte des services',
      'cm.intro': 'Trouvez un hôpital, un service d’urgence ou un service de la mairie, voyez s’il est ouvert et comment y aller en navette, sans changer de page.',
      'cm.planTitre': 'Plan de Terra Nova', 'cm.planRegion': 'Plan de Terra Nova, défilement horizontal possible sur petit écran', 'cm.asideLabel': 'Rechercher et choisir un lieu', 'cm.saut': 'Aller à la liste des lieux',
      'cm.urgBtn': 'Urgences et hôpitaux', 'cm.urgSous': 'Numéros utiles, lieux ouverts 24h/24, le plus proche de chez vous',
      'cm.rechercheLabel': 'Rechercher un lieu', 'cm.recherchePh': 'Pharmacie, mairie, Sud…', 'cm.effacer': 'Effacer',
      'cm.types': 'Type de lieu', 'cm.options': 'Afficher seulement', 'cm.tous': 'Tous les lieux', 'cm.ouverts': 'Ouverts maintenant', 'cm.pmrFiltre': 'Accessibles PMR',
      'cm.proche': 'Près de chez moi : mon quartier', 'cm.prochePh': 'Choisir mon quartier', 'cm.procheAide': 'La liste est triée du lieu le plus proche au plus éloigné.',
      'cm.lieux': 'Lieux', 'cm.nb0': 'Aucun lieu ne correspond à votre recherche.', 'cm.nb1': '1 lieu affiché.', 'cm.nbN': '{n} lieux affichés.', 'cm.nbTri': ' Triés par proximité du quartier {q}.',
      'cm.legTypes': 'Types de lieux', 'cm.legLignes': 'Lignes de navettes', 'cm.legGare': 'Gare orbitale', 'cm.canal': 'Canal Sud',
      'cm.t.urgence': 'Urgence', 'cm.t.sante': 'Santé', 'cm.t.administration': 'Administration', 'cm.t.social': 'Social et famille', 'cm.t.transport': 'Transport', 'cm.t.autre': 'Autres lieux',
      'cm.q.Centre': 'Centre', 'cm.q.Nord': 'Nord', 'cm.q.Sud': 'Sud', 'cm.q.Est': 'Est', 'cm.q.Ouest': 'Ouest',
      'cm.ligne.N1': 'Centre – Nord', 'cm.ligne.N2': 'Sud – Gare orbitale', 'cm.ligne.N3': 'Est – Ouest', 'cm.ligne.N4': 'Est – Gare orbitale',
      'cm.st.ouvert': 'Ouvert maintenant', 'cm.st.ferme': 'Fermé maintenant', 'cm.h24': '24h/24', 'cm.jusqua': 'jusqu’à {h}',
      'cm.ouvreAuj': 'ouvre aujourd’hui à {h}', 'cm.ouvreDem': 'ouvre demain à {h}', 'cm.ouvreJour': 'ouvre {j} à {h}',
      'cm.dansQuartier': 'Dans votre quartier', 'cm.svc.maintenance': 'Service en maintenance', 'cm.svc.incident': 'Incident sur le service',
      'cm.fermer': 'Fermer', 'cm.fermerFiche': 'Fermer la fiche du lieu', 'cm.adresse': 'Adresse', 'cm.horaires': 'Horaires', 'cm.tel': 'Téléphone', 'cm.acces': 'Accès PMR',
      'cm.pmrOui': 'Accessible aux personnes à mobilité réduite', 'cm.pmrNon': 'Accès limité pour le moment : appelez avant de venir.',
      'cm.yAller': 'Y aller en navette', 'cm.arret': 'Arrêt le plus proche', 'cm.lignes': 'Ligne(s)', 'cm.trajet': 'Calculer mon trajet', 'cm.voirService': 'Voir le service', 'cm.rdv': 'Prendre rendez-vous',
      'cm.canalFerme': 'L’arrêt {a} n’est plus desservi (montée des eaux) : descendez à {r}.',
      'cm.svcAlerte': 'Le service « {s} » est actuellement perturbé.', 'cm.svcRetour': 'Retour prévu : ', 'cm.chaleur': 'Voir l’alerte chaleur', 'cm.chaleurNote': 'Espace climatisé ouvert pendant la vague de chaleur.',
      'cm.danger': 'En danger vital : appelez le', 'cm.ou': 'ou le',
      'cm.u.titre': 'Urgences et hôpitaux', 'cm.u.note': 'En danger vital, n’attendez pas : appelez d’abord.', 'cm.u.n15': 'Urgence médicale (SAMU)', 'cm.u.n112': 'Toutes urgences',
      'cm.u.h24': 'Ouverts 24h/24', 'cm.u.proche': 'Le plus proche de chez vous (quartier {q})', 'cm.u.proche24': 'Le plus proche ouvert 24h/24', 'cm.u.choisirQ': 'Choisissez votre quartier dans « Près de chez moi » pour voir le lieu le plus proche.',
      'cm.appeler': 'Appeler le {n}',
      'cm.annonce.sel': '{nom}, {st}. Fiche affichée.', 'cm.annonce.ferme': 'Fiche fermée.'
    },
    en: {
      'cm.ariane': 'Services map', 'cm.titre': 'Services map',
      'cm.intro': 'Find a hospital, an emergency service or a city service, see whether it is open and how to get there by shuttle, without changing page.',
      'cm.planTitre': 'Map of Terra Nova', 'cm.planRegion': 'Map of Terra Nova, horizontal scrolling available on small screens', 'cm.asideLabel': 'Search and choose a place', 'cm.saut': 'Skip to the list of places',
      'cm.urgBtn': 'Emergencies and hospitals', 'cm.urgSous': 'Useful numbers, places open 24/7, the nearest to you',
      'cm.rechercheLabel': 'Search for a place', 'cm.recherchePh': 'Pharmacy, city hall, South…', 'cm.effacer': 'Clear',
      'cm.types': 'Type of place', 'cm.options': 'Show only', 'cm.tous': 'All places', 'cm.ouverts': 'Open now', 'cm.pmrFiltre': 'Wheelchair accessible',
      'cm.proche': 'Near me: my district', 'cm.prochePh': 'Choose my district', 'cm.procheAide': 'The list is sorted from the nearest place to the farthest.',
      'cm.lieux': 'Places', 'cm.nb0': 'No place matches your search.', 'cm.nb1': '1 place shown.', 'cm.nbN': '{n} places shown.', 'cm.nbTri': ' Sorted by distance from the {q} district.',
      'cm.legTypes': 'Types of places', 'cm.legLignes': 'Shuttle lines', 'cm.legGare': 'Orbital station', 'cm.canal': 'South Canal',
      'cm.t.urgence': 'Emergency', 'cm.t.sante': 'Health', 'cm.t.administration': 'Administration', 'cm.t.social': 'Social and family', 'cm.t.transport': 'Transport', 'cm.t.autre': 'Other places',
      'cm.q.Centre': 'Centre', 'cm.q.Nord': 'North', 'cm.q.Sud': 'South', 'cm.q.Est': 'East', 'cm.q.Ouest': 'West',
      'cm.ligne.N1': 'Centre – North', 'cm.ligne.N2': 'South – Orbital station', 'cm.ligne.N3': 'East – West', 'cm.ligne.N4': 'East – Orbital station',
      'cm.st.ouvert': 'Open now', 'cm.st.ferme': 'Closed now', 'cm.h24': '24/7', 'cm.jusqua': 'until {h}',
      'cm.ouvreAuj': 'opens today at {h}', 'cm.ouvreDem': 'opens tomorrow at {h}', 'cm.ouvreJour': 'opens {j} at {h}',
      'cm.dansQuartier': 'In your district', 'cm.svc.maintenance': 'Service under maintenance', 'cm.svc.incident': 'Service incident',
      'cm.fermer': 'Close', 'cm.fermerFiche': 'Close the place details', 'cm.adresse': 'Address', 'cm.horaires': 'Opening hours', 'cm.tel': 'Phone', 'cm.acces': 'Accessibility',
      'cm.pmrOui': 'Accessible to people with reduced mobility', 'cm.pmrNon': 'Limited access for now: please call before coming.',
      'cm.yAller': 'Getting there by shuttle', 'cm.arret': 'Nearest stop', 'cm.lignes': 'Line(s)', 'cm.trajet': 'Plan my trip', 'cm.voirService': 'See the service', 'cm.rdv': 'Book an appointment',
      'cm.canalFerme': 'The {a} stop is no longer served (rising water): get off at {r}.',
      'cm.svcAlerte': 'The “{s}” service is currently disrupted.', 'cm.svcRetour': 'Expected back: ', 'cm.chaleur': 'See the heat alert', 'cm.chaleurNote': 'Air-conditioned space open during the heat wave.',
      'cm.danger': 'Life in danger: call', 'cm.ou': 'or',
      'cm.u.titre': 'Emergencies and hospitals', 'cm.u.note': 'If life is in danger, do not wait: call first.', 'cm.u.n15': 'Medical emergency (ambulance)', 'cm.u.n112': 'All emergencies',
      'cm.u.h24': 'Open 24/7', 'cm.u.proche': 'Nearest to you ({q} district)', 'cm.u.proche24': 'Nearest open 24/7', 'cm.u.choisirQ': 'Choose your district under “Near me” to see the nearest place.',
      'cm.appeler': 'Call {n}',
      'cm.annonce.sel': '{nom}, {st}. Details shown.', 'cm.annonce.ferme': 'Details closed.'
    },
    es: {
      'cm.ariane': 'Mapa de servicios', 'cm.titre': 'Mapa de servicios', 'cm.planTitre': 'Plano de Terra Nova',
      'cm.urgBtn': 'Urgencias y hospitales', 'cm.rechercheLabel': 'Buscar un lugar', 'cm.effacer': 'Borrar', 'cm.fermer': 'Cerrar',
      'cm.st.ouvert': 'Abierto ahora', 'cm.st.ferme': 'Cerrado ahora', 'cm.h24': '24 h', 'cm.lieux': 'Lugares', 'cm.adresse': 'Dirección', 'cm.horaires': 'Horarios', 'cm.tel': 'Teléfono',
      'cm.rdv': 'Pedir cita', 'cm.voirService': 'Ver el servicio'
    }
  });

  /* ---------- Réseau de navettes (mêmes arrêts et lignes que transports.html) ---------- */
  // arrêt : [nom, quartier, x, y] dans le plan (viewBox 800 x 560)
  const ARRETS = {
    gare: ['Gare orbitale', 'Centre', 450, 318], mairie: ['Hôtel de ville', 'Centre', 395, 285], dispensaire: ['Dispensaire central', 'Centre', 370, 235], quai: ['Quai des Arrivées', 'Centre', 500, 350],
    serres: ['Parc des Serres', 'Nord', 320, 150], orion: ['Arrêt Orion', 'Nord', 400, 95], observatoire: ['Observatoire', 'Nord', 500, 60],
    canal: ['Canal Sud', 'Sud', 190, 478], pionniers: ['Place des Pionniers', 'Sud', 290, 505], social: ['Centre social', 'Sud', 360, 440],
    ateliers: ['Zone des Ateliers', 'Est', 740, 340], aurore: ['Résidence Aurore', 'Est', 715, 290], habitat: ['Pôle habitat', 'Est', 680, 255], kepler: ['Lycée Kepler', 'Est', 640, 305], culturel: ['Dôme culturel', 'Est', 600, 325],
    tri: ['Centre de tri', 'Ouest', 70, 300], emploi: ['Maison de l’emploi', 'Ouest', 120, 250], jardins: ['Jardins hydroponiques', 'Ouest', 170, 330]
  };
  const LIGNES = {
    N1: ['gare', 'mairie', 'dispensaire', 'serres', 'orion', 'observatoire'],
    N2: ['canal', 'pionniers', 'social', 'mairie', 'gare'],
    N3: ['tri', 'emploi', 'jardins', 'mairie', 'culturel', 'habitat'],
    N4: ['ateliers', 'aurore', 'habitat', 'kepler', 'culturel', 'quai', 'mairie', 'gare']
  };
  // Même perturbation que sur la page Transports : l'arrêt Canal Sud n'est plus desservi (montée des eaux)
  const FERMES = { canal: 'pionniers' };
  const ETIQUETTES = [['N1', 'observatoire', 10, -8], ['N2', 'canal', -28, -10], ['N3', 'tri', 10, -10], ['N3', 'habitat', 12, -10], ['N4', 'ateliers', -26, -10]];

  /* ---------- Zones du plan ---------- */
  const ZONES = {
    Nord: { pts: '22,20 778,20 778,150 570,176 400,160 230,176 22,150', lab: [680, 60], c: 'calme' },
    Ouest: { pts: '22,166 218,190 234,300 218,398 22,426', lab: [95, 205], c: 'iono-fonce' },
    Centre: { pts: '262,192 538,192 552,300 538,386 262,386 248,300', lab: [400, 372], c: 'iono' },
    Est: { pts: '778,166 582,190 566,300 582,398 778,426', lab: [690, 395], c: 'soleil' },
    Sud: { pts: '22,442 218,412 400,396 582,412 778,442 778,540 22,540', lab: [590, 525], c: 'aurore' }
  };
  const CENTRES = { Centre: [400, 290], Nord: [400, 95], Sud: [400, 480], Est: [680, 290], Ouest: [110, 300] };

  /* ---------- Lieux physiques ---------- */
  const J7 = [0, 1, 2, 3, 4, 5, 6], SEM = [1, 2, 3, 4, 5], SAM = [6], DIM = [0];
  const H24 = [[J7, '00:00', '24:00']];
  // plages : [jours (0 = dimanche), début, fin] ; fin < début = passe minuit
  const LIEUX = [
    { id: 'hotel-ville', nom: ['Hôtel de ville', 'City hall'], type: 'administration', serviceId: 'etat-civil', quartier: 'Centre', adresse: '1 place de la Mairie, niveau 1', hr: ['Lun–Ven 8h–17h, jeudi jusqu’à 19h', 'Mon–Fri 8am–5pm, Thursday until 7pm'], plages: [[[1, 2, 3, 5], '08:00', '17:00'], [[4], '08:00', '19:00']], tel: '01 55 00 10 00', pmr: true, arret: 'mairie', x: 355, y: 300, icone: 'ph-buildings' },
    { id: 'dispensaire-central', nom: ['Dispensaire central (urgences)', 'Central clinic (emergency)'], type: 'urgence', serviceId: 'sante', quartier: 'Centre', adresse: 'Dôme B, avenue du Dispensaire', hr: ['24h/24, 7j/7', 'Open 24/7'], plages: H24, ouvert24h: true, tel: '01 55 00 15 15', pmr: true, arret: 'dispensaire', x: 345, y: 205 },
    { id: 'hopital-nova', nom: ['Hôpital de Nova (urgences)', 'Nova Hospital (emergency)'], type: 'urgence', serviceId: 'sante', quartier: 'Est', adresse: 'Boulevard Kepler, quartier Est', hr: ['Urgences 24h/24, 7j/7', 'Emergency department open 24/7'], plages: H24, ouvert24h: true, tel: '01 55 00 11 12', pmr: true, arret: 'kepler', x: 620, y: 215 },
    { id: 'poste-secours-sud', nom: ['Poste de secours du dôme Sud', 'South dome first-aid post'], type: 'urgence', serviceId: 'sante', quartier: 'Sud', adresse: 'Niveau 0, dôme Sud, près du canal', hr: ['Tous les jours 8h–22h', 'Every day 8am–10pm'], plages: [[J7, '08:00', '22:00']], tel: '01 55 00 11 18', pmr: true, arret: 'canal', x: 235, y: 435 },
    { id: 'soins-nord', nom: ['Centre de soins du quartier Nord', 'North district care centre'], type: 'sante', serviceId: 'sante', quartier: 'Nord', adresse: 'Allée des Serres, quartier Nord', hr: ['Lun–Ven 8h–19h, samedi 9h–13h', 'Mon–Fri 8am–7pm, Saturday 9am–1pm'], plages: [[SEM, '08:00', '19:00'], [SAM, '09:00', '13:00']], tel: '01 55 00 12 10', pmr: true, arret: 'serres', x: 260, y: 110, icone: 'ph-stethoscope' },
    { id: 'soins-ouest', nom: ['Centre de soins du quartier Ouest', 'West district care centre'], type: 'sante', serviceId: 'sante', quartier: 'Ouest', adresse: 'Rue des Jardins, quartier Ouest', hr: ['Lun–Sam 8h–18h', 'Mon–Sat 8am–6pm'], plages: [[[1, 2, 3, 4, 5, 6], '08:00', '18:00']], tel: '01 55 00 12 20', pmr: false, arret: 'emploi', x: 175, y: 250, icone: 'ph-stethoscope' },
    { id: 'pharmacie-garde', nom: ['Pharmacie de garde', 'On-call pharmacy'], type: 'sante', serviceId: 'sante', quartier: 'Centre', adresse: 'Quai des Arrivées, niveau 0', hr: ['Tous les soirs 19h–8h, dimanche 24h/24', 'Every evening 7pm–8am, Sunday 24/7'], plages: [[DIM, '00:00', '24:00'], [J7, '19:00', '08:00']], tel: '01 55 00 12 30', pmr: true, arret: 'quai', x: 530, y: 330, icone: 'ph-pill' },
    { id: 'centre-technique', nom: ['Centre technique municipal', 'Municipal technical centre'], type: 'autre', serviceId: 'voirie', quartier: 'Ouest', adresse: 'Zone technique, quartier Ouest', hr: ['Lun–Ven 7h30–17h30', 'Mon–Fri 7:30am–5:30pm'], plages: [[SEM, '07:30', '17:30']], tel: '01 55 00 13 10', pmr: true, arret: 'jardins', x: 140, y: 375, icone: 'ph-wrench' },
    { id: 'pole-habitat', nom: ['Pôle habitat', 'Housing office'], type: 'administration', serviceId: 'logement', quartier: 'Est', adresse: 'Résidence Aurore, quartier Est', hr: ['Lun–Ven 9h–16h', 'Mon–Fri 9am–4pm'], plages: [[SEM, '09:00', '16:00']], tel: '01 55 00 13 20', pmr: true, arret: 'habitat', x: 705, y: 200, icone: 'ph-house-line' },
    { id: 'maison-emploi', nom: ['Maison de l’emploi', 'Jobs centre'], type: 'administration', serviceId: 'emploi', quartier: 'Ouest', adresse: 'Place de l’Emploi, quartier Ouest', hr: ['Lun–Ven 9h–17h', 'Mon–Fri 9am–5pm'], plages: [[SEM, '09:00', '17:00']], tel: '01 55 00 13 30', pmr: true, arret: 'emploi', x: 105, y: 295, icone: 'ph-briefcase' },
    { id: 'centre-social', nom: ['Centre social', 'Social centre'], type: 'social', serviceId: 'social', quartier: 'Sud', adresse: 'Place des Pionniers, quartier Sud', hr: ['Lun–Ven 9h–17h', 'Mon–Fri 9am–5pm'], plages: [[SEM, '09:00', '17:00']], tel: '01 55 00 14 10', pmr: true, arret: 'social', x: 395, y: 430, icone: 'ph-hand-heart' },
    { id: 'maison-enfance', nom: ['Maison de l’enfance', 'Children’s centre'], type: 'social', serviceId: 'education', quartier: 'Nord', adresse: 'Rue des Étoiles, quartier Nord', hr: ['Lun–Ven 8h30–16h30', 'Mon–Fri 8:30am–4:30pm'], plages: [[SEM, '08:30', '16:30']], tel: '01 55 00 14 20', pmr: true, arret: 'orion', x: 450, y: 140, icone: 'ph-baby' },
    { id: 'centre-tri', nom: ['Centre de tri', 'Recycling centre'], type: 'autre', serviceId: 'dechets', quartier: 'Ouest', adresse: 'Zone de recyclage, quartier Ouest', hr: ['Tous les jours 6h–20h', 'Every day 6am–8pm'], plages: [[J7, '06:00', '20:00']], tel: '01 55 00 15 10', pmr: true, arret: 'tri', x: 60, y: 345, icone: 'ph-recycle' },
    { id: 'mediatheque', nom: ['Médiathèque du dôme culturel', 'Dome library'], type: 'autre', serviceId: 'culture', quartier: 'Est', adresse: 'Dôme culturel, quartier Est', hr: ['Mar–Dim 10h–20h', 'Tue–Sun 10am–8pm'], plages: [[[2, 3, 4, 5, 6, 0], '10:00', '20:00']], tel: '01 55 00 15 20', pmr: true, arret: 'culturel', x: 590, y: 290, icone: 'ph-books' },
    { id: 'gare-orbitale', nom: ['Gare orbitale', 'Orbital station'], type: 'transport', serviceId: 'transports', quartier: 'Centre', adresse: 'Gare orbitale centrale', hr: ['Tous les jours 5h–23h', 'Every day 5am–11pm'], plages: [[J7, '05:00', '23:00']], tel: '01 55 00 16 10', pmr: true, arret: 'gare', x: 450, y: 318, icone: 'ph-tram' },
    { id: 'refraichi-sud', nom: ['Espace rafraîchi, dôme des Pionniers', 'Cooling space, Pioneers dome'], type: 'autre', serviceId: '', canicule: true, quartier: 'Sud', adresse: 'Dôme des Pionniers, quartier Sud', hr: ['Tous les jours 8h–22h pendant la vague de chaleur', 'Every day 8am–10pm during the heat wave'], plages: [[J7, '08:00', '22:00']], tel: '01 55 00 17 10', pmr: true, arret: 'pionniers', x: 330, y: 520, icone: 'ph-snowflake' },
    { id: 'refraichi-est', nom: ['Espace rafraîchi, Résidence Aurore', 'Cooling space, Aurore residence'], type: 'autre', serviceId: '', canicule: true, quartier: 'Est', adresse: 'Salle commune, Résidence Aurore, quartier Est', hr: ['Tous les jours 9h–21h pendant la vague de chaleur', 'Every day 9am–9pm during the heat wave'], plages: [[J7, '09:00', '21:00']], tel: '01 55 00 17 20', pmr: true, arret: 'aurore', x: 705, y: 345, icone: 'ph-snowflake' }
  ];
  const TYPES = ['urgence', 'sante', 'administration', 'social', 'transport', 'autre'];
  const ICONE_TYPE = { urgence: 'ph-first-aid-kit', sante: 'ph-stethoscope', administration: 'ph-buildings', social: 'ph-hand-heart', transport: 'ph-tram', autre: 'ph-map-pin' };

  /* ---------- Code de page ---------- */
  NT.pret(() => {
    const t = NT.t;
    const { echap } = NT.ui;
    const $ = id => document.getElementById(id);
    const qa = (sel, r) => Array.from((r || document).querySelectorAll(sel));
    const LOC = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES', ar: 'ar' };
    const lang = () => NT.i18n.langue;
    const pick = a => (lang() === 'fr' ? a[0] : (a[1] || a[0]));
    const pad = n => String(n).padStart(2, '0');
    const vm = s => { const p = s.split(':'); return (+p[0]) * 60 + (+p[1]); };
    const heure = m => { const h = Math.floor(m / 60) % 24, mi = m % 60; return lang() === 'fr' ? h + 'h' + pad(mi) : pad(h) + ':' + pad(mi); };
    const jourNom = d => new Intl.DateTimeFormat(LOC[lang()] || 'fr-FR', { weekday: 'long' }).format(new Date(2024, 0, 7 + d));
    const qLabel = q => t('cm.q.' + q, null, q);
    const typeLabel = ty => t('cm.t.' + ty);
    const parId = id => LIEUX.find(l => l.id === id) || null;
    const nomLieu = l => pick(l.nom);
    const arretNom = id => ARRETS[id][0];
    const arretEff = id => FERMES[id] || id;
    const lignesDe = id => Object.keys(LIGNES).filter(k => LIGNES[k].includes(id));
    const dist = (l, q) => Math.hypot(l.x - CENTRES[q][0], l.y - CENTRES[q][1]);

    const u = NT.auth.utilisateur();
    const qUser = u && NT.QUARTIERS.includes(u.quartier) ? u.quartier : '';
    const etat = { type: '', ouverts: false, pmr: false, q: qUser, sel: null, decl: 'liste' };

    /* ----- Horaires : ouvert ou fermé maintenant ----- */
    function ouverture(l, d) {
      const day = d.getDay(), m = d.getHours() * 60 + d.getMinutes();
      for (const [jours, de, a] of l.plages) {
        const s = vm(de), e = vm(a);
        if (s < e) { if (jours.includes(day) && m >= s && m < e) return { ouvert: true, jusqua: e < 1440 ? e : null }; }
        else {
          if (jours.includes(day) && m >= s) return { ouvert: true, jusqua: e };
          if (jours.includes((day + 6) % 7) && m < e) return { ouvert: true, jusqua: e };
        }
      }
      let best = null;
      for (let off = 0; off <= 7; off++) {
        const dj = (day + off) % 7;
        for (const [jours, de] of l.plages) {
          if (!jours.includes(dj)) continue;
          const abs = off * 1440 + vm(de);
          if (abs > m && (!best || abs < best.abs)) best = { abs, off, min: vm(de), jour: dj };
        }
      }
      return { ouvert: false, prochaine: best };
    }
    function statut(l) {
      const e = ouverture(l, new Date());
      let detail = '';
      if (e.ouvert) detail = l.ouvert24h ? t('cm.h24') : (e.jusqua ? t('cm.jusqua', { h: heure(e.jusqua) }) : '');
      else if (e.prochaine) {
        const p = e.prochaine, h = heure(p.min);
        detail = p.off === 0 ? t('cm.ouvreAuj', { h }) : p.off === 1 ? t('cm.ouvreDem', { h }) : t('cm.ouvreJour', { j: jourNom(p.jour), h });
      }
      return { ouvert: e.ouvert, txt: t(e.ouvert ? 'cm.st.ouvert' : 'cm.st.ferme'), detail };
    }
    const serviceDe = l => (l.serviceId ? NT.services.get(l.serviceId) : null);
    const codeService = l => { const s = serviceDe(l); return s && s.etat && s.etat.code !== 'ok' ? s.etat.code : ''; };
    const phrase = l => { const st = statut(l); return st.txt + (st.detail ? ' (' + st.detail + ')' : ''); };
    const labelMarqueur = l => [nomLieu(l), typeLabel(l.type), phrase(l), qLabel(l.quartier)].concat(codeService(l) ? [t('cm.svc.' + codeService(l))] : []).join(', ');
    const iconeLieu = l => (l.type === 'urgence' ? '<span class="cm-croix" aria-hidden="true"></span>' : `<i class="ph-duotone ${echap(l.icone || ICONE_TYPE[l.type])}" aria-hidden="true"></i>`);

    /* ----- Plan SVG ----- */
    function dessinerPlan() {
      let h = '';
      h += Object.keys(ZONES).map(q => { const z = ZONES[q]; return `<g class="cm-zone" data-q="${q}" style="--c:var(--${z.c})"><polygon points="${z.pts}"/><text x="${z.lab[0]}" y="${z.lab[1]}" text-anchor="middle">${echap(qLabel(q))}</text></g>`; }).join('');
      const canal = 'M22,478 C150,455 260,500 400,478 S650,455 778,482';
      h += `<path class="cm-canal" d="${canal}"/><path class="cm-canal-lisere" d="${canal}"/><text class="cm-canal-t" x="640" y="446">${echap(t('cm.canal'))}</text>`;
      h += Object.keys(LIGNES).map((id, i) => {
        const pts = LIGNES[id].map(s => ARRETS[s][2] + ',' + ARRETS[s][3]).join(' '), o = (i - 1.5) * 3;
        return `<g class="cm-ligne cm-${id}" transform="translate(${o} ${o})"><polyline points="${pts}"/></g>`;
      }).join('');
      h += Object.keys(ARRETS).map(id => `<circle class="cm-arret" cx="${ARRETS[id][2]}" cy="${ARRETS[id][3]}" r="4.5"/>`).join('');
      h += ETIQUETTES.map(([l, s, dx, dy]) => `<text class="cm-etq cm-${l}" x="${ARRETS[s][2] + dx}" y="${ARRETS[s][3] + dy}">${l}</text>`).join('');
      h += '<g id="cm-sel"></g>';
      $('cm-plan').innerHTML = h;
    }
    function dessinerSelection(l) {
      const g = $('cm-sel');
      if (!l) { g.innerHTML = ''; return; }
      const a = ARRETS[arretEff(l.arret)];
      const ancre = a[2] > 640 ? 'end' : a[2] < 120 ? 'start' : 'middle';
      g.innerHTML = `<line class="cm-sel-lien" x1="${l.x}" y1="${l.y}" x2="${a[2]}" y2="${a[3]}"/><circle class="cm-sel-arret" cx="${a[2]}" cy="${a[3]}" r="11"/>
        <text class="cm-sel-t" x="${a[2]}" y="${a[3] - 17}" text-anchor="${ancre}">${echap(a[0])}</text>`;
    }

    /* ----- Marqueurs (boutons) ----- */
    function dessinerMarqueurs() {
      $('cm-marqueurs').innerHTML = LIEUX.map(l => {
        const px = l.x / 8, py = l.y / 5.6;
        const cote = px < 20 ? ' cm-g' : px > 80 ? ' cm-d' : '';
        return `<li class="cm-pt${cote}" data-pt="${echap(l.id)}" style="left:${px.toFixed(2)}%;top:${py.toFixed(2)}%">
          <button type="button" class="cm-marqueur cm-t-${echap(l.type)}" data-lieu="${echap(l.id)}" data-nom="${echap(nomLieu(l))}" aria-label="${echap(labelMarqueur(l))}">${iconeLieu(l)}</button></li>`;
      }).join('');
    }

    /* ----- Légende ----- */
    function dessinerLegende() {
      const types = TYPES.map(ty => `<li><span class="cm-leg-pt cm-t-${ty}">${ty === 'urgence' ? '<span class="cm-croix" aria-hidden="true"></span>' : `<i class="ph-duotone ${ICONE_TYPE[ty]}" aria-hidden="true"></i>`}</span>${echap(typeLabel(ty))}</li>`).join('');
      const dash = { N1: '', N2: '11 6', N3: '2 6', N4: '16 4 3 4' };
      const lignes = Object.keys(LIGNES).map(id => `<li class="cm-leg-ligne cm-${id}"><svg viewBox="0 0 42 10" aria-hidden="true" focusable="false"><line x1="2" y1="5" x2="40" y2="5" ${dash[id] ? `stroke-dasharray="${dash[id]}"` : ''}/></svg><span><b>${id}</b> ${echap(t('cm.ligne.' + id))}</span></li>`).join('');
      $('cm-legende').innerHTML = `<div><h2>${echap(t('cm.legTypes'))}</h2><ul>${types}</ul></div><div><h2>${echap(t('cm.legLignes'))}</h2><ul>${lignes}</ul></div>`;
    }

    /* ----- Filtres ----- */
    const CHIPS = [['', 'cm.tous'], ['sante', 'cm.t.sante'], ['administration', 'cm.t.administration'], ['social', 'cm.t.social'], ['transport', 'cm.t.transport'], ['autre', 'cm.t.autre']];
    function dessinerControles() {
      $('cm-chips').innerHTML = CHIPS.map(([v, k]) => `<button type="button" class="cm-chip" data-type="${v}" aria-pressed="false">${echap(t(k))}</button>`).join('');
      $('cm-opts').innerHTML = `<button type="button" class="cm-chip" data-opt="ouverts" aria-pressed="false"><i class="ph ph-clock" aria-hidden="true"></i>${echap(t('cm.ouverts'))}</button>
        <button type="button" class="cm-chip" data-opt="pmr" aria-pressed="false"><i class="ph ph-wheelchair" aria-hidden="true"></i>${echap(t('cm.pmrFiltre'))}</button>`;
      $('cm-quartier').innerHTML = `<option value="">${echap(t('cm.prochePh'))}</option>` + NT.QUARTIERS.map(q => `<option value="${q}">${echap(qLabel(q))}</option>`).join('');
      $('cm-quartier').value = etat.q;
    }
    const matchType = l => !etat.type || etat.type === l.type || (etat.type === 'sante' && l.type === 'urgence');
    const visibles = () => {
      const mots = norm($('cm-q').value).split(/\s+/).filter(Boolean);
      const liste = LIEUX.filter(l => matchType(l) && (!etat.ouverts || statut(l).ouvert) && (!etat.pmr || l.pmr) && (!mots.length || mots.every(m => texteRecherche(l).includes(m))));
      return liste.sort((a, b) => {
        if (etat.q) return dist(a, etat.q) - dist(b, etat.q);
        return ((b.type === 'urgence') - (a.type === 'urgence')) || nomLieu(a).localeCompare(nomLieu(b), lang());
      });
    };
    function norm(s) { return String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim(); }
    function texteRecherche(l) {
      const s = serviceDe(l);
      return norm([l.nom.join(' '), typeLabel(l.type), l.type, l.quartier, qLabel(l.quartier), l.adresse, l.hr.join(' '), arretNom(l.arret), l.id.replace(/-/g, ' '), s ? NT.i18n.choisir(s.nom) + ' ' + s.nom.fr : '', l.canicule ? 'canicule chaleur climatise rafraichi' : ''].join(' | '));
    }

    /* ----- Liste ----- */
    function statutHtml(l) {
      const st = statut(l);
      return `<span class="statut ${st.ouvert ? 'statut-ok' : 'statut-ferme'} cm-st" data-st="${echap(l.id)}">${echap(st.txt)}</span>`;
    }
    function itemHtml(l) {
      const st = statut(l), cs = codeService(l);
      return `<li><button type="button" class="cm-item" data-lieu="${echap(l.id)}">
        <span class="cm-ic cm-t-${echap(l.type)}" aria-hidden="true">${iconeLieu(l)}</span>
        <span class="cm-item-txt"><strong>${echap(nomLieu(l))}</strong>
          <span class="cm-item-sous">${echap(typeLabel(l.type))} · ${echap(qLabel(l.quartier))}</span>
          <span class="cm-item-etat">${statutHtml(l)}<span class="cm-detail-st" data-std="${echap(l.id)}">${echap(st.detail)}</span>
            ${etat.q && l.quartier === etat.q ? `<span class="cm-tag cm-tag-proche"><i class="ph ph-map-pin" aria-hidden="true"></i>${echap(t('cm.dansQuartier'))}</span>` : ''}
            ${cs ? `<span class="cm-tag cm-tag-alerte"><i class="ph ph-wrench" aria-hidden="true"></i>${echap(t('cm.svc.' + cs))}</span>` : ''}</span>
        </span></button></li>`;
    }

    /* ----- Carte d'info urgences (F46) ----- */
    function carteUrgence() {
      const zone = $('cm-urgence-carte');
      if (etat.type !== 'urgence') { zone.innerHTML = ''; return; }
      const urg = LIEUX.filter(l => l.type === 'urgence');
      const h24 = urg.filter(l => l.ouvert24h);
      let proche = `<p class="cm-urg-choix">${echap(t('cm.u.choisirQ'))}</p>`;
      if (etat.q) {
        const tri = urg.slice().sort((a, b) => dist(a, etat.q) - dist(b, etat.q));
        const p = tri[0], p24 = tri.find(l => l.ouvert24h);
        const bouton = l => `<button type="button" class="cm-lien-lieu" data-lieu="${echap(l.id)}">${echap(nomLieu(l))}<small>${echap(qLabel(l.quartier))} · ${echap(phrase(l))}</small></button>`;
        proche = `<h3>${echap(t('cm.u.proche', { q: qLabel(etat.q) }))}</h3>${bouton(p)}` + (p24 && p24 !== p ? `<h3>${echap(t('cm.u.proche24'))}</h3>${bouton(p24)}` : '');
      }
      zone.innerHTML = `<section class="cm-urg" aria-labelledby="cm-urg-t">
        <h2 id="cm-urg-t"><i class="ph-duotone ph-first-aid-kit" aria-hidden="true"></i>${echap(t('cm.u.titre'))}</h2>
        <p>${echap(t('cm.u.note'))}</p>
        <div class="cm-appels">
          <a class="btn cm-appel" href="tel:15" aria-label="${echap(t('cm.appeler', { n: 15 }) + ', ' + t('cm.u.n15'))}"><span class="cm-num"><i class="ph-duotone ph-phone-call" aria-hidden="true"></i>15</span><small>${echap(t('cm.u.n15'))}</small></a>
          <a class="btn cm-appel" href="tel:112" aria-label="${echap(t('cm.appeler', { n: 112 }) + ', ' + t('cm.u.n112'))}"><span class="cm-num"><i class="ph-duotone ph-phone-call" aria-hidden="true"></i>112</span><small>${echap(t('cm.u.n112'))}</small></a>
        </div>
        <h3>${echap(t('cm.u.h24'))}</h3>
        <ul>${h24.map(l => `<li><button type="button" class="cm-lien-lieu" data-lieu="${echap(l.id)}">${echap(nomLieu(l))}<small>${echap(qLabel(l.quartier))} · ${echap(l.adresse)}</small></button></li>`).join('')}</ul>
        ${proche}
      </section>`;
    }

    /* ----- Rendu principal (liste + marqueurs + filtres) ----- */
    function rendre() {
      const liste = visibles(), ids = new Set(liste.map(l => l.id));
      $('cm-effacer').hidden = !$('cm-q').value;
      // boutons de filtre (mis à jour sur place : le focus reste)
      qa('[data-type]', $('cm-chips')).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.type === etat.type)));
      qa('[data-opt]', $('cm-opts')).forEach(b => b.setAttribute('aria-pressed', String(!!etat[b.dataset.opt])));
      $('cm-urgence').setAttribute('aria-pressed', String(etat.type === 'urgence'));
      // liste
      $('cm-liste').innerHTML = liste.length ? liste.map(itemHtml).join('') : `<li class="cm-liste-vide">${echap(t('cm.nb0'))}</li>`;
      carteUrgence();
      // marqueurs
      qa('.cm-pt').forEach(li => { li.hidden = !ids.has(li.dataset.pt); });
      qa('.cm-marqueur').forEach(b => b.classList.toggle('cm-proche', !!etat.q && parId(b.dataset.lieu).quartier === etat.q));
      qa('.cm-zone').forEach(z => z.classList.toggle('cm-zone-proche', !!etat.q && z.dataset.q === etat.q));
      // compteur (aria-live)
      const n = liste.length;
      $('cm-compteur').textContent = (n === 0 ? t('cm.nb0') : n === 1 ? t('cm.nb1') : t('cm.nbN', { n })) + (etat.q && n > 1 ? t('cm.nbTri', { q: qLabel(etat.q) }) : '');
      // fiche : fermée si le lieu n'est plus affiché
      if (etat.sel && !ids.has(etat.sel)) fermerFiche(false);
      majSelection();
    }
    function majSelection() {
      qa('[data-lieu]').forEach(b => { if (etat.sel && b.dataset.lieu === etat.sel) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
      qa('.cm-pt').forEach(li => li.classList.toggle('cm-actif', li.dataset.pt === etat.sel));
    }

    /* ----- Fiche du lieu (F45 : tout sur un seul écran) ----- */
    const fiche = $('cm-fiche'), grille = $('cm-grille');
    function departPour(vers) {
      let dep = 'gare';
      if (etat.q) dep = Object.keys(ARRETS).find(id => ARRETS[id][1] === etat.q && !FERMES[id]) || dep;
      if (dep === vers) dep = vers === 'mairie' ? 'gare' : 'mairie';
      return dep;
    }
    function rendreFiche() {
      const l = parId(etat.sel);
      if (!l) { fiche.hidden = true; fiche.innerHTML = ''; return; }
      const st = statut(l), svc = serviceDe(l), cs = codeService(l);
      const arret = arretEff(l.arret), lignes = lignesDe(arret);
      const lienTel = 'tel:' + l.tel.replace(/[^\d+]/g, '');
      const alerteSvc = cs ? `<div class="cm-alerte cm-alerte-${echap(cs)}" role="group" aria-label="${echap(t('cm.svc.' + cs))}">
          <i class="ph-duotone ${cs === 'incident' ? 'ph-warning-octagon' : 'ph-wrench'}" aria-hidden="true"></i>
          <div><p><strong>${echap(t('cm.svc.' + cs))}</strong></p><p>${echap(t('cm.svcAlerte', { s: NT.i18n.choisir(svc.nom) }))}</p>
          ${svc.etat.message ? `<p>${echap(svc.etat.message)}</p>` : ''}${svc.etat.retour ? `<p>${echap(t('cm.svcRetour') + svc.etat.retour)}</p>` : ''}</div></div>` : '';
      const canal = FERMES[l.arret] ? `<p class="cm-note"><i class="ph-duotone ph-warning" aria-hidden="true"></i><span>${echap(t('cm.canalFerme', { a: arretNom(l.arret), r: arretNom(FERMES[l.arret]) }))}</span></p>` : '';
      const urgence = l.type === 'urgence' ? `<p class="cm-fiche-urg">${echap(t('cm.danger'))} <a href="tel:15">15</a> ${echap(t('cm.ou'))} <a href="tel:112">112</a>.</p>` : '';
      fiche.innerHTML = `
        <div class="cm-fiche-tete">
          <span class="cm-ic cm-t-${echap(l.type)}" aria-hidden="true">${iconeLieu(l)}</span>
          <div><h2 id="cm-fiche-t">${echap(nomLieu(l))}</h2>
            <div class="cm-fiche-badges"><span class="cm-tag">${echap(typeLabel(l.type))}</span>
              <span id="cm-fiche-st">${statutHtml(l)}</span><span class="cm-detail-st" id="cm-fiche-std">${echap(st.detail)}</span></div></div>
          <button type="button" class="btn cm-fermer" data-fermer aria-label="${echap(t('cm.fermerFiche'))}"><i class="ph ph-x" aria-hidden="true"></i>${echap(t('cm.fermer'))}</button>
        </div>
        ${alerteSvc}${urgence}
        <dl class="cm-infos">
          <div><dt><i class="ph ph-map-pin" aria-hidden="true"></i>${echap(t('cm.adresse'))}</dt><dd>${echap(l.adresse)} <span class="cm-quartier-note">(${echap(qLabel(l.quartier))})</span></dd></div>
          <div><dt><i class="ph ph-clock" aria-hidden="true"></i>${echap(t('cm.horaires'))}</dt><dd>${echap(pick(l.hr))}</dd></div>
          <div><dt><i class="ph ph-phone" aria-hidden="true"></i>${echap(t('cm.tel'))}</dt><dd><a href="${echap(lienTel)}">${echap(l.tel)}</a></dd></div>
          <div><dt><i class="ph ph-wheelchair" aria-hidden="true"></i>${echap(t('cm.acces'))}</dt><dd>${echap(t(l.pmr ? 'cm.pmrOui' : 'cm.pmrNon'))}</dd></div>
        </dl>
        ${l.canicule ? `<p class="cm-note" style="margin-top:.9rem"><i class="ph-duotone ph-snowflake" aria-hidden="true"></i><span>${echap(t('cm.chaleurNote'))} <a href="annonces.html#ann-chaleur">${echap(t('cm.chaleur'))}</a></span></p>` : ''}
        <div class="cm-aller" role="group" aria-labelledby="cm-aller-t">
          <h3 id="cm-aller-t">${echap(t('cm.yAller'))}</h3>
          <p><span class="cm-lignes">${lignes.map(id => `<span class="cm-lg cm-${id}">${id}</span>`).join('')}</span>
            <span class="sr-only">${echap(t('cm.lignes'))} ${lignes.join(', ')}.</span> ${echap(t('cm.arret'))} : <strong>${echap(arretNom(arret))}</strong></p>
          ${canal}
          <div class="cm-actions"><a class="btn btn-primaire" href="transports.html?de=${encodeURIComponent(departPour(arret))}&amp;vers=${encodeURIComponent(arret)}"><i class="ph ph-tram" aria-hidden="true"></i>${echap(t('cm.trajet'))}</a></div>
        </div>
        ${svc ? `<div class="cm-actions" style="margin-top:1rem">
          <a class="btn" href="services.html#${encodeURIComponent(svc.id)}"><i class="ph ph-info" aria-hidden="true"></i>${echap(t('cm.voirService'))}</a>
          ${svc.rdv ? `<a class="btn" href="rendez-vous.html?service=${encodeURIComponent(svc.id)}"><i class="ph ph-calendar-check" aria-hidden="true"></i>${echap(t('cm.rdv'))}</a>` : ''}</div>` : ''}`;
      fiche.hidden = false;
    }
    function majUrl() {
      try {
        const p = new URLSearchParams();
        if (etat.type === 'urgence') p.set('filtre', 'urgence');
        if (etat.sel) p.set('lieu', etat.sel);
        const s = p.toString();
        history.replaceState(null, '', location.pathname + (s ? '?' + s : ''));
      } catch (e) { /* ignoré */ }
    }
    function selectionner(id, opts) {
      const l = parId(id); if (!l) return;
      opts = opts || {};
      // un lieu masqué par les filtres doit rester sélectionnable depuis l'URL : on lève les filtres gênants
      if (!visibles().some(x => x.id === id)) { etat.type = ''; etat.ouverts = false; etat.pmr = false; $('cm-q').value = ''; rendre(); }
      etat.sel = id; etat.decl = opts.decl || 'liste';
      rendreFiche(); grille.classList.add('cm-avec-fiche');
      dessinerSelection(l); majSelection(); majUrl();
      NT.ui.annoncer(t('cm.annonce.sel', { nom: nomLieu(l), st: phrase(l) }));
      if (opts.focus) fiche.focus();
    }
    function fermerFiche(rendreFocus) {
      const id = etat.sel; if (!id) return;
      etat.sel = null; fiche.hidden = true; fiche.innerHTML = '';
      grille.classList.remove('cm-avec-fiche');
      dessinerSelection(null); majSelection(); majUrl();
      if (rendreFocus) {
        NT.ui.annoncer(t('cm.annonce.ferme'));
        const cible = (etat.decl === 'marqueur' ? $('cm-marqueurs') : $('cm-zone-liste')).querySelector(`[data-lieu="${CSS.escape(id)}"]`) || $('cm-marqueurs').querySelector(`[data-lieu="${CSS.escape(id)}"]`);
        if (cible) cible.focus();
      }
    }

    /* ----- Mise à jour des statuts (horloge) sans reconstruire le DOM ----- */
    function majStatuts() {
      LIEUX.forEach(l => {
        const b = $('cm-marqueurs').querySelector(`[data-lieu="${CSS.escape(l.id)}"]`); if (b) b.setAttribute('aria-label', labelMarqueur(l));
        const st = statut(l);
        qa(`.cm-st[data-st="${CSS.escape(l.id)}"]`).forEach(el => { el.textContent = st.txt; el.className = 'statut ' + (st.ouvert ? 'statut-ok' : 'statut-ferme') + ' cm-st'; });
        qa(`[data-std="${CSS.escape(l.id)}"]`).forEach(el => { el.textContent = st.detail; });
      });
      if (etat.sel) { const el = $('cm-fiche-std'); if (el) el.textContent = statut(parId(etat.sel)).detail; }
    }

    /* ----- Événements ----- */
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-lieu]');
      if (b && ($('cm-marqueurs').contains(b) || $('cm-zone-liste').contains(b))) {
        selectionner(b.dataset.lieu, { focus: true, decl: $('cm-marqueurs').contains(b) ? 'marqueur' : 'liste' });
        return;
      }
      if (e.target.closest('[data-fermer]')) fermerFiche(true);
    });
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape' || !etat.sel) return;
      if (document.querySelector('sl-dialog[open], sl-drawer[open]')) return;
      e.preventDefault(); fermerFiche(true);
    });
    // survol / focus d'un élément de la liste : met le marqueur en évidence
    const survol = on => e => {
      const b = e.target.closest && e.target.closest('.cm-item, .cm-lien-lieu'); if (!b) return;
      const m = $('cm-marqueurs').querySelector(`[data-lieu="${CSS.escape(b.dataset.lieu)}"]`); if (m) m.classList.toggle('cm-survol', on);
    };
    $('cm-zone-liste').addEventListener('mouseover', survol(true)); $('cm-zone-liste').addEventListener('mouseout', survol(false));
    $('cm-zone-liste').addEventListener('focusin', survol(true)); $('cm-zone-liste').addEventListener('focusout', survol(false));

    $('cm-urgence').addEventListener('click', () => {
      etat.type = etat.type === 'urgence' ? '' : 'urgence';
      // la carte d'info urgences est dans la zone de liste : on referme la fiche pour la montrer tout de suite
      if (etat.sel) fermerFiche(false);
      rendre(); majUrl();
    });
    $('cm-chips').addEventListener('click', e => { const b = e.target.closest('[data-type]'); if (!b) return; etat.type = b.dataset.type; rendre(); majUrl(); });
    $('cm-opts').addEventListener('click', e => { const b = e.target.closest('[data-opt]'); if (!b) return; etat[b.dataset.opt] = !etat[b.dataset.opt]; rendre(); });
    $('cm-q').addEventListener('input', rendre);
    $('cm-form').addEventListener('submit', e => { e.preventDefault(); rendre(); });
    $('cm-effacer').addEventListener('click', () => { $('cm-q').value = ''; rendre(); $('cm-q').focus(); });
    $('cm-quartier').addEventListener('change', e => { etat.q = e.target.value; rendre(); if (etat.sel) rendreFiche(); });

    /* ----- Démarrage ----- */
    dessinerPlan(); dessinerMarqueurs(); dessinerLegende(); dessinerControles();
    const filtreUrl = NT.ui.param('filtre'), lieuUrl = NT.ui.param('lieu');
    if (filtreUrl === 'urgence') etat.type = 'urgence';
    rendre();
    if (lieuUrl && parId(lieuUrl)) selectionner(lieuUrl, { decl: 'marqueur' });
    NT.i18n.appliquer();
    setInterval(majStatuts, 60000);
  });
})();
