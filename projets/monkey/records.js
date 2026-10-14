/* Table des records de Monkey Memory, partagée entre tous les joueurs (Supabase).
   Le jeu Flutter appelle :
     window.monkeyRecords.submit(mode, score)  -> en fin de partie (modes "score" et "hardcore")
     window.monkeyRecords.show(mode)           -> bouton « Records » de l'accueil
   Si le score entre dans le top 5, on demande le nom du joueur puis on l'enregistre. */
(function () {
  var SUPABASE_URL = "";   // ex. https://xxxx.supabase.co
  var SUPABASE_KEY = "";   // clé publique (publishable / anon)
  var TABLE = "records";
  var TOP = 5;
  var MODES = [["score", "Score"], ["hardcore", "Hardcore"]];

  function headers(extra) {
    var h = { apikey: SUPABASE_KEY, "Content-Type": "application/json" };
    if (/^eyJ/.test(SUPABASE_KEY)) h.Authorization = "Bearer " + SUPABASE_KEY;
    for (var k in extra || {}) h[k] = extra[k];
    return h;
  }
  function top(mode) {
    var u = SUPABASE_URL + "/rest/v1/" + TABLE + "?select=id,name,score,created_at&mode=eq." +
      encodeURIComponent(mode) + "&order=score.desc,created_at.asc&limit=" + TOP;
    return fetch(u, { headers: headers() }).then(function (r) {
      if (!r.ok) throw new Error("lecture " + r.status);
      return r.json();
    });
  }
  function save(mode, name, score) {
    return fetch(SUPABASE_URL + "/rest/v1/" + TABLE, {
      method: "POST",
      headers: headers({ Prefer: "return=representation" }),
      body: JSON.stringify({ mode: mode, name: name, score: score })
    }).then(function (r) {
      if (!r.ok) throw new Error("enregistrement " + r.status);
      return r.json();
    }).then(function (rows) { return rows && rows[0] && rows[0].id; });
  }

  /* ---------- interface ---------- */
  var css =
    "#mr{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:16px;" +
      "background:rgba(10,20,10,.62);font:500 16px/1.35 system-ui,-apple-system,'Segoe UI',sans-serif;color:#2A1A0C}" +
    "#mr .box{background:#FFF6E6;border-radius:18px;box-shadow:0 12px 40px rgba(0,0,0,.35);width:100%;max-width:360px;padding:20px 18px 16px;display:grid;gap:14px}" +
    "#mr h2{margin:0;font-size:22px;font-weight:800;text-align:center;color:#2F4D2F}" +
    "#mr p{margin:0;text-align:center;color:#5A4632}" +
    "#mr .tabs{display:grid;grid-template-columns:1fr 1fr;gap:6px;background:#EADBC2;border-radius:12px;padding:4px}" +
    "#mr .tabs button{border:0;border-radius:9px;padding:8px;font:inherit;font-weight:700;background:transparent;color:#5A4632;cursor:pointer}" +
    "#mr .tabs button[aria-selected=true]{background:#E87A2E;color:#fff}" +
    "#mr ol{list-style:none;margin:0;padding:0;display:grid;gap:6px;min-height:200px;align-content:start}" +
    "#mr li{display:grid;grid-template-columns:28px 1fr auto;align-items:center;gap:8px;background:#fff;border-radius:10px;padding:9px 12px}" +
    "#mr li b{color:#E87A2E;font-size:18px}" +
    "#mr li .n{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
    "#mr li .s{font-weight:800;font-variant-numeric:tabular-nums}" +
    "#mr li.me{outline:3px solid #E87A2E}" +
    "#mr li.empty{grid-template-columns:1fr;color:#9A8670;text-align:center}" +
    "#mr input{font:inherit;font-size:18px;padding:10px 12px;border:2px solid #E0CDB0;border-radius:10px;width:100%;box-sizing:border-box;text-align:center}" +
    "#mr input:focus{outline:none;border-color:#E87A2E}" +
    "#mr .acts{display:flex;gap:8px}" +
    "#mr .acts button{flex:1;border:0;border-radius:12px;padding:12px;font:inherit;font-weight:800;cursor:pointer;background:#EADBC2;color:#5A4632}" +
    "#mr .acts button.go{background:#E87A2E;color:#fff}" +
    "#mr .acts button:disabled{opacity:.5}";

  var root = null;
  function open(html) {
    close();
    if (!document.getElementById("mr-css")) {
      var st = document.createElement("style"); st.id = "mr-css"; st.textContent = css;
      document.head.appendChild(st);
    }
    root = document.createElement("div");
    root.id = "mr";
    root.innerHTML = '<div class="box" role="dialog" aria-modal="true">' + html + "</div>";
    root.addEventListener("click", function (e) { if (e.target === root) close(); });
    document.body.appendChild(root);
    return root;
  }
  function close() { if (root) { root.remove(); root = null; } }
  document.addEventListener("keydown", function (e) { if (root && e.key === "Escape") close(); }, true);
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function renderList(el, rows, meId) {
    var h = "";
    for (var i = 0; i < TOP; i++) {
      var r = rows[i];
      h += r ? '<li class="' + (r.id === meId ? "me" : "") + '"><b>' + (i + 1) + '</b><span class="n">' + esc(r.name) +
        '</span><span class="s">' + r.score + "</span></li>"
        : '<li class="empty">—</li>';
    }
    el.innerHTML = h;
  }

  function show(mode, meId) {
    if (!SUPABASE_URL) { console.warn("monkeyRecords : Supabase non configuré"); }
    mode = mode === "hardcore" ? "hardcore" : "score";
    var r = open('<h2>Records</h2><div class="tabs" role="tablist">' +
      MODES.map(function (m) { return '<button role="tab" data-m="' + m[0] + '">' + m[1] + "</button>"; }).join("") +
      '</div><ol aria-live="polite"><li class="empty">Chargement…</li></ol>' +
      '<div class="acts"><button class="go" data-close>Fermer</button></div>');
    var list = r.querySelector("ol");
    function load(m) {
      r.querySelectorAll(".tabs button").forEach(function (b) { b.setAttribute("aria-selected", b.dataset.m === m); });
      list.innerHTML = '<li class="empty">Chargement…</li>';
      top(m).then(function (rows) { if (root === r) renderList(list, rows, meId); })
        .catch(function () { if (root === r) list.innerHTML = '<li class="empty">Records indisponibles (connexion ?)</li>'; });
    }
    r.querySelectorAll(".tabs button").forEach(function (b) { b.onclick = function () { meId = null; load(b.dataset.m); }; });
    r.querySelector("[data-close]").onclick = close;
    load(mode);
  }

  function submit(mode, score) {
    mode = mode === "hardcore" ? "hardcore" : "score";
    score = Math.round(+score) || 0;
    if (score <= 0 || !SUPABASE_URL) return Promise.resolve(false);
    return top(mode).then(function (rows) {
      var qualifies = rows.length < TOP || score > rows[rows.length - 1].score;
      if (!qualifies) return false;
      var rank = 1; rows.forEach(function (x) { if (x.score >= score) rank++; });
      var last = ""; try { last = localStorage.getItem("monkey-records-name") || ""; } catch (e) {}
      var r = open("<h2>Nouveau record !</h2><p>" + rank + (rank === 1 ? "re" : "e") + " place en mode " +
        (mode === "hardcore" ? "Hardcore" : "Score") + " avec <b>" + score + "</b> points.</p>" +
        '<input maxlength="20" placeholder="Ton nom" autocomplete="nickname" value="' + esc(last) + '">' +
        '<div class="acts"><button data-skip>Passer</button><button class="go" data-ok>Enregistrer</button></div>');
      var inp = r.querySelector("input"), ok = r.querySelector("[data-ok]");
      setTimeout(function () { inp.focus(); inp.select(); }, 50);
      return new Promise(function (resolve) {
        function go() {
          var name = inp.value.trim().replace(/\s+/g, " ").slice(0, 20);
          if (!name) { inp.focus(); return; }
          ok.disabled = true; ok.textContent = "…";
          try { localStorage.setItem("monkey-records-name", name); } catch (e) {}
          save(mode, name, score).then(function (id) { show(mode, id); resolve(true); })
            .catch(function () { ok.disabled = false; ok.textContent = "Réessayer"; });
        }
        ok.onclick = go;
        inp.addEventListener("keydown", function (e) { e.stopPropagation(); if (e.key === "Enter") go(); });
        r.querySelector("[data-skip]").onclick = function () { close(); resolve(false); };
      });
    }).catch(function () { return false; });
  }

  window.monkeyRecords = { submit: submit, show: show, close: close };
})();
