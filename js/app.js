/* Landing + parcours (quiz → couverture → offre → paiement) */
(function () {
  "use strict";

  const CFG = window.GRAZIA_CONFIG;
  const A = window.Astro;
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  const LOGO_W = '<img src="assets/grazia-logo-white.svg" alt="Grazia" class="cover-logo">';

  /* ---------- Couverture (hero, CTA final, résultat) ---------- */
  function coverHTML(opts) {
    const s = opts.sign;
    const today = new Date();
    const issue = MONTHS[today.getMonth()] + " " + today.getFullYear();
    return (
      '<div class="cover-top">' + LOGO_W + '<span class="cover-issue">Édition personnelle · ' + esc(issue) + "</span></div>" +
      '<span class="cover-glyph">' + s.glyph + "</span>" +
      '<div class="cover-lines">' +
      '<span class="cover-tag">Spécial ' + esc(s.name) + "</span>" +
      '<p class="cover-title">' + esc(opts.name) + "</p>" +
      '<p class="cover-headline">' + esc(s.cover) + "</p>" +
      '<ul class="cover-small"><li>Thème natal&nbsp;: ce que votre ascendant dit de vous</li><li>Tarot&nbsp;: la carte qui vous attend</li><li>Amour&nbsp;: le signe qui vous va vraiment</li></ul>' +
      "</div>" +
      '<div class="cover-foot"><span>' + esc(s.words.join(" · ")) + '</span><span class="cover-price">Offert</span></div>'
    );
  }

  /* ---------- Landing ---------- */
  function initLanding() {
    const now = new Date();
    const current = A.getSign(now.getMonth() + 1, now.getDate());
    $("#season-label").textContent = "Saison du " + current.name;
    $("#year").textContent = now.getFullYear();
    $("#hero-cover").innerHTML = coverHTML({ sign: current, name: "Vous" });
    $("#final-cover").innerHTML = coverHTML({ sign: A.getSignById("lion"), name: "Vous" });

    // Note / avis
    $("#rating-value").textContent = CFG.rating.value;
    $("#rating-source").textContent = CFG.rating.source;
    $("#rating-downloads").textContent = CFG.rating.downloads;
    $("#reviews").innerHTML = CFG.reviews.map((r) =>
      '<figure class="review"><span class="stars" aria-label="' + r.stars + ' sur 5">' + "★".repeat(r.stars) + '<span class="stars-off">' + "★".repeat(5 - r.stars) + "</span></span>" +
      "<blockquote>" + esc(r.text) + "</blockquote>" +
      "<figcaption><strong>" + esc(r.author) + "</strong> · " + esc(r.date) + "</figcaption></figure>"
    ).join("");

    $("#plans-page").innerHTML = plansHTML("page");
    bindPlans($("#plans-page"), (plan) => { state.plan = plan; openFunnel("pricing", "checkout"); });

    $$("[data-store-name]").forEach((el) => (el.textContent = CFG.storeAppName));
    $$("[data-store-badges]").forEach((el) => (el.innerHTML = storeBadgesHTML()));
    $$("[data-todo]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); toast("Page « " + a.textContent + " » à rédiger (modèle à compléter)."); }));

    $$("[data-open-quiz]").forEach((b) => b.addEventListener("click", () => openFunnel(b.dataset.openQuiz)));

    initTabs();
    initMobileCta();
    window.addEventListener("scroll", () => $("#topbar").classList.toggle("is-scrolled", window.scrollY > 12), { passive: true });
  }

  /* Barre d'action collante sur mobile : visible quand les boutons du hero et le CTA final sont hors écran */
  function initMobileCta() {
    const bar = $("#mobile-cta");
    if (!("IntersectionObserver" in window)) return;
    const visible = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
      const on = visible.size === 0 && window.scrollY > 200;
      bar.classList.toggle("is-on", on);
      bar.setAttribute("aria-hidden", String(!on));
      $("button", bar).tabIndex = on ? 0 : -1;
    });
    [".hero-ctas", ".final", ".footer"].forEach((sel) => io.observe($(sel)));
  }

  const TABS = [
    { img: "p3", alt: "Horoscope du jour", title: "Votre horoscope, chaque matin", text: "Un horoscope frais et personnalisé tous les jours&nbsp;: vos zones de focus, des conseils concrets, vos chiffres porte-bonheur, votre humeur et votre match amoureux du jour." },
    { img: "p2", alt: "Thème natal", title: "Votre thème natal, enfin lisible", text: "La position exacte des planètes au moment de votre naissance, vos maisons, vos aspects. Touchez un élément&nbsp;: l’app vous explique ce qu’il dit de vous." },
    { img: "p5", alt: "Carte du jour", title: "La carte du jour", text: "Tirez votre carte chaque matin ou faites un tirage «&nbsp;amour&nbsp;» ou «&nbsp;futur proche&nbsp;». Chaque lame est expliquée avec soin." },
    { img: "p7", alt: "Astrologue IA", title: "Une astrologue dans votre poche", text: "Une question sur l’amour, le travail, un choix à faire&nbsp;? Écrivez-la, votre astrologue IA vous répond à partir de votre thème, à toute heure." },
    { img: "p4", alt: "Compatibilité", title: "Le match parfait", text: "Comparez votre signe avec celui de votre partenaire, d’une amie ou d’un crush, et découvrez vos meilleures compatibilités." }
  ];

  function initTabs() {
    const tabs = $$(".tabs [role=tab]");
    const show = (i) => {
      tabs.forEach((t, j) => t.setAttribute("aria-selected", String(i === j)));
      const t = TABS[i];
      const img = $("#tab-img");
      img.classList.add("is-swapping");
      setTimeout(() => {
        img.src = "assets/screens/" + t.img + ".png";
        img.alt = "Écran " + t.alt + " de l’application";
        img.classList.remove("is-swapping");
      }, 180);
      $("#tab-text").innerHTML = "<h3>" + t.title + "</h3><p>" + t.text + "</p>";
    };
    tabs.forEach((t) => t.addEventListener("click", () => show(Number(t.dataset.tab))));
    show(0);
  }

  function storeBadgesHTML() {
    const play = '<a class="store-badge" href="' + esc(CFG.playStoreUrl) + '" target="_blank" rel="noopener">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 2.6v18.8c0 .4.4.6.7.4l10.6-9.4a.5.5 0 0 0 0-.8L4.7 2.2c-.3-.2-.7 0-.7.4Zm12.8 7.3-2.4 2.1 2.4 2.1 3.4-1.9a.5.5 0 0 0 0-.4l-3.4-1.9Z"/></svg>' +
      "<span><small>Disponible sur</small>Google Play</span></a>";
    const apple = CFG.appStoreUrl
      ? '<a class="store-badge" href="' + esc(CFG.appStoreUrl) + '" target="_blank" rel="noopener">'
      : '<a class="store-badge is-disabled" aria-disabled="true" title="Lien App Store à venir">';
    const appleInner = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.4 12.6c0-2.4 2-3.5 2-3.6-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.8-3.5.8s-1.8-.8-3-.8C6.9 7.3 5.4 8.2 4.6 9.7c-1.7 2.9-.4 7.2 1.2 9.6.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8s1.9.8 3.1.8c1.3 0 2.1-1.2 2.9-2.4.9-1.3 1.3-2.6 1.3-2.7 0 0-2.6-1-2.8-4ZM14.1 5.6c.6-.8 1.1-1.9 1-3-.9 0-2.1.6-2.7 1.4-.6.7-1.1 1.8-1 2.9 1 .1 2.1-.5 2.7-1.3Z"/></svg>' +
      "<span><small>" + (CFG.appStoreUrl ? "Télécharger sur" : "Bientôt sur") + "</small>App Store</span></a>";
    return play + apple + appleInner;
  }

  /* ---------- Offres ---------- */
  function plansHTML(ctx) {
    const y = CFG.plans.yearly, w = CFG.plans.weekly;
    const save = A.yearlySavings(w.price, y.price);
    const perWeek = A.formatPrice(y.price / 52);
    const sel = state.plan;
    return (
      '<div class="plans-grid" role="radiogroup" aria-label="Choix de l’abonnement">' +
      '<label class="plan' + (sel === "yearly" ? " is-selected" : "") + '"><input type="radio" name="plan-' + ctx + '" value="yearly"' + (sel === "yearly" ? " checked" : "") + ">" +
      '<span class="plan-badge">' + y.trialDays + " jours offerts</span>" +
      '<span class="plan-name">' + y.label + "</span>" +
      '<span class="plan-price">' + A.formatPrice(y.price) + "<small>/" + y.period + "</small></span>" +
      '<span class="plan-sub">soit ' + perWeek + " par semaine · <strong>−" + save + " %</strong></span>" +
      '<span class="plan-detail">0&nbsp;€ aujourd’hui, puis ' + A.formatPrice(y.price) + " par an</span></label>" +
      '<label class="plan' + (sel === "weekly" ? " is-selected" : "") + '"><input type="radio" name="plan-' + ctx + '" value="weekly"' + (sel === "weekly" ? " checked" : "") + ">" +
      '<span class="plan-name">' + w.label + "</span>" +
      '<span class="plan-price">' + A.formatPrice(w.price) + "<small>/" + w.period + "</small></span>" +
      '<span class="plan-sub">Sans essai gratuit</span>' +
      '<span class="plan-detail">Renouvelé chaque semaine, sans engagement</span></label>' +
      "</div>" +
      '<button class="btn btn-ink btn-lg btn-block" data-plan-go>' + planCTA(sel) + "</button>" +
      '<p class="plans-legal">' + planLegal(sel) + "</p>"
    );
  }

  function planCTA(plan) {
    return plan === "yearly" ? "Commencer mon essai gratuit →" : "Continuer →";
  }

  function planLegal(plan) {
    const y = CFG.plans.yearly, w = CFG.plans.weekly;
    if (plan === "yearly") {
      const end = A.formatDateFr(A.addDays(new Date(), y.trialDays));
      return "Gratuit pendant " + y.trialDays + " jours, puis " + A.formatPrice(y.price) + " par an à partir du " + end + ". Annulable à tout moment avant cette date, sans frais.";
    }
    return A.formatPrice(w.price) + " aujourd’hui, puis chaque semaine. Résiliable à tout moment.";
  }

  function bindPlans(root, onGo) {
    $$("input[type=radio]", root).forEach((r) => r.addEventListener("change", () => {
      state.plan = r.value;
      $$(".plan", root).forEach((p) => p.classList.toggle("is-selected", $("input", p).checked));
      $("[data-plan-go]", root).textContent = planCTA(state.plan);
      $(".plans-legal", root).textContent = planLegal(state.plan);
      track("select_plan", { plan: state.plan });
    }));
    $("[data-plan-go]", root).addEventListener("click", () => onGo(state.plan));
  }

  /* ---------- Parcours ---------- */
  const state = {
    plan: "yearly", source: null, step: "name",
    name: "", day: "", month: "", year: "", time: "", timeUnknown: false, place: "",
    mood: null, priority: null, habit: null, email: ""
  };

  const QUIZ_STEPS = ["name", "birth", "time", "mood", "priority", "habit"];
  const ORDER = QUIZ_STEPS.concat(["loading", "result", "pricing", "checkout", "success"]);
  const history = [];

  const MOODS = [
    { id: "renaissance", label: "En pleine renaissance", icon: "✦", line: "Vous êtes en pleine mue — et ça se voit." },
    { id: "souffler", label: "J’ai besoin de souffler", icon: "☾", line: "Le ciel vous autorise enfin à ralentir." },
    { id: "amour", label: "Prête pour l’amour", icon: "♡", line: "Votre cœur est ouvert, les astres l’ont remarqué." },
    { id: "ambition", label: "Cap sur mes ambitions", icon: "↗", line: "Votre énergie est au sommet : c’est le moment d’oser." }
  ];
  const PRIORITIES = [
    { id: "amour", label: "Amour & couple", open: "Côté cœur, le ciel de la saison remet la tendresse au centre. Ce que vous n’osiez pas dire trouve enfin ses mots, et une relation importante entre dans une phase plus sincère.",
      locked: "Votre thème révèle une période clé autour de la prochaine nouvelle Lune : une conversation que vous repoussez pourrait tout changer. Votre maison V, celle des plaisirs et des rencontres, est particulièrement activée…" },
    { id: "carriere", label: "Carrière & argent", open: "Professionnellement, les planètes mettent en lumière votre savoir-faire. On vous remarque davantage — c’est le moment de demander ce que vous méritez.",
      locked: "Votre milieu du ciel indique une opportunité inattendue dans les semaines à venir. Saturne vous demande de structurer un projet que vous gardez pour vous depuis longtemps…" },
    { id: "bienetre", label: "Bien-être & énergie", open: "Votre corps vous parle, et cette saison vous invite à l’écouter. De nouvelles routines s’installent facilement : sommeil, mouvement, petits rituels rien qu’à vous.",
      locked: "Votre Lune natale montre que votre énergie se recharge surtout dans le calme et la beauté. Les prochains transits de Vénus favorisent un vrai renouveau…" },
    { id: "famille", label: "Famille & proches", open: "Les liens qui comptent se resserrent. Une discussion apaisée avec un proche ouvre un nouveau chapitre, plus léger, plus vrai.",
      locked: "Votre maison IV, celle du foyer, reçoit la visite de Jupiter : un projet de famille ou de maison pourrait prendre forme plus vite que prévu…" },
    { id: "moi", label: "Moi, d’abord", open: "Cette saison est la vôtre. Les astres vous encouragent à vous choisir, sans culpabilité : vos envies passent en premier, et tout le reste s’aligne.",
      locked: "Votre ascendant révèle une facette de vous que vous avez mise de côté. Mars active votre maison I : confiance, image, désir d’affirmation…" }
  ];
  const HABITS = [
    { id: "quotidien", label: "Je lis mon horoscope tous les matins" },
    { id: "parfois", label: "De temps en temps, par curiosité" },
    { id: "debutante", label: "Je découvre, mais ça m’intrigue" }
  ];

  function openFunnel(source, startStep) {
    state.source = source;
    history.length = 0;
    track("funnel_open", { source: source });
    const f = $("#funnel");
    f.hidden = false;
    document.body.classList.add("no-scroll");
    goTo(startStep || "name", true);
  }

  function closeFunnel() {
    $("#funnel").hidden = true;
    document.body.classList.remove("no-scroll");
    track("funnel_close", { step: state.step });
  }

  function goTo(step, fresh) {
    if (!fresh && state.step && state.step !== step && state.step !== "loading") history.push(state.step);
    state.step = step;
    const body = $("#funnel-body");
    body.classList.remove("is-in");
    body.innerHTML = RENDER[step]();
    body.scrollTop = 0;
    $("#funnel").scrollTop = 0;
    void body.offsetWidth; // relance l'animation d'entrée
    body.classList.add("is-in");
    if (BIND[step]) BIND[step](body);

    const qi = QUIZ_STEPS.indexOf(step);
    const pct = qi >= 0 ? ((qi + 1) / (QUIZ_STEPS.length + 1)) * 100 : 100;
    $("#funnel-progress").style.width = pct + "%";
    $("#funnel").dataset.step = step;
    $("#funnel-back").style.visibility = history.length && step !== "loading" && step !== "success" ? "visible" : "hidden";
    track("funnel_step", { step: step });

    const first = $("input:not([type=radio]):not([type=checkbox]), .choice", body);
    if (first && window.matchMedia("(min-width: 720px)").matches) first.focus({ preventScroll: true });
  }

  function back() {
    const prev = history.pop();
    if (prev) goTo(prev, true);
  }

  function stepHead(n, title, sub) {
    return '<p class="step-count">Question ' + n + " sur " + QUIZ_STEPS.length + "</p>" +
      '<h2 class="step-title" id="funnel-title">' + title + "</h2>" +
      (sub ? '<p class="step-sub">' + sub + "</p>" : "");
  }

  function choicesHTML(list, selected) {
    return '<div class="choices">' + list.map((c) =>
      '<button type="button" class="choice' + (selected === c.id ? " is-selected" : "") + '" data-id="' + c.id + '">' +
      (c.icon ? '<span class="choice-icon" aria-hidden="true">' + c.icon + "</span>" : "") +
      "<span>" + esc(c.label) + "</span></button>").join("") + "</div>";
  }

  function bindChoices(root, key, next) {
    $$(".choice", root).forEach((b) => b.addEventListener("click", () => {
      state[key] = b.dataset.id;
      $$(".choice", root).forEach((x) => x.classList.toggle("is-selected", x === b));
      setTimeout(() => goTo(next), 260);
    }));
  }

  function sign() {
    return A.getSign(Number(state.month), Number(state.day));
  }

  const RENDER = {
    name: () =>
      '<form class="step" data-form>' + stepHead(1, "Commençons par<br><em>votre prénom.</em>", "Il figurera sur votre couverture personnalisée.") +
      '<label class="field"><span class="field-label">Prénom</span><input name="name" autocomplete="given-name" maxlength="24" placeholder="Ex. Claire" value="' + esc(state.name) + '" required></label>' +
      '<p class="field-error" data-error></p>' +
      '<button class="btn btn-ink btn-lg btn-block">Continuer →</button></form>',

    birth: () => {
      const days = Array.from({ length: 31 }, (_, i) => i + 1);
      const y0 = new Date().getFullYear();
      const years = Array.from({ length: 90 }, (_, i) => y0 - 16 - i);
      const opt = (v, label, cur) => '<option value="' + v + '"' + (String(cur) === String(v) ? " selected" : "") + ">" + label + "</option>";
      return '<form class="step" data-form>' + stepHead(2, esc(state.name) + ", quand êtes-vous <em>née&nbsp;?</em>", "Votre date de naissance détermine votre signe solaire et votre chemin de vie.") +
        '<div class="field-row">' +
        '<label class="field"><span class="field-label">Jour</span><select name="day" required><option value="">—</option>' + days.map((d) => opt(d, d, state.day)).join("") + "</select></label>" +
        '<label class="field field--grow"><span class="field-label">Mois</span><select name="month" required><option value="">—</option>' + MONTHS.map((m, i) => opt(i + 1, m, state.month)).join("") + "</select></label>" +
        '<label class="field"><span class="field-label">Année</span><select name="year" required><option value="">—</option>' + years.map((y) => opt(y, y, state.year)).join("") + "</select></label>" +
        "</div>" +
        '<div class="sign-preview" data-sign-preview></div>' +
        '<p class="field-error" data-error></p>' +
        '<button class="btn btn-ink btn-lg btn-block">Continuer →</button></form>';
    },

    time: () =>
      '<form class="step" data-form>' + stepHead(3, "L’heure et le lieu<br><em>de votre naissance.</em>", "Ils servent à calculer votre ascendant et votre Lune dans l’app. Facultatif, mais tellement plus précis.") +
      '<div class="field-row">' +
      '<label class="field"><span class="field-label">Heure</span><input type="time" name="time" value="' + esc(state.time) + '"' + (state.timeUnknown ? " disabled" : "") + "></label>" +
      '<label class="field field--grow"><span class="field-label">Ville de naissance</span><input name="place" autocomplete="address-level2" maxlength="60" placeholder="Ex. Lyon" value="' + esc(state.place) + '"></label>' +
      "</div>" +
      '<label class="check"><input type="checkbox" name="unknown"' + (state.timeUnknown ? " checked" : "") + "><span>Je ne connais pas mon heure de naissance</span></label>" +
      '<button class="btn btn-ink btn-lg btn-block">Continuer →</button>' +
      '<button type="button" class="btn-link" data-skip>Passer cette étape</button></form>',

    mood: () => '<div class="step">' + stepHead(4, "En ce moment,<br><em>vous êtes plutôt…</em>") + choicesHTML(MOODS, state.mood) + "</div>",

    priority: () => '<div class="step">' + stepHead(5, "Votre priorité pour<br><em>les trois prochains mois&nbsp;?</em>") + choicesHTML(PRIORITIES, state.priority) + "</div>",

    habit: () => '<div class="step">' + stepHead(6, "Et vous, l’astrologie,<br><em>c’est…</em>") + choicesHTML(HABITS, state.habit) + "</div>",

    loading: () =>
      '<div class="step step--center loading">' +
      '<div class="orbit" aria-hidden="true"><span class="orbit-glyph">' + sign().glyph + '</span><i></i><i></i><i></i></div>' +
      '<h2 class="step-title" id="funnel-title">Nous alignons<br><em>vos planètes…</em></h2>' +
      '<ul class="loading-list">' +
      "<li>Calcul de votre signe solaire</li><li>Lecture de votre chemin de vie</li><li>Tirage de votre carte du jour</li><li>Mise en page de votre couverture</li>" +
      "</ul></div>",

    result: () => {
      const s = sign();
      const lp = A.lifePath(Number(state.day), Number(state.month), Number(state.year));
      const mood = MOODS.find((m) => m.id === state.mood) || MOODS[0];
      const prio = PRIORITIES.find((p) => p.id === state.priority) || PRIORITIES[4];
      return '<div class="step step--wide result">' +
        '<div class="result-cover"><div class="cover cover--result">' + coverHTML({ sign: s, name: state.name }) + "</div></div>" +
        '<div class="result-copy">' +
        '<p class="kicker">Votre aperçu astral</p>' +
        '<h2 class="step-title" id="funnel-title">' + esc(state.name) + ", vous êtes <em>" + esc(s.name) + ".</em></h2>" +
        '<p class="result-mood">' + esc(mood.line) + "</p>" +
        '<dl class="facts">' +
        "<div><dt>Élément</dt><dd>" + s.element + "</dd></div>" +
        "<div><dt>Chemin de vie</dt><dd>" + lp.number + " · " + lp.label + "</dd></div>" +
        "<div><dt>Meilleur match</dt><dd>" + s.match + "</dd></div>" +
        "</dl>" +
        '<p class="result-text">' + s.trait + "</p>" +
        '<div class="reading"><h3>' + esc(prio.label) + "</h3><p>" + prio.open + '</p><p class="reading-locked">' + prio.locked + "</p>" +
        '<div class="reading-lock"><span aria-hidden="true">🔒</span> La suite de votre lecture vous attend dans l’app</div></div>' +
        '<button class="btn btn-ink btn-lg btn-block" data-next>Débloquer mon thème complet →</button>' +
        '<p class="fine">Ascendant, Lune, maisons, aspects, tarot et astrologue IA inclus.</p>' +
        "</div></div>";
    },

    pricing: () =>
      '<div class="step step--mid">' +
      '<p class="kicker kicker--center">' + (state.name ? esc(state.name) + ", votre" : "Votre") + " thème complet est prêt</p>" +
      '<h2 class="step-title step-title--center" id="funnel-title">Choisissez <em>votre formule.</em></h2>' +
      '<ul class="perks"><li>Thème natal complet &amp; ascendant</li><li>Horoscope quotidien personnalisé</li><li>Astrologue IA illimité</li><li>Tarot, compatibilité, Lune</li></ul>' +
      '<div class="plans plans--funnel">' + plansHTML("funnel") + "</div></div>",

    checkout: () => {
      const p = CFG.plans[state.plan];
      const trial = p.trialDays > 0;
      const dueToday = trial ? A.formatPrice(0) : A.formatPrice(p.price);
      return '<div class="step step--wide checkout">' +
        '<form class="checkout-form" data-checkout novalidate>' +
        '<h2 class="step-title" id="funnel-title">Finalisez <em>votre inscription.</em></h2>' +
        '<fieldset><legend><span>1</span> Votre compte</legend>' +
        '<p class="legend-sub">Ces identifiants vous serviront à vous connecter dans l’app.</p>' +
        '<label class="field"><span class="field-label">E-mail</span><input type="email" name="email" autocomplete="email" placeholder="vous@exemple.fr" value="' + esc(state.email) + '" required></label>' +
        '<label class="field"><span class="field-label">Mot de passe</span><span class="pw"><input type="password" name="password" autocomplete="new-password" minlength="8" placeholder="8 caractères minimum" required><button type="button" class="pw-toggle" data-pw aria-label="Afficher le mot de passe">Afficher</button></span></label>' +
        "</fieldset>" +
        '<fieldset><legend><span>2</span> Paiement</legend>' +
        '<div class="wallets"><button type="button" class="wallet" data-wallet>Apple Pay</button><button type="button" class="wallet wallet--g" data-wallet>Google Pay</button></div>' +
        '<div class="or"><span>ou par carte</span></div>' +
        // Champs carte de démonstration : à remplacer par Stripe Elements / l'embed Whop (aucune donnée n'est envoyée)
        '<div class="card-box" data-card-mount>' +
        '<label class="field"><span class="field-label">Numéro de carte</span><input name="card" inputmode="numeric" autocomplete="cc-number" placeholder="1234 1234 1234 1234" required></label>' +
        '<div class="field-row">' +
        '<label class="field field--grow"><span class="field-label">Expiration</span><input name="exp" inputmode="numeric" autocomplete="cc-exp" placeholder="MM / AA" required></label>' +
        '<label class="field field--grow"><span class="field-label">CVC</span><input name="cvc" inputmode="numeric" autocomplete="cc-csc" placeholder="123" maxlength="4" required></label>' +
        "</div>" +
        '<label class="field"><span class="field-label">Nom sur la carte</span><input name="holder" autocomplete="cc-name" placeholder="Prénom Nom" required></label>' +
        "</div>" +
        '<p class="secure"><span aria-hidden="true">🔒</span> Paiement sécurisé et chiffré</p>' +
        "</fieldset>" +
        '<label class="check"><input type="checkbox" name="terms" required><span>J’accepte les <a href="#" data-todo-inline>CGV</a> et la <a href="#" data-todo-inline>politique de confidentialité</a>.</span></label>' +
        '<p class="field-error" data-error></p>' +
        '<button class="btn btn-ink btn-lg btn-block" data-pay>' + (trial ? "Démarrer mon essai gratuit" : "Payer " + A.formatPrice(p.price)) + "</button>" +
        '<p class="checkout-legal">' + planLegal(state.plan) + "</p>" +
        '<p class="demo-note">Mode démonstration&nbsp;: aucun paiement n’est effectué.</p>' +
        "</form>" +
        '<aside class="summary">' +
        '<img src="assets/grazia-logo-black.svg" alt="Grazia" class="summary-logo">' +
        '<p class="summary-title">Grazia Astrologie · Premium</p>' +
        '<div class="summary-plan"><span>Abonnement ' + p.label.toLowerCase() + '</span><button type="button" class="btn-link" data-change-plan>Modifier</button></div>' +
        '<div class="summary-line"><span>' + p.label + "</span><span>" + A.formatPrice(p.price) + "/" + p.period + "</span></div>" +
        (trial ? '<div class="summary-line summary-line--gold"><span>Essai gratuit ' + p.trialDays + " jours</span><span>−" + A.formatPrice(p.price) + "</span></div>" : "") +
        '<div class="summary-total"><span>À payer aujourd’hui</span><span>' + dueToday + "</span></div>" +
        '<p class="summary-legal">' + planLegal(state.plan) + "</p>" +
        "</aside></div>";
    },

    success: () => {
      const p = CFG.plans[state.plan];
      return '<div class="step step--center success">' +
        '<img src="assets/grazia-logo-black.svg" alt="Grazia" class="success-logo">' +
        '<span class="success-check" aria-hidden="true">✓</span>' +
        '<h2 class="step-title" id="funnel-title">Bienvenue' + (state.name ? ", " + esc(state.name) : "") + ".<br><em>Votre ciel vous attend.</em></h2>" +
        '<p class="step-sub">' + (p.trialDays ? "Votre essai gratuit de " + p.trialDays + " jours a commencé." : "Votre abonnement premium est actif.") +
        " Téléchargez l’app et connectez-vous avec <strong>" + esc(state.email) + "</strong>.</p>" +
        '<div class="store-badges store-badges--dark">' + storeBadgesHTML() + "</div>" +
        '<p class="fine">Recherchez «&nbsp;' + esc(CFG.storeAppName) + "&nbsp;» dans votre store.</p></div>";
    }
  };

  const BIND = {
    name: (root) => bindForm(root, (f) => {
      const v = f.name.value.trim();
      if (!v) return "Indiquez votre prénom.";
      state.name = v.charAt(0).toUpperCase() + v.slice(1);
      goTo("birth");
    }),

    birth: (root) => {
      const f = $("form", root);
      const preview = () => {
        const d = Number(f.day.value), m = Number(f.month.value);
        const el = $("[data-sign-preview]", root);
        if (d && m) {
          const s = A.getSign(m, d);
          el.innerHTML = '<span class="sp-glyph">' + s.glyph + "</span><span>Signe solaire&nbsp;: <strong>" + s.name + "</strong> · " + s.dates + "</span>";
          el.classList.add("is-on");
        } else el.classList.remove("is-on");
      };
      ["day", "month", "year"].forEach((k) => f[k].addEventListener("change", preview));
      preview();
      bindForm(root, () => {
        const d = Number(f.day.value), m = Number(f.month.value), y = Number(f.year.value);
        if (!d || !m || !y) return "Complétez votre date de naissance.";
        if (!A.isValidDate(d, m, y)) return "Cette date n’existe pas.";
        Object.assign(state, { day: d, month: m, year: y });
        goTo("time");
      });
    },

    time: (root) => {
      const f = $("form", root);
      f.unknown.addEventListener("change", () => { f.time.disabled = f.unknown.checked; if (f.unknown.checked) f.time.value = ""; });
      $("[data-skip]", root).addEventListener("click", () => goTo("mood"));
      bindForm(root, () => {
        Object.assign(state, { time: f.time.value, timeUnknown: f.unknown.checked, place: f.place.value.trim() });
        goTo("mood");
      });
    },

    mood: (root) => bindChoices(root, "mood", "priority"),
    priority: (root) => bindChoices(root, "priority", "habit"),
    habit: (root) => bindChoices(root, "habit", "loading"),

    loading: (root) => {
      const items = $$(".loading-list li", root);
      items.forEach((li, i) => setTimeout(() => li.classList.add("is-done"), 550 * (i + 1)));
      setTimeout(() => { if (state.step === "loading") goTo("result"); }, 550 * items.length + 600);
    },

    result: (root) => {
      track("quiz_complete", { sign: sign().id, mood: state.mood, priority: state.priority, habit: state.habit });
      $("[data-next]", root).addEventListener("click", () => goTo("pricing"));
    },

    pricing: (root) => bindPlans(root, () => goTo("checkout")),

    checkout: (root) => {
      const f = $("form", root);
      f.card.addEventListener("input", () => { f.card.value = A.formatCardNumber(f.card.value); });
      f.exp.addEventListener("input", (e) => {
        if (e.inputType === "deleteContentBackward") return;
        f.exp.value = A.formatExpiry(f.exp.value);
      });
      f.cvc.addEventListener("input", () => { f.cvc.value = f.cvc.value.replace(/\D/g, "").slice(0, 4); });
      $("[data-pw]", root).addEventListener("click", (e) => {
        const show = f.password.type === "password";
        f.password.type = show ? "text" : "password";
        e.currentTarget.textContent = show ? "Masquer" : "Afficher";
      });
      $("[data-change-plan]", root).addEventListener("click", () => goTo("pricing"));
      $$("[data-wallet]", root).forEach((b) => b.addEventListener("click", () => toast("Apple Pay / Google Pay seront activés avec Stripe ou Whop.")));
      $$("[data-todo-inline]", root).forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); toast("Document à rédiger (modèle à compléter)."); }));
      $$("input", f).forEach((i) => i.addEventListener("input", () => i.closest(".field") && i.closest(".field").classList.remove("is-invalid")));

      f.addEventListener("submit", (e) => {
        e.preventDefault();
        const errors = [];
        const bad = (name, msg) => { const el = f[name].closest(".field"); if (el) el.classList.add("is-invalid"); errors.push(msg); };
        if (!A.isEmail(f.email.value)) bad("email", "Adresse e-mail invalide.");
        if (f.password.value.length < 8) bad("password", "Mot de passe : 8 caractères minimum.");
        if (!A.luhn(f.card.value)) bad("card", "Numéro de carte invalide.");
        if (!A.isExpiryValid(f.exp.value)) bad("exp", "Date d’expiration invalide.");
        if (!/^\d{3,4}$/.test(f.cvc.value)) bad("cvc", "CVC invalide.");
        if (!f.holder.value.trim()) bad("holder", "Indiquez le nom sur la carte.");
        if (!f.terms.checked) errors.push("Merci d’accepter les CGV.");
        const errEl = $("[data-error]", root);
        errEl.textContent = errors[0] || "";
        if (errors.length) return;

        state.email = f.email.value.trim();
        const btn = $("[data-pay]", root);
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner" aria-hidden="true"></span> Traitement…';
        submitCheckout({ plan: state.plan, email: state.email, password: f.password.value, profile: profilePayload() })
          .then(() => { track("purchase", { plan: state.plan, value: CFG.plans[state.plan].price, currency: "EUR" }); goTo("success"); })
          .catch((err) => { btn.disabled = false; btn.textContent = "Réessayer"; errEl.textContent = err.message || "Le paiement a échoué."; });
      });
    }
  };

  function profilePayload() {
    return {
      name: state.name, birthDate: [state.year, state.month, state.day].join("-"), birthTime: state.time || null,
      birthPlace: state.place || null, sign: state.month ? sign().id : null, mood: state.mood, priority: state.priority, habit: state.habit
    };
  }

  /* À REMPLACER par l'appel backend (Stripe ou Whop) : création du compte e-mail + mot de passe,
     puis abonnement. Les données de carte ne doivent jamais transiter par notre serveur :
     utiliser Stripe Elements / Checkout ou l'embed Whop à la place des champs de démo. */
  function submitCheckout(payload) {
    void payload;
    return new Promise((resolve) => setTimeout(resolve, 1400));
  }

  function bindForm(root, onSubmit) {
    const f = $("form", root);
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const err = onSubmit(f);
      $("[data-error]", root) && ($("[data-error]", root).textContent = err || "");
    });
  }

  let toastTimer;
  function toast(msg) {
    let t = $(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-on"), 2800);
  }

  /* ---------- Démarrage ---------- */
  initLanding();
  $("#funnel-close").addEventListener("click", closeFunnel);
  $("#funnel-back").addEventListener("click", back);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("#funnel").hidden) closeFunnel(); });

  // Aperçu direct d'une étape pour relecture : index.html?step=result
  const preview = new URLSearchParams(location.search).get("step");
  if (preview && RENDER[preview]) {
    Object.assign(state, { name: "Claire", day: 14, month: 11, year: 1984, mood: "renaissance", priority: "amour", habit: "quotidien", email: "claire@exemple.fr" });
    openFunnel("preview", preview);
    if (preview !== "name") history.push("name");
    $("#funnel-back").style.visibility = "visible";
  }
})();
