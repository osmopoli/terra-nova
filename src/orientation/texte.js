/* Terra Nova — vague 18 (D10, F91, F92) : outils de texte du moteur d'orientation, sans dépendance et déterministes.
   - normalisation : casse, accents, ligatures, apostrophes ; arabe : voyelles courtes, tatwil, formes de l'alif, ى → ي, ة → ه ;
   - découpage en mots (lettres et chiffres Unicode), mots vides FR / EN / ES / AR ;
   - racinisation légère (suffixes courants, préfixes de l'arabe), clé phonétique simple (ph → f, ai → e, eau → o…) ;
   - distance de Damerau-Levenshtein (transpositions comprises) et similarité par trigrammes, pour tolérer les fautes de frappe. */
'use strict';

function normaliser(s) {
  return String(s == null ? '' : s)
    .replace(/[œŒ]/g, 'oe').replace(/[æÆ]/g, 'ae').replace(/ß/g, 'ss')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    // arabe : voyelles courtes et signes, tatwil, alif, alif maqsura, ta marbuta
    .replace(/[ً-ْٰـ]/g, '').replace(/[آأإٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
    .replace(/[’‘'`´]/g, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

const VIDES = new Set((
  // français
  'le la les l un une des du de d au aux et ou mais donc or ni car je j me m moi tu te t toi il elle on nous vous ils elles se s mon ma mes ton ta tes son sa ses ' +
  'notre nos votre vos leur leurs ce cet cette ces c ca cela ceci qui que qu quoi dont est suis es sont ai as a avons avez ont etre avoir fait faire fais ' +
  'pour par avec sur sous dans en y ne pas tres bien comme quand comment pourquoi voudrais voudrait veux veut voulez vouloir peux peut pouvez puis puisse ' +
  'faut bonjour bonsoir svp stp merci plait madame monsieur alors aussi encore deja tout tous toute toutes chez quel quelle quels quelles ici la-bas ' +
  'besoin aimerais souhaite souhaiterais cherche trouver savoir dois doit devrais aidez help jai cest chui jsuis ya yen pk pq ke koi quil quelqu ' +
  // anglais
  'the an and or but i me my we our you your he she it its they them is are am was were be been being do does did have has had to of in on at for with from by ' +
  'about as this that these those what which who how why when where can could would should will want wanna need please hello hi hey thanks thank there here ' +
  'get got just some any im ive dont id let lets would like plz pls u ur ' +
  // espagnol
  'el los las unos unas y o pero del al con por para como cuando donde quien yo mi mis tu ti su sus nuestro nuestra soy estoy esta estan ' +
  'hay tengo tiene quiero quisiera necesito puedo puede hola gracias favor lo le les muy ya usted ' +
  // arabe (normalisé)
  'في من علي الي عن مع هذا هذه ذلك التي الذي انا اريد هل كيف ماذا لماذا متي اين لا ما و يا فضلك شكرا مرحبا عندي لي اني'
).split(/\s+/).filter(Boolean));

const SUFFIXES = ['issements', 'issement', 'ements', 'ement', 'ations', 'ation', 'itions', 'ition', 'ciones', 'cion', 'ances', 'ance', 'ences', 'ence',
  'euses', 'euse', 'eurs', 'eur', 'eux', 'ments', 'ment', 'mente', 'ables', 'able', 'ages', 'age', 'istes', 'iste', 'ites', 'ite', 'ives', 'ive', 'ifs',
  'ando', 'iendo', 'ados', 'adas', 'ado', 'ada', 'ings', 'ing', 'ies', 'ied', 'ers', 'ees', 'ee', 'ed', 'er', 'es', 'ez', 'ent', 'ant', 'ais', 'ait', 'os', 'as', 'e', 's', 'x', 'a', 'o'];
const AR_PREFIXES = ['وال', 'بال', 'كال', 'فال', 'لل', 'ال'];
const AR_SUFFIXES = ['ات', 'ون', 'ين', 'ها', 'يه', 'ه'];
const estArabe = (m) => /[؀-ۿ]/.test(m);

function raciner(m) {
  if (!m) return m;
  if (/^\d+$/.test(m)) return m;
  if (estArabe(m)) {
    let r = m;
    for (const p of AR_PREFIXES) if (r.startsWith(p) && r.length - p.length >= 2) { r = r.slice(p.length); break; }
    for (const s of AR_SUFFIXES) if (r.endsWith(s) && r.length - s.length >= 2) { r = r.slice(0, -s.length); break; }
    return r;
  }
  for (const s of SUFFIXES) if (m.length - s.length >= 3 && m.endsWith(s)) return m.slice(0, -s.length);
  return m;
}

// Clé phonétique très simple (français surtout) : « lampadère » et « lampadaire » donnent la même clé
function phonetique(m) {
  if (estArabe(m)) return m;
  return m.replace(/ph/g, 'f').replace(/qu/g, 'k').replace(/c([eiy])/g, 's$1').replace(/c/g, 'k').replace(/(eau|au)/g, 'o')
    .replace(/(ai|ei|e)/g, 'e').replace(/y/g, 'i').replace(/h/g, '').replace(/(.)\1+/g, '$1').replace(/[sxtdz]$/, '');
}

const mots = (s) => normaliser(s).split(' ').filter(Boolean);
const motsUtiles = (s) => mots(s).filter((m) => !VIDES.has(m) && (m.length > 1 || /\d/.test(m)));

// Damerau-Levenshtein (variante « alignement optimal » : transposition de deux lettres voisines = 1), arrêt anticipé au-delà de max
function distance(a, b, max = 3) {
  if (a === b) return 0;
  const la = a.length, lb = b.length;
  if (Math.abs(la - lb) > max) return max + 1;
  let p2 = null, p1 = Array.from({ length: lb + 1 }, (_, j) => j);
  for (let i = 1; i <= la; i++) {
    const c = [i];
    let minLigne = i;
    for (let j = 1; j <= lb; j++) {
      const cout = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(p1[j] + 1, c[j - 1] + 1, p1[j - 1] + cout);
      if (p2 && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, p2[j - 2] + 1);
      c[j] = v;
      if (v < minLigne) minLigne = v;
    }
    if (minLigne > max) return max + 1;
    p2 = p1; p1 = c;
  }
  return p1[lb];
}
const seuilFaute = (m) => (m.length <= 3 ? 0 : m.length <= 7 ? 1 : m.length <= 11 ? 2 : 3);

function trigrammes(s) {
  const t = ' ' + normaliser(s) + ' ';
  const r = new Set();
  for (let i = 0; i < t.length - 2; i++) r.add(t.slice(i, i + 3));
  return r;
}
function similarite(a, b) {
  const A = a instanceof Set ? a : trigrammes(a), B = b instanceof Set ? b : trigrammes(b);
  if (!A.size || !B.size) return 0;
  let n = 0; for (const x of A) if (B.has(x)) n++;
  return (2 * n) / (A.size + B.size);
}

// Anonymisation des questions conservées pour les agents : chiffres, adresses e-mail, numéros, mots très longs retirés
function anonymiser(s) {
  return normaliser(String(s || '').replace(/\S+@\S+/g, ' ').replace(/https?:\/\/\S+/g, ' '))
    .replace(/\d+/g, '#').replace(/(# ?){2,}/g, '# ')
    .split(' ').filter((m) => m && m.length <= 24).slice(0, 14).join(' ').slice(0, 90).trim();
}

module.exports = { normaliser, mots, motsUtiles, raciner, phonetique, distance, seuilFaute, trigrammes, similarite, VIDES, anonymiser, estArabe };
