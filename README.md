# Blockfield · Alpha 0.1

Jeu créatif solo en 3D, conçu pour téléphone et tablette, avec clavier-souris sur ordinateur. Le jeu est entièrement statique : GitHub Pages suffit, sans serveur de partie ni compte joueur. Les ressources nécessaires sont incluses dans le dépôt, sans CDN à contacter au démarrage.

**Référence : Minecraft Java Edition.** Blockfield utilise son propre moteur web ; ce n’est pas le moteur officiel Java, une version de Bedrock ou un lanceur Minecraft. Les mondes et les mods Java ne sont pas compatibles. L’objectif à long terme est d’ajouter progressivement les systèmes de jeu, sans prétendre qu’ils existent déjà dans cette alpha.

## Jouer

[Ouvrir le jeu](https://yes-pearly.github.io/blockfield/).

- **Mobile** : joystick gauche ; glisser sur le monde pour regarder ; boutons Casser, Poser et Sauter à droite. Le bouton aile active le vol. En vol, Sauter fait monter et le petit bouton sous les actions fait descendre. Les commandes utilisent des pointeurs séparés pour permettre les actions simultanées.
- **Ordinateur** : ZQSD, WASD ou flèches ; souris pour regarder ; clic gauche pour casser, clic droit pour poser ; Espace pour sauter ; Ctrl pour courir ; E pour l’inventaire ; F ou double Espace pour le vol ; Maj pour descendre ; 1 à 9 ou molette pour sélectionner ; clic molette pour copier le bloc visé ; Échap pour la pause.
- **Sans capture de souris** : glisser pour regarder, cliquer pour agir. Les commandes tactiles peuvent aussi être activées manuellement dans les réglages.

Le mode tactile se sélectionne automatiquement selon les capacités de l’appareil. La transparence et la sensibilité sont réglables. Les interfaces sont adaptées au portrait et au paysage ; le paysage laisse davantage de place au monde.

## Ce qui fonctionne

- Terrain déterministe par graine, généré par portions de 16 × 16 blocs, chargé au fil de l’exploration et déchargé à distance.
- Relief, zones sableuses, neige en altitude, arbres de chêne et de bouleau, cavités souterraines et minerais.
- Mode créatif : marcher, courir, sauter, nager, voler, casser et poser les blocs à six blocs de portée.
- 41 types de blocs : terrain, bois, verre, eau, briques, minerais, laines colorées, bibliothèque et blocs décoratifs.
- Inventaire avec catégories, recherche et barre de neuf emplacements.
- Faces cachées supprimées, ombrage des faces et des coins, génération et maillage dans un Web Worker. Pas de cube individuel par bloc dans la scène.
- Ciel, nuages cubiques, eau translucide, effet sous l’eau, débris lors de la destruction et effets sonores synthétisés.
- Sauvegarde locale automatique toutes les 20 secondes et après modification ; sauvegarde manuelle ; export et import JSON validé ; retour au point de départ.
- Réglages de distance, champ de vision, sensibilité, volume et commandes. Plein écran lorsque le navigateur le permet.

## Limites actuelles

La hauteur du monde est de 80 blocs, avec une couche de fond protégée et une portée de construction de six blocs. Une seule sauvegarde locale est conservée. La création ou l’importation d’un monde remplace cette sauvegarde : exporter auparavant permet de garder plusieurs mondes.

L’eau est un bloc statique : il n’y a pas encore de simulation d’écoulement. La lumière est un ombrage de rendu, sans propagation lumineuse. La pierre lumineuse a un rendu clair mais n’éclaire pas son voisinage. L’établi et la TNT sont décoratifs. Il n’y a pas de météo, d’animaux, de survie, de fabrication, de redstone fonctionnelle, de dimensions ou de multijoueur.

Le terrain et les règles sont propres à Blockfield : une graine Java ne reproduit pas un monde Java. La génération est prévue pour des coordonnées raisonnables autour de l’origine ; ce n’est pas un monde réellement infini ni une reproduction exacte des règles de Java Edition.

Le stockage dépend du navigateur. Une navigation privée, l’effacement des données ou les règles d’un appareil géré peuvent supprimer les sauvegardes. **Exporter le monde** permet de garder une copie indépendante. La fluidité doit être mesurée sur le téléphone ou la tablette cible ; les essais sur ordinateur avec un viewport mobile ne remplacent pas un essai sur iPad ou Android.

## Développement local

Aucune installation npm nécessaire. Avec Python 3 :

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Ouvrir ensuite `http://127.0.0.1:4173/`. Les modules et les workers doivent être servis par HTTP(S), pas ouverts avec `file://`.

Tests avec Node.js 20 ou plus récent :

```sh
node --test tests/*.test.js
```

Le dossier racine est directement publiable dans GitHub Pages : Settings → Pages → Deploy from a branch → `main` → `/ (root)`. `.nojekyll` conserve l’arborescence statique. Le domaine de jeu est `github.io`, distinct de `github.com`.

## Architecture

| Fichier | Rôle |
| --- | --- |
| `src/world.js` | Génération déterministe, portions, modifications, rayons de sélection, validation des sauvegardes |
| `src/mesh.js` | Construction des surfaces visibles et ombrage par sommet |
| `src/worker.js` | Génération et maillage hors du thread de l’interface |
| `src/physics.js` | Collisions, saut, nage, vol et déplacement à pas fixe |
| `src/controls.js` | Clavier, souris, capture du pointeur et gestes simultanés |
| `src/blocks.js` | Registre des blocs, atlas de textures originales et icônes |
| `src/storage.js` | IndexedDB avec repli localStorage |
| `src/main.js` | Rendu, orchestration, interface, flux de sauvegarde et chargement des portions |

## Prochaines étapes

1. Tester sur les vrais appareils, ajuster les commandes et mesurer mémoire, batterie et cadence d’affichage. Ajouter des réglages d’accessibilité et de disposition tactile.
2. Étendre la structure verticale du monde et son stockage, puis ajouter des biomes, cavernes et structures plus riches. Toute modification du générateur devra conserver la version des mondes existants.
3. Ajouter l’inventaire de survie, objets, recettes, outils, récolte, points de vie et progression, avec des règles documentées et testées à partir de la référence Java.
4. Ajouter lumière, fluides, mises à jour des blocs, végétation et comportement de la TNT.
5. Étendre ensuite aux créatures, circuits, dimensions et autres systèmes. Chaque étape doit être jouable et mesurée avant la suivante.

## Ressources et provenance

Les textures, l’icône et les sons sont originaux et générés par le code du projet. Aucun fichier de Mojang, code décompilé de Minecraft, ressource du wiki ou binaire Java de Minecraft n’est distribué.

Le rendu utilise **Three.js 0.160.1**, inclus localement dans `vendor/three.module.min.js`, avec sa licence MIT dans `vendor/THREE-LICENSE.txt`. Source : [dépôt officiel Three.js](https://github.com/mrdoob/three.js/tree/r160). La documentation [Voxel Geometry](https://threejs.org/manual/pages/voxel-geometry.html) sert de référence technique générale.

Projet indépendant, non officiel, sans affiliation avec Mojang ou Microsoft.
