# Avancement — Alpha 0.2, 23 novembre 2026

**Estimation de travail : environ 3 % du solo Java complet ; fourchette 2–5 %.**

Ce pourcentage est une estimation d’ingénierie conservatrice, pas une mesure objective vérifiable au dixième, ni une estimation du temps restant. Il n’existe pas de liste exhaustive chiffrée des comportements du jeu de référence permettant un calcul exact. La référence de 100 % est un jeu solo avec la richesse, les règles, le contenu et la fiabilité du Minecraft Java actuel, pas seulement un monde de cubes jouable. La compatibilité des mods Java et le multijoueur ne sont pas inclus dans ce périmètre.

## Critères suivis

| Système | État constaté dans cette version | Principaux manques |
| --- | --- | --- |
| Interface et commandes | Menus classiques, inventaire, hotbar, tactile et clavier-souris, réglages | Reconfiguration complète, accessibilité, glisser-déposer, équivalence de toutes les interfaces |
| Terrain et exploration | Générateur propre, portions chargées à la demande, arbres, quelques biomes simples et minerais | Génération Java, vraie hauteur moderne, diversité des biomes, grandes cavernes, structures et transitions |
| Blocs et objets | 42 blocs, 24 objets supplémentaires ; outils et ressources de base | Grande majorité des blocs, états, variantes, interactions et objets de la référence |
| Construction et minage | Créatif ; temps de minage en survie, outil adapté, drops et ramassage | Exactitude des règles Java, enchantements, soie/fortune, états particuliers et nombreuses interactions |
| Fabrication et cuisson | 18 recettes façonnées, grille personnelle 2×2, établi 3×3, four à combustible | Vaste majorité des recettes, stations, transferts avancés et automatisation |
| Survie | Vie, faim simplifiée, nourriture, chutes, oxygène, noyade, mort et objets abandonnés | Combat, armures, effets, températures, sommeil, agriculture, élevage, progression et équilibrage complet |
| Entités et IA | Objets au sol | Créatures, IA, navigation, combat, échanges et interactions |
| Monde dynamique | Quelques collisions et eau statique | Écoulement, propagation lumineuse, cycles, météo, croissance, blocs à mises à jour |
| Redstone et automatisation | Absentes | Circuits, composants, pistons, inventaires automatisés et ordre des ticks |
| Dimensions et progression avancée | Absentes | Nether, End, boss, structures, génération et progression correspondantes |
| Sauvegarde et fiabilité | Sauvegarde locale versionnée compatible alpha 0.1, export/import validé | Format Java, gestion multi-mondes, migrations futures, gros volumes et validation longue durée |

Les interfaces et la chaîne de début de survie sont les parties les plus visibles, mais ne représentent qu’une petite portion de l’objectif. Cette version ne justifie donc pas une estimation de 20 %, 50 % ou davantage.

## Livré dans cette étape

- Nom visible : Minecraft — Projet web non officiel. Menus et interfaces entièrement repris en style pixelisé classique.
- 78 textures libres Pixel Perfection/VoxeLibre intégrées avec leurs crédits ; police Monocraft. Import local optionnel d’un sous-ensemble de textures Java depuis un ZIP/JAR.
- Inventaire de survie de 36 emplacements, piles limitées, objets au sol et ramassage.
- Minage progressif et fissures, drops selon le niveau de l’outil.
- Grilles de fabrication personnelle et d’établi ; livre des 18 recettes disponibles.
- Pioches, haches et pelles en bois, pierre, fer et diamant, avec vitesse et durabilité.
- Four avec temps de cuisson de dix secondes, combustible consommé et résultats récupérables.
- Vie, faim simplifiée, nourriture, noyade, dégâts de chute, mort et réapparition.
- Sauvegarde des inventaires, outils, fours et objets au sol ; conservation des anciennes sauvegardes créatives.

## Vérification

26 tests automatiques : moteur, collisions, pointeurs simultanés, consommation des recettes, paliers d’outils, durabilité, cuisson, sauvegardes et import ZIP. Essais dans le navigateur : fabrication réelle de planches/bâtons/pioche, cuisson de deux fers bruts en deux lingots avec un charbon, minage d’une bûche et interfaces mobiles. Les mesures de fluidité sur un vrai téléphone/iPad restent à faire.

## Prochaines étapes, par priorité

1. Consolider le confort tactile et les inventaires : déplacement des piles, choix de quantité, accès rapide aux recettes, vrais essais sur appareils.
2. Ajouter torches et lumière, jour/nuit, agriculture et premières créatures simples, avec une vraie boucle de survie durable.
3. Étendre le monde et les blocs, puis les structures ; maintenir une version de générateur pour éviter les raccords incohérents dans les sauvegardes existantes.
4. Développer combat, armures, IA et progression ; ensuite seulement les systèmes complexes de redstone et les dimensions.

À chaque version, réévaluer sur les systèmes effectivement livrés et testés. Ajouter des textures ou des boutons ne constitue pas une avancée équivalente à un système de jeu complet.
