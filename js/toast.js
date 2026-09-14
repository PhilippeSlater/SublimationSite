/*
  Petit message temporaire en bas de l'écran, utilisé pour rappeler au
  client de joindre ses images enregistrées à son courriel de commande.
*/

const Toast = (function () {
  let el, timer;

  function init() {
    el = document.getElementById("save-toast");
  }

  function show(message, duration = 4000) {
    if (!el) return;
    el.textContent = message;
    el.classList.add("visible");
    clearTimeout(timer);
    timer = setTimeout(() => el.classList.remove("visible"), duration);
  }

  return { init, show };
})();
