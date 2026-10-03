const db = require('./db');

const SERVICES = [
  ['etat-civil', 'État civil', '🪪', 'Naissances, mariages, décès, cartes d\'identité et passeports.', 'Le service État civil délivre les actes (naissance, mariage, décès), instruit les demandes de carte d\'identité et de passeport, et enregistre les PACS. Pensez à prendre rendez-vous pour les titres d\'identité.', 'Lun-Ven 8h-16h, Sam 8h-12h', 'etat-civil@terranova.fr · 0262 00 00 01'],
  ['urbanisme', 'Urbanisme & habitat', '🏗️', 'Permis de construire, déclarations de travaux, logement.', 'Déposez vos demandes de permis de construire, déclarations préalables et certificats d\'urbanisme. Le service accompagne aussi l\'accès au logement social et la rénovation énergétique.', 'Lun-Ven 8h-15h', 'urbanisme@terranova.fr · 0262 00 00 02'],
  ['proprete', 'Propreté & déchets', '♻️', 'Collecte des déchets, encombrants, déchetteries.', 'Calendrier de collecte par quartier, enlèvement des encombrants sur rendez-vous, localisation des déchetteries et des points de tri.', 'Lun-Sam 7h-18h', 'proprete@terranova.fr · 0262 00 00 03'],
  ['education', 'Écoles & jeunesse', '🎒', 'Inscriptions scolaires, cantine, périscolaire.', 'Inscription en maternelle et élémentaire, restauration scolaire, accueil périscolaire, centres de loisirs pendant les vacances.', 'Lun-Ven 8h-16h', 'education@terranova.fr · 0262 00 00 04'],
  ['social', 'Action sociale (CCAS)', '🤝', 'Aides, accompagnement des seniors et des familles.', 'Le Centre Communal d\'Action Sociale accompagne les habitants en difficulté : aides d\'urgence, domiciliation, portage de repas, accompagnement des seniors.', 'Lun-Ven 8h-16h', 'ccas@terranova.fr · 0262 00 00 05'],
  ['voirie', 'Voirie & travaux', '🚧', 'Signaler un problème sur la voie publique, travaux en cours.', 'Nids-de-poule, éclairage public, signalisation : signalez un problème et suivez les chantiers en cours dans votre quartier.', 'Lun-Ven 7h-15h', 'voirie@terranova.fr · 0262 00 00 06'],
];

const NEWS = [
  ['Ouverture de la plateforme numérique de Terra Nova', 'Annonce', 'Les habitants peuvent désormais créer leur compte et effectuer leurs démarches en ligne.', 'La Ville de Terra Nova lance sa plateforme citoyenne. Créez votre compte pour accéder à votre espace personnel, contacter les services municipaux et suivre vos demandes.'],
  ['Nouveaux horaires du service État civil', 'Changement de service', 'À partir du mois prochain, le service ouvre aussi le samedi matin.', 'Pour faciliter vos démarches, le service État civil sera ouvert le samedi de 8h à 12h, sur rendez-vous pour les titres d\'identité.'],
  ['Collecte des encombrants : mode d\'emploi', 'Information pratique', 'Prenez rendez-vous en ligne pour faire enlever vos encombrants.', 'La collecte des encombrants se fait uniquement sur rendez-vous. Contactez le service Propreté via le formulaire de contact en précisant le volume et l\'adresse.'],
];

function seedContent() {
  if (!db.prepare('SELECT COUNT(*) n FROM services').get().n) {
    const ins = db.prepare('INSERT INTO services (slug, name, icon, summary, details, hours, contact, sort_order) VALUES (?,?,?,?,?,?,?,?)');
    SERVICES.forEach((s, i) => ins.run(...s, i));
  }
  if (!db.prepare('SELECT COUNT(*) n FROM news').get().n) {
    const ins = db.prepare("INSERT INTO news (title, category, summary, body, published_at) VALUES (?,?,?,?, datetime('now', ?))");
    NEWS.forEach((n, i) => ins.run(...n, `-${i} days`));
  }
}

module.exports = { seedContent };
