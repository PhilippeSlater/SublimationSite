/*
  "Ma commande" : liste (en localStorage, donc gardée si le client revient
  sur le site) des articles que le client veut commander. Le site n'a pas de
  paiement ni de vrai panier — ce module sert juste à préparer un courriel
  pré-rempli avec le détail de la commande.

  IMPORTANT : un navigateur ne peut pas joindre des fichiers à un courriel
  automatiquement (restriction de sécurité) — le client doit joindre
  lui-même les images qu'il a enregistrées avec les boutons "Enregistrer".
  Le courriel pré-rempli le lui rappelle.
*/

const Cart = (function () {
  const STORAGE_KEY = "sublimation-cart";

  // TODO: remplace par ta vraie adresse courriel avant de mettre le site en ligne.
  const ORDER_EMAIL = "sublimation.pslater@gmail.com";

  let toggleBtn, panelEl, closeBtn, listEl, countEl, sendBtn, clearBtn;

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function save(items) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (e) {}
  }

  function addItem(item) {
    const items = load();
    items.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, ...item });
    save(items);
    render();
    panelEl.classList.add("open");
  }

  function removeItem(id) {
    save(load().filter((i) => i.id !== id));
    render();
  }

  function clear() {
    save([]);
    render();
  }

  function init() {
    toggleBtn = document.getElementById("cart-toggle");
    panelEl = document.getElementById("cart-panel");
    closeBtn = document.getElementById("cart-close");
    listEl = document.getElementById("cart-list");
    countEl = document.getElementById("cart-count");
    sendBtn = document.getElementById("cart-send");
    clearBtn = document.getElementById("cart-clear");

    toggleBtn.addEventListener("click", () => panelEl.classList.toggle("open"));
    closeBtn.addEventListener("click", () => panelEl.classList.remove("open"));
    sendBtn.addEventListener("click", sendOrder);
    clearBtn.addEventListener("click", () => {
      if (confirm("Vider complètement ta commande ?")) clear();
    });

    render();
  }

  function render() {
    const items = load();
    countEl.textContent = items.length;

    listEl.innerHTML = items.length
      ? items.map((i) => `
        <li class="cart-item">
          <div class="cart-item-info">
            <strong>${i.name}</strong>
            ${i.details ? `<div class="cart-item-details">${i.details}</div>` : ""}
            <div class="cart-item-price">${i.price != null ? i.price.toFixed(2) + " $" : "Prix sur demande"}</div>
          </div>
          <button type="button" class="cart-remove" data-id="${i.id}" aria-label="Retirer">&times;</button>
        </li>
      `).join("")
      : `<li class="cart-empty">Ta commande est vide pour l'instant.</li>`;

    listEl.querySelectorAll(".cart-remove").forEach((btn) => {
      btn.addEventListener("click", () => removeItem(btn.dataset.id));
    });
  }

  function sendOrder() {
    const items = load();
    if (!items.length) return;

    const ok = confirm(
      "As-tu bien enregistré une image pour chaque item de ta commande " +
      "(bouton \"Enregistrer\") ?\n\n" +
      "Tu devras joindre ces images TOI-MÊME dans le courriel qui va " +
      "s'ouvrir — un site web ne peut pas les joindre automatiquement.\n\n" +
      "Clique OK une fois tes images prêtes, sinon Annuler pour aller les enregistrer d'abord."
    );
    if (!ok) return;

    const lines = items.map((item, idx) => {
      const price = item.price != null ? `${item.price.toFixed(2)} $` : "Prix sur demande";
      const details = item.details ? ` (${item.details})` : "";
      return `${idx + 1}. ${item.name}${details} — ${price}`;
    });

    const body = [
      "Bonjour, voici ma commande :",
      "",
      ...lines,
      "",
      "N'oublie pas de joindre une image par item ci-dessus à ce courriel avant de l'envoyer !",
      "",
    ].join("\n");

    const subject = `Commande Sublimation Babyfoot Québec (${items.length} item${items.length > 1 ? "s" : ""})`;
    const url = `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  }

  return { init, addItem };
})();
