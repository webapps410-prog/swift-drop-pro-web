/* ═══════════════════════════════════════════
   SwiftDrop Pro — script.js
═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─── Custom Cursor ─────────────────────── */
  const cursor      = document.getElementById('cursor');
  const cursorTrail = document.getElementById('cursorTrail');

  if (cursor && cursorTrail) {
    let mx = 0, my = 0;
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top  = my + 'px';
    });
    // Trail follows with slight delay via CSS transition on left/top
    function trailTick() {
      cursorTrail.style.left = mx + 'px';
      cursorTrail.style.top  = my + 'px';
      requestAnimationFrame(trailTick);
    }
    trailTick();

    document.querySelectorAll('a, button, .ss-card, .feature-card, .role-card').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(2.2)';
        cursorTrail.style.transform = 'translate(-50%, -50%) scale(1.4)';
        cursorTrail.style.borderColor = 'rgba(255,107,53,0.8)';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        cursorTrail.style.transform = 'translate(-50%, -50%) scale(1)';
        cursorTrail.style.borderColor = 'rgba(255,107,53,0.5)';
      });
    });
  }

  /* ─── Navbar Scroll ─────────────────────── */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* ─── Mobile Menu ───────────────────────── */
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  let menuOpen = false;

  hamburger && hamburger.addEventListener('click', () => {
    menuOpen = !menuOpen;
    mobileMenu.classList.toggle('open', menuOpen);
    const spans = hamburger.querySelectorAll('span');
    if (menuOpen) {
      spans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });
  mobileMenu && mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      menuOpen = false;
      mobileMenu.classList.remove('open');
      hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });

  /* ─── Scroll Reveal ─────────────────────── */
  const reveals = document.querySelectorAll('.reveal');
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  reveals.forEach(el => revealObs.observe(el));

  /* ─── Animated Counters ─────────────────── */
  const statNums = document.querySelectorAll('.stat-num');
  const counterObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const duration = 1400;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      }
      requestAnimationFrame(tick);
      counterObs.unobserve(el);
    });
  }, { threshold: 0.5 });
  statNums.forEach(el => counterObs.observe(el));

  /* ─── Hero Phone Screen Rotator ─────────── */
  const heroScreen = document.getElementById('heroScreen');
  const screens = [
    'assets/screenshots/screen1.png',
    'assets/screenshots/screen2.png',
    'assets/screenshots/screen3.png',
    'assets/screenshots/screen4.png',
  ];
  let heroIdx = 0;
  if (heroScreen) {
    setInterval(() => {
      heroIdx = (heroIdx + 1) % screens.length;
      heroScreen.classList.remove('active');
      setTimeout(() => {
        heroScreen.src = screens[heroIdx];
        heroScreen.classList.add('active');
      }, 350);
    }, 3000);
  }

  /* ─── Screenshot Carousel ───────────────── */
  const track  = document.getElementById('screenshotTrack');
  const prev   = document.getElementById('ssPrev');
  const next   = document.getElementById('ssNext');
  const dotsEl = document.getElementById('ssDots');

  const cards = document.querySelectorAll('.ss-card');
  const totalReal = 8; // real cards (not duplicates)
  let currentSS = 0;

  // Build dots
  if (dotsEl) {
    for (let i = 0; i < totalReal; i++) {
      const dot = document.createElement('div');
      dot.className = 'ss-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => scrollToCard(i));
      dotsEl.appendChild(dot);
    }
  }

  function updateDots(idx) {
    document.querySelectorAll('.ss-dot').forEach((d, i) => {
      d.classList.toggle('active', i === idx);
    });
  }

  function scrollToCard(idx) {
    currentSS = idx;
    const card = cards[idx];
    if (!card || !track) return;
    const cardLeft  = card.offsetLeft;
    const cardW     = card.offsetWidth;
    const trackW    = track.offsetWidth;
    const target    = cardLeft - (trackW / 2) + (cardW / 2) - 60;
    track.scrollTo({ left: target, behavior: 'smooth' });
    updateDots(idx);
  }

  prev && prev.addEventListener('click', () => {
    currentSS = (currentSS - 1 + totalReal) % totalReal;
    scrollToCard(currentSS);
  });
  next && next.addEventListener('click', () => {
    currentSS = (currentSS + 1) % totalReal;
    scrollToCard(currentSS);
  });

  // Auto-advance carousel
  let ssAuto = setInterval(() => {
    currentSS = (currentSS + 1) % totalReal;
    scrollToCard(currentSS);
  }, 3200);

  track && track.addEventListener('pointerdown', () => clearInterval(ssAuto));

  // Drag to scroll
  if (track) {
    let isDown = false, startX = 0, scrollLeft = 0;
    track.addEventListener('pointerdown', e => {
      isDown = true;
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
      track.style.cursor = 'grabbing';
    });
    track.addEventListener('pointerup',   () => { isDown = false; track.style.cursor = 'grab'; });
    track.addEventListener('pointerleave',() => { isDown = false; });
    track.addEventListener('pointermove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.5;
      track.scrollLeft = scrollLeft - walk;
    });
  }

  /* ─── QR Code (CSS-generated pattern) ──── */
  const qrGrid = document.getElementById('qrGrid');
  if (qrGrid) {
    // A decorative QR-like pattern
    const pattern = [
      1,1,1,1,1,1,1,0,1,0,
      1,0,0,0,0,0,1,0,0,1,
      1,0,1,1,1,0,1,0,1,0,
      1,0,1,1,1,0,1,0,0,1,
      1,0,1,1,1,0,1,0,1,1,
      1,0,0,0,0,0,1,1,0,0,
      1,1,1,1,1,1,1,0,1,0,
      0,0,0,0,0,0,0,1,0,1,
      1,1,0,1,1,0,1,0,1,0,
      0,1,0,0,1,0,0,1,0,1,
    ];
    pattern.forEach(bit => {
      const cell = document.createElement('div');
      cell.className = 'qr-cell';
      cell.style.background = bit ? '#0a0a0f' : 'transparent';
      qrGrid.appendChild(cell);
    });
  }

  /* ─── Smooth anchor scroll ──────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ─── Parallax hero orbs ────────────────── */
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const orb1 = document.querySelector('.orb-1');
    const orb2 = document.querySelector('.orb-2');
    if (orb1) orb1.style.transform = `translateY(${y * 0.12}px)`;
    if (orb2) orb2.style.transform = `translateY(${y * -0.08}px)`;
  }, { passive: true });

  /* ─── Feature card tilt ─────────────────── */
  document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 10;
      const y = ((e.clientY - rect.top)  / rect.height - 0.5) * -10;
      card.style.transform = `translateY(-6px) rotateX(${y}deg) rotateY(${x}deg)`;
      card.style.transition = 'transform 0.1s';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.4s ease';
    });
  });

});
