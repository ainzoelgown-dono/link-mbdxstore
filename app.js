/* ===========================
   MBDx Store — App JavaScript
   =========================== */

// =====================
// Particle System
// =====================

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
    const color = i % 2 === 0 ? `rgba(232, 96, 122, ${p.opacity})` : `rgba(107, 189, 217, ${p.opacity})`;
    ctx.fillStyle = color;
    ctx.fill();
  });
  animFrame = requestAnimationFrame(drawParticles);
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

  // Setup notifications
  setupLinkTracking();

  // Observe cards for stagger
  observeCards();
});
