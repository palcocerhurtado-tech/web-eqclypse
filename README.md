# EQCLYPSE — ecommerce estático

Web ecommerce estática para EQCLYPSE, una marca de vino joven en botellín de 33 cl. Funciona sin backend y está preparada para publicarse gratis en GitHub Pages.

## Estructura

```text
web eqclypse/
├── index.html
├── styles.css
├── script.js
├── README.md
└── assets/
    ├── logo-eqclypse.png
    ├── botella-tinto.png
    ├── botella-blanco.png
    ├── botella-rosado.png
    ├── botella-blanco-00.png
    ├── etiqueta-eqclypse.png
    ├── brand-board.png
    └── favicon.png
```

## Ver en local

Abre `index.html` directamente en el navegador. No necesita servidor, dependencias ni instalación.

## Desplegar en GitHub Pages

1. Crea un repositorio público en GitHub.
2. Sube todos los archivos de esta carpeta a la raíz del repositorio.
3. Entra en `Settings > Pages`.
4. En `Source`, selecciona `Deploy from branch`.
5. En `Branch`, selecciona `main`.
6. En `Folder`, selecciona `root`.
7. Guarda los cambios.
8. Abre la URL de GitHub Pages: `https://USUARIO.github.io/NOMBRE-REPO/`.

## Dónde cambiar datos

- Número de WhatsApp: `script.js`, constante `WHATSAPP_NUMBER`.
- Email de contacto: `script.js`, constante `CONTACT_EMAIL`, y footer en `index.html`.
- Productos y precios: array `PRODUCTS` en `script.js`.
- Imágenes: carpeta `assets/`.
- Textos legales: objeto `LEGAL_CONTENT` en `script.js`.

## Futura integración

El checkout actual genera un mensaje para WhatsApp o email. En una fase futura puede sustituirse por Stripe Checkout, Shopify Buy Button, Snipcart o un backend propio.

El formulario de El Círculo guarda registros en `localStorage`. Para producción, conéctalo a Formspree, Mailchimp, Brevo o un backend con consentimiento y gestión de bajas.
