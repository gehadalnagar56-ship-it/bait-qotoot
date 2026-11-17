import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("SITE_URL") ?? "",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.headers.get("origin") !== Deno.env.get("SITE_URL")) {
    return Response.json({ error: "This site is not allowed to verify checkout." }, { status: 403, headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed." }, { status: 405, headers: corsHeaders });
  }

  try {
    const authorization = request.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!authorization?.startsWith("Bearer ") || !supabaseUrl || !supabaseAnonKey || !stripeSecretKey) {
      return Response.json({ error: "Please sign in to view this payment." }, { status: 401, headers: corsHeaders });
    }
    if (!stripeSecretKey.startsWith("sk_test_")) {
      return Response.json({ error: "Payment verification is restricted to Stripe test mode." }, { status: 503, headers: corsHeaders });
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false },
    });
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: "Your session has expired. Please sign in again." }, { status: 401, headers: corsHeaders });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "The payment verification request is invalid." }, { status: 400, headers: corsHeaders });
    }
    const sessionId = body && typeof body === "object" && "sessionId" in body ? body.sessionId : null;
    if (typeof sessionId !== "string" || !sessionId.startsWith("cs_")) {
      return Response.json({ error: "The checkout session is invalid." }, { status: 400, headers: corsHeaders });
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-12-18.acacia" });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.client_reference_id !== user.id) {
      return Response.json({ error: "This payment belongs to a different account." }, { status: 403, headers: corsHeaders });
    }
    return Response.json({
      paid: session.payment_status === "paid",
      amountTotal: session.amount_total,
      currency: session.currency,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error("Could not verify checkout session:", error);
    return Response.json({ error: "We couldn't verify the payment. Please check your orders shortly." }, { status: 500, headers: corsHeaders });
  }
});
