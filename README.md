# JustStreamIt

L'application web permet de visualiser en temps réel un classement interactif de films, 
reprenant le concept des newsletters de JustStreamIt. Elle offre une interface responsive 
et compatible avec les navigateurs les plus utilisés. Le site récupère les données des films 
à partir d'une API local (OCMovies-API).

## Prérequis

- **Python 3** installé sur votre machine.
- Connexion Internet

## Installation et Lancement

Le site récupère les données des films à partir de l’API. Pour que ces données 
soient affichées, il est indispensable de lancer le serveur API en local.

1. **Installer et exécuter l'API OCMovies-API en local :**

    Ouvrez votre terminal, rendez-vous dans le dossier de votre choix et clonez 
    le dépôt Git avec la commande :
    ```
    git clone https://github.com/OpenClassrooms-Student-Center/OCMovies-API-EN-FR.git
    ```

    Naviguer dans le répertoire :
    ```
    cd ocmovies-api-fr
    ```
    Créer un environnement virtuel :
    ### Sous Windows :
    ```
    python -m venv env
    env\Scripts\activate
    ```
    ### Sous macOS/Linux :
    ```
    python3 -m venv env
    source env/bin/activate
    ```
    Installer les dépendances :
    ```
    pip install -r requirements.txt
    ```
    Créer et alimenter la base de données :
    ```
    python manage.py create_db
    ```
    Démarrer le serveur :
    ```
    python manage.py runserver   
    ```

2. **Cloner le dépôt du projet :**

    Lancez la console, placez-vous dans le dossier de votre choix et clonez le dépôt :
    ```
    git clone https://github.com/mouquettom/OpenClassrooms_P6_JustStreamIt.git
    ```

3. **Lancer l’application :**

    Vous pouvez naviguer dans le dossier et ouvrir le fichier index.html directement dans votre navigateur.


## Structure du Projet

- ### index.html
    Le fichier principal qui structure l’interface du site et définit les différentes sections (meilleur film, catégories, etc.).

- ### styles/style.css
    La feuille de style qui gère la présentation, le responsive design et certaines animations.

- ### scripts/script.js
    Le script JavaScript qui gère :
   - Les appels à l’API (via fetch) pour récupérer et afficher les données des films.
   - Les interactions utilisateur (ouverture de la modale, effets de survol, navigation dans les carrousels).