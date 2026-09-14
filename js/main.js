const CATEGORY_LABELS = {
  tumbler: "tumbler",
  tasse: "tasse",
  etui: "étui téléphone"
};

function productCardHtml(p) {
  return `
    <div class="product-card">
      <img src="${p.photos[0]}" alt="${p.name}" loading="lazy">
      <div class="info">
        <h3>${p.name}</h3>
        <div class="price">${p.price != null ? p.price.toFixed(2) + " $" : "Prix sur demande"}</div>
        <button class="view-360" data-id="${p.id}">Voir les photos</button>
      </div>
    </div>
  `;
}

function customCardHtml(p) {
  return `
    <div class="product-card custom-card">
      <div class="custom-card-visual">📤<br>Ton design</div>
      <div class="info">
        <h3>${p.name}</h3>
        <div class="price">à partir de ${p.price.toFixed(2)} $</div>
        <button class="view-360" data-id="${p.id}">Personnaliser</button>
      </div>
    </div>
  `;
}

const CATEGORY_NOTICES = {
  etui: `
    <div class="category-notice">
      <p>⚠️ Nos étuis ne sont <strong>PAS compatibles MagSafe</strong> par défaut — pas de recharge sans fil. Une version MagSafe est possible pour certains modèles de téléphone, pour 25 $ au lieu de 20 $ : indique ton modèle sur le produit, on te confirme par courriel.</p>
      <p class="notice-en">⚠️ Our phone cases are <strong>NOT MagSafe compatible</strong> by default — no wireless charging. A MagSafe version is possible for some phone models, for $25 instead of $20: tell us your model on the product page, we'll confirm by email.</p>
    </div>
  `
};

function renderSections() {
  Object.keys(CATEGORY_LABELS).forEach((cat) => {
    const section = document.getElementById(`section-${cat}`);
    const items = PRODUCTS.filter((p) => p.category === cat);
    const customItem = CUSTOM_PRODUCTS.find((p) => p.category === cat);
    const notice = CATEGORY_NOTICES[cat] || "";

    if (items.length === 0 && !customItem) {
      section.innerHTML = notice + `<p class="empty-msg">Aucun modèle de ${CATEGORY_LABELS[cat]} pour l'instant. Reviens bientôt !</p>`;
      return;
    }

    section.innerHTML = notice + items.map(productCardHtml).join("") + (customItem ? customCardHtml(customItem) : "");
  });
}

function setupTabs() {
  const buttons = document.querySelectorAll(".tab-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      document.querySelectorAll(".product-section").forEach((s) => s.classList.remove("active"));
      document.getElementById(`section-${btn.dataset.category}`).classList.add("active");
    });
  });
}

function setupModal() {
  const modal = document.getElementById("viewer-modal");
  const closeBtn = document.getElementById("modal-close");
  const title = document.getElementById("modal-title");
  const stage = document.getElementById("viewer-stage");
  const frameImg = document.getElementById("viewer-frame");
  const prevBtn = document.getElementById("gallery-prev");
  const nextBtn = document.getElementById("gallery-next");
  const dotsEl = document.getElementById("gallery-dots");
  const downloadLink = document.getElementById("gallery-download");
  const addCartBtn = document.getElementById("gallery-add-cart");
  const customizePanel = document.getElementById("customize-panel");
  const modalHint = document.querySelector(".modal-hint");
  const customUpload = document.getElementById("custom-upload");
  const customFileInput = document.getElementById("custom-file-input");
  const customBackgroundsBlock = document.getElementById("custom-backgrounds-block");
  const customBackgrounds = document.getElementById("custom-backgrounds");
  const phoneModelBlock = document.getElementById("phone-model-block");
  const phoneModelInput = document.getElementById("phone-model-input");
  const magsafeRequestToggle = document.getElementById("magsafe-request-toggle");

  Gallery.init(stage, frameImg, prevBtn, nextBtn, dotsEl, downloadLink);
  Customize.init(customizePanel);

  let currentProduct = null;

  function resetPhoneModel(product) {
    phoneModelInput.value = "";
    magsafeRequestToggle.checked = false;
    phoneModelBlock.hidden = product.category !== "etui";
    Customize.setPhoneModel("");
    Customize.setMagsafeRequested(false);
  }

  function openRegularProduct(product) {
    customUpload.hidden = true;
    stage.hidden = false;
    dotsEl.hidden = false;
    modalHint.hidden = false;
    downloadLink.hidden = false;
    addCartBtn.hidden = false;
    resetPhoneModel(product);
    Gallery.show(product);
    Customize.setProduct(product);
  }

  function openCustomProduct(product) {
    stage.hidden = true;
    dotsEl.hidden = true;
    modalHint.hidden = true;
    downloadLink.hidden = true;
    addCartBtn.hidden = true;
    customizePanel.hidden = true;
    customFileInput.value = "";
    customUpload.hidden = false;
    resetPhoneModel(product);

    const backgrounds = (BACKGROUNDS && BACKGROUNDS[product.category]) || [];
    customBackgroundsBlock.hidden = backgrounds.length === 0;
    customBackgrounds.innerHTML = backgrounds.map((bg) => `
      <button type="button" class="bg-choice" data-image="${bg.image}">
        <img src="${bg.image}" alt="${bg.name}">
      </button>
    `).join("");
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".view-360");
    if (!btn) return;
    const product = PRODUCTS.find((p) => p.id === btn.dataset.id) || CUSTOM_PRODUCTS.find((p) => p.id === btn.dataset.id);
    if (!product) return;

    currentProduct = product;
    title.textContent = product.name;
    modal.classList.remove("hidden");

    if (product.isCustom) openCustomProduct(product);
    else openRegularProduct(product);
  });

  customFileInput.addEventListener("change", () => {
    const file = customFileInput.files[0];
    if (!file || !currentProduct) return;
    const reader = new FileReader();
    reader.onload = () => {
      Customize.setProduct({ ...currentProduct, wrap: reader.result });
    };
    reader.readAsDataURL(file);
  });

  customBackgrounds.addEventListener("click", (e) => {
    const btn = e.target.closest(".bg-choice");
    if (!btn || !currentProduct) return;
    customBackgrounds.querySelectorAll(".bg-choice").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    customFileInput.value = "";
    Customize.setProduct({ ...currentProduct, wrap: btn.dataset.image });
  });

  phoneModelInput.addEventListener("input", () => {
    Customize.setPhoneModel(phoneModelInput.value.trim());
  });

  magsafeRequestToggle.addEventListener("change", () => {
    Customize.setMagsafeRequested(magsafeRequestToggle.checked);
  });

  addCartBtn.addEventListener("click", () => {
    if (!currentProduct) return;
    const phoneModel = phoneModelInput.value.trim();
    const details = [
      ...(phoneModel ? [`Modèle de téléphone: ${phoneModel}`] : []),
      ...(magsafeRequestToggle.checked ? ["Option MagSafe demandée (+5 $, à confirmer)"] : []),
    ].join(", ") || null;
    Cart.addItem({ name: currentProduct.name, price: currentProduct.price, details });
  });

  function close() {
    modal.classList.add("hidden");
  }

  closeBtn.addEventListener("click", close);
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
}

renderSections();
setupTabs();
setupModal();
Cart.init();
Toast.init();
