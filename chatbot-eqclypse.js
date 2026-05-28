/**
 * chatbot-eqclypse.js — v7
 * Nuevas funcionalidades: carrito, localizador, recomendador, seguimiento pedido,
 * drops, memoria de nombre, modo nocturno, chips visuales, código descuento, encuesta.
 */
(function () {
  'use strict';

  /* ─── Constantes ─────────────────────────────────────────── */
  var STORAGE_KEY   = 'eqclypse_camara_v1';
  var DROPS_KEY     = 'eqclypse_drops_sub';
  var FEEDBACK_KEY  = 'eqclypse_chat_feedback';
  var DISCOUNT_CODE = 'CAMARANOCHE10';
  var DELAY         = 560;
  var WA_NUM        = '34666777888';
  var EMAIL         = 'hola@eqclypse.com';
  var DROPS_ACTIVE  = false; // cambiar a true cuando haya un drop activo

  var hour    = new Date().getHours();
  var isNight = hour >= 22 || hour < 6;

  /* ─── Estado ─────────────────────────────────────────────── */
  var S = {
    open           : false,
    cameraUnlocked : localStorage.getItem(STORAGE_KEY) === '1',
    awaitQuiz      : false,
    quizActive     : false,
    quizIndex      : 0,
    quizCorrect    : 0,
    userName       : null,
    awaitDropSub   : false,
    rec            : { step: 0, plan: null, alc: null },
    hasInteracted  : false,
    feedbackShown  : false,
  };

  /* ─── Integración con el carrito ─────────────────────────── */
  function botAddToCart(productId, optionId) {
    if (typeof window.findProduct !== 'function' ||
        typeof window.addToCart  !== 'function' ||
        typeof window.openCart   !== 'function') {
      after(function () {
        addMsg('No puedo añadirlo ahora mismo. Encuéntralo en la tienda de arriba.', 'bot');
      });
      return;
    }
    var product = window.findProduct(productId);
    if (!product) return;
    window.addToCart(product, optionId, 1);
    window.openCart();
    addMsg('Añadido al carrito ✓', 'system');
  }

  /* ─── Datos de bares por ciudad ──────────────────────────── */
  var BARS = {
    zgz: 'En Zaragoza:\n\n→ Nola Gras (C/ Francisco de Vitoria) — Moderno y sofisticado, con ese punto divertido para cena + copa.\n→ La Clandestina (Centro) — Cocina contemporánea y carta de vinos cuidada. Para cuando toca quedar en condiciones.\n→ Ginger Fizz Bar (Costa 16) — Coctelería y sushi. Tarde-noche y planes en grupo.',
    mad: 'En Madrid:\n\n→ Marieta (Paseo de la Castellana, 44) — Afterwork de los buenos. Cócteles, DJ y energía justa entre copa y fiesta.\n→ Ultramarinos Quintín (Jorge Juan, 17) — El clásico de Salamanca. Barra, cena informal bien ejecutada.\n→ Picalagartos Sky Bar (Gran Vía) — Rooftop céntrico con vistas. Para el plan arreglado de Madrid.',
    vlc: 'En Valencia:\n\n→ Café Madrid (Ciutat Vella) — Cocktail bar elegante. Histórico y reinterpretado.\n→ Apotheke (C/ Císcar, Ruzafa) — Speakeasy con cócteles de autor. Premium sin alboroto.\n→ Voltereta Manhattan (Centro) — Club clandestino años 20, jazz en directo y ambiente inmersivo.',
    bcn: 'En Barcelona:\n\n→ Feroz (Tuset) — Restaurante, coctelería y club. El plan completo: cena, DJs y ambiente joven.\n→ Boca Grande / Boca Chica (Passatge de la Concepció) — Elegante, junto a Passeig de Gràcia.\n→ Gala (Eixample, Provença) — Cena + fiesta en una. Estético y animado.',
  };

  /* ─── Descripciones para el recomendador ─────────────────── */
  var REC_DESC = {
    'tinto'    : 'EQCLYPSE Tinto — 8,2°\nOscuro, directo y fácil de abrir. Para noches que empiezan tranquilas y terminan tarde.',
    'blanco'   : 'EQCLYPSE Blanco — 7,1°\nFrío, limpio y ligero. Para terraza, previa o cena improvisada.',
    'rosado'   : 'EQCLYPSE Rosado — 6,6°\nLa hora dorada en formato botellín. Fresco, visual y fácil de compartir.',
    'blanco-00': 'EQCLYPSE Blanco 0.0\nTodo el gesto. Cero alcohol. Para cuando tu noche pide claridad.',
  };

  /* ─── Respuestas (switch) ────────────────────────────────── */
  function getResponse(id) {
    switch (id) {

      /* ── Marca ── */
      case 'brand':
        return {
          text: 'EQCLYPSE es una marca de vinos tempranillos enfocada en el público más joven. Todo empezó en esas cenas eternas donde un grupo de amigos decidieron tomar las riendas de su consumo de vino y llevar su enfoque a un público totalmente nuevo.\n\nEn cuanto al nombre: eclipse en latín significa desesperación o abandono. Elegimos ese nombre porque a nivel astronómico es la conjunción de dos astros en un mismo momento vital. En este caso, eclipse es la conjunción del vino con la juventud, y a su vez también representa simbólicamente el abandono del sector a un nicho poblacional: la juventud.',
          opts: [
            { label: '🍷 Variedades de vino', id: 'varieties' },
            { label: '⭕ ¿Qué es el 0.0?',   id: 'zero'      },
            { label: '💶 Precios',            id: 'price'     },
            { label: '📍 Dónde comprar',      id: 'where'     },
          ],
        };

      /* ── Variedades ── */
      case 'varieties':
        return {
          text: 'Tenemos cuatro variedades, todas en botellín de 33 cl:\n\n🍷 Tinto — 8,2°\n🥂 Blanco — 7,1°\n🌸 Rosado — 6,6°\n⭕ Blanco 0.0 — 0,0% alcohol',
          opts: [
            { label: '🌡️ Temperatura de servicio', id: 'temperature' },
            { label: '🍽️ Maridajes',               id: 'pairing'     },
            { label: '⭕ ¿Qué es el 0.0?',          id: 'zero'        },
            { label: '💶 Precios',                  id: 'price'       },
          ],
        };

      /* ── Botellín 0.0 ── */
      case 'zero':
        return {
          text: 'El Blanco 0.0 es un vino blanco semidulce sin alcohol. Está dentro de nuestra gama de cuatro variedades y tiene exactamente 0,0% de alcohol.\n\nEs la opción perfecta para quienes no quieren alcohol pero quieren seguir siendo parte del plan.',
          opts: [
            { label: '🍽️ Maridajes',          id: 'pairing'   },
            { label: '🍷 Ver todos los vinos', id: 'varieties' },
            { label: '💶 Precios',            id: 'price'     },
          ],
        };

      /* ── Graduación ── */
      case 'alcohol':
        return {
          text: 'Las graduaciones son:\n\n🍷 Tinto — 8,2°\n🥂 Blanco — 7,1°\n🌸 Rosado — 6,6°\n⭕ Blanco 0.0 — 0,0%',
          opts: [
            { label: '⭕ ¿Qué es el 0.0?',         id: 'zero'        },
            { label: '🌡️ Temperatura de servicio', id: 'temperature' },
            { label: '🍷 Variedades',               id: 'varieties'   },
          ],
        };

      /* ── Temperatura ── */
      case 'temperature':
        return {
          text: 'EQCLYPSE se bebe frío, siempre:\n\n• Blanco y Rosado: entre 6 y 10 °C\n• Tinto: entre 10 y 14 °C\n• 0.0: bien frío, entre 4 y 8 °C\n\nMínimo 2 horas en nevera antes de abrir. Sin enfriadera, sin protocolo, sin excusas.',
          opts: [
            { label: '🍽️ Maridajes', id: 'pairing'   },
            { label: '🍷 Variedades', id: 'varieties' },
          ],
        };

      /* ── Maridaje ── */
      case 'pairing':
        return {
          text: 'Sin protocolo, pero con criterio:\n\n🍷 Tinto — Embutidos, queso curado, pasta, carnes a la brasa.\n🥂 Blanco — Pescado, mariscos, sushi, ensaladas, queso fresco.\n🌸 Rosado — Aperitivos, tapas, pizza, charcutería.\n⭕ 0.0 — Todo lo anterior. Sin alcohol.\n\nLa norma real: lo que tengas delante.',
          opts: [
            { label: '🌡️ Temperatura de servicio', id: 'temperature' },
            { label: '🍷 Variedades',               id: 'varieties'   },
          ],
        };

      /* ── Añada / origen ── */
      case 'vintage':
        return {
          text: 'EQCLYPSE son vinos jóvenes de uva tempranillo, pensados para beber en el año.\n\nSin crianza larga, sin años de espera, sin complicarte la vida con añadas. Frescura inmediata. Abre, enfría y disfruta.',
          opts: [
            { label: '📊 Graduación alcohólica',   id: 'alcohol'     },
            { label: '🌡️ Temperatura de servicio', id: 'temperature' },
          ],
        };

      /* ── Precios ── */
      case 'price':
        return {
          text: 'El precio del botellín es de 2,80 € en bares y 3,50 € en restaurantes.\n\nEn cuanto a los packs:\n📦 Cata Nocturna — 6 botellines mixtos — 15,90 €\n📦 Urban Night — 12 botellines mixtos — 33,00 €',
          opts: [
            { label: '📦 ¿Qué incluyen los packs?', id: 'packs'        },
            { label: '🛒 Cómo pedir',               id: 'how_to_order' },
            { label: '🚚 Costes de envío',           id: 'shipping'     },
          ],
        };

      /* ── Packs ── */
      case 'packs':
        return {
          text: 'Tenemos dos packs:\n\n📦 Cata Nocturna — 15,90 € — incluye 6 botellines mixtos\n📦 Urban Night — 33,00 € — incluye 12 botellines mixtos',
          opts: [
            { label: '🛒 Añadir Cata Nocturna al carrito', fn: function () { addMsg('Cata Nocturna', 'user'); botAddToCart('pack-cata-nocturna', 'pack'); } },
            { label: '🛒 Añadir Urban Night al carrito',   fn: function () { addMsg('Urban Night', 'user');   botAddToCart('pack-urban-night',    'pack'); } },
            { label: '🚚 Costes de envío',                  id: 'shipping'     },
            { label: '🛒 Cómo pedir',                       id: 'how_to_order' },
          ],
        };

      /* ── Envío ── */
      case 'shipping':
        return {
          text: 'Enviamos a toda España, Europa e internacionalmente.\n\n🇪🇸 España — 3,50 € — 24-48 horas\n🇪🇺 Europa — 15,99 € — 4 a 6 días laborables\n🌍 Internacional — 30,99 € — a partir de 7 días laborables desde que el pedido sale del almacén',
          opts: [
            { label: '🛒 Cómo pedir',        id: 'how_to_order' },
            { label: '📦 Ver los packs',     id: 'packs'        },
            { label: '📦 Estado de mi pedido', id: 'order_track' },
          ],
        };

      /* ── Cómo pedir ── */
      case 'how_to_order':
        return {
          text: 'Puedes pedir por WhatsApp o por email.\n\n💬 WhatsApp — 666 777 888\n📧 Email — hola@eqclypse.com',
          opts: [
            { label: '💬 Abrir WhatsApp', fn: function () { window.open('https://wa.me/' + WA_NUM + '?text=' + encodeURIComponent('Hola, quiero hacer un pedido de EQCLYPSE.'), '_blank'); } },
            { label: '📧 Enviar email',   fn: function () { window.open('mailto:' + EMAIL + '?subject=Pedido EQCLYPSE', '_blank'); } },
            { label: '📦 Ver los packs', id: 'packs'    },
            { label: '🚚 Costes de envío', id: 'shipping' },
          ],
        };

      /* ── Seguimiento de pedido ── */
      case 'order_track':
        return {
          text: 'Los pedidos se gestionan de forma manual. Una vez que contactas:\n\n1. Confirmamos disponibilidad y precio final con envío.\n2. Compartimos los datos de pago.\n3. Preparamos y enviamos en 24-48h (España).\n\nSi ya tienes un pedido en marcha, escríbenos directamente y te actualizamos el estado.',
          opts: [
            { label: '💬 Consultar por WhatsApp', fn: function () { window.open('https://wa.me/' + WA_NUM + '?text=' + encodeURIComponent('Hola, quiero consultar el estado de mi pedido EQCLYPSE.'), '_blank'); } },
            { label: '📧 Consultar por email',    fn: function () { window.open('mailto:' + EMAIL + '?subject=Estado de mi pedido EQCLYPSE', '_blank'); } },
            { label: '🚚 Ver costes de envío',    id: 'shipping' },
          ],
        };

      /* ── Dónde comprar — primer paso: ciudad ── */
      case 'where':
        return {
          text: '¿En qué ciudad estás?',
          opts: [
            { label: '📍 Zaragoza',  id: 'where_zgz' },
            { label: '📍 Madrid',    id: 'where_mad' },
            { label: '📍 Valencia',  id: 'where_vlc' },
            { label: '📍 Barcelona', id: 'where_bcn' },
          ],
        };

      case 'where_zgz':
        return {
          text: BARS.zgz,
          opts: [
            { label: '🛒 Pedir online',  id: 'how_to_order' },
            { label: '📦 Ver los packs', id: 'packs'        },
            { label: '🏙️ Otra ciudad',   id: 'where'        },
          ],
        };

      case 'where_mad':
        return {
          text: BARS.mad,
          opts: [
            { label: '🛒 Pedir online',  id: 'how_to_order' },
            { label: '📦 Ver los packs', id: 'packs'        },
            { label: '🏙️ Otra ciudad',   id: 'where'        },
          ],
        };

      case 'where_vlc':
        return {
          text: BARS.vlc,
          opts: [
            { label: '🛒 Pedir online',  id: 'how_to_order' },
            { label: '📦 Ver los packs', id: 'packs'        },
            { label: '🏙️ Otra ciudad',   id: 'where'        },
          ],
        };

      case 'where_bcn':
        return {
          text: BARS.bcn,
          opts: [
            { label: '🛒 Pedir online',  id: 'how_to_order' },
            { label: '📦 Ver los packs', id: 'packs'        },
            { label: '🏙️ Otra ciudad',   id: 'where'        },
          ],
        };

      /* ── El Círculo ── */
      case 'circle':
        return {
          text: 'El Círculo es nuestro club privado. Acceso anticipado a drops, playlists, rutas de bares y planes desbloqueables.\n\nRegístrate en la web. Sin costes, sin compromisos.',
          opts: [
            { label: '🔔 Avisarme del próximo drop', id: 'drops_notify' },
            { label: '🍷 Ver las variedades',         id: 'varieties'   },
            { label: '📞 Contacto',                   id: 'contact'     },
          ],
        };

      /* ── Contacto ── */
      case 'contact':
        return {
          text: '📧 hola@eqclypse.com\n💬 WhatsApp: 666 777 888\n📸 Instagram: @eqclypse\n🎵 TikTok: @eqclypse',
          opts: [
            { label: '💬 Abrir WhatsApp', fn: function () { window.open('https://wa.me/' + WA_NUM, '_blank'); } },
            { label: '📧 Enviar email',   fn: function () { window.open('mailto:' + EMAIL, '_blank'); } },
            { label: '📦 Ver los packs', id: 'packs' },
          ],
        };

      /* ── Fallback ── */
      default:
        return {
          text: 'No sé exactamente qué decirte sobre eso, pero podemos ayudarte en hola@eqclypse.com o por WhatsApp al 666 777 888.',
          opts: [
            { label: '🍾 ¿Qué es EQCLYPSE?',    id: 'brand'    },
            { label: '🍷 Variedades de vino',    id: 'varieties'},
            { label: '💶 Precios y packs',        id: 'price'    },
            { label: '📞 Contacto',               id: 'contact'  },
          ],
        };
    }
  }

  /* ─── Quiz de acceso a La Cámara Velada ──────────────────── */
  /* Pool completo — se eligen 5 al azar en cada sesión */
  var QUIZ_POOL = [
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
    {
      q      : '¿Cuál es la variedad tinta más plantada de España?',
      opts   : ['Tempranillo', 'Garnacha', 'Monastrell', 'Cabernet Sauvignon'],
      correct: 0,
    },
    {
      q      : '¿En qué región española se encuentra la Denominación de Origen Campo de Borja?',
      opts   : ['Aragón', 'Castilla-La Mancha', 'La Rioja', 'Navarra'],
      correct: 0,
    },
    {
      q      : '¿Qué uva predomina en la DO Campo de Borja con más del 70% de la superficie vitícola?',
      opts   : ['Garnacha', 'Tempranillo', 'Cabernet Sauvignon', 'Merlot'],
      correct: 0,
    },
    {
      q      : '¿Cómo se llama el viento del noroeste que baja desde los Pirineos y que actúa como agente sanitario natural en los viñedos de Aragón?',
      opts   : ['El cierzo', 'El levante', 'El bochorno', 'La tramontana'],
      correct: 0,
    },
    {
      q      : '¿Qué nombre recibe la poda tradicional de la viña que no requiere espaldera y da forma de arbusto a la cepa?',
      opts   : ['En vaso', 'En espaldera', 'En lira', 'En cordón Royat'],
      correct: 0,
    },
    {
      q      : '¿Cuántos mililitros contiene una botella estándar de vino?',
      opts   : ['750 ml', '700 ml', '650 ml', '800 ml'],
      correct: 0,
    },
    {
      q      : '¿Qué nombre recibe el hollejo de la uva que flota en la parte superior del depósito durante la fermentación?',
      opts   : ['Sombrero', 'Lía', 'Sedimento', 'Orujo'],
      correct: 0,
    },
    {
      q      : '¿Cómo se denomina el proceso de mover el mosto desde la parte inferior del depósito hasta el sombrero para extraer color y taninos?',
      opts   : ['Remontado', 'Trasiego', 'Sangría', 'Desfangado'],
      correct: 0,
    },
    {
      q      : '¿Cuál es el país con mayor superficie de viñedo del mundo?',
      opts   : ['España', 'Francia', 'Italia', 'China'],
      correct: 0,
    },
    {
      q      : '¿Qué significa el término "añada" en el mundo del vino?',
      opts   : ['El año de la cosecha', 'El año de embotellado', 'El tiempo de crianza', 'El año de fundación de la bodega'],
      correct: 0,
    },
  ];

  /* Mezcla Fisher-Yates y devuelve 5 preguntas aleatorias del pool */
  function buildQuiz() {
    var pool = QUIZ_POOL.slice();
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
    }
    return pool.slice(0, 5);
  }

  var QUIZ = [];

  /* ─── NLP (texto libre) ───────────────────────────────────── */
  var NLP = [
    { words: ['hola','hey','buenas','saludos','hi'],                                    id: 'greeting'      },
    { words: ['cámara','camara','zona secreta','acceso oculto','zona vip',
              'zona exclusiva','algo escondido'],                                        id: 'camara_trigger'},
    { words: ['recomiéndame','recomiendame','qué me recomiendas','no sé qué elegir',
              'ayúdame a elegir','cuál elijo','cuál me recomiendas'],                    id: 'recommender'   },
    { words: ['drop','drops','avísame','avisame','próximo drop','nuevo lanzamiento',
              'notificación de drops','siguiente lanzamiento'],                          id: 'drops_notify'  },
    { words: ['pedido','estado del pedido','cómo va mi pedido','seguimiento',
              'dónde está mi pedido','cuándo llega mi pedido'],                          id: 'order_track'   },
    { words: ['0.0','sin alcohol','cero alcohol','dealcoholizado',
              'conducir','semidulce'],                                                   id: 'zero'          },
    { words: ['variedades','qué vinos','tinto','blanco','rosado',
              'referencias','tipos de vino','botellines disponibles'],                   id: 'varieties'     },
    { words: ['graduación','cuántos grados','grado alcohólico',
              'cuánto alcohol tiene','abv','porcentaje'],                                id: 'alcohol'       },
    { words: ['temperatura','cómo servir','nevera','cuánto enfriar',
              'temperatura de servicio','cómo se sirve'],                                id: 'temperature'   },
    { words: ['maridaje','con qué','combinar','queso','jamón',
              'marisco','pescado','aperitivo','tapas','pizza','sushi'],                   id: 'pairing'       },
    { words: ['añada','cosecha','de qué año','crianza','reserva',
              'tempranillo','uva','origen','dónde se hace'],                             id: 'vintage'       },
    { words: ['precio','cuánto cuesta','cuánto vale','qué precio',
              'cuánto es','tarifa','precios','cuánto sale'],                             id: 'price'         },
    { words: ['pack','packs','cata nocturna','urban night','lote',
              'caja','surtido'],                                                         id: 'packs'         },
    { words: ['cuánto tarda','tiempo de entrega','plazo',
              'cuántos días tarda','cuándo llega','rapidez'],                            id: 'shipping'      },
    { words: ['envío','enviáis','gastos de envío','portes',
              'dónde enviáis','envíos','mando a'],                                       id: 'shipping'      },
    { words: ['cómo pido','cómo comprar','hacer pedido','whatsapp',
              'carrito','quiero comprar','quiero pedir','número de teléfono'],           id: 'how_to_order'  },
    { words: ['dónde comprar','en qué bares','puntos de venta',
              'dónde se vende','dónde encontrar','qué bares','dónde está',
              'zaragoza','madrid','barcelona','valencia','bar','restaurante'],            id: 'where'         },
    { words: ['contacto','instagram','tiktok','email de contacto',
              'escribiros','teléfono','número'],                                         id: 'contact'       },
    { words: ['el círculo','círculo','newsletter','registrarme',
              'comunidad','club'],                                                       id: 'circle'        },
    { words: ['qué es eqclypse','vuestra historia','la marca',
              'sobre eqclypse','quiénes sois','de qué va','el nombre',
              'por qué eclipse','qué significa'],                                        id: 'brand'         },
    { words: ['gracias','muchas gracias','genial','perfecto','guay',
              'ok gracias','thank you'],                                                 id: 'thanks'        },
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
        var kw  = normalize(rule.words[j]);
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

  function namePrefix() {
    return S.userName ? (', ' + S.userName) : '';
  }

  /* ─── Opciones / chips ───────────────────────────────────── */
  function setOpts(defs) {
    $opts.innerHTML = '';
    if (!defs || !defs.length) return;
    defs.forEach(function (def) {
      var label    = def.label || def;
      var intentId = def.id   || null;
      var cb       = def.fn   || null;

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'eq-opt' + (def.main ? ' eq-opt--main' : '');
      btn.textContent = label;
      btn.addEventListener('click', function () {
        addMsg(label, 'user');
        $opts.innerHTML = '';
        S.hasInteracted = true;
        if (cb)       { cb();              return; }
        if (intentId) { dispatch(intentId); return; }
        handleText(label);
      });
      $opts.appendChild(btn);
    });
  }

  function showMainMenu() {
    var cameraOpt = S.cameraUnlocked
      ? { label: '🔓 La Cámara Velada', fn: scrollToCamara, main: true }
      : { label: '🔒 Acceso exclusivo',  id: 'camara_trigger', main: true };

    setOpts([
      { label: '🍷 Variedades y precios', id: 'varieties',  main: true },
      { label: '📦 Packs',               id: 'packs',      main: true },
      { label: '🚚 Envíos y pedidos',     id: 'shipping',   main: true },
      { label: '📍 Dónde encontrarlo',    id: 'where',      main: true },
      { label: '🎯 Recomiéndame uno',     id: 'recommender',main: true },
      { label: '📦 Estado de mi pedido',  id: 'order_track',main: true },
      { label: '🔔 Avisarme del drop',    id: 'drops_notify',main: true },
      cameraOpt,
    ]);
  }

  /* ─── Despacho de intención ──────────────────────────────── */
  function dispatch(id) {
    if (id === 'greeting')      { after(function () { showGreetResponse(); }); return; }
    if (id === 'camara_trigger'){ camaraFlow(); return; }
    if (id === 'recommender')   { startRecommender(); return; }
    if (id === 'drops_notify')  { dropsFlow(); return; }

    if (id === 'thanks') {
      after(function () {
        addMsg('De nada' + namePrefix() + ' 🙂 ¡Que disfrutes el botellín!', 'bot');
        showMainMenu();
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

  function showGreetResponse() {
    var msg = isNight
      ? '¡Buenas noches' + namePrefix() + '! Son las ' + hour + 'h y EQCLYPSE ya está frío. ¿Qué necesitas?'
      : '¡Hola' + namePrefix() + '! ¿En qué puedo ayudarte?';
    addMsg(msg, 'bot');
    showMainMenu();
  }

  /* ─── Cámara Velada ──────────────────────────────────────── */
  function camaraFlow() {
    if (S.cameraUnlocked) {
      after(function () {
        addMsg('La Cámara Velada ya está desbloqueada para ti' + namePrefix() + '. Desplázate hacia abajo.', 'bot');
        setOpts([
          { label: '↓ Ir a La Cámara Velada', fn: function () { scrollToCamara(); } },
          { label: '📦 Ver los packs',          id: 'packs' },
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
      showMainMenu();
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
    QUIZ          = buildQuiz(); // nueva selección aleatoria en cada intento
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
    var passed   = S.quizCorrect >= 3;
    addMsg('Resultado: ' + S.quizCorrect + '/' + QUIZ.length + ' correctas.', 'system');
    if (passed) {
      after(function () {
        addMsg('Acceso concedido.\n\nSabes de vino. Bienvenida a La Cámara Velada.', 'quiz');
        unlockCamara();
        after(function () {
          /* 🎁 Código descuento exclusivo */
          addMsg(
            '🎁 Y un regalo por completar el quiz:\n\nCódigo de descuento exclusivo para tu primer pedido:\n\n  ' + DISCOUNT_CODE + '\n\nMenciónalo al pedir por WhatsApp o email. 10% de descuento.',
            'system'
          );
          after(function () {
            addMsg('Desplázate hacia abajo para ver lo que no está en ningún otro sitio.', 'bot');
            setOpts([
              { label: '↓ Ir a La Cámara Velada', fn: function () { scrollToCamara(); } },
            ]);
            setTimeout(scrollToCamara, 2200);
          }, 1400);
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
          { label: '🍾 ¿Qué es EQCLYPSE?',  id: 'brand'                     },
        ]);
      }, 800);
    }
  }

  /* ─── Recomendador de botellín ───────────────────────────── */
  function startRecommender() {
    S.rec = { step: 1, plan: null, alc: null };
    after(function () {
      addMsg('Vamos a encontrar tu botellín. Tres preguntas rápidas.', 'bot');
      after(function () {
        addMsg('¿Qué plan tienes' + (isNight ? ' esta noche' : '') + '?', 'bot');
        setOpts([
          { label: '🌙 Previa o fiesta',    fn: function () { addMsg('Previa o fiesta', 'user');    recAnswer('plan', 'noche');    } },
          { label: '🍽️ Cena',              fn: function () { addMsg('Cena', 'user');               recAnswer('plan', 'cena');     } },
          { label: '☀️ Terraza o tarde',   fn: function () { addMsg('Terraza o tarde', 'user');    recAnswer('plan', 'terraza');  } },
          { label: '🤷 Sin plan concreto', fn: function () { addMsg('Sin plan concreto', 'user');  recAnswer('plan', 'any');      } },
        ]);
      }, 700);
    });
  }

  function recAnswer(key, val) {
    S.rec[key] = val;
    $opts.innerHTML = '';
    if (key === 'plan') {
      after(function () {
        addMsg('¿Con o sin alcohol?', 'bot');
        setOpts([
          { label: '🍷 Con alcohol',      fn: function () { addMsg('Con alcohol', 'user');      recAnswer('alc', 'si'); } },
          { label: '⭕ Sin alcohol (0.0)', fn: function () { addMsg('Sin alcohol (0.0)', 'user'); recAnswer('alc', 'no'); } },
        ]);
      });
    } else if (key === 'alc') {
      if (val === 'no') {
        showRecommendation('blanco-00');
      } else {
        after(function () {
          addMsg('¿Tinto, blanco o rosado?', 'bot');
          setOpts([
            { label: '🔴 Tinto',       fn: function () { addMsg('Tinto', 'user');        recAnswer('tipo', 'tinto');  } },
            { label: '🟡 Blanco',      fn: function () { addMsg('Blanco', 'user');       recAnswer('tipo', 'blanco'); } },
            { label: '🌸 Rosado',      fn: function () { addMsg('Rosado', 'user');       recAnswer('tipo', 'rosado'); } },
            { label: '❓ Me da igual', fn: function () { addMsg('Me da igual', 'user');  recAnswer('tipo', 'any');    } },
          ]);
        });
      }
    } else if (key === 'tipo') {
      var productId;
      if      (val === 'tinto')  productId = 'tinto';
      else if (val === 'blanco') productId = 'blanco';
      else if (val === 'rosado') productId = 'rosado';
      else {
        // any → según el plan
        if      (S.rec.plan === 'noche')   productId = 'tinto';
        else if (S.rec.plan === 'cena')    productId = 'blanco';
        else if (S.rec.plan === 'terraza') productId = 'rosado';
        else                               productId = 'rosado';
      }
      showRecommendation(productId);
    }
  }

  function showRecommendation(productId) {
    var desc = REC_DESC[productId] || REC_DESC['rosado'];
    after(function () {
      addMsg('Tu botellín' + namePrefix() + ':\n\n🍾 ' + desc, 'bot');
      setOpts([
        { label: '🛒 Añadir al carrito', fn: function () { botAddToCart(productId, 'unidad'); } },
        { label: '🍷 Ver todos los vinos', id: 'varieties' },
        { label: '📦 Ver los packs',       id: 'packs'     },
      ]);
    });
  }

  /* ─── Drops — notificación ───────────────────────────────── */
  function dropsFlow() {
    var existing = localStorage.getItem(DROPS_KEY);
    if (existing) {
      after(function () {
        addMsg('Ya estás en la lista' + namePrefix() + '. Te avisaremos antes que nadie cuando salga el siguiente drop.', 'bot');
        setOpts([
          { label: '🔵 ¿Qué es El Círculo?', id: 'circle' },
          { label: '📦 Ver los packs',        id: 'packs'  },
        ]);
      });
      return;
    }
    S.awaitDropSub = true;
    after(function () {
      addMsg('Te apuntamos para ser el primero en enterarte del próximo drop.\n\nEscribe tu email o tu usuario de Instagram (con @) y quedas dentro.', 'bot');
      setOpts([
        { label: '✗ Ahora no', fn: function () {
          S.awaitDropSub = false;
          after(function () {
            addMsg('Sin problema. Los drops se anuncian primero en Instagram.', 'bot');
            setOpts([{ label: '🔵 ¿Qué es El Círculo?', id: 'circle' }]);
          });
        }},
      ]);
    });
  }

  /* ─── Texto libre ────────────────────────────────────────── */
  function handleText(input) {
    /* 1. Quiz activo */
    if (S.quizActive) {
      addMsg(input, 'user');
      after(function () { addMsg('Usa los botones de opción para responder.', 'bot'); });
      return;
    }

    /* 2. Esperando confirmación del quiz */
    if (S.awaitQuiz) {
      addMsg(input, 'user');
      $opts.innerHTML = '';
      var yes = /si|sí|quiero|dale|claro|va(le)?|ok|anda|venga/.test(normalize(input));
      S.awaitQuiz = false;
      if (yes) { startQuiz(); } else { declineQuiz(); }
      return;
    }

    /* 3. Esperando email/IG para drops */
    if (S.awaitDropSub) {
      S.awaitDropSub = false;
      addMsg(input, 'user');
      localStorage.setItem(DROPS_KEY, input.trim());
      after(function () {
        addMsg('Apuntado. ' + input.trim() + ' ya está en la lista. Cuando salga el próximo drop, tú serás de los primeros en saberlo.', 'bot');
        setOpts([
          { label: '🔵 ¿Qué es El Círculo?', id: 'circle' },
          { label: '🍷 Ver variedades',       id: 'varieties' },
        ]);
      });
      return;
    }

    /* 4. Detección de nombre: "me llamo X", "soy X", "mi nombre es X" */
    var norm      = normalize(input);
    var nameMatch = norm.match(/(?:me llamo|mi nombre es|soy)\s+([a-z]{2,20})/);
    if (nameMatch && !S.userName) {
      var n     = nameMatch[1];
      S.userName = n.charAt(0).toUpperCase() + n.slice(1);
      addMsg(input, 'user');
      S.hasInteracted = true;
      after(function () {
        addMsg('Perfecto' + namePrefix() + (isNight ? '. ¿Qué necesitas para esta noche?' : '. ¿En qué puedo ayudarte?'), 'bot');
        showMainMenu();
      });
      return;
    }

    /* 5. NLP general */
    addMsg(input, 'user');
    $opts.innerHTML = '';
    S.hasInteracted = true;
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
    /* 📊 Encuesta de satisfacción antes de cerrar */
    if (S.hasInteracted && !S.feedbackShown) {
      S.feedbackShown = true;
      addMsg('¿Te ha sido útil la conversación?', 'bot');
      setOpts([
        { label: '👍 Sí', fn: function () {
          addMsg('Me alegra' + namePrefix() + '. ¡Hasta la próxima!', 'bot');
          localStorage.setItem(FEEDBACK_KEY, JSON.stringify({ val: 1, ts: Date.now() }));
          after(doClose, 900);
        }},
        { label: '👎 Mejorable', fn: function () {
          addMsg('Anotado. Lo tendremos en cuenta.', 'bot');
          localStorage.setItem(FEEDBACK_KEY, JSON.stringify({ val: 0, ts: Date.now() }));
          after(doClose, 900);
        }},
      ]);
      return;
    }
    doClose();
  }

  function doClose() {
    S.open = false;
    $chat.classList.remove('is-open');
    $panel.classList.remove('is-open');
    $panel.setAttribute('aria-hidden', 'true');
    $toggle.setAttribute('aria-expanded', 'false');
  }

  function greet() {
    /* Anuncio de drop activo si el usuario está suscrito */
    var dropSub = localStorage.getItem(DROPS_KEY);
    if (DROPS_ACTIVE && dropSub) {
      after(function () {
        addMsg('⚡ DROP ACTIVO — Tienes acceso anticipado. Ve a la sección Drops para verlo antes que nadie.', 'system');
      }, 200);
    }

    var greeting = S.cameraUnlocked
      ? (isNight
          ? 'Buenas noches' + namePrefix() + '. La Cámara Velada está desbloqueada. ¿Qué más necesitas?'
          : 'La Cámara Velada está desbloqueada' + namePrefix() + '. ¿Qué necesitas?')
      : (isNight
          ? 'Buenas noches' + namePrefix() + '. Son las ' + hour + 'h. EQCLYPSE ya está frío. ¿Qué necesitas?'
          : '¡Hola' + namePrefix() + '! Soy el asistente de EQCLYPSE. ¿En qué puedo ayudarte?');

    after(function () {
      addMsg(greeting, 'bot');
      showMainMenu();
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
