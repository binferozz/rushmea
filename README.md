# RUSHMEA Haircare

A multi-page haircare storefront and store-management workspace using the supplied RUSHMEA logo, a jungle-green and beige identity, and KSh pricing.

## Start the application

On Windows, double-click **Open RUSHMEA in Chrome.bat** to start the storefront and open it in Google Chrome. The server runs in a separate terminal window; keep that window open while using the site. Close it to stop the server.

Or start it manually:

```powershell
npm install
npm run dev
```

The storefront is served by Vite. The separate administrator page is `Rushadmin.html`. It is not linked from the storefront. On first visit, set a password for `Rusaylah.CEO`; sign in to manage the store, change the password under **Security**, or sign out from the sidebar.

## GitHub Desktop

The project is prepared as a local Git repository connected to the private `binferozz/rushmea` repository. Open this folder in GitHub Desktop, review the changes, enter a commit summary, commit, then select **Push origin** to upload them. Future changes also need to be reviewed, committed, and pushed in GitHub Desktop; saving a file does not automatically publish it. Generated files, dependencies, local environment files, and local databases are excluded.

## Store capabilities

- Customer registration and sign-in with locally salted and hashed passwords, saved account details, and order history.
- Product and category management, stock tracking, product image URLs, published discount codes, and visibility controls.
- Basket, checkout, M-Pesa reference capture, delivery quotation, printable order quotation, and order status tracking.
- Customer book with paid-order history, spend summaries, administrator-issued private offers, and configurable repeat-purchase rewards. A reward is not advertised before checkout; eligible customers first see it in the checkout order summary.

No sample products or discount codes are preloaded. Add the current catalog and images from the administrator page.

## Before accepting live orders

The current application stores accounts, password hashes, catalog, and orders in the current browser's local storage. The administrator password is salted and hashed, but browser storage is not a security boundary; a client-side HTML page cannot be made undiscoverable or provide server-enforced authentication. The administrator page is unlinked and marked no-index, but its filename can still be guessed. Do not use this client-only login to protect real customer data. The M-Pesa reference is manually reviewed; no payment is initiated or verified by a provider. Worldwide delivery is quoted manually.

Before public launch, connect a server-side database and authentication, protect administrator actions with role-based authorization, enforce stock and loyalty rewards on the server, integrate and verify M-Pesa payments, and configure hosting, delivery pricing, and official contact details. Do not use the local-storage account or admin flows for real customer data until these integrations are in place.
