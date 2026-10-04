/* Terra Nova — vague 20 (F97, Service Mobilité) : lignes interrompues sur la page Transports.
   Chargé avant transports.js. Lit GET /api/mobilite (état du réseau, interruptions, solutions calculées par le serveur) et :
   - remplace l'« Info trafic » par une carte claire par ligne interrompue (« Ligne N4 interrompue jusqu'à 18 h »), les
     meilleures solutions classées par temps perdu, ce qu'il faut faire à chaque arrêt non desservi, « Me prévenir » ;
   - ajoute « Itinéraire de remplacement » : départ et arrivée (arrêt ou quartier) → trajet qui évite les lignes interrompues ;
   - fournit à transports.js (« Mon trajet », horaires) les tronçons coupés : NT.mobilite.coupe(), NT.mobilite.arretFerme(). */
(function () {
  'use strict';
  const NT = window.NT;
  if (!NT || NT.mobilite) return;

  NT.i18n.ajouter({
    fr: {
      'mb.resume0': 'Toutes les lignes circulent normalement.', 'mb.resumeN': '{n} ligne(s) perturbée(s), {m} ligne(s) normale(s).',
      'mb.titre': 'Ligne {l} interrompue jusqu’à {fin}', 'mb.titreSans': 'Ligne {l} interrompue jusqu’à nouvel ordre', 'mb.titreProg': 'Ligne {l} : interruption prévue à partir de {debut}',
      'mb.entre': 'Entre {a} et {b}', 'mb.toute': 'Toute la ligne', 'mb.nonDesservis': 'Arrêts non desservis : {l}', 'mb.pourquoi': 'Pourquoi', 'mb.precision': 'Précision de la ville',
      'mb.m.travaux': 'Travaux sur la voie', 'mb.m.panne': 'Navette en panne', 'mb.m.meteo': 'Conditions météo', 'mb.m.evenement': 'Événement dans la ville', 'mb.m.securite': 'Raison de sécurité', 'mb.m.autre': 'Interruption de service',
      'mb.quoiFaire': 'Que faire ? Les meilleures solutions', 'mb.pourAller': 'Pour aller de {a} à {b} (habituellement {n} min) :', 'mb.aussiRapide': 'Aussi rapide', 'mb.perte': '+{n} min', 'mb.duree': 'environ {n} min',
      'mb.o.relais.bus-relais': 'Bus-relais toutes les {f} min', 'mb.o.relais.navette': 'Navette de remplacement toutes les {f} min', 'mb.o.arretsRelais': 'Arrêts desservis : {l}',
      'mb.o.autres': 'Prenez une autre ligne', 'mb.o.marche': 'À pied', 'mb.o.marcheD': 'environ {n} min de marche ({km})',
      'mb.o.velo': 'Vélo en libre-service', 'mb.o.trott': 'Vélo ou trottinette en libre-service', 'mb.o.veloD': 'De la station {a} à la station {b}',
      'mb.o.tad': 'Mobilité réduite : transport à la demande', 'mb.o.tadD': 'Réservez au {tel}, {n} min à l’avance ({h}). Un véhicule adapté vient vous chercher.',
      'mb.e.ligne': 'Ligne {l} de {a} à {b}', 'mb.e.ligneD': '{n} arrêt(s), {m} min — passage toutes les {f} min', 'mb.e.marche': 'À pied de {a} à {b}', 'mb.e.marcheD': '{n} min',
      'mb.e.relais': '{t} (remplace la ligne {l}) de {a} à {b}', 'mb.t.bus-relais': 'Bus-relais', 'mb.t.navette': 'Navette de remplacement',
      'mb.parArret': 'Vous êtes à un arrêt non desservi ?', 'mb.arret': 'Arrêt {a}', 'mb.a.autres': 'Prenez la ligne {l} au même arrêt.', 'mb.a.relais': 'Le remplacement s’arrête ici.',
      'mb.a.proche': 'Marchez {n} min jusqu’à {a} (ligne {l}).', 'mb.a.station': 'Vélos en libre-service : {s}.', 'mb.quartiers': 'Quartiers aussi desservis par d’autres lignes',
      'mb.q.lignes': 'Quartier {q} : ligne(s) {l}', 'mb.q.aucune': 'Quartier {q} : pas d’autre ligne, voir les solutions ci-dessus.',
      'mb.itineraireBtn': 'Itinéraire de remplacement', 'mb.suivre': 'Me prévenir pour la ligne {l}', 'mb.suivi': 'Vous êtes prévenu pour la ligne {l}', 'mb.suiviOk': 'C’est noté : vous serez prévenu quand la ligne {l} est interrompue ou rétablie.',
      'mb.suiviStop': 'Vous ne serez plus prévenu pour la ligne {l}.', 'mb.connexion': 'Connectez-vous pour être prévenu', 'mb.maj': 'Mis à jour {d}',
      'mb.h.remplacement': 'Itinéraire de remplacement', 'mb.remplacementD': 'Choisissez d’où vous partez et où vous allez (un arrêt ou un quartier) : le trajet évite les lignes interrompues.',
      'mb.de': 'Je pars de', 'mb.vers': 'Je vais à', 'mb.choisir': 'Choisir', 'mb.gQuartiers': 'Tout un quartier', 'mb.quartier': 'Quartier {q} (le meilleur arrêt)', 'mb.gArrets': 'Arrêts du quartier {q}',
      'mb.chercher': 'Trouver un itinéraire', 'mb.r.rapide': 'Le plus rapide', 'mb.r.moinsMarche': 'Avec moins de marche', 'mb.r.duree': 'Durée estimée : {n} min (attente comprise)', 'mb.r.corresp': '{n} correspondance(s)',
      'mb.r.direct': 'Sans correspondance', 'mb.r.habituel': 'Habituellement : {n} min.', 'mb.r.evite': 'Ce trajet évite la ligne {l}, interrompue.', 'mb.r.normal': 'Aucune ligne interrompue sur ce trajet.',
      'mb.r.meme': 'Départ et arrivée sont dans le même quartier : quelques minutes à pied suffisent.', 'mb.r.aucun': 'Aucun itinéraire trouvé. Appelez le transport à la demande au {tel}.',
      'mb.r.acces': 'Comptez aussi quelques minutes à pied pour rejoindre l’arrêt.', 'mb.h.suivre': 'Être prévenu', 'mb.suivreD': 'Choisissez vos lignes : vous recevez un message (cloche et tiroir « Alertes ») quand elles sont interrompues puis rétablies.',
      'mb.l.normal': 'Circulation normale', 'mb.l.partielle': 'Interrompue en partie', 'mb.l.interrompue': 'Interrompue', 'mb.trajetCoupe': 'Une ligne de ce trajet est interrompue : voici le trajet qui l’évite.', 'mb.voirRemplacement': 'Voir l’itinéraire de remplacement',
      'mb.pasDautre': 'Cette ligne est interrompue sur ce trajet.'
    },
    en: {
      'mb.resume0': 'All lines are running normally.', 'mb.resumeN': '{n} line(s) disrupted, {m} line(s) normal.',
      'mb.titre': 'Line {l} interrupted until {fin}', 'mb.titreSans': 'Line {l} interrupted until further notice', 'mb.titreProg': 'Line {l}: interruption planned from {debut}',
      'mb.entre': 'Between {a} and {b}', 'mb.toute': 'The whole line', 'mb.nonDesservis': 'Stops not served: {l}', 'mb.pourquoi': 'Why', 'mb.precision': 'Details from the city',
      'mb.m.travaux': 'Track works', 'mb.m.panne': 'Shuttle breakdown', 'mb.m.meteo': 'Weather conditions', 'mb.m.evenement': 'Event in the city', 'mb.m.securite': 'Safety reasons', 'mb.m.autre': 'Service interruption',
      'mb.quoiFaire': 'What to do? The best options', 'mb.pourAller': 'To go from {a} to {b} (usually {n} min):', 'mb.aussiRapide': 'Just as fast', 'mb.perte': '+{n} min', 'mb.duree': 'about {n} min',
      'mb.o.relais.bus-relais': 'Relay bus every {f} min', 'mb.o.relais.navette': 'Replacement shuttle every {f} min', 'mb.o.arretsRelais': 'Stops served: {l}',
      'mb.o.autres': 'Take another line', 'mb.o.marche': 'On foot', 'mb.o.marcheD': 'about {n} min walk ({km})',
      'mb.o.velo': 'Self-service bike', 'mb.o.trott': 'Self-service bike or scooter', 'mb.o.veloD': 'From {a} station to {b} station',
      'mb.o.tad': 'Reduced mobility: on-demand transport', 'mb.o.tadD': 'Book on {tel}, {n} min in advance ({h}). An adapted vehicle picks you up.',
      'mb.e.ligne': 'Line {l} from {a} to {b}', 'mb.e.ligneD': '{n} stop(s), {m} min — every {f} min', 'mb.e.marche': 'Walk from {a} to {b}', 'mb.e.marcheD': '{n} min',
      'mb.e.relais': '{t} (replaces line {l}) from {a} to {b}', 'mb.t.bus-relais': 'Relay bus', 'mb.t.navette': 'Replacement shuttle',
      'mb.parArret': 'Are you at a stop that is not served?', 'mb.arret': '{a} stop', 'mb.a.autres': 'Take line {l} at the same stop.', 'mb.a.relais': 'The replacement stops here.',
      'mb.a.proche': 'Walk {n} min to {a} (line {l}).', 'mb.a.station': 'Self-service bikes: {s}.', 'mb.quartiers': 'Districts also served by other lines',
      'mb.q.lignes': '{q} district: line(s) {l}', 'mb.q.aucune': '{q} district: no other line, see the options above.',
      'mb.itineraireBtn': 'Replacement route', 'mb.suivre': 'Notify me about line {l}', 'mb.suivi': 'You are notified about line {l}', 'mb.suiviOk': 'Noted: you will be notified when line {l} is interrupted or restored.',
      'mb.suiviStop': 'You will no longer be notified about line {l}.', 'mb.connexion': 'Sign in to be notified', 'mb.maj': 'Updated {d}',
      'mb.h.remplacement': 'Replacement route', 'mb.remplacementD': 'Choose where you start and where you are going (a stop or a district): the route avoids interrupted lines.',
      'mb.de': 'I start from', 'mb.vers': 'I am going to', 'mb.choisir': 'Choose', 'mb.gQuartiers': 'A whole district', 'mb.quartier': '{q} district (best stop)', 'mb.gArrets': '{q} district stops',
      'mb.chercher': 'Find a route', 'mb.r.rapide': 'Fastest', 'mb.r.moinsMarche': 'Less walking', 'mb.r.duree': 'Estimated time: {n} min (waiting included)', 'mb.r.corresp': '{n} change(s)',
      'mb.r.direct': 'No change', 'mb.r.habituel': 'Usually: {n} min.', 'mb.r.evite': 'This route avoids line {l}, which is interrupted.', 'mb.r.normal': 'No interrupted line on this route.',
      'mb.r.meme': 'Start and destination are in the same district: a few minutes on foot are enough.', 'mb.r.aucun': 'No route found. Call on-demand transport on {tel}.',
      'mb.r.acces': 'Allow a few extra minutes on foot to reach the stop.', 'mb.h.suivre': 'Get notified', 'mb.suivreD': 'Choose your lines: you get a message (bell and “Alerts” drawer) when they are interrupted and restored.',
      'mb.l.normal': 'Running normally', 'mb.l.partielle': 'Partly interrupted', 'mb.l.interrompue': 'Interrupted', 'mb.trajetCoupe': 'A line on this trip is interrupted: here is the route that avoids it.', 'mb.voirRemplacement': 'See the replacement route',
      'mb.pasDautre': 'This line is interrupted on this trip.'
    },
    es: {
      'mb.resume0': 'Todas las líneas circulan con normalidad.', 'mb.resumeN': '{n} línea(s) con incidencias, {m} línea(s) normal(es).',
      'mb.titre': 'Línea {l} interrumpida hasta {fin}', 'mb.titreSans': 'Línea {l} interrumpida hasta nuevo aviso', 'mb.titreProg': 'Línea {l}: interrupción prevista a partir de {debut}',
      'mb.entre': 'Entre {a} y {b}', 'mb.toute': 'Toda la línea', 'mb.nonDesservis': 'Paradas sin servicio: {l}', 'mb.pourquoi': 'Por qué', 'mb.precision': 'Detalle del ayuntamiento',
      'mb.m.travaux': 'Obras en la vía', 'mb.m.panne': 'Lanzadera averiada', 'mb.m.meteo': 'Condiciones meteorológicas', 'mb.m.evenement': 'Evento en la ciudad', 'mb.m.securite': 'Motivo de seguridad', 'mb.m.autre': 'Interrupción del servicio',
      'mb.quoiFaire': '¿Qué hacer? Las mejores soluciones', 'mb.pourAller': 'Para ir de {a} a {b} (normalmente {n} min):', 'mb.aussiRapide': 'Igual de rápido', 'mb.perte': '+{n} min', 'mb.duree': 'unos {n} min',
      'mb.o.relais.bus-relais': 'Autobús de relevo cada {f} min', 'mb.o.relais.navette': 'Lanzadera de sustitución cada {f} min', 'mb.o.arretsRelais': 'Paradas: {l}',
      'mb.o.autres': 'Tome otra línea', 'mb.o.marche': 'A pie', 'mb.o.marcheD': 'unos {n} min a pie ({km})',
      'mb.o.velo': 'Bicicleta compartida', 'mb.o.trott': 'Bicicleta o patinete compartido', 'mb.o.veloD': 'De la estación {a} a la estación {b}',
      'mb.o.tad': 'Movilidad reducida: transporte a demanda', 'mb.o.tadD': 'Reserve en el {tel}, con {n} min de antelación ({h}). Un vehículo adaptado le recoge.',
      'mb.e.ligne': 'Línea {l} de {a} a {b}', 'mb.e.ligneD': '{n} parada(s), {m} min — pasa cada {f} min', 'mb.e.marche': 'A pie de {a} a {b}', 'mb.e.marcheD': '{n} min',
      'mb.e.relais': '{t} (sustituye a la línea {l}) de {a} a {b}', 'mb.t.bus-relais': 'Autobús de relevo', 'mb.t.navette': 'Lanzadera de sustitución',
      'mb.parArret': '¿Está en una parada sin servicio?', 'mb.arret': 'Parada {a}', 'mb.a.autres': 'Tome la línea {l} en la misma parada.', 'mb.a.relais': 'El servicio de sustitución para aquí.',
      'mb.a.proche': 'Camine {n} min hasta {a} (línea {l}).', 'mb.a.station': 'Bicicletas compartidas: {s}.', 'mb.quartiers': 'Barrios también servidos por otras líneas',
      'mb.q.lignes': 'Barrio {q}: línea(s) {l}', 'mb.q.aucune': 'Barrio {q}: ninguna otra línea, vea las soluciones de arriba.',
      'mb.itineraireBtn': 'Itinerario alternativo', 'mb.suivre': 'Avisarme sobre la línea {l}', 'mb.suivi': 'Recibe avisos de la línea {l}', 'mb.suiviOk': 'Anotado: le avisaremos cuando la línea {l} se interrumpa o se restablezca.',
      'mb.suiviStop': 'Ya no recibirá avisos de la línea {l}.', 'mb.connexion': 'Inicie sesión para recibir avisos', 'mb.maj': 'Actualizado {d}',
      'mb.h.remplacement': 'Itinerario alternativo', 'mb.remplacementD': 'Elija de dónde sale y adónde va (una parada o un barrio): el trayecto evita las líneas interrumpidas.',
      'mb.de': 'Salgo de', 'mb.vers': 'Voy a', 'mb.choisir': 'Elegir', 'mb.gQuartiers': 'Todo un barrio', 'mb.quartier': 'Barrio {q} (la mejor parada)', 'mb.gArrets': 'Paradas del barrio {q}',
      'mb.chercher': 'Buscar un itinerario', 'mb.r.rapide': 'El más rápido', 'mb.r.moinsMarche': 'Con menos caminata', 'mb.r.duree': 'Duración estimada: {n} min (espera incluida)', 'mb.r.corresp': '{n} transbordo(s)',
      'mb.r.direct': 'Sin transbordo', 'mb.r.habituel': 'Normalmente: {n} min.', 'mb.r.evite': 'Este trayecto evita la línea {l}, interrumpida.', 'mb.r.normal': 'Ninguna línea interrumpida en este trayecto.',
      'mb.r.meme': 'Salida y llegada están en el mismo barrio: bastan unos minutos a pie.', 'mb.r.aucun': 'No se encontró itinerario. Llame al transporte a demanda: {tel}.',
      'mb.r.acces': 'Cuente también unos minutos a pie para llegar a la parada.', 'mb.h.suivre': 'Recibir avisos', 'mb.suivreD': 'Elija sus líneas: recibirá un mensaje (campana y panel «Alertas») cuando se interrumpan y se restablezcan.',
      'mb.l.normal': 'Circulación normal', 'mb.l.partielle': 'Interrumpida en parte', 'mb.l.interrompue': 'Interrumpida', 'mb.trajetCoupe': 'Una línea de este trayecto está interrumpida: este es el trayecto que la evita.', 'mb.voirRemplacement': 'Ver el itinerario alternativo',
      'mb.pasDautre': 'Esta línea está interrumpida en este trayecto.'
    },
    ar: {
      'mb.resume0': 'كل الخطوط تسير بشكل عادي.', 'mb.resumeN': '{n} خط(وط) مضطربة، {m} خط(وط) عادية.',
      'mb.titre': 'الخط {l} متوقف حتى {fin}', 'mb.titreSans': 'الخط {l} متوقف حتى إشعار آخر', 'mb.titreProg': 'الخط {l}: توقف مقرر ابتداءً من {debut}',
      'mb.entre': 'بين {a} و{b}', 'mb.toute': 'الخط بأكمله', 'mb.nonDesservis': 'محطات غير مخدومة: {l}', 'mb.pourquoi': 'السبب', 'mb.precision': 'توضيح من المدينة',
      'mb.m.travaux': 'أشغال على الطريق', 'mb.m.panne': 'عطل في الحافلة', 'mb.m.meteo': 'ظروف جوية', 'mb.m.evenement': 'حدث في المدينة', 'mb.m.securite': 'سبب أمني', 'mb.m.autre': 'انقطاع الخدمة',
      'mb.quoiFaire': 'ماذا أفعل؟ أفضل الحلول', 'mb.pourAller': 'للذهاب من {a} إلى {b} (عادةً {n} د):', 'mb.aussiRapide': 'بنفس السرعة', 'mb.perte': '+{n} د', 'mb.duree': 'نحو {n} د',
      'mb.o.relais.bus-relais': 'حافلة بديلة كل {f} د', 'mb.o.relais.navette': 'حافلة استبدال كل {f} د', 'mb.o.arretsRelais': 'المحطات المخدومة: {l}',
      'mb.o.autres': 'خذ خطاً آخر', 'mb.o.marche': 'سيراً على الأقدام', 'mb.o.marcheD': 'نحو {n} د سيراً ({km})',
      'mb.o.velo': 'دراجة ذاتية الخدمة', 'mb.o.trott': 'دراجة أو سكوتر ذاتي الخدمة', 'mb.o.veloD': 'من محطة {a} إلى محطة {b}',
      'mb.o.tad': 'الحركة المحدودة: نقل حسب الطلب', 'mb.o.tadD': 'احجز على الرقم {tel} قبل {n} د ({h}). تأتي مركبة مهيأة لاصطحابك.',
      'mb.e.ligne': 'الخط {l} من {a} إلى {b}', 'mb.e.ligneD': '{n} محطة، {m} د — كل {f} د', 'mb.e.marche': 'سيراً من {a} إلى {b}', 'mb.e.marcheD': '{n} د',
      'mb.e.relais': '{t} (بدل الخط {l}) من {a} إلى {b}', 'mb.t.bus-relais': 'حافلة بديلة', 'mb.t.navette': 'حافلة استبدال',
      'mb.parArret': 'هل أنت في محطة غير مخدومة؟', 'mb.arret': 'محطة {a}', 'mb.a.autres': 'خذ الخط {l} من نفس المحطة.', 'mb.a.relais': 'الحافلة البديلة تتوقف هنا.',
      'mb.a.proche': 'امشِ {n} د حتى {a} (الخط {l}).', 'mb.a.station': 'دراجات ذاتية الخدمة: {s}.', 'mb.quartiers': 'أحياء تخدمها خطوط أخرى أيضاً',
      'mb.q.lignes': 'حي {q}: الخط(وط) {l}', 'mb.q.aucune': 'حي {q}: لا يوجد خط آخر، انظر الحلول أعلاه.',
      'mb.itineraireBtn': 'مسار بديل', 'mb.suivre': 'نبّهني بشأن الخط {l}', 'mb.suivi': 'أنت تتلقى تنبيهات الخط {l}', 'mb.suiviOk': 'تم: ستُنبَّه عند توقف الخط {l} أو عودته.',
      'mb.suiviStop': 'لن تتلقى بعد الآن تنبيهات الخط {l}.', 'mb.connexion': 'سجّل الدخول لتلقي التنبيهات', 'mb.maj': 'آخر تحديث {d}',
      'mb.h.remplacement': 'مسار بديل', 'mb.remplacementD': 'اختر نقطة الانطلاق والوجهة (محطة أو حي): يتجنب المسار الخطوط المتوقفة.',
      'mb.de': 'أنطلق من', 'mb.vers': 'أذهب إلى', 'mb.choisir': 'اختر', 'mb.gQuartiers': 'حي بأكمله', 'mb.quartier': 'حي {q} (أفضل محطة)', 'mb.gArrets': 'محطات حي {q}',
      'mb.chercher': 'إيجاد مسار', 'mb.r.rapide': 'الأسرع', 'mb.r.moinsMarche': 'بمشي أقل', 'mb.r.duree': 'المدة التقديرية: {n} د (مع الانتظار)', 'mb.r.corresp': '{n} تبديل',
      'mb.r.direct': 'بدون تبديل', 'mb.r.habituel': 'عادةً: {n} د.', 'mb.r.evite': 'يتجنب هذا المسار الخط {l} المتوقف.', 'mb.r.normal': 'لا يوجد خط متوقف على هذا المسار.',
      'mb.r.meme': 'الانطلاق والوصول في نفس الحي: تكفي بضع دقائق سيراً.', 'mb.r.aucun': 'لم يُعثر على مسار. اتصل بالنقل حسب الطلب على {tel}.',
      'mb.r.acces': 'احسب أيضاً بضع دقائق سيراً للوصول إلى المحطة.', 'mb.h.suivre': 'تلقي التنبيهات', 'mb.suivreD': 'اختر خطوطك: تصلك رسالة (الجرس ودرج «التنبيهات») عند توقفها ثم عودتها.',
      'mb.l.normal': 'سير عادي', 'mb.l.partielle': 'متوقف جزئياً', 'mb.l.interrompue': 'متوقف', 'mb.trajetCoupe': 'أحد خطوط هذه الرحلة متوقف: إليك المسار الذي يتجنبه.', 'mb.voirRemplacement': 'عرض المسار البديل',
      'mb.pasDautre': 'هذا الخط متوقف على هذه الرحلة.'
    }
  });

  const t = (k, v) => NT.t(k, v);
  const E = (s) => NT.ui.echap(s == null ? '' : String(s));
  let D = null;
  function charger() {
    const r = NT.api('GET', '/api/mobilite');
    if (r.statut === 200 && r.donnees) D = r.donnees;
    return D;
  }
  charger();
  const nom = (id) => NT.t('tr.arret.' + id, null, (D && D.arrets[id] && D.arrets[id].nom) || id);
  const nomQ = (q) => NT.t('tr.q.' + q, null, q);
  const etiquette = (l) => `<span class="tr-ligne tr-${E(l)}">${E(l)}</span>`;
  const liste = (l) => new Intl.ListFormat(({ fr: 'fr', en: 'en', es: 'es', ar: 'ar' })[NT.i18n.langue] || 'fr', { type: 'conjunction' }).format(l);
  // « 18 h », « 6 pm », « 18:00 » selon la langue ; jour relatif
  function heure(hhmm) {
    const [h, m] = String(hhmm).split(':').map(Number), l = NT.i18n.langue;
    if (l === 'fr') return h + ' h' + (m ? ' ' + String(m).padStart(2, '0') : '');
    if (l === 'en') return (h % 12 || 12) + (m ? ':' + String(m).padStart(2, '0') : '') + (h < 12 ? ' am' : ' pm');
    return h + ':' + String(m).padStart(2, '0');
  }
  function quand(q) {
    if (!q) return '';
    if (q.jour === 'auj') return heure(q.heure);
    const LOC = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES', ar: 'ar' }[NT.i18n.langue] || 'fr-FR';
    const jour = q.jour === 'demain' ? NT.t('tr.demain') : new Date(q.date + 'T12:00:00Z').toLocaleDateString(LOC, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
    return jour + ' ' + heure(q.heure);
  }
  const km = (m) => (m >= 1000 ? (m / 1000).toLocaleString(NT.i18n.langue === 'en' ? 'en-GB' : NT.i18n.langue, { maximumFractionDigits: 1 }) + ' km' : m + ' m');

  /* ---------- API pour transports.js ---------- */
  const lignes = () => (D ? D.lignes : []);
  const enCours = () => (D ? D.interruptions.filter((i) => i.statut === 'en_cours') : []);
  function coupe(ligne, a, b) {
    const L = lignes().find((x) => x.id === ligne); if (!L) return false;
    const i = L.arrets.indexOf(a), j = L.arrets.indexOf(b); if (i < 0 || j < 0) return false;
    const [x, y] = i < j ? [i, j] : [j, i];
    return enCours().some((it) => it.troncons.some((tr) => { if (tr.ligne !== ligne) return false; const p = L.arrets.indexOf(tr.arrets[0]), q = L.arrets.indexOf(tr.arrets[tr.arrets.length - 1]); return x < q && y > p; }));
  }
  const arretFerme = (ligne, a) => { const L = lignes().find((x) => x.id === ligne); return !!(L && L.nonDesservis.includes(a)); };

  /* ---------- Cartes « Ligne N4 interrompue jusqu'à 18 h » ---------- */
  function titre(i, tr) {
    if (i.statut === 'programmee') return t('mb.titreProg', { l: tr.ligne, debut: quand(i.debut) });
    return i.fin ? t('mb.titre', { l: tr.ligne, fin: quand(i.fin) }) : t('mb.titreSans', { l: tr.ligne });
  }
  function optionHtml(o, s, rang) {
    const perte = o.perte == null ? '' : `<span class="mb-perte${o.perte === 0 ? ' mb-perte-zero' : ''}">${E(o.perte === 0 ? t('mb.aussiRapide') : t('mb.perte', { n: o.perte }))}</span>`;
    let ic = 'ph-bus', tete = '', corps = '';
    if (o.type === 'relais') { tete = t('mb.o.relais.' + o.sousType, { f: o.frequence }); corps = `<p>${E(t('mb.o.arretsRelais', { l: o.arrets.map(nom).join(' › ') }))}</p>${o.libelle ? `<p class="doux" lang="fr">${E(o.libelle)}</p>` : ''}`; }
    else if (o.type === 'autres-lignes') { ic = 'ph-path'; tete = t('mb.o.autres') + ' · ' + o.lignes.join(' + '); corps = etapesHtml(o.etapes, true); }
    else if (o.type === 'marche') { ic = 'ph-person-simple-walk'; tete = t('mb.o.marche'); corps = `<p>${E(t('mb.o.marcheD', { n: o.minutes, km: km(o.distanceM) }))}</p>`; }
    else if (o.type === 'velo') { ic = 'ph-bicycle'; tete = t(o.trottinettes ? 'mb.o.trott' : 'mb.o.velo'); corps = `<p>${E(t('mb.o.veloD', { a: nom(o.depart.arret), b: nom(o.arrivee.arret) }))} · ${E(t('mb.duree', { n: o.duree }))}</p>`; }
    else if (o.type === 'tad') { ic = 'ph-wheelchair'; tete = t('mb.o.tad'); corps = `<p>${E(t('mb.o.tadD', { tel: o.tel, n: o.delaiMin, h: o.horaires }))}</p><p><a class="btn petit" href="tel:${E(String(o.tel).replace(/[^\d+]/g, ''))}"><i class="ph ph-phone" aria-hidden="true"></i>${E(o.tel)}</a></p>`; }
    const duree = o.duree != null && o.type !== 'velo' && o.type !== 'marche' ? ` <span class="doux">· ${E(t('mb.duree', { n: o.duree }))}</span>` : '';
    return `<li class="mb-option${rang === 0 && o.type !== 'tad' ? ' mb-meilleure' : ''}"><i class="ph-duotone ${ic}" aria-hidden="true"></i><div><p class="mb-option-tete"><strong>${E(tete)}</strong>${duree} ${perte}</p>${corps}</div></li>`;
  }
  function etapesHtml(etapes, compact) {
    return `<ol class="mb-etapes${compact ? ' compact' : ''}">${etapes.map((e) => {
      if (e.type === 'marche') return `<li><i class="ph ph-person-simple-walk" aria-hidden="true"></i><span>${E(t('mb.e.marche', { a: nom(e.de), b: nom(e.vers) }))} <span class="doux">· ${E(t('mb.e.marcheD', { n: e.minutes }))}</span></span></li>`;
      if (e.type === 'relais') return `<li><i class="ph ph-bus" aria-hidden="true"></i><span>${E(t('mb.e.relais', { t: t('mb.t.' + ((e.relais && e.relais.type) || 'navette')), l: e.ligne, a: nom(e.de), b: nom(e.vers) }))} <span class="doux">· ${E(t('mb.e.ligneD', { n: e.arrets, m: e.minutes, f: e.frequence }))}</span></span></li>`;
      return `<li>${etiquette(e.ligne)}<span>${E(t('mb.e.ligne', { l: e.ligne, a: nom(e.de), b: nom(e.vers) }))} <span class="doux">· ${E(t('mb.e.ligneD', { n: e.arrets, m: e.minutes, f: e.frequence }))}</span></span></li>`;
    }).join('')}</ol>`;
  }
  function carte(i) {
    return i.troncons.map((tr, k) => {
      const s = (i.solutions || [])[k] || null;
      const suivi = D.abonnements.includes(tr.ligne);
      const nd = s ? s.parArret.map((p) => p.arret) : [];
      const sous = tr.touteLaLigne ? t('mb.toute') : t('mb.entre', { a: nom(tr.arrets[0]), b: nom(tr.arrets[tr.arrets.length - 1]) });
      const parArret = s && s.parArret.length ? `<details class="mb-details"><summary>${E(t('mb.parArret'))}</summary><ul class="mb-arrets">${s.parArret.map((p) => {
        const conseils = [];
        if (p.autresLignes.length) conseils.push(t('mb.a.autres', { l: p.autresLignes.join(', ') }));
        if (p.relais) conseils.push(t('mb.a.relais'));
        p.proches.slice(0, 1).forEach((x) => conseils.push(t('mb.a.proche', { n: x.minutes, a: nom(x.arret), l: x.lignes.join(', ') })));
        if (p.station) conseils.push(t('mb.a.station', { s: nom(p.station.arret) }));
        return `<li><strong>${E(t('mb.arret', { a: nom(p.arret) }))}</strong><ul>${conseils.map((c) => `<li>${E(c)}</li>`).join('')}</ul></li>`;
      }).join('')}</ul>
        <p class="mb-q-titre"><strong>${E(t('mb.quartiers'))}</strong></p><ul class="mb-quartiers">${s.quartiers.map((q) => `<li>${E(q.lignes.length ? t('mb.q.lignes', { q: nomQ(q.quartier), l: q.lignes.join(', ') }) : t('mb.q.aucune', { q: nomQ(q.quartier) }))}</li>`).join('')}</ul></details>` : '';
      const options = s ? `<h4 class="mb-h4">${E(t('mb.quoiFaire'))}</h4><p class="mb-pour">${E(t('mb.pourAller', { a: nom(s.de), b: nom(s.a), n: s.habituel }))}</p>
        <ol class="mb-options">${s.options.slice(0, 4).map((o, r) => optionHtml(o, s, r)).join('')}${s.options.length > 4 ? s.options.slice(4).map((o) => optionHtml(o, s, 9)).join('') : ''}</ol>` : '';
      return `<article class="mb-carte${i.statut === 'programmee' ? ' mb-programmee' : ''}" id="int-${E(i.id)}${k ? '-' + k : ''}" aria-labelledby="mb-t-${E(i.id)}-${k}" tabindex="-1">
        <div class="mb-carte-tete">${etiquette(tr.ligne)}<div><h3 id="mb-t-${E(i.id)}-${k}">${E(titre(i, tr))}</h3><p class="mb-sous">${E(sous)}${nd.length ? ' · ' + E(t('mb.nonDesservis', { l: nd.map(nom).join(', ') })) : ''}</p></div></div>
        <dl class="mb-motif"><div><dt>${E(t('mb.pourquoi'))}</dt><dd>${E(t('mb.m.' + i.motif))}</dd></div>${i.precision ? `<div><dt>${E(t('mb.precision'))}</dt><dd lang="fr">${E(i.precision)}</dd></div>` : ''}</dl>
        ${options}${parArret}
        <div class="mb-actions"><button type="button" class="btn btn-primaire" data-mb-itineraire="${E(s ? s.de + '|' + s.a : '')}"><i class="ph ph-signpost" aria-hidden="true"></i>${E(t('mb.itineraireBtn'))}</button>
          ${boutonSuivre(tr.ligne, suivi)}</div></article>`;
    }).join('');
  }
  function boutonSuivre(l, suivi) {
    if (!D.connecte) return `<a class="btn" href="connexion.html?retour=${encodeURIComponent('transports.html#suivre')}"><i class="ph ph-bell-simple" aria-hidden="true"></i>${E(t('mb.connexion'))}</a>`;
    return `<button type="button" class="btn mb-suivre" aria-pressed="${suivi}" data-mb-suivre="${E(l)}"><i class="${suivi ? 'ph-duotone ph-bell-ringing' : 'ph ph-bell-simple'}" aria-hidden="true"></i>${E(t(suivi ? 'mb.suivi' : 'mb.suivre', { l }))}</button>`;
  }
  function rendreTrafic(el) {
    if (!D || !el) return false;
    const touchees = lignes().filter((l) => l.etat !== 'normal');
    const cartes = D.interruptions.map(carte).join('');
    const puces = lignes().map((l) => `<li class="tr-puce${l.etat !== 'normal' ? ' tr-puce-pert' : ''}">${etiquette(l.id)}<span class="tr-puce-txt"><strong>${E(NT.t('tr.ligne.' + l.id, null, l.nom))}</strong>
      <span class="statut ${l.etat === 'normal' ? 'statut-ok' : l.etat === 'partielle' ? 'statut-maintenance' : 'statut-incident'}">${E(t('mb.l.' + l.etat))}</span></span></li>`).join('');
    el.innerHTML = `<p class="mb-resume" id="interruptions"><i class="ph-duotone ${touchees.length ? 'ph-warning' : 'ph-check-circle'}" aria-hidden="true"></i>${E(touchees.length ? t('mb.resumeN', { n: touchees.length, m: lignes().length - touchees.length }) : t('mb.resume0'))}</p>
      ${cartes}<ul class="tr-puces">${puces}</ul>`;
    return true;
  }

  /* ---------- Itinéraire de remplacement ---------- */
  function options() {
    const qs = NT.QUARTIERS;
    return `<option value="">${E(t('mb.choisir'))}</option><optgroup label="${E(t('mb.gQuartiers'))}">${qs.map((q) => `<option value="q:${q}">${E(t('mb.quartier', { q: nomQ(q) }))}</option>`).join('')}</optgroup>`
      + qs.map((q) => { const ids = Object.keys(D.arrets).filter((a) => D.arrets[a].quartier === q); return ids.length ? `<optgroup label="${E(t('mb.gArrets', { q: nomQ(q) }))}">${ids.map((a) => `<option value="${a}">${E(nom(a))}</option>`).join('')}</optgroup>` : ''; }).join('');
  }
  function rendreItineraire(r) {
    const z = document.getElementById('mb-res');
    if (r.statut !== 200) { z.innerHTML = `<p class="tr-msg"><i class="ph-duotone ph-info" aria-hidden="true"></i>${E((r.donnees && r.donnees.erreur) || '')}</p>`; return; }
    const d = r.donnees;
    if (d.rapide.memeEndroit) { z.innerHTML = `<p class="tr-msg"><i class="ph-duotone ph-person-simple-walk" aria-hidden="true"></i>${E(t('mb.r.meme'))}</p>`; return; }
    if (d.rapide.aucun) { z.innerHTML = `<p class="tr-msg"><i class="ph-duotone ph-wheelchair" aria-hidden="true"></i>${E(t('mb.r.aucun', { tel: D.tad.tel }))}</p>`; return; }
    const bloc = (x, titreCle) => `<section class="mb-iti" aria-label="${E(t(titreCle))}"><h3>${E(t(titreCle))}</h3>
      <p class="mb-iti-chiffres"><strong>${E(t('mb.r.duree', { n: x.duree }))}</strong> · ${E(x.correspondances ? t('mb.r.corresp', { n: x.correspondances }) : t('mb.r.direct'))}</p>
      ${etapesHtml(x.etapes)}${x.accesQuartier ? `<p class="doux">${E(t('mb.r.acces'))}</p>` : ''}</section>`;
    const habituel = d.habituel && d.habituel.duree ? `<p>${E(t('mb.r.habituel', { n: d.habituel.duree }))} ${E(d.lignesTouchees.length ? t('mb.r.evite', { l: d.lignesTouchees.join(', ') }) : t('mb.r.normal'))}</p>` : '';
    z.innerHTML = `<div class="mb-iti-intro">${habituel}</div><div class="mb-iti-grille">${bloc(d.rapide, 'mb.r.rapide')}${d.moinsDeMarche ? bloc(d.moinsDeMarche, 'mb.r.moinsMarche') : ''}</div>`;
    NT.ui.annoncer(t('mb.r.duree', { n: d.rapide.duree }));
  }
  function chercher() {
    const de = document.getElementById('mb-de').value, vers = document.getElementById('mb-vers').value;
    if (!de || !vers) return;
    rendreItineraire(NT.api('GET', '/api/mobilite/itineraire?de=' + encodeURIComponent(de) + '&vers=' + encodeURIComponent(vers)));
    try { history.replaceState(null, '', location.pathname + location.search + '#remplacement'); } catch (e) { /* ignoré */ }
  }
  function ouvrirItineraire(de, vers) {
    const a = document.getElementById('mb-de'), b = document.getElementById('mb-vers');
    if (!a) return;
    a.value = de; b.value = vers; chercher();
    const s = document.getElementById('remplacement');
    s.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    s.querySelector('h2').setAttribute('tabindex', '-1'); s.querySelector('h2').focus({ preventScroll: true });
  }

  /* ---------- Lignes suivies ---------- */
  function rendreSuivre() {
    const z = document.getElementById('mb-suivre');
    if (!z) return;
    z.innerHTML = `<ul class="mb-suivre-liste">${lignes().map((l) => `<li>${etiquette(l.id)}<span><strong>${E(NT.t('tr.ligne.' + l.id, null, l.nom))}</strong><br><span class="doux">${E(t('mb.l.' + l.etat))}</span></span>${boutonSuivre(l.id, D.abonnements.includes(l.id))}</li>`).join('')}</ul>`;
  }
  function basculer(l, bouton) {
    const actif = bouton.getAttribute('aria-pressed') !== 'true';
    const r = NT.api('POST', '/api/mobilite/abonnements', { ligne: l, actif });
    if (r.statut !== 200) { NT.ui.toast((r.donnees && r.donnees.erreur) || NT.t('ui.erreur'), 'danger'); return; }
    D.abonnements = r.donnees.lignes;
    document.querySelectorAll('[data-mb-suivre="' + l + '"]').forEach((b) => { b.outerHTML = boutonSuivre(l, actif); });
    NT.ui.toast(t(actif ? 'mb.suiviOk' : 'mb.suiviStop', { l }), 'success', 6000);
    if (actif && NT.recharger) setTimeout(() => document.dispatchEvent(new CustomEvent('nt:v20-maj')), 300);
    const b = document.querySelector('[data-mb-suivre="' + l + '"]'); if (b) b.focus();
  }

  document.addEventListener('click', (e) => {
    const s = e.target.closest && e.target.closest('[data-mb-suivre]');
    if (s) { basculer(s.dataset.mbSuivre, s); return; }
    const i = e.target.closest && e.target.closest('[data-mb-itineraire]');
    if (i && i.dataset.mbItineraire) { const [a, b] = i.dataset.mbItineraire.split('|'); ouvrirItineraire(a, b); return; }
    const v = e.target.closest && e.target.closest('[data-mb-voir]');
    if (v) { e.preventDefault(); const [a, b] = v.dataset.mbVoir.split('|'); ouvrirItineraire(a, b); }
  });

  // « Mon trajet » (transports.js) : quand une ligne du trajet habituel est interrompue, lien vers l'itinéraire de remplacement
  function avisTrajet(a, b) {
    if (!D || !enCours().length || !a || !b) return '';
    const touche = lignes().some((L) => L.arrets.includes(a) && L.arrets.includes(b) && coupe(L.id, a, b));
    return touche ? `<p class="mb-avis-trajet"><i class="ph-duotone ph-warning" aria-hidden="true"></i><span>${E(t('mb.trajetCoupe'))} <a href="#remplacement" data-mb-voir="${E(a + '|' + b)}">${E(t('mb.voirRemplacement'))}</a></span></p>` : '';
  }

  NT.mobilite = { donnees: () => D, charger, coupe, arretFerme, rendreTrafic, avisTrajet, ouvrirItineraire };

  document.addEventListener('DOMContentLoaded', () => {
    if (!D) return;
    const de = document.getElementById('mb-de'), vers = document.getElementById('mb-vers');
    if (de) {
      de.innerHTML = options(); vers.innerHTML = options();
      document.getElementById('mb-form').addEventListener('submit', (e) => { e.preventDefault(); chercher(); });
      const u = NT.auth.utilisateur();
      de.value = u && u.quartier ? 'q:' + u.quartier : '';
      const s = enCours()[0];
      if (s && s.solutions && s.solutions[0]) { if (!de.value) de.value = s.solutions[0].de; vers.value = s.solutions[0].a; if (de.value === vers.value) vers.value = 'gare'; }
    }
    rendreSuivre();
    const cible = location.hash && document.getElementById(location.hash.slice(1));
    if (cible && /^#int-/.test(location.hash)) setTimeout(() => { cible.scrollIntoView({ block: 'start' }); cible.focus({ preventScroll: true }); }, 200);
  });
})();
