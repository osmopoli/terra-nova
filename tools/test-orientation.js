// Vague 18 (D10, F91, F92) : banc d'essai du moteur d'orientation, sans serveur ni base.
//   node tools/test-orientation.js            → précision top-1 / top-3 sur des phrases mal formulées (fautes, familier, EN / ES / AR)
//   node tools/test-orientation.js --detail   → détail de chaque phrase
// Les services, annonces et associations viennent de data/demo-seed.json (mêmes données que la démonstration).
'use strict';
const path = require('node:path');
const M = require('../src/orientation/moteur');
const seed = require(path.join(__dirname, '..', 'data', 'demo-seed.json'));

const index = M.construire({ services: seed.services, annonces: seed.annonces, associations: (seed.vague14 || {}).associations || [] });

// [phrase, besoin attendu, catégorie]
const CAS = [
  ['ma poubelle déborde', 'poubelle-pleine', 'familier'],
  ['plus d’eau au robinet', 'coupure-eau', 'familier'],
  ['papier pour me marier', 'acte-mariage', 'familier'],
  ['lampadère cassé', 'lampadaire', 'faute'],
  ['le lampadair devant chez moi est cassé', 'lampadaire', 'faute'],
  ['jai demenager hier', 'changement-adresse', 'faute'],
  ['y a un trou enorme dans la rue', 'trou-chaussee', 'familier'],
  ['mon voisin fait trop de bruit la nuit', 'bruit', 'familier'],
  ['je cherche du taf', 'recherche-emploi', 'familier'],
  ['inscrir mon fils a lecole', 'inscription-scolaire', 'faute'],
  ['jai perdu ma carte didentiter', 'papiers-identite', 'faute'],
  ['aide pour payer le loyé', 'aide-logement', 'faute'],
  ['j’ai plus un rond pour manger', 'aide-urgence', 'familier'],
  ['les ordures sont pas ramassé depuis une semaine', 'poubelle-pleine', 'faute'],
  ['fuite d’o dans la rue', 'fuite-eau', 'faute'],
  ['facture d’électricité trop chère', 'facture-energie', 'familier'],
  ['prochaine navete', 'horaires-navette', 'faute'],
  ['vaccin pour mon bébé', 'vaccination', 'familier'],
  ['je me suis fait expulser je dors dehors', 'hebergement-urgence', 'familier'],
  ['agrandir mon module avec une veranda', 'permis-travaux', 'familier'],
  ['ou en est mon dossier NT-1036', 'suivre-demande', 'familier'],
  ['mot de passe oublier', 'compte', 'faute'],
  ['je viens d’arriver sur terra nova', 'nouvel-arrivant', 'familier'],
  ['jeter un vieux canapé', 'encombrants', 'familier'],
  ['odeur de gaz dans la rue', 'danger-voie', 'familier'],
  ['acte de naissence pour mon fils', 'acte-naissance', 'faute'],
  ['une place en crèche pour ma fille', 'creche', 'familier'],
  ['emprunter des livres', 'mediatheque', 'familier'],
  ['il fait trop chaud chez moi', 'chaleur', 'familier'],
  ['plus de courant chez moi', 'coupure-electricite', 'familier'],
  ['pharmacie ouverte la nuit', 'pharmacie-garde', 'familier'],
  ['the bin is overflowing', 'poubelle-pleine', 'anglais'],
  ['no water in my flat', 'coupure-eau', 'anglais'],
  ['streetlight broken near my house', 'lampadaire', 'anglais'],
  ['how do i get maried', 'acte-mariage', 'anglais'],
  ['I lost my bag on the shuttle', 'objet-perdu', 'anglais'],
  ['busco trabajo', 'recherche-emploi', 'espagnol'],
  ['la farola está rota', 'lampadaire', 'espagnol'],
  ['no hay agua en mi casa', 'coupure-eau', 'espagnol'],
  ['quiero casarme', 'acte-mariage', 'espagnol'],
  ['necesito ayuda para pagar el alquiler', 'aide-logement', 'espagnol'],
  ['عمود الإنارة معطل', 'lampadaire', 'arabe'],
  ['أريد الزواج', 'acte-mariage', 'arabe'],
  ['انقطاع الماء', 'coupure-eau', 'arabe'],
  ['ابحث عن عمل', 'recherche-emploi', 'arabe'],
  // Phrases écrites après coup, sans les recopier des expressions de la base (mesure honnête de la généralisation)
  ['y’a pu de lumière dans ma rue', 'lampadaire', 'inedit'],
  ['le conteneur est plein à craquer', 'poubelle-pleine', 'inedit'],
  ['robinet sec depuis ce matin', 'coupure-eau', 'inedit'],
  ['comment obtenir un extrait d’acte de naissance', 'acte-naissance', 'inedit'],
  ['on se marie en juin quels papiers', 'acte-mariage', 'inedit'],
  ['mon passeport est expiré', 'papiers-identite', 'inedit'],
  ['mon chauffage marche plus', 'reparation-logement', 'inedit'],
  ['je trouve pas de boulot', 'recherche-emploi', 'inedit'],
  ['je veux apprendre l’informatique', 'formation', 'inedit'],
  ['inscription cantine pour la rentrée', 'cantine', 'inedit'],
  ['rendez vous chez le médecin pour mon fils', 'consultation-sante', 'inedit'],
  ['ma fille doit faire ses vaccins', 'vaccination', 'inedit'],
  ['prix de l’abonnement mensuel navette', 'abonnement-transport', 'inedit'],
  ['réduction transport pour étudiant', 'tarif-reduit', 'inedit'],
  ['trottoir défoncé devant chez moi', 'trou-chaussee', 'inedit'],
  ['musique à fond chez le voisin', 'bruit', 'inedit'],
  ['j’ai pas reçu de réponse à ma demande', 'suivre-demande', 'inedit'],
  ['comment je me connecte', 'compte', 'inedit'],
  ['où se trouve la mairie', 'horaires-mairie', 'inedit'],
  ['quelqu’un a laissé des sacs d’ordures sur le trottoir', 'depot-sauvage', 'inedit'],
  ['my rent is too expensive I need help', 'aide-logement', 'inedit'],
  ['where can I borrow books', 'mediatheque', 'inedit'],
  ['necesito un médico', 'consultation-sante', 'inedit'],
  ['perdí mi pasaporte', 'papiers-identite', 'inedit'],
  ['أبحث عن سكن', 'demande-logement', 'inedit'],
  ['my kid needs to start school', 'inscription-scolaire', 'inedit'],
  ['power is out in my apartment', 'coupure-electricite', 'inedit']
];

const detail = process.argv.includes('--detail');
let top1 = 0, top3 = 0;
const parCat = {};
const t0 = process.hrtime.bigint();
for (const [q, attendu, cat] of CAS) {
  const { a, liste } = M.classer(index, q);
  const besoins = liste.filter((x) => x.f.type === 'besoin').map((x) => x.f.id);
  const r = M.repondre(index, { message: q, langue: 'fr' });
  const premier = r.reponse ? r.reponse.id : r.clarification ? r.clarification.options[0].id : besoins[0];
  const ok1 = premier === attendu;
  const ok3 = besoins.slice(0, 3).includes(attendu) || (r.clarification && r.clarification.options.some((o) => o.id === attendu));
  top1 += ok1; top3 += ok3;
  parCat[cat] = parCat[cat] || { n: 0, t1: 0, t3: 0 }; parCat[cat].n++; parCat[cat].t1 += ok1; parCat[cat].t3 += ok3;
  if (detail || !ok1) console.log(`${ok1 ? 'OK ' : ok3 ? '~3 ' : 'KO '} ${q.padEnd(46)} → ${String(premier).padEnd(22)} ${r.clarification ? '(précision demandée) ' : ''}attendu ${attendu}${a.corrections.length ? '  [corrigé : ' + a.corrige + ']' : ''}  top3=${besoins.slice(0, 3).join(',')}`);
}
const ms = Number(process.hrtime.bigint() - t0) / 1e6;
console.log(`\n${CAS.length} phrases · top-1 ${top1}/${CAS.length} (${Math.round((100 * top1) / CAS.length)} %) · top-3 ${top3}/${CAS.length} (${Math.round((100 * top3) / CAS.length)} %) · ${(ms / CAS.length).toFixed(1)} ms par phrase (analyse + réponse)`);
for (const [c, v] of Object.entries(parCat)) console.log(`  ${c.padEnd(9)} ${v.t1}/${v.n} top-1, ${v.t3}/${v.n} top-3`);
// Recherche globale : jamais d'impasse
const vide = M.rechercher(index, 'xqzwv blorp', 'fr');
console.log(`\nRecherche sans résultat → repli : ${vide.repli ? vide.repli.services.map((s) => s.id).join(', ') : 'AUCUN'}`);
const rech = M.rechercher(index, 'lampadère cassé', 'fr');
console.log(`Recherche « lampadère cassé » → vouliez-vous dire « ${rech.corrige} » ; ${rech.total} résultats, meilleur geste : ${rech.meilleur && rech.meilleur.titre}`);
if (process.argv.includes('--exiger')) process.exit(top1 / CAS.length >= 0.8 ? 0 : 1);
