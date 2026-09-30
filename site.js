// View switch: phone layout or desktop layout, whatever the screen, with a one-time tip
// that also explains the language links. Loaded in <head> without defer so the saved view
// applies before first paint.
(function () {
  // Rovistino lives on the same origin (leixien.github.io/Rovistino/) and has its own switch:
  // separate keys, or dismissing its tip would hide this one too.
  var KEY_VIEW = "home.view", KEY_TIP = "home.tipSeen";
  var DESKTOP_WIDTH = 1100;
  var root = document.documentElement;
  var viewport = document.querySelector('meta[name="viewport"]');
  var en = root.lang === "en";
  var TEXT = en
    ? { toDesktop: "Desktop view", toMobile: "Phone view", ok: "Got it",
        tip: "IT | EN switches the language of the pages. The button switches how the site looks: narrow like on a phone or wide like on a computer. The site remembers your choices." }
    : { toDesktop: "Vista computer", toMobile: "Vista telefono", ok: "Ho capito",
        tip: "IT | EN cambia la lingua delle pagine. Il pulsante sceglie come vedere il sito: stretto come su un telefono o largo come su un computer. Il sito ricorda le tue scelte." };

  function load(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }

  function current() {
    return root.dataset.view || (matchMedia("(max-width: 44rem)").matches ? "mobile" : "desktop");
  }

  function apply(view) {
    root.dataset.view = view;
    // On a phone, a wider layout viewport is how "desktop site" works: the browser zooms out.
    viewport.content = view === "desktop" ? "width=" + DESKTOP_WIDTH : "width=device-width, initial-scale=1";
  }

  var saved = load(KEY_VIEW);
  if (saved === "mobile" || saved === "desktop") apply(saved);

  document.addEventListener("DOMContentLoaded", function () {
    var bar = document.querySelector(".bar");
    var button = document.createElement("button");
    button.type = "button";
    button.className = "view-switch";
    bar.append(button);

    function label() {
      button.textContent = current() === "mobile" ? TEXT.toDesktop : TEXT.toMobile;
    }
    label();

    var tip = null;
    function closeTip() {
      if (!tip) return;
      tip.remove();
      tip = null;
      save(KEY_TIP, "1");
    }

    button.addEventListener("click", function () {
      var next = current() === "mobile" ? "desktop" : "mobile";
      apply(next);
      save(KEY_VIEW, next);
      label();
      closeTip();
    });

    // Using the language links counts as having seen the tip.
    [].forEach.call(bar.querySelectorAll("a"), function (link) {
      link.addEventListener("click", function () { save(KEY_TIP, "1"); });
    });

    if (!load(KEY_TIP)) {
      tip = document.createElement("div");
      tip.className = "tip";
      tip.setAttribute("role", "note");
      var p = document.createElement("p");
      p.textContent = TEXT.tip;
      var ok = document.createElement("button");
      ok.type = "button";
      ok.textContent = TEXT.ok;
      ok.addEventListener("click", function () {
        closeTip();
        button.focus();
      });
      tip.append(p, ok);
      bar.append(tip);
    }

    // "Copy" buttons (the ETH address).
    [].forEach.call(document.querySelectorAll("[data-copy]"), function (b) {
      var original = b.textContent;
      b.addEventListener("click", function () {
        if (!navigator.clipboard) return;
        navigator.clipboard.writeText(b.dataset.copy).then(function () {
          b.textContent = en ? "Copied" : "Copiato";
          setTimeout(function () { b.textContent = original; }, 1500);
        });
      });
    });
  });
})();
