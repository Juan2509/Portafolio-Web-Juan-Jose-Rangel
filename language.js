// El HTML conserva el español original; data-en contiene su traducción.
(() => {
    const button = document.getElementById('language-toggle');
    const translations = Array.from(document.querySelectorAll('[data-en]'), element => ({
        element,
        spanish: element.textContent,
        english: element.dataset.en
    }));
    const photo = document.querySelector('.foto-imagen');
    const menu = document.querySelector('.nav-hamburger');
    const spanishAlt = photo.alt;
    const spanishMenuLabel = menu.getAttribute('aria-label');
    const storageKey = 'portfolio-language';
    let language = 'es';

    function setLanguage(nextLanguage) {
        language = nextLanguage === 'en' ? 'en' : 'es';
        const isEnglish = language === 'en';

        translations.forEach(({ element, spanish, english }) => {
            element.textContent = isEnglish ? english : spanish;
        });
        document.documentElement.lang = language;
        photo.alt = isEnglish ? 'Photo of Juan Rangel' : spanishAlt;
        menu.setAttribute('aria-label', isEnglish ? 'Toggle menu' : spanishMenuLabel);
        button.textContent = isEnglish ? 'ES' : 'EN';
        button.lang = isEnglish ? 'es' : 'en';
        const label = isEnglish ? 'Switch language to Spanish' : 'Cambiar idioma a inglés';
        button.setAttribute('aria-label', label);
        button.title = label;
    }

    // El cambio funciona también si el navegador bloquea el almacenamiento.
    try {
        language = localStorage.getItem(storageKey) === 'en' ? 'en' : 'es';
    } catch {
        language = 'es';
    }
    setLanguage(language);
    button.hidden = false;

    button.addEventListener('click', () => {
        setLanguage(language === 'es' ? 'en' : 'es');
        try {
            localStorage.setItem(storageKey, language);
        } catch {
            // Se mantiene el idioma elegido durante esta visita.
        }
    });
})();
