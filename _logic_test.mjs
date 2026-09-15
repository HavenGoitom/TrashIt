// Quick logic validation for title matching
function normalizeTitle(title) {
    if (!title) return [];
    let t = String(title)
        .toLowerCase()
        .trim()
        .replace(/\b(for\s+)?sale\b/g, "")
        .replace(/\bwanted\b|\blooking\s+for\b|\bneed\b/g, "")
        .replace(/\s+/g, " ")
        .trim();

    const tokens = t
        .split(/\s+/)
        .map((w) => w.replace(/[^a-z0-9]/g, ""))
        .filter((w) => w && w.length >= 2)
        .map((w) => {
            if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) {
                return w.slice(0, -1);
            }
            return w;
        });

    return tokens;
}

function areTitlesSimilar(titleA, titleB) {
    const wordsA = normalizeTitle(titleA);
    const wordsB = normalizeTitle(titleB);
    if (wordsA.length === 0 || wordsB.length === 0) return false;

    if (wordsA.length === wordsB.length) {
        const setA = new Set(wordsA);
        const allMatch = wordsB.every((w) => setA.has(w));
        if (allMatch) return true;
    }

    const small = wordsA.length <= wordsB.length ? wordsA : wordsB;
    const bigSet = new Set(wordsA.length <= wordsB.length ? wordsB : wordsA);
    let overlap = 0;
    for (const w of small) {
        if (bigSet.has(w)) overlap++;
    }
    return overlap >= small.length / 2;
}

const tests = [
    ["wine", "wine", true, "1: Buy wine <-> Sell wine"],
    ["wine bottle", "wine", true, "2: Buy wine bottle <-> Sell wine"],
    ["wine", "wine bottle", true, "3: Buy wine <-> Sell wine bottle"],
    ["red wine", "wine", true, "4: Buy red wine <-> Sell wine"],
    ["wine bottle", "red wine bottle", true, "5: Buy wine bottle <-> Sell red wine bottle"],
    ["old furniture", "electronics", false, "6: Unrelated should NOT match"],
    ["wine", "electronics", false, "6b: Unrelated should NOT match"],
    ["WINE", "  Wine  ", true, "10: Capitalization and spacing"],
];

let pass = 0;
for (const [a, b, expected, name] of tests) {
    const result = areTitlesSimilar(a, b);
    const ok = result === expected;
    if (ok) pass++;
    console.log(`[${ok ? 'PASS' : 'FAIL'}] ${name} => areTitlesSimilar("${a}", "${b}") = ${result} (expected ${expected})`);
    console.log(`  normalize("${a}") = ${JSON.stringify(normalizeTitle(a))}`);
    console.log(`  normalize("${b}") = ${JSON.stringify(normalizeTitle(b))}`);
}
console.log(`\n${pass}/${tests.length} logic tests passed`);
