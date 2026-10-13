/* ---------------------------------------------------------------------
   darts.exe — pull back, let go, hit something.

   Board geometry uses real proportions (mm), drawn into a 440-unit SVG
   with the board centred at (200, 200):
     bull 6.35 · outer bull 15.9 · treble 99-107 · double 162-170
   --------------------------------------------------------------------- */
(function () {
  var D = window.DARTS_DATA;
  if (!D) return;

  var svg = document.getElementById('board');
  if (!svg) return;

  var CX = 200, CY = 200;
  var R_BULL = 6.35, R_OBULL = 15.9;
  var R_TIN = 99, R_TOUT = 107, R_DIN = 162, R_DOUT = 170;
  var R_RING = 188;                    // outer number ring
  var LAUNCH = { x: 200, y: 420 };     // where the dart leaves your hand
  var POWER_K = 2.2;                   // pull pixels -> travel pixels
  var MAX_PULL = 130;

  // Clockwise from the top.
  var ORDER = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

  var NS = 'http://www.w3.org/2000/svg';
  function el(name, attrs) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  // deg measured from the top, clockwise
  function pt(r, deg) {
    var a = (deg - 90) * Math.PI / 180;
    return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
  }
  function wedge(r1, r2, a1, a2) {
    var o1 = pt(r2, a1), o2 = pt(r2, a2), i2 = pt(r1, a2), i1 = pt(r1, a1);
    return 'M' + o1.x + ' ' + o1.y +
      'A' + r2 + ' ' + r2 + ' 0 0 1 ' + o2.x + ' ' + o2.y +
      'L' + i2.x + ' ' + i2.y +
      'A' + r1 + ' ' + r1 + ' 0 0 0 ' + i1.x + ' ' + i1.y + 'Z';
  }

  /* ---- draw the board ------------------------------------------- */
  var board = el('g', {});
  svg.appendChild(board);

  board.appendChild(el('circle', { cx: CX, cy: CY, r: R_RING, class: 'd-surround' }));

  for (var i = 0; i < 20; i++) {
    var a1 = i * 18 - 9, a2 = i * 18 + 9;
    var dark = i % 2 === 0;
    // inner single, treble, outer single, double
    board.appendChild(el('path', { d: wedge(R_OBULL, R_TIN, a1, a2), class: dark ? 'd-dark' : 'd-light' }));
    board.appendChild(el('path', { d: wedge(R_TIN, R_TOUT, a1, a2), class: dark ? 'd-red' : 'd-green' }));
    board.appendChild(el('path', { d: wedge(R_TOUT, R_DIN, a1, a2), class: dark ? 'd-dark' : 'd-light' }));
    board.appendChild(el('path', { d: wedge(R_DIN, R_DOUT, a1, a2), class: dark ? 'd-red' : 'd-green' }));

    var np = pt((R_DOUT + R_RING) / 2 + 2, i * 18);
    var t = el('text', { x: np.x, y: np.y, class: 'd-num', 'text-anchor': 'middle', 'dominant-baseline': 'central' });
    t.textContent = ORDER[i];
    board.appendChild(t);
  }

  board.appendChild(el('circle', { cx: CX, cy: CY, r: R_OBULL, class: 'd-green' }));
  board.appendChild(el('circle', { cx: CX, cy: CY, r: R_BULL, class: 'd-red' }));

  // The oche: a resting marker so the throwing strip reads as deliberate.
  board.appendChild(el('line', {
    x1: 40, y1: 404, x2: 360, y2: 404, class: 'd-oche'
  }));
  board.appendChild(el('circle', { cx: LAUNCH.x, cy: LAUNCH.y, r: 4, class: 'd-hand-rest' }));
  var hint = el('text', { x: 360, y: 434, class: 'd-oche-label', 'text-anchor': 'end' });
  hint.textContent = 'drag back from here';
  board.appendChild(hint);

  /* ---- aim line, darts, dynamic layers --------------------------- */
  var shots = el('g', {});
  var aim = el('g', { class: 'd-aim' });
  svg.appendChild(shots);
  svg.appendChild(aim);

  /* ---- scoring ---------------------------------------------------- */
  function scoreAt(x, y) {
    var dx = x - CX, dy = y - CY;
    var r = Math.sqrt(dx * dx + dy * dy);

    if (r <= R_BULL)  return { score: 50, label: 'Bullseye', kind: 'bull', seg: 'BULL' };
    if (r <= R_OBULL) return { score: 25, label: 'Outer bull', kind: 'outerBull', seg: '25' };
    if (r > R_DOUT)   return { score: 0,  label: 'Off the board', kind: 'miss', seg: null };

    var deg = (Math.atan2(dy, dx) * 180 / Math.PI + 90 + 9 + 360) % 360;
    var n = ORDER[Math.floor(deg / 18)];

    if (r >= R_TIN && r <= R_TOUT) return { score: n * 3, label: 'Treble ' + n, kind: 'treble', seg: 'T' + n, num: n };
    if (r >= R_DIN)                return { score: n * 2, label: 'Double ' + n, kind: 'double', seg: 'D' + n, num: n };
    return { score: n, label: 'Single ' + n, kind: 'single', seg: 'S' + n, num: n };
  }

  /* ---- state ------------------------------------------------------ */
  var thrown = 0, total = 0, factIdx = 0, inFlight = [];
  var seen = {};          // segments already hit, so facts do not repeat
  var unlocked = false;
  try { unlocked = localStorage.getItem('darts-t20') === '1'; } catch (e) {}

  var $ = function (id) { return document.getElementById(id); };
  var elScore = $('d-score'), elLabel = $('d-label'), elFact = $('d-fact');
  var elThrown = $('d-thrown'), elTotal = $('d-total'), elFound = $('d-found');
  var elUnlock = $('d-unlock');

  if (unlocked && elUnlock) elUnlock.hidden = false;
  if (elFound) elFound.textContent = '0 / ' + D.facts.length;

  function reveal(hit) {
    if (hit.kind === 'miss') return D.special.miss;
    if (hit.kind === 'bull') return D.special.bull;
    if (hit.kind === 'outerBull') return D.special.outerBull;
    if (hit.seg === 'T20') return D.special.treble20;

    if (seen[hit.seg]) return 'Already had that one. Try somewhere new.';
    seen[hit.seg] = true;

    if (factIdx >= D.facts.length) return 'That is every fact I have. You have officially learned too much.';
    var f = D.facts[factIdx++];
    if (elFound) elFound.textContent = factIdx + ' / ' + D.facts.length;
    return f;
  }

  function land(x, y) {
    var hit = scoreAt(x, y);
    thrown++; total += hit.score;

    // Keep the last three darts on the board, then clear for a fresh visit.
    if (inFlight.length >= 3) {
      inFlight.forEach(function (d) { shots.removeChild(d); });
      inFlight = [];
    }
    var g = el('g', { class: 'd-dart' });
    g.appendChild(el('line', { x1: x, y1: y, x2: x + 9, y2: y - 15, class: 'd-shaft' }));
    g.appendChild(el('circle', { cx: x, cy: y, r: 3.2, class: 'd-tip' }));
    shots.appendChild(g);
    inFlight.push(g);

    if (elScore) elScore.textContent = hit.score;
    if (elLabel) elLabel.textContent = hit.label;
    if (elThrown) elThrown.textContent = thrown;
    if (elTotal) elTotal.textContent = total;
    if (elFact) elFact.textContent = reveal(hit);

    if (hit.seg === 'T20' && !unlocked) {
      unlocked = true;
      try { localStorage.setItem('darts-t20', '1'); } catch (e) {}
      if (elUnlock) elUnlock.hidden = false;
    }
  }

  /* ---- aiming ----------------------------------------------------- */
  var dragging = false, start = null;

  function toSvg(evt) {
    var p = svg.createSVGPoint();
    p.x = evt.clientX; p.y = evt.clientY;
    return p.matrixTransform(svg.getScreenCTM().inverse());
  }

  function drawAim(pull, power) {
    while (aim.firstChild) aim.removeChild(aim.firstChild);
    if (!pull) return;

    var tgt = {
      x: LAUNCH.x + pull.x * POWER_K,
      y: LAUNCH.y + pull.y * POWER_K
    };
    aim.appendChild(el('line', {
      x1: LAUNCH.x, y1: LAUNCH.y, x2: tgt.x, y2: tgt.y, class: 'd-aimline'
    }));
    aim.appendChild(el('circle', { cx: tgt.x, cy: tgt.y, r: 5, class: 'd-aimdot' }));
    aim.appendChild(el('circle', { cx: LAUNCH.x, cy: LAUNCH.y, r: 4, class: 'd-hand' }));

    // power bar along the bottom
    var w = Math.min(power / MAX_PULL, 1) * 160;
    aim.appendChild(el('rect', { x: 20, y: 424, width: 160, height: 10, class: 'd-ptrack' }));
    aim.appendChild(el('rect', { x: 20, y: 424, width: w, height: 10, class: 'd-pfill' }));
  }

  function down(evt) {
    evt.preventDefault();
    dragging = true;
    start = toSvg(evt);
    svg.setPointerCapture && svg.setPointerCapture(evt.pointerId);
  }

  function move(evt) {
    if (!dragging) return;
    evt.preventDefault();
    var now = toSvg(evt);
    // Pull BACK to throw forward, so the vector is start -> now, inverted.
    var pull = { x: start.x - now.x, y: start.y - now.y };
    var power = Math.sqrt(pull.x * pull.x + pull.y * pull.y);
    if (power > MAX_PULL) {
      pull.x *= MAX_PULL / power; pull.y *= MAX_PULL / power;
      power = MAX_PULL;
    }
    drawAim(pull, power);
  }

  function up(evt) {
    if (!dragging) return;
    dragging = false;
    var now = toSvg(evt);
    var pull = { x: start.x - now.x, y: start.y - now.y };
    var power = Math.sqrt(pull.x * pull.x + pull.y * pull.y);
    drawAim(null, 0);
    if (power < 8) return;            // a twitch, not a throw

    if (power > MAX_PULL) {
      pull.x *= MAX_PULL / power; pull.y *= MAX_PULL / power;
      power = MAX_PULL;
    }

    // A little wobble, worse the harder you throw.
    var wob = 2 + power / 45;
    var x = LAUNCH.x + pull.x * POWER_K + (Math.random() - 0.5) * 2 * wob;
    var y = LAUNCH.y + pull.y * POWER_K + (Math.random() - 0.5) * 2 * wob;
    land(x, y);
  }

  svg.addEventListener('pointerdown', down);
  svg.addEventListener('pointermove', move);
  svg.addEventListener('pointerup', up);
  svg.addEventListener('pointercancel', function () { dragging = false; drawAim(null, 0); });

  /* ---- keyboard fallback ------------------------------------------ */
  // Pointer dragging is impossible without a pointer, so offer a throw
  // button that fires with a random-ish aim.
  var btn = $('d-throw');
  if (btn) {
    btn.addEventListener('click', function () {
      var ang = (Math.random() - 0.5) * 0.5;          // radians off vertical
      var power = 85 + Math.random() * 25;
      var pull = { x: Math.sin(ang) * power, y: -Math.cos(ang) * power };
      land(LAUNCH.x + pull.x * POWER_K, LAUNCH.y + pull.y * POWER_K);
    });
  }
})();
