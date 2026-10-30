/* Configuration éditable sans toucher au reste du code */
window.GRAZIA_CONFIG = {
  playStoreUrl: "https://play.google.com/store/apps/details?id=com.natal.chart.astrology&gl=us",
  appStoreUrl: "", // À FOURNIR : lien App Store (bouton masqué/« bientôt » tant que vide)
  storeAppName: "Natal Chart Astrology", // nom affiché dans les stores

  plans: {
    yearly: { id: "yearly", label: "Annuel", price: 34.99, period: "an", trialDays: 7 },
    weekly: { id: "weekly", label: "Hebdomadaire", price: 6.99, period: "semaine", trialDays: 0 }
  },

  // Paiement : pas encore branché. provider = "stripe" | "whop" quand le backend sera prêt.
  checkout: { provider: null, demo: true },

  // Données réelles relevées sur Google Play le 30/10/2026
  rating: { value: "4,2", source: "Google Play", downloads: "1 000+" },

  // MODÈLES À COMPLÉTER — pré-remplis avec de vrais avis Google Play (traduits de l'anglais).
  // Remplacer/valider avant mise en ligne.
  reviews: [
    { author: "Shirley A.", stars: 5, date: "août 2026",
      text: "Je consulte mon horoscope chaque jour et j’utilise l’astrologue IA quand j’ai besoin d’un peu de recul. Le thème natal et le tarot rendent l’expérience encore plus personnelle. Tout est réuni dans une seule app." },
    { author: "Venessa B.", stars: 4, date: "septembre 2026",
      text: "Je l’ouvre le matin pour mon horoscope, et l’astrologue IA me donne des pistes étonnamment justes. J’aime explorer mon thème quand je suis d’humeur introspective. Simple, apaisant, jamais compliqué." },
    { author: "Alphonse M.", stars: 4, date: "septembre 2026",
      text: "Le thème natal est passionnant et facile à explorer, chaque placement est expliqué simplement. Ça rend l’astrologie vraiment personnelle. À essayer si vous êtes curieuse de votre thème !" }
  ]
};

/* Point d'entrée unique pour le suivi (pixels Meta / TikTok / Google à brancher plus tard).
   Pour l'instant : simple push dans dataLayer, aucun envoi vers un service tiers. */
window.track = function (event, props) {
  (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: event }, props || {}));
};
