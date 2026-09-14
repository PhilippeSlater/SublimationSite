/*
  Galerie de photos fixes (pas de rotation) : affiche product.photos une par
  une, avec des flèches précédent/suivant. Le premier élément peut être le
  design plat seul (wrap.*), ajouté tel quel par generate-catalog.ps1.
*/

const Gallery = (function () {
  let stageEl, imgEl, prevBtn, nextBtn, dotsEl, downloadLink;
  let photos = [];
  let currentIndex = 0;
  let zoomed = false;
  let productSlug = "produit";

  const ZOOM_SCALE = 2.4;

  function init(stage, img, prev, next, dots, download) {
    stageEl = stage;
    imgEl = img;
    prevBtn = prev;
    nextBtn = next;
    dotsEl = dots;
    downloadLink = download;

    prevBtn.addEventListener("click", () => step(-1));
    nextBtn.addEventListener("click", () => step(1));
    document.addEventListener("keydown", (e) => {
      if (stageEl.closest(".modal").classList.contains("hidden")) return;
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "Escape" && zoomed) setZoom(false);
    });

    imgEl.addEventListener("click", (e) => {
      if (!zoomed) {
        setZoomOrigin(e);
        setZoom(true);
      } else {
        setZoom(false);
      }
    });
    imgEl.addEventListener("pointermove", (e) => {
      if (zoomed) setZoomOrigin(e);
    });

    downloadLink.addEventListener("click", () => {
      Toast.show("Photo enregistrée ! N'oublie pas de la joindre à ton courriel de commande.");
    });
  }

  function setZoomOrigin(e) {
    const rect = imgEl.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    imgEl.style.transformOrigin = `${Math.max(0, Math.min(100, x))}% ${Math.max(0, Math.min(100, y))}%`;
  }

  function setZoom(on) {
    zoomed = on;
    imgEl.classList.toggle("zoomed", zoomed);
    imgEl.style.transform = zoomed ? `scale(${ZOOM_SCALE})` : "";
  }

  function step(delta) {
    if (photos.length < 2) return;
    currentIndex = (currentIndex + delta + photos.length) % photos.length;
    render();
  }

  function render() {
    setZoom(false);
    imgEl.src = photos[currentIndex];

    const multi = photos.length > 1;
    prevBtn.hidden = !multi;
    nextBtn.hidden = !multi;

    dotsEl.innerHTML = multi
      ? photos.map((_, i) => `<span class="dot${i === currentIndex ? " active" : ""}"></span>`).join("")
      : "";

    downloadLink.href = photos[currentIndex];
    const suffix = photos.length > 1 ? `-${currentIndex + 1}` : "";
    downloadLink.download = `${productSlug}${suffix}.png`;
  }

  function show(product) {
    photos = product.photos && product.photos.length ? product.photos : [];
    currentIndex = 0;
    productSlug = (product.name || "produit")
      .toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "produit";
    if (photos.length) render();
    else imgEl.removeAttribute("src");
  }

  return { init, show };
})();
