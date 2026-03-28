// ===== Language Switching =====
const langLabels = { en: 'EN', tr: 'TR', ar: 'AR', ru: 'RU' };

function setLanguage(lang) {
    const t = translations[lang];
    if (!t) return;

    // Update text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
    });

    // Update HTML content (for FAQ answers with <strong> tags)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        if (t[key]) el.innerHTML = t[key];
    });

    // Update HTML attributes
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    // Update current language label
    document.getElementById('currentLang').textContent = langLabels[lang];

    // Update active state in dropdown
    document.querySelectorAll('.lang-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.lang === lang);
    });

    // Save preference
    localStorage.setItem('lmr-lang', lang);
}

// Language switcher toggle
const langSwitcher = document.getElementById('langSwitcher');
const langBtn = document.getElementById('langBtn');

langBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    langSwitcher.classList.toggle('open');
});

document.querySelectorAll('.lang-option').forEach(opt => {
    opt.addEventListener('click', () => {
        setLanguage(opt.dataset.lang);
        langSwitcher.classList.remove('open');
    });
});

document.addEventListener('click', () => {
    langSwitcher.classList.remove('open');
});

// Load saved language or detect from browser
const savedLang = localStorage.getItem('lmr-lang');
const urlLang = new URLSearchParams(window.location.search).get('lang');
const browserLang = navigator.language.slice(0, 2);
const initialLang = urlLang || savedLang || (['tr', 'ar', 'ru'].includes(browserLang) ? browserLang : 'en');
if (initialLang !== 'en') setLanguage(initialLang);

// ===== Navbar Scroll Effect =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ===== Mobile Menu Toggle =====
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', navMenu.classList.contains('open'));
    document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
});

navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    });
});

// ===== Portfolio "Show More" (mobile) =====
const portfolioGrid = document.querySelector('.portfolio-grid');
const portfolioMoreBtn = document.getElementById('portfolioMoreBtn');

portfolioMoreBtn.addEventListener('click', () => {
    portfolioGrid.classList.add('expanded');
});

// ===== Portfolio Filter =====
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const filter = btn.dataset.filter;
        // When filtering, expand grid to show all matching items
        if (filter !== 'all') {
            portfolioGrid.classList.add('expanded');
        } else {
            portfolioGrid.classList.remove('expanded');
        }
        portfolioItems.forEach((item, i) => {
            const show = filter === 'all' || item.dataset.category === filter;
            if (show) {
                item.classList.remove('hidden');
                item.classList.add('fade-in');
                item.style.animationDelay = `${i * 0.05}s`;
            } else {
                item.classList.add('hidden');
                item.classList.remove('fade-in');
            }
        });
    });
});

// ===== Scroll Reveal Animation =====
const revealElements = document.querySelectorAll(
    '.section-header, .portfolio-item, .about-image, .about-content, ' +
    '.pricing-card, .why-card, .team-card, .review-card, .faq-item, .contact-info, .contact-map'
);

revealElements.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

revealElements.forEach(el => revealObserver.observe(el));

// ===== Capacity Bar Animation =====
const capacityFill = document.querySelector('.capacity-fill');
if (capacityFill) {
    const capacityObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                capacityFill.classList.add('animate');
                capacityObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    capacityObserver.observe(capacityFill);
}

// ===== Lightbox =====
const lightbox = document.createElement('div');
lightbox.classList.add('lightbox');
lightbox.innerHTML = '<button class="lightbox-close" aria-label="Close">&times;</button><img src="" alt="">';
document.body.appendChild(lightbox);

const lightboxImg = lightbox.querySelector('img');
const lightboxClose = lightbox.querySelector('.lightbox-close');

portfolioItems.forEach(item => {
    item.addEventListener('click', () => {
        const img = item.querySelector('img');
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

lightboxClose.addEventListener('click', (e) => { e.stopPropagation(); closeLightbox(); });
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

// ===== Smooth Scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
});

// ===== Active Nav on Scroll =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 100;
    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        if (scrollY >= top && scrollY < top + height) {
            navLinks.forEach(link => {
                link.classList.toggle('active-link', link.getAttribute('href') === `#${id}`);
            });
        }
    });
});

// ===== Counter Animation =====
const statElements = document.querySelectorAll('.stat strong');

function animateCounter(el) {
    const text = el.textContent;
    const hasPlus = text.includes('+');
    const hasDot = text.includes('.');

    if (hasDot) {
        const target = parseFloat(text);
        let current = 0;
        const step = target / 40;
        const timer = setInterval(() => {
            current += step;
            if (current >= target) { current = target; clearInterval(timer); }
            el.textContent = current.toFixed(1);
        }, 40);
    } else {
        const target = parseInt(text.replace('+', ''));
        let current = 0;
        const step = Math.ceil(target / 50);
        const timer = setInterval(() => {
            current += step;
            if (current >= target) { current = target; clearInterval(timer); }
            el.textContent = current + (hasPlus ? '+' : '');
        }, 30);
    }
}

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                statElements.forEach(el => animateCounter(el));
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    statsObserver.observe(heroStats);
}
