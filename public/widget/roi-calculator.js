/* DevRefs ROI Calculator Widget
 * Spec: docs/sales/roi-calculator-spec.md
 * Source pricing: docs/ia/agent-economics.md §A.2 + §A.4 + §C.1
 * Privacy by design strict: zéro PII, zéro fetch réseau pendant calcul, zéro cookie/localStorage.
 * Embed: <script src="https://devrefs.dev/widget/roi-calculator.js" defer></script>
 *        + <div id="devrefs-roi-calc"></div>
 * Events CF Analytics (sendBeacon) : roi_calculator_viewed / roi_calculator_interacted / roi_calculator_cta_clicked
 *   Payload : { pack } uniquement — jamais les valeurs numériques input.
 */
(function () {
  "use strict";
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (window.__devrefsRoiCalcInit) return;
  window.__devrefsRoiCalcInit = true;

  // 67_000 tokens = mesure réelle Claude Code (project-context.md verbatim V1)
  var TOKENS_PER_PARSE = 67000;

  // 6 modèles (agent-economics.md §A.2). cost = effective $/MTok input
  var MODELS = {
    "opus-4.7": { label: "Claude Opus 4.7", cost: 6.75, hyp: false },
    "sonnet-4.6": { label: "Claude Sonnet 4.6", cost: 3.0, hyp: false },
    "haiku-4.5": { label: "Claude Haiku 4.5", cost: 1.0, hyp: false },
    "gpt-5": { label: "GPT-5 [HYPOTHESE]", cost: 2.5, hyp: true },
    "gemini-2.5-pro": { label: "Gemini 2.5 Pro", cost: 1.25, hyp: false },
    custom: { label: "Autre (saisie manuelle)", cost: 0, hyp: false }
  };

  var FRESH = { low: 1.0, medium: 1.2, high: 2.0 };

  // CSS minimal inline (< 1 KB)
  var CSS =
    ".dr-roi{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#e6edf3;background:#0d1117;border:1px solid #30363d;border-radius:8px;padding:20px;max-width:560px;box-sizing:border-box}" +
    ".dr-roi.light{color:#1f2328;background:#fff;border-color:#d0d7de}" +
    ".dr-roi h3{margin:0 0 4px;font-size:18px;font-weight:600}" +
    ".dr-roi p.sub{margin:0 0 16px;font-size:12px;opacity:.7}" +
    ".dr-roi label{display:block;font-size:12px;font-weight:500;margin:12px 0 4px}" +
    ".dr-roi select,.dr-roi input[type=number]{width:100%;padding:8px;border:1px solid #30363d;background:#161b22;color:inherit;border-radius:6px;font-size:14px;box-sizing:border-box}" +
    ".dr-roi.light select,.dr-roi.light input[type=number]{background:#fff;border-color:#d0d7de}" +
    ".dr-roi input[type=range]{width:100%}" +
    ".dr-roi .row{display:flex;gap:8px;flex-wrap:wrap}" +
    ".dr-roi .row label{flex:1;min-width:120px;cursor:pointer;padding:6px;border:1px solid #30363d;border-radius:6px;text-align:center;margin:4px 0}" +
    ".dr-roi .row input[type=radio]{display:none}" +
    ".dr-roi .row input[type=radio]:checked + span{font-weight:600;color:#58a6ff}" +
    ".dr-roi .res{margin-top:18px;padding:14px;background:rgba(88,166,255,.08);border-radius:6px;font-size:14px;line-height:1.6}" +
    ".dr-roi .res .big{font-size:22px;font-weight:700;color:#58a6ff;display:block}" +
    ".dr-roi .cta{display:block;width:100%;padding:12px;margin-top:14px;background:#238636;color:#fff;border:0;border-radius:6px;font-size:15px;font-weight:600;cursor:pointer;text-align:center;text-decoration:none;box-sizing:border-box}" +
    ".dr-roi .cta:hover{background:#2ea043}" +
    ".dr-roi .cta.disabled{background:#30363d;cursor:not-allowed;pointer-events:none}" +
    ".dr-roi .legal{font-size:10px;opacity:.5;margin-top:10px}";

  function injectStyle() {
    if (document.getElementById("dr-roi-style")) return;
    var s = document.createElement("style");
    s.id = "dr-roi-style";
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function emitEvent(name, payload) {
    try {
      var url = "https://api.devrefs.dev/api/track";
      var body = JSON.stringify({ event: name, payload: payload || {} });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
      } else {
        fetch(url, { method: "POST", body: body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(function () {});
      }
    } catch (e) {
      /* silent */
    }
  }

  function pickPack(qpm) {
    if (qpm <= 5000) return { id: "discovery", label: "Discovery $5", price: 5, url: "https://devrefs.dev/#pack-discovery" };
    if (qpm <= 10000) return { id: "standard", label: "Standard $10", price: 10, url: "https://devrefs.dev/#pack-standard" };
    return { id: "pro", label: "Pro $50", price: 50, url: "https://devrefs.dev/#pack-pro" };
  }

  function compute(modelKey, customCost, queriesPerDay, freshness) {
    var m = MODELS[modelKey];
    var costMtok = modelKey === "custom" ? Math.max(0, parseFloat(customCost) || 0) : m.cost;
    var freshMul = FRESH[freshness] || 1.0;
    var altPerQuery = (TOKENS_PER_PARSE / 1000000) * costMtok * freshMul;
    var altMonthly = altPerQuery * queriesPerDay * 30;
    var qpm = queriesPerDay * 30;
    var pack = pickPack(qpm);
    var devrefsCallCost = 0.001 * qpm;
    var devrefsMonthly = Math.min(devrefsCallCost, pack.price);
    var savings = Math.max(0, altMonthly - devrefsMonthly);
    var roi = devrefsMonthly > 0 ? altMonthly / devrefsMonthly : 0;
    var tokensSaved = TOKENS_PER_PARSE * qpm;
    return {
      altMonthly: altMonthly,
      devrefsMonthly: devrefsMonthly,
      savings: savings,
      roi: roi,
      tokensSaved: tokensSaved,
      pack: pack,
      costMtok: costMtok
    };
  }

  function fmtUsd(n) {
    if (n >= 100) return "$" + Math.round(n);
    return "$" + n.toFixed(2);
  }

  function fmtTokens(n) {
    if (n >= 1e9) return (n / 1e9).toFixed(1) + " B";
    if (n >= 1e6) return (n / 1e6).toFixed(1) + " M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + " K";
    return String(n);
  }

  function render(root) {
    var theme = root.getAttribute("data-theme") === "light" ? "light" : "dark";
    var defModel = root.getAttribute("data-default-model") || "sonnet-4.6";
    var defQueries = parseInt(root.getAttribute("data-default-queries") || "10", 10);
    var defFresh = root.getAttribute("data-default-freshness") || "medium";
    var embedSrc = root.getAttribute("data-embed-source") || "direct";

    var modelOpts = "";
    Object.keys(MODELS).forEach(function (k) {
      modelOpts +=
        '<option value="' + k + '"' + (k === defModel ? " selected" : "") + ">" + MODELS[k].label + "</option>";
    });

    root.className = "dr-roi " + theme;
    root.setAttribute("role", "region");
    root.setAttribute("aria-label", "DevRefs ROI calculator");
    root.innerHTML =
      '<h3>Combien ton agent brule-t-il en cherchant un prix LLM ?</h3>' +
      '<p class="sub">Ajuste les parametres. Le calcul est local. Rien n\'est envoye.</p>' +
      '<label for="dr-model">Modele de l\'agent</label>' +
      '<select id="dr-model" aria-label="Modele LLM">' + modelOpts + "</select>" +
      '<div id="dr-custom-wrap" style="display:none"><label for="dr-custom">Cout effectif $/MTok input</label><input id="dr-custom" type="number" min="0" step="0.01" value="2"/></div>' +
      '<label for="dr-queries">Volume queries/jour : <span id="dr-q-val">' + defQueries + '</span></label>' +
      '<input id="dr-queries" type="range" min="1" max="500" value="' + defQueries + '" aria-label="Volume queries par jour"/>' +
      '<label>Frequence de mise a jour requise</label>' +
      '<div class="row" role="radiogroup">' +
      '<label><input type="radio" name="dr-fresh" value="low"' + (defFresh === "low" ? " checked" : "") + '/><span>Quotidienne</span></label>' +
      '<label><input type="radio" name="dr-fresh" value="medium"' + (defFresh === "medium" ? " checked" : "") + '/><span>Toutes les 6h</span></label>' +
      '<label><input type="radio" name="dr-fresh" value="high"' + (defFresh === "high" ? " checked" : "") + '/><span>Temps reel</span></label>' +
      "</div>" +
      '<div class="res" id="dr-res" aria-live="polite"></div>' +
      '<a class="cta" id="dr-cta" href="https://devrefs.dev/#pack-standard" target="_blank" rel="noopener">Calcul en cours...</a>' +
      '<p class="legal">Calcul base sur 67 000 tokens/parsing (agent-economics.md A.4). Pricing DevRefs : $0.001/call. Sources publiques verifiables.</p>';

    var modelEl = root.querySelector("#dr-model");
    var customWrap = root.querySelector("#dr-custom-wrap");
    var customEl = root.querySelector("#dr-custom");
    var queriesEl = root.querySelector("#dr-queries");
    var qVal = root.querySelector("#dr-q-val");
    var freshEls = root.querySelectorAll('input[name="dr-fresh"]');
    var resEl = root.querySelector("#dr-res");
    var ctaEl = root.querySelector("#dr-cta");
    var interacted = false;

    function getFresh() {
      for (var i = 0; i < freshEls.length; i++) if (freshEls[i].checked) return freshEls[i].value;
      return "medium";
    }

    function update() {
      var modelKey = modelEl.value;
      customWrap.style.display = modelKey === "custom" ? "block" : "none";
      var qpd = parseInt(queriesEl.value, 10) || 1;
      qVal.textContent = qpd;
      var r = compute(modelKey, customEl.value, qpd, getFresh());

      if (modelKey === "custom" && r.costMtok === 0) {
        resEl.innerHTML = "<em>Saisis un cout par MTok pour calculer.</em>";
        ctaEl.className = "cta disabled";
        ctaEl.textContent = "En attente saisie";
        return;
      }

      var roiTxt;
      if (r.roi < 10) {
        roiTxt = "ROI " + r.roi.toFixed(1) + "x. DevRefs devient rentable des 3+ queries/jour avec ce modele.";
      } else if (r.roi < 100) {
        roiTxt = "ROI <strong>" + Math.round(r.roi) + "x</strong> — rentable des le 1er mois.";
      } else {
        roiTxt = "ROI <strong>" + Math.round(r.roi) + "x</strong> — no-brainer.";
      }

      resEl.innerHTML =
        '<span class="big">' + fmtUsd(r.savings) + " /mois economises</span>" +
        "Sans DevRefs : <strong>" + fmtUsd(r.altMonthly) + "/mois</strong> &nbsp;|&nbsp; Avec DevRefs : <strong>" + fmtUsd(r.devrefsMonthly) + "/mois</strong><br>" +
        roiTxt + "<br>" +
        "Tokens economises : <strong>" + fmtTokens(r.tokensSaved) + " tokens/mois</strong>";

      if (r.roi < 10) {
        ctaEl.className = "cta disabled";
        ctaEl.textContent = "Volume insuffisant — voir Audit $9.99";
        ctaEl.href = "https://devrefs.dev/#audit";
      } else {
        ctaEl.className = "cta";
        ctaEl.textContent = "Acheter Pack " + r.pack.label + " — USDC";
        ctaEl.href = r.pack.url + "?ref=roi-calc&src=" + encodeURIComponent(embedSrc);
        ctaEl.setAttribute("data-pack", r.pack.id);
      }
    }

    function onInteract() {
      if (interacted) return;
      interacted = true;
      emitEvent("roi_calculator_interacted", { embed_source: embedSrc });
    }

    modelEl.addEventListener("change", function () { update(); onInteract(); });
    customEl.addEventListener("input", function () { update(); onInteract(); });
    queriesEl.addEventListener("input", function () { update(); onInteract(); });
    for (var i = 0; i < freshEls.length; i++) {
      freshEls[i].addEventListener("change", function () { update(); onInteract(); });
    }
    ctaEl.addEventListener("click", function () {
      var pack = ctaEl.getAttribute("data-pack") || "unknown";
      emitEvent("roi_calculator_cta_clicked", { pack: pack, embed_source: embedSrc });
    });

    // viewport-aware viewed event (IntersectionObserver fallback : emit immediate)
    if (typeof IntersectionObserver !== "undefined") {
      var seen = false;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && !seen) {
            seen = true;
            emitEvent("roi_calculator_viewed", { embed_source: embedSrc });
            io.disconnect();
          }
        });
      }, { threshold: 0.5 });
      io.observe(root);
    } else {
      emitEvent("roi_calculator_viewed", { embed_source: embedSrc });
    }

    update();
  }

  function init() {
    injectStyle();
    var nodes = document.querySelectorAll("#devrefs-roi-calc, [data-devrefs-roi-calc]");
    for (var i = 0; i < nodes.length; i++) render(nodes[i]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
