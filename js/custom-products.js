/*
  Section "Créez votre..." par catégorie : le client part soit d'un
  background proposé (voir BACKGROUNDS dans js/customization-data.js), soit
  de SON PROPRE visuel (choisi depuis son appareil, jamais envoyé nulle
  part — seulement affiché dans son navigateur), puis le personnalise
  (nom/logo/police) comme n'importe quel autre produit.

  Ajuste le prix de base de chaque catégorie ci-dessous selon ce que tu
  factures pour un produit vierge personnalisé par le client.
*/

const CUSTOM_PRODUCTS = [
  { id: "custom-tumbler", category: "tumbler", name: "Créez votre tumbler", price: 30.00, isCustom: true },
  { id: "custom-tasse", category: "tasse", name: "Créez votre tasse", price: 18.50, isCustom: true },
  { id: "custom-etui", category: "etui", name: "Créez votre étui", price: 20.00, isCustom: true }
];
