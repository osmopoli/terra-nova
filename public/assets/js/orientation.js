/* Terra Nova — vague 18 : trouver le bon service, même avec des mots imprécis.
   D10 : recherche globale (en-tête + accueil) tolérante aux fautes, synonymes, « Vouliez-vous dire… », résultats groupés
         (Services / Démarches / Réponses / Annonces / Associations) avec le meilleur bouton d'action, jamais d'impasse.
   F91 : « Assistant d'orientation » (fenêtre accessible : clavier, lecteur d'écran, 360 px, arabe de droite à gauche) : besoin compris,
         service compétent, étapes, documents, où et quand, boutons d'action, une question de précision avec puces, urgence d'abord.
         Honnête : ce n'est ni une personne ni une IA générative. La conversation reste dans le navigateur (sessionStorage).
   Chargé sur toutes les pages par ui.js ; charge à son tour langage-clair.js (F89, F90) et, sur demande.html, orientation-demande.js (F92). */
(function () {
  'use strict';
  const NT = window.NT;
  if (!NT || !NT.ui || NT.orientation) return;
  const t = NT.t, E = NT.ui.echap;
  const enc = encodeURIComponent;

  NT.i18n.ajouter({
    fr: { 'or.bouton': 'Rechercher', 'or.boutonTitre': 'Rechercher ou demander à l’assistant d’orientation', 'or.titre': 'Trouver le bon service', 'or.fermer': 'Fermer',
      'or.ongletRecherche': 'Rechercher', 'or.ongletAssistant': 'Assistant d’orientation', 'or.rechercheLabel': 'Que cherchez-vous ?', 'or.recherchePh': 'Ex. : ma poubelle déborde, papier pour me marier…', 'or.chercher': 'Rechercher',
      'or.honnete': 'Assistant d’orientation automatique : il compare vos mots à la liste des services et démarches de la ville. Ce n’est ni une personne ni une intelligence artificielle générative. N’écrivez pas d’informations personnelles : la conversation reste sur cet appareil et s’efface quand vous fermez le navigateur.',
      'or.bienvenue': 'Bonjour. Dites avec vos mots ce dont vous avez besoin, par exemple « plus d’eau au robinet » ou « papier pour me marier ». Je vous indique le bon service et la marche à suivre.',
      'or.messageLabel': 'Votre besoin, avec vos mots', 'or.messagePh': 'Écrivez ici…', 'or.envoyer': 'Envoyer', 'or.effacer': 'Effacer la conversation', 'or.vous': 'Vous', 'or.assistant': 'Assistant d’orientation', 'or.attente': 'Je cherche le bon service…',
      'or.compris': 'Votre besoin : {b}', 'or.parceQue': 'parce que vous parlez de {m}', 'or.corrigeA': 'J’ai lu : « {q} »', 'or.service': 'Service compétent', 'or.etapes': 'Ce qu’il faut faire', 'or.documents': 'Documents à prévoir',
      'or.ouQuand': 'Où et quand', 'or.horaires': 'Horaires', 'or.lieu': 'Lieu', 'or.tel': 'Téléphone', 'or.assos': 'Associations qui peuvent aussi vous aider', 'or.ouverte': 'Ouverte maintenant', 'or.fermee': 'Fermée en ce moment',
      'or.enBref': 'En bref, en langage clair', 'or.quand': 'Quand ?', 'or.combien': 'Combien ?', 'or.preciser': 'Pour bien vous orienter, c’est plutôt :', 'or.autreChose': 'Autre chose', 'or.autreService': 'Autre chose pour ce service',
      'or.ditesPlus': 'D’accord. Dites-m’en un peu plus, avec d’autres mots.', 'or.incompris': 'Je n’ai pas bien compris. Pouvez-vous le dire autrement ? Voici les services les plus proches ; la mairie peut aussi vous répondre.',
      'or.piste': 'Peut-être :', 'or.autres': 'Autres possibilités :', 'or.utile': 'Cette réponse vous aide ?', 'or.oui': 'Oui', 'or.non': 'Non', 'or.merci': 'Merci !',
      'or.nonUtile': 'Merci. Votre question est transmise sans votre nom aux agents, pour améliorer l’assistant. Vous pouvez aussi écrire à la mairie.',
      'or.urgenceTitre': 'Urgence : appelez d’abord les secours', 'or.urgenceTexte': 'Si une vie est en danger, appelez le 15 (urgence médicale) ou le 112. Terra Nova ne remplace pas les secours.', 'or.pasUrgent': 'Ce n’est pas une urgence vitale', 'or.soins': 'Lieux de soins les plus proches',
      'or.a.commencer': 'Commencer la démarche', 'or.a.signaler': 'Faire le signalement', 'or.a.ecrire': 'Écrire au service', 'or.a.rdv': 'Prendre rendez-vous', 'or.a.voir': 'Ouvrir la page', 'or.a.appeler': 'Appeler le {tel}',
      'or.a.appeler15': 'Appeler le 15', 'or.a.appeler112': 'Appeler le 112', 'or.a.carte': 'Voir sur la carte', 'or.a.voirService': 'Voir le service', 'or.a.lire': 'Lire la réponse', 'or.a.voirAnnonce': 'Lire l’annonce',
      'or.g.services': 'Services', 'or.g.demarches': 'Démarches', 'or.g.reponses': 'Réponses', 'or.g.annonces': 'Annonces', 'or.g.associations': 'Associations partenaires',
      'or.vouliez': 'Vouliez-vous dire', 'or.resultatsPour': 'Résultats pour « {q} »', 'or.nbRes': '{n} résultat(s)', 'or.plusProbable': 'Le plus probable', 'or.aucun': 'Aucun résultat exact pour « {q} ».',
      'or.proches': 'Les services les plus proches', 'or.ecrireMairie': 'Écrire à la mairie', 'or.demanderAssistant': 'Demander à l’assistant d’orientation', 'or.tousServices': 'Voir tous les services', 'or.voirTout': 'Voir tous les résultats',
      'or.lienAccueil': 'Vous ne savez pas comment le dire ? Demandez à l’assistant d’orientation', 'or.erreur': 'La recherche ne répond pas pour le moment. Réessayez dans un instant ou écrivez à la mairie.',
      'or.aideTitre': 'Pas sûr du service ? L’assistant d’orientation vous guide', 'or.aideTexte': 'Écrivez votre besoin avec vos mots, même avec des fautes ou dans une autre langue : il vous indique le service, les étapes et les documents.' },
    en: { 'or.bouton': 'Search', 'or.boutonTitre': 'Search or ask the guidance assistant', 'or.titre': 'Find the right service', 'or.fermer': 'Close',
      'or.ongletRecherche': 'Search', 'or.ongletAssistant': 'Guidance assistant', 'or.rechercheLabel': 'What are you looking for?', 'or.recherchePh': 'E.g. my bin is overflowing, papers to get married…', 'or.chercher': 'Search',
      'or.honnete': 'Automatic guidance assistant: it compares your words with the city’s list of services and procedures. It is neither a person nor a generative AI. Do not write personal information: the conversation stays on this device and is erased when you close the browser.',
      'or.bienvenue': 'Hello. Say in your own words what you need, for example “no water from the tap” or “papers to get married”. I will show you the right service and what to do.',
      'or.messageLabel': 'What you need, in your own words', 'or.messagePh': 'Write here…', 'or.envoyer': 'Send', 'or.effacer': 'Clear the conversation', 'or.vous': 'You', 'or.assistant': 'Guidance assistant', 'or.attente': 'Looking for the right service…',
      'or.compris': 'What you need: {b}', 'or.parceQue': 'because you mention {m}', 'or.corrigeA': 'I read: “{q}”', 'or.service': 'Competent service', 'or.etapes': 'What to do', 'or.documents': 'Documents to bring',
      'or.ouQuand': 'Where and when', 'or.horaires': 'Opening hours', 'or.lieu': 'Place', 'or.tel': 'Phone', 'or.assos': 'Associations that can also help', 'or.ouverte': 'Open now', 'or.fermee': 'Closed right now',
      'or.enBref': 'In short, in plain language', 'or.quand': 'When?', 'or.combien': 'How much?', 'or.preciser': 'To guide you well, is it rather:', 'or.autreChose': 'Something else', 'or.autreService': 'Something else for this service',
      'or.ditesPlus': 'All right. Tell me a little more, with other words.', 'or.incompris': 'I did not quite understand. Could you say it differently? Here are the closest services; city hall can also answer you.',
      'or.piste': 'Maybe:', 'or.autres': 'Other possibilities:', 'or.utile': 'Does this answer help you?', 'or.oui': 'Yes', 'or.non': 'No', 'or.merci': 'Thank you!',
      'or.nonUtile': 'Thank you. Your question is passed on to staff without your name, to improve the assistant. You can also write to city hall.',
      'or.urgenceTitre': 'Emergency: call for help first', 'or.urgenceTexte': 'If a life is in danger, call 15 (medical emergency) or 112. Terra Nova does not replace emergency services.', 'or.pasUrgent': 'It is not life-threatening', 'or.soins': 'Nearest care places',
      'or.a.commencer': 'Start the procedure', 'or.a.signaler': 'Make the report', 'or.a.ecrire': 'Write to the service', 'or.a.rdv': 'Book an appointment', 'or.a.voir': 'Open the page', 'or.a.appeler': 'Call {tel}',
      'or.a.appeler15': 'Call 15', 'or.a.appeler112': 'Call 112', 'or.a.carte': 'See on the map', 'or.a.voirService': 'See the service', 'or.a.lire': 'Read the answer', 'or.a.voirAnnonce': 'Read the notice',
      'or.g.services': 'Services', 'or.g.demarches': 'Procedures', 'or.g.reponses': 'Answers', 'or.g.annonces': 'Notices', 'or.g.associations': 'Partner associations',
      'or.vouliez': 'Did you mean', 'or.resultatsPour': 'Results for “{q}”', 'or.nbRes': '{n} result(s)', 'or.plusProbable': 'Most likely', 'or.aucun': 'No exact result for “{q}”.',
      'or.proches': 'Closest services', 'or.ecrireMairie': 'Write to city hall', 'or.demanderAssistant': 'Ask the guidance assistant', 'or.tousServices': 'See all services', 'or.voirTout': 'See all results',
      'or.lienAccueil': 'Not sure how to say it? Ask the guidance assistant', 'or.erreur': 'Search is not responding right now. Try again in a moment or write to city hall.',
      'or.aideTitre': 'Not sure which service? The guidance assistant helps', 'or.aideTexte': 'Write what you need in your own words, even with mistakes or in another language: it shows you the service, the steps and the documents.' },
    es: { 'or.bouton': 'Buscar', 'or.boutonTitre': 'Buscar o preguntar al asistente de orientación', 'or.titre': 'Encontrar el servicio adecuado', 'or.fermer': 'Cerrar',
      'or.ongletRecherche': 'Buscar', 'or.ongletAssistant': 'Asistente de orientación', 'or.rechercheLabel': '¿Qué busca?', 'or.recherchePh': 'Ej.: mi basura desborda, papeles para casarme…', 'or.chercher': 'Buscar',
      'or.honnete': 'Asistente de orientación automático: compara sus palabras con la lista de servicios y trámites de la ciudad. No es una persona ni una inteligencia artificial generativa. No escriba datos personales: la conversación se queda en este dispositivo y se borra al cerrar el navegador.',
      'or.bienvenue': 'Hola. Diga con sus palabras lo que necesita, por ejemplo «no sale agua del grifo» o «papeles para casarme». Le indico el servicio adecuado y qué hacer.',
      'or.messageLabel': 'Lo que necesita, con sus palabras', 'or.messagePh': 'Escriba aquí…', 'or.envoyer': 'Enviar', 'or.effacer': 'Borrar la conversación', 'or.vous': 'Usted', 'or.assistant': 'Asistente de orientación', 'or.attente': 'Buscando el servicio adecuado…',
      'or.compris': 'Lo que necesita: {b}', 'or.parceQue': 'porque habla de {m}', 'or.corrigeA': 'He leído: «{q}»', 'or.service': 'Servicio competente', 'or.etapes': 'Qué hacer', 'or.documents': 'Documentos necesarios',
      'or.ouQuand': 'Dónde y cuándo', 'or.horaires': 'Horario', 'or.lieu': 'Lugar', 'or.tel': 'Teléfono', 'or.assos': 'Asociaciones que también pueden ayudarle', 'or.ouverte': 'Abierta ahora', 'or.fermee': 'Cerrada ahora',
      'or.enBref': 'En resumen, en lenguaje claro', 'or.quand': '¿Cuándo?', 'or.combien': '¿Cuánto?', 'or.preciser': 'Para orientarle bien, ¿se trata más bien de…?', 'or.autreChose': 'Otra cosa', 'or.autreService': 'Otra cosa de este servicio',
      'or.ditesPlus': 'De acuerdo. Cuénteme un poco más, con otras palabras.', 'or.incompris': 'No he entendido bien. ¿Puede decirlo de otra forma? Estos son los servicios más cercanos; el ayuntamiento también puede responderle.',
      'or.piste': 'Quizá:', 'or.autres': 'Otras posibilidades:', 'or.utile': '¿Le ayuda esta respuesta?', 'or.oui': 'Sí', 'or.non': 'No', 'or.merci': '¡Gracias!',
      'or.nonUtile': 'Gracias. Su pregunta se transmite sin su nombre al personal para mejorar el asistente. También puede escribir al ayuntamiento.',
      'or.urgenceTitre': 'Urgencia: llame primero a emergencias', 'or.urgenceTexte': 'Si una vida está en peligro, llame al 15 (urgencia médica) o al 112. Terra Nova no sustituye a los servicios de emergencia.', 'or.pasUrgent': 'No es una urgencia vital', 'or.soins': 'Centros de salud más cercanos',
      'or.a.commencer': 'Empezar el trámite', 'or.a.signaler': 'Hacer el aviso', 'or.a.ecrire': 'Escribir al servicio', 'or.a.rdv': 'Pedir cita', 'or.a.voir': 'Abrir la página', 'or.a.appeler': 'Llamar al {tel}',
      'or.a.appeler15': 'Llamar al 15', 'or.a.appeler112': 'Llamar al 112', 'or.a.carte': 'Ver en el mapa', 'or.a.voirService': 'Ver el servicio', 'or.a.lire': 'Leer la respuesta', 'or.a.voirAnnonce': 'Leer el anuncio',
      'or.g.services': 'Servicios', 'or.g.demarches': 'Trámites', 'or.g.reponses': 'Respuestas', 'or.g.annonces': 'Anuncios', 'or.g.associations': 'Asociaciones colaboradoras',
      'or.vouliez': '¿Quiso decir', 'or.resultatsPour': 'Resultados para «{q}»', 'or.nbRes': '{n} resultado(s)', 'or.plusProbable': 'Lo más probable', 'or.aucun': 'Ningún resultado exacto para «{q}».',
      'or.proches': 'Los servicios más cercanos', 'or.ecrireMairie': 'Escribir al ayuntamiento', 'or.demanderAssistant': 'Preguntar al asistente de orientación', 'or.tousServices': 'Ver todos los servicios', 'or.voirTout': 'Ver todos los resultados',
      'or.lienAccueil': '¿No sabe cómo decirlo? Pregunte al asistente de orientación', 'or.erreur': 'La búsqueda no responde ahora. Inténtelo de nuevo o escriba al ayuntamiento.',
      'or.aideTitre': '¿No sabe qué servicio? El asistente de orientación le guía', 'or.aideTexte': 'Escriba lo que necesita con sus palabras, incluso con faltas o en otro idioma: le indica el servicio, los pasos y los documentos.' },
    ar: { 'or.bouton': 'بحث', 'or.boutonTitre': 'ابحث أو اسأل مساعد التوجيه', 'or.titre': 'إيجاد الخدمة المناسبة', 'or.fermer': 'إغلاق',
      'or.ongletRecherche': 'بحث', 'or.ongletAssistant': 'مساعد التوجيه', 'or.rechercheLabel': 'عمّ تبحث؟', 'or.recherchePh': 'مثال: حاوية القمامة ممتلئة، أوراق الزواج…', 'or.chercher': 'بحث',
      'or.honnete': 'مساعد توجيه آلي: يقارن كلماتك بقائمة خدمات المدينة وإجراءاتها. ليس شخصاً ولا ذكاءً اصطناعياً توليدياً. لا تكتب معلومات شخصية: تبقى المحادثة على هذا الجهاز وتُمحى عند إغلاق المتصفح.',
      'or.bienvenue': 'مرحباً. قل بكلماتك ما تحتاجه، مثلاً «لا يوجد ماء في الحنفية» أو «أوراق الزواج». سأدلك على الخدمة المناسبة وما عليك فعله.',
      'or.messageLabel': 'ما تحتاجه، بكلماتك', 'or.messagePh': 'اكتب هنا…', 'or.envoyer': 'إرسال', 'or.effacer': 'مسح المحادثة', 'or.vous': 'أنت', 'or.assistant': 'مساعد التوجيه', 'or.attente': 'أبحث عن الخدمة المناسبة…',
      'or.compris': 'حاجتك: {b}', 'or.parceQue': 'لأنك تتحدث عن {m}', 'or.corrigeA': 'قرأت: «{q}»', 'or.service': 'الخدمة المختصة', 'or.etapes': 'ما يجب فعله', 'or.documents': 'الوثائق المطلوبة',
      'or.ouQuand': 'أين ومتى', 'or.horaires': 'المواعيد', 'or.lieu': 'المكان', 'or.tel': 'الهاتف', 'or.assos': 'جمعيات يمكنها مساعدتك أيضاً', 'or.ouverte': 'مفتوحة الآن', 'or.fermee': 'مغلقة حالياً',
      'or.enBref': 'باختصار وبلغة واضحة', 'or.quand': 'متى؟', 'or.combien': 'كم؟', 'or.preciser': 'لتوجيهك جيداً، هل الأمر بالأحرى:', 'or.autreChose': 'شيء آخر', 'or.autreService': 'شيء آخر لهذه الخدمة',
      'or.ditesPlus': 'حسناً. أخبرني أكثر بكلمات أخرى.', 'or.incompris': 'لم أفهم جيداً. هل يمكنك قولها بطريقة أخرى؟ هذه أقرب الخدمات؛ ويمكن للبلدية أيضاً أن تجيبك.',
      'or.piste': 'ربما:', 'or.autres': 'احتمالات أخرى:', 'or.utile': 'هل تساعدك هذه الإجابة؟', 'or.oui': 'نعم', 'or.non': 'لا', 'or.merci': 'شكراً!',
      'or.nonUtile': 'شكراً. يُرسل سؤالك دون اسمك إلى الموظفين لتحسين المساعد. يمكنك أيضاً مراسلة البلدية.',
      'or.urgenceTitre': 'طوارئ: اتصل بالإسعاف أولاً', 'or.urgenceTexte': 'إذا كانت حياة في خطر، اتصل بالرقم 15 (طوارئ طبية) أو 112. تيرا نوفا لا تحل محل الإسعاف.', 'or.pasUrgent': 'ليست حالة طارئة', 'or.soins': 'أقرب أماكن العلاج',
      'or.a.commencer': 'بدء الإجراء', 'or.a.signaler': 'تقديم البلاغ', 'or.a.ecrire': 'مراسلة الخدمة', 'or.a.rdv': 'حجز موعد', 'or.a.voir': 'فتح الصفحة', 'or.a.appeler': 'اتصل بالرقم {tel}',
      'or.a.appeler15': 'اتصل بالرقم 15', 'or.a.appeler112': 'اتصل بالرقم 112', 'or.a.carte': 'عرض على الخريطة', 'or.a.voirService': 'عرض الخدمة', 'or.a.lire': 'قراءة الإجابة', 'or.a.voirAnnonce': 'قراءة الإعلان',
      'or.g.services': 'الخدمات', 'or.g.demarches': 'الإجراءات', 'or.g.reponses': 'إجابات', 'or.g.annonces': 'الإعلانات', 'or.g.associations': 'الجمعيات الشريكة',
      'or.vouliez': 'هل تقصد', 'or.resultatsPour': 'نتائج «{q}»', 'or.nbRes': '{n} نتيجة', 'or.plusProbable': 'الأرجح', 'or.aucun': 'لا توجد نتيجة مطابقة لـ «{q}».',
      'or.proches': 'أقرب الخدمات', 'or.ecrireMairie': 'مراسلة البلدية', 'or.demanderAssistant': 'اسأل مساعد التوجيه', 'or.tousServices': 'عرض كل الخدمات', 'or.voirTout': 'عرض كل النتائج',
      'or.lienAccueil': 'لا تعرف كيف تقولها؟ اسأل مساعد التوجيه', 'or.erreur': 'البحث لا يستجيب حالياً. أعد المحاولة بعد قليل أو راسل البلدية.',
      'or.aideTitre': 'لست متأكداً من الخدمة؟ مساعد التوجيه يرشدك', 'or.aideTexte': 'اكتب حاجتك بكلماتك، حتى مع أخطاء أو بلغة أخرى: يدلك على الخدمة والخطوات والوثائق.' }
  });

  // Feuille de style (versionnée par le serveur comme toutes les références « assets/… »)
  if (!document.querySelector('link[data-or-css]')) {
    const css = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: 'assets/css/orientation.css' });
    css.dataset.orCss = '1'; document.head.append(css);
  }
  const langue = () => NT.i18n.langue;
  const page = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '') || 'index';

  /* ---------- Appels serveur ---------- */
  const lire = (r) => (r.ok ? r.json() : r.json().catch(() => ({})).then((d) => Promise.reject(Object.assign(new Error(d.erreur || 'HTTP ' + r.status), { statut: r.status }))));
  const api = {
    recherche: (q) => fetch('/api/recherche?q=' + enc(q) + '&langue=' + langue(), { credentials: 'same-origin', cache: 'no-store' }).then(lire),
    poster: (url, corps) => fetch(url, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ langue: langue() }, corps)) }).then(lire)
  };

  /* ---------- Boutons d'action ---------- */
  const ICONES = { commencer: 'ph-file-text', signaler: 'ph-map-pin-line', ecrire: 'ph-envelope-simple', rdv: 'ph-calendar-check', voir: 'ph-arrow-square-out', appeler: 'ph-phone', appeler15: 'ph-phone-call', appeler112: 'ph-phone-call',
    carte: 'ph-map-pin', voirService: 'ph-compass', lire: 'ph-book-open-text', voirAnnonce: 'ph-megaphone' };
  const libelle = (a) => t('or.a.' + a.code, { tel: a.tel || '' });
  function bouton(a, primaire) {
    if (!a) return '';
    const cls = 'btn' + (primaire ? ' btn-primaire' : '') + (a.code === 'appeler15' || a.code === 'appeler112' ? ' btn-danger' : '');
    const ico = `<i class="ph ${ICONES[a.code] || 'ph-arrow-right'}" aria-hidden="true"></i>`;
    if (a.tel) return `<a class="${cls}" href="tel:${E(String(a.tel).replace(/[^\d+]/g, ''))}">${ico}${E(libelle(a))}</a>`;
    return `<a class="${cls}" href="${E(a.lien || '#')}" data-or-lien>${ico}${E(libelle(a))}</a>`;
  }
  const urgenceHtml = () => `<div class="or-urgence" role="alert"><h3><i class="ph-duotone ph-first-aid-kit" aria-hidden="true"></i>${E(t('or.urgenceTitre'))}</h3>
    <p style="margin:0 0 .7rem">${E(t('or.urgenceTexte'))}</p>
    <div class="or-actions" style="margin-top:0"><a class="or-appel" href="tel:15"><i class="ph-duotone ph-phone-call" aria-hidden="true"></i>${E(t('or.a.appeler15'))}</a>
      <a class="or-appel secondaire" href="tel:112"><i class="ph-duotone ph-phone-call" aria-hidden="true"></i>${E(t('or.a.appeler112'))}</a>
      <a class="btn" href="carte.html?filtre=urgence" data-or-lien><i class="ph ph-map-pin" aria-hidden="true"></i>${E(t('or.soins'))}</a></div></div>`;

  /* ---------- D10 : résultats groupés ---------- */
  const GROUPES = [['demarches', 'ph-file-text'], ['services', 'ph-compass'], ['reponses', 'ph-chat-circle-text'], ['annonces', 'ph-megaphone'], ['associations', 'ph-hand-heart']];
  function itemHtml(it) {
    const pastille = it.type === 'association' ? `<span class="or-pastille${it.ouverte ? ' ouverte' : ''}">${E(t(it.ouverte ? 'or.ouverte' : 'or.fermee'))}</span>`
      : it.type === 'service' && it.etat && it.etat !== 'ok' ? NT.ui.niveauBadge({ etat: { code: it.etat } }) : '';
    return `<li class="or-item"><a class="or-titre" href="${E(it.lien || '#')}" data-or-lien>${E(it.titre)}</a>${pastille}
      ${it.extrait ? `<p>${E(it.extrait)}</p>` : '<p></p>'}${bouton(it.action, false)}</li>`;
  }
  function repliHtml(q, services) {
    return `<div class="or-repli"><h3>${E(t('or.aucun', { q }))}</h3>
      ${services && services.length ? `<p class="doux" style="margin:.2rem 0 .5rem">${E(t('or.proches'))}</p><ul class="or-groupe" style="list-style:none;margin:0;padding:0;display:grid;gap:.5rem">${services.map((s) => itemHtml(Object.assign({ type: 'service' }, s))).join('')}</ul>` : ''}
      <div class="or-actions"><button type="button" class="btn btn-primaire" data-or-assistant="${E(q)}"><i class="ph ph-chats-teardrop" aria-hidden="true"></i>${E(t('or.demanderAssistant'))}</button>
        <a class="btn" href="demande.html?type=contact&amp;service=inconnu" data-or-lien><i class="ph ph-envelope-simple" aria-hidden="true"></i>${E(t('or.ecrireMairie'))}</a>
        <a class="btn" href="services.html"><i class="ph ph-squares-four" aria-hidden="true"></i>${E(t('or.tousServices'))}</a></div></div>`;
  }
  function rendreRecherche(d, opts) {
    const o = opts || {};
    if (!d) return '';
    let html = d.urgence ? urgenceHtml() : '';
    if (d.corrige) html += `<p class="or-corrige">${E(t('or.vouliez'))} <button type="button" data-or-q="${E(d.corrige)}">« ${E(d.corrige)} »</button> ?</p>`;
    if (!d.total) return html + repliHtml(d.q, d.repli && d.repli.services);
    if (d.meilleur && d.meilleur.action) html += `<div class="or-meilleur"><div><span class="or-surtitre">${E(t('or.plusProbable'))}</span><strong>${E(d.meilleur.titre)}</strong></div>${bouton(d.meilleur.action, true)}</div>`;
    const max = o.compact ? 3 : 10;
    for (const [g, ico] of GROUPES) {
      const l = (d.groupes[g] || []).filter((x) => !(d.meilleur && x.type === d.meilleur.type && x.id === d.meilleur.id)).slice(0, max);
      if (!l.length) continue;
      html += `<section class="or-groupe" aria-label="${E(t('or.g.' + g))}"><h3><i class="ph ${ico}" aria-hidden="true"></i>${E(t('or.g.' + g))}</h3><ul>${l.map(itemHtml).join('')}</ul></section>`;
    }
    if (o.compact) html += `<p style="margin:0"><a href="recherche.html?q=${enc(d.q)}">${E(t('or.voirTout'))} →</a></p>`;
    else html += `<p class="doux" style="margin:0"><button type="button" class="or-lien-assistant" style="margin:0" data-or-assistant="${E(d.q)}"><i class="ph ph-chats-teardrop" aria-hidden="true"></i>${E(t('or.lienAccueil'))}</button></p>`;
    return `<div class="or-res">${html}</div>`;
  }
  // Chercher et afficher dans une zone ; annonce le nombre de résultats aux lecteurs d'écran
  let jetonRecherche = 0;
  function chercherDans(zone, q, opts) {
    const n = ++jetonRecherche;
    if (!q || q.trim().length < 2) { zone.innerHTML = ''; zone.hidden = !!(opts && opts.masquerVide); return Promise.resolve(null); }
    return api.recherche(q.trim()).then((d) => {
      if (n !== jetonRecherche) return null;
      zone.hidden = false;
      zone.innerHTML = rendreRecherche(d, opts);
      // seule annonce pour le lecteur d'écran : la zone n'est pas aria-live (sinon tout serait lu deux fois)
      NT.ui.annoncer(d.total ? t('or.nbRes', { n: d.total }) : t('or.aucun', { q: d.q }));
      return d;
    }).catch(() => { if (n === jetonRecherche) { zone.hidden = false; zone.innerHTML = `<p class="or-repli">${E(t('or.erreur'))}</p>` + repliHtml(q, []); } return null; });
  }

  /* ---------- Fenêtre « Trouver le bon service » : recherche + assistant ---------- */
  let dlg = null, ouvreur = null;
  function creer() {
    dlg = document.createElement('dialog');
    dlg.className = 'or-dialogue';
    dlg.setAttribute('aria-labelledby', 'or-titre');
    dlg.innerHTML = `
      <div class="or-tete"><h2 id="or-titre"><i class="ph-duotone ph-compass" aria-hidden="true"></i><span>${E(t('or.titre'))}</span></h2>
        <button type="button" class="bouton-rond" data-or-fermer title="${E(t('or.fermer'))}"><i class="ph ph-x" aria-hidden="true"></i><span class="sr-only">${E(t('or.fermer'))}</span></button></div>
      <div class="or-onglets" role="tablist" aria-label="${E(t('or.titre'))}">
        <button type="button" role="tab" class="or-onglet" id="or-t-recherche" aria-controls="or-p-recherche" aria-selected="true"><i class="ph ph-magnifying-glass" aria-hidden="true"></i>${E(t('or.ongletRecherche'))}</button>
        <button type="button" role="tab" class="or-onglet" id="or-t-assistant" aria-controls="or-p-assistant" aria-selected="false" tabindex="-1"><i class="ph ph-chats-teardrop" aria-hidden="true"></i>${E(t('or.ongletAssistant'))}</button></div>
      <section class="or-panneau" role="tabpanel" id="or-p-recherche" aria-labelledby="or-t-recherche">
        <form role="search" id="or-form-recherche" action="recherche.html">
          <label for="or-q" class="sr-only">${E(t('or.rechercheLabel'))}</label>
          <div class="or-champ"><i class="ph ph-magnifying-glass" aria-hidden="true"></i><input id="or-q" name="q" type="search" autocomplete="off" enterkeyhint="search" maxlength="200" placeholder="${E(t('or.recherchePh'))}">
            <button class="btn btn-primaire" type="submit">${E(t('or.chercher'))}</button></div>
        </form>
        <div id="or-resultats"></div>
      </section>
      <section class="or-panneau" role="tabpanel" id="or-p-assistant" aria-labelledby="or-t-assistant" hidden>
        <p class="or-honnete"><i class="ph-duotone ph-info" aria-hidden="true"></i><span>${E(t('or.honnete'))}</span></p>
        <ol class="or-fil" id="or-fil" role="log" aria-live="polite" aria-relevant="additions" aria-label="${E(t('or.assistant'))}"></ol>
        <form class="or-saisie" id="or-form-message">
          <label for="or-message">${E(t('or.messageLabel'))}</label>
          <div class="or-champ"><textarea id="or-message" rows="2" maxlength="600" placeholder="${E(t('or.messagePh'))}" enterkeyhint="send"></textarea>
            <button class="btn btn-primaire" type="submit"><i class="ph ph-paper-plane-right" aria-hidden="true"></i><span>${E(t('or.envoyer'))}</span></button></div>
          <div class="or-bas"><span>${E(t('or.assistant'))}</span><button type="button" data-or-effacer>${E(t('or.effacer'))}</button></div>
        </form>
      </section>`;
    document.body.append(dlg);
    const q = dlg.querySelector('#or-q'), res = dlg.querySelector('#or-resultats');
    res.dataset.orChamp = 'or-q';
    let minuterie = null;
    q.addEventListener('input', () => { clearTimeout(minuterie); minuterie = setTimeout(() => chercherDans(res, q.value, {}), 220); });
    dlg.querySelector('#or-form-recherche').addEventListener('submit', (e) => { e.preventDefault(); clearTimeout(minuterie); chercherDans(res, q.value, {}); });
    dlg.querySelector('[data-or-fermer]').addEventListener('click', () => dlg.close());
    dlg.addEventListener('close', () => { if (ouvreur && ouvreur.focus) ouvreur.focus(); });
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });   // clic sur le fond
    // onglets : flèches gauche / droite, Début / Fin
    const onglets = [...dlg.querySelectorAll('[role="tab"]')];
    onglets.forEach((o) => o.addEventListener('click', () => mode(o.id === 'or-t-assistant' ? 'assistant' : 'recherche', true)));
    dlg.querySelector('.or-onglets').addEventListener('keydown', (e) => {
      const i = onglets.indexOf(document.activeElement); if (i < 0) return;
      const rtl = document.documentElement.dir === 'rtl';
      let j = null;
      if (e.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) j = (i + 1) % onglets.length; else if (e.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) j = (i - 1 + onglets.length) % onglets.length;
      else if (e.key === 'Home') j = 0; else if (e.key === 'End') j = onglets.length - 1;
      if (j != null) { e.preventDefault(); onglets[j].focus(); onglets[j].click(); }
    });
    // conversation
    const ta = dlg.querySelector('#or-message');
    dlg.querySelector('#or-form-message').addEventListener('submit', (e) => { e.preventDefault(); const v = ta.value.trim(); if (v) { ta.value = ''; envoyer(v); } });
    ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); dlg.querySelector('#or-form-message').requestSubmit(); } });
    dlg.querySelector('[data-or-effacer]').addEventListener('click', () => { conv = { msgs: [], precedent: '' }; sauver(); rendreFil(true); ta.focus(); });
    // délégation : liens, puces, suggestions orthographiques, avis
    dlg.addEventListener('click', clicDelegue);
  }
  function mode(m, focus) {
    if (!dlg) creer();
    const a = m === 'assistant';
    dlg.querySelector('#or-t-recherche').setAttribute('aria-selected', String(!a));
    dlg.querySelector('#or-t-assistant').setAttribute('aria-selected', String(a));
    dlg.querySelector('#or-t-recherche').tabIndex = a ? -1 : 0;
    dlg.querySelector('#or-t-assistant').tabIndex = a ? 0 : -1;
    dlg.querySelector('#or-p-recherche').hidden = a;
    dlg.querySelector('#or-p-assistant').hidden = !a;
    if (a) rendreFil();
    if (focus) setTimeout(() => (a ? dlg.querySelector('#or-message') : dlg.querySelector('#or-q')).focus(), 30);
  }
  function ouvrir(m, texte) {
    if (!dlg) creer();
    ouvreur = document.activeElement;
    if (!dlg.open) { try { dlg.showModal(); } catch { dlg.setAttribute('open', ''); } }
    mode(m === 'assistant' ? 'assistant' : 'recherche', true);
    if (texte) {
      if (m === 'assistant') envoyer(texte);
      else { const q = dlg.querySelector('#or-q'); q.value = texte; chercherDans(dlg.querySelector('#or-resultats'), texte, {}); }
    }
  }
  function clicDelegue(e) {
    const q = e.target.closest('[data-or-q]');
    if (q) { e.preventDefault(); const z = q.closest('[data-or-champ]'); const champ = z && document.getElementById(z.dataset.orChamp); if (champ) { champ.value = q.dataset.orQ; champ.dispatchEvent(new Event('input')); champ.focus(); } return; }
    const as = e.target.closest('[data-or-assistant]');
    if (as) { e.preventDefault(); ouvrir('assistant', as.dataset.orAssistant || ''); return; }
    const puce = e.target.closest('[data-or-choix]');
    if (puce) { e.preventDefault(); choisir(puce.dataset.orChoix, puce.textContent.trim()); return; }
    const avis = e.target.closest('[data-or-avis]');
    if (avis) { e.preventDefault(); donnerAvis(avis); return; }
    const lien = e.target.closest('a[data-or-lien]');
    if (lien) {
      const href = lien.getAttribute('href') || '';
      // la démarche choisie reprend la phrase de l'habitant (dans ce navigateur seulement)
      if (/^demande\.html/.test(href) && conv && conv.dernier) try { sessionStorage.setItem('nt:orientation:texte', conv.dernier); } catch { /* stockage indisponible */ }
      const cible = new URL(href, location.href);
      if (dlg && dlg.open && cible.pathname === location.pathname) { dlg.close(); if (cible.hash && cible.hash !== location.hash) { e.preventDefault(); location.hash = cible.hash; } }
    }
  }
  document.addEventListener('click', (e) => { if (!dlg || !dlg.contains(e.target)) { if (e.target.closest('[data-or-assistant],[data-or-q],a[data-or-lien]')) clicDelegue(e); } });

  /* ---------- F91 : conversation (gardée dans l'onglet seulement) ---------- */
  const CLE = 'nt:orientation';
  let conv = (() => { try { return JSON.parse(sessionStorage.getItem(CLE)) || { msgs: [], precedent: '' }; } catch { return { msgs: [], precedent: '' }; } })();
  const sauver = () => { try { conv.msgs = conv.msgs.slice(-30); sessionStorage.setItem(CLE, JSON.stringify(conv)); } catch { /* stockage indisponible : la conversation reste à l'écran */ } };
  const bulleMoi = (txt) => `<li class="or-msg or-moi"><span class="sr-only">${E(t('or.vous'))} : </span>${E(txt)}</li>`;
  const qui = () => `<span class="or-qui"><i class="ph-duotone ph-compass" aria-hidden="true"></i>${E(t('or.assistant'))}</span>`;
  // Le fil est un journal (role="log") : on ne le reconstruit qu'une fois (ou après « Effacer »), sinon tout serait relu à chaque ouverture
  function rendreFil(forcer) {
    const fil = dlg.querySelector('#or-fil');
    if (!forcer && fil.children.length) { fil.lastElementChild.scrollIntoView({ block: 'nearest' }); return; }
    fil.innerHTML = `<li class="or-msg or-assistant">${qui()}<p>${E(t('or.bienvenue'))}</p></li>` + conv.msgs.map((m) => (m.de === 'moi' ? bulleMoi(m.texte) : `<li class="or-msg or-assistant">${qui()}${reponseHtml(m.r, m.texte)}</li>`)).join('');
    fil.lastElementChild.scrollIntoView({ block: 'nearest' });
  }
  const guillemets = (l) => l.map((m) => '« ' + m + ' »').join(', ');
  function reponseHtml(r, question) {
    if (!r) return '';
    if (r.local) return `<p>${E(t(r.local))}</p>`;
    let h = '';
    if (r.urgence) {
      h += urgenceHtml();
      h += `<div class="or-puces"><button type="button" class="or-puce" data-or-choix="!pasUrgent">${E(t('or.pasUrgent'))}</button></div>`;
      return h;
    }
    if (r.corrige) h += `<p class="doux" style="font-size:var(--t-xs)">${E(t('or.corrigeA', { q: r.corrige }))}</p>`;
    if (r.incompris) {
      h += `<p>${E(t('or.incompris'))}</p>`;
      if (r.clarification && r.clarification.options.length) h += `<p class="doux" style="margin:.4rem 0 0">${E(t('or.piste'))}</p>` + puces(r.clarification.options, false);
      if (r.propositions && r.propositions.length) h += `<ul style="margin-top:.6rem">${r.propositions.map((s) => `<li><a href="${E(s.lien)}" data-or-lien>${E(s.titre)}</a> — ${E(s.extrait)}</li>`).join('')}</ul>`;
      h += `<div class="or-actions"><a class="btn btn-primaire" href="demande.html?type=contact&amp;service=inconnu" data-or-lien><i class="ph ph-envelope-simple" aria-hidden="true"></i>${E(t('or.ecrireMairie'))}</a>
        <a class="btn" href="services.html"><i class="ph ph-squares-four" aria-hidden="true"></i>${E(t('or.tousServices'))}</a></div>`;
      return h;
    }
    if (r.comprehension) h += `<p class="or-compris"><strong>${E(t('or.compris', { b: r.comprehension.besoin }))}</strong>${r.comprehension.raisons && r.comprehension.raisons.length ? ` <em>(${E(t('or.parceQue', { m: guillemets(r.comprehension.raisons) }))})</em>` : ''}</p>`;
    if (r.clarification && !r.reponse) return h + `<p style="margin-top:.5rem">${E(t('or.preciser'))}</p>` + puces(r.clarification.options, true);
    const d = r.reponse;
    if (!d) return h;
    const s = d.service;
    if (d.danger) h += `<p><strong>${E(t('or.urgenceTexte'))}</strong></p>`;
    if (s) h += `<div class="or-carte-svc"><span class="doux" style="font-size:var(--t-xs)">${E(t('or.service'))}</span><strong>${E(s.nom)}</strong>${NT.ui.niveauBadge({ etat: s.etat })}</div>`;
    if (s && s.etat && s.etat.code !== 'ok' && NT.ui.encartService) h += NT.ui.encartService({ id: s.id, etat: s.etat }, {});
    if (d.enBref) h += `<div class="or-enbref"><strong>${E(t('or.enBref'))}</strong><p style="margin:.2rem 0 0">${E(d.enBref.resume || '')}</p>
      ${d.enBref.quand ? `<p style="margin:.2rem 0 0"><strong>${E(t('or.quand'))}</strong> ${E(d.enBref.quand)}</p>` : ''}${d.enBref.combien ? `<p style="margin:.2rem 0 0"><strong>${E(t('or.combien'))}</strong> ${E(d.enBref.combien)}</p>` : ''}</div>`;
    if (d.etapes && d.etapes.length) h += `<h4><i class="ph ph-list-numbers" aria-hidden="true"></i>${E(t('or.etapes'))}</h4><ol>${d.etapes.map((x) => `<li>${E(x)}</li>`).join('')}</ol>`;
    if (d.documents && d.documents.length) h += `<h4><i class="ph ph-files" aria-hidden="true"></i>${E(t('or.documents'))}</h4><ul>${d.documents.map((x) => `<li>${E(x)}</li>`).join('')}</ul>`;
    if (s && (s.horaires || s.lieu || s.tel)) h += `<h4><i class="ph ph-clock" aria-hidden="true"></i>${E(t('or.ouQuand'))}</h4><dl>
      ${s.horaires ? `<div><dt>${E(t('or.horaires'))} :</dt><dd>${E(s.horaires)}</dd></div>` : ''}${s.lieu ? `<div><dt>${E(t('or.lieu'))} :</dt><dd>${E(s.lieu)}</dd></div>` : ''}${s.tel ? `<div><dt>${E(t('or.tel'))} :</dt><dd dir="ltr">${E(s.tel)}</dd></div>` : ''}</dl>`;
    if (d.associations && d.associations.length) h += `<h4><i class="ph ph-hand-heart" aria-hidden="true"></i>${E(t('or.assos'))}</h4><ul>${d.associations.map((a) => `<li><a href="${E(a.lien)}" data-or-lien>${E(a.nom)}</a>
      <span class="or-pastille${a.ouverte ? ' ouverte' : ''}">${E(t(a.ouverte ? 'or.ouverte' : 'or.fermee'))}</span>${a.tel ? ` · <a href="tel:${E(a.tel.replace(/\s/g, ''))}" dir="ltr">${E(a.tel)}</a>` : ''}</li>`).join('')}</ul>`;
    if (d.actions && d.actions.length) h += `<div class="or-actions">${d.actions.map((a, i) => bouton(a, i === 0)).join('')}</div>`;
    if (r.autres && r.autres.length) h += `<p class="doux" style="margin:.7rem 0 0;font-size:var(--t-xs)">${E(t('or.autres'))}</p>` + puces(r.autres, false);
    h += `<div class="or-avis" data-or-q-avis="${E(question || '')}"><span>${E(t('or.utile'))}</span><button type="button" data-or-avis="oui">${E(t('or.oui'))}</button><button type="button" data-or-avis="non">${E(t('or.non'))}</button></div>`;
    return h;
  }
  function puces(options, avecAutre) {
    return `<div class="or-puces">${options.map((o) => `<button type="button" class="or-puce" data-or-choix="${E(o.id)}">${E(o.libelle || t('or.autreService'))}</button>`).join('')}
      ${avecAutre ? `<button type="button" class="or-puce" data-or-choix="!autre">${E(t('or.autreChose'))}</button>` : ''}</div>`;
  }
  function ajouterAssistant(r, question) {
    conv.msgs.push({ de: 'assistant', r, texte: question });
    sauver();
    const fil = dlg.querySelector('#or-fil');
    const att = fil.querySelector('.or-attente'); if (att) att.closest('li').remove();
    const li = document.createElement('li');
    li.className = 'or-msg or-assistant';
    li.innerHTML = qui() + reponseHtml(r, question);
    fil.append(li);
    li.scrollIntoView({ block: 'nearest', behavior: document.documentElement.classList.contains('calme') ? 'auto' : 'smooth' });
  }
  function envoyer(message, extra) {
    if (!dlg) creer();
    const fil = dlg.querySelector('#or-fil');
    if (!extra || (!extra.choix && !extra.silencieux)) { conv.msgs.push({ de: 'moi', texte: message }); conv.dernier = message; fil.insertAdjacentHTML('beforeend', bulleMoi(message)); }
    fil.insertAdjacentHTML('beforeend', `<li class="or-msg or-assistant">${qui()}<p class="or-attente">${E(t('or.attente'))}</p></li>`);
    const corps = Object.assign({ message, precedent: conv.precedent || '' }, extra || {});
    sauver();
    return api.poster('/api/orientation', corps).then((r) => {
      // une question de précision garde la phrase d'origine pour la réponse suivante
      conv.precedent = r.clarification && !r.reponse ? (conv.precedent ? conv.precedent : message) : '';
      ajouterAssistant(r, message);
    }).catch(() => ajouterAssistant({ incompris: true, propositions: [], clarification: null }, message));
  }
  function choisir(id, texte) {
    if (id === '!autre') { conv.precedent = ''; ajouterAssistant({ local: 'or.ditesPlus' }, ''); dlg.querySelector('#or-message').focus(); return; }
    conv.msgs.push({ de: 'moi', texte }); dlg.querySelector('#or-fil').insertAdjacentHTML('beforeend', bulleMoi(texte));
    if (id === '!pasUrgent') { const q = conv.dernier || ''; conv.precedent = ''; envoyer(q, { silencieux: true, pasUrgent: true }); return; }
    const precedent = conv.precedent || conv.dernier || '';
    conv.precedent = '';
    envoyer(precedent, { choix: id, precedent: '' });
  }
  function donnerAvis(b) {
    const zone = b.closest('.or-avis');
    const question = zone ? zone.dataset.orQAvis : '';
    if (b.dataset.orAvis === 'non' && question) api.poster('/api/orientation/avis', { message: question }).catch(() => {});
    if (zone) zone.innerHTML = `<span>${E(t(b.dataset.orAvis === 'non' ? 'or.nonUtile' : 'or.merci'))}</span>${b.dataset.orAvis === 'non' ? ` <a href="demande.html?type=contact&amp;service=inconnu" data-or-lien>${E(t('or.ecrireMairie'))}</a>` : ''}`;
    NT.ui.annoncer(t(b.dataset.orAvis === 'non' ? 'or.nonUtile' : 'or.merci'));
  }

  /* ---------- En-tête : bouton « Rechercher » (ouvre la fenêtre ; « / » au clavier — Ctrl/⌘ + K est laissé au navigateur) ---------- */
  const outils = document.querySelector('.entete .outils-entete');
  if (outils && !document.querySelector('.entete .or-entete')) {   // vague 19 : d'habitude déjà posé par ui.js (orientation.js chargé à la demande)
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'or-entete'; b.id = 'nt-btn-recherche'; b.title = t('or.boutonTitre');
    b.setAttribute('aria-haspopup', 'dialog');
    b.innerHTML = `<i class="ph ph-magnifying-glass" aria-hidden="true"></i><span class="or-entete-txt">${E(t('or.bouton'))}</span><span class="sr-only"> — ${E(t('or.boutonTitre'))}</span>`;
    b.addEventListener('click', () => ouvrir('recherche'));
    // écran étroit avec la barre au pouce : l'en-tête ne tient que sur une ligne, le bouton passe en tête de la navigation
    const nav = document.querySelector('.entete .nav-principale');
    const mq = window.matchMedia('(max-width: 720px)');
    const placer = () => { if (mq.matches && document.body.classList.contains('avec-barre') && nav) nav.prepend(b); else outils.prepend(b); if (NT.ui.ajusterEntete) NT.ui.ajusterEntete(); };
    placer();
    if (mq.addEventListener) mq.addEventListener('change', placer);
  }
  document.addEventListener('keydown', (e) => {
    const saisie = e.target.closest && e.target.closest('input, textarea, select, [contenteditable="true"]');
    if (e.key === '/' && !saisie && !e.ctrlKey && !e.altKey && !e.metaKey) { e.preventDefault(); ouvrir('recherche'); }
  });

  /* ---------- Accueil : la recherche devient tolérante, résultats groupés sous le champ ---------- */
  const formAccueil = document.querySelector('main form.recherche');
  if (formAccueil && page === 'index') {
    const champ = formAccueil.querySelector('input[type="search"]');
    formAccueil.setAttribute('action', 'recherche.html');
    const zone = document.createElement('div');
    zone.className = 'or-suggestions'; zone.id = 'or-accueil-res'; zone.hidden = true; zone.dataset.orChamp = champ.id;
    formAccueil.after(zone);
    champ.setAttribute('aria-controls', zone.id);
    let m = null;
    champ.addEventListener('input', () => { clearTimeout(m); m = setTimeout(() => chercherDans(zone, champ.value, { compact: true, masquerVide: true }), 220); });
    champ.addEventListener('keydown', (e) => { if (e.key === 'Escape') { zone.hidden = true; } });
    document.addEventListener('click', (e) => { if (!zone.contains(e.target) && e.target !== champ) zone.hidden = true; });
    const lienA = document.createElement('button');
    lienA.type = 'button'; lienA.className = 'or-lien-assistant';
    lienA.innerHTML = `<i class="ph-duotone ph-chats-teardrop" aria-hidden="true"></i><span>${E(t('or.lienAccueil'))}</span>`;
    lienA.addEventListener('click', () => ouvrir('assistant', ''));
    const racc = document.querySelector('main .raccourcis');
    (racc || zone).after(lienA);
  }
  /* Aide : point d'entrée vers l'assistant */
  if (page === 'aide') {
    const contact = document.querySelector('#contact > div');
    if (contact) {
      const p = document.createElement('div');
      p.className = 'or-repli'; p.style.marginTop = '1.2rem';
      p.innerHTML = `<h3>${E(t('or.aideTitre'))}</h3><p class="doux" style="margin:0 0 .6rem">${E(t('or.aideTexte'))}</p>
        <button type="button" class="btn btn-primaire" data-or-assistant=""><i class="ph ph-chats-teardrop" aria-hidden="true"></i>${E(t('or.demanderAssistant'))}</button>`;
      contact.append(p);
    }
  }

  NT.orientation = { ouvrir, rendreRecherche, chercherDans, repliHtml, api, bouton,
    // F32 : quand la liste des services ne trouve rien, on ne laisse jamais l'habitant sans issue
    repliVide: (q) => `<div class="or-repli" style="text-align:start;margin-top:1rem"><p style="margin:0 0 .4rem"><strong>${E(t('or.lienAccueil'))}</strong></p>
      <div class="or-actions"><button type="button" class="btn btn-primaire" data-or-assistant="${E(q || '')}"><i class="ph ph-chats-teardrop" aria-hidden="true"></i>${E(t('or.demanderAssistant'))}</button>
      <a class="btn" href="recherche.html?q=${enc(q || '')}"><i class="ph ph-magnifying-glass" aria-hidden="true"></i>${E(t('or.voirTout'))}</a>
      <a class="btn" href="demande.html?type=contact&amp;service=inconnu"><i class="ph ph-envelope-simple" aria-hidden="true"></i>${E(t('or.ecrireMairie'))}</a></div></div>` };

  // Langage clair (F89) et « Expliquer plus simplement » (F90) partout ; F92 sur le formulaire de demande
  const charger = (src) => { const s = document.createElement('script'); s.src = src; s.async = false; document.head.append(s); };   // async = false : exécutés dans l'ordre d'ajout
  charger('assets/js/langage-clair.js');
  if (page === 'demande') charger('assets/js/orientation-demande.js');
  if (NT.ui.param('assistant') === '1') ouvrir('assistant', '');
})();
