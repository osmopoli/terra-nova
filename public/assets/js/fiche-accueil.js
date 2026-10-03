/* Terra Nova — F71 : fiche d'accueil d'un nouvel arrivant (identifiant + premiers pas), dans la langue de la personne.
   Utilisée au guichet (agent-accueil.html, avec le code provisoire affiché une seule fois) et après une inscription
   sans e-mail (bienvenue.html). Indépendante de la langue de l'écran : un agent francophone imprime une fiche en arabe.
   NT.ficheAccueil.html({ prenom, nom, identifiant, code, langue, agent }) → HTML ; NT.ficheAccueil.imprimer(liste) */
(function () {
  'use strict';
  const NT = (window.NT = window.NT || {});
  const T = {
    fr: { titre: 'Fiche d’accueil', bienvenue: 'Bienvenue à Terra Nova, {p} !', id: 'Votre identifiant', code: 'Votre code provisoire', codeAide: 'À remplacer par votre propre code à la première connexion.',
      codeChoisi: 'Votre code secret : celui que vous avez choisi (il n’est écrit nulle part).', connexion: 'Pour vous connecter', c1: 'Ouvrez {u}', c2: 'Tapez votre identifiant ou votre numéro de téléphone, puis votre code.',
      etapes: 'Vos premiers pas', e1: 'Connectez-vous et choisissez votre propre code secret.', e2: 'Répondez aux 3 questions « Je viens d’arriver » : vous saurez quels services vous sont utiles.', 
      e3: 'Indiquez votre quartier pour recevoir les alertes qui vous concernent.', e4: 'Besoin d’aide ? Venez à l’accueil de la mairie. Le bouton ♿ agrandit le texte, le globe change la langue.',
      secret: 'Gardez cette fiche en lieu sûr. Ne donnez jamais votre code : la mairie ne vous le demandera jamais.', le: 'Remise le {d}', par: 'par {a}' },
    en: { titre: 'Welcome sheet', bienvenue: 'Welcome to Terra Nova, {p}!', id: 'Your identifier', code: 'Your temporary code', codeAide: 'Replace it with your own code the first time you sign in.',
      codeChoisi: 'Your secret code: the one you chose (it is not written anywhere).', connexion: 'To sign in', c1: 'Open {u}', c2: 'Type your identifier or your phone number, then your code.',
      etapes: 'Your first steps', e1: 'Sign in and choose your own secret code.', e2: 'Answer the 3 “I just arrived” questions: you will know which services are useful to you.', 
      e3: 'Add your neighbourhood to receive the alerts that concern you.', e4: 'Need help? Come to the city hall reception. The ♿ button enlarges text, the globe changes the language.',
      secret: 'Keep this sheet in a safe place. Never give your code: the city hall will never ask for it.', le: 'Given on {d}', par: 'by {a}' },
    es: { titre: 'Ficha de bienvenida', bienvenue: '¡Bienvenido/a a Terra Nova, {p}!', id: 'Su identificador', code: 'Su código provisional', codeAide: 'Cámbielo por su propio código la primera vez que se conecte.',
      codeChoisi: 'Su código secreto: el que usted eligió (no está escrito en ningún sitio).', connexion: 'Para conectarse', c1: 'Abra {u}', c2: 'Escriba su identificador o su número de teléfono y luego su código.',
      etapes: 'Sus primeros pasos', e1: 'Conéctese y elija su propio código secreto.', e2: 'Responda a las 3 preguntas «Acabo de llegar»: sabrá qué servicios le son útiles.', 
      e3: 'Indique su barrio para recibir las alertas que le afectan.', e4: '¿Necesita ayuda? Acuda a la recepción del ayuntamiento. El botón ♿ agranda el texto y el globo cambia el idioma.',
      secret: 'Guarde esta ficha en un lugar seguro. No dé nunca su código: el ayuntamiento nunca se lo pedirá.', le: 'Entregada el {d}', par: 'por {a}' },
    ar: { titre: 'بطاقة الاستقبال', bienvenue: 'مرحباً بك في تيرا نوفا يا {p}!', id: 'معرّفك', code: 'رمزك المؤقت', codeAide: 'استبدله برمزك الخاص عند أول دخول.',
      codeChoisi: 'رمزك السري: هو الذي اخترته (غير مكتوب في أي مكان).', connexion: 'للدخول', c1: 'افتح {u}', c2: 'اكتب معرّفك أو رقم هاتفك، ثم رمزك.',
      etapes: 'خطواتك الأولى', e1: 'ادخل واختر رمزك السري الخاص.', e2: 'أجب عن الأسئلة الثلاثة «وصلت للتو»: ستعرف الخدمات المفيدة لك.', 
      e3: 'حدّد حيّك لتصلك التنبيهات التي تخصك.', e4: 'تحتاج مساعدة؟ تعال إلى استقبال البلدية. زر ♿ يكبّر النص، والكرة الأرضية تغيّر اللغة.',
      secret: 'احتفظ بهذه البطاقة في مكان آمن. لا تعطِ رمزك أبداً: البلدية لن تطلبه منك أبداً.', le: 'سُلّمت في {d}', par: 'من طرف {a}' }
  };
  const echap = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const LOCALES = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES', ar: 'ar' };
  function html(p) {
    const l = T[p.langue] ? p.langue : 'fr';
    const t = (k, v) => { let s = T[l][k]; Object.keys(v || {}).forEach(x => { s = s.split('{' + x + '}').join(v[x]); }); return echap(s); };
    const base = location.origin;
    const date = new Date().toLocaleDateString(LOCALES[l], { day: 'numeric', month: 'long', year: 'numeric' });
    return `<article class="fiche-accueil" lang="${l}" dir="${l === 'ar' ? 'rtl' : 'ltr'}">
      <header class="fa-tete"><span class="logo-embleme" aria-hidden="true"></span><div><strong>Terra Nova</strong><span>${t('titre')}</span></div></header>
      <h2 class="fa-bienvenue">${t('bienvenue', { p: p.prenom })}</h2>
      <div class="fa-ids">
        <div><span class="fa-lib"><i class="ph ph-identification-card" aria-hidden="true"></i>${t('id')}</span><span class="fa-valeur" dir="ltr">${echap(p.identifiant)}</span></div>
        ${p.code ? `<div><span class="fa-lib"><i class="ph ph-key" aria-hidden="true"></i>${t('code')}</span><span class="fa-valeur" dir="ltr">${echap(p.code)}</span><span class="fa-aide">${t('codeAide')}</span></div>`
          : `<div><span class="fa-lib"><i class="ph ph-key" aria-hidden="true"></i>${t('codeChoisi')}</span></div>`}
      </div>
      <h3><i class="ph ph-sign-in" aria-hidden="true"></i>${t('connexion')}</h3>
      <ol class="fa-liste"><li>${t('c1', { u: base + '/connexion.html' })}</li><li>${t('c2')}</li></ol>
      <h3><i class="ph ph-footprints" aria-hidden="true"></i>${t('etapes')}</h3>
      <ol class="fa-liste">
        <li><i class="ph ph-key" aria-hidden="true"></i>${t('e1')}</li>
        <li><i class="ph ph-list-checks" aria-hidden="true"></i>${t('e2')} <span class="fa-url" dir="ltr">${echap(base + '/bienvenue.html#guide')}</span></li>
        <li><i class="ph ph-bell-ringing" aria-hidden="true"></i>${t('e3')}</li>
        <li><i class="ph ph-lifebuoy" aria-hidden="true"></i>${t('e4')}</li>
      </ol>
      <p class="fa-secret"><i class="ph ph-shield-check" aria-hidden="true"></i>${t('secret')}</p>
      <p class="fa-pied">${t('le', { d: date })}${p.agent ? ' · ' + t('par', { a: p.agent }) : ''}</p>
    </article>`;
  }
  // Impression : seules les fiches demandées sont imprimées (le reste de la page est masqué par la feuille d'impression)
  function imprimer(liste) {
    let zone = document.getElementById('zone-impression');
    if (!zone) { zone = Object.assign(document.createElement('div'), { id: 'zone-impression' }); zone.setAttribute('aria-hidden', 'true'); document.body.append(zone); }
    zone.innerHTML = liste.map(html).join('');
    document.body.classList.add('impression-fiches');
    const fin = () => { document.body.classList.remove('impression-fiches'); zone.innerHTML = ''; window.removeEventListener('afterprint', fin); };
    window.addEventListener('afterprint', fin);
    setTimeout(() => window.print(), 50);
  }
  NT.ficheAccueil = { html, imprimer };
})();
