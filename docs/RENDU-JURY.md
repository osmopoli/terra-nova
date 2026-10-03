# Rendu pour le jury — où montrer chaque demande

Comptes : citoyen `citoyen@nova.test` / `Citoyen2026` · agent `agent@nova.test` / `Agent2026` · admin `admin@nova.test` / `Admin2026`
(la page de connexion a un encadré « Comptes de démonstration » qui pré-remplit chaque compte).

État : ✅ vérifié dans le navigateur par le superviseur (les 50 demandes)

## Accueil, navigation, services
| Code | Page | Comment le montrer | État |
|---|---|---|---|
| D07 | `index.html` | Titre « Votre mairie, ouverte jour et nuit », recherche, 4 actions principales visibles sans défiler | ✅ |
| D05 | `services.html#sante` | Clic sur un service → tiroir : horaires, lieu, contact, démarches, boutons demande / rendez-vous | ✅ |
| F28 | `services.html`, `index.html` | « Services les plus utilisés » en premier (prioritaires puis les plus consultés) | ✅ |
| F32 | `services.html?q=sante` | Recherche instantanée sans accents, compteur annoncé, filtres par thème | ✅ |
| F38 | `services.html` (Culture, Urbanisme) + `agent-alertes.html` | Encadré « indisponible / quand revenir / quoi faire » avant toute démarche ; l'agent change l'état d'un service | ✅ |
| D15 | toutes les pages | Fil d'Ariane sous l'en-tête | ✅ |
| D06 | `annonces.html`, accueil | Liste filtrable, ancre `#ann-1` qui ouvre l'annonce | ✅ |
| F36 | `transports.html` | Info trafic + « Mon trajet » : ligne, 3 prochains départs en direct | ✅ |

## Comptes, rôles, sécurité
| Code | Page | Comment le montrer | État |
|---|---|---|---|
| D01 | `inscription.html` | Création de compte, robustesse du mot de passe en direct, erreurs accessibles | ✅ |
| D03 | `connexion.html` → `espace.html` | Connexion puis « Bonjour Léa » | ✅ |
| D08 | `admin-comptes.html` | Tableau « Qui peut faire quoi » citoyen / agent / admin ; menus différents selon le rôle | ✅ |
| D09 | — | Connecté en citoyen, ouvrir `agent.html` → redirigé vers son espace + message ; accès refusé journalisé | ✅ |
| F37 | `connexion.html` | 3 mauvais mots de passe → vérification ; 5 → blocage avec compte à rebours ; l'utilisateur est prévenu à la connexion suivante ; journal de sécurité | ✅ |
| F33 | `compte.html` → « Supprimer mon compte » | Ce qui est supprimé / conservé, mot de passe + mot SUPPRIMER + confirmation | ✅ |
| F34 | `admin-comptes.html` (agent ou admin) | Désactiver / réactiver / débloquer ; seul l'admin change les rôles | ✅ |
| D12 | `inscription.html` → `espace.html` | Nouveau compte → parcours d'accueil en 3 étapes avec progression | ✅ |
| F35 | `espace.html`, pages clés | Astuces contextuelles « J'ai compris » affichées une seule fois | ✅ |

## Demandes citoyennes
| Code | Page | Comment le montrer | État |
|---|---|---|---|
| D04 | `demande.html?type=contact` | Message à un service (ou « je ne sais pas »), nom + e-mail si visiteur | ✅ |
| F25 | `demande.html?type=signalement` | « Éclairage public » → « transmis à Voirie & éclairage », plan des quartiers cliquable, photo | ✅ |
| D16 | après tout envoi | Écran « Votre demande a bien été envoyée », numéro NT-xxxx copiable, prochaines étapes | ✅ |
| D11 | `suivi.html?id=NT-1036` (citoyen) | Statut + frise des étapes datées et commentées ; complément d'information | ✅ |
| F26 | `espace.html` | Historique de toutes mes demandes, filtrable | ✅ |
| D19 | `agent.html` (agent) | Espace distinct + panneau « Flux de l'API Nova Terra » : vague, temps écoulé, toutes les demandes, rafraîchi toutes les 30 s | ✅ |
| D17 | `agent.html` | Gros compteur « demandes en attente de prise en charge » | ✅ |
| F22 | `agent-demandes.html` | Onglets par statut, « Action requise » en premier, tiroir de traitement (le citoyen est notifié) | ✅ |

## Rendez-vous
| Code | Page | Comment le montrer | État |
|---|---|---|---|
| F39 | `rendez-vous.html` (citoyen) | 3 étapes, créneau écrit en toutes lettres, lieu, agent, pièces à apporter | ✅ |
| F40 | `rendez-vous.html` | Choix du rappel (24 h / 2 h / les deux), fichier calendrier .ics, bouton « Voir un exemple de rappel » → cloche | ✅ |

## Alertes et diffusion
| Code | Page | Comment le montrer | État |
|---|---|---|---|
| D18 | `agent-alertes.html` → modèle « Message général » | Diffuser → la balise « Alertes » de tous les habitants s'allume + notification | ✅ |
| F29 | `agent-alertes.html` modèle « Montée des eaux » ; `annonces.html#ann-crue` | Consignes, zone Sud, « votre quartier est concerné » | ✅ |
| F31 | modèle « Vague de chaleur » ; `annonces.html#ann-chaleur` | Publics prioritaires, lieux frais, notification spéciale aux personnes vulnérables (`amina@`, `jean@`) | ✅ |
| F30 | `annonces.html` → « Être prévenu » | Préférences par catégorie / quartier, appliquées aux envois | ✅ |

## Accessibilité, langues, langage clair
| Code | Où | Comment le montrer | État |
|---|---|---|---|
| F24, F44 | bouton ♿ de l'en-tête | Texte de 90 à 200 %, la page reste utilisable (l'en-tête ne colle plus en grand texte) | ✅ |
| F23 | bouton ♿ | Contraste renforcé (noir / blanc), espacement du texte | ✅ |
| F43 | bouton ♿ + partout | « Souligner tous les liens » ; statuts toujours texte + icône + couleur | ✅ |
| F21, F42 | partout | Lien d'évitement, titres hiérarchisés, champs étiquetés, erreurs reliées (`aria-describedby`), annonces vocales des confirmations | ✅ |
| F41 | touche `?` | Raccourcis Alt + R/A/N/M/C/V, tout au clavier, Échap ferme les fenêtres | ✅ |
| D20 | ensemble | Toutes les fonctions accessibles dans le même parcours (pas de version à part) | ✅ |
| D14 | sélecteur de langue | FR / EN / ES / AR (l'arabe passe la page de droite à gauche) | ✅ |
| F27 | `services.html` en EN/ES/AR | Noms, descriptions et démarches courantes traduits | ✅ |
| D13 | mots en pointillés + `aide.html` | Définition au survol, au clic ou au clavier ; lexique complet et FAQ | ✅ |

## Vague 7
| Code | Page | Comment le montrer | État |
|---|---|---|---|
| F45 | `carte.html` (menu « Carte ») | Plan de la ville : 17 lieux physiques, filtres, « près de chez moi » ; clic sur un lieu → fiche ouvert/fermé, adresse, horaires, PMR, navette, rendez-vous, sur un seul écran. Lien « Voir sur la carte » depuis chaque service | ✅ |
| F46 | `carte.html?filtre=urgence` (bouton « Urgences et hôpitaux ») | Numéros 15 / 112 cliquables, lieux ouverts 24h/24, le plus proche du quartier | ✅ |
| F47 | `agent-journal.html` (agent, menu « Journal ») | Journal en lecture seule : qui, quoi, quand, avant → après, motif ; historique d'un élément ; export CSV pour l'autorité de contrôle | ✅ |
| F48 | `agent-journal.html` + `agent.html` (« Dernières actions ») | Filtre par intervenant ; toute action (statut d'une demande, alerte, état d'un service, rôle d'un compte) apparaît immédiatement | ✅ |

## Vague 8
| Code | Page | Comment le montrer | État |
|---|---|---|---|
| F49 | toutes les pages (citoyen connecté) | Un agent change l'état d'une demande → l'habitant reçoit en moins de 30 s un message à l'écran + la cloche, sans recharger | ✅ |
| F50 | `agent-tableau.html` (menu « Tableau de bord ») | 6 indicateurs avec liens d'action, « À surveiller », graphiques 14 jours / quartiers / services / statuts, avec tableaux de données | ✅ |
| F51 | `donnees.html` (pied de page « Vos données ») | Explications claires, téléchargement de mes données, question / inquiétude avec numéro CTR-xxxx, suivi et réponse de l'agent | ✅ |
| F52 | `soutenir.html` (menu « Soutenir ») | « Je soutiens » + commentaire, confirmation « vous êtes N habitants », notification à soi et à l'auteur, retrait possible | ✅ |

> Version serveur : les comptes de démonstration sont identiques ; les données sont partagées entre tous les appareils (base SQLite).
