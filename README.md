# Sublimation Babyfoot Québec

Site web statique pour présenter tes produits de sublimation : **Tumbler**,
**Tasse**, **Étui téléphone**. Chaque produit a un bouton "Voir les photos"
qui ouvre une galerie de tes photos, telles que tu les as prises.

## Ouvrir le site

**Double-clique sur `scripts/voir-le-site.bat`** pour prévisualiser en local.
Il lance un petit serveur local et ouvre le site dans ton navigateur sur
`http://localhost:8080`.

⚠️ N'ouvre pas `index.html` directement en double-clic (`file://`) : Chrome
bloque certaines opérations sur les images locales dans ce mode, et le site
ne s'affichera pas correctement. `voir-le-site.bat` évite ce problème.

Une fois déployé sur un vrai hébergeur (Netlify, GitHub Pages, Render, etc.),
le site est servi en `https://` normalement — ce problème ne se pose plus du
tout.

## Mettre le site en ligne gratuitement (Render)

Render offre un hébergement gratuit pour les sites statiques, mais il faut
passer par un dépôt Git (pas de glisser-déposer direct comme Netlify Drop).

1. **Mets le projet sur GitHub** (si ce n'est pas déjà fait) :
   ```
   git init
   git add .
   git commit -m "Premier envoi du site"
   ```
   Crée ensuite un dépôt sur [github.com/new](https://github.com/new) et
   suis les instructions de GitHub pour y pousser ce dossier (`git remote
   add origin ...` puis `git push`).

2. Sur [render.com](https://render.com), crée un compte, puis **New +** →
   **Static Site**, et connecte le dépôt GitHub que tu viens de créer.

3. Paramètres de déploiement :
   - **Build Command** : laisse vide (aucune compilation nécessaire).
   - **Publish Directory** : `.` (la racine du dépôt, là où se trouve
     `index.html`).

4. Clique **Create Static Site**. Render te donne une URL en
   `https://ton-site.onrender.com` — c'est ton site, en ligne et gratuit.

## Ajouter un nouveau modèle (section "Template")

Un modèle "template" est un produit prêt, avec un nom et un prix fixes que
le client ne peut pas modifier — il l'ajoute tel quel à sa commande, ou le
personnalise (nom, logo, police) par-dessus le wrap.

1. **Prends quelques photos** du produit fini (un ou plusieurs angles — pas
   besoin d'une rotation complète), et dépose-les telles quelles, sans
   retouche : aucun traitement n'est fait par le site.

2. Crée un dossier pour ce produit, dans la bonne catégorie :

   ```
   templates/tumbler/NomDuModele_Prix/photos/
   templates/tasse/NomDuModele_Prix/photos/
   templates/etui/NomDuModele_Prix/photos/
   ```

   Exemple : `templates/tumbler/Vagues-Bleues_24.99/photos/` — mets tes
   photos directement dans ce dossier `photos/`.

   Sans prix dans le nom du dossier (`NomDuModele` seulement), le site
   affiche "Prix sur demande".

3. **(Optionnel)** Pour permettre au client de personnaliser ce produit
   (nom, logo, police par-dessus le design plat), ajoute un fichier à côté
   de `photos/` :

   ```
   templates/tumbler/NomDuModele_Prix/wrap.png
   ```

   (`.jpg`, `.jpeg` et `.webp` fonctionnent aussi.) Cette image est ajoutée
   telle quelle en première photo de la galerie, et sert de base à la
   personnalisation si le client l'active.

4. Double-clique sur `scripts/build.bat` pour régénérer `js/products-data.js`
   à partir de tous les produits présents dans `templates/`.

5. Ouvre le site via `scripts/voir-le-site.bat` — le nouveau produit apparaît
   avec sa galerie de photos.

Astuce : relancer `build.bat` est instantané (juste un scan des dossiers), tu
peux le relancer aussi souvent que tu veux. Les produits de démonstration
(marqués "exemple") disparaissent dès que tu ajoutes tes propres photos.

## Étuis téléphone : avis MagSafe + modèle de téléphone

La section Étui affiche automatiquement, en haut de la grille, un avis
bilingue (français + anglais) indiquant que les étuis ne sont **pas**
compatibles MagSafe par défaut (pas de recharge sans fil), mais qu'une
version MagSafe est possible pour certains modèles de téléphone, pour 25 $
au lieu de 20 $.

Sur chaque étui, un champ "Modèle de téléphone" (bilingue) permet au client
d'indiquer son modèle (ex : iPhone 14 Pro, Samsung Galaxy S23...), et une
case à cocher "Je voudrais l'option MagSafe si possible" (bilingue elle
aussi) lui permet d'exprimer son intérêt. Ces deux infos sont transmises
telles quelles dans "Ma commande" (donc dans le courriel) — c'est toi qui
valides ensuite, par courriel, si une version MagSafe est possible pour ce
modèle précis et ajustes le prix manuellement (25 $ au lieu de 20 $). Rien
n'est calculé automatiquement par le site pour cette option.

## Personnalisation (nom, tag, logo, police)

Si un produit a un `wrap.*` (voir étape 3 ci-dessus), une case "Ajouter un
nom personnalisé" apparaît automatiquement dans sa galerie. Le client peut :
- écrire le nom à afficher,
- choisir un **tag** (une image posée sur le wrap, sous le texte),
- choisir un **logo** (une deuxième image, indépendante du tag — position et
  taille réglées séparément),
- choisir une **police**,

Le tag et le logo sont deux éléments graphiques distincts : le client peut
activer l'un, l'autre, les deux ou aucun des deux.

et voir un aperçu en direct du résultat, avec un bouton **"Enregistrer cette
image"** pour le sauvegarder sur son appareil (fichier PNG). Chaque photo de
la galerie (personnalisée ou non) a aussi son propre lien "Enregistrer cette
photo". C'est uniquement un aperçu visuel — la commande/le paiement se font
ailleurs (voir section suivante).

Les tags disponibles sont dans `assets/tags/` (7 tags de démo fournis par
défaut) et les logos dans `assets/logos/` — dépose simplement une image dans
l'un de ces dossiers et relance `scripts/build.bat`, aucune édition de code
requise (voir `assets/tags/LisezMoi.txt` et `assets/logos/LisezMoi.txt`).
Les polices, elles, se configurent dans `js/customization-data.js`.

**Prix adaptatif :** si le client personnalise (texte, tag et/ou logo),
3,00 $ sont automatiquement ajoutés au prix affiché et à ce qui est envoyé
dans "Ma commande". Pour changer ce montant, modifie
`PERSONALIZATION_SURCHARGE` en haut de `js/customize.js`.

## Section "Créez votre..." (le client compose son propre design)

Chaque catégorie (Tumbler, Tasse, Étui) affiche automatiquement une carte
"Créez votre tumbler / tasse / étui" en plus de tes modèles — le client part
d'un des deux points de départ suivants, puis le personnalise exactement
comme un modèle (nom, tag, logo, police, couleur, position) :

- **un background que tu proposes** (voir `assets/backgrounds/`), ou
- **sa propre image**, choisie depuis son appareil (elle reste locale,
  jamais envoyée nulle part).

Pour proposer des backgrounds prêts, dépose tes images dans
`assets/backgrounds/<tumbler|tasse|etui>/` et relance `scripts/build.bat` —
aucune édition de code requise (voir `assets/backgrounds/LisezMoi.txt`). Une
catégorie sans background n'affiche que l'option "Téléverse ta propre
image".

Les prix de base de cette section sont dans `js/custom-products.js` — ajuste-
les selon ce que tu factures pour un produit vierge personnalisé par le
client. Si une catégorie n'a aucun modèle "template" pour l'instant, cette
carte est la seule chose affichée dans cette catégorie (au lieu d'une section
vide).

## Comment tes clients passent commande

⚠️ **Avant de mettre le site en ligne**, ouvre `js/cart.js` et remplace
`TON-COURRIEL@exemple.com` par ta vraie adresse courriel (constante
`ORDER_EMAIL` en haut du fichier). Sans ça, le bouton "Envoyer ma commande"
enverra vers une adresse qui n'existe pas.

Le site n'a pas de panier ni de paiement en ligne — c'est volontaire, pour
rester simple. Le parcours du client est :

1. Pour chaque produit voulu : il clique **"Ajouter cet article à ma
   commande"** (produit tel quel) ou, dans le panneau de personnalisation,
   **"Ajouter à ma commande"** (avec son nom/tag/logo/police/couleur choisis) —
   ça l'ajoute au petit panier flottant (icône 🛒 en bas à droite).
2. Il clique aussi **"Enregistrer cette image"** (ou "Enregistrer cette
   photo") pour sauvegarder une image par item — il en aura besoin à
   l'étape suivante.
3. Une fois tous ses items ajoutés, il ouvre le panier et clique **"Envoyer
   ma commande par courriel"** : ça ouvre son client courriel avec un
   message déjà rempli (liste des items, prix, détails de personnalisation).
4. Il ne reste plus qu'à **joindre manuellement** les images enregistrées à
   l'étape 2 avant d'envoyer — un navigateur ne peut pas joindre des
   fichiers à un courriel automatiquement (restriction de sécurité), le
   message pré-rempli le lui rappelle.

Le panier est gardé (localStorage) même si le client ferme le site et
revient plus tard sur le même appareil/navigateur.

## Structure du projet

```
index.html                     page principale (onglets Tumbler / Tasse / Étui)
css/style.css                  style du site
js/products-data.js            catalogue généré automatiquement (ne pas éditer)
js/gallery.js                  galerie de photos (flèches précédent/suivant)
js/customize.js                logique de personnalisation (aperçu en direct sur canvas)
js/customization-data.js       backgrounds/tags/logos générés automatiquement + polices (à éditer)
js/cart.js                     panier "Ma commande" + envoi du courriel pré-rempli (ton adresse à configurer ici)
js/custom-products.js          section "Créez votre..." par catégorie (prix à éditer)
js/main.js                     affichage des grilles produits + gestion de la modal
templates/tumbler/<Produit>/photos/  tes photos du produit, déposées directement
templates/tumbler/<Produit>/wrap.*   optionnel : le design plat seul
templates/tasse/...                  idem pour les tasses
templates/etui/...                   idem pour les étuis
assets/tags/                   images des tags pour la personnalisation
assets/logos/                  images des logos pour la personnalisation (distinct du tag)
assets/backgrounds/<categorie>/  designs de base proposés dans "Créez votre..."
scripts/voir-le-site.bat       double-clique pour prévisualiser le site en local
scripts/build.bat              double-clique pour tout régénérer (catalogue + tags/logos/backgrounds)
scripts/generate-catalog.ps1   régénère js/products-data.js à partir de templates/
scripts/generate-customization-data.ps1  régénère js/customization-data.js (TAGS/LOGOS/BACKGROUNDS) à partir de assets/
scripts/serveur-local.ps1      petit serveur local utilisé par voir-le-site.bat
```

## Notes techniques

- La galerie affiche tes photos une par une, sur un fond "studio" neutre avec
  une ombre portée simulée — pas de rotation automatique, juste les flèches
  précédent/suivant (ou les touches ← / →).
- Si une photo ne charge pas, elle est simplement sautée dans la galerie.
