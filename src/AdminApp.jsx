import React, { useState } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { AdminPage } from "./App.jsx";
import {
  ADMIN_USERNAME,
  getAdminCredential,
  saveAdminPassword,
  verifyAdminPassword,
} from "./auth.js";
import { StoreProvider } from "./store.js";
import "./styles.css";

const SESSION_KEY = "rushmea-admin-session";

function AdminAccess({ onAuthenticated }) {
  const [credential, setCredential] = useState(getAdminCredential);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const username = String(form.get("username") || "").trim();
    const password = String(form.get(credential ? "password" : "newPassword") || "");
    const confirmation = String(form.get("confirmPassword") || "");
    setError("");

    if (username !== ADMIN_USERNAME) {
      setError("Administrator name is not recognized.");
      return;
    }
    if (!credential && password.length < 12) {
      setError("Choose a password with at least 12 characters.");
      return;
    }
    if (!credential && password !== confirmation) {
      setError("The password entries do not match.");
      return;
    }

    setBusy(true);
    try {
      if (credential) {
        if (!(await verifyAdminPassword(credential, password))) {
          setError("The administrator name or password is incorrect.");
          return;
        }
      } else {
        setCredential(await saveAdminPassword(password));
      }
      onAuthenticated();
    } catch (authError) {
      setError(`Could not complete administrator access: ${authError.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="admin-access-page">
      <section className="admin-access-card">
        <img className="admin-access-logo" src="/rushmea-logo.png" alt="RUSHMEA — What your hair craves" />
        <span className="eyebrow">PRIVATE STORE MANAGEMENT</span>
        <h1>{credential ? <>Welcome <em>back.</em></> : <>Secure your <em>admin access.</em></>}</h1>
        <p>{credential ? "Sign in to manage products, orders, stock, and customer offers." : "Create the administrator password for this browser. Use at least 12 characters and keep it private."}</p>
        <form className="admin-access-form" onSubmit={submit}>
          <label className="form-field">Administrator name<input name="username" autoComplete="username" defaultValue={ADMIN_USERNAME} required /></label>
          <label className="form-field">{credential ? "Password" : "Create password"}<input name={credential ? "password" : "newPassword"} type="password" autoComplete={credential ? "current-password" : "new-password"} minLength={credential ? undefined : 12} required /></label>
          {!credential && <label className="form-field">Confirm password<input name="confirmPassword" type="password" autoComplete="new-password" minLength="12" required /></label>}
          {error && <div className="notice error-notice" role="alert">{error}</div>}
          <button className="button button-dark" disabled={busy}>{busy ? "Please wait…" : credential ? "Sign in" : "Set password"} <ArrowRight size={16} /></button>
        </form>
        <div className="admin-access-footnote"><LockKeyhole size={15} /><span>Administrator: {ADMIN_USERNAME}</span></div>
        <a className="admin-access-back" href="/">Return to the RUSHMEA storefront</a>
      </section>
    </main>
  );
}

function AdminWorkspace() {
  const [credential] = useState(getAdminCredential);
  const [authenticated, setAuthenticated] = useState(
    () => Boolean(credential && window.sessionStorage.getItem(SESSION_KEY) === "authenticated"),
  );

  const authenticate = () => {
    window.sessionStorage.setItem(SESSION_KEY, "authenticated");
    setAuthenticated(true);
  };
  const logout = () => {
    window.sessionStorage.removeItem(SESSION_KEY);
    setAuthenticated(false);
  };
  const changePassword = async (currentPassword, newPassword, confirmation) => {
    try {
      const currentCredential = getAdminCredential();
      if (!currentCredential || !(await verifyAdminPassword(currentCredential, currentPassword))) {
        return "Current password is incorrect.";
      }
      if (newPassword.length < 12) return "Choose a new password with at least 12 characters.";
      if (newPassword !== confirmation) return "The new password entries do not match.";
      await saveAdminPassword(newPassword);
      return "Your password has been changed.";
    } catch (error) {
      return `Could not change the password: ${error.message}`;
    }
  };

  return (
    <StoreProvider>
      {authenticated
        ? <AdminPage onLogout={logout} onChangePassword={changePassword} />
        : <AdminAccess onAuthenticated={authenticate} />}
    </StoreProvider>
  );
}

export default function AdminApp() {
  return <AdminWorkspace />;
}
