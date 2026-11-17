# Bait Qotoot

A responsive cat adoption and care experience built with React, with a cat gallery, saved profiles, product details, customer accounts, and a cat shop.

## Features

- Separate Home, Our story, Cats, Adoption, Care, Saved, and Account pages via React Router
- Persistent light/dark theme toggle
- A 12-product cat shop with separate food/treat and toy categories
- Product detail pages with related items and add-to-bag controls
- Shopping bag with persistent quantity controls
- Supabase email/password accounts, email confirmation, sign-out, and password reset
- Signed-in customer account with a private order history
- Stripe-hosted test checkout with server-validated catalog prices and shipping
- Verified payment return and signed Stripe webhook for saving paid orders
- Responsive layouts for mobile, tablet, and desktop
- Cat photo gallery powered by the public [The Cat API](https://thecatapi.com/)
- Search by profile name or photo ID, filter by life stage, and sort profiles
- Save and remove favorite profiles; saved cats persist in browser `localStorage`
- Profile details dialog and a dedicated saved-cats page
- An interactive, locally saved adoption-readiness checklist
- Adoption journey, care guides, accessible FAQ accordion, and mobile navigation
- Soft blush and lavender visual theme with gentle motion and reduced-motion support
- Loading, error, empty, and success states
- Open Graph metadata for link previews

Routes: `/`, `/about`, `/cats`, `/adoption`, `/care`, `/saved`, `/account`, `/shop`, and `/shop/:productId`.

## Tech stack

- React 18 and Vite 6
- CSS (responsive layout, motion preferences, and focus-visible states)
- The Cat API (public image endpoint; no API key required for the gallery)
- Supabase Auth and Edge Functions
- Stripe Checkout (hosted card entry; test mode)

## Run locally

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` and add your Supabase project URL and publishable/anon key to enable accounts. Never put a Supabase service-role key or a Stripe secret key in a `VITE_` variable or browser code.

## Accounts and test payments

Real account and checkout flows require your own Supabase and Stripe projects; no credentials are included in this repository.

1. Create a Supabase project. In **Authentication → URL Configuration**, set the site URL to your local Vite origin (use the exact port printed by Vite) and allow that URL plus your deployed site's `/account` redirect.
2. Copy `.env.example` to `.env`, add the Supabase project URL and publishable/anon key, then restart Vite.
3. Run `supabase/schema.sql` in the Supabase SQL Editor to create the private order-history table and its read policy.
4. Install and log in to the [Supabase CLI](https://supabase.com/docs/guides/cli), then link the project:

   ```bash
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   ```

5. In Stripe, use a **test-mode** secret key. Set the function secrets (use your exact site origin, without a trailing slash):

   ```bash
   supabase secrets set SITE_URL=http://localhost:5173 STRIPE_SECRET_KEY=sk_test_YOUR_TEST_KEY
   ```

   Supabase Edge Functions provide `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` at runtime. Keep the service-role and Stripe secret keys exclusively in Supabase secrets.
6. Deploy the checkout, payment verification, and signed webhook functions:

   ```bash
   supabase functions deploy create-checkout-session
   supabase functions deploy verify-checkout-session
   supabase functions deploy stripe-webhook
   ```

7. Add a Stripe webhook endpoint pointing to `https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook`. Subscribe to `checkout.session.completed` and `checkout.session.async_payment_succeeded`, then add the signing secret Stripe shows:

   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
   ```
8. For production hosting, change `SITE_URL` to the exact deployed origin, add that origin to Supabase Auth's allowed redirect URLs, and add the two `VITE_SUPABASE_*` values to the frontend host. Set the matching webhook endpoint in Stripe.

The checkout session is created on the server from an allowlisted product catalog; client-provided prices are never trusted. Stripe hosts the card form. This setup is intentionally test-mode only and charges a fixed $4.99 standard-shipping fee. Use Stripe test cards from its documentation; no real charge is made. Before accepting live payments, configure fulfillment, taxes, refunds, customer support, and applicable legal policies.

If Supabase is not configured, sign-in and checkout show a setup message rather than pretending to work.

## Deploy

The frontend is ready for static deployment. It includes SPA rewrites for Vercel (`vercel.json`) and Netlify (`public/_redirects`), so direct links to product, saved-cat, and account pages continue to work after refresh. Supabase Edge Functions remain the backend and must be deployed separately using the steps above.

Create a production build with:

```bash
npm run build
npm run preview
```

- **Vercel:** Import the repository, use `npm run build`, set the output directory to `dist`, and configure both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- **Netlify:** Import the repository, use `npm run build`, set the publish directory to `dist`, and configure both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- **Other static hosts:** Publish `dist`, configure a history fallback to `/index.html`, and add the same frontend environment variables.

## Data and privacy

Cat photos are fetched from The Cat API. Cat profile details and product catalog content are managed by the site. The shopping bag and saved cats are stored locally in the current browser. Supabase handles account sessions and keeps order history private to its owner; Stripe Checkout handles card details. Checkout only accepts Stripe test-mode keys in this version.

## Project introduction

> I built Bait Qotoot, a responsive React experience for discovering adoptable cats, saving favorite profiles, and exploring a thoughtfully designed cat shop. It features The Cat API, product detail pages, Supabase accounts, a Stripe test checkout, private order history, a preparation checklist, a pastel theme, and accessible motion-aware interactions.
