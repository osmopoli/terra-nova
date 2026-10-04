// Terra Nova — F62 : version simple et rapide des pages essentielles (accueil, services, état d'un service, suivi d'une demande).
// Pages produites par le serveur : texte et actions principales seulement, aucune image, aucun script, une petite feuille de style.
// Elles restent lisibles sur un appareil ancien ou une connexion faible, et renvoient toujours vers la version complète.
// Adresses : /simple, /simple/services, /simple/services/:id, /simple/suivi?id=NT-1036 ; ?simple=1 sur une page complète y redirige.
const router = require('express').Router();
const zlib = require('node:zlib');
const { docs } = require('../donnees');
const A = require('../auth');

const LANGUES = { fr: 'Français', en: 'English', es: 'Español', ar: 'العربية' };
const T = {
  fr: {
    evitement: 'Aller au contenu', titre: 'Version simple', intro: 'L’essentiel de Terra Nova : du texte et les actions principales, sans image ni effet. Cette version s’affiche vite, même avec une connexion faible ou un appareil ancien.',
    complete: 'Version complète', langue: 'Langue', accueil: 'Accueil', services: 'Services', suivi: 'Suivre une demande',
    alertes: 'Alertes en cours', aucuneAlerte: 'Aucune alerte en cours.', consignes: 'Que faire', zone: 'Zone',
    actions: 'Que voulez-vous faire ?', aServices: 'Voir les services et leur état', aSuivi: 'Suivre une demande', aDemande: 'Faire une demande ou poser une question',
    aSignalement: 'Signaler un problème (éclairage, voirie, déchets…)', aRdv: 'Prendre rendez-vous', urgences: 'Urgences : SAMU 15 · numéro européen 112 (appel gratuit).',
    enDifficulte: 'Services perturbés ou indisponibles', toutVaBien: 'Tous les services fonctionnent normalement.',
    servicesIntro: 'Pour chaque service : son état et la prochaine action possible.',
    disponible: 'Disponible', perturbe: 'Perturbé', indisponible: 'Indisponible',
    tDisponible: 'Service disponible : vous pouvez commencer votre démarche.', tPerturbe: 'Service perturbé : il fonctionne en partie pour le moment.',
    tIndisponible: 'Service indisponible : la ville a suspendu les démarches en ligne de ce service.',
    pourquoi: 'Pourquoi', retour: 'Retour prévu', retourInconnu: 'non communiqué', prochaine: 'Prochaine action possible',
    altDefaut: 'Écrivez au service : votre message sera traité dès que possible.',
    horaires: 'Horaires', lieu: 'Lieu', contact: 'Contact', etat: 'État',
    demarche: 'Commencer une démarche', rdv: 'Prendre rendez-vous', ecrire: 'Écrire au service', appeler: 'Appeler le {v}', autreCanal: 'Utiliser l’autre canal', lienService: 'Accéder au service',
    tousServices: 'Tous les services', introuvable: 'Ce service n’existe pas.',
    suiviIntro: 'Saisissez le numéro reçu après l’envoi (par exemple NT-1036).', numero: 'Numéro de la demande', voir: 'Voir l’état',
    connecter: 'Connectez-vous pour voir l’état de vos demandes.', seConnecter: 'Se connecter',
    demandeIntrouvable: 'Aucune demande avec ce numéro sur votre compte.', mesDemandes: 'Mes demandes', aucuneDemande: 'Vous n’avez encore envoyé aucune demande.',
    statut: 'État', etapes: 'Étapes', recue: 'Reçue', en_cours: 'En cours de traitement', traitee: 'Traitée', cloturee: 'Clôturée', envoyeeLe: 'Envoyée le {d}',
    poids: 'Cette page pèse {ko} Ko ({kc} Ko compressée), sans script ni image.', pied: 'Terra Nova · plateforme citoyenne'
  },
  en: {
    evitement: 'Skip to content', titre: 'Simple version', intro: 'The essentials of Terra Nova: text and the main actions, with no images or effects. This version loads fast, even on a weak connection or an old device.',
    complete: 'Full version', langue: 'Language', accueil: 'Home', services: 'Services', suivi: 'Track a request',
    alertes: 'Current alerts', aucuneAlerte: 'No alert at the moment.', consignes: 'What to do', zone: 'Area',
    actions: 'What would you like to do?', aServices: 'See the services and their status', aSuivi: 'Track a request', aDemande: 'Make a request or ask a question',
    aSignalement: 'Report a problem (lighting, roads, waste…)', aRdv: 'Book an appointment', urgences: 'Emergencies: ambulance 15 · European number 112 (free call).',
    enDifficulte: 'Disrupted or unavailable services', toutVaBien: 'All services are working normally.',
    servicesIntro: 'For each service: its status and the next possible action.',
    disponible: 'Available', perturbe: 'Disrupted', indisponible: 'Unavailable',
    tDisponible: 'Service available: you can start your procedure.', tPerturbe: 'Service disrupted: it is only partly working for now.',
    tIndisponible: 'Service unavailable: the city has suspended this service’s online procedures.',
    pourquoi: 'Why', retour: 'Expected return', retourInconnu: 'not announced', prochaine: 'Next possible action',
    altDefaut: 'Write to the service: your message will be handled as soon as possible.',
    horaires: 'Opening hours', lieu: 'Place', contact: 'Contact', etat: 'Status',
    demarche: 'Start a procedure', rdv: 'Book an appointment', ecrire: 'Write to the service', appeler: 'Call {v}', autreCanal: 'Use the other channel', lienService: 'Go to the service',
    tousServices: 'All services', introuvable: 'This service does not exist.',
    suiviIntro: 'Enter the number you received after sending (for example NT-1036).', numero: 'Request number', voir: 'See the status',
    connecter: 'Log in to see the status of your requests.', seConnecter: 'Log in',
    demandeIntrouvable: 'No request with this number on your account.', mesDemandes: 'My requests', aucuneDemande: 'You have not sent any request yet.',
    statut: 'Status', etapes: 'Steps', recue: 'Received', en_cours: 'In progress', traitee: 'Resolved', cloturee: 'Closed', envoyeeLe: 'Sent on {d}',
    poids: 'This page weighs {ko} KB ({kc} KB compressed), with no script or image.', pied: 'Terra Nova · citizen platform'
  },
  es: {
    evitement: 'Ir al contenido', titre: 'Versión sencilla', intro: 'Lo esencial de Terra Nova: texto y las acciones principales, sin imágenes ni efectos. Esta versión carga rápido, incluso con una conexión débil o un dispositivo antiguo.',
    complete: 'Versión completa', langue: 'Idioma', accueil: 'Inicio', services: 'Servicios', suivi: 'Seguir una solicitud',
    alertes: 'Alertas en curso', aucuneAlerte: 'Ninguna alerta en curso.', consignes: 'Qué hacer', zone: 'Zona',
    actions: '¿Qué desea hacer?', aServices: 'Ver los servicios y su estado', aSuivi: 'Seguir una solicitud', aDemande: 'Hacer una solicitud o una pregunta',
    aSignalement: 'Señalar un problema (alumbrado, vía pública, residuos…)', aRdv: 'Pedir cita', urgences: 'Urgencias: SAMU 15 · número europeo 112 (llamada gratuita).',
    enDifficulte: 'Servicios con incidencias o no disponibles', toutVaBien: 'Todos los servicios funcionan con normalidad.',
    servicesIntro: 'Para cada servicio: su estado y la próxima acción posible.',
    disponible: 'Disponible', perturbe: 'Con incidencias', indisponible: 'No disponible',
    tDisponible: 'Servicio disponible: puede empezar su trámite.', tPerturbe: 'Servicio con incidencias: por ahora funciona solo en parte.',
    tIndisponible: 'Servicio no disponible: el ayuntamiento ha suspendido los trámites en línea de este servicio.',
    pourquoi: 'Por qué', retour: 'Vuelta prevista', retourInconnu: 'no comunicada', prochaine: 'Próxima acción posible',
    altDefaut: 'Escriba al servicio: su mensaje se tratará lo antes posible.',
    horaires: 'Horarios', lieu: 'Lugar', contact: 'Contacto', etat: 'Estado',
    demarche: 'Empezar un trámite', rdv: 'Pedir cita', ecrire: 'Escribir al servicio', appeler: 'Llamar al {v}', autreCanal: 'Usar el otro canal', lienService: 'Acceder al servicio',
    tousServices: 'Todos los servicios', introuvable: 'Este servicio no existe.',
    suiviIntro: 'Escriba el número recibido tras el envío (por ejemplo NT-1036).', numero: 'Número de la solicitud', voir: 'Ver el estado',
    connecter: 'Inicie sesión para ver el estado de sus solicitudes.', seConnecter: 'Iniciar sesión',
    demandeIntrouvable: 'Ninguna solicitud con este número en su cuenta.', mesDemandes: 'Mis solicitudes', aucuneDemande: 'Aún no ha enviado ninguna solicitud.',
    statut: 'Estado', etapes: 'Etapas', recue: 'Recibida', en_cours: 'En curso', traitee: 'Tratada', cloturee: 'Cerrada', envoyeeLe: 'Enviada el {d}',
    poids: 'Esta página pesa {ko} KB ({kc} KB comprimida), sin script ni imagen.', pied: 'Terra Nova · plataforma ciudadana'
  },
  ar: {
    evitement: 'انتقل إلى المحتوى', titre: 'النسخة المبسطة', intro: 'أساسيات Terra Nova: نص والإجراءات الرئيسية، بدون صور أو مؤثرات. تظهر هذه النسخة بسرعة حتى مع اتصال ضعيف أو جهاز قديم.',
    complete: 'النسخة الكاملة', langue: 'اللغة', accueil: 'الرئيسية', services: 'الخدمات', suivi: 'متابعة طلب',
    alertes: 'التنبيهات الجارية', aucuneAlerte: 'لا يوجد تنبيه حالياً.', consignes: 'ماذا تفعل', zone: 'المنطقة',
    actions: 'ماذا تريد أن تفعل؟', aServices: 'عرض الخدمات وحالتها', aSuivi: 'متابعة طلب', aDemande: 'تقديم طلب أو طرح سؤال',
    aSignalement: 'الإبلاغ عن مشكلة (الإنارة، الطرق، النفايات…)', aRdv: 'حجز موعد', urgences: 'الطوارئ: الإسعاف 15 · الرقم الأوروبي 112 (مكالمة مجانية).',
    enDifficulte: 'خدمات مضطربة أو غير متاحة', toutVaBien: 'كل الخدمات تعمل بشكل عادي.',
    servicesIntro: 'لكل خدمة: حالتها والإجراء الممكن التالي.',
    disponible: 'متاحة', perturbe: 'مضطربة', indisponible: 'غير متاحة',
    tDisponible: 'الخدمة متاحة: يمكنك بدء إجرائك.', tPerturbe: 'الخدمة مضطربة: تعمل جزئياً في الوقت الحالي.',
    tIndisponible: 'الخدمة غير متاحة: علّقت المدينة الإجراءات الإلكترونية لهذه الخدمة.',
    pourquoi: 'السبب', retour: 'العودة المتوقعة', retourInconnu: 'غير معلنة', prochaine: 'الإجراء الممكن التالي',
    altDefaut: 'راسل الخدمة: ستتم معالجة رسالتك في أقرب وقت.',
    horaires: 'المواعيد', lieu: 'المكان', contact: 'الاتصال', etat: 'الحالة',
    demarche: 'بدء إجراء', rdv: 'حجز موعد', ecrire: 'مراسلة الخدمة', appeler: 'اتصل بالرقم {v}', autreCanal: 'استعمل القناة الأخرى', lienService: 'الدخول إلى الخدمة',
    tousServices: 'كل الخدمات', introuvable: 'هذه الخدمة غير موجودة.',
    suiviIntro: 'أدخل الرقم الذي تلقيته بعد الإرسال (مثلاً NT-1036).', numero: 'رقم الطلب', voir: 'عرض الحالة',
    connecter: 'سجّل الدخول لرؤية حالة طلباتك.', seConnecter: 'تسجيل الدخول',
    demandeIntrouvable: 'لا يوجد طلب بهذا الرقم في حسابك.', mesDemandes: 'طلباتي', aucuneDemande: 'لم ترسل أي طلب بعد.',
    statut: 'الحالة', etapes: 'المراحل', recue: 'مستلمة', en_cours: 'قيد المعالجة', traitee: 'تمت معالجتها', cloturee: 'مغلقة', envoyeeLe: 'أُرسلت في {d}',
    poids: 'وزن هذه الصفحة {ko} كيلوبايت ({kc} كيلوبايت مضغوطة)، بدون نصوص برمجية أو صور.', pied: 'Terra Nova · منصة المواطنين'
  }
};
const LOCALES = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES', ar: 'ar' };

const e = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const choisir = (o, l) => (o && typeof o === 'object' ? o[l] || o.fr : o || '');
function langueDe(req) {
  const q = String(req.query.lang || '');
  if (LANGUES[q]) return q;
  const acc = String(req.headers['accept-language'] || '').slice(0, 2).toLowerCase();
  return LANGUES[acc] ? acc : 'fr';
}
const niveau = (s) => { const c = (s.etat && s.etat.code) || 'ok'; return c === 'ok' ? 'disponible' : c === 'desactive' ? 'indisponible' : 'perturbe'; };
const ICONE = { disponible: '✓', perturbe: '!', indisponible: '✕' };

function page(req, res, { l, titre, corps, complete, prive }) {
  const t = T[l];
  const ici = req.path;
  const langues = Object.entries(LANGUES).map(([c, n]) => (c === l ? `<strong lang="${c}">${n}</strong>`
    : `<a href="${e(ici)}?${e(new URLSearchParams({ ...req.query, lang: c }).toString())}" lang="${c}" hreflang="${c}">${n}</a>`)).join(' · ');
  const ESS = { fr: 'Infos essentielles', en: 'Essential information', es: 'Información esencial', ar: 'معلومات أساسية' };   // vague 19 (F94)
  const nav = [['/simple', t.accueil], ['/essentiel', ESS[l]], ['/simple/services', t.services], ['/simple/suivi', t.suivi]]
    .map(([h, n]) => `<a href="${h}?lang=${l}"${ici === h ? ' aria-current="page"' : ''}>${e(n)}</a>`).join('');
  const rendu = (poids) => `<!doctype html>
<html lang="${l}" dir="${l === 'ar' ? 'rtl' : 'ltr'}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(titre)} — Terra Nova (${e(t.titre)})</title><meta name="theme-color" content="#0b1a1c">
<link rel="stylesheet" href="/assets/css/theme.css"><link rel="stylesheet" href="/assets/css/simple.css"></head>
<body class="simple">
<a class="evitement" href="#contenu">${e(t.evitement)}</a>
<header class="simple-tete"><p class="simple-marque"><a href="/simple?lang=${l}">Terra Nova</a> <span>${e(t.titre)}</span></p>
<nav aria-label="${e(t.titre)}">${nav}</nav>
<p class="simple-complete"><a href="${e(complete)}">${e(t.complete)} →</a></p></header>
<main id="contenu">${corps}</main>
<footer class="simple-pied"><p>${e(t.langue)} : ${langues}</p><p><a href="${e(complete)}">${e(t.complete)}</a></p><p>${e(t.pied)}${poids ? ' · ' + e(poids) : ''}</p></footer>
</body></html>`;
  // F62 : poids réel de la page affiché en pied (mesuré sur le HTML produit)
  const brouillon = rendu('');
  const ko = (n) => (Math.round(n / 102.4) / 10).toLocaleString(LOCALES[l]);
  const html = rendu(t.poids.replace('{ko}', ko(Buffer.byteLength(brouillon))).replace('{kc}', ko(zlib.brotliCompressSync(brouillon).length)));
  res.set('Cache-Control', prive ? 'no-store' : 'no-cache');   // page personnelle : jamais copiée (navigateur, Service Worker)
  res.set('Vary', 'Accept-Encoding, Accept-Language');
  const accepte = String(req.headers['accept-encoding'] || '');
  res.type('html');
  if (/\bbr\b/.test(accepte)) { res.set('Content-Encoding', 'br'); return res.send(zlib.brotliCompressSync(html)); }
  if (/\bgzip\b/.test(accepte)) { res.set('Content-Encoding', 'gzip'); return res.send(zlib.gzipSync(html)); }
  res.send(html);
}

/* État d'un service + prochaine action possible (mêmes règles que NT.ui.encartService côté navigateur) */
function blocEtat(s, l, avecActions) {
  const t = T[l], n = niveau(s), et = s.etat || {};
  const alt = (et.alternative && et.alternative.texte) || (n === 'indisponible' ? t.altDefaut : '');
  let actions = '';
  if (avecActions) {
    const contact = `<a href="/demande.html?type=contact&amp;service=${encodeURIComponent(s.id)}">${e(t.ecrire)}</a>`;
    if (n === 'disponible') {
      actions = (s.lien ? `<a class="principal" href="/${e(s.lien)}">${e(t.lienService)}</a>` : `<a class="principal" href="/demande.html?type=demarche&amp;service=${encodeURIComponent(s.id)}">${e(t.demarche)}</a>`)
        + (s.rdv ? `<a href="/rendez-vous.html?service=${encodeURIComponent(s.id)}">${e(t.rdv)}</a>` : '') + contact;
    } else if (n === 'perturbe') {
      actions = (s.rdv ? `<a class="principal" href="/rendez-vous.html?service=${encodeURIComponent(s.id)}">${e(t.rdv)}</a>` : '') + contact;
    } else {
      const a = et.alternative || {}, v = String(a.valeur || '').trim();
      if (a.type === 'telephone' && v) actions += `<a class="principal" href="tel:${e(v.replace(/[^\d+]/g, ''))}">${e(t.appeler.replace('{v}', v))}</a>`;
      else if (a.type === 'en-ligne' && /^(?:[a-z0-9-]+\.html|\/)[^\s"'<>]*$/i.test(v)) actions += `<a class="principal" href="${e(v.startsWith('/') ? v : '/' + v)}">${e(t.autreCanal)}</a>`;
      actions += contact;
    }
  }
  return `<div class="simple-etat simple-etat-${n}"><p><span aria-hidden="true">${ICONE[n]}</span> <strong>${e(t[n])}</strong> — ${e(t['t' + n[0].toUpperCase() + n.slice(1)])}</p>
    ${n === 'disponible' ? '' : `<dl>${et.message ? `<dt>${e(t.pourquoi)}</dt><dd>${e(et.message)}</dd>` : ''}<dt>${e(t.retour)}</dt><dd>${e(et.retour || t.retourInconnu)}</dd>${alt ? `<dt>${e(t.prochaine)}</dt><dd>${e(alt)}</dd>` : ''}</dl>`}
    ${actions ? `<p class="simple-actions">${actions}</p>` : ''}</div>`;
}

/* ---------- Accueil simple ---------- */
router.get('/simple', (req, res) => {
  const l = langueDe(req), t = T[l], u = req.user;
  const maintenant = new Date().toISOString();
  const alertes = docs.tous('annonces').filter((a) => a.active && a.importance !== 'info' && (!a.expire || a.expire > maintenant)
    && (a.zone === 'Toute la ville' || !u || u.role !== 'citoyen' || u.quartier === a.zone || a.importance === 'alerte'))
    .sort((a, b) => String(b.cree).localeCompare(String(a.cree)));
  const services = docs.tous('services');
  const difficiles = services.filter((s) => niveau(s) !== 'disponible');
  // F73 : message officiel du Haut Conseil en cours, en tête (traduit si l'agent l'a traduit)
  const OFF = { fr: ['Message officiel du Haut Conseil de la Ville', 'Ce que vous devez faire'], en: ['Official message from the City High Council', 'What you need to do'],
    es: ['Mensaje oficial del Alto Consejo de la Ciudad', 'Lo que debe hacer'], ar: ['رسالة رسمية من المجلس الأعلى للمدينة', 'ما يجب عليك فعله'] }[l] || [];
  const enCrise = require('./officiel').actifsPour(u);   // vague 21 (F101) : crise localisée en tête, sans script
  const officiels = enCrise.filter((m) => !m.crise).map((m) => { const tr = (m.traductions || {})[l]; return tr && tr.titre && tr.message ? { ...m, ...tr, actions: tr.actions && tr.actions.length ? tr.actions : m.actions } : m; });
  const corps = `<h1>${e(t.titre)}</h1>${require('./crise').blocHtml(enCrise, l, u)}<p>${e(t.intro)}</p>
  ${officiels.length ? `<section aria-labelledby="h-officiel"><h2 id="h-officiel">${e(OFF[0])}</h2><ul class="simple-liste">${officiels.map((m) => `<li><strong>${e(m.titre)}</strong>
    ${m.audience !== 'Toute la ville' ? `<br>${e(t.zone)} : ${e(m.audience)}` : ''}<br>${e(m.message)}<br>${e(OFF[1])} : ${m.actions.map(e).join(' · ')}</li>`).join('')}</ul></section>` : ''}
  ${require('./mobilite').blocSimple(l, e) /* vague 20 (F97) : lignes interrompues et meilleure solution */}
  <section aria-labelledby="h-alertes"><h2 id="h-alertes">${e(t.alertes)}</h2>
    ${alertes.length ? `<ul class="simple-liste">${alertes.map((a) => `<li><strong>${a.importance === 'alerte' ? '⚠ ' : ''}${e(a.titre)}</strong><br>${e(t.zone)} : ${e(a.zone)}
      ${a.resume ? `<br>${e(a.resume)}` : ''}${a.consignes && a.consignes.length ? `<br>${e(t.consignes)} : ${a.consignes.map(e).join(' · ')}` : ''}</li>`).join('')}</ul>` : `<p>${e(t.aucuneAlerte)}</p>`}</section>
  <section aria-labelledby="h-actions"><h2 id="h-actions">${e(t.actions)}</h2>
    <ul class="simple-liste simple-menu">
      <li><a href="/simple/services?lang=${l}">${e(t.aServices)}</a></li>
      <li><a href="/simple/suivi?lang=${l}">${e(t.aSuivi)}</a></li>
      <li><a href="/demande.html?type=contact">${e(t.aDemande)}</a></li>
      <li><a href="/demande.html?type=signalement">${e(t.aSignalement)}</a></li>
      <li><a href="/rendez-vous.html">${e(t.aRdv)}</a></li>
    </ul><p><strong>${e(t.urgences)}</strong> <a href="tel:15">15</a> · <a href="tel:112">112</a></p></section>
  <section aria-labelledby="h-diff"><h2 id="h-diff">${e(t.enDifficulte)}</h2>
    ${difficiles.length ? `<ul class="simple-liste">${difficiles.map((s) => `<li><a href="/simple/services/${encodeURIComponent(s.id)}?lang=${l}">${e(choisir(s.nom, l))}</a> — <strong>${e(t[niveau(s)])}</strong>${s.etat.message ? ` : ${e(s.etat.message)}` : ''}</li>`).join('')}</ul>` : `<p>${e(t.toutVaBien)}</p>`}</section>`;
  page(req, res, { l, titre: t.accueil, corps, complete: '/index.html' });
});

/* ---------- Liste des services avec leur état ---------- */
router.get('/simple/services', (req, res) => {
  const l = langueDe(req), t = T[l];
  const ordre = { indisponible: 0, perturbe: 1, disponible: 2 };
  const liste = docs.tous('services').sort((a, b) => ordre[niveau(a)] - ordre[niveau(b)] || choisir(a.nom, l).localeCompare(choisir(b.nom, l)));
  const corps = `<h1>${e(t.services)}</h1><p>${e(t.servicesIntro)}</p>
  <ul class="simple-liste">${liste.map((s) => `<li><h2 class="simple-h"><a href="/simple/services/${encodeURIComponent(s.id)}?lang=${l}">${e(choisir(s.nom, l))}</a></h2>
    <p>${e(choisir(s.description, l))}</p>${blocEtat(s, l, true)}</li>`).join('')}</ul>`;
  page(req, res, { l, titre: t.services, corps, complete: '/services.html' });
});

/* ---------- Un service : état, informations pratiques, prochaine action ---------- */
router.get('/simple/services/:id', (req, res) => {
  const l = langueDe(req), t = T[l];
  const s = docs.get('services', req.params.id);
  if (!s) { res.status(404); return page(req, res, { l, titre: t.services, corps: `<h1>${e(t.introuvable)}</h1><p><a href="/simple/services?lang=${l}">${e(t.tousServices)}</a></p>`, complete: '/services.html' }); }
  const mail = s.contact && s.contact.includes('@');
  const corps = `<h1>${e(choisir(s.nom, l))}</h1><p>${e(choisir(s.description, l))}</p>
  <h2>${e(t.etat)}</h2>${blocEtat(s, l, true)}
  <dl class="simple-infos">${s.horaires ? `<dt>${e(t.horaires)}</dt><dd>${e(s.horaires)}</dd>` : ''}${s.lieu ? `<dt>${e(t.lieu)}</dt><dd>${e(s.lieu)}</dd>` : ''}
    ${s.contact ? `<dt>${e(t.contact)}</dt><dd>${mail ? `<a href="mailto:${e(s.contact)}">${e(s.contact)}</a>` : e(s.contact)}</dd>` : ''}</dl>
  <p><a href="/simple/services?lang=${l}">← ${e(t.tousServices)}</a></p>`;
  page(req, res, { l, titre: choisir(s.nom, l), corps, complete: '/services.html#' + encodeURIComponent(s.id) });
});

/* ---------- Suivre une demande (seulement les siennes ; le personnel voit tout) ---------- */
router.get('/simple/suivi', (req, res) => {
  const l = langueDe(req), t = T[l], u = req.user;
  const id = String(req.query.id || '').trim().toUpperCase().slice(0, 20);
  const date = (iso) => new Date(iso).toLocaleDateString(LOCALES[l], { day: 'numeric', month: 'long', year: 'numeric' });
  const form = `<form method="get" action="/simple/suivi" class="simple-form"><input type="hidden" name="lang" value="${l}">
    <label for="id">${e(t.numero)}</label><input id="id" name="id" value="${e(id)}" autocomplete="off" placeholder="NT-1036"><button type="submit">${e(t.voir)}</button></form>`;
  let resultat = '';
  if (!u) {
    resultat = `<p>${e(t.connecter)} <a href="/connexion.html?retour=${encodeURIComponent('suivi.html' + (id ? '?id=' + id : ''))}">${e(t.seConnecter)}</a></p>`;
  } else {
    const visibles = docs.tous('demandes').filter((d) => A.estPersonnel(u) || d.userId === u.id);
    if (id) {
      const d = visibles.find((x) => x.id === id);
      resultat = !d ? `<p role="alert">${e(t.demandeIntrouvable)}</p>` : `<section aria-labelledby="h-dem"><h2 id="h-dem">${e(d.id)} — ${e(d.objet)}</h2>
        <p>${e(t.statut)} : <strong>${e(t[d.statut] || d.statut)}</strong> · ${e(t.envoyeeLe.replace('{d}', date(d.cree)))}</p>
        <h3>${e(t.etapes)}</h3><ol class="simple-liste">${(d.historique || []).map((h) => `<li><strong>${e(t[h.statut] || h.statut)}</strong> — ${e(date(h.date))}${h.note ? `<br>${e(h.note)}` : ''}</li>`).join('')}</ol></section>`;
    } else if (!A.estPersonnel(u)) {
      const mes = visibles.sort((a, b) => String(b.cree).localeCompare(String(a.cree)));
      resultat = `<h2>${e(t.mesDemandes)}</h2>` + (mes.length ? `<ul class="simple-liste">${mes.map((d) => `<li><a href="/simple/suivi?id=${encodeURIComponent(d.id)}&amp;lang=${l}">${e(d.id)} — ${e(d.objet)}</a> : <strong>${e(t[d.statut] || d.statut)}</strong></li>`).join('')}</ul>` : `<p>${e(t.aucuneDemande)}</p>`);
    }
  }
  const corps = `<h1>${e(t.suivi)}</h1><p>${e(t.suiviIntro)}</p>${form}${resultat}`;
  page(req, res, { l, titre: t.suivi, corps, complete: '/suivi.html' + (id ? '?id=' + encodeURIComponent(id) : ''), prive: true });
});

/* ?simple=1 sur une page complète → sa version simple */
router.get(['/', '/index.html', '/services.html', '/suivi.html'], (req, res, next) => {
  if (req.query.simple !== '1') return next();
  const p = new URLSearchParams();
  if (req.query.lang) p.set('lang', String(req.query.lang));
  if (req.path === '/suivi.html' && req.query.id) p.set('id', String(req.query.id));
  const q = p.toString() ? '?' + p.toString() : '';
  res.redirect(302, (req.path === '/services.html' ? '/simple/services' : req.path === '/suivi.html' ? '/simple/suivi' : '/simple') + q);
});

module.exports = router;
