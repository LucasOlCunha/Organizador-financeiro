#!/usr/bin/env node
// Quick check: login as seed user, create one transaction, then list transactions
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
    if (!token) return;

    // create a transaction
    console.log("\nCreating a transaction...");
    const createRes = await fetch(`${BASE}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        descricao: "Teste API",
        valor: 12.5,
        tipo: "despesa",
      }),
    });
    const createBody = await createRes.json().catch(() => null);
    console.log("Create status:", createRes.status);
    console.log("Create body:", createBody);

    // list transactions
    console.log("\nListing transactions...");
    const listRes = await fetch(`${BASE}/transactions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const listBody = await listRes.json().catch(() => null);
    console.log("List status:", listRes.status);
    console.log("List body:", JSON.stringify(listBody, null, 2));
  } catch (err) {
    console.error("Error in check:", err.message || err);
    process.exitCode = 2;
  }
}

run();
