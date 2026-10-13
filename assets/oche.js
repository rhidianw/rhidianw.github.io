/* ---------------------------------------------------------------------
   Scatters scores around the page frame. Regenerated on every load, so
   the furniture is never quite the same twice.

   Purely decorative: the layer is aria-hidden and ignores pointers.
   --------------------------------------------------------------------- */
(function () {
  if (!document.body.classList.contains('oche')) return;

  // Things you actually hear called out at a board.
  var SCORES = [
    '180', '140', '137', '121', '100', '95', '81', '60', '45', '26',
    '501', '170', '141', '161', 'T20', 'T19', 'D16', 'D20', 'D12',
    'BULL', '25', '57', '85', '134', '96', '76', '180', '140', 'T20'
  ];
  var BIG = ['180', '170', '501', 'BULL', '141'];

  var layer = document.createElement('div');
  layer.id = 'oche-frame';
  layer.setAttribute('aria-hidden', 'true');

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function between(lo, hi) { return lo + Math.random() * (hi - lo); }

  // The content column is 680px wide and centred, so the usable gutters
  // are whatever is left either side. Place within those.
  function build() {
    layer.innerHTML = '';
    var w = window.innerWidth;
    var gutter = (w - 680) / 2;
    if (gutter < 110) return;                 // no room, leave it empty

    var perSide = Math.round(between(7, 10));
    var sides = [
      { lo: 12, hi: gutter - 70 },            // left gutter
      { lo: w - gutter + 16, hi: w - 80 }     // right gutter
    ];

    sides.forEach(function (side) {
      for (var i = 0; i < perSide; i++) {
        var text = pick(SCORES);
        var s = document.createElement('span');
        s.className = 'oche-score';
        if (BIG.indexOf(text) !== -1 && Math.random() < 0.55) s.className += ' big';
        var tint = Math.random();
        if (tint < 0.3) s.className += ' red';
        else if (tint < 0.6) s.className += ' green';

        s.textContent = text;
        s.style.left = between(side.lo, Math.max(side.lo + 1, side.hi)) + 'px';
        s.style.top = between(2, 94) + 'vh';
        s.style.transform = 'rotate(' + between(-24, 24).toFixed(1) + 'deg)';
        layer.appendChild(s);
      }
    });
  }

  document.body.appendChild(layer);
  build();

  // Rebuild on resize so the gutters stay correct, but not on every pixel.
  var t;
  window.addEventListener('resize', function () {
    clearTimeout(t);
    t = setTimeout(build, 180);
  });
})();
