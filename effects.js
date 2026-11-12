// Mejora progresiva: todo el contenido sigue visible si JavaScript no está disponible.
(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const header = document.querySelector('.header');
    const toggle = document.getElementById('nav-toggle');
    const menu = document.querySelector('.nav-hamburger');
    const links = [...document.querySelectorAll('.nav-links a')];
    const sections = [...document.querySelectorAll('main > section[id]')];

    function syncMenu() {
        menu.setAttribute('aria-expanded', String(toggle.checked));
    }
    menu.setAttribute('aria-controls', 'portfolio-navigation');
    document.querySelector('.nav-links').id = 'portfolio-navigation';
    toggle.addEventListener('change', syncMenu);
    syncMenu();
    links.forEach(link => link.addEventListener('click', () => {
        toggle.checked = false;
        syncMenu();
    }));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            toggle.checked = false;
            syncMenu();
        }
    });

    let scheduled = false;
    function updateScroll() {
        const distance = document.documentElement.scrollHeight - window.innerHeight;
        header.style.setProperty('--scroll-progress', distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0);
        header.classList.toggle('is-scrolled', window.scrollY > 20);
        const position = window.scrollY + header.offsetHeight + 100;
        const active = sections.filter(section => section.offsetTop <= position).at(-1) || sections[0];
        links.forEach(link => {
            if (link.hash === `#${active.id}`) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
        scheduled = false;
    }
    function requestUpdate() {
        if (!scheduled) { scheduled = true; requestAnimationFrame(updateScroll); }
    }
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    window.addEventListener('load', requestUpdate);
    updateScroll();

    // Las capturas pequeñas conservan su tamaño; el visor permite consultar detalles.
    const viewer = document.createElement('dialog');
    viewer.className = 'image-viewer';
    viewer.setAttribute('aria-labelledby', 'viewer-caption');
    viewer.innerHTML = `<div class="viewer-toolbar">
        <p id="viewer-caption"></p>
        <div class="viewer-actions">
            <button type="button" class="viewer-prev">←</button>
            <button type="button" class="viewer-next">→</button>
            <button type="button" class="viewer-close">×</button>
        </div>
    </div><img class="viewer-image" alt="">`;
    document.body.append(viewer);
    const viewerImage = viewer.querySelector('.viewer-image');
    const caption = viewer.querySelector('#viewer-caption');
    const previous = viewer.querySelector('.viewer-prev');
    const next = viewer.querySelector('.viewer-next');
    const close = viewer.querySelector('.viewer-close');
    let gallery = [];
    let selected = 0;

    function updateViewer() {
        const original = gallery[selected];
        const english = document.documentElement.lang === 'en';
        viewerImage.src = original.src;
        viewerImage.alt = original.alt;
        caption.textContent = `${original.alt} · ${selected + 1} / ${gallery.length}`;
        previous.setAttribute('aria-label', english ? 'Previous image' : 'Imagen anterior');
        next.setAttribute('aria-label', english ? 'Next image' : 'Imagen siguiente');
        close.setAttribute('aria-label', english ? 'Close image' : 'Cerrar imagen');
    }
    function changeImage(step) {
        selected = (selected + step + gallery.length) % gallery.length;
        updateViewer();
    }
    document.querySelectorAll('.exp-evidencias').forEach(container => {
        const images = [...container.querySelectorAll('img')];
        images.forEach((image, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'gallery-image';
            // El alt original funciona como nombre accesible y sigue el idioma elegido.
            image.before(button);
            button.append(image);
            button.addEventListener('click', () => {
                gallery = images;
                selected = index;
                updateViewer();
                viewer.showModal();
                document.body.classList.add('viewer-open');
                close.focus();
            });
        });
    });
    previous.addEventListener('click', () => changeImage(-1));
    next.addEventListener('click', () => changeImage(1));
    close.addEventListener('click', () => viewer.close());
    viewer.addEventListener('close', () => document.body.classList.remove('viewer-open'));
    viewer.addEventListener('click', event => {
        if (event.target !== viewer) return;
        const bounds = viewer.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right ||
            event.clientY < bounds.top || event.clientY > bounds.bottom) viewer.close();
    });
    viewer.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            changeImage(event.key === 'ArrowLeft' ? -1 : 1);
        }
    });

    if (!('IntersectionObserver' in window) || reducedMotion.matches) return;
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.08 });
    const elements = document.querySelectorAll('.hero-texto, .hero-foto-wrapper, .titulo-seccion, .exp-tarjeta, .skill-group, .etiquetas-contenedor, .idioma-tarjeta, .formacion-item, .contacto-tarjeta');
    elements.forEach(element => { element.classList.add('reveal'); observer.observe(element); });
    document.documentElement.classList.add('motion-ready');
})();
