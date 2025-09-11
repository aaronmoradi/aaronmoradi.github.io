// tiny UX helpers
document.getElementById('year').textContent = new Date().getFullYear();

// reveal on scroll
const observer = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) e.target.classList.add('visible');
  }
}, {threshold: 0.12});
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// project filtering
const grid = document.getElementById('projects-grid');
const buttons = document.querySelectorAll('.filters button');
buttons.forEach(btn => btn.addEventListener('click', () => {
  buttons.forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const filter = btn.dataset.filter;
  document.querySelectorAll('.projects-grid .card').forEach(card => {
    const tags = card.dataset.tags.split(' ');
    if (filter === '*' || tags.includes(filter)) card.style.display = '';
    else card.style.display = 'none';
  });
}));

// skill bars (use data-level to set width visually)
document.querySelectorAll('.skill-bar').forEach(sb => {
  const level = +sb.dataset.level || 0;
  sb.style.background = `linear-gradient(90deg,var(--accent) ${level}%, #e6eefc ${level}%)`;
});

const button = document.getElementById('lakersBtn');
const confettiContainer = document.getElementById('confetti-container');

button.addEventListener('click', () => {
  for (let i = 0; i < 100; i++) { // number of confetti pieces
    createConfetti();
  }
});

function createConfetti() {
  const confetti = document.createElement('div');
  confetti.classList.add('confetti');

  // Randomly make it purple or yellow
  confetti.classList.add(Math.random() > 0.5 ? 'confetti-purple' : 'confetti-yellow');

  // Random starting position
  confetti.style.left = Math.random() * window.innerWidth + 'px';
  confetti.style.animationDuration = 2 + Math.random() * 3 + 's'; // 2-5 seconds
  confetti.style.width = 5 + Math.random() * 10 + 'px';
  confetti.style.height = 5 + Math.random() * 10 + 'px';

  confettiContainer.appendChild(confetti);

  // Remove confetti after animation
  confetti.addEventListener('animationend', () => {
    confetti.remove();
  });
}