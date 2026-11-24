# Avancement — Alpha 0.3, 24 novembre 2026

**Estimation de travail : environ 3 % du solo Java complet ; fourchette 2–5 %.**

Ce pourcentage est une estimation d’ingénierie conservatrice, pas une mesure objective vérifiable au dixième, ni une estimation du temps restant. Il n’existe pas de liste exhaustive chiffrée des comportements du jeu de référence permettant un calcul exact. La référence de 100 % est un jeu solo avec la richesse, les règles, le contenu et la fiabilité du Minecraft Java actuel, pas seulement un monde de cubes jouable. La compatibilité des mods Java et le multijoueur ne sont pas inclus dans ce périmètre.

## Critères suivis

| Système | État constaté dans cette version | Principaux manques |
| --- | --- | --- |
| Interface et commandes | Menus classiques, inventaire, hotbar, tactile et clavier-souris, réglages | Reconfiguration complète, accessibilité et équivalence de toutes les interfaces |
| Terrain et exploration | Générateur propre, portions chargées à la demande, arbres, quelques biomes simples et minerais | Génération Java, vraie hauteur moderne, diversité des biomes, grandes cavernes, structures et transitions |
| Blocs et objets | 42 blocs, 24 objets supplémentaires ; outils et ressources de base | Grande majorité des blocs, états, variantes, interactions et objets de la référence |
| Construction et minage | Créatif ; temps de minage en survie, outil adapté, drops et ramassage | Exactitude des règles Java, enchantements, soie/fortune, états particuliers et nombreuses interactions |
| Fabrication et cuisson | 18 recettes façonnées, ingrédients empilés, fabrication répétée, grille 2×2, établi 3×3 et four | Vaste majorité des recettes, stations, transferts avancés et automatisation |
| Survie | Vie, faim simplifiée, nourriture, chutes, oxygène, noyade, mort et objets abandonnés | Combat, armures, effets, températures, sommeil, agriculture, élevage, progression et équilibrage complet |
| Entités et IA | Objets au sol | Créatures, IA, navigation, combat, échanges et interactions |
| Monde dynamique | Quelques collisions et eau statique | Écoulement, propagation lumineuse, cycles, météo, croissance, blocs à mises à jour |
| Redstone et automatisation | Absentes | Circuits, composants, pistons, inventaires automatisés et ordre des ticks |
| Dimensions et progression avancée | Absentes | Nether, End, boss, structures, génération et progression correspondantes |
| Sauvegarde et fiabilité | Sauvegarde locale versionnée compatible alpha 0.1, export/import validé | Format Java, gestion multi-mondes, migrations futures, gros volumes et validation longue durée |

Les interfaces et la chaîne de début de survie sont les parties les plus visibles, mais ne représentent qu’une petite portion de l’objectif. Cette version ne justifie donc pas une estimation de 20 %, 50 % ou davantage.

## Livré dans cette étape

- Ressources graphiques réelles de Minecraft Java 26.2 trouvées dans l’installation locale de l’utilisateur : blocs, objets, boutons et leurs états, logo, HUD, fonds d’inventaire/établi/four et fissures.
- Police web proportionnelle construite à partir des glyphes bitmap Java. Les caractères et les avances viennent de ces images, en remplacement de Monocraft.
- Interfaces calées sur les coordonnées des PNG Java et adaptées à un facteur d’échelle commun ; mêmes sprites pour la hotbar, sa sélection, les cœurs, la faim et le réticule.
- Steve affiché sur un petit modèle 3D utilisant sa texture originale. Corrections des faces des blocs, du verre et des feuillages.
- Prise/dépôt des piles, séparation, dépôt unitaire au clic droit (ou maintien tactile), glisser-déposer et transfert rapide avec Majuscule.
- Ingrédients empilables dans les cases de fabrication, résultat pris sur le curseur et fabrication répétée avec Majuscule.
- Sauvegarde de la pile tenue par le curseur et migration des anciennes cases de fabrication d’un seul objet. Une fermeture sans place suffisante est refusée sans perte d’objet.
- Entrée Solo et sélection du monde, avec conservation du monde local et des liens existants.

L’ajout de ressources visuelles exactes et l’amélioration des inventaires n’ajoutent pas les grandes familles de systèmes encore absentes. L’estimation globale reste donc **environ 3 % (2–5 %)**.

## Vérification

36 tests automatiques : monde, collisions, rendu de l’eau/verre, contrôles simultanés, économie des recettes, outils, cuisson, sauvegardes, import ZIP et transactions d’inventaire. Mille échanges simulés conservent les quantités. Les anciennes sauvegardes restent acceptées.

Essais de navigateur : séparation/dépôt unitaire, Maj-clic, glisser-déposer, fabrication répétée à partir de bûches empilées et reprise après sauvegarde. Four : dépôt de deux pierres taillées et d’un charbon, cuisson puis récupération des deux pierres avec Maj-clic. Interfaces vérifiées en portrait 390×844 et paysage 844×390. Les tests sur écran simulé ne remplacent pas les mesures et les gestes sur une vraie tablette.

## Prochaines étapes, par priorité

1. Consolider le confort tactile sur appareils réels et la navigation du livre de recettes.
2. Ajouter torches et lumière, jour/nuit, agriculture et premières créatures simples, avec une vraie boucle de survie durable.
3. Étendre le monde et les blocs, puis les structures ; maintenir une version de générateur pour éviter les raccords incohérents dans les sauvegardes existantes.
4. Développer combat, armures, IA et progression ; ensuite seulement les systèmes complexes de redstone et les dimensions.

À chaque version, réévaluer sur les systèmes effectivement livrés et testés. Ajouter des textures ou des boutons ne constitue pas une avancée équivalente à un système de jeu complet.
