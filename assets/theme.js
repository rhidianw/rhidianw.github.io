// Light/dark toggle. The saved choice wins over the system preference.
(function () {
  var btn = document.querySelector('.theme-toggle');
  if (!btn) return;

  function current() {
    return document.documentElement.dataset.theme ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }
  function paint() { btn.textContent = current() === 'dark' ? '☀' : '☾'; }

  btn.addEventListener('click', function () {
    var next = current() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
    paint();
  });

  paint();
})();
