/*
  Personnalisation : superpose un "tag" (image, optionnel) ET un "logo"
  (image, optionnel) sur le design du produit (wrap fixe, background choisi
  ou image televersee), avec le nom du client ecrit par-dessus dans la
  police choisie. Rendu en direct sur un <canvas>.

  Le tag et le logo sont DEUX elements graphiques distincts, independants
  l'un de l'autre - le client peut activer l'un, l'autre, les deux ou aucun
  des deux, chacun avec sa propre position et sa propre taille.

  Tout est independant :
  - Position verticale du tag / du logo : curseur 0-100% chacun, couvre
    toute la hauteur du canvas (0 = tout en haut, 100 = tout en bas, l'image
    peut depasser du cadre). N'affecte pas le texte ni l'autre image.
  - Largeur/hauteur du tag / du logo : deux curseurs separes chacun. Avec
    "Conserver les proportions" coche, changer l'un ajuste l'autre pour
    garder le ratio naturel de l'image ; decoche, chaque dimension est
    libre (etirement).
  - Position verticale du texte : meme principe, curseur separe.
  - Taille du texte : basee sur un pourcentage fixe de la hauteur du canvas
    (pas de la hauteur du tag/logo), donc identique quel que soit le choix.
  - Couleur du texte : modifiable librement, ne se reinitialise pas quand on
    change de tag ou de logo.
  - Le tag et le logo sont optionnels ("Aucun tag" / "Aucun logo").

  Ordre de dessin sur le canvas : wrap, puis tag, puis logo, puis texte.

  Le champ "Modele de telephone" et la case "Je voudrais MagSafe si possible"
  (etuis uniquement, geres par js/main.js, hors de ce module) sont purement
  informatifs - setPhoneModel(valeur) et setMagsafeRequested(bool) ajoutent
  simplement une ligne aux details envoyes au panier, sans effet sur le prix
  ni le visuel (la disponibilite et le prix MagSafe sont valides
  manuellement par courriel).
*/

const Customize = (function () {
  let panel, toggle, fields, textInput, tagButtons, logoButtons, fontButtons;
  let colorInput, tagYSlider, tagWSlider, tagHSlider, tagLockCheckbox;
  let logoYSlider, logoWSlider, logoHSlider, logoLockCheckbox;
  let textYSlider, fontSizeSlider, canvas, ctx, downloadBtn, addCartBtn, addCartHint, priceDisplay;
  let wrapImg = null;
  let currentTag = null;   // null = "Aucun tag"
  let currentLogo = null;  // null = "Aucun logo"
  let currentFont = FONTS[0];
  let loadedWrapUrl = null;
  let currentProductName = "produit";
  let currentProductPrice = null;
  let canvasH = 900;    // recalcule a partir du wrap a chaque produit
  let tagAspect = 1;    // hauteur/largeur naturelle du tag choisi
  let logoAspect = 1;   // hauteur/largeur naturelle du logo choisi
  let savedForCurrentState = true; // false des qu'un changement rend l'image enregistree obsolete
  let phoneModel = ""; // modele de telephone (etuis), fixe par main.js via setPhoneModel() - informatif seulement
  let magsafeRequested = false; // case "je voudrais MagSafe si possible", fixe par main.js - informatif seulement
  let mugSize = ""; // grosseur de tasse (11oz/15oz), fixe par main.js via setMugSize() - informatif seulement

  const CANVAS_W = 900;
  const BASE_FONT_PCT = 0.09;  // taille de texte "100%" = 9% de la hauteur du canvas
  const MAX_TEXT_WIDTH_PCT = 0.8; // largeur max du texte par rapport au canvas, avant reduction de secours
  const DEFAULT_COLOR = "#14336b";
  const PERSONALIZATION_SURCHARGE = 0; // supplement quand le client personnalise (texte, tag ou logo)

  function init(root) {
    panel = root;
    toggle = root.querySelector("#customize-toggle");
    fields = root.querySelector("#customize-fields");
    textInput = root.querySelector("#customize-text");
    tagButtons = root.querySelector("#customize-tags");
    logoButtons = root.querySelector("#customize-logos");
    fontButtons = root.querySelector("#customize-fonts");
    colorInput = root.querySelector("#customize-color");
    tagYSlider = root.querySelector("#customize-tag-y");
    tagWSlider = root.querySelector("#customize-tag-w");
    tagHSlider = root.querySelector("#customize-tag-h");
    tagLockCheckbox = root.querySelector("#customize-tag-lock");
    logoYSlider = root.querySelector("#customize-logo-y");
    logoWSlider = root.querySelector("#customize-logo-w");
    logoHSlider = root.querySelector("#customize-logo-h");
    logoLockCheckbox = root.querySelector("#customize-logo-lock");
    textYSlider = root.querySelector("#customize-text-y");
    fontSizeSlider = root.querySelector("#customize-font-size");
    canvas = root.querySelector("#customize-canvas");
    ctx = canvas.getContext("2d");
    downloadBtn = root.querySelector("#customize-download");
    addCartBtn = root.querySelector("#customize-add-cart");
    addCartHint = root.querySelector("#customize-add-cart-hint");
    priceDisplay = root.querySelector("#customize-price-display");

    const surchargeNote = root.querySelector("#customize-surcharge-note");
    if (surchargeNote) surchargeNote.textContent = PERSONALIZATION_SURCHARGE > 0 ? `(+${PERSONALIZATION_SURCHARGE.toFixed(2)} $)` : "";

    const noneTagBtn = `<button type="button" class="tag-choice tag-choice-none active" data-id="">Aucun tag</button>`;
    tagButtons.innerHTML = noneTagBtn + TAGS.map((t) => `
      <button type="button" class="tag-choice" data-id="${t.id}">
        <img src="${t.image}" alt="${t.name}">
      </button>
    `).join("");

    const noneLogoBtn = `<button type="button" class="logo-choice logo-choice-none active" data-id="">Aucun logo</button>`;
    logoButtons.innerHTML = noneLogoBtn + LOGOS.map((l) => `
      <button type="button" class="logo-choice" data-id="${l.id}">
        <img src="${l.image}" alt="${l.name}">
      </button>
    `).join("");

    fontButtons.innerHTML = FONTS.map((f, i) => `
      <button type="button" class="font-choice${i === 0 ? " active" : ""}" data-id="${f.id}"
              style="font-family:${f.family}; font-weight:${f.weight}">
        ${f.label}
      </button>
    `).join("");

    toggle.addEventListener("change", () => {
      fields.hidden = !toggle.checked;
      if (toggle.checked) render();
    });

    textInput.addEventListener("input", render);
    colorInput.addEventListener("input", render);
    tagYSlider.addEventListener("input", render);
    logoYSlider.addEventListener("input", render);
    textYSlider.addEventListener("input", render);
    fontSizeSlider.addEventListener("input", render);

    tagWSlider.addEventListener("input", () => {
      if (tagLockCheckbox.checked && currentTag) {
        const wPx = (parseFloat(tagWSlider.value) / 100) * CANVAS_W;
        const hPx = wPx * tagAspect;
        tagHSlider.value = clampPct((hPx / canvasH) * 100);
      }
      render();
    });

    tagHSlider.addEventListener("input", () => {
      if (tagLockCheckbox.checked && currentTag) {
        const hPx = (parseFloat(tagHSlider.value) / 100) * canvasH;
        const wPx = hPx / tagAspect;
        tagWSlider.value = clampPct((wPx / CANVAS_W) * 100);
      }
      render();
    });

    tagLockCheckbox.addEventListener("change", () => {
      if (tagLockCheckbox.checked && currentTag) {
        const wPx = (parseFloat(tagWSlider.value) / 100) * CANVAS_W;
        const hPx = wPx * tagAspect;
        tagHSlider.value = clampPct((hPx / canvasH) * 100);
        render();
      }
    });

    logoWSlider.addEventListener("input", () => {
      if (logoLockCheckbox.checked && currentLogo) {
        const wPx = (parseFloat(logoWSlider.value) / 100) * CANVAS_W;
        const hPx = wPx * logoAspect;
        logoHSlider.value = clampPct((hPx / canvasH) * 100);
      }
      render();
    });

    logoHSlider.addEventListener("input", () => {
      if (logoLockCheckbox.checked && currentLogo) {
        const hPx = (parseFloat(logoHSlider.value) / 100) * canvasH;
        const wPx = hPx / logoAspect;
        logoWSlider.value = clampPct((wPx / CANVAS_W) * 100);
      }
      render();
    });

    logoLockCheckbox.addEventListener("change", () => {
      if (logoLockCheckbox.checked && currentLogo) {
        const wPx = (parseFloat(logoWSlider.value) / 100) * CANVAS_W;
        const hPx = wPx * logoAspect;
        logoHSlider.value = clampPct((hPx / canvasH) * 100);
        render();
      }
    });

    tagButtons.addEventListener("click", async (e) => {
      const btn = e.target.closest(".tag-choice");
      if (!btn) return;
      tagButtons.querySelectorAll(".tag-choice").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentTag = TAGS.find((t) => t.id === btn.dataset.id) || null;

      if (currentTag) {
        const img = await loadImage(currentTag.image);
        tagAspect = img ? img.height / img.width : 1;
        tagLockCheckbox.checked = true;
        tagWSlider.value = 50;
        tagHSlider.value = clampPct(((CANVAS_W * 0.5 * tagAspect) / canvasH) * 100);
      }

      render();
    });

    logoButtons.addEventListener("click", async (e) => {
      const btn = e.target.closest(".logo-choice");
      if (!btn) return;
      logoButtons.querySelectorAll(".logo-choice").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentLogo = LOGOS.find((l) => l.id === btn.dataset.id) || null;

      if (currentLogo) {
        const img = await loadImage(currentLogo.image);
        logoAspect = img ? img.height / img.width : 1;
        logoLockCheckbox.checked = true;
        logoWSlider.value = 50;
        logoHSlider.value = clampPct(((CANVAS_W * 0.5 * logoAspect) / canvasH) * 100);
      }

      render();
    });

    fontButtons.addEventListener("click", (e) => {
      const btn = e.target.closest(".font-choice");
      if (!btn) return;
      fontButtons.querySelectorAll(".font-choice").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFont = FONTS.find((f) => f.id === btn.dataset.id);
      render();
    });

    downloadBtn.addEventListener("click", () => {
      const text = textInput.value.trim();
      const slug = (currentProductName + (text ? "-" + text : ""))
        .toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      const link = document.createElement("a");
      link.download = `${slug || "produit"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      Toast.show("Image enregistrée ! N'oublie pas de la joindre à ton courriel de commande.");
      savedForCurrentState = true;
      updateAddCartState();
    });

    addCartBtn.addEventListener("click", () => {
      const text = textInput.value.trim();
      const { price, hasCustomization } = computePrice();
      const details = [
        `Tag: ${currentTag ? currentTag.name : "Aucun"}`,
        ...(currentTag ? [
          `Tag - position verticale: ${tagYSlider.value}%`,
          `Tag - largeur: ${tagWSlider.value}%`,
          `Tag - hauteur: ${tagHSlider.value}%`,
        ] : []),
        `Logo: ${currentLogo ? currentLogo.name : "Aucun"}`,
        ...(currentLogo ? [
          `Logo - position verticale: ${logoYSlider.value}%`,
          `Logo - largeur: ${logoWSlider.value}%`,
          `Logo - hauteur: ${logoHSlider.value}%`,
        ] : []),
        `Texte: ${text || "(aucun)"}`,
        ...(text ? [
          `Texte - police: ${currentFont.label}`,
          `Texte - couleur: ${colorInput.value}`,
          `Texte - position verticale: ${textYSlider.value}%`,
          `Texte - taille: ${fontSizeSlider.value}%`,
        ] : []),
        ...(hasCustomization && PERSONALIZATION_SURCHARGE > 0 ? [`+${PERSONALIZATION_SURCHARGE.toFixed(2)} $ personnalisation`] : []),
        ...(phoneModel ? [`Modèle de téléphone: ${phoneModel}`] : []),
        ...(magsafeRequested ? ["Option MagSafe demandée (+5 $, à confirmer)"] : []),
        ...(mugSize ? [`Grosseur de tasse: ${mugSize}`] : []),
      ].join(", ");
      Cart.addItem({ name: currentProductName, price, details });
    });
  }

  function clampPct(v) {
    return Math.min(200, Math.max(10, v));
  }

  function updateAddCartState() {
    const hasCustomization = !!textInput.value.trim() || !!currentTag || !!currentLogo;
    const mustSaveFirst = hasCustomization && !savedForCurrentState;
    addCartBtn.disabled = mustSaveFirst;
    addCartHint.hidden = !mustSaveFirst;
  }

  function computePrice() {
    const hasCustomization = !!textInput.value.trim() || !!currentTag || !!currentLogo;
    const base = currentProductPrice;
    const price = base != null && hasCustomization ? base + PERSONALIZATION_SURCHARGE : base;
    return { price, hasCustomization };
  }

  function updatePriceDisplay() {
    const { price, hasCustomization } = computePrice();
    if (price == null) {
      priceDisplay.textContent = "Prix sur demande / Price on request";
      return;
    }
    priceDisplay.textContent = hasCustomization && PERSONALIZATION_SURCHARGE > 0
      ? `Prix : ${price.toFixed(2)} $ (design de base + ${PERSONALIZATION_SURCHARGE.toFixed(2)} $ pour la personnalisation)`
      : `Prix : ${price.toFixed(2)} $`;
  }

  function loadImage(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  function setPhoneModel(value) {
    phoneModel = value || "";
  }

  function setMagsafeRequested(value) {
    magsafeRequested = !!value;
  }

  function setMugSize(value) {
    mugSize = value || "";
  }

  async function setProduct(product) {
    const hasWrap = !!product.wrap;
    panel.hidden = !hasWrap;
    if (!hasWrap) return;

    currentProductName = product.name;
    currentProductPrice = product.price;
    currentTag = null;
    currentLogo = null;
    currentFont = FONTS[0];
    tagButtons.querySelectorAll(".tag-choice").forEach((b) => b.classList.toggle("active", !b.dataset.id));
    logoButtons.querySelectorAll(".logo-choice").forEach((b) => b.classList.toggle("active", !b.dataset.id));
    fontButtons.querySelectorAll(".font-choice").forEach((b, i) => b.classList.toggle("active", i === 0));

    toggle.checked = false;
    fields.hidden = true;
    textInput.value = "";
    colorInput.value = DEFAULT_COLOR;
    tagYSlider.value = 50;
    tagWSlider.value = 50;
    tagHSlider.value = 50;
    tagLockCheckbox.checked = true;
    logoYSlider.value = 50;
    logoWSlider.value = 50;
    logoHSlider.value = 50;
    logoLockCheckbox.checked = true;
    textYSlider.value = 50;
    fontSizeSlider.value = 100;
    savedForCurrentState = true;
    updateAddCartState();
    updatePriceDisplay();

    if (loadedWrapUrl !== product.wrap) {
      wrapImg = await loadImage(product.wrap);
      loadedWrapUrl = product.wrap;
      canvasH = Math.round((wrapImg.height / wrapImg.width) * CANVAS_W) || 900;
    }

    render();
  }

  async function render() {
    if (!wrapImg) return;

    savedForCurrentState = false;
    updateAddCartState();
    updatePriceDisplay();

    const W = CANVAS_W;
    const H = canvasH;
    canvas.width = W;
    canvas.height = H;

    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(wrapImg, 0, 0, W, H);

    if (currentTag) {
      const tagImg = await loadImage(currentTag.image);
      if (tagImg) {
        const tagW = (parseFloat(tagWSlider.value) / 100) * W;
        const tagH = (parseFloat(tagHSlider.value) / 100) * H;
        const tagX = (W - tagW) / 2;
        const tagCenterY = (parseFloat(tagYSlider.value) / 100) * H;
        const tagY = tagCenterY - tagH / 2;
        ctx.drawImage(tagImg, tagX, tagY, tagW, tagH);
      }
    }

    if (currentLogo) {
      const logoImg = await loadImage(currentLogo.image);
      if (logoImg) {
        const logoW = (parseFloat(logoWSlider.value) / 100) * W;
        const logoH = (parseFloat(logoHSlider.value) / 100) * H;
        const logoX = (W - logoW) / 2;
        const logoCenterY = (parseFloat(logoYSlider.value) / 100) * H;
        const logoY = logoCenterY - logoH / 2;
        ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);
      }
    }

    const text = textInput.value.trim();
    if (!text) return;

    if (document.fonts && document.fonts.load) {
      try { await document.fonts.load(`700 40px ${currentFont.family}`); } catch (e) {}
    }

    const textX = W / 2;
    const textY = (parseFloat(textYSlider.value) / 100) * H;
    const scale = parseFloat(fontSizeSlider.value) / 100;
    let fontSize = H * BASE_FONT_PCT * scale;
    const maxWidth = W * MAX_TEXT_WIDTH_PCT;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = colorInput.value || DEFAULT_COLOR;

    // Filet de sécurité : si le texte déborde quand même du canvas (nom très
    // long + grande taille), on réduit juste ce qu'il faut pour rentrer.
    ctx.font = `${currentFont.weight} ${fontSize}px ${currentFont.family}`;
    while (ctx.measureText(text).width > maxWidth && fontSize > 8) {
      fontSize -= 2;
      ctx.font = `${currentFont.weight} ${fontSize}px ${currentFont.family}`;
    }

    ctx.fillText(text, textX, textY);
  }

  return { init, setProduct, setPhoneModel, setMagsafeRequested, setMugSize };
})();
