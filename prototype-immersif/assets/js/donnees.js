/* Contenus d'exemple de la maquette (aucune donnée réelle, aucune API appelée ici).
   Les six catégories de services sont des propositions de l'équipe, pas une exigence de l'API. */
window.TN_ICONES = {
  mobilite: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14M8 21l1.5-4M16 21l-1.5-4"/><circle cx="8.5" cy="14" r=".6" fill="currentColor"/><circle cx="15.5" cy="14" r=".6" fill="currentColor"/></svg>',
  habitat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20h18M5 20v-7a7 7 0 0 1 14 0v7"/><path d="M10 20v-4h4v4"/></svg>',
  sante: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z"/><path d="M12 10v4M10 12h4"/></svg>',
  appro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21c-4-2-6-5.5-6-9.5C6 7 9 4 12 3c3 1 6 4 6 8.5 0 4-2 7.5-6 9.5z"/><path d="M12 21V9"/></svg>',
  vie: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3 19a6 6 0 0 1 12 0M14.5 15.2A5 5 0 0 1 21 19"/></svg>',
  signalement: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>',
  annonce: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M15 9a4 4 0 0 1 0 6M18 6a8 8 0 0 1 0 12"/></svg>',
  message: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H8l-4 4z"/></svg>',
  grille: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>',
  fleche: '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>'
};

window.TN_SERVICES = [
  { id: "mobilite", nom: "Mobilité", accroche: "Navettes entre les dômes", theme: "quotidien", couleur: "",
    description: "Le réseau de navettes relie les dômes résidentiels, les serres et le Dôme central. Consultez les lignes, les horaires et les conditions d’accès.",
    lieu: "Station du Dôme central", horaires: "Navettes de 6 h à 23 h", delai: "Réponse sous 2 jours",
    demarches: ["Consulter les lignes et les horaires", "Demander un abonnement mensuel", "Signaler une navette en retard"] },
  { id: "habitat", nom: "Habitat", accroche: "Logement, adresse, travaux", theme: "quotidien", couleur: "",
    description: "Le service Habitat attribue les logements aux nouveaux arrivants et accompagne les changements de dôme ou les demandes de travaux.",
    lieu: "Dôme central, niveau 1", horaires: "Lundi au vendredi, 8 h – 16 h", delai: "Réponse sous 3 jours",
    demarches: ["Demander un logement", "Déclarer un changement d’adresse", "Demander une intervention technique"] },
  { id: "sante", nom: "Santé", accroche: "Centre médical de la colonie", theme: "soin", couleur: "",
    description: "Le centre médical assure les consultations, les vaccinations et le suivi des habitants. En cas d’urgence vitale, utilisez les bornes d’alerte des dômes.",
    lieu: "Centre médical, dôme 02", horaires: "Tous les jours, 7 h – 20 h", delai: "Rendez-vous sous 48 h",
    demarches: ["Prendre rendez-vous", "Consulter le calendrier de vaccination", "Trouver la borne d’alerte la plus proche"] },
  { id: "appro", nom: "Approvisionnement", accroche: "Marché des serres et rations", theme: "quotidien", couleur: "",
    description: "Les serres produisent l’essentiel de l’alimentation de la ville. Le comptoir des récoltes distribue les paniers et informe sur les arrivages.",
    lieu: "Comptoir des récoltes, serre 02", horaires: "Lundi au samedi, 9 h – 19 h", delai: "Réponse sous 2 jours",
    demarches: ["Réserver un panier de récoltes", "Connaître les arrivages de la semaine", "Proposer un produit au marché"] },
  { id: "vie", nom: "Vie locale", accroche: "Associations et événements", theme: "communaute", couleur: "peche",
    description: "Ateliers, jardins partagés, associations : la vie locale aide les habitants à se rencontrer et à construire la ville ensemble.",
    lieu: "Maison des habitants, dôme 04", horaires: "Mardi au samedi, 10 h – 20 h", delai: "Réponse sous 3 jours",
    demarches: ["Consulter l’agenda des événements", "Réserver une salle", "Créer une association"] },
  { id: "signalement", nom: "Signalement", accroche: "Un problème dans votre quartier", theme: "communaute", couleur: "rose",
    description: "Équipement en panne, fuite, éclairage éteint : signalez un problème dans l’espace public pour qu’une équipe technique intervienne.",
    lieu: "Centre technique municipal", horaires: "Signalements reçus 24 h/24", delai: "Prise en charge sous 24 h",
    demarches: ["Signaler un problème", "Joindre une photo et un lieu", "Recevoir un numéro de suivi"] }
];

window.TN_ANNONCES = [
  { id: "a1", type: "changement", typeNom: "Changement de service", date: "2026-10-03", jour: "03", mois: "oct.",
    titre: "Le guichet du Dôme central change d’horaires",
    resume: "À partir de la semaine prochaine, l’accueil des habitants se fait de 8 h à 16 h.",
    corps: ["À partir de la semaine prochaine, l’accueil des habitants au guichet du Dôme central se fait de 8 h à 16 h, du lundi au vendredi.",
            "Ce changement permet aux agents de consacrer la fin de journée au traitement des messages envoyés depuis la plateforme. Les démarches en ligne restent ouvertes en continu."],
    points: ["Le guichet ferme à 16 h au lieu de 18 h.", "Les messages envoyés après 16 h sont traités le lendemain."] },
  { id: "a2", type: "municipale", typeNom: "Annonce municipale", date: "2026-10-02", jour: "02", mois: "oct.",
    titre: "Les jardins partagés ouvrent au dôme 04",
    resume: "Venez découvrir les premières cultures locales et rencontrer les habitants de votre secteur.",
    corps: ["Les jardins partagés du dôme 04 ouvrent leurs portes samedi. Chaque habitant peut réserver une parcelle ou participer aux ateliers collectifs.",
            "Les équipes des serres seront présentes pour expliquer les cultures adaptées au sol de Terra Nova."],
    points: ["Ouverture samedi à 10 h.", "Inscription aux parcelles auprès de la Maison des habitants."] },
  { id: "a3", type: "pratique", typeNom: "Information pratique", date: "2026-10-01", jour: "01", mois: "oct.",
    titre: "Collecte des déchets recyclables : nouveau calendrier",
    resume: "La collecte passe désormais deux fois par semaine dans chaque dôme résidentiel.",
    corps: ["Pour accompagner l’arrivée de nouveaux habitants, la collecte des déchets recyclables passe à deux tournées par semaine.",
            "Les bacs doivent être déposés la veille au soir devant l’accès de votre bloc."],
    points: ["Dômes 01 à 03 : lundi et jeudi.", "Dômes 04 à 06 : mardi et vendredi."] },
  { id: "a4", type: "municipale", typeNom: "Annonce municipale", date: "2026-09-28", jour: "28", mois: "sept.",
    titre: "Le Haut Conseil ouvre la plateforme numérique de la ville",
    resume: "Services, annonces et contact avec la mairie sont désormais réunis au même endroit.",
    corps: ["Le Haut Conseil de Terra Nova met en service la plateforme numérique de la ville. Elle réunit les services municipaux, les annonces et un moyen simple de contacter l’administration.",
            "De nouvelles fonctions seront ajoutées au fil des besoins exprimés par les habitants."],
    points: ["Accessible depuis tous les terminaux de la colonie.", "Vos retours aident à faire évoluer la plateforme."] },
  { id: "a5", type: "changement", typeNom: "Changement de service", date: "2026-09-25", jour: "25", mois: "sept.",
    titre: "Navette N2 : nouvel arrêt aux serres",
    resume: "La ligne N2 dessert désormais l’entrée nord des serres.",
    corps: ["Depuis lundi, la navette N2 marque un arrêt supplémentaire à l’entrée nord des serres. Le temps de trajet total augmente de deux minutes."],
    points: ["Premier départ à 6 h depuis le Dôme central.", "Accès de plain-pied à tous les arrêts."] }
];

