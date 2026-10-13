/* ---------------------------------------------------------------------
   Renders everything in window.SITE_DATA into the page. Pure vanilla —
   hand-rolled SVG bars so there is no library to keep up to date.
   --------------------------------------------------------------------- */
(function () {
  var D = window.SITE_DATA;
  if (!D) return;

  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  };

  function stars(n) {
    var full = Math.floor(n);
    return '★'.repeat(full) + (n - full >= 0.5 ? '½' : '');
  }

  /* ---- shared tooltip ------------------------------------------- */
  var tip = document.createElement('div');
  tip.className = 'chart-tip';
  document.body.appendChild(tip);

  function attachTip(el, html) {
    el.addEventListener('mouseenter', function () {
      tip.innerHTML = html;
      tip.style.display = 'block';
    });
    el.addEventListener('mousemove', function (e) {
      tip.style.left = (e.pageX + 14) + 'px';
      tip.style.top = (e.pageY - 10) + 'px';
    });
    el.addEventListener('mouseleave', function () { tip.style.display = 'none'; });
  }

  /* ---- bookshelf -------------------------------------------------- */
  (function () {
    var host = $('book-list');
    if (!host || !D.reading) return;
    var books = D.reading.recent || [];

    host.innerHTML = books.map(function (b, i) {
      // Vary the heights a little so the shelf looks like a real shelf.
      var h = 110 + ((b.title.length * 7 + i * 13) % 42);
      var w = 22 + ((b.author.length * 3) % 12);
      var lean = i === books.length - 1 ? ' lean' : '';
      return '<span class="spine' + lean + '" data-i="' + i + '" style="height:' + h +
        'px;width:' + w + 'px;background:' + b.colour + '">' + esc(b.title) + '</span>';
    }).join('');

    Array.prototype.forEach.call(host.querySelectorAll('.spine'), function (el) {
      var b = books[+el.dataset.i];
      attachTip(el, '<strong>' + esc(b.title) + '</strong><br>' + esc(b.author) +
        '<br><span class="media-stars">' + stars(b.stars) + '</span>');
    });
  })();

  /* ---- reading goal meter ----------------------------------------- */
  (function () {
    var host = $('goal-meter');
    if (!host || !D.reading || !D.reading.goal) return;
    var g = D.reading.goal;
    var pct = Math.min(100, Math.round((g.done / g.target) * 100));
    host.innerHTML =
      '<div class="glabel"><span>' + g.year + ' reading goal</span>' +
      '<span>' + g.done + ' / ' + g.target + '</span></div>' +
      '<div class="track"><div class="fill' + (pct >= 100 ? ' done' : '') +
      '" style="width:' + pct + '%"></div></div>';
  })();

  /* ---- bar chart helper ------------------------------------------- */
  function barChart(host, items, opts) {
    if (!host) return;
    opts = opts || {};
    var W = 640, H = 200, padL = 10, padB = 28, padT = 24;
    var n = items.length;
    var max = Math.max.apply(null, items.map(function (d) { return d.value; })) || 1;
    var slot = (W - padL * 2) / n;
    var bw = Math.max(8, slot * 0.62);

    var svg = ['<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' +
      esc(opts.label || 'bar chart') + '">'];

    items.forEach(function (d, i) {
      var h = Math.round(((H - padB - padT) * d.value) / max);
      var x = padL + slot * i + (slot - bw) / 2;
      var y = H - padB - h;
      svg.push('<rect class="bar' + (opts.alt ? ' alt' : '') + '" data-i="' + i +
        '" x="' + x + '" y="' + y + '" width="' + bw + '" height="' + Math.max(h, 3) + '"/>');
      svg.push('<text class="cap" x="' + (x + bw / 2) + '" y="' + (y - 6) +
        '" text-anchor="middle">' + d.value + '</text>');
      svg.push('<text class="tick" x="' + (x + bw / 2) + '" y="' + (H - 8) +
        '" text-anchor="middle">' + esc(d.label) + '</text>');
    });

    svg.push('<line class="axis" x1="' + padL + '" y1="' + (H - padB) +
      '" x2="' + (W - padL) + '" y2="' + (H - padB) + '"/>');
    svg.push('</svg>');
    host.innerHTML = svg.join('');

    Array.prototype.forEach.call(host.querySelectorAll('.bar'), function (el) {
      var d = items[+el.dataset.i];
      attachTip(el, '<strong>' + esc(d.tipTitle || d.label) + '</strong><br>' + esc(d.tip || d.value));
    });
  }

  /* ---- books per year --------------------------------------------- */
  (function () {
    var host = document.querySelector('#books-year .chart-body');
    if (!host || !D.reading) return;
    barChart(host, (D.reading.perYear || []).map(function (d) {
      return {
        label: String(d.year).slice(2),
        value: d.count,
        tipTitle: d.year,
        tip: d.count + (d.count === 1 ? ' book' : ' books')
      };
    }), { label: 'Books read per year' });
  })();

  /* ---- reading fun line ------------------------------------------- */
  if ($('book-fun') && D.reading) $('book-fun').textContent = D.reading.funLine || '';

  /* ---- letterboxd four -------------------------------------------- */
  (function () {
    var host = $('four-grid');
    if (!host || !D.watching) return;
    host.innerHTML = (D.watching.four || []).map(function (f) {
      var tile = f.poster
        ? '<img class="poster" src="' + esc(f.poster) + '" alt="' + esc(f.title) + ' poster">'
        : '<div class="poster" style="background:' + (f.colour || 'var(--sage)') + '">' +
          esc(f.title) + '</div>';
      return '<figure>' + tile + '<figcaption>' + stars(f.stars) + '</figcaption></figure>';
    }).join('');
  })();

  /* ---- recently watched ------------------------------------------- */
  (function () {
    var host = $('film-list');
    if (!host || !D.watching) return;
    host.innerHTML = (D.watching.recent || []).map(function (f) {
      return '<li><span class="mtitle">' + esc(f.title) + '</span>' +
        '<span class="media-meta">' + esc(f.year) + '</span>' +
        '<span class="media-stars">' + stars(f.stars) + '</span></li>';
    }).join('');
  })();

  /* ---- rating distribution ---------------------------------------- */
  (function () {
    var host = document.querySelector('#film-ratings .chart-body');
    if (!host || !D.watching) return;
    var labels = ['½', '1', '1½', '2', '2½', '3', '3½', '4', '4½', '5'];
    barChart(host, (D.watching.ratings || []).map(function (v, i) {
      return {
        label: labels[i],
        value: v,
        tipTitle: labels[i] + ' stars',
        tip: v + (v === 1 ? ' film' : ' films')
      };
    }), { label: 'Rating distribution', alt: true });
  })();

  if ($('film-fun') && D.watching) $('film-fun').textContent = D.watching.funLine || '';

  /* ---- playing ----------------------------------------------------- */
  (function () {
    if (!D.playing) return;
    var row = $('trophy-row');
    if (row) {
      var t = D.playing.trophies || {};
      var kinds = [
        ['Platinum', t.platinum, '#b58fb8'],
        ['Gold',     t.gold,     '#e8c15c'],
        ['Silver',   t.silver,   '#c9ced8'],
        ['Bronze',   t.bronze,   '#c08457']
      ];
      row.innerHTML = kinds.map(function (k) {
        return '<span class="tchip"><i style="background:' + k[2] + '"></i>' +
          k[0] + ' ' + (k[1] || 0) + '</span>';
      }).join('');
    }

    var list = $('psn-list');
    if (list) {
      list.innerHTML = (D.playing.recent || []).map(function (g) {
        return '<li><span class="mtitle">' + esc(g.name) + '</span>' +
          '<span class="media-meta"></span>' +
          '<span class="media-stars">' + esc(g.meta) + '</span></li>';
      }).join('');
    }

    if ($('trophy-line')) $('trophy-line').textContent = D.playing.funLine || '';
  })();
})();
