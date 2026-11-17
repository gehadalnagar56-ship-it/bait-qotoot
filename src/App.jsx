import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import AccountPage from "./AccountPage.jsx";
import AuthDialog from "./AuthDialog.jsx";
import { supabase } from "./lib/supabase.js";

const catProfiles = [
  { name: "Mochi", age: "8 months", ageGroup: "Kitten", gender: "Female", trait: "Playful & curious" },
  { name: "Oliver", age: "2 years", ageGroup: "Adult", gender: "Male", trait: "Gentle & cuddly" },
  { name: "Cleo", age: "1 year", ageGroup: "Adult", gender: "Female", trait: "Confident & sweet" },
  { name: "Pumpkin", age: "4 months", ageGroup: "Kitten", gender: "Male", trait: "Energetic and playful" },
  { name: "Luna", age: "3 years", ageGroup: "Adult", gender: "Female", trait: "Quiet & affectionate" },
  { name: "Milo", age: "7 years", ageGroup: "Senior", gender: "Male", trait: "Calm & loyal" },
  { name: "Poppy", age: "6 months", ageGroup: "Kitten", gender: "Female", trait: "Bright & adventurous" },
  { name: "Biscuit", age: "5 years", ageGroup: "Adult", gender: "Male", trait: "Easygoing & friendly" },
  { name: "Olive", age: "9 years", ageGroup: "Senior", gender: "Female", trait: "Calm and relaxed" },
  { name: "Fig", age: "1 year", ageGroup: "Adult", gender: "Male", trait: "Friendly and social" },
  { name: "Daisy", age: "3 months", ageGroup: "Kitten", gender: "Female", trait: "Curious and confident" },
  { name: "Pepper", age: "6 years", ageGroup: "Senior", gender: "Male", trait: "Independent & loving" },
];

const adoptionChecklist = [
  { id: "quiet-room", title: "Set up a quiet room", detail: "Pick a calm space with a soft bed, food, water, and a litter tray." },
  { id: "food-plan", title: "Choose food and litter", detail: "Have familiar essentials ready before your cat comes home." },
  { id: "vet", title: "Find a trusted veterinarian", detail: "Plan a gentle health check and keep important records together." },
  { id: "slow-start", title: "Make time to settle in", detail: "Give your cat space, a steady routine, and plenty of patience." },
];

const shopProducts = [
  { id: "food-kitten", category: "food", name: "Chicken Kitten Food", detail: "Chicken · Grain-free · 1.5 kg", description: "A complete, balanced chicken recipe for growing kittens.", features: ["Chicken as the main protein", "Balanced daily nutrition", "Suitable for growing kittens"], price: 18, rating: "4.9", badge: "BESTSELLER", image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=800&q=85" },
  { id: "food-salmon", category: "food", name: "Ocean Catch Salmon Bites", detail: "Salmon · For sensitive stomachs · 1 kg", description: "A fish-based recipe made for cats with sensitive stomachs.", features: ["Salmon as the main protein", "Made for sensitive stomachs", "Easy-to-serve kibble"], price: 22, rating: "4.8", badge: "GENTLE RECIPE", image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=800&q=85" },
  { id: "food-treats", category: "food", name: "Freeze-Dried Chicken Treats", detail: "100% chicken · 60 g", description: "Light, crunchy chicken treats for training or between meals.", features: ["Single-ingredient chicken", "Small training-friendly bites", "Resealable pouch"], price: 9, rating: "5.0", badge: "CHICKEN TREATS", image: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=800&q=85" },
  { id: "food-broth", category: "food", name: "Tuna & Pumpkin Broth", detail: "Tuna & pumpkin · Pack of 6", description: "A savory topper that adds moisture to your cat's meals.", features: ["Tuna and pumpkin blend", "Serve as a topper or snack", "Six single servings"], price: 14, rating: "4.9", badge: "POPULAR CHOICE", image: "https://images.unsplash.com/photo-1545249390-6bdfa286032f?auto=format&fit=crop&w=800&q=85" },
  { id: "food-crunch", category: "food", name: "Turkey & Brown Rice Cat Food", detail: "Turkey & brown rice · 1.2 kg", description: "A complete everyday meal made with turkey and brown rice.", features: ["Turkey and brown rice", "Complete adult-cat recipe", "Keeps fresh in a resealable bag"], price: 19, rating: "4.8", badge: "DAILY FOOD", image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=800&q=85" },
  { id: "food-salmon-treats", category: "food", name: "Salmon Treats", detail: "Salmon treats · 80 g", description: "Bite-size salmon treats for training or between meals.", features: ["Salmon-inspired flavor", "Bite-size pieces", "Use as a treat, not a full meal"], price: 7, rating: "4.9", badge: "SALMON TREATS", image: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=800&q=85" },
  { id: "toy-wand", category: "toys", icon: "wand", name: "Yarn Teaser Wand", detail: "Soft yarn lure · 45 cm", description: "An interactive teaser wand that encourages cats to chase, jump, and play.", features: ["Soft yarn lure", "Encourages interactive play", "Store away after each session"], price: 12, rating: "4.9", badge: "BESTSELLER", image: "https://images.pexels.com/photos/13253822/pexels-photo-13253822.jpeg?auto=compress&cs=tinysrgb&w=800", imageAlt: "A kitten playing with a yarn toy" },
  { id: "toy-mice", category: "toys", icon: "mouse", name: "Feathered Mouse Toy Set", detail: "Feathered mice · Set of 3", description: "Lightweight mouse toys for batting, chasing, and carrying around the house.", features: ["Three soft mouse toys", "Feather details for extra movement", "Great for independent play"], price: 8, rating: "4.8", badge: "SET OF 3", image: "https://images.pexels.com/photos/19237486/pexels-photo-19237486/free-photo-of-close-up-of-the-paw-of-a-cat-playing-with-a-toy.jpeg?auto=compress&cs=tinysrgb&w=800", imageAlt: "A cat paw playing with a feathered mouse toy" },
  { id: "toy-puzzle", category: "toys", icon: "ball", name: "Hanging Ball Toy", detail: "Hanging play ball · For indoor use", description: "A hanging ball toy that encourages indoor cats to bat, chase, and explore.", features: ["Encourages active play", "Easy to hang at cat height", "Best enjoyed with supervision"], price: 24, rating: "5.0", badge: "ACTIVE PLAY", image: "https://images.pexels.com/photos/26706493/pexels-photo-26706493.jpeg?auto=compress&cs=tinysrgb&w=800", imageAlt: "A kitten playing with a hanging ball toy" },
  { id: "toy-tunnel", category: "toys", icon: "tunnel", name: "Foldable Cat Play Tunnel", detail: "Crinkle fabric · Folds flat", description: "A foldable tunnel for cats to explore, hide, and play.", features: ["Crinkle texture for curious cats", "Folds away between playtimes", "Room to hide, chase, and explore"], price: 29, rating: "4.9", badge: "FOLDABLE TUNNEL", image: "https://images.pexels.com/photos/39362021/pexels-photo-39362021/free-photo-of-curious-cat-peering-through-dark-tunnel.jpeg?auto=compress&cs=tinysrgb&w=800", imageAlt: "A curious cat peeking out of a play tunnel" },
  { id: "toy-feather", category: "toys", icon: "wand", name: "Feather Teaser Wand", detail: "Feather lure · Interactive play", description: "A feather teaser that encourages cats to chase and play.", features: ["Feather-style lure", "Great for short play sessions", "Play together and store safely"], price: 10, rating: "4.8", badge: "INTERACTIVE TOY", image: "https://images.pexels.com/photos/26706493/pexels-photo-26706493.jpeg?auto=compress&cs=tinysrgb&w=800", imageAlt: "A kitten reaching for its dangling toy" },
  { id: "toy-spring", category: "toys", icon: "ball", name: "Cat Spring Toys", detail: "Colorful springs · Set of 5", description: "Lightweight springs that bounce across the floor and encourage cats to play.", features: ["Five lightweight springs", "Easy to bat and chase", "Use on a clear, safe floor"], price: 6, rating: "4.9", badge: "SET OF 5", image: "https://images.pexels.com/photos/13253822/pexels-photo-13253822.jpeg?auto=compress&cs=tinysrgb&w=800", imageAlt: "A playful cat reaching toward a toy" },
];

const adoptionSteps = [
  { number: "01", title: "Find your match", text: "Browse the gallery and save the cats you would love to meet." },
  { number: "02", title: "Tell us about your home", text: "Share details about your home, routine, and experience with pets." },
  { number: "03", title: "Meet and prepare", text: "Meet the cat and plan for a smooth first week at home." },
];

const careGuides = [
  { icon: "⌂", tag: "GETTING READY", title: "The first-week checklist", text: "A quiet room, familiar comforts, and plenty of time to settle in." },
  { icon: "♡", tag: "WELLBEING", title: "Reading cat body language", text: "Learn the signs that help you understand whether a cat feels comfortable." },
  { icon: "✚", tag: "HEALTH", title: "A healthier start together", text: "Build a routine for checkups, nutrition, play, and daily care." },
];

const faqs = [
  { question: "Where do the cat photos come from?", answer: "Cat photos are served by The Cat API. Each profile includes a photo, personality, and life-stage details to help you find a good match." },
  { question: "How do I save a cat I like?", answer: "Tap the heart or choose Save profile on a card. Your favorites stay in this browser and appear under Saved." },
  { question: "What should I prepare before adopting?", answer: "Prepare a quiet room, food and water bowls, a litter tray, and a scratching post. Give your cat time to settle in." },
  { question: "Which toys are good for indoor cats?", answer: "Wand toys, puzzle feeders, and small chase toys are great ways to encourage movement and enrichment." },
  { question: "Can I browse on my phone?", answer: "Yes. The gallery, shop, and navigation adapt to mobile, tablet, and desktop screens." },
];

const services = [
  {
    icon: "♡",
    title: "Thoughtful adoption",
    text: "We'll help you find your match and support you through the first steps.",
    tone: "peach",
  },
  {
    icon: "✚",
    title: "Veterinary care",
    text: "Checkups, vaccinations, and expert care to keep every cat healthy.",
    tone: "green",
  },
  {
    icon: "⌂",
    title: "A temporary home",
    text: "A safe, comfortable place for your cat when you need support.",
    tone: "yellow",
  },
];

function Paw({ className = "" }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 42 38"
      fill="currentColor"
    >
      <ellipse cx="21" cy="25" rx="11" ry="9" />
      <ellipse cx="8" cy="16" rx="4" ry="6" transform="rotate(-25 8 16)" />
      <ellipse cx="17" cy="8" rx="4" ry="6" transform="rotate(-8 17 8)" />
      <ellipse cx="27" cy="8" rx="4" ry="6" transform="rotate(8 27 8)" />
      <ellipse cx="35" cy="16" rx="4" ry="6" transform="rotate(25 35 16)" />
    </svg>
  );
}

function ShopIcon({ name, className = "" }) {
  const sharedProps = {
    "aria-hidden": "true",
    className,
    viewBox: "0 0 32 32",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (name === "food") {
    return <svg {...sharedProps}><path d="M5 16h22l-2.5 9h-17L5 16Z" /><path d="M4 12c2 2 4 2 6 0s4-2 6 0 4 2 6 0 4-2 6 0" /><circle cx="11" cy="8" r="1" /><circle cx="20" cy="7" r="1" /></svg>;
  }
  if (name === "mouse") {
    return <svg {...sharedProps}><ellipse cx="16" cy="19" rx="8" ry="6" /><circle cx="10" cy="12" r="3" /><circle cx="18" cy="12" r="3" /><path d="M24 20c4 0 5 3 3 5" /><circle cx="13" cy="18" r=".7" fill="currentColor" /><circle cx="19" cy="18" r=".7" fill="currentColor" /></svg>;
  }
  if (name === "ball") {
    return <svg {...sharedProps}><circle cx="17" cy="18" r="9" /><path d="M8.8 14.3c5.8 1.6 9.1-1.6 9-5.3M12.4 25.9c-.8-5.2 2-8.3 7.4-8.6M23.2 11.6c-3.1 3.8-2.3 8 .8 10.1" /><path d="M3 5l8 8" /></svg>;
  }
  if (name === "tunnel") {
    return <svg {...sharedProps}><path d="M4 26V15a12 12 0 0 1 24 0v11" /><path d="M4 26h24M9 26V15a7 7 0 0 1 14 0v11" /></svg>;
  }
  if (name === "heart") {
    return <svg {...sharedProps}><path d="M16 27S4 20 4 11.5A6.5 6.5 0 0 1 16 8a6.5 6.5 0 0 1 12 3.5C28 20 16 27 16 27Z" /></svg>;
  }
  if (name === "check") {
    return <svg {...sharedProps}><path d="m6 16 6.5 6L26 8" /></svg>;
  }
  if (name === "bag") {
    return <svg {...sharedProps}><path d="M7 11h18l1 15H6l1-15Z" /><path d="M12 12V8a4 4 0 0 1 8 0v4" /></svg>;
  }
  return <svg {...sharedProps}><path d="m6 26 15-15M18 7l7 7M7 6l1.5 4.5L13 12l-4.5 1.5L7 18l-1.5-4.5L1 12l4.5-1.5L7 6ZM23 19l1.2 3.3L27.5 23.5l-3.3 1.2L23 28l-1.2-3.3-3.3-1.2 3.3-1.2L23 19Z" /></svg>;
}

function CatCard({ cat, isFavorite, onToggleFavorite, onViewDetails }) {
  return (
    <article className="cat-card">
      <div className="cat-photo-wrap">
        <img className="cat-photo" src={cat.url} alt={`${cat.name}, a cat`} loading="lazy" />
        <span className="status">
          <span className="status-dot" />
          Meet me
        </span>
        <button
          className={`favorite ${isFavorite ? "is-favorite" : ""}`}
          type="button"
          aria-label={isFavorite ? `Remove ${cat.name} from saved cats` : `Save ${cat.name}`}
          aria-pressed={isFavorite}
          onClick={() => onToggleFavorite(cat)}
        >
          {isFavorite ? "♥" : "♡"}
        </button>
      </div>
      <div className="cat-info">
        <div className="cat-title-row">
          <h3>{cat.name}</h3>
          <span className="cat-age">{cat.age}</span>
        </div>
        <p>{cat.trait}</p>
        <div className="cat-tags">
          <span>{cat.ageGroup}</span>
          <span>{cat.gender}</span>
        </div>
        <div className="card-actions">
          <button className="card-link" type="button" onClick={() => onViewDetails(cat)}>
            View profile <span aria-hidden="true">→</span>
          </button>
          <button className="card-apply" type="button" aria-pressed={isFavorite} onClick={() => onToggleFavorite(cat)}>
            {isFavorite ? "Saved ✓" : "Save profile"}
          </button>
        </div>
      </div>
    </article>
  );
}

function ProductCard({ product, quantity, onAdd }) {
  return (
    <article className={`product-card product-${product.category}`}>
      <div className="product-art">
        <Link className="product-image-link" to={`/shop/${product.id}`} aria-label={`View ${product.name} details`}>
          <img src={product.image} alt={product.imageAlt || product.name} loading="lazy" />
        </Link>
        <span className="product-badge">{product.badge}</span>
        <span className="product-category-icon"><ShopIcon name={product.icon || (product.category === "food" ? "food" : "wand")} /></span>
      </div>
      <div className="product-info">
        <div className="product-rating"><span aria-hidden="true">★</span> {product.rating} <small>· Customer rating</small></div>
        <h3><Link className="product-name-link" to={`/shop/${product.id}`}>{product.name}</Link></h3>
        <p>{product.detail}</p>
        <Link className="product-detail-link" to={`/shop/${product.id}`}>View details <span aria-hidden="true">→</span></Link>
        <div className="product-buy-row">
          <strong>${product.price.toFixed(2)}</strong>
          <button className={`add-to-cart ${quantity ? "added" : ""}`} type="button" onClick={() => onAdd(product.id)}>
            {quantity ? `Add another · ${quantity} in bag` : "Add to bag"} <span aria-hidden="true">+</span>
          </button>
        </div>
      </div>
    </article>
  );
}

function CartDrawer({ items, onClose, onAdd, onRemove, onClear, onCheckout, checkoutLoading, checkoutError, authLoading }) {
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const drawerRef = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    drawerRef.current?.querySelector(".dialog-close")?.focus();
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !drawerRef.current) return;
      const focusable = [...drawerRef.current.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [onClose]);

  return (
    <div className="cart-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <aside ref={drawerRef} className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <div className="cart-heading">
          <div><span className="eyebrow">Food, toys, and accessories for your cat</span><h2 id="cart-title">Your shopping bag <span>({items.reduce((sum, item) => sum + item.quantity, 0)})</span></h2></div>
          <button className="dialog-close" type="button" onClick={onClose} aria-label="Close shopping bag">×</button>
        </div>
        {items.length === 0 ? (
          <div className="cart-empty"><span>♡</span><h3>Your shopping bag is empty.</h3><p>Browse the shop to find food, treats, and toys for your cat.</p><button className="button button-primary" type="button" onClick={onClose}>Browse the shop</button></div>
        ) : (
          <>
            <div className="cart-items">
              {items.map(({ product, quantity }) => (
                <article className="cart-item" key={product.id}>
                  <img src={product.image} alt="" />
                  <div className="cart-item-copy">
                    <h3>{product.name}</h3><p>${product.price.toFixed(2)} each</p>
                    <div className="quantity-control">
                      <button type="button" onClick={() => onRemove(product.id)} aria-label={`Remove one ${product.name}`}>−</button>
                      <span>{quantity}</span>
                      <button type="button" onClick={() => onAdd(product.id)} aria-label={`Add one ${product.name}`}>+</button>
                    </div>
                  </div>
                  <strong>${(product.price * quantity).toFixed(2)}</strong>
                </article>
              ))}
            </div>
            <div className="cart-footer">
              <div><span>{items.reduce((sum, item) => sum + item.quantity, 0)} items</span><strong>${total.toFixed(2)}</strong></div>
              <small>Shipping is shown at secure checkout.</small>
              <button className="cart-clear-button" type="button" onClick={onClear}>Clear bag</button>
              {checkoutError && <p className="form-message is-error" role="alert">{checkoutError}</p>}
              <button className="button button-primary" type="button" onClick={onCheckout} disabled={checkoutLoading || authLoading}>
                {authLoading ? "Checking account..." : checkoutLoading ? "Opening secure checkout..." : "Continue to secure checkout"} <span aria-hidden="true">→</span>
              </button>
              <button className="cart-continue-button" type="button" onClick={onClose}>Continue shopping</button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function CatDialog({ cat, onClose, onToggleFavorite, isFavorite }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    dialogRef.current?.querySelector(".dialog-close")?.focus();
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section ref={dialogRef} className="cat-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Close profile">×</button>
        <img src={cat.url} alt={`${cat.name}, a cat`} />
        <div className="dialog-content">
          <span className="eyebrow">Cat profile · Photo #{cat.id}</span>
          <h2 id="dialog-title">Meet {cat.name}</h2>
          <p>{cat.name} is {cat.age} old and is {cat.trait.toLowerCase().replace(" & ", " and ")}.</p>
          <dl className="profile-facts">
            <div><dt>Age</dt><dd>{cat.age}</dd></div>
            <div><dt>Life stage</dt><dd>{cat.ageGroup}</dd></div>
            <div><dt>Personality</dt><dd>{cat.trait}</dd></div>
          </dl>
          <button className="button button-primary" type="button" onClick={() => onToggleFavorite(cat)}>
            {isFavorite ? "Saved to favorites ✓" : "Save to favorites"} <span aria-hidden="true">♡</span>
          </button>
        </div>
      </section>
    </div>
  );
}

function App() {
  const location = useLocation();
  const pathname = location.pathname;
  const isHome = pathname === "/";
  const isAbout = pathname === "/about";
  const isCats = pathname === "/cats";
  const isAdoption = pathname === "/adoption";
  const isCare = pathname === "/care";
  const isShop = pathname === "/shop";
  const isSaved = pathname === "/saved";
  const isAccount = pathname === "/account";
  const isProduct = pathname.startsWith("/shop/");
  const selectedProduct = isProduct
    ? shopProducts.find((product) => product.id === pathname.slice("/shop/".length))
    : null;
  const isNotFound = ![isHome, isAbout, isCats, isAdoption, isCare, isShop, isSaved, isAccount].some(Boolean) &&
    !(isProduct && selectedProduct);
  const [query, setQuery] = useState("");
  const [cats, setCats] = useState([]);
  const [page, setPage] = useState(0);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [catsError, setCatsError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [favorites, setFavorites] = useState(() => {
    const saved = window.localStorage.getItem("bait-qotoot:favorites");
    return new Set(saved ? JSON.parse(saved) : []);
  });
  const [savedProfiles, setSavedProfiles] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem("bait-qotoot:saved-profiles") || "{}");
    } catch {
      return {};
    }
  });
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedError, setSavedError] = useState("");
  const [savedRetryCount, setSavedRetryCount] = useState(0);
  const savedFetchAttempted = useRef(new Set());
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem("bait-qotoot:cart") || "{}");
    } catch {
      return {};
    }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const checkoutInFlight = useRef(false);
  const checkoutAfterAuth = useRef(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authSessionError, setAuthSessionError] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [ageFilter, setAgeFilter] = useState("All ages");
  const [genderFilter, setGenderFilter] = useState("All cats");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedCat, setSelectedCat] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const menuToggleRef = useRef(null);
  const [theme, setTheme] = useState(
    () => window.localStorage.getItem("bait-qotoot:theme") || "light",
  );
  const [adoptionChecks, setAdoptionChecks] = useState(() => {
    try {
      return new Set(JSON.parse(window.localStorage.getItem("bait-qotoot:adoption-checklist") || "[]"));
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return undefined;
    }

    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      setUser(session?.user || null);
      setAuthSessionError("");
      if (event === "PASSWORD_RECOVERY") {
        setPasswordRecovery(true);
        setAuthOpen(true);
      } else if (event === "SIGNED_OUT") {
        setPasswordRecovery(false);
      }
    });
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) throw error;
      if (active) {
        setUser(session?.user || null);
        setAuthLoading(false);
      }
    }).catch((error) => {
      console.error("Could not restore the signed-in session:", error);
      if (active) {
        setAuthSessionError("We couldn't restore your account session. Please sign in again.");
        setAuthLoading(false);
      }
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user && !passwordRecovery) setAuthOpen(false);
  }, [user, passwordRecovery]);

  useEffect(() => {
    if (!isHome && !isCats) return undefined;
    const controller = new AbortController();

    async function loadCats() {
      setLoadingCats(true);
      setCatsError("");
      setPage(0);
      try {
        const response = await fetch(
          "https://api.thecatapi.com/v1/images/search?limit=6&page=0&include_breeds=1",
          { signal: controller.signal },
        );
        if (!response.ok) {
          throw new Error(`Cat API request failed (${response.status})`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Cat API returned an unexpected response");
        }
        setCats(data.map((cat, index) => ({
          ...cat,
          ...catProfiles[index % catProfiles.length],
        })));
      } catch (error) {
        if (error.name !== "AbortError") {
          setCatsError("We couldn't load our cats right now. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) setLoadingCats(false);
      }
    }

    loadCats();
    return () => controller.abort();
  }, [retryCount, isHome, isCats]);

  useEffect(() => {
    window.localStorage.setItem("bait-qotoot:favorites", JSON.stringify([...favorites]));
  }, [favorites]);

  useEffect(() => {
    window.localStorage.setItem("bait-qotoot:saved-profiles", JSON.stringify(savedProfiles));
  }, [savedProfiles]);

  useEffect(() => {
    window.localStorage.setItem("bait-qotoot:adoption-checklist", JSON.stringify([...adoptionChecks]));
  }, [adoptionChecks]);

  useEffect(() => {
    const targets = document.querySelectorAll(".section-heading, .cat-card, .service-card, .process-card, .guide-card, .faq-item, .product-card, .product-detail-layout, .contact-card, .saved-empty");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      targets.forEach((target) => target.classList.add("is-visible"));
      return undefined;
    }
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    targets.forEach((target) => {
      target.classList.add("reveal-on-scroll");
      observer.observe(target);
    });
    return () => observer.disconnect();
  }, [pathname, cats.length, favorites.size]);

  useEffect(() => {
    if (!isSaved) return undefined;
    const unresolvedIds = [...favorites].filter((id) => !savedProfiles[id]);
    const missingIds = unresolvedIds.filter((id) => !savedFetchAttempted.current.has(id));
    if (missingIds.length === 0) {
      setSavedLoading(false);
      if (unresolvedIds.length === 0) setSavedError("");
      return undefined;
    }

    const controller = new AbortController();
    missingIds.forEach((id) => savedFetchAttempted.current.add(id));
    setSavedLoading(true);
    setSavedError("");
    Promise.all(missingIds.map(async (id, index) => {
      try {
        const response = await fetch(`https://api.thecatapi.com/v1/images/${encodeURIComponent(id)}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Cat profile request failed (${response.status})`);
        const cat = await response.json();
        return {
          id,
          profile: { ...cat, ...catProfiles[index % catProfiles.length] },
        };
      } catch (error) {
        if (error.name === "AbortError") throw error;
        return { id, error };
      }
    }))
      .then((results) => {
        if (controller.signal.aborted) return;
        const profiles = {};
        const failedIds = [];
        results.forEach((result) => {
          if (result.profile) profiles[result.id] = result.profile;
          else failedIds.push(result.id);
        });
        setSavedProfiles((current) => ({ ...current, ...profiles }));
        if (failedIds.length) {
          setSavedError("Some saved profiles could not be loaded. Please try again.");
        }
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setSavedError("We couldn't load your saved cats. Please try again.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setSavedLoading(false);
      });

    return () => controller.abort();
  }, [isSaved, favorites, savedProfiles, savedRetryCount]);

  useEffect(() => {
    window.localStorage.setItem("bait-qotoot:cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("bait-qotoot:theme", theme);
  }, [theme]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    function handleMenuDismiss(event) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        menuToggleRef.current?.focus();
      } else if (event.type === "pointerdown" && !headerRef.current?.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener("keydown", handleMenuDismiss);
    document.addEventListener("pointerdown", handleMenuDismiss);
    return () => {
      document.removeEventListener("keydown", handleMenuDismiss);
      document.removeEventListener("pointerdown", handleMenuDismiss);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const titles = {
      "/": "Bait Qotoot — helping cats find loving homes",
      "/about": "Our story — Bait Qotoot",
      "/cats": "Meet the cats — Bait Qotoot",
      "/adoption": "Adoption — Bait Qotoot",
      "/care": "Cat care — Bait Qotoot",
      "/shop": "Shop food & toys — Bait Qotoot",
      "/saved": "Saved cats — Bait Qotoot",
      "/account": "Your account — Bait Qotoot",
    };
    document.title = selectedProduct
      ? `${selectedProduct.name} — Bait Qotoot`
      : titles[pathname] || "Page not found — Bait Qotoot";
  }, [pathname, selectedProduct]);

  const filteredCats = cats
    .filter((cat) => {
      const search = query.trim().toLowerCase();
      const matchesSearch = !search ||
        cat.name.toLowerCase().includes(search) ||
        String(cat.id).toLowerCase().includes(search) ||
        cat.trait.toLowerCase().includes(search) ||
        cat.breeds?.some((breed) => breed.name.toLowerCase().includes(search));
      const matchesAge = ageFilter === "All ages" || cat.ageGroup === ageFilter;
      const matchesGender = genderFilter === "All cats" || cat.gender === genderFilter;
      const matchesSaved = activeFilter !== "saved" || favorites.has(cat.id);
      return matchesSearch && matchesAge && matchesGender && matchesSaved;
    })
    .sort((first, second) =>
      sortOrder === "name"
        ? first.name.localeCompare(second.name)
        : cats.indexOf(first) - cats.indexOf(second),
    );
  const cartItems = Object.entries(cart)
    .map(([productId, quantity]) => ({
      product: shopProducts.find((product) => product.id === productId),
      quantity,
    }))
    .filter((item) => item.product);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  function addToCart(productId) {
    setCart((current) => ({ ...current, [productId]: (current[productId] || 0) + 1 }));
  }

  async function startCheckout() {
    if (!user) {
      checkoutAfterAuth.current = true;
      setCartOpen(false);
      setAuthOpen(true);
      return;
    }
    if (checkoutInFlight.current) return;
    if (!supabase) {
      setCheckoutError("Secure checkout isn't configured yet. Add the Supabase settings from .env.example.");
      return;
    }

    checkoutInFlight.current = true;
    setCheckoutLoading(true);
    setCheckoutError("");
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { items: cartItems.map(({ product, quantity }) => ({ productId: product.id, quantity })) },
      });
      if (error) throw error;
      if (typeof data?.url !== "string") throw new Error("The secure checkout service returned no payment link.");
      const checkoutUrl = new URL(data.url);
      if (checkoutUrl.protocol !== "https:" || !(checkoutUrl.hostname === "stripe.com" || checkoutUrl.hostname.endsWith(".stripe.com"))) {
        throw new Error("The payment service returned an invalid checkout link.");
      }
      window.location.assign(checkoutUrl.href);
    } catch (error) {
      console.error("Could not start secure checkout:", error);
      setCheckoutError(error.message || "We couldn't start checkout. Please try again.");
    } finally {
      checkoutInFlight.current = false;
      setCheckoutLoading(false);
    }
  }

  useEffect(() => {
    if (!user || !checkoutAfterAuth.current) return;
    checkoutAfterAuth.current = false;
    setCartOpen(true);
    startCheckout();
  }, [user]);

  function removeFromCart(productId) {
    setCart((current) => {
      const next = { ...current };
      if (next[productId] <= 1) delete next[productId];
      else next[productId] -= 1;
      return next;
    });
  }

  async function loadMoreCats() {
    setLoadingMore(true);
    setCatsError("");
    try {
      const nextPage = page + 1;
      const response = await fetch(
        `https://api.thecatapi.com/v1/images/search?limit=6&page=${nextPage}&include_breeds=1`,
      );
      if (!response.ok) throw new Error(`Cat API request failed (${response.status})`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Cat API returned an unexpected response");
      const knownIds = new Set(cats.map((cat) => cat.id));
      const newCats = data
        .filter((cat) => !knownIds.has(cat.id))
        .map((cat, index) => ({
          ...cat,
          ...catProfiles[(cats.length + index) % catProfiles.length],
        }));
      setCats((current) => [...current, ...newCats]);
      setPage(nextPage);
      if (newCats.length === 0) setCatsError("No new photos came back. Please try loading more.");
    } catch {
      setCatsError("We couldn't load more photos right now. Please try again.");
    } finally {
      setLoadingMore(false);
    }
  }

  function toggleFavorite(cat) {
    const shouldSave = !favorites.has(cat.id);
    if (shouldSave) savedFetchAttempted.current.delete(cat.id);
    setFavorites((current) => {
      const next = new Set(current);
      if (shouldSave) next.add(cat.id);
      else next.delete(cat.id);
      return next;
    });
    setSavedProfiles((current) => {
      if (!shouldSave) {
        const next = { ...current };
        delete next[cat.id];
        return next;
      }
      return { ...current, [cat.id]: cat };
    });
  }

  const clearCart = useCallback(() => setCart({}), []);
  const closeAuthDialog = useCallback(() => {
    checkoutAfterAuth.current = false;
    setPasswordRecovery(false);
    setAuthOpen(false);
  }, []);

  function toggleAdoptionCheck(id) {
    setAdoptionChecks((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function resetCatFilters() {
    setQuery("");
    setAgeFilter("All ages");
    setGenderFilter("All cats");
    setSortOrder("newest");
    setActiveFilter("all");
  }

  return (
    <>
      <header ref={headerRef} className="site-header">
        <div className="container header-inner">
          <Link className="brand" to="/" aria-label="Bait Qotoot - home">
            <span className="brand-mark"><Paw /></span>
            <span className="brand-name">Bait <b>Qotoot</b></span>
          </Link>
          <nav id="primary-navigation" className={`main-nav ${mobileMenuOpen ? "is-open" : ""}`} aria-label="Main navigation">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/about">Our story</NavLink>
            <NavLink to="/cats">Cats</NavLink>
            <NavLink to="/adoption">Adoption</NavLink>
            <NavLink to="/care">Care</NavLink>
            <NavLink to="/shop">Shop</NavLink>
            <NavLink to="/saved" className="saved-nav">Saved <span>{favorites.size}</span></NavLink>
            <NavLink to="/account">{authLoading ? "Account..." : user ? "Account" : "Sign in"}</NavLink>
          </nav>
          <div className="header-actions">
            <button
              className="theme-toggle"
              type="button"
              onClick={() => setTheme((current) => current === "light" ? "dark" : "light")}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              <span aria-hidden="true">{theme === "light" ? "☾" : "☀"}</span>
            </button>
            <button
              className="cart-toggle"
              type="button"
              aria-label={`Open shopping bag, ${cartCount} items`}
              aria-haspopup="dialog"
              onClick={() => setCartOpen(true)}
            >
              <ShopIcon name="bag" className="cart-toggle-icon" /><span className="cart-toggle-label">Bag</span><b>{cartCount}</b>
            </button>
            <Link className="button button-dark header-cta" to="/adoption">Adopt a cat <span aria-hidden="true">↗</span></Link>
            <button ref={menuToggleRef} className="menu-toggle" type="button" aria-label={mobileMenuOpen ? "Close menu" : "Open menu"} aria-controls="primary-navigation" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((open) => !open)}>
              {mobileMenuOpen ? "×" : "☰"}
            </button>
          </div>
        </div>
      </header>

      <main>
        {isShop && new URLSearchParams(location.search).get("payment") === "cancelled" && (
          <div className="container checkout-notice" role="status">
            Checkout was cancelled. Your bag is still here whenever you're ready.
          </div>
        )}
        {isHome && <section className="hero" id="home">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="eyebrow"><Paw /> Helping cats find loving homes</span>
              <h1>Every cat deserves<br /> <span>a cozy home.</span></h1>
              <p className="hero-description">
                At Bait Qotoot, we help every cat find a caring family and a
                place to call home.
              </p>
              <div className="hero-actions">
                <a className="button button-primary" href="#cats">
                  Meet our cats <span aria-hidden="true">→</span>
                </a>
                <a className="text-link" href="#about">
                  Get to know us <span aria-hidden="true">⌄</span>
                </a>
              </div>
              <div className="hero-proof">
                <div><strong>{cats.length || 6}</strong><span>cats in the gallery</span></div>
                <span className="proof-divider" />
                <div className="rating"><span>LIVE API</span><small>cat photo gallery</small></div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-image-frame">
                <img
                  src="https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=1200&q=90"
                  alt="A relaxed cat in a cozy home"
                />
              </div>
              <div className="floating-note">
                <span className="note-icon">♡</span>
                <span><b>Find your new companion</b><small>Meet the cats looking for a home</small></span>
              </div>
              <Paw className="hero-paw" />
              <span className="hero-sparkle sparkle-one">✳</span>
              <span className="hero-sparkle sparkle-two">✦</span>
            </div>
          </div>
          <div className="hero-bottom container">
            <span>A loving home for every cat</span>
            <span className="bottom-line" />
            <span>Care • Love • A new home</span>
          </div>
        </section>}

        {(isHome || isAbout) && <section className="intro-section section-pad" id="about">
          <div className="container intro-grid">
            <div className="intro-image">
              <img
                src="https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=1000&q=85"
                alt="A cat looking at the camera"
              />
              <div className="intro-sticker"><Paw /><span>A caring home<br />for every cat</span></div>
            </div>
            <div className="intro-copy">
              <span className="eyebrow">A better way to meet your next cat</span>
              <h2>Meet the cats who could<br />become <span>part of your family.</span></h2>
              <p>
                Browse the cats, learn about their personalities, and save the
                profiles you'd like to revisit.
              </p>
              <div className="stats-row">
                <div><strong>New</strong><small>cat photos</small></div>
                <div><strong>Saved</strong><small>favorite cats</small></div>
                <div><strong>All</strong><small>ages welcome</small></div>
              </div>
              <Link className="underlined-link" to="/cats">Explore the gallery <span>→</span></Link>
            </div>
          </div>
        </section>}

        {(isHome || isCats) && <section className="cats-section section-pad" id="cats">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Browse available profiles</span>
                <h2>Meet the <span>cats.</span></h2>
              </div>
            </div>
            <div className="catalog-toolbar">
              <label className="search-box">
                <span aria-hidden="true">⌕</span>
                <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search names or photo IDs..." aria-label="Search cat names or photo IDs" />
              </label>
              <label className="select-control">
                <span>Age</span>
                <select value={ageFilter} onChange={(event) => setAgeFilter(event.target.value)} aria-label="Filter by age">
                  <option>All ages</option><option>Kitten</option><option>Adult</option><option>Senior</option>
                </select>
              </label>
              <label className="select-control">
                <span>Gender</span>
                <select value={genderFilter} onChange={(event) => setGenderFilter(event.target.value)} aria-label="Filter by cat gender">
                  <option>All cats</option><option>Female</option><option>Male</option>
                </select>
              </label>
              <label className="select-control">
                <span>Sort</span>
                <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} aria-label="Sort cat profiles">
                  <option value="newest">Recently added</option><option value="name">Name A–Z</option>
                </select>
              </label>
            </div>
            <div className="catalog-tabs" role="group" aria-label="Gallery view">
              <button className={activeFilter === "all" ? "active" : ""} type="button" aria-pressed={activeFilter === "all"} onClick={() => setActiveFilter("all")}>All profiles <span>{cats.length}</span></button>
              <button className={activeFilter === "saved" ? "active" : ""} type="button" aria-pressed={activeFilter === "saved"} onClick={() => setActiveFilter("saved")}>Saved <span>{favorites.size}</span></button>
              <span className="results-count">Showing {filteredCats.length} of {cats.length} cats</span>
              {(query || ageFilter !== "All ages" || genderFilter !== "All cats" || activeFilter !== "all" || sortOrder !== "newest") && (
                <button className="clear-filters" type="button" onClick={resetCatFilters}>Clear filters</button>
              )}
            </div>
            <div className="cats-grid">
              {loadingCats ? (
                <p className="empty-state" role="status">Loading cat profiles...</p>
              ) : catsError && cats.length === 0 ? (
                <div className="empty-state" role="alert">
                  <p>{catsError}</p>
                  <button className="button button-outline" type="button" onClick={() => setRetryCount((count) => count + 1)}>
                    Try again
                  </button>
                </div>
              ) : filteredCats.length ? (
                filteredCats.map((cat) => (
                  <CatCard
                    key={cat.id}
                    cat={cat}
                    isFavorite={favorites.has(cat.id)}
                    onToggleFavorite={toggleFavorite}
                    onViewDetails={setSelectedCat}
                  />
                ))
              ) : (
                <div className="empty-state">
                  <p>{activeFilter === "saved" ? "No saved profiles yet. Tap the heart on a cat to keep it here." : "No profiles match those filters. Try changing your search."} 🐾</p>
                  <button className="button button-outline" type="button" onClick={resetCatFilters}>{activeFilter === "saved" ? "Explore all profiles" : "Clear filters"}</button>
                </div>
              )}
            </div>
            {catsError && !loadingCats && <p className="catalog-error" role="alert">{catsError}</p>}
            {!loadingCats && (
              <div className="all-cats-wrap">
                <button className="button button-outline" type="button" onClick={loadMoreCats} disabled={loadingMore}>
                  {loadingMore ? "Loading..." : "Load more cats"} <span aria-hidden="true">↓</span>
                </button>
                <small>More photos are fetched from The Cat API.</small>
              </div>
            )}
          </div>
        </section>}

        {isSaved && <section className="saved-page section-pad">
          <div className="container">
            <div className="section-heading saved-heading">
              <div>
                <span className="eyebrow">Your saved cats</span>
                <h1>Your saved <span>cats.</span></h1>
                <p>All your favorite cat profiles, together in one place.</p>
              </div>
              <Link className="button button-dark" to="/cats">Meet more cats <span aria-hidden="true">→</span></Link>
            </div>
            {savedError && <div className="saved-error" role="alert">
              <p>{savedError}</p>
              <button className="button button-outline" type="button" onClick={() => {
                [...favorites].filter((id) => !savedProfiles[id]).forEach((id) => {
                  savedFetchAttempted.current.delete(id);
                });
                setSavedRetryCount((count) => count + 1);
                setSavedError("");
              }}>Try again</button>
            </div>}
            {savedLoading && <p className="empty-state" role="status">Loading your saved cats...</p>}
            {favorites.size === 0 ? (
              <div className="saved-empty">
                <span><ShopIcon name="heart" /></span>
                <h2>No saved cats yet</h2>
                <p>Select the heart on a profile to save it here.</p>
                <Link className="button button-primary" to="/cats">Browse the cats <span aria-hidden="true">→</span></Link>
              </div>
            ) : (
              <div className="cats-grid saved-cats-grid">
                {[...favorites].map((id) => savedProfiles[id]).filter(Boolean).map((cat) => (
                  <CatCard
                    key={cat.id}
                    cat={cat}
                    isFavorite
                    onToggleFavorite={toggleFavorite}
                    onViewDetails={setSelectedCat}
                  />
                ))}
              </div>
            )}
          </div>
        </section>}

        {isAccount && (
          <AccountPage
            user={user}
            authError={authSessionError}
            onSignIn={() => setAuthOpen(true)}
            onPaymentConfirmed={clearCart}
          />
        )}

        {isHome && <section className="shop-teaser-section section-pad">
          <div className="container shop-teaser">
            <div className="shop-teaser-copy">
              <span className="eyebrow">Good stuff for good cats</span>
              <h2>Good food.<br /><span>More playtime.</span></h2>
              <p>Browse nutritious food, tasty treats, and toys for play and enrichment.</p>
              <Link className="button button-dark" to="/shop">Shop food and toys <span aria-hidden="true">→</span></Link>
            </div>
            <div className="shop-teaser-art">
              <img src="https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=800&q=85" alt="A bowl of pet food ready for a happy cat" loading="lazy" />
              <div className="teaser-sticker"><span>♡</span><b>Selected for<br />your cat</b></div>
              <div className="teaser-float"><span>✦</span><span>Food, toys &<br />everyday essentials</span></div>
            </div>
          </div>
        </section>}

        {isShop && <section className="shop-page">
          <div className="shop-hero">
            <div className="container shop-hero-inner">
              <div className="shop-hero-copy">
                <span className="eyebrow">CAT FOOD, TOYS & ACCESSORIES</span>
                <h1>Everything your cat needs<br />for a <span>happy, healthy home.</span></h1>
                <p>Shop tasty food, engaging toys, and useful everyday essentials for your cat.</p>
                <div className="shop-hero-actions">
                  <a className="button button-primary" href="#food">Browse the collection <span aria-hidden="true">↓</span></a>
                  <span><b>{shopProducts.length}</b> products to explore</span>
                </div>
                <div className="shop-perks">
                  <span><ShopIcon name="sparkle" /> Carefully selected</span><span><ShopIcon name="heart" /> Made for cats</span><span><ShopIcon name="tunnel" /> For everyday life at home</span>
                </div>
              </div>
              <div className="shop-hero-art">
                <img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1100&q=90" alt="A happy cat ready for a treat" />
                <div className="shop-orbit orbit-one" />
                <div className="shop-orbit orbit-two" />
                <div className="shop-hero-note"><span><ShopIcon name="heart" /></span><div><b>Everyday essentials</b><small>for happy, healthy cats</small></div></div>
                <span className="shop-sparkle shop-sparkle-one"><ShopIcon name="sparkle" /></span>
                <span className="shop-sparkle shop-sparkle-two"><ShopIcon name="sparkle" /></span>
              </div>
            </div>
          </div>
          <div className="shop-category-bar">
            <div className="container shop-category-inner">
              <a href="#food"><span><ShopIcon name="food" /></span> Food & treats <b>{String(shopProducts.filter((product) => product.category === "food").length).padStart(2, "0")}</b></a>
              <a href="#toys"><span><ShopIcon name="wand" /></span> Toys & play <b>{String(shopProducts.filter((product) => product.category === "toys").length).padStart(2, "0")}</b></a>
              <button type="button" onClick={() => setCartOpen(true)}>Open your bag <span aria-hidden="true">↗</span></button>
            </div>
          </div>
          <div className="container shop-catalog">
            {[
              { key: "food", id: "food", icon: "food", eyebrow: "NUTRITIOUS MEALS & TREATS", title: "Food & treats", text: "Choose everyday meals, snacks, and treats for your cat." },
              { key: "toys", id: "toys", icon: "wand", eyebrow: "PLAY & ENRICHMENT", title: "Toys & play", text: "Find toys that encourage exercise, curiosity, and interactive play." },
            ].map((category) => (
              <section className={`shop-category shop-category-${category.key}`} id={category.id} key={category.key}>
                <div className="shop-section-heading">
                  <div className="shop-section-icon"><ShopIcon name={category.icon} /></div>
                  <div><span className="eyebrow">{category.eyebrow}</span><h2>{category.title}</h2><p>{category.text}</p></div>
                  <span className="shop-section-count">0{shopProducts.filter((product) => product.category === category.key).length} products</span>
                </div>
                <div className="products-grid">
                  {shopProducts.filter((product) => product.category === category.key).map((product) => (
                    <ProductCard key={product.id} product={product} quantity={cart[product.id] || 0} onAdd={addToCart} />
                  ))}
                </div>
              </section>
            ))}
            <section className="shop-love-note">
              <span><ShopIcon name="heart" /></span>
              <div><h2>Make playtime and mealtime special.</h2><p>Browse food, treats, and toys selected for cats and their families.</p></div>
              <Link className="underlined-link" to="/about">Our story <span>→</span></Link>
            </section>
          </div>
        </section>}

        {isProduct && selectedProduct && <section className="product-detail-page section-pad">
          <div className="container">
            <Link className="product-back-link" to="/shop"><span aria-hidden="true">←</span> Back to the shop</Link>
            <div className="product-detail-layout">
              <div className="product-detail-image">
                <img src={selectedProduct.image} alt={selectedProduct.imageAlt || selectedProduct.name} />
                <span className="product-badge">{selectedProduct.badge}</span>
              </div>
              <div className="product-detail-copy">
                <span className="eyebrow"><ShopIcon name={selectedProduct.category === "food" ? "food" : selectedProduct.icon} /> {selectedProduct.category === "food" ? "FOOD & TREATS" : "TOYS & PLAY"}</span>
                <div className="product-rating"><span aria-hidden="true">★</span> {selectedProduct.rating} <small>· Customer rating</small></div>
                <h1>{selectedProduct.name}</h1>
                <p className="product-detail-description">{selectedProduct.description}</p>
                <p className="product-detail-meta">{selectedProduct.detail}</p>
                <ul className="product-feature-list">
                  {selectedProduct.features.map((feature) => <li key={feature}><ShopIcon name="check" />{feature}</li>)}
                </ul>
                <div className="product-detail-buy">
                  <strong>${selectedProduct.price.toFixed(2)}</strong>
                  <button className="button button-primary" type="button" onClick={() => addToCart(selectedProduct.id)}>
                    Add to bag <span aria-hidden="true">+</span>
                  </button>
                </div>
                <p className="product-care-note">A useful addition to your cat's daily routine.</p>
              </div>
            </div>
            <section className="related-products">
              <div className="section-heading">
                <div><span className="eyebrow">More from the shop</span><h2>You may also <span>like these.</span></h2></div>
                <Link className="underlined-link" to="/shop">Visit the shop <span>→</span></Link>
              </div>
              <div className="products-grid">
                {shopProducts.filter((product) => product.category === selectedProduct.category && product.id !== selectedProduct.id).slice(0, 3).map((product) => (
                  <ProductCard key={product.id} product={product} quantity={cart[product.id] || 0} onAdd={addToCart} />
                ))}
              </div>
            </section>
          </div>
        </section>}

        {(isHome || isCare) && <section className="services-section section-pad" id="services">
          <div className="container">
            <div className="services-heading">
              <span className="eyebrow">Here for them, and here for you</span>
              <h2>Thoughtful tools for <span>every next step.</span></h2>
              <p>Practical guidance to help people make informed, caring decisions.</p>
            </div>
            <div className="services-grid">
              {services.map((service) => (
                <article className="service-card" key={service.title}>
                  <div className={`service-icon ${service.tone}`}>{service.icon}</div>
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                  <Link to="/adoption" aria-label={`Learn more about ${service.title}`}>Learn more <span>→</span></Link>
                </article>
              ))}
            </div>
          </div>
        </section>}

        {(isHome || isAdoption) && <section className="process-section section-pad" id="process">
          <div className="container">
            <div className="services-heading">
              <span className="eyebrow">A thoughtful first step</span>
              <h2>From hello to <span>home.</span></h2>
              <p>A clear, caring path makes the transition easier for everyone.</p>
            </div>
            <div className="process-grid">
              {adoptionSteps.map((step) => (
                <article className="process-card" key={step.number}>
                  <span>{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
            <div className="process-cta">
              <p>Not ready to adopt yet? Save profiles to review later.</p>
              <Link className="underlined-link" to="/cats">Browse our cats <span>→</span></Link>
            </div>
          </div>
        </section>}

        {isAdoption && <section className="adoption-checklist-section section-pad">
          <div className="container adoption-checklist-layout">
            <div className="adoption-checklist-intro">
              <span className="eyebrow">Get ready to adopt</span>
              <h2>Getting ready to <span>adopt a cat?</span></h2>
              <p>Use this checklist to plan ahead. Your progress is saved in this browser.</p>
              <div className="checklist-progress" aria-live="polite">
                <span className="checklist-progress-track"><span style={{ width: `${(adoptionChecks.size / adoptionChecklist.length) * 100}%` }} /></span>
                <b>{adoptionChecks.size} of {adoptionChecklist.length} complete</b>
              </div>
            </div>
            <div className="adoption-checklist">
              {adoptionChecklist.map((item) => {
                const checked = adoptionChecks.has(item.id);
                return (
                  <button
                    className={`checklist-item ${checked ? "is-checked" : ""}`}
                    type="button"
                    key={item.id}
                    aria-pressed={checked}
                    onClick={() => toggleAdoptionCheck(item.id)}
                  >
                    <span className="checklist-box">{checked && <ShopIcon name="check" />}</span>
                    <span><b>{item.title}</b><small>{item.detail}</small></span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>}

        {(isHome || isCare) && <section className="guides-section section-pad" id="guides">
          <div className="container">
            <div className="section-heading guides-heading">
              <div>
                <span className="eyebrow">Good care starts with good information</span>
                <h2>Small steps make <span>a big difference.</span></h2>
              </div>
              <a className="underlined-link" href="#faq">Read our FAQs <span>→</span></a>
            </div>
            <div className="guides-grid">
              {careGuides.map((guide) => (
                <article className="guide-card" key={guide.title}>
                  <span className="guide-icon">{guide.icon}</span>
                  <span className="guide-tag">{guide.tag}</span>
                  <h3>{guide.title}</h3>
                  <p>{guide.text}</p>
                  <a href="#faq" aria-label={`Read FAQs about ${guide.title}`}>Explore the guide <span>→</span></a>
                </article>
              ))}
            </div>
          </div>
        </section>}

        {isHome && <section className="quote-section">
          <div className="container quote-inner">
            <Paw className="quote-paw" />
            <span className="quote-mark">“</span>
            <blockquote>
            Adopting a cat can bring<br />
            <b>joy to both of your lives.</b>
            </blockquote>
            <div className="quote-byline"><span className="quote-line" /> Bait Qotoot</div>
          </div>
        </section>}

        {(isHome || isCare) && <section className="faq-section section-pad" id="faq">
          <div className="container faq-layout">
            <div className="faq-intro">
              <span className="eyebrow">A few helpful answers</span>
              <h2>Questions? We've got <span>you.</span></h2>
              <p>Answers about cat care, adoption, and using the site.</p>
              <Link className="button button-outline" to="/adoption">View adoption steps <span>→</span></Link>
            </div>
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <article className={`faq-item ${openFaq === index ? "is-open" : ""}`} key={faq.question}>
                  <h3>
                    <button type="button" aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? -1 : index)}>
                      {faq.question}<span aria-hidden="true">{openFaq === index ? "−" : "+"}</span>
                    </button>
                  </h3>
                  {openFaq === index && <p>{faq.answer}</p>}
                </article>
              ))}
            </div>
          </div>
        </section>}

        {(isHome || isAdoption) && <section className="contact-section section-pad" id="contact">
          <div className="container contact-card">
            <div className="contact-copy">
              <span className="eyebrow">Find a cat to welcome home</span>
              <h2>Ready to welcome<br /> <span>a cat into your family?</span></h2>
              <p>Browse the cats and save the profiles you'd like to learn more about.</p>
            </div>
            <div className="contact-action">
              <Link className="button button-dark" to="/cats">Meet the cats <span aria-hidden="true">→</span></Link>
              <p>Browse profiles and save your favorites along the way.</p>
            </div>
            <Paw className="contact-paw" />
          </div>
        </section>}
        {isNotFound && (
          <section className="not-found-section section-pad">
            <div className="container not-found-card">
              <span className="eyebrow">Page not found</span>
              <h1>Let's get you <span>back on track.</span></h1>
              <p>We couldn't find the page you were looking for.</p>
              <Link className="button button-primary" to="/">Back to home <span aria-hidden="true">→</span></Link>
            </div>
          </section>
        )}
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <Link className="brand footer-brand" to="/">
            <span className="brand-mark"><Paw /></span>
            <span className="brand-name">Bait <b>Qotoot</b></span>
          </Link>
          <p>Helping cats find loving homes.</p>
          <Link className="footer-link" to="/">Back to home ↑</Link>
          <span>Made with care for cats and the people who love them.</span>
        </div>
      </footer>
      {selectedCat && (
        <CatDialog
          cat={selectedCat}
          isFavorite={favorites.has(selectedCat.id)}
          onClose={() => setSelectedCat(null)}
          onToggleFavorite={toggleFavorite}
        />
      )}
      {cartOpen && (
        <CartDrawer
          items={cartItems}
          onClose={() => setCartOpen(false)}
          onAdd={addToCart}
          onRemove={removeFromCart}
          onClear={clearCart}
          onCheckout={startCheckout}
          checkoutLoading={checkoutLoading}
          checkoutError={checkoutError}
          authLoading={authLoading}
        />
      )}
      {authOpen && (
        <AuthDialog
          initialMode={passwordRecovery ? "new-password" : "sign-in"}
          onClose={closeAuthDialog}
          onPasswordUpdated={() => {
            setPasswordRecovery(false);
            setAuthOpen(false);
          }}
        />
      )}
    </>
  );
}

export default App;
