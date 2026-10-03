/* Terra Nova — « Je viens d'arriver » (bienvenue.html)
   F72 : 3 questions (situation, besoins, e-mail) → liste personnalisée des services utiles, liens directs, cases « Fait » ;
         enregistrée dans le profil si l'habitant est connecté (PUT /api/accueil/guide), sinon sur l'appareil.
   F71 : langue choisie en premier (gros boutons, nom écrit dans chaque langue) ; compte sans adresse e-mail
         (identifiant TN-xxxxxx + code secret) avec fiche d'accueil imprimable ; remplacement du code provisoire. */
(function () {
  'use strict';
  const NT = window.NT;
  const EN = {
    'bv.surtitre': 'Newcomers', 'bv.titre': 'Welcome to Terra Nova', 'bv.sous': 'Where to start? Choose your language, answer 3 questions, and here are the services useful to you, with a direct link.',
    'bv.langue': 'Your language', 'bv.langueAide': 'The whole platform is displayed in the chosen language. You can change it at any time with the globe at the top of the page.',
    'bv.guide': 'Where to start?', 'bv.guideAide': 'Three questions, one minute. Nothing is compulsory and you do not need an account.',
    'bv.q1': '1. You are arriving…', 'bv.seul': 'On my own', 'bv.couple': 'As a couple', 'bv.famille': 'As a family, with children',
    'bv.q2': '2. What do you need first?', 'bv.q2aide': 'Several answers possible.', 'bv.b.logement': 'Housing', 'bv.b.travail': 'A job', 'bv.b.sante': 'Healthcare', 'bv.b.ecole': 'School for the children', 'bv.b.deplacer': 'Getting around', 'bv.b.papiers': 'My papers', 'bv.b.aide': 'Financial help',
    'bv.q3': '3. Do you have an e-mail address?', 'bv.oui': 'Yes', 'bv.non': 'No e-mail', 'bv.voir': 'See my list',
    'bv.liste': 'Your list to get started', 'bv.progres': '{f} of {n} done', 'bv.memoProfil': 'Saved in your profile: you will find it on any device.', 'bv.memoLocal': 'Kept on this device. Create an account to find it everywhere.', 'bv.modifier': 'Change my answers', 'bv.fait': 'Done',
    'bv.codeTitre': 'Choose your own secret code', 'bv.codeAide': 'The code received at the desk is temporary. Choose one only you know: 6 digits easy for you to remember, but not 123456.',
    'bv.nvCode': 'New code (6 digits) or password', 'bv.nvCode2': 'Type it again', 'bv.enregistrer': 'Save my code', 'bv.codeOk': 'Your secret code is saved. Use it next time you sign in.',
    'bv.sansTitre': 'Create an account without an e-mail address', 'bv.sansAide': 'You receive an identifier (for example TN-482731) and choose a 6-digit secret code. You can also sign in with your phone number.',
    'bv.prenom': 'First name', 'bv.nom': 'Last name', 'bv.tel': 'Phone', 'bv.facultatif': '(optional)', 'bv.telAide': 'To sign in with your number. It is encrypted and hidden from others.', 'bv.quartier': 'Neighbourhood', 'bv.choisirQuartier': 'I don’t know yet',
    'bv.code': 'Secret code (6 digits)', 'bv.codeRegle': '6 digits, no sequence (123456) or repetition (111111). A password is also accepted.', 'bv.code2': 'Type the code again', 'bv.creer': 'Create my account',
    'bv.avecEmail': 'You have an e-mail address?', 'bv.avecEmailLien': 'Create an account with e-mail', 'bv.dejaCompte': 'I already have an account',
    'bv.ficheTitre': 'Your account is ready', 'bv.ficheAide': 'Write down your identifier: it replaces the e-mail address to sign in. You can print this sheet.', 'bv.imprimer': 'Print my sheet', 'bv.versEspace': 'Go to my space',
    'bv.e.nom': 'Enter your first name and last name.', 'bv.e.code': 'Choose a secret code (6 digits) or a password.', 'bv.e.code2': 'The two codes are different.', 'bv.e.tel': 'The phone number may only contain digits, spaces and the + sign.',
    'bv.i.compte': 'Create your account', 'bv.i.compteD': 'To follow your procedures and receive alerts. No e-mail needed.', 'bv.l.sansEmail': 'Without e-mail', 'bv.l.avecEmail': 'With e-mail',
    'bv.i.code': 'Choose your own secret code', 'bv.i.codeD': 'Replace the temporary code received at the desk.', 'bv.l.code': 'Choose my code',
    'bv.i.etatCivil': 'Register your arrival at the city hall', 'bv.i.etatCivilD': 'Civil registry: bring proof of address and identity papers.',
    'bv.i.logement': 'Find or declare housing', 'bv.i.logementD': 'Social housing, help with rent, declaring your address.',
    'bv.i.emploi': 'Look for a job or training', 'bv.i.emploiD': 'Job offers, training, help with your CV.',
    'bv.i.sante': 'Know where to get care', 'bv.i.santeD': 'Clinics, doctors, and emergency numbers 15 and 112.',
    'bv.i.ecole': 'Enrol your children at school', 'bv.i.ecoleD': 'School, canteen and childcare: enrolment and documents.',
    'bv.i.transports': 'Get around by shuttle', 'bv.i.transportsD': 'Lines, next departures and your route.',
    'bv.i.social': 'Ask for financial help', 'bv.i.socialD': 'The social service tells you what you are entitled to.',
    'bv.i.alertes': 'Receive alerts for your neighbourhood', 'bv.i.alertesD': 'Floods, heat, works: be warned in time.',
    'bv.i.carte': 'Find useful places near you', 'bv.i.carteD': 'Map of the city: open or closed, opening hours, access.',
    'bv.l.service': 'See the service', 'bv.l.rdv': 'Book an appointment', 'bv.l.ecrire': 'Write to the service', 'bv.l.urgences': 'Emergencies', 'bv.l.transports': 'See the shuttles', 'bv.l.alertes': 'Choose my alerts', 'bv.l.carte': 'Open the map',
    'bv.l.lang': 'Language chosen'
  };
  const ES = {
    'bv.surtitre': 'Recién llegados', 'bv.titre': 'Bienvenido/a a Terra Nova', 'bv.sous': '¿Por dónde empezar? Elija su idioma, responda a 3 preguntas y verá los servicios útiles para usted, con un enlace directo.',
    'bv.langue': 'Su idioma', 'bv.langueAide': 'Toda la plataforma se muestra en el idioma elegido. Puede cambiarlo en cualquier momento con el globo de arriba.',
    'bv.guide': '¿Por dónde empezar?', 'bv.guideAide': 'Tres preguntas, un minuto. Nada es obligatorio y no necesita cuenta.',
    'bv.q1': '1. Usted llega…', 'bv.seul': 'Solo o sola', 'bv.couple': 'En pareja', 'bv.famille': 'En familia, con hijos',
    'bv.q2': '2. ¿Qué necesita primero?', 'bv.q2aide': 'Puede elegir varias respuestas.', 'bv.b.logement': 'Una vivienda', 'bv.b.travail': 'Un trabajo', 'bv.b.sante': 'Atención médica', 'bv.b.ecole': 'La escuela de los niños', 'bv.b.deplacer': 'Desplazarme', 'bv.b.papiers': 'Mis documentos', 'bv.b.aide': 'Una ayuda económica',
    'bv.q3': '3. ¿Tiene correo electrónico?', 'bv.oui': 'Sí', 'bv.non': 'No, sin correo', 'bv.voir': 'Ver mi lista',
    'bv.liste': 'Su lista para empezar bien', 'bv.progres': '{f} de {n} hechos', 'bv.memoProfil': 'Guardada en su perfil: la encontrará en cualquier dispositivo.', 'bv.memoLocal': 'Guardada en este dispositivo. Cree una cuenta para encontrarla en todas partes.', 'bv.modifier': 'Cambiar mis respuestas', 'bv.fait': 'Hecho',
    'bv.codeTitre': 'Elija su propio código secreto', 'bv.codeAide': 'El código recibido en la ventanilla es provisional. Elija uno que solo usted conozca: 6 cifras fáciles de recordar para usted, pero no 123456.',
    'bv.nvCode': 'Nuevo código (6 cifras) o contraseña', 'bv.nvCode2': 'Vuelva a escribirlo', 'bv.enregistrer': 'Guardar mi código', 'bv.codeOk': 'Su código secreto está guardado. Úselo la próxima vez que se conecte.',
    'bv.sansTitre': 'Crear una cuenta sin correo electrónico', 'bv.sansAide': 'Recibe un identificador (por ejemplo TN-482731) y elige un código secreto de 6 cifras. También podrá conectarse con su número de teléfono.',
    'bv.prenom': 'Nombre', 'bv.nom': 'Apellido', 'bv.tel': 'Teléfono', 'bv.facultatif': '(opcional)', 'bv.telAide': 'Para conectarse con su número. Se guarda cifrado y oculto para los demás.', 'bv.quartier': 'Barrio', 'bv.choisirQuartier': 'Todavía no lo sé',
    'bv.code': 'Código secreto (6 cifras)', 'bv.codeRegle': '6 cifras, sin secuencia (123456) ni repetición (111111). También se acepta una contraseña.', 'bv.code2': 'Vuelva a escribir el código', 'bv.creer': 'Crear mi cuenta',
    'bv.avecEmail': '¿Tiene correo electrónico?', 'bv.avecEmailLien': 'Crear una cuenta con correo', 'bv.dejaCompte': 'Ya tengo una cuenta',
    'bv.ficheTitre': 'Su cuenta está lista', 'bv.ficheAide': 'Apunte bien su identificador: sustituye al correo para conectarse. Puede imprimir esta ficha.', 'bv.imprimer': 'Imprimir mi ficha', 'bv.versEspace': 'Ir a mi espacio',
    'bv.e.nom': 'Indique su nombre y apellido.', 'bv.e.code': 'Elija un código secreto (6 cifras) o una contraseña.', 'bv.e.code2': 'Los dos códigos son diferentes.', 'bv.e.tel': 'El número de teléfono solo puede contener cifras, espacios y el signo +.',
    'bv.i.compte': 'Crear su cuenta', 'bv.i.compteD': 'Para seguir sus trámites y recibir alertas. No necesita correo.', 'bv.l.sansEmail': 'Sin correo', 'bv.l.avecEmail': 'Con correo',
    'bv.i.code': 'Elegir su propio código secreto', 'bv.i.codeD': 'Sustituya el código provisional recibido en la ventanilla.', 'bv.l.code': 'Elegir mi código',
    'bv.i.etatCivil': 'Declarar su llegada en el ayuntamiento', 'bv.i.etatCivilD': 'Registro civil: lleve un justificante de domicilio y sus documentos de identidad.',
    'bv.i.logement': 'Encontrar o declarar una vivienda', 'bv.i.logementD': 'Vivienda social, ayuda al alquiler, declaración de domicilio.',
    'bv.i.emploi': 'Buscar trabajo o formación', 'bv.i.emploiD': 'Ofertas, formaciones, ayuda con el currículum.',
    'bv.i.sante': 'Saber dónde recibir atención', 'bv.i.santeD': 'Dispensarios, médicos y números de urgencia 15 y 112.',
    'bv.i.ecole': 'Inscribir a sus hijos en la escuela', 'bv.i.ecoleD': 'Escuela, comedor y guardería: inscripción y documentos.',
    'bv.i.transports': 'Desplazarse en lanzadera', 'bv.i.transportsD': 'Líneas, próximas salidas y su trayecto.',
    'bv.i.social': 'Pedir una ayuda económica', 'bv.i.socialD': 'El servicio social le dice a qué tiene derecho.',
    'bv.i.alertes': 'Recibir las alertas de su barrio', 'bv.i.alertesD': 'Crecidas, calor, obras: avisado a tiempo.',
    'bv.i.carte': 'Encontrar los lugares útiles cerca de usted', 'bv.i.carteD': 'Mapa de la ciudad: abierto o cerrado, horarios, acceso.',
    'bv.l.service': 'Ver el servicio', 'bv.l.rdv': 'Pedir cita', 'bv.l.ecrire': 'Escribir al servicio', 'bv.l.urgences': 'Urgencias', 'bv.l.transports': 'Ver las lanzaderas', 'bv.l.alertes': 'Elegir mis alertas', 'bv.l.carte': 'Abrir el mapa',
    'bv.l.lang': 'Idioma elegido'
  };
  const AR = {
    'bv.surtitre': 'الوافدون الجدد', 'bv.titre': 'مرحباً بك في تيرا نوفا', 'bv.sous': 'من أين تبدأ؟ اختر لغتك، أجب عن 3 أسئلة، وإليك الخدمات المفيدة لك مع رابط مباشر.',
    'bv.langue': 'لغتك', 'bv.langueAide': 'تُعرض المنصة كلها باللغة المختارة. يمكنك تغييرها في أي وقت بالكرة الأرضية أعلى الصفحة.',
    'bv.guide': 'من أين أبدأ؟', 'bv.guideAide': 'ثلاثة أسئلة، دقيقة واحدة. لا شيء إلزامي ولا تحتاج إلى حساب.',
    'bv.q1': '1. أنت قادم…', 'bv.seul': 'وحدي', 'bv.couple': 'مع شريك', 'bv.famille': 'مع العائلة والأطفال',
    'bv.q2': '2. ما الذي تحتاجه أولاً؟', 'bv.q2aide': 'يمكن اختيار عدة إجابات.', 'bv.b.logement': 'سكن', 'bv.b.travail': 'عمل', 'bv.b.sante': 'العلاج', 'bv.b.ecole': 'مدرسة الأطفال', 'bv.b.deplacer': 'التنقل', 'bv.b.papiers': 'وثائقي', 'bv.b.aide': 'مساعدة مالية',
    'bv.q3': '3. هل لديك بريد إلكتروني؟', 'bv.oui': 'نعم', 'bv.non': 'لا، ليس لدي بريد', 'bv.voir': 'عرض قائمتي',
    'bv.liste': 'قائمتك لبداية جيدة', 'bv.progres': '{f} من {n} منجزة', 'bv.memoProfil': 'محفوظة في ملفك: ستجدها على أي جهاز.', 'bv.memoLocal': 'محفوظة على هذا الجهاز. أنشئ حساباً لتجدها في كل مكان.', 'bv.modifier': 'تعديل إجاباتي', 'bv.fait': 'تم',
    'bv.codeTitre': 'اختر رمزك السري الخاص', 'bv.codeAide': 'الرمز الذي حصلت عليه في الشباك مؤقت. اختر رمزاً لا يعرفه غيرك: 6 أرقام سهلة التذكر بالنسبة لك، لكن ليس 123456.',
    'bv.nvCode': 'رمز جديد (6 أرقام) أو كلمة مرور', 'bv.nvCode2': 'أعد كتابته', 'bv.enregistrer': 'حفظ رمزي', 'bv.codeOk': 'تم حفظ رمزك السري. استعمله في المرة القادمة.',
    'bv.sansTitre': 'إنشاء حساب دون بريد إلكتروني', 'bv.sansAide': 'تحصل على معرّف (مثلاً TN-482731) وتختار رمزاً سرياً من 6 أرقام. ويمكنك أيضاً الدخول برقم هاتفك.',
    'bv.prenom': 'الاسم', 'bv.nom': 'اللقب', 'bv.tel': 'الهاتف', 'bv.facultatif': '(اختياري)', 'bv.telAide': 'للدخول برقمك. يُحفظ مشفّراً ومخفياً عن الآخرين.', 'bv.quartier': 'الحي', 'bv.choisirQuartier': 'لا أعرف بعد',
    'bv.code': 'الرمز السري (6 أرقام)', 'bv.codeRegle': '6 أرقام، دون تسلسل (123456) أو تكرار (111111). تُقبل كلمة مرور أيضاً.', 'bv.code2': 'أعد كتابة الرمز', 'bv.creer': 'إنشاء حسابي',
    'bv.avecEmail': 'لديك بريد إلكتروني؟', 'bv.avecEmailLien': 'إنشاء حساب بالبريد الإلكتروني', 'bv.dejaCompte': 'لدي حساب',
    'bv.ficheTitre': 'حسابك جاهز', 'bv.ficheAide': 'دوّن معرّفك جيداً: إنه يحل محل البريد الإلكتروني للدخول. يمكنك طباعة هذه البطاقة.', 'bv.imprimer': 'طباعة بطاقتي', 'bv.versEspace': 'الذهاب إلى فضائي',
    'bv.e.nom': 'أدخل اسمك ولقبك.', 'bv.e.code': 'اختر رمزاً سرياً (6 أرقام) أو كلمة مرور.', 'bv.e.code2': 'الرمزان مختلفان.', 'bv.e.tel': 'رقم الهاتف لا يحتوي إلا على أرقام ومسافات وعلامة +.',
    'bv.i.compte': 'أنشئ حسابك', 'bv.i.compteD': 'لمتابعة معاملاتك وتلقي التنبيهات. لا حاجة إلى بريد إلكتروني.', 'bv.l.sansEmail': 'دون بريد', 'bv.l.avecEmail': 'بالبريد',
    'bv.i.code': 'اختر رمزك السري الخاص', 'bv.i.codeD': 'استبدل الرمز المؤقت الذي حصلت عليه في الشباك.', 'bv.l.code': 'اختيار رمزي',
    'bv.i.etatCivil': 'صرّح بوصولك في البلدية', 'bv.i.etatCivilD': 'الحالة المدنية: أحضر إثبات السكن ووثائق الهوية.',
    'bv.i.logement': 'إيجاد سكن أو التصريح به', 'bv.i.logementD': 'سكن اجتماعي، مساعدة في الإيجار، التصريح بالعنوان.',
    'bv.i.emploi': 'البحث عن عمل أو تكوين', 'bv.i.emploiD': 'عروض العمل، التكوين، المساعدة في السيرة الذاتية.',
    'bv.i.sante': 'معرفة أين تتعالج', 'bv.i.santeD': 'المستوصفات، الأطباء، وأرقام الطوارئ 15 و112.',
    'bv.i.ecole': 'سجّل أطفالك في المدرسة', 'bv.i.ecoleD': 'المدرسة والمطعم والحضانة: التسجيل والوثائق.',
    'bv.i.transports': 'التنقل بالحافلة', 'bv.i.transportsD': 'الخطوط، المواعيد القادمة ومسارك.',
    'bv.i.social': 'طلب مساعدة مالية', 'bv.i.socialD': 'المصلحة الاجتماعية تخبرك بما يحق لك.',
    'bv.i.alertes': 'تلقي تنبيهات حيّك', 'bv.i.alertesD': 'فيضانات، حرارة، أشغال: تُنبَّه في الوقت المناسب.',
    'bv.i.carte': 'إيجاد الأماكن المفيدة قربك', 'bv.i.carteD': 'خريطة المدينة: مفتوح أو مغلق، المواعيد، الولوج.',
    'bv.l.service': 'عرض الخدمة', 'bv.l.rdv': 'حجز موعد', 'bv.l.ecrire': 'مراسلة الخدمة', 'bv.l.urgences': 'الطوارئ', 'bv.l.transports': 'عرض الحافلات', 'bv.l.alertes': 'اختيار تنبيهاتي', 'bv.l.carte': 'فتح الخريطة',
    'bv.l.lang': 'اللغة المختارة'
  };
  NT.i18n.ajouter({ fr: {}, en: EN, es: ES, ar: AR });
  const L = (cle, fr, vars) => NT.t(cle, vars, fr);
  const E = s => NT.ui.echap(s);
  const $ = s => document.querySelector(s);
  const LANGUES = [['fr', 'Français', 'Bonjour'], ['en', 'English', 'Hello'], ['es', 'Español', 'Hola'], ['ar', 'العربية', 'مرحباً']];
  const TEL = /^[0-9 +().-]{8,20}$/;

  /* Catalogue des étapes : icône, textes, liens directs */
  const ETAPES = {
    compte: { ic: 'ph-user-plus', t: ['bv.i.compte', 'Créer votre compte'], d: ['bv.i.compteD', 'Pour suivre vos démarches et recevoir les alertes. Pas besoin d’e-mail.'], liens: r => r.email === 'oui' ? [['inscription.html', 'bv.l.avecEmail', 'Avec e-mail'], ['#sans-email', 'bv.l.sansEmail', 'Sans e-mail']] : [['#sans-email', 'bv.l.sansEmail', 'Sans e-mail'], ['inscription.html', 'bv.l.avecEmail', 'Avec e-mail']] },
    code: { ic: 'ph-key', t: ['bv.i.code', 'Choisir votre propre code secret'], d: ['bv.i.codeD', 'Remplacez le code provisoire reçu à l’accueil.'], liens: () => [['#code', 'bv.l.code', 'Choisir mon code']] },
    'etat-civil': { ic: 'ph-identification-card', t: ['bv.i.etatCivil', 'Déclarer votre arrivée en mairie'], d: ['bv.i.etatCivilD', 'État civil : apportez un justificatif de domicile et vos papiers d’identité.'], liens: () => [['services.html#etat-civil', 'bv.l.service', 'Voir le service'], ['rendez-vous.html?service=etat-civil', 'bv.l.rdv', 'Prendre rendez-vous']] },
    logement: { ic: 'ph-house-line', t: ['bv.i.logement', 'Trouver ou déclarer un logement'], d: ['bv.i.logementD', 'Logement social, aide au loyer, déclaration de votre adresse.'], liens: () => [['services.html#logement', 'bv.l.service', 'Voir le service'], ['demande.html?type=contact&service=logement', 'bv.l.ecrire', 'Écrire au service']] },
    emploi: { ic: 'ph-briefcase', t: ['bv.i.emploi', 'Chercher un travail ou une formation'], d: ['bv.i.emploiD', 'Offres, formations, aide pour votre CV.'], liens: () => [['services.html#emploi', 'bv.l.service', 'Voir le service'], ['rendez-vous.html?service=emploi', 'bv.l.rdv', 'Prendre rendez-vous']] },
    sante: { ic: 'ph-first-aid-kit', t: ['bv.i.sante', 'Savoir où se soigner'], d: ['bv.i.santeD', 'Dispensaires, médecins, et les numéros d’urgence 15 et 112.'], liens: () => [['services.html#sante', 'bv.l.service', 'Voir le service'], ['carte.html?filtre=urgence', 'bv.l.urgences', 'Urgences']] },
    ecole: { ic: 'ph-student', t: ['bv.i.ecole', 'Inscrire vos enfants à l’école'], d: ['bv.i.ecoleD', 'École, cantine et petite enfance : inscription et pièces à fournir.'], liens: () => [['services.html#education', 'bv.l.service', 'Voir le service'], ['rendez-vous.html?service=education', 'bv.l.rdv', 'Prendre rendez-vous']] },
    transports: { ic: 'ph-bus', t: ['bv.i.transports', 'Se déplacer en navette'], d: ['bv.i.transportsD', 'Lignes, prochains départs et votre trajet.'], liens: () => [['transports.html', 'bv.l.transports', 'Voir les navettes']] },
    social: { ic: 'ph-hand-heart', t: ['bv.i.social', 'Demander une aide financière'], d: ['bv.i.socialD', 'Le service social vous dit à quoi vous avez droit.'], liens: () => [['services.html#social', 'bv.l.service', 'Voir le service'], ['rendez-vous.html?service=social', 'bv.l.rdv', 'Prendre rendez-vous']] },
    alertes: { ic: 'ph-bell-ringing', t: ['bv.i.alertes', 'Recevoir les alertes de votre quartier'], d: ['bv.i.alertesD', 'Crue, chaleur, travaux : prévenu à temps.'], liens: () => [['annonces.html', 'bv.l.alertes', 'Choisir mes alertes']] },
    carte: { ic: 'ph-map-trifold', t: ['bv.i.carte', 'Repérer les lieux utiles près de chez vous'], d: ['bv.i.carteD', 'Plan de la ville : ouvert ou fermé, horaires, accès.'], liens: () => [['carte.html', 'bv.l.carte', 'Ouvrir la carte']] }
  };
  const BESOIN_ETAPE = { logement: 'logement', travail: 'emploi', sante: 'sante', ecole: 'ecole', deplacer: 'transports', aide: 'social' };
  function etapesPour(r, u) {
    const l = [];
    if (!u) l.push('compte');
    if (u && u.codeProvisoire) l.push('code');
    l.push('etat-civil');
    (r.besoins || []).forEach(b => { const e = BESOIN_ETAPE[b]; if (e && !l.includes(e)) l.push(e); });
    if (r.situation === 'famille') ['ecole', 'social'].forEach(e => { if (!l.includes(e)) l.push(e); });
    ['alertes', 'carte'].forEach(e => { if (!l.includes(e)) l.push(e); });
    if (!l.includes('sante')) l.splice(Math.min(l.length, 4), 0, 'sante');
    return l.slice(0, 9);
  }

  /* État du guide : profil si connecté, sinon appareil */
  let u = null, guide = null;
  const lireLocal = () => NT.store.lire('guideArrivee', null);
  function sauver() {
    guide.maj = new Date().toISOString();
    if (u) { const r = NT.api('PUT', '/api/accueil/guide', guide); if (r.statut === 200) NT.store.ecrire('guideArrivee', null); }
    else NT.store.ecrire('guideArrivee', guide);
  }

  function rendreLangues() {
    const actuelle = NT.i18n.langue;
    $('#langues').innerHTML = LANGUES.map(([c, nom, salut]) => `<button type="button" class="langue-choix" lang="${c}" dir="${c === 'ar' ? 'rtl' : 'ltr'}" data-langue="${c}" aria-pressed="${c === actuelle}">
      <span class="nom"><i class="ph ${c === actuelle ? 'ph-check-circle' : 'ph-chat-circle-text'}" aria-hidden="true"></i>${E(nom)}</span><span class="salut">${E(salut)}</span></button>`).join('');
    $('#langues').addEventListener('click', e => {
      const b = e.target.closest('[data-langue]'); if (!b) return;
      if (u) NT.store.update('utilisateurs', u.id, { langue: b.dataset.langue });
      if (b.dataset.langue === NT.i18n.langue) { NT.store.ecrire('langue', b.dataset.langue); $('#guide').scrollIntoView({ block: 'start' }); return; }
      history.replaceState(null, '', '#guide');
      NT.i18n.changer(b.dataset.langue);
    });
  }

  function remplirForm(r) {
    const f = $('#form-guide');
    f.querySelectorAll('input').forEach(i => { i.checked = i.name === 'besoins' ? (r.besoins || []).includes(i.value) : r[i.name] === i.value; });
  }
  function lireForm() {
    const f = $('#form-guide');
    const val = n => (f.querySelector(`input[name="${n}"]:checked`) || {}).value || '';
    return { situation: val('situation'), besoins: [...f.querySelectorAll('input[name="besoins"]:checked')].map(i => i.value), email: val('email') };
  }

  function rendreListe(focus) {
    const zone = $('#liste');
    zone.hidden = false;
    const faites = new Set(guide.faites || []);
    if (u) faites.add('compte');
    $('#etapes').innerHTML = guide.etapes.filter(id => ETAPES[id]).map(id => {
      const e = ETAPES[id], fait = faites.has(id);
      return `<li class="etape-arr${fait ? ' faite' : ''}" data-etape="${id}"><span class="ico" aria-hidden="true"><i class="ph-duotone ${fait ? 'ph-check-circle' : e.ic}"></i></span>
        <h3>${E(L(e.t[0], e.t[1]))}</h3><p>${E(L(e.d[0], e.d[1]))}</p>
        <div class="actions">${e.liens(guide.reponses).map(([href, k, fr], i) => `<a class="btn petit${i === 0 ? ' btn-primaire' : ''}" href="${E(href)}">${E(L(k, fr))}</a>`).join('')}
          <label class="case-faite"><input type="checkbox" data-faite="${id}" ${fait ? 'checked' : ''}> ${E(L('bv.fait', 'Fait'))}</label></div></li>`;
    }).join('');
    const n = guide.etapes.filter(id => ETAPES[id]).length, f = guide.etapes.filter(id => faites.has(id)).length;
    $('#progres').textContent = L('bv.progres', '{f} sur {n} faits', { f, n });
    $('#barre').style.width = (n ? Math.round(f / n * 100) : 0) + '%';
    $('#liste-memo').textContent = u ? L('bv.memoProfil', 'Enregistrée dans votre profil : vous la retrouverez sur n’importe quel appareil.') : L('bv.memoLocal', 'Gardée sur cet appareil. Créez un compte pour la retrouver partout.');
    if (focus) { zone.focus({ preventScroll: true }); zone.scrollIntoView({ block: 'start' }); }
  }

  /* Formulaires F71 */
  function erreurs(form, liste) {
    form.querySelector('.resume-arr').innerHTML = liste.length ? '<ul>' + liste.map(([id, m]) => `<li><a href="#${id}">${E(m)}</a></li>`).join('') + '</ul>' : '';
    form.querySelectorAll('[aria-invalid]').forEach(i => i.removeAttribute('aria-invalid'));
    liste.forEach(([id]) => { const i = document.getElementById(id); if (i) i.setAttribute('aria-invalid', 'true'); });
    if (liste.length) { const i = document.getElementById(liste[0][0]); if (i) i.focus(); }
  }
  function brancherSansEmail() {
    $('#s-quartier').innerHTML = `<option value="">${E(L('bv.choisirQuartier', 'Je ne sais pas encore'))}</option>` + NT.QUARTIERS.map(q => `<option>${E(q)}</option>`).join('');
    $('#form-sans').addEventListener('submit', e => {
      e.preventDefault();
      const v = id => document.getElementById(id).value.trim();
      const err = [];
      if (!v('s-prenom') || !v('s-nom')) err.push([v('s-prenom') ? 's-nom' : 's-prenom', L('bv.e.nom', 'Indiquez votre prénom et votre nom.')]);
      if (v('s-tel') && !TEL.test(v('s-tel'))) err.push(['s-tel', L('bv.e.tel', 'Le numéro de téléphone ne doit contenir que des chiffres, des espaces et le signe +.')]);
      if (!$('#s-code').value) err.push(['s-code', L('bv.e.code', 'Choisissez un code secret (6 chiffres) ou un mot de passe.')]);
      else if ($('#s-code').value !== $('#s-code2').value) err.push(['s-code2', L('bv.e.code2', 'Les deux codes sont différents.')]);
      erreurs(e.target, err);
      if (err.length) return;
      const r = NT.api('POST', '/api/accueil/inscrire', { prenom: v('s-prenom'), nom: v('s-nom'), telephone: v('s-tel'), quartier: v('s-quartier'), code: $('#s-code').value, langue: NT.i18n.langue });
      if (r.statut !== 200 || !r.donnees || !r.donnees.ok) { erreurs(e.target, [['s-code', (r.donnees && r.donnees.erreur) || 'Action impossible.']]); return; }
      NT.recharger();
      u = NT.auth.utilisateur();
      if (guide) { guide.faites = (guide.faites || []).concat('compte'); sauver(); }   // la liste préparée avant l'inscription rejoint le profil
      const personne = { prenom: v('s-prenom'), nom: v('s-nom'), identifiant: r.donnees.identifiant, langue: NT.i18n.langue };
      $('#sans-email').hidden = true;
      $('#fiche-contenu').innerHTML = NT.ficheAccueil.html(personne);
      $('#fiche').hidden = false; $('#fiche').focus();
      $('#imprimer-fiche').onclick = () => NT.ficheAccueil.imprimer([personne]);
      if (guide) rendreListe(false);
    });
  }
  function brancherCode() {
    $('#code').hidden = false;
    $('#form-code').addEventListener('submit', e => {
      e.preventDefault();
      const a = $('#nv-code').value, b = $('#nv-code2').value;
      const err = [];
      if (!a) err.push(['nv-code', L('bv.e.code', 'Choisissez un code secret (6 chiffres) ou un mot de passe.')]);
      else if (a !== b) err.push(['nv-code2', L('bv.e.code2', 'Les deux codes sont différents.')]);
      erreurs(e.target, err);
      if (err.length) return;
      const r = NT.api('POST', '/api/accueil/code', { nouveau: a });
      if (r.statut !== 200) { erreurs(e.target, [['nv-code', (r.donnees && r.donnees.erreur) || 'Action impossible.']]); return; }
      $('#code').hidden = true;
      NT.ui.toast(L('bv.codeOk', 'Votre code secret est enregistré. Utilisez-le à la prochaine connexion.'), 'success');
      if (guide) { guide.faites = (guide.faites || []).concat('code'); sauver(); rendreListe(false); }
    });
  }

  NT.pret(() => {
    u = NT.auth.utilisateur();
    rendreLangues();
    if (u) $('#q-email').hidden = true;
    guide = (u && u.guideArrivee) || lireLocal();
    if (u && !u.guideArrivee && guide) sauver();   // réponses données avant la connexion : rattachées au profil
    if (guide) { remplirForm(guide.reponses || {}); rendreListe(false); }
    if (!u) { $('#sans-email').hidden = false; brancherSansEmail(); }
    else if (u.codeProvisoire) brancherCode();

    $('#form-guide').addEventListener('submit', e => {
      e.preventDefault();
      const reponses = lireForm();
      guide = { reponses, etapes: etapesPour(reponses, u), faites: (guide && guide.faites) || [] };
      sauver();
      rendreListe(true);
    });
    $('#etapes').addEventListener('change', e => {
      const c = e.target.closest('[data-faite]'); if (!c) return;
      const s = new Set(guide.faites || []);
      if (c.checked) s.add(c.dataset.faite); else s.delete(c.dataset.faite);
      guide.faites = [...s];
      sauver();
      rendreListe(false);
      const nc = document.querySelector(`[data-faite="${c.dataset.faite}"]`); if (nc) nc.focus();
    });
    $('#modifier').addEventListener('click', () => { $('#guide').scrollIntoView({ block: 'start' }); $('#form-guide input').focus({ preventScroll: true }); });
    if (location.hash === '#sans-email' && !u) setTimeout(() => { $('#sans-email').scrollIntoView({ block: 'start' }); $('#s-prenom').focus({ preventScroll: true }); }, 200);
    else if (location.hash === '#guide') setTimeout(() => $('#guide').scrollIntoView({ block: 'start' }), 200);
  });
})();
