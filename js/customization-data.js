/*
  Ce fichier est en partie genere automatiquement par
  scripts/generate-customization-data.ps1 (lance via scripts/build.bat) :
  les listes BACKGROUNDS, TAGS et LOGOS viennent des dossiers
  assets/backgrounds/<categorie>/, assets/tags/ et assets/logos/ - NE LES
  EDITE PAS A LA MAIN, tes changements seraient ecrases. Pour en ajouter ou
  en retirer, depose/supprime simplement le fichier image correspondant et
  relance scripts/build.bat.

  La liste FONTS ci-dessous N'EST PAS generee - modifie-la ici directement.
  Ajoute une entree avec un nom Google Fonts valide (voir fonts.google.com)
  et son family CSS correspondant, puis ajoute aussi le lien Google Fonts
  dans index.html pour inclure la nouvelle police.

  Le tag et le logo sont deux elements graphiques DISTINCTS sur le site : le
  client peut activer l'un, l'autre, les deux ou aucun des deux, chacun avec
  sa propre position et sa propre taille (curseurs sur le site).

  Pour un tag, la couleur de texte par defaut vient d'un fichier texte de
  meme nom a cote de l'image (ex: MonTag.txt pour MonTag.png) contenant une
  couleur hex ; sans ce fichier, #14336b est utilise.
*/
const BACKGROUNDS = {
  tumbler: [],
  tasse: [],
  etui: [
    { id: "aqbm-v1", name: "AQBM V1", image: "assets/backgrounds/etui/AQBM%20V1.png" },
    { id: "aqbm-v2", name: "AQBM V2", image: "assets/backgrounds/etui/AQBM%20V2.png" },
    { id: "aqbm-v3", name: "AQBM V3", image: "assets/backgrounds/etui/AQBM%20V3.png" },
    { id: "clubquebec-v1", name: "ClubQuebec V1", image: "assets/backgrounds/etui/ClubQuebec%20V1.png" },
    { id: "clubquebec-v2", name: "ClubQuebec V2", image: "assets/backgrounds/etui/ClubQuebec%20V2.png" },
    { id: "clubquebec-v3", name: "ClubQuebec V3", image: "assets/backgrounds/etui/ClubQuebec%20V3.png" },
    { id: "clubquebec-v4", name: "ClubQuebec V4", image: "assets/backgrounds/etui/ClubQuebec%20V4.png" },
    { id: "clubquebec-v5", name: "ClubQuebec V5", image: "assets/backgrounds/etui/ClubQuebec%20V5.png" }
  ]
};

const TAGS = [
  { id: "1", name: "1", image: "assets/tags/1.png", color: "#14336b" },
  { id: "2", name: "2", image: "assets/tags/2.png", color: "#14336b" },
  { id: "3", name: "3", image: "assets/tags/3.png", color: "#14336b" },
  { id: "4", name: "4", image: "assets/tags/4.png", color: "#14336b" },
  { id: "5", name: "5", image: "assets/tags/5.png", color: "#14336b" },
  { id: "6", name: "6", image: "assets/tags/6.png", color: "#14336b" },
  { id: "7", name: "7", image: "assets/tags/7.png", color: "#14336b" }
];

const LOGOS = [
  { id: "aqbm-v1", name: "AQBM V1", image: "assets/logos/AQBM%20V1.png" },
  { id: "aqbm-v2", name: "AQBM V2", image: "assets/logos/AQBM%20V2.png" },
  { id: "aqbm-v3", name: "AQBM V3", image: "assets/logos/AQBM%20V3.png" },
  { id: "clubquebec-v1", name: "ClubQuebec V1", image: "assets/logos/ClubQuebec%20V1.png" },
  { id: "clubquebec-v2", name: "ClubQuebec V2", image: "assets/logos/ClubQuebec%20V2.png" },
  { id: "clubquebec-v3", name: "ClubQuebec V3", image: "assets/logos/ClubQuebec%20V3.png" }
];

const FONTS = [
  { id: "barlow-condensed", label: "Barlow Condensed", family: "'Barlow Condensed', sans-serif", weight: 700 },
  { id: "anton", label: "Anton", family: "'Anton', sans-serif", weight: 400 },
  { id: "oswald", label: "Oswald", family: "'Oswald', sans-serif", weight: 700 },
  { id: "archivo-black", label: "Archivo Black", family: "'Archivo Black', sans-serif", weight: 400 },
  { id: "teko", label: "Teko", family: "'Teko', sans-serif", weight: 700 },
  { id: "bebas-neue", label: "Bebas Neue", family: "'Bebas Neue', sans-serif", weight: 400 },
  { id: "roboto-condensed", label: "Roboto Condensed", family: "'Roboto Condensed', sans-serif", weight: 700 },
  { id: "montserrat", label: "Montserrat", family: "'Montserrat', sans-serif", weight: 700 },
  { id: "black-ops-one", label: "Black Ops One", family: "'Black Ops One', sans-serif", weight: 400 },
  { id: "russo-one", label: "Russo One", family: "'Russo One', sans-serif", weight: 400 }
];

