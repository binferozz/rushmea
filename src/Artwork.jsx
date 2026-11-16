import React from "react";

export function ProductArtwork({ product, className = "" }) {
  if (product.imageUrl) {
    return (
      <img
        className={`product-art product-photo ${className}`}
        src={product.imageUrl}
        alt={product.name}
        loading="lazy"
      />
    );
  }
  const id = (product.id || "product").replace(/[^a-z0-9]/gi, "");
  const color = product.color || "#c5cfb6";
  return (
    <svg
      className={`product-art ${className}`}
      viewBox="0 0 420 420"
      role="img"
      aria-label={`${product.name} product illustration`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`bg${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={color} stopOpacity=".78" />
          <stop offset="1" stopColor="#f5ecde" />
        </linearGradient>
        <linearGradient id={`bottle${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#fffef9" />
          <stop offset=".56" stopColor="#f3ede3" />
          <stop offset="1" stopColor="#ded4c5" />
        </linearGradient>
        <filter id={`shadow${id}`} x="-30%" y="-30%" width="160%" height="170%">
          <feGaussianBlur stdDeviation="11" />
        </filter>
      </defs>
      <rect x="12" y="12" width="396" height="396" rx="190" fill={`url(#bg${id})`} />
      <circle cx="325" cy="106" r="52" fill="#fffdf7" opacity=".36" />
      <path d="M56 324c34-32 64-24 90 2s50 37 81 10 72-31 137 8v52H56z" fill="#f3eadc" opacity=".72" />
      <ellipse cx="213" cy="347" rx="91" ry="15" fill="#443b30" opacity=".2" filter={`url(#shadow${id})`} />
      <path d="M126 136c0-12 10-22 22-22h124c12 0 22 10 22 22v171c0 25-18 43-43 43h-82c-25 0-43-18-43-43z" fill={`url(#bottle${id})`} stroke="#fff" strokeOpacity=".75" strokeWidth="3" />
      <path d="M159 114V89c0-12 8-20 20-20h62c12 0 20 8 20 20v25" fill="#56604b" />
      <path d="M168 69h83v16h-83z" rx="4" fill="#394438" />
      <rect x="145" y="182" width="130" height="103" rx="4" fill="#f8f5ed" />
      <path d="M174 204c12-17 28-17 40 0-11 20-29 22-40 0zm35 0c12-17 28-17 40 0-11 20-29 22-40 0z" fill="none" stroke="#71806b" strokeWidth="2" />
      <path d="M194 219c-2-12 4-23 13-29m-8 32c-8-7-15-8-24-6m25 6c8-8 15-10 23-8" fill="none" stroke="#71806b" strokeWidth="1.5" />
      <text x="210" y="253" textAnchor="middle" fill="#334135" fontFamily="Georgia,serif" fontSize="13" letterSpacing="2.6">RUSHMEA</text>
      <text x="210" y="270" textAnchor="middle" fill="#72766a" fontFamily="Arial,sans-serif" fontSize="8.5" letterSpacing="1.5">{(product.name || "HAIR CARE").toUpperCase().slice(0, 20)}</text>
      <path d="M84 232c18-40 26-61 25-93m0 49c-17-13-24-27-23-40m23 29c17-17 20-32 17-47m140 177c20-17 30-42 31-73m-7 37c-18-3-31-13-39-29" fill="none" stroke="#63745c" strokeOpacity=".56" strokeWidth="2" strokeLinecap="round" />
      <path d="M107 168c-15-7-22-20-20-34 15 3 24 13 20 34zm8-16c-3-16 3-28 15-35 5 15 1 27-15 35zm169 140c-17-3-27-14-29-28 16 0 27 9 29 28zm-4-16c3-15 13-23 27-24-2 14-11 23-27 24z" fill="#71836a" opacity=".7" />
      <circle cx="85" cy="122" r="3" fill="#fff" opacity=".65" />
      <circle cx="330" cy="256" r="4" fill="#fff" opacity=".7" />
    </svg>
  );
}

export function HeroArtwork() {
  return (
    <svg className="hero-art" viewBox="0 0 560 600" role="img" aria-label="Illustration of a woman with natural curls and RUSHMEA haircare">
      <defs>
        <linearGradient id="heroBackdrop" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#d7ddcb" />
          <stop offset="1" stopColor="#f2d8be" />
        </linearGradient>
        <linearGradient id="heroHair" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#392922" />
          <stop offset=".52" stopColor="#674738" />
          <stop offset="1" stopColor="#32231e" />
        </linearGradient>
        <linearGradient id="heroDress" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#78856b" />
          <stop offset="1" stopColor="#465343" />
        </linearGradient>
        <filter id="heroShadow" x="-30%" y="-30%" width="160%" height="170%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>
      <rect x="26" y="22" width="508" height="550" rx="250" fill="url(#heroBackdrop)" />
      <circle cx="406" cy="144" r="78" fill="#fff5df" opacity=".47" />
      <path d="M62 481c67-31 119 35 193 4 66-28 135-55 244 6v49H62z" fill="#f8f0df" opacity=".7" />
      <ellipse cx="284" cy="510" rx="133" ry="19" fill="#40372e" opacity=".19" filter="url(#heroShadow)" />
      <path d="M167 266c-35-70-2-169 73-197 77-29 153 23 162 106 5 44-10 84-26 111z" fill="url(#heroHair)" />
      <circle cx="187" cy="145" r="38" fill="#49352c" />
      <circle cx="190" cy="197" r="38" fill="#49352c" />
      <circle cx="216" cy="98" r="37" fill="#392923" />
      <circle cx="258" cy="83" r="41" fill="#604333" />
      <circle cx="306" cy="91" r="43" fill="#372720" />
      <circle cx="349" cy="120" r="39" fill="#684938" />
      <circle cx="379" cy="164" r="36" fill="#3c2a23" />
      <circle cx="376" cy="210" r="37" fill="#634333" />
      <circle cx="356" cy="247" r="32" fill="#392822" />
      <path d="M230 234h105v81H230z" fill="#7e5541" />
      <path d="M219 154c0-41 27-68 67-68s68 27 68 68v48c0 45-31 74-68 74s-67-29-67-74z" fill="#955f47" />
      <path d="M218 155c9-52 34-77 76-72 26 3 47 20 59 50-22 5-43-2-63-18-17 20-41 34-72 40z" fill="url(#heroHair)" />
      <path d="M226 200c10-9 22-9 31-3m50 0c10-6 21-5 30 3" fill="none" stroke="#3b2a25" strokeWidth="4" strokeLinecap="round" />
      <path d="M271 218c3 2 7 2 10 0" fill="none" stroke="#684235" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M262 239c12 12 27 13 42 1" fill="none" stroke="#6b3f36" strokeWidth="3" strokeLinecap="round" />
      <circle cx="219" cy="201" r="9" fill="#965f47" />
      <circle cx="359" cy="201" r="9" fill="#965f47" />
      <path d="M239 284c-46 6-84 26-105 69l-44 133h302l-46-134c-19-39-58-63-107-68z" fill="url(#heroDress)" />
      <path d="M255 288c11 29 31 45 54 46 21-2 36-17 43-43" fill="none" stroke="#d7cdb5" strokeWidth="3" opacity=".75" />
      <path d="M265 306c-17 44-18 91-6 141" fill="none" stroke="#a8ad91" strokeWidth="2" opacity=".58" />
      <path d="M408 334h63c8 0 14 7 14 15v126c0 14-10 24-24 24h-43c-14 0-24-10-24-24V349c0-8 6-15 14-15z" fill="#f8f4eb" stroke="#fff" strokeWidth="2" />
      <path d="M425 334v-22c0-7 5-12 12-12h23c7 0 12 5 12 12v22" fill="#465343" />
      <rect x="416" y="371" width="47" height="63" rx="3" fill="#e1dfcf" />
      <text x="439" y="398" textAnchor="middle" fill="#394337" fontFamily="Georgia,serif" fontSize="7" letterSpacing="1">RUSHMEA</text>
      <text x="439" y="411" textAnchor="middle" fill="#6a6d61" fontFamily="Arial,sans-serif" fontSize="5.5" letterSpacing=".8">CROWN OIL</text>
      <path d="M443 421c4-8 9-8 13 0-4 7-9 8-13 0zm-8-6c2-7 7-8 11-2-2 7-7 8-11 2z" fill="#78856b" />
      <path d="M139 362c-12-17-11-34 2-48 12 13 13 29-2 48zm-9-18c-18 1-30-8-34-23 17-3 29 4 34 23zm274-93c-17 1-28-7-32-21 16-3 27 4 32 21z" fill="#738269" opacity=".78" />
      <circle cx="432" cy="262" r="5" fill="#fff5df" opacity=".8" />
    </svg>
  );
}
