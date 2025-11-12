// script.js — animasi, interaksi, dark-mode, and contact form handling

// ---------- Typewriter (role) ----------
const roles = ['Mahasiswa Sistem Informasi', 'Pengembang Web & Frontend', 'Penggemar Data & UX'];
let roleIndex = 0;
let charIndex = 0;
const roleTextEl = document.getElementById('roleText');

function typeRole() {
  if (!roleTextEl) return;
  const current = roles[roleIndex];
  if (charIndex <= current.length) {
    roleTextEl.textContent = current.slice(0, charIndex);
    charIndex++;
    setTimeout(typeRole, 50);
  } else {
    setTimeout(eraseRole, 900);
  }
}
function eraseRole() {
  const current = roles[roleIndex];
  if (charIndex >= 0) {
    roleTextEl.textContent = current.slice(0, charIndex);
    charIndex--;
    setTimeout(eraseRole, 28);
  } else {
    roleIndex = (roleIndex + 1) % roles.length;
    setTimeout(typeRole, 250);
  }
}
typeRole();

// ---------- Simple reveals ----------
document.addEventListener('DOMContentLoaded', () => {
  const showEls = document.querySelectorAll('h1, .lead, .meta, .skills, .actions, .photo-wrap');
  showEls.forEach((el, i) => setTimeout(()=> el.classList.add('fade-in', 'show'), i * 80));
  document.getElementById('year').textContent = new Date().getFullYear();
});

// ---------- Skill bars animation ----------
const skillBars = document.querySelectorAll('.bar-fill');
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const fill = entry.target;
      const pct = fill.getAttribute('data-fill') || 60;
      fill.style.width = pct + '%';
      skillObserver.unobserve(fill);
    }
  });
},{threshold:0.25});
skillBars.forEach(b => skillObserver.observe(b));

// ---------- Modal & Contact form ----------
const contactModal = document.getElementById('contactModal');
const contactBtn = document.getElementById('contactBtn');
const openContact = document.getElementById('openContact');
const modalClose = document.getElementById('modalClose');
const contactCancel = document.getElementById('contactCancel');
const contactForm = document.getElementById('contactForm');
const formFeedback = document.getElementById('formFeedback');

function openModal(){ contactModal.setAttribute('aria-hidden','false'); contactModal.querySelector('input,textarea,button')?.focus(); }
function closeModal(){ contactModal.setAttribute('aria-hidden','true'); }

contactBtn?.addEventListener('click', openModal);
openContact?.addEventListener('click', openModal);
modalClose?.addEventListener('click', closeModal);
contactCancel?.addEventListener('click', closeModal);
contactModal?.addEventListener('click', (e) => { if (e.target === contactModal) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

// Form submit handler — default form action is Formspree (replace with yourFormId)
contactForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  formFeedback.textContent = 'Mengirim...';
  const formData = new FormData(contactForm);
  const action = contactForm.getAttribute('action') || '';
  // If action contains "formspree.io", use fetch to submit; otherwise fallback to mailto
  if (action.includes('formspree.io')) {
    try {
      const res = await fetch(action, {
        method: contactForm.method || 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        formFeedback.textContent = 'Pesan terkirim. Terima kasih!';
        contactForm.reset();
        setTimeout(()=> closeModal(), 1200);
      } else {
        const data = await res.json().catch(()=> null);
        formFeedback.textContent = data?.error || 'Gagal mengirim. Silakan coba lagi atau salin email.';
      }
    } catch (err) {
      formFeedback.textContent = 'Kesalahan jaringan. Coba lagi atau gunakan email langsung.';
    }
  } else {
    // fallback: create mailto link
    const name = formData.get('name') || '';
    const email = formData.get('email') || '';
    const message = formData.get('message') || '';
    const subject = encodeURIComponent(`Kontak dari website — ${name}`);
    const body = encodeURIComponent(`Nama: ${name}\nEmail: ${email}\n\n${message}`);
    const mailto = `mailto:${document.getElementById('emailText').textContent}?subject=${subject}&body=${body}`;
    window.location.href = mailto;
  }
});

// ---------- Copy email helpers ----------
function copyText(selectorOrText){
  let text = selectorOrText;
  if (selectorOrText.startsWith('#') || selectorOrText.startsWith('.')) {
    const el = document.querySelector(selectorOrText);
    if (!el) return;
    text = el.textContent.trim();
  }
  navigator.clipboard?.writeText(text).then(()=> {
    // small unobtrusive feedback
    const prev = formFeedback;
    if (prev) prev.textContent = `Disalin: ${text}`;
    setTimeout(()=> { if (prev) prev.textContent = ''; }, 1400);
  }).catch(()=>{
    alert('Gagal menyalin. Silakan salin manual: ' + text);
  });
}
const copyEmailBtn = document.getElementById('copyEmailBtn');
copyEmailBtn?.addEventListener('click', ()=> copyText('#emailText'));
document.querySelectorAll('[data-copy]').forEach(btn=>{
  btn.addEventListener('click', ()=> copyText(btn.getAttribute('data-copy')));
});

// ---------- Photo tilt ----------
const photoWrap = document.getElementById('photoWrap');
if (photoWrap) {
  photoWrap.addEventListener('mousemove', (e) => {
    const rect = photoWrap.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const rotX = (y * -8).toFixed(2);
    const rotY = (x * 10).toFixed(2);
    photoWrap.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.01)`;
  });
  photoWrap.addEventListener('mouseleave', ()=> { photoWrap.style.transform = ''; });
}

// ---------- Dark / Light theme toggle ----------
const themeToggle = document.getElementById('themeToggle');
const root = document.documentElement;

function applyTheme(t){
  root.setAttribute('data-theme', t);
  const isDark = t === 'dark';
  themeToggle.textContent = isDark ? '🌙' : '☀️';
  themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
  localStorage.setItem('preferred-theme', t);
}

// initialize theme (prefer saved, then system)
(function initTheme(){
  const saved = localStorage.getItem('preferred-theme');
  if (saved) return applyTheme(saved);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(prefersDark ? 'dark' : 'light');
})();

themeToggle?.addEventListener('click', () => {
  const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

// keyboard accessibility: show focus outlines when tabbing
document.body.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') document.documentElement.classList.add('user-is-tabbing');
});