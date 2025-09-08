/* // tiny UX nicety: current year
document.getElementById('year').textContent = new Date().getFullYear(); */

window.onbeforeunload = function () {
    window.scrollTo(0, 0);
  };  