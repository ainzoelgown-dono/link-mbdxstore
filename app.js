/* ===========================
   MBDx Store — App JavaScript
   =========================== */

// =====================
// Auto Time-Based Theme
// =====================

const DAY_START = 6;   // 06:00 → light
const DAY_END   = 18;  // 18:00 → dark

function getAutoTheme() {
  const h = new Date().getHours();
  return (h >= DAY_START && h < DAY_END) ? 'light' : 'dark';
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

// Apply immediately to avoid flash
(function () {
  applyTheme(getAutoTheme());
})();

// =====================
// Real-Time Clock
// =====================

function getPeriodInfo(hour) {
  if (hour >= 0  && hour < 6)  return { emoji: '🌃', label: 'Dini Hari', cls: 'dinihari' };
  if (hour >= 6  && hour < 12) return { emoji: '🌅', label: 'Pagi',      cls: 'pagi'    };
  if (hour >= 12 && hour < 15) return { emoji: '☀️',  label: 'Siang',     cls: 'siang'   };
  if (hour >= 15 && hour < 18) return { emoji: '🌇', label: 'Sore',      cls: 'sore'    };
  return                               { emoji: '🌙', label: 'Malam',     cls: 'malam'   };
}

function updateClock() {
  const now    = new Date();
  const h      = String(now.getHours()).padStart(2, '0');
  const m      = String(now.getMinutes()).padStart(2, '0');
  const info   = getPeriodInfo(now.getHours());

  const timeEl   = document.getElementById('clockTime');
  const periodEl = document.getElementById('clockPeriod');

  if (timeEl)   timeEl.innerHTML  = `${h}<span class="colon">:</span>${m}`;
  if (periodEl) {
    periodEl.innerHTML  = `${info.emoji} ${info.label}`;
    periodEl.className  = `clock-period ${info.cls}`;
  }

  // Auto-switch theme at boundary hours (6:00 and 18:00)
  const newTheme = getAutoTheme();
  const curTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  if (newTheme !== curTheme) {
    applyTheme(newTheme);
    if (newTheme === 'dark') createStarfield();
    updateParticleColors();
  }
}

function setupClock() {
  updateClock();
  setInterval(updateClock, 1000);
}


const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

let particles = [];
let animFrame;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createParticle() {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 1.5 + 0.3,
    speedX: (Math.random() - 0.5) * 0.3,
    speedY: -Math.random() * 0.4 - 0.1,
    opacity: Math.random() * 0.5 + 0.1,
    fadeSpeed: Math.random() * 0.003 + 0.001,
  };
}

function initParticles() {
  particles = [];
  const count = Math.min(Math.floor((canvas.width * canvas.height) / 8000), 80);
  for (let i = 0; i < count; i++) {
    const p = createParticle();
    p.y = Math.random() * canvas.height; // distribute initially
    particles.push(p);
  }
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p, i) => {
    p.x += p.speedX;
    p.y += p.speedY;
    p.opacity -= p.fadeSpeed;

    if (p.opacity <= 0 || p.y < -10) {
      particles[i] = createParticle();
      particles[i].y = canvas.height + 5;
      particles[i].opacity = 0;
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    // Alternate between soft pink and soft blue to match mbdx.store palette
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const color = isDark
      ? (i % 2 === 0 ? `rgba(168, 85, 247, ${p.opacity})` : `rgba(6, 182, 212, ${p.opacity})`)
      : (i % 2 === 0 ? `rgba(232, 96, 122, ${p.opacity})` : `rgba(107, 189, 217, ${p.opacity})`);
    ctx.fillStyle = color;
    ctx.fill();
  });
  animFrame = requestAnimationFrame(drawParticles);
}

// =====================
// Update Particle Colors
// =====================

function updateParticleColors() {
  // Colors update automatically on next frame via isDark check in drawParticles
}

// =====================
// Starfield
// =====================

function createStarfield() {
  const container = document.getElementById('starfield');
  if (!container) return;
  container.innerHTML = '';

  const W = window.innerWidth;
  const H = window.innerHeight;
  const totalStars = 180;

  // Star types: weight distribution
  const types = [
    { cls: 'star star-sm',   count: 90 },
    { cls: 'star star-md',   count: 55 },
    { cls: 'star star-lg',   count: 20 },
    { cls: 'star star-glow', count: 8  },
    { cls: 'star star-cyan', count: 7  },
  ];

  types.forEach(({ cls, count }) => {
    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.className = cls;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const duration = (Math.random() * 4 + 2).toFixed(2);
      const delay    = (Math.random() * 6).toFixed(2);
      const minOp    = (Math.random() * 0.1 + 0.05).toFixed(2);
      const maxOp    = (Math.random() * 0.5 + 0.5).toFixed(2);
      Object.assign(el.style, {
        left: `${x}%`,
        top:  `${y}%`,
        animationDuration:  `${duration}s`,
        animationDelay:     `-${delay}s`,
        '--star-min-opacity': minOp,
        '--star-max-opacity': maxOp,
      });
      container.appendChild(el);
    }
  });

  // Add 3 shooting stars — start from top-right, travel diagonally left+down
  for (let i = 0; i < 3; i++) {
    const s = document.createElement('span');
    s.className = 'shooting-star';
    // Spawn from right side of screen, upper portion
    const sx       = Math.random() * 35 + 60;  // 60% – 95% from left
    const sy       = Math.random() * 25 + 5;   // 5%  – 30% from top
    const duration = (Math.random() * 5 + 7).toFixed(1);  // 7–12s cycle
    const delay    = (Math.random() * 15).toFixed(1);      // staggered start
    Object.assign(s.style, {
      left:              `${sx}%`,
      top:               `${sy}%`,
      animationDuration: `${duration}s`,
      animationDelay:    `-${delay}s`,
    });
    container.appendChild(s);
  }
}

// =====================
// Ripple Click Effect
// =====================

function createRipple(event) {
  const card = event.currentTarget;
  const existing = card.querySelector('.ripple');
  if (existing) existing.remove();

  const ripple = document.createElement('span');
  ripple.classList.add('ripple');

  const rect = card.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  Object.assign(ripple.style, {
    width: `${size}px`,
    height: `${size}px`,
    left: `${x}px`,
    top: `${y}px`,
    position: 'absolute',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.08)',
    transform: 'scale(0)',
    animation: 'rippleAnim 0.6s linear',
    pointerEvents: 'none',
  });

  card.style.overflow = 'hidden';
  card.appendChild(ripple);
  setTimeout(() => ripple.remove(), 700);
}

// Add ripple keyframes dynamically
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
  @keyframes rippleAnim {
    to {
      transform: scale(2.5);
      opacity: 0;
    }
  }
`;
document.head.appendChild(rippleStyle);

// =====================
// Tilt Effect on Cards
// =====================

function addTiltEffect(card) {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;

    card.style.transform = `translateY(-3px) scale(1.01) perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
  });

  card.addEventListener('mouseenter', () => {
    card.style.transition = 'all 0.1s ease';
  });
}

// =====================
// Counter Animation
// =====================

function animateProfileIn() {
  const profile = document.querySelector('.profile-section');
  if (!profile) return;
  profile.style.opacity = '0';
  profile.style.transform = 'translateY(-20px) scale(0.97)';
  profile.style.transition = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
  setTimeout(() => {
    profile.style.opacity = '1';
    profile.style.transform = 'translateY(0) scale(1)';
  }, 100);
}

// =====================
// Intersection Observer for stagger
// =====================

function observeCards() {
  const cards = document.querySelectorAll('.link-card');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach((card) => {
    card.style.animationPlayState = 'paused';
    obs.observe(card);
  });
}

// =====================
// Toast Notification
// =====================

function showToast(message) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.classList.add('toast');
  toast.textContent = message;

  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%) translateY(80px)',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    border: '1.5px solid rgba(232, 96, 122, 0.3)',
    color: '#d44d68',
    padding: '10px 22px',
    borderRadius: '100px',
    fontSize: '0.82rem',
    fontFamily: 'Outfit, sans-serif',
    fontWeight: '600',
    zIndex: '9999',
    transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease',
    opacity: '0',
    boxShadow: '0 8px 32px rgba(100, 170, 210, 0.25)',
    whiteSpace: 'nowrap',
  });

  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(-50%) translateY(0)';
    toast.style.opacity = '1';
  });

  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(80px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 2500);
}

// =====================
// Link Click Tracking
// =====================

function setupLinkTracking() {
  const cards = document.querySelectorAll('.link-card');
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const label = card.querySelector('.link-label')?.textContent;
      if (label) showToast(`🔗 Membuka ${label}…`);
    });
  });
}

// =====================
// Background Music
// =====================

function setupMusic() {
  const audio    = document.getElementById('bgMusic');
  const btn      = document.getElementById('musicBtn');
  const overlay  = document.getElementById('welcomeOverlay');
  const closeBtn = document.getElementById('welcomeClose');
  const ctaBtn   = document.getElementById('welcomeCta');
  if (!audio || !btn) return;

  let unmuted = false;

  // Fade volume 0 → 0.5
  function fadeInVolume() {
    audio.volume = 0;
    let vol = 0;
    const fade = setInterval(() => {
      vol = Math.min(vol + 0.03, 0.5);
      audio.volume = vol;
      if (vol >= 0.5) clearInterval(fade);
    }, 50);
  }

  function dismissModal() {
    if (!overlay) return;
    overlay.classList.add('hide');
    setTimeout(() => {
      overlay.style.display = 'none';
      overlay.classList.remove('show', 'hide');
    }, 450);
  }

  function startMusic() {
    if (unmuted) return;
    unmuted = true;
    audio.muted = true;
    audio.volume = 0;
    audio.play().then(() => {
      audio.muted = false;
      fadeInVolume();
      btn.classList.remove('waiting');
      btn.classList.add('playing');
    }).catch(() => {});
    dismissModal();
  }

  // Show welcome modal after short delay
  if (overlay) {
    setTimeout(() => {
      overlay.classList.add('show');
    }, 600);
  }

  // Close via [x] atau CTA → start music
  // Tambah touchend untuk kompatibilitas iOS Safari
  function addTapListener(el, handler) {
    if (!el) return;
    el.addEventListener('click', handler);
    el.addEventListener('touchend', (e) => {
      e.preventDefault(); // Cegah double-fire di iOS
      handler();
    });
  }

  addTapListener(closeBtn, startMusic);
  addTapListener(ctaBtn, startMusic);

  // Also try silent autoplay in background (bonus: might work directly)
  audio.muted = true;
  audio.volume = 0;
  audio.play().then(() => {
    // Muted autoplay succeeded → unmute immediately
    audio.muted = false;
    fadeInVolume();
    btn.classList.add('playing');
    unmuted = true;
    // Modal still shows as greeting, dismiss on close
  }).catch(() => {
    btn.classList.add('waiting');
  });

  // Music btn toggle (after modal closed)
  btn.addEventListener('click', () => {
    if (!unmuted) { startMusic(); return; }
    if (!audio.muted) {
      audio.muted = true;
      btn.classList.remove('playing');
      btn.classList.add('waiting');
      showToast('🔇 Musik dimatikan');
    } else {
      audio.muted = false;
      fadeInVolume();
      btn.classList.remove('waiting');
      btn.classList.add('playing');
      showToast('🎵 Musik dinyalakan');
    }
  });
}



// =====================
// Init
// =====================

document.addEventListener('DOMContentLoaded', () => {
  // Canvas particles
  resizeCanvas();
  initParticles();
  drawParticles();

  window.addEventListener('resize', () => {
    resizeCanvas();
    initParticles();
  });

  // Tilt & ripple on all cards
  document.querySelectorAll('.link-card').forEach((card) => {
    addTiltEffect(card);
    card.addEventListener('mousedown', createRipple);
  });

  // Profile entrance animation
  animateProfileIn();

  // Start real-time clock + auto theme
  setupClock();

  // Generate starfield if dark mode is active on load
  if (document.documentElement.getAttribute('data-theme') === 'dark') {
    createStarfield();
  }

  // Setup background music
  setupMusic();

  // Setup notifications
  setupLinkTracking();

  // Observe cards for stagger
  observeCards();
});
