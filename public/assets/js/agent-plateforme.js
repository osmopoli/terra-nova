/* Terra Nova — page « État de la plateforme » (vague 15 : F77, F78), agents et administrateur.
   Lit GET /api/charge/details toutes les 5 s (route essentielle : jamais délestée) ; l'administrateur peut forcer le mode
   dégradé pour la démonstration (POST /api/charge/forcer, contrôlé par le serveur et journalisé). */
(function () {
  'use strict';
  const NT = window.NT;
  NT.i18n.ajouter({
    fr: { 'pf.titre': 'État de la plateforme' },
    en: { 'pf.surtitre': 'Technical centre · Digital department', 'pf.titre': 'Platform status', 'pf.sous': 'Live server load, what stays a priority when many residents connect at once, and what is paused.',
      'pf.mesures': 'Live measurements', 'pf.mesuresAide': 'Updated every 5 seconds. Latency measured by the server, waiting time included.', 'pf.courbe': 'The last 3 minutes',
      'pf.priorite': 'What stays a priority', 'pf.delestees': 'Requests paused (503 + Retry-After)', 'pf.pilote': 'Degraded mode (demonstration)',
      'pf.piloteAide': 'Forcing a level shows residents what happens during a traffic peak: calm notice in the footer and the alerts drawer, spaced-out updates, secondary features paused. Automatic return at the end of the chosen duration. Administrator only, recorded in the log.',
      'pf.mode': 'Level', 'pf.auto': 'Automatic (based on measured load)', 'pf.forte': 'High traffic: heavy computations paused', 'pf.critique': 'Critical: only the essentials are served',
      'pf.duree': 'Duration', 'pf.motif': 'Reason (log)', 'pf.appliquer': 'Apply', 'pf.lecture': 'Only the administrator can force degraded mode.',
      'pf.test': 'Measure load handling', 'pf.testAide': 'From the project folder, run the load test (no dependency) and watch this page:' },
    es: { 'pf.surtitre': 'Centro técnico · Dirección Digital', 'pf.titre': 'Estado de la plataforma', 'pf.sous': 'Carga del servidor en directo, lo que sigue siendo prioritario cuando muchos habitantes se conectan a la vez y lo que se pausa.',
      'pf.mesures': 'Mediciones en directo', 'pf.mesuresAide': 'Actualizadas cada 5 segundos. Latencia medida por el servidor, espera incluida.', 'pf.courbe': 'Los últimos 3 minutos',
      'pf.priorite': 'Lo que sigue siendo prioritario', 'pf.delestees': 'Solicitudes en pausa (503 + Retry-After)', 'pf.pilote': 'Modo degradado (demostración)',
      'pf.piloteAide': 'Forzar un nivel muestra a los habitantes lo que ocurre durante un pico de afluencia: aviso tranquilo en el pie de página y en el panel de alertas, actualizaciones espaciadas, funciones secundarias en pausa. Vuelta automática al final de la duración elegida. Solo el administrador, queda registrado.',
      'pf.mode': 'Nivel', 'pf.auto': 'Automático (según la carga medida)', 'pf.forte': 'Mucha afluencia: cálculos pesados en pausa', 'pf.critique': 'Crítico: solo se sirve lo esencial',
      'pf.duree': 'Duración', 'pf.motif': 'Motivo (registro)', 'pf.appliquer': 'Aplicar', 'pf.lecture': 'Solo el administrador puede forzar el modo degradado.',
      'pf.test': 'Medir la resistencia a la carga', 'pf.testAide': 'Desde la carpeta del proyecto, lance la prueba de carga (sin dependencias) y mire esta página:' },
    ar: { 'pf.surtitre': 'المركز التقني · إدارة الرقمنة', 'pf.titre': 'حالة المنصة', 'pf.sous': 'حمل الخادم مباشرة، وما يبقى ذا أولوية عندما يتصل كثير من السكان في الوقت نفسه، وما يتم إيقافه مؤقتاً.',
      'pf.mesures': 'قياسات مباشرة', 'pf.mesuresAide': 'تُحدَّث كل 5 ثوانٍ. زمن الاستجابة يقيسه الخادم، بما في ذلك الانتظار.', 'pf.courbe': 'آخر 3 دقائق',
      'pf.priorite': 'ما يبقى ذا أولوية', 'pf.delestees': 'طلبات موقوفة مؤقتاً (503 + Retry-After)', 'pf.pilote': 'الوضع المتدهور (عرض توضيحي)',
      'pf.piloteAide': 'فرض مستوى يُظهر للسكان ما يحدث أثناء ذروة الإقبال: إشعار هادئ في تذييل الصفحة ودرج التنبيهات، تحديثات متباعدة، ووظائف ثانوية متوقفة. عودة تلقائية في نهاية المدة المختارة. للمسؤول فقط، ويُسجَّل في السجل.',
      'pf.mode': 'المستوى', 'pf.auto': 'تلقائي (حسب الحمل المقاس)', 'pf.forte': 'إقبال كبير: الحسابات الثقيلة متوقفة', 'pf.critique': 'حرج: يُقدَّم الأساسي فقط',
      'pf.duree': 'المدة', 'pf.motif': 'السبب (السجل)', 'pf.appliquer': 'تطبيق', 'pf.lecture': 'وحده المسؤول يمكنه فرض الوضع المتدهور.',
      'pf.test': 'قياس تحمّل الحمل', 'pf.testAide': 'من مجلد المشروع، شغّل اختبار الحمل (بدون أي تبعية) ثم راقب هذه الصفحة:' }
  });
  // Libellés dynamiques
  NT.i18n.ajouter({
    fr: { 'pf.n.normal': 'Fonctionnement normal', 'pf.n.forte': 'Forte affluence', 'pf.n.critique': 'Charge critique', 'pf.depuis': 'Depuis {d}', 'pf.force': 'Mode forcé par {par} jusqu’à {h}', 'pf.autoMesure': 'Niveau mesuré automatiquement : {n}',
      'pf.k.rps': 'Requêtes API par seconde', 'pf.k.p95': 'Latence p95 (10 s)', 'pf.k.p95b': 'p50 {a} ms · p99 {b} ms · 60 s : p95 {c} ms', 'pf.k.lag': 'Retard de la boucle (p99)', 'pf.k.lagb': 'max depuis le démarrage : {m} ms',
      'pf.k.encours': 'Requêtes en cours', 'pf.k.encoursb': 'maximum : {m} · en file : {f}', 'pf.k.deleste': 'Requêtes mises en pause', 'pf.k.delesteb': 'file pleine : {i} · délai dépassé : {e} · 429 : {l}',
      'pf.k.cache': 'Lectures servies par le cache', 'pf.k.cacheb': '{h} sur {t} · {n} entrées', 'pf.k.mem': 'Mémoire', 'pf.k.memb': 'tas : {h} Mo · en service depuis {u}', 'pf.k.err': 'Erreurs serveur (5xx)', 'pf.k.errb': 'hors mises en pause volontaires',
      'pf.c.essentiel': 'Toujours servi', 'pf.c.lourd': 'En pause dès la forte affluence', 'pf.c.secondaire': 'En pause en charge critique',
      'pf.l.essentiel': 'Connexion|État de la plateforme et des services|Alertes et messages officiels|Déposer une demande ou un signalement|Notifications|Version simple et urgences|Pages, styles et scripts',
      'pf.l.lourd': 'Diagnostic de sobriété|Indicateurs du tableau de bord|Flux de l’API Webcup|Exports et journaux',
      'pf.l.secondaire': 'Soutiens|Participation et idées|Avis sur les services|Demandes semblables|Contributions|Récapitulatifs',
      'pf.aucuneDelestee': 'Aucune requête mise en pause depuis le démarrage.', 'pf.chemin': 'Adresse', 'pf.nombre': 'Nombre',
      'pf.lg.p95': 'Latence p95 (ms)', 'pf.lg.lag': 'Retard de la boucle p99 (ms)', 'pf.lg.rps': 'Requêtes par seconde', 'pf.attente': 'Les mesures arrivent…',
      'pf.courbeAlt': 'Courbe des 3 dernières minutes : latence p95 maximale {p} ms, retard de boucle maximal {l} ms, débit maximal {r} requêtes par seconde.',
      'pf.ok': 'Niveau appliqué : {n}.', 'pf.erreur': 'Impossible de lire l’état de la plateforme.' },
    en: { 'pf.n.normal': 'Normal operation', 'pf.n.forte': 'High traffic', 'pf.n.critique': 'Critical load', 'pf.depuis': 'Since {d}', 'pf.force': 'Mode forced by {par} until {h}', 'pf.autoMesure': 'Automatically measured level: {n}',
      'pf.k.rps': 'API requests per second', 'pf.k.p95': 'p95 latency (10 s)', 'pf.k.p95b': 'p50 {a} ms · p99 {b} ms · 60 s: p95 {c} ms', 'pf.k.lag': 'Event loop delay (p99)', 'pf.k.lagb': 'max since start: {m} ms',
      'pf.k.encours': 'Requests in progress', 'pf.k.encoursb': 'maximum: {m} · queued: {f}', 'pf.k.deleste': 'Requests paused', 'pf.k.delesteb': 'queue full: {i} · timeout: {e} · 429: {l}',
      'pf.k.cache': 'Reads served by the cache', 'pf.k.cacheb': '{h} of {t} · {n} entries', 'pf.k.mem': 'Memory', 'pf.k.memb': 'heap: {h} MB · running for {u}', 'pf.k.err': 'Server errors (5xx)', 'pf.k.errb': 'excluding deliberate pauses',
      'pf.c.essentiel': 'Always served', 'pf.c.lourd': 'Paused from high traffic', 'pf.c.secondaire': 'Paused under critical load',
      'pf.l.essentiel': 'Sign-in|Platform and service status|Alerts and official messages|Submit a request or report|Notifications|Simple version and emergencies|Pages, styles and scripts',
      'pf.l.lourd': 'Sobriety diagnostic|Dashboard indicators|Webcup API feed|Exports and logs',
      'pf.l.secondaire': 'Supports|Participation and ideas|Service reviews|Similar requests|Contributions|Summaries',
      'pf.aucuneDelestee': 'No request paused since start.', 'pf.chemin': 'Address', 'pf.nombre': 'Count',
      'pf.lg.p95': 'p95 latency (ms)', 'pf.lg.lag': 'Event loop delay p99 (ms)', 'pf.lg.rps': 'Requests per second', 'pf.attente': 'Measurements on their way…',
      'pf.courbeAlt': 'Chart of the last 3 minutes: maximum p95 latency {p} ms, maximum loop delay {l} ms, maximum throughput {r} requests per second.',
      'pf.ok': 'Level applied: {n}.', 'pf.erreur': 'Unable to read the platform status.' },
    es: { 'pf.n.normal': 'Funcionamiento normal', 'pf.n.forte': 'Mucha afluencia', 'pf.n.critique': 'Carga crítica', 'pf.depuis': 'Desde {d}', 'pf.force': 'Modo forzado por {par} hasta {h}', 'pf.autoMesure': 'Nivel medido automáticamente: {n}',
      'pf.k.rps': 'Solicitudes API por segundo', 'pf.k.p95': 'Latencia p95 (10 s)', 'pf.k.p95b': 'p50 {a} ms · p99 {b} ms · 60 s: p95 {c} ms', 'pf.k.lag': 'Retraso del bucle (p99)', 'pf.k.lagb': 'máx. desde el inicio: {m} ms',
      'pf.k.encours': 'Solicitudes en curso', 'pf.k.encoursb': 'máximo: {m} · en cola: {f}', 'pf.k.deleste': 'Solicitudes en pausa', 'pf.k.delesteb': 'cola llena: {i} · tiempo agotado: {e} · 429: {l}',
      'pf.k.cache': 'Lecturas servidas por la caché', 'pf.k.cacheb': '{h} de {t} · {n} entradas', 'pf.k.mem': 'Memoria', 'pf.k.memb': 'montón: {h} MB · en servicio desde hace {u}', 'pf.k.err': 'Errores del servidor (5xx)', 'pf.k.errb': 'sin contar las pausas voluntarias',
      'pf.c.essentiel': 'Siempre servido', 'pf.c.lourd': 'En pausa desde mucha afluencia', 'pf.c.secondaire': 'En pausa con carga crítica',
      'pf.l.essentiel': 'Acceso|Estado de la plataforma y de los servicios|Alertas y mensajes oficiales|Enviar una solicitud o un aviso|Notificaciones|Versión sencilla y urgencias|Páginas, estilos y scripts',
      'pf.l.lourd': 'Diagnóstico de sobriedad|Indicadores del panel|Flujo de la API Webcup|Exportaciones y registros',
      'pf.l.secondaire': 'Apoyos|Participación e ideas|Opiniones sobre los servicios|Solicitudes parecidas|Contribuciones|Resúmenes',
      'pf.aucuneDelestee': 'Ninguna solicitud en pausa desde el inicio.', 'pf.chemin': 'Dirección', 'pf.nombre': 'Número',
      'pf.lg.p95': 'Latencia p95 (ms)', 'pf.lg.lag': 'Retraso del bucle p99 (ms)', 'pf.lg.rps': 'Solicitudes por segundo', 'pf.attente': 'Llegan las mediciones…',
      'pf.courbeAlt': 'Curva de los últimos 3 minutos: latencia p95 máxima {p} ms, retraso máximo del bucle {l} ms, caudal máximo {r} solicitudes por segundo.',
      'pf.ok': 'Nivel aplicado: {n}.', 'pf.erreur': 'No se puede leer el estado de la plataforma.' },
    ar: { 'pf.n.normal': 'تشغيل عادي', 'pf.n.forte': 'إقبال كبير', 'pf.n.critique': 'حمل حرج', 'pf.depuis': 'منذ {d}', 'pf.force': 'وضع فرضه {par} حتى {h}', 'pf.autoMesure': 'المستوى المقاس تلقائياً: {n}',
      'pf.k.rps': 'طلبات API في الثانية', 'pf.k.p95': 'زمن الاستجابة p95 (10 ث)', 'pf.k.p95b': 'p50 {a} مللي ث · p99 {b} مللي ث · 60 ث: p95 {c} مللي ث', 'pf.k.lag': 'تأخر حلقة الأحداث (p99)', 'pf.k.lagb': 'الأقصى منذ البدء: {m} مللي ث',
      'pf.k.encours': 'طلبات قيد المعالجة', 'pf.k.encoursb': 'الأقصى: {m} · في الانتظار: {f}', 'pf.k.deleste': 'طلبات موقوفة مؤقتاً', 'pf.k.delesteb': 'طابور ممتلئ: {i} · تجاوز المهلة: {e} · 429: {l}',
      'pf.k.cache': 'قراءات من الذاكرة المؤقتة', 'pf.k.cacheb': '{h} من {t} · {n} مدخلات', 'pf.k.mem': 'الذاكرة', 'pf.k.memb': 'الكومة: {h} م.ب · يعمل منذ {u}', 'pf.k.err': 'أخطاء الخادم (5xx)', 'pf.k.errb': 'دون احتساب الإيقاف المتعمد',
      'pf.c.essentiel': 'يُقدَّم دائماً', 'pf.c.lourd': 'متوقف عند الإقبال الكبير', 'pf.c.secondaire': 'متوقف عند الحمل الحرج',
      'pf.l.essentiel': 'تسجيل الدخول|حالة المنصة والخدمات|التنبيهات والرسائل الرسمية|تقديم طلب أو بلاغ|الإشعارات|النسخة المبسطة والطوارئ|الصفحات والأنماط والبرامج',
      'pf.l.lourd': 'تشخيص الاعتدال|مؤشرات لوحة القيادة|تدفق واجهة Webcup|التصدير والسجلات',
      'pf.l.secondaire': 'الدعم|المشاركة والأفكار|آراء الخدمات|الطلبات المتشابهة|المساهمات|الملخصات',
      'pf.aucuneDelestee': 'لم يُوقف أي طلب منذ البدء.', 'pf.chemin': 'العنوان', 'pf.nombre': 'العدد',
      'pf.lg.p95': 'زمن الاستجابة p95 (مللي ث)', 'pf.lg.lag': 'تأخر الحلقة p99 (مللي ث)', 'pf.lg.rps': 'طلبات في الثانية', 'pf.attente': 'القياسات في الطريق…',
      'pf.courbeAlt': 'منحنى آخر 3 دقائق: أقصى زمن استجابة p95 {p} مللي ث، أقصى تأخر للحلقة {l} مللي ث، أقصى معدل {r} طلب في الثانية.',
      'pf.ok': 'تم تطبيق المستوى: {n}.', 'pf.erreur': 'تعذرت قراءة حالة المنصة.' }
  });

  NT.pret(() => {
    const t = (k, v) => NT.t(k, v);
    const e = s => NT.ui.echap(s);
    const $ = id => document.getElementById(id);
    const admin = NT.auth.aRole('admin');
    if (!admin) { $('pf-form').hidden = true; $('pf-lecture').hidden = false; }
    const duree = s => (s < 3600 ? Math.round(s / 60) + ' min' : Math.floor(s / 3600) + ' h ' + Math.round((s % 3600) / 60) + ' min');

    function courbe(h) {
      if (!h.length) return `<p class="doux">${e(t('pf.attente'))}</p>`;
      const L = 600, H = 160, pad = 28;
      const maxMs = Math.max(100, ...h.map(x => Math.max(x.p95, x.lag)));
      const maxR = Math.max(5, ...h.map(x => x.rps));
      const X = i => pad + (i * (L - pad - 6)) / Math.max(1, h.length - 1);
      const Y = (v, m) => H - 18 - (v / m) * (H - 34);
      const pts = (cle, m) => h.map((x, i) => `${X(i).toFixed(1)},${Y(x[cle], m).toFixed(1)}`).join(' ');
      const aire = `${X(0)},${H - 18} ${pts('rps', maxR)} ${X(h.length - 1)},${H - 18}`;
      const resume = t('pf.courbeAlt', { p: Math.max(...h.map(x => x.p95)), l: Math.max(...h.map(x => x.lag)), r: Math.max(...h.map(x => x.rps)) });
      return `<svg viewBox="0 0 ${L} ${H}" role="img" aria-label="${e(resume)}">
        <line class="axe" x1="${pad}" y1="${H - 18}" x2="${L - 4}" y2="${H - 18}"/><line class="axe" x1="${pad}" y1="10" x2="${pad}" y2="${H - 18}"/>
        <text x="2" y="16">${Math.round(maxMs)}</text><text x="2" y="${H - 20}">0</text><text x="${pad}" y="${H - 4}">−3 min</text><text x="${L - 14}" y="${H - 4}">0</text>
        <polygon class="l-rps" points="${aire}"/><polyline class="l-p95" points="${pts('p95', maxMs)}"/><polyline class="l-lag" points="${pts('lag', maxMs)}"/></svg>
        <ul class="pf-legende"><li><span class="k-p95"></span>${e(t('pf.lg.p95'))}</li><li><span class="k-lag"></span>${e(t('pf.lg.lag'))}</li><li><span class="k-rps"></span>${e(t('pf.lg.rps'))} (max ${maxR})</li></ul>`;
    }
    const kpi = (valeur, unite, lib, sous, fort) => `<div class="kpi pf-kpi${fort ? ' fort' : ''}"><div class="valeur">${e(valeur)}${unite ? `<small>${e(unite)}</small>` : ''}</div><div class="libelle">${e(lib)}<small>${e(sous || '')}</small></div></div>`;

    function rendre(d) {
      $('pf-etat').innerHTML = `<div><h2 id="pf-etat-h"><span class="pf-niveau pf-niveau-${e(d.niveau)}">${e(t('pf.n.' + d.niveau))}</span></h2>
        <p>${e(t('pf.depuis', { d: NT.ui.dateHeure(d.depuis) }))}${d.force && d.forceJusqu ? ' · ' + e(t('pf.force', { par: d.forcePar, h: NT.ui.dateHeure(d.forceJusqu) })) : ''}${d.force ? ' · ' + e(t('pf.autoMesure', { n: t('pf.n.' + d.auto) })) : ''}</p></div>`;
      const l = d.latence.s10, l60 = d.latence.s60;
      $('pf-kpis').innerHTML = [
        kpi(d.requetes.parSeconde, '/s', t('pf.k.rps'), ''),
        kpi(l.p95, 'ms', t('pf.k.p95'), t('pf.k.p95b', { a: l.p50, b: l.p99, c: l60.p95 }), l.p95 >= 800),
        kpi(d.boucle.p99, 'ms', t('pf.k.lag'), t('pf.k.lagb', { m: d.boucle.maxDepuisDemarrage }), d.boucle.p99 >= d.seuils.lagForte),
        kpi(d.enCours, '', t('pf.k.encours'), t('pf.k.encoursb', { m: d.enCoursMax, f: d.file })),
        kpi(d.delestees, '', t('pf.k.deleste'), t('pf.k.delesteb', { i: d.refusIp, e: d.expirees, l: d.limitees429 })),
        kpi(d.cache.taux, '%', t('pf.k.cache'), t('pf.k.cacheb', { h: d.cache.hits, t: d.cache.hits + d.cache.miss, n: d.cache.entrees })),
        kpi(d.memoire.rssMo, 'Mo', t('pf.k.mem'), t('pf.k.memb', { h: d.memoire.tasMo, u: duree(d.depuisDemarrage) })),
        kpi(d.erreurs5xx, '', t('pf.k.err'), t('pf.k.errb'))
      ].join('');
      $('pf-courbe').innerHTML = courbe(d.historique || []);
      $('pf-chemins').innerHTML = d.parChemin.length ? `<div class="table-defile"><table class="table-sec"><thead><tr><th scope="col">${e(t('pf.chemin'))}</th><th scope="col">${e(t('pf.nombre'))}</th></tr></thead>
        <tbody>${d.parChemin.map(c => `<tr><td><code>${e(c.chemin)}</code></td><td>${e(c.n)}</td></tr>`).join('')}</tbody></table></div>` : `<p class="doux">${e(t('pf.aucuneDelestee'))}</p>`;
      if (admin && !document.activeElement.closest('#pf-form')) {
        const mode = d.force ? d.niveau : 'auto';
        const r = document.querySelector(`input[name="pf-mode"][value="${mode}"]`); if (r) r.checked = true;
      }
    }
    $('pf-classes').innerHTML = [['essentiel', 'ph-shield-check'], ['lourd', 'ph-pause-circle'], ['secondaire', 'ph-hourglass-medium']].map(([c, ic]) =>
      `<div class="carte c-${c}"><h3><i class="ph-duotone ${ic}" aria-hidden="true"></i>${e(t('pf.c.' + c))}</h3><ul>${t('pf.l.' + c).split('|').map(x => `<li>${e(x)}</li>`).join('')}</ul></div>`).join('');

    let minuterie = null;
    function charger() {
      clearTimeout(minuterie);
      fetch('/api/charge/details', { cache: 'no-store', credentials: 'same-origin' }).then(r => (r.ok ? r.json() : Promise.reject(r.status)))
        .then(rendre).catch(() => { $('pf-etat').innerHTML = `<p class="erreur">${e(t('pf.erreur'))}</p>`; })
        .finally(() => { minuterie = setTimeout(charger, document.hidden ? 15000 : 5000); });
    }
    charger();

    $('pf-form').addEventListener('submit', ev => {
      ev.preventDefault();
      const mode = (document.querySelector('input[name="pf-mode"]:checked') || {}).value || 'auto';
      const r = NT.api('POST', '/api/charge/forcer', { mode, minutes: Number($('pf-minutes').value), motif: $('pf-motif').value.trim() });
      const err = $('pf-erreur');
      if (r.statut !== 200) { err.textContent = (r.donnees && r.donnees.erreur) || t('pf.erreur'); err.hidden = false; return; }
      err.hidden = true;
      NT.charge.observer(200, r.donnees.niveau);
      rendre(r.donnees);
      NT.ui.toast(t('pf.ok', { n: t('pf.n.' + r.donnees.niveau) }), 'success');
    });
  });
})();
