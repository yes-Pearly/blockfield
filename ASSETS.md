# Crédits des ressources

Ce projet web est non officiel, sans affiliation avec Mojang ou Microsoft. Minecraft est une marque de Mojang/Microsoft. Le titre est une référence au jeu reproduit, pas une déclaration d’origine officielle.

## Textures incluses par défaut

**Pixel Perfection**, par **XSSheep**, avec les modifications et contributions de **VoxeLibre**.

- Source : [VoxeLibre](https://github.com/VoxeLibre/VoxeLibre/tree/4492ce6ff8d856daa4567abe2ea689f4e7a39842/textures), révision figée `4492ce6ff8d856daa4567abe2ea689f4e7a39842`.
- Licence : [Creative Commons Attribution-ShareAlike 3.0 Unported](https://creativecommons.org/licenses/by-sa/3.0/). [Texte juridique](https://creativecommons.org/licenses/by-sa/3.0/legalcode).
- [Informations de licence du projet source](assets/VoxeLibre-LEGAL.md).
- Liste exacte des 78 images, chemins d’origine et empreintes : [SOURCES.json](assets/SOURCES.json).

Les PNG sont réunis, sans changement de leurs pixels source, dans `assets/textures.json` sous forme de données base64. Au rendu, ils sont assemblés en atlas ; l’herbe, les feuilles et l’eau reçoivent une teinte. L’eau et les fissures utilisent des frames de leurs bandes d’animation. Ces adaptations visuelles restent sous CC BY-SA 3.0, avec les mêmes crédits. Aucun fichier graphique de Mojang n’est inclus dans la distribution par défaut.

## Import personnel de textures Java

Options → Importer des textures Java permet de lire localement les PNG reconnus dans `assets/minecraft/textures/block/` et `item/` d’un pack ZIP ou du JAR de sa copie du jeu. Aucun fichier n’est envoyé à un serveur. Les images sélectionnées sont conservées dans le stockage du navigateur de cet appareil ; elles ne sont pas ajoutées au dépôt ni à l’export du monde.

L’import prend en charge un sous-ensemble des textures de blocs et d’objets, pas les modèles, shaders, sons, métadonnées avancées ou la totalité d’un pack. Les éléments absents gardent les textures par défaut. Une autre personne ouvrant le lien reçoit les textures libres par défaut. Le bouton Textures par défaut retire la sélection locale.

## Police

**Monocraft**, © 2022 Idrees Hassan. Source : [IdreesInc/Monocraft](https://github.com/IdreesInc/Monocraft/tree/e498bf70aeb25b4bdcff1e44d878fb2cb4f7c2a9), révision `e498bf70aeb25b4bdcff1e44d878fb2cb4f7c2a9`. Police non modifiée, sous [SIL Open Font License 1.1](assets/Monocraft-LICENSE.txt).

## Bibliothèques

- Three.js 0.160.1, auteurs de Three.js, [licence MIT](vendor/THREE-LICENSE.txt).
- fflate 0.8.2, © Arjun Barrett, [licence MIT](vendor/FFLATE-LICENSE.txt), [source officielle](https://github.com/101arrowz/fflate).

La présentation HTML/CSS, les contrôles, le moteur de jeu web et les sons synthétisés sont propres à ce projet. Aucun code Java décompilé ou exécutable Minecraft n’est distribué.
