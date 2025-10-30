#!/usr/bin/env node
// Using global fetch (available in Node 18+)

const BASE = process.env.BASE_URL || "http://localhost:3000";
const email = "seed.user+test@local";
const password = "Test@1234";

async function run() {
  try {
    console.log("Logging in as", email);
    const loginRes = await fetch(`${BASE}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const loginBody = await loginRes.json().catch(() => null);
    console.log("Login status:", loginRes.status);
    console.log("Login body:", loginBody);
    if (!loginRes.ok) process.exitCode = 2;

    const token = loginBody && loginBody.token;
    if (!token) {
      console.error("No token returned; aborting GET /categories");
      return;
    }

    console.log("\nUsing token to fetch /categories");
    const catRes = await fetch(`${BASE}/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const catBody = await catRes.json().catch(() => null);
    console.log("GET /categories status:", catRes.status);
    console.log("GET /categories body:", JSON.stringify(catBody, null, 2));
  } catch (err) {
    console.error("Error during API check:", err.message || err);
    process.exitCode = 2;
  }
}

run();
