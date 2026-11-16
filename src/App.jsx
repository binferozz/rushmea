import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgePercent,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  CreditCard,
  Flower2,
  Heart,
  Leaf,
  LockKeyhole,
  Menu,
  Minus,
  Package,
  Plus,
  Printer,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  UsersRound,
  Trash2,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import { HeroArtwork, ProductArtwork } from "./Artwork.jsx";
import {
  makeId,
  getCustomerPromotion,
  money,
  orderTotal,
  persistStore,
  StoreProvider,
  useStore,
} from "./store.js";
import AccountPage from "./AccountPage.jsx";
import { createAccessToken } from "./auth.js";

function Logo({ small = false }) {
  return (
    <a className={`brand ${small ? "brand-small" : ""}`} href="/" aria-label="RUSHMEA Haircare home">
      <img className="brand-logo-img" src="/rushmea-logo.png" alt="RUSHMEA — What your hair craves" />
    </a>
  );
}

function Header() {
  const { store } = useStore();
  const [open, setOpen] = useState(false);
  const count = store.cart.reduce((sum, item) => sum + item.quantity, 0);
  const customer = store.customers.find((item) => item.id === store.currentCustomerId);
  const nav = [
    ["Shop all", "/shop"],
    ["Our story", "/#story"],
    ["Find your ritual", "/#ritual"],
  ];
  return (
      <header className="site-header">
        <button className="icon-button mobile-menu" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"}>
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
        <Logo />
        <nav className={`main-nav ${open ? "nav-open" : ""}`}>
          {nav.map(([label, url]) => <a key={label} href={url} onClick={() => setOpen(false)}>{label}</a>)}
          <a className="mobile-nav-link" href="/track">Track an order</a>
          <a className="mobile-nav-link" href="/account">{customer ? "My account" : "Sign in / Create account"}</a>
        </nav>
        <div className="header-actions">
          <a className="track-link" href="/track">Track order</a>
          <a className="account-link" href="/account">{customer ? customer.name.split(" ")[0] : "Account"}</a>
          <a className="icon-button bag-button" href="/cart" aria-label={`Shopping bag, ${count} items`}>
            <ShoppingBag size={20} strokeWidth={1.7} />
            {count > 0 && <span className="bag-count">{count}</span>}
          </a>
        </div>
      </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Logo />
          <p>Care that meets your hair where it is.<br />Made with love in Nairobi, Kenya.</p>
        </div>
        <div className="footer-column"><span className="footer-label">Explore</span><a href="/shop">Shop all</a><a href="/#story">Our story</a><a href="/#ritual">Find your ritual</a></div>
        <div className="footer-column"><span className="footer-label">Here to help</span><a href="/track">Track your order</a><a href="/#delivery">Delivery & returns</a><a href="/account">Customer account</a></div>
        <div className="footer-note"><Flower2 size={26} strokeWidth={1.2} /><p>A little ritual.<br />A lot of love.</p></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} RUSHMEA Haircare</span><span>Made for your crown, wherever you call home.</span></div>
    </footer>
  );
}

function PageShell({ children, noFooter = false }) {
  return <><Header />{children}{!noFooter && <Footer />}</>;
}

function ProductCard({ product, index = 0 }) {
  const { store, setStore } = useStore();
  const available = product.stock > 0;
  const add = () => {
    if (!available) return;
    const existing = store.cart.find((item) => item.productId === product.id);
    setStore((current) => ({
      ...current,
      cart: existing
        ? current.cart.map((item) => item.productId === product.id ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item)
        : [...current.cart, { productId: product.id, quantity: 1 }],
    }));
  };
  return (
    <article className="product-card" style={{ "--card-index": index }}>
      <a className="product-image" href={`/shop/${product.id}`}>
        <ProductArtwork product={product} />
        {!available ? <span className="product-badge muted">Out of stock</span> : product.stock < 5 ? <span className="product-badge">Almost gone</span> : product.featured && <span className="product-badge">A little favourite</span>}
        <span className="quick-view">Discover <ArrowUpRight size={15} /></span>
      </a>
      <div className="product-info">
        <div className="product-meta"><span>{product.category}</span><span>{product.size || "Made with care"}</span></div>
        <a className="product-title" href={`/shop/${product.id}`}>{product.name}</a>
        <p className="product-description">{product.description}</p>
        <div className="product-card-bottom">
          <span className="product-price">{money(product.price)}</span>
          <button className={`add-button ${!available ? "disabled" : ""}`} onClick={add} disabled={!available} aria-label={`Add ${product.name} to bag`}>
            {available ? <Plus size={19} /> : "Sold out"}
          </button>
        </div>
      </div>
    </article>
  );
}

function SectionHeading({ eyebrow, title, copy, link, linkLabel = "Shop the collection" }) {
  return (
    <div className="section-heading">
      <div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{copy && <p>{copy}</p>}</div>
      {link && <a className="text-link" href={link}>{linkLabel}<ArrowRight size={16} /></a>}
    </div>
  );
}

function HomePage() {
  const { store } = useStore();
  const featured = store.products.filter((product) => product.active && product.featured).slice(0, 3);
  const [quizAnswer, setQuizAnswer] = useState("");
  const recommendations = store.products.filter((product) => product.active && product.stock > 0);
  return (
    <PageShell>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-dot" /> MADE WITH LOVE IN NAIROBI</span>
            <h1>Your crown.<br /><em>Your kind</em> of care.</h1>
            <p className="hero-description">Beautifully simple hair care for the rituals that feel like you. Thoughtful formulas, made to meet your hair where it is.</p>
            <div className="hero-actions"><a className="button button-dark" href="/shop">Find your favourites <ArrowRight size={17} /></a><a className="quiet-link" href="/#story">Our little story <ArrowDown size={15} /></a></div>
            <div className="hero-proof"><span className="avatar-stack"><i>✿</i><i>R</i><i>♡</i></span><span>A little love for every texture</span></div>
          </div>
          <div className="hero-visual">
            <div className="hero-blob" />
            <HeroArtwork />
            <div className="hero-note"><span className="note-star">✳</span><span>Good hair days<br /><strong>start with care.</strong></span></div>
            <div className="hero-sticker"><span>MADE IN</span><strong>NAIROBI</strong><span>WITH LOVE ♡</span></div>
          </div>
          <div className="hero-index"><span>01</span><span className="index-line" /><span>THE EVERYDAY RITUAL</span></div>
        </section>

        <section className="value-strip">
          <div><Leaf size={17} /><span>Gentle by nature</span></div><i />
          <div><Heart size={17} /><span>Made for real routines</span></div><i />
          <div><Truck size={18} /><span>Delivered worldwide</span></div><i />
          <div><ShieldCheck size={18} /><span>Thoughtfully made</span></div>
        </section>

        <section className="collection section-pad">
          <SectionHeading eyebrow="THE GOOD STUFF" title="A little something for your ritual." copy="The favourites that turn wash day into your day." link="/shop" />
          {featured.length > 0 ? <div className="product-grid">{featured.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div> : <div className="empty-featured"><Flower2 size={25} /><p>Your next favourite is on its way. Take a peek at the full collection.</p><a className="text-link" href="/shop">Browse all products <ArrowRight size={16} /></a></div>}
        </section>

        <section className="story-section" id="story">
          <div className="story-art">
            <div className="story-orbit orbit-one" /><div className="story-orbit orbit-two" />
            <div className="story-bloom"><span>R</span><Flower2 size={121} strokeWidth={0.75} /></div>
            <span className="story-caption">A softer kind of self-care</span>
          </div>
          <div className="story-copy">
            <span className="eyebrow">A LOVE NOTE TO YOUR HAIR</span>
            <h2>Care that starts<br />with <em>listening.</em></h2>
            <p>Every crown has its own story. RUSHMEA is here for the everyday moments in between — the wash days, the fresh starts, and the time you take just for you.</p>
            <p>Made with intention in Nairobi and sent with a little love, wherever your home may be.</p>
            <a className="text-link" href="/shop">Meet your new ritual <ArrowRight size={16} /></a>
          </div>
        </section>

        <section className="ritual-section" id="ritual">
          <div className="ritual-intro"><span className="eyebrow">A LITTLE HELP FROM US</span><h2>What does your hair<br />need <em>today?</em></h2><p>Pick the feeling you’re after. We’ll point you toward a place to start.</p></div>
          <div className="ritual-choices">
            {!quizAnswer ? <>
              <button onClick={() => setQuizAnswer("moisture")}><span className="ritual-icon"><DropletIcon /></span><span><strong>A little more moisture</strong><small>For thirsty, feel-good strands</small></span><ArrowUpRight size={18} /></button>
              <button onClick={() => setQuizAnswer("wash")}><span className="ritual-icon"><Sparkles size={20} /></span><span><strong>A fresh start</strong><small>For your next wash-day ritual</small></span><ArrowUpRight size={18} /></button>
              <button onClick={() => setQuizAnswer("style")}><span className="ritual-icon"><Flower2 size={20} /></span><span><strong>My finishing touch</strong><small>For curls that feel like you</small></span><ArrowUpRight size={18} /></button>
            </> : <div className="quiz-result"><div className="quiz-result-top"><span className="eyebrow">YOUR LITTLE STARTING POINT</span><button className="quiet-link" onClick={() => setQuizAnswer("")}>Start again</button></div><h3>{quizAnswer === "moisture" ? "A softer kind of Sunday." : quizAnswer === "wash" ? "Make wash day yours." : "A touch of feel-good definition."}</h3><div className="quiz-products">{recommendations.filter((p) => quizAnswer === "moisture" ? p.category.toLowerCase().includes("moisture") : quizAnswer === "wash" ? p.category.toLowerCase().includes("wash") : p.category.toLowerCase().includes("styling")).slice(0, 2).map((p) => <a href={`/shop/${p.id}`} key={p.id}><ProductArtwork product={p} /><span>{p.name}<small>{money(p.price)}</small></span><ArrowRight size={15} /></a>)}</div></div>}
          </div>
        </section>

        <section className="delivery-band" id="delivery"><div className="delivery-icon"><Truck size={23} strokeWidth={1.4} /></div><div><span className="eyebrow">FROM OUR HOME TO YOURS</span><h2>Made in Nairobi.<br /><em>Made to travel.</em></h2><p>Wherever you are in the world, we'll make sure your RUSHMEA ritual finds its way to you. Delivery details are confirmed personally with every order.</p><a className="text-link" href="/shop">Find your feel-good <ArrowRight size={16} /></a></div><div className="delivery-map" aria-hidden="true"><div className="map-ring ring-a" /><div className="map-ring ring-b" /><div className="map-pin"><Leaf size={23} /></div><span>NAIROBI, KE</span><span className="map-label label-one">YOUR PLACE</span><span className="map-label label-two">OUR PLACE</span></div></section>
      </main>
    </PageShell>
  );
}

function DropletIcon() {
  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 3.5S5.7 10.1 5.7 14.4a6.3 6.3 0 0 0 12.6 0C18.3 10.1 12 3.5 12 3.5Z" /><path d="M9 15.1a3.1 3.1 0 0 0 3.1 3.1" /></svg>;
}

function ShopPage() {
  const { store } = useStore();
  const [category, setCategory] = useState("Everything");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const products = useMemo(() => {
    let result = store.products.filter((item) => item.active && (!query || `${item.name} ${item.category} ${item.description}`.toLowerCase().includes(query.toLowerCase())) && (category === "Everything" || item.category === category));
    if (sort === "price-low") result = [...result].sort((a, b) => a.price - b.price);
    if (sort === "price-high") result = [...result].sort((a, b) => b.price - a.price);
    if (sort === "in-stock") result = [...result].sort((a, b) => b.stock - a.stock);
    return result;
  }, [store.products, category, query, sort]);
  return <PageShell><main className="page-main shop-page">
    <div className="page-intro shop-intro"><div className="breadcrumb"><a href="/">Home</a><span>/</span><span>Shop</span></div><span className="eyebrow">THE RUSHMEA COLLECTION</span><h1>Meet your <em>new ritual.</em></h1><p>Thoughtful little things for all the moments you spend with your hair.</p><div className="shop-count">{store.products.filter((p) => p.active).length} feel-good finds <span>✳</span></div></div>
    <div className="shop-tools"><div className="category-pills"><button className={category === "Everything" ? "selected" : ""} onClick={() => setCategory("Everything")}>Everything</button>{store.categories.map((cat) => <button key={cat} className={category === cat ? "selected" : ""} onClick={() => setCategory(cat)}>{cat}</button>)}</div><div className="shop-filters"><label className="search-field"><Search size={16} /><input placeholder="Find your something…" value={query} onChange={(e) => setQuery(e.target.value)} /><span>/</span></label><label className="sort-field"><span>Sort by</span><select value={sort} onChange={(e) => setSort(e.target.value)}><option value="featured">Our favourites</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="in-stock">In stock first</option></select><ChevronDown size={15} /></label></div></div>
    {products.length ? <div className="product-grid shop-grid">{products.map((p, index) => <ProductCard key={p.id} product={p} index={index} />)}</div> : <div className="empty-state"><Search size={28} /><h2>No little finds just yet</h2><p>Try a different search or category.</p><button className="button button-outline" onClick={() => { setCategory("Everything"); setQuery(""); }}>See everything</button></div>}
    <div className="shop-help"><Flower2 size={22} /><span>Not sure where to start?</span><a href="/#ritual" className="text-link">Find your ritual <ArrowRight size={15} /></a></div>
  </main></PageShell>;
}

function ProductPage({ productId }) {
  const { store, setStore } = useStore();
  const product = store.products.find((item) => item.id === productId && item.active);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  if (!product) return <NotFoundPage />;
  const addToBag = () => {
    const existing = store.cart.find((item) => item.productId === product.id);
    setStore((current) => ({ ...current, cart: existing ? current.cart.map((item) => item.productId === product.id ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) } : item) : [...current.cart, { productId: product.id, quantity }] }));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  };
  const related = store.products.filter((p) => p.active && p.id !== product.id && p.category === product.category).slice(0, 3);
  return <PageShell><main className="page-main product-page">
    <div className="breadcrumb"><a href="/">Home</a><span>/</span><a href="/shop">Shop</a><span>/</span><span>{product.name}</span></div>
    <div className="product-detail"><div className="detail-art-wrap"><ProductArtwork product={product} className="detail-art" /><span className="detail-art-note">A LITTLE CARE, A LOT OF LOVE</span></div>
      <div className="detail-copy"><span className="eyebrow">{product.category}</span><h1>{product.name}</h1><div className="detail-price">{money(product.price)} <span>· {product.size || "Made with care"}</span></div><p className="detail-description">{product.description}</p><div className="detail-rule" /><div className="detail-stock">{product.stock > 0 ? <><span className="stock-dot" />{product.stock <= 4 ? `Only ${product.stock} left in our Nairobi studio` : "Ready for your ritual"}</> : <><span className="stock-dot out" />This little favourite is taking a rest</>}</div>
        <div className="detail-add-row"><div className="quantity-control"><button aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((n) => Math.max(1, n - 1))}><Minus size={15} /></button><span>{quantity}</span><button aria-label="Increase quantity" disabled={quantity >= product.stock} onClick={() => setQuantity((n) => Math.min(product.stock, n + 1))}><Plus size={15} /></button></div><button className="button button-dark detail-add" disabled={product.stock <= 0} onClick={addToBag}>{added ? <><Check size={17} /> Added to your bag</> : <><ShoppingBag size={17} /> Add to bag · {money(product.price * quantity)}</>}</button></div>
        <div className="detail-benefits"><div><Truck size={17} /><span>Worldwide delivery<br /><small>Personal delivery quote at checkout</small></span></div><div><CreditCard size={17} /><span>M-Pesa payments<br /><small>Manually confirmed by our team</small></span></div></div>
        <details className="detail-accordion"><summary>A note on delivery <Plus size={16} /></summary><p>We send RUSHMEA from Nairobi, Kenya, to destinations around the world. Delivery pricing and timing depend on your address and will be confirmed by our team before payment is approved.</p></details>
      </div></div>
    {related.length > 0 && <section className="related-products"><SectionHeading eyebrow="A LITTLE MORE LOVE" title="Keep the ritual going." link="/shop" /><div className="product-grid">{related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}</div></section>}
  </main></PageShell>;
}

function CartPage() {
  const { store, setStore } = useStore();
  const [code, setCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [coupon, setCoupon] = useState(null);
  const cartItems = store.cart.map((item) => ({ ...item, product: store.products.find((p) => p.id === item.productId) })).filter((item) => item.product);
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = coupon ? Math.round(subtotal * coupon.percent / 100) : 0;
  const updateQuantity = (productId, quantity) => setStore((current) => ({ ...current, cart: quantity <= 0 ? current.cart.filter((item) => item.productId !== productId) : current.cart.map((item) => item.productId === productId ? { ...item, quantity: Math.min(quantity, current.products.find((p) => p.id === productId)?.stock || quantity) } : item) }));
  const applyCode = () => {
    const found = store.coupons.find((item) => item.active && item.code.toLowerCase() === code.trim().toLowerCase());
    if (!found) { setCoupon(null); setCouponMessage("That code isn't active just now. Double-check and try again."); return; }
    setCoupon(found); setCouponMessage(`${found.code} is in — ${found.percent}% off, with love.`); setCode("");
  };
  return <PageShell><main className="page-main cart-page">
    <div className="breadcrumb"><a href="/">Home</a><span>/</span><span>Your bag</span></div><div className="page-heading-row"><div><span className="eyebrow">YOUR LITTLE COLLECTION</span><h1>Your bag<span className="heading-period">.</span></h1></div><a className="text-link" href="/shop"><ArrowLeft size={15} /> Keep browsing</a></div>
    {!cartItems.length ? <div className="empty-cart"><div className="empty-bag-icon"><ShoppingBag size={29} /></div><h2>Your bag is taking a little breather.</h2><p>When you find something you love, it’ll be right here.</p><a className="button button-dark" href="/shop">Find a new favourite <ArrowRight size={16} /></a></div> : <div className="cart-layout"><div className="cart-items"><div className="cart-column-head"><span>YOUR FINDS <small>({cartItems.reduce((sum, item) => sum + item.quantity, 0)})</small></span><span>SUBTOTAL</span></div>{cartItems.map(({ product, quantity }) => <article className="cart-item" key={product.id}><a className="cart-thumb" href={`/shop/${product.id}`}><ProductArtwork product={product} /></a><div className="cart-item-details"><a href={`/shop/${product.id}`} className="cart-product-name">{product.name}</a><span className="cart-product-meta">{product.category} · {product.size}</span><div className="quantity-control cart-quantity"><button aria-label="Decrease quantity" onClick={() => updateQuantity(product.id, quantity - 1)}><Minus size={14} /></button><span>{quantity}</span><button aria-label="Increase quantity" disabled={quantity >= product.stock} onClick={() => updateQuantity(product.id, quantity + 1)}><Plus size={14} /></button></div></div><div className="cart-line-price"><strong>{money(product.price * quantity)}</strong><button className="remove-button" onClick={() => updateQuantity(product.id, 0)}><Trash2 size={15} /><span>Remove</span></button></div></article>)}<a className="continue-link" href="/shop"><ArrowLeft size={15} /> Add a little something else</a></div>
    <aside className="order-summary"><span className="eyebrow">A QUICK LITTLE RECAP</span><h2>Order summary</h2><div className="summary-row"><span>Subtotal</span><span>{money(subtotal)}</span></div>{coupon && <div className="summary-row discount-row"><span>Sweet little saving ({coupon.code})</span><span>−{money(discount)}</span></div>}<div className="summary-row delivery-row"><span>Delivery</span><span>Quoted after checkout</span></div><div className="summary-total"><span>Estimated total</span><strong>{money(subtotal - discount)}</strong></div><p className="delivery-disclaimer"><CircleHelp size={15} /> Worldwide delivery is quoted personally based on your address.</p><div className="coupon-form"><label htmlFor="coupon">Have a little code?</label><div><input id="coupon" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter your code" onKeyDown={(e) => e.key === "Enter" && applyCode()} /><button onClick={applyCode}>Apply</button></div>{couponMessage && <small className={coupon ? "coupon-success" : "coupon-error"}>{couponMessage}</small>}</div><a className="button button-dark checkout-button" href="/checkout">To checkout <ArrowRight size={17} /></a><div className="payment-note"><LockKeyhole size={15} /><span>M-Pesa only · Payment confirmed by our team</span></div></aside></div>}
  </main></PageShell>;
}

function CheckoutPage() {
  const { store, setStore } = useStore();
  const customer = store.customers.find((item) => item.id === store.currentCustomerId);
  const [code, setCode] = useState("");
  const [notice, setNotice] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const cartItems = store.cart.map((item) => ({ ...item, product: store.products.find((p) => p.id === item.productId) })).filter((item) => item.product);
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const promotion = getCustomerPromotion(customer, store);
  const promotionDiscount = promotion ? Math.round(subtotal * promotion.percent / 100) : 0;
  const couponDiscount = coupon ? Math.round(subtotal * coupon.percent / 100) : 0;
  const usePromotion = Boolean(promotion && promotionDiscount >= couponDiscount);
  const appliedPromotion = usePromotion ? promotion : null;
  const discount = Math.max(promotionDiscount, couponDiscount);
  const applyCode = () => {
    const found = store.coupons.find((item) => item.active && item.code.toLowerCase() === code.trim().toLowerCase());
    if (!found) { setCoupon(null); setNotice("That discount code isn't active."); return; }
    setCoupon(found); setNotice(`${found.code} applied — lovely.`); setCode("");
  };
  const placeOrder = (event) => {
    event.preventDefault();
    if (!cartItems.length) { setError("Your bag is empty. Add a product before checking out."); return; }
    const unavailable = cartItems.filter(({ product, quantity }) => !product.active || product.stock < quantity);
    if (unavailable.length) {
      setError(`${unavailable.map(({ product }) => product.name).join(", ")} no longer have enough stock. Please update your bag.`);
      return;
    }
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const receiptAccessToken = createAccessToken();
    const order = {
      id: `RM-${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      customer: customer
        ? { name: customer.name, email: customer.email, phone: customer.phone }
        : { name: form.get("name").trim(), email: form.get("email").trim(), phone: form.get("phone").trim() },
      customerId: customer?.id || null,
      receiptAccessToken,
      address: { country: form.get("country").trim(), city: form.get("city").trim(), address: form.get("address").trim(), postal: form.get("postal").trim() },
      items: cartItems.map(({ product, quantity }) => ({ productId: product.id, name: product.name, price: product.price, quantity })),
      subtotal,
      discount,
      couponCode: !usePromotion && coupon ? coupon.code : "",
      discountLabel: appliedPromotion ? appliedPromotion.label : coupon ? coupon.code : "",
      loyaltyRewardPercent: appliedPromotion ? appliedPromotion.percent : 0,
      deliveryCost: null,
      paymentMethod: "M-Pesa",
      mpesaReference: form.get("mpesaReference").trim(),
      paymentStatus: "pending",
      fulfillmentStatus: "awaiting-payment",
      customerNote: form.get("note").trim(),
    };
    const updatedStore = {
      ...store,
      customers: appliedPromotion?.kind === "private"
        ? store.customers.map((item) => item.id === customer.id ? { ...item, privateOffer: { ...item.privateOffer, active: false } } : item)
        : store.customers,
      orders: [order, ...store.orders],
      cart: [],
    };
    persistStore(updatedStore);
    setStore(updatedStore);
    setBusy(false);
    window.location.href = `/receipt/${order.id}?access=${encodeURIComponent(receiptAccessToken)}`;
  };
  if (!cartItems.length) return <PageShell><main className="page-main empty-checkout"><div className="breadcrumb"><a href="/">Home</a><span>/</span><a href="/cart">Your bag</a><span>/</span><span>Checkout</span></div><div className="empty-cart"><div className="empty-bag-icon"><ShoppingBag size={29} /></div><h2>Nothing in your bag just yet.</h2><p>Let’s find something that feels like you.</p><a className="button button-dark" href="/shop">Explore the collection <ArrowRight size={16} /></a></div></main></PageShell>;
  return <PageShell><main className="page-main checkout-page">
    <div className="breadcrumb"><a href="/">Home</a><span>/</span><a href="/cart">Your bag</a><span>/</span><span>Checkout</span></div><div className="page-heading-row checkout-heading"><div><span className="eyebrow">JUST A FEW LITTLE DETAILS</span><h1>Let’s make it <em>yours.</em></h1></div><span className="secure-note"><LockKeyhole size={15} /> Your order details</span></div>
    {error && <div className="notice error-notice">{error}</div>}
    {customer ? <div className="checkout-account-note"><CheckCircle2 size={16} /> Checking out as <strong>{customer.name}</strong><a href="/account">My account</a></div> : <div className="checkout-account-note"><UserRound size={16} /> Have an account? <a href="/account/login">Sign in</a> for a quicker checkout.</div>}
    <form className="checkout-layout" onSubmit={placeOrder}>
      <div className="checkout-fields">
        <section className="checkout-section"><div className="checkout-section-head"><span className="step-number">01</span><div><h2>Where can we find you?</h2><p>A few details so we can send your RUSHMEA your way.</p></div></div><div className="form-grid"><label className="form-field full-field">Full name<input name="name" autoComplete="name" required defaultValue={customer?.name || ""} readOnly={Boolean(customer)} placeholder="Your lovely name" /></label><label className="form-field">Email address<input name="email" type="email" autoComplete="email" required defaultValue={customer?.email || ""} readOnly={Boolean(customer)} placeholder="you@example.com" /></label><label className="form-field">Phone number<input name="phone" type="tel" autoComplete="tel" required defaultValue={customer?.phone || ""} readOnly={Boolean(customer)} placeholder="+254 7XX XXX XXX" /></label><label className="form-field">Country<input name="country" autoComplete="country-name" required defaultValue="Kenya" placeholder="Country" /></label><label className="form-field">City or town<input name="city" autoComplete="address-level2" required placeholder="City" /></label><label className="form-field full-field">Delivery address<input name="address" autoComplete="street-address" required placeholder="Street address, building, or area" /></label><label className="form-field full-field">Postal / ZIP code <span className="optional">(if available)</span><input name="postal" autoComplete="postal-code" placeholder="Postal code" /></label></div></section>
        <section className="checkout-section"><div className="checkout-section-head"><span className="step-number">02</span><div><h2>Pay with M-Pesa</h2><p>We’ll confirm the final delivery quote before payment is approved.</p></div></div><div className="mpesa-card"><div className="mpesa-logo">M<span>-</span>PESA</div><div><strong>M-Pesa, with a personal touch.</strong><p>Share your M-Pesa transaction code if you’ve already paid. Otherwise, place your order and our team will confirm the amount, delivery cost, and payment details with you first.</p></div></div><label className="form-field">M-Pesa transaction code <span className="optional">(optional until your quote is confirmed)</span><input name="mpesaReference" placeholder="e.g. QJH7K9WXYZ" autoCapitalize="characters" /></label><label className="form-field note-field">A note for our team <span className="optional">(optional)</span><textarea name="note" rows="3" placeholder="Anything you’d like us to know about your delivery?" /></label><div className="manual-payment-warning"><ShieldCheck size={17} /><p><strong>No payment is taken here.</strong> RUSHMEA will verify M-Pesa manually. Your order is not marked paid until an admin confirms it.</p></div></section>
      </div>
      <aside className="order-summary checkout-summary"><span className="eyebrow">YOUR RITUAL, RECAP’D</span><h2>Order summary <a href="/cart">Edit</a></h2><div className="checkout-items">{cartItems.map(({ product, quantity }) => <div className="checkout-item" key={product.id}><span className="checkout-item-count">{quantity}</span><ProductArtwork product={product} /><div><strong>{product.name}</strong><small>{product.size} · {money(product.price)} each</small></div><span>{money(product.price * quantity)}</span></div>)}</div><div className="coupon-form checkout-coupon"><label htmlFor="checkout-coupon">A little discount code?</label><div><input id="checkout-coupon" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter your code" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyCode())} /><button type="button" onClick={applyCode}>Apply</button></div>{notice && <small className={coupon ? "coupon-success" : "coupon-error"}>{notice}</small>}</div><div className="summary-row"><span>Subtotal</span><span>{money(subtotal)}</span></div>{discount > 0 && <div className="summary-row discount-row"><span>{appliedPromotion ? appliedPromotion.label : coupon?.code || "Promotion"}</span><span>−{money(discount)}</span></div>}<div className="summary-row delivery-row"><span>Delivery</span><span>To be confirmed</span></div><div className="summary-total"><span>Quote subtotal</span><strong>{money(subtotal - discount)}</strong></div><p className="quote-note">Final quote includes delivery once your address is reviewed. We’ll be in touch before payment is confirmed.</p><button className="button button-dark checkout-button" type="submit" disabled={busy}>{busy ? "Putting your order together…" : <>Place your order <ArrowRight size={17} /></>}</button><p className="terms-note">By placing your order, you agree to be contacted by RUSHMEA about your quote and delivery.</p></aside>
    </form>
  </main></PageShell>;
}

function ReceiptPage({ orderId }) {
  const { store } = useStore();
  const order = store.orders.find((item) => item.id === orderId);
  const customer = store.customers.find((item) => item.id === store.currentCustomerId);
  const queryAccessToken = new URLSearchParams(window.location.search).get("access");
  const tokenAccess = Boolean(order?.receiptAccessToken && (
    queryAccessToken === order.receiptAccessToken ||
    window.sessionStorage.getItem(`rushmea-receipt-${order.id}`) === order.receiptAccessToken
  ));
  const accountAccess = Boolean(customer && order?.customerId === customer.id);
  const [verifiedPhone, setVerifiedPhone] = useState(false);
  const [accessPhone, setAccessPhone] = useState("");
  const [accessError, setAccessError] = useState("");
  useEffect(() => {
    if (!order?.receiptAccessToken) return;
    if (queryAccessToken === order.receiptAccessToken) {
      window.sessionStorage.setItem(`rushmea-receipt-${order.id}`, order.receiptAccessToken);
    }
    if (queryAccessToken) window.history.replaceState({}, "", window.location.pathname);
  }, [order, queryAccessToken]);
  if (!order) return <NotFoundPage />;
  if (!accountAccess && !tokenAccess && !verifiedPhone) {
    const verifyPhone = (event) => {
      event.preventDefault();
      if (accessPhone.replace(/\s+/g, "") !== order.customer.phone.replace(/\s+/g, "")) {
        setAccessError("That phone number doesn’t match this quotation.");
        return;
      }
      if (order.receiptAccessToken) {
        window.sessionStorage.setItem(`rushmea-receipt-${order.id}`, order.receiptAccessToken);
      }
      setVerifiedPhone(true);
      setAccessError("");
    };
    return <PageShell><main className="page-main receipt-access-page"><div className="breadcrumb"><a href="/">Home</a><span>/</span><span>Order quotation</span></div><div className="receipt-access-card"><div className="account-profile-icon"><LockKeyhole size={19} /></div><span className="eyebrow">YOUR ORDER, KEPT PRIVATE</span><h1>Confirm it’s <em>yours.</em></h1><p>Enter the phone number used for this order to view its quotation and delivery details.</p><form className="receipt-access-form" onSubmit={verifyPhone}><label className="form-field">Phone number<input type="tel" required autoComplete="tel" value={accessPhone} onChange={(event) => { setAccessPhone(event.target.value); setAccessError(""); }} placeholder="The phone number from checkout" /></label>{accessError && <div className="notice error-notice" role="alert">{accessError}</div>}<button className="button button-dark">View my quotation <ArrowRight size={16} /></button></form></div></main></PageShell>;
  }
  const total = orderTotal(order);
  return <PageShell><main className="page-main receipt-page">
    <div className="receipt-success"><div className="success-check"><Check size={24} /></div><span className="eyebrow">YOUR ORDER IS WITH US</span><h1>Thank you, {order.customer.name.split(" ")[0]}<em>.</em></h1><p>Your quotation is ready. Our Nairobi team will confirm your delivery cost and M-Pesa details before your order is marked paid.</p></div>
    <article className="receipt-sheet" id="printable-receipt">
      <div className="receipt-top"><Logo /><div className="receipt-document-label"><span>{order.paymentStatus === "approved" ? "ORDER RECEIPT" : "ORDER QUOTATION"}</span><small>{order.paymentStatus === "approved" ? "Payment verified by RUSHMEA" : "Not a payment receipt"}</small></div></div>
      <div className="receipt-divider" />
      <div className="receipt-meta"><div><span>QUOTE NUMBER</span><strong>{order.id}</strong></div><div><span>DATE</span><strong>{new Date(order.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}</strong></div><div><span>STATUS</span><strong className={`status-pill ${order.paymentStatus === "approved" ? "status-paid" : "status-pending"}`}><i />{order.paymentStatus === "approved" ? "Payment approved" : order.fulfillmentStatus === "cancelled" ? "Order closed" : "Awaiting payment"}</strong></div></div>
      <div className="receipt-customer-grid"><div><span className="receipt-overline">PREPARED FOR</span><strong>{order.customer.name}</strong><p>{order.customer.email}<br />{order.customer.phone}</p></div><div><span className="receipt-overline">DELIVERY TO</span><strong>{order.address.city}, {order.address.country}</strong><p>{order.address.address}{order.address.postal ? `, ${order.address.postal}` : ""}</p></div><div className="receipt-location"><span className="receipt-overline">YOUR RUSHMEA HOME</span><strong>Nairobi, Kenya</strong><p>Made with love, sent your way<br />Worldwide delivery available</p></div></div>
      <div className="receipt-items"><div className="receipt-table-head"><span>YOUR RITUAL</span><span>QTY</span><span>UNIT PRICE</span><span>AMOUNT</span></div>{order.items.map((item, index) => <div className="receipt-table-row" key={`${item.productId}-${index}`}><div><strong>{item.name}</strong><small>RUSHMEA Haircare</small></div><span>{item.quantity}</span><span>{money(item.price)}</span><strong>{money(item.price * item.quantity)}</strong></div>)}</div>
      <div className="receipt-totals"><div><span>Subtotal</span><span>{money(order.subtotal)}</span></div>{order.discount > 0 && <div className="discount-row"><span>{order.discountLabel || order.couponCode || "Promotion"}</span><span>−{money(order.discount)}</span></div>}<div><span>Worldwide delivery</span><span className={order.deliveryCost === null ? "quote-pending" : ""}>{order.deliveryCost === null ? "To be confirmed" : money(order.deliveryCost)}</span></div><div className="receipt-grand-total"><span>{order.deliveryCost === null ? "Quoted product total" : "Total including delivery"}</span><strong>{money(total)}</strong></div>{order.deliveryCost === null && <small>Delivery will be added to your final quote before payment.</small>}</div>
      <div className="receipt-payment"><div className="receipt-payment-icon">M<span>-</span>PESA</div><div><strong>Payment status</strong><p>{order.paymentStatus === "approved" ? "Payment confirmed by RUSHMEA" : order.paymentInstructionsSentAt ? "Payment instructions sent by RUSHMEA" : "Awaiting payment instructions"}{order.mpesaReference ? ` · Reference ${order.mpesaReference}` : ""}</p></div><span className={`status-pill ${order.paymentStatus === "approved" ? "status-paid" : "status-pending"}`}><i />{order.paymentStatus === "approved" ? "PAID" : "NOT PAID"}</span></div>
      {order.paymentInstructionsSentAt && order.paymentInstructions && <div className="receipt-mpesa-instructions"><span className="receipt-overline">M-PESA PAYMENT DETAILS</span><p>{order.paymentInstructions}</p></div>}
      <div className="receipt-note"><CircleHelp size={17} /><p>{order.paymentStatus === "approved" ? <><strong>Payment verified by RUSHMEA.</strong> Your M-Pesa transaction was manually confirmed by our team. Keep your M-Pesa confirmation message as provider-issued proof of payment.</> : order.fulfillmentStatus === "cancelled" ? <><strong>This quotation was closed.</strong> Contact RUSHMEA if you need help with your order.</> : <><strong>This is a quotation, not a payment receipt.</strong> {order.paymentInstructionsSentAt ? "Use the M-Pesa payment details above and share your transaction reference with RUSHMEA." : "RUSHMEA will confirm delivery costs and send M-Pesa payment details before approving your payment."}</>}</p></div>
      <div className="receipt-bottom"><span>Thank you for letting us be part of your ritual.</span><span>RUSHMEA HAIRCARE · NAIROBI, KENYA</span></div>
    </article>
    <div className="receipt-actions"><button className="button button-outline" onClick={() => window.print()}><Printer size={16} /> Print / Save quotation</button><a className="button button-dark" href={`/track?order=${encodeURIComponent(order.id)}`}>Track your order <ArrowRight size={16} /></a></div>
  </main></PageShell>;
}

function TrackPage() {
  const { store } = useStore();
  const params = new URLSearchParams(window.location.search);
  const [orderId, setOrderId] = useState(params.get("order") || "");
  const [phone, setPhone] = useState("");
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const matchesOrder = (item) => item.id.toLowerCase() === orderId.trim().toLowerCase() && phone.trim() && item.customer.phone.replace(/\s+/g, "") === phone.trim().replace(/\s+/g, "");
  const order = searched ? store.orders.find(matchesOrder) : null;
  const stages = [
    { key: "awaiting-payment", label: "Quote & payment", description: "We’re confirming your delivery details and M-Pesa payment." },
    { key: "preparing", label: "Getting your order ready", description: "Your RUSHMEA ritual is being packed with love." },
    { key: "shipped", label: "On its way", description: "Your package has left our Nairobi home." },
    { key: "delivered", label: "Delivered", description: "Your RUSHMEA ritual has arrived." },
  ];
  const stageIndex = order ? stages.findIndex((stage) => stage.key === order.fulfillmentStatus) : -1;
  const search = (event) => {
    event.preventDefault();
    if (!phone.trim()) {
      setSearched(true);
      setError("Enter the phone number used for this order to view its status.");
      return;
    }
    setSearched(true);
    const found = store.orders.find(matchesOrder);
    setError(found ? "" : "We couldn't find an order matching those details in this browser.");
  };
  return <PageShell><main className="page-main track-page">
    <div className="track-intro"><span className="eyebrow">WE’RE RIGHT HERE WITH YOU</span><h1>Your order, <em>your way.</em></h1><p>Enter your quote number to see where your RUSHMEA ritual is right now.</p></div>
    <form className="track-search" onSubmit={search}><label>QUOTE NUMBER<input required value={orderId} onChange={(e) => { setOrderId(e.target.value); setError(""); }} placeholder="RM-…" /></label><label>PHONE NUMBER<input required type="tel" value={phone} onChange={(e) => { setPhone(e.target.value); setError(""); }} placeholder="The number from your order" /></label><button className="button button-dark">Find my order <ArrowRight size={16} /></button></form>
    {error && <div className="notice error-notice track-error" role="alert">{error}</div>}
    {order && <section className="track-result"><div className="track-result-head"><div><span className="eyebrow">YOUR LITTLE UPDATE</span><h2>Looking good, {order.customer.name.split(" ")[0]}.</h2><p>Quote <strong>{order.id}</strong> · {new Date(order.createdAt).toLocaleDateString("en-KE", { dateStyle: "medium" })}</p></div><a className="text-link" href={`/receipt/${order.id}`}>View quotation <ArrowUpRight size={15} /></a></div><div className="tracking-steps">{stages.map((stage, index) => <div key={stage.key} className={`tracking-step ${index <= stageIndex ? "completed" : ""} ${index === stageIndex ? "current" : ""}`}><div className="step-icon">{index < stageIndex ? <Check size={16} /> : index === 0 ? <CreditCard size={16} /> : index === 1 ? <Package size={16} /> : index === 2 ? <Truck size={16} /> : <Heart size={16} />}</div><div className="tracking-step-copy"><strong>{stage.label}</strong><p>{stage.description}</p>{index === 0 && <span className={`payment-status ${order.paymentStatus === "approved" ? "paid" : ""}`}>{order.fulfillmentStatus === "cancelled" ? "Order closed by RUSHMEA" : order.paymentStatus === "approved" ? "M-Pesa payment approved" : "Waiting for payment approval"}</span>}</div><div className="step-line" /></div>)}</div>{order.fulfillmentStatus === "cancelled" && <div className="order-cancelled-banner">This order has been closed. Contact RUSHMEA if you need help with your quotation.</div>}{order.paymentStatus === "approved" && <div className="payment-confirmed-banner"><CheckCircle2 size={19} /><span><strong>Payment done — thank you!</strong><small>Your M-Pesa payment was approved by our team.</small></span><span className="status-pill status-paid"><i />PAID</span></div>}{order.fulfillmentStatus === "delivered" && <div className="delivered-banner">Your RUSHMEA ritual has been delivered. We hope you love it. <span>✳</span></div>}</section>}
    <div className="track-help"><CircleHelp size={19} /><p><strong>Need a hand?</strong><br />Keep your quote number and phone number handy when contacting RUSHMEA about your order.</p></div>
  </main></PageShell>;
}

const fulfillmentOptions = [
  ["awaiting-payment", "Awaiting payment"],
  ["preparing", "Preparing"],
  ["shipped", "Shipped"],
  ["delivered", "Delivered"],
  ["cancelled", "Cancelled"],
];

export function AdminPage({ onLogout, onChangePassword }) {
  const { store, setStore } = useStore();
  const [tab, setTab] = useState("overview");
  const [message, setMessage] = useState("");
  const [productForm, setProductForm] = useState({ name: "", category: "", price: "", stock: "", description: "", size: "", color: "#b7c8ac", imageUrl: "" });
  const [categoryInput, setCategoryInput] = useState("");
  const [couponInput, setCouponInput] = useState({ code: "", percent: "" });
  const [editingProduct, setEditingProduct] = useState(null);
  const [deliveryInputs, setDeliveryInputs] = useState({});
  const [referenceInputs, setReferenceInputs] = useState({});
  const [paymentMessageInputs, setPaymentMessageInputs] = useState({});
  const [showProductForm, setShowProductForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [loyaltyDraft, setLoyaltyDraft] = useState(store.loyalty);
  const [offerDrafts, setOfferDrafts] = useState({});
  const orders = store.orders;
  const paidCount = orders.filter((order) => order.paymentStatus === "approved").length;
  const sales = orders.filter((order) => order.paymentStatus === "approved").reduce((sum, order) => sum + orderTotal(order), 0);
  const notify = (text) => { setMessage(text); window.setTimeout(() => setMessage(""), 3800); };
  const resetProductForm = () => { setProductForm({ name: "", category: store.categories[0] || "", price: "", stock: "", description: "", size: "", color: "#b7c8ac", imageUrl: "" }); setEditingProduct(null); setShowProductForm(false); setFormError(""); };
  const saveProduct = (event) => {
    event.preventDefault();
    const price = Number(productForm.price);
    const stock = Number(productForm.stock);
    if (!productForm.name.trim() || !productForm.category || !Number.isFinite(price) || price <= 0 || !Number.isInteger(stock) || stock < 0 || !productForm.description.trim()) { setFormError("Add a name, category, description, positive price, and whole-number stock quantity."); return; }
    const existingId = editingProduct?.id;
    const imageUrl = productForm.imageUrl.trim();
    if (imageUrl) {
      try {
        const parsedImageUrl = new URL(imageUrl);
        if (!["https:", "http:"].includes(parsedImageUrl.protocol)) throw new Error("Unsupported image URL.");
      } catch {
        setFormError("Product image must be a complete HTTP or HTTPS address.");
        return;
      }
    }
    const product = { ...productForm, imageUrl, id: existingId || makeId(productForm.name), price, stock, featured: editingProduct?.featured || false, active: true };
    setStore((current) => ({ ...current, products: existingId ? current.products.map((item) => item.id === existingId ? product : item) : [product, ...current.products] }));
    notify(existingId ? "Your product has been updated." : "Your new product is live in the shop.");
    resetProductForm();
    setTab("products");
  };
  const editProduct = (product) => {
    setEditingProduct(product);
    setProductForm({ name: product.name, category: product.category, price: String(product.price), stock: String(product.stock), description: product.description, size: product.size || "", color: product.color || "#b7c8ac", imageUrl: product.imageUrl || "" });
    setShowProductForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const addCategory = (event) => {
    event.preventDefault();
    const name = categoryInput.trim();
    if (!name || store.categories.some((cat) => cat.toLowerCase() === name.toLowerCase())) return;
    setStore((current) => ({ ...current, categories: [...current.categories, name] }));
    setCategoryInput("");
    notify(`${name} added to your shop sections.`);
  };
  const addCoupon = (event) => {
    event.preventDefault();
    const code = couponInput.code.trim().toUpperCase();
    const percent = Number(couponInput.percent);
    if (!code || !Number.isInteger(percent) || percent < 1 || percent > 90 || store.coupons.some((coupon) => coupon.code.toLowerCase() === code.toLowerCase())) return;
    setStore((current) => ({ ...current, coupons: [...current.coupons, { id: makeId(code), code, percent, active: true }] }));
    setCouponInput({ code: "", percent: "" });
    notify(`${code} is ready to share.`);
  };
  const toggleProduct = (productId) => setStore((current) => ({ ...current, products: current.products.map((p) => p.id === productId ? { ...p, active: !p.active } : p) }));
  const toggleCoupon = (couponId) => setStore((current) => ({ ...current, coupons: current.coupons.map((coupon) => coupon.id === couponId ? { ...coupon, active: !coupon.active } : coupon) }));
  const updateOrder = (orderId, patch) => setStore((current) => ({
    ...current,
    orders: current.orders.map((order) => order.id === orderId ? { ...order, ...patch } : order),
  }));
  const approvePayment = (order) => {
    if (!order.mpesaReference.trim()) { notify(`Add and verify ${order.customer.name}’s M-Pesa transaction code before approving.`); return; }
    if (order.deliveryCost === null || order.deliveryCost === undefined) { notify("Set the confirmed delivery cost before approving payment."); return; }
    const unavailable = order.items.filter((item) => {
      const product = store.products.find((candidate) => candidate.id === item.productId);
      return !product || !product.active || product.stock < item.quantity;
    });
    if (unavailable.length) { notify(`Not enough available stock to approve: ${unavailable.map((item) => item.name).join(", ")}.`); return; }
    setStore((current) => ({
      ...current,
      products: current.products.map((product) => {
        const orderedQuantity = order.items
          .filter((item) => item.productId === product.id)
          .reduce((sum, item) => sum + item.quantity, 0);
        return orderedQuantity ? { ...product, stock: product.stock - orderedQuantity } : product;
      }),
      orders: current.orders.map((item) => item.id === order.id
        ? { ...item, paymentStatus: "approved", inventoryApplied: true, fulfillmentStatus: item.fulfillmentStatus === "awaiting-payment" ? "preparing" : item.fulfillmentStatus }
        : item),
    }));
    notify(`Payment approved for ${order.customer.name}. Their order page now shows Paid.`);
  };
  const saveDelivery = (orderId) => {
    const cost = Number(deliveryInputs[orderId]);
    if (!Number.isFinite(cost) || cost < 0) { notify("Enter a valid delivery amount (zero is okay)."); return; }
    updateOrder(orderId, { deliveryCost: cost });
    notify("Delivery quote updated. The customer’s total is now current.");
  };
  const savePaymentReference = (order) => {
    const mpesaReference = (referenceInputs[order.id] ?? order.mpesaReference ?? "").trim().toUpperCase();
    if (!mpesaReference) { notify("Enter the M-Pesa transaction reference before saving."); return; }
    updateOrder(order.id, { mpesaReference });
    notify("M-Pesa reference saved. Verify it against your account before approval.");
  };
  const savePaymentMessage = (order) => {
    const paymentInstructions = (paymentMessageInputs[order.id] ?? order.paymentInstructions ?? "").trim();
    if (!paymentInstructions) { notify("Add the M-Pesa payment details for this customer first."); return; }
    updateOrder(order.id, { paymentInstructions });
    notify("Payment instructions saved to the customer’s quotation.");
  };
  const composePaymentEmail = (order) => {
    const paymentInstructions = (paymentMessageInputs[order.id] ?? order.paymentInstructions ?? "").trim();
    if (order.deliveryCost === null || !paymentInstructions) {
      notify("Save the delivery quote and M-Pesa payment details before preparing the email.");
      return;
    }
    const subject = `RUSHMEA payment details · ${order.id}`;
    const body = [
      `Hello ${order.customer.name},`,
      "",
      `Your RUSHMEA quotation ${order.id} is ready.`,
      `Order total including delivery: ${money(orderTotal({ ...order, paymentInstructions }))}.`,
      "",
      "M-Pesa payment details:",
      paymentInstructions,
      "",
      "Please send us your M-Pesa transaction reference after payment.",
      "Thank you,",
      "RUSHMEA Haircare",
    ].join("\n");
    window.location.href = `mailto:${encodeURIComponent(order.customer.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    notify("An email draft is open. Send it from your email app, then confirm that it was sent here.");
  };
  const confirmPaymentEmailSent = (order) => {
    if (!order.paymentInstructions?.trim() || order.deliveryCost === null) {
      notify("Save the delivery quote and M-Pesa payment details first.");
      return;
    }
    updateOrder(order.id, { paymentInstructionsSentAt: new Date().toISOString() });
    notify("Payment request marked as sent. It will now appear on the customer’s quotation.");
  };
  const saveLoyaltySettings = (event) => {
    event.preventDefault();
    const purchaseThreshold = Number(loyaltyDraft.purchaseThreshold);
    const discountPercent = Number(loyaltyDraft.discountPercent);
    if (!Number.isInteger(purchaseThreshold) || purchaseThreshold < 2 || purchaseThreshold > 50 || !Number.isInteger(discountPercent) || discountPercent < 1 || discountPercent > 90) {
      notify("Set a purchase milestone from 2–50 and a discount from 1–90%.");
      return;
    }
    setStore((current) => ({ ...current, loyalty: { ...loyaltyDraft, purchaseThreshold, discountPercent } }));
    notify("Private repeat-customer rewards have been updated.");
  };
  const saveCustomerOffer = (customerId) => {
    const percent = Number(offerDrafts[customerId] ?? 10);
    if (!Number.isInteger(percent) || percent < 1 || percent > 90) {
      notify("Choose a private discount between 1% and 90%.");
      return;
    }
    setStore((current) => ({
      ...current,
      customers: current.customers.map((customer) => customer.id === customerId
        ? { ...customer, privateOffer: { active: true, percent, createdAt: new Date().toISOString() } }
        : customer),
    }));
    notify("Private checkout offer saved for this customer.");
  };
  const revokeCustomerOffer = (customerId) => {
    setStore((current) => ({
      ...current,
      customers: current.customers.map((customer) => customer.id === customerId
        ? { ...customer, privateOffer: { ...customer.privateOffer, active: false } }
        : customer),
    }));
    notify("Private customer offer paused.");
  };
  const tabs = [["overview", "Overview"], ["orders", `Orders${orders.length ? ` · ${orders.length}` : ""}`], ["products", "Products"], ["customers", `Customers${store.customers.length ? ` · ${store.customers.length}` : ""}`], ["discounts", "Sections & offers"], ["security", "Security"]];
  const lowStock = store.products.filter((product) => product.active && product.stock <= 4).length;
  const openOrders = orders.filter((order) => order.fulfillmentStatus !== "cancelled");
  return <main className="admin-app">
    <aside className="admin-sidebar"><Logo small /><div className="admin-store-label"><span>STORE ADMINISTRATION</span><div><span className="admin-live-dot" />Rusaylah.CEO</div></div><nav className="admin-nav">{tabs.map(([key, label]) => <button className={tab === key ? "active" : ""} key={key} onClick={() => { setTab(key); setShowProductForm(false); }}><span className="nav-indicator" />{key === "overview" ? <Flower2 size={17} /> : key === "orders" ? <Package size={17} /> : key === "products" ? <ShoppingBag size={17} /> : key === "customers" ? <UsersRound size={17} /> : key === "security" ? <LockKeyhole size={17} /> : <BadgePercent size={17} />}{label}</button>)}</nav><div className="sidebar-bottom"><a href="/"><ArrowLeft size={15} />Back to the shop</a><button type="button" className="admin-logout" onClick={onLogout}><LockKeyhole size={14} />Sign out</button></div></aside>
    <section className="admin-workspace"><header className="admin-topbar"><div className="admin-mobile-logo"><Logo small /></div><span className="admin-top-note"><span className="admin-live-dot" />STORE MANAGEMENT</span><a href="/" className="admin-view-shop">View storefront <ArrowUpRight size={15} /></a></header>
      <div className="admin-content">
        {message && <div className="admin-toast"><CheckCircle2 size={17} />{message}<button aria-label="Dismiss notification" onClick={() => setMessage("")}><X size={16} /></button></div>}
        {tab === "overview" && <>
          <div className="admin-page-heading"><div><span className="eyebrow">A LITTLE LOOK AT YOUR SHOP</span><h1>Good morning, <em>RUSHMEA.</em></h1><p>Here’s what’s happening with your haircare home.</p></div><button className="button button-dark" onClick={() => { setTab("products"); setShowProductForm(true); resetProductForm(); setShowProductForm(true); }}><Plus size={17} /> Add a product</button></div>
          <div className="metrics-grid"><div className="metric-card"><span>PRODUCTS IN YOUR SHOP</span><strong>{store.products.filter((p) => p.active).length}</strong><small><ShoppingBag size={14} /> {store.products.filter((p) => p.stock > 0 && p.active).length} in stock</small></div><div className="metric-card"><span>ORDERS TO LOOK AFTER</span><strong>{openOrders.filter((o) => o.paymentStatus !== "approved").length}</strong><small><Clock3 size={14} /> {openOrders.filter((o) => o.paymentStatus !== "approved").length} awaiting payment check</small></div><div className="metric-card"><span>PAYMENTS CONFIRMED</span><strong>{paidCount}</strong><small><CheckCircle2 size={14} /> {money(sales)} total approved</small></div><div className="metric-card metric-alert"><span>KEEP AN EYE ON</span><strong>{lowStock}</strong><small><Package size={14} /> products low or out of stock</small></div></div>
          <div className="admin-overview-grid"><section className="admin-panel recent-orders"><div className="panel-heading"><div><span className="eyebrow">THE LATEST</span><h2>Recent orders</h2></div><button className="text-link" onClick={() => setTab("orders")}>All orders <ArrowRight size={14} /></button></div>{orders.length ? orders.slice(0, 4).map((order) => <div className="recent-order-row" key={order.id}><div className="order-avatar">{order.customer.name.slice(0, 1).toUpperCase()}</div><div className="recent-order-customer"><strong>{order.customer.name}</strong><small>{order.id} · {new Date(order.createdAt).toLocaleDateString("en-KE")}</small></div><span className={`admin-status ${order.paymentStatus === "approved" ? "paid" : ""}`}>{order.paymentStatus === "approved" ? "Paid" : "Needs a look"}</span><strong>{money(orderTotal(order))}</strong></div>) : <div className="admin-empty"><Package size={24} /><p>Your first order will show up here.</p><button className="text-link" onClick={() => setTab("products")}>Make sure your shop is ready <ArrowRight size={14} /></button></div>}</section>
          <section className="admin-panel inventory-panel"><div className="panel-heading"><div><span className="eyebrow">THE SHELF CHECK</span><h2>Inventory notes</h2></div><button className="text-link" onClick={() => setTab("products")}>Manage <ArrowRight size={14} /></button></div>{store.products.filter((p) => p.active).slice(0, 5).map((product) => <div className="inventory-row" key={product.id}><ProductArtwork product={product} /><div><strong>{product.name}</strong><small>{product.category}</small></div><span className={`stock-label ${product.stock <= 4 ? "low" : ""}`}><i />{product.stock > 0 ? `${product.stock} left` : "Out of stock"}</span></div>)}</section></div>
          <div className="admin-footer-note"><Sparkles size={17} /><span>A little note: review an order’s delivery quote before approving payment. Your customer’s quotation updates with the final amount.</span></div>
        </>}
        {tab === "products" && <>
          <div className="admin-page-heading"><div><span className="eyebrow">WHAT’S ON YOUR SHELF</span><h1>Your <em>products.</em></h1><p>Add, update, and keep an eye on what’s available.</p></div><button className="button button-dark" onClick={() => { if (showProductForm) resetProductForm(); else { resetProductForm(); setShowProductForm(true); } }}><Plus size={17} /> {showProductForm ? "Close form" : "Add a product"}</button></div>
          {showProductForm && <form className="admin-panel product-editor" onSubmit={saveProduct}><div className="panel-heading"><div><span className="eyebrow">{editingProduct ? "PRODUCT DETAILS" : "NEW PRODUCT"}</span><h2>{editingProduct ? "Edit this product" : "Add a product"}</h2></div><button type="button" className="icon-button" onClick={resetProductForm} aria-label="Close product form"><X size={18} /></button></div>{formError && <div className="notice error-notice">{formError}</div>}<div className="form-grid"><label className="form-field">Product name<input value={productForm.name} onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))} required placeholder="Product name" /></label><label className="form-field">Shop section<select value={productForm.category} onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))} required><option value="" disabled>Choose a section</option>{store.categories.map((cat) => <option key={cat}>{cat}</option>)}</select></label><label className="form-field">Price · KSh<input type="number" min="1" step="1" value={productForm.price} onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))} required placeholder="Price" /></label><label className="form-field">Stock quantity<input type="number" min="0" step="1" value={productForm.stock} onChange={(e) => setProductForm((p) => ({ ...p, stock: e.target.value }))} required placeholder="Available quantity" /></label><label className="form-field full-field">Product description<textarea rows="3" value={productForm.description} onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))} required placeholder="Describe this product" /></label><label className="form-field">Size / amount<input value={productForm.size} onChange={(e) => setProductForm((p) => ({ ...p, size: e.target.value }))} placeholder="e.g. 300 ml" /></label><label className="form-field">Product image URL<input type="url" value={productForm.imageUrl} onChange={(e) => setProductForm((p) => ({ ...p, imageUrl: e.target.value }))} placeholder="https://…" /></label><label className="form-field">Artwork colour<input type="color" value={productForm.color} onChange={(e) => setProductForm((p) => ({ ...p, color: e.target.value }))} /></label></div><div className="editor-actions"><button type="button" className="button button-outline" onClick={resetProductForm}>Cancel</button><button className="button button-dark"><Check size={16} />{editingProduct ? "Save changes" : "Add product"}</button></div></form>}
          <div className="admin-panel product-table"><div className="table-heading"><span>PRODUCT</span><span>SECTION</span><span>PRICE</span><span>STOCK</span><span>VISIBILITY</span><span>EDIT</span></div>{store.products.map((product) => <div className="product-admin-row" key={product.id}><div className="admin-product-name"><ProductArtwork product={product} /><div><strong>{product.name}</strong><small>{product.size || "Size not added"}</small></div></div><span>{product.category}</span><strong>{money(product.price)}</strong><span className={`stock-label ${product.stock <= 4 ? "low" : ""}`}><i />{product.stock > 0 ? product.stock : "Out"}</span><button className={`visibility-toggle ${product.active ? "visible" : ""}`} onClick={() => toggleProduct(product.id)}>{product.active ? "Live" : "Hidden"}</button><button className="table-action" onClick={() => editProduct(product)}>Edit <ArrowUpRight size={13} /></button></div>)}</div>
          <section className="admin-panel section-manager"><div className="panel-heading"><div><span className="eyebrow">ORGANISE YOUR SHELVES</span><h2>Shop sections</h2></div></div><div className="category-list">{store.categories.map((category) => <span className="category-tag" key={category}>{category}<small>{store.products.filter((p) => p.category === category).length} products</small></span>)}</div><form className="inline-add-form" onSubmit={addCategory}><input value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)} placeholder="Name a new section" required /><button className="button button-outline"><Plus size={15} />Add section</button></form></section>
        </>}
        {tab === "orders" && <>
          <div className="admin-page-heading"><div><span className="eyebrow">A LITTLE CARE, ALL THE WAY THROUGH</span><h1>Your <em>orders.</em></h1><p>Confirm each M-Pesa payment and keep your customers in the loop.</p></div></div>
          <div className="order-workflow-note"><div><ShieldCheck size={20} /><span><strong>Check before you approve.</strong><small>Confirm the M-Pesa reference against your account, set the delivery quote, then approve. The customer’s quotation and tracking page will update.</small></span></div><span className="mpesa-logo">M<span>-</span>PESA</span></div>
          {orders.length ? <div className="admin-orders-list">{orders.map((order) => <article className="admin-order-card" key={order.id}><div className="admin-order-head"><div><span className="eyebrow">{order.id} · {new Date(order.createdAt).toLocaleDateString("en-KE", { dateStyle: "medium" })}</span><h2>{order.customer.name}</h2><p>{order.customer.email} · {order.customer.phone}</p></div><div className="order-head-status"><span className={`admin-status ${order.paymentStatus === "approved" ? "paid" : ""}`}>{order.fulfillmentStatus === "cancelled" ? "Order closed" : order.paymentStatus === "approved" ? "Payment approved" : "Awaiting payment"}</span><span className="fulfillment-label">{(fulfillmentOptions.find(([value]) => value === order.fulfillmentStatus)?.[1]) || order.fulfillmentStatus}</span></div></div>
            <div className="admin-order-body"><div className="admin-order-items"><span className="admin-overline">THEIR RITUAL</span>{order.items.map((item, index) => <div className="admin-order-item" key={`${item.productId}-${index}`}><span>{item.quantity} ×</span><strong>{item.name}</strong><span>{money(item.price * item.quantity)}</span></div>)}{order.discount > 0 && <small className="coupon-success">{order.discountLabel || order.couponCode || "Promotion"} · −{money(order.discount)}</small>}</div><div className="admin-order-destination"><span className="admin-overline">DELIVER TO</span><strong>{order.address.city}, {order.address.country}</strong><p>{order.address.address}{order.address.postal ? ` · ${order.address.postal}` : ""}</p>{order.customerNote && <p className="customer-note">“{order.customerNote}”</p>}<label className="admin-message-label">M-Pesa details for the customer<textarea rows="2" value={paymentMessageInputs[order.id] ?? order.paymentInstructions ?? ""} disabled={order.paymentStatus === "approved"} onChange={(event) => setPaymentMessageInputs((current) => ({ ...current, [order.id]: event.target.value }))} placeholder="Paybill or Till number, account name, and payment steps" /></label><div className="payment-message-actions"><button onClick={() => savePaymentMessage(order)} disabled={order.paymentStatus === "approved"}>Save details</button><button onClick={() => composePaymentEmail(order)} disabled={order.paymentStatus === "approved"}>Prepare email</button>{order.paymentInstructionsSentAt ? <span className="instructions-sent-label">Email sent</span> : <button onClick={() => confirmPaymentEmailSent(order)} disabled={order.paymentStatus === "approved" || !order.paymentInstructions}>Mark email sent</button>}</div>{order.paymentInstructionsSentAt && <span className="instructions-sent-label">Payment instructions sent · {new Date(order.paymentInstructionsSentAt).toLocaleDateString("en-KE")}</span>}</div><div className="admin-order-payment"><span className="admin-overline">M-PESA TRANSACTION REFERENCE</span><input aria-label={`M-Pesa reference for ${order.customer.name}`} className="admin-reference-input" value={referenceInputs[order.id] ?? order.mpesaReference ?? ""} disabled={order.paymentStatus === "approved"} onChange={(event) => setReferenceInputs((current) => ({ ...current, [order.id]: event.target.value.toUpperCase() }))} placeholder="Enter customer’s code" /><button className="reference-save-button" onClick={() => savePaymentReference(order)} disabled={order.paymentStatus === "approved"}>Save reference</button><span className={`payment-status ${order.paymentStatus === "approved" ? "paid" : ""}`}>{order.paymentStatus === "approved" ? "Payment approved" : "Verify the code in M-Pesa"}</span></div></div>
            <div className="admin-order-total-row"><div className="delivery-editor"><label htmlFor={`delivery-${order.id}`}>Delivery quote · KSh</label><div><input id={`delivery-${order.id}`} type="number" min="0" step="1" placeholder="Confirm delivery" value={deliveryInputs[order.id] ?? (order.deliveryCost ?? "")} disabled={order.paymentStatus === "approved"} onChange={(e) => setDeliveryInputs((current) => ({ ...current, [order.id]: e.target.value }))} /><button disabled={order.paymentStatus === "approved"} onClick={() => saveDelivery(order.id)}>Save quote</button></div></div><div className="admin-order-total"><span>Customer total</span><strong>{money(orderTotal(order))}</strong><small>{order.deliveryCost === null ? "Delivery not confirmed" : "Includes confirmed delivery"}</small></div></div>
            <div className="admin-order-actions">{order.paymentStatus === "approved" ? <span className="payment-approved"><CheckCircle2 size={17} /> Payment approved · customer page updated</span> : order.fulfillmentStatus === "cancelled" ? <span className="order-closed-label">This unpaid order is closed.</span> : <><button className="button button-dark" disabled={!order.mpesaReference || order.deliveryCost === null} onClick={() => approvePayment(order)}><CheckCircle2 size={16} /> Confirm M-Pesa & approve payment</button><button className="button button-outline close-order-button" onClick={() => updateOrder(order.id, { fulfillmentStatus: "cancelled" })}>Close unpaid order</button></>}<label className="fulfillment-select-label">Delivery status<select value={order.fulfillmentStatus} onChange={(e) => updateOrder(order.id, { fulfillmentStatus: e.target.value })}>{fulfillmentOptions.map(([value, label]) => <option key={value} value={value} disabled={order.paymentStatus === "approved" && value === "cancelled"}>{label}</option>)}</select><ChevronDown size={14} /></label></div>
          </article>)}</div> : <div className="empty-state admin-no-orders"><Package size={30} /><h2>No orders just yet</h2><p>New customer quotations will appear here. Share the shop to get started.</p><a href="/shop" className="button button-outline">View your shop <ArrowUpRight size={15} /></a></div>}
        </>}
        {tab === "customers" && <>
          <div className="admin-page-heading"><div><span className="eyebrow">CUSTOMER RELATIONSHIPS</span><h1>Your <em>customers.</em></h1><p>Review account history and manage private rewards for returning customers.</p></div></div>
          <form className="admin-panel loyalty-settings" onSubmit={saveLoyaltySettings}>
            <div className="panel-heading"><div><span className="eyebrow">REPEAT-CUSTOMER REWARDS</span><h2>Private thank-you offers</h2></div><BadgePercent size={22} /></div>
            <p className="panel-copy">Eligible customers see their offer for the first time at checkout. Only approved, paid orders count toward a milestone.</p>
            <div className="loyalty-controls">
              <label className="loyalty-toggle"><input type="checkbox" checked={loyaltyDraft.enabled} onChange={(event) => setLoyaltyDraft((current) => ({ ...current, enabled: event.target.checked }))} /><span>Automatic purchase milestone</span></label>
              <label className="form-field">Paid purchases<input type="number" min="2" max="50" value={loyaltyDraft.purchaseThreshold} onChange={(event) => setLoyaltyDraft((current) => ({ ...current, purchaseThreshold: event.target.value }))} /></label>
              <label className="form-field">Private offer · %<input type="number" min="1" max="90" value={loyaltyDraft.discountPercent} onChange={(event) => setLoyaltyDraft((current) => ({ ...current, discountPercent: event.target.value }))} /></label>
              <button className="button button-dark"><Check size={15} />Save rewards</button>
            </div>
          </form>
          <section className="admin-panel customer-list-panel">
            <div className="panel-heading"><div><span className="eyebrow">YOUR CUSTOMER BOOK</span><h2>{store.customers.length} {store.customers.length === 1 ? "customer" : "customers"}</h2></div><UsersRound size={22} /></div>
            {store.customers.length ? <div className="customer-table">
              <div className="customer-table-head"><span>CUSTOMER</span><span>PAID PURCHASES</span><span>SPEND</span><span>PRIVATE OFFER</span></div>
              {store.customers.map((customer) => {
                const customerOrders = orders.filter((order) => order.customerId === customer.id);
                const paidOrders = customerOrders.filter((order) => order.paymentStatus === "approved");
                const lifetimeSpend = paidOrders.reduce((sum, order) => sum + orderTotal(order), 0);
                return <div className="customer-table-row" key={customer.id}>
                  <div className="customer-table-name"><span className="order-avatar">{customer.name.slice(0, 1).toUpperCase()}</span><div><strong>{customer.name}</strong><small>{customer.email} · {customer.phone}</small><small>Joined {new Date(customer.createdAt).toLocaleDateString("en-KE", { dateStyle: "medium" })}</small></div></div>
                  <strong>{paidOrders.length}<small>{customerOrders.length - paidOrders.length} awaiting payment</small></strong>
                  <strong>{money(lifetimeSpend)}</strong>
                  <div className="customer-private-offer">{customer.privateOffer?.active
                    ? <><span className="customer-offer-active">{customer.privateOffer.percent}% offer ready for checkout</span><button className="table-action" onClick={() => revokeCustomerOffer(customer.id)}>Pause offer</button></>
                    : <><label><input aria-label={`Private offer percentage for ${customer.name}`} type="number" min="1" max="90" value={offerDrafts[customer.id] ?? 10} onChange={(event) => setOfferDrafts((current) => ({ ...current, [customer.id]: event.target.value }))} /><span>%</span></label><button className="button button-outline customer-offer-button" onClick={() => saveCustomerOffer(customer.id)}>Set offer</button></>}</div>
                </div>;
              })}
            </div> : <div className="admin-empty customer-empty"><UsersRound size={25} /><p>Customers appear here when they create an account.</p><span>Paid purchase totals update after M-Pesa payment approval.</span></div>}
          </section>
          <div className="admin-footer-note"><LockKeyhole size={16} /><span>Customer account data is private. Keep administrator access protected before opening the store publicly.</span></div>
        </>}
        {tab === "discounts" && <>
          <div className="admin-page-heading"><div><span className="eyebrow">A LITTLE SOMETHING EXTRA</span><h1>Sections & <em>offers.</em></h1><p>Keep your shop organised and give your customers a little reason to smile.</p></div></div>
          <div className="offers-grid"><section className="admin-panel offer-panel"><div className="panel-heading"><div><span className="eyebrow">SHOP ORGANISATION</span><h2>Your sections</h2></div><Flower2 size={22} /></div><p className="panel-copy">Sections help customers find just the right bit of their ritual.</p><div className="category-list vertical">{store.categories.map((category) => <span className="category-tag" key={category}>{category}<small>{store.products.filter((p) => p.category === category).length} products</small></span>)}</div><form className="inline-add-form" onSubmit={addCategory}><input value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)} placeholder="e.g. Scalp care" required /><button className="button button-dark"><Plus size={15} />Add section</button></form></section>
          <section className="admin-panel offer-panel"><div className="panel-heading"><div><span className="eyebrow">SHARE A LITTLE LOVE</span><h2>Discount codes</h2></div><BadgePercent size={23} /></div><p className="panel-copy">Create a code for a percentage off the products in a customer's bag.</p><form className="coupon-create-form" onSubmit={addCoupon}><label className="form-field">Code<input value={couponInput.code} onChange={(e) => setCouponInput((v) => ({ ...v, code: e.target.value.toUpperCase() }))} required placeholder="A-LITTLE-LOVE" /></label><label className="form-field">Discount %<input type="number" min="1" max="90" value={couponInput.percent} onChange={(e) => setCouponInput((v) => ({ ...v, percent: e.target.value }))} required placeholder="10" /></label><button className="button button-dark"><Plus size={15} />Create code</button></form><div className="coupon-list">{store.coupons.map((coupon) => <div className="coupon-admin-row" key={coupon.id}><div className="coupon-code"><BadgePercent size={17} /><strong>{coupon.code}</strong></div><span>{coupon.percent}% off</span><button className={`visibility-toggle ${coupon.active ? "visible" : ""}`} onClick={() => toggleCoupon(coupon.id)}>{coupon.active ? "Active" : "Paused"}</button></div>)}</div></section></div>
          <div className="admin-footer-note"><CircleHelp size={17} /><span>Discounts apply to product subtotal only. Delivery is quoted separately by your team.</span></div>
        </>}
        {tab === "security" && <section className="admin-panel admin-security-panel"><div className="panel-heading"><div><span className="eyebrow">ADMINISTRATOR ACCESS</span><h2>Change your password</h2></div><LockKeyhole size={22} /></div><p className="panel-copy">Signed in as Rusaylah.CEO. Choose a unique password with at least 12 characters.</p><form className="admin-password-form" onSubmit={async (event) => {
          event.preventDefault();
          const formElement = event.currentTarget;
          const form = new FormData(formElement);
          const result = await onChangePassword(String(form.get("currentPassword") || ""), String(form.get("newPassword") || ""), String(form.get("confirmPassword") || ""));
          if (result) {
            notify(result);
            if (result.startsWith("Your password has been changed")) formElement.reset();
          }
        }}>
          <label className="form-field">Current password<input type="password" name="currentPassword" autoComplete="current-password" required /></label>
          <label className="form-field">New password<input type="password" name="newPassword" autoComplete="new-password" minLength="12" required /></label>
          <label className="form-field">Confirm new password<input type="password" name="confirmPassword" autoComplete="new-password" minLength="12" required /></label>
          <button className="button button-dark">Update password <ArrowRight size={16} /></button>
        </form></section>}
      </div>
    </section>
  </main>;
}

function NotFoundPage() {
  return <PageShell><main className="page-main not-found"><div className="empty-bag-icon"><Flower2 size={28} /></div><span className="eyebrow">A LITTLE DETOUR</span><h1>That page has wandered off.</h1><p>Let’s help you find your way back to the good stuff.</p><a className="button button-dark" href="/shop">Browse the collection <ArrowRight size={16} /></a></main></PageShell>;
}

function AppContent() {
  const path = decodeURIComponent(window.location.pathname);
  const pieces = path.split("/").filter(Boolean);
  const productId = pieces[0] === "shop" ? pieces[1] : "";
  const orderId = pieces[0] === "receipt" ? pieces[1] : "";
  const accountMode = pieces[1] === "register" || pieces[0] === "register" ? "register" : "login";
  useEffect(() => { window.scrollTo(0, 0); }, [path]);
  return <StoreProvider>{pieces.length === 0 ? <HomePage /> : pieces[0] === "shop" && !productId ? <ShopPage /> : pieces[0] === "shop" ? <ProductPage productId={productId} /> : pieces[0] === "cart" ? <CartPage /> : pieces[0] === "checkout" ? <CheckoutPage /> : pieces[0] === "receipt" ? <ReceiptPage orderId={orderId} /> : pieces[0] === "track" ? <TrackPage /> : pieces[0] === "account" || pieces[0] === "register" ? <PageShell><AccountPage mode={accountMode} /></PageShell> : <NotFoundPage />}</StoreProvider>;
}

export default function App() {
  return <AppContent />;
}
