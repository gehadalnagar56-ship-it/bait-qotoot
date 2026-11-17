import React, { useEffect, useRef, useState } from "react";
import { supabase } from "./lib/supabase.js";

export default function AuthDialog({ initialMode = "sign-in", onClose, onPasswordUpdated }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const dialogRef = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    dialogRef.current?.querySelector("input")?.focus();
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll('button:not([disabled]), input:not([disabled]), a[href]')];
      if (!focusable.length) return;
      if (event.shiftKey && document.activeElement === focusable[0]) {
        event.preventDefault();
        focusable.at(-1).focus();
      } else if (!event.shiftKey && document.activeElement === focusable.at(-1)) {
        event.preventDefault();
        focusable[0].focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [onClose]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!supabase) {
      setError("Account sign-in is not set up yet. Add the Supabase values from .env.example and restart the app.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "new-password") {
        const { error: authError } = await supabase.auth.updateUser({ password });
        if (authError) throw authError;
        setMessage("Your password has been updated.");
        onPasswordUpdated?.();
      } else if (mode === "sign-in") {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        setMessage("You're signed in. Welcome back!");
      } else if (mode === "sign-up") {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/account` },
        });
        if (authError) throw authError;
        setMessage(data.session
          ? "Your account is ready. Welcome to Bait Qotoot!"
          : "Check your inbox to confirm your new account.");
      } else {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/account?recovery=1`,
        });
        if (authError) throw authError;
        setMessage("If an account exists for this email, a password reset link is on its way.");
      }
    } catch (authError) {
      setError(authError.message || "We couldn't complete that request. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const title = mode === "sign-in" ? "Welcome back" : mode === "sign-up" ? "Create your account" : "Reset your password";

  return (
    <div className="modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section ref={dialogRef} className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Close account dialog">×</button>
        <span className="eyebrow">Your Bait Qotoot account</span>
        <h2 id="auth-title">{mode === "new-password" ? "Choose a new password" : title}</h2>
        <p className="auth-intro">
          {mode === "new-password" ? "Choose a fresh password for your account." : "Sign in to view your orders and manage your account."}
        </p>
        <form className="auth-form" onSubmit={handleSubmit}>
          {mode !== "new-password" && <label>
            Email address
            <input autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>}
          {mode !== "reset" && (
            <label>
              Password
              <input
                autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                minLength={8}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>
          )}
          {error && <p className="form-message is-error" role="alert">{error}</p>}
          {message && <p className="form-message" role="status">{message}</p>}
          <button className="button button-primary auth-submit" type="submit" disabled={busy}>
            {busy ? "One moment..." : mode === "sign-in" ? "Sign in" : mode === "sign-up" ? "Create account" : mode === "new-password" ? "Update password" : "Send reset link"}
          </button>
        </form>
        <div className="auth-links">
          {mode === "sign-in" && (
            <>
              <button type="button" onClick={() => { setMode("reset"); setMessage(""); setError(""); }}>Forgot password?</button>
              <button type="button" onClick={() => { setMode("sign-up"); setMessage(""); setError(""); }}>Create an account</button>
            </>
          )}
          {mode !== "sign-in" && mode !== "new-password" && <button type="button" onClick={() => { setMode("sign-in"); setMessage(""); setError(""); }}>Back to sign in</button>}
        </div>
      </section>
    </div>
  );
}
