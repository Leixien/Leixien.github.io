// View switch: phone layout or desktop layout, whatever the screen, with a one-time tip.
// Loaded in <head> without defer so the saved view applies before first paint.
(function () {
  var DESKTOP_WIDTH = 1100;
  var root = document.documentElement;
  var viewport = document.querySelector('meta[name="viewport"]');
  var en = root.lang === "en";
  var TEXT = en
    ? { toDesktop: "Desktop view", toMobile: "Phone view", ok: "Got it",
        tip: "This button switches how the site looks: narrow like on a phone or wide like on a computer. The site remembers your choice." }
    : { toDesktop: "Vista computer", toMobile: "Vista telefono", ok: "Ho capito",
        tip: "Con questo pulsante scegli come vedere il sito: stretto come su un telefono o largo come su un computer. Il sito ricorda la tua scelta." };

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

  var saved = load("view");
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
      save("tipSeen", "1");
    }

    button.addEventListener("click", function () {
      var next = current() === "mobile" ? "desktop" : "mobile";
      apply(next);
      save("view", next);
      label();
      closeTip();
    });

    if (!load("tipSeen")) {
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
