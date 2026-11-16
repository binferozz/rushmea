import { createContext, createElement, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "rushmea-store-v2";

export function persistStore(store) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export const initialStore = {
  categories: [],
  products: [],
  coupons: [],
  customers: [],
  currentCustomerId: null,
  loyalty: {
    enabled: true,
    purchaseThreshold: 3,
    discountPercent: 10,
  },
  cart: [],
  orders: [],
};

function readStore() {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return initialStore;

  try {
    const parsed = JSON.parse(saved);
    if (
      !Array.isArray(parsed.products) ||
      !Array.isArray(parsed.categories) ||
      !Array.isArray(parsed.cart) ||
      !Array.isArray(parsed.orders)
    ) {
      throw new Error("The saved shop information is incomplete.");
    }

    return {
      ...initialStore,
      ...parsed,
      coupons: Array.isArray(parsed.coupons) ? parsed.coupons : [],
      customers: Array.isArray(parsed.customers) ? parsed.customers : [],
      loyalty: { ...initialStore.loyalty, ...parsed.loyalty },
    };
  } catch (error) {
    throw new Error(
      `Could not read the saved RUSHMEA information. Clear this site's local storage to restart. ${error.message}`,
    );
  }
}

export const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [store, setStore] = useState(readStore);

  useEffect(() => {
    persistStore(store);
  }, [store]);

  const value = useMemo(() => ({ store, setStore }), [store]);
  return createElement(StoreContext.Provider, { value }, children);
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider.");
  return context;
}

export function money(amount) {
  return `KSh ${Number(amount || 0).toLocaleString("en-KE")}`;
}

export function makeId(value) {
  const base = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base || "item"}-${Math.random().toString(36).slice(2, 7)}`;
}

export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export function getCustomerPromotion(customer, store) {
  if (!customer) return null;

  if (customer.privateOffer?.active && customer.privateOffer.percent > 0) {
    return {
      percent: customer.privateOffer.percent,
      kind: "private",
      label: "A thank-you surprise",
    };
  }

  const { enabled, purchaseThreshold, discountPercent } = store.loyalty;
  if (!enabled || purchaseThreshold < 1 || discountPercent < 1) return null;

  const approvedPurchases = store.orders.filter(
    (order) => order.customerId === customer.id && order.paymentStatus === "approved",
  ).length;
  const rewardAlreadyInProgress = store.orders.some(
    (order) =>
      order.customerId === customer.id &&
      order.loyaltyRewardPercent > 0 &&
      order.paymentStatus === "pending" &&
      order.fulfillmentStatus !== "cancelled",
  );

  if (
    approvedPurchases < purchaseThreshold ||
    approvedPurchases % purchaseThreshold !== 0 ||
    rewardAlreadyInProgress
  ) {
    return null;
  }

  return {
    percent: discountPercent,
    kind: "loyalty",
    label: "A thank-you surprise",
  };
}

export function orderTotal(order) {
  return order.subtotal - order.discount + (order.deliveryCost || 0);
}
