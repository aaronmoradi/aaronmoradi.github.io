/* // tiny UX nicety: current year
document.getElementById('year').textContent = new Date().getFullYear(); */

if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

window.addEventListener('load', function() {
    setTimeout(() => {
        window.scrollTo(top); // negative values aren't needed
    }, 0);
});