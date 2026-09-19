/**
 * MARKLEY SNOW SERVICES — COMPLETE INTERACTIVE SCRIPT
 * Commercial Snow Management · Bucks & Montgomery County, PA
 * Contact: Mike (267) 718-4912
 */

// ==========================================================================
// ⚙️  CENTRALIZED EDITABLE BUSINESS CONFIGURATION
//     Update these values to change rates, phone, or popup behavior
// ==========================================================================

const PHONE        = "+12677184912";
const DISPLAY_PHONE = "(267) 718-4912";

// EDITABLE HIRING CONFIG: update these values when rates change.
const HIRING_ROLES = [
  { id: "plow-drivers",       title: "Plow drivers",       rate: "$125", unit: "/ hr", note: "Own truck + plow required" },
  { id: "machine-operators",  title: "Machine operators",  rate: "$45",  unit: "/ hr", note: "Loaders & spreaders"       },
  { id: "shovelers",          title: "Shovelers",          rate: "$35",  unit: "/ hr", note: "No experience required"    }
];

const ENABLE_HIRING_POPUP = true;
const HIRING_POPUP_DELAY  = 5000; // ms — 5 seconds

// ==========================================================================
// REDUCED MOTION DETECTION
// ==========================================================================
const prefersReducedMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ==========================================================================
// DOM READY
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  updateCopyrightYear();
  initNavbarScroll();
  initMobileMenu();
  initScrollReveal();
  init3DTiltEngine();
  initHeroParallax();
  initLogoHover();
  initHiringPopup();
  initSmoothScroll();
});

// ==========================================================================
// 1. AUTO-UPDATE COPYRIGHT YEAR
// ==========================================================================
function updateCopyrightYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

// ==========================================================================
// 2. STICKY NAVBAR WITH SCROLL CLASS
// ==========================================================================
function initNavbarScroll() {
  const navbar = document.getElementById('site-navigation');
  if (!navbar) return;

  const update = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  };

  window.addEventListener('scroll', update, { passive: true });
  update();
}

// ==========================================================================
// 3. MOBILE NAVIGATION DRAWER
//    Uses clip-path for smooth animation instead of display:none hack
// ==========================================================================
function initMobileMenu() {
  const btn    = document.getElementById('mobile-menu-button');
  const drawer = document.getElementById('mobile-nav-drawer');
  if (!btn || !drawer) return;

  let isOpen = false;

  const setOpen = (open) => {
    isOpen = open;
    btn.classList.toggle('open', open);
    drawer.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('popup-open', false); // drawer doesn't lock scroll
  };

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(!isOpen);
  });

  // Close on nav link click
  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setOpen(false));
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (isOpen && !drawer.contains(e.target) && !btn.contains(e.target)) {
      setOpen(false);
    }
  });

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) setOpen(false);
  });
}

// ==========================================================================
// 4. SCROLL REVEAL — INTERSECTION OBSERVER ENTRANCE ANIMATIONS
// ==========================================================================
function initScrollReveal() {
  if (prefersReducedMotion) return;

  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach(el => observer.observe(el));
}

// ==========================================================================
// 5. 3D INTERACTIVE TILT ENGINE (Service Cards, Rate Cards, County Card)
//    Real-time cursor position → subtle rotateX/rotateY + specular glare
// ==========================================================================
function init3DTiltEngine() {
  if (prefersReducedMotion) return;

  // Skip on touch devices — they use CSS :hover lift only
  const isTouch = window.matchMedia('(hover: none)').matches;
  if (isTouch) return;

  const cards = document.querySelectorAll('.service-card, .rate-card, .county-card');

  cards.forEach(card => {
    // Inject glare overlay if absent
    if (!card.querySelector('.card-glare')) {
      const glare = document.createElement('div');
      glare.className = 'card-glare';
      card.appendChild(glare);
    }

    const glare = card.querySelector('.card-glare');
    let rect = null;
    let raf  = null;

    const onEnter = () => {
      rect = card.getBoundingClientRect();
      card.style.transition = 'box-shadow var(--transition-smooth), border-color var(--transition-smooth)';
    };

    const onMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        if (!rect) rect = card.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width  / 2;
        const cy = rect.height / 2;

        // Clamp rotation: ±3.5deg
        const rotX = ((y - cy) / cy) * -3.5;
        const rotY = ((x - cx) / cx) *  3.5;

        card.style.transform =
          `perspective(1200px) translateY(-10px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;

        // Move specular glare to cursor position
        if (glare) {
          glare.style.background =
            `radial-gradient(circle at ${x.toFixed(0)}px ${y.toFixed(0)}px, rgba(255,255,255,0.48) 0%, transparent 62%)`;
          glare.style.opacity = '1';
        }

        raf = null;
      });
    };

    const onLeave = () => {
      card.style.transform = '';
      card.style.transition = '';
      if (glare) {
        glare.style.opacity = '0';
        glare.style.background = '';
      }
      rect = null;
      if (raf) { cancelAnimationFrame(raf); raf = null; }
    };

    card.addEventListener('mouseenter', onEnter);
    card.addEventListener('mousemove',  onMove);
    card.addEventListener('mouseleave', onLeave);
  });
}

// ==========================================================================
// 6. HERO PARALLAX — SUBTLE CURSOR-DRIVEN IMAGE SHIFT
// ==========================================================================
function initHeroParallax() {
  if (prefersReducedMotion) return;

  const hero      = document.getElementById('hero-section');
  const bgWrapper = document.querySelector('.hero-bg-wrapper');
  const stamp     = document.querySelector('.hero-stamp-badge');
  if (!hero || !bgWrapper) return;

  let raf  = null;
  let tick = false;

  hero.addEventListener('mousemove', (e) => {
    if (tick) return;
    tick = true;
    raf = requestAnimationFrame(() => {
      const { clientX, clientY } = e;
      const xPct = (clientX / window.innerWidth  - 0.5);   // -0.5 to 0.5
      const yPct = (clientY / window.innerHeight - 0.5);

      // Max ±10px background shift (very subtle)
      const bx = (-xPct * 14).toFixed(1);
      const by = (-yPct * 14).toFixed(1);
      bgWrapper.style.transform = `scale(1.05) translate(${bx}px, ${by}px)`;

      // Badge counter-moves slightly (floaty feel)
      if (stamp) {
        const sx = ( xPct * 7).toFixed(1);
        const sy = ( yPct * 5).toFixed(1);
        stamp.style.transform = `rotate(-6deg) translate(${sx}px, ${sy}px)`;
      }

      tick = false;
      raf  = null;
    });
  });

  hero.addEventListener('mouseleave', () => {
    bgWrapper.style.transform = 'scale(1.02)';
    if (stamp) stamp.style.transform = '';
    if (raf) { cancelAnimationFrame(raf); raf = null; tick = false; }
  });
}

// ==========================================================================
// 7. LOGO 3D INTERACTIVE HOVER
// ==========================================================================
function initLogoHover() {
  if (prefersReducedMotion) return;
  const isTouch = window.matchMedia('(hover: none)').matches;
  if (isTouch) return;

  const logoWrap  = document.querySelector('.brand-logo-wrap');
  const logoFrame = document.querySelector('.brand-logo-frame');
  if (!logoWrap || !logoFrame) return;

  logoWrap.addEventListener('mousemove', (e) => {
    const rect = logoFrame.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  - 0.5);
    const y = ((e.clientY - rect.top)  / rect.height - 0.5);
    logoFrame.style.transform =
      `perspective(600px) translateY(-2px) rotateX(${(-y * 8).toFixed(1)}deg) rotateY(${(x * 8).toFixed(1)}deg) scale(1.04)`;
    logoFrame.style.borderColor = 'var(--orange)';
  });

  logoWrap.addEventListener('mouseleave', () => {
    logoFrame.style.transform  = '';
    logoFrame.style.borderColor = '';
  });
}

// ==========================================================================
// 8. TIMED HIRING POPUP
//    - Fires after HIRING_POPUP_DELAY (5000ms)
//    - Close: X button, backdrop click, ESC key
//    - Proper focus trap and aria-hidden
// ==========================================================================
function initHiringPopup() {
  if (!ENABLE_HIRING_POPUP) return;

  const backdrop = document.getElementById('hiring-popup');
  const closeBtn = document.getElementById('hiring-popup-close');
  if (!backdrop || !closeBtn) return;

  // Focusable elements for trap
  const focusableSelectors = 'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])';

  const openPopup = () => {
    backdrop.classList.add('active');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.classList.add('popup-open');
    // Focus the close button
    setTimeout(() => closeBtn.focus(), 50);
  };

  const closePopup = () => {
    backdrop.classList.remove('active');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('popup-open');
  };

  // Focus trap inside popup
  backdrop.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusable = [...backdrop.querySelectorAll(focusableSelectors)];
    if (!focusable.length) return;

    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // Auto trigger
  const timer = setTimeout(openPopup, HIRING_POPUP_DELAY);

  // Close handlers
  closeBtn.addEventListener('click', closePopup);

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closePopup();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('active')) {
      closePopup();
    }
  });

  // Expose globally for manual trigger if needed
  window.openHiringPopup  = openPopup;
  window.closeHiringPopup = closePopup;
}

// ==========================================================================
// 9. SMOOTH SCROLL FOR IN-PAGE ANCHORS (with header offset)
// ==========================================================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      if (!targetId) return;

      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--header-height') || '84', 10);

      const top = target.getBoundingClientRect().top + window.pageYOffset - offset - 12;
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });
}
