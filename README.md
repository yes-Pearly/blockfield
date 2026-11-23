# Minecraft — Projet web non officiel · Alpha 0.2

[Jouer sur GitHub Pages](https://yes-pearly.github.io/blockfield/).

Jeu web solo indépendant, inspiré de Minecraft Java Edition. Le moteur officiel Java, les mods et les mondes Java ne sont pas pris en charge. Le dépôt conserve son nom technique `blockfield` pour préserver les liens et les sauvegardes existantes. Le titre du jeu et sa direction artistique ont été repris à la demande de l’utilisateur.

## Nouveautés de cette version

- Menus gris biseautés, police pixelisée, inventaire à cases, barre rapide, cœurs et faim. Plus de présentation marketing.
- Textures Pixel Perfection/VoxeLibre sous licence libre, avec [crédits et provenance](ASSETS.md). Les véritables textures d’un pack Java personnel peuvent être importées localement dans Options.
- **Survie** : inventaire de 36 emplacements, piles limitées, minage progressif, fissures, drops, ramassage et objets jetés.
- **18 recettes** : planches, bâtons, établi, four, briques et pioches/haches/pelles en quatre matériaux. Grille personnelle 2×2 et établi 3×3 ; le livre de recettes utilise les ressources possédées.
- Outils à vitesse, niveau requis et durabilité. Casser une pierre à la main ne donne pas de pierres. Les minerais exigent une pioche adaptée.
- Four : minerai et combustible, cuisson de dix secondes, fer/or, verre, pierre, charbon de bois et briques.
- Vie et faim simplifiées, nourriture, dégâts de chute, oxygène et noyade. Mort avec objets abandonnés, puis réapparition.
- Sauvegarde étendue aux inventaires, fours, outils et objets au sol. Les anciennes sauvegardes alpha 0.1 restent lisibles en créatif.

Le créatif conserve blocs illimités et vol. Menu du jeu → Mode permet de passer de Créatif à Survie ; l’inventaire de survie est distinct de la barre créative. Un nouveau monde sans sauvegarde démarre en Survie ; Créer un monde permet de choisir le mode.

## Commencer en survie

1. Approcher un arbre, viser une bûche et maintenir MINER (ou clic gauche) pendant environ trois secondes.
2. Ramasser la bûche en s’approchant de l’objet au sol.
3. Ouvrir l’inventaire. Sélectionner la bûche, puis une case de fabrication ; récupérer les quatre planches. Le livre de recettes peut aussi préparer les ingrédients automatiquement.
4. Fabriquer un établi avec quatre planches, puis des bâtons avec deux planches superposées.
5. Poser l’établi, le viser et UTILISER / clic droit pour ouvrir la grille 3×3.
6. Fabriquer une pioche en bois, extraire des pierres, puis fabriquer des outils en pierre et un four.
7. Utiliser le four : sélectionner le minerai dans l’inventaire puis la case du haut ; sélectionner du bois ou du charbon puis la case du bas. Récupérer le résultat à droite.

Les cases de fabrication reçoivent une unité par toucher. Toucher une case remplie remet l’ingrédient dans l’inventaire. Dans le four, sélectionner un emplacement vide de l’inventaire puis toucher une case permet d’en récupérer le contenu.

## Commandes

| Action | Mobile | Clavier-souris |
| --- | --- | --- |
| Bouger | Joystick gauche | ZQSD / WASD / flèches |
| Regarder | Glisser sur le monde | Souris ; glisser si la capture est indisponible |
| Miner | Maintenir MINER | Maintenir clic gauche |
| Poser / utiliser / manger | UTILISER | Clic droit |
| Sauter | Bouton de saut | Espace |
| Courir | — | Ctrl |
| Inventaire | Bouton en haut | E |
| Sélectionner | Barre rapide | 1–9 / molette |
| Jeter un objet | — | G |
| Vol créatif | Bouton aile | F / double Espace |
| Monter / descendre en vol | Saut / bouton descente | Espace / Maj |
| Pause | Bouton pause | Échap |

Le tactile utilise des pointeurs indépendants pour déplacer, regarder et agir simultanément. Le saut automatique et la transparence sont réglables. Le paysage laisse davantage de place au monde. Les essais en viewport mobile sur ordinateur ne remplacent pas un essai de performance sur le vrai appareil.

## Textures Java personnelles

Options → Importer des textures Java accepte un ZIP/JAR contenant les PNG reconnus dans `assets/minecraft/textures/block/` ou `item/`. Le fichier est lu **sur l’appareil**, sans envoi à un serveur. Les textures choisies restent dans ce navigateur et ne sont pas incluses dans l’export du monde. Les PNG absents conservent leur version libre par défaut. L’import ne prend pas en charge les modèles, shaders, sons ou tous les formats historiques.

## Sauvegarde et limites

Une sauvegarde locale avec enregistrement automatique toutes les vingt secondes et après modification ; export/import JSON validé. Créer/importer un monde remplace cette sauvegarde : exporter auparavant pour la garder. Le format interne et les clés de stockage restent ceux de Blockfield pour assurer la continuité.

Le monde est généré par portions 16×16, sur 80 blocs de hauteur ; la couche de fond est protégée. Portée de 4,5 blocs en survie et six en créatif. La génération et les règles sont propres au projet, sans équivalence de graines ni parité exacte Java.

L’eau est statique. Pas encore de lumière propagée, torches, jour/nuit, agriculture, créatures, IA, combat, redstone, structures avancées ou dimensions. La TNT reste décorative ; la pierre lumineuse n’éclaire pas les voisins. Les recettes et comportements représentent un sous-ensemble initial, pas le catalogue complet de Minecraft.

[Avancement honnête et prochaines étapes](PROGRESS.md) : **environ 3 % de l’objectif solo Java complet, fourchette 2–5 %**, estimation d’ingénierie et non mesure objective exacte.

## Développer et tester

Sans installation de dépendances :

```sh
python3 -m http.server 4173 --bind 127.0.0.1
node --test tests/*.test.js
```

Ouvrir `http://127.0.0.1:4173/`. Ne pas utiliser `file://`, car le jeu emploie des modules et un Web Worker.

26 tests couvrent le monde, les collisions, les contrôles simultanés, l’économie des recettes, la durabilité, les paliers d’outils, la cuisson, les sauvegardes et l’import ZIP de textures.

GitHub Pages publie directement `main` → `/ (root)`, avec `.nojekyll`. Le jeu et ses dépendances sont statiques et inclus localement, sans CDN ni serveur de partie.

## Organisation

- `src/world.js`, `mesh.js`, `worker.js` : terrain et rendu des portions.
- `src/physics.js`, `controls.js` : déplacement et entrées.
- `src/survival.js` : inventaire, recettes, outils, cuisson et survie, testables sans navigateur.
- `src/game-ui.js` : interfaces d’inventaire, fabrication et four.
- `src/resource-pack.js` : import sélectif des PNG Java depuis ZIP/JAR.
- `src/storage.js` : stockage, avec conservation du format alpha 0.1.
- `src/blocks.js`, `assets/` : registre et textures, [licences](ASSETS.md).
- `src/main.js` : orchestration du jeu, rendu, objets au sol et interactions.
