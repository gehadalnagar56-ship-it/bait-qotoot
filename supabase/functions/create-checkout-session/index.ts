import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("SITE_URL") ?? "",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const products: Record<string, { name: string; price: number }> = {
  "food-kitten": { name: "Little Paws Kitten Feast", price: 1800 },
  "food-salmon": { name: "Ocean Catch Salmon Bites", price: 2200 },
  "food-treats": { name: "Sunshine Freeze-Dried Treats", price: 900 },
  "food-broth": { name: "Happy Hydration Broth", price: 1400 },
  "food-crunch": { name: "Cozy Kitchen Crunch", price: 1900 },
  "food-salmon-treats": { name: "Salmon Celebration Nibbles", price: 700 },
  "toy-wand": { name: "Woolly Chase Wand", price: 1200 },
  "toy-mice": { name: "Tiny Chaos Mouse Set", price: 800 },
  "toy-puzzle": { name: "Bouncy Ball Teaser", price: 2400 },
  "toy-tunnel": { name: "The Hide & Seek Tunnel", price: 2900 },
  "toy-feather": { name: "Feather Flick Teaser", price: 1000 },
  "toy-spring": { name: "Whirl & Pounce Springs", price: 600 },
};

function isCheckoutRequest(value: unknown): value is {
  items: { productId: string; quantity: number }[];
} {
  if (!value || typeof value !== "object" || !("items" in value) || !Array.isArray(value.items)) {
    return false;
  }
  return value.items.every((item) =>
    item !== null &&
    typeof item === "object" &&
    "productId" in item &&
    typeof item.productId === "string" &&
    "quantity" in item &&
    Number.isInteger(item.quantity)
  );
}

Deno.serve(async (request) => {
  const origin = request.headers.get("origin");
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (origin !== Deno.env.get("SITE_URL")) {
    return Response.json({ error: "This site is not allowed to start checkout." }, { status: 403 });
  }
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed." }, { status: 405, headers: corsHeaders });
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return Response.json({ error: "Please sign in before checkout." }, { status: 401, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!supabaseUrl || !supabaseAnonKey || !stripeSecretKey) {
      throw new Error("Checkout service is not configured.");
    }
    if (!stripeSecretKey.startsWith("sk_test_")) {
      throw new Error("Checkout is restricted to Stripe test-mode keys.");
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
      return Response.json({ error: "The checkout request is invalid." }, { status: 400, headers: corsHeaders });
    }
    if (!isCheckoutRequest(body) || body.items.length < 1 || body.items.length > 12) {
      return Response.json({ error: "Your bag is empty or contains too many products." }, { status: 400, headers: corsHeaders });
    }

    const seenProductIds = new Set<string>();
    const lineItems = [];
    const orderItems = [];
    for (const item of body.items) {
      const product = Object.hasOwn(products, item.productId) ? products[item.productId] : undefined;
      if (!product || seenProductIds.has(item.productId) ||
        !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 10) {
        return Response.json({ error: "A product or quantity in your bag is invalid." }, { status: 400, headers: corsHeaders });
      }
      seenProductIds.add(item.productId);
      lineItems.push({
        quantity: item.quantity,
        price_data: {
          currency: "usd",
          unit_amount: product.price,
          product_data: { name: product.name },
        },
      });
      orderItems.push([item.productId, item.quantity]);
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-12-18.acacia" });
    const siteUrl = Deno.env.get("SITE_URL")!;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: { user_id: user.id, items: JSON.stringify(orderItems) },
      shipping_address_collection: { allowed_countries: ["US", "CA", "GB", "AU", "EG"] },
      shipping_options: [{
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: 499, currency: "usd" },
          display_name: "Standard shipping",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 5 },
            maximum: { unit: "business_day", value: 8 },
          },
        },
      }],
      success_url: `${siteUrl}/account?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/shop?payment=cancelled`,
    });

    return Response.json({ url: session.url }, { headers: corsHeaders });
  } catch (error) {
    console.error("Could not create checkout session:", error);
    return Response.json(
      { error: "We couldn't start secure checkout. Please try again." },
      { status: 500, headers: corsHeaders },
    );
  }
});
