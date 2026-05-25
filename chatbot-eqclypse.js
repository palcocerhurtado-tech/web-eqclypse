/**
 * chatbot-eqclypse.js — v4 (datos reales)
 * Arquitectura: switch directo hardcodeado con información real de la marca.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'eqclypse_camara_v1';
  var DELAY = 560;

  /* ─── Estado ─────────────────────────────────────────────── */
  var S = {
    open           : false,
    cameraUnlocked : localStorage.getItem(STORAGE_KEY) === '1',
    awaitQuiz      : false,
    quizActive     : false,
    quizIndex      : 0,
    quizCorrect    : 0,
  };

  /* ─── Respuestas con información real ─────────────────────── */
  function getResponse(id) {
    switch (id) {

      /* ── Marca ── */
      case 'brand':
        return {
          text: 'EQCLYPSE nació en esas cenas eternas donde un grupo de amigos decidieron tomar las riendas de su consumo de vino.\n\nVinos tempranillo en botellín de 33 cl, pensados para un público que el sector tenía completamente ignorado: la juventud.\n\nEl nombre viene del latín: eclipse significa abandono. Y eso es exactamente lo que el mundo del vino ha hecho con los jóvenes durante décadas. Nosotros lo cambiamos.\n\nAstronómicamente, un eclipse es la conjunción de dos astros en un mismo momento vital. El nuestro: el vino y la juventud.',
          opts: [
            { label: 'Variedades de vino',      id: 'varieties'  },
            { label: '¿Qué es el 0.0?',         id: 'zero'       },
            { label: 'Precios',                 id: 'price'      },
            { label: 'Dónde comprar',           id: 'where'      },
          ],
        };

      /* ── Variedades ── */
      case 'varieties':
        return {
          text: 'Cuatro referencias, todas en botellín de 33 cl:\n\n🍷 Tinto — Tempranillo joven. 8,2°. Oscuro, directo y fácil de abrir.\n🥂 Blanco — Ligero y frío. 7,1°. Para terraza, sushi y lo que se tercie.\n🌸 Rosado — 6,6°. La hora dorada embotellada.\n⭕ Blanco 0.0 — Sin alcohol. Para cuando no quieres pero tampoco quieres quedarte fuera.',
          opts: [
            { label: 'Temperatura de servicio', id: 'temperature' },
            { label: 'Maridajes',               id: 'pairing'     },
            { label: '¿Qué es el 0.0?',         id: 'zero'        },
            { label: 'Precios',                 id: 'price'       },
          ],
        };

      /* ── Botellín 0.0 ── */
      case 'zero':
        return {
          text: 'El Blanco 0.0 es vino blanco semidulce dealcoholizado. Mismo carácter, cero alcohol.\n\nPerfecto para conducir, para quienes no quieren alcohol o simplemente para cuando no apetece pero quieres seguir con una copa en la mano.\n\nMismo formato 33 cl. Mismo protocolo: ninguno.',
          opts: [
            { label: 'Maridajes',          id: 'pairing'   },
            { label: 'Ver todos los vinos', id: 'varieties' },
            { label: 'Precios',            id: 'price'     },
          ],
        };

      /* ── Graduación ── */
      case 'alcohol':
        return {
          text: 'Las graduaciones de EQCLYPSE son bajas y ligeras, perfectas para beber tranquilamente:\n\n🍷 Tinto — 8,2°\n🥂 Blanco — 7,1°\n🌸 Rosado — 6,6°\n⭕ Blanco 0.0 — 0,0%\n\nPensados para disfrutar sin que la noche se te vaya de las manos.',
          opts: [
            { label: '¿Qué es el 0.0?',         id: 'zero'        },
            { label: 'Temperatura de servicio', id: 'temperature' },
            { label: 'Variedades',              id: 'varieties'   },
          ],
        };

      /* ── Temperatura ── */
      case 'temperature':
        return {
          text: 'EQCLYPSE se bebe frío, siempre:\n\n• Blanco y Rosado: entre 6 y 10 °C\n• Tinto: entre 10 y 14 °C\n• 0.0: bien frío, entre 4 y 8 °C\n\nMínimo 2 horas en nevera antes de abrir. Sin enfriadera, sin protocolo, sin excusas.',
          opts: [
            { label: 'Maridajes',               id: 'pairing'   },
            { label: 'Variedades',              id: 'varieties' },
          ],
        };

      /* ── Maridaje ── */
      case 'pairing':
        return {
          text: 'Sin protocolo, pero con criterio:\n\n🍷 Tinto — Embutidos, queso curado, pasta, carnes a la brasa.\n🥂 Blanco — Pescado, mariscos, sushi, ensaladas, queso fresco.\n🌸 Rosado — Aperitivos, tapas, pizza, charcutería.\n⭕ 0.0 — Todo lo anterior. Sin alcohol.\n\nLa norma real: lo que tengas delante.',
          opts: [
            { label: 'Temperatura de servicio', id: 'temperature' },
            { label: 'Variedades',              id: 'varieties'   },
          ],
        };

      /* ── Añada / origen ── */
      case 'vintage':
        return {
          text: 'EQCLYPSE son vinos jóvenes de uva tempranillo, pensados para beber en el año.\n\nSin crianza larga, sin años de espera, sin complicarte la vida con añadas. Frescura inmediata. Abre, enfría y disfruta.',
          opts: [
            { label: 'Graduación alcohólica',   id: 'alcohol'     },
            { label: 'Temperatura de servicio', id: 'temperature' },
          ],
        };

      /* ── Precios ── */
      case 'price':
        return {
          text: 'Precio por botellín:\n\n🍺 En bares: 2,80 €\n🍽️ En restaurantes: 3,50 €\n\nPacks (con envío incluido o a coste reducido):\n📦 Cata Nocturna — 6 botellines mixtos → 15,90 €\n📦 Urban Night — 12 botellines mixtos → 33,00 €',
          opts: [
            { label: '¿Qué incluyen los packs?', id: 'packs'        },
            { label: 'Cómo pedir',               id: 'how_to_order' },
            { label: 'Costes de envío',           id: 'shipping'     },
          ],
        };

      /* ── Packs ── */
      case 'packs':
        return {
          text: 'Dos packs disponibles ahora mismo:\n\n📦 Cata Nocturna — 15,90 €\n6 botellines mixtos. El plan para cuando sois pocos y queréis probarlo todo.\n\n📦 Urban Night — 33,00 €\n12 botellines mixtos. Para la previa en condiciones, la terraza larga o el plan de última hora.\n\nTodos mixtos: tú eliges si mezclas tintos, blancos, rosados o 0.0.',
          opts: [
            { label: 'Precios',          id: 'price'        },
            { label: 'Cómo pedir',       id: 'how_to_order' },
            { label: 'Costes de envío',  id: 'shipping'     },
          ],
        };

      /* ── Envío ── */
      case 'shipping':
        return {
          text: 'Enviamos a España, Europa y a nivel internacional:\n\n🇪🇸 España — 3,50 € · 24-48 h\n🇪🇺 Europa — 15,99 € · 4-6 días laborables\n🌍 Internacional — 30,99 € · a partir de 7 días laborables desde que sale del almacén\n\nPara pedidos grandes o eventos, escríbenos directamente.',
          opts: [
            { label: 'Cómo pedir',        id: 'how_to_order' },
            { label: 'Ver los packs',     id: 'packs'        },
            { label: 'Contacto',          id: 'contact'      },
          ],
        };

      /* ── Cómo pedir ── */
      case 'how_to_order':
        return {
          text: 'Puedes pedir de dos formas:\n\n💬 WhatsApp → 666 777 888\n📧 Email → hola@eqclypse.com\n\nTambién puedes añadir al carrito desde la web y finalizar el pedido por WhatsApp o email directamente desde ahí.\n\nNos ponemos en contacto para confirmar y coordinar el pago.',
          opts: [
            { label: 'Ver los packs',    id: 'packs'    },
            { label: 'Costes de envío', id: 'shipping' },
            { label: 'Contacto',        id: 'contact'  },
          ],
        };

      /* ── Dónde comprar (bares) ── */
      case 'where':
        return {
          text: 'Puedes encontrar EQCLYPSE en bares seleccionados en cuatro ciudades:\n\n📍 Zaragoza\n→ Nola Gras (C/ Francisco de Vitoria) — Moderno y sofisticado, con ese punto divertido para cena + copa con amigas.\n→ La Clandestina (Centro) — Cocina contemporánea y carta de vinos cuidada. Para cuando toca quedar en condiciones.\n→ Ginger Fizz Bar (Costa 16) — Coctelería y sushi. Tarde-noche y planes en grupo.\n\n📍 Madrid\n→ Marieta (Paseo de la Castellana, 44) — Afterwork de los buenos. Cócteles, DJ y energía justa entre copa y fiesta.\n→ Ultramarinos Quintín (Jorge Juan, 17) — El clásico de Salamanca. Barra, cena informal bien ejecutada, sin reserva.\n→ Picalagartos Sky Bar (Gran Vía) — Rooftop céntrico con vistas. Para el plan arreglado de Madrid.\n\n📍 Valencia\n→ Café Madrid (Ciutat Vella) — Cocktail bar elegante. Histórico y reinterpretado, donde el Agua de Valencia sabe mejor.\n→ Apotheke (C/ Císcar, Ruzafa) — Speakeasy con cócteles de autor. Premium sin alboroto.\n→ Voltereta Manhattan (Centro) — Club clandestino años 20, jazz en directo y ambiente inmersivo.\n\n📍 Barcelona\n→ Feroz (Tuset) — Restaurante, coctelería y club. El plan completo: cena, DJs y ambiente joven-arreglado.\n→ Boca Grande / Boca Chica (Passatge de la Concepció) — Elegante y bien ubicado junto a Passeig de Gràcia.\n→ Gala (Eixample, Provença) — Cena + fiesta en una. Estético y animado, donde la noche continúa después de los postres.',
          opts: [
            { label: 'Pedir online',      id: 'how_to_order' },
            { label: 'Ver los packs',     id: 'packs'        },
            { label: 'Contacto',          id: 'contact'      },
          ],
        };

      /* ── El Círculo ── */
      case 'circle':
        return {
          text: 'El Círculo es nuestro club privado. Acceso anticipado a drops, playlists, rutas de bares y planes desbloqueables.\n\nRegístrate en la web. Sin costes, sin compromisos.',
          opts: [
            { label: 'Ver las variedades', id: 'varieties' },
            { label: 'Contacto',           id: 'contact'   },
          ],
        };

      /* ── Contacto ── */
      case 'contact':
        return {
          text: 'Encuéntranos aquí:\n\n📧 hola@eqclypse.com\n💬 WhatsApp: 666 777 888\n📸 Instagram: @eqclypse\n🎵 TikTok: @eqclypse\n\nPara pedidos, el WhatsApp es lo más rápido.',
          opts: [
            { label: 'Cómo pedir',    id: 'how_to_order' },
            { label: 'Ver los packs', id: 'packs'        },
          ],
        };

      /* ── Fallback ── */
      default:
        return {
          text: 'No sé exactamente qué decirte sobre eso, pero podemos ayudarte en hola@eqclypse.com o por WhatsApp al 666 777 888.',
          opts: [
            { label: '¿Qué es EQCLYPSE?',      id: 'brand'    },
            { label: 'Variedades de vino',      id: 'varieties'},
            { label: 'Precios y packs',         id: 'price'    },
            { label: 'Contacto',               id: 'contact'  },
          ],
        };
    }
  }

  /* ─── Quiz de acceso a La Cámara Velada ──────────────────── */
  var QUIZ = [
    {
      q      : '¿En qué país se elaboró el vino más antiguo conocido, con más de 8.000 años de historia?',
      opts   : ['Georgia', 'Egipto', 'Mesopotamia', 'China'],
      correct: 0,
    },
    {
      q      : '¿Cómo se llama el proceso que convierte el ácido málico en ácido láctico, suavizando la acidez de los vinos?',
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
      q      : '¿Quién demostró científicamente que la fermentación alcohólica es causada por las levaduras?',
      opts   : ['Louis Pasteur', 'Antoine Lavoisier', 'Alexander Fleming', 'Justus von Liebig'],
      correct: 0,
    },
  ];

  /* ─── NLP (texto libre) ───────────────────────────────────── */
  var NLP = [
    { words: ['hola','hey','buenas','saludos','good morning','hi'],               id: 'greeting'      },
    { words: ['cámara','camara','zona secreta','acceso oculto','zona vip',
              'zona exclusiva','lo que no se ve','algo escondido'],                id: 'camara_trigger'},
    { words: ['0.0','sin alcohol','cero alcohol','dealcoholizado',
              'conducir','semidulce','sin alcoholemia'],                           id: 'zero'          },
    { words: ['variedades','qué vinos','tinto','blanco','rosado',
              'referencias','tipos de vino','botellines disponibles'],             id: 'varieties'     },
    { words: ['graduación','cuántos grados','grado alcohólico',
              'cuánto alcohol tiene','abv','porcentaje'],                          id: 'alcohol'       },
    { words: ['temperatura','cómo servir','nevera','cuánto enfriar',
              'temperatura de servicio','cómo se sirve'],                          id: 'temperature'   },
    { words: ['maridaje','con qué','combinar','queso','jamón',
              'marisco','pescado','aperitivo','tapas','pizza','sushi'],             id: 'pairing'       },
    { words: ['añada','cosecha','de qué año','crianza','reserva',
              'tempranillo','uva','origen','dónde se hace'],                       id: 'vintage'       },
    { words: ['precio','cuánto cuesta','cuánto vale','qué precio',
              'cuánto es','tarifa','precios','cuánto sale'],                       id: 'price'         },
    { words: ['pack','packs','cata nocturna','urban night','lote',
              'caja','surtido'],                                                   id: 'packs'         },
    { words: ['cuánto tarda','tiempo de entrega','plazo',
              'cuántos días tarda','cuándo llega','rapidez'],                      id: 'shipping'      },
    { words: ['envío','enviáis','gastos de envío','portes',
              'dónde enviáis','envíos','mando a'],                                 id: 'shipping'      },
    { words: ['cómo pido','cómo comprar','hacer pedido','whatsapp',
              'carrito','quiero comprar','quiero pedir','número de teléfono'],     id: 'how_to_order'  },
    { words: ['dónde comprar','en qué bares','puntos de venta',
              'dónde se vende','dónde encontrar','qué bares','dónde está',
              'zaragoza','madrid','barcelona','valencia','bar','restaurante'],      id: 'where'         },
    { words: ['contacto','instagram','tiktok','email de contacto',
              'escribiros','teléfono','número'],                                   id: 'contact'       },
    { words: ['el círculo','círculo','newsletter','registrarme',
              'drops','comunidad','club'],                                         id: 'circle'        },
    { words: ['qué es eqclypse','vuestra historia','la marca',
              'sobre eqclypse','quiénes sois','de qué va','el nombre',
              'por qué eclipse','qué significa'],                                  id: 'brand'         },
    { words: ['gracias','muchas gracias','genial','perfecto','guay',
              'ok gracias','thank you'],                                           id: 'thanks'        },
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
          ? norm.indexOf(kw) !== -1
          : (' ' + norm + ' ').indexOf(' ' + kw + ' ') !== -1;
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

  /* ─── Helpers de mensajes ────────────────────────────────── */
  function esc(s) {
    return String(s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function addMsg(text, type) {
    var el = document.createElement('div');
    el.className = 'eq-msg eq-msg--' + (type || 'bot');
    el.innerHTML = esc(text).replace(/\n/g, '<br>');
    $msgs.appendChild(el);
    $msgs.scrollTop = $msgs.scrollHeight;
  }

  function after(fn, ms) { setTimeout(fn, ms !== undefined ? ms : DELAY); }

  /* ─── Opciones ───────────────────────────────────────────── */
  function setOpts(defs) {
    $opts.innerHTML = '';
    if (!defs || !defs.length) return;
    defs.forEach(function (def) {
      var label    = def.label || def;
      var intentId = def.id   || null;
      var cb       = def.fn   || null;

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'eq-opt';
      btn.textContent = label;
      btn.addEventListener('click', function () {
        addMsg(label, 'user');
        $opts.innerHTML = '';
        if (cb)       { cb();             return; }
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
          { label: 'Ver los packs',      id: 'packs'    },
          { label: 'Dónde comprar',      id: 'where'    },
          { label: 'Contacto',           id: 'contact'  },
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

  /* ─── Cámara Velada ──────────────────────────────────────── */
  function camaraFlow() {
    if (S.cameraUnlocked) {
      after(function () {
        addMsg('La Cámara Velada ya está desbloqueada para ti. Desplázate hacia abajo.', 'bot');
        setOpts([
          { label: '↓ Ir a La Cámara Velada', fn: function () { scrollToCamara(); } },
          { label: 'Ver los packs',            id: 'packs' },
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
        { label: '¿Qué es EQCLYPSE?', id: 'brand'    },
        { label: 'Ver las variedades', id: 'varieties' },
        { label: 'Ver los packs',      id: 'packs'     },
      ]);
    });
  }

  function unlockCamara() {
    S.cameraUnlocked = true;
    localStorage.setItem(STORAGE_KEY, '1');
    if ($camara) {
      $camara.classList.add('is-visible');
      $camara.removeAttribute('aria-hidden');
    }
    $chat.classList.add('is-camara');
  }

  function scrollToCamara() {
    if ($camara) $camara.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function initCamara() {
    if (S.cameraUnlocked && $camara) {
      $camara.classList.add('is-visible');
      $camara.removeAttribute('aria-hidden');
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
            { label: '↓ Ir a La Cámara Velada', fn: function () { scrollToCamara(); } },
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
    if (S.quizActive) {
      addMsg(input, 'user');
      after(function () { addMsg('Usa los botones de opción para responder.', 'bot'); });
      return;
    }
    if (S.awaitQuiz) {
      addMsg(input, 'user');
      $opts.innerHTML = '';
      var yes = /si|sí|quiero|dale|claro|va(le)?|ok|anda|venga/.test(normalize(input));
      S.awaitQuiz = false;
      if (yes) { startQuiz(); } else { declineQuiz(); }
      return;
    }
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
          : '¡Hola! Soy el asistente de EQCLYPSE. ¿En qué puedo ayudarte?',
        'bot'
      );
      setOpts([
        { label: '¿Qué es EQCLYPSE?',      id: 'brand'    },
        { label: 'Variedades y precios',    id: 'price'    },
        { label: 'Dónde comprar',           id: 'where'    },
        { label: 'Envío y pedidos',         id: 'shipping' },
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
    var v = $input.value.trim();
    $input.value = '';
    if (v) handleText(v);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && S.open) closeChat();
  });

  /* ─── Init ───────────────────────────────────────────────── */
  initCamara();

}());
