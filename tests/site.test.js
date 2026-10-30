/* Vérifie que la page référence des fichiers existants et que les ids utilisés par app.js existent */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "js/app.js"), "utf8");

test("tous les fichiers locaux référencés existent", () => {
  const refs = [...(html + app).matchAll(/(?:src|href)=\\?"((?:assets|css|js)\/[^"\\]+)/g)].map((m) => m[1]);
  const tabImgs = [...app.matchAll(/img: "(p\d)"/g)].map((m) => `assets/screens/${m[1]}.png`);
  const all = [...new Set(refs.concat(tabImgs))];
  assert.ok(all.length > 8);
  for (const r of all) assert.ok(fs.existsSync(path.join(root, r)), r);
});

test("les ids ciblés par app.js existent dans la page", () => {
  const ids = [...app.matchAll(/\$\("#([\w-]+)"\)/g)].map((m) => m[1]);
  for (const id of new Set(ids)) assert.ok(html.includes(`id="${id}"`), id);
});

test("le logo Grazia apparaît partout", () => {
  const count = (html.match(/grazia-logo-(black|white)\.svg/g) || []).length + (app.match(/grazia-logo-(black|white)\.svg/g) || []).length;
  assert.ok(count >= 10, `logo présent ${count} fois`);
});

test("prix conformes", () => {
  const cfg = fs.readFileSync(path.join(root, "js/config.js"), "utf8");
  assert.match(cfg, /price: 34\.99, period: "an", trialDays: 7/);
  assert.match(cfg, /price: 6\.99, period: "semaine", trialDays: 0/);
  assert.match(cfg, /com\.natal\.chart\.astrology/);
});

test("aucun secret dans le code", () => {
  for (const f of ["index.html", "js/app.js", "js/config.js"]) {
    const s = fs.readFileSync(path.join(root, f), "utf8");
    assert.doesNotMatch(s, /(sk|pk|rk)_(live|test)_[A-Za-z0-9]{8,}/, f);
  }
});
