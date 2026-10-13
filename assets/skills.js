/* ---------------------------------------------------------------------
   Points the "back to X" links at wherever you came from.

   Tags link through as /skills/<slug>/?from=cv, so the page can send you
   back to the right place. Falls back to the referrer, then to the CV.
   --------------------------------------------------------------------- */
(function () {
  var ORIGINS = {
    home:  { href: '/',       label: 'the home page' },
    cv:    { href: '/cv/',    label: 'the CV' },
    darts: { href: '/darts/', label: 'the darts' }
  };

  var from = null;

  // 1. explicit ?from=
  var m = /[?&]from=([a-z]+)/.exec(window.location.search);
  if (m && ORIGINS[m[1]]) from = ORIGINS[m[1]];

  // 2. otherwise infer from the referrer, if it was this site
  if (!from && document.referrer) {
    try {
      var r = new URL(document.referrer);
      if (r.host === window.location.host) {
        if (r.pathname === '/' || r.pathname === '/index.html') from = ORIGINS.home;
        else if (r.pathname.indexOf('/cv') === 0) from = ORIGINS.cv;
        else if (r.pathname.indexOf('/darts') === 0) from = ORIGINS.darts;
      }
    } catch (e) {}
  }

  // 3. the CV is the sensible default — it is where most tags live
  if (!from) from = ORIGINS.cv;

  ['back-link', 'back-link-2'].forEach(function (id) {
    var a = document.getElementById(id);
    if (!a) return;
    a.href = from.href;
    a.textContent = '← back to ' + from.label;
  });
})();
