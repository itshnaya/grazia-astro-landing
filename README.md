# Grazia Astrologie — landing page

Landing page en français pour l'application astrologie de Grazia
(Google Play : `com.natal.chart.astrology`, nom en store « Natal Chart Astrology »).

Parcours : landing → quiz (prénom, date, heure/lieu, humeur, priorité, rapport à l'astro)
→ **couverture Grazia personnalisée** + aperçu du thème → choix de l'offre → inscription + paiement → confirmation.

## Lancer
Site 100 % statique : ouvrir `index.html` dans un navigateur.
Aperçu direct d'une étape : `index.html?step=result` (name, birth, time, mood, priority, habit, result, pricing, checkout, success).

## Structure
- `index.html` — la page
- `css/styles.css` — styles (mobile d'abord)
- `js/config.js` — **à éditer** : liens stores, prix, avis, note, fournisseur de paiement, `track()`
- `js/astro.js` — logique pure (signe, chemin de vie, prix, validation carte)
- `js/app.js` — landing, quiz, paiement (démo)
- `assets/` — logos Grazia (noir/blanc), captures de l'app, favicon

## Tests
```
~/.local/node22/bin/node --test tests/*.test.js   # unitaires + cohérence du site
tests/run-e2e.sh                                   # parcours complet dans Chrome headless
```

## À faire plus tard
- **Paiement** : brancher Stripe ou Whop dans `submitCheckout()` (`js/app.js`). Remplacer les champs carte de démo
  par Stripe Elements / Checkout ou l'embed Whop (les données de carte ne doivent jamais passer par notre serveur).
  Créer le compte (e-mail + mot de passe) côté backend et activer le premium dans l'app.
- **Lien App Store** : `appStoreUrl` dans `js/config.js` (bouton « Bientôt sur App Store » tant que vide).
- **Avis** : valider/remplacer les modèles dans `js/config.js` (pré-remplis avec de vrais avis Google Play traduits).
- **Bandeau cookies + pixels** (Meta, TikTok, Google) : emplacement prévu dans `<head>` ; tous les événements du
  parcours passent déjà par `window.track()` → `dataLayer` (funnel_open, funnel_step, quiz_complete, select_plan, purchase).
- **Pages légales** : mentions légales, CGV, confidentialité, cookies (liens du pied de page = modèles à rédiger).
- **Mise en ligne** : aperçu sur https://itshnaya.github.io/grazia-astro-landing/ (GitHub Pages, `git push` = mise à jour). Version finale : site Grazia ou domaine à fournir ; retirer alors le `noindex`.
