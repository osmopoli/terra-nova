/* F57 — sobriété numérique : chiffres du serveur (/api/sobriete) + mesures du navigateur (Performance API). */
(function () {
  'use strict';
  const NT = window.NT;
  NT.i18n.ajouter({
    fr: {},
    en: {
      'sob.titre': 'Digital sobriety', 'sob.sous': 'A website uses energy every time it is visited. Here is what Terra Nova weighs, what that means in CO2, and what we did to make it lighter without removing the essentials.',
      'sob.chiffres': 'The home page in 4 numbers', 'sob.chiffresD': 'For a first visit, with nothing stored in your browser.',
      'sob.cPoids': 'of data transferred', 'sob.cRequetes': 'files requested (requests)', 'sob.cCo2': 'of CO2 estimated per visit', 'sob.cNote': 'grade from A (very light) to G (very heavy)',
      'sob.erreur': 'The assessment could not be loaded. Please try again in a moment.',
      'sob.methode': 'How it is calculated',
      'sob.m1': 'Weight and number of files: the server reads the files actually sent (text compressed with Brotli, images as they are).',
      'sob.m2': 'Fonts and icons hosted elsewhere: a fixed estimate, because they cannot be weighed from the server.',
      'sob.m3': 'CO2: the “Sustainable Web Design” model, which counts 0.81 kWh of electricity per GB transferred and 442 g of CO2 per kWh (world average), about 0.36 g of CO2 per MB. It is an order of magnitude, not an exact measure.',
      'sob.m4': 'Grade: our own calculation inspired by EcoIndex, based on weight and number of requests. It is not the official EcoIndex grade.',
      'sob.pages': 'The main pages', 'sob.pagesCap': 'Estimated weight, number of requests and grade of each main page, on first load',
      'sob.tPage': 'Page', 'sob.tPoids': 'Weight (KB)', 'sob.tReq': 'Requests', 'sob.tNote': 'Grade', 'sob.chargement': 'Loading…',
      'sob.resume': 'Average over {n} pages: {poids} KB, {req} requests, about {co2} g of CO2 per visit, grade {note}.',
      'sob.note.bon': 'light', 'sob.note.moyen': 'average', 'sob.note.mauvais': 'heavy', 'sob.noteDe': 'Grade {n}, {mot}',
      'sob.visite': 'Measured on this visit', 'sob.visiteD': 'These figures come from your browser, for the page you are reading now.',
      'sob.vPoids': 'Data transferred', 'sob.vReq': 'Files loaded', 'sob.vDom': 'Page readable after', 'sob.vLoad': 'Fully loaded after',
      'sob.cache': 'A page you have already visited is lighter: your browser keeps the files that do not change and does not download them again. Reload this page to compare.',
      'sob.depuisCache': 'from memory', 'sob.nonDispo': 'not available',
      'sob.faits': 'What we did to make the platform lighter',
      'sob.f1': 'Home image re-encoded in WebP in 3 sizes (480, 800 and 1280 px) with srcset: the browser picks the right one, from 416 KB down to just 18 to 149 KB.',
      'sob.f2': 'Logo emblem: from 126 KB to 3 KB.', 'sob.f3': '6 unused images and scripts removed.',
      'sob.f4': 'Text files compressed (Brotli or gzip) and kept in memory by the browser.',
      'sob.f5': 'Fonts loaded without blocking display, and not loaded at all in light mode.',
      'sob.f6': '“Slow connection mode”: no decorative images or animations, system fonts, live updates every 2 minutes instead of 30 seconds. It is offered automatically when the browser reports a slow connection or data saver.',
      'sob.f7': 'Live updates paused when the tab is hidden.', 'sob.f8': 'Server responses (page data) compressed, and unchanged files never sent again: the browser reuses its copy.',
      'sob.gestes': 'What you can do',
      'sob.g1': 'Prefer Wi-Fi to 4G or 5G when you can: for the same data, it uses less energy.',
      'sob.g2': 'Bookmark the pages you use often rather than searching for them each time.', 'sob.g3': 'Close the tabs you are no longer reading.',
      'sob.p.index.html': 'Home', 'sob.p.services.html': 'Services', 'sob.p.carte.html': 'Map', 'sob.p.annonces.html': 'Announcements', 'sob.p.demande.html': 'Make a request', 'sob.p.connexion.html': 'Log in', 'sob.p.espace.html': 'My space', 'sob.p.agent.html': 'Agent space', 'sob.p.transports.html': 'Transport',
      'sob.reglage': 'To turn on “Slow connection mode” at any time, open the ♿ (accessibility) panel in the header of any page.'
    },
    es: {
      'sob.titre': 'Sobriedad digital', 'sob.sous': 'Un sitio web consume energía en cada visita. Esto es lo que pesa Terra Nova, lo que representa en CO2 y lo que hicimos para aligerarlo sin quitar lo esencial.',
      'sob.chiffres': 'La página de inicio en 4 cifras', 'sob.chiffresD': 'Para una primera visita, sin nada guardado en su navegador.',
      'sob.cPoids': 'de datos transferidos', 'sob.cRequetes': 'archivos solicitados (peticiones)', 'sob.cCo2': 'de CO2 estimado por visita', 'sob.cNote': 'nota de A (muy ligero) a G (muy pesado)',
      'sob.erreur': 'No se pudo cargar el diagnóstico. Vuelva a intentarlo en un momento.',
      'sob.methode': 'Cómo se calcula',
      'sob.m1': 'Peso y número de archivos: el servidor lee los archivos realmente enviados (texto comprimido con Brotli, imágenes tal cual).',
      'sob.m2': 'Fuentes e iconos alojados en otro sitio: una estimación fija, porque no se pueden pesar desde el servidor.',
      'sob.m3': 'CO2: modelo «Sustainable Web Design», que cuenta 0,81 kWh de electricidad por GB transferido y 442 g de CO2 por kWh (media mundial), unos 0,36 g de CO2 por MB. Es un orden de magnitud, no una medida exacta.',
      'sob.m4': 'Nota: cálculo propio inspirado en EcoIndex a partir del peso y del número de peticiones. No es la nota oficial de EcoIndex.',
      'sob.pages': 'Las páginas principales', 'sob.pagesCap': 'Peso estimado, número de peticiones y nota de cada página principal, en la primera carga',
      'sob.tPage': 'Página', 'sob.tPoids': 'Peso (KB)', 'sob.tReq': 'Peticiones', 'sob.tNote': 'Nota', 'sob.chargement': 'Cargando…',
      'sob.resume': 'Media sobre {n} páginas: {poids} KB, {req} peticiones, unos {co2} g de CO2 por visita, nota {note}.',
      'sob.note.bon': 'ligera', 'sob.note.moyen': 'media', 'sob.note.mauvais': 'pesada', 'sob.noteDe': 'Nota {n}, {mot}',
      'sob.visite': 'Medido en esta visita', 'sob.visiteD': 'Estas cifras vienen de su navegador, para la página que está leyendo ahora.',
      'sob.vPoids': 'Datos transferidos', 'sob.vReq': 'Archivos cargados', 'sob.vDom': 'Página legible tras', 'sob.vLoad': 'Carga completa tras',
      'sob.cache': 'Una página ya visitada es más ligera: su navegador guarda en memoria los archivos que no cambian y no los vuelve a descargar. Recargue esta página para comparar.',
      'sob.depuisCache': 'desde la memoria', 'sob.nonDispo': 'no disponible', 'sob.unKo': 'KB',
      'sob.faits': 'Lo que hicimos para aligerar la plataforma',
      'sob.f1': 'Imagen de inicio recodificada en WebP en 3 tamaños (480, 800 y 1280 px) con srcset: el navegador elige la adecuada, de 416 KB a solo 18–149 KB.',
      'sob.f2': 'Emblema del logotipo: de 126 KB a 3 KB.', 'sob.f3': '6 imágenes y scripts sin usar eliminados.',
      'sob.f4': 'Archivos de texto comprimidos (Brotli o gzip) y guardados en memoria por el navegador.',
      'sob.f5': 'Fuentes cargadas sin bloquear la visualización, y no cargadas en modo ligero.',
      'sob.f6': '«Modo conexión lenta»: sin imágenes decorativas ni animaciones, fuentes del sistema, actualizaciones en directo cada 2 minutos en vez de 30 segundos. Se propone automáticamente cuando el navegador indica una conexión lenta o el ahorro de datos.',
      'sob.f7': 'Actualizaciones en directo en pausa cuando la pestaña está oculta.', 'sob.f8': 'Respuestas del servidor (datos de las páginas) comprimidas, y archivos sin cambios nunca reenviados: el navegador reutiliza su copia.',
      'sob.gestes': 'Sus gestos',
      'sob.g1': 'Prefiera el Wi-Fi al 4G o 5G cuando pueda: a datos iguales, consume menos energía.',
      'sob.g2': 'Guarde en favoritos las páginas que usa a menudo en lugar de buscarlas cada vez.', 'sob.g3': 'Cierre las pestañas que ya no lee.',
      'sob.p.index.html': 'Inicio', 'sob.p.services.html': 'Servicios', 'sob.p.carte.html': 'Mapa', 'sob.p.annonces.html': 'Anuncios', 'sob.p.demande.html': 'Hacer una solicitud', 'sob.p.connexion.html': 'Iniciar sesión', 'sob.p.espace.html': 'Mi espacio', 'sob.p.agent.html': 'Espacio agentes', 'sob.p.transports.html': 'Transporte',
      'sob.reglage': 'Para activar el «Modo conexión lenta» en cualquier momento, abra el panel ♿ (accesibilidad) en la cabecera de cualquier página.'
    },
    ar: {
      'sob.titre': 'الاعتدال الرقمي', 'sob.sous': 'يستهلك الموقع الإلكتروني طاقة عند كل زيارة. إليك ما يزنه تيرا نوفا، وما يعادله من CO2، وما فعلناه لتخفيفه دون حذف الأساسيات.',
      'sob.chiffres': 'الصفحة الرئيسية في 4 أرقام', 'sob.chiffresD': 'لزيارة أولى، دون أي شيء محفوظ في متصفحك.',
      'sob.cPoids': 'من البيانات المنقولة', 'sob.cRequetes': 'ملفات مطلوبة (طلبات)', 'sob.cCo2': 'من CO2 تقديراً لكل زيارة', 'sob.cNote': 'تقييم من A (خفيف جداً) إلى G (ثقيل جداً)',
      'sob.erreur': 'تعذّر تحميل التشخيص. أعد المحاولة بعد قليل.',
      'sob.methode': 'كيف يُحسب',
      'sob.m1': 'الوزن وعدد الملفات: يقرأ الخادم الملفات المرسلة فعلاً (نص مضغوط بـ Brotli، والصور كما هي).',
      'sob.m2': 'الخطوط والأيقونات المستضافة في مكان آخر: تقدير ثابت، لأنه لا يمكن وزنها من الخادم.',
      'sob.m3': 'CO2: نموذج «Sustainable Web Design» الذي يحتسب 0.81 كيلوواط ساعة من الكهرباء لكل جيجابايت منقول و442 غ من CO2 لكل كيلوواط ساعة (المعدل العالمي)، أي نحو 0.36 غ من CO2 لكل ميغابايت. إنه ترتيب حجم، لا قياس دقيق.',
      'sob.m4': 'التقييم: حساب خاص مستوحى من EcoIndex انطلاقاً من الوزن وعدد الطلبات. ليس تقييم EcoIndex الرسمي.',
      'sob.pages': 'الصفحات الرئيسية', 'sob.pagesCap': 'الوزن التقديري وعدد الطلبات وتقييم كل صفحة رئيسية عند التحميل الأول',
      'sob.tPage': 'الصفحة', 'sob.tPoids': 'الوزن (ك.ب)', 'sob.tReq': 'الطلبات', 'sob.tNote': 'التقييم', 'sob.chargement': 'جارٍ التحميل…',
      'sob.resume': 'المعدل على {n} صفحات: {poids} ك.ب، {req} طلبات، نحو {co2} غ من CO2 لكل زيارة، التقييم {note}.',
      'sob.note.bon': 'خفيفة', 'sob.note.moyen': 'متوسطة', 'sob.note.mauvais': 'ثقيلة', 'sob.noteDe': 'التقييم {n}، {mot}',
      'sob.visite': 'قياس هذه الزيارة', 'sob.visiteD': 'تأتي هذه الأرقام من متصفحك، للصفحة التي تقرأها الآن.',
      'sob.vPoids': 'البيانات المنقولة', 'sob.vReq': 'الملفات المحمّلة', 'sob.vDom': 'الصفحة قابلة للقراءة بعد', 'sob.vLoad': 'اكتمال التحميل بعد',
      'sob.cache': 'الصفحة التي زرتها من قبل أخف: يحتفظ متصفحك بالملفات التي لا تتغير ولا يعيد تنزيلها. أعد تحميل هذه الصفحة للمقارنة.',
      'sob.depuisCache': 'من الذاكرة', 'sob.nonDispo': 'غير متاح', 'sob.unKo': 'ك.ب',
      'sob.faits': 'ما فعلناه لتخفيف المنصة',
      'sob.f1': 'أعيد ترميز صورة الاستقبال بصيغة WebP في 3 أحجام (480 و800 و1280 بكسل) مع srcset: يختار المتصفح الحجم المناسب، من 416 ك.ب إلى 18–149 ك.ب فقط.',
      'sob.f2': 'شعار الموقع: من 126 ك.ب إلى 3 ك.ب.', 'sob.f3': 'حذف 6 صور وبرامج نصية غير مستعملة.',
      'sob.f4': 'ملفات نصية مضغوطة (Brotli أو gzip) يحتفظ بها المتصفح في الذاكرة.',
      'sob.f5': 'خطوط تُحمّل دون تعطيل العرض، ولا تُحمّل إطلاقاً في الوضع الخفيف.',
      'sob.f6': '«وضع الاتصال البطيء»: لا صور زخرفية ولا حركة، خطوط النظام، تحديث مباشر كل دقيقتين بدلاً من 30 ثانية. يُقترح تلقائياً عندما يبلّغ المتصفح عن اتصال بطيء أو توفير البيانات.',
      'sob.f7': 'إيقاف التحديثات المباشرة مؤقتاً عندما تكون علامة التبويب مخفية.', 'sob.f8': 'ردود الخادم (بيانات الصفحات) مضغوطة، والملفات غير المتغيرة لا تُرسل مجدداً: يعيد المتصفح استخدام نسخته.',
      'sob.gestes': 'ما يمكنك فعله',
      'sob.g1': 'فضّل الواي فاي على 4G أو 5G عندما تستطيع: بالبيانات نفسها يستهلك طاقة أقل.',
      'sob.g2': 'احفظ الصفحات التي تستخدمها كثيراً في المفضلة بدل البحث عنها كل مرة.', 'sob.g3': 'أغلق علامات التبويب التي لم تعد تقرأها.',
      'sob.p.index.html': 'الرئيسية', 'sob.p.services.html': 'الخدمات', 'sob.p.carte.html': 'الخريطة', 'sob.p.annonces.html': 'الإعلانات', 'sob.p.demande.html': 'تقديم طلب', 'sob.p.connexion.html': 'تسجيل الدخول', 'sob.p.espace.html': 'فضائي', 'sob.p.agent.html': 'فضاء الأعوان', 'sob.p.transports.html': 'النقل',
      'sob.reglage': 'لتفعيل «وضع الاتصال البطيء» في أي وقت، افتح لوحة ♿ (إمكانية الوصول) في رأس أي صفحة.'
    }
  });
  const L = (cle, fr, vars) => NT.t(cle, vars, fr);
  const E = s => NT.ui.echap(s);
  const $ = (sel, r) => (r || document).querySelector(sel);
  const LIEUX = { 'index.html': 'Accueil', 'services.html': 'Services', 'carte.html': 'Carte', 'annonces.html': 'Annonces', 'demande.html': 'Faire une demande',
    'connexion.html': 'Connexion', 'espace.html': 'Mon espace', 'agent.html': 'Espace agent', 'transports.html': 'Transports' };
  const nf = n => new Intl.NumberFormat(NT.i18n.langue).format(n);
  const nf2 = n => new Intl.NumberFormat(NT.i18n.langue, { maximumFractionDigits: 2 }).format(n);
  const ko = octets => nf(Math.round(octets / 1024)) + ' ' + L('sob.unKo', 'Ko');
  const ms = v => v >= 1000 ? nf2(v / 1000) + ' s' : nf(Math.round(v)) + ' ms';
  const classeNote = n => 'ABC'.includes(n) ? 'bon' : 'DE'.includes(n) ? 'moyen' : 'mauvais';
  const motNote = n => ({ bon: L('sob.note.bon', 'sobre'), moyen: L('sob.note.moyen', 'moyen'), mauvais: L('sob.note.mauvais', 'lourd') })[classeNote(n)];
  const fixer = (zone, cle, txt) => { const el = $('[data-k="' + cle + '"]', zone); if (el) el.textContent = txt; };

  NT.i18n.ajouter({ fr: {}, en: { 'sob.unKo': 'KB' }, es: {}, ar: {} });
  NT.i18n.ajouter({ fr: { 'sob.note.bon': 'sobre', 'sob.note.moyen': 'moyen', 'sob.note.mauvais': 'lourd', 'sob.noteDe': 'Note {n}, {mot}',
    'sob.resume': 'Moyenne sur {n} pages : {poids} Ko, {req} requêtes, environ {co2} g de CO2 par visite, note {note}.',
    'sob.depuisCache': 'depuis la mémoire', 'sob.nonDispo': 'non disponible', 'sob.unKo': 'Ko' } });

  const noteHtml = n => `<span class="note note-${classeNote(n)}"><b aria-hidden="true">${E(n)}</b><span>${E(L('sob.noteDe', 'Note {n}, {mot}', { n, mot: motNote(n) }))}</span></span>`;

  /* ---------- Chiffres du serveur ---------- */
  function afficherServeur(d) {
    const zone = $('#chiffres');
    const a = d.accueil;
    fixer(zone, 'poids', ko(a.poidsKo * 1024));
    fixer(zone, 'requetes', nf(a.requetes));
    fixer(zone, 'co2', nf2(a.co2G) + ' g');
    fixer(zone, 'note', a.note);
    const maxKo = Math.max.apply(null, d.pages.map(p => p.poidsTotalKo));
    $('#corps-pages').innerHTML = d.pages.map(p => `<tr>
      <th scope="row">${E(L('sob.p.' + p.page, LIEUX[p.page] || p.page))}</th>
      <td class="num">${E(nf(p.poidsTotalKo))}<span class="barre" aria-hidden="true"><i style="width:${Math.max(4, Math.round(p.poidsTotalKo / maxKo * 100))}%"></i></span></td>
      <td class="num">${E(nf(p.requetes))}</td>
      <td>${noteHtml(p.note)}</td></tr>`).join('');
    const r = d.resume;
    $('#resume-pages').textContent = L('sob.resume', 'Moyenne sur {n} pages : {poids} Ko, {req} requêtes, environ {co2} g de CO2 par visite, note {note}.',
      { n: r.pages, poids: nf(r.poidsMoyenKo), req: nf(r.requetesMoyennes), co2: nf2(r.co2MoyenG), note: r.note });
  }

  /* ---------- Mesures du navigateur (Performance API) ---------- */
  function mesurerVisite() {
    const zone = $('#mesures');
    const nav = performance.getEntriesByType('navigation')[0];
    const res = performance.getEntriesByType('resource');
    const absent = L('sob.nonDispo', 'non disponible');
    let octets = (nav && nav.transferSize) || 0;
    let nbCache = nav && nav.transferSize === 0 ? 1 : 0;
    res.forEach(r => { octets += r.transferSize || 0; if (r.transferSize === 0) nbCache++; });
    // Les ressources d'autres sites sans en-tête Timing-Allow-Origin déclarent 0 : on le dit plutôt que de le cacher.
    const total = res.length + (nav ? 1 : 0);
    fixer(zone, 'poids', nav ? ko(octets) : absent);
    fixer(zone, 'req', nav ? nf(total) + (nbCache ? ' (' + nf(nbCache) + ' ' + L('sob.depuisCache', 'depuis la mémoire') + ')' : '') : absent);
    fixer(zone, 'dom', nav && nav.domContentLoadedEventEnd ? ms(nav.domContentLoadedEventEnd) : absent);
    fixer(zone, 'load', nav && nav.loadEventEnd ? ms(nav.loadEventEnd) : absent);
  }

  NT.pret(() => {
    // Les mesures utilisent loadEventEnd : on attend la fin du chargement.
    const lancer = () => setTimeout(mesurerVisite, 0);
    if (document.readyState === 'complete') lancer(); else window.addEventListener('load', lancer);
    fetch('/api/sobriete').then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(afficherServeur)
      .catch(() => {
        $('#erreur-sob').hidden = false;
        $('#corps-pages').innerHTML = '';
        $('#chiffres').querySelectorAll('[data-k]').forEach(el => { el.textContent = '—'; });
      });
  });
})();
