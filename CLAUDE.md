# grazia-astro-landing

Landing statique (HTML/CSS/JS vanilla, aucune dépendance) pour l'app astrologie Grazia.
- Contenu éditable dans `js/config.js` ; logique testée dans `js/astro.js`.
- Tests obligatoires avant commit : `~/.local/node22/bin/node --test tests/*.test.js` et `tests/run-e2e.sh`.
- Paiement non branché (démo) : Stripe ou Whop à venir, brief backend à recevoir de Claire.
- Jamais de clé Stripe/Whop secrète dans le front ; seules des clés publiables, via config.
- Captures de l'app dans `assets/screens/p*.png` (écrans seuls, cadre téléphone en CSS).
