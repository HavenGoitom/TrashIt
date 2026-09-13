// TrashIt E2E test runner — executes all groups and writes a report.
// Run from the Frontend dir:  node tests/e2e.test.mjs
import { results, total, API_BASE } from "./lib.mjs";
import fs from "node:fs";
import path from "node:path";

import { testAuthentication, testUserRole } from "./groups/auth.test.mjs";
import { testPosts, testPublicPosts, testSinglePost } from "./groups/posts.test.mjs";
import { testUpdateDelete } from "./groups/updates.test.mjs";
import { testFavorites } from "./groups/favorites.test.mjs";
import { testMessaging } from "./groups/messaging.test.mjs";
import { testSockets } from "./groups/sockets.test.mjs";
import { testNotifications } from "./groups/notifications.test.mjs";
import { testProfile } from "./groups/profile.test.mjs";
import { testReports } from "./groups/reports.test.mjs";
import { testAdmin } from "./groups/admin.test.mjs";
import { testAI } from "./groups/ai.test.mjs";
import { testMatches } from "./groups/matches.test.mjs";
import { testSecurity } from "./groups/security.test.mjs";
import { testErrors } from "./groups/errors.test.mjs";

const suites = [
  ["Authentication", testAuthentication],
  ["User Role", testUserRole],
  ["Posts", testPosts],
  ["Public Posts", testPublicPosts],
  ["Single Post", testSinglePost],
  ["Posts (Update/Delete)", testUpdateDelete],
  ["Favorites", testFavorites],
  ["Messaging", testMessaging],
  ["Sockets", testSockets],
  ["Notifications", testNotifications],
  ["Profile", testProfile],
  ["Reports", testReports],
  ["Admin", testAdmin],
  ["AI", testAI],
  ["Matches", testMatches],
  ["Security", testSecurity],
  ["Error Handling", testErrors],
];

async function runAll() {
  console.log("Running TrashIt E2E suite against:", API_BASE);
  const started = Date.now();

  for (const [label, fn] of suites) {
    console.log(`\n=== ${label} ===`);
    try {
      await fn();
    } catch (e) {
      results.push({ group: label, name: label + " threw", pass: false, expected: "no exception", actual: e?.message || String(e), extra: "" });
      total.fail++;
      console.log("  suite threw:", e?.message);
    }
    // Pause between suites to avoid rate limiting on shared/free-tier backends
    await new Promise((r) => setTimeout(r, 2000));
  }

  const elapsed = ((Date.now() - started) / 1000).toFixed(1);
  writeReport(elapsed);
}

function writeReport(elapsed) {
  const lines = [];
  lines.push("TrashIt End-to-End Test Report");
  lines.push("API: " + API_BASE);
  lines.push("Run: " + new Date().toISOString());
  lines.push(`Duration: ${elapsed}s`);
  lines.push(`TOTAL: ${total.pass + total.fail + total.skip}  PASSED: ${total.pass}  FAILED: ${total.fail}  SKIPPED: ${total.skip}`);
  lines.push("");

  const groups = {};
  for (const r of results) (groups[r.group] = groups[r.group] || []).push(r);

  for (const group of Object.keys(groups)) {
    const items = groups[group];
    const p = items.filter((i) => i.pass).length;
    const f = items.filter((i) => i.pass === false).length;
    const s = items.filter((i) => i.pass === null).length;
    lines.push(`## ${group}  (${p} pass / ${f} fail / ${s} skip)`);
    for (const i of items) {
      const mk = i.pass === true ? "PASS" : i.pass === false ? "FAIL" : "SKIP";
      lines.push(`  [${mk}] ${i.name}`);
      if (i.pass === false) {
        lines.push(`         expected: ${i.expected}`);
        lines.push(`         actual:   ${i.actual}`);
        lines.push(`         extra:    ${i.extra}`);
      }
    }
    lines.push("");
  }

  lines.push("=== FAILURE SUMMARY ===");
  const failures = results.filter((r) => r.pass === false);
  for (const i of failures) {
    lines.push(`- [${i.group}] ${i.name} :: expected ${i.expected}, actual ${i.actual}`);
  }
  if (failures.length === 0) lines.push("(none)");
  lines.push("");

  const reportPath = path.resolve(process.cwd(), "tests", "e2e-REPORT.txt");
  fs.writeFileSync(reportPath, lines.join("\n"), "utf8");

  console.log(lines.join("\n"));
  console.log(`\nReport written to ${reportPath}`);
}

await runAll();