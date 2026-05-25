// ═══════════════════════════════════════════════
// Smart Pilgrimage — Vanilla JS
// ═══════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', function () {

    // ── Mobile navigation toggle ──
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            navLinks.classList.toggle('active');
        });

        // Close menu when a link is clicked
        navLinks.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                navLinks.classList.remove('active');
            });
        });
    }

    // ── Close mobile menu on outside click ──
    document.addEventListener('click', function (e) {
        if (navLinks && navLinks.classList.contains('active')) {
            if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) {
                navLinks.classList.remove('active');
            }
        }
    });

    // ── Map filter active state ──
    const mapFilterBtns = document.querySelectorAll('.map-filters button');
    mapFilterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            mapFilterBtns.forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
        });
    });

    // ── Smooth scroll for anchor links ──
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;
            var target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ── Add subtle fade-in to sections on scroll ──
    var sections = document.querySelectorAll('.section, .hero');
    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.05 });

        sections.forEach(function (section) {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            section.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            observer.observe(section);
        });
    }

    // ── Booking form validation ──
    var bookingForms = document.querySelectorAll('form[action="/api/bookings"]');
    bookingForms.forEach(function (form) {
        form.addEventListener('submit', function (e) {
            var checkIn = form.querySelector('input[name="check_in"]');
            var checkOut = form.querySelector('input[name="check_out"]');
            if (checkIn && checkOut && checkIn.value && checkOut.value) {
                if (new Date(checkOut.value) <= new Date(checkIn.value)) {
                    e.preventDefault();
                    alert('Check-out date must be after check-in date.');
                }
            }
        });
    });

    // ── Review star rating visual feedback ──
    var ratingSelects = document.querySelectorAll('select[name="rating"]');
    ratingSelects.forEach(function (select) {
        select.addEventListener('change', function () {
            var val = parseInt(this.value, 10);
            this.style.color = val >= 4 ? '#C9A84C' : val >= 3 ? '#f59e0b' : '#ef4444';
        });
    });

});
