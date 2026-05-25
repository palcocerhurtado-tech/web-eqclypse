/**
 * chatbot-eqclypse.js — v3
 * Arquitectura: switch directo, sin INTENT_MAP dinámico.
 * Los botones de opción despachan por ID, inmune a NLP.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'eqclypse_camara_v1';
  var DELAY = 580;

  /* ─── Estado ─────────────────────────────────────────────── */
  var S = {
    open           : false,
    cameraUnlocked : localStorage.getItem(STORAGE_KEY) === '1',
    awaitQuiz      : false,
    quizActive     : false,
    quizIndex      : 0,
    quizCorrect    : 0,
  };

  /* ─── Respuestas hardcodeadas ─────────────────────────────── */
  function getResponse(id) {
    switch (id) {

      case 'greeting':
        return {
          text: '¡Hola! Soy el asistente de EQCLYPSE. ¿En qué puedo ayudarte?',
          opts: [
            { label: '¿Qué es EQCLYPSE?',      id: 'brand'          },
            { label: 'Botellines y variedades', id: 'varieties'      },
            { label: 'Precios y packs',         id: 'price'          },
            { label: 'Envío y entrega',         id: 'shipping'       },
            { label: '🔒 Acceso exclusivo',     id: 'camara_trigger' },
          ],
        };

      case 'brand':
        return {
          text: 'EQCLYPSE es vino joven en botellín de 33 cl. Sin protocolo, sin complicaciones.\n\nFormato cerveza, alma vino. Pensado para beber frío, a cualquier hora, con quien quieras. Tinto, Blanco, Rosado y Blanco 0.0.\n\nDEEP. ELEGANT. TIMELESS.',
          opts: [
            { label: 'Botellines y variedades', id: 'varieties' },
            { label: '¿Qué es el 0.0?',         id: 'zero'      },
            { label: 'Precios',                 id: 'price'     },
          ],
        };

      case 'varieties':
        return {
          text: 'Tenemos cuatro referencias:\n\n🍷 Tinto — Joven, oscuro y directo.\n🥂 Blanco — Frío, limpio y ligero.\n🌸 Rosado — La hora dorada en botellín.\n⭕ Blanco 0.0 — Todo el gesto, cero alcohol.\n\nTodos en formato 33 cl. Pensados para beber fríos.',
          opts: [
            { label: 'Temperatura de servicio', id: 'temperature' },
            { label: 'Maridajes',               id: 'pairing'     },
            { label: '¿Qué es el 0.0?',         id: 'zero'        },
            { label: 'Precios',                 id: 'price'       },
          ],
        };

      case 'zero':
        return {
          text: 'El Blanco 0.0 de EQCLYPSE es vino blanco semidulce dealcoholizado. Tiene el mismo carácter que nuestro blanco, pero sin ni rastro de alcohol.\n\nPerfecto para conducir, para quienes no quieren alcohol o simplemente para cuando no apetece. Mismo formato 33 cl, sin protocolo.',
          opts: [
            { label: 'Maridajes',          id: 'pairing'   },
            { label: 'Ver todos los vinos', id: 'varieties' },
            { label: 'Precios',            id: 'price'     },
          ],
        };

      case 'price':
        return {
          text: 'Cada botellín cuesta 2,80 €. Pequeño formato, precio justo.\n\nLos packs tienen su propio precio según unidades e incluyen mezcla de variedades. Para pedidos personalizados escríbenos a hola@eqclypse.com.',
          opts: [
            { label: '¿Qué packs hay?', id: 'packs'        },
            { label: 'Cómo pedir',      id: 'how_to_order' },
            { label: 'Envío',           id: 'shipping'     },
          ],
        };

      case 'packs':
        return {
          text: 'Tenemos packs por momento:\n\n🌃 Urban Night — 12 botellines para previa.\n☀️ Golden Hour — Mix rosado + blanco.\n🍽️ Cena Improvisada — Mix tinto + blanco.\n🏙️ Pack Ciudad — Surtido mixto.\n\nCada pack pensado para una ocasión concreta.',
          opts: [
            { label: 'Precios',        id: 'price'        },
            { label: 'Cómo pedir',     id: 'how_to_order' },
            { label: 'Envío',          id: 'shipping'     },
          ],
        };

      case 'shipping':
        return {
          text: 'Enviamos a toda España peninsular. Los gastos de envío se calculan según el volumen del pedido.\n\nPara pedidos grandes o eventos, consúltanos en hola@eqclypse.com.',
          opts: [
            { label: '¿Cuánto tarda?', id: 'delivery'     },
            { label: 'Cómo pedir',     id: 'how_to_order' },
            { label: 'Contacto',       id: 'contact'      },
          ],
        };

      case 'delivery':
        return {
          text: 'El tiempo de entrega habitual es de 2 a 4 días laborables para España peninsular.\n\nSi necesitas algo urgente para un evento, escríbenos con antelación a hola@eqclypse.com.',
          opts: [
            { label: 'Gastos de envío', id: 'shipping'     },
            { label: 'Cómo pedir',      id: 'how_to_order' },
            { label: 'Contacto',        id: 'contact'      },
          ],
        };

      case 'how_to_order':
        return {
          text: 'Pedir es sencillo:\n\n1. Elige tus botellines o packs en la web.\n2. Añádelos al carrito.\n3. Finaliza el pedido por WhatsApp o email desde el carrito.\n\nNos ponemos en contacto para confirmar y coordinar el pago.',
          opts: [
            { label: 'Precios',  id: 'price'    },
            { label: 'Envío',    id: 'shipping' },
            { label: 'Contacto', id: 'contact'  },
          ],
        };

      case 'temperature':
        return {
          text: 'EQCLYPSE está pensado para beberse frío:\n\n• Blanco y Rosado: entre 6 y 10 °C.\n• Tinto: entre 10 y 14 °C.\n• 0.0: bien frío, entre 4 y 8 °C.\n\nDeja el botellín en la nevera al menos 2 horas antes. Sin enfriadera, sin protocolo.',
          opts: [
            { label: 'Maridajes',               id: 'pairing'   },
            { label: 'Botellines y variedades', id: 'varieties' },
          ],
        };

      case 'pairing':
        return {
          text: 'EQCLYPSE no necesita protocolo, pero si quieres ideas:\n\n🍷 Tinto — Embutidos, quesos curados, pasta.\n🥂 Blanco — Pescado, mariscos, ensaladas, sushi.\n🌸 Rosado — Aperitivos, tapas, pizzas ligeras.\n⭕ 0.0 — Todo lo anterior sin alcohol.\n\nLa regla real: lo que te apetezca con lo que tengas.',
          opts: [
            { label: 'Temperatura de servicio', id: 'temperature' },
            { label: 'Botellines y variedades', id: 'varieties'   },
          ],
        };

      case 'alcohol':
        return {
          text: 'Los botellines EQCLYPSE tienen una graduación de entre 11,5° y 12,5° según la variedad, típica de vinos jóvenes.\n\nEl Blanco 0.0 tiene graduación 0,0% — sin alcohol.',
          opts: [
            { label: '¿Qué es el 0.0?',         id: 'zero'        },
            { label: 'Temperatura de servicio', id: 'temperature' },
          ],
        };

      case 'vintage':
        return {
          text: 'Los botellines EQCLYPSE son vinos jóvenes, pensados para beber en el año. Sin crianza larga, sin años de espera.\n\nFrescura inmediata. Frío y listo.',
          opts: [
            { label: 'Graduación alcohólica',   id: 'alcohol'     },
            { label: 'Temperatura de servicio', id: 'temperature' },
          ],
        };

      case 'contact':
        return {
          text: 'Puedes contactarnos en:\n\n📧 hola@eqclypse.com\n📸 @eqclypse en Instagram\n🎵 @eqclypse en TikTok\n\nPara pedidos también tenemos WhatsApp desde el carrito de la web.',
          opts: [
            { label: 'Cómo pedir', id: 'how_to_order' },
            { label: 'Envío',      id: 'shipping'     },
          ],
        };

      case 'circle':
        return {
          text: 'El Círculo es nuestro club privado. Acceso anticipado a drops, playlists, rutas de bares y planes desbloqueables.\n\nSolo tienes que registrarte en la web. Sin costes.',
          opts: [
            { label: 'Botellines y variedades', id: 'varieties' },
            { label: 'Contacto',               id: 'contact'   },
          ],
        };

      case 'camara_trigger':
        return null; // se maneja por lógica propia

      default:
        return {
          text: 'No sé exactamente qué decirte sobre eso. Prueba una de estas opciones o escríbenos a hola@eqclypse.com.',
          opts: [
            { label: '¿Qué es EQCLYPSE?',      id: 'brand'     },
            { label: 'Botellines y variedades', id: 'varieties' },
            { label: 'Precios',                 id: 'price'     },
            { label: 'Contacto',                id: 'contact'   },
          ],
        };
    }
  }

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
      q      : '¿Cómo se denomina el método del Champagne donde la segunda fermentación ocurre dentro de la propia botella?',
      opts   : ['Méthode champenoise', 'Método Charmat', 'Método ancestral', 'Método continuo'],
      correct: 0,
    },
    {
      q      : '¿Quién demostró científicamente en el siglo XIX que la fermentación alcohólica es causada por las levaduras?',
      opts   : ['Louis Pasteur', 'Antoine Lavoisier', 'Alexander Fleming', 'Justus von Liebig'],
      correct: 0,
    },
  ];

  /* ─── NLP keywords → intent id ───────────────────────────── */
  var NLP = [
    { words: ['hola', 'hey', 'buenas', 'saludos'],                       id: 'greeting'      },
    { words: ['cámara', 'camara', 'zona secreta', 'acceso oculto',
              'zona vip', 'sección exclusiva', 'zona exclusiva'],         id: 'camara_trigger'},
    { words: ['0.0', 'sin alcohol', 'cero alcohol', 'dealcoholizado',
              'conducir', 'semidulce'],                                   id: 'zero'          },
    { words: ['variedades', 'qué vinos', 'tinto', 'blanco', 'rosado',
              'botellines disponibles', 'referencias'],                   id: 'varieties'     },
    { words: ['graduación', 'cuántos grados', 'grado alcohólico',
              'cuánto alcohol tiene'],                                    id: 'alcohol'       },
    { words: ['temperatura', 'cómo servir', 'nevera', 'cuánto enfriar',
              'temperatura de servicio'],                                 id: 'temperature'   },
    { words: ['maridaje', 'con qué', 'combinar', 'queso', 'jamón',
              'marisco', 'pescado', 'aperitivo', 'tapas'],                id: 'pairing'       },
    { words: ['añada', 'cosecha', 'de qué año', 'crianza', 'reserva'],   id: 'vintage'       },
    { words: ['precio', 'cuánto cuesta', 'cuánto vale', 'qué precio',
              'cuánto es', 'tarifa', 'precios'],                          id: 'price'         },
    { words: ['pack', 'packs', 'lote', 'urban night', 'golden hour'],    id: 'packs'         },
    { words: ['cuánto tarda', 'tiempo de entrega', 'plazo',
              'cuántos días tarda', 'cuándo llega'],                      id: 'delivery'      },
    { words: ['envío', 'enviáis', 'gastos de envío', 'portes',
              'dónde enviáis'],                                           id: 'shipping'      },
    { words: ['cómo pido', 'cómo comprar', 'hacer pedido', 'whatsapp',
              'carrito', 'quiero comprar', 'quiero pedir'],               id: 'how_to_order'  },
    { words: ['contacto', 'instagram', 'tiktok', 'email de contacto',
              'escribiros'],                                              id: 'contact'       },
    { words: ['el círculo', 'círculo', 'newsletter', 'registrarme',
              'drops', 'comunidad'],                                      id: 'circle'        },
    { words: ['qué es eqclypse', 'vuestra historia', 'la marca',
              'sobre eqclypse', 'quiénes sois', 'de qué va'],             id: 'brand'         },
    { words: ['gracias', 'muchas gracias', 'genial', 'perfecto', 'guay'],id: 'thanks'        },
  ];

  function normalize(str) {
    return str.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function matchNLP(input) {
    var norm = normalize(input);
    for (var i = 0; i < NLP.length; i++) {
      var rule = NLP[i];
      for (var j = 0; j < rule.words.length; j++) {
        var kw = normalize(rule.words[j]);
        var hit = kw.indexOf(' ') !== -1
          ? norm.indexOf(kw) !== -1                                    // frase → substring
          : (' ' + norm + ' ').indexOf(' ' + kw + ' ') !== -1;        // palabra → boundary
        if (hit) return rule.id;
      }
    }
    return 'fallback';
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
  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function addMsg(text, type) {
    var el = document.createElement('div');
    el.className = 'eq-msg eq-msg--' + (type || 'bot');
    el.innerHTML = esc(text).replace(/\n/g, '<br>');
    $msgs.appendChild(el);
    $msgs.scrollTop = $msgs.scrollHeight;
  }

  function after(fn, ms) { setTimeout(fn, ms || DELAY); }

  /* ─── Opciones ───────────────────────────────────────────── */
  function setOpts(defs) {
    $opts.innerHTML = '';
    if (!defs || !defs.length) return;
    defs.forEach(function (def) {
      var label = def.label || def;
      var intentId = def.id || null;
      var cb = def.fn || null;

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'eq-opt';
      btn.textContent = label;
      btn.addEventListener('click', function () {
        addMsg(label, 'user');
        $opts.innerHTML = '';
        if (cb) { cb(); return; }
        if (intentId) { dispatch(intentId); return; }
        handleText(label);
      });
      $opts.appendChild(btn);
    });
  }

  /* ─── Despacho de intención ──────────────────────────────── */
  function dispatch(id) {
    if (id === 'camara_trigger') { camaraFlow(); return; }
    if (id === 'thanks') {
      after(function () {
        addMsg('De nada 🙂 ¡Que disfrutes el botellín!', 'bot');
        setOpts([
          { label: 'Botellines y variedades', id: 'varieties' },
          { label: 'Packs',                   id: 'packs'     },
          { label: 'Contacto',                id: 'contact'   },
        ]);
      });
      return;
    }
    var r = getResponse(id);
    if (!r) { dispatch('fallback'); return; }
    after(function () {
      addMsg(r.text, 'bot');
      setOpts(r.opts);
    });
  }

  /* ─── Flujo Cámara Velada ────────────────────────────────── */
  var $camaraSect = $camara;

  function camaraFlow() {
    if (S.cameraUnlocked) {
      after(function () {
        addMsg('La Cámara Velada ya está desbloqueada para ti. Desplázate hacia abajo.', 'bot');
        setOpts([
          { label: 'Ir a La Cámara Velada', fn: function () { scrollToCamara(); } },
          { label: 'Botellines y variedades', id: 'varieties' },
        ]);
        setTimeout(scrollToCamara, DELAY + 500);
      });
    } else {
      S.awaitQuiz = true;
      after(function () {
        addMsg(
          'La Cámara Velada existe. Pero el acceso no es para cualquiera.\n\nEs un quiz de historia del vino. Cinco preguntas. Necesitas acertar al menos tres.\n\n¿Lo intentas?',
          'bot'
        );
        setOpts([
          { label: '✓ Sí, quiero entrar', fn: function () { S.awaitQuiz = false; startQuiz(); } },
          { label: '✗ Ahora no',          fn: function () { S.awaitQuiz = false; declineQuiz(); } },
        ]);
      });
    }
  }

  function declineQuiz() {
    after(function () {
      addMsg('Sin problema. Aquí estamos cuando estés lista.', 'bot');
      setOpts([
        { label: '¿Qué es EQCLYPSE?',      id: 'brand'    },
        { label: 'Botellines y variedades', id: 'varieties' },
        { label: 'Packs',                   id: 'packs'     },
      ]);
    });
  }

  function unlockCamara() {
    S.cameraUnlocked = true;
    localStorage.setItem(STORAGE_KEY, '1');
    if ($camaraSect) {
      $camaraSect.classList.add('is-visible');
      $camaraSect.removeAttribute('aria-hidden');
    }
    $chat.classList.add('is-camara');
  }

  function scrollToCamara() {
    if ($camaraSect) $camaraSect.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function initCamara() {
    if (S.cameraUnlocked && $camaraSect) {
      $camaraSect.classList.add('is-visible');
      $camaraSect.removeAttribute('aria-hidden');
      $chat.classList.add('is-camara');
    }
  }

  /* ─── Quiz ───────────────────────────────────────────────── */
  function startQuiz() {
    S.quizActive  = true;
    S.quizIndex   = 0;
    S.quizCorrect = 0;
    $opts.innerHTML = '';
    addMsg('🔒 Iniciando protocolo de acceso a La Cámara Velada…', 'system');
    after(function () {
      addMsg('Cinco preguntas. Al menos tres correctas para entrar. Sin ayudas.', 'quiz');
      after(showQ, 900);
    }, 600);
  }

  function showQ() {
    var q = QUIZ[S.quizIndex];
    addMsg('Pregunta ' + (S.quizIndex + 1) + ' de ' + QUIZ.length + '\n\n' + q.q, 'quiz');
    $opts.innerHTML = '';
    q.opts.forEach(function (opt, i) {
      var label = String.fromCharCode(65 + i) + '. ' + opt;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'eq-opt eq-opt--answer';
      btn.textContent = label;
      (function (idx) {
        btn.addEventListener('click', function () { answerQ(idx); });
      }(i));
      $opts.appendChild(btn);
    });
    $msgs.scrollTop = $msgs.scrollHeight;
  }

  function answerQ(idx) {
    var q       = QUIZ[S.quizIndex];
    var correct = idx === q.correct;
    addMsg(String.fromCharCode(65 + idx) + '. ' + q.opts[idx], 'user');
    $opts.innerHTML = '';
    if (correct) {
      S.quizCorrect++;
      addMsg('✓ Correcto.', 'system');
    } else {
      addMsg('✗ Incorrecto. Era: ' + String.fromCharCode(65 + q.correct) + '. ' + q.opts[q.correct], 'system');
    }
    S.quizIndex++;
    if (S.quizIndex < QUIZ.length) {
      after(showQ, 800);
    } else {
      after(finishQuiz, 600);
    }
  }

  function finishQuiz() {
    S.quizActive = false;
    var passed = S.quizCorrect >= 3;
    addMsg('Resultado: ' + S.quizCorrect + '/' + QUIZ.length + ' correctas.', 'system');
    if (passed) {
      after(function () {
        addMsg('Acceso concedido.\n\nSabes de vino. Bienvenida a La Cámara Velada.', 'quiz');
        unlockCamara();
        after(function () {
          addMsg('Desplázate hacia abajo para ver lo que no está en ningún otro sitio.', 'bot');
          setOpts([
            { label: 'Ir a La Cámara Velada', fn: function () { scrollToCamara(); } },
            { label: 'Botellines y variedades', id: 'varieties' },
          ]);
          setTimeout(scrollToCamara, 2200);
        }, 1200);
      }, 800);
    } else {
      after(function () {
        addMsg(
          'Acceso denegado.\n\n' + S.quizCorrect + ' de 5. Necesitabas al menos 3.\n\nVuelve cuando sepas más de vino.',
          'bot'
        );
        setOpts([
          { label: '🔒 Intentarlo de nuevo', fn: function () { startQuiz(); } },
          { label: '¿Qué es EQCLYPSE?',      id: 'brand'                     },
        ]);
      }, 800);
    }
  }

  /* ─── Texto libre ────────────────────────────────────────── */
  function handleText(input) {
    // Quiz activo → pedir que use botones
    if (S.quizActive) {
      addMsg(input, 'user');
      after(function () {
        addMsg('Usa los botones de opción para responder.', 'bot');
      });
      return;
    }
    // Esperando confirmación quiz
    if (S.awaitQuiz) {
      addMsg(input, 'user');
      $opts.innerHTML = '';
      var n = normalize(input);
      var yes = /si|sí|quiero|dale|claro|va(le)?|ok|anda/.test(n);
      S.awaitQuiz = false;
      if (yes) { startQuiz(); } else { declineQuiz(); }
      return;
    }
    // NLP normal
    addMsg(input, 'user');
    $opts.innerHTML = '';
    var id = matchNLP(input);
    dispatch(id);
  }

  /* ─── Apertura / cierre ──────────────────────────────────── */
  function openChat() {
    S.open = true;
    $chat.classList.add('is-open');
    $panel.classList.add('is-open');
    $panel.removeAttribute('aria-hidden');
    $toggle.setAttribute('aria-expanded', 'true');
    setTimeout(function () { $input.focus(); }, 60);
    if (!$msgs.firstChild) greet();
  }

  function closeChat() {
    S.open = false;
    $chat.classList.remove('is-open');
    $panel.classList.remove('is-open');
    $panel.setAttribute('aria-hidden', 'true');
    $toggle.setAttribute('aria-expanded', 'false');
  }

  function greet() {
    var cameraOpt = S.cameraUnlocked
      ? { label: '🔓 La Cámara Velada', fn: function () { scrollToCamara(); } }
      : { label: '🔒 Acceso exclusivo',  id: 'camara_trigger' };

    after(function () {
      addMsg(
        S.cameraUnlocked
          ? 'La Cámara Velada está desbloqueada. ¿Qué necesitas?'
          : '¡Hola! Soy el asistente de EQCLYPSE. Pregúntame lo que quieras.',
        'bot'
      );
      setOpts([
        { label: '¿Qué es EQCLYPSE?',      id: 'brand'          },
        { label: 'Botellines y variedades', id: 'varieties'      },
        { label: 'Precios y packs',         id: 'price'          },
        { label: 'Envío y entrega',         id: 'shipping'       },
        cameraOpt,
      ]);
    }, 300);
  }

  /* ─── Eventos ────────────────────────────────────────────── */
  $toggle.addEventListener('click', function () {
    if (S.open) closeChat(); else openChat();
  });
  $close.addEventListener('click', closeChat);
  $form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = $input.value;
    $input.value = '';
    if (v.trim()) handleText(v.trim());
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && S.open) closeChat();
  });

  /* ─── Init ───────────────────────────────────────────────── */
  initCamara();

}());
