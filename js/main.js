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
