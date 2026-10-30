/* Logique pure (signe, numérologie, prix, carte) — testée dans tests/astro.test.js */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Astro = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // Glyphes suivis de U+FE0E pour forcer l'affichage texte (pas emoji)
  const SIGNS = [
    { id: "capricorne", name: "Capricorne", glyph: "♑︎", start: [12, 22], element: "Terre", dates: "22 déc. – 19 janv.",
      words: ["Ambitieuse", "Loyale", "Élégante"], match: "Taureau",
      cover: "L’hiver où vos ambitions prennent la couverture",
      trait: "Vous avancez avec une élégance tranquille : rien ne vous détourne de ce que vous avez décidé. Derrière la maîtrise, une sensibilité que peu de gens ont le privilège de voir." },
    { id: "verseau", name: "Verseau", glyph: "♒︎", start: [1, 20], element: "Air", dates: "20 janv. – 18 févr.",
      words: ["Libre", "Visionnaire", "Singulière"], match: "Gémeaux",
      cover: "Libre, inventive, imprévisible : votre année signature",
      trait: "Vous avez toujours un temps d’avance — sur les tendances comme sur les idées. Votre indépendance est votre plus bel accessoire, et vous ne la prêtez à personne." },
    { id: "poissons", name: "Poissons", glyph: "♓︎", start: [2, 19], element: "Eau", dates: "19 févr. – 20 mars",
      words: ["Intuitive", "Créative", "Magnétique"], match: "Cancer",
      cover: "Intuition, rêves et grands élans : la saison vous appartient",
      trait: "Vous ressentez tout, avant tout le monde. Cette intuition presque troublante est votre boussole : quand vous l’écoutez, vous ne vous trompez jamais." },
    { id: "belier", name: "Bélier", glyph: "♈︎", start: [3, 21], element: "Feu", dates: "21 mars – 19 avr.",
      words: ["Audacieuse", "Directe", "Lumineuse"], match: "Lion",
      cover: "Audace, désir et nouveaux départs : votre moment est venu",
      trait: "Vous ouvrez la voie quand les autres hésitent encore. Votre franchise désarme, votre énergie entraîne — et votre impatience cache un cœur d’une grande générosité." },
    { id: "taureau", name: "Taureau", glyph: "♉︎", start: [4, 20], element: "Terre", dates: "20 avr. – 20 mai",
      words: ["Sensuelle", "Fidèle", "Raffinée"], match: "Capricorne",
      cover: "Douceur de vivre et désirs assumés : le grand retour à soi",
      trait: "Vous savez ce qui est beau, ce qui est bon, ce qui dure. Votre calme est une force : on vient à vous pour la stabilité, on reste pour votre douceur." },
    { id: "gemeaux", name: "Gémeaux", glyph: "♊︎", start: [5, 21], element: "Air", dates: "21 mai – 20 juin",
      words: ["Pétillante", "Curieuse", "Brillante"], match: "Balance",
      cover: "Conversations, rencontres, idées : tout s’accélère pour vous",
      trait: "Votre esprit file plus vite que la lumière et votre curiosité ne prend jamais de vacances. Vous êtes celle dont on retient les phrases — et les éclats de rire." },
    { id: "cancer", name: "Cancer", glyph: "♋︎", start: [6, 21], element: "Eau", dates: "21 juin – 22 juil.",
      words: ["Protectrice", "Sensible", "Intense"], match: "Scorpion",
      cover: "Cocon, cœur et renaissance : prenez soin de vous d’abord",
      trait: "Vous donnez sans compter et votre mémoire du cœur est infinie. Cette saison vous invite à garder un peu de cette tendresse… pour vous-même." },
    { id: "lion", name: "Lion", glyph: "♌︎", start: [7, 23], element: "Feu", dates: "23 juil. – 22 août",
      words: ["Rayonnante", "Généreuse", "Charismatique"], match: "Sagittaire",
      cover: "Sous les projecteurs : votre charisme fait la une",
      trait: "Vous entrez dans une pièce et la lumière change. Votre générosité est aussi grande que votre fierté — et c’est exactement ce qui vous rend inoubliable." },
    { id: "vierge", name: "Vierge", glyph: "♍︎", start: [8, 23], element: "Terre", dates: "23 août – 22 sept.",
      words: ["Précise", "Attentionnée", "Lucide"], match: "Capricorne",
      cover: "Le grand tri : place à ce qui vous ressemble vraiment",
      trait: "Vous voyez les détails que tout le monde manque et vous avez l’art de rendre la vie plus simple aux autres. Il est temps d’appliquer ce talent à vos propres envies." },
    { id: "balance", name: "Balance", glyph: "♎︎", start: [9, 23], element: "Air", dates: "23 sept. – 22 oct.",
      words: ["Harmonieuse", "Esthète", "Diplomate"], match: "Verseau",
      cover: "Beauté, équilibre et coups de cœur : Vénus vous sourit",
      trait: "Vous cherchez l’harmonie partout — dans un intérieur, une tenue, une relation. Votre sens du beau est un don ; votre besoin d’équilibre, une sagesse." },
    { id: "scorpion", name: "Scorpion", glyph: "♏︎", start: [10, 23], element: "Eau", dates: "23 oct. – 21 nov.",
      words: ["Magnétique", "Passionnée", "Mystérieuse"], match: "Poissons",
      cover: "Magnétisme, transformation et passion : l’automne est à vous",
      trait: "Vous n’aimez pas à moitié et vous lisez les gens comme des livres ouverts. Votre intensité intimide parfois — elle fascine toujours." },
    { id: "sagittaire", name: "Sagittaire", glyph: "♐︎", start: [11, 22], element: "Feu", dates: "22 nov. – 21 déc.",
      words: ["Optimiste", "Aventurière", "Libre"], match: "Bélier",
      cover: "Cap sur l’ailleurs : l’aventure commence maintenant",
      trait: "Vous voyez toujours l’horizon avant les obstacles. Votre optimisme est contagieux et votre soif de liberté vous mène là où les autres n’osent pas aller." }
  ];

  const LIFE_PATH = {
    1: "La pionnière", 2: "La diplomate", 3: "La créative", 4: "La bâtisseuse", 5: "L’aventurière",
    6: "La protectrice", 7: "La sage", 8: "La stratège", 9: "L’humaniste", 11: "L’inspirée", 22: "La visionnaire"
  };

  function isValidDate(day, month, year) {
    const d = new Date(year, month - 1, day);
    return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
  }

  /** Signe solaire tropical pour un jour/mois donnés. */
  function getSign(month, day) {
    // SIGNS est trié à partir du Capricorne (22/12) : on cherche le dernier signe dont le début est <= date
    const ordered = SIGNS.slice(1).concat(SIGNS[0]); // Verseau (20/01) … Capricorne (22/12)
    let found = SIGNS[0]; // avant le 20/01 : Capricorne
    for (const s of ordered) {
      const [m, d] = s.start;
      if (month > m || (month === m && day >= d)) found = s;
    }
    return found;
  }

  function getSignById(id) {
    return SIGNS.find((s) => s.id === id) || null;
  }

  /** Chemin de vie (numérologie) : somme des chiffres de la date, réduite (11 et 22 conservés). */
  function lifePath(day, month, year) {
    let n = String(day) + String(month) + String(year);
    let sum = n.split("").reduce((a, c) => a + Number(c), 0);
    while (sum > 9 && sum !== 11 && sum !== 22) {
      sum = String(sum).split("").reduce((a, c) => a + Number(c), 0);
    }
    return { number: sum, label: LIFE_PATH[sum] };
  }

  function formatPrice(value) {
    return value.toFixed(2).replace(".", ",") + " €";
  }

  function addDays(date, days) {
    const d = new Date(date.getTime());
    d.setDate(d.getDate() + days);
    return d;
  }

  function formatDateFr(date) {
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  }

  function yearlySavings(weekly, yearly) {
    return Math.floor((1 - yearly / (weekly * 52)) * 100);
  }

  function luhn(num) {
    const digits = String(num).replace(/\D/g, "");
    if (digits.length < 13 || digits.length > 19) return false;
    let sum = 0;
    let dbl = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let d = Number(digits[i]);
      if (dbl) { d *= 2; if (d > 9) d -= 9; }
      sum += d;
      dbl = !dbl;
    }
    return sum % 10 === 0;
  }

  function formatCardNumber(value) {
    return String(value).replace(/\D/g, "").slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ");
  }

  function formatExpiry(value) {
    const d = String(value).replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? d.slice(0, 2) + " / " + d.slice(2) : d;
  }

  function isExpiryValid(value, now) {
    const d = String(value).replace(/\D/g, "");
    if (d.length !== 4) return false;
    const m = Number(d.slice(0, 2));
    const y = 2000 + Number(d.slice(2));
    if (m < 1 || m > 12) return false;
    const ref = now || new Date();
    return y > ref.getFullYear() || (y === ref.getFullYear() && m >= ref.getMonth() + 1);
  }

  function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value).trim());
  }

  return {
    SIGNS, LIFE_PATH, isValidDate, getSign, getSignById, lifePath, formatPrice, addDays,
    formatDateFr, yearlySavings, luhn, formatCardNumber, formatExpiry, isExpiryValid, isEmail
  };
});
