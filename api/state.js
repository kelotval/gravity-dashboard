import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const householdKey = process.env.HOUSEHOLD_KEY;

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("household_state")
      .select("state")
      .eq("household_key", householdKey)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ state: data?.state ?? null });
  }

  if (req.method === "POST") {
    const { state } = req.body || {};
    if (!state) return res.status(400).json({ error: "Missing state" });

    const { error } = await supabase
      .from("household_state")
      .upsert(
        {
          household_key: householdKey,
          state,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "household_key" }
      );

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
