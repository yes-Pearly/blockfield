# Origine des ressources — Alpha 0.3

Projet web non officiel, sans affiliation avec Mojang ou Microsoft. Minecraft et les ressources graphiques Java appartiennent à Mojang/Microsoft. Aucune licence libre n’est attribuée à ces ressources par ce projet.

## Ressources Java utilisées

À la demande de l’utilisateur, les ressources visuelles par défaut proviennent de sa copie locale de **Minecraft Java 26.2** : textures de blocs et d’objets, boutons, logo et mention Java Edition, fonds des inventaires, HUD, texture de Steve et glyphes du texte.

Le client utilisé correspond à l’empreinte du manifeste de version. [java-sources.json](assets/java-sources.json) conserve la version, les empreintes du client et celles des images extraites, sans chemin personnel ni compte utilisateur. Les 110 images sélectionnées sont réunies sous forme base64 dans `assets/java-26.2.json`. Le JAR et les classes Java du jeu ne font pas partie du projet.

Les bandes de fissures sont assemblées à partir des dix frames de la version Java. L’herbe et les feuilles utilisent les valeurs prélevées dans les palettes du biome de référence, et l’eau sa teinte `#3f76e4`. Les faces des blocs utilisent les images distinctes du client lorsque disponibles.

`assets/java-bitmap.ttf` est une adaptation technique des images bitmap `ascii.png`, `accented.png` et `nonlatin_european.png`. Les formes et avances des glyphes sont conservées pour le texte français et les caractères courants, afin de les afficher dans le navigateur. Il ne s’agit pas d’une police officielle publiée en TTF par Mojang.

Les fonds d’inventaire Java sont utilisés à leur échelle native avec des zones interactives superposées. La disposition mobile, les boutons tactiles, le comportement des cases et le moteur restent des développements propres au projet.

## Packs personnels importés

Options → Importer des textures Java lit localement les PNG reconnus d’un ZIP/JAR. Ces fichiers importés ne sont pas téléversés, ajoutés au dépôt ou inclus dans l’export du monde. Le bouton de retour aux textures par défaut rétablit les ressources Java 26.2 intégrées. Les modèles, shaders, sons et formats historiques ne sont pas tous pris en charge.

## Ressources historiques conservées

Le précédent atlas `assets/textures.json` provient de **Pixel Perfection**, par **XSSheep**, avec des contributions de **VoxeLibre**. Il est conservé avec ses sources pour les tests et l’historique, et n’est plus chargé comme pack visuel par défaut.

- Source : [VoxeLibre](https://github.com/VoxeLibre/VoxeLibre/tree/4492ce6ff8d856daa4567abe2ea689f4e7a39842/textures).
- Licence : [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
- [Licence source](assets/VoxeLibre-LEGAL.md) et [liste des fichiers](assets/SOURCES.json).

Monocraft, © 2022 Idrees Hassan, est également conservée comme ressource historique sous [SIL OFL 1.1](assets/Monocraft-LICENSE.txt), mais le texte courant utilise les glyphes Java.

## Bibliothèques

- Three.js 0.160.1, auteurs de Three.js, [licence MIT](vendor/THREE-LICENSE.txt).
- fflate 0.8.2, © Arjun Barrett, [licence MIT](vendor/FFLATE-LICENSE.txt).

Le moteur web, les règles de jeu et les sons synthétisés sont indépendants du moteur officiel Java. Aucun code Java décompilé ou exécutable Minecraft n’est distribué.
