const BASE = "https://wwlmkpmtojbnhiggltoa.supabase.co/functions/v1";

export async function getHouseholdState(householdKey, pin) {
  const res = await fetch(`${BASE}/household-get`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ householdKey, pin }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "household-get failed");
  return json?.state ?? null;
}

export async function upsertHouseholdState(householdKey, pin, state, setPinIfMissing = false) {
  const res = await fetch(`${BASE}/household-upsert`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ householdKey, pin, state, setPinIfMissing }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "household-upsert failed");
  return json;
}

