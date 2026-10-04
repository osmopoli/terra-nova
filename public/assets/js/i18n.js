/* Terra Nova — traductions (D14, F27).
   Usage dans le HTML : <span data-i18n="cle">Texte FR</span>, <input data-i18n-attr="placeholder:cle">
   Chaque page peut ajouter ses clés : NT.i18n.ajouter({ fr:{...}, en:{...}, es:{...}, ar:{...} })
   Le texte FR écrit dans le HTML sert de repli si une clé manque. */
(function () {
  'use strict';
  const NT = (window.NT = window.NT || {});
  const LANGUES = { fr: 'Français', en: 'English', es: 'Español', ar: 'العربية' };
  const dico = { fr: {}, en: {}, es: {}, ar: {} };

  function langue() { try { return JSON.parse(localStorage.getItem('nt:langue')) || 'fr'; } catch (e) { return 'fr'; } }

  const i18n = {
    LANGUES,
    get langue() { return langue(); },
    ajouter(paquet) { Object.keys(paquet).forEach(l => Object.assign(dico[l] = dico[l] || {}, paquet[l])); },
    t(cle, vars, repli) {
      const l = langue();
      let txt = (dico[l] && dico[l][cle]) || dico.fr[cle] || repli || cle;
      if (vars) Object.keys(vars).forEach(k => { txt = txt.split('{' + k + '}').join(vars[k]); });
      return txt;
    },
    // Choisit la bonne langue dans un objet { fr, en, es, ar } (contenus des services, F27)
    choisir(obj) { if (!obj || typeof obj !== 'object') return obj; return obj[langue()] || obj.fr; },
    appliquer(racine) {
      const r = racine || document;
      r.querySelectorAll('[data-i18n]').forEach(el => {
        if (!el.dataset.i18nFr) el.dataset.i18nFr = el.textContent.trim();
        el.textContent = i18n.t(el.dataset.i18n, null, el.dataset.i18nFr);
      });
      r.querySelectorAll('[data-i18n-attr]').forEach(el => {
        el.dataset.i18nAttr.split(';').forEach(paire => {
          const [attr, cle] = paire.split(':').map(s => s.trim());
          const memo = 'i18nFr' + attr.replace(/[^a-z]/gi, '');
          if (el.dataset[memo] === undefined) el.dataset[memo] = el.getAttribute(attr) || '';
          el.setAttribute(attr, i18n.t(cle, null, el.dataset[memo]));
        });
      });
    },
    changer(l) {
      localStorage.setItem('nt:langue', JSON.stringify(l));
      document.documentElement.lang = l;
      document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
      location.reload();
    }
  };
  NT.i18n = i18n;
  NT.t = i18n.t;

  /* Interface commune (en-tête, pied, accessibilité, statuts, rôles) */
  i18n.ajouter({
    fr: {
      'nav.soutenir': 'Soutenir', 'nav.participer': 'Participer', 'nav.tableau': 'Tableau de bord', 'pied.donnees': 'Vos données', 
      'nav.carte': 'Carte', 'nav.journal': 'Journal', 
      'a11y.contraste': 'Contraste renforcé', 'a11y.espace': 'Espacement du texte augmenté', 'a11y.calme': 'Réduire les animations', 'a11y.souligne': 'Souligner tous les liens', 'a11y.lexique': 'Expliquer les mots difficiles', 'pied.aide': 'Aide et lexique', 'clavier.titre': 'Raccourcis clavier', 'clavier.intro': 'Toute la plateforme s’utilise au clavier : Tab pour avancer, Maj + Tab pour reculer, Entrée pour valider, Échap pour fermer une fenêtre.', 'clavier.touches': 'Touches', 'clavier.action': 'Action', 'clavier.recherche': 'Aller à la recherche', 'clavier.alertes': 'Ouvrir les alertes', 'clavier.notifs': 'Ouvrir mes notifications', 'clavier.menu': 'Aller au menu principal', 'clavier.contenu': 'Aller au contenu principal', 'clavier.affichage': 'Ouvrir les réglages d’affichage', 'clavier.aide': 'Afficher cette aide', 'clavier.connecte': 'Connectez-vous pour voir vos notifications.',
      'ui.alertes': 'Alertes', 'ui.alertesTitre': 'Alertes et informations importantes', 'ui.alertesActives': '{n} alerte(s) en cours, ouvrir les consignes', 'ui.aucuneAlerte': 'Aucune alerte en cours. Tout est calme sur Terra Nova.', 'ui.publics': 'Personnes concernées en priorité', 'ui.detail': 'Lire l’annonce complète', 
      'nav.accueil': 'Accueil', 'nav.services': 'Services', 'nav.annonces': 'Annonces', 'nav.transports': 'Transports', 'nav.rdv': 'Rendez-vous',
      'nav.espace': 'Mon espace', 'nav.agent': 'Espace agent', 'nav.demandesAgent': 'Demandes', 'nav.alertes': 'Diffuser', 'nav.comptes': 'Comptes',
      'nav.connexion': 'Se connecter', 'nav.inscription': 'Créer un compte', 'nav.deconnexion': 'Se déconnecter', 'nav.compte': 'Mon compte',
      'ui.evitement': 'Aller au contenu principal', 'ui.ariane': 'Vous êtes ici', 'ui.accessibilite': 'Accessibilité', 'ui.langue': 'Langue',
      'ui.notifications': 'Notifications', 'ui.aucuneNotif': 'Aucune notification pour le moment.', 'ui.toutLu': 'Tout marquer comme lu',
      'ui.fermer': 'Fermer', 'ui.voir': 'Voir', 'ui.compris': 'J’ai compris', 'ui.consignes': 'Que faire ?', 'ui.alerte': 'Alerte', 'ui.important': 'Important',
      'a11y.titre': 'Réglages d’affichage', 'a11y.taille': 'Taille du texte', 'a11y.contraste': 'Contraste renforcé', 'a11y.espace': 'Espacement du texte augmenté',
      'a11y.calme': 'Réduire les animations', 'a11y.reinit': 'Réinitialiser', 'a11y.aide': 'Ces réglages sont mémorisés sur cet appareil.',
      'pied.texte': 'Terra Nova — la plateforme numérique de la ville.', 'pied.contact': 'Contacter la mairie', 'pied.accessibilite': 'Accessibilité',
      'role.citoyen': 'Citoyen', 'role.agent': 'Agent', 'role.admin': 'Admin',
      'statut.recue': 'Reçue', 'statut.en_cours': 'En cours', 'statut.traitee': 'Traitée', 'statut.cloturee': 'Clôturée',
      'garde.titre': 'Accès réservé', 'garde.texte': 'Cette page est réservée à un autre profil. Vous avez été redirigé.'
    },
    en: {
      'nav.soutenir': 'Support', 'nav.participer': 'Take part', 'nav.tableau': 'Dashboard', 'pied.donnees': 'Your data', 
      'nav.carte': 'Map', 'nav.journal': 'Audit log', 
      'a11y.souligne': 'Underline all links', 'a11y.lexique': 'Explain difficult words', 'pied.aide': 'Help and glossary', 'clavier.titre': 'Keyboard shortcuts', 'clavier.intro': 'The whole platform works with a keyboard: Tab to move forward, Shift + Tab to go back, Enter to confirm, Esc to close a window.', 'clavier.touches': 'Keys', 'clavier.action': 'Action', 'clavier.recherche': 'Go to search', 'clavier.alertes': 'Open alerts', 'clavier.notifs': 'Open my notifications', 'clavier.menu': 'Go to main menu', 'clavier.contenu': 'Go to main content', 'clavier.affichage': 'Open display settings', 'clavier.aide': 'Show this help', 'clavier.connecte': 'Sign in to see your notifications.',
      'ui.alertes': 'Alerts', 'ui.alertesTitre': 'Alerts and important information', 'ui.alertesActives': '{n} active alert(s), open instructions', 'ui.aucuneAlerte': 'No active alerts. All calm on Terra Nova.', 'ui.publics': 'People most concerned', 'ui.detail': 'Read the full notice', 
      'nav.accueil': 'Home', 'nav.services': 'Services', 'nav.annonces': 'News', 'nav.transports': 'Transport', 'nav.rdv': 'Appointments',
      'nav.espace': 'My space', 'nav.agent': 'Staff area', 'nav.demandesAgent': 'Requests', 'nav.alertes': 'Broadcast', 'nav.comptes': 'Accounts',
      'nav.connexion': 'Sign in', 'nav.inscription': 'Create account', 'nav.deconnexion': 'Sign out', 'nav.compte': 'My account',
      'ui.evitement': 'Skip to main content', 'ui.ariane': 'You are here', 'ui.accessibilite': 'Accessibility', 'ui.langue': 'Language',
      'ui.notifications': 'Notifications', 'ui.aucuneNotif': 'No notifications yet.', 'ui.toutLu': 'Mark all as read',
      'ui.fermer': 'Close', 'ui.voir': 'View', 'ui.compris': 'Got it', 'ui.consignes': 'What to do?', 'ui.alerte': 'Alert', 'ui.important': 'Important',
      'a11y.titre': 'Display settings', 'a11y.taille': 'Text size', 'a11y.contraste': 'High contrast', 'a11y.espace': 'Wider text spacing',
      'a11y.calme': 'Reduce motion', 'a11y.reinit': 'Reset', 'a11y.aide': 'These settings are saved on this device.',
      'pied.texte': 'Terra Nova — the city’s digital platform.', 'pied.contact': 'Contact the city hall', 'pied.accessibilite': 'Accessibility',
      'role.citoyen': 'Citizen', 'role.agent': 'Staff', 'role.admin': 'Admin',
      'statut.recue': 'Received', 'statut.en_cours': 'In progress', 'statut.traitee': 'Resolved', 'statut.cloturee': 'Closed',
      'garde.titre': 'Restricted access', 'garde.texte': 'This page is reserved for another profile. You have been redirected.'
    },
    es: {
      'nav.soutenir': 'Apoyar', 'nav.participer': 'Participar', 'nav.tableau': 'Panel', 'pied.donnees': 'Sus datos', 
      'nav.carte': 'Mapa', 'nav.journal': 'Registro', 
      'a11y.souligne': 'Subrayar todos los enlaces', 'a11y.lexique': 'Explicar las palabras difíciles', 'pied.aide': 'Ayuda y glosario', 'clavier.titre': 'Atajos de teclado', 'clavier.intro': 'Toda la plataforma se usa con el teclado: Tab para avanzar, Mayús + Tab para retroceder, Intro para validar, Esc para cerrar una ventana.', 'clavier.touches': 'Teclas', 'clavier.action': 'Acción', 'clavier.recherche': 'Ir a la búsqueda', 'clavier.alertes': 'Abrir las alertas', 'clavier.notifs': 'Abrir mis notificaciones', 'clavier.menu': 'Ir al menú principal', 'clavier.contenu': 'Ir al contenido principal', 'clavier.affichage': 'Abrir los ajustes de visualización', 'clavier.aide': 'Mostrar esta ayuda', 'clavier.connecte': 'Inicie sesión para ver sus notificaciones.',
      'ui.alertes': 'Alertas', 'ui.alertesTitre': 'Alertas e información importante', 'ui.alertesActives': '{n} alerta(s) activa(s), abrir las instrucciones', 'ui.aucuneAlerte': 'No hay alertas activas. Todo tranquilo en Terra Nova.', 'ui.publics': 'Personas más afectadas', 'ui.detail': 'Leer el anuncio completo', 
      'nav.accueil': 'Inicio', 'nav.services': 'Servicios', 'nav.annonces': 'Anuncios', 'nav.transports': 'Transporte', 'nav.rdv': 'Citas',
      'nav.espace': 'Mi espacio', 'nav.agent': 'Espacio agentes', 'nav.demandesAgent': 'Solicitudes', 'nav.alertes': 'Difundir', 'nav.comptes': 'Cuentas',
      'nav.connexion': 'Iniciar sesión', 'nav.inscription': 'Crear cuenta', 'nav.deconnexion': 'Cerrar sesión', 'nav.compte': 'Mi cuenta',
      'ui.evitement': 'Ir al contenido principal', 'ui.ariane': 'Usted está aquí', 'ui.accessibilite': 'Accesibilidad', 'ui.langue': 'Idioma',
      'ui.notifications': 'Notificaciones', 'ui.aucuneNotif': 'No hay notificaciones.', 'ui.toutLu': 'Marcar todo como leído',
      'ui.fermer': 'Cerrar', 'ui.voir': 'Ver', 'ui.compris': 'Entendido', 'ui.consignes': '¿Qué hacer?', 'ui.alerte': 'Alerta', 'ui.important': 'Importante',
      'a11y.titre': 'Ajustes de visualización', 'a11y.taille': 'Tamaño del texto', 'a11y.contraste': 'Alto contraste', 'a11y.espace': 'Más espacio entre letras',
      'a11y.calme': 'Reducir animaciones', 'a11y.reinit': 'Restablecer', 'a11y.aide': 'Estos ajustes se guardan en este dispositivo.',
      'pied.texte': 'Terra Nova — la plataforma digital de la ciudad.', 'pied.contact': 'Contactar con el ayuntamiento', 'pied.accessibilite': 'Accesibilidad',
      'role.citoyen': 'Ciudadano', 'role.agent': 'Agente', 'role.admin': 'Admin',
      'statut.recue': 'Recibida', 'statut.en_cours': 'En curso', 'statut.traitee': 'Resuelta', 'statut.cloturee': 'Cerrada',
      'garde.titre': 'Acceso restringido', 'garde.texte': 'Esta página está reservada a otro perfil. Ha sido redirigido.'
    },
    ar: {
      'nav.soutenir': 'دعم', 'nav.participer': 'شارك', 'nav.tableau': 'لوحة القيادة', 'pied.donnees': 'بياناتك', 
      'nav.carte': 'الخريطة', 'nav.journal': 'السجل', 
      'a11y.souligne': 'تسطير كل الروابط', 'a11y.lexique': 'شرح الكلمات الصعبة', 'pied.aide': 'المساعدة والمعجم', 'clavier.titre': 'اختصارات لوحة المفاتيح', 'clavier.intro': 'يمكن استخدام المنصة كاملة بلوحة المفاتيح: Tab للتقدم، Shift + Tab للرجوع، Enter للتأكيد، Esc لإغلاق نافذة.', 'clavier.touches': 'المفاتيح', 'clavier.action': 'الإجراء', 'clavier.recherche': 'الانتقال إلى البحث', 'clavier.alertes': 'فتح التنبيهات', 'clavier.notifs': 'فتح إشعاراتي', 'clavier.menu': 'الانتقال إلى القائمة الرئيسية', 'clavier.contenu': 'الانتقال إلى المحتوى الرئيسي', 'clavier.affichage': 'فتح إعدادات العرض', 'clavier.aide': 'عرض هذه المساعدة', 'clavier.connecte': 'سجّل الدخول لرؤية إشعاراتك.',
      'ui.alertes': 'تنبيهات', 'ui.alertesTitre': 'التنبيهات والمعلومات المهمة', 'ui.alertesActives': '{n} تنبيه نشط، افتح التعليمات', 'ui.aucuneAlerte': 'لا توجد تنبيهات حالياً. الهدوء يعم تيرا نوفا.', 'ui.publics': 'الفئات المعنية أولاً', 'ui.detail': 'قراءة الإعلان كاملاً', 
      'nav.accueil': 'الرئيسية', 'nav.services': 'الخدمات', 'nav.annonces': 'الإعلانات', 'nav.transports': 'النقل', 'nav.rdv': 'المواعيد',
      'nav.espace': 'فضائي', 'nav.agent': 'فضاء الأعوان', 'nav.demandesAgent': 'الطلبات', 'nav.alertes': 'بث رسالة', 'nav.comptes': 'الحسابات',
      'nav.connexion': 'تسجيل الدخول', 'nav.inscription': 'إنشاء حساب', 'nav.deconnexion': 'تسجيل الخروج', 'nav.compte': 'حسابي',
      'ui.evitement': 'الانتقال إلى المحتوى الرئيسي', 'ui.ariane': 'أنت هنا', 'ui.accessibilite': 'إمكانية الوصول', 'ui.langue': 'اللغة',
      'ui.notifications': 'الإشعارات', 'ui.aucuneNotif': 'لا توجد إشعارات حالياً.', 'ui.toutLu': 'تعليم الكل كمقروء',
      'ui.fermer': 'إغلاق', 'ui.voir': 'عرض', 'ui.compris': 'فهمت', 'ui.consignes': 'ماذا أفعل؟', 'ui.alerte': 'تنبيه', 'ui.important': 'مهم',
      'a11y.titre': 'إعدادات العرض', 'a11y.taille': 'حجم النص', 'a11y.contraste': 'تباين عالٍ', 'a11y.espace': 'تباعد أكبر بين الحروف',
      'a11y.calme': 'تقليل الحركة', 'a11y.reinit': 'إعادة الضبط', 'a11y.aide': 'تُحفظ هذه الإعدادات على هذا الجهاز.',
      'pied.texte': 'تيرا نوفا — المنصة الرقمية للمدينة.', 'pied.contact': 'الاتصال بالبلدية', 'pied.accessibilite': 'إمكانية الوصول',
      'role.citoyen': 'مواطن', 'role.agent': 'عون', 'role.admin': 'مسؤول',
      'statut.recue': 'مستلمة', 'statut.en_cours': 'قيد المعالجة', 'statut.traitee': 'تمت المعالجة', 'statut.cloturee': 'مغلقة',
      'garde.titre': 'دخول مقيد', 'garde.texte': 'هذه الصفحة مخصصة لملف آخر. تمت إعادة توجيهك.'
    }
  });
  /* ---------- Vague 13 : sécurité (F69, F70), nouveaux arrivants (F71, F72) — textes communes à plusieurs pages ---------- */
  i18n.ajouter({
    fr: { 'nav.accueilAgent': 'Accueil arrivants', 'nav.securite': 'Sécurité', 'pied.securite': 'Sécurité de vos données', 'pied.bienvenue': 'Je viens d’arriver',
      'v13.con.identifiant': 'E-mail, identifiant ou numéro de téléphone', 'v13.con.mdp': 'Mot de passe ou code secret', 'v13.con.aide': 'Pas d’adresse e-mail ? Utilisez l’identifiant reçu à l’inscription (TN-…) ou votre numéro de téléphone.',
      'v13.con.erreur': 'Indiquez votre e-mail, votre identifiant (TN-123456) ou votre numéro de téléphone.', 'v13.con.protege': 'Connexion protégée : verrouillage après plusieurs erreurs, données chiffrées.',
      'v13.ins.sansEmail': 'Pas d’adresse e-mail ?', 'v13.ins.sansEmailLien': 'Créer un compte avec un identifiant et un code' },
    en: { 'nav.accueilAgent': 'Newcomers desk', 'nav.securite': 'Security', 'pied.securite': 'Security of your data', 'pied.bienvenue': 'I just arrived',
      'v13.con.identifiant': 'E-mail, identifier or phone number', 'v13.con.mdp': 'Password or secret code', 'v13.con.aide': 'No e-mail address? Use the identifier you received when signing up (TN-…) or your phone number.',
      'v13.con.erreur': 'Enter your e-mail, your identifier (TN-123456) or your phone number.', 'v13.con.protege': 'Protected sign-in: locked after several errors, encrypted data.',
      'v13.ins.sansEmail': 'No e-mail address?', 'v13.ins.sansEmailLien': 'Create an account with an identifier and a code' },
    es: { 'nav.accueilAgent': 'Acogida de recién llegados', 'nav.securite': 'Seguridad', 'pied.securite': 'Seguridad de sus datos', 'pied.bienvenue': 'Acabo de llegar',
      'v13.con.identifiant': 'Correo, identificador o número de teléfono', 'v13.con.mdp': 'Contraseña o código secreto', 'v13.con.aide': '¿No tiene correo electrónico? Use el identificador recibido al registrarse (TN-…) o su número de teléfono.',
      'v13.con.erreur': 'Indique su correo, su identificador (TN-123456) o su número de teléfono.', 'v13.con.protege': 'Conexión protegida: bloqueo tras varios errores, datos cifrados.',
      'v13.ins.sansEmail': '¿No tiene correo electrónico?', 'v13.ins.sansEmailLien': 'Crear una cuenta con un identificador y un código' },
    ar: { 'nav.accueilAgent': 'استقبال الوافدين', 'nav.securite': 'الأمان', 'pied.securite': 'أمان بياناتك', 'pied.bienvenue': 'وصلت للتو',
      'v13.con.identifiant': 'البريد الإلكتروني أو المعرّف أو رقم الهاتف', 'v13.con.mdp': 'كلمة المرور أو الرمز السري', 'v13.con.aide': 'ليس لديك بريد إلكتروني؟ استخدم المعرّف الذي حصلت عليه عند التسجيل (TN-…) أو رقم هاتفك.',
      'v13.con.erreur': 'أدخل بريدك الإلكتروني أو معرّفك (TN-123456) أو رقم هاتفك.', 'v13.con.protege': 'دخول محمي: قفل بعد عدة أخطاء، وبيانات مشفّرة.',
      'v13.ins.sansEmail': 'ليس لديك بريد إلكتروني؟', 'v13.ins.sansEmailLien': 'أنشئ حساباً بمعرّف ورمز سري' }
  });

  /* ---------- Vague 17 : menu (F87 sauvegardes, F88 exports) ---------- */
  i18n.ajouter({
    fr: { 'nav.exports': 'Exports', 'nav.sauvegardes': 'Sauvegardes' },
    en: { 'nav.exports': 'Exports', 'nav.sauvegardes': 'Backups' },
    es: { 'nav.exports': 'Exportaciones', 'nav.sauvegardes': 'Copias de seguridad' },
    ar: { 'nav.exports': 'التصدير', 'nav.sauvegardes': 'النسخ الاحتياطية' }
  });

})();
