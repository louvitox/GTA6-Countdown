/* =====================================================================
   I18N.JS — GTA VI Countdown
   Détecte la langue du visiteur et applique les traductions.

   NOTE HONNÊTE SUR LA "GÉOLOCALISATION" :
   Un fichier statique ouvert en local (file://) ne peut pas interroger
   un service de géolocalisation IP externe (bloqué par CORS, et de
   toute façon la géolocalisation précise nécessite une permission
   explicite du navigateur). La méthode fiable et sans permission pour
   deviner la langue d'un visiteur est de lire la langue configurée
   dans son navigateur (navigator.language) — c'est ce que fait ce
   script. Si l'utilisateur autorise explicitement la géolocalisation
   du navigateur, on affine avec le pays détecté en secours.
   ===================================================================== */

(function(){
  const SUPPORTED = ['fr','en','es','de','it','pt','nl','ru','tr','pl','ja','ko','zh','ar','hi'];
  const RTL_LANGS = ['ar'];
  const STORAGE_KEY = 'gta6_lang';

  const LANG_NAMES = {
    fr:'Français', en:'English', es:'Español', de:'Deutsch', it:'Italiano',
    pt:'Português', nl:'Nederlands', ru:'Русский', tr:'Türkçe', pl:'Polski',
    ja:'日本語', ko:'한국어', zh:'中文', ar:'العربية', hi:'हिन्दी'
  };

  function detectInitialLang(){
    const saved = localStorage.getItem(STORAGE_KEY);
    if(saved && SUPPORTED.includes(saved)) return saved;

    // navigator.languages donne la liste ordonnée des préférences du navigateur
    const candidates = (navigator.languages && navigator.languages.length)
      ? navigator.languages
      : [navigator.language || 'fr'];

    for(const c of candidates){
      const short = c.slice(0,2).toLowerCase();
      if(SUPPORTED.includes(short)) return short;
    }
    return 'en'; // repli par défaut si la langue du navigateur n'est pas couverte
  }

  function applyTranslations(lang){
    const dict = window.TRANSLATIONS[lang] || window.TRANSLATIONS.en;
    window.i18nDict = dict;

    document.documentElement.lang = lang;
    document.documentElement.dir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr';
    document.body.classList.toggle('rtl', RTL_LANGS.includes(lang));

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if(dict[key] !== undefined){
        // hero.titleMain contient un <br> volontaire -> innerHTML ; sinon textContent (plus sûr)
        if(key === 'hero.titleMain'){
          el.innerHTML = dict[key];
        } else {
          el.textContent = dict[key];
        }
      }
    });

    // Boutons dont le texte dépend d'un état JS (wishlist, notifications) : mise à jour
    if(typeof window.refreshWishlistBtnI18n === 'function'){
      window.refreshWishlistBtnI18n();
    }
    if(typeof window.refreshNotifyBtnI18n === 'function'){
      window.refreshNotifyBtnI18n();
    }

    localStorage.setItem(STORAGE_KEY, lang);
    window.dispatchEvent(new Event('gta6-lang-changed'));
  }

  function buildLangSelect(){
    const select = document.getElementById('langSelect');
    if(!select) return;
    SUPPORTED.forEach(code => {
      const opt = document.createElement('option');
      opt.value = code;
      opt.textContent = LANG_NAMES[code] || code.toUpperCase();
      select.appendChild(opt);
    });
    select.addEventListener('change', () => applyTranslations(select.value));
  }

  function init(){
    if(!window.TRANSLATIONS){
      console.warn('translations.js non chargé — traduction indisponible.');
      return;
    }
    buildLangSelect();
    const initial = detectInitialLang();
    const select = document.getElementById('langSelect');
    if(select) select.value = initial;
    applyTranslations(initial);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
