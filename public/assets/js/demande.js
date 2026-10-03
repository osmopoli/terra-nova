/* Terra Nova — demande.html : formulaire guidé (D04 contact, F25 signalement, démarche) + confirmation immédiate (D16). */
(function () {
  'use strict';
  const NT = window.NT;
  const EN = {
    'dem.ariane': 'Make a request', 'dem.titre': 'Make a request',
    'dem.intro': 'Choose what you want to do and we will guide you. You will get a tracking number as soon as it is sent.',
    'dem.typeLegende': 'What would you like to do?',
    'dem.t.contact': 'Contact a service', 'dem.t.contactD': 'Ask a question or explain a difficulty.',
    'dem.t.signalement': 'Report a problem', 'dem.t.signalementD': 'Broken streetlight, waste, leak: we find the right service.',
    'dem.t.demarche': 'Start a procedure', 'dem.t.demarcheD': 'Certificate, change of address, permit, aid.',
    'dem.service': 'Service concerned', 'dem.serviceAide': 'If you are unsure, choose “I don’t know”: the city hall will redirect you.',
    'dem.objet': 'Subject', 'dem.objetAide': 'In a few words, for example “Question about my bill”.',
    'dem.message': 'Your message', 'dem.messageAide': 'Explain your question or difficulty with as much detail as possible.',
    'dem.visiteur': 'You are not signed in: enter your name and e-mail to receive the answer.',
    'dem.nom': 'Full name', 'dem.email': 'E-mail address for the answer', 'dem.emailAide': 'Example: first.last@example.com',
    'dem.categorie': 'What is the problem?', 'dem.categorieAide': 'The competent service is chosen automatically.',
    'dem.description': 'What happened?', 'dem.descriptionAide': 'For example: “The streetlight in front of number 12 has been off for three days.”',
    'dem.lieuLegende': 'Where is the problem?', 'dem.adresse': 'Address or landmark', 'dem.adresseAide': 'Street number and name, or a known place (shuttle stop, square…).',
    'dem.quartier': 'District', 'dem.quartierAide': 'Pick from the list or tap a district on the map.',
    'dem.urgence': 'Is it urgent?', 'dem.urgNormale': 'Normal', 'dem.urgNormaleD': 'Annoying, no immediate danger',
    'dem.urgDanger': 'Dangerous', 'dem.urgDangerD': 'Handled as a priority',
    'dem.photo': 'Photo (optional)', 'dem.photoAide': 'A photo helps the team act faster. It is resized automatically.', 'dem.photoRetirer': 'Remove the photo',
    'dem.nature': 'Type of procedure', 'dem.precisions': 'Details (optional)', 'dem.precisionsAide': 'Anything that can help the service: dates, file number, situation.',
    'dem.envoyer': 'Send the request', 'dem.annuler': 'Cancel'
  };
  const ES = {
    'dem.ariane': 'Hacer una solicitud', 'dem.titre': 'Hacer una solicitud',
    'dem.intro': 'Elija lo que quiere hacer y le guiaremos. Recibirá un número de seguimiento en cuanto se envíe.',
    'dem.typeLegende': '¿Qué desea hacer?',
    'dem.t.contact': 'Contactar con un servicio', 'dem.t.contactD': 'Hacer una pregunta o explicar una dificultad.',
    'dem.t.signalement': 'Avisar de un problema', 'dem.t.signalementD': 'Farola rota, residuos, fuga: encontramos el servicio adecuado.',
    'dem.t.demarche': 'Iniciar un trámite', 'dem.t.demarcheD': 'Certificado, cambio de domicilio, licencia, ayuda.',
    'dem.service': 'Servicio correspondiente', 'dem.serviceAide': 'Si tiene dudas, elija «No lo sé»: el ayuntamiento le orientará.',
    'dem.objet': 'Asunto', 'dem.objetAide': 'En pocas palabras, por ejemplo «Pregunta sobre mi factura».',
    'dem.message': 'Su mensaje', 'dem.messageAide': 'Explique su pregunta o dificultad con el mayor detalle posible.',
    'dem.visiteur': 'No ha iniciado sesión: indique su nombre y su correo para recibir la respuesta.',
    'dem.nom': 'Nombre y apellidos', 'dem.email': 'Correo electrónico para la respuesta', 'dem.emailAide': 'Ejemplo: nombre.apellido@ejemplo.es',
    'dem.categorie': '¿Cuál es el problema?', 'dem.categorieAide': 'El servicio competente se elige automáticamente.',
    'dem.description': '¿Qué ha pasado?', 'dem.descriptionAide': 'Por ejemplo: «La farola frente al número 12 lleva tres días apagada».',
    'dem.lieuLegende': '¿Dónde está el problema?', 'dem.adresse': 'Dirección o punto de referencia', 'dem.adresseAide': 'Número y nombre de la calle, o un lugar conocido (parada de lanzadera, plaza…).',
    'dem.quartier': 'Barrio', 'dem.quartierAide': 'Elija en la lista o pulse un barrio en el plano.',
    'dem.urgence': '¿Es urgente?', 'dem.urgNormale': 'Normal', 'dem.urgNormaleD': 'Molesto, sin peligro inmediato',
    'dem.urgDanger': 'Peligroso', 'dem.urgDangerD': 'Tratado con prioridad',
    'dem.photo': 'Foto (opcional)', 'dem.photoAide': 'Una foto ayuda al equipo a actuar más rápido. Se redimensiona automáticamente.', 'dem.photoRetirer': 'Quitar la foto',
    'dem.nature': 'Tipo de trámite', 'dem.precisions': 'Detalles (opcional)', 'dem.precisionsAide': 'Todo lo que pueda ayudar al servicio: fechas, número de expediente, situación.',
    'dem.envoyer': 'Enviar la solicitud', 'dem.annuler': 'Cancelar'
  };
  const AR = {
    'dem.ariane': 'تقديم طلب', 'dem.titre': 'تقديم طلب',
    'dem.intro': 'اختر ما تريد القيام به وسنرشدك. ستحصل على رقم متابعة فور الإرسال.',
    'dem.typeLegende': 'ماذا تريد أن تفعل؟',
    'dem.t.contact': 'التواصل مع خدمة', 'dem.t.contactD': 'اطرح سؤالاً أو اشرح صعوبة.',
    'dem.t.signalement': 'الإبلاغ عن مشكلة', 'dem.t.signalementD': 'عمود إنارة معطل، نفايات، تسرب: نجد الخدمة المناسبة.',
    'dem.t.demarche': 'بدء إجراء', 'dem.t.demarcheD': 'شهادة، تغيير عنوان، رخصة، مساعدة.',
    'dem.service': 'الخدمة المعنية', 'dem.serviceAide': 'إذا لم تكن متأكداً، اختر «لا أعرف»: ستوجّهك البلدية.',
    'dem.objet': 'الموضوع', 'dem.objetAide': 'بكلمات قليلة، مثلاً «سؤال حول فاتورتي».',
    'dem.message': 'رسالتك', 'dem.messageAide': 'اشرح سؤالك أو صعوبتك بأكبر قدر من التفاصيل.',
    'dem.visiteur': 'لم تسجّل الدخول: أدخل اسمك وبريدك الإلكتروني لتلقي الرد.',
    'dem.nom': 'الاسم الكامل', 'dem.email': 'البريد الإلكتروني لتلقي الرد', 'dem.emailAide': 'مثال: name@example.com',
    'dem.categorie': 'ما هي المشكلة؟', 'dem.categorieAide': 'تُختار الخدمة المختصة تلقائياً.',
    'dem.description': 'ماذا حدث؟', 'dem.descriptionAide': 'مثلاً: «عمود الإنارة أمام الرقم 12 مطفأ منذ ثلاثة أيام».',
    'dem.lieuLegende': 'أين توجد المشكلة؟', 'dem.adresse': 'العنوان أو معلم قريب', 'dem.adresseAide': 'رقم الشارع واسمه، أو مكان معروف (محطة حافلة، ساحة…).',
    'dem.quartier': 'الحي', 'dem.quartierAide': 'اختر من القائمة أو اضغط على حي في المخطط.',
    'dem.urgence': 'هل الأمر مستعجل؟', 'dem.urgNormale': 'عادي', 'dem.urgNormaleD': 'مزعج، دون خطر فوري',
    'dem.urgDanger': 'خطير', 'dem.urgDangerD': 'يُعالج بالأولوية',
    'dem.photo': 'صورة (اختياري)', 'dem.photoAide': 'تساعد الصورة الفريق على التدخل بسرعة. يُعاد تحجيمها تلقائياً.', 'dem.photoRetirer': 'إزالة الصورة',
    'dem.nature': 'نوع الإجراء', 'dem.precisions': 'تفاصيل (اختياري)', 'dem.precisionsAide': 'كل ما يمكن أن يساعد الخدمة: تواريخ، رقم ملف، الوضع.',
    'dem.envoyer': 'إرسال الطلب', 'dem.annuler': 'إلغاء'
  };
  NT.i18n.ajouter({
    fr: { 'dem.ariane': 'Faire une demande' },
    en: EN, es: ES, ar: AR
  });
  /* Phrases avec variables (toutes langues) */
  NT.i18n.ajouter({
    fr: { 'dem.nbErreurs': 'Le formulaire contient {n} erreurs', 'dem.transmis': 'Votre demande est transmise au service « {s} ».', 'dem.reponseA': 'La réponse sera envoyée à {e}.', 'dem.votreEmail': 'votre adresse e-mail', 'dem.delaiPhrase': 'Délai de réponse indicatif : {d}.', 'dem.envoyeeNum': 'Votre demande a bien été envoyée. Numéro {n}.' },
    en: { 'dem.nbErreurs': 'The form contains {n} errors', 'dem.transmis': 'Your request has been passed to the “{s}” service.', 'dem.reponseA': 'The answer will be sent to {e}.', 'dem.votreEmail': 'your e-mail address', 'dem.delaiPhrase': 'Estimated response time: {d}.', 'dem.envoyeeNum': 'Your request has been sent. Number {n}.' },
    es: { 'dem.nbErreurs': 'El formulario contiene {n} errores', 'dem.transmis': 'Su solicitud se ha enviado al servicio «{s}».', 'dem.reponseA': 'La respuesta se enviará a {e}.', 'dem.votreEmail': 'su correo electrónico', 'dem.delaiPhrase': 'Plazo de respuesta orientativo: {d}.', 'dem.envoyeeNum': 'Su solicitud se ha enviado correctamente. Número {n}.' },
    ar: { 'dem.nbErreurs': 'يحتوي النموذج على {n} أخطاء', 'dem.transmis': 'أُحيل طلبك إلى خدمة «{s}».', 'dem.reponseA': 'سيُرسل الرد إلى {e}.', 'dem.votreEmail': 'بريدك الإلكتروني', 'dem.delaiPhrase': 'مهلة الرد التقريبية: {d}.', 'dem.envoyeeNum': 'تم إرسال طلبك بنجاح. الرقم {n}.' }
  });

  /* F63 / F64 : état du service avant de commencer */
  NT.i18n.ajouter({
    fr: { 'dem.perturbeSuite': 'Vous pouvez tout de même envoyer votre demande : elle sera traitée dès que possible.', 'dem.errDesactive': 'Ce service est indisponible : la démarche ne peut pas être commencée en ligne. Utilisez la prochaine action possible indiquée sous le service.' },
    en: { 'dem.perturbeSuite': 'You can still send your request: it will be handled as soon as possible.', 'dem.errDesactive': 'This service is unavailable: the procedure cannot be started online. Use the next possible action shown under the service.' },
    es: { 'dem.perturbeSuite': 'Puede enviar su solicitud de todos modos: se tratará lo antes posible.', 'dem.errDesactive': 'Este servicio no está disponible: el trámite no puede empezarse en línea. Use la próxima acción posible indicada bajo el servicio.' },
    ar: { 'dem.perturbeSuite': 'يمكنك مع ذلك إرسال طلبك: ستتم معالجته في أقرب وقت.', 'dem.errDesactive': 'هذه الخدمة غير متاحة: لا يمكن بدء الإجراء عبر الإنترنت. استعمل الإجراء الممكن التالي المبيّن تحت الخدمة.' }
  });
  /* Textes courts : FR et EN dans l'appel bi(fr, en) ; ES et AR dans cette table (clé = texte FR), repli sur EN. */
  const TR = {
    'Service à déterminer': ['Servicio por determinar', 'خدمة يتم تحديدها لاحقاً'],
    'Choisir un service…': ['Elegir un servicio…', 'اختر خدمة…'], 'Je ne sais pas': ['No lo sé', 'لا أعرف'],
    'Choisir la démarche…': ['Elegir el trámite…', 'اختر الإجراء…'], 'Choisir un quartier…': ['Elegir un barrio…', 'اختر حيّاً…'],
    'Plan des cinq quartiers de Terra Nova': ['Plano de los cinco barrios de Terra Nova', 'مخطط أحياء تيرا نوفا الخمسة'],
    'Quartier ': ['Barrio ', 'حي '], 'Quartier choisi : ': ['Barrio elegido: ', 'الحي المختار: '],
    'Choisissez le problème : nous indiquerons ici le service qui le traitera.': ['Elija el problema: aquí indicaremos el servicio que lo tratará.', 'اختر المشكلة: سنبيّن هنا الخدمة التي ستعالجها.'],
    'Votre signalement sera transmis à : ': ['Su aviso se enviará a: ', 'سيُحال بلاغك إلى: '], 'Formulaire : ': ['Formulario: ', 'النموذج: '],
    'Ce fichier n’est pas une image. Choisissez une photo (JPEG, PNG…).': ['Este archivo no es una imagen. Elija una foto (JPEG, PNG…).', 'هذا الملف ليس صورة. اختر صورة (JPEG، PNG…).'],
    'Aperçu de la photo jointe': ['Vista previa de la foto adjunta', 'معاينة الصورة المرفقة'], 'Photo ajoutée': ['Foto añadida', 'تمت إضافة الصورة'], 'Photo retirée': ['Foto retirada', 'تمت إزالة الصورة'],
    'Impossible de lire cette photo. Essayez une autre image ou envoyez sans photo.': ['No se pudo leer esta foto. Pruebe otra imagen o envíe sin foto.', 'تعذّر قراءة هذه الصورة. جرّب صورة أخرى أو أرسل بدون صورة.'],
    'Choisissez le service concerné, ou « Je ne sais pas ».': ['Elija el servicio correspondiente o «No lo sé».', 'اختر الخدمة المعنية أو «لا أعرف».'],
    'Indiquez l’objet de votre message (3 caractères minimum).': ['Indique el asunto de su mensaje (mínimo 3 caracteres).', 'أدخل موضوع رسالتك (3 أحرف على الأقل).'],
    'Écrivez votre message (10 caractères minimum).': ['Escriba su mensaje (mínimo 10 caracteres).', 'اكتب رسالتك (10 أحرف على الأقل).'],
    'Choisissez le type de problème.': ['Elija el tipo de problema.', 'اختر نوع المشكلة.'],
    'Décrivez ce qui s’est passé (10 caractères minimum).': ['Describa lo ocurrido (mínimo 10 caracteres).', 'صف ما حدث (10 أحرف على الأقل).'],
    'Indiquez l’adresse ou un repère où se trouve le problème.': ['Indique la dirección o un punto de referencia del problema.', 'أدخل العنوان أو معلماً يحدد مكان المشكلة.'],
    'Choisissez le quartier, dans la liste ou sur le plan.': ['Elija el barrio, en la lista o en el plano.', 'اختر الحي من القائمة أو على المخطط.'],
    'Choisissez le service concerné.': ['Elija el servicio correspondiente.', 'اختر الخدمة المعنية.'], 'Choisissez la nature de la démarche.': ['Elija el tipo de trámite.', 'اختر نوع الإجراء.'],
    'Indiquez votre nom pour que nous puissions vous répondre.': ['Indique su nombre para que podamos responderle.', 'أدخل اسمك حتى نتمكن من الرد عليك.'],
    'Indiquez une adresse e-mail valide, par exemple prenom.nom@exemple.fr.': ['Indique un correo electrónico válido, por ejemplo nombre.apellido@ejemplo.es.', 'أدخل بريداً إلكترونياً صالحاً، مثل name@example.com.'],
    'Le formulaire contient 1 erreur': ['El formulario contiene 1 error', 'يحتوي النموذج على خطأ واحد'], 'Démarche : ': ['Trámite: ', 'الإجراء: '],
    'Envoi en cours…': ['Enviando…', 'جارٍ الإرسال…'], 'Envoyer la demande': ['Enviar la solicitud', 'إرسال الطلب'], 'L’envoi a échoué': ['El envío ha fallado', 'فشل الإرسال'],
    'Votre demande n’a pas pu être enregistrée. Vérifiez votre connexion, retirez la photo si vous en avez joint une, puis réessayez.': ['Su solicitud no se pudo guardar. Compruebe su conexión, retire la foto si adjuntó una y vuelva a intentarlo.', 'تعذّر تسجيل طلبك. تحقق من اتصالك، وأزل الصورة إن كنت أرفقت واحدة، ثم أعد المحاولة.'],
    'À déterminer : la mairie orientera votre demande': ['Por determinar: el ayuntamiento orientará su solicitud', 'يُحدَّد لاحقاً: ستوجّه البلدية طلبك'],
    'Type': ['Tipo', 'النوع'], 'Objet': ['Asunto', 'الموضوع'], 'Message': ['Mensaje', 'الرسالة'], 'Lieu': ['Lugar', 'المكان'], 'Urgence': ['Urgencia', 'درجة الاستعجال'],
    'Dangereux, traité en priorité': ['Peligroso, tratado con prioridad', 'خطير، يُعالج بالأولوية'], 'Normale': ['Normal', 'عادية'], 'Photo': ['Foto', 'الصورة'],
    'Photo jointe à la demande': ['Foto adjunta a la solicitud', 'صورة مرفقة بالطلب'], 'Réponse envoyée à': ['Respuesta enviada a', 'تُرسل الإجابة إلى'],
    'Vous êtes prévenu dans votre espace à chaque étape : reçue, en cours, traitée.': ['Se le avisa en su espacio en cada etapa: recibida, en curso, resuelta.', 'ستُخطر في فضائك عند كل مرحلة: مستلمة، قيد المعالجة، تمت المعالجة.'],
    'Suivre ma demande': ['Seguir mi solicitud', 'متابعة طلبي'], 'Me connecter pour suivre ma demande': ['Iniciar sesión para seguir mi solicitud', 'تسجيل الدخول لمتابعة طلبي'],
    'Votre demande a bien été envoyée': ['Su solicitud se ha enviado correctamente', 'تم إرسال طلبك بنجاح'],
    'Gardez ce numéro : il vous permet de retrouver votre demande.': ['Guarde este número: le permite encontrar su solicitud.', 'احتفظ بهذا الرقم: يتيح لك العثور على طلبك.'],
    'Numéro de demande': ['Número de solicitud', 'رقم الطلب'], 'Copier le numéro': ['Copiar el número', 'نسخ الرقم'], 'Ce que vous avez envoyé': ['Lo que ha enviado', 'ما أرسلته'],
    'Service destinataire': ['Servicio destinatario', 'الخدمة المستلمة'], 'Délai de réponse indicatif : ': ['Plazo de respuesta orientativo: ', 'مهلة الرد التقريبية: '],
    'Et maintenant ?': ['¿Y ahora?', 'وماذا بعد؟'], 'Retour à l’accueil': ['Volver al inicio', 'العودة إلى الرئيسية'], 'Faire une autre demande': ['Hacer otra solicitud', 'تقديم طلب آخر'],
    'Demande envoyée': ['Solicitud enviada', 'تم إرسال الطلب'], 'Numéro copié : ': ['Número copiado: ', 'تم نسخ الرقم: '],
    'Copie impossible, notez le numéro ': ['No se pudo copiar, anote el número ', 'تعذّر النسخ، دوّن الرقم '],
    /* catégories de signalement */
    'Éclairage public': ['Alumbrado público', 'الإنارة العامة'], 'Lampadaire éteint ou cassé': ['Farola apagada o rota', 'عمود إنارة مطفأ أو مكسور'],
    'Chaussée et trottoirs': ['Calzada y aceras', 'الطريق والأرصفة'], 'Trou, trottoir abîmé': ['Bache, acera dañada', 'حفرة، رصيف متضرر'],
    'Déchets et propreté': ['Residuos y limpieza', 'النفايات والنظافة'], 'Conteneur plein, dépôt sauvage': ['Contenedor lleno, vertido ilegal', 'حاوية ممتلئة، رمي عشوائي'],
    'Eau et fuites': ['Agua y fugas', 'الماء والتسربات'], 'Fuite, coupure, eau trouble': ['Fuga, corte, agua turbia', 'تسرب، انقطاع، ماء عكر'],
    'Bruit et nuisances': ['Ruido y molestias', 'الضجيج والإزعاج'], 'Bruit répété, gêne du voisinage': ['Ruido repetido, molestias vecinales', 'ضجيج متكرر، إزعاج من الجوار'],
    'Autre problème': ['Otro problema', 'مشكلة أخرى'], 'Nous l’orienterons vers le bon service': ['Lo dirigiremos al servicio adecuado', 'سنوجّهه إلى الخدمة المناسبة'],
    /* natures de démarche */
    'Acte de naissance': ['Certificado de nacimiento', 'شهادة ميلاد'], 'Acte de mariage': ['Certificado de matrimonio', 'عقد زواج'], 'Changement d’adresse': ['Cambio de domicilio', 'تغيير العنوان'],
    'Papiers d’identité': ['Documentos de identidad', 'وثائق الهوية'], 'Aide au logement': ['Ayuda a la vivienda', 'مساعدة السكن'], 'Autorisation de travaux': ['Licencia de obras', 'رخصة أشغال'],
    'Inscription scolaire ou crèche': ['Inscripción escolar o guardería', 'التسجيل المدرسي أو الحضانة'], 'Accompagnement emploi ou formation': ['Acompañamiento de empleo o formación', 'مرافقة في التوظيف أو التكوين'],
    'Aide sociale': ['Ayuda social', 'مساعدة اجتماعية'], 'Autre démarche': ['Otro trámite', 'إجراء آخر'],
    /* délais et types */
    '3 jours ouvrés': ['3 días laborables', '3 أيام عمل'], '48 heures': ['48 horas', '48 ساعة'], '4 heures (urgence)': ['4 horas (urgencia)', '4 ساعات (استعجال)'], '5 jours ouvrés': ['5 días laborables', '5 أيام عمل'],
    'Contact': ['Contacto', 'تواصل'], 'Signalement': ['Aviso', 'بلاغ'], 'Démarche': ['Trámite', 'إجراء']
  };
  const bi = (fr, en) => { const l = NT.i18n.langue; if (l === 'fr') return fr; const x = TR[fr]; return (l === 'es' && x && x[0]) || (l === 'ar' && x && x[1]) || en; };
  const { echap, $, $$ } = NT.ui;
  const nomService = s => (s ? NT.i18n.choisir(s.nom) : bi('Service à déterminer', 'Service to be determined'));

  const CATEGORIES = [
    { id: 'eclairage', service: 'voirie', icone: 'ph-lightbulb', fr: 'Éclairage public', en: 'Street lighting', dfr: 'Lampadaire éteint ou cassé', den: 'Streetlight off or broken' },
    { id: 'chaussee', service: 'voirie', icone: 'ph-road-horizon', fr: 'Chaussée et trottoirs', en: 'Road and pavements', dfr: 'Trou, trottoir abîmé', den: 'Pothole, damaged pavement' },
    { id: 'dechets', service: 'dechets', icone: 'ph-trash', fr: 'Déchets et propreté', en: 'Waste and cleanliness', dfr: 'Conteneur plein, dépôt sauvage', den: 'Full bin, illegal dumping' },
    { id: 'eau', service: 'eau-energie', icone: 'ph-drop', fr: 'Eau et fuites', en: 'Water and leaks', dfr: 'Fuite, coupure, eau trouble', den: 'Leak, outage, cloudy water' },
    { id: 'bruit', service: 'dechets', icone: 'ph-speaker-high', fr: 'Bruit et nuisances', en: 'Noise and nuisances', dfr: 'Bruit répété, gêne du voisinage', den: 'Repeated noise, neighbourhood nuisance' },
    { id: 'autre', service: 'voirie', icone: 'ph-dots-three-circle', fr: 'Autre problème', en: 'Other problem', dfr: 'Nous l’orienterons vers le bon service', den: 'We will route it to the right service' }
  ];
  const NATURES = [
    { id: 'naissance', fr: 'Acte de naissance', en: 'Birth certificate', service: 'etat-civil' },
    { id: 'mariage', fr: 'Acte de mariage', en: 'Marriage certificate', service: 'etat-civil' },
    { id: 'adresse', fr: 'Changement d’adresse', en: 'Change of address', service: 'etat-civil' },
    { id: 'identite', fr: 'Papiers d’identité', en: 'ID papers', service: 'etat-civil' },
    { id: 'logement', fr: 'Aide au logement', en: 'Housing aid', service: 'logement' },
    { id: 'travaux', fr: 'Autorisation de travaux', en: 'Building permit', service: 'urbanisme' },
    { id: 'ecole', fr: 'Inscription scolaire ou crèche', en: 'School or nursery enrolment', service: 'education' },
    { id: 'emploi', fr: 'Accompagnement emploi ou formation', en: 'Job or training support', service: 'emploi' },
    { id: 'aide', fr: 'Aide sociale', en: 'Social support', service: 'social' },
    { id: 'autre', fr: 'Autre démarche', en: 'Other procedure', service: '' }
  ];
  const DELAIS = {
    contact: ['3 jours ouvrés', '3 working days'],
    signalement: ['48 heures', '48 hours'],
    signalementHaut: ['4 heures (urgence)', '4 hours (urgent)'],
    demarche: ['5 jours ouvrés', '5 working days']
  };
  const TYPES = { contact: ['Contact', 'Contact'], signalement: ['Signalement', 'Problem report'], demarche: ['Démarche', 'Procedure'] };

  NT.pret(() => {
    const u = NT.auth.utilisateur();
    const form = $('#form-demande');
    const services = NT.services.tous();
    let type = 'contact';
    let photo = '';
    let envoi = false;
    let quartier = '';

    /* ---------- Listes dynamiques ---------- */
    const optionsServices = (avecInconnu) =>
      `<option value="">${echap(bi('Choisir un service…', 'Choose a service…'))}</option>` +
      (avecInconnu ? `<option value="inconnu">${echap(bi('Je ne sais pas', 'I don’t know'))}</option>` : '') +
      services.map(s => `<option value="${echap(s.id)}">${echap(nomService(s))}</option>`).join('');
    $('#c-service').innerHTML = optionsServices(true);
    $('#d-service').innerHTML = optionsServices(false);
    $('#d-nature').innerHTML = `<option value="">${echap(bi('Choisir la démarche…', 'Choose the procedure…'))}</option>` +
      NATURES.map(n => `<option value="${n.id}">${echap(bi(n.fr, n.en))}</option>`).join('');
    $('#s-quartier').innerHTML = `<option value="">${echap(bi('Choisir un quartier…', 'Choose a district…'))}</option>` +
      NT.QUARTIERS.map(q => `<option value="${echap(q)}">${echap(q)}</option>`).join('');
    $('#s-categorie-liste').innerHTML = CATEGORIES.map(c => `
      <label class="dm-choix compact"><input type="radio" name="categorie" value="${c.id}">
        <span class="dm-choix-corps"><i class="ph-duotone ${c.icone} dm-ico" aria-hidden="true"></i>
        <span><strong>${echap(bi(c.fr, c.en))}</strong><br><span class="doux">${echap(bi(c.dfr, c.den))}</span></span></span>
        <i class="ph-duotone ph-check-circle dm-coche" aria-hidden="true"></i></label>`).join('');

    if (!u) $('#c-visiteur').hidden = false;
    if (u && u.quartier) { $('#s-quartier').value = u.quartier; quartier = u.quartier; }

    /* Nature de démarche -> propose le service correspondant */
    $('#d-nature').addEventListener('change', e => {
      const n = NATURES.find(x => x.id === e.target.value);
      if (n && n.service && !$('#d-service').value) { $('#d-service').value = n.service; majEtatService('d'); }
    });

    /* ---------- Plan SVG des 5 quartiers ---------- */
    (function planQuartiers() {
      const R = 112, r = 42, C = 120, ns = 'http://www.w3.org/2000/svg';
      const pt = (rayon, deg) => { const a = deg * Math.PI / 180; return [(C + rayon * Math.cos(a)).toFixed(2), (C + rayon * Math.sin(a)).toFixed(2)]; };
      const secteur = (a1, a2) => { const o1 = pt(R, a1), o2 = pt(R, a2), i2 = pt(r, a2), i1 = pt(r, a1);
        return `M${o1} A${R} ${R} 0 0 1 ${o2} L${i2} A${r} ${r} 0 0 0 ${i1} Z`; };
      const zones = [['Nord', -133, -47], ['Est', -43, 43], ['Sud', 47, 133], ['Ouest', 137, 223]];
      let html = `<svg viewBox="0 0 240 240" role="group" aria-label="${echap(bi('Plan des cinq quartiers de Terra Nova', 'Map of the five districts of Terra Nova'))}" xmlns="${ns}">
        <circle class="dm-dome" cx="${C}" cy="${C}" r="${R + 6}"/>`;
      zones.forEach(([nom, a1, a2]) => {
        const m = pt(77, (a1 + a2) / 2);
        html += `<g class="dm-zone" role="button" tabindex="0" aria-pressed="false" data-q="${nom}" aria-label="${echap(bi('Quartier ', 'District '))}${nom}">
          <path d="${secteur(a1, a2)}"/><text x="${m[0]}" y="${m[1]}">${nom}</text></g>`;
      });
      html += `<g class="dm-zone" role="button" tabindex="0" aria-pressed="false" data-q="Centre" aria-label="${echap(bi('Quartier ', 'District '))}Centre">
        <circle cx="${C}" cy="${C}" r="${r - 4}"/><text x="${C}" y="${C}">Centre</text></g></svg>`;
      const plan = $('#plan-quartiers');
      plan.innerHTML = html;
      plan.addEventListener('click', e => { const g = e.target.closest('.dm-zone'); if (g) fixerQuartier(g.dataset.q, true); });
      plan.addEventListener('keydown', e => {
        const g = e.target.closest('.dm-zone'); if (!g) return;
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fixerQuartier(g.dataset.q, true); }
      });
    })();
    function fixerQuartier(q, depuisPlan) {
      quartier = q;
      $('#s-quartier').value = q;
      majPlan();
      effacerErreur('s-quartier');
      if (depuisPlan) NT.ui.annoncer(bi('Quartier choisi : ', 'District selected: ') + q);
    }
    function majPlan() { $$('.dm-zone').forEach(g => g.setAttribute('aria-pressed', String(g.dataset.q === quartier))); }
    $('#s-quartier').addEventListener('change', e => { quartier = e.target.value; majPlan(); effacerErreur('s-quartier'); });
    majPlan();

    /* ---------- Destinataire automatique du signalement ---------- */
    function categorieChoisie() { const r = $('input[name=categorie]:checked'); return r ? CATEGORIES.find(c => c.id === r.value) : null; }
    function majDestinataire() {
      const c = categorieChoisie();
      const t = $('#s-dest-texte');
      if (!c) { t.textContent = bi('Choisissez le problème : nous indiquerons ici le service qui le traitera.', 'Choose the problem: the service that will handle it will appear here.'); return; }
      const s = NT.services.get(c.service);
      t.innerHTML = `${echap(bi('Votre signalement sera transmis à : ', 'Your report will be sent to: '))}<strong>${echap(nomService(s))}</strong>`;
    }
    $$('input[name=categorie]').forEach(r => r.addEventListener('change', () => { majDestinataire(); effacerErreur('s-categorie'); }));
    majDestinataire();

    /* ---------- État du service choisi (information avant d'envoyer) ---------- */
    /* F64 : l'état du service est affiché dès qu'il est choisi, même quand tout va bien (Disponible / Perturbé / Indisponible),
       avec le message d'interruption connu et le retour prévu. F63 : service désactivé → la démarche ne peut pas être commencée,
       le bouton d'envoi est remplacé par la prochaine action possible. */
    function majEtatService(p) {
      const sel = $('#' + p + '-service'), zone = $('#etat-' + p + '-service');
      const s = NT.services.get(sel.value);
      zone.className = 'dm-etat-zone';
      if (!s) { zone.hidden = true; zone.innerHTML = ''; majEnvoi(); return; }
      const e = NT.ui.etatService(s);
      zone.hidden = false;
      zone.innerHTML = NT.ui.encartService(s, { siDisponible: true, actions: p === 'd' })
        + (e.niveau === 'perturbe' ? `<p class="doux" style="margin:-.5rem 0 0">${echap(NT.t('dem.perturbeSuite'))}</p>` : '');
      majEnvoi();
    }
    const demarcheBloquee = () => { const id = $('#d-service').value; return type === 'demarche' && !!id && !NT.ui.etatService(NT.services.get(id)).demarchePossible; };
    function majEnvoi() { const b = $('#btn-envoyer'); if (b) b.hidden = demarcheBloquee(); }
    ['c', 'd'].forEach(p => $('#' + p + '-service').addEventListener('change', () => { majEtatService(p); effacerErreur(p + '-service'); }));

    /* ---------- Choix du type ---------- */
    function choisirType(t, majUrl) {
      if (!TYPES[t]) t = 'contact';
      type = t;
      $$('input[name=type]').forEach(r => (r.checked = r.value === t));
      $$('.dm-bloc').forEach(b => (b.hidden = b.dataset.type !== t));
      majEnvoi();
      masquerResume();
      $$('.dm-err').forEach(p => { p.hidden = true; p.textContent = ''; });
      $$('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
      if (majUrl) {
        const p = new URLSearchParams(location.search); p.set('type', t);
        try { history.replaceState(null, '', location.pathname + '?' + p.toString()); } catch (e) { /* file:// */ }
        NT.ui.annoncer(bi('Formulaire : ', 'Form: ') + bi(TYPES[t][0], TYPES[t][1]));
      }
    }
    $$('input[name=type]').forEach(r => r.addEventListener('change', () => choisirType(r.value, true)));

    /* Paramètres d'URL : ?type= et ?service= */
    const typeUrl = NT.ui.param('type');
    const serviceUrl = NT.ui.param('service');
    if (serviceUrl && NT.services.get(serviceUrl)) { $('#c-service').value = serviceUrl; $('#d-service').value = serviceUrl; majEtatService('c'); majEtatService('d'); }
    choisirType(TYPES[typeUrl] ? typeUrl : 'contact', false);

    /* ---------- Photo : miniature en dataURL (≤ ~60 Ko) ---------- */
    function miniature(fichier) {
      return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(fichier);
        const img = new Image();
        img.onload = () => {
          let max = 640, q = 0.72, data = '';
          for (let essai = 0; essai < 8; essai++) {
            const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
            const c = document.createElement('canvas');
            c.width = Math.max(1, Math.round(img.naturalWidth * k)); c.height = Math.max(1, Math.round(img.naturalHeight * k));
            c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
            data = c.toDataURL('image/jpeg', q);
            if (data.length <= 80000) break;          // ≈ 60 Ko en binaire
            if (q > 0.45) q -= 0.1; else max = Math.round(max * 0.78);
          }
          URL.revokeObjectURL(url);
          data.length <= 100000 ? resolve(data) : reject(new Error('trop gros'));
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('illisible')); };
        img.src = url;
      });
    }
    $('#s-photo').addEventListener('change', async e => {
      const f = e.target.files[0];
      effacerErreur('s-photo');
      if (!f) { retirerPhoto(); return; }
      if (!/^image\//.test(f.type)) { photo = ''; $('#s-photo').value = ''; $('#s-photo-apercu').hidden = true; montrerErreur('s-photo', bi('Ce fichier n’est pas une image. Choisissez une photo (JPEG, PNG…).', 'This file is not an image. Choose a photo (JPEG, PNG…).')); return; }
      try {
        photo = await miniature(f);
        $('#s-photo-img').src = photo;
        $('#s-photo-img').alt = bi('Aperçu de la photo jointe', 'Preview of the attached photo');
        $('#s-photo-apercu').hidden = false;
        NT.ui.annoncer(bi('Photo ajoutée', 'Photo added'));
      } catch (err) {
        photo = ''; $('#s-photo').value = ''; $('#s-photo-apercu').hidden = true;
        montrerErreur('s-photo', bi('Impossible de lire cette photo. Essayez une autre image ou envoyez sans photo.', 'This photo could not be read. Try another image or send without a photo.'));
      }
    });
    function retirerPhoto() { photo = ''; $('#s-photo').value = ''; $('#s-photo-apercu').hidden = true; $('#s-photo-img').removeAttribute('src'); }
    $('#s-photo-retirer').addEventListener('click', () => { retirerPhoto(); $('#s-photo').focus(); NT.ui.annoncer(bi('Photo retirée', 'Photo removed')); });

    /* ---------- Validation accessible ---------- */
    function montrerErreur(id, msg) {
      const p = $('#err-' + id); if (!p) return;
      p.innerHTML = `<i class="ph ph-warning-circle" aria-hidden="true"></i><span>${echap(msg)}</span>`; p.hidden = false;
      const champ = document.getElementById(id);
      if (champ && champ.matches('input,select,textarea')) champ.setAttribute('aria-invalid', 'true');
      if (id === 's-categorie') $$('input[name=categorie]').forEach(r => r.setAttribute('aria-invalid', 'true'));
    }
    function effacerErreur(id) {
      const p = $('#err-' + id); if (p) { p.hidden = true; p.textContent = ''; }
      const champ = document.getElementById(id); if (champ) champ.removeAttribute('aria-invalid');
      if (id === 's-categorie') $$('input[name=categorie]').forEach(r => r.removeAttribute('aria-invalid'));
    }
    function masquerResume() { const r = $('#resume-erreurs'); r.hidden = true; r.innerHTML = ''; }

    const val = id => ($('#' + id).value || '').trim();
    function regles() {
      const M = {
        contact: [
          { id: 'c-service', focus: 'c-service', ok: () => !!val('c-service'), msg: bi('Choisissez le service concerné, ou « Je ne sais pas ».', 'Choose the service concerned, or “I don’t know”.') },
          { id: 'c-objet', focus: 'c-objet', ok: () => val('c-objet').length >= 3, msg: bi('Indiquez l’objet de votre message (3 caractères minimum).', 'Enter the subject of your message (3 characters minimum).') },
          { id: 'c-message', focus: 'c-message', ok: () => val('c-message').length >= 10, msg: bi('Écrivez votre message (10 caractères minimum).', 'Write your message (10 characters minimum).') }
        ],
        signalement: [
          { id: 's-categorie', focus: () => $('input[name=categorie]'), ok: () => !!categorieChoisie(), msg: bi('Choisissez le type de problème.', 'Choose the type of problem.') },
          { id: 's-description', focus: 's-description', ok: () => val('s-description').length >= 10, msg: bi('Décrivez ce qui s’est passé (10 caractères minimum).', 'Describe what happened (10 characters minimum).') },
          { id: 's-adresse', focus: 's-adresse', ok: () => val('s-adresse').length >= 3, msg: bi('Indiquez l’adresse ou un repère où se trouve le problème.', 'Enter the address or a landmark where the problem is.') },
          { id: 's-quartier', focus: 's-quartier', ok: () => !!val('s-quartier'), msg: bi('Choisissez le quartier, dans la liste ou sur le plan.', 'Choose the district, from the list or on the map.') }
        ],
        demarche: [
          { id: 'd-service', focus: 'd-service', ok: () => !!val('d-service'), msg: bi('Choisissez le service concerné.', 'Choose the service concerned.') },
          { id: 'd-service', focus: 'd-service', ok: () => !demarcheBloquee(), msg: NT.t('dem.errDesactive') },
          { id: 'd-nature', focus: 'd-nature', ok: () => !!val('d-nature'), msg: bi('Choisissez la nature de la démarche.', 'Choose the type of procedure.') }
        ]
      };
      const l = M[type].slice();
      if (type === 'contact' && !u) {
        l.push({ id: 'c-nom', focus: 'c-nom', ok: () => val('c-nom').length >= 2, msg: bi('Indiquez votre nom pour que nous puissions vous répondre.', 'Enter your name so we can reply.') });
        l.push({ id: 'c-email', focus: 'c-email', ok: () => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val('c-email')), msg: bi('Indiquez une adresse e-mail valide, par exemple prenom.nom@exemple.fr.', 'Enter a valid e-mail address, for example first.last@example.com.') });
      }
      return l;
    }
    const cibleFocus = r => (typeof r.focus === 'function' ? r.focus() : document.getElementById(r.focus));

    function valider() {
      const erreurs = regles().filter(r => !r.ok());
      regles().forEach(r => effacerErreur(r.id));
      erreurs.forEach(r => montrerErreur(r.id, r.msg));
      return erreurs;
    }
    function afficherResume(erreurs) {
      const r = $('#resume-erreurs');
      r.innerHTML = `<h2><i class="ph-duotone ph-warning-octagon" aria-hidden="true"></i>${echap(erreurs.length > 1
        ? NT.t('dem.nbErreurs', { n: erreurs.length })
        : bi('Le formulaire contient 1 erreur', 'The form contains 1 error'))}</h2>
        <ul>${erreurs.map((e, i) => `<li><a href="#" data-i="${i}">${echap(e.msg)}</a></li>`).join('')}</ul>`;
      r.hidden = false;
      r.querySelectorAll('a').forEach(a => a.addEventListener('click', ev => { ev.preventDefault(); const c = cibleFocus(erreurs[+a.dataset.i]); c && c.focus(); }));
      const premier = cibleFocus(erreurs[0]);
      if (premier) premier.focus(); else r.focus();
    }
    // Effacer l'erreur dès que l'utilisateur corrige
    form.addEventListener('input', e => { const id = e.target.id; if (id && $('#err-' + id)) effacerErreur(id); });

    /* ---------- Envoi ---------- */
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (envoi) return;
      masquerResume();
      const erreurs = valider();
      if (erreurs.length) { afficherResume(erreurs); return; }
      envoyer();
    });

    function construire() {
      if (type === 'contact') {
        const sid = val('c-service');
        const d = { type, serviceId: sid === 'inconnu' ? '' : sid, objet: val('c-objet'), message: val('c-message') };
        if (sid === 'inconnu') d.serviceIncertain = true;
        if (!u) { d.contactNom = val('c-nom'); d.contactEmail = val('c-email'); }
        return d;
      }
      if (type === 'signalement') {
        const c = categorieChoisie();
        const q = val('s-quartier'), adr = val('s-adresse');
        const dangereux = $('input[name=urgence]:checked').value === 'dangereux';
        const d = { type, serviceId: c.service, categorie: c.id, objet: bi(c.fr, c.en) + ' : ' + adr.slice(0, 70), message: val('s-description'),
          lieu: adr + ', quartier ' + q, quartier: q, priorite: dangereux ? 'haute' : 'normale' };
        if (photo) d.photo = photo;
        return d;
      }
      const n = NATURES.find(x => x.id === val('d-nature'));
      return { type, serviceId: val('d-service'), nature: n.id, objet: bi(n.fr, n.en), message: val('d-precisions') || bi('Démarche : ', 'Procedure: ') + bi(n.fr, n.en) };
    }

    function envoyer() {
      envoi = true;
      const btn = $('#btn-envoyer');
      btn.disabled = true; btn.setAttribute('aria-busy', 'true');
      $('#btn-envoyer-txt').textContent = bi('Envoi en cours…', 'Sending…');
      let d = null;
      try {
        d = NT.demandes.creer(construire());
        if (!NT.store.find('demandes', d.id)) d = null;        // stockage plein ou bloqué
      } catch (err) { d = null; }
      if (!d) {
        envoi = false; btn.disabled = false; btn.removeAttribute('aria-busy');
        $('#btn-envoyer-txt').textContent = bi('Envoyer la demande', 'Send the request');
        const r = $('#resume-erreurs');
        r.innerHTML = `<h2><i class="ph-duotone ph-warning-octagon" aria-hidden="true"></i>${echap(bi('L’envoi a échoué', 'Sending failed'))}</h2>
          <p style="margin:0">${echap(bi('Votre demande n’a pas pu être enregistrée. Vérifiez votre connexion, retirez la photo si vous en avez joint une, puis réessayez.', 'Your request could not be saved. Check your connection, remove the photo if you attached one, then try again.'))}</p>`;
        r.hidden = false; r.focus();
        return;
      }
      confirmer(d);
    }

    /* ---------- Confirmation immédiate (D16) ---------- */
    function ligne(lib, valeur) { return valeur ? `<dt>${echap(lib)}</dt><dd>${valeur}</dd>` : ''; }
    function confirmer(d) {
      const s = NT.services.get(d.serviceId);
      const haut = d.priorite === 'haute';
      const delai = DELAIS[d.type === 'signalement' && haut ? 'signalementHaut' : d.type];
      const nomS = d.serviceId ? nomService(s) : bi('À déterminer : la mairie orientera votre demande', 'To be determined: the city hall will route your request');
      const recap = [
        ligne(bi('Type', 'Type'), echap(bi(TYPES[d.type][0], TYPES[d.type][1]))),
        ligne(bi('Objet', 'Subject'), echap(d.objet)),
        ligne(bi('Message', 'Message'), d.message ? echap(d.message).replace(/\n/g, '<br>') : ''),
        ligne(bi('Lieu', 'Location'), echap(d.lieu)),
        ligne(bi('Urgence', 'Urgency'), d.type === 'signalement' ? (haut ? `<span class="dm-prio-haute"><i class="ph-duotone ph-warning" aria-hidden="true"></i>${echap(bi('Dangereux, traité en priorité', 'Dangerous, handled as a priority'))}</span>` : echap(bi('Normale', 'Normal'))) : ''),
        ligne(bi('Photo', 'Photo'), d.photo ? `<img src="${echap(d.photo)}" alt="${echap(bi('Photo jointe à la demande', 'Photo attached to the request'))}">` : ''),
        ligne(bi('Réponse envoyée à', 'Reply sent to'), d.contactEmail ? echap(d.contactNom + ' · ' + d.contactEmail) : '')
      ].join('');
      const suites = [
        NT.t('dem.transmis', { s: nomS }),
        u ? bi('Vous êtes prévenu dans votre espace à chaque étape : reçue, en cours, traitée.', 'You are notified in your space at each stage: received, in progress, resolved.')
          : NT.t('dem.reponseA', { e: d.contactEmail || NT.t('dem.votreEmail') }),
        NT.t('dem.delaiPhrase', { d: bi(delai[0], delai[1]) })
      ];
      const suivi = u
        ? `<a class="btn btn-primaire" href="suivi.html?id=${encodeURIComponent(d.id)}"><i class="ph ph-list-checks" aria-hidden="true"></i>${echap(bi('Suivre ma demande', 'Track my request'))}</a>`
        : `<a class="btn btn-primaire" href="connexion.html?retour=${encodeURIComponent('suivi.html?id=' + d.id)}"><i class="ph ph-sign-in" aria-hidden="true"></i>${echap(bi('Me connecter pour suivre ma demande', 'Sign in to track my request'))}</a>`;
      const zone = $('#confirmation');
      zone.innerHTML = `
        <div class="dm-succes" aria-hidden="true"><i class="ph-duotone ph-check-circle"></i></div>
        <h2 id="conf-titre" tabindex="-1">${echap(bi('Votre demande a bien été envoyée', 'Your request has been sent'))}</h2>
        <p class="doux">${echap(bi('Gardez ce numéro : il vous permet de retrouver votre demande.', 'Keep this number: it lets you find your request.'))}</p>
        <div class="dm-numero"><span class="sr-only">${echap(bi('Numéro de demande', 'Request number'))} </span><span class="nb" id="conf-numero">${echap(d.id)}</span>
          <button class="btn" type="button" id="btn-copier"><i class="ph ph-copy" aria-hidden="true"></i><span>${echap(bi('Copier le numéro', 'Copy the number'))}</span></button></div>
        <div class="gauche">
          <div class="dm-bloc-conf"><h3><i class="ph-duotone ph-clipboard-text" aria-hidden="true"></i>${echap(bi('Ce que vous avez envoyé', 'What you sent'))}</h3><dl class="dm-recap">${recap}</dl></div>
          <div class="grille-2" style="margin-top:0">
            <div class="dm-bloc-conf"><h3><i class="ph-duotone ph-buildings" aria-hidden="true"></i>${echap(bi('Service destinataire', 'Receiving service'))}</h3><p style="margin:0"><strong>${echap(nomS)}</strong></p>
              <p class="doux" style="margin:.5rem 0 0"><i class="ph ph-timer" aria-hidden="true"></i> ${echap(bi('Délai de réponse indicatif : ', 'Estimated response time: '))}<strong>${echap(bi(delai[0], delai[1]))}</strong></p></div>
            <div class="dm-bloc-conf"><h3><i class="ph-duotone ph-path" aria-hidden="true"></i>${echap(bi('Et maintenant ?', 'What happens next?'))}</h3><ol class="dm-suite">${suites.map(x => `<li>${echap(x)}</li>`).join('')}</ol></div>
          </div>
        </div>
        <div class="dm-actions">${suivi}
          <a class="btn" href="index.html"><i class="ph ph-house" aria-hidden="true"></i>${echap(bi('Retour à l’accueil', 'Back to home'))}</a>
          <a class="btn" href="demande.html"><i class="ph ph-plus" aria-hidden="true"></i>${echap(bi('Faire une autre demande', 'Make another request'))}</a></div>`;
      $('#zone-formulaire').hidden = true;
      zone.hidden = false;
      $('#btn-copier').addEventListener('click', () => copier(d.id));
      window.scrollTo(0, 0);
      $('#conf-titre').focus();
      NT.ui.annoncer(NT.t('dem.envoyeeNum', { n: d.id }));
      document.title = bi('Demande envoyée', 'Request sent') + ' — Terra Nova';
    }

    function copier(texte) {
      const ok = () => NT.ui.toast(bi('Numéro copié : ', 'Number copied: ') + texte, 'success');
      const repli = () => {
        const t = document.createElement('textarea'); t.value = texte; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
        document.body.append(t); t.select();
        const ko = () => NT.ui.toast(bi('Copie impossible, notez le numéro ', 'Copy failed, please note the number ') + texte, 'warning');
        try { document.execCommand('copy') ? ok() : ko(); }
        catch (e) { ko(); }
        t.remove();
      };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(texte).then(ok, repli); else repli();
    }
  });
})();
