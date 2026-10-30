const test = require("node:test");
const assert = require("node:assert/strict");
const A = require("../js/astro.js");

test("signe solaire : bornes de chaque signe", () => {
  const cases = [
    [1, 1, "capricorne"], [1, 19, "capricorne"], [1, 20, "verseau"], [2, 18, "verseau"], [2, 19, "poissons"],
    [3, 20, "poissons"], [3, 21, "belier"], [4, 19, "belier"], [4, 20, "taureau"], [5, 20, "taureau"],
    [5, 21, "gemeaux"], [6, 20, "gemeaux"], [6, 21, "cancer"], [7, 22, "cancer"], [7, 23, "lion"],
    [8, 22, "lion"], [8, 23, "vierge"], [9, 22, "vierge"], [9, 23, "balance"], [10, 22, "balance"],
    [10, 23, "scorpion"], [11, 21, "scorpion"], [11, 22, "sagittaire"], [12, 21, "sagittaire"],
    [12, 22, "capricorne"], [12, 31, "capricorne"]
  ];
  for (const [m, d, id] of cases) assert.equal(A.getSign(m, d).id, id, `${d}/${m}`);
});

test("12 signes complets", () => {
  assert.equal(A.SIGNS.length, 12);
  for (const s of A.SIGNS) {
    for (const k of ["name", "glyph", "element", "dates", "cover", "trait", "match"]) assert.ok(s[k], `${s.id}.${k}`);
    assert.equal(s.words.length, 3);
    assert.ok(A.SIGNS.some((x) => x.name === s.match), `match ${s.match}`);
  }
});

test("dates valides / invalides", () => {
  assert.ok(A.isValidDate(29, 2, 1984));
  assert.ok(!A.isValidDate(29, 2, 1985));
  assert.ok(!A.isValidDate(31, 4, 1990));
});

test("chemin de vie : réduction et nombres maîtres", () => {
  assert.equal(A.lifePath(14, 11, 1984).number, 11); // 1+4+1+1+1+9+8+4 = 29 → 11 (maître, conservé)
  assert.equal(A.lifePath(1, 1, 2000).number, 4);    // 1+1+2 = 4
  assert.equal(A.lifePath(9, 9, 1999).number, 1);    // 46 → 10 → 1
  assert.equal(A.lifePath(9, 9, 1999).label, "La pionnière");
});

test("prix et économies", () => {
  assert.equal(A.formatPrice(34.99), "34,99 €");
  assert.equal(A.formatPrice(0), "0,00 €");
  assert.equal(A.yearlySavings(6.99, 34.99), 90);
});

test("carte : Luhn, formatage, expiration", () => {
  assert.ok(A.luhn("4242 4242 4242 4242"));
  assert.ok(!A.luhn("4242 4242 4242 4241"));
  assert.equal(A.formatCardNumber("4242424242424242"), "4242 4242 4242 4242");
  assert.equal(A.formatExpiry("1228"), "12 / 28");
  const now = new Date(2026, 9, 30);
  assert.ok(A.isExpiryValid("10 / 26", now));
  assert.ok(!A.isExpiryValid("09 / 26", now));
  assert.ok(!A.isExpiryValid("13 / 30", now));
});

test("e-mail", () => {
  assert.ok(A.isEmail("claire@exemple.fr"));
  assert.ok(!A.isEmail("claire@exemple"));
  assert.ok(!A.isEmail("claire exemple.fr"));
});
