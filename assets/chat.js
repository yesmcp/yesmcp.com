/* Yes MCP — the site opens as a chat. Scripted branches, no API, no deps.
   Script nodes: steps = [{a:text}|{u:text}|{card:{...}}], chips = [{t, go|href}]. */
(function () {
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $chat = document.getElementById('chatlog');
  var $chips = document.getElementById('chips');
  if (!$chat) return;

  /* ---------- card renderers ---------- */

  function el(cls, html) { var d = document.createElement('div'); d.className = cls; d.innerHTML = html; return d; }

  var CARDS = {
    product: function (c) {
      return el('app-card c-product',
        '<div class="app-card-head"><span>' + c.title + '</span><span class="tag">ВАШ БРЕНД</span></div>' +
        '<div class="p-body"><div class="p-img">' + c.img + '</div><div class="p-info">' +
        '<div class="p-name">' + c.name + '</div><div class="p-price">' + c.price + '</div>' +
        '<div class="p-vars">' + c.vars.map(function (v, i) { return '<span class="p-var' + (i === 0 ? ' sel' : '') + '">' + v + '</span>'; }).join('') + '</div>' +
        '</div></div>');
    },
    pay: function (c) {
      return el('app-card c-pay',
        '<div class="pay-row"><span>' + c.label + '</span><b>' + c.sum + '</b></div>' +
        '<div class="pay-done"><span class="stamp">✓ ОПЛАЧЕНО В ЧАТІ</span></div>');
    },
    track: function (c) {
      return el('app-card c-track',
        '<div class="app-card-head"><span>' + c.title + '</span><span class="tag">ВАШ БРЕНД</span></div>' +
        '<div class="tr-steps">' + c.steps.map(function (s, i) {
          return '<div class="tr-step' + (i <= c.at ? ' on' : '') + '"><i></i>' + s + '</div>';
        }).join('') + '</div>');
    },
    week: function (c) {
      return el('app-card c-week',
        '<div class="app-card-head"><span>' + c.title + '</span><span class="tag">ВАШ БРЕНД</span></div>' +
        '<div class="week">' + c.days.map(function (d) {
          return '<span class="day' + (d.on ? ' done tick' : '') + '">' + d.t + '</span>';
        }).join('') + '</div>' +
        '<div class="app-card-foot"><span class="note">' + c.note + '</span><span class="mini-btn">' + c.btn + '</span></div>');
    },
    source: function (c) {
      return el('app-card c-source',
        '<div class="quote-line">«' + c.quote + '»</div>' +
        '<div class="src-meta"><span>' + c.ref + '</span><span class="stamp">✓ ПЕРЕВІРЕНО ДОСЛІВНО</span></div>');
    },
    slots: function (c) {
      return el('app-card c-slots',
        '<div class="app-card-head"><span>' + c.title + '</span><span class="tag">ВАШ БРЕНД</span></div>' +
        '<div class="slot-list">' + c.slots.map(function (s, i) {
          return '<span class="slot' + (i === c.sel ? ' sel' : '') + '">' + s + '</span>';
        }).join('') + '</div>');
    },
    confirm: function (c) {
      return el('app-card c-confirm',
        '<div class="pay-row"><span>' + c.label + '</span><b>' + c.when + '</b></div>' +
        '<div class="pay-done"><span class="stamp">✓ ЗАПИС ПІДТВЕРДЖЕНО</span></div>' +
        (c.note ? '<div class="cf-note">' + c.note + '</div>' : ''));
    },
    cta: function (c) {
      return el('app-card c-cta',
        '<div class="cta-t">' + c.title + '</div><div class="cta-x">' + c.text + '</div>' +
        '<div class="cta-b"><a class="btn" href="https://t.me/yesmcp">' + c.btn + ' <span class="arr">→</span></a>' +
        '<a class="btn ghost" href="' + c.mail + '">Email</a></div>' +
        '<div class="cta-alt">yes@yesmcp.com · відповідаємо в той самий день</div>');
    }
  };

  /* ---------- the script (uk) ---------- */

  var MAIL = 'mailto:yes@yesmcp.com?subject=Показ%20за%2015%20хвилин';
  var CTA = { card: { type: 'cta', title: 'Хочете так само у своєму бізнесі?', text: 'Покажемо живий продукт з телефона за 15 хвилин — без слайдів.', btn: 'Написати в Telegram', mail: MAIL } };

  var SCRIPT = {
    start: {
      steps: [
        { a: 'Вітаю 👋 Я — приклад того, що Yes MCP будує для бізнесу: агент, який живе просто в чаті вашого клієнта — у ChatGPT, Claude чи Gemini.' },
        { a: 'Покажу на вашому прикладі. Хто ви?' }
      ],
      chips: [
        { t: '🛍\u00a0 У мене інтернет-магазин', go: 'shop1' },
        { t: '🎓\u00a0 Я експерт, продаю курс', go: 'exp1' },
        { t: '📅\u00a0 У мене послуги й записи', go: 'svc1' }
      ]
    },

    /* --- shop --- */
    shop1: {
      steps: [
        { a: 'Чудово. Тоді помінімося ролями: я — ваш магазин, ви — ваш клієнт. Напишіть, як пишуть люди:' }
      ],
      chips: [{ t: 'Підбери кросівки на дощ, розмір 42', go: 'shop2' }]
    },
    shop2: {
      steps: [
        { a: 'Дивлюсь ваш каталог… Під дощ беруть ці, 42-й є в наявності:' },
        { card: { type: 'product', title: 'Ваш магазин · Каталог', img: '👟', name: 'WaterGrip City', price: '₴3 490', vars: ['Сірі', 'Чорні'] } }
      ],
      chips: [{ t: 'Беру сірі', go: 'shop3' }]
    },
    shop3: {
      steps: [
        { card: { type: 'pay', label: 'WaterGrip City · сірі · 42', sum: '₴3 490' } },
        { a: 'Готово. Без сайту, кошика, реєстрації і листа «підтвердіть email» — гроші у вас, клієнт не виходив із розмови.' },
        { card: { type: 'track', title: 'Замовлення №1204', steps: ['Оплачено', 'Передано в доставку', 'У відділенні'], at: 1 } },
        { a: 'І статус замовлення він теж спитає тут — не дзвінком у ваш офіс.' }
      ],
      chips: [
        { t: 'А дай знижку 50% 😏', go: 'shop4' },
        { t: 'А як це для експерта?', go: 'exp1' },
        { t: 'А для послуг і записів?', go: 'svc1' }
      ]
    },
    shop4: {
      steps: [
        { a: 'Розумію азарт 🙂 Але правила тут встановлюєте ви — власник. Мені дозволено запропонувати −10% на другу пару, і це моя межа: я тримаюся ваших правил, а не піддаюся тиску.' },
        { a: 'Це і є головна відмінність від «просто чат-бота»: агент грає за вашими правилами — у знижках, обіцянках і формулюваннях.' },
        CTA
      ],
      chips: [
        { t: 'А як це для експерта?', go: 'exp1' },
        { t: 'А для послуг і записів?', go: 'svc1' }
      ]
    },

    /* --- expert --- */
    exp1: {
      steps: [
        { a: 'Тоді я — наставник за вашою методикою, а ви — ваш учень. Між заняттями учень питає:' }
      ],
      chips: [{ t: 'Як пройшов мій тиждень практики?', go: 'exp2' }]
    },
    exp2: {
      steps: [
        { a: 'Переглянув ваш журнал. П’ять днів із семи — ось тиждень:' },
        { card: { type: 'week', title: 'Тиждень 3 · Ранкова практика', days: [{ t: 'пн', on: 1 }, { t: 'вт', on: 1 }, { t: 'ср', on: 1 }, { t: 'чт' }, { t: 'пт', on: 1 }, { t: 'сб', on: 1 }, { t: 'нд' }], note: 'Найдовша серія: 3 дні', btn: 'Записати сьогодні ✓' } }
      ],
      chips: [{ t: 'А це точно з мого курсу?', go: 'exp3' }]
    },
    exp3: {
      steps: [
        { a: 'Так — я відповідаю лише за вашими матеріалами, і кожну цитату можна перевірити:' },
        { card: { type: 'source', quote: 'Практика росте не із зусилля, а з повернення до неї.', ref: 'Модуль 3 · Лекція 2 · 12:47' } },
        { a: 'А якщо спитають те, чого у курсі немає, — я чесно скажу: «цього в матеріалах немає». Ваша репутація — не поле для імпровізацій.' },
        CTA
      ],
      chips: [
        { t: 'А як це для магазину?', go: 'shop1' },
        { t: 'А для послуг і записів?', go: 'svc1' }
      ]
    },

    /* --- services --- */
    svc1: {
      steps: [
        { a: 'Тоді я — адміністратор вашої студії, а ви — клієнт. Субота, вечір, ваш офіс не відповідає. Клієнт пише:' }
      ],
      chips: [{ t: 'Хочу запис на масаж цієї суботи', go: 'svc2' }]
    },
    svc2: {
      steps: [
        { a: 'На суботу вільні три вікна:' },
        { card: { type: 'slots', title: 'Субота, 14 вересня', slots: ['11:00', '14:00', '17:30'], sel: -1 } }
      ],
      chips: [{ t: 'Субота, 14:00', go: 'svc3' }]
    },
    svc3: {
      steps: [
        { card: { type: 'confirm', label: 'Масаж · 60 хв', when: 'Сб, 14:00', note: 'Нагадаю за день і за годину — щоб запис не «загубився».' } },
        { a: 'Запис зроблено о 23:40 суботи — коли адміністратор спав. Жодного пропущеного клієнта.' },
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

  /* ---------- hosts tabs ---------- */

  var tabs = document.querySelectorAll('.host-tab');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) { x.classList.toggle('on', x === t); });
      var frame = document.querySelector('.host-frame');
      if (frame) {
        frame.dataset.host = t.dataset.host;
        var lbl = frame.querySelector('.hf-label');
        if (lbl) lbl.textContent = t.dataset.label;
      }
    });
  });

  /* ---------- scroll reveals (shared with v2) ---------- */

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
