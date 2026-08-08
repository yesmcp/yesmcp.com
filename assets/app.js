/* Yes MCP landing — reveal choreography + chat demo player + sticky CTA.
   No dependencies. Everything degrades to visible content without JS. */
(function () {
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* scroll reveals */
  var revealed = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window) || reduced) {
    revealed.forEach(function (el) { el.classList.add('on'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.15 });
    revealed.forEach(function (el) { io.observe(el); });
  }

  /* chat demo: play scene 1, then crossfade to scene 2, loop */
  var chat = document.querySelector('.chat');
  if (chat) {
    var scenes = chat.querySelectorAll('.scene');
    var dots = document.querySelectorAll('.scene-dots i');
    var idx = 0, timer = null;
    var show = function (i) {
      idx = i;
      scenes.forEach(function (s, k) { s.classList.toggle('live', k === i); });
      dots.forEach(function (d, k) { d.classList.toggle('on', k === i); });
    };
    var cycle = function () {
      timer = setTimeout(function () {
        show((idx + 1) % scenes.length);
        cycle();
      }, idx === 0 ? 7000 : 6500);
    };
    if (reduced || scenes.length < 2) {
      show(0);
    } else if ('IntersectionObserver' in window) {
      var seen = false;
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && !seen) { seen = true; show(0); cycle(); cio.disconnect(); }
        });
      }, { threshold: 0.4 });
      cio.observe(chat);
    } else {
      show(0); cycle();
    }
    dots.forEach(function (d, k) {
      d.addEventListener('click', function () { clearTimeout(timer); show(k); cycle(); });
    });
  }

  /* sticky mobile CTA — appears after the hero scrolls away */
  var bar = document.querySelector('.sticky-cta');
  var hero = document.querySelector('.hero');
  if (bar && hero && 'IntersectionObserver' in window) {
    var bio = new IntersectionObserver(function (entries) {
      bar.classList.toggle('show', !entries[0].isIntersecting);
    }, { threshold: 0 });
    bio.observe(hero);
  }
})();
