import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "./lib/supabase.js";

export default function AccountPage({ user, authError, onSignIn, onPaymentConfirmed }) {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const paymentResult = searchParams.get("payment");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [paymentVerifying, setPaymentVerifying] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersError, setOrdersError] = useState("");
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [signOutError, setSignOutError] = useState("");

  useEffect(() => {
    let active = true;
    if (!user || paymentResult !== "success" || !sessionId || !supabase) return undefined;
    setPaymentMessage("");
    setPaymentError("");
    setPaymentVerifying(true);
    supabase.functions.invoke("verify-checkout-session", { body: { sessionId } })
      .then(({ data, error }) => {
        if (error) throw error;
        if (!data?.paid) throw new Error("This payment hasn't been completed.");
        if (active) {
          setPaymentMessage("Payment confirmed. Thank you — your order has been recorded.");
          onPaymentConfirmed();
        }
      })
      .catch((error) => {
        if (active) setPaymentError(error.message || "We couldn't verify the payment yet. Check your orders again shortly.");
      })
      .finally(() => {
        if (active) setPaymentVerifying(false);
      });
    return () => { active = false; };
  }, [user, paymentResult, sessionId, onPaymentConfirmed]);

  useEffect(() => {
    let active = true;
    if (!user || !supabase) return undefined;
    setOrdersLoading(true);
    setOrdersError("");
    supabase.from("orders")
      .select("id, stripe_checkout_session_id, amount_total, currency, items, status, created_at")
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        if (error) throw error;
        if (active) setOrders(data || []);
      })
      .catch((error) => {
        if (active) setOrdersError(error.message || "We couldn't load your orders.");
      })
      .finally(() => {
        if (active) setOrdersLoading(false);
      });
    return () => { active = false; };
  }, [user]);

  async function handleSignOut() {
    setSignOutError("");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      setSignOutError(error.message || "We couldn't sign you out. Please try again.");
    }
  }

  if (!user) {
    return (
      <section className="account-page section-pad">
        <div className="container account-empty">
          <span className="eyebrow">Your account</span>
          <h1>Welcome to your <span>account.</span></h1>
          <p>Sign in to view your orders and manage your account.</p>
          {authError && <p className="form-message is-error" role="alert">{authError}</p>}
          <button className="button button-primary" type="button" onClick={onSignIn}>Sign in or create an account</button>
        </div>
      </section>
    );
  }

  return (
    <section className="account-page section-pad">
      <div className="container">
        <div className="section-heading account-heading">
          <div>
            <span className="eyebrow">Your account</span>
            <h1>Your <span>account.</span></h1>
            <p>Signed in as <strong>{user.email}</strong></p>
          </div>
          <button className="button button-outline" type="button" onClick={handleSignOut}>Sign out</button>
        </div>
        {signOutError && <p className="form-message is-error" role="alert">{signOutError}</p>}
        {paymentResult === "cancelled" && <p className="form-message">Checkout was cancelled. Your bag has not changed.</p>}
        {paymentVerifying && <p className="form-message" role="status">Confirming your payment...</p>}
        {paymentMessage && <p className="form-message" role="status">{paymentMessage}</p>}
        {paymentError && <p className="form-message is-error" role="alert">{paymentError}</p>}
        <div className="account-orders">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Order history</span>
              <h2>Your <span>orders.</span></h2>
            </div>
            <Link className="underlined-link" to="/shop">Visit the shop <span aria-hidden="true">→</span></Link>
          </div>
          {ordersLoading && <p className="empty-state" role="status">Loading your orders...</p>}
          {ordersError && <p className="form-message is-error" role="alert">{ordersError}</p>}
          {!ordersLoading && !ordersError && orders.length === 0 && paymentMessage && (
            <p className="form-message" role="status">Payment confirmed. Your order history may take a moment to update.</p>
          )}
          {!ordersLoading && !ordersError && orders.length === 0 && !paymentMessage && (
            <div className="account-no-orders">
              <p>You haven't placed any orders yet.</p>
              <Link className="button button-primary" to="/shop">Explore the shop <span aria-hidden="true">→</span></Link>
            </div>
          )}
          {orders.length > 0 && (
            <div className="orders-list">
              {orders.map((order) => (
                <article className="order-card" key={order.id}>
                  <div className="order-card-heading">
                    <div><strong>Order {order.stripe_checkout_session_id.slice(-8)}</strong><small>{new Date(order.created_at).toLocaleDateString()}</small></div>
                    <b>{order.status === "paid" ? "Paid" : order.status}</b>
                  </div>
                  <ul>
                    {order.items.map((item) => <li key={item.productId}>{item.name} <span>× {item.quantity}</span></li>)}
                  </ul>
                  <strong className="order-total">{new Intl.NumberFormat(undefined, {
                    style: "currency",
                    currency: order.currency.toUpperCase(),
                  }).format(order.amount_total / 100)}</strong>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
