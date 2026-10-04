// Terra Nova — vague 19 (F94) : page « Infos essentielles » (/essentiel), toujours disponible.
// Produite par le serveur, sans script nécessaire, quelques kilo-octets, imprimable, 4 langues (arabe de droite à gauche) :
// alertes et messages officiels en cours avec leurs consignes, numéros d'urgence (15, 17, 18, 112, 114 + numéros de Terra Nova),
// état des services, contacts utiles (mairie, associations et leurs horaires), heure de la dernière mise à jour.
// Construite à partir du « paquet essentiel » (src/continuite.js) : pendant un incident, la dernière copie bonne est affichée
// avec son heure. Copiée par le Service Worker : elle s'affiche aussi sans connexion, et sert de page de secours.
// Un petit script facultatif (assets/js/essentiel.js) ajoute « Vos demandes récentes » pour un habitant connecté (copie gardée
// seulement dans son navigateur) et le bouton « Imprimer ».
const router = require('express').Router();
const zlib = require('node:zlib');
const fs = require('node:fs');
const path = require('node:path');

const LANGUES = { fr: 'Français', en: 'English', es: 'Español', ar: 'العربية' };
const LOCALES = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES', ar: 'ar' };
const TZ = process.env.TZ_VILLE || 'Indian/Mayotte';
const T = {
  fr: { titre: 'Infos essentielles', intro: 'L’essentiel pour vous informer et vous protéger : alertes, consignes, numéros d’urgence, état des services et contacts utiles. Cette page reste disponible pendant un incident et s’affiche aussi sans connexion si vous l’avez déjà ouverte.',
    evitement: 'Aller au contenu', maj: 'Mis à jour le {d}', copie: 'Copie de secours : le service en ligne est perturbé en ce moment. Informations enregistrées le {d} ; elles restent valables, la page se met à jour dès le retour à la normale.',
    urgences: 'Numéros d’urgence', gratuit: 'appel gratuit', locaux: 'Numéros de Terra Nova', h24: '24 h/24', appeler: 'Appeler le {n}',
    alertes: 'Alertes et messages officiels en cours', aucune: 'Aucune alerte ni message officiel en cours.', officiel: 'Message officiel du Haut Conseil de la Ville', faire: 'Ce que vous devez faire', zone: 'Zone', toute: 'Toute la ville', publics: 'Personnes concernées',
    consignes: 'Consignes', services: 'État des services', tousOk: 'Tous les services fonctionnent normalement.', autresOk: 'Fonctionnent normalement : {l}.', retour: 'Retour prévu', pourquoi: 'Pourquoi', prochaine: 'Que faire',
    disponible: 'Disponible', perturbe: 'Perturbé', indisponible: 'Indisponible', contacts: 'Contacts utiles', mairie: 'Mairie de Terra Nova', adresse: 'Adresse', horaires: 'Horaires', courriel: 'Courriel', tel: 'Téléphone',
    assos: 'Associations partenaires', ouverte: 'Ouverte maintenant', fermee: 'Fermée en ce moment', aide: 'Aide pour', jours: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'], ferme: 'fermée',
    moi: 'Vos demandes récentes', simple: 'Version simple', complete: 'Version complète', langue: 'Langue', imprimer: 'Pour imprimer : Ctrl + P (ou « Imprimer » dans le menu du navigateur).',
    poids: 'Cette page pèse {ko} Ko ({kc} Ko compressée).', pied: 'Terra Nova · plateforme citoyenne', servicesContacts: 'Contacter un service' },
  en: { titre: 'Essential information', intro: 'The essentials to stay informed and safe: alerts, instructions, emergency numbers, service status and useful contacts. This page stays available during an incident and also works offline if you have opened it before.',
    evitement: 'Skip to content', maj: 'Updated on {d}', copie: 'Backup copy: the online service is disrupted right now. Information saved on {d}; it remains valid and the page updates as soon as things are back to normal.',
    urgences: 'Emergency numbers', gratuit: 'free call', locaux: 'Terra Nova numbers', h24: '24/7', appeler: 'Call {n}',
    alertes: 'Current alerts and official messages', aucune: 'No alert or official message at the moment.', officiel: 'Official message from the City High Council', faire: 'What you need to do', zone: 'Area', toute: 'Whole city', publics: 'People concerned',
    consignes: 'Instructions', services: 'Service status', tousOk: 'All services are working normally.', autresOk: 'Working normally: {l}.', retour: 'Expected return', pourquoi: 'Why', prochaine: 'What to do',
    disponible: 'Available', perturbe: 'Disrupted', indisponible: 'Unavailable', contacts: 'Useful contacts', mairie: 'Terra Nova town hall', adresse: 'Address', horaires: 'Opening hours', courriel: 'Email', tel: 'Phone',
    assos: 'Partner associations', ouverte: 'Open now', fermee: 'Closed right now', aide: 'Help with', jours: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], ferme: 'closed',
    moi: 'Your recent requests', simple: 'Simple version', complete: 'Full version', langue: 'Language', imprimer: 'To print: Ctrl + P (or “Print” in the browser menu).',
    poids: 'This page weighs {ko} KB ({kc} KB compressed).', pied: 'Terra Nova · citizen platform', servicesContacts: 'Contact a service' },
  es: { titre: 'Información esencial', intro: 'Lo esencial para informarse y protegerse: alertas, indicaciones, números de emergencia, estado de los servicios y contactos útiles. Esta página sigue disponible durante un incidente y también funciona sin conexión si ya la ha abierto.',
    evitement: 'Ir al contenido', maj: 'Actualizado el {d}', copie: 'Copia de seguridad: el servicio en línea tiene incidencias ahora mismo. Información guardada el {d}; sigue siendo válida y la página se actualiza en cuanto todo vuelva a la normalidad.',
    urgences: 'Números de emergencia', gratuit: 'llamada gratuita', locaux: 'Números de Terra Nova', h24: '24 h', appeler: 'Llamar al {n}',
    alertes: 'Alertas y mensajes oficiales en curso', aucune: 'Ninguna alerta ni mensaje oficial en curso.', officiel: 'Mensaje oficial del Alto Consejo de la Ciudad', faire: 'Lo que debe hacer', zone: 'Zona', toute: 'Toda la ciudad', publics: 'Personas afectadas',
    consignes: 'Indicaciones', services: 'Estado de los servicios', tousOk: 'Todos los servicios funcionan con normalidad.', autresOk: 'Funcionan con normalidad: {l}.', retour: 'Vuelta prevista', pourquoi: 'Por qué', prochaine: 'Qué hacer',
    disponible: 'Disponible', perturbe: 'Con incidencias', indisponible: 'No disponible', contacts: 'Contactos útiles', mairie: 'Ayuntamiento de Terra Nova', adresse: 'Dirección', horaires: 'Horario', courriel: 'Correo', tel: 'Teléfono',
    assos: 'Asociaciones colaboradoras', ouverte: 'Abierta ahora', fermee: 'Cerrada en este momento', aide: 'Ayuda con', jours: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'], ferme: 'cerrada',
    moi: 'Sus solicitudes recientes', simple: 'Versión sencilla', complete: 'Versión completa', langue: 'Idioma', imprimer: 'Para imprimir: Ctrl + P (o «Imprimir» en el menú del navegador).',
    poids: 'Esta página pesa {ko} KB ({kc} KB comprimida).', pied: 'Terra Nova · plataforma ciudadana', servicesContacts: 'Contactar con un servicio' },
  ar: { titre: 'معلومات أساسية', intro: 'الأساسي لتبقى على علم وفي أمان: التنبيهات والتعليمات وأرقام الطوارئ وحالة الخدمات وجهات الاتصال المفيدة. تبقى هذه الصفحة متاحة أثناء أي عطل، وتعمل أيضاً دون اتصال إذا سبق أن فتحتها.',
    evitement: 'انتقل إلى المحتوى', maj: 'آخر تحديث {d}', copie: 'نسخة احتياطية: الخدمة الإلكترونية مضطربة حالياً. معلومات محفوظة بتاريخ {d}؛ تبقى صالحة وتتحدث الصفحة فور عودة الأمور إلى طبيعتها.',
    urgences: 'أرقام الطوارئ', gratuit: 'مكالمة مجانية', locaux: 'أرقام Terra Nova', h24: '24/24', appeler: 'اتصل بالرقم {n}',
    alertes: 'التنبيهات والرسائل الرسمية الجارية', aucune: 'لا يوجد تنبيه أو رسالة رسمية حالياً.', officiel: 'رسالة رسمية من المجلس الأعلى للمدينة', faire: 'ما يجب عليك فعله', zone: 'المنطقة', toute: 'كل المدينة', publics: 'الأشخاص المعنيون',
    consignes: 'تعليمات', services: 'حالة الخدمات', tousOk: 'كل الخدمات تعمل بشكل عادي.', autresOk: 'تعمل بشكل عادي: {l}.', retour: 'العودة المتوقعة', pourquoi: 'السبب', prochaine: 'ماذا تفعل',
    disponible: 'متاحة', perturbe: 'مضطربة', indisponible: 'غير متاحة', contacts: 'جهات اتصال مفيدة', mairie: 'بلدية Terra Nova', adresse: 'العنوان', horaires: 'المواعيد', courriel: 'البريد الإلكتروني', tel: 'الهاتف',
    assos: 'الجمعيات الشريكة', ouverte: 'مفتوحة الآن', fermee: 'مغلقة حالياً', aide: 'مساعدة في', jours: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'], ferme: 'مغلقة',
    moi: 'طلباتك الأخيرة', simple: 'النسخة المبسطة', complete: 'النسخة الكاملة', langue: 'اللغة', imprimer: 'للطباعة: Ctrl + P (أو «طباعة» في قائمة المتصفح).',
    poids: 'وزن هذه الصفحة {ko} كيلوبايت ({kc} كيلوبايت مضغوطة).', pied: 'Terra Nova · منصة المواطنين', servicesContacts: 'الاتصال بخدمة' }
};

const e = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const choisir = (o, l) => (o && typeof o === 'object' ? o[l] || o.fr || '' : o || '');
const tel = (n) => String(n || '').replace(/[^\d+]/g, '');
const niveau = (s) => { const c = (s.etat && s.etat.code) || 'ok'; return c === 'ok' ? 'disponible' : c === 'desactive' ? 'indisponible' : 'perturbe'; };
function langueDe(req) {
  const q = String(req.query.lang || '');
  if (LANGUES[q]) return q;
  const acc = String(req.headers['accept-language'] || '').slice(0, 2).toLowerCase();
  return LANGUES[acc] ? acc : 'fr';
}
const dateHeure = (iso, l) => { try { return new Date(iso).toLocaleString(LOCALES[l], { timeZone: TZ, day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }); } catch { return iso; } };
// Jour (0-6) et heure « HH:MM » dans le fuseau de la ville
function maintenantVille() {
  try {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).map((x) => [x.type, x.value]));
    return { j: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), h: `${p.hour}:${p.minute}` };
  } catch { const d = new Date(); return { j: d.getDay(), h: d.toTimeString().slice(0, 5) }; }
}
const ouverte = (a, m) => (a.plages || []).some(([jours, de, fin]) => jours.includes(m.j) && m.h >= de && m.h < fin);
const plagesTexte = (a, t) => (a.plages || []).map(([jours, de, fin]) => `${jours.map((j) => t.jours[j]).join(' ')} ${de}–${fin}`).join(' · ') || t.ferme;

let feuille = '';
try { feuille = fs.readFileSync(path.join(__dirname, '..', '..', 'public', 'assets', 'css', 'essentiel.css'), 'utf8').length ? '/assets/css/essentiel.css' : ''; } catch { feuille = ''; }

function corps(d, l, stale) {
  const t = T[l];
  const m = maintenantVille();
  const numeros = (d.numeros || []).map((n) => `<li><a class="ess-tel" href="tel:${e(tel(n.numero))}"><strong>${e(n.numero)}</strong> <span>${e(choisir(n.libelle, l))}</span></a>${n.gratuit ? ` <small>· ${e(t.gratuit)}</small>` : ''}</li>`).join('');
  const locaux = (d.locaux || []).map((n) => `<li><a class="ess-tel" href="tel:${e(tel(n.numero))}"><strong>${e(n.numero)}</strong> <span>${e(choisir(n.libelle, l))}</span></a> <small>· ${e(n.h24 ? t.h24 : n.horaires || '')}</small></li>`).join('');
  const officiels = (d.officiels || []).map((o) => {
    const tr = (o.traductions || {})[l]; const c = tr && tr.titre && tr.message ? { titre: tr.titre, message: tr.message, actions: tr.actions && tr.actions.length ? tr.actions : o.actions } : o;
    return `<li class="ess-officiel"><p class="ess-source">${e(t.officiel)}</p><h3>${e(c.titre)}</h3>${o.audience && o.audience !== 'Toute la ville' ? `<p>${e(t.zone)} : ${e(o.audience)}</p>` : ''}<p>${e(c.message)}</p>
      ${(c.actions || []).length ? `<p><strong>${e(t.faire)} :</strong></p><ul>${c.actions.map((x) => `<li>${e(x)}</li>`).join('')}</ul>` : ''}</li>`;
  }).join('');
  const alertes = (d.alertes || []).map((a) => `<li class="ess-alerte ess-${e(a.importance)}"><h3>${a.importance === 'alerte' ? '⚠ ' : ''}${e(a.titre)}</h3>
    <p>${e(t.zone)} : ${e(a.zone === 'Toute la ville' ? t.toute : a.zone)} · ${e(dateHeure(a.cree, l))}</p>${a.resume ? `<p>${e(a.resume)}</p>` : ''}
    ${(a.consignes || []).length ? `<p><strong>${e(t.consignes)} :</strong></p><ul>${a.consignes.map((x) => `<li>${e(x)}</li>`).join('')}</ul>` : ''}
    ${(a.publics || []).length ? `<p>${e(t.publics)} : ${a.publics.map(e).join(', ')}</p>` : ''}</li>`).join('');
  const difficiles = (d.services || []).filter((s) => niveau(s) !== 'disponible');
  const ok = (d.services || []).filter((s) => niveau(s) === 'disponible');
  const etatSvc = difficiles.map((s) => { const et = s.etat || {}; const n = niveau(s);
    return `<li class="simple-etat simple-etat-${n}"><p><strong>${e(choisir(s.nom, l))}</strong> — ${e(t[n])}</p><dl>${et.message ? `<dt>${e(t.pourquoi)}</dt><dd>${e(et.message)}</dd>` : ''}${et.retour ? `<dt>${e(t.retour)}</dt><dd>${e(et.retour)}</dd>` : ''}${et.alternative && et.alternative.texte ? `<dt>${e(t.prochaine)}</dt><dd>${e(et.alternative.texte)}</dd>` : ''}</dl></li>`; }).join('');
  const mairie = d.mairie || {};
  const telMairie = (d.locaux || []).find((x) => x.id === 'mairie');
  const assos = (d.associations || []).map((a) => `<li><strong>${e(a.nom)}</strong> — <span class="ess-${ouverte(a, m) ? 'ouverte' : 'fermee'}">${e(ouverte(a, m) ? t.ouverte : t.fermee)}</span>
    <br>${e(t.horaires)} : ${e(plagesTexte(a, t))}${a.info ? ` · ${e(a.info)}` : ''}<br>${a.tel ? `<a href="tel:${e(tel(a.tel))}">${e(a.tel)}</a> · ` : ''}${e(a.adresse || '')}
    ${(choisir(a.aide, l) || []).length ? `<br><small>${e(t.aide)} : ${(choisir(a.aide, l) || []).slice(0, 3).map(e).join(' · ')}</small>` : ''}</li>`).join('');
  const contactsSvc = (d.services || []).map((s) => `<li><strong>${e(choisir(s.nom, l))}</strong> — ${e(s.horaires || '')}${s.lieu ? ` · ${e(s.lieu)}` : ''}${s.contact ? ` · ${s.contact.includes('@') ? `<a href="mailto:${e(s.contact)}">${e(s.contact)}</a>` : e(s.contact)}` : ''}</li>`).join('');
  return `<h1>${e(t.titre)}</h1><p>${e(t.intro)}</p>
  <p class="ess-maj"${stale ? ' role="status"' : ''}>${e(stale ? t.copie.replace('{d}', dateHeure(d.majLe, l)) : t.maj.replace('{d}', dateHeure(d.majLe, l)))}</p>
  <section aria-labelledby="ess-urg"><h2 id="ess-urg">${e(t.urgences)}</h2><ul class="ess-numeros">${numeros}</ul>
    <h3>${e(t.locaux)}</h3><ul class="ess-numeros">${locaux}</ul></section>
  <section aria-labelledby="ess-al"><h2 id="ess-al">${e(t.alertes)}</h2>${officiels || alertes ? `<ul class="simple-liste ess-liste">${officiels}${alertes}</ul>` : `<p>${e(t.aucune)}</p>`}</section>
  <section aria-labelledby="ess-cons"><h2 id="ess-cons">${e(t.consignes)}</h2><ul class="simple-liste">${(choisir(d.consignes, l) || []).map((c) => `<li>${e(c)}</li>`).join('')}</ul></section>
  <section aria-labelledby="ess-svc"><h2 id="ess-svc">${e(t.services)}</h2>${difficiles.length ? `<ul class="ess-liste">${etatSvc}</ul><p>${e(t.autresOk.replace('{l}', ok.map((s) => choisir(s.nom, l)).join(', ')))}</p>` : `<p>${e(t.tousOk)}</p>`}</section>
  <section id="ess-moi" aria-labelledby="ess-moi-h" hidden><h2 id="ess-moi-h">${e(t.moi)}</h2><div id="ess-moi-liste"></div></section>
  <section aria-labelledby="ess-ct"><h2 id="ess-ct">${e(t.contacts)}</h2>
    <h3>${e(t.mairie)}</h3><dl class="simple-infos">${mairie.adresse ? `<dt>${e(t.adresse)}</dt><dd>${e(mairie.adresse)}</dd>` : ''}${telMairie ? `<dt>${e(t.tel)}</dt><dd><a href="tel:${e(tel(telMairie.numero))}">${e(telMairie.numero)}</a></dd>` : ''}
      ${mairie.horaires ? `<dt>${e(t.horaires)}</dt><dd>${e(mairie.horaires)}</dd>` : ''}${mairie.courriel ? `<dt>${e(t.courriel)}</dt><dd><a href="mailto:${e(mairie.courriel)}">${e(mairie.courriel)}</a></dd>` : ''}</dl>
    <h3>${e(t.assos)}</h3><ul class="simple-liste">${assos}</ul>
    <details><summary>${e(t.servicesContacts)}</summary><ul class="simple-liste">${contactsSvc}</ul></details></section>`;
}

function rendre(req, res, opts) {
  const o = opts || {};
  const l = langueDe(req), t = T[l];
  let p;
  try { p = require('../continuite').essentiel(); } catch { res.status(503).type('text').send('Terra Nova : 15 (SAMU) · 17 (police) · 18 (pompiers) · 112'); return; }
  const stale = !!(o.stale || p.stale);
  const d = p.donnees;
  const langues = Object.entries(LANGUES).map(([c, n]) => (c === l ? `<strong lang="${c}">${n}</strong>` : `<a href="/essentiel?lang=${c}" lang="${c}" hreflang="${c}">${n}</a>`)).join(' · ');
  const rendu = (poids) => `<!doctype html>
<html lang="${l}" dir="${l === 'ar' ? 'rtl' : 'ltr'}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(t.titre)} — Terra Nova</title><meta name="description" content="${e(t.intro)}"><meta name="theme-color" content="#0b1a1c">
<link rel="stylesheet" href="/assets/css/theme.css"><link rel="stylesheet" href="/assets/css/simple.css">${feuille ? `<link rel="stylesheet" href="${feuille}">` : ''}
<script src="/assets/js/essentiel.js" defer></script></head>
<body class="simple essentiel" data-lang="${l}">
<a class="evitement" href="#contenu">${e(t.evitement)}</a>
<header class="simple-tete"><p class="simple-marque"><a href="/essentiel?lang=${l}">Terra Nova</a> <span>${e(t.titre)}</span></p>
<nav aria-label="${e(t.titre)}"><a href="/simple?lang=${l}">${e(t.simple)}</a><a href="/index.html">${e(t.complete)}</a></nav></header>
<main id="contenu">${corps(d, l, stale)}</main>
<footer class="simple-pied"><p>${e(t.langue)} : ${langues}</p><p class="ess-imprimer">${e(t.imprimer)}</p><p>${e(t.pied)}${poids ? ' · ' + e(poids) : ''}</p></footer>
</body></html>`;
  const brouillon = rendu('');
  const ko = (n) => (Math.round(n / 102.4) / 10).toLocaleString(LOCALES[l]);
  const html = rendu(t.poids.replace('{ko}', ko(Buffer.byteLength(brouillon))).replace('{kc}', ko(zlib.brotliCompressSync(brouillon).length)));
  res.status(o.statut || 200);
  res.set('Cache-Control', stale ? 'no-store' : 'no-cache');   // public, sans donnée personnelle : copiée hors connexion (sauf copie de secours)
  res.set('Vary', 'Accept-Encoding, Accept-Language');
  if (stale) res.set('X-Copie-De-Secours', d.majLe);
  res.type('html');
  const accepte = String(req.headers['accept-encoding'] || '');
  if (/\bbr\b/.test(accepte)) { res.set('Content-Encoding', 'br'); return res.send(zlib.brotliCompressSync(html)); }
  if (/\bgzip\b/.test(accepte)) { res.set('Content-Encoding', 'gzip'); return res.send(zlib.gzipSync(html)); }
  res.send(html);
}

router.get(['/essentiel', '/essentiel.html', '/simple/essentiel'], (req, res) => rendre(req, res));
// F95 : plus de « 404 » de 22 Ko pour l'icône demandée par tous les navigateurs : l'emblème (5 Ko), gardé une semaine
const ICONE = path.join(__dirname, '..', '..', 'public', 'assets', 'img', 'logo-embleme-96.webp');
router.get('/favicon.ico', (req, res) => { res.set('Cache-Control', 'public, max-age=604800'); res.type('image/webp'); res.sendFile(ICONE); });

module.exports = { router, rendre };
