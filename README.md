# Yams — feuille de score

Une petite app web pour jouer au Yams avec de vrais dés en gardant les scores sur votre téléphone. Pas d'installation, pas de compte : un lien à partager, et c'est parti.

Le site ne simule pas le lancer de dés — vous lancez vos vrais dés, et vous entrez le résultat. L'app se charge de calculer les combinaisons possibles, de suivre les tours, et de faire le total à la fin.

## Ce que contient ce dossier

- `index.html` — la page
- `style.css` — le style
- `script.js` — toute la logique du jeu (calcul des scores, tours, sauvegarde)
- `manifest.json` — permet d'ajouter l'app à l'écran d'accueil du téléphone

Aucune installation, aucune dépendance : c'est un site statique, il fonctionne tel quel.

## Étape 1 — Mettre le projet sur GitHub

1. Allez sur [github.com](https://github.com) et créez un compte si vous n'en avez pas.
2. Cliquez sur le bouton **+** en haut à droite → **New repository**.
3. Donnez-lui un nom, par exemple `yams-app`. Laissez-le en **Public**. Ne cochez aucune case (pas de README, pas de .gitignore — on a déjà nos fichiers).
4. Cliquez sur **Create repository**.
5. Sur la page qui s'affiche, cherchez la section **"uploading an existing file"** (ou le lien **"upload an existing file"**).
6. Glissez-déposez les 4 fichiers de ce dossier (`index.html`, `style.css`, `script.js`, `manifest.json`) dans la zone.
7. En bas de page, cliquez sur **Commit changes**.

Votre code est maintenant sur GitHub.

### Si vous préférez la ligne de commande

```bash
cd yams-app
git init
git add .
git commit -m "Première version de l'app Yams"
git branch -M main
git remote add origin https://github.com/VOTRE-PSEUDO/yams-app.git
git push -u origin main
```

## Étape 2 — Déployer sur Vercel

1. Allez sur [vercel.com](https://vercel.com) et cliquez sur **Sign Up**.
2. Choisissez **Continue with GitHub** — ça relie directement votre compte GitHub, pas besoin de créer un mot de passe séparé.
3. Une fois connecté, cliquez sur **Add New...** → **Project**.
4. Vercel vous montre la liste de vos dépôts GitHub. Trouvez `yams-app` et cliquez sur **Import**.
5. Vercel détecte que c'est un site statique — vous n'avez **rien à configurer**. Laissez tous les champs par défaut.
6. Cliquez sur **Deploy**.
7. Après quelques secondes, Vercel affiche **"Congratulations"** avec un lien du type `https://yams-app-xxxx.vercel.app`.

C'est ce lien que vous partagez avec vos amis. Ouvrez-le sur votre téléphone.

## Étape 3 — L'ajouter à l'écran d'accueil (optionnel mais pratique)

- **Sur iPhone (Safari)** : ouvrez le lien → bouton de partage (le carré avec la flèche) → **Sur l'écran d'accueil**.
- **Sur Android (Chrome)** : ouvrez le lien → menu (les 3 points) → **Ajouter à l'écran d'accueil**.

L'app s'ouvre alors comme une vraie application, sans la barre d'adresse du navigateur.

## Mettre à jour le site plus tard

À chaque fois que vous modifiez un fichier et le renvoyez sur GitHub (via l'interface web, un nouvel "upload" ou `git push`), Vercel redéploie automatiquement le site en quelques secondes. Rien à refaire côté Vercel.

## Règles du jeu implémentées

- Section du haut : as à six, bonus de 35 points si le total atteint 63 ou plus
- Brelan, carré : somme de tous les dés si la condition est remplie
- Full : 25 points fixes
- Petite suite : 30 points, grande suite : 40 points
- Yams : 50 points
- Chance : somme de tous les dés, toujours valable

Une catégorie peut être choisie même à 0 point, pour "barrer" une case stratégiquement — comme dans les règles classiques.

## Limites connues

- La partie est sauvegardée dans le navigateur (localStorage) : si vous changez de téléphone ou videz le cache, la partie en cours est perdue.
- Pas de compte, pas d'historique de parties passées pour l'instant — c'est un choix pour rester simple. Si vous voulez cette fonctionnalité plus tard, il faudra ajouter une base de données (par exemple Vercel KV ou Supabase).
