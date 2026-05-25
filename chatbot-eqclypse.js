/**
 * chatbot-eqclypse.js — v2
 * Chatbot local EQCLYPSE. Sin APIs externas, sin dependencias.
 *
 * Arquitectura:
 *  - Las opciones de botón disparan intenciones directamente (sin NLP),
 *    eliminando falsos positivos por coincidencia de texto.
 *  - El texto libre pasa por matchIntent() con word-boundary para palabras sueltas.
 *  - El flujo de la Cámara Velada usa flags de estado, no texto matching.
 */
(function () {
  'use strict';

  /* ─── Config ──────────────────────────────────────────────── */

  var STORAGE_KEY   = 'eqclypse_camara_v1';
  var TYPING_MS     = 620;

  /* ─── Estado ─────────────────────────────────────────────── */

  var S = {
    open              : false,
    cameraUnlocked    : localStorage.getItem(STORAGE_KEY) === '1',
    awaitQuizConfirm  : false,   // esperando Sí/No para empezar quiz
    quizActive        : false,
    quizIndex         : 0,
    quizCorrect       : 0,
  };

  /* ─── Quiz ───────────────────────────────────────────────── */

  var QUIZ = [
    {
      q      : '¿En qué país se elaboró el vino más antiguo conocido, con más de 8.000 años de historia?',
      opts   : ['Georgia', 'Egipto', 'Mesopotamia', 'China'],
      correct: 0,
    },
    {
      q      : '¿Cómo se llama el proceso enológico que convierte el ácido málico en ácido láctico, suavizando la acidez de los vinos?',
      opts   : ['Fermentación maloláctica', 'Maceración carbónica', 'Crianza sur lies', 'Remontado'],
      correct: 0,
    },
    {
      q      : '¿Qué plaga de insecto, originaria de Norteamérica, devastó los viñedos europeos en la segunda mitad del siglo XIX?',
      opts   : ['La filoxera', 'El oídio', 'La botrytis', 'El mildiu'],
      correct: 0,
    },
    {
      q      : '¿Cómo se denomina el método de elaboración del Champagne donde la segunda fermentación ocurre dentro de la propia botella?',
      opts   : ['Méthode champenoise', 'Método Charmat', 'Método ancestral', 'Método continuo'],
      correct: 0,
    },
    {
      q      : '¿Quién demostró científicamente en el siglo XIX que la fermentación alcohólica es causada por las levaduras?',
      opts   : ['Louis Pasteur', 'Antoine Lavoisier', 'Alexander Fleming', 'Justus von Liebig'],
      correct: 0,
    },
  ];

  /* ─── Intenciones FAQ ────────────────────────────────────── */
  /*
   * Orden importa: el primero que coincide gana.
   * Triggers de UNA sola palabra → word-boundary check.
   * Triggers de VARIAS palabras  → substring check (más específico).
   *
   * Regla de oro: intenciones específicas ANTES que genéricas.
   */

  var INTENTS = [
    /* 1 — Saludo */
    {
      id      : 'greeting',
      triggers: ['hola', 'hey', 'buenas', 'saludos', 'hi', 'buenos días', 'buenas tardes', 'buenas noches', 'qué tal'],
      reply   : '¡Hola! Soy el asistente de EQCLYPSE. Pregúntame lo que quieras.',
      opts    : [
        { label: '¿Qué es EQCLYPSE?',    id: 'brand'     },
        { label: 'Botellines disponibles', id: 'varieties' },
        { label: 'Precios y packs',        id: 'price'     },
        { label: 'Envío y entrega',        id: 'shipping'  },
      ],
    },

    /* 2 — Cámara velada (ANTES de circle para evitar colisión) */
    {
      id      : 'camara_trigger',
      triggers: [
        'cámara velada', 'camara velada', 'zona secreta', 'sección secreta',
        'acceso secreto', 'zona exclusiva', 'zona vip', 'hay algo más',
        'qué más hay', 'algo oculto', 'sección oculta', 'cámara',
      ],
      reply   : null, // manejado a mano
      opts    : [],
    },

    /* 3 — Botellín 0.0 (antes de varieties para que "blanco 0.0" no caiga en blanco) */
    {
      id      : 'zero',
      triggers: ['0.0', 'sin alcohol', 'cero alcohol', 'zero', 'dealcoholizado',
                 'conducir', 'embarazo', 'embarazada', 'semidulce', 'blanco 0'],
      reply   : 'El Blanco 0.0 de EQCLYPSE es vino blanco semidulce dealcoholizado. Tiene el mismo carácter que nuestro blanco, pero sin ni rastro de alcohol.\n\nPerfecto para conducir, para quienes no quieren alcohol o simplemente para cuando no apetece. Mismo formato 33 cl, mismo protocolo (ninguno).',
      opts    : [
        { label: '¿Con qué lo combino?',  id: 'pairing'   },
        { label: 'Ver todos los vinos',   id: 'varieties' },
        { label: 'Precios',               id: 'price'     },
      ],
    },

    /* 4 — Variedades */
    {
      id      : 'varieties',
      triggers: ['variedades', 'qué vinos', 'qué botellines', 'referencias',
                 'gama', 'tipos de vino', 'tinto', 'blanco', 'rosado',
                 'botellines disponibles', 'cuáles tenéis', 'cuáles tienen'],
      reply   : 'Tenemos cuatro referencias:\n\n🍷 Tinto — Joven, oscuro y directo.\n🥂 Blanco — Frío, limpio y ligero.\n🌸 Rosado — La hora dorada en botellín.\n⭕ Blanco 0.0 — Todo el gesto, cero alcohol.\n\nTodos en formato 33 cl. Pensados para beber fríos.',
      opts    : [
        { label: 'Temperatura de servicio', id: 'temperature' },
        { label: 'Maridajes',               id: 'pairing'     },
        { label: '¿Qué es el 0.0?',         id: 'zero'        },
        { label: 'Precios',                 id: 'price'       },
      ],
    },

    /* 5 — Graduación alcohólica */
    {
      id      : 'alcohol',
      triggers: ['graduación', 'grado alcohólico', 'cuánto alcohol tiene',
                 'cuántos grados', 'porcentaje de alcohol', 'abv',
                 'qué graduación', 'grados de alcohol'],
      reply   : 'Los botellines EQCLYPSE tienen una graduación de entre 11,5° y 12,5° según la variedad, típica de vinos jóvenes.\n\nEl Blanco 0.0 tiene graduación 0,0% — sin alcohol.',
      opts    : [
        { label: '¿Qué es el 0.0?',         id: 'zero'        },
        { label: 'Variedades',              id: 'varieties'   },
        { label: 'Temperatura de servicio', id: 'temperature' },
      ],
    },

    /* 6 — Temperatura */
    {
      id      : 'temperature',
      triggers: ['temperatura', 'a qué temperatura', 'cómo servir', 'cuánto enfriar',
                 'nevera', 'frigorífico', 'bien frío', 'temperatura de servicio',
                 'cómo se sirve', 'servir frío'],
      reply   : 'EQCLYPSE está pensado para beberse frío:\n\n• Blanco y Rosado: entre 6 y 10 °C.\n• Tinto: entre 10 y 14 °C.\n• 0.0: bien frío, entre 4 y 8 °C.\n\nDeja el botellín en la nevera al menos 2 horas antes. Sin enfriadera, sin protocolo.',
      opts    : [
        { label: 'Maridajes',  id: 'pairing'   },
        { label: 'Variedades', id: 'varieties' },
        { label: 'Packs',      id: 'packs'     },
      ],
    },

    /* 7 — Maridaje (antes de packs para evitar colisión con "cena") */
    {
      id      : 'pairing',
      triggers: ['maridaje', 'maridajes', 'con qué', 'con qué lo combino',
                 'combinar', 'qué comer', 'comida', 'aperitivo', 'queso',
                 'jamón', 'embutido', 'pasta', 'pizza', 'marisco', 'pescado',
                 'tapa', 'tapas', 'qué poner', 'qué sirvo'],
      reply   : 'EQCLYPSE no necesita protocolo, pero si quieres ideas:\n\n🍷 Tinto — Embutidos, quesos curados, pasta.\n🥂 Blanco — Pescado, mariscos, ensaladas, sushi.\n🌸 Rosado — Aperitivos, tapas, pizzas ligeras.\n⭕ 0.0 — Todo lo anterior sin alcohol.\n\nLa regla real: lo que te apetezca con lo que tengas.',
      opts    : [
        { label: 'Temperatura de servicio', id: 'temperature' },
        { label: 'Variedades',              id: 'varieties'   },
        { label: 'Packs',                   id: 'packs'       },
      ],
    },

    /* 8 — Añada / origen */
    {
      id      : 'vintage',
      triggers: ['añada', 'cosecha', 'de qué año', 'qué año', 'cuándo se hizo',
                 'crianza', 'reserva', 'vino joven', 'origen', 'dónde se hace',
                 'de dónde', 'denominación'],
      reply   : 'Los botellines EQCLYPSE son vinos jóvenes, pensados para beber en el año. Sin crianza larga, sin años de espera.\n\nFrescura inmediata. Frío y listo.',
      opts    : [
        { label: 'Graduación alcohólica',   id: 'alcohol'     },
        { label: 'Variedades',              id: 'varieties'   },
        { label: 'Temperatura de servicio', id: 'temperature' },
      ],
    },

    /* 9 — Precios */
    {
      id      : 'price',
      triggers: ['precio', 'precios', 'cuánto cuesta', 'cuánto vale', 'cuánto es',
                 'qué precio', 'cuánto cobráis', 'tarifa', 'coste', 'caro', 'barato',
                 'cuánto me sale', 'cuánto salen'],
      reply   : 'Cada botellín cuesta 2,80 €. Pequeño formato, precio justo.\n\nLos packs tienen su propio precio según unidades e incluyen mezcla de variedades. Para pedidos personalizados escríbenos a hola@eqclypse.com.',
      opts    : [
        { label: '¿Qué packs hay?', id: 'packs'         },
        { label: 'Cómo pedir',      id: 'how_to_order'  },
        { label: 'Envío',           id: 'shipping'      },
      ],
    },

    /* 10 — Packs */
    {
      id      : 'packs',
      triggers: ['pack', 'packs', 'lote', 'caja de vino', 'mixto', 'surtido',
                 'urban night', 'golden hour', 'previa', 'pack de vino',
                 'vino para la previa', 'pack para'],
      reply   : 'Tenemos packs por momento:\n\n🌃 Urban Night — 12 botellines para previa.\n☀️ Golden Hour — Mix rosado + blanco.\n🍽️ Cena Improvisada — Mix tinto + blanco.\n🏙️ Pack Ciudad — Surtido mixto.\n\nCada pack pensado para una ocasión concreta.',
      opts    : [
        { label: 'Precios de los packs', id: 'price'        },
        { label: 'Cómo pedir',           id: 'how_to_order' },
        { label: 'Envío y entrega',      id: 'shipping'     },
      ],
    },

    /* 11 — Tiempo de entrega */
    {
      id      : 'delivery',
      triggers: ['cuánto tarda', 'tiempo de entrega', 'plazo de entrega',
                 'cuántos días tarda', 'en cuánto llega', 'cuándo llega',
                 'rapidez', 'entrega urgente', '24h', '48h', 'entrega rápida'],
      reply   : 'El tiempo de entrega habitual es de 2 a 4 días laborables para España peninsular.\n\nSi necesitas algo urgente para un evento, escríbenos con antelación a hola@eqclypse.com y lo intentamos.',
      opts    : [
        { label: 'Gastos de envío', id: 'shipping'     },
        { label: 'Cómo pedir',      id: 'how_to_order' },
        { label: 'Contacto',        id: 'contact'      },
      ],
    },

    /* 12 — Envío */
    {
      id      : 'shipping',
      triggers: ['envío', 'envíais', 'gastos de envío', 'portes', 'transporte',
                 'mensajería', 'enviar a', 'mando a', 'llegáis a',
                 'dónde enviáis', 'envíos', 'entregáis'],
      reply   : 'Enviamos a toda España peninsular. Los gastos de envío se calculan según el volumen del pedido.\n\nPara pedidos grandes o eventos, consúltanos en hola@eqclypse.com y te preparamos una propuesta.',
      opts    : [
        { label: '¿Cuánto tarda?', id: 'delivery'     },
        { label: 'Cómo pedir',     id: 'how_to_order' },
        { label: 'Contacto',       id: 'contact'      },
      ],
    },

    /* 13 — Cómo pedir */
    {
      id      : 'how_to_order',
      triggers: ['cómo pido', 'cómo comprar', 'hacer un pedido', 'hacer pedido',
                 'cómo se pide', 'proceso de compra', 'cómo funciona',
                 'quiero comprar', 'quiero pedir', 'whatsapp', 'carrito'],
      reply   : 'Pedir es sencillo:\n\n1. Elige tus botellines o packs en la web.\n2. Añádelos al carrito.\n3. Finaliza el pedido por WhatsApp o email desde el carrito.\n\nNos ponemos en contacto para confirmar y coordinar el pago.',
      opts    : [
        { label: 'Precios',        id: 'price'    },
        { label: 'Envío',          id: 'shipping' },
        { label: 'Contacto',       id: 'contact'  },
      ],
    },

    /* 14 — Contacto */
    {
      id      : 'contact',
      triggers: ['contacto', 'contactar', 'hablar con vosotros', 'email de contacto',
                 'correo electrónico', 'instagram', 'tiktok', 'redes sociales',
                 'teléfono', 'llamar', 'escribiros', 'escribirles'],
      reply   : 'Puedes contactarnos en:\n\n📧 hola@eqclypse.com\n📸 @eqclypse en Instagram\n🎵 @eqclypse en TikTok\n\nPara pedidos, también tenemos WhatsApp desde el carrito de la web.',
      opts    : [
        { label: 'Cómo pedir', id: 'how_to_order' },
        { label: 'Envío',      id: 'shipping'     },
      ],
    },

    /* 15 — El Círculo (DESPUÉS de camara_trigger, sin "exclusivo" ni "acceso") */
    {
      id      : 'circle',
      triggers: ['el círculo', 'círculo', 'newsletter', 'registrarme',
                 'unirme', 'suscribirme', 'drops', 'acceso anticipado',
                 'comunidad', 'club', 'miembro'],
      reply   : 'El Círculo es nuestro club privado. Acceso anticipado a drops, playlists, rutas de bares y planes desbloqueables.\n\nSolo tienes que registrarte en la web. Sin costes.',
      opts    : [
        { label: 'Ver botellines', id: 'varieties' },
        { label: 'Packs',          id: 'packs'     },
        { label: 'Contacto',       id: 'contact'   },
      ],
    },

    /* 16 — Marca / historia */
    {
      id      : 'brand',
      triggers: ['qué es eqclypse', 'qué es', 'quiénes sois', 'quiénes son',
                 'vuestra historia', 'tu historia', 'de qué va', 'cuéntame',
                 'la marca', 'la historia', 'sobre eqclypse', 'por qué eqclypse'],
      reply   : 'EQCLYPSE es vino joven en botellín de 33 cl. Sin protocolo, sin complicaciones.\n\nFormato cerveza, alma vino. Pensado para beber frío, a cualquier hora, con quien quieras. Tinto, Blanco, Rosado y Blanco 0.0.\n\nDEEP. ELEGANT. TIMELESS.',
      opts    : [
        { label: 'Botellines disponibles', id: 'varieties' },
        { label: '¿Qué es el 0.0?',        id: 'zero'      },
        { label: 'Precios',                id: 'price'     },
        { label: 'Packs',                  id: 'packs'     },
      ],
    },

    /* 17 — Agradecimiento */
    {
      id      : 'thanks',
      triggers: ['gracias', 'muchas gracias', 'thank you', 'genial', 'perfecto', 'guay', 'ok gracias'],
      reply   : 'De nada 🙂 ¡Que disfrutes el botellín!',
      opts    : [
        { label: 'Ver botellines', id: 'varieties' },
        { label: 'Packs',          id: 'packs'     },
        { label: 'Contacto',       id: 'contact'   },
      ],
    },

    /* 18 — Fallback */
    {
      id      : 'fallback',
      triggers: [],
      reply   : 'No sé exactamente qué decirte sobre eso. Prueba una de estas opciones o escríbenos a hola@eqclypse.com.',
      opts    : [
        { label: '¿Qué es EQCLYPSE?', id: 'brand'     },
        { label: 'Variedades',         id: 'varieties' },
        { label: 'Precios',            id: 'price'     },
        { label: 'Contacto',           id: 'contact'   },
      ],
    },
  ];

  /* ─── Mapa de intenciones ────────────────────────────────── */

  var INTENT_MAP = {};
  INTENTS.forEach(function (intent) { INTENT_MAP[intent.id] = intent; });

  /* ─── Normalización ──────────────────────────────────────── */

  function normalize(str) {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '') // quitar diacríticos
      .replace(/[^a-z0-9 ]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Comprueba si normText contiene normTrigger.
   * - Frases (>1 palabra): substring directo.
   * - Palabras sueltas: word-boundary (evita "cuanto" en "cuantos").
   */
  function triggerMatches(normText, normTrigger) {
    if (normTrigger.indexOf(' ') !== -1) {
      // frase → substring
      return normText.indexOf(normTrigger) !== -1;
    }
    // palabra sola → word boundary
    return (' ' + normText + ' ').indexOf(' ' + normTrigger + ' ') !== -1;
  }

  function matchIntent(input) {
    var norm = normalize(input);
    for (var i = 0; i < INTENTS.length; i++) {
      var intent = INTENTS[i];
      if (intent.id === 'fallback') continue;
      if (intent.id === 'camara_trigger') continue; // se maneja a mano
      for (var j = 0; j < intent.triggers.length; j++) {
        if (triggerMatches(norm, normalize(intent.triggers[j]))) {
          return intent;
        }
      }
    }
    return INTENT_MAP['fallback'];
  }

  /** Detecta si el texto libre pide la cámara velada */
  function isCamaraTrigger(norm) {
    var triggers = INTENT_MAP['camara_trigger'].triggers;
    for (var i = 0; i < triggers.length; i++) {
      if (triggerMatches(norm, normalize(triggers[i]))) return true;
    }
    return false;
  }

  /* ─── DOM ────────────────────────────────────────────────── */

  var $chat   = document.getElementById('eqChat');
  var $toggle = document.getElementById('eqChatToggle');
  var $panel  = document.getElementById('eqChatPanel');
  var $msgs   = document.getElementById('eqChatMessages');
  var $opts   = document.getElementById('eqChatOptions');
  var $form   = document.getElementById('eqChatForm');
  var $input  = document.getElementById('eqChatInput');
  var $close  = document.getElementById('eqChatClose');
  var $camara = document.getElementById('camaraVelada');

  /* ─── Mensajes ───────────────────────────────────────────── */

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function addMsg(text, type) {
    var el = document.createElement('div');
    el.className = 'eq-msg eq-msg--' + type;
    el.innerHTML = escapeHtml(text).replace(/\n/g, '<br>');
    $msgs.appendChild(el);
    $msgs.scrollTop = $msgs.scrollHeight;
  }

  function botAfterDelay(text, type, optDefs, delay) {
    setTimeout(function () {
      addMsg(text, type || 'bot');
      if (optDefs && optDefs.length) setOptions(optDefs);
    }, delay || TYPING_MS);
  }

  /* ─── Opciones ───────────────────────────────────────────── */
  /*
   * optDefs: array de objetos { label, id? (intent id) | fn? (función directa) }
   * Cuando se hace clic en un botón:
   *   - Si tiene .fn → llama a fn() directamente (para quiz confirm, etc.)
   *   - Si tiene .id → despacha la intención directamente (sin NLP)
   *   - Si solo .label → pasa por NLP normal
   */

  function setOptions(optDefs) {
    $opts.innerHTML = '';
    optDefs.forEach(function (def) {
      var label = typeof def === 'string' ? def : def.label;
      var intentId = (typeof def === 'object' && def.id) ? def.id : null;
      var fn = (typeof def === 'object' && def.fn) ? def.fn : null;

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'eq-opt';
      btn.textContent = label;
      btn.addEventListener('click', function () {
        addMsg(label, 'user');
        $opts.innerHTML = '';
        if (fn) { fn(); return; }
        if (intentId) { dispatchIntent(intentId); return; }
        processText(label); // fallback NLP
      });
      $opts.appendChild(btn);
    });
  }

  /* ─── Despacho directo de intención ─────────────────────── */

  function dispatchIntent(id) {
    var intent = INTENT_MAP[id];
    if (!intent || !intent.reply) return;
    botAfterDelay(intent.reply, 'bot', intent.opts);
  }

  /* ─── Cámara Velada ──────────────────────────────────────── */

  function unlockCamara() {
    S.cameraUnlocked = true;
    localStorage.setItem(STORAGE_KEY, '1');
    if ($camara) {
      $camara.classList.add('is-visible');
      $camara.removeAttribute('aria-hidden');
    }
    $chat.classList.add('is-camara');
  }

  function initCamaraIfUnlocked() {
    if (S.cameraUnlocked && $camara) {
      $camara.classList.add('is-visible');
      $camara.removeAttribute('aria-hidden');
      $chat.classList.add('is-camara');
    }
  }

  function scrollToCamara() {
    if ($camara) $camara.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleCamaraTrigger() {
    if (S.cameraUnlocked) {
      botAfterDelay(
        'La Cámara Velada ya está desbloqueada para ti. Desplázate hacia abajo para verla.',
        'bot',
        [
          { label: 'Ir a La Cámara Velada', fn: function () { scrollToCamara(); } },
          { label: 'Botellines',            id : 'varieties' },
        ]
      );
      setTimeout(scrollToCamara, TYPING_MS + 600);
    } else {
      S.awaitQuizConfirm = true;
      botAfterDelay(
        'La Cámara Velada existe. Pero el acceso no es para cualquiera.\n\nEs un quiz de historia del vino. Cinco preguntas. Necesitas acertar al menos tres.\n\n¿Lo intentas?',
        'bot',
        [
          { label: 'Sí, quiero entrar', fn: function () { startQuiz(); } },
          { label: 'Ahora no',          fn: function () { declineQuiz(); } },
        ]
      );
    }
  }

  function declineQuiz() {
    S.awaitQuizConfirm = false;
    botAfterDelay(
      'Sin problema. Aquí estamos cuando estés lista.',
      'bot',
      [
        { label: '¿Qué es EQCLYPSE?', id: 'brand'    },
        { label: 'Variedades',         id: 'varieties' },
        { label: 'Packs',              id: 'packs'     },
      ]
    );
  }

  /* ─── Quiz ───────────────────────────────────────────────── */

  function startQuiz() {
    S.awaitQuizConfirm = false;
    S.quizActive       = true;
    S.quizIndex        = 0;
    S.quizCorrect      = 0;
    $opts.innerHTML    = '';

    addMsg('🔒 Iniciando protocolo de acceso a La Cámara Velada…', 'system');

    setTimeout(function () {
      addMsg(
        'Cinco preguntas. Al menos tres correctas para entrar. Sin ayudas, sin segundas oportunidades.',
        'quiz'
      );
      setTimeout(showQuizQuestion, 900);
    }, 600);
  }

  function showQuizQuestion() {
    var q      = QUIZ[S.quizIndex];
    var labels = q.opts.map(function (o, i) {
      return String.fromCharCode(65 + i) + '. ' + o;
    });
    addMsg('Pregunta ' + (S.quizIndex + 1) + ' de ' + QUIZ.length + '\n\n' + q.q, 'quiz');

    // Las opciones del quiz disparan handleQuizAnswer directamente
    $opts.innerHTML = '';
    labels.forEach(function (label, idx) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'eq-opt eq-opt--answer';
      btn.textContent = label;
      btn.addEventListener('click', function () {
        handleQuizAnswer(idx);
      });
      $opts.appendChild(btn);
    });
    $msgs.scrollTop = $msgs.scrollHeight;
  }

  function handleQuizAnswer(idx) {
    var q         = QUIZ[S.quizIndex];
    var answerTxt = String.fromCharCode(65 + idx) + '. ' + q.opts[idx];
    var correct   = idx === q.correct;

    addMsg(answerTxt, 'user');
    $opts.innerHTML = '';

    if (correct) {
      S.quizCorrect++;
      addMsg('✓ Correcto.', 'system');
    } else {
      addMsg(
        '✗ Incorrecto. La respuesta era: ' +
        String.fromCharCode(65 + q.correct) + '. ' + q.opts[q.correct],
        'system'
      );
    }

    S.quizIndex++;

    if (S.quizIndex < QUIZ.length) {
      setTimeout(showQuizQuestion, 800);
    } else {
      setTimeout(finishQuiz, 600);
    }
  }

  function finishQuiz() {
    S.quizActive = false;
    var passed   = S.quizCorrect >= 3;

    addMsg('Resultado: ' + S.quizCorrect + '/' + QUIZ.length + ' correctas.', 'system');

    if (passed) {
      setTimeout(function () {
        addMsg('Acceso concedido.\n\nSabes de vino. Bienvenida a La Cámara Velada.', 'quiz');
        unlockCamara();
        setTimeout(function () {
          addMsg('Desplázate hacia abajo para ver lo que no está en ningún otro sitio.', 'bot');
          setOptions([
            { label: 'Ir a La Cámara Velada', fn: function () { scrollToCamara(); } },
            { label: 'Botellines',            id : 'varieties' },
          ]);
          setTimeout(scrollToCamara, 2400);
        }, 1200);
      }, 800);
    } else {
      setTimeout(function () {
        addMsg(
          'Acceso denegado.\n\n' + S.quizCorrect + ' de 5 correctas. Necesitabas al menos 3.\n\nVuelve cuando sepas más de vino.',
          'bot'
        );
        setOptions([
          { label: 'Intentarlo de nuevo', fn: function () { startQuiz(); } },
          { label: '¿Qué es EQCLYPSE?',   id : 'brand'                     },
        ]);
      }, 800);
    }
  }

  /* ─── Texto libre (NLP) ──────────────────────────────────── */

  function processText(input) {
    var norm = normalize(input);

    // ¿Pide la cámara?
    if (isCamaraTrigger(norm)) {
      handleCamaraTrigger();
      return;
    }

    var intent = matchIntent(input);
    botAfterDelay(intent.reply, 'bot', intent.opts);
  }

  /* ─── Entrada del usuario (teclado) ────────────────────────── */

  function handleFormSubmit(raw) {
    if (!raw || !raw.trim()) return;
    var input = raw.trim();

    // Quiz activo: las respuestas ya van por botón; el input libre se ignora amablemente
    if (S.quizActive) {
      addMsg(input, 'user');
      botAfterDelay('Usa los botones de opción para responder el quiz.', 'bot');
      return;
    }

    // Esperando confirmación del quiz: sí / no desde texto libre
    if (S.awaitQuizConfirm) {
      addMsg(input, 'user');
      $opts.innerHTML = '';
      var norm = normalize(input);
      var isYes = norm.indexOf('si') !== -1 || norm.indexOf('quiero') !== -1 ||
                  norm.indexOf('dale') !== -1 || norm.indexOf('ok') !== -1 ||
                  norm.indexOf('claro') !== -1 || norm.indexOf('va') !== -1;
      if (isYes) {
        S.awaitQuizConfirm = false;
        setTimeout(startQuiz, 400);
      } else {
        S.awaitQuizConfirm = false;
        declineQuiz();
      }
      return;
    }

    addMsg(input, 'user');
    $opts.innerHTML = '';
    processText(input);
  }

  /* ─── Apertura / cierre ──────────────────────────────────── */

  function openChat() {
    S.open = true;
    $chat.classList.add('is-open');
    $panel.classList.add('is-open');
    $panel.removeAttribute('aria-hidden');
    $toggle.setAttribute('aria-expanded', 'true');
    setTimeout(function () { $input.focus(); }, 60);
    if ($msgs.children.length === 0) greet();
  }

  function closeChat() {
    S.open = false;
    $chat.classList.remove('is-open');
    $panel.classList.remove('is-open');
    $panel.setAttribute('aria-hidden', 'true');
    $toggle.setAttribute('aria-expanded', 'false');
    $toggle.focus();
  }

  function greet() {
    var msg  = S.cameraUnlocked
      ? 'La Cámara Velada está desbloqueada para ti. ¿Qué necesitas?'
      : '¡Bienvenida a EQCLYPSE! Soy tu asistente. Pregúntame lo que quieras sobre los botellines, los packs o el envío.';

    var opts = S.cameraUnlocked
      ? [
          { label: 'Ir a La Cámara Velada', fn: function () { scrollToCamara(); } },
          { label: 'Botellines disponibles', id: 'varieties' },
          { label: 'Precios y packs',        id: 'price'     },
          { label: 'Contacto',               id: 'contact'   },
        ]
      : [
          { label: '¿Qué es EQCLYPSE?',     id: 'brand'    },
          { label: 'Botellines disponibles', id: 'varieties' },
          { label: 'Precios y packs',        id: 'price'     },
          { label: 'Envío y entrega',        id: 'shipping'  },
        ];

    botAfterDelay(msg, 'bot', opts, 320);
  }

  /* ─── Eventos ────────────────────────────────────────────── */

  $toggle.addEventListener('click', function () {
    if (S.open) closeChat(); else openChat();
  });

  $close.addEventListener('click', closeChat);

  $form.addEventListener('submit', function (e) {
    e.preventDefault();
    var val = $input.value;
    $input.value = '';
    handleFormSubmit(val);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && S.open) closeChat();
  });

  /* ─── Init ───────────────────────────────────────────────── */

  initCamaraIfUnlocked();

})();
