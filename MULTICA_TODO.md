# Todo Multica · Terra Nova (24H By Webcup)

Format : une issue par bloc. Champs : `role` (Lead / Backend / Frontend / QA / Docs), `priority` (urgent / high / medium / low, tirée de difficulty_level et xp_total), `status` (todo / in_review / done).
Mis à jour le 4 octobre 2026 au matin (fin de l'épreuve) : **99 demandes de l'API couvertes et montrées dans `docs/RENDU-JURY.md`** (vagues 0 à 22), toutes en `done`. Le détail « où et comment le montrer au jury » reste dans `docs/RENDU-JURY.md` ; ce fichier n'est que le tableau de bord.

---

## Pilotage

## T00 · Mettre en ligne le socle
- role: Lead
- priority: urgent
- status: done
- description: Dépôt GitHub, déploiement HODI par Hodifly à chaque fusion sur `main`, variables `WEBCUP_API_KEY`, `ADMIN_PASSWORD`, `AGENT_PASSWORD`, `DATA_ENCRYPTION_KEY` définies côté hébergeur.
- acceptance:
  - Le dépôt ne contient ni `.env` ni base SQLite.
  - `/api/health` répond 200 en prod après chaque déploiement (vérifié à chaque fusion).
  - Mots de passe admin et agent par défaut remplacés (`PARTENAIRE_PASSWORD` ajouté pour les comptes partenaires de démo).

## T01 · Surveiller les vagues de l'API
- role: Lead
- priority: urgent
- status: done
- description: 22 vagues suivies depuis `/agent` ; chaque demande a sa ligne dans `docs/RENDU-JURY.md` et son bloc ci-dessous.
- acceptance:
  - Chaque request_code visible dans l'API a une issue (99 blocs ci-dessous).
  - Les demandes Difficile / Expert ont été traitées en premier.

## Q01 · Recette complète avant chaque vague
- role: QA
- priority: high
- status: done
- description: Quatre revues complètes de `main` dans la nuit du 3 au 4 octobre (sécurité d'abord, puis parcours, cohérence, rendu), balayage Chromium de toutes les pages (4 profils, FR + AR, 360 / 1280 px, charges XSS), revue de chaque vague du collègue après fusion.
- acceptance:
  - Parcours citoyen, agent, admin, partenaire vérifiés ; redirections par rôle correctes sur 43 pages.
  - 0 XSS, 0 débordement à 360 px, 0 erreur console sur le dernier balayage (`main` 879d1be) ; build et tests du moteur d'orientation au vert.
  - Correctifs livrés en PR sur GO du chef de projet : #67 #69 #70 #71 #72 #77 #79 #83 #85 #86 #87 #88 #89 #97 #100 #101 #105 #111 #112 (sécurité F37 par appareil, 3 brèches vague 17, anonymisation et débit vague 18, incident sans fausse déconnexion, ETag par encodage, fenêtre de crise réduite, traductions ES/AR, finitions d'interface).

## DOC1 · Documentation et présentation finale
- role: Docs
- priority: low
- status: done
- acceptance:
  - `README.md` (comptes, déploiement) et `docs/RENDU-JURY.md` (où et comment montrer chaque demande) à jour.
  - `HANDOFF.md` : document de passation (règles, repères, outillage).
  - Captures des écrans principaux conservées dans les PR de finition.

---

## Accueil, navigation, services

## D07 · Page d'accueil hiérarchisée (500 XP, Moyenne)
- role: Frontend
- priority: high
- status: done
- files: `index.html`
- acceptance:
  - Titre « Votre mairie, ouverte jour et nuit », recherche, 4 actions principales visibles sans défiler

## D05 · Présenter les services municipaux (250 XP, Facile)
- role: Frontend
- priority: medium
- status: done
- files: `services.html#sante`
- acceptance:
  - Clic sur un service → tiroir : horaires, lieu, contact, démarches, boutons demande / rendez-vous

## F28 · Services les plus utilisés mis en avant
- role: Frontend
- priority: medium
- status: done
- files: `services.html`, `index.html`
- acceptance:
  - « Services les plus utilisés » en premier (prioritaires puis les plus consultés)

## F32 · Rechercher et filtrer les services
- role: Frontend
- priority: medium
- status: done
- files: `services.html?q=sante`
- acceptance:
  - Recherche instantanée sans accents, compteur annoncé, filtres par thème

## F38 · Statut de disponibilité des services
- role: Frontend
- priority: medium
- status: done
- files: `services.html` (Culture, Urbanisme) + `agent-alertes.html`
- acceptance:
  - Encadré « indisponible / quand revenir / quoi faire » avant toute démarche ;
  - l'agent change l'état d'un service

## D15 · Fil d'Ariane sur toutes les pages
- role: Frontend
- priority: high
- status: done
- files: toutes les pages
- acceptance:
  - Fil d'Ariane sous l'en-tête

## D06 · Publications et annonces de la ville (250 XP, Facile)
- role: Frontend
- priority: medium
- status: done
- files: `annonces.html`, accueil
- acceptance:
  - Liste filtrable, ancre #ann-1 qui ouvre l'annonce

## F36 · Transports : navettes et horaires
- role: Frontend
- priority: medium
- status: done
- files: `transports.html`
- acceptance:
  - Info trafic + « Mon trajet » : ligne, 3 prochains départs en direct

## Comptes, rôles, sécurité

## D01 · Créer un compte habitant (250 XP, Facile)
- role: Frontend
- priority: medium
- status: done
- files: `inscription.html`
- acceptance:
  - Création de compte, robustesse du mot de passe en direct, erreurs accessibles

## D03 · Se connecter à son espace personnel (250 XP, Facile)
- role: Frontend
- priority: medium
- status: done
- files: `connexion.html` → `espace.html`
- acceptance:
  - Connexion puis « Bonjour Léa »

## D08 · Distinguer citoyens, agents et administrateurs (500 XP, Moyenne)
- role: Frontend
- priority: high
- status: done
- files: `admin-comptes.html`
- acceptance:
  - Tableau « Qui peut faire quoi » citoyen / agent / admin ;
  - menus différents selon le rôle

## D09 · Limiter les accès selon le profil (500 XP, Moyenne)
- role: Frontend
- priority: high
- status: done
- files: —
- acceptance:
  - Connecté en citoyen, ouvrir agent.html → redirigé vers son espace + message ;
  - accès refusé journalisé

## F37 · Blocage après 5 échecs de connexion (par appareil)
- role: Frontend
- priority: medium
- status: done
- files: `connexion.html`
- acceptance:
  - 3 mauvais mots de passe → vérification ;
  - 5 → blocage avec compte à rebours sur l'appareil qui a échoué seulement (cookie tn_appareil : ni un tiers à distance, ni les autres habitants du même Wi-Fi n…
  - les rafales sans cookie restent limitées à 20 connexions/min par adresse) ;

## F33 · Supprimer son compte
- role: Frontend
- priority: medium
- status: done
- files: `compte.html` → « Supprimer mon compte »
- acceptance:
  - Ce qui est supprimé / conservé, mot de passe + mot SUPPRIMER + confirmation

## F34 · Administration des comptes citoyens
- role: Frontend
- priority: medium
- status: done
- files: `admin-comptes.html` (agent ou admin)
- acceptance:
  - Désactiver / réactiver / débloquer ;
  - seul l'admin change les rôles

## D12 · Parcours d'accueil du nouveau compte en 3 étapes
- role: Frontend
- priority: high
- status: done
- files: `inscription.html` → `espace.html`
- acceptance:
  - Nouveau compte → parcours d'accueil en 3 étapes avec progression

## F35 · Astuces contextuelles de première visite
- role: Frontend
- priority: medium
- status: done
- files: `espace.html`, pages clés
- acceptance:
  - Astuces contextuelles « J'ai compris » affichées une seule fois

## Demandes citoyennes

## D04 · Contacter les services municipaux (250 XP, Facile)
- role: Frontend
- priority: medium
- status: done
- files: `demande.html?type=contact`
- acceptance:
  - Message à un service (ou « je ne sais pas »), nom + e-mail si visiteur

## F25 · Signaler un problème dans la ville
- role: Frontend
- priority: medium
- status: done
- files: `demande.html?type=signalement`
- acceptance:
  - « Éclairage public » → « transmis à Voirie & éclairage », plan des quartiers cliquable, photo

## D16 · Confirmation claire après chaque envoi
- role: Frontend
- priority: high
- status: done
- files: après tout envoi
- acceptance:
  - Écran « Votre demande a bien été envoyée », numéro NT-xxxx copiable, prochaines étapes

## D11 · Suivre une demande et ses étapes
- role: Frontend
- priority: high
- status: done
- files: `suivi.html?id=NT-1036` (citoyen)
- acceptance:
  - Statut + frise des étapes datées et commentées ;
  - complément d'information

## F26 · Historique filtrable de mes demandes
- role: Frontend
- priority: medium
- status: done
- files: `espace.html`
- acceptance:
  - Historique de toutes mes demandes, filtrable

## D19 · Espace de travail agents + données de l'API Terra Nova (750 XP, Difficile)
- role: Backend + Frontend
- priority: urgent
- status: done
- files: `agent.html` (agent)
- acceptance:
  - Espace distinct + panneau « Flux de l'API Terra Nova » : vague, temps écoulé, toutes les demandes, rafraîchi toutes les 30 s

## D17 · Compteur des demandes en attente pour les agents
- role: Frontend
- priority: high
- status: done
- files: `agent.html`
- acceptance:
  - Gros compteur « demandes en attente de prise en charge »

## F22 · Vue des demandes des habitants pour les agents (250 XP, Facile)
- role: Frontend
- priority: medium
- status: done
- files: `agent-demandes.html`
- acceptance:
  - Onglets par statut, « Action requise » en premier, tiroir de traitement (le citoyen est notifié)

## Rendez-vous

## F39 · Prendre rendez-vous avec un service
- role: Frontend
- priority: medium
- status: done
- files: `rendez-vous.html` (citoyen)
- acceptance:
  - 3 étapes, créneau écrit en toutes lettres, lieu, agent, pièces à apporter

## F40 · Gérer ses rendez-vous (rappel, annulation)
- role: Frontend
- priority: medium
- status: done
- files: `rendez-vous.html`
- acceptance:
  - Choix du rappel (24 h / 2 h / les deux), fichier calendrier .ics, bouton « Voir un exemple de rappel » → cloche

## Alertes et diffusion

## D18 · Diffuser un message général aux habitants
- role: Frontend
- priority: high
- status: done
- files: `agent-alertes.html` → modèle « Message général »
- acceptance:
  - Diffuser → la balise « Alertes » de tous les habitants s'allume + notification

## F29 · Alerte montée des eaux ciblée par quartier
- role: Frontend
- priority: medium
- status: done
- files: `agent-alertes.html` modèle « Montée des eaux » ; `annonces.html#ann-crue`
- acceptance:
  - Consignes, zone Sud, « votre quartier est concerné »

## F31 · Recommandations vague de chaleur aux personnes vulnérables
- role: Frontend
- priority: medium
- status: done
- files: modèle « Vague de chaleur » ; `annonces.html#ann-chaleur`
- acceptance:
  - Publics prioritaires, lieux frais, notification spéciale aux personnes vulnérables (amina@, jean@)

## F30 · Être prévenu des annonces importantes
- role: Frontend
- priority: medium
- status: done
- files: `annonces.html` → « Être prévenu »
- acceptance:
  - Préférences par catégorie / quartier, appliquées aux envois

## Accessibilité, langues, langage clair

## F23 · Panneau d'accessibilité (taille, contraste, mouvement)
- role: Frontend
- priority: medium
- status: done
- files: bouton ♿
- acceptance:
  - Contraste renforcé (noir / blanc), espacement du texte

## F43 · Accessibilité partout (contraste AA, focus, lecteur d'écran)
- role: Frontend
- priority: medium
- status: done
- files: bouton ♿ + partout
- acceptance:
  - « Souligner tous les liens » ;
  - statuts toujours texte + icône + couleur

## F41 · Raccourcis clavier et navigation tout clavier
- role: Frontend
- priority: medium
- status: done
- files: touche `?`
- acceptance:
  - Raccourcis Alt + R/A/N/M/C/V, tout au clavier, Échap ferme les fenêtres

## D20 · Accessibilité intégrée au parcours unique
- role: Frontend
- priority: high
- status: done
- files: ensemble
- acceptance:
  - Toutes les fonctions accessibles dans le même parcours (pas de version à part)

## D14 · Interface en 4 langues (FR / EN / ES / AR)
- role: Frontend
- priority: high
- status: done
- files: sélecteur de langue
- acceptance:
  - FR / EN / ES / AR (l'arabe passe la page de droite à gauche)

## F27 · Services traduits dans les 4 langues
- role: Frontend
- priority: medium
- status: done
- files: `services.html` en EN/ES/AR
- acceptance:
  - Noms, descriptions et démarches courantes traduits

## D13 · Glossaire : définitions des mots difficiles
- role: Frontend
- priority: high
- status: done
- files: mots en pointillés + `aide.html`
- acceptance:
  - Définition au survol, au clic ou au clavier ;
  - lexique complet et FAQ

## Vague 7

## F45 · Carte des services de la ville
- role: Frontend
- priority: medium
- status: done
- files: `carte.html` (menu « Carte »)
- acceptance:
  - Plan de la ville : 17 lieux physiques, filtres, « près de chez moi » ;
  - clic sur un lieu → fiche ouvert/fermé, adresse, horaires, PMR, navette, rendez-vous, sur un seul écran.
  - Lien « Voir sur la carte » depuis chaque service

## F46 · Urgences et hôpitaux sur la carte, numéros 15 / 112
- role: Frontend
- priority: medium
- status: done
- files: `carte.html?filtre=urgence` (bouton « Urgences et hôpitaux »)
- acceptance:
  - Numéros 15 / 112 cliquables, lieux ouverts 24h/24, le plus proche du quartier

## F47 · Journal d'activité des agents
- role: Frontend
- priority: medium
- status: done
- files: `agent-journal.html` (agent, menu « Journal »)
- acceptance:
  - Journal en lecture seule : qui, quoi, quand, avant → après, motif ;
  - historique d'un élément ;
  - export CSV pour l'autorité de contrôle

## F48 · Journal : filtre par intervenant et dernières actions
- role: Frontend
- priority: medium
- status: done
- files: `agent-journal.html` + `agent.html` (« Dernières actions »)
- acceptance:
  - Filtre par intervenant ;
  - toute action (statut d'une demande, alerte, état d'un service, rôle d'un compte) apparaît immédiatement

## Vague 8

## F49 · Notifications en direct de l'avancement d'une demande
- role: Frontend
- priority: medium
- status: done
- files: toutes les pages (citoyen connecté)
- acceptance:
  - Un agent change l'état d'une demande → l'habitant reçoit en moins de 30 s un message à l'écran + la cloche, sans recharger

## F50 · Tableau de bord des agents (indicateurs, graphiques)
- role: Frontend
- priority: medium
- status: done
- files: `agent-tableau.html` (menu « Tableau de bord »)
- acceptance:
  - 6 indicateurs avec liens d'action, « À surveiller », graphiques 14 jours / quartiers / services / statuts, avec tableaux de données

## F51 · Page « Vos données » et réponse aux inquiétudes
- role: Frontend
- priority: medium
- status: done
- files: `donnees.html` (pied de page « Vos données »)
- acceptance:
  - Explications claires, téléchargement de mes données, question / inquiétude avec numéro CTR-xxxx, suivi et réponse de l'agent

## F52 · Soutenir une demande d'un autre habitant
- role: Frontend
- priority: medium
- status: done
- files: `soutenir.html` (menu « Soutenir »)
- acceptance:
  - « Je soutiens » + commentaire, confirmation « vous êtes N habitants », notification à soi et à l'auteur, retrait possible

## Vague 9

## F55 · Mes informations : voir et corriger ses données
- role: Frontend
- priority: medium
- status: done
- files: `mes-informations.html` (espace citoyen « Mes informations », compte)
- acceptance:
  - Toutes les informations que la ville garde sur soi, en 8 thèmes lisibles (profil, compte et sécurité, demandes en clair, rendez-vous, soutiens, contributions…
  - jamais de mot de passe ;
  - « Télécharger (PDF / imprimer)» et fichier JSON

## F56 · Télécharger le récapitulatif de ses démarches
- role: Frontend
- priority: medium
- status: done
- files: `recapitulatif.html` (« Télécharger le récapitulatif » dans le suivi et l'espace)
- acceptance:
  - Chiffres par état, délai moyen de traitement, tableau (numéro, objet, catégorie, date, état, dernière mise à jour) avec dernière réponse ;
  - export CSV (Excel français, UTF-8) et PDF / impression

## D02 · Se connecter avec une clé d'accès (sans mot de passe)
- role: Frontend
- priority: high
- status: done
- files: `connexion.html` « Se connecter avec une clé d’accès » ; ajout dans `compte.html` › Sécurité de connexion
- acceptance:
  - Connexion sans mot de passe par clé d’accès (WebAuthn : Windows Hello, empreinte, visage, code du téléphone).
  - Déverrouillage de l’appareil obligatoire, défi à usage unique, contrôle de l’origine et du compteur de signatures (clé copiée refusée).
  - Ajouter une clé exige de confirmer son mot de passe

## F53 · Vérification en deux étapes
- role: Frontend
- priority: medium
- status: done
- files: `compte.html` › Vérification en deux étapes, puis `connexion.html`
- acceptance:
  - Activation guidée : QR code (ou clé à saisir), confirmation par un premier code, 8 codes de secours à imprimer.
  - À la connexion, après le mot de passe : écran « Deuxième étape » ;
  - code rejoué refusé, 5 essais au plus.

## F54 · Alerte de connexion depuis un nouvel appareil
- role: Frontend
- priority: medium
- status: done
- files: Notification + toast en direct (F49) ; `compte.html#appareils`
- acceptance:
  - Connexion depuis un appareil jamais vu : notification « Nouvel appareil connecté » (navigateur, système, date) avec la marche à suivre.
  - Liste des appareils (« Cet appareil » signalé) ;
  - « Retirer » déconnecte cet appareil à distance

## Vague 10

## F57 · Sobriété numérique : page et engagements
- role: Backend + Frontend
- priority: medium
- status: done
- files: `sobriete.html` (« Sobriété numérique », lien depuis le pied de page)
- acceptance:
  - Poids, requêtes, CO2 estimé par visite (modèle Sustainable Web Design) et note A–G de l'accueil ;
  - tableau des pages principales (poids compressé, requêtes, note en lettre et en mots) calculé par /api/sobriete ;
  - « Mesuré sur cette visite » via la Performance API ;

## F58 · Envoi sobre des fichiers (compression, cache, versions)
- role: Backend + Frontend
- priority: medium
- status: done
- files: Toutes les pages (serveur `src/statique.js`, `index.html`)
- acceptance:
  - Choix sobres appliqués aux parcours principaux : textes compressés Brotli/gzip (ex.
  - ui.js : 8,7 Ko transférés au lieu de 29 Ko), réponses JSON de l'API compressées, ETag + cache navigateur (fichier inchangé = 304), polices non bloquantes réd…
  - Vérifiable dans l'onglet Réseau des outils du navigateur

## F59 · Mode connexion lente
- role: Frontend
- priority: medium
- status: done
- files: Panneau ♿ › « Mode connexion lente » ; pied de page
- acceptance:
  - Un interrupteur en langage clair : page allégée (pas d'image décorative ni d'animation, polices du système, mises à jour toutes les 2 min).
  - Proposé tout seul si le navigateur signale une connexion lente ou l'économiseur de données, avec un message unique ;
  - rappel « Mode connexion lente activé · Revenir à l'affichage complet » en pied de page.

## F60 · Images et médias allégés
- role: Frontend
- priority: medium
- status: done
- files: `index.html` (image d'accueil), en-tête (logo)
- acceptance:
  - Image d'accueil en WebP, 3 tailles (480 / 800 / 1280) choisies par le navigateur : 416 Ko → 18 à 149 Ko ;
  - emblème du logo 126 Ko → 3 Ko ;
  - dimensions déclarées (pas de saut de mise en page) ;

## Vague 11

## F61 · Mode appareil peu puissant
- role: Frontend
- priority: medium
- status: done
- files: Panneau ♿ › « Mode appareil peu puissant » (toutes les pages)
- acceptance:
  - Proposé tout seul (message unique, sans bandeau) si l'appareil a 2 cœurs ou moins, 2 Go de mémoire ou moins, demande moins d'animations ou active l'économise…
  - Allège le travail du processeur sans rien retirer : plus de flou d'arrière-plan ni d'ombre large, aucune animation ni effet au survol, mises à jour en direct…
  - Mesure concrète sous l'interrupteur : cœurs, mémoire, « page prête en … ms », nombre et durée des blocages de plus de 50 ms.

## F62 · Version simple sans script (/simple)
- role: Backend + Frontend
- priority: medium
- status: done
- files: Pied de page « Version simple » (et panneau ♿) → `/simple`, `/simple/services`, `/simple/services/logement`, `/simple/suivi` ; `services.html?simple=1`
- acceptance:
  - Pages produites par le serveur : texte et actions essentielles (alertes en cours, que faire, services et leur état, suivre une demande, urgences 15 / 112), a…
  - Poids réel affiché en pied (ex.
  - accueil ≈ 4 Ko, 1,5 Ko compressé).

## F63 · Désactivation d'un service par l'admin, avec retour prévu
- role: Backend + Frontend
- priority: medium
- status: done
- files: `agent-alertes.html` › État des services (admin) ; raccourci « Désactiver ce service » dans la fiche d'un service (`services.html#sante`, connecté en admin)
- acceptance:
  - Bouton « Désactiver » : raison, retour prévu, prochaine action possible (téléphone, guichet, autre canal, date) ;
  - « Réactiver » en un clic.
  - Contrôle serveur : POST /api/services/:id/desactiver et /reactiver réservés à l'admin (citoyen et agent → 403), un agent ne peut ni désactiver ni écraser la …

## F64 · État du service affiché avant toute démarche
- role: Frontend
- priority: medium
- status: done
- files: `demande.html?type=demarche&service=urbanisme` ; fiche d'un service (`services.html#culture`)
- acceptance:
  - L'état du service est affiché en haut, dès qu'il est choisi et avant de commencer, même quand tout va bien (« Service disponible : vous pouvez commencer ») ;
  - en cas d'interruption connue : message de la ville, retour prévu et prochaine action possible

## Vague 12

## F65 · Consultations citoyennes et décisions publiées
- role: Backend + Frontend
- priority: medium
- status: done
- files: `participer.html#consultations` (menu « Participer », à côté de « Soutenir ») ; espace citoyen « Ma participation »
- acceptance:
  - Chaque consultation affiche la question, le contexte en langage clair, les réponses possibles, la date limite (« plus que N jours »), le quartier et qui déci…
  - Citoyen citoyen@ : répondre à « Que doit devenir l’ancienne halle ? » ou à la navette → reçu AVI-xxxx (numéro, date, réponse), notification dans la cloche, r…
  - Une seule réponse par habitant (contrôlé par le serveur : une nouvelle réponse remplace l’ancienne, même numéro).

## F66 · Consultation « navette de nuit »
- role: Frontend
- priority: medium
- status: done
- files: `participer.html#CON-0002` (navette de nuit)
- acceptance:
  - Avis favorable / mitigé / défavorable + commentaire facultatif, étiquette « Avis consultatif, pas un vote officiel » sur chaque carte et dans le formulaire ;
  - confirmation « Votre avis est enregistré » avec reçu ;
  - bouton « Modifier mon avis » jusqu’à la date limite (après : 409, « ne peut plus être modifié »)

## F67 · Projets de la ville et leur avancement
- role: Frontend
- priority: medium
- status: done
- files: `participer.html#projets`
- acceptance:
  - 6 projets avec état (à l’étude / en travaux / terminé), quartier, service, budget en euros, barre d’avancement, prochaine étape, dates de début et de fin, hi…
  - filtres par quartier et par état ;
  - liens « Donner mon avis » / « Voir la décision » vers les consultations liées.

## F68 · Boîte à idées des habitants
- role: Frontend
- priority: medium
- status: done
- files: `participer.html#idees` ; `espace.html` › Ma participation
- acceptance:
  - Formulaire titre, description, quartier, catégorie (erreurs accessibles) → numéro IDE-xxxx, date et prochaine étape ;
  - « Mes idées » avec frise reçue → à l’étude → retenue / non retenue et la réponse de la ville.
  - Agent : « Idées reçues à traiter », motif obligatoire si non retenue ;

## Vague 13

## F69 · Bouclier de sécurité (CSP, CSRF, débit, chiffrement)
- role: Backend + Frontend
- priority: medium
- status: done
- files: Partout (serveur `src/bouclier.js`, `src/chiffrement.js`) ; `securite.html` (pied de page « Sécurité de vos données ») ; `agent-securite.html` (admin, menu « Sécurité »)
- acceptance:
  - Durcissement réel et visible : CSP stricte (seuls Shoelace, Phosphor, polices et le QR code autorisés ;
  - scripts en ligne autorisés un par un par empreinte SHA-256), anti-cadre, nosniff, Referrer-Policy, Permissions-Policy, HSTS en production.
  - Anti-CSRF : écriture refusée si elle vient d’un autre site ou n’est pas en JSON (403/415).

## F70 · Fiche détaillée d'un habitant pour l'admin
- role: Backend + Frontend
- priority: medium
- status: done
- files: `admin-comptes.html` › « Détail » d’un habitant (Amina, Léa, Jean, Marc) ; `agent-securite.html`
- acceptance:
  - Habilitation en plus du rôle, accordée/retirée par l’admin avec motif (notifiée, auditée).
  - GET /api/etat et les écritures ne contiennent jamais le dossier ni le téléphone d’autrui (filtrage serveur : téléphone masqué 06 •• •• •• 00, dossier remplac…
  - En agent non habilité (agent@) : « Accès réservé aux agents habilités ».

## F71 · Créer un compte sans e-mail (identifiant + code)
- role: Frontend
- priority: medium
- status: done
- files: `bienvenue.html#sans-email` (liens depuis l’inscription, la connexion, l’accueil) ; `agent-accueil.html` (agents, menu « Accueil arrivants ») ; `connexion.html`
- acceptance:
  - Compte sans e-mail : identifiant lisible TN-482731 + code secret de 6 chiffres (suites et répétitions refusées) ou mot de passe, téléphone facultatif (chiffr…
  - Connexion avec e-mail, identifiant ou numéro (verrouillage F37 et limitation de débit inchangés).
  - Langue choisie en premier : encart discret au premier passage sur l’accueil et gros boutons sur bienvenue.html, chaque langue écrite dans sa langue, pictogra…

## F72 · Guide « Je viens d'arriver »
- role: Backend + Frontend
- priority: medium
- status: done
- files: `bienvenue.html#guide` (raccourci « Je viens d’arriver » sous la recherche de l’accueil, bloc « Vous venez d’arriver ? », pied de page, fiche d’accueil)
- acceptance:
  - 3 questions à pictogrammes (seul / à deux / en famille ;
  - besoins : logement, travail, santé, école, transports, papiers, aide ;
  - e-mail oui / non) → liste personnalisée de 6 à 9 services avec liens directs (fiche du service, rendez-vous, carte des urgences, navettes, alertes), cases « …

## Vague 14

## F73 · Messages officiels du Haut Conseil (balise Alertes + tiroir)
- role: Backend + Frontend
- priority: medium
- status: done
- files: Toutes les pages (balise « Alertes » + tiroir) ; carte épinglée en haut de `index.html` et `annonces.html` ; `agent-alertes.html` › « Message officiel du Haut Conseil » ; `/simple`
- acceptance:
  - Agent agent@ : titre, message simple, « Ce que vous devez faire » (une action par ligne), public (toute la ville ou un quartier), début tout de suite ou prog…
  - Chez tous les habitants concernés, sans recharger (relu toutes les 30 s, rythme F49) : la balise s’allume en sarcelle, le tiroir s’ouvre une seule fois par m…
  - compteur visible par l’agent).

## F74 · Associations partenaires, ouvertes maintenant
- role: Backend + Frontend
- priority: medium
- status: done
- files: `services.html#associations` (filtre « Elles vous aident pour : » + « Ouvertes maintenant ») ; fiche d’un service (ex. `services.html#etat-civil`, bloc « Associations partenaires qui peuvent aussi vous aider ») ; `carte.html?lieu=asso-toit-pour-tous` (filtre « Associations partenaires »)
- acceptance:
  - Une carte donne tout : ce que l’association fait pour vous, ouverte maintenant / ferme à… / prochaine ouverture (calculé en direct, mis à jour chaque minute)…
  - Agent / admin : « Modifier les horaires » (un créneau par jour, information ponctuelle) → PATCH /api/associations/:id contrôlé par le serveur (citoyen 403, h…

## F75 · Demandes semblables regroupées pour les agents
- role: Backend + Frontend
- priority: medium
- status: done
- files: `agent-demandes.html` (panneau « Demandes semblables », barre « Attention », tiroir de traitement)
- acceptance:
  - Groupes calculés par le serveur (GET /api/demandes/groupes) : texte normalisé (accents, mots vides, pluriels), TF-IDF + cosinus, même service, même quartier,…
  - union des paires au-dessus du seuil.
  - Démo : « 4 demandes semblables — Lampadaire éteint place des Pionniers » et « 3 demandes semblables — Fuite d’eau avenue Orion » (la fuite de la résidence Au…

## F76 · Donner son avis sur une démarche terminée
- role: Backend + Frontend
- priority: medium
- status: done
- files: Suivi d’une demande traitée (`suivi.html?id=NT-1031`) ; `rendez-vous.html` › rendez-vous passés ; fiche d’un service (`services.html#sante`) ; `espace.html#mes-avis-services` ; agents : `services.html` › « Avis des habitants à traiter »
- acceptance:
  - « Donner mon avis » : note de 1 à 5 + commentaire facultatif → reçu COM-xxxx (numéro, date, note, statut) affiché tout de suite, notification.
  - Un avis par démarche terminée (le serveur vérifie qu’elle est à l’habitant et terminée ;
  - un nouvel envoi modifie l’avis, même numéro).

## Vague 16

## F81 · Formulaires protégés contre les envois automatiques
- role: Backend + Frontend
- priority: medium
- status: done
- files: Tous les formulaires publics : `demande.html` (contact, signalement, démarche), `inscription.html`, `bienvenue.html#sans-email`, `donnees.html` (question), `participer.html` (idées, avis), avis sur un service (`suivi`, `services`, `rendez-vous`, `espace`), `soutenir.html`, réponse dans `suivi.html` ; `agent-securite.html` (admin) › « Envois automatiques bloqués »
- acceptance:
  - Invisible d’abord (src/modules/formulaires.js, assets/js/formulaires.js) : chaque formulaire reçoit un jeton signé HMAC (nonce propre au formulaire, heure d’…
  - Ligne visible discrète « Formulaire protégé contre les envois automatiques ».
  - Envoi suspect (rempli en moins de 3 s, sans jeton, jeton expiré ou rejoué, aucune interaction) → petite vérification accessible (« Combien font 6 + 4 ? », mê…

## F82 · Envoi sans doublon (idempotence, bouton désactivé)
- role: Backend + Frontend
- priority: medium
- status: done
- files: `demande.html`, et tous les formulaires ci-dessus
- acceptance:
  - Côté navigateur : bouton désactivé + « Envoi en cours… » (aria-busy), réactivé en cas d’erreur ;
  - un double clic est ignoré.
  - Côté serveur : clé d’idempotence (Idempotency-Key, calculée sur le contenu du formulaire) retenue 24 h → un renvoi rend le même résultat (même NT-xxxx, même …

## F83 · Accusé de réception vérifiable
- role: Backend + Frontend
- priority: medium
- status: done
- files: Confirmation d’envoi (`demande.html`) ; `accuse.html?id=NT-xxxx` ; suivi (`suivi.html?id=NT-1036`, colonne « Détails ») ; `espace.html` › « Mes accusés de réception » ; `verifier-accuse.html` (public)
- acceptance:
  - Chaque demande reçoit un accusé de réception : référence NT-xxxx, date et heure, service destinataire, nature, objet, résumé, code de vérification (8 caractè…
  - K7PM-Q2XD).
  - Page imprimable « Télécharger (PDF / imprimer) » (même mise en page d’impression que le récapitulatif F56).

## F84 · Réponses types et badges pour les agents
- role: Backend + Frontend
- priority: medium
- status: done
- files: `agent-demandes.html` (panneau « Réponses aux habitants », badges, tiroir) ; `agent.html` (compteurs) ; `suivi.html?id=NT-1036` (citoyen)
- acceptance:
  - Tiroir de traitement : fil des échanges (mairie / habitant, dates, changement de statut), « Répondre à l’habitant » avec réponses types (6, avec {numero} et …
  - L’habitant est notifié et voit « Échanges avec la mairie » dans son suivi, où il répond (l’agent qui a répondu est prévenu).
  - Liste : badges « Réponse en attente · 2 j » / « Répondu le 4 oct.

## Vague 17

## F85 · Cybersécurité : registre d'audit scellé, incidents
- role: Backend + Frontend
- priority: medium
- status: done
- files: `agent-securite.html` (admin, menu « Sécurité ») : sections « Incidents de sécurité », « Comptes et adresses sous surveillance », « Intégrité des données » ; `securite.html#activite` et balise « Alertes » (habitant)
- acceptance:
  - Intégrité (src/modules/integrite.js) : chaque entrée du journal d’audit est scellée à son écriture dans audit_chaine (SHA-256 du contenu enchaîné à l’entrée …
  - « Vérifier la chaîne maintenant » → « Chaîne intacte : N entrées » ou « Chaîne rompue à l’entrée n° N » (modifiée, supprimée, registre réécrit, ou entrées aj…
  - « Simuler une modification » montre le résultat d’une altération sans rien toucher (vérifié aussi en modifiant réellement une entrée dans la base : « rompue …

## F86 · Urgence médicale repérée au dépôt (15 / 112)
- role: Backend + Frontend
- priority: medium
- status: done
- files: `demande.html` (« Quelqu’un est en danger maintenant ? » → « Urgence vitale », ou mots repérés pendant la saisie) ; confirmation ; `urgence.html?id=NT-xxxx` ; `suivi.html` ; agents : panneau « Urgences médicales » en tête de `agent.html` et `agent-demandes.html?urgences=1`, balise « Alertes »
- acceptance:
  - Mots d’urgence en FR / EN / ES / AR (malaise, ne respire plus, unconscious, no respira, فاقد الوعي…), catégorie urgence-medicale ou choix explicite → écran c…
  - La demande est quand même enregistrée par le serveur comme URGENCE MÉDICALE : en tête des listes des agents, priorité Critique F80 (aucune correction ne la f…
  - Alerte immédiate à tout le personnel actif (notification + balise teintée, sans son ni clignotement, message à l’écran), minuteur « à prendre en charge dans …

## F87 · Sauvegardes vérifiées et rétention
- role: Frontend
- priority: medium
- status: done
- files: `admin-sauvegardes.html` (admin, menu « Sauvegardes »)
- acceptance:
  - « Créer une sauvegarde maintenant » → instantané cohérent VACUUM INTO dans ~/terranova-data/sauvegardes/ (hors public/, hors dépôt) : date, SHA-256, taille, …
  - Sauvegarde automatique quotidienne, 7 dernières gardées.
  - « Tester la restauration » : copie dans une base temporaire puis empreinte inchangée, PRAGMA integrity_check, tables et colonnes attendues, comptes comparés …

## F88 · Exports de données pour les agents
- role: Backend + Frontend
- priority: medium
- status: done
- files: `agent-exports.html` (agents, menu « Exports »)
- acceptance:
  - Jeu de données (demandes, signalements, rendez-vous, avis sur les services, avis des consultations, idées) → colonnes à cocher avec libellés clairs (« donnée…
  - Pseudonymisation par défaut (« Habitant-3F9A2C », stable ;
  - e-mails et téléphones retirés, masqués dans les textes) ;

## Vague 15

## F77 · Tenue de charge : l'essentiel reste disponible
- role: Backend + Frontend
- priority: medium
- status: done
- files: Toutes les pages (serveur `src/charge.js`, navigateur `assets/js/resilience.js`, `sw.js`) ; admin : `agent-plateforme.html` (menu « Plateforme »)
- acceptance:
  - Surcharge détectée, l’essentiel reste disponible.
  - Le serveur mesure en continu le retard de sa boucle d’événements (perf_hooks.monitorEventLoopDelay), les requêtes en cours et la latence ;
  - au-delà des seuils il passe en forte puis critique (redescend par palier après 15 s sous le seuil).

## F78 · Brouillon gardé sur l'appareil, rien n'est perdu
- role: Backend + Frontend
- priority: medium
- status: done
- files: `demande.html` (tout formulaire avec une zone de texte) ; pages essentielles hors connexion ; `tools/charge.js`
- acceptance:
  - Beaucoup d’habitants en même temps, rien n’est perdu.
  - Brouillon gardé sur l’appareil pendant la saisie et remis en place à la visite suivante (« Brouillon retrouvé… · Effacer le brouillon »), effacé dès que l’en…
  - Envoi refusé (503, 429, serveur injoignable) : nouvel essai automatique (3 au plus, délai croissant avec gigue, ou Retry-After du serveur), compte à rebours …

## F79 · Trier et filtrer ses demandes par sujet
- role: Frontend
- priority: medium
- status: done
- files: `suivi.html` (citoyen `citoyen@`) ; `espace.html#historique` ; `soutenir.html`
- acceptance:
  - Trier et filtrer par sujet.
  - Puces de sujet (le service concerné : Voirie & éclairage, Eau & énergie, Culture & loisirs…) avec le nombre de demandes pour chacun (plusieurs sujets possibl…
  - nombre de résultats annoncé (région live), puces au clavier (aria-pressed), étiquettes.

## F80 · Dossiers prioritaires calculés pour les agents
- role: Backend + Frontend
- priority: medium
- status: done
- files: `agent-demandes.html` (agent `agent@`) : panneau « Mes dossiers prioritaires », colonne et filtre « Priorité », tri « Priorité (critique d’abord) », tiroir ; `agent.html` (compteurs) ; `agent-journal.html`
- acceptance:
  - Niveau Critique / Haute / Normale / Basse calculé par le serveur (GET /api/demandes/priorites) avec ses raisons et leurs points : mots d’urgence (gaz, câble …
  - une simple question baisse le score.
  - Démo : « Odeur de gaz dans la cage d’escalier » → Critique (« Mot d’urgence : gaz +45 · Service sensible +15 · Personne vulnérable +25 »).

## Vague 18

## D10 · Recherche globale tolérante aux fautes et aux langues
- role: Backend + Frontend
- priority: high
- status: done
- files: Bouton « Rechercher » de l’en-tête (toutes les pages ; « / » au clavier ; sur mobile, en tête de la navigation), recherche de l’accueil, `recherche.html?q=…` ; serveur `GET /api/recherche?q=&langue=`
- acceptance:
  - Taper lampadère cassé → « Vouliez-vous dire « lampadaire cassé » ? », en tête « Le plus probable : Signaler un lampadaire en panne » + bouton Faire le signal…
  - Fonctionne avec fautes, familier (ma poubelle déborde, plus d’eau au robinet, papier pour me marier), anglais / espagnol / arabe (no hay agua, عمود الإنارة م…
  - Jamais d’impasse : zorglub → services les plus proches + « Écrire à la mairie » + « Demander à l’assistant d’orientation » ;

## F91 · Assistant d'orientation hors ligne (sans IA)
- role: Backend + Frontend
- priority: medium
- status: done
- files: Onglet « Assistant d’orientation » de la même fenêtre (`<dialog>` modale : focus piégé, Échap, onglets aux flèches, fil `role="log"` annoncé, plein écran à 360 px, sens arabe) ; ouvert depuis l’en-tête, l’accueil (« Vous ne savez pas comment le dire ? »), `aide.html` (encadré sous « Vous ne trouvez pas votre réponse ? »), l’état « aucun résultat » ; `POST /api/orientation`
- acceptance:
  - Écrire papier pour me marier → « Votre besoin : Se marier ou obtenir un acte de mariage (parce que vous parlez de « papier », « marier ») », service compéten…
  - eau → une question de précision avec puces (coupure, fuite, raccordement… « Autre chose ») ;
  - la réponse tapée ensuite est combinée à la phrase d’origine.

## F92 · « Je ne sais pas quel service choisir »
- role: Backend + Frontend
- priority: medium
- status: done
- files: `demande.html` › « **Je ne sais pas quel service choisir** » (s’ouvre aussi tout seul si « Je ne sais pas » est choisi) ; `POST /api/orientation/suggestions`
- acceptance:
  - Écrire le lampadère devant chez moi est cassé → 1 à 3 propositions « Signaler un lampadaire en panne · Service : Voirie & éclairage — Parce que vous parlez d…
  - tout reste modifiable.
  - Urgence vitale repérée → écran 15 / 112 (F86) avant les propositions

## F89 · Langage clair : bascule texte officiel / version claire
- role: Backend + Frontend
- priority: medium
- status: done
- files: Fiche d’un service (`services.html#etat-civil`, `#social`…), `demande.html` (« Faire une démarche » + la démarche choisie, ex. `?type=demarche&service=etat-civil&nature=mariage`), `donnees.html` (« Vos données personnelles », « Vos droits face à l’administration ») ; agents : `agent-orientation.html` › Versions en langage clair
- acceptance:
  - Bascule Texte officiel / Langage clair par bloc : résumé en une phrase et encadrés Qui ? Quoi ? Quand ? Combien ? Documents ? Où ? ;
  - la liste « Chiffres, délais et références officiels (les mêmes dans les deux versions) » reste visible (30 jours, 150 €, règlement municipal n° 2024-07, arti…
  - Langue manquante → version française signalée.

## F90 · « Expliquer plus simplement » sur les passages administratifs
- role: Frontend
- priority: medium
- status: done
- files: Passages administratifs (blocs officiels F89, paragraphes contenant des mots administratifs sur `donnees.html`, `aide.html`, fiches de services…)
- acceptance:
  - Lien discret « Expliquer plus simplement » à la fin du paragraphe → explication sur place (version claire du paragraphe, mots difficiles expliqués, phrase re…
  - un paragraphe à la fois, rien d’autre ne change.
  - Sélectionner un passage → petit bouton Expliquer (ou Alt + X au clavier) → bulle d’explication, Échap la ferme.

## Vague 19

## F93 · Hors connexion : l'essentiel reste disponible
- role: Backend + Frontend
- priority: medium
- status: done
- files: Toutes les pages (pied de page, balise « Alertes », note en tête de page) ; `sw.js` ; admin : `agent-plateforme.html#continuite` (menu « Plateforme ») ; serveur `src/continuite.js`
- acceptance:
  - Hors connexion, l'essentiel reste compréhensible et récupérable.
  - *Indicateur calme* en pied de page « ● En ligne » / « ○ Hors connexion · informations du 4 oct., 14:32 · Infos essentielles », la balise « Alertes » prend un…
  - en tête de page, une note « Hors connexion : vous voyez les informations enregistrées sur cet appareil le … » avec « Ce qui fonctionne sans connexion » (info…

## F94 · Page essentielle produite par le serveur (/essentiel)
- role: Backend + Frontend
- priority: medium
- status: done
- files: `/essentiel` (aussi `/simple/essentiel`) ; lien « Infos essentielles » en pied de page de toutes les pages, dans la navigation de `/simple`, dans la note d'incident et l'indicateur hors connexion, dans la page de secours des pages réservées ; page de secours du Service Worker
- acceptance:
  - Une page toujours disponible, produite par le serveur, sans script nécessaire (≈ 12 Ko, 3,5 Ko compressée, poids affiché en pied) : numéros d'urgence en gran…
  - associations partenaires « Ouverte maintenant / Fermée » et leurs horaires calculés à l'heure de la ville ;
  - contact de chaque service), « Mis à jour le … ».

## F95 · Mesure du poids des pages et sobriété
- role: Backend + Frontend
- priority: medium
- status: done
- files: Toutes les pages ; `tools/mesure-pages.js` ; `sobriete.html` (« Avant et après l'allègement de la vague 19 »)
- acceptance:
  - Mesurer d'abord : node tools/mesure-pages.js (Edge sans fenêtre, protocole DevTools, cache vide, chaque page avec le profil qui y a accès) : requêtes (site, …
  - Constat : ≈ 55 fichiers Shoelace téléchargés sur chaque page pour un tiroir et deux fenêtres jamais ouverts, deux feuilles d'icônes complètes (≈ 1 500 icônes…
  - Allègement : tiroirs et fenêtres de ui.js ajoutés à la page à leur première ouverture (repli natif sans le CDN), menu du compte natif (plus de sl-dropdown), …

## F96 · L'essentiel d'abord sur téléphone et connexion limitée
- role: Frontend
- priority: medium
- status: done
- files: Toutes les pages sur téléphone ou connexion limitée : `index`, `espace`, `services`, `transports`, `aide`, `carte`
- acceptance:
  - L'essentiel d'abord, même mécanisme que le « Mode connexion lente » (F59), pas un mode de plus : html.essentiel-dabord posé avant l'affichage par store.js si…
  - « Revenir à l'affichage complet » le retire aussi.
  - Effets : sections secondaires (data-secondaire : services les plus demandés, actualités, « Vous venez d'arriver ? », notifications, participation, historique…

## Vague 20

## F97 · Transports de remplacement en cas d'interruption
- role: Backend + Frontend
- priority: medium
- status: done
- files: `transports.html` (« Info trafic », « Itinéraire de remplacement », « Être prévenu »), balise « Alertes » + tiroir (toutes les pages), `carte.html`, `/simple` ; agents : `agent-mobilite.html` (menu « Mobilité ») ; serveur `src/modules/mobilite.js` + `src/vague20/reseau.js`
- acceptance:
  - Une carte par ligne interrompue : « Ligne N4 interrompue jusqu’à 18 h », tronçon et arrêts non desservis, raison en clair, puis « Que faire ? Les meilleures …
  - « Vous êtes à un arrêt non desservi ? » : quoi faire arrêt par arrêt, quartiers desservis par d’autres lignes.
  - Itinéraire de remplacement : départ et arrivée = un arrêt ou un quartier → trajet (Dijkstra) qui évite les tronçons coupés, « Le plus rapide » et « Avec moin…

## F98 · Mesure anonyme de l'usage pour les agents
- role: Backend + Frontend
- priority: medium
- status: done
- files: `agent-usage.html` (agents, menu « Usage ») ; serveur `src/modules/usage.js`
- acceptance:
  - Mesure anonyme côté serveur : uniquement des compteurs (jour, heure, quartier, service, événement) — fiche d’un service ouverte, étapes d’une démarche (servi…
  - aucun compte, cookie, identifiant ni IP enregistré (une consultation répétée en 30 min n’est comptée qu’une fois, en mémoire).
  - Page : filtres période (7 / 30 / 90 jours) et quartier, chiffres clés avec tendance, « Ce qu’il faut retenir » rédigé automatiquement (« État civil représent…

## F99 · Partenaires extérieurs : offres et demandes
- role: Backend + Frontend
- priority: medium
- status: done
- files: `partenaires.html` (habitants ; lien en pied de page, encadré sur `services.html`, résultats de la recherche globale) ; `partenaire.html` (« Espace partenaire », comptes `velo@nova.test` et `lumen@nova.test`, mot de passe `Partenaire2026` ou `PARTENAIRE_PASSWORD` en production) ; `agent-partenaires.html` (agents : vérification ; admin : partenaires et comptes) ; serveur `src/modules/partenaires.js`
- acceptance:
  - Chaque offre : badge Disponible / Complet / Suspendu (même langage que l’état des services F63/F64) avec places restantes, prochaine session ou date de repri…
  - pour qui, conditions, où, quand, prix (« Gratuit »), service de la ville lié ;
  - prochaine action : Réserver, S’inscrire sur liste d’attente, Envoyer une demande, Contacter (téléphone / e-mail), Réserver sur le site du partenaire, Voir un…

## F100 · Veille sécurité : derniers événements pour les agents
- role: Backend + Frontend
- priority: medium
- status: done
- files: `agent.html` (bloc « Derniers événements de sécurité ») ; `agent-evenements.html` (agents et admin, menu « Sécurité » avec le nombre d’événements non vus) ; serveur `src/modules/veille-securite.js`
- acceptance:
  - Une frise qui rassemble tentatives bloquées par le bouclier (F69, F81), incidents (F85), comptes verrouillés et tentatives sur un compte verrouillé (F37), no…
  - Filtres gravité minimale, type, période (24 h / 7 j / 30 j), statut ;
  - « Marquer comme vu », « Tout marquer comme vu », « Marquer comme traité » avec une note (journal d’audit) ;

## Vague 21

## F101 · Centre de crise : crise localisée par quartier
- role: Backend + Frontend
- priority: medium
- status: done
- files: `agent-alertes.html` › « Centre de crise : crise localisée » (en tête) ; toutes les pages (fenêtre d'arrivée, balise « Alertes » + tiroir, carte épinglée de `index` / `annonces`) ; `/essentiel`, `/simple` ; serveur `src/modules/crise.js` (construit sur `officiel.js`, F73)
- acceptance:
  - Publier (agent ou admin, rôle contrôlé par le serveur : citoyen 403, visiteur 401 sur GET/POST /api/crises, /maj, /retablir) : modèle « Panne électrique » ou…
  - traductions EN / ES / AR du modèle envoyées si le texte n'a pas été modifié.
  - Un seul clic crée : le message officiel du Haut Conseil (public = le quartier, début immédiat), une annonce par quartier (importance « importante », zone = q…

## Vague 22

## F103 · Rapport d'activité pour agents et admins
- role: Backend + Frontend
- priority: medium
- status: done
- files: `agent-rapport.html` (agents et admins, menu « Rapport d’activité ») ; serveur `src/modules/rapport.js` (`GET /api/rapport`, `/api/rapport/export`, `POST /api/rapport/imprime`)
- acceptance:
  - Période 7 / 30 / 90 jours ou personnalisée (du… au…, 366 jours au plus).
  - Une page de synthèse : 11 chiffres clés avec évolution par rapport à la période précédente en texte + icône et « mieux » / « à surveiller » selon le sens de …
  - objectif 80 %), urgences médicales F86 et délai de prise en charge, rendez-vous, satisfaction des avis F76, participation F65-F68, incidents de sécurité F100…

## F104 · Alerte tempête solaire (modèle de crise)
- role: Backend + Frontend
- priority: medium
- status: done
- files: `agent-alertes.html` › Centre de crise, modèle **« Tempête solaire »** ; toutes les pages (fenêtre critique, balise « Alertes », carte épinglée d'`annonces`) ; `/essentiel`, `/simple` ; serveur `src/modules/crise.js` (construit sur F101 / F73) ; navigateur `assets/js/tempete.js`, `officiel.js`, `sw.js`, `continuite.js`
- acceptance:
  - Agent : modèle « Tempête solaire » → toute la ville (quartiers cochés d'office), « Perturbations attendues dans (minutes, 0 = maintenant) » (12 par défaut) e…
  - un clic publie le message officiel (« Toute la ville »), une annonce d'alerte unique, une notification à chaque habitant, journal d'audit.
  - Tout le monde (habitants, visiteurs, agents) reçoit la fenêtre critique (role="alert", pas de fermeture automatique) avec le compte à rebours « Perturbations…

---

### Modèle pour les demandes des prochaines vagues

```
## <request_code> · <titre court> (<xp_total> XP, <difficulty>)
- role: <Backend | Frontend | ...>
- priority: <urgent si difficulty_level >= 3, high si 2, medium si 1>
- status: todo
- description: <message_public>
- files: src/modules/<nom>.js
- acceptance:
  - <ce que le demandeur doit pouvoir faire, une ligne par besoin>
```
