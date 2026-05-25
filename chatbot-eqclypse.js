/**
 * chatbot-eqclypse.js
 * Chatbot local EQCLYPSE — sin APIs externas, sin dependencias.
 * Funciona enteramente en el navegador con keyword matching.
 */
(function () {
  'use strict';

  /* ─── Constantes ─────────────────────────────────────────── */

  var STORAGE_KEY = 'eqclypse_camara_v1';
  var TYPING_DELAY = 680; // ms antes de mostrar respuesta del bot

  /* ─── Estado ─────────────────────────────────────────────── */

  var state = {
    open: false,
    cameraUnlocked: localStorage.getItem(STORAGE_KEY) === '1',
    quizActive: false,
    quizIndex: 0,
    quizCorrect: 0,
    camaraMode: false,
  };

  /* ─── Quiz ───────────────────────────────────────────────── */

  var QUIZ = [
    {
      q: '¿En qué país se elaboró el vino más antiguo conocido, con más de 8.000 años de historia?',
      opts: ['Georgia', 'Egipto', 'Mesopotamia', 'China'],
      correct: 0,
    },
    {
      q: '¿Cómo se llama el proceso enológico que convierte el ácido málico en ácido láctico, suavizando la acidez de los vinos?',
      opts: ['Fermentación maloláctica', 'Maceración carbónica', 'Crianza sur lies', 'Remontado'],
      correct: 0,
    },
    {
      q: '¿Qué plaga de insecto, originaria de Norteamérica, devastó los viñedos europeos en la segunda mitad del siglo XIX?',
      opts: ['La filoxera', 'El oídio', 'La botrytis', 'El mildiu'],
      correct: 0,
    },
    {
      q: '¿Cómo se denomina el método de elaboración del Champagne donde la segunda fermentación ocurre dentro de la propia botella?',
      opts: ['Méthode champenoise', 'Método Charmat', 'Método ancestral', 'Método continuo'],
      correct: 0,
    },
    {
      q: '¿Quién demostró científicamente en el siglo XIX que la fermentación alcohólica es causada por las levaduras?',
      opts: ['Louis Pasteur', 'Antoine Lavoisier', 'Alexander Fleming', 'Justus von Liebig'],
      correct: 0,
    },
  ];

  /* ─── Intenciones / FAQ ──────────────────────────────────── */

  var INTENTS = [
    {
      id: 'greeting',
      triggers: ['hola', 'buenas', 'hey', 'qué tal', 'saludos', 'buenos días', 'buenas tardes', 'buenas noches', 'hi'],
      reply: '¡Hola! Soy el chatbot de EQCLYPSE. ¿En qué puedo ayudarte?',
      opts: ['¿Qué es EQCLYPSE?', 'Botellines y variedades', 'Precios y packs', 'Envío y entrega'],
    },
    {
      id: 'brand',
      triggers: ['qué es eqclypse', 'qué es', 'quiénes sois', 'quiénes son', 'vuestra historia', 'tu historia', 'de qué va', 'cuéntame', 'la marca', 'la historia'],
      reply:
        'EQCLYPSE es vino joven en botellín de 33 cl. Sin protocolo, sin complicaciones.\n\nFormato cerveza, alma vino. Pensado para beber frío, a cualquier hora, con quien quieras. Tinto, Blanco, Rosado y Blanco 0.0.\n\nDEEP. ELEGANT. TIMELESS.',
      opts: ['Variedades disponibles', '¿Qué es el 0.0?', 'Precios', 'Packs'],
    },
    {
      id: 'varieties',
      triggers: ['variedades', 'tipos', 'cuáles tenéis', 'qué vinos', 'qué botellines', 'tinto', 'blanco', 'rosado', 'gama', 'referencias'],
      reply:
        'Tenemos cuatro referencias:\n\n🍷 Tinto — Joven, oscuro y directo.\n🥂 Blanco — Frío, limpio y ligero.\n🌸 Rosado — La hora dorada en botellín.\n⭕ Blanco 0.0 — Todo el gesto, cero alcohol.\n\nTodos en formato 33 cl. Pensados para beber fríos.',
      opts: ['¿Qué temperatura?', '¿Con qué los combino?', '¿Qué es el 0.0?', 'Precios'],
    },
    {
      id: 'zero',
      triggers: ['0.0', 'sin alcohol', 'no alcohol', 'zero', 'sin alcoholemia', 'conducir', 'embarazo', 'embarazada', 'blanco 0', 'semidulce'],
      reply:
        'El Blanco 0.0 de EQCLYPSE es vino blanco semidulce dealcoholizado. Tiene el mismo carácter que nuestro blanco, pero sin ni rastro de alcohol.\n\nPerfecto para conducir, para quienes no quieren alcohol o simplemente para cuando no apetece. Mismo formato 33 cl, mismo protocolo (ninguno).',
      opts: ['¿Con qué lo combino?', 'Ver todos los botellines', 'Precios'],
    },
    {
      id: 'price',
      triggers: ['precio', 'cuánto cuesta', 'cuánto vale', 'caro', 'barato', 'coste', 'cuánto', 'tarifa', '€', 'euro'],
      reply:
        'Cada botellín cuesta 2,80 €. Pequeño formato, precio justo.\n\nLos packs tienen su propio precio según unidades e incluyen mezcla de variedades. Para pedidos personalizados o packs grandes, escríbenos a hola@eqclypse.com.',
      opts: ['¿Qué packs hay?', 'Cómo pedir', 'Envío'],
    },
    {
      id: 'packs',
      triggers: ['pack', 'packs', 'lote', 'caja', 'mixto', 'surtido', 'varios', 'previa', 'terraza', 'golden hour', 'cena', 'urban night'],
      reply:
        'Tenemos packs por momento:\n\n🌃 Urban Night — 12 botellines para previa.\n☀️ Golden Hour — Mix rosado + blanco.\n🍽️ Cena Improvisada — Mix tinto + blanco.\n🏙️ Pack Ciudad — Surtido mixto.\n\nCada pack está pensado para una ocasión concreta. ¿Cuál suena a tu plan?',
      opts: ['Precios de los packs', 'Cómo pedir', 'Envío y entrega'],
    },
    {
      id: 'shipping',
      triggers: ['envío', 'enviar', 'mando', 'envíais', 'llega', 'llegáis', 'gastos de envío', 'portes', 'transporte', 'mensajería'],
      reply:
        'Enviamos a toda España peninsular. Los gastos de envío se calculan según el volumen del pedido.\n\nPara pedidos grandes o eventos, consúltanos directamente a hola@eqclypse.com y te preparamos una propuesta.',
      opts: ['¿Cuánto tarda?', 'Cómo pedir', 'Contacto'],
    },
    {
      id: 'delivery',
      triggers: ['cuánto tarda', 'plazo', 'tiempo de entrega', 'días', 'cuántos días', 'rápido', 'urgente', '24h', '48h', 'mañana'],
      reply:
        'El tiempo de entrega habitual es de 2 a 4 días laborables para España peninsular.\n\nSi necesitas algo urgente para un evento, escríbenos con antelación a hola@eqclypse.com y lo intentamos.',
      opts: ['Gastos de envío', 'Cómo pedir', 'Contacto'],
    },
    {
      id: 'how_to_order',
      triggers: ['cómo pido', 'cómo comprar', 'hacer pedido', 'comprar', 'pedir', 'cómo funciona', 'whatsapp', 'email'],
      reply:
        'Puedes pedir desde la propia web:\n\n1. Elige tus botellines o packs.\n2. Añádelos al carrito.\n3. Haz el pedido por WhatsApp o email desde el carrito.\n\nNos ponemos en contacto contigo para confirmar y coordinar el pago.',
      opts: ['Precios', 'Envío', 'Contacto'],
    },
    {
      id: 'alcohol',
      triggers: ['alcohol', 'graduación', 'grados', 'porcentaje', 'abv', 'cuánto alcohol', 'grado alcohólico'],
      reply:
        'Los botellines EQCLYPSE tienen una graduación de entre 11,5° y 12,5° según la variedad, típica de vinos jóvenes.\n\nEl Blanco 0.0 tiene graduación 0,0% — sin alcohol de ningún tipo.',
      opts: ['¿Qué es el 0.0?', 'Variedades', 'Temperatura de servicio'],
    },
    {
      id: 'temperature',
      triggers: ['temperatura', 'frío', 'frigorífico', 'nevera', 'cómo servir', 'cuánto enfriar', 'grados', 'servicio'],
      reply:
        'EQCLYPSE está pensado para beberse frío:\n\n• Blanco y Rosado: entre 6 y 10 °C.\n• Tinto: entre 10 y 14 °C.\n• 0.0: bien frío, entre 4 y 8 °C.\n\nDeja el botellín en la nevera al menos 2 horas antes. No necesitas enfriadera ni protocolo.',
      opts: ['Maridajes', 'Variedades', 'Packs'],
    },
    {
      id: 'pairing',
      triggers: ['maridaje', 'maridajes', 'con qué', 'combinar', 'comida', 'comer', 'tapa', 'tapas', 'aperitivo', 'cena', 'queso', 'jamón', 'embutido', 'pasta', 'pizza'],
      reply:
        'EQCLYPSE no necesita protocolo, pero si quieres ideas:\n\n🍷 Tinto — Embutidos, quesos curados, pasta.\n🥂 Blanco — Pescado, mariscos, ensaladas, sushi.\n🌸 Rosado — Aperitivos, tapas, pizzas ligeras.\n⭕ 0.0 — Todo lo anterior sin alcohol.\n\nLa regla real: lo que te apetezca con lo que tengas.',
      opts: ['Temperatura de servicio', 'Variedades', 'Packs por momento'],
    },
    {
      id: 'vintage',
      triggers: ['añada', 'vintage', 'año', 'cosecha', 'cuándo se hizo', 'de qué año', 'joven', 'crianza', 'reserva'],
      reply:
        'Los botellines EQCLYPSE son vinos jóvenes, pensados para beber en el año. Sin crianza larga, sin años de espera.\n\nEso es parte de la idea: frescura inmediata, sin complicarte la vida con añadas. Frío y listo.',
      opts: ['Graduación alcohólica', 'Variedades', 'Temperatura'],
    },
    {
      id: 'contact',
      triggers: ['contacto', 'contactar', 'hablar', 'escribir', 'correo', 'email', 'instagram', 'tiktok', 'rrss', 'redes', 'teléfono', 'llamar'],
      reply:
        'Puedes contactarnos en:\n\n📧 hola@eqclypse.com\n📸 @eqclypse en Instagram\n🎵 @eqclypse en TikTok\n\nEstamos por WhatsApp para pedidos directamente desde el carrito de la web.',
      opts: ['Cómo pedir', 'Envío', 'Volver al inicio'],
    },
    {
      id: 'circle',
      triggers: ['círculo', 'el círculo', 'circle', 'newsletter', 'registro', 'registrarme', 'acceso', 'drops', 'exclusivo', 'descuentos'],
      reply:
        'El Círculo es nuestro club privado. Acceso anticipado a drops, playlists, rutas de bares y planes desbloqueables.\n\nSolo tienes que registrarte en la web. Sin costes ni compromisos.',
      opts: ['Ver botellines', 'Packs', 'Contacto'],
    },
    {
      id: 'camara_trigger',
      triggers: [
        'cámara', 'camara', 'cámara velada', 'camara velada', 'secreto', 'acceso oculto',
        'sección secreta', 'exclusivo', 'mostrame lo que no se ve', 'lo que no se ve',
        'zona vip', 'zona secreta', 'hay algo más', 'qué más tenéis', 'zona exclusiva',
      ],
      reply: null, // manejado especialmente
      opts: [],
    },
    {
      id: 'thanks',
      triggers: ['gracias', 'thank you', 'ok gracias', 'perfecto gracias', 'muchas gracias', 'genial', 'guay', 'perfecto', 'ok', 'vale'],
      reply: 'De nada 🙂 Si tienes más dudas, aquí estoy. ¡Que disfrutes el botellín!',
      opts: ['Botellines', 'Packs', 'Contacto'],
    },
    {
      id: 'fallback',
      triggers: [],
      reply:
        'Hmm, no sé exactamente qué decirte sobre eso. Prueba con una de estas opciones o escríbenos directamente a hola@eqclypse.com.',
      opts: ['¿Qué es EQCLYPSE?', 'Variedades', 'Precios', 'Contacto'],
    },
  ];

  /* ─── Normalización ──────────────────────────────────────── */

  function normalize(str) {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9 ]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function matchIntent(input) {
    var norm = normalize(input);
    for (var i = 0; i < INTENTS.length; i++) {
      var intent = INTENTS[i];
      if (intent.id === 'fallback') continue;
      for (var j = 0; j < intent.triggers.length; j++) {
        if (norm.indexOf(normalize(intent.triggers[j])) !== -1) {
          return intent;
        }
      }
    }
    return INTENTS[INTENTS.length - 1]; // fallback
  }

  /* ─── DOM helpers ────────────────────────────────────────── */

  var $chat    = document.getElementById('eqChat');
  var $toggle  = document.getElementById('eqChatToggle');
  var $panel   = document.getElementById('eqChatPanel');
  var $msgs    = document.getElementById('eqChatMessages');
  var $opts    = document.getElementById('eqChatOptions');
  var $form    = document.getElementById('eqChatForm');
  var $input   = document.getElementById('eqChatInput');
  var $close   = document.getElementById('eqChatClose');
  var $camara  = document.getElementById('camaraVelada');

  function scrollToBottom() {
    $msgs.scrollTop = $msgs.scrollHeight;
  }

  function addMessage(text, type) {
    var el = document.createElement('div');
    el.className = 'eq-msg eq-msg--' + type;
    // Convert newlines to <br>
    el.innerHTML = escapeHtml(text).replace(/\n/g, '<br>');
    $msgs.appendChild(el);
    scrollToBottom();
    return el;
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function clearOptions() {
    $opts.innerHTML = '';
  }

  function addOptions(options, variant) {
    clearOptions();
    options.forEach(function (label) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'eq-opt' + (variant ? ' eq-opt--' + variant : '');
      btn.textContent = label;
      btn.addEventListener('click', function () {
        handleUserInput(label);
      });
      $opts.appendChild(btn);
    });
  }

  function typingThenBot(text, type, opts, delay) {
    delay = delay || TYPING_DELAY;
    setTimeout(function () {
      addMessage(text, type || 'bot');
      if (opts && opts.length) {
        addOptions(opts);
      }
    }, delay);
  }

  /* ─── Cámara Velada ──────────────────────────────────────── */

  function unlockCamara() {
    state.cameraUnlocked = true;
    localStorage.setItem(STORAGE_KEY, '1');
    if ($camara) {
      $camara.classList.add('is-visible');
      $camara.removeAttribute('aria-hidden');
    }
    $chat.classList.add('is-camara');
  }

  function showCamaraIfUnlocked() {
    if (state.cameraUnlocked && $camara) {
      $camara.classList.add('is-visible');
      $camara.removeAttribute('aria-hidden');
      $chat.classList.add('is-camara');
    }
  }

  function scrollToCamara() {
    if ($camara) {
      $camara.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /* ─── Quiz ───────────────────────────────────────────────── */

  function startQuiz() {
    state.quizActive = true;
    state.quizIndex = 0;
    state.quizCorrect = 0;
    clearOptions();
    addMessage('🔒 Iniciando protocolo de acceso a La Cámara Velada…', 'system');
    setTimeout(function () {
      addMessage(
        'Cinco preguntas. Debes acertar al menos tres para entrar. No hay ayudas, no hay segundas oportunidades.\n\n¿Preparada?',
        'quiz'
      );
      setTimeout(function () {
        showQuizQuestion();
      }, 900);
    }, 600);
  }

  function showQuizQuestion() {
    var q = QUIZ[state.quizIndex];
    addMessage(
      'Pregunta ' + (state.quizIndex + 1) + ' de ' + QUIZ.length + '\n\n' + q.q,
      'quiz'
    );
    var labels = q.opts.map(function (o, i) { return String.fromCharCode(65 + i) + '. ' + o; });
    addOptions(labels, 'answer');
    scrollToBottom();
  }

  function handleQuizAnswer(label) {
    // Extract letter (A, B, C, D)
    var letter = label.charAt(0).toUpperCase();
    var idx = letter.charCodeAt(0) - 65;
    var q = QUIZ[state.quizIndex];
    var isCorrect = idx === q.correct;

    addMessage(label, 'user');
    clearOptions();

    if (isCorrect) {
      state.quizCorrect++;
      addMessage('✓ Correcto.', 'system');
    } else {
      addMessage('✗ Incorrecto. La respuesta era: ' + String.fromCharCode(65 + q.correct) + '. ' + q.opts[q.correct], 'system');
    }

    state.quizIndex++;

    if (state.quizIndex < QUIZ.length) {
      setTimeout(showQuizQuestion, 800);
    } else {
      setTimeout(finishQuiz, 600);
    }
  }

  function finishQuiz() {
    state.quizActive = false;
    var passed = state.quizCorrect >= 3;

    addMessage(
      'Resultado: ' + state.quizCorrect + '/' + QUIZ.length + ' correctas.',
      'system'
    );

    if (passed) {
      setTimeout(function () {
        addMessage(
          'Acceso concedido.\n\nSabes de vino. Bienvenida a La Cámara Velada.',
          'quiz'
        );
        unlockCamara();
        setTimeout(function () {
          addMessage('Desplázate hacia abajo para descubrir lo que no está en ningún otro sitio.', 'bot');
          addOptions(['Ver La Cámara Velada']);
          setTimeout(scrollToCamara, 2000);
        }, 1200);
      }, 800);
    } else {
      setTimeout(function () {
        addMessage(
          'Acceso denegado.\n\n' + state.quizCorrect + ' de 5 correctas. Necesitabas al menos 3.\n\nVuelve cuando sepas más de vino.',
          'bot'
        );
        addOptions(['Intentarlo de nuevo', 'Volver al inicio']);
      }, 800);
    }
  }

  /* ─── Lógica principal ───────────────────────────────────── */

  function handleUserInput(input) {
    if (!input || !input.trim()) return;

    // Si el quiz está activo, derivamos al manejador del quiz
    if (state.quizActive) {
      handleQuizAnswer(input.trim());
      return;
    }

    addMessage(input.trim(), 'user');
    clearOptions();

    var norm = normalize(input);

    // Atajos de opciones globales
    if (norm === normalize('Ver La Cámara Velada') || norm === normalize('ver la camara velada')) {
      scrollToCamara();
      typingThenBot('Ahí está. Solo para quienes saben.', 'bot', ['Botellines', 'Contacto']);
      return;
    }
    if (norm === normalize('Volver al inicio') || norm === normalize('volver al inicio')) {
      typingThenBot(
        '¿En qué más puedo ayudarte?',
        'bot',
        ['¿Qué es EQCLYPSE?', 'Botellines y variedades', 'Precios y packs', 'Envío y entrega']
      );
      return;
    }
    if (norm === normalize('Intentarlo de nuevo') || norm === normalize('intentarlo de nuevo')) {
      typingThenBot(
        'Estudia bien y vuelve cuando estés lista.',
        'bot',
        ['¿Qué es EQCLYPSE?', 'Variedades', 'Packs', 'Contacto']
      );
      return;
    }

    var intent = matchIntent(input);

    // Caso especial: cámara velada
    if (intent.id === 'camara_trigger') {
      if (state.cameraUnlocked) {
        typingThenBot(
          'La Cámara Velada ya está desbloqueada. Desplázate hacia abajo para verla.',
          'bot',
          ['Ver La Cámara Velada', 'Botellines', 'Packs']
        );
        setTimeout(scrollToCamara, TYPING_DELAY + 400);
      } else {
        typingThenBot(
          'La Cámara Velada existe. Pero el acceso no es para cualquiera.\n\nEs un quiz de historia del vino. Cinco preguntas. Necesitas acertar al menos tres.\n\n¿Lo intentas?',
          'bot',
          ['Sí, quiero el acceso', 'No, mejor otro día']
        );
      }
      return;
    }

    // Quiz trigger desde opción
    if (
      norm === normalize('Sí, quiero el acceso') ||
      norm === normalize('si quiero el acceso') ||
      norm.indexOf('quiero el acceso') !== -1 ||
      norm.indexOf('intentar') !== -1 && norm.indexOf('acceso') !== -1
    ) {
      setTimeout(startQuiz, TYPING_DELAY);
      return;
    }

    if (norm === normalize('No, mejor otro día') || norm.indexOf('otro dia') !== -1) {
      typingThenBot(
        'Sin problema. Aquí estamos cuando quieras.',
        'bot',
        ['¿Qué es EQCLYPSE?', 'Variedades', 'Packs', 'Contacto']
      );
      return;
    }

    // Respuesta estándar
    typingThenBot(intent.reply, 'bot', intent.opts);
  }

  /* ─── Apertura / cierre ──────────────────────────────────── */

  function openChat() {
    state.open = true;
    $chat.classList.add('is-open');
    $panel.classList.add('is-open');
    $panel.removeAttribute('aria-hidden');
    $toggle.setAttribute('aria-expanded', 'true');
    $input.focus();

    if ($msgs.children.length === 0) {
      greet();
    }
  }

  function closeChat() {
    state.open = false;
    $chat.classList.remove('is-open');
    $panel.classList.remove('is-open');
    $panel.setAttribute('aria-hidden', 'true');
    $toggle.setAttribute('aria-expanded', 'false');
    $toggle.focus();
  }

  function greet() {
    var greetMsg = state.cameraUnlocked
      ? 'La Cámara Velada está desbloqueada para ti. ¿Qué necesitas?'
      : '¡Bienvenida a EQCLYPSE! Soy tu asistente. Pregúntame lo que quieras sobre los botellines, los packs o el envío.';

    var greetOpts = state.cameraUnlocked
      ? ['Ver La Cámara Velada', 'Botellines y variedades', 'Precios y packs', 'Contacto']
      : ['¿Qué es EQCLYPSE?', 'Botellines y variedades', 'Precios y packs', 'Envío y entrega'];

    typingThenBot(greetMsg, 'bot', greetOpts, 300);
  }

  /* ─── Eventos ────────────────────────────────────────────── */

  $toggle.addEventListener('click', function () {
    if (state.open) {
      closeChat();
    } else {
      openChat();
    }
  });

  $close.addEventListener('click', closeChat);

  $form.addEventListener('submit', function (e) {
    e.preventDefault();
    var val = $input.value.trim();
    $input.value = '';
    if (val) {
      handleUserInput(val);
    }
  });

  // Cerrar con Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && state.open) {
      closeChat();
    }
  });

  /* ─── Init ───────────────────────────────────────────────── */

  showCamaraIfUnlocked();
})();
