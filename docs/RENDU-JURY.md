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
| D19 | `agent.html` (agent) | Espace distinct + panneau « Flux de l'API Terra Nova » : vague, temps écoulé, toutes les demandes, rafraîchi toutes les 30 s | ✅ |
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

## Vague 9
| Code | Page | Comment le montrer | État |
|---|---|---|---|
| F55 | `mes-informations.html` (espace citoyen « Mes informations », compte) | Toutes les informations que la ville garde sur soi, en 8 thèmes lisibles (profil, compte et sécurité, demandes en clair, rendez-vous, soutiens, contributions, notifications, préférences) avec « pourquoi » et « combien de temps » ; jamais de mot de passe ; « Télécharger (PDF / imprimer)» et fichier JSON | ✅ |
| F56 | `recapitulatif.html` (« Télécharger le récapitulatif » dans le suivi et l'espace) | Chiffres par état, délai moyen de traitement, tableau (numéro, objet, catégorie, date, état, dernière mise à jour) avec dernière réponse ; export CSV (Excel français, UTF-8) et PDF / impression | ✅ |
| D02 | `connexion.html` « Se connecter avec une clé d’accès » ; ajout dans `compte.html` › Sécurité de connexion | Connexion sans mot de passe par clé d’accès (WebAuthn : Windows Hello, empreinte, visage, code du téléphone). Déverrouillage de l’appareil obligatoire, défi à usage unique, contrôle de l’origine et du compteur de signatures (clé copiée refusée). Ajouter une clé exige de confirmer son mot de passe | ✅ |
| F53 | `compte.html` › Vérification en deux étapes, puis `connexion.html` | Activation guidée : QR code (ou clé à saisir), confirmation par un premier code, 8 codes de secours à imprimer. À la connexion, après le mot de passe : écran « Deuxième étape » ; code rejoué refusé, 5 essais au plus. Désactiver demande mot de passe + code | ✅ |
| F54 | Notification + toast en direct (F49) ; `compte.html#appareils` | Connexion depuis un appareil jamais vu : notification « Nouvel appareil connecté » (navigateur, système, date) avec la marche à suivre. Liste des appareils (« Cet appareil » signalé) ; « Retirer » déconnecte cet appareil à distance | ✅ |

> Version serveur : les comptes de démonstration sont identiques ; les données sont partagées entre tous les appareils (base SQLite).

## Vague 10
| Code | Page | Comment le montrer | État |
|---|---|---|---|
| F57 | `sobriete.html` (« Sobriété numérique », lien depuis le pied de page) | Poids, requêtes, CO2 estimé par visite (modèle Sustainable Web Design) et note A–G de l'accueil ; tableau des pages principales (poids compressé, requêtes, note en lettre et en mots) calculé par `/api/sobriete` ; « Mesuré sur cette visite » via la Performance API ; liste des mesures d'allègement (images WebP 3 tailles, polices non bloquantes, compression, « Mode connexion lente », pause hors onglet actif) ; gestes simples | ✅ |
| F58 | Toutes les pages (serveur `src/statique.js`, `index.html`) | Choix sobres appliqués aux parcours principaux : textes compressés Brotli/gzip (ex. ui.js : 8,7 Ko transférés au lieu de 29 Ko), réponses JSON de l'API compressées, ETag + cache navigateur (fichier inchangé = 304), polices non bloquantes réduites à 3 graisses, mises à jour en direct en pause quand l'onglet est caché, 6 fichiers inutiles supprimés. Vérifiable dans l'onglet Réseau des outils du navigateur | ✅ |
| F59 | Panneau ♿ › « Mode connexion lente » ; pied de page | Un interrupteur en langage clair : page allégée (pas d'image décorative ni d'animation, polices du système, mises à jour toutes les 2 min). Proposé tout seul si le navigateur signale une connexion lente ou l'économiseur de données, avec un message unique ; rappel « Mode connexion lente activé · Revenir à l'affichage complet » en pied de page. Démo : Outils du navigateur › Réseau › « 3G lente », ou activer l'interrupteur | ✅ |
| F60 | `index.html` (image d'accueil), en-tête (logo) | Image d'accueil en WebP, 3 tailles (480 / 800 / 1280) choisies par le navigateur : 416 Ko → 18 à 149 Ko ; emblème du logo 126 Ko → 3 Ko ; dimensions déclarées (pas de saut de mise en page) ; aucune image décorative téléchargée en mode connexion lente | ✅ |

## Vague 11
| Code | Page | Comment le montrer | État |
|---|---|---|---|
| F61 | Panneau ♿ › « Mode appareil peu puissant » (toutes les pages) | Proposé tout seul (message unique, sans bandeau) si l'appareil a 2 cœurs ou moins, 2 Go de mémoire ou moins, demande moins d'animations ou active l'économiseur de données. Allège le travail du processeur sans rien retirer : plus de flou d'arrière-plan ni d'ombre large, aucune animation ni effet au survol, mises à jour en direct espacées (× 3 : notifications, transports, carte, tableaux de bord), lexique chargé quand l'appareil est libre, listes longues dessinées à l'écran seulement (`content-visibility`). Mesure concrète sous l'interrupteur : cœurs, mémoire, « page prête en … ms », nombre et durée des blocages de plus de 50 ms. Démo : outils du navigateur › Performance › CPU « 4× slowdown », ou activer l'interrupteur | ✅ |
| F62 | Pied de page « Version simple » (et panneau ♿) → `/simple`, `/simple/services`, `/simple/services/logement`, `/simple/suivi` ; `services.html?simple=1` | Pages produites par le serveur : texte et actions essentielles (alertes en cours, que faire, services et leur état, suivre une demande, urgences 15 / 112), aucune image, aucun script, 4 langues (sens de lecture arabe). Poids réel affiché en pied (ex. accueil ≈ 4 Ko, 1,5 Ko compressé). Lien « Version complète » vers la page équivalente, et le lien du pied suit la page ou le service ouverts | ✅ |
| F63 | `agent-alertes.html` › État des services (admin) ; raccourci « Désactiver ce service » dans la fiche d'un service (`services.html#sante`, connecté en admin) | Bouton « Désactiver » : raison, retour prévu, prochaine action possible (téléphone, guichet, autre canal, date) ; « Réactiver » en un clic. Contrôle serveur : `POST /api/services/:id/desactiver` et `/reactiver` réservés à l'admin (citoyen et agent → 403), un agent ne peut ni désactiver ni écraser la désactivation ; tout est journalisé (`agent-journal.html`). Côté habitant : Disponible / Perturbé / Indisponible partout (services, accueil, rendez-vous, carte) ; un service désactivé ne peut pas être commencé (bouton remplacé par l'alternative, ex. « Appeler le 01 55 00 20 00 » ; le serveur refuse aussi la démarche et le rendez-vous, 409) | ✅ |
| F64 | `demande.html?type=demarche&service=urbanisme` ; fiche d'un service (`services.html#culture`) | L'état du service est affiché en haut, dès qu'il est choisi et avant de commencer, même quand tout va bien (« Service disponible : vous pouvez commencer ») ; en cas d'interruption connue : message de la ville, retour prévu et prochaine action possible | ✅ |

## Vague 12
| Code | Page | Comment le montrer | État |
|---|---|---|---|
| F65 | `participer.html#consultations` (menu « Participer », à côté de « Soutenir ») ; espace citoyen « Ma participation » | Chaque consultation affiche la question, le contexte en langage clair, les réponses possibles, la date limite (« plus que N jours »), le quartier et **qui décide** (Haut Conseil de la Ville). Citoyen `citoyen@` : répondre à « Que doit devenir l’ancienne halle ? » ou à la navette → reçu **AVI-xxxx** (numéro, date, réponse), notification dans la cloche, reçu repris dans `espace.html` › Ma participation. Une seule réponse par habitant (contrôlé par le serveur : une nouvelle réponse remplace l’ancienne, même numéro). Résultats publiés seulement à la clôture ; « Éclairage des rues la nuit » montre résultats + **décision finale + « Comment vos avis ont été pris en compte »**. Agent `agent@` : « Ouvrir une nouvelle consultation », « Clore », « Publier la décision » (participants notifiés, actions au journal, catégorie Consultation) ; un citoyen reçoit 403 | ✅ |
| F66 | `participer.html#CON-0002` (navette de nuit) | Avis **favorable / mitigé / défavorable** + commentaire facultatif, étiquette « Avis consultatif, pas un vote officiel » sur chaque carte et dans le formulaire ; confirmation « Votre avis est enregistré » avec reçu ; bouton « Modifier mon avis » jusqu’à la date limite (après : 409, « ne peut plus être modifié ») | ✅ |
| F67 | `participer.html#projets` | 6 projets avec état (à l’étude / en travaux / terminé), quartier, service, budget en euros, barre d’avancement, prochaine étape, dates de début et de fin, historique daté ; filtres par quartier et par état ; liens « Donner mon avis » / « Voir la décision » vers les consultations liées. Agent : « Mettre à jour l’avancement » (état, %, prochaine étape, note visible) → journal + notification aux habitants qui ont donné leur avis sur ce projet | ✅ |
| F68 | `participer.html#idees` ; `espace.html` › Ma participation | Formulaire titre, description, quartier, catégorie (erreurs accessibles) → numéro **IDE-xxxx**, date et prochaine étape ; « Mes idées » avec frise reçue → à l’étude → retenue / non retenue et la réponse de la ville. Agent : « Idées reçues à traiter », motif obligatoire si non retenue ; l’habitant est notifié, action au journal (catégorie Idée). Liste publique « Idées déjà étudiées » sans nom ni description ; un citoyen ne voit le détail que de ses idées | ✅ |
