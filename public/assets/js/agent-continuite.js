/* Terra Nova — vague 19 (F93) : « Continuité de service » sur la page Plateforme (agents : lecture ; administrateur : simulation).
   État de la base, dernière copie de secours des informations essentielles (heure, taille, contenu), dépendance externe (API Webcup),
   liste des lectures servies pendant un incident, et simulation d'une panne de la base (durée limitée, journalisée). */
(function () {
  'use strict';
  const NT = window.NT;
  NT.i18n.ajouter({
    fr: { 'ct.titre': 'Continuité de service (panne de la base ou d’une dépendance)', 'ct.aide': 'Si la base de données ou une dépendance tombe en panne, les lectures essentielles (alertes, messages officiels, état des services, numéros d’urgence, contacts, page « Infos essentielles », version simple) servent la dernière copie bonne avec son heure, au lieu d’une erreur. Les autres actions répondent calmement « réessayez dans quelques minutes » et les envois des habitants attendent sur leur appareil.',
      'ct.simuler': 'Simuler un incident (démonstration)', 'ct.simulerAide': 'Pendant la simulation, chaque visite d’un habitant ou d’un visiteur voit la base « en panne » (comme une vraie panne, sa session ne peut plus être lue). Vos requêtes d’administrateur continuent normalement : ouvrez une fenêtre privée pour voir ce que voient les habitants. Retour automatique à la fin de la durée ; action inscrite au journal.',
      'ct.lancer': 'Simuler une panne de la base', 'ct.arreter': 'Arrêter la simulation', 'ct.base': 'Base de données', 'ct.ok': 'Disponible', 'ct.panne': 'En panne : copie de secours servie', 'ct.simulee': 'Incident simulé jusqu’à {h} (par {p})',
      'ct.copie': 'Dernière copie bonne', 'ct.copieDetail': '{d} · {ko} Ko · {a} alerte(s), {o} message(s) officiel(s), {s} services, {as} associations', 'ct.fichier': 'gardée aussi dans un fichier à côté de la base', 'ct.memoire': 'en mémoire seulement',
      'ct.aucune': 'Pas encore de copie', 'ct.webcup': 'Dépendance externe (API Webcup)', 'ct.webcupDetail': 'dernière synchronisation {d}', 'ct.essentiels': 'Servi pendant un incident', 'ct.voir': 'Voir la page « Infos essentielles »', 'ct.lance': 'Incident simulé : ouvrez une fenêtre privée pour voir la plateforme côté habitant.', 'ct.fini': 'Simulation arrêtée.' },
    en: { 'ct.titre': 'Service continuity (database or dependency failure)', 'ct.aide': 'If the database or a dependency fails, essential reads (alerts, official messages, service status, emergency numbers, contacts, “Essential information” page, simple version) serve the last good copy with its time instead of an error. Other actions calmly answer “try again in a few minutes” and residents’ submissions wait on their device.',
      'ct.simuler': 'Simulate an incident (demonstration)', 'ct.simulerAide': 'During the simulation, every resident or visitor request sees the database “down” (like a real failure, their session can no longer be read). Your administrator requests keep working: open a private window to see what residents see. Automatic return at the end of the duration; action logged.',
      'ct.lancer': 'Simulate a database failure', 'ct.arreter': 'Stop the simulation', 'ct.base': 'Database', 'ct.ok': 'Available', 'ct.panne': 'Down: backup copy served', 'ct.simulee': 'Simulated incident until {h} (by {p})',
      'ct.copie': 'Last good copy', 'ct.copieDetail': '{d} · {ko} KB · {a} alert(s), {o} official message(s), {s} services, {as} associations', 'ct.fichier': 'also kept in a file next to the database', 'ct.memoire': 'in memory only',
      'ct.aucune': 'No copy yet', 'ct.webcup': 'External dependency (Webcup API)', 'ct.webcupDetail': 'last synchronisation {d}', 'ct.essentiels': 'Served during an incident', 'ct.voir': 'See the “Essential information” page', 'ct.lance': 'Simulated incident: open a private window to see the platform as a resident.', 'ct.fini': 'Simulation stopped.' },
    es: { 'ct.titre': 'Continuidad del servicio (fallo de la base o de una dependencia)', 'ct.aide': 'Si la base de datos o una dependencia falla, las lecturas esenciales (alertas, mensajes oficiales, estado de los servicios, números de emergencia, contactos, página «Información esencial», versión sencilla) sirven la última copia buena con su hora, en lugar de un error. Las demás acciones responden con calma «vuelva a intentarlo en unos minutos» y los envíos de los habitantes esperan en su dispositivo.',
      'ct.simuler': 'Simular un incidente (demostración)', 'ct.simulerAide': 'Durante la simulación, cada visita de un habitante o visitante ve la base «caída» (como un fallo real, su sesión ya no puede leerse). Sus peticiones de administrador siguen funcionando: abra una ventana privada para ver lo que ven los habitantes. Vuelta automática al final de la duración; acción registrada.',
      'ct.lancer': 'Simular un fallo de la base', 'ct.arreter': 'Detener la simulación', 'ct.base': 'Base de datos', 'ct.ok': 'Disponible', 'ct.panne': 'Caída: se sirve la copia de seguridad', 'ct.simulee': 'Incidente simulado hasta las {h} (por {p})',
      'ct.copie': 'Última copia buena', 'ct.copieDetail': '{d} · {ko} KB · {a} alerta(s), {o} mensaje(s) oficial(es), {s} servicios, {as} asociaciones', 'ct.fichier': 'guardada también en un archivo junto a la base', 'ct.memoire': 'solo en memoria',
      'ct.aucune': 'Aún no hay copia', 'ct.webcup': 'Dependencia externa (API Webcup)', 'ct.webcupDetail': 'última sincronización {d}', 'ct.essentiels': 'Servido durante un incidente', 'ct.voir': 'Ver la página «Información esencial»', 'ct.lance': 'Incidente simulado: abra una ventana privada para ver la plataforma como habitante.', 'ct.fini': 'Simulación detenida.' },
    ar: { 'ct.titre': 'استمرارية الخدمة (عطل قاعدة البيانات أو إحدى التبعيات)', 'ct.aide': 'إذا تعطلت قاعدة البيانات أو إحدى التبعيات، تُقدَّم القراءات الأساسية (التنبيهات، الرسائل الرسمية، حالة الخدمات، أرقام الطوارئ، جهات الاتصال، صفحة «معلومات أساسية»، النسخة المبسطة) من آخر نسخة سليمة مع وقتها بدلاً من خطأ. تجيب الإجراءات الأخرى بهدوء «أعد المحاولة بعد دقائق» وتنتظر إرسالات السكان على أجهزتهم.',
      'ct.simuler': 'محاكاة عطل (عرض توضيحي)', 'ct.simulerAide': 'أثناء المحاكاة، يرى كل ساكن أو زائر القاعدة «معطلة» (مثل عطل حقيقي، لا يمكن قراءة جلسته). تستمر طلباتك كمسؤول بشكل عادي: افتح نافذة خاصة لترى ما يراه السكان. عودة تلقائية في نهاية المدة؛ الإجراء مسجل.',
      'ct.lancer': 'محاكاة عطل في القاعدة', 'ct.arreter': 'إيقاف المحاكاة', 'ct.base': 'قاعدة البيانات', 'ct.ok': 'متاحة', 'ct.panne': 'معطلة: تُقدَّم النسخة الاحتياطية', 'ct.simulee': 'عطل محاكى حتى {h} (بواسطة {p})',
      'ct.copie': 'آخر نسخة سليمة', 'ct.copieDetail': '{d} · {ko} كيلوبايت · {a} تنبيه، {o} رسالة رسمية، {s} خدمة، {as} جمعية', 'ct.fichier': 'محفوظة أيضاً في ملف بجانب القاعدة', 'ct.memoire': 'في الذاكرة فقط',
      'ct.aucune': 'لا توجد نسخة بعد', 'ct.webcup': 'تبعية خارجية (واجهة Webcup)', 'ct.webcupDetail': 'آخر مزامنة {d}', 'ct.essentiels': 'ما يُقدَّم أثناء العطل', 'ct.voir': 'عرض صفحة «معلومات أساسية»', 'ct.lance': 'عطل محاكى: افتح نافذة خاصة لترى المنصة كما يراها الساكن.', 'ct.fini': 'توقفت المحاكاة.' }
  });
  NT.pret(() => {
    const t = (k, v) => NT.t(k, v), E = NT.ui.echap;
    const zone = document.getElementById('ct-etat'), form = document.getElementById('ct-form');
    if (!zone) return;
    const admin = NT.auth.aRole('admin');
    if (admin && form) form.hidden = false;
    let etat = null, minuterie = null;
    function rendre() {
      if (!etat) return;
      const s = etat.simulation, c = etat.copie;
      zone.innerHTML = `<dl class="ct-liste">
        <div><dt>${E(t('ct.base'))}</dt><dd><strong class="${s || etat.base !== 'ok' ? 'ct-alerte' : 'ct-ok'}">${E(s ? t('ct.simulee', { h: NT.ui.dateHeure(s.jusqu), p: s.par }) : etat.base === 'ok' ? t('ct.ok') : t('ct.panne'))}</strong></dd></div>
        <div><dt>${E(t('ct.copie'))}</dt><dd>${c ? E(t('ct.copieDetail', { d: NT.ui.dateHeure(c.majLe), ko: Math.round(c.octets / 102.4) / 10, a: c.alertes, o: c.officiels, s: c.services, as: c.associations })) + ' · ' + E(t(c.fichier ? 'ct.fichier' : 'ct.memoire')) : E(t('ct.aucune'))}</dd></div>
        ${etat.webcup ? `<div><dt>${E(t('ct.webcup'))}</dt><dd>${E(t('ct.webcupDetail', { d: etat.webcup.derniere || '—' }))}${etat.webcup.erreur ? ' · ' + E(etat.webcup.erreur) : ''}</dd></div>` : ''}
        <div><dt>${E(t('ct.essentiels'))}</dt><dd><code>${etat.essentiels.map(E).join('</code> · <code>')}</code></dd></div></dl>
        <p><a href="/essentiel?lang=${E(NT.i18n.langue)}"><i class="ph ph-first-aid-kit" aria-hidden="true"></i> ${E(t('ct.voir'))}</a></p>`;
      const arreter = document.getElementById('ct-arreter');
      if (arreter) arreter.hidden = !s;
    }
    function lire() {
      fetch('/api/continuite', { cache: 'no-store', credentials: 'same-origin' }).then(r => (r.ok ? r.json() : null)).then(j => { if (j) { etat = j; rendre(); } }).catch(() => {})
        .finally(() => { clearTimeout(minuterie); if (!document.hidden) minuterie = setTimeout(lire, 10000); });
    }
    document.addEventListener('visibilitychange', () => { if (!document.hidden) lire(); else clearTimeout(minuterie); });
    function simuler(mode) {
      const err = document.getElementById('ct-erreur');
      const r = NT.api('POST', '/api/continuite/simuler', { mode, minutes: Number(document.getElementById('ct-minutes').value), motif: document.getElementById('ct-motif').value.trim() });
      if (r.statut !== 200) { err.textContent = (r.donnees && r.donnees.erreur) || NT.t('ui.erreur'); err.hidden = false; return; }
      err.hidden = true; etat = r.donnees; rendre();
      NT.ui.toast(t(mode === 'aucun' ? 'ct.fini' : 'ct.lance'), mode === 'aucun' ? 'success' : 'warning', 8000);
    }
    if (form) {
      form.addEventListener('submit', e => { e.preventDefault(); simuler('base'); });
      document.getElementById('ct-arreter').addEventListener('click', () => simuler('aucun'));
    }
    NT.i18n.appliquer();
    lire();
  });
})();
