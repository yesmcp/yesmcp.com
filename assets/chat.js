/* Yes MCP — the site opens as a chat. Scripted branches, no API, no deps.
   Node: steps = [{a}|{u}|{sys}|{card}], chips = [{t, go|href}].
   All strings are our own static script — no user input reaches innerHTML. */
(function () {
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $chat = document.getElementById('chatlog');
  var $chips = document.getElementById('chips');
  if (!$chat) return;

  function el(cls, html) { var d = document.createElement('div'); d.className = cls; d.innerHTML = html; return d; }

  /* ---------- widgets: familiar real-world UI, badged with real services ---------- */

  var CARDS = {
    /* product card with a real photo */
    product: function (c) {
      return el('app-card c-product',
        '<div class="app-card-head"><span>' + c.title + '</span><span class="tag">ВАШ БРЕНД</span></div>' +
        '<div class="p-body"><img class="p-photo" src="' + c.img + '" alt="" loading="lazy">' +
        '<div class="p-info"><div class="p-name">' + c.name + '</div><div class="p-price">' + c.price + '</div>' +
        '<div class="p-vars">' + c.vars.map(function (v, i) { return '<span class="p-var' + (i === (c.sel || 0) ? ' sel' : '') + '">' + v + '</span>'; }).join('') + '</div>' +
        '</div></div>');
    },
    /* order with honest pay button */
    order: function (c) {
      return el('app-card c-pay',
        '<div class="pay-row"><span>' + c.label + '</span><b>' + c.sum + '</b></div>' +
        '<div class="pay-done"><span class="mini-btn">Сплатити · відкриє monobank →</span></div>');
    },
    /* bank-style receipt */
    pay: function (c) {
      return el('app-card c-pay c-receipt',
        '<div class="rc-top"><span class="svc-badge mono-badge">monobank</span><span class="rc-ok">✓</span></div>' +
        '<div class="pay-row"><span>' + c.label + '</span><b>' + c.sum + '</b></div>' +
        '<div class="rc-meta">Оплачено · квитанція в чаті · №' + (c.op || '84 291') + '</div>');
    },
    /* Nova Poshta-style tracking */
    track: function (c) {
      return el('app-card c-track',
        '<div class="app-card-head"><span class="svc-badge np-badge">Нова Пошта</span><span class="tag">ТТН ' + c.ttn + '</span></div>' +
        '<div class="tr-steps">' + c.steps.map(function (s, i) {
          return '<div class="tr-step' + (i <= c.at ? ' on' : '') + '"><i></i>' + s + '</div>';
        }).join('') + '</div>');
    },
    /* streak, habit-app style */
    streak: function (c) {
      return el('app-card c-week',
        '<div class="app-card-head"><span>' + c.title + '</span><span class="tag">🔥 ' + c.fire + '</span></div>' +
        '<div class="week">' + c.days.map(function (d) {
          return '<span class="day' + (d.on ? ' done tick' : '') + '">' + d.t + '</span>';
        }).join('') + '</div>' +
        '<div class="app-card-foot"><span class="note">' + c.note + '</span></div>');
    },
    /* verified source */
    source: function (c) {
      return el('app-card c-source',
        '<div class="quote-line">' + c.quote + '</div>' +
        '<div class="src-meta"><span>' + c.ref + '</span><span class="stamp">✓ ДОСЛІВНО З КУРСУ</span></div>');
    },
    /* interactive exercise, language-app style */
    quiz: function (c) {
      var card = el('app-card c-quiz',
        '<div class="app-card-head"><span>' + c.title + '</span><span class="tag">ВПРАВА</span></div>' +
        '<div class="qz-q">' + c.q + '</div>' +
        '<div class="qz-opts">' + c.opts.map(function (o, i) {
          return '<button class="qz-opt" data-i="' + i + '">' + o + '</button>';
        }).join('') + '</div>');
      card.addEventListener('click', function (e) {
        var b = e.target.closest('.qz-opt');
        if (!b || card.dataset.done) return;
        card.dataset.done = '1';
        var ok = +b.dataset.i === c.correct;
        b.classList.add(ok ? 'ok' : 'bad');
        if (!ok) card.querySelector('[data-i="' + c.correct + '"]').classList.add('ok');
        setTimeout(function () { play(ok ? c.goOk : c.goBad); }, 700);
      });
      return card;
    },
    /* calendar grid, Google Calendar grammar */
    cal: function (c) {
      return el('app-card c-cal',
        '<div class="app-card-head"><span class="svc-badge gc-badge"><i></i>Google Calendar</span><span class="tag">' + c.title + '</span></div>' +
        '<div class="gc-grid">' + c.days.map(function (d) {
          return '<div class="gc-day"><div class="gc-dn">' + d.n + '</div>' +
            d.slots.map(function (s) {
              return '<div class="gc-slot' + (s.free ? ' free' : '') + (s.sel ? ' sel' : '') + '">' + s.t + (s.free ? '' : ' · зайнято') + '</div>';
            }).join('') + '</div>';
        }).join('') + '</div>');
    },
    /* booking confirmation with price */
    confirm: function (c) {
      return el('app-card c-confirm',
        '<div class="pay-row"><span>' + c.label + '</span><b>' + c.when + '</b></div>' +
        (c.sum ? '<div class="rc-meta">' + c.sum + '</div>' : '') +
        '<div class="pay-done"><span class="stamp">✓ ЗАПИС ПІДТВЕРДЖЕНО</span></div>' +
        (c.note ? '<div class="cf-note">' + c.note + '</div>' : ''));
    },
    /* owner-value plate — the money line of the scene */
    plate: function (c) {
      return el('value-plate', c.text);
    },
    cta: function (c) {
      return el('app-card c-cta',
        '<div class="cta-t">' + c.title + '</div><div class="cta-x">' + c.text + '</div>' +
        '<div class="cta-b"><a class="btn" href="https://t.me/yesmcp">Написати в Telegram <span class="arr">→</span></a>' +
        '<a class="btn ghost" href="mailto:yes@yesmcp.com?subject=Показ%20за%2015%20хвилин">Email</a></div>' +
        '<div class="cta-alt">15 хвилин, живий продукт з телефона · yes@yesmcp.com</div>');
    }
  };

  /* ---------- the script (uk) ---------- */

  var CTA = { card: { type: 'cta', title: 'Хочете так само у своєму бізнесі?', text: 'Покажемо живий продукт з телефона за 15 хвилин — без слайдів.' } };

  var SCRIPT = {
    start: {
      steps: [
        { a: 'Вітаю 👋 Я — агент, якого Yes MCP будує для бізнесу. Я живу в чаті вашого клієнта — після того, як він раз підключив вас одним посиланням.' },
        { a: 'Покажу на вашому прикладі. Хто ви?' }
      ],
      chips: [
        { t: '🛍  У мене інтернет-магазин', go: 'shop1' },
        { t: '🎓  Я експерт, продаю курс', go: 'exp1' },
        { t: '📅  У мене послуги й записи', go: 'svc1' }
      ]
    },

    /* ===== SHOP: repeat sale · waitlist · discount rule ===== */
    shop1: {
      steps: [{ a: 'Ролі: я — ваш магазин, ви — ваш ПОСТІЙНИЙ клієнт. У березні ви купили в мене бігові. Сьогодні пишете:' }],
      chips: [{ t: 'Мої бігові ще є? Хочу такі самі, 42', go: 'shop2' }]
    },
    shop2: {
      steps: [
        { a: 'Дивлюсь вашу історію: WaterGrip City, сірі, 42, березень. Є в наявності — і є оновлена модель:' },
        { card: { type: 'product', title: 'Ваш магазин · Ваша історія', img: '/assets/img/sneaker.jpg', name: 'WaterGrip City 2', price: '₴3 490', vars: ['Сірі', 'Чорні'] } }
      ],
      chips: [{ t: 'Беру оновлені', go: 'shop3' }]
    },
    shop3: {
      steps: [
        { card: { type: 'order', label: 'WaterGrip City 2 · сірі · 42', sum: '₴3 490' } },
        { sys: '→ безпечна сторінка оплати monobank…' },
        { card: { type: 'pay', label: 'WaterGrip City 2 · сірі · 42', sum: '₴3 490' } },
        { card: { type: 'track', ttn: '20450 8412', steps: ['Оплачено', 'Передано в доставку', 'У відділенні'], at: 1 } },
        { card: { type: 'plate', text: '💰 Повторний продаж за хвилину · 0 хвилин вашого менеджера' } }
      ],
      chips: [
        { t: 'А дай знижку 50% 😏', go: 'shop4' },
        { t: 'Сповісти, коли зʼявиться колір', go: 'notify' },
        { t: 'А як це для експерта?', go: 'exp1' }
      ]
    },
    shop4: {
      steps: [
        { a: 'Розумію азарт 🙂 Але правила знижок встановлюєте ви — власник. Моя межа: −10% на другу пару. Тримаюся ваших правил, а не піддаюся тиску.' },
        { card: { type: 'plate', text: '🛡 Маржа захищена · агент діє за вашими правилами' } },
        CTA
      ],
      chips: [
        { t: 'А як це для експерта?', go: 'exp1' },
        { t: 'А для послуг і записів?', go: 'svc1' }
      ]
    },
    notify: {
      steps: [
        { u: 'А лофери CityStep у теракотовому є? 42-й' },
        { a: 'Теракотових зараз немає — є сині та сірі. Сповістити, щойно приїдуть?' },
        { u: 'Так, сповісти' },
        { sys: '· · · через 5 днів · · ·' },
        { a: 'Теракотові приїхали 👌 Тримаю пару 42 за вами до вечора:' },
        { card: { type: 'product', title: 'Ваш магазин · Лист очікування', img: '/assets/img/loafers.jpg', name: 'CityStep Loafers', price: '₴2 890', vars: ['Теракотові', 'Сині', 'Сірі'], sel: 0 } },
        { card: { type: 'plate', text: '📦 Продаж з листа очікування · без жодної розсилки' } },
        CTA
      ],
      chips: [
        { t: 'А як це для експерта?', go: 'exp1' },
        { t: 'А для послуг і записів?', go: 'svc1' }
      ]
    },

    /* ===== EXPERT: English course — explain · exercise · IP shield · upsell ===== */
    exp1: {
      steps: [{ a: 'Ролі: я — наставник вашого курсу англійської, ви — ваш студент. Вівторок, 21:30, до заняття два дні. Ви пишете:' }],
      chips: [{ t: 'Не зрозумів Present Perfect з уроку 4 😩', go: 'exp2' }]
    },
    exp2: {
      steps: [
        { a: 'Розберімо — коротко, за вашим уроком 4:' },
        { card: { type: 'source', quote: 'Present Perfect — це міст між минулим і зараз: дія сталась, а результат живе досі. «I have lost my keys» — ключі й досі загублені.', ref: 'Урок 4 · Граматика · 12:30' } },
        { a: 'Спробуєте? Оберіть правильне:' },
        { card: { type: 'quiz', title: 'Ваш курс · Урок 4', q: 'She ___ in Kyiv since 2020.', opts: ['lives', 'has lived', 'lived'], correct: 1, goOk: 'exp2ok', goBad: 'exp2bad' } }
      ],
      chips: []
    },
    exp2ok: {
      steps: [
        { a: 'Так! Дія почалась у 2020 і триває — тому «has lived». Ваша серія росте:' },
        { card: { type: 'streak', title: 'Тиждень 6 · Ваш курс', fire: '12 днів', days: [{ t: 'пн', on: 1 }, { t: 'вт', on: 1 }, { t: 'ср', on: 1 }, { t: 'чт', on: 1 }, { t: 'пт', on: 1 }, { t: 'сб' }, { t: 'нд' }], note: 'Пройдено 86% рівня B1' } },
        { card: { type: 'plate', text: '🌙 Студент займається о 21:30 · без вашої участі' } }
      ],
      chips: [
        { t: 'Скинь мені всі уроки PDF 😏', go: 'exp3' },
        { t: 'Що далі після B1?', go: 'exp4' }
      ]
    },
    exp2bad: {
      steps: [
        { a: 'Майже! Правильно — «has lived»: дія почалась у 2020 і триває досі. Саме тому Present Perfect. Повторимо це завтра у вправах.' },
        { card: { type: 'plate', text: '🌙 Помилку розібрано о 21:30 · без вашої участі' } }
      ],
      chips: [
        { t: 'Скинь мені всі уроки PDF 😏', go: 'exp3' },
        { t: 'Що далі після B1?', go: 'exp4' }
      ]
    },
    exp3: {
      steps: [
        { a: 'Не можу — матеріали курсу лишаються в курсі, така політика автора. Але я розберу з вами будь-який урок просто тут, скільки завгодно разів.' },
        { card: { type: 'plate', text: '🔒 Курс захищено від зливу · доступ — лише через розмову' } },
        CTA
      ],
      chips: [
        { t: 'Що далі після B1?', go: 'exp4' },
        { t: 'А як це для магазину?', go: 'shop1' }
      ]
    },
    exp4: {
      steps: [
        { a: 'Ваш B1 закінчується за 2 тижні: пройдено 86%, серія 12 днів. Наступний потік B2 стартує 1 жовтня — тримаю за вами місце?' },
        { card: { type: 'order', label: 'Курс B2 · потік 1 жовтня', sum: '₴4 900' } },
        { sys: '→ безпечна сторінка оплати monobank…' },
        { card: { type: 'pay', label: 'Курс B2 · потік 1 жовтня', sum: '₴4 900', op: '84 307' } },
        { card: { type: 'plate', text: '💰 Продовження продано вночі · 0 дзвінків вашого менеджера' } },
        CTA
      ],
      chips: [
        { t: 'А як це для магазину?', go: 'shop1' },
        { t: 'А для послуг і записів?', go: 'svc1' }
      ]
    },

    /* ===== SERVICES: night booking · prepay rule · reschedule+waitlist ===== */
    svc1: {
      steps: [{ a: 'Ролі: я — адміністратор вашої студії, ви — клієнт. Пʼятниця, 23:40 — офіс давно спить. Ви пишете:' }],
      chips: [{ t: 'Хочу запис на масаж завтра', go: 'svc2' }]
    },
    svc2: {
      steps: [
        { a: 'Дивлюсь розклад суботи:' },
        { card: { type: 'cal', title: 'Субота', days: [{ n: 'Сб 14.09', slots: [{ t: '11:00', free: 1 }, { t: '14:00', free: 1 }, { t: '17:30' }] }] } }
      ],
      chips: [{ t: 'Субота, 14:00', go: 'svc3' }]
    },
    svc3: {
      steps: [
        { card: { type: 'confirm', label: 'Масаж · 60 хв', when: 'Сб, 14:00', sum: '₴900 · передоплата 30% — ₴270', note: 'Нагадаю за день і за годину.' } },
        { card: { type: 'plate', text: '💰 Запис о 23:40 · 0 хвилин адміністратора' } }
      ],
      chips: [
        { t: 'А можна без передоплати?', go: 'svc4' },
        { t: 'А перенести запис?', go: 'svcmove' },
        { t: 'А як це для магазину?', go: 'shop1' }
      ]
    },
    svc4: {
      steps: [
        { a: 'На пікові години діє правило студії: передоплата 30% зберігає слот за вами. Це правило встановили ви як власник — я його тримаю, ввічливо і щоразу.' },
        { card: { type: 'plate', text: '🛡 Неявки закриті передоплатою · правило — ваше' } },
        CTA
      ],
      chips: [
        { t: 'А перенести запис?', go: 'svcmove' },
        { t: 'А як це для експерта?', go: 'exp1' }
      ]
    },
    svcmove: {
      steps: [
        { u: 'Перенеси мій запис із суботи' },
        { a: 'Ваш запис — масаж, сб 14:00. Куди переносимо? Вільно:' },
        { card: { type: 'cal', title: 'Наступні дні', days: [{ n: 'Нд 15.09', slots: [{ t: '12:00', free: 1 }] }, { n: 'Вт 17.09', slots: [{ t: '18:30', free: 1 }] }, { n: 'Ср 18.09', slots: [{ t: '9:00', free: 1 }] }] } }
      ],
      chips: [{ t: 'Неділя, 12:00', go: 'svcmove2' }]
    },
    svcmove2: {
      steps: [
        { card: { type: 'confirm', label: 'Масаж · 60 хв', when: 'Нд, 12:00', sum: '₴900 · передоплату перенесено', note: 'Суботнє вікно звільнено — вже пропонується наступному з листа очікування.' } },
        { card: { type: 'plate', text: '💰 Вікно не згоріло · продається повторно само' } },
        CTA
      ],
      chips: [
        { t: 'А як це для магазину?', go: 'shop1' },
        { t: 'А для експерта?', go: 'exp1' }
      ]
    }
  };

  /* ---------- engine ---------- */

  var DELAY = reduced ? 0 : 900;
  var busy = false;

  function scrollDown() { $chat.scrollTop = $chat.scrollHeight; }

  function addBubble(who, text) {
    var b = el(who === 'u' ? 'bubble-user pop-in' : 'bubble-ai pop-in', text);
    $chat.appendChild(b); scrollDown(); return b;
  }

  function addTyping() {
    var t = el('bubble-ai typing pop-in', '<i></i><i></i><i></i>');
    $chat.appendChild(t); scrollDown(); return t;
  }

  function setChips(chips) {
    $chips.innerHTML = '';
    (chips || []).forEach(function (c) {
      var b = document.createElement(c.href ? 'a' : 'button');
      b.className = 'chip pop-in';
      b.textContent = c.t;
      if (c.href) b.href = c.href;
      else b.addEventListener('click', function () { if (!busy) { addBubble('u', c.t); play(c.go); } });
      $chips.appendChild(b);
    });
    scrollDown();
  }

  function play(id) {
    var node = SCRIPT[id]; if (!node) return;
    busy = true; setChips([]);
    var i = 0;
    function next() {
      if (i >= node.steps.length) { busy = false; setChips(node.chips); return; }
      var s = node.steps[i++];
      if (s.u) { addBubble('u', s.u); setTimeout(next, DELAY * 0.6); return; }
      if (s.sys) {
        $chat.appendChild(el('sysline pop-in', s.sys)); scrollDown();
        setTimeout(next, DELAY * 1.1); return;
      }
      var t = addTyping();
      setTimeout(function () {
        t.remove();
        if (s.a) addBubble('a', s.a);
        else if (s.card) { var c = CARDS[s.card.type](s.card); c.classList.add('pop-in'); $chat.appendChild(c); }
        scrollDown();
        setTimeout(next, DELAY * 0.7);
      }, s.card ? DELAY : DELAY * (0.5 + Math.min(1.6, (s.a || '').length / 90)));
    }
    next();
  }

  play('start');

  /* jump chips (scenarios row + footer): scroll up, add a scene divider, play the node */
  document.querySelectorAll('.jump').forEach(function (j) {
    j.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
      $chat.appendChild(el('sysline', '— нова сцена —'));
      if (j.dataset.say) addBubble('u', j.dataset.say);
      play(j.dataset.go);
    });
  });

  /* scroll reveals */
  var revealed = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window) || reduced) {
    revealed.forEach(function (n) { n.classList.add('on'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.15 });
    revealed.forEach(function (n) { io.observe(n); });
  }
})();
