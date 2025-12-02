#!/usr/bin/env node
// Login, create a category, delete it, then verify it's gone
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
    if (!loginRes.ok) throw new Error("Login failed");
    const token = loginBody.token;

    console.log("Creating category to delete...");
    const createRes = await fetch(`${BASE}/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nome: "Temp Cat", tipo: "despesa" }),
    });
    const created = await createRes.json();
    if (!createRes.ok)
      throw new Error("Create failed: " + JSON.stringify(created));
    console.log("Created:", created);

    const id = created.id;
    console.log("Deleting category id=", id);
    const delRes = await fetch(`${BASE}/categories/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const delBody = await delRes.json().catch(() => null);
    console.log("Delete status:", delRes.status, "body:", delBody);
    if (!delRes.ok) throw new Error("Delete failed");

    console.log("Verifying deletion...");
    const getRes = await fetch(`${BASE}/categories/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Get after delete status:", getRes.status);
    if (getRes.status === 404) console.log("Deletion verified (404).");
    else console.log("Unexpected get status:", getRes.status);
  } catch (err) {
    console.error("Error:", err.message || err);
    process.exitCode = 2;
  }
}

run();
