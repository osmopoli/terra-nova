/* Terra Nova — vague 22 (F103, Service Qualité) : « Rapport d'activité » synthétique pour les responsables.
   Une seule lecture côté serveur (GET /api/rapport, agents et admins, rôle contrôlé ; gardée 60 s par période et langue) qui agrège
   ce que la plateforme sait déjà, sans données personnelles :
   - demandes (reçues, traitées, délai moyen, % dans le délai cible selon la priorité F80, en attente, hors délai) ;
   - urgences médicales F86 (nombre, délai moyen de prise en charge), rendez-vous, avis sur les services F76 (note, % satisfaits),
     participation F65-F68 (votes et idées), services les plus utilisés F98 (compteurs anonymes), demandes semblables F75,
     événements de sécurité F100, disponibilité et charge de la plateforme (F77 : relevé quotidien) ;
   - comparaison avec la période précédente de même durée, tableaux par service et par quartier ;
   - « Points clés », « Points d'attention » et « Recommandations » rédigés automatiquement en phrases simples (FR / EN / ES / AR).
   Téléchargements : CSV (Excel français) et JSON (GET /api/rapport/export), PDF par l'impression du navigateur
   (POST /api/rapport/imprime) — chacun inscrit dans l'historique des exports F88 et le journal d'audit. */
const router = require('express').Router();
const A = require('../auth');
const { docs, audit, uid, maintenant } = require('../donnees');

const QUARTIERS = ['Centre', 'Nord', 'Sud', 'Est', 'Ouest'];
const LANGUES = ['fr', 'en', 'es', 'ar'];
const CIBLE = { urgente: 1, haute: 3, normale: 7, basse: 14 };   // délai cible de traitement (jours) selon la priorité
const OBJECTIF = 80;   // % des demandes traitées dans le délai cible
const URGENCE_MIN = 5; // minutes : prise en charge d'une urgence médicale
const TRAITEES = new Set(['traitee', 'cloturee']);
const personnel = A.exigerRole('agent', 'admin');

/* ---------- Textes (rédaction automatique, 4 langues) ---------- */
const TXT = {
  fr: { hausse: 'en hausse de {n} %', baisse: 'en baisse de {n} %', stable: 'stable', nouveau: 'nouveau', j: '{n} j', quartier: 'quartier {q}',
    'k.recues': '{n} demandes reçues, {t} par rapport à la période précédente.', 'k.traitees': '{n} demandes traitées, avec un délai moyen de {d} jours ({t}).',
    'k.objectif': '{p} % des demandes traitées dans le délai prévu (objectif : {o} %).', 'k.satisfaction': 'Les habitants donnent {note}/5 aux services ({n} avis, {p} % satisfaits).',
    'k.urgences': '{n} urgences médicales, prises en charge en {m} min en moyenne.', 'k.top': '{s} est le service le plus sollicité : {n} demandes ({p} % du total).',
    'k.participation': '{n} contributions des habitants (votes et idées), {t}.', 'k.dispo': 'La plateforme a été disponible {p} % du temps.', 'k.backlogBaisse': 'Moins de demandes en attente : {n} contre {n0} au début de la période.',
    'a.backlog': '{n} demandes en attente, dont {v} hors délai.', 'a.delai': 'Le délai moyen de traitement s’allonge : {d} jours contre {d0} jours sur la période précédente.',
    'a.objectif': 'Seulement {p} % des demandes sont traitées dans le délai prévu (objectif : {o} %).', 'a.serviceLent': '{s} est le service le plus lent : {d} jours en moyenne, {n} demandes en attente.',
    'a.satisfaction': '{s} reçoit les avis les moins bons : {note}/5 ({n} avis).', 'a.quartier': 'Le {q} concentre {p} % des demandes en attente.',
    'a.urgences': '{n} urgence(s) médicale(s) prise(s) en charge après plus de {m} minutes.', 'a.securite': '{n} événements de sécurité importants (gravité haute) sur la période.',
    'a.groupes': '{n} groupes de demandes semblables ouverts : un même problème est signalé plusieurs fois.', 'a.participation': 'La participation des habitants recule : {n} contributions ({t}).',
    'a.hausseService': 'Forte hausse des demandes pour {s} : {t}.',
    'r.renfort': 'Renforcer {s} pendant deux semaines pour résorber les {n} demandes en attente.', 'r.anciennes': 'Traiter d’abord les {n} demandes hors délai, en commençant par les plus anciennes.',
    'r.groupes': 'Répondre une seule fois aux demandes semblables (page Demandes, groupes) : {n} groupe(s).', 'r.satisfaction': 'Relire les avis sur {s}, répondre aux habitants et clarifier la fiche du service.',
    'r.quartier': 'Tenir une permanence dans le {q} pour traiter les demandes sur place.', 'r.securite': 'Faire le point avec l’administrateur sur les {n} événements de sécurité importants.',
    'r.participation': 'Relancer la participation : présenter aux habitants ce qui a été fait grâce à leurs idées.', 'r.urgences': 'Rappeler la consigne aux agents de garde : prendre en charge une urgence en moins de {m} minutes.',
    'r.anticiper': 'Anticiper la hausse sur {s} : plus de créneaux et une réponse type pour les questions fréquentes.', 'r.maintenir': 'Rien d’urgent : garder l’organisation actuelle et suivre le délai de traitement chaque semaine.' },
  en: { hausse: 'up {n}%', baisse: 'down {n}%', stable: 'stable', nouveau: 'new', j: '{n} d', quartier: '{q} district',
    'k.recues': '{n} requests received, {t} compared with the previous period.', 'k.traitees': '{n} requests handled, with an average time of {d} days ({t}).',
    'k.objectif': '{p}% of requests handled within the target time (goal: {o}%).', 'k.satisfaction': 'Residents rate services {note}/5 ({n} reviews, {p}% satisfied).',
    'k.urgences': '{n} medical emergencies, taken in charge in {m} min on average.', 'k.top': '{s} is the most requested service: {n} requests ({p}% of the total).',
    'k.participation': '{n} contributions from residents (votes and ideas), {t}.', 'k.dispo': 'The platform was available {p}% of the time.', 'k.backlogBaisse': 'Fewer pending requests: {n} against {n0} at the start of the period.',
    'a.backlog': '{n} pending requests, {v} of them overdue.', 'a.delai': 'Average handling time is getting longer: {d} days against {d0} days in the previous period.',
    'a.objectif': 'Only {p}% of requests are handled within the target time (goal: {o}%).', 'a.serviceLent': '{s} is the slowest service: {d} days on average, {n} pending requests.',
    'a.satisfaction': '{s} gets the lowest ratings: {note}/5 ({n} reviews).', 'a.quartier': 'The {q} accounts for {p}% of pending requests.',
    'a.urgences': '{n} medical emergency(ies) taken in charge after more than {m} minutes.', 'a.securite': '{n} important security events (high severity) over the period.',
    'a.groupes': '{n} groups of similar open requests: the same problem is reported several times.', 'a.participation': 'Resident participation is falling: {n} contributions ({t}).',
    'a.hausseService': 'Sharp rise in requests for {s}: {t}.',
    'r.renfort': 'Reinforce {s} for two weeks to clear the {n} pending requests.', 'r.anciennes': 'Handle the {n} overdue requests first, starting with the oldest.',
    'r.groupes': 'Answer similar requests once (Requests page, groups): {n} group(s).', 'r.satisfaction': 'Read the reviews of {s}, reply to residents and clarify the service page.',
    'r.quartier': 'Hold a drop-in session in the {q} to handle requests on site.', 'r.securite': 'Review the {n} important security events with the administrator.',
    'r.participation': 'Boost participation: show residents what was done thanks to their ideas.', 'r.urgences': 'Remind on-call staff: take charge of an emergency in under {m} minutes.',
    'r.anticiper': 'Prepare for the rise on {s}: more slots and a standard answer for frequent questions.', 'r.maintenir': 'Nothing urgent: keep the current organisation and check handling time every week.' },
  es: { hausse: 'sube un {n} %', baisse: 'baja un {n} %', stable: 'estable', nuevo: 'nuevo', nouveau: 'nuevo', j: '{n} d', quartier: 'barrio {q}',
    'k.recues': '{n} solicitudes recibidas, {t} respecto al periodo anterior.', 'k.traitees': '{n} solicitudes tramitadas, con un plazo medio de {d} días ({t}).',
    'k.objectif': 'El {p} % de las solicitudes se tramitó en el plazo previsto (objetivo: {o} %).', 'k.satisfaction': 'Los habitantes dan {note}/5 a los servicios ({n} opiniones, {p} % satisfechos).',
    'k.urgences': '{n} urgencias médicas, atendidas en {m} min de media.', 'k.top': '{s} es el servicio más solicitado: {n} solicitudes ({p} % del total).',
    'k.participation': '{n} contribuciones de los habitantes (votos e ideas), {t}.', 'k.dispo': 'La plataforma estuvo disponible el {p} % del tiempo.', 'k.backlogBaisse': 'Menos solicitudes pendientes: {n} frente a {n0} al inicio del periodo.',
    'a.backlog': '{n} solicitudes pendientes, {v} de ellas fuera de plazo.', 'a.delai': 'El plazo medio de tramitación se alarga: {d} días frente a {d0} días en el periodo anterior.',
    'a.objectif': 'Solo el {p} % de las solicitudes se tramita en el plazo previsto (objetivo: {o} %).', 'a.serviceLent': '{s} es el servicio más lento: {d} días de media, {n} solicitudes pendientes.',
    'a.satisfaction': '{s} recibe las peores opiniones: {note}/5 ({n} opiniones).', 'a.quartier': 'El {q} concentra el {p} % de las solicitudes pendientes.',
    'a.urgences': '{n} urgencia(s) médica(s) atendida(s) después de más de {m} minutos.', 'a.securite': '{n} eventos de seguridad importantes (gravedad alta) en el periodo.',
    'a.groupes': '{n} grupos de solicitudes similares abiertos: el mismo problema se señala varias veces.', 'a.participation': 'La participación de los habitantes baja: {n} contribuciones ({t}).',
    'a.hausseService': 'Fuerte aumento de solicitudes para {s}: {t}.',
    'r.renfort': 'Reforzar {s} durante dos semanas para absorber las {n} solicitudes pendientes.', 'r.anciennes': 'Tramitar primero las {n} solicitudes fuera de plazo, empezando por las más antiguas.',
    'r.groupes': 'Responder una sola vez a las solicitudes similares (página Solicitudes, grupos): {n} grupo(s).', 'r.satisfaction': 'Leer las opiniones sobre {s}, responder a los habitantes y aclarar la ficha del servicio.',
    'r.quartier': 'Abrir una permanencia en el {q} para tramitar las solicitudes in situ.', 'r.securite': 'Revisar con el administrador los {n} eventos de seguridad importantes.',
    'r.participation': 'Relanzar la participación: mostrar a los habitantes lo que se hizo gracias a sus ideas.', 'r.urgences': 'Recordar la consigna a los agentes de guardia: atender una urgencia en menos de {m} minutos.',
    'r.anticiper': 'Anticipar el aumento en {s}: más citas y una respuesta tipo para las preguntas frecuentes.', 'r.maintenir': 'Nada urgente: mantener la organización actual y seguir el plazo de tramitación cada semana.' },
  ar: { hausse: 'ارتفاع {n}٪', baisse: 'انخفاض {n}٪', stable: 'مستقر', nouveau: 'جديد', j: '{n} ي', quartier: 'حي {q}',
    'k.recues': 'تم استلام {n} طلب، {t} مقارنة بالفترة السابقة.', 'k.traitees': 'تمت معالجة {n} طلب، بمتوسط مدة {d} يوم ({t}).',
    'k.objectif': '{p}٪ من الطلبات عولجت في الأجل المحدد (الهدف: {o}٪).', 'k.satisfaction': 'يمنح السكان الخدمات {note}/5 ({n} رأي، {p}٪ راضون).',
    'k.urgences': '{n} حالة طوارئ طبية، تم التكفل بها في {m} د في المتوسط.', 'k.top': '{s} هي الخدمة الأكثر طلباً: {n} طلب ({p}٪ من المجموع).',
    'k.participation': '{n} مساهمة من السكان (تصويت وأفكار)، {t}.', 'k.dispo': 'كانت المنصة متاحة {p}٪ من الوقت.', 'k.backlogBaisse': 'طلبات معلقة أقل: {n} مقابل {n0} في بداية الفترة.',
    'a.backlog': '{n} طلب معلق، منها {v} تجاوزت الأجل.', 'a.delai': 'متوسط مدة المعالجة يطول: {d} يوم مقابل {d0} يوم في الفترة السابقة.',
    'a.objectif': 'فقط {p}٪ من الطلبات تعالج في الأجل المحدد (الهدف: {o}٪).', 'a.serviceLent': '{s} هي الخدمة الأبطأ: {d} يوم في المتوسط، {n} طلب معلق.',
    'a.satisfaction': '{s} تتلقى أضعف التقييمات: {note}/5 ({n} رأي).', 'a.quartier': '{q} يضم {p}٪ من الطلبات المعلقة.',
    'a.urgences': '{n} حالة طوارئ طبية تم التكفل بها بعد أكثر من {m} دقائق.', 'a.securite': '{n} حدث أمني مهم (خطورة عالية) خلال الفترة.',
    'a.groupes': '{n} مجموعة من الطلبات المتشابهة مفتوحة: نفس المشكلة يُبلغ عنها عدة مرات.', 'a.participation': 'مشاركة السكان تتراجع: {n} مساهمة ({t}).',
    'a.hausseService': 'ارتفاع قوي في الطلبات على {s}: {t}.',
    'r.renfort': 'تعزيز {s} لمدة أسبوعين لمعالجة {n} طلب معلق.', 'r.anciennes': 'معالجة {n} طلب متجاوز للأجل أولاً، بدءاً بالأقدم.',
    'r.groupes': 'الرد مرة واحدة على الطلبات المتشابهة (صفحة الطلبات، المجموعات): {n} مجموعة.', 'r.satisfaction': 'قراءة آراء {s} والرد على السكان وتوضيح صفحة الخدمة.',
    'r.quartier': 'تنظيم مداومة في {q} لمعالجة الطلبات في عين المكان.', 'r.securite': 'مراجعة {n} حدث أمني مهم مع المسؤول.',
    'r.participation': 'إعادة تحفيز المشاركة: عرض ما تم إنجازه بفضل أفكار السكان.', 'r.urgences': 'تذكير أعوان المداومة: التكفل بحالة طوارئ في أقل من {m} دقائق.',
    'r.anticiper': 'الاستعداد للارتفاع على {s}: مواعيد أكثر وجواب نموذجي للأسئلة المتكررة.', 'r.maintenir': 'لا شيء عاجل: الحفاظ على التنظيم الحالي ومتابعة مدة المعالجة كل أسبوع.' }
};
const QNOM = { fr: { Centre: 'Centre', Nord: 'Nord', Sud: 'Sud', Est: 'Est', Ouest: 'Ouest' }, en: { Centre: 'Centre', Nord: 'North', Sud: 'South', Est: 'East', Ouest: 'West' },
  es: { Centre: 'Centro', Nord: 'Norte', Sud: 'Sur', Est: 'Este', Ouest: 'Oeste' }, ar: { Centre: 'الوسط', Nord: 'الشمال', Sud: 'الجنوب', Est: 'الشرق', Ouest: 'الغرب' } };
const nombre = (v, l) => (v == null ? '—' : String(v).replace('.', l === 'fr' || l === 'es' ? ',' : '.'));
const tendance = (a, b) => (b ? Math.round(((a - b) / b) * 100) : a ? null : 0);   // null = nouveau
function texteTendance(tr, l) {
  const T = TXT[l];
  if (tr == null) return T.nouveau;
  if (Math.abs(tr) < 3) return T.stable;
  return (tr > 0 ? T.hausse : T.baisse).replace('{n}', Math.abs(tr));
}
function phrase(code, p, l) {
  const T = TXT[l] || TXT.fr;
  return (T[code] || TXT.fr[code] || code).replace(/\{(\w+)\}/g, (_, k) => (p[k] == null ? '' : p[k]));
}

/* ---------- Agrégation ---------- */
const moyenne = (l) => (l.length ? l.reduce((a, b) => a + b, 0) / l.length : null);
const arrondi = (v, n = 1) => (v == null ? null : Math.round(v * 10 ** n) / 10 ** n);
const pct = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : null);
function dateTraitee(d) {
  const h = (d.historique || []).find((x) => TRAITEES.has(x.statut));
  return h ? Date.parse(h.date) : TRAITEES.has(d.statut) ? Date.parse(d.maj || d.cree) : null;
}
const cible = (d) => CIBLE[d.priorite] || CIBLE.normale;

function periodeDe(q) {
  const auj = Date.now();
  if (q.du && q.au && /^\d{4}-\d{2}-\d{2}$/.test(q.du) && /^\d{4}-\d{2}-\d{2}$/.test(q.au)) {
    const t0 = Date.parse(q.du + 'T00:00:00+03:00'), t1 = Math.min(auj, Date.parse(q.au + 'T23:59:59+03:00') + 1000);
    if (Number.isFinite(t0) && Number.isFinite(t1) && t1 > t0 && t1 - t0 <= 366 * 864e5) return { t0, t1, jours: Math.max(1, Math.round((t1 - t0) / 864e5)), perso: true };
    return { erreur: 'Période invalide : la date de début doit précéder la date de fin (366 jours au plus).' };
  }
  const jours = [7, 30, 90].includes(Number(q.periode)) ? Number(q.periode) : 30;
  return { t0: auj - jours * 864e5, t1: auj, jours, perso: false };
}

function mesurer(t0, t1, ctx) {
  const dans = (iso) => { const t = Date.parse(iso); return t >= t0 && t < t1; };
  const recues = ctx.demandes.filter((d) => dans(d.cree));
  const traitees = ctx.demandes.map((d) => ({ d, t: dateTraitee(d) })).filter((x) => x.t && x.t >= t0 && x.t < t1);
  const delais = traitees.map((x) => (x.t - Date.parse(x.d.cree)) / 864e5);
  const dansCible = traitees.filter((x) => (x.t - Date.parse(x.d.cree)) / 864e5 <= cible(x.d)).length;
  const ouverteA = (T) => ctx.demandes.filter((d) => Date.parse(d.cree) < T && !(dateTraitee(d) && dateTraitee(d) < T));
  const attente = ouverteA(t1);
  const horsDelai = attente.filter((d) => (t1 - Date.parse(d.cree)) / 864e5 > cible(d));
  const urg = ctx.demandes.filter((d) => d.urgenceMedicale && dans(d.urgenceMedicale.signaleeLe || d.cree));
  const prises = urg.filter((d) => d.urgenceMedicale.priseEnCharge).map((d) => d.urgenceMedicale.priseEnCharge.minutes);
  const rdv = ctx.rdv.filter((r) => dans(r.debut) && r.statut !== 'annule');
  const rdvAnnules = ctx.rdv.filter((r) => dans(r.debut) && r.statut === 'annule').length;
  const avisS = ctx.avisServices.filter((a) => dans(a.cree) && a.statut !== 'masque');
  const notes = avisS.map((a) => Number(a.note)).filter((n) => n >= 1 && n <= 5);
  const participation = ctx.avis.filter((a) => dans(a.cree)).length + ctx.idees.filter((i) => dans(i.cree)).length;
  const securite = ctx.securite.filter((e) => dans(e.date));
  const jours = ctx.plateforme.filter((j) => { const t = Date.parse(j.id + 'T12:00:00+03:00'); return t >= t0 - 12 * 3600e3 && t < t1; });
  return {
    recues: recues.length, traitees: traitees.length, delaiMoyen: arrondi(moyenne(delais)), dansObjectif: pct(dansCible, traitees.length),
    enAttente: attente.length, enAttenteDebut: ouverteA(t0).length, horsDelai: horsDelai.length,
    urgences: urg.length, urgencesDelai: arrondi(moyenne(prises), 0), urgencesLentes: prises.filter((m) => m > URGENCE_MIN).length,
    rdv: rdv.length, rdvAnnules, satisfaction: arrondi(moyenne(notes)), avis: notes.length, satisfaits: pct(notes.filter((n) => n >= 4).length, notes.length),
    participation, securite: securite.length, securiteHaute: securite.filter((e) => e.gravite === 'haute' || e.gravite === 'critique').length,
    disponibilite: jours.length ? arrondi(moyenne(jours.map((j) => j.dispo)), 2) : null, chargeMax: jours.length ? Math.max(...jours.map((j) => j.chargeMax || 0)) : null,
    p95: jours.length ? Math.round(moyenne(jours.map((j) => j.p95 || 0))) : null,
    _recues: recues, _traitees: traitees, _attente: attente, _horsDelai: horsDelai, _avis: avisS, _urg: urg
  };
}

function contexte() {
  let securite = [];
  try { securite = require('./veille-securite').collecter(Date.now() - 2 * 366 * 864e5); } catch (e) { /* frise indisponible */ }
  let groupes = [];
  try { groupes = require('./doublons').groupes(); } catch (e) { /* calcul indisponible */ }
  return { demandes: docs.tous('demandes'), rdv: docs.tous('rdv'), avisServices: docs.tous('avisServices'), avis: docs.tous('avis'), idees: docs.tous('idees'),
    securite, groupes, plateforme: docs.tous('plateformeJours'), services: docs.tous('services') };
}

function calculer(q, l) {
  const p = periodeDe(q);
  if (p.erreur) return { erreur: p.erreur };
  const ctx = contexte();
  const duree = p.t1 - p.t0;
  const cur = mesurer(p.t0, p.t1, ctx), prev = mesurer(p.t0 - duree, p.t0, ctx);
  const nomS = (id) => { const s = ctx.services.find((x) => x.id === id); return s ? (s.nom && (s.nom[l] || s.nom.fr)) || id : id; };
  const quartierDe = (d) => d.quartier || '';
  const tr = (k) => tendance(cur[k], prev[k]);

  // par service
  const parService = ctx.services.map((s) => {
    const r = cur._recues.filter((d) => d.serviceId === s.id), r0 = prev._recues.filter((d) => d.serviceId === s.id);
    const t = cur._traitees.filter((x) => x.d.serviceId === s.id);
    const delai = arrondi(moyenne(t.map((x) => (x.t - Date.parse(x.d.cree)) / 864e5)));
    const ok = t.filter((x) => (x.t - Date.parse(x.d.cree)) / 864e5 <= cible(x.d)).length;
    const av = cur._avis.filter((a) => a.serviceId === s.id).map((a) => Number(a.note));
    return { id: s.id, nom: nomS(s.id), recues: r.length, recuesAvant: r0.length, tendance: tendance(r.length, r0.length), traitees: t.length, delaiMoyen: delai, dansObjectif: pct(ok, t.length),
      enAttente: cur._attente.filter((d) => d.serviceId === s.id).length, horsDelai: cur._horsDelai.filter((d) => d.serviceId === s.id).length,
      satisfaction: arrondi(moyenne(av)), avis: av.length, etat: (s.etat && s.etat.code) || 'ok' };
  }).filter((s) => s.recues + s.recuesAvant + s.traitees + s.enAttente + s.avis > 0).sort((a, b) => b.recues - a.recues || b.enAttente - a.enAttente);
  // par quartier
  const parQuartier = QUARTIERS.map((qq) => {
    const r = cur._recues.filter((d) => quartierDe(d) === qq), r0 = prev._recues.filter((d) => quartierDe(d) === qq);
    const t = cur._traitees.filter((x) => quartierDe(x.d) === qq);
    return { quartier: qq, nom: (QNOM[l] || QNOM.fr)[qq], recues: r.length, recuesAvant: r0.length, tendance: tendance(r.length, r0.length), traitees: t.length,
      delaiMoyen: arrondi(moyenne(t.map((x) => (x.t - Date.parse(x.d.cree)) / 864e5))), enAttente: cur._attente.filter((d) => quartierDe(d) === qq).length,
      horsDelai: cur._horsDelai.filter((d) => quartierDe(d) === qq).length, urgences: cur._urg.filter((d) => quartierDe(d) === qq).length,
      participation: ctx.idees.filter((i) => i.quartier === qq && Date.parse(i.cree) >= p.t0 && Date.parse(i.cree) < p.t1).length };
  });
  // services les plus utilisés (F98, compteurs anonymes) pour les périodes 7 / 30 / 90 jours ; sinon demandes + rendez-vous
  let top = [];
  try {
    if (!p.perso) top = require('./usage').rapport(p.jours, '').classement.filter((s) => s.usages > 0).slice(0, 5).map((s) => ({ id: s.id, nom: nomS(s.id), usages: s.usages, part: s.part, tendance: s.tendance, source: 'usage' }));
  } catch (e) { /* compteurs indisponibles */ }
  if (!top.length) {
    const tot = cur._recues.length + ctx.rdv.filter((r) => Date.parse(r.debut) >= p.t0 && Date.parse(r.debut) < p.t1).length;
    top = parService.map((s) => ({ id: s.id, nom: s.nom, usages: s.recues + ctx.rdv.filter((r) => r.serviceId === s.id && Date.parse(r.debut) >= p.t0 && Date.parse(r.debut) < p.t1).length }))
      .sort((a, b) => b.usages - a.usages).slice(0, 5).map((s) => Object.assign(s, { part: pct(s.usages, tot), tendance: null, source: 'demandes' }));
  }

  /* ---- Rédaction automatique ---- */
  const T = (x) => texteTendance(x, l), N = (v) => nombre(v, l);
  const cles = [], attention = [], recos = [];
  const ajoute = (liste, code, prm, cle) => liste.push({ code, cle: cle || code, texte: phrase(code, prm, l) });
  if (cur.recues) ajoute(cles, 'k.recues', { n: cur.recues, t: T(tr('recues')) });
  if (cur.traitees) ajoute(cles, 'k.traitees', { n: cur.traitees, d: N(cur.delaiMoyen), t: T(tendance(cur.delaiMoyen, prev.delaiMoyen)) });
  if (cur.dansObjectif != null && cur.dansObjectif >= OBJECTIF) ajoute(cles, 'k.objectif', { p: N(Math.round(cur.dansObjectif)), o: OBJECTIF });
  if (cur.avis && cur.satisfaction >= 3.5) ajoute(cles, 'k.satisfaction', { note: N(cur.satisfaction), n: cur.avis, p: N(Math.round(cur.satisfaits)) });
  if (cur.urgences) ajoute(cur.urgencesLentes ? attention : cles, cur.urgencesLentes ? 'a.urgences' : 'k.urgences', { n: cur.urgencesLentes || cur.urgences, m: cur.urgencesLentes ? URGENCE_MIN : N(cur.urgencesDelai) });
  if (top[0]) { const s = parService.find((x) => x.id === top[0].id); if (s && s.recues) ajoute(cles, 'k.top', { s: s.nom, n: s.recues, p: N(Math.round(pct(s.recues, cur.recues) || 0)) }); }
  const trPart = tendance(cur.participation, prev.participation);
  if (cur.participation && (trPart == null || trPart > -15)) ajoute(cles, 'k.participation', { n: cur.participation, t: T(trPart) });
  if (cur.disponibilite != null && cur.disponibilite >= 99) ajoute(cles, 'k.dispo', { p: N(cur.disponibilite) });
  if (cur.enAttente < cur.enAttenteDebut) ajoute(cles, 'k.backlogBaisse', { n: cur.enAttente, n0: cur.enAttenteDebut });
  // points d'attention et recommandations associées
  if (cur.horsDelai) { ajoute(attention, 'a.backlog', { n: cur.enAttente, v: cur.horsDelai }); ajoute(recos, 'r.anciennes', { n: cur.horsDelai }); }
  if (cur.delaiMoyen != null && prev.delaiMoyen != null && cur.delaiMoyen > prev.delaiMoyen * 1.15) ajoute(attention, 'a.delai', { d: N(cur.delaiMoyen), d0: N(prev.delaiMoyen) });
  if (cur.dansObjectif != null && cur.dansObjectif < OBJECTIF) ajoute(attention, 'a.objectif', { p: N(Math.round(cur.dansObjectif)), o: OBJECTIF });
  const lent = parService.filter((s) => s.traitees >= 3 && s.delaiMoyen != null).sort((a, b) => b.delaiMoyen - a.delaiMoyen)[0];
  if (lent && cur.delaiMoyen && lent.delaiMoyen > cur.delaiMoyen * 1.3) { ajoute(attention, 'a.serviceLent', { s: lent.nom, d: N(lent.delaiMoyen), n: lent.enAttente }); if (lent.enAttente >= 3) ajoute(recos, 'r.renfort', { s: lent.nom, n: lent.enAttente }); }
  const hausse = parService.filter((s) => s.recuesAvant >= 4 && s.tendance >= 40).sort((a, b) => b.tendance - a.tendance)[0];
  if (hausse) { ajoute(attention, 'a.hausseService', { s: hausse.nom, t: T(hausse.tendance) }); ajoute(recos, 'r.anticiper', { s: hausse.nom }); }
  const mal = parService.filter((s) => s.avis >= 3 && s.satisfaction != null && s.satisfaction < 3.5).sort((a, b) => a.satisfaction - b.satisfaction)[0];
  if (mal) { ajoute(attention, 'a.satisfaction', { s: mal.nom, note: N(mal.satisfaction), n: mal.avis }); ajoute(recos, 'r.satisfaction', { s: mal.nom }); }
  const qMax = parQuartier.slice().sort((a, b) => b.enAttente - a.enAttente)[0];
  if (qMax && cur.enAttente >= 5 && qMax.enAttente / cur.enAttente >= 0.35) {
    const qn = TXT[l].quartier.replace('{q}', qMax.nom);
    ajoute(attention, 'a.quartier', { q: qn, p: N(Math.round(pct(qMax.enAttente, cur.enAttente))) }); ajoute(recos, 'r.quartier', { q: qn });
  }
  if (cur.urgencesLentes) ajoute(recos, 'r.urgences', { m: URGENCE_MIN });
  if (ctx.groupes.length) { ajoute(attention, 'a.groupes', { n: ctx.groupes.length }); ajoute(recos, 'r.groupes', { n: ctx.groupes.length }); }
  if (cur.securiteHaute) { ajoute(attention, 'a.securite', { n: cur.securiteHaute }); ajoute(recos, 'r.securite', { n: cur.securiteHaute }); }
  if (prev.participation >= 5 && trPart != null && trPart <= -15) { ajoute(attention, 'a.participation', { n: cur.participation, t: T(trPart) }); ajoute(recos, 'r.participation', {}); }
  if (!recos.length) ajoute(recos, 'r.maintenir', {});

  const nettoyer = (m) => Object.fromEntries(Object.entries(m).filter(([k]) => !k.startsWith('_')));
  const c = nettoyer(cur), pr = nettoyer(prev);
  const iso = (t) => new Date(t).toISOString();
  return { genere: maintenant(), langue: l, periode: { du: iso(p.t0), au: iso(p.t1), duAvant: iso(p.t0 - duree), auAvant: iso(p.t0), jours: p.jours, perso: p.perso },
    objectif: OBJECTIF, cibles: CIBLE, urgenceMinutes: URGENCE_MIN, actuel: c, precedent: pr,
    tendances: Object.fromEntries(Object.keys(c).filter((k) => typeof c[k] === 'number').map((k) => [k, tendance(c[k], pr[k] || 0)])),
    groupesSemblables: ctx.groupes.length, top, parService, parQuartier, pointsCles: cles.slice(0, 6), pointsAttention: attention.slice(0, 6), recommandations: recos.slice(0, 6),
    plateformeMaintenant: (() => { try { const ch = require('../charge'); return { niveau: ch.niveau() }; } catch (e) { return null; } })() };
}

// Rapport gardé 60 s (période + langue) : calcul de quelques dizaines de millisecondes, données peu mouvantes
const memo = new Map();
function rapport(q, l) {
  const k = [q.periode || '', q.du || '', q.au || '', l].join('|');
  const e = memo.get(k);
  if (e && Date.now() - e.t < 60e3) return Object.assign({ cache: true }, e.r);
  const r = calculer(q, l);
  if (!r.erreur) { memo.set(k, { t: Date.now(), r }); if (memo.size > 50) memo.delete(memo.keys().next().value); }
  return r;
}
const langue = (req) => (LANGUES.includes(req.query.lang) ? req.query.lang : 'fr');

router.get('/api/rapport', personnel, (req, res) => {
  res.set('Cache-Control', 'no-store');
  const r = rapport(req.query, langue(req));
  if (r.erreur) return res.status(400).json({ erreur: r.erreur });
  res.json(r);
});

/* ---------- Téléchargements (historique des exports F88 + journal d'audit) ---------- */
const cellule = (v) => { let s = String(v == null ? '' : v).replace(/\r?\n/g, ' '); if (/^[=+\-@\t]/.test(s) && !/^-?\d+([.,]\d+)?$/.test(s)) s = "'" + s; return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const jour = (iso) => String(iso).slice(0, 10);
function journaliser(req, format, r, lignes) {
  const nom = `terra-nova-rapport-activite-${jour(r.periode.du)}-${jour(r.periode.au)}.${format === 'pdf' ? 'pdf' : format}`;
  docs.put('exportsHistorique', { id: uid('exp'), date: maintenant(), parId: req.user.id, par: `${req.user.prenom} ${req.user.nom}`, jeu: 'rapport-activite', colonnes: [],
    filtres: { periode: r.periode.perso ? `${jour(r.periode.du)} → ${jour(r.periode.au)}` : r.periode.jours + 'j' }, format, lignes, pseudonymise: true, modele: '', fichier: nom });
  audit(req.user, { categorie: 'donnees', action: 'Rapport d’activité téléchargé (données agrégées)', objetId: 'rapport-activite', objetLibelle: 'Rapport d’activité',
    apres: `${format.toUpperCase()}${lignes ? ', ' + lignes + ' ligne(s)' : ''}`, motif: `période du ${jour(r.periode.du)} au ${jour(r.periode.au)}` });
  return nom;
}
const LIB = {
  recues: 'Demandes reçues', traitees: 'Demandes traitées', delaiMoyen: 'Délai moyen de traitement (jours)', dansObjectif: 'Traitées dans le délai cible (%)', enAttente: 'Demandes en attente (fin de période)',
  horsDelai: 'dont hors délai', urgences: 'Urgences médicales', urgencesDelai: 'Prise en charge moyenne des urgences (min)', rdv: 'Rendez-vous honorés', rdvAnnules: 'Rendez-vous annulés',
  satisfaction: 'Satisfaction moyenne (/5)', avis: 'Avis sur les services', satisfaits: 'Habitants satisfaits (%)', participation: 'Participation (votes et idées)', securite: 'Événements de sécurité',
  securiteHaute: 'dont gravité haute', disponibilite: 'Disponibilité de la plateforme (%)', chargeMax: 'Charge maximale (%)', p95: 'Temps de réponse (p95, ms)'
};
router.get('/api/rapport/export', personnel, (req, res) => {
  const l = langue(req);
  const r = rapport(req.query, l);
  if (r.erreur) return res.status(400).json({ erreur: r.erreur });
  const format = req.query.format === 'json' ? 'json' : 'csv';
  res.set('Cache-Control', 'no-store');
  if (format === 'json') {
    const corps = JSON.stringify(Object.assign({ titre: 'Terra Nova — Rapport d’activité', donneesAgregees: true }, r), null, 2);
    const nom = journaliser(req, 'json', r, r.parService.length + r.parQuartier.length);
    res.set('Content-Type', 'application/json; charset=utf-8'); res.set('Content-Disposition', `attachment; filename="${nom}"`);
    return res.send(corps);
  }
  const v = (x) => (x == null ? '' : String(x).replace('.', ','));
  const L = [['Terra Nova — Rapport d’activité'], [`Période : du ${jour(r.periode.du)} au ${jour(r.periode.au)} (comparée au ${jour(r.periode.duAvant)} – ${jour(r.periode.auAvant)})`], [`Généré le ${r.genere}`], [],
    ['Indicateur', 'Période', 'Période précédente', 'Évolution (%)']];
  for (const k of Object.keys(LIB)) L.push([LIB[k], v(r.actuel[k]), v(r.precedent[k]), v(r.tendances[k])]);
  L.push([], ['Points clés']); r.pointsCles.forEach((x) => L.push([x.texte]));
  L.push([], ['Points d’attention']); r.pointsAttention.forEach((x) => L.push([x.texte]));
  L.push([], ['Recommandations']); r.recommandations.forEach((x, i) => L.push([`${i + 1}. ${x.texte}`]));
  L.push([], ['Par service'], ['Service', 'Reçues', 'Période précédente', 'Évolution (%)', 'Traitées', 'Délai moyen (jours)', 'Dans le délai (%)', 'En attente', 'Hors délai', 'Satisfaction (/5)', 'Avis']);
  r.parService.forEach((s) => L.push([s.nom, s.recues, s.recuesAvant, v(s.tendance), s.traitees, v(s.delaiMoyen), v(s.dansObjectif), s.enAttente, s.horsDelai, v(s.satisfaction), s.avis]));
  L.push([], ['Par quartier'], ['Quartier', 'Reçues', 'Période précédente', 'Évolution (%)', 'Traitées', 'Délai moyen (jours)', 'En attente', 'Hors délai', 'Urgences', 'Idées']);
  r.parQuartier.forEach((q) => L.push([q.nom, q.recues, q.recuesAvant, v(q.tendance), q.traitees, v(q.delaiMoyen), q.enAttente, q.horsDelai, q.urgences, q.participation]));
  L.push([], ['Services les plus utilisés'], ['Service', 'Utilisations', 'Part (%)', 'Évolution (%)']);
  r.top.forEach((s) => L.push([s.nom, s.usages, v(s.part), v(s.tendance)]));
  const nom = journaliser(req, 'csv', r, L.length);
  res.set('Content-Type', 'text/csv; charset=utf-8'); res.set('Content-Disposition', `attachment; filename="${nom}"`);
  res.send('﻿' + L.map((ligne) => ligne.map(cellule).join(';')).join('\r\n') + '\r\n');
});
// Impression / PDF (fait par le navigateur) : inscrit dans l'historique et le journal
router.post('/api/rapport/imprime', personnel, (req, res) => {
  const b = req.body || {};
  const r = rapport({ periode: b.periode, du: b.du, au: b.au }, LANGUES.includes(b.lang) ? b.lang : 'fr');
  if (r.erreur) return res.status(400).json({ erreur: r.erreur });
  res.json({ ok: true, fichier: journaliser(req, 'pdf', r, 0) });
});

/* ---------- Démonstration : 180 jours d'historique (une seule fois, base neuve ou en service) ---------- */
function semer() {
  try {
    if (docs.get('essentiel', 'vague22-rapport')) return false;
    let graine = 22022;
    const alea = () => { graine = (graine * 1103515245 + 12345) % 2147483648; return graine / 2147483648; };
    const choisir = (l) => l[Math.floor(alea() * l.length)];
    const pondere = (o) => { const tot = Object.values(o).reduce((a, b) => a + b, 0); let x = alea() * tot; for (const [k, w] of Object.entries(o)) { x -= w; if (x <= 0) return k; } return Object.keys(o)[0]; };
    const t = Date.now(), J = 864e5;
    const services = docs.tous('services').map((s) => s.id);
    const poids = { 'etat-civil': 9, voirie: 8, logement: 6, dechets: 6, transports: 5, 'eau-energie': 5, social: 4, sante: 4, education: 3, emploi: 3, urbanisme: 2, culture: 2 };
    const OBJETS = { 'etat-civil': ['Copie d’acte de naissance', 'Renouvellement de carte d’identité', 'Livret de famille'], voirie: ['Nid-de-poule à réparer', 'Lampadaire éteint', 'Trottoir abîmé'],
      logement: ['Demande de logement social', 'Humidité dans le logement', 'Aide au loyer'], dechets: ['Collecte non effectuée', 'Dépôt sauvage', 'Bac de tri cassé'],
      transports: ['Abonnement navette', 'Retard récurrent ligne 2', 'Objet perdu'], 'eau-energie': ['Fuite d’eau', 'Coupure de courant', 'Facture d’eau'], social: ['Aide alimentaire', 'Rendez-vous assistante sociale', 'Aide à domicile'],
      sante: ['Centre de vaccination', 'Rendez-vous médecin', 'Carte de santé'], education: ['Inscription scolaire', 'Cantine', 'Transport scolaire'], emploi: ['Atelier CV', 'Offre d’emploi', 'Formation'],
      urbanisme: ['Permis de construire', 'Déclaration de travaux', 'Plan cadastral'], culture: ['Inscription médiathèque', 'Salle de spectacle', 'Atelier musique'] };
    const lents = { logement: 2.2, urbanisme: 1.8, social: 1.3 };
    let ouvertes = 0, n = 0;
    for (let i = 0; i < 240; i++) {
      // plus de demandes récemment (hausse d'activité) ; « Logement » en forte hausse sur les 30 derniers jours
      const age = Math.pow(alea(), 1.15) * 180;
      let serviceId = pondere(Object.fromEntries(services.map((s) => [s, poids[s] || 2])));
      if (age < 30 && alea() < 0.18 && services.includes('logement')) serviceId = 'logement';
      const cree = t - age * J - alea() * 6 * 3600e3;
      const priorite = pondere({ basse: 25, normale: 55, haute: 17, urgente: 3 });
      const quartier = pondere({ Centre: 22, Nord: 26, Sud: 20, Est: 17, Ouest: 15 });
      const delai = Math.max(0.2, (CIBLE[priorite] * (0.35 + alea() * 1.1)) * (lents[serviceId] || 1) * (age < 30 && serviceId === 'logement' ? 1.6 : 1));
      let traiteLe = cree + delai * J;
      const ouverte = traiteLe > t || (age < 25 && alea() < 0.25);
      if (ouverte && ouvertes >= 14) traiteLe = Math.min(t - 3600e3, cree + Math.min(delai, age * 0.8) * J);
      const estOuverte = ouverte && ouvertes < 14;
      if (estOuverte) ouvertes++;
      const objet = choisir(OBJETS[serviceId] || ['Demande d’information']);
      const historique = [{ date: new Date(cree).toISOString(), statut: 'recue', note: 'Demande enregistrée et transmise au service concerné.', par: 'Système' }];
      const prise = cree + Math.min(delai * 0.3, 2) * J;
      if (!estOuverte || prise < t) historique.push({ date: new Date(Math.min(prise, t - 60e3)).toISOString(), statut: 'en_cours', note: 'Prise en charge par le service.', par: 'Agent du service' });
      if (!estOuverte) historique.push({ date: new Date(traiteLe).toISOString(), statut: alea() < 0.4 ? 'cloturee' : 'traitee', note: 'Demande traitée.', par: 'Agent du service' });
      const statut = historique[historique.length - 1].statut;
      const id = `NT-${docs.prochainNumero('demandes', 1000)}`;
      docs.put('demandes', { id, userId: `usr-hist-${(i % 37) + 1}`, type: pondere({ demarche: 45, signalement: 35, contact: 20 }), serviceId, categorie: serviceId, objet: `${objet} — ${quartier}`,
        message: `${objet} (historique de démonstration, quartier ${quartier}).`, lieu: `Quartier ${quartier}`, quartier, priorite, statut, agent: '', cree: new Date(cree).toISOString(), historique, seed: 'v22' });
      n++;
    }
    // urgences médicales closes (F86) : prise en charge en quelques minutes, deux au-delà de 5 min sur la période récente
    for (let i = 0; i < 9; i++) {
      const age = alea() * 170 + 1, cree = t - age * J, min = i === 1 || i === 4 ? 7 + Math.round(alea() * 4) : 1 + Math.round(alea() * 3);
      const q = choisir(QUARTIERS), iso = new Date(cree).toISOString(), le = new Date(cree + min * 60e3).toISOString();
      docs.put('demandes', { id: `NT-${docs.prochainNumero('demandes', 1000)}`, userId: `usr-hist-${i + 3}`, type: 'signalement', serviceId: 'sante', categorie: 'sante', objet: `Malaise sur la voie publique — ${q}`,
        message: 'Personne inconsciente, secours prévenus (historique de démonstration).', lieu: `Quartier ${q}`, quartier: q, priorite: 'urgente', statut: 'cloturee', agent: '', cree: iso, seed: 'v22',
        historique: [{ date: iso, statut: 'recue', note: 'Urgence médicale enregistrée.', par: 'Système' }, { date: new Date(cree + 2 * 3600e3).toISOString(), statut: 'cloturee', note: 'Transmise aux secours puis close.', par: 'Agent de garde' }],
        urgenceMedicale: { statut: 'close', signaleeLe: iso, echeance: new Date(cree + URGENCE_MIN * 60e3).toISOString(), delaiMinutes: URGENCE_MIN, motifs: ['malaise'], explicite: false,
          priseEnCharge: { le, par: 'Agent de garde', parId: '', minutes: min }, escalade: null, historique: [{ date: iso, statut: 'signalee', note: 'Urgence médicale enregistrée.', par: 'Système' }] } });
    }
    // rendez-vous (passés) et avis sur les services (F76)
    const avecRdv = docs.tous('services').filter((s) => s.rdv).map((s) => s.id);
    for (let i = 0; i < 130 && avecRdv.length; i++) {
      const debut = t - Math.pow(alea(), 1.1) * 180 * J;
      docs.put('rdv', { id: `rdv-v22-${i + 1}`, userId: `usr-hist-${(i % 37) + 1}`, serviceId: choisir(avecRdv), debut: new Date(debut).toISOString(), statut: alea() < 0.1 ? 'annule' : 'confirme',
        libelle: 'Rendez-vous au guichet', lieu: 'Hôtel de ville', agent: '', motif: 'Rendez-vous', pieces: [], rappel: { actif: false, avant: 24, envoye: true }, cree: new Date(debut - 5 * J).toISOString(), seed: 'v22' });
    }
    const notesPar = { logement: [2, 3, 3, 4], urbanisme: [3, 3, 4, 4], 'etat-civil': [4, 5, 5, 4], transports: [3, 4, 4, 5] };
    const COMS = ['Accueil aimable et rapide.', 'Démarche claire, merci.', 'Délai trop long à mon goût.', 'Réponse précise.', 'Il a fallu relancer plusieurs fois.', ''];
    for (let i = 0; i < 95; i++) {
      const cree = t - Math.pow(alea(), 1.1) * 180 * J, serviceId = pondere(Object.fromEntries(services.map((s) => [s, poids[s] || 2])));
      const note = choisir(notesPar[serviceId] || [3, 4, 4, 5, 5]), iso = new Date(cree).toISOString();
      docs.put('avisServices', { id: `COM-V22-${String(i + 1).padStart(3, '0')}`, statut: 'publie', modifications: 0, userId: `usr-hist-${(i % 37) + 1}`, serviceId, procedure: `service:${serviceId}`,
        procedureLibelle: 'Utilisation du service', note, commentaire: choisir(COMS), cree: iso, maj: iso, seed: 'v22' });
    }
    // événements de sécurité (F100) : tentatives bloquées et comptes verrouillés au fil des mois
    for (let i = 0; i < 26; i++) {
      const d = new Date(t - (2 + alea() * 170) * J).toISOString();
      if (i % 6 === 0) docs.put('journal', { id: `evt-v22-${i}`, seed: 'v22', type: 'verrouillage', email: 'h•••@nova.test', detail: 'Mots de passe incorrects répétés', date: d, cree: d });
      else docs.put('bouclier', { id: `blq-v22-${i}`, seed: 'v22', type: choisir(['debit', 'validation', 'robot', 'csrf', 'acces']), methode: 'POST', chemin: choisir(['/api/auth/connecter', '/api/docs/demandes', '/api/formulaires']), ip: '198.51.100.x', compte: '', detail: 'historique de démonstration', date: d, cree: d });
    }
    // relevé quotidien de la plateforme (disponibilité, charge maximale, temps de réponse)
    for (let k = 1; k <= 180; k++) {
      const jourIso = new Date(t - k * J + 3 * 3600e3).toISOString().slice(0, 10);
      if (docs.get('plateformeJours', jourIso)) continue;
      const panne = k === 9 || k === 47 || k === 123;   // trois courtes interruptions (maintenance, incident)
      docs.put('plateformeJours', { id: jourIso, dispo: panne ? 98.6 + alea() * 0.8 : 99.9 + alea() * 0.1, chargeMax: Math.round(25 + alea() * 45 + (k < 30 ? 10 : 0)), p95: Math.round(120 + alea() * 120), cree: new Date(t - k * J).toISOString(), seed: 'v22' });
    }
    docs.put('essentiel', { id: 'vague22-rapport', cree: maintenant(), demandes: n });
    console.log(`[demo] vague 22 : historique du rapport d’activité (${n} demandes, rendez-vous, avis, relevés) ajouté`);
    return true;
  } catch (err) { console.error('[vague22] semis rapport', err.message); return false; }
}
// Relevé du jour (vraie mesure) : charge maximale et temps de réponse, mis à jour toutes les 10 minutes
function releverJour() {
  try {
    const ch = require('../charge'), d = ch.details(), id = new Date(Date.now() + 3 * 3600e3).toISOString().slice(0, 10);
    const av = docs.get('plateformeJours', id) || { id, dispo: 100, chargeMax: 0, p95: 0, cree: maintenant() };
    const charge = Math.min(100, Math.round(((d.enCoursMax || 0) / ((d.seuils && d.seuils.enCoursCritique) || 100)) * 100));
    docs.put('plateformeJours', Object.assign({}, av, { chargeMax: Math.max(av.chargeMax || 0, charge), p95: (d.latence && d.latence.s60 && d.latence.s60.p95) || av.p95 || 0, dispo: av.dispo == null ? 100 : av.dispo }));
  } catch (e) { /* relevé facultatif */ }
}
setTimeout(releverJour, 30e3).unref();
setInterval(releverJour, 10 * 60e3).unref();

module.exports = { router, semer, calculer };
