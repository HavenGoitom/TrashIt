// Shared helpers for the TrashIt E2E test suite.
import { io } from "socket.io-client";

export const API_BASE = (process.env.TRISHIT_API_URL || "https://trashit-st6y.onrender.com").replace(/\/+$/, "");
export const SOCKET_URL = (process.env.TRISHIT_SOCKET_URL || API_BASE).replace(/\/+$/, "");
export const MONGO = process.env.TRISHIT_TEST_MONGO || null;

export const RUN = Date.now().toString(36);
export const PREFIX = `e2e_${RUN}_`;

export const results = [];
export const total = { pass: 0, fail: 0, skip: 0 };

function expectable(v) {
  if (v === undefined) return "undefined";
  if (typeof v === "string") return v.slice(0, 300);
  const s = JSON.stringify(v);
  return s && s.length > 300 ? s.slice(0, 300) + "..." : s;
}

export function ok(group, name, expected, actual, extra) {
  results.push({ group, name, pass: true, expected: expectable(expected), actual: expectable(actual ?? expected), extra: extra ?? "" });
  total.pass++;
}
export function fail(group, name, expected, actual, extra) {
  results.push({ group, name, pass: false, expected: expectable(expected), actual: expectable(actual), extra: extra ?? "" });
  total.fail++;
}
export function skip(group, name, why) {
  results.push({ group, name, pass: null, expected: why, actual: "SKIPPED" });
  total.skip++;
}

// Generic HTTP request helper.
export async function request(method, path, body, token) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }
  return { status: res.status, data };
}

// Register a unique user; returns { rec, res }.
export const createdUsers = [];
export async function registerUser(tag) {
  const uname = PREFIX + (tag || "u") + Math.floor(Math.random() * 10000);
  const body = { username: uname, name: uname, email: `${uname}@example.com`, password: "Passw0rd!123" };
  // Retry up to 3 times on rate-limit / transient errors
  let r;
  for (let attempt = 1; attempt <= 3; attempt++) {
    r = await request("POST", "/api/auth/register", body);
    if (r.status === 201 || r.status === 200) break;
    if (r.status === 429 || r.status >= 500) {
      await new Promise((res) => setTimeout(res, 1500 * attempt));
      // Slightly mutate username/email to avoid duplicate conflict on retry
      body.username = uname + "_r" + attempt;
      body.email = `${body.username}@example.com`;
    } else {
      break;
    }
  }
  const rec = { tag: tag || "u", username: body.username, password: body.password, token: r.data?.token, user: r.data?.user };
  if (r.data?.user) createdUsers.push(rec);
  return { rec, res: r };
}

// Authenticated socket client.
export function connectSocket(token) {
  return io(SOCKET_URL, { auth: { token }, transports: ["websocket"], forceNew: true });
}

export async function waitFor(predicate, ms = 5000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    if (predicate()) return true;
    await new Promise((r) => setTimeout(r, 50));
  }
  return false;
}

export function postBody(type, overrides = {}) {
  return {
    title: "E2E Material " + RUN,
    description: "Automated E2E test post.",
    images: [],
    type, // "sell" | "buy"
    price: { fixed: 150 },
    quantity: { fixed: 10 },
    ...overrides,
  };
}