Bonjour, et bienvenu dans ce petit manuel d'utilisation pour le moteur de recherche Cheeseek : le moteur de recherche spécialisé sur le fromage.

Le fonctionnement de notre application est simple :

Cherchez le nom d'un fromage (ou une partie de son nom) dans la barre de recherche, vous arriverez alors sur une page comportant un aperçu de tous les fromages correspondant à votre recherche.
Vous pouvez affiner (comme le fromage au final...) votre recherche grâce aux différents filtres à votre disposition (disponibles à côté de la barre de recherche).
Les filtres disponibles sont les suivants (dans l'ordre d'apparition sur l'IHM):
- Certification : affine les résultats en fonction de la certification des fromages. (AOP, AOC...)
- Texture : affine les résultats en fonction de la texture des fromages. (dur, mou...)
- Source : affine les résultats en fonction de la provenance du lait qui a servi à faire le fromage. (vache, chèvre...)
- Pasteurized : un champ oui/non qui permet d'afficher uniquement les fromages pasteurisés ou non.
- Country : filtre la recherche en affichant uniquement les fromages du pays en question. Cette fonctionnalité fonctionne via une barre de recherche qui dispose d'une fonctionnalité d'auto-complétion.

En cliquant sur un des aperçus de fromage en résultat de recherche, vous arrivez sur une page comportant les détails de ce fromage :
Vous avez à votre disposition une description de celui-ci et si ces champs existent : une image, le pays d'origine, la certification, la pasteurisation, la texture et la source du lait.
Sur certains fromages, il est aussi possible de voir en bas de la page, les recettes qui l'utilisent.

Nous avons implémenté des vues pour les informations de niveaux N-1 (le niveau N étant les fromages), cela veut dire qu'il est possible d'aller sur une page correspondant aux recettes, aux pays ou encore aux animaux sources.
Ces pages sont accessibles en cliquant sur les liens correspondant depuis la page d'un fromage. Ces pages ne comportent en général qu'une image et une description.

À tout moment dans l'application, une flèche de retour (en haut à gauche) est disponible pour revenir sur la page précédente.
 