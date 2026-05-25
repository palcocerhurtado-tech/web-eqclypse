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
    image: "assets/brand-board.png",
    alt: "Pack mixto EQCLYPSE con botellines de varios estilos",
    badges: ["Pack"],
    options: [{ id: "pack", label: "Pack 6 mixto", price: 15.9 }],
  },
  {
    id: "pack-urban-night",
    name: "Pack Urban Night",
    type: "12 botellines mixtos",
    description: "Para previa, terraza o cena en casa. Doce botellines, cero protocolo.",
    image: "assets/brand-board.png",
    alt: "Pack Urban Night EQCLYPSE con selección mixta de botellines",
    badges: ["Pack"],
    options: [{ id: "pack", label: "Pack 12 mixto", price: 29.9 }],
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
      <p>Esta V1 no instala cookies de terceros. Utiliza localStorage para recordar el aviso de mayoría de edad, el carrito y el registro local de El Círculo.</p>
      <p>Si se añaden analítica, píxeles publicitarios o herramientas externas, esta política deberá actualizarse.</p>
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
  renderProducts();
  renderCart();
  setupCart();
  setupCircleForm();
  setupLegalModal();
  setupRevealObserver();
});

function cacheElements() {
  els.body = document.body;
  els.ageGate = document.querySelector("#ageGate");
  els.ageAccept = document.querySelector("#ageAccept");
  els.ageExit = document.querySelector("#ageExit");
  els.productGrid = document.querySelector("#productGrid");
  els.cartDrawer = document.querySelector("#cartDrawer");
  els.cartItems = document.querySelector("#cartItems");
  els.cartSubtotal = document.querySelector("#cartSubtotal");
  els.cartCount = document.querySelector("[data-cart-count]");
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
  const accepted = localStorage.getItem("eqclypse_age_ok") === "true";

  if (!accepted) {
    els.ageGate.classList.add("is-open");
    els.body.classList.add("is-locked");
    window.setTimeout(() => els.ageAccept.focus(), 120);
  }

  els.ageAccept.addEventListener("click", () => {
    localStorage.setItem("eqclypse_age_ok", "true");
    els.ageGate.classList.remove("is-open");
    els.body.classList.remove("is-locked");
  });

  els.ageExit.addEventListener("click", () => {
    window.location.href = "about:blank";
  });
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
  els.productGrid.innerHTML = PRODUCTS.map((product) => {
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

function renderCart() {
  const itemCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = getCartSubtotal();

  els.cartCount.textContent = itemCount;
  els.cartSubtotal.textContent = currency.format(subtotal);
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

  return [
    "Hola, quiero hacer un pedido de EQCLYPSE:",
    ...lines,
    `Subtotal: ${currency.format(getCartSubtotal())}`,
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
}

function closeLegalModal() {
  els.legalModal.classList.remove("is-open");
  els.legalModal.setAttribute("aria-hidden", "true");
  if (!els.ageGate.classList.contains("is-open") && !els.cartDrawer.classList.contains("is-open")) {
    els.body.classList.remove("is-locked");
  }
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
  return state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
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
