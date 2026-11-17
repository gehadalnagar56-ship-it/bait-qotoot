import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";

const productNames: Record<string, string> = {
  "food-kitten": "Little Paws Kitten Feast",
  "food-salmon": "Ocean Catch Salmon Bites",
  "food-treats": "Sunshine Freeze-Dried Treats",
  "food-broth": "Happy Hydration Broth",
  "food-crunch": "Cozy Kitchen Crunch",
  "food-salmon-treats": "Salmon Celebration Nibbles",
  "toy-wand": "Woolly Chase Wand",
  "toy-mice": "Tiny Chaos Mouse Set",
  "toy-puzzle": "Bouncy Ball Teaser",
  "toy-tunnel": "The Hide & Seek Tunnel",
  "toy-feather": "Feather Flick Teaser",
  "toy-spring": "Whirl & Pounce Springs",
};

Deno.serve(async (request) => {
  if (request.method !== "POST") return new Response("Method not allowed.", { status: 405 });

  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !serviceRoleKey) {
    console.error("Stripe webhook is missing required server configuration.");
    return new Response("Webhook is not configured.", { status: 500 });
  }
  if (!stripeSecretKey.startsWith("sk_test_")) {
    console.error("Stripe webhook only accepts test-mode keys.");
    return new Response("Webhook is restricted to test mode.", { status: 503 });
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-12-18.acacia" });
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing Stripe signature.", { status: 400 });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      await request.text(),
      signature,
      webhookSecret,
      undefined,
      Stripe.createSubtleCryptoProvider(),
    );
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);
    return new Response("Invalid Stripe signature.", { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status !== "paid") return new Response("Payment is not complete.", { status: 200 });

    const userId = session.metadata?.user_id;
    const rawItems = session.metadata?.items;
    if (!userId || userId !== session.client_reference_id || !rawItems ||
      session.amount_total === null || !session.currency) {
      console.error("Completed checkout session is missing required order details:", session.id);
      return new Response("Order details are incomplete.", { status: 400 });
    }

    let items: { productId: string; name: string; quantity: number }[];
    try {
      const metadataItems: unknown = JSON.parse(rawItems);
      if (!Array.isArray(metadataItems)) throw new Error("Order items are not a list.");
      items = metadataItems.map((item) => {
        if (!Array.isArray(item) || typeof item[0] !== "string" ||
          !Number.isInteger(item[1]) || item[1] < 1 || item[1] > 10 || !productNames[item[0]]) {
          throw new Error("An order item is invalid.");
        }
        return { productId: item[0], name: productNames[item[0]], quantity: item[1] };
      });
    } catch (error) {
      console.error("Could not parse checkout items:", error);
      return new Response("Order details are invalid.", { status: 400 });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await adminClient.from("orders").upsert({
      user_id: userId,
      stripe_checkout_session_id: session.id,
      amount_total: session.amount_total,
      currency: session.currency,
      items,
      status: "paid",
    }, { onConflict: "stripe_checkout_session_id" });
    if (error) {
      console.error("Could not save paid order:", error);
      return new Response("Could not save order.", { status: 500 });
    }
  }

  return new Response("ok", { status: 200 });
});
