// Cámara Velada: bloquear en cada recarga antes de que cualquier otro código corra
localStorage.removeItem("eqclypse_camara_v1");

const PRODUCTS = [
  {
    id: "tinto",
    name: "EQCLYPSE Tinto",
    type: "Vino tinto joven | 33 cl",
    description:
      "Oscuro, directo y fácil de abrir. Para noches que empiezan tranquilas y terminan tarde.",
    image: "assets/botella-tinto.png",
    alt: "Botellín EQCLYPSE Tinto de 33 cl",
    badges: ["33 cl"],
    options: [
      { id: "unidad", label: "Unidad", price: 2.8 },
      { id: "pack6", label: "Pack 6", price: 15.9 },
    ],
  },
  {
    id: "blanco",
    name: "EQCLYPSE Blanco",
    type: "Vino blanco | 33 cl",
    description: "Frío, limpio y ligero. El botellín para terraza, previa o cena improvisada.",
    image: "assets/botella-blanco.png",
    alt: "Botellín EQCLYPSE Blanco de 33 cl",
    badges: ["33 cl"],
    options: [
      { id: "unidad", label: "Unidad", price: 2.8 },
      { id: "pack6", label: "Pack 6", price: 15.9 },
    ],
  },
  {
    id: "rosado",
    name: "EQCLYPSE Rosado",
    type: "Vino rosado | 33 cl",
    description: "La hora dorada en formato botellín. Fresco, visual y fácil de compartir.",
    image: "assets/botella-rosado.png",
    alt: "Botellín EQCLYPSE Rosado de 33 cl",
    badges: ["33 cl"],
    options: [
      { id: "unidad", label: "Unidad", price: 2.8 },
      { id: "pack6", label: "Pack 6", price: 15.9 },
    ],
  },
  {
    id: "blanco-00",
    name: "EQCLYPSE Blanco Semidulce 0.0",
    type: "Vino blanco semidulce sin alcohol | 33 cl",
    description: "Todo el gesto. Cero alcohol. Para cuando tu noche pide claridad.",
    image: "assets/botella-blanco-00.png",
    alt: "Botellín EQCLYPSE Blanco Semidulce 0.0 de 33 cl",
    badges: ["33 cl", "0.0"],
    options: [
      { id: "unidad", label: "Unidad", price: 2.8 },
      { id: "pack6", label: "Pack 6", price: 15.9 },
    ],
  },
  {
    id: "pack-cata-nocturna",
    name: "Pack Cata Nocturna",
    type: "6 botellines mixtos",
    description:
      "Una selección para probar EQCLYPSE sin estudiar vino. Abre, enfría y elige tu momento.",
    image: "assets/pack-cata-nocturna.png",
    alt: "Pack Cata Nocturna de EQCLYPSE con seis botellines mixtos",
    badges: ["Pack"],
    options: [{ id: "pack", label: "Pack 6 mixto", price: 15.9 }],
  },
  {
    id: "pack-urban-night",
    name: "Pack Urban Night",
    type: "12 botellines mixtos",
    description: "Para previa, terraza o cena en casa. Doce botellines, cero protocolo.",
    image: "assets/pack-urban-night.png",
    alt: "Pack Urban Night de EQCLYPSE con doce botellines mixtos",
    badges: ["Pack"],
    options: [{ id: "pack", label: "Pack 12 mixto", price: 33 }],
  },
  /* ─── Cámara Velada — artículos exclusivos ─── */
  {
    camaraOnly: true,
    id: "camara-hielera",
    name: "Hielera EQCLYPSE",
    type: "Cámara Velada · Edición limitada",
    description: "Acero inoxidable mate dorado. Logo eclipse en relieve. La temperatura perfecta para tu botellín.",
    image: "assets/camara-hielera.jpg",
    alt: "Hielera dorada EQCLYPSE Ice Bucket Set edición limitada",
    badges: ["Cámara Velada"],
    options: [{ id: "unidad", label: "Unidad", price: 23.54 }],
  },
  {
    camaraOnly: true,
    id: "camara-posavasos",
    name: "Pack de Posavasos Premium",
    type: "Cámara Velada · Edición limitada",
    description: "Eclipse grabado. Negro, gris y crema. Para los que saben dejar huella.",
    image: "assets/camara-posavasos.jpg",
    alt: "Pack de posavasos premium EQCLYPSE edición limitada",
    badges: ["Cámara Velada"],
    options: [{ id: "pack", label: "Pack posavasos", price: 15.89 }],
  },
  {
    camaraOnly: true,
    id: "camara-copas",
    name: "Pack de 6 Copas Premium",
    type: "Cámara Velada · Edición limitada",
    description: "Cristal ahumado. Logo grabado en oro. Beber con estilo, sin protocolo.",
    image: "assets/camara-copas.jpg",
    alt: "Pack de 6 copas premium EQCLYPSE edición limitada",
    badges: ["Cámara Velada"],
    options: [{ id: "pack", label: "Pack 6 copas", price: 55 }],
  },
  {
    camaraOnly: true,
    id: "camara-pack-intimo",
    name: "Pack Íntimo EQCLYPSE",
    type: "Cámara Velada · Pack exclusivo",
    description: "Copa + hielera + 6 botellines seleccionados. Solo aquí. Solo ahora.",
    image: "assets/camara-pack-intimo.jpg",
    alt: "Pack Íntimo EQCLYPSE con copa, hielera y 6 botellines",
    badges: ["Cámara Velada", "Pack"],
    options: [{ id: "pack", label: "Pack íntimo completo", price: 43 }],
  },
];

const LEGAL_CONTENT = {
  aviso: {
    title: "Aviso legal",
    body: `
      <p>Titular de la web: [Nombre fiscal de la empresa].</p>
      <p>CIF: [CIF]. Dirección fiscal: [Dirección fiscal]. Email de contacto: [Email de contacto].</p>
      <p>Esta web es una maqueta ecommerce estática para EQCLYPSE. Los datos legales deberán completarse antes de publicar o vender.</p>
    `,
  },
  privacidad: {
    title: "Política de privacidad",
    body: `
      <p>Responsable: [Nombre fiscal de la empresa]. Email: [Email de contacto].</p>
      <p>El formulario de El Círculo guarda los datos en localStorage del navegador para esta V1 sin backend.</p>
      <p>En una fase futura, la gestión de datos deberá conectarse a una herramienta con consentimiento, doble opt-in si aplica y baja sencilla.</p>
    `,
  },
  cookies: {
    title: "Política de cookies",
    body: `
      <p><strong>Responsable del tratamiento:</strong> EQCLYPSE · hola@eqclypse.com</p>
      <p><strong>Base legal:</strong> Art. 22.2 LSSI-CE y Reglamento (UE) 2016/679 (RGPD).</p>
      <h3 style="margin-top:18px;margin-bottom:8px;font-size:1rem;letter-spacing:.06em;text-transform:uppercase;">Cookies técnicas y necesarias</h3>
      <p>No requieren consentimiento. Son imprescindibles para el funcionamiento de la web:</p>
      <ul style="padding-left:18px;line-height:1.8;opacity:.72;">
        <li><code>eqclypse_age_v1</code> — confirmación de mayoría de edad · sesión</li>
        <li><code>eqclypse_cart_v1</code> — contenido del carrito · persistente</li>
        <li><code>eqclypse_camara_v1</code> — acceso a la Cámara Velada · persistente</li>
        <li><code>eqclypse_cookie_preference</code> — tu elección de cookies · persistente</li>
      </ul>
      <h3 style="margin-top:18px;margin-bottom:8px;font-size:1rem;letter-spacing:.06em;text-transform:uppercase;">Cookies analíticas y de marketing</h3>
      <p>En la versión actual <strong>no se instalan cookies analíticas, de publicidad ni de terceros</strong>. No se usa Google Analytics, Meta Pixel ni ningún rastreador externo.</p>
      <h3 style="margin-top:18px;margin-bottom:8px;font-size:1rem;letter-spacing:.06em;text-transform:uppercase;">Tus derechos (arts. 15–22 RGPD)</h3>
      <p>Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, portabilidad y limitación del tratamiento escribiendo a <a href="mailto:hola@eqclypse.com">hola@eqclypse.com</a>. También puedes reclamar ante la <a href="https://www.aepd.es" target="_blank" rel="noreferrer">AEPD</a>.</p>
      <div style="margin-top:22px;padding-top:18px;border-top:1px solid rgba(255,215,91,0.12);">
        <p style="margin-bottom:10px;opacity:.7;font-size:.85rem;">¿Quieres cambiar tu elección de cookies?</p>
        <button type="button" id="resetCookiePreference" style="padding:10px 20px;background:transparent;border:1px solid rgba(255,215,91,0.35);color:var(--gold);font-size:.8rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;">Gestionar mis preferencias</button>
      </div>
    `,
  },
  compra: {
    title: "Condiciones de compra",
    body: `
      <p>Los pedidos se preparan mediante WhatsApp o email y no implican pago online en esta V1.</p>
      <p>Precios, disponibilidad, zonas de envío, costes, impuestos y condiciones finales deberán confirmarse manualmente hasta integrar una pasarela real.</p>
      <p>Datos fiscales pendientes: [Nombre fiscal de la empresa], [CIF], [Dirección fiscal].</p>
    `,
  },
  responsable: {
    title: "Consumo responsable",
    body: `
      <p>Producto para mayores de 18 años. Consume con moderación y responsabilidad.</p>
      <p>No conduzcas después de consumir alcohol. EQCLYPSE también ofrece alternativa 0.0 para planes que piden claridad.</p>
    `,
  },
};

const WHATSAPP_NUMBER = "34XXXXXXXXX"; // Sustituir por el número real de WhatsApp de EQCLYPSE.
const CONTACT_EMAIL = "hola@eqclypse.com"; // Sustituir por el email real si cambia.

const currency = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

const state = {
  cart: readStorage("eqclypse_cart", []),
};

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  setupAgeGate();
  setupHeader();
  setupHeroTagline();
  renderProducts();
  renderCart();
  setupCart();
  setupCircleForm();
  setupLegalModal();
  setupRevealObserver();
  setupHeroParticles();
  setupHeroParallax();
  setupInlineVideoPlayback();
});

function cacheElements() {
  els.body = document.body;
  els.ageGate = document.querySelector("#ageGate");
  els.ageAccept = document.querySelector("#ageAccept");
  els.ageExit = document.querySelector("#ageExit");
  els.cookieBanner = document.querySelector("#cookieBanner");
  els.cookieAccept = document.querySelector("#cookieAccept");
  els.cookieReject = document.querySelector("#cookieReject");
  els.productGrid = document.querySelector("#productGrid");
  els.cartDrawer = document.querySelector("#cartDrawer");
  els.cartItems = document.querySelector("#cartItems");
  els.cartSubtotal = document.querySelector("#cartSubtotal");
  els.cartCount = document.querySelector("[data-cart-count]");
  els.cartRaw = document.querySelector("#cartRaw");
  els.cartDiscount = document.querySelector("#cartDiscount");
  els.cartDiscountAmount = document.querySelector("#cartDiscountAmount");
  els.whatsappCheckout = document.querySelector("#whatsappCheckout");
  els.emailCheckout = document.querySelector("#emailCheckout");
  els.menuToggle = document.querySelector("[data-menu-toggle]");
  els.mobileNav = document.querySelector("[data-mobile-nav]");
  els.circleForm = document.querySelector("#circleForm");
  els.circleStatus = document.querySelector("#circleStatus");
  els.legalModal = document.querySelector("#legalModal");
  els.legalTitle = document.querySelector("#legalTitle");
  els.legalBody = document.querySelector("#legalBody");
}

function setupAgeGate() {
  els.ageGate.classList.add("is-open");
  els.body.classList.add("is-locked");
  window.setTimeout(() => els.ageAccept.focus(), 120);

  els.ageAccept.addEventListener("click", () => {
    els.ageGate.classList.remove("is-open");
    els.body.classList.remove("is-locked");
    setupCookieBanner();
  });

  els.ageExit.addEventListener("click", () => {
    window.location.href = "about:blank";
  });
}

function setupCookieBanner() {
  els.cookieBanner.classList.add("is-open");
  els.cookieBanner.setAttribute("aria-hidden", "false");
  window.setTimeout(() => els.cookieAccept.focus(), 120);

  const closeBanner = (value) => {
    localStorage.setItem("eqclypse_cookie_preference", value);
    els.cookieBanner.classList.remove("is-open");
    els.cookieBanner.setAttribute("aria-hidden", "true");
  };

  els.cookieAccept.addEventListener("click", () => closeBanner("accepted"), { once: true });
  els.cookieReject.addEventListener("click", () => closeBanner("necessary"), { once: true });
}

function setupHeader() {
  els.menuToggle.addEventListener("click", () => {
    const isOpen = els.mobileNav.classList.toggle("is-open");
    els.menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  els.mobileNav.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      els.mobileNav.classList.remove("is-open");
      els.menuToggle.setAttribute("aria-expanded", "false");
    }
  });
}

function renderProducts() {
  const publicProducts = PRODUCTS.filter((p) => !p.camaraOnly);
  els.productGrid.innerHTML = publicProducts.map((product) => {
    const options = product.options
      .map((option) => {
        return `<option value="${option.id}">${option.label} · ${currency.format(option.price)}</option>`;
      })
      .join("");
    const badges = product.badges.map((badge) => `<span class="badge">${badge}</span>`).join("");
    const initialPrice = product.options[0].price;

    return `
      <article class="product-card reveal" data-product-card="${product.id}">
        <div class="product-card__media">
          <div class="product-card__badges">${badges}</div>
          <img src="${product.image}" alt="${product.alt}" loading="lazy" />
        </div>
        <div class="product-card__body">
          <p class="product-card__meta">${product.type}</p>
          <h3>${product.name}</h3>
          <p class="product-card__description">${product.description}</p>
          <div class="price-row">
            <strong data-price-preview>${currency.format(initialPrice)}</strong>
            <span class="serve-cold">Servir frío</span>
          </div>
          <div class="product-controls">
            <select aria-label="Formato para ${product.name}" data-product-option>
              ${options}
            </select>
            <input aria-label="Cantidad para ${product.name}" data-product-qty type="number" min="1" max="99" value="1" inputmode="numeric" />
          </div>
          <button class="button button--dark" type="button" data-add-product="${product.id}">
            Añadir al carrito
          </button>
        </div>
      </article>
    `;
  }).join("");

  els.productGrid.addEventListener("change", (event) => {
    if (!event.target.matches("[data-product-option]")) return;
    const card = event.target.closest("[data-product-card]");
    const product = findProduct(card.dataset.productCard);
    const option = findOption(product, event.target.value);
    card.querySelector("[data-price-preview]").textContent = currency.format(option.price);
  });

  els.productGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add-product]");
    if (!button) return;

    const card = button.closest("[data-product-card]");
    const product = findProduct(button.dataset.addProduct);
    const optionId = card.querySelector("[data-product-option]").value;
    const quantity = Math.max(1, Number(card.querySelector("[data-product-qty]").value) || 1);

    addToCart(product, optionId, quantity);
    openCart();
  });
}

function setupCart() {
  document.querySelectorAll("[data-open-cart]").forEach((button) => {
    button.addEventListener("click", openCart);
  });

  // Cámara Velada — add-to-cart buttons
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-camara-add]");
    if (!button) return;
    const product = findProduct(button.dataset.camaraAdd);
    if (!product) return;
    const optionId = product.options[0].id;
    addToCart(product, optionId, 1);
    openCart();
  });

  document.querySelectorAll("[data-close-cart]").forEach((button) => {
    button.addEventListener("click", closeCart);
  });

  els.cartItems.addEventListener("click", (event) => {
    const itemElement = event.target.closest("[data-cart-key]");
    if (!itemElement) return;

    const key = itemElement.dataset.cartKey;

    if (event.target.matches("[data-increase]")) updateCartQuantity(key, 1);
    if (event.target.matches("[data-decrease]")) updateCartQuantity(key, -1);
    if (event.target.matches("[data-remove]")) removeFromCart(key);
  });

  els.whatsappCheckout.addEventListener("click", () => {
    if (!state.cart.length) return;
    // Futuro: sustituir este flujo por Stripe Checkout, Shopify Buy Button, Snipcart o backend propio.
    window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildOrderMessage())}`;
  });

  els.emailCheckout.addEventListener("click", () => {
    if (!state.cart.length) return;
    // Futuro: enviar el pedido a un backend transaccional en lugar de mailto.
    const subject = encodeURIComponent("Pedido EQCLYPSE");
    const body = encodeURIComponent(buildOrderMessage());
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeCart();
      closeLegalModal();
    }
  });
}

function addToCart(product, optionId, quantity) {
  const option = findOption(product, optionId);
  const key = `${product.id}:${option.id}`;
  const existing = state.cart.find((item) => item.key === key);

  if (existing) {
    existing.quantity += quantity;
  } else {
    state.cart.push({
      key,
      productId: product.id,
      optionId: option.id,
      name: product.name,
      optionLabel: option.label,
      price: option.price,
      image: product.image,
      alt: product.alt,
      quantity,
    });
  }

  persistCart();
  renderCart();
}

function updateCartQuantity(key, delta) {
  const item = state.cart.find((cartItem) => cartItem.key === key);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) removeFromCart(key);
  persistCart();
  renderCart();
}

function removeFromCart(key) {
  state.cart = state.cart.filter((item) => item.key !== key);
  persistCart();
  renderCart();
}

function isDiscountEligible() {
  return localStorage.getItem("eqclypse_camara_v1") === "1";
}

function renderCart() {
  const itemCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const raw = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const eligible = isDiscountEligible() && state.cart.length > 0;
  const subtotal = eligible ? raw * 0.89 : raw;

  els.cartCount.textContent = itemCount;
  if (els.cartRaw) els.cartRaw.textContent = currency.format(raw);
  els.cartSubtotal.textContent = currency.format(subtotal);

  if (els.cartDiscount) {
    els.cartDiscount.hidden = !eligible;
    if (els.cartDiscountAmount) {
      els.cartDiscountAmount.textContent = eligible
        ? "−" + currency.format(raw * 0.11)
        : "";
    }
  }

  els.whatsappCheckout.disabled = state.cart.length === 0;
  els.emailCheckout.disabled = state.cart.length === 0;

  if (!state.cart.length) {
    els.cartItems.innerHTML = `<p class="empty-cart">Tu noche aún no tiene botellines.</p>`;
    return;
  }

  els.cartItems.innerHTML = state.cart
    .map((item) => {
      return `
        <article class="cart-item" data-cart-key="${item.key}">
          <img src="${item.image}" alt="${item.alt}" />
          <div>
            <h3>${item.name}</h3>
            <p>${item.optionLabel} · ${currency.format(item.price)}</p>
            <div class="cart-item__controls" aria-label="Cantidad">
              <button class="qty-button" type="button" aria-label="Restar ${item.name}" data-decrease>-</button>
              <strong>${item.quantity}</strong>
              <button class="qty-button" type="button" aria-label="Sumar ${item.name}" data-increase>+</button>
            </div>
          </div>
          <strong class="cart-item__price">${currency.format(item.price * item.quantity)}</strong>
          <button class="remove-item" type="button" data-remove>Eliminar</button>
        </article>
      `;
    })
    .join("");
}

function openCart() {
  els.cartDrawer.classList.add("is-open");
  els.cartDrawer.setAttribute("aria-hidden", "false");
  els.body.classList.add("is-locked");
}

function closeCart() {
  els.cartDrawer.classList.remove("is-open");
  els.cartDrawer.setAttribute("aria-hidden", "true");
  if (!els.ageGate.classList.contains("is-open") && !els.legalModal.classList.contains("is-open")) {
    els.body.classList.remove("is-locked");
  }
}

function buildOrderMessage() {
  const lines = state.cart.map((item) => {
    return `- ${item.quantity}x ${item.name} (${item.optionLabel}) — ${currency.format(item.price * item.quantity)}`;
  });

  const raw = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const eligible = isDiscountEligible();

  const summaryLines = eligible
    ? [
        `Subtotal bruto: ${currency.format(raw)}`,
        `Descuento Cámara Velada −11%: −${currency.format(raw * 0.11)}`,
        `Total con descuento: ${currency.format(raw * 0.89)}`,
      ]
    : [`Total: ${currency.format(raw)}`];

  return [
    "Hola, quiero hacer un pedido de EQCLYPSE:",
    ...lines,
    ...summaryLines,
    "Nombre:",
    "Ciudad:",
    "Dirección:",
    "Gracias.",
  ].join("\n");
}

function setupCircleForm() {
  els.circleForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(els.circleForm).entries());
    const stored = readStorage("eqclypse_circle_members", []);
    stored.push({
      ...data,
      createdAt: new Date().toISOString(),
    });

    // Futuro: conectar este formulario con Formspree, Mailchimp, Brevo o un backend propio.
    localStorage.setItem("eqclypse_circle_members", JSON.stringify(stored));
    els.circleForm.reset();
    els.circleStatus.textContent = "Bienvenido a El Círculo. Acceso guardado en este navegador.";
  });
}

function setupLegalModal() {
  document.querySelectorAll("[data-legal]").forEach((button) => {
    button.addEventListener("click", () => openLegalModal(button.dataset.legal));
  });

  document.querySelectorAll("[data-close-legal]").forEach((button) => {
    button.addEventListener("click", closeLegalModal);
  });
}

function openLegalModal(key) {
  const content = LEGAL_CONTENT[key];
  if (!content) return;
  els.legalTitle.textContent = content.title;
  els.legalBody.innerHTML = content.body;
  els.legalModal.classList.add("is-open");
  els.legalModal.setAttribute("aria-hidden", "false");
  els.body.classList.add("is-locked");
  window.setTimeout(() => els.legalModal.querySelector("[data-close-legal]").focus(), 80);

  // "Gestionar mis preferencias" button inside cookies modal
  var resetBtn = document.getElementById("resetCookiePreference");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      localStorage.removeItem("eqclypse_cookie_preference");
      sessionStorage.removeItem("eqclypse_cookie_seen");
      closeLegalModal();
      window.setTimeout(function () {
        els.cookieBanner.classList.add("is-open");
        els.cookieBanner.setAttribute("aria-hidden", "false");
        // Re-attach button listeners (once: true already fired, so we re-bind)
        els.cookieAccept.addEventListener("click", function () {
          localStorage.setItem("eqclypse_cookie_preference", "accepted");
          els.cookieBanner.classList.remove("is-open");
          els.cookieBanner.setAttribute("aria-hidden", "true");
        }, { once: true });
        els.cookieReject.addEventListener("click", function () {
          localStorage.setItem("eqclypse_cookie_preference", "necessary");
          els.cookieBanner.classList.remove("is-open");
          els.cookieBanner.setAttribute("aria-hidden", "true");
        }, { once: true });
      }, 200);
    }, { once: true });
  }
}

function closeLegalModal() {
  els.legalModal.classList.remove("is-open");
  els.legalModal.setAttribute("aria-hidden", "true");
  if (!els.ageGate.classList.contains("is-open") && !els.cartDrawer.classList.contains("is-open")) {
    els.body.classList.remove("is-locked");
  }
}

function setupHeroTagline() {
  const el = document.querySelector("#heroTagline");
  if (!el) return;

  const lines = [
    "Para el miércoles.",
    "Para el jueves.",
    "Para cuando toca.",
    "Para tu terraza.",
    "Para previa en casa.",
    "Para golden hour.",
    "Para la noche larga.",
  ];

  let i = 0;
  setInterval(() => {
    el.style.opacity = "0";
    el.style.transform = "translateY(8px)";
    setTimeout(() => {
      i = (i + 1) % lines.length;
      el.textContent = lines[i];
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 300);
  }, 2800);
}

function setupRevealObserver() {
  const targets = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    targets.forEach((target) => target.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  targets.forEach((target) => observer.observe(target));
}

function findProduct(productId) {
  return PRODUCTS.find((product) => product.id === productId);
}

function findOption(product, optionId) {
  return product.options.find((option) => option.id === optionId);
}

function getCartSubtotal() {
  const raw = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return isDiscountEligible() ? raw * 0.89 : raw;
}

function persistCart() {
  localStorage.setItem("eqclypse_cart", JSON.stringify(state.cart));
}

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function setupInlineVideoPlayback() {
  const videos = document.querySelectorAll("[data-inline-video]");
  if (!videos.length) return;

  const playVideo = (video) => {
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  };

  if (!("IntersectionObserver" in window)) {
    videos.forEach(playVideo);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (entry.isIntersecting) {
        playVideo(video);
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.35 });

  videos.forEach((video) => observer.observe(video));
}

/* ─── Hero: partículas doradas ──────────────────────────────── */
function setupHeroParticles() {
  const canvas = document.getElementById("heroParticles");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const hero = canvas.closest(".hero");

  // Reducir en móvil para no afectar rendimiento
  const COUNT = window.innerWidth < 768 ? 28 : 55;

  function resize() {
    canvas.width  = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  // Crear partículas
  const particles = Array.from({ length: COUNT }, () => ({
    x    : Math.random() * canvas.width,
    y    : Math.random() * canvas.height,
    r    : Math.random() * 1.6 + 0.3,          // radio 0.3 – 1.9 px
    vx   : (Math.random() - 0.5) * 0.18,
    vy   : -(Math.random() * 0.22 + 0.08),      // siempre hacia arriba
    alpha: Math.random() * 0.6 + 0.15,
    pulse: Math.random() * Math.PI * 2,          // fase inicial aleatoria
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      // Pulso de opacidad suave
      p.pulse += 0.018;
      const a = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 215, 91, ${a})`;
      ctx.fill();

      // Mover
      p.x += p.vx;
      p.y += p.vy;

      // Reciclar cuando sale por arriba o por los lados
      if (p.y < -4)              p.y = canvas.height + 4;
      if (p.x < -4)              p.x = canvas.width  + 4;
      if (p.x > canvas.width + 4) p.x = -4;
    });

    requestAnimationFrame(draw);
  }

  draw();
}

/* ─── Hero: parallax suave en scroll ────────────────────────── */
function setupHeroParallax() {
  const left   = document.querySelector(".hero-bottle--left");
  const center = document.querySelector(".hero-bottle--center");
  const right  = document.querySelector(".hero-bottle--right");
  if (!left || !center || !right) return;

  // Usamos CSS custom properties para no romper las animaciones de float
  // La animación float ya usa transform; el parallax lo aplicamos
  // directamente a margin-top para no interferir
  let ticking = false;

  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = Math.min(window.scrollY, window.innerHeight);
      left.style.marginTop   = `${y * 0.06}px`;
      center.style.marginTop = `${y * 0.10}px`;
      right.style.marginTop  = `${y * 0.07}px`;
      ticking = false;
    });
  }, { passive: true });
}
