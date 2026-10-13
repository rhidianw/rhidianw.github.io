/* Renders the Order of Merit table from darts-data.js. */
(function () {
  var D = window.DARTS_DATA;
  if (!D) return;

  var host = document.getElementById('rk-list');
  var asof = document.getElementById('rk-asof');
  if (asof) asof.textContent = 'Standings as of ' + D.rankingsAsOf + '.';
  if (!host) return;

  var fav = {};
  (D.favourites || []).forEach(function (n) { fav[n] = true; });

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function money(k) {
    // Stored in £thousands; show £1.08m style once past a million.
    return k >= 1000 ? '£' + (k / 1000).toFixed(2) + 'm'
                     : '£' + k.toFixed(2).replace(/\.00$/, '') + 'k';
  }

  host.innerHTML = (D.rankings || []).map(function (row) {
    var pos = row[0], name = row[1], cash = row[2];
    return '<li' + (fav[name] ? ' class="fav"' : '') + '>' +
      '<span class="rank-pos">' + pos + '</span>' +
      '<span class="rank-name">' + esc(name) + (fav[name] ? ' ★' : '') + '</span>' +
      '<span class="rank-cash">' + money(cash) + '</span>' +
      '</li>';
  }).join('');
})();
