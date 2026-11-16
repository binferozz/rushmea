import React, { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  CircleHelp,
  LockKeyhole,
  Package,
  UserRound,
} from "lucide-react";
import { createCustomer, verifyCustomerPassword } from "./auth.js";
import { money, orderTotal, persistStore, useStore } from "./store.js";

function AccountFrame({ children, eyebrow, title, copy }) {
  return (
    <main className="page-main account-page">
      <div className="account-intro">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{copy}</p>
      </div>
      {children}
    </main>
  );
}

function AccountForm({ mode }) {
  const { store, setStore } = useStore();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const registering = mode === "register";

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")).trim().toLowerCase();
    const password = String(form.get("password"));
    try {
      if (registering) {
        const name = String(form.get("name")).trim();
        const phone = String(form.get("phone")).trim();
        if (password.length < 10) {
          setError("Choose a password with at least 10 characters.");
          return;
        }
        if (password !== form.get("confirmPassword")) {
          setError("Those passwords don’t match yet.");
          return;
        }
        if (store.customers.some((customer) => customer.email === email)) {
          setError("An account already uses that email. Sign in instead.");
          return;
        }
        const customer = await createCustomer({ name, email, phone, password });
        const updatedStore = {
          ...store,
          customers: [...store.customers, customer],
          currentCustomerId: customer.id,
        };
        persistStore(updatedStore);
        setStore(updatedStore);
      } else {
        const customer = store.customers.find((item) => item.email === email);
        if (!customer || !(await verifyCustomerPassword(customer, password))) {
          setError("We couldn’t sign you in with those details. Please try again.");
          return;
        }
        const updatedStore = { ...store, currentCustomerId: customer.id };
        persistStore(updatedStore);
        setStore(updatedStore);
      }
      window.location.href = "/account";
    } catch (failure) {
      setError(`We couldn’t finish setting up your account. ${failure.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AccountFrame
      eyebrow={registering ? "WELCOME TO RUSHMEA" : "YOUR RUSHMEA ACCOUNT"}
      title={registering ? <>Create your <em>account.</em></> : <>Welcome <em>back.</em></>}
      copy={registering
        ? "Keep your orders together and make your next visit feel a little easier."
        : "Sign in to find your order history and saved details."}
    >
      <form className="account-form" onSubmit={submit}>
        {error && <div className="notice error-notice" role="alert">{error}</div>}
        {registering && <>
          <label className="form-field">Full name<input name="name" autoComplete="name" required maxLength={100} placeholder="Your full name" /></label>
          <label className="form-field">Phone number<input name="phone" type="tel" autoComplete="tel" required maxLength={32} placeholder="+254 7XX XXX XXX" /></label>
        </>}
        <label className="form-field">Email address<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" /></label>
        <label className="form-field">Password<input name="password" type="password" autoComplete={registering ? "new-password" : "current-password"} required minLength={registering ? 10 : 1} maxLength={128} placeholder={registering ? "At least 10 characters" : "Your password"} /></label>
        {registering && <label className="form-field">Confirm password<input name="confirmPassword" type="password" autoComplete="new-password" required minLength={10} maxLength={128} placeholder="Enter your password again" /></label>}
        <button className="button button-dark account-submit" disabled={busy}>
          {busy ? "One moment…" : registering ? <>Create account <ArrowRight size={16} /></> : <>Sign in <ArrowRight size={16} /></>}
        </button>
        <p className="account-switch">{registering ? "Already have an account?" : "New to RUSHMEA?"} <a href={registering ? "/account/login" : "/account/register"}>{registering ? "Sign in" : "Create an account"}</a></p>
        <p className="account-privacy"><LockKeyhole size={13} /> Your password is stored as a salted hash in this browser.</p>
      </form>
    </AccountFrame>
  );
}

function CustomerDashboard({ customer }) {
  const { store, setStore } = useStore();
  const customerOrders = store.orders
    .filter((order) => order.customerId === customer.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const signOut = () => {
    const updatedStore = { ...store, currentCustomerId: null };
    persistStore(updatedStore);
    setStore(updatedStore);
    window.location.href = "/";
  };

  return (
    <AccountFrame
      eyebrow="YOUR RUSHMEA ACCOUNT"
      title={<>Your account<span className="heading-period">.</span></>}
      copy="Your details and order history, all together in one place."
    >
      <div className="account-dashboard">
        <section className="account-profile-card">
          <div className="account-profile-icon"><UserRound size={20} /></div>
          <div className="account-profile-info">
            <span className="eyebrow">YOUR DETAILS</span>
            <h2>{customer.name}</h2>
            <p>{customer.email}<br />{customer.phone}</p>
          </div>
          <button className="button button-outline account-signout" onClick={signOut}>Sign out</button>
        </section>
        <section className="account-orders">
          <div className="account-orders-heading"><div><span className="eyebrow">YOUR RUSHMEA JOURNEY</span><h2>Order history</h2></div><span>{customerOrders.length} {customerOrders.length === 1 ? "order" : "orders"}</span></div>
          {customerOrders.length ? customerOrders.map((order) => (
            <article className="account-order" key={order.id}>
              <div className="account-order-icon"><Package size={18} /></div>
              <div className="account-order-info"><strong>{order.id}</strong><span>{new Date(order.createdAt).toLocaleDateString("en-KE", { dateStyle: "medium" })} · {order.items.length} {order.items.length === 1 ? "item" : "items"}</span></div>
              <div className="account-order-total"><strong>{money(orderTotal(order))}</strong><span className={order.paymentStatus === "approved" ? "account-paid" : ""}>{order.paymentStatus === "approved" ? "Paid" : "Payment pending"}</span></div>
              <a className="account-order-link" href={`/track?order=${encodeURIComponent(order.id)}`}>Track <ArrowUpRight size={14} /></a>
            </article>
          )) : <div className="account-empty-orders"><Package size={23} /><p>Your RUSHMEA orders will appear here.</p><a className="text-link" href="/shop">Explore the collection <ArrowRight size={15} /></a></div>}
        </section>
        <div className="account-help"><CircleHelp size={17} /><span>Need help with an order? Keep your quote number handy when contacting RUSHMEA.</span></div>
      </div>
    </AccountFrame>
  );
}

export default function AccountPage({ mode }) {
  const { store } = useStore();
  const customer = store.customers.find((item) => item.id === store.currentCustomerId);
  if (customer) return <CustomerDashboard customer={customer} />;
  return <AccountForm mode={mode === "register" ? "register" : "login"} />;
}
