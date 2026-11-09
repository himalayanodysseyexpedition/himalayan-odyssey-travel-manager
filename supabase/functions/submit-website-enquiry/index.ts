const ADMIN_ID = "79482db3-a3f7-4773-bb8d-5a79c9d10237";
const ALLOWED_ORIGIN = "https://himalayanexpedition.co.in";
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Vary": "Origin",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

function getSecretKey(): string | null {
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (legacy) return legacy;
  try {
    const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
    return keys.default || null;
  } catch {
    return null;
  }
}

async function supabaseRequest(path: string, method: string, key: string, body?: unknown, prefer?: string) {
  const headers: Record<string, string> = {
    apikey: key,
    "Content-Type": "application/json",
  };
  // Legacy service_role keys are JWTs and need the Authorization header.
  // New sb_secret keys must be sent only as apikey.
  if (key.startsWith("eyJ")) headers.Authorization = `Bearer ${key}`;
  if (prefer) headers.Prefer = prefer;
  return await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function allowedRate(ip: string) {
  const now = Date.now();
  const current = rateBuckets.get(ip);
  if (!current || current.resetAt <= now) {
    rateBuckets.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
    if (rateBuckets.size > 2000) {
      for (const [key, value] of rateBuckets) if (value.resetAt <= now) rateBuckets.delete(key);
    }
    return true;
  }
  if (current.count >= 20) return false;
  current.count += 1;
  return true;
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get("origin");
  if (origin !== ALLOWED_ORIGIN) return new Response("Forbidden", { status: 403 });
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ saved: false, message: "Method not allowed." }, 405);

  const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!allowedRate(ip)) return json({ saved: false, message: "Please wait before sending another enquiry." }, 429);

  const raw = await request.text();
  if (raw.length > 12000) return json({ saved: false, message: "Enquiry is too large." }, 413);

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(raw);
  } catch {
    return json({ saved: false, message: "Invalid enquiry data." }, 400);
  }

  // Silent success for bots that fill the hidden honeypot field.
  if (typeof payload.website === "string" && payload.website.trim()) return json({ saved: true });

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const phone = typeof payload.phone === "string" ? payload.phone.replace(/\D/g, "") : "";
  const persons = Number(payload.persons);
  const destination = typeof payload.destination === "string" ? payload.destination.trim().slice(0, 300) : "";
  const travelDate = typeof payload.travelDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(payload.travelDate) ? payload.travelDate : null;
  const budget = Number(payload.budget);
  const sourceDetails = typeof payload.sourceDetails === "string" ? payload.sourceDetails.trim().slice(0, 300) : "Website enquiry";
  const notes = typeof payload.notes === "string" ? payload.notes.trim().slice(0, 5000) : "";

  if (name.length < 2 || name.length > 100 || !/^[6-9]\d{9}$/.test(phone) ||
      !Number.isInteger(persons) || persons < 1 || persons > 100 ||
      !destination || !Number.isFinite(budget) || budget < 0 || budget > 50000000) {
    return json({ saved: false, message: "Please check the enquiry details and try again." }, 400);
  }

  const url = Deno.env.get("SUPABASE_URL");
  const key = getSecretKey();
  if (!url || !key) return json({ saved: false, message: "The enquiry service is temporarily unavailable." }, 503);

  let customerId: string | null = null;
  try {
    const customerResponse = await supabaseRequest("customers?select=id", "POST", key, [{
      owner_id: ADMIN_ID,
      name,
      phone,
    }], "return=representation");

    if (!customerResponse.ok) throw new Error("Customer record could not be created.");
    const customerRows = await customerResponse.json();
    customerId = customerRows?.[0]?.id || null;
    if (!customerId) throw new Error("Customer record was not returned.");

    const leadResponse = await supabaseRequest("leads", "POST", key, [{
      owner_id: ADMIN_ID,
      customer_id: customerId,
      destination,
      travel_date: travelDate,
      travellers: persons,
      budget: Math.round(budget),
      source: "Website",
      source_details: sourceDetails,
      notes,
    }], "return=minimal");

    if (!leadResponse.ok) {
      await supabaseRequest(`customers?id=eq.${encodeURIComponent(customerId)}`, "DELETE", key);
      customerId = null;
      throw new Error("Lead record could not be created.");
    }

    return json({ saved: true });
  } catch {
    return json({ saved: false, message: "We could not save this enquiry to the CRM. Please send the WhatsApp message so our team can record it." }, 500);
  }
});
