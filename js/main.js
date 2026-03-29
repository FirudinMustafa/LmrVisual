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

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key]) el.placeholder = t[key];
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

// ===== Portfolio Slider (horizontal auto-scroll) =====
function createSlider(containerSelector, options) {
    var container = document.querySelector(containerSelector);
    if (!container) return null;

    var track = container.querySelector('.carousel-track');
    var prevBtn = container.querySelector('.carousel-btn-prev');
    var nextBtn = container.querySelector('.carousel-btn-next');
    var dotsContainer = container.querySelector('.carousel-dots');
    var AUTO_INTERVAL = (options && options.autoInterval) || 3000;

    var currentIndex = 0;
    var autoTimer = null;
    var isHovering = false;

    function getVisibleSlides() {
        return Array.from(track.querySelectorAll('.carousel-slide:not(.carousel-hidden)'));
    }

    function getSlidesPerView() {
        var w = window.innerWidth;
        if (w > 1200) return 3;
        if (w > 768) return 2;
        return 1;
    }

    function maxIndex() {
        return Math.max(0, getVisibleSlides().length - getSlidesPerView());
    }

    function updatePosition(animate) {
        var slides = getVisibleSlides();
        var perView = getSlidesPerView();

        // Reset all slides to flex layout
        track.style.display = 'flex';
        track.style.transition = animate !== false ? 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'none';

        var slideWidth = 100 / perView;
        track.style.transform = 'translateX(' + (-currentIndex * slideWidth) + '%)';

        slides.forEach(function(s) {
            s.style.position = 'relative';
            s.style.width = slideWidth + '%';
            s.style.flexShrink = '0';
            s.style.transform = '';
            s.style.filter = '';
            s.style.zIndex = '';
        });
    }

    function updateDots() {
        if (!dotsContainer) return;
        var total = maxIndex() + 1;
        if (dotsContainer.childElementCount !== total) {
            dotsContainer.innerHTML = '';
            for (var i = 0; i < Math.min(total, 15); i++) {
                var dot = document.createElement('button');
                dot.classList.add('carousel-dot');
                dot.setAttribute('data-idx', i);
                dot.addEventListener('click', function() {
                    goTo(parseInt(this.getAttribute('data-idx')));
                    restartAuto();
                });
                dotsContainer.appendChild(dot);
            }
        }
        var dots = dotsContainer.querySelectorAll('.carousel-dot');
        for (var j = 0; j < dots.length; j++) {
            dots[j].classList.toggle('active', j === currentIndex);
        }
    }

    function goTo(index) {
        currentIndex = Math.max(0, Math.min(index, maxIndex()));
        updatePosition();
        updateDots();
    }

    function next() {
        if (currentIndex >= maxIndex()) {
            goTo(0); // Loop back
        } else {
            goTo(currentIndex + 1);
        }
    }

    function prev() {
        if (currentIndex <= 0) {
            goTo(maxIndex()); // Loop to end
        } else {
            goTo(currentIndex - 1);
        }
    }

    function startAuto() {
        stopAuto();
        autoTimer = setInterval(function() {
            if (!isHovering) next();
        }, AUTO_INTERVAL);
    }

    function stopAuto() {
        if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    }

    function restartAuto() {
        stopAuto();
        startAuto();
    }

    if (prevBtn) prevBtn.addEventListener('click', function() { prev(); restartAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', function() { next(); restartAuto(); });

    container.addEventListener('mouseenter', function() { isHovering = true; });
    container.addEventListener('mouseleave', function() { isHovering = false; });

    // Touch swipe
    var touchStartX = 0;
    track.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', function(e) {
        var diff = e.changedTouches[0].clientX - touchStartX;
        if (diff < -40) { next(); restartAuto(); }
        else if (diff > 40) { prev(); restartAuto(); }
    });

    // Resize
    var resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            currentIndex = Math.min(currentIndex, maxIndex());
            updatePosition(false);
            updateDots();
        }, 150);
    });

    goTo(0);
    startAuto();

    return {
        goTo: function(idx) { goTo(idx); restartAuto(); },
        refresh: function() {
            currentIndex = 0;
            updatePosition(false);
            updateDots();
            restartAuto();
        }
    };
}

// ===== 3D Carousel Engine =====
function create3DCarousel(containerSelector, options) {
    var container = document.querySelector(containerSelector);
    if (!container) return null;

    var track = container.querySelector('.carousel-track');
    var prevBtn = container.querySelector('.carousel-btn-prev');
    var nextBtn = container.querySelector('.carousel-btn-next');
    var dotsContainer = container.querySelector('.carousel-dots');

    var AUTO_SPEED = (options && options.autoSpeed) || 0.15;
    var EASE = 0.08;
    var PAUSE_MS = 5000;

    var targetAngle = 0;
    var currentAngle = 0;
    var isHovering = false;
    var isPaused = false;
    var isDragging = false;
    var dragStartX = 0;
    var dragStartAngle = 0;
    var rafId = null;
    var pauseTimer = null;

    function getSlides() {
        return Array.from(track.querySelectorAll('.carousel-slide:not(.carousel-hidden)'));
    }

    function getRadius() {
        var style = getComputedStyle(container);
        return parseInt(style.getPropertyValue('--carousel-radius')) || 440;
    }

    function getDir() {
        return document.documentElement.dir === 'rtl' ? -1 : 1;
    }

    function getAnglePerItem() {
        var count = getSlides().length;
        return count > 0 ? 360 / count : 360;
    }

    function getActiveIndex() {
        var angle = getAnglePerItem();
        var norm = ((-currentAngle % 360) + 360) % 360;
        return Math.round(norm / angle) % getSlides().length;
    }

    function render() {
        var slides = getSlides();
        var count = slides.length;
        if (count === 0) { rafId = requestAnimationFrame(render); return; }

        var radius = getRadius();
        var anglePerItem = 360 / count;

        // Auto-rotate
        if (!isDragging && !isHovering && !isPaused) {
            targetAngle -= AUTO_SPEED * getDir();
        }

        // Ease toward target
        if (!isDragging) {
            currentAngle += (targetAngle - currentAngle) * EASE;
        }

        // Apply rotation to track
        track.style.transform = 'rotateY(' + currentAngle + 'deg)';

        // Position and style each slide
        for (var i = 0; i < count; i++) {
            var itemAngle = anglePerItem * i;
            slides[i].style.transform =
                'rotateY(' + itemAngle + 'deg) translateZ(' + radius + 'px)';

            // Calculate how far from front this item is
            var visibleAngle = ((itemAngle + currentAngle) % 360 + 360) % 360;
            var diff = Math.min(visibleAngle, 360 - visibleAngle);

            // Scale: 1.0 at front, 0.75 at back
            var scale = 1 - (diff / 180) * 0.25;
            slides[i].style.transform =
                'rotateY(' + itemAngle + 'deg) translateZ(' + radius + 'px) scale(' + scale.toFixed(3) + ')';

            // Brightness: 100% at front, 40% at back
            var brightness = 0.4 + 0.6 * (1 - diff / 180);
            slides[i].style.filter = 'brightness(' + brightness.toFixed(3) + ')';

            // Z-index: higher for front items
            slides[i].style.zIndex = Math.round(100 - diff);
        }

        // Update dots
        updateDots();

        rafId = requestAnimationFrame(render);
    }

    function updateDots() {
        if (!dotsContainer) return;
        var slides = getSlides();
        var count = slides.length;
        var activeIdx = getActiveIndex();

        // Only rebuild dots if count changed
        if (dotsContainer.childElementCount !== Math.min(count, 12)) {
            dotsContainer.innerHTML = '';
            for (var i = 0; i < Math.min(count, 12); i++) {
                var dot = document.createElement('button');
                dot.classList.add('carousel-dot');
                dot.setAttribute('aria-label', 'Slide ' + (i + 1));
                dot.setAttribute('data-idx', i);
                dot.addEventListener('click', function() {
                    rotateTo(parseInt(this.getAttribute('data-idx')));
                    pauseTemporarily();
                });
                dotsContainer.appendChild(dot);
            }
        }

        // Update active state
        var dots = dotsContainer.querySelectorAll('.carousel-dot');
        for (var j = 0; j < dots.length; j++) {
            dots[j].classList.toggle('active', j === activeIdx);
        }
    }

    function rotateTo(index) {
        var slides = getSlides();
        var count = slides.length;
        if (count === 0) return;
        var anglePerItem = 360 / count;
        var dir = getDir();

        // Calculate target to reach the given index
        var targetIdx = ((index % count) + count) % count;
        var currentIdx = getActiveIndex();
        var delta = targetIdx - currentIdx;

        // Take shortest path
        if (delta > count / 2) delta -= count;
        if (delta < -count / 2) delta += count;

        targetAngle -= delta * anglePerItem * dir;
    }

    function snapToNearest() {
        var anglePerItem = getAnglePerItem();
        var norm = ((-currentAngle % 360) + 360) % 360;
        var nearest = Math.round(norm / anglePerItem) * anglePerItem;
        var base = Math.floor(-currentAngle / 360) * 360;
        targetAngle = -(base + nearest);
    }

    function pauseTemporarily() {
        isPaused = true;
        clearTimeout(pauseTimer);
        pauseTimer = setTimeout(function() { isPaused = false; }, PAUSE_MS);
    }

    // Navigation buttons
    if (prevBtn) prevBtn.addEventListener('click', function() {
        var dir = getDir();
        rotateTo(getActiveIndex() - 1 * dir);
        pauseTemporarily();
    });
    if (nextBtn) nextBtn.addEventListener('click', function() {
        var dir = getDir();
        rotateTo(getActiveIndex() + 1 * dir);
        pauseTemporarily();
    });

    // Hover pause
    container.addEventListener('mouseenter', function() { isHovering = true; });
    container.addEventListener('mouseleave', function() { isHovering = false; });

    // Mouse drag
    var scene = container.querySelector('.carousel-scene');
    if (scene) {
        scene.addEventListener('mousedown', function(e) {
            isDragging = true;
            dragStartX = e.clientX;
            dragStartAngle = currentAngle;
            e.preventDefault();
        });
    }

    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        var diff = e.clientX - dragStartX;
        currentAngle = dragStartAngle + diff * 0.3 * getDir();
        targetAngle = currentAngle;
    });

    document.addEventListener('mouseup', function() {
        if (!isDragging) return;
        isDragging = false;
        snapToNearest();
        pauseTemporarily();
    });

    // Touch
    if (scene) {
        scene.addEventListener('touchstart', function(e) {
            isDragging = true;
            dragStartX = e.touches[0].clientX;
            dragStartAngle = currentAngle;
        }, { passive: true });
    }

    document.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        var diff = e.touches[0].clientX - dragStartX;
        currentAngle = dragStartAngle + diff * 0.3 * getDir();
        targetAngle = currentAngle;
    }, { passive: true });

    document.addEventListener('touchend', function() {
        if (!isDragging) return;
        isDragging = false;
        snapToNearest();
        pauseTemporarily();
    });

    // Keyboard
    container.setAttribute('tabindex', '0');
    container.addEventListener('keydown', function(e) {
        var dir = getDir();
        if (e.key === 'ArrowLeft') { rotateTo(getActiveIndex() - 1 * dir); pauseTemporarily(); }
        if (e.key === 'ArrowRight') { rotateTo(getActiveIndex() + 1 * dir); pauseTemporarily(); }
    });

    // Start animation loop
    render();

    return {
        goTo: function(idx) { rotateTo(idx); },
        refresh: function() {
            // Recalculate on filter change
            snapToNearest();
        },
        destroy: function() {
            if (rafId) cancelAnimationFrame(rafId);
        }
    };
}

// ===== Portfolio Slider =====
var portfolioCarousel = createSlider('.portfolio-carousel', {
    autoInterval: 3000
});

// ===== Portfolio Filter =====
var filterBtns = document.querySelectorAll('.filter-btn');
var allPortfolioSlides = document.querySelectorAll('.portfolio-carousel .carousel-slide');

filterBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
        filterBtns.forEach(function(b) {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        var filter = btn.dataset.filter;
        allPortfolioSlides.forEach(function(slide) {
            if (filter === 'all' || slide.dataset.category === filter) {
                slide.classList.remove('carousel-hidden');
                slide.style.display = '';
            } else {
                slide.classList.add('carousel-hidden');
                slide.style.display = 'none';
            }
        });

        if (portfolioCarousel) {
            portfolioCarousel.goTo(0);
            portfolioCarousel.refresh();
        }
    });
});

// ===== Pricing 3D Carousel =====
var pricingCarousel = create3DCarousel('.pricing-carousel', {
    autoSpeed: 0.08
});

// ===== Scroll Reveal Animation =====
const revealElements = document.querySelectorAll(
    '.section-header, .review-card, .faq-item, .contact-info, .contact-map'
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

// Delegated click for portfolio carousel items (ignore if user was dragging)
var portfolioMouseDown = { x: 0, y: 0 };
document.querySelector('.portfolio-carousel').addEventListener('mousedown', function(e) {
    portfolioMouseDown.x = e.clientX;
    portfolioMouseDown.y = e.clientY;
});
document.querySelector('.portfolio-carousel').addEventListener('click', function(e) {
    // If mouse moved more than 5px, it was a drag - don't open lightbox
    var dx = Math.abs(e.clientX - portfolioMouseDown.x);
    var dy = Math.abs(e.clientY - portfolioMouseDown.y);
    if (dx > 5 || dy > 5) return;

    var item = e.target.closest('.portfolio-item');
    if (!item) return;
    var img = item.querySelector('img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
});

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

lightboxClose.addEventListener('click', (e) => { e.stopPropagation(); closeLightbox(); });
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

// ===== User Reviews =====
(function() {
    var form = document.getElementById('reviewForm');
    var container = document.getElementById('userReviews');
    var starInput = document.getElementById('starInput');
    if (!form || !container) return;

    var selectedRating = 5;

    // Star selection
    if (starInput) {
        var starBtns = starInput.querySelectorAll('button');
        function updateStars(rating) {
            starBtns.forEach(function(btn) {
                btn.classList.toggle('active', parseInt(btn.dataset.star) <= rating);
            });
        }
        updateStars(5);
        starBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                selectedRating = parseInt(this.dataset.star);
                updateStars(selectedRating);
            });
            btn.addEventListener('mouseenter', function() {
                updateStars(parseInt(this.dataset.star));
            });
            btn.addEventListener('mouseleave', function() {
                updateStars(selectedRating);
            });
        });
    }

    function getReviews() {
        try { return JSON.parse(localStorage.getItem('lmr-user-reviews') || '[]'); }
        catch(e) { return []; }
    }

    function saveReviews(reviews) {
        localStorage.setItem('lmr-user-reviews', JSON.stringify(reviews));
    }

    function renderReviews() {
        var reviews = getReviews();
        if (reviews.length === 0) { container.innerHTML = ''; return; }
        container.innerHTML = reviews.map(function(r, idx) {
            var initials = r.name.split(' ').map(function(w) { return w[0]; }).join('').toUpperCase().slice(0, 2);
            var stars = '';
            for (var i = 0; i < r.rating; i++) stars += '&#9733;';
            return '<div class="review-card user-review">' +
                '<span class="review-badge">Client Review</span>' +
                '<div class="review-stars">' + stars + '</div>' +
                '<p class="review-text">' + escapeHtml(r.text) + '</p>' +
                '<div class="review-author">' +
                    '<div class="review-avatar">' + initials + '</div>' +
                    '<div><strong>' + escapeHtml(r.name) + '</strong><span>' + escapeHtml(r.location) + '</span></div>' +
                '</div></div>';
        }).join('');
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        var name = document.getElementById('reviewName').value.trim();
        var location = document.getElementById('reviewLocation').value.trim();
        var text = document.getElementById('reviewText').value.trim();
        if (!name || !location || !text) return;

        var reviews = getReviews();
        reviews.unshift({ name: name, location: location, text: text, rating: selectedRating, date: new Date().toISOString() });
        saveReviews(reviews);
        renderReviews();
        form.reset();
        selectedRating = 5;
        if (starInput) {
            var starBtns = starInput.querySelectorAll('button');
            starBtns.forEach(function(btn) { btn.classList.toggle('active', parseInt(btn.dataset.star) <= 5); });
        }
    });

    renderReviews();
})();

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
