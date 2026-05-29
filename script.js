/* ═══════════════════════════════════════════════════════
   FLOW DESIGN — script.js
   ═══════════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────────────────
   1. NAV — scroll state + mobile toggle
   ────────────────────────────────────────────────────── */
(function initNav() {
  const nav = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const mobile = document.getElementById('navMobile');

  // scroll class
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // burger toggle
  let open = false;
  const toggle = () => {
    open = !open;
    burger.classList.toggle('active', open);
    mobile.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
  };
  burger.addEventListener('click', toggle);

  // close on link click
  mobile.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => { open = false; burger.classList.remove('active'); mobile.classList.remove('open'); burger.setAttribute('aria-expanded', false); });
  });

  // close on outside click
  document.addEventListener('click', e => {
    if (open && !nav.contains(e.target)) { open = false; burger.classList.remove('active'); mobile.classList.remove('open'); burger.setAttribute('aria-expanded', false); }
  });
})();


/* ──────────────────────────────────────────────────────
   2. HERO CANVAS — flowing lines
   ────────────────────────────────────────────────────── */
(function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, lines, raf;

  const COLORS = [
    'rgba(167,139,250,', // violet
    'rgba(124,58,237,',  // deep violet
    'rgba(196,181,253,', // lavender
    'rgba(99,102,241,',  // indigo
  ];

  function Line() {
    this.reset = function () {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.length = 200 + Math.random() * 400;
      this.speed = 0.2 + Math.random() * 0.6;
      this.angle = (Math.random() * Math.PI * 0.5) - Math.PI * 0.1;
      this.width = 0.5 + Math.random() * 1.5;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.alpha = 0.04 + Math.random() * 0.12;
      this.progress = Math.random();
      this.waveAmp = 20 + Math.random() * 60;
      this.waveFreq = 0.003 + Math.random() * 0.008;
      this.waveOffset = Math.random() * Math.PI * 2;
      this.lifeSpeed = 0.001 + Math.random() * 0.002;
    };

    this.draw = function (t) {
      this.progress += this.lifeSpeed;
      if (this.progress > 1.3) this.reset();

      const steps = Math.ceil(this.length / 4);
      ctx.beginPath();

      for (let i = 0; i <= steps; i++) {
        const ratio = i / steps;
        const dist = ratio * this.length;
        const waveDelta = Math.sin(dist * this.waveFreq + this.waveOffset + t * 0.001) * this.waveAmp;
        const px = this.x + Math.cos(this.angle) * dist + Math.cos(this.angle + Math.PI / 2) * waveDelta;
        const py = this.y + Math.sin(this.angle) * dist + Math.sin(this.angle + Math.PI / 2) * waveDelta;

        // fade in/out
        const edgeFade = Math.min(ratio * 4, (1 - ratio) * 4, 1);
        const lifeFade = Math.sin(Math.max(0, Math.min(1, this.progress)) * Math.PI);

        ctx.strokeStyle = this.color + (this.alpha * edgeFade * lifeFade) + ')';
        ctx.lineWidth = this.width;

        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    };

    this.reset();
    // start at random progress
    this.progress = Math.random();
  }

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    W = canvas.width = rect.width;
    H = canvas.height = rect.height;
    if (!lines) {
      const count = Math.max(16, Math.floor((W * H) / 18000));
      lines = Array.from({ length: count }, () => new Line());
    }
  }

  function render(t) {
    ctx.clearRect(0, 0, W, H);
    lines.forEach(l => l.draw(t));
    raf = requestAnimationFrame(render);
  }

  resize();
  raf = requestAnimationFrame(render);
  window.addEventListener('resize', () => { resize(); }, { passive: true });
})();


/* ──────────────────────────────────────────────────────
   3. REVEAL ON SCROLL
   ────────────────────────────────────────────────────── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const obs = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
  );

  els.forEach(el => obs.observe(el));
})();


/* ──────────────────────────────────────────────────────
   4. WORKS FILTER
   ────────────────────────────────────────────────────── */
(function initWorksFilter() {
  const btns = document.querySelectorAll('.works__filter-btn');
  const cards = document.querySelectorAll('.work-card');
  if (!btns.length || !cards.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const cat = card.dataset.category;
        const show = filter === 'all' || cat === filter;
        card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
        if (show) {
          card.style.opacity = '1';
          card.style.transform = '';
          card.style.pointerEvents = '';
        } else {
          card.style.opacity = '0.2';
          card.style.transform = 'scale(0.97)';
          card.style.pointerEvents = 'none';
        }
      });
    });
  });
})();


/* ──────────────────────────────────────────────────────
   5. FAQ ACCORDION
   ────────────────────────────────────────────────────── */
(function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const btn = item.querySelector('.faq-item__q');
    const ans = item.querySelector('.faq-item__a');
    if (!btn || !ans) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // close all
      items.forEach(i => {
        i.querySelector('.faq-item__q').setAttribute('aria-expanded', 'false');
        i.querySelector('.faq-item__a').classList.remove('open');
      });

      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        ans.classList.add('open');
      }
    });
  });
})();


/* ──────────────────────────────────────────────────────
   6. CONTACT FORM — fake submit with success state
   ────────────────────────────────────────────────────── */
(function initContactForm() {
  const submitBtn = document.getElementById('formSubmit');
  const successEl = document.getElementById('formSuccess');
  const form = document.getElementById('contactForm');
  if (!submitBtn || !successEl || !form) return;

  const inputs = form.querySelectorAll('input[required], textarea[required]');

  submitBtn.addEventListener('click', () => {
    // basic validation
    let valid = true;
    inputs.forEach(inp => {
      inp.style.borderColor = '';
      if (!inp.value.trim()) {
        valid = false;
        inp.style.borderColor = 'rgba(248,113,113,0.5)';
        inp.style.boxShadow = '0 0 0 3px rgba(248,113,113,0.1)';
      }
    });

    if (!valid) {
      submitBtn.style.animation = 'shake 0.4s ease';
      setTimeout(() => { submitBtn.style.animation = ''; }, 400);
      return;
    }

    // show loading
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    // simulate API call
    setTimeout(() => {
      successEl.classList.add('visible');
    }, 1100);
  });

  // reset red borders on focus
  inputs.forEach(inp => {
    inp.addEventListener('focus', () => {
      inp.style.borderColor = '';
      inp.style.boxShadow = '';
    });
  });
})();


/* ──────────────────────────────────────────────────────
   7. SMOOTH SCROLL for nav links
   ────────────────────────────────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();


/* ──────────────────────────────────────────────────────
   8. SHAKE ANIMATION (injected)
   ────────────────────────────────────────────────────── */
(function injectKeyframes() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-6px); }
      40% { transform: translateX(6px); }
      60% { transform: translateX(-4px); }
      80% { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(style);
})();


/* ──────────────────────────────────────────────────────
   9. PRICING — subtle parallax hover tilt
   ────────────────────────────────────────────────────── */
(function initCardTilt() {
  const cards = document.querySelectorAll('.pricing-card, .service-card');
  if (window.matchMedia('(hover: none)').matches) return;

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      card.style.transform = `perspective(800px) rotateY(${dx * 4}deg) rotateX(${-dy * 4}deg) translateY(-3px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      setTimeout(() => { card.style.transition = ''; }, 500);
    });
  });
})();


/* ──────────────────────────────────────────────────────
   10. ACTIVE NAV LINK highlight on scroll
   ────────────────────────────────────────────────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__links a');
  if (!sections.length || !navLinks.length) return;

  const onScroll = () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) current = s.id;
    });
    navLinks.forEach(a => {
      a.style.color = '';
      if (a.getAttribute('href') === `#${current}`) {
        a.style.color = 'var(--c-text)';
      }
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
})();
