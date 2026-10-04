/* Terra Nova — Carte des services (F45) et urgences / hôpitaux (F46).
   Plan SVG vectoriel dessiné depuis les données ci-dessous ; marqueurs = vrais <button> ; liste synchronisée ;
   fiche du lieu sur le même écran. Chargé en fin de <body> avec defer (après ui.js) : tout le code dans NT.pret. */
(function () {
  'use strict';
  const NT = window.NT;

  /* ---------- Traductions ---------- */
  NT.i18n.ajouter({
    fr: {
      'cm.ariane': 'Carte des services', 'cm.titre': 'Carte des services',
      'cm.intro': 'Trouvez un hôpital, un service d’urgence ou un service de la mairie, voyez s’il est ouvert et comment y aller en navette, sans changer de page.',
      'cm.planTitre': 'Plan de Terra Nova', 'cm.planRegion': 'Plan de Terra Nova, défilement horizontal possible sur petit écran', 'cm.asideLabel': 'Rechercher et choisir un lieu', 'cm.saut': 'Aller à la liste des lieux',
      'cm.urgBtn': 'Urgences et hôpitaux', 'cm.urgSous': 'Numéros utiles, lieux ouverts 24h/24, le plus proche de chez vous',
      'cm.rechercheLabel': 'Rechercher un lieu', 'cm.recherchePh': 'Pharmacie, mairie, Sud…', 'cm.effacer': 'Effacer',
      'cm.types': 'Type de lieu', 'cm.options': 'Afficher seulement', 'cm.tous': 'Tous les lieux', 'cm.ouverts': 'Ouverts maintenant', 'cm.pmrFiltre': 'Accessibles PMR',
      'cm.proche': 'Près de chez moi : mon quartier', 'cm.prochePh': 'Choisir mon quartier', 'cm.procheAide': 'La liste est triée du lieu le plus proche au plus éloigné.',
      'cm.lieux': 'Lieux', 'cm.nb0': 'Aucun lieu ne correspond à votre recherche.', 'cm.nb1': '1 lieu affiché.', 'cm.nbN': '{n} lieux affichés.', 'cm.nbTri': ' Triés par proximité du quartier {q}.',
      'cm.legTypes': 'Types de lieux', 'cm.legLignes': 'Lignes de navettes', 'cm.legGare': 'Gare orbitale', 'cm.canal': 'Canal Sud',
      'cm.t.urgence': 'Urgence', 'cm.t.sante': 'Santé', 'cm.t.administration': 'Administration', 'cm.t.social': 'Social et famille', 'cm.t.transport': 'Transport', 'cm.t.autre': 'Autres lieux',
      'cm.q.Centre': 'Centre', 'cm.q.Nord': 'Nord', 'cm.q.Sud': 'Sud', 'cm.q.Est': 'Est', 'cm.q.Ouest': 'Ouest',
      'cm.ligne.N1': 'Centre – Nord', 'cm.ligne.N2': 'Sud – Gare orbitale', 'cm.ligne.N3': 'Est – Ouest', 'cm.ligne.N4': 'Est – Gare orbitale',
      'cm.st.ouvert': 'Ouvert maintenant', 'cm.st.ferme': 'Fermé maintenant', 'cm.h24': '24h/24', 'cm.jusqua': 'jusqu’à {h}',
      'cm.ouvreAuj': 'ouvre aujourd’hui à {h}', 'cm.ouvreDem': 'ouvre demain à {h}', 'cm.ouvreJour': 'ouvre {j} à {h}',
      'cm.dansQuartier': 'Dans votre quartier', 'cm.svc.maintenance': 'Service en maintenance', 'cm.svc.incident': 'Incident sur le service', 'cm.svc.desactive': 'Service indisponible (désactivé)',
      'cm.fermer': 'Fermer', 'cm.fermerFiche': 'Fermer la fiche du lieu', 'cm.adresse': 'Adresse', 'cm.horaires': 'Horaires', 'cm.tel': 'Téléphone', 'cm.acces': 'Accès PMR',
      'cm.pmrOui': 'Accessible aux personnes à mobilité réduite', 'cm.pmrNon': 'Accès limité pour le moment : appelez avant de venir.',
      'cm.yAller': 'Y aller en navette', 'cm.arret': 'Arrêt le plus proche', 'cm.lignes': 'Ligne(s)', 'cm.trajet': 'Calculer mon trajet', 'cm.voirService': 'Voir le service', 'cm.rdv': 'Prendre rendez-vous',
      'cm.canalFerme': 'L’arrêt {a} n’est plus desservi (montée des eaux) : descendez à {r}.',
      'cm.svcAlerte': 'Le service « {s} » est actuellement perturbé.', 'cm.svcRetour': 'Retour prévu : ', 'cm.chaleur': 'Voir l’alerte chaleur', 'cm.chaleurNote': 'Espace climatisé ouvert pendant la vague de chaleur.',
      'cm.danger': 'En danger vital : appelez le', 'cm.ou': 'ou le',
      'cm.u.titre': 'Urgences et hôpitaux', 'cm.u.note': 'En danger vital, n’attendez pas : appelez d’abord.', 'cm.u.n15': 'Urgence médicale (SAMU)', 'cm.u.n112': 'Toutes urgences',
      'cm.u.h24': 'Ouverts 24h/24', 'cm.u.proche': 'Le plus proche de chez vous (quartier {q})', 'cm.u.proche24': 'Le plus proche ouvert 24h/24', 'cm.u.choisirQ': 'Choisissez votre quartier dans « Près de chez moi » pour voir le lieu le plus proche.',
      'cm.appeler': 'Appeler le {n}',
      'cm.annonce.sel': '{nom}, {st}. Fiche affichée.', 'cm.annonce.ferme': 'Fiche fermée.',
      'cm.nbArrets': '{n} arrêts', 'cm.filtres': 'Filtres et lieux', 'cm.monQ': 'Utiliser mon quartier', 'cm.toutVoir': 'Tout afficher', 'cm.surTitre': 'Carte orbitale', 'cm.lignesTitre': 'Lignes de navettes'
    },
    en: {
      'cm.ariane': 'Services map', 'cm.titre': 'Services map',
      'cm.intro': 'Find a hospital, an emergency service or a city service, see whether it is open and how to get there by shuttle, without changing page.',
      'cm.planTitre': 'Map of Terra Nova', 'cm.planRegion': 'Map of Terra Nova, horizontal scrolling available on small screens', 'cm.asideLabel': 'Search and choose a place', 'cm.saut': 'Skip to the list of places',
      'cm.urgBtn': 'Emergencies and hospitals', 'cm.urgSous': 'Useful numbers, places open 24/7, the nearest to you',
      'cm.rechercheLabel': 'Search for a place', 'cm.recherchePh': 'Pharmacy, city hall, South…', 'cm.effacer': 'Clear',
      'cm.types': 'Type of place', 'cm.options': 'Show only', 'cm.tous': 'All places', 'cm.ouverts': 'Open now', 'cm.pmrFiltre': 'Wheelchair accessible',
      'cm.proche': 'Near me: my district', 'cm.prochePh': 'Choose my district', 'cm.procheAide': 'The list is sorted from the nearest place to the farthest.',
      'cm.lieux': 'Places', 'cm.nb0': 'No place matches your search.', 'cm.nb1': '1 place shown.', 'cm.nbN': '{n} places shown.', 'cm.nbTri': ' Sorted by distance from the {q} district.',
      'cm.legTypes': 'Types of places', 'cm.legLignes': 'Shuttle lines', 'cm.legGare': 'Orbital station', 'cm.canal': 'South Canal',
      'cm.t.urgence': 'Emergency', 'cm.t.sante': 'Health', 'cm.t.administration': 'Administration', 'cm.t.social': 'Social and family', 'cm.t.transport': 'Transport', 'cm.t.autre': 'Other places',
      'cm.q.Centre': 'Centre', 'cm.q.Nord': 'North', 'cm.q.Sud': 'South', 'cm.q.Est': 'East', 'cm.q.Ouest': 'West',
      'cm.ligne.N1': 'Centre – North', 'cm.ligne.N2': 'South – Orbital station', 'cm.ligne.N3': 'East – West', 'cm.ligne.N4': 'East – Orbital station',
      'cm.st.ouvert': 'Open now', 'cm.st.ferme': 'Closed now', 'cm.h24': '24/7', 'cm.jusqua': 'until {h}',
      'cm.ouvreAuj': 'opens today at {h}', 'cm.ouvreDem': 'opens tomorrow at {h}', 'cm.ouvreJour': 'opens {j} at {h}',
      'cm.dansQuartier': 'In your district', 'cm.svc.maintenance': 'Service under maintenance', 'cm.svc.incident': 'Service incident', 'cm.svc.desactive': 'Service unavailable (disabled)',
      'cm.fermer': 'Close', 'cm.fermerFiche': 'Close the place details', 'cm.adresse': 'Address', 'cm.horaires': 'Opening hours', 'cm.tel': 'Phone', 'cm.acces': 'Accessibility',
      'cm.pmrOui': 'Accessible to people with reduced mobility', 'cm.pmrNon': 'Limited access for now: please call before coming.',
      'cm.yAller': 'Getting there by shuttle', 'cm.arret': 'Nearest stop', 'cm.lignes': 'Line(s)', 'cm.trajet': 'Plan my trip', 'cm.voirService': 'See the service', 'cm.rdv': 'Book an appointment',
      'cm.canalFerme': 'The {a} stop is no longer served (rising water): get off at {r}.',
      'cm.svcAlerte': 'The “{s}” service is currently disrupted.', 'cm.svcRetour': 'Expected back: ', 'cm.chaleur': 'See the heat alert', 'cm.chaleurNote': 'Air-conditioned space open during the heat wave.',
      'cm.danger': 'Life in danger: call', 'cm.ou': 'or',
      'cm.u.titre': 'Emergencies and hospitals', 'cm.u.note': 'If life is in danger, do not wait: call first.', 'cm.u.n15': 'Medical emergency (ambulance)', 'cm.u.n112': 'All emergencies',
      'cm.u.h24': 'Open 24/7', 'cm.u.proche': 'Nearest to you ({q} district)', 'cm.u.proche24': 'Nearest open 24/7', 'cm.u.choisirQ': 'Choose your district under “Near me” to see the nearest place.',
      'cm.appeler': 'Call {n}',
      'cm.annonce.sel': '{nom}, {st}. Details shown.', 'cm.annonce.ferme': 'Details closed.',
      'cm.nbArrets': '{n} stops', 'cm.filtres': 'Filters and places', 'cm.monQ': 'Use my district', 'cm.toutVoir': 'Show everything', 'cm.surTitre': 'Orbital map', 'cm.lignesTitre': 'Shuttle lines'
    },
    es: {
      'cm.ariane': 'Mapa de servicios', 'cm.titre': 'Mapa de servicios',
      'cm.intro': 'Encuentre un hospital, un servicio de urgencias o un servicio municipal, vea si está abierto y cómo llegar en lanzadera, sin cambiar de página.',
      'cm.planTitre': 'Plano de Terra Nova', 'cm.planRegion': 'Plano de Terra Nova, desplazamiento horizontal posible en pantallas pequeñas', 'cm.asideLabel': 'Buscar y elegir un lugar', 'cm.saut': 'Ir a la lista de lugares',
      'cm.urgBtn': 'Urgencias y hospitales', 'cm.urgSous': 'Números útiles, lugares abiertos 24 h, el más cercano a su casa',
      'cm.rechercheLabel': 'Buscar un lugar', 'cm.recherchePh': 'Farmacia, ayuntamiento, Sur…', 'cm.effacer': 'Borrar',
      'cm.types': 'Tipo de lugar', 'cm.options': 'Mostrar solo', 'cm.tous': 'Todos los lugares', 'cm.ouverts': 'Abiertos ahora', 'cm.pmrFiltre': 'Accesibles (movilidad reducida)',
      'cm.proche': 'Cerca de mí: mi barrio', 'cm.prochePh': 'Elegir mi barrio', 'cm.procheAide': 'La lista se ordena del lugar más cercano al más lejano.',
      'cm.lieux': 'Lugares', 'cm.nb0': 'Ningún lugar coincide con su búsqueda.', 'cm.nb1': '1 lugar mostrado.', 'cm.nbN': '{n} lugares mostrados.', 'cm.nbTri': ' Ordenados por cercanía al barrio {q}.',
      'cm.legTypes': 'Tipos de lugares', 'cm.legLignes': 'Líneas de lanzadera', 'cm.legGare': 'Estación orbital', 'cm.canal': 'Canal Sur',
      'cm.t.urgence': 'Urgencias', 'cm.t.sante': 'Salud', 'cm.t.administration': 'Administración', 'cm.t.social': 'Social y familia', 'cm.t.transport': 'Transporte', 'cm.t.autre': 'Otros lugares',
      'cm.q.Centre': 'Centro', 'cm.q.Nord': 'Norte', 'cm.q.Sud': 'Sur', 'cm.q.Est': 'Este', 'cm.q.Ouest': 'Oeste',
      'cm.ligne.N1': 'Centro – Norte', 'cm.ligne.N2': 'Sur – Estación orbital', 'cm.ligne.N3': 'Este – Oeste', 'cm.ligne.N4': 'Este – Estación orbital',
      'cm.st.ouvert': 'Abierto ahora', 'cm.st.ferme': 'Cerrado ahora', 'cm.h24': '24 h', 'cm.jusqua': 'hasta las {h}',
      'cm.ouvreAuj': 'abre hoy a las {h}', 'cm.ouvreDem': 'abre mañana a las {h}', 'cm.ouvreJour': 'abre el {j} a las {h}',
      'cm.dansQuartier': 'En su barrio', 'cm.svc.maintenance': 'Servicio en mantenimiento', 'cm.svc.incident': 'Incidencia en el servicio', 'cm.svc.desactive': 'Servicio no disponible (desactivado)',
      'cm.fermer': 'Cerrar', 'cm.fermerFiche': 'Cerrar la ficha del lugar', 'cm.adresse': 'Dirección', 'cm.horaires': 'Horarios', 'cm.tel': 'Teléfono', 'cm.acces': 'Accesibilidad',
      'cm.pmrOui': 'Accesible para personas con movilidad reducida', 'cm.pmrNon': 'Acceso limitado por el momento: llame antes de venir.',
      'cm.yAller': 'Ir en lanzadera', 'cm.arret': 'Parada más cercana', 'cm.lignes': 'Línea(s)', 'cm.trajet': 'Calcular mi trayecto', 'cm.voirService': 'Ver el servicio', 'cm.rdv': 'Pedir cita',
      'cm.canalFerme': 'La parada {a} ya no tiene servicio (subida del agua): bájese en {r}.',
      'cm.svcAlerte': 'El servicio «{s}» tiene incidencias actualmente.', 'cm.svcRetour': 'Vuelta prevista: ', 'cm.chaleur': 'Ver la alerta de calor', 'cm.chaleurNote': 'Espacio climatizado abierto durante la ola de calor.',
      'cm.danger': 'En peligro vital: llame al', 'cm.ou': 'o al',
      'cm.u.titre': 'Urgencias y hospitales', 'cm.u.note': 'En peligro vital, no espere: llame primero.', 'cm.u.n15': 'Urgencia médica (SAMU)', 'cm.u.n112': 'Todas las urgencias',
      'cm.u.h24': 'Abiertos 24 h', 'cm.u.proche': 'El más cercano a su casa (barrio {q})', 'cm.u.proche24': 'El más cercano abierto 24 h', 'cm.u.choisirQ': 'Elija su barrio en «Cerca de mí» para ver el lugar más cercano.',
      'cm.appeler': 'Llamar al {n}',
      'cm.annonce.sel': '{nom}, {st}. Ficha mostrada.', 'cm.annonce.ferme': 'Ficha cerrada.',
      'cm.nbArrets': '{n} paradas', 'cm.filtres': 'Filtros y lugares', 'cm.monQ': 'Usar mi barrio', 'cm.toutVoir': 'Mostrar todo', 'cm.surTitre': 'Mapa orbital', 'cm.lignesTitre': 'Líneas de lanzadera'
    },
    ar: {
      'cm.ariane': 'خريطة الخدمات', 'cm.titre': 'خريطة الخدمات',
      'cm.intro': 'اعثر على مستشفى أو خدمة طوارئ أو خدمة بلدية، واعرف إن كانت مفتوحة وكيف تصل إليها بالحافلة، دون تغيير الصفحة.',
      'cm.planTitre': 'مخطط تيرا نوفا', 'cm.planRegion': 'مخطط تيرا نوفا، يمكن التمرير أفقياً على الشاشات الصغيرة', 'cm.asideLabel': 'البحث عن مكان واختياره', 'cm.saut': 'الانتقال إلى قائمة الأماكن',
      'cm.urgBtn': 'الطوارئ والمستشفيات', 'cm.urgSous': 'أرقام مفيدة، أماكن مفتوحة على مدار الساعة، الأقرب إلى منزلك',
      'cm.rechercheLabel': 'البحث عن مكان', 'cm.recherchePh': 'صيدلية، بلدية، الجنوب…', 'cm.effacer': 'مسح',
      'cm.types': 'نوع المكان', 'cm.options': 'عرض فقط', 'cm.tous': 'كل الأماكن', 'cm.ouverts': 'مفتوحة الآن', 'cm.pmrFiltre': 'ميسّرة لذوي الحركة المحدودة',
      'cm.proche': 'بالقرب مني: حيّي', 'cm.prochePh': 'اختيار حيّي', 'cm.procheAide': 'القائمة مرتبة من الأقرب إلى الأبعد.',
      'cm.lieux': 'الأماكن', 'cm.nb0': 'لا يوجد مكان يطابق بحثك.', 'cm.nb1': 'مكان واحد معروض.', 'cm.nbN': '{n} أماكن معروضة.', 'cm.nbTri': ' مرتبة حسب القرب من حي {q}.',
      'cm.legTypes': 'أنواع الأماكن', 'cm.legLignes': 'خطوط الحافلات', 'cm.legGare': 'المحطة المدارية', 'cm.canal': 'القناة الجنوبية',
      'cm.t.urgence': 'طوارئ', 'cm.t.sante': 'صحة', 'cm.t.administration': 'إدارة', 'cm.t.social': 'اجتماعي وأسرة', 'cm.t.transport': 'نقل', 'cm.t.autre': 'أماكن أخرى',
      'cm.q.Centre': 'الوسط', 'cm.q.Nord': 'الشمال', 'cm.q.Sud': 'الجنوب', 'cm.q.Est': 'الشرق', 'cm.q.Ouest': 'الغرب',
      'cm.ligne.N1': 'الوسط – الشمال', 'cm.ligne.N2': 'الجنوب – المحطة المدارية', 'cm.ligne.N3': 'الشرق – الغرب', 'cm.ligne.N4': 'الشرق – المحطة المدارية',
      'cm.st.ouvert': 'مفتوح الآن', 'cm.st.ferme': 'مغلق الآن', 'cm.h24': 'على مدار الساعة', 'cm.jusqua': 'حتى {h}',
      'cm.ouvreAuj': 'يفتح اليوم الساعة {h}', 'cm.ouvreDem': 'يفتح غداً الساعة {h}', 'cm.ouvreJour': 'يفتح يوم {j} الساعة {h}',
      'cm.dansQuartier': 'في حيّك', 'cm.svc.maintenance': 'الخدمة قيد الصيانة', 'cm.svc.incident': 'عطل في الخدمة', 'cm.svc.desactive': 'الخدمة غير متاحة (معطّلة)',
      'cm.fermer': 'إغلاق', 'cm.fermerFiche': 'إغلاق بطاقة المكان', 'cm.adresse': 'العنوان', 'cm.horaires': 'أوقات العمل', 'cm.tel': 'الهاتف', 'cm.acces': 'إمكانية الوصول',
      'cm.pmrOui': 'ميسّر لذوي الحركة المحدودة', 'cm.pmrNon': 'الوصول محدود حالياً: اتصل قبل الحضور.',
      'cm.yAller': 'الذهاب بالحافلة', 'cm.arret': 'أقرب محطة', 'cm.lignes': 'الخط (الخطوط)', 'cm.trajet': 'حساب رحلتي', 'cm.voirService': 'عرض الخدمة', 'cm.rdv': 'حجز موعد',
      'cm.canalFerme': 'لم تعد محطة {a} مخدومة (ارتفاع المياه): انزل في {r}.',
      'cm.svcAlerte': 'خدمة «{s}» مضطربة حالياً.', 'cm.svcRetour': 'العودة المتوقعة: ', 'cm.chaleur': 'عرض تنبيه الحر', 'cm.chaleurNote': 'فضاء مكيّف مفتوح خلال موجة الحر.',
      'cm.danger': 'في حال خطر على الحياة، اتصل بالرقم', 'cm.ou': 'أو',
      'cm.u.titre': 'الطوارئ والمستشفيات', 'cm.u.note': 'في حال خطر على الحياة لا تنتظر: اتصل أولاً.', 'cm.u.n15': 'طوارئ طبية (SAMU)', 'cm.u.n112': 'كل حالات الطوارئ',
      'cm.u.h24': 'مفتوحة على مدار الساعة', 'cm.u.proche': 'الأقرب إلى منزلك (حي {q})', 'cm.u.proche24': 'الأقرب المفتوح على مدار الساعة', 'cm.u.choisirQ': 'اختر حيّك في «بالقرب مني» لرؤية أقرب مكان.',
      'cm.appeler': 'الاتصال بالرقم {n}',
      'cm.annonce.sel': '{nom}، {st}. البطاقة معروضة.', 'cm.annonce.ferme': 'تم إغلاق البطاقة.',
      'cm.nbArrets': '{n} محطات', 'cm.filtres': 'المرشحات والأماكن', 'cm.monQ': 'استخدام حيّي', 'cm.toutVoir': 'عرض الكل', 'cm.surTitre': 'الخريطة المدارية', 'cm.lignesTitre': 'خطوط الحافلات'
    }
  });
  /* Noms et horaires des lieux : FR et EN dans LIEUX ([fr, en]), ES et AR ici (clé = texte FR), repli sur EN */
  const TR_LIEUX = {
    'Hôtel de ville': ['Ayuntamiento', 'دار البلدية'], 'Lun–Ven 8h–17h, jeudi jusqu’à 19h': ['Lun–Vie 8:00–17:00, jueves hasta las 19:00', 'الاثنين–الجمعة 8:00–17:00، الخميس حتى 19:00'],
    'Dispensaire central (urgences)': ['Dispensario central (urgencias)', 'المستوصف المركزي (طوارئ)'], '24h/24, 7j/7': ['24 h, 7 días', 'على مدار الساعة، طوال الأسبوع'],
    'Hôpital de Nova (urgences)': ['Hospital de Nova (urgencias)', 'مستشفى نوفا (طوارئ)'], 'Urgences 24h/24, 7j/7': ['Urgencias 24 h, 7 días', 'طوارئ على مدار الساعة، طوال الأسبوع'],
    'Poste de secours du dôme Sud': ['Puesto de socorro de la cúpula Sur', 'مركز الإسعاف بالقبة الجنوبية'], 'Tous les jours 8h–22h': ['Todos los días 8:00–22:00', 'كل يوم 8:00–22:00'],
    'Centre de soins du quartier Nord': ['Centro de salud del barrio Norte', 'مركز الرعاية الصحية بالحي الشمالي'], 'Lun–Ven 8h–19h, samedi 9h–13h': ['Lun–Vie 8:00–19:00, sábado 9:00–13:00', 'الاثنين–الجمعة 8:00–19:00، السبت 9:00–13:00'],
    'Centre de soins du quartier Ouest': ['Centro de salud del barrio Oeste', 'مركز الرعاية الصحية بالحي الغربي'], 'Lun–Sam 8h–18h': ['Lun–Sáb 8:00–18:00', 'الاثنين–السبت 8:00–18:00'],
    'Pharmacie de garde': ['Farmacia de guardia', 'صيدلية المناوبة'], 'Tous les soirs 19h–8h, dimanche 24h/24': ['Todas las noches 19:00–8:00, domingo 24 h', 'كل مساء 19:00–8:00، الأحد على مدار الساعة'],
    'Centre technique municipal': ['Centro técnico municipal', 'المركز التقني البلدي'], 'Lun–Ven 7h30–17h30': ['Lun–Vie 7:30–17:30', 'الاثنين–الجمعة 7:30–17:30'],
    'Pôle habitat': ['Oficina de vivienda', 'قطب السكن'], 'Lun–Ven 9h–16h': ['Lun–Vie 9:00–16:00', 'الاثنين–الجمعة 9:00–16:00'],
    'Maison de l’emploi': ['Casa del empleo', 'دار التشغيل'], 'Lun–Ven 9h–17h': ['Lun–Vie 9:00–17:00', 'الاثنين–الجمعة 9:00–17:00'],
    'Centre social': ['Centro social', 'المركز الاجتماعي'], 'Maison de l’enfance': ['Casa de la infancia', 'دار الطفولة'], 'Lun–Ven 8h30–16h30': ['Lun–Vie 8:30–16:30', 'الاثنين–الجمعة 8:30–16:30'],
    'Centre de tri': ['Centro de reciclaje', 'مركز الفرز'], 'Tous les jours 6h–20h': ['Todos los días 6:00–20:00', 'كل يوم 6:00–20:00'],
    'Médiathèque du dôme culturel': ['Mediateca de la cúpula cultural', 'المكتبة الإعلامية بالقبة الثقافية'], 'Mar–Dim 10h–20h': ['Mar–Dom 10:00–20:00', 'الثلاثاء–الأحد 10:00–20:00'],
    'Gare orbitale': ['Estación orbital', 'المحطة المدارية'], 'Tous les jours 5h–23h': ['Todos los días 5:00–23:00', 'كل يوم 5:00–23:00'],
    'Espace rafraîchi, dôme des Pionniers': ['Espacio climatizado, cúpula de los Pioneros', 'فضاء مبرّد، قبة الروّاد'], 'Tous les jours 8h–22h pendant la vague de chaleur': ['Todos los días 8:00–22:00 durante la ola de calor', 'كل يوم 8:00–22:00 خلال موجة الحر'],
    'Espace rafraîchi, Résidence Aurore': ['Espacio climatizado, Residencia Aurore', 'فضاء مبرّد، إقامة أورور'], 'Tous les jours 9h–21h pendant la vague de chaleur': ['Todos los días 9:00–21:00 durante la ola de calor', 'كل يوم 9:00–21:00 خلال موجة الحر']
  };

  /* ---------- Réseau de navettes (mêmes arrêts et lignes que transports.html) ---------- */
  // arrêt : [nom, quartier, x, y] dans le plan (viewBox 800 x 560)
  const ARRETS = {
    gare: ['Gare orbitale', 'Centre', 450, 318], mairie: ['Hôtel de ville', 'Centre', 395, 285], dispensaire: ['Dispensaire central', 'Centre', 370, 235], quai: ['Quai des Arrivées', 'Centre', 500, 350],
    serres: ['Parc des Serres', 'Nord', 320, 150], orion: ['Arrêt Orion', 'Nord', 400, 95], observatoire: ['Observatoire', 'Nord', 500, 60],
    canal: ['Canal Sud', 'Sud', 190, 478], pionniers: ['Place des Pionniers', 'Sud', 290, 505], social: ['Centre social', 'Sud', 360, 440],
    ateliers: ['Zone des Ateliers', 'Est', 740, 340], aurore: ['Résidence Aurore', 'Est', 715, 290], habitat: ['Pôle habitat', 'Est', 680, 255], kepler: ['Lycée Kepler', 'Est', 640, 305], culturel: ['Dôme culturel', 'Est', 600, 325],
    tri: ['Centre de tri', 'Ouest', 70, 300], emploi: ['Maison de l’emploi', 'Ouest', 120, 250], jardins: ['Jardins hydroponiques', 'Ouest', 170, 330]
  };
  const LIGNES = {
    N1: ['gare', 'mairie', 'dispensaire', 'serres', 'orion', 'observatoire'],
    N2: ['canal', 'pionniers', 'social', 'mairie', 'gare'],
    N3: ['tri', 'emploi', 'jardins', 'mairie', 'culturel', 'habitat'],
    N4: ['ateliers', 'aurore', 'habitat', 'kepler', 'culturel', 'quai', 'mairie', 'gare']
  };
  // Même perturbation que sur la page Transports : l'arrêt Canal Sud n'est plus desservi (montée des eaux)
  const FERMES = { canal: 'pionniers' };
  const ETIQUETTES = [['N1', 'observatoire', 10, -8], ['N2', 'canal', -28, -10], ['N3', 'tri', 10, -10], ['N3', 'habitat', 12, -10], ['N4', 'ateliers', -26, -10]];

  /* ---------- Composition orbitale du plan ----------
     Centre = hub elliptique ; les quatre quartiers = secteurs d'un anneau elliptique, à leur place géographique
     (angles en degrés, 0° = est, sens horaire comme l'écran). Tous les arrêts et lieux tombent dans leur quartier. */
  const ORB = {
    c: [400, 290], rx: 412, ry: 290, crx: 138, cry: 106, ecart: 1.4,
    zones: { Est: { a: [-42, 40], c: 'soleil' }, Sud: { a: [40, 148], c: 'calme' }, Ouest: { a: [148, 222], c: 'aurore' }, Nord: { a: [222, 318], c: 'iono' } },
    labels: { Nord: [300, 66], Est: [640, 380], Sud: [470, 432], Ouest: [215, 200], Centre: [395, 350] }
  };
  const CENTRES = { Centre: [400, 290], Nord: [400, 95], Sud: [400, 480], Est: [680, 290], Ouest: [110, 300] };

  /* ---------- Lieux physiques ---------- */
  const J7 = [0, 1, 2, 3, 4, 5, 6], SEM = [1, 2, 3, 4, 5], SAM = [6], DIM = [0];
  const H24 = [[J7, '00:00', '24:00']];
  // plages : [jours (0 = dimanche), début, fin] ; fin < début = passe minuit
  const LIEUX = [
    { id: 'hotel-ville', nom: ['Hôtel de ville', 'City hall'], type: 'administration', serviceId: 'etat-civil', quartier: 'Centre', adresse: '1 place de la Mairie, niveau 1', hr: ['Lun–Ven 8h–17h, jeudi jusqu’à 19h', 'Mon–Fri 8am–5pm, Thursday until 7pm'], plages: [[[1, 2, 3, 5], '08:00', '17:00'], [[4], '08:00', '19:00']], tel: '01 55 00 10 00', pmr: true, arret: 'mairie', x: 395, y: 285, icone: 'ph-bank', hub: true },
    { id: 'dispensaire-central', nom: ['Dispensaire central (urgences)', 'Central clinic (emergency)'], type: 'urgence', serviceId: 'sante', quartier: 'Centre', adresse: 'Dôme B, avenue du Dispensaire', hr: ['24h/24, 7j/7', 'Open 24/7'], plages: H24, ouvert24h: true, tel: '01 55 00 15 15', pmr: true, arret: 'dispensaire', x: 345, y: 205 },
    { id: 'hopital-nova', nom: ['Hôpital de Nova (urgences)', 'Nova Hospital (emergency)'], type: 'urgence', serviceId: 'sante', quartier: 'Est', adresse: 'Boulevard Kepler, quartier Est', hr: ['Urgences 24h/24, 7j/7', 'Emergency department open 24/7'], plages: H24, ouvert24h: true, tel: '01 55 00 11 12', pmr: true, arret: 'kepler', x: 620, y: 215 },
    { id: 'poste-secours-sud', nom: ['Poste de secours du dôme Sud', 'South dome first-aid post'], type: 'urgence', serviceId: 'sante', quartier: 'Sud', adresse: 'Niveau 0, dôme Sud, près du canal', hr: ['Tous les jours 8h–22h', 'Every day 8am–10pm'], plages: [[J7, '08:00', '22:00']], tel: '01 55 00 11 18', pmr: true, arret: 'canal', x: 235, y: 435 },
    { id: 'soins-nord', nom: ['Centre de soins du quartier Nord', 'North district care centre'], type: 'sante', serviceId: 'sante', quartier: 'Nord', adresse: 'Allée des Serres, quartier Nord', hr: ['Lun–Ven 8h–19h, samedi 9h–13h', 'Mon–Fri 8am–7pm, Saturday 9am–1pm'], plages: [[SEM, '08:00', '19:00'], [SAM, '09:00', '13:00']], tel: '01 55 00 12 10', pmr: true, arret: 'serres', x: 260, y: 110, icone: 'ph-stethoscope' },
    { id: 'soins-ouest', nom: ['Centre de soins du quartier Ouest', 'West district care centre'], type: 'sante', serviceId: 'sante', quartier: 'Ouest', adresse: 'Rue des Jardins, quartier Ouest', hr: ['Lun–Sam 8h–18h', 'Mon–Sat 8am–6pm'], plages: [[[1, 2, 3, 4, 5, 6], '08:00', '18:00']], tel: '01 55 00 12 20', pmr: false, arret: 'emploi', x: 175, y: 250, icone: 'ph-stethoscope' },
    { id: 'pharmacie-garde', nom: ['Pharmacie de garde', 'On-call pharmacy'], type: 'sante', serviceId: 'sante', quartier: 'Centre', adresse: 'Quai des Arrivées, niveau 0', hr: ['Tous les soirs 19h–8h, dimanche 24h/24', 'Every evening 7pm–8am, Sunday 24/7'], plages: [[DIM, '00:00', '24:00'], [J7, '19:00', '08:00']], tel: '01 55 00 12 30', pmr: true, arret: 'quai', x: 530, y: 330, icone: 'ph-pill' },
    { id: 'centre-technique', nom: ['Centre technique municipal', 'Municipal technical centre'], type: 'autre', serviceId: 'voirie', quartier: 'Ouest', adresse: 'Zone technique, quartier Ouest', hr: ['Lun–Ven 7h30–17h30', 'Mon–Fri 7:30am–5:30pm'], plages: [[SEM, '07:30', '17:30']], tel: '01 55 00 13 10', pmr: true, arret: 'jardins', x: 140, y: 375, icone: 'ph-wrench' },
    { id: 'pole-habitat', nom: ['Pôle habitat', 'Housing office'], type: 'administration', serviceId: 'logement', quartier: 'Est', adresse: 'Résidence Aurore, quartier Est', hr: ['Lun–Ven 9h–16h', 'Mon–Fri 9am–4pm'], plages: [[SEM, '09:00', '16:00']], tel: '01 55 00 13 20', pmr: true, arret: 'habitat', x: 705, y: 200, icone: 'ph-house-line' },
    { id: 'maison-emploi', nom: ['Maison de l’emploi', 'Jobs centre'], type: 'administration', serviceId: 'emploi', quartier: 'Ouest', adresse: 'Place de l’Emploi, quartier Ouest', hr: ['Lun–Ven 9h–17h', 'Mon–Fri 9am–5pm'], plages: [[SEM, '09:00', '17:00']], tel: '01 55 00 13 30', pmr: true, arret: 'emploi', x: 105, y: 295, icone: 'ph-briefcase' },
    { id: 'centre-social', nom: ['Centre social', 'Social centre'], type: 'social', serviceId: 'social', quartier: 'Sud', adresse: 'Place des Pionniers, quartier Sud', hr: ['Lun–Ven 9h–17h', 'Mon–Fri 9am–5pm'], plages: [[SEM, '09:00', '17:00']], tel: '01 55 00 14 10', pmr: true, arret: 'social', x: 395, y: 430, icone: 'ph-hand-heart' },
    { id: 'maison-enfance', nom: ['Maison de l’enfance', 'Children’s centre'], type: 'social', serviceId: 'education', quartier: 'Nord', adresse: 'Rue des Étoiles, quartier Nord', hr: ['Lun–Ven 8h30–16h30', 'Mon–Fri 8:30am–4:30pm'], plages: [[SEM, '08:30', '16:30']], tel: '01 55 00 14 20', pmr: true, arret: 'orion', x: 450, y: 140, icone: 'ph-baby' },
    { id: 'centre-tri', nom: ['Centre de tri', 'Recycling centre'], type: 'autre', serviceId: 'dechets', quartier: 'Ouest', adresse: 'Zone de recyclage, quartier Ouest', hr: ['Tous les jours 6h–20h', 'Every day 6am–8pm'], plages: [[J7, '06:00', '20:00']], tel: '01 55 00 15 10', pmr: true, arret: 'tri', x: 60, y: 345, icone: 'ph-recycle' },
    { id: 'mediatheque', nom: ['Médiathèque du dôme culturel', 'Dome library'], type: 'autre', serviceId: 'culture', quartier: 'Est', adresse: 'Dôme culturel, quartier Est', hr: ['Mar–Dim 10h–20h', 'Tue–Sun 10am–8pm'], plages: [[[2, 3, 4, 5, 6, 0], '10:00', '20:00']], tel: '01 55 00 15 20', pmr: true, arret: 'culturel', x: 590, y: 290, icone: 'ph-books' },
    { id: 'gare-orbitale', nom: ['Gare orbitale', 'Orbital station'], type: 'transport', serviceId: 'transports', quartier: 'Centre', adresse: 'Gare orbitale centrale', hr: ['Tous les jours 5h–23h', 'Every day 5am–11pm'], plages: [[J7, '05:00', '23:00']], tel: '01 55 00 16 10', pmr: true, arret: 'gare', x: 450, y: 318, icone: 'ph-tram' },
    { id: 'refraichi-sud', nom: ['Espace rafraîchi, dôme des Pionniers', 'Cooling space, Pioneers dome'], type: 'autre', serviceId: '', canicule: true, quartier: 'Sud', adresse: 'Dôme des Pionniers, quartier Sud', hr: ['Tous les jours 8h–22h pendant la vague de chaleur', 'Every day 8am–10pm during the heat wave'], plages: [[J7, '08:00', '22:00']], tel: '01 55 00 17 10', pmr: true, arret: 'pionniers', x: 330, y: 520, icone: 'ph-snowflake' },
    { id: 'refraichi-est', nom: ['Espace rafraîchi, Résidence Aurore', 'Cooling space, Aurore residence'], type: 'autre', serviceId: '', canicule: true, quartier: 'Est', adresse: 'Salle commune, Résidence Aurore, quartier Est', hr: ['Tous les jours 9h–21h pendant la vague de chaleur', 'Every day 9am–9pm during the heat wave'], plages: [[J7, '09:00', '21:00']], tel: '01 55 00 17 20', pmr: true, arret: 'aurore', x: 705, y: 345, icone: 'ph-snowflake' }
  ];
  const TYPES = ['urgence', 'sante', 'administration', 'social', 'association', 'transport', 'autre'];
  const ICONE_TYPE = { urgence: 'ph-first-aid-kit', sante: 'ph-stethoscope', administration: 'ph-buildings', social: 'ph-hand-heart', association: 'ph-handshake', transport: 'ph-tram', autre: 'ph-map-pin' };
  /* Vague 14 (F74) : associations partenaires (assets/js/associations.js), libellés du type de lieu */
  NT.i18n.ajouter({ fr: { 'cm.t.association': 'Associations partenaires', 'cm.fiche': 'Voir la fiche de l’association' }, en: { 'cm.t.association': 'Partner associations', 'cm.fiche': 'See the association card' },
    es: { 'cm.t.association': 'Asociaciones colaboradoras', 'cm.fiche': 'Ver la ficha de la asociación' }, ar: { 'cm.t.association': 'الجمعيات الشريكة', 'cm.fiche': 'عرض بطاقة الجمعية' } });

  /* ---------- Code de page ---------- */
  NT.pret(() => {
    // F74 : les associations partenaires deviennent des lieux du plan (horaires venant du serveur, modifiables par les agents)
    if (NT.assos) NT.assos.liste().forEach(a => { if (!LIEUX.some(l => l.id === a.id)) LIEUX.push({ id: a.id, nom: [a.nom, a.nom], type: 'association', serviceId: '', quartier: a.quartier, adresse: a.adresse,
      hr: [NT.assos.horairesCourts(a) || '—', NT.assos.horairesCourts(a) || '—'], plages: a.plages || [], tel: a.tel, pmr: !!a.pmr, arret: a.arret, x: a.x, y: a.y, icone: a.icone, asso: a }); });
    const t = NT.t;
    const { echap } = NT.ui;
    const $ = id => document.getElementById(id);
    const qa = (sel, r) => Array.from((r || document).querySelectorAll(sel));
    const LOC = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES', ar: 'ar' };
    const lang = () => NT.i18n.langue;
    const pick = a => { const l = lang(); if (l === 'fr') return a[0]; const x = TR_LIEUX[a[0]]; return (l === 'es' && x && x[0]) || (l === 'ar' && x && x[1]) || a[1] || a[0]; };
    const pad = n => String(n).padStart(2, '0');
    const vm = s => { const p = s.split(':'); return (+p[0]) * 60 + (+p[1]); };
    const heure = m => { const h = Math.floor(m / 60) % 24, mi = m % 60; return lang() === 'fr' ? h + 'h' + pad(mi) : pad(h) + ':' + pad(mi); };
    const jourNom = d => new Intl.DateTimeFormat(LOC[lang()] || 'fr-FR', { weekday: 'long' }).format(new Date(2024, 0, 7 + d));
    const qLabel = q => t('cm.q.' + q, null, q);
    const typeLabel = ty => t('cm.t.' + ty);
    const parId = id => LIEUX.find(l => l.id === id) || null;
    const nomLieu = l => pick(l.nom);
    const arretNom = id => ARRETS[id][0];
    const arretEff = id => FERMES[id] || id;
    const lignesDe = id => Object.keys(LIGNES).filter(k => LIGNES[k].includes(id));
    const dist = (l, q) => Math.hypot(l.x - CENTRES[q][0], l.y - CENTRES[q][1]);

    const u = NT.auth.utilisateur();
    const qUser = u && NT.QUARTIERS.includes(u.quartier) ? u.quartier : '';
    const etat = { type: '', ouverts: false, pmr: false, q: qUser, sel: null, decl: 'liste', ligne: '', zone: '', survolLigne: '', survolZone: '' };

    /* ----- Horaires : ouvert ou fermé maintenant ----- */
    function ouverture(l, d) {
      const day = d.getDay(), m = d.getHours() * 60 + d.getMinutes();
      for (const [jours, de, a] of l.plages) {
        const s = vm(de), e = vm(a);
        if (s < e) { if (jours.includes(day) && m >= s && m < e) return { ouvert: true, jusqua: e < 1440 ? e : null }; }
        else {
          if (jours.includes(day) && m >= s) return { ouvert: true, jusqua: e };
          if (jours.includes((day + 6) % 7) && m < e) return { ouvert: true, jusqua: e };
        }
      }
      let best = null;
      for (let off = 0; off <= 7; off++) {
        const dj = (day + off) % 7;
        for (const [jours, de] of l.plages) {
          if (!jours.includes(dj)) continue;
          const abs = off * 1440 + vm(de);
          if (abs > m && (!best || abs < best.abs)) best = { abs, off, min: vm(de), jour: dj };
        }
      }
      return { ouvert: false, prochaine: best };
    }
    function statut(l) {
      const e = ouverture(l, new Date());
      let detail = '';
      if (e.ouvert) detail = l.ouvert24h ? t('cm.h24') : (e.jusqua ? t('cm.jusqua', { h: heure(e.jusqua) }) : '');
      else if (e.prochaine) {
        const p = e.prochaine, h = heure(p.min);
        detail = p.off === 0 ? t('cm.ouvreAuj', { h }) : p.off === 1 ? t('cm.ouvreDem', { h }) : t('cm.ouvreJour', { j: jourNom(p.jour), h });
      }
      return { ouvert: e.ouvert, txt: t(e.ouvert ? 'cm.st.ouvert' : 'cm.st.ferme'), detail };
    }
    const serviceDe = l => (l.serviceId ? NT.services.get(l.serviceId) : null);
    const codeService = l => { const s = serviceDe(l); return s && s.etat && s.etat.code !== 'ok' ? s.etat.code : ''; };
    const phrase = l => { const st = statut(l); return st.txt + (st.detail ? ' (' + st.detail + ')' : ''); };
    const labelMarqueur = l => [nomLieu(l), typeLabel(l.type), phrase(l), qLabel(l.quartier)].concat(codeService(l) ? [t('cm.svc.' + codeService(l))] : []).join(', ');
    const iconeLieu = l => (l.type === 'urgence' ? '<span class="cm-croix" aria-hidden="true"></span>' : `<i class="ph-duotone ${echap(l.icone || ICONE_TYPE[l.type])}" aria-hidden="true"></i>`);

    /* ----- Plan orbital ----------------------------------------------------------------------------------
       Le Centre est le hub (ellipse lumineuse) ; Nord, Est, Sud et Ouest sont des secteurs d'anneau disposés
       autour, à leur place géographique. Les lignes sont tracées comme un plan de métro : segments à 0/45/90°,
       virages arrondis, lignes parallèles sur les tronçons communs, correspondances en pastille blanche. */
    const fmt = n => Math.round(n * 10) / 10;
    const ell = (rx, ry, deg) => { const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), r = 1 / Math.sqrt(c * c / (rx * rx) + s * s / (ry * ry)); return [ORB.c[0] + r * c, ORB.c[1] + r * s]; };
    // Quartier : secteur d'anneau au bord extérieur irrégulier (îlots, avenues) mais toujours autour du hub
    const ondule = a => .9 + .1 * ((Math.sin(a * .19) + Math.sin(a * .113 + 2.1) + 2) / 4);
    function secteur(a1, a2) {
      const ext = [], int = [], fin = a2 - ORB.ecart;
      for (let a = a1 + ORB.ecart; a < fin + 8.99; a += 9) {
        const b = Math.min(a, fin), p = ell(ORB.rx, ORB.ry, b), f = ondule(b);
        ext.push([ORB.c[0] + (p[0] - ORB.c[0]) * f, ORB.c[1] + (p[1] - ORB.c[1]) * f]);
        if (b === fin) break;
      }
      const g = ORB.ecart * 2.6;
      for (let a = a2 - g; a > a1 + g - 11.99; a -= 12) { const b = Math.max(a, a1 + g); int.push(ell(ORB.crx * 1.2, ORB.cry * 1.24, b)); if (b === a1 + g) break; }
      return arrondi(ext.concat(int), 10, true);
    }
    // Chemin à coins arrondis à partir d'une suite de points (fermé ou non)
    function arrondi(p, r, ferme) {
      const n = p.length, pt = i => p[(i + n) % n];
      const coin = i => {
        const a = pt(i - 1), b = pt(i), c = pt(i + 1);
        const l1 = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, l2 = Math.hypot(c[0] - b[0], c[1] - b[1]) || 1, rr = Math.min(r, l1 / 2, l2 / 2);
        return [[b[0] - (b[0] - a[0]) / l1 * rr, b[1] - (b[1] - a[1]) / l1 * rr], b, [b[0] + (c[0] - b[0]) / l2 * rr, b[1] + (c[1] - b[1]) / l2 * rr]];
      };
      if (ferme) {
        let d = ''; for (let i = 0; i < n; i++) { const [s, b, e] = coin(i); d += (i ? 'L' : 'M') + fmt(s[0]) + ',' + fmt(s[1]) + 'Q' + fmt(b[0]) + ',' + fmt(b[1]) + ' ' + fmt(e[0]) + ',' + fmt(e[1]); }
        return d + 'Z';
      }
      let d = 'M' + fmt(p[0][0]) + ',' + fmt(p[0][1]);
      for (let i = 1; i < n - 1; i++) { const [s, b, e] = coin(i); d += 'L' + fmt(s[0]) + ',' + fmt(s[1]) + 'Q' + fmt(b[0]) + ',' + fmt(b[1]) + ' ' + fmt(e[0]) + ',' + fmt(e[1]); }
      return d + 'L' + fmt(p[n - 1][0]) + ',' + fmt(p[n - 1][1]);
    }
    // Tronçon entre deux arrêts (toujours calculé dans le même sens, pour que les lignes parallèles restent alignées)
    function troncon(a, b) { return [[ARRETS[a][2], ARRETS[a][3]], [ARRETS[b][2], ARRETS[b][3]]]; }
    // Courbe lisse passant par tous les points (Catmull-Rom → Bézier) : le tracé « coule » d'arrêt en arrêt
    function lisse(p, tension) {
      const k = tension || .5;
      if (p.length < 3) return 'M' + p.map(q => fmt(q[0]) + ',' + fmt(q[1])).join('L');
      let d = 'M' + fmt(p[0][0]) + ',' + fmt(p[0][1]);
      for (let i = 0; i < p.length - 1; i++) {
        const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
        const c1 = [p1[0] + (p2[0] - p0[0]) * k / 3, p1[1] + (p2[1] - p0[1]) * k / 3], c2 = [p2[0] - (p3[0] - p1[0]) * k / 3, p2[1] - (p3[1] - p1[1]) * k / 3];
        d += 'C' + fmt(c1[0]) + ',' + fmt(c1[1]) + ' ' + fmt(c2[0]) + ',' + fmt(c2[1]) + ' ' + fmt(p2[0]) + ',' + fmt(p2[1]);
      }
      return d;
    }
    // Couloirs partagés : chaque ligne reçoit un décalage parallèle sur les tronçons qu'elle partage
    const ECART_LIGNES = 4.6;
    function couloirs() {
      const c = {};
      Object.keys(LIGNES).forEach(id => LIGNES[id].forEach((s, i, l) => { if (!i) return; const k = [l[i - 1], s].sort().join('|'); (c[k] = c[k] || []).push(id); }));
      return c;
    }
    function traceLigne(id, cl) {
      const arr = LIGNES[id], out = [];
      for (let i = 1; i < arr.length; i++) {
        const [a, b] = [arr[i - 1], arr[i]], can = [a, b].sort(), sens = can[0] === a ? 1 : -1;
        const lignes = cl[can.join('|')], d = (lignes.indexOf(id) - (lignes.length - 1) / 2) * ECART_LIGNES;
        let pts = troncon(can[0], can[1]);
        // décalage dans le repère du tronçon (identique quel que soit le sens de parcours)
        const nrm = (p, q) => { const L = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1; return [-(q[1] - p[1]) / L, (q[0] - p[0]) / L]; };
        const dec = pts.map((p, j) => {
          if (j === 0) { const n = nrm(pts[0], pts[1]); return [p[0] + n[0] * d, p[1] + n[1] * d]; }
          if (j === pts.length - 1) { const n = nrm(pts[j - 1], pts[j]); return [p[0] + n[0] * d, p[1] + n[1] * d]; }
          const n1 = nrm(pts[j - 1], pts[j]), n2 = nrm(pts[j], pts[j + 1]), k = 1 + n1[0] * n2[0] + n1[1] * n2[1];
          return [p[0] + (n1[0] + n2[0]) / k * d, p[1] + (n1[1] + n2[1]) / k * d];
        });
        if (sens < 0) dec.reverse();
        dec.forEach((p, j) => { const prev = out[out.length - 1]; if (j === 0 && prev && Math.hypot(prev[0] - p[0], prev[1] - p[1]) < .6) return; out.push(p); });
      }
      return out;
    }
    function dessinerPlan() {
      const cl = couloirs();
      const z = ORB.zones, M = [ARRETS.mairie[2], ARRETS.mairie[3]];
      let h = `<defs>
        <radialGradient id="cm-hub-g" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="oklch(0.7040 0.1400 182.5)" stop-opacity=".34"/><stop offset=".7" stop-color="oklch(0.7040 0.1400 182.5)" stop-opacity=".06"/><stop offset="1" stop-color="oklch(0.7040 0.1400 182.5)" stop-opacity="0"/></radialGradient>
        <pattern id="cm-rues" width="34" height="34" patternUnits="userSpaceOnUse" patternTransform="rotate(18)"><path d="M0 0H34M0 17H34M0 0V34M17 0V34" fill="none" stroke="#fff" stroke-opacity=".05" stroke-width="1"/><rect x="5" y="5" width="7" height="7" rx="1.5" fill="#fff" fill-opacity=".025"/><rect x="22" y="22" width="7" height="7" rx="1.5" fill="#fff" fill-opacity=".025"/></pattern>
      </defs>`;
      // quartiers : secteurs organiques teintés autour du hub, texture de rues très discrète
      h += Object.keys(z).map(q => { const d = secteur(z[q].a[0], z[q].a[1]); return `<g class="cm-zone" data-q="${q}" style="--c:var(--${z[q].c})"><path class="cm-zone-fond" d="${d}"/><path class="cm-zone-rues" d="${d}"/></g>`; }).join('');
      h += `<g class="cm-zone cm-zone-centre" data-q="Centre" style="--c:var(--iono)"><ellipse class="cm-zone-fond" cx="${ORB.c[0]}" cy="${ORB.c[1]}" rx="${ORB.crx}" ry="${ORB.cry}"/></g>`;
      // le canal Sud : une rivière qui traverse le sud de la ville
      const canal = 'M-10,470 C120,440 250,505 400,478 S640,448 810,486';
      h += `<g class="cm-canal-g"><path class="cm-canal" d="${canal}"/><path class="cm-canal-coeur" d="${canal}"/><path class="cm-canal-lisere" id="cm-canal-p" d="${canal}"/>
        <text class="cm-canal-t"><textPath href="#cm-canal-p" startOffset="71%">${echap(t('cm.canal'))}</textPath></text></g>`;
      // le hub : anneaux orbitaux autour de l'hôtel de ville, là où toutes les lignes se rejoignent
      h += `<g class="cm-hub" aria-hidden="true"><circle cx="${M[0]}" cy="${M[1]}" r="62" fill="url(#cm-hub-g)" stroke="none"/><circle class="cm-hub-r1" cx="${M[0]}" cy="${M[1]}" r="46"/><circle class="cm-hub-r2" cx="${M[0]}" cy="${M[1]}" r="60"/></g>`;
      h += Object.keys(z).concat('Centre').map(q => { const p = ORB.labels[q]; return `<text class="cm-zone-t${q === 'Centre' ? ' cm-zone-t-centre' : ''}" data-qt="${q}" x="${p[0]}" y="${p[1]}" text-anchor="middle">${echap(qLabel(q))}</text>`; }).join('');
      // lignes : halo, tracé, zone de survol plus large
      h += '<g class="cm-reseau">' + Object.keys(LIGNES).map((id, i) => {
        const d = lisse(traceLigne(id, cl), .55);
        return `<g class="cm-ligne cm-${id}" data-ligne="${id}" style="--i:${i}"><path class="cm-trace-halo" d="${d}"/><path class="cm-trace" d="${d}" pathLength="1"/><path class="cm-trace-zone" d="${d}"/></g>`;
      }).join('') + '</g>';
      // arrêts : pastille claire cerclée de la couleur de la ligne ; correspondances plus grandes ; arrêt fermé barré
      h += '<g class="cm-arrets">' + Object.keys(ARRETS).map(id => {
        const a = ARRETS[id], l = lignesDe(id), lignesAttr = l.join(' ');
        if (FERMES[id]) return `<g class="cm-arret cm-arret-ferme" data-lignes="${lignesAttr}"><circle cx="${a[2]}" cy="${a[3]}" r="6"/><path d="M${a[2] - 3},${a[3] - 3}l6,6m0,-6l-6,6"/></g>`;
        if (id === 'mairie') return '';   // l'hôtel de ville est le hub (marqueur central)
        if (l.length > 1) return `<g class="cm-arret cm-arret-corresp${id === 'gare' ? ' cm-arret-gare' : ''}" data-lignes="${lignesAttr}"><circle cx="${a[2]}" cy="${a[3]}" r="${id === 'gare' ? 7.5 : 6.2}"/></g>`;
        return `<g class="cm-arret cm-${l[0]}" data-lignes="${lignesAttr}"><circle cx="${a[2]}" cy="${a[3]}" r="4.6"/></g>`;
      }).join('') + '</g>';
      // noms des arrêts : visibles quand leur ligne est mise en avant (la Gare orbitale reste un repère permanent)
      h += '<g class="cm-noms">' + Object.keys(ARRETS).map(id => {
        const a = ARRETS[id], gauche = a[2] > 610, haut = a[3] > 470, ecart = id === 'mairie' ? 34 : 12;   // le hub est plus large
        return `<text class="cm-nom-arret" data-lignes="${lignesDe(id).join(' ')}" x="${a[2] + (gauche ? -ecart : ecart)}" y="${a[3] + (haut ? -12 : 4)}" text-anchor="${gauche ? 'end' : 'start'}">${echap(a[0])}</text>`;
      }).join('') + '</g>';
      // pastilles de ligne aux terminus
      h += '<g class="cm-badges">' + ETIQUETTES.map(([l, s, dx, dy]) => {
        const x = ARRETS[s][2] + dx * 1.3, y = ARRETS[s][3] + dy * 1.8;
        return `<g class="cm-badge cm-${l}" data-ligne="${l}"><rect x="${fmt(x - 16)}" y="${fmt(y - 10)}" width="32" height="20" rx="7"/><text x="${fmt(x)}" y="${fmt(y + 4.5)}" text-anchor="middle">${l}</text></g>`;
      }).join('') + '</g>';
      // boussole : l'orientation reste lisible même si la composition est orbitale
      h += '<g class="cm-boussole" transform="translate(760 40)"><circle r="19"/><path d="M0,-12 L5,-1 L-5,-1Z"/><text y="12" text-anchor="middle">N</text></g>';
      h += '<g id="cm-sel"></g>';
      $('cm-plan').innerHTML = h;
    }
    function dessinerSelection(l) {
      const g = $('cm-sel');
      if (!l) { g.innerHTML = ''; return; }
      const a = ARRETS[arretEff(l.arret)];
      const ancre = a[2] > 640 ? 'end' : a[2] < 120 ? 'start' : 'middle';
      g.innerHTML = `<line class="cm-sel-lien" x1="${l.x}" y1="${l.y}" x2="${a[2]}" y2="${a[3]}"/><circle class="cm-sel-arret" cx="${a[2]}" cy="${a[3]}" r="11"/>
        <text class="cm-sel-t" x="${a[2]}" y="${a[3] - 17}" text-anchor="${ancre}">${echap(a[0])}</text>`;
    }

    /* ----- Marqueurs (boutons) ----- */
    function dessinerMarqueurs() {
      $('cm-marqueurs').innerHTML = LIEUX.map(l => {
        const px = l.x / 8, py = l.y / 5.6;
        let cote = px < 20 ? ' cm-g' : px > 80 ? ' cm-d' : '';
        // au repos : un point discret ; au survol, au focus ou une fois choisi : la pastille s'ouvre sur l'icône et le nom
        if (l.hub) cote += ' cm-pt-hub';
        return `<li class="cm-pt${cote}" data-pt="${echap(l.id)}" data-q="${echap(l.quartier)}" style="left:${px.toFixed(2)}%;top:${py.toFixed(2)}%">
          <button type="button" class="cm-marqueur cm-t-${echap(l.type)}" data-lieu="${echap(l.id)}" data-nom="${echap(nomLieu(l))}" aria-label="${echap(labelMarqueur(l))}"><span class="cm-pastille" aria-hidden="true">${iconeLieu(l)}</span></button></li>`;
      }).join('');
    }

    /* ----- Légende : les lignes sont des boutons (mise en avant au clavier comme à la souris) ----- */
    function dessinerLegende() {
      const types = TYPES.map(ty => `<li><span class="cm-leg-pt cm-t-${ty}" aria-hidden="true">${ty === 'urgence' ? '<span class="cm-croix"></span>' : `<i class="ph-duotone ${ICONE_TYPE[ty]}"></i>`}</span><span>${echap(typeLabel(ty))}</span></li>`).join('');
      const lignes = Object.keys(LIGNES).map(id => `<li><button type="button" class="cm-leg-ligne cm-${id}" data-ligne-btn="${id}" aria-pressed="false"><span class="cm-leg-badge">${id}</span><span>${echap(t('cm.ligne.' + id))}</span></button></li>`).join('');
      $('cm-legende').innerHTML = `<div class="cm-leg-lignes"><h2>${echap(t('cm.legLignes'))}</h2><ul>${lignes}</ul></div><div class="cm-leg-types"><h2>${echap(t('cm.legTypes'))}</h2><ul>${types}</ul></div>`;
    }

    /* ----- Mise en avant d'une ligne ou d'un quartier ----- */
    const carteEl = $('cm-carte');
    function mettreEnAvant() {
      const ligne = etat.survolLigne || etat.ligne, zone = etat.survolZone || etat.zone;
      if (ligne) carteEl.dataset.ligne = ligne; else delete carteEl.dataset.ligne;
      if (zone) carteEl.dataset.zone = zone; else delete carteEl.dataset.zone;
      qa('#cm-plan .cm-ligne, #cm-plan .cm-badge').forEach(g => g.classList.toggle('on', g.dataset.ligne === ligne));
      qa('#cm-plan .cm-arret, #cm-plan .cm-nom-arret').forEach(g => g.classList.toggle('on', !!ligne && g.dataset.lignes.split(' ').includes(ligne)));
      qa('#cm-plan .cm-zone, #cm-plan .cm-zone-t').forEach(g => g.classList.toggle('on', (g.dataset.q || g.dataset.qt) === zone));
      qa('.cm-pt').forEach(li => li.classList.toggle('cm-hors', !!zone && li.dataset.q !== zone));
      qa('[data-ligne-btn]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.ligneBtn === etat.ligne)));
      // petite indication de trajet pour la ligne mise en avant
      const info = $('cm-info');
      if (ligne) {
        const arr = LIGNES[ligne];
        info.innerHTML = `<span class="cm-leg-badge cm-${ligne}">${ligne}</span><span><strong>${echap(t('cm.ligne.' + ligne))}</strong>
          <small>${echap(arretNom(arr[0]))} → ${echap(arretNom(arr[arr.length - 1]))} · ${echap(t('cm.nbArrets', { n: arr.length }))}</small></span>`;
        info.hidden = false;
      } else if (zone) {
        const n = visibles().filter(l => l.quartier === zone).length;
        info.innerHTML = `<span class="cm-info-q" aria-hidden="true"></span><span><strong>${echap(qLabel(zone))}</strong><small>${echap(n === 1 ? t('cm.nb1') : t('cm.nbN', { n }))}</small></span>`;
        info.hidden = false;
      } else info.hidden = true;
      $('cm-info-zone').hidden = info.hidden;
      $('cm-info-fermer').hidden = !(etat.ligne || etat.zone);
    }
    // le quartier de l'habitant : une impulsion discrète qui attire l'œil une seule fois
    function pulserQuartier(q) {
      if (!q) return;
      const z = $('cm-plan').querySelector(`.cm-zone[data-q="${q}"]`); if (!z) return;
      z.classList.remove('cm-pulse'); void z.getBoundingClientRect(); z.classList.add('cm-pulse');
      setTimeout(() => z.classList.remove('cm-pulse'), 1600);
    }

    /* ----- Filtres : catégories principales visibles, les autres derrière « + Filtres » ----- */
    const CHIPS = [['', 'cm.tous', ''], ['sante', 'cm.t.sante', 'ph-stethoscope'], ['administration', 'cm.t.administration', 'ph-bank'], ['social', 'cm.t.social', 'ph-users-three'],
      ['association', 'cm.t.association', 'ph-handshake'], ['transport', 'cm.t.transport', 'ph-bus'], ['autre', 'cm.t.autre', 'ph-map-pin']];
    function dessinerControles() {
      $('cm-chips').innerHTML = CHIPS.map(([v, k, ic]) => `<button type="button" class="cm-chip${v ? ' cm-t-' + v : ''}" data-type="${v}" aria-pressed="false">${ic ? `<i class="ph-duotone ${ic}" aria-hidden="true"></i>` : ''}${echap(t(k))}</button>`).join('');
      $('cm-opts').innerHTML = `<button type="button" class="cm-chip" data-opt="ouverts" aria-pressed="false"><i class="ph ph-clock" aria-hidden="true"></i>${echap(t('cm.ouverts'))}</button>
        <button type="button" class="cm-chip" data-opt="pmr" aria-pressed="false"><i class="ph ph-wheelchair" aria-hidden="true"></i>${echap(t('cm.pmrFiltre'))}</button>`;
      $('cm-quartier').innerHTML = `<option value="">${echap(t('cm.prochePh'))}</option>` + NT.QUARTIERS.map(q => `<option value="${q}">${echap(qLabel(q))}</option>`).join('');
      $('cm-quartier').value = etat.q;
    }
    const matchType = l => !etat.type || etat.type === l.type || (etat.type === 'sante' && l.type === 'urgence');
    const visibles = () => {
      const mots = norm($('cm-q').value).split(/\s+/).filter(Boolean);
      const liste = LIEUX.filter(l => matchType(l) && (!etat.ouverts || statut(l).ouvert) && (!etat.pmr || l.pmr) && (!mots.length || mots.every(m => texteRecherche(l).includes(m))));
      return liste.sort((a, b) => {
        if (etat.q) return dist(a, etat.q) - dist(b, etat.q);
        return ((b.type === 'urgence') - (a.type === 'urgence')) || nomLieu(a).localeCompare(nomLieu(b), lang());
      });
    };
    function norm(s) { return String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim(); }
    function texteRecherche(l) {
      const s = serviceDe(l);
      return norm([l.nom.join(' '), typeLabel(l.type), l.type, l.quartier, qLabel(l.quartier), l.adresse, l.hr.join(' '), arretNom(l.arret), l.id.replace(/-/g, ' '), s ? NT.i18n.choisir(s.nom) + ' ' + s.nom.fr : '', l.canicule ? 'canicule chaleur climatise rafraichi' : '', l.asso ? 'association partenaire ' + NT.assos.aide(l.asso).join(' ') + ' ' + (l.asso.themes || []).join(' ') : ''].join(' | '));
    }

    /* ----- Liste ----- */
    function statutHtml(l) {
      const st = statut(l);
      return `<span class="statut ${st.ouvert ? 'statut-ok' : 'statut-ferme'} cm-st" data-st="${echap(l.id)}">${echap(st.txt)}</span>`;
    }
    function itemHtml(l) {
      const st = statut(l), cs = codeService(l);
      return `<li><button type="button" class="cm-item" data-lieu="${echap(l.id)}">
        <span class="cm-ic cm-t-${echap(l.type)}" aria-hidden="true">${iconeLieu(l)}</span>
        <span class="cm-item-txt"><strong>${echap(nomLieu(l))}</strong>
          <span class="cm-item-sous">${echap(typeLabel(l.type))} · ${echap(qLabel(l.quartier))}</span>
          <span class="cm-item-etat">${statutHtml(l)}<span class="cm-detail-st" data-std="${echap(l.id)}">${echap(st.detail)}</span>
            ${etat.q && l.quartier === etat.q ? `<span class="cm-tag cm-tag-proche"><i class="ph ph-map-pin" aria-hidden="true"></i>${echap(t('cm.dansQuartier'))}</span>` : ''}
            ${cs ? `<span class="cm-tag cm-tag-alerte"><i class="ph ph-wrench" aria-hidden="true"></i>${echap(t('cm.svc.' + cs))}</span>` : ''}</span>
        </span></button></li>`;
    }

    /* ----- Carte d'info urgences (F46) ----- */
    function carteUrgence() {
      const zone = $('cm-urgence-carte');
      if (etat.type !== 'urgence') { zone.innerHTML = ''; return; }
      const urg = LIEUX.filter(l => l.type === 'urgence');
      const h24 = urg.filter(l => l.ouvert24h);
      let proche = `<p class="cm-urg-choix">${echap(t('cm.u.choisirQ'))}</p>`;
      if (etat.q) {
        const tri = urg.slice().sort((a, b) => dist(a, etat.q) - dist(b, etat.q));
        const p = tri[0], p24 = tri.find(l => l.ouvert24h);
        const bouton = l => `<button type="button" class="cm-lien-lieu" data-lieu="${echap(l.id)}">${echap(nomLieu(l))}<small>${echap(qLabel(l.quartier))} · ${echap(phrase(l))}</small></button>`;
        proche = `<h3>${echap(t('cm.u.proche', { q: qLabel(etat.q) }))}</h3>${bouton(p)}` + (p24 && p24 !== p ? `<h3>${echap(t('cm.u.proche24'))}</h3>${bouton(p24)}` : '');
      }
      zone.innerHTML = `<section class="cm-urg" aria-labelledby="cm-urg-t">
        <h2 id="cm-urg-t"><i class="ph-duotone ph-first-aid-kit" aria-hidden="true"></i>${echap(t('cm.u.titre'))}</h2>
        <p>${echap(t('cm.u.note'))}</p>
        <div class="cm-appels">
          <a class="btn cm-appel" href="tel:15" aria-label="${echap(t('cm.appeler', { n: 15 }) + ', ' + t('cm.u.n15'))}"><span class="cm-num"><i class="ph-duotone ph-phone-call" aria-hidden="true"></i>15</span><small>${echap(t('cm.u.n15'))}</small></a>
          <a class="btn cm-appel" href="tel:112" aria-label="${echap(t('cm.appeler', { n: 112 }) + ', ' + t('cm.u.n112'))}"><span class="cm-num"><i class="ph-duotone ph-phone-call" aria-hidden="true"></i>112</span><small>${echap(t('cm.u.n112'))}</small></a>
        </div>
        <h3>${echap(t('cm.u.h24'))}</h3>
        <ul>${h24.map(l => `<li><button type="button" class="cm-lien-lieu" data-lieu="${echap(l.id)}">${echap(nomLieu(l))}<small>${echap(qLabel(l.quartier))} · ${echap(l.adresse)}</small></button></li>`).join('')}</ul>
        ${proche}
      </section>`;
    }

    /* ----- Rendu principal (liste + marqueurs + filtres) ----- */
    function rendre() {
      const liste = visibles(), ids = new Set(liste.map(l => l.id));
      $('cm-effacer').hidden = !$('cm-q').value;
      // boutons de filtre (mis à jour sur place : le focus reste)
      qa('[data-type]', $('cm-chips')).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.type === etat.type)));
      qa('[data-opt]', $('cm-opts')).forEach(b => b.setAttribute('aria-pressed', String(!!etat[b.dataset.opt])));
      $('cm-urgence').setAttribute('aria-pressed', String(etat.type === 'urgence'));
      // liste
      $('cm-liste').innerHTML = liste.length ? liste.map(itemHtml).join('') : `<li class="cm-liste-vide">${echap(t('cm.nb0'))}</li>`;
      carteUrgence();
      // marqueurs
      qa('.cm-pt').forEach(li => { li.hidden = !ids.has(li.dataset.pt); });
      qa('.cm-marqueur').forEach(b => b.classList.toggle('cm-proche', !!etat.q && parId(b.dataset.lieu).quartier === etat.q));
      qa('.cm-zone').forEach(z => z.classList.toggle('cm-zone-proche', !!etat.q && z.dataset.q === etat.q));
      qa('.cm-zone-t').forEach(z => z.classList.toggle('cm-zone-proche', !!etat.q && z.dataset.qt === etat.q));
      $('cm-filtres-nb').textContent = [etat.type ? 1 : 0, etat.ouverts ? 1 : 0, etat.pmr ? 1 : 0].reduce((a, b) => a + b, 0) || '';
      mettreEnAvant();
      // compteur (aria-live)
      const n = liste.length;
      $('cm-compteur').textContent = (n === 0 ? t('cm.nb0') : n === 1 ? t('cm.nb1') : t('cm.nbN', { n })) + (etat.q && n > 1 ? t('cm.nbTri', { q: qLabel(etat.q) }) : '');
      // fiche : fermée si le lieu n'est plus affiché
      if (etat.sel && !ids.has(etat.sel)) fermerFiche(false);
      majSelection();
    }
    function majSelection() {
      qa('[data-lieu]').forEach(b => { if (etat.sel && b.dataset.lieu === etat.sel) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
      qa('.cm-pt').forEach(li => li.classList.toggle('cm-actif', li.dataset.pt === etat.sel));
    }

    /* ----- Fiche du lieu (F45 : tout sur un seul écran) ----- */
    const fiche = $('cm-fiche'), grille = $('cm-grille');
    function departPour(vers) {
      let dep = 'gare';
      if (etat.q) dep = Object.keys(ARRETS).find(id => ARRETS[id][1] === etat.q && !FERMES[id]) || dep;
      if (dep === vers) dep = vers === 'mairie' ? 'gare' : 'mairie';
      return dep;
    }
    function rendreFiche() {
      const l = parId(etat.sel);
      if (!l) { fiche.hidden = true; fiche.innerHTML = ''; return; }
      const st = statut(l), svc = serviceDe(l), cs = codeService(l);
      const arret = arretEff(l.arret), lignes = lignesDe(arret);
      const lienTel = 'tel:' + l.tel.replace(/[^\d+]/g, '');
      const alerteSvc = cs ? `<div class="cm-alerte cm-alerte-${echap(cs)}" role="group" aria-label="${echap(t('cm.svc.' + cs))}">
          <i class="ph-duotone ${cs === 'incident' ? 'ph-warning-octagon' : 'ph-wrench'}" aria-hidden="true"></i>
          <div><p><strong>${echap(t('cm.svc.' + cs))}</strong></p><p>${echap(t('cm.svcAlerte', { s: NT.i18n.choisir(svc.nom) }))}</p>
          ${svc.etat.message ? `<p>${echap(svc.etat.message)}</p>` : ''}${svc.etat.retour ? `<p>${echap(t('cm.svcRetour') + svc.etat.retour)}</p>` : ''}</div></div>` : '';
      const canal = FERMES[l.arret] ? `<p class="cm-note"><i class="ph-duotone ph-warning" aria-hidden="true"></i><span>${echap(t('cm.canalFerme', { a: arretNom(l.arret), r: arretNom(FERMES[l.arret]) }))}</span></p>` : '';
      const urgence = l.type === 'urgence' ? `<p class="cm-fiche-urg">${echap(t('cm.danger'))} <a href="tel:15">15</a> ${echap(t('cm.ou'))} <a href="tel:112">112</a>.</p>` : '';
      fiche.innerHTML = `
        <div class="cm-fiche-tete">
          <span class="cm-ic cm-t-${echap(l.type)}" aria-hidden="true">${iconeLieu(l)}</span>
          <div><h2 id="cm-fiche-t">${echap(nomLieu(l))}</h2>
            <div class="cm-fiche-badges"><span class="cm-tag">${echap(typeLabel(l.type))}</span>
              <span id="cm-fiche-st">${statutHtml(l)}</span><span class="cm-detail-st" id="cm-fiche-std">${echap(st.detail)}</span></div></div>
          <button type="button" class="btn cm-fermer" data-fermer aria-label="${echap(t('cm.fermerFiche'))}"><i class="ph ph-x" aria-hidden="true"></i>${echap(t('cm.fermer'))}</button>
        </div>
        ${alerteSvc}${urgence}
        <dl class="cm-infos">
          <div><dt><i class="ph ph-map-pin" aria-hidden="true"></i>${echap(t('cm.adresse'))}</dt><dd>${echap(l.adresse)} <span class="cm-quartier-note">(${echap(qLabel(l.quartier))})</span></dd></div>
          <div><dt><i class="ph ph-clock" aria-hidden="true"></i>${echap(t('cm.horaires'))}</dt><dd>${echap(pick(l.hr))}</dd></div>
          <div><dt><i class="ph ph-phone" aria-hidden="true"></i>${echap(t('cm.tel'))}</dt><dd><a href="${echap(lienTel)}">${echap(l.tel)}</a></dd></div>
          <div><dt><i class="ph ph-wheelchair" aria-hidden="true"></i>${echap(t('cm.acces'))}</dt><dd>${echap(t(l.pmr ? 'cm.pmrOui' : 'cm.pmrNon'))}</dd></div>
        </dl>
        ${l.asso ? `<div class="cm-asso"><h3>${echap(t('as.aide'))}</h3><ul>${NT.assos.aide(l.asso).map(x => `<li>${echap(x)}</li>`).join('')}</ul>
          ${l.asso.info ? `<p class="cm-note"><i class="ph-duotone ph-info" aria-hidden="true"></i><span>${echap(l.asso.info)}</span></p>` : ''}
          <div class="cm-actions"><a class="btn btn-primaire" href="${echap(lienTel)}"><i class="ph ph-phone-call" aria-hidden="true"></i>${echap(t('as.appeler'))}</a>
          <a class="btn" href="services.html#asso-${encodeURIComponent(l.id.replace(/^asso-/, ''))}"><i class="ph ph-hand-heart" aria-hidden="true"></i>${echap(t('cm.fiche'))}</a></div></div>` : ''}
        ${l.canicule ? `<p class="cm-note" style="margin-top:.9rem"><i class="ph-duotone ph-snowflake" aria-hidden="true"></i><span>${echap(t('cm.chaleurNote'))} <a href="annonces.html#ann-chaleur">${echap(t('cm.chaleur'))}</a></span></p>` : ''}
        <div class="cm-aller" role="group" aria-labelledby="cm-aller-t">
          <h3 id="cm-aller-t">${echap(t('cm.yAller'))}</h3>
          <p><span class="cm-lignes">${lignes.map(id => `<span class="cm-lg cm-${id}">${id}</span>`).join('')}</span>
            <span class="sr-only">${echap(t('cm.lignes'))} ${lignes.join(', ')}.</span> ${echap(t('cm.arret'))} : <strong>${echap(arretNom(arret))}</strong></p>
          ${canal}
          <div class="cm-actions"><a class="btn btn-primaire" href="transports.html?de=${encodeURIComponent(departPour(arret))}&amp;vers=${encodeURIComponent(arret)}"><i class="ph ph-tram" aria-hidden="true"></i>${echap(t('cm.trajet'))}</a></div>
        </div>
        ${svc ? `<div class="cm-actions" style="margin-top:1rem">
          <a class="btn" href="services.html#${encodeURIComponent(svc.id)}"><i class="ph ph-info" aria-hidden="true"></i>${echap(t('cm.voirService'))}</a>
          ${svc.rdv ? `<a class="btn" href="rendez-vous.html?service=${encodeURIComponent(svc.id)}"><i class="ph ph-calendar-check" aria-hidden="true"></i>${echap(t('cm.rdv'))}</a>` : ''}</div>` : ''}`;
      fiche.hidden = false;
    }
    function majUrl() {
      try {
        const p = new URLSearchParams();
        if (etat.type === 'urgence') p.set('filtre', 'urgence');
        if (etat.sel) p.set('lieu', etat.sel);
        const s = p.toString();
        history.replaceState(null, '', location.pathname + (s ? '?' + s : ''));
      } catch (e) { /* ignoré */ }
    }
    function selectionner(id, opts) {
      const l = parId(id); if (!l) return;
      opts = opts || {};
      // un lieu masqué par les filtres doit rester sélectionnable depuis l'URL : on lève les filtres gênants
      if (!visibles().some(x => x.id === id)) { etat.type = ''; etat.ouverts = false; etat.pmr = false; $('cm-q').value = ''; rendre(); }
      etat.sel = id; etat.decl = opts.decl || 'liste';
      rendreFiche(); grille.classList.add('cm-avec-fiche'); if (NT.carteVolet) NT.carteVolet(true);
      dessinerSelection(l); majSelection(); majUrl();
      NT.ui.annoncer(t('cm.annonce.sel', { nom: nomLieu(l), st: phrase(l) }));
      if (opts.focus) fiche.focus();
    }
    function fermerFiche(rendreFocus) {
      const id = etat.sel; if (!id) return;
      etat.sel = null; fiche.hidden = true; fiche.innerHTML = '';
      grille.classList.remove('cm-avec-fiche');
      dessinerSelection(null); majSelection(); majUrl();
      if (rendreFocus) {
        NT.ui.annoncer(t('cm.annonce.ferme'));
        const cible = (etat.decl === 'marqueur' ? $('cm-marqueurs') : $('cm-zone-liste')).querySelector(`[data-lieu="${CSS.escape(id)}"]`) || $('cm-marqueurs').querySelector(`[data-lieu="${CSS.escape(id)}"]`);
        if (cible) cible.focus();
      }
    }

    /* ----- Mise à jour des statuts (horloge) sans reconstruire le DOM ----- */
    function majStatuts() {
      LIEUX.forEach(l => {
        const b = $('cm-marqueurs').querySelector(`[data-lieu="${CSS.escape(l.id)}"]`); if (b) b.setAttribute('aria-label', labelMarqueur(l));
        const st = statut(l);
        qa(`.cm-st[data-st="${CSS.escape(l.id)}"]`).forEach(el => { el.textContent = st.txt; el.className = 'statut ' + (st.ouvert ? 'statut-ok' : 'statut-ferme') + ' cm-st'; });
        qa(`[data-std="${CSS.escape(l.id)}"]`).forEach(el => { el.textContent = st.detail; });
      });
      if (etat.sel) { const el = $('cm-fiche-std'); if (el) el.textContent = statut(parId(etat.sel)).detail; }
    }

    /* ----- Événements ----- */
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-lieu]');
      if (b && ($('cm-marqueurs').contains(b) || $('cm-zone-liste').contains(b))) {
        selectionner(b.dataset.lieu, { focus: true, decl: $('cm-marqueurs').contains(b) ? 'marqueur' : 'liste' });
        return;
      }
      if (e.target.closest('[data-fermer]')) fermerFiche(true);
    });
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape' || !etat.sel) return;
      if (document.querySelector('sl-dialog[open], sl-drawer[open]')) return;
      e.preventDefault(); fermerFiche(true);
    });
    // survol / focus d'un élément de la liste : met le marqueur en évidence
    const survol = on => e => {
      const b = e.target.closest && e.target.closest('.cm-item, .cm-lien-lieu'); if (!b) return;
      const m = $('cm-marqueurs').querySelector(`[data-lieu="${CSS.escape(b.dataset.lieu)}"]`); if (m) m.classList.toggle('cm-survol', on);
    };
    $('cm-zone-liste').addEventListener('mouseover', survol(true)); $('cm-zone-liste').addEventListener('mouseout', survol(false));
    $('cm-zone-liste').addEventListener('focusin', survol(true)); $('cm-zone-liste').addEventListener('focusout', survol(false));

    $('cm-urgence').addEventListener('click', () => {
      etat.type = etat.type === 'urgence' ? '' : 'urgence';
      // la carte d'info urgences est dans la zone de liste : on referme la fiche pour la montrer tout de suite
      if (etat.sel) fermerFiche(false);
      rendre(); majUrl();
    });
    $('cm-chips').addEventListener('click', e => { const b = e.target.closest('[data-type]'); if (!b) return; etat.type = b.dataset.type; rendre(); majUrl(); });
    // lignes : survol sur le plan, choix par la légende (bouton) ou un clic sur le tracé
    const plan = $('cm-plan');
    plan.addEventListener('pointerover', e => {
      const l = e.target.closest('.cm-ligne, .cm-badge'), z = !l && e.target.closest('.cm-zone');
      etat.survolLigne = l ? l.dataset.ligne : ''; etat.survolZone = z ? z.dataset.q : ''; mettreEnAvant();
    });
    plan.addEventListener('pointerleave', () => { etat.survolLigne = ''; etat.survolZone = ''; mettreEnAvant(); });
    plan.addEventListener('click', e => {
      const l = e.target.closest('.cm-ligne, .cm-badge'), z = !l && e.target.closest('.cm-zone');
      if (l) { etat.ligne = etat.ligne === l.dataset.ligne ? '' : l.dataset.ligne; etat.zone = ''; }
      else if (z) { etat.zone = etat.zone === z.dataset.q ? '' : z.dataset.q; etat.ligne = ''; }
      else { etat.ligne = ''; etat.zone = ''; }
      mettreEnAvant();
    });
    $('cm-legende').addEventListener('click', e => { const b = e.target.closest('[data-ligne-btn]'); if (!b) return; etat.ligne = etat.ligne === b.dataset.ligneBtn ? '' : b.dataset.ligneBtn; etat.zone = ''; mettreEnAvant(); });
    $('cm-legende').addEventListener('pointerover', e => { const b = e.target.closest('[data-ligne-btn]'); etat.survolLigne = b ? b.dataset.ligneBtn : ''; mettreEnAvant(); });
    $('cm-legende').addEventListener('pointerleave', () => { etat.survolLigne = ''; mettreEnAvant(); });
    $('cm-legende').addEventListener('focusin', e => { const b = e.target.closest('[data-ligne-btn]'); if (b) { etat.survolLigne = b.dataset.ligneBtn; mettreEnAvant(); } });
    $('cm-legende').addEventListener('focusout', () => { etat.survolLigne = ''; mettreEnAvant(); });
    $('cm-info-fermer').addEventListener('click', () => { etat.ligne = ''; etat.zone = ''; mettreEnAvant(); });
    // mon quartier : celui du profil d'un clic
    $('cm-mon-q').hidden = !qUser;
    $('cm-mon-q').addEventListener('click', () => { if (!qUser) return; etat.q = qUser; $('cm-quartier').value = qUser; rendre(); if (etat.sel) rendreFiche(); pulserQuartier(qUser); });
    // volet mobile : replié (recherche visible), déplié (filtres, liste, fiche)
    const volet = $('cm-aside'), poignee = $('cm-poignee');
    const deplier = ouvert => { volet.classList.toggle('cm-ouvert', ouvert); poignee.setAttribute('aria-expanded', String(ouvert)); };
    poignee.addEventListener('click', () => deplier(!volet.classList.contains('cm-ouvert')));
    $('cm-q').addEventListener('focus', () => deplier(true));
    NT.carteVolet = deplier;
    $('cm-opts').addEventListener('click', e => { const b = e.target.closest('[data-opt]'); if (!b) return; etat[b.dataset.opt] = !etat[b.dataset.opt]; rendre(); });
    $('cm-q').addEventListener('input', rendre);
    $('cm-form').addEventListener('submit', e => { e.preventDefault(); rendre(); });
    $('cm-effacer').addEventListener('click', () => { $('cm-q').value = ''; rendre(); $('cm-q').focus(); });
    $('cm-quartier').addEventListener('change', e => { etat.q = e.target.value; rendre(); if (etat.sel) rendreFiche(); pulserQuartier(etat.q); });

    /* ----- Démarrage ----- */
    dessinerPlan(); dessinerMarqueurs(); dessinerLegende(); dessinerControles();
    try {
      const calme = matchMedia('(prefers-reduced-motion: reduce)').matches || NT.leger.actif() || NT.econome.actif() || document.documentElement.classList.contains('calme');
      if (!calme && !sessionStorage.getItem('nt:carteDessinee')) {
        carteEl.classList.add('cm-dessin'); sessionStorage.setItem('nt:carteDessinee', '1');
        setTimeout(() => carteEl.classList.remove('cm-dessin'), 2200);
      }
    } catch (e) { /* stockage bloqué : pas d'animation */ }
    if (qUser) setTimeout(() => pulserQuartier(qUser), 1300);
    const defile = document.querySelector('.cm-defile');
    if (defile && defile.scrollWidth > defile.clientWidth) defile.scrollLeft = (defile.scrollWidth - defile.clientWidth) / 2;
    const filtreUrl = NT.ui.param('filtre'), lieuUrl = NT.ui.param('lieu');
    if (filtreUrl === 'urgence') etat.type = 'urgence';
    rendre();
    if (lieuUrl && parId(lieuUrl)) selectionner(lieuUrl, { decl: 'marqueur' });
    NT.i18n.appliquer();
    setInterval(majStatuts, NT.econome.delai(60000));
  });
})();
