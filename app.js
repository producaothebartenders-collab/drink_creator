/* UI stepper — Criador de Drinks */
(function () {
  const STEPS = ["home", "alcool", "sabores", "perfil", "forca", "copo", "resultado"];
  const STEP_LABELS = {
    home: "Início",
    alcool: "Álcool",
    sabores: "Sabores",
    perfil: "Perfil",
    forca: "Força",
    copo: "Copo",
    resultado: "Resultado",
  };

  const state = {
    step: "home",
    alcool: null,
    destilado: null, // null = app escolhe; string = spirit; "__auto__" sentinel for UI
    destiladoAuto: true,
    sabores: [],
    perfil: [],
    forca: "equilibrado",
    copo: "auto",
    result: null,
  };

  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

  function go(step) {
    state.step = step;
    render();
  }

  function stepIndex() {
    return STEPS.indexOf(state.step);
  }

  function canNext() {
    switch (state.step) {
      case "alcool":
        return state.alcool === "sem" || state.alcool === "com";
      case "sabores":
        return state.sabores.length >= 1;
      case "perfil":
        return state.perfil.length >= 1 && state.perfil.length <= 2;
      case "forca":
        return !!state.forca;
      case "copo":
        return !!state.copo;
      default:
        return true;
    }
  }

  function next() {
    if (state.step === "alcool" && state.alcool === "sem") {
      state.destilado = null;
      state.destiladoAuto = true;
    }
    if (state.step === "copo") {
      runEngine();
      go("resultado");
      return;
    }
    const i = stepIndex();
    if (i < STEPS.length - 1) go(STEPS[i + 1]);
  }

  function back() {
    if (state.step === "resultado") {
      go("copo");
      return;
    }
    const i = stepIndex();
    if (i > 0) go(STEPS[i - 1]);
  }

  function engineInput() {
    return {
      alcool: state.alcool,
      destilado: state.alcool === "com" && !state.destiladoAuto ? state.destilado : null,
      sabores: state.sabores.slice(),
      perfil: state.perfil.slice(),
      forca: state.forca,
      copo: state.copo,
    };
  }

  function runEngine() {
    try {
      state.result = CDMotor.generate(engineInput());
    } catch (e) {
      console.error(e);
      alert(e.message || "Erro ao gerar drinks.");
      state.result = null;
    }
  }

  function startCreate(zero) {
    resetChoices();
    if (zero) {
      state.alcool = "sem";
      go("sabores");
    } else {
      go("alcool");
    }
  }

  function surprise(zero) {
    resetChoices();
    state.alcool = zero ? "sem" : "com";
    state.result = CDMotor.surprise(!!zero);
    // sync state from result for adjustments
    Object.assign(state, {
      alcool: state.result.state.alcool,
      destilado: state.result.state.destilado,
      destiladoAuto: !state.result.state.destilado,
      sabores: state.result.state.sabores.slice(),
      perfil: state.result.state.perfil.slice(),
      forca: state.result.state.forca,
      copo: state.result.state.copo || "auto",
    });
    go("resultado");
  }

  function resetChoices() {
    state.alcool = null;
    state.destilado = null;
    state.destiladoAuto = true;
    state.sabores = [];
    state.perfil = [];
    state.forca = "equilibrado";
    state.copo = "auto";
    state.result = null;
  }

  function toggleSabor(id) {
    const i = state.sabores.indexOf(id);
    if (i >= 0) state.sabores.splice(i, 1);
    else if (state.sabores.length < 3) state.sabores.push(id);
    renderSabores();
    updateNav();
  }

  function togglePerfil(id) {
    const i = state.perfil.indexOf(id);
    if (i >= 0) state.perfil.splice(i, 1);
    else if (state.perfil.length < 2) state.perfil.push(id);
    renderPerfil();
    updateNav();
  }

  function updateGlassPreview() {
    const box = $("#glass-preview");
    if (!box) return;
    // provisional family guess
    const fake = {
      alcool: state.alcool || "com",
      destilado: state.destiladoAuto ? null : state.destilado,
      sabores: state.sabores.length ? state.sabores : ["limao"],
      perfil: state.perfil.length ? state.perfil : ["equilibrado"],
      forca: state.forca,
      copo: "auto",
    };
    let glass;
    try {
      const r = CDMotor.generate(fake);
      glass = r.glassSuggested;
      if (state.copo !== "auto") {
        glass = CDData.GLASSES.find((g) => g.id === state.copo) || glass;
      }
    } catch {
      glass = CDData.GLASSES[0];
    }
    box.innerHTML = `
      <div class="gs-name">${escapeHtml(glass.name)}</div>
      <div class="gs-meta">${glass.ml} ml · capacidade nominal MATRIZ</div>
      <div class="gs-why">${escapeHtml(glass.why)}</div>
    `;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function render() {
    $$(".screen").forEach((el) => el.classList.remove("active"));
    const scr = $(`#screen-${state.step}`);
    if (scr) scr.classList.add("active");

    // progress / stepper
    const stepper = $("#stepper");
    const prog = $("#progress");
    const labels = $("#step-labels");
    const flowSteps = STEPS.slice(1, 6); // alcool → copo
    const showStepper = !["home", "resultado"].includes(state.step);
    if (stepper) stepper.style.display = showStepper ? "block" : "none";
    if (prog && showStepper) {
      const cur = stepIndex();
      prog.innerHTML = flowSteps
        .map((s) => {
          const idx = STEPS.indexOf(s);
          const cls = idx < cur ? "done" : idx === cur ? "on" : "";
          return `<span class="${cls}" title="${STEP_LABELS[s]}"></span>`;
        })
        .join("");
    }
    if (labels && showStepper) {
      const cur = stepIndex();
      labels.innerHTML = flowSteps
        .map((s) => {
          const idx = STEPS.indexOf(s);
          const cls = idx < cur ? "done" : idx === cur ? "on" : "";
          return `<li class="${cls}">${STEP_LABELS[s]}</li>`;
        })
        .join("");
    }

    const ind = $("#step-indicator");
    if (ind) {
      if (state.step === "home") ind.textContent = "TB · Proto";
      else if (state.step === "resultado") ind.textContent = "Resultado";
      else {
        const n = flowSteps.indexOf(state.step) + 1;
        ind.textContent = `${n}/${flowSteps.length} · ${STEP_LABELS[state.step]}`;
      }
    }

    if (state.step === "alcool") renderAlcool();
    if (state.step === "sabores") renderSabores();
    if (state.step === "perfil") renderPerfil();
    if (state.step === "forca") renderForca();
    if (state.step === "copo") renderCopo();
    if (state.step === "resultado") renderResultado();

    updateNav();
  }

  function updateNav() {
    const nextBtn = $("#btn-next");
    const backBtn = $("#btn-back");
    const footer = $("#nav-footer");
    if (!footer) return;
    const show = !["home", "resultado"].includes(state.step);
    footer.style.display = show ? "flex" : "none";
    if (backBtn) backBtn.disabled = stepIndex() <= 0;
    if (nextBtn) {
      nextBtn.disabled = !canNext();
      nextBtn.textContent = state.step === "copo" ? "Gerar drinks →" : "Continuar →";
    }
  }

  function renderAlcool() {
    const wrap = $("#alcool-chips");
    wrap.innerHTML = `
      <button type="button" class="chip ${state.alcool === "com" ? "on" : ""}" data-a="com">Com álcool</button>
      <button type="button" class="chip ${state.alcool === "sem" ? "on" : ""}" data-a="sem">Sem álcool</button>
    `;
    wrap.querySelectorAll("[data-a]").forEach((btn) => {
      btn.onclick = () => {
        state.alcool = btn.dataset.a;
        if (state.alcool === "sem") {
          state.destilado = null;
          state.destiladoAuto = true;
        }
        renderAlcool();
        updateNav();
      };
    });

    const spiritBox = $("#spirit-section");
    if (state.alcool === "com") {
      spiritBox.style.display = "block";
      const sg = $("#spirit-chips");
      sg.innerHTML =
        `<button type="button" class="chip auto-pick ${state.destiladoAuto ? "on" : ""}" data-sp="__auto__">Deixa o app escolher</button>` +
        CDData.SPIRITS.map(
          (s) =>
            `<button type="button" class="chip ${!state.destiladoAuto && state.destilado === s.id ? "on" : ""}" data-sp="${s.id}">${escapeHtml(s.label)}</button>`
        ).join("");
      sg.querySelectorAll("[data-sp]").forEach((btn) => {
        btn.onclick = () => {
          if (btn.dataset.sp === "__auto__") {
            state.destiladoAuto = true;
            state.destilado = null;
          } else {
            state.destiladoAuto = false;
            state.destilado = btn.dataset.sp;
          }
          renderAlcool();
        };
      });
    } else {
      spiritBox.style.display = "none";
    }
  }

  function renderSabores() {
    const grid = $("#sabor-chips");
    grid.innerHTML = CDData.INGREDIENTS.map((ing) => {
      const on = state.sabores.includes(ing.id);
      return `<button type="button" class="chip ${on ? "on" : ""}" data-s="${ing.id}">${escapeHtml(ing.label)}</button>`;
    }).join("");
    grid.querySelectorAll("[data-s]").forEach((btn) => {
      btn.onclick = () => toggleSabor(btn.dataset.s);
    });

    const comp = $("#complements");
    const list = CDMotor.suggestComplements(state.sabores);
    if (!state.sabores.length) {
      comp.innerHTML = `<h3>Complementos sugeridos</h3><p class="empty">Escolha um protagonista para ver afinidades [LIVRO].</p>`;
    } else {
      comp.innerHTML =
        `<h3>Complementos sugeridos</h3>` +
        list.map((c) => `<span class="comp-chip">${escapeHtml(c.label)}<em>[${c.source}]</em></span>`).join("") +
        `<p class="hint">Até 3 sabores · o 1º é o protagonista.</p>`;
    }
  }

  function renderPerfil() {
    const grid = $("#perfil-chips");
    grid.innerHTML = CDData.PROFILES.map((p) => {
      const on = state.perfil.includes(p.id);
      return `<button type="button" class="chip ${on ? "on" : ""}" data-p="${p.id}">${escapeHtml(p.label)}</button>`;
    }).join("");
    grid.querySelectorAll("[data-p]").forEach((btn) => {
      btn.onclick = () => togglePerfil(btn.dataset.p);
    });
  }

  function renderForca() {
    const grid = $("#forca-chips");
    const opts = [
      { id: "suave", label: "Suave", hint: "Base ~40 ml · mais diluição / long" },
      { id: "equilibrado", label: "Equilibrado", hint: "Base ~50 ml · padrão TB" },
      { id: "forte", label: "Forte", hint: "Base ~55–60 ml · menos diluição" },
    ];
    grid.innerHTML = opts
      .map(
        (o) => `
      <button type="button" class="chip ${state.forca === o.id ? "on" : ""}" data-f="${o.id}" title="${o.hint}">
        ${o.label}
      </button>`
      )
      .join("");
    grid.querySelectorAll("[data-f]").forEach((btn) => {
      btn.onclick = () => {
        state.forca = btn.dataset.f;
        renderForca();
        updateNav();
      };
    });
    $("#forca-hint").textContent = opts.find((o) => o.id === state.forca)?.hint || "";
  }

  function renderCopo() {
    updateGlassPreview();
    const grid = $("#copo-chips");
    const opts = [{ id: "auto", name: "Automático (MATRIZ)" }, ...CDData.GLASSES];
    grid.innerHTML = opts
      .map((g) => {
        const id = g.id;
        const label = g.name || g.id;
        const on = state.copo === id;
        return `<button type="button" class="chip ${on ? "on" : ""} ${id === "auto" ? "auto-pick" : ""}" data-c="${id}">${escapeHtml(label)}${g.ml ? ` · ${g.ml} ml` : ""}</button>`;
      })
      .join("");
    grid.querySelectorAll("[data-c]").forEach((btn) => {
      btn.onclick = () => {
        state.copo = btn.dataset.c;
        renderCopo();
        updateNav();
      };
    });
  }

  function renderResultado() {
    const root = $("#resultado-content");
    if (!state.result) {
      root.innerHTML = `<p class="screen-sub">Nenhum resultado. Volte e gere novamente.</p>`;
      return;
    }
    const r = state.result;
    const baseTag = r.base.suggested
      ? r.base.type === "zero"
        ? `Zero: ${r.base.label}`
        : `Base sugerida: ${r.base.label}`
      : `Base: ${r.base.label}`;

    root.innerHTML = `
      <div class="result-header">
        <h1 class="screen-title">Suas fichas</h1>
        <p class="screen-sub">2–3 opções no padrão TB · toque para expandir</p>
        <div class="result-meta">
          <span class="tag gold">${escapeHtml(baseTag)}</span>
          <span class="tag">Acorde: ${escapeHtml(r.flavors.chordLabels.join(" · "))}</span>
          <span class="tag">Ponte: ${escapeHtml(r.flavors.bridgeLabel)}</span>
          <span class="tag">Força: ${escapeHtml(r.state.forca)}</span>
        </div>
      </div>
      <div id="fichas"></div>
      <div class="why-box" id="why-box"></div>
      <div class="section-label">Ajustar</div>
      <div class="adjust-grid" id="adjust-grid"></div>
      <div class="btn-row" style="margin-top:16px">
        <button type="button" class="btn btn-ghost" id="btn-nova">← Nova criação</button>
      </div>
    `;

    const fichasEl = $("#fichas");
    fichasEl.innerHTML = r.fichas
      .map((f, idx) => {
        const ings = f.ingredientes
          .map((ing) => {
            const q =
              ing.qtd === "COMPLETAR"
                ? "COMPLETAR"
                : `${ing.qtd}${ing.unidade ? " " + ing.unidade : ""}`;
            return `<li><span>${escapeHtml(ing.nome)}</span><span class="qtd">${escapeHtml(q)}</span></li>`;
          })
          .join("");
        const tags = f.paladar.map((t) => `<span>${escapeHtml(t)}</span>`).join("");
        return `
        <article class="ficha ${idx === 0 ? "open" : ""}" data-idx="${idx}">
          <button type="button" class="ficha-head" aria-expanded="${idx === 0}">
            <span class="ficha-letter">${escapeHtml(f.variant)}</span>
            <span class="ficha-title-block">
              <div class="ficha-nome">${escapeHtml(f.nome)}</div>
              <div class="ficha-cat">${escapeHtml(f.categoria)} · ${escapeHtml(f.metodo)}</div>
              <div class="ficha-tags">${tags}</div>
            </span>
            <span class="ficha-chevron">▾</span>
          </button>
          <div class="ficha-body">
            <ul class="ing-list">${ings}</ul>
            <div class="ficha-field"><strong>Preparo</strong>${escapeHtml(f.preparo)}</div>
            <div class="ficha-field"><strong>Copo / taça</strong>${escapeHtml(f.copo)} (${f.copoMl} ml)<br><span style="color:var(--muted)">${escapeHtml(f.copoWhy)}</span></div>
            <div class="ficha-field"><strong>Guarnição</strong>${escapeHtml(f.guarnicao)}</div>
            <div class="ficha-field"><strong>Gelo</strong>${escapeHtml(f.gelo)}</div>
            ${f.canudo ? `<div class="ficha-field"><strong>Canudo</strong>${escapeHtml(f.canudo)}</div>` : ""}
            ${
              f.mirror
                ? `<div class="mirror-box"><strong>${escapeHtml(f.mirror.nome)}</strong><br>${escapeHtml(f.mirror.nota)}</div>`
                : ""
            }
          </div>
        </article>`;
      })
      .join("");

    fichasEl.querySelectorAll(".ficha-head").forEach((btn) => {
      btn.onclick = () => {
        const art = btn.closest(".ficha");
        const open = art.classList.toggle("open");
        btn.setAttribute("aria-expanded", open);
      };
    });

    $("#why-box").innerHTML =
      `<h3>Por que</h3>` +
      r.explain
        .map(
          (e) =>
            `<div class="why-item"><strong>${escapeHtml(e.title)}</strong><p>${escapeHtml(e.text)}</p></div>`
        )
        .join("");

    const actions = [
      { id: "mais-doce", label: "Mais doce" },
      { id: "mais-citrico", label: "Mais cítrico" },
      { id: "mais-forte", label: "Mais forte" },
      { id: "mais-suave", label: "Mais suave" },
      { id: "trocar-base", label: "Trocar base" },
      { id: "outra-rodada", label: "Outra rodada" },
    ];
    const ag = $("#adjust-grid");
    ag.innerHTML = actions
      .map((a) => `<button type="button" class="btn btn-soft btn-sm" data-adj="${a.id}">${a.label}</button>`)
      .join("");
    ag.querySelectorAll("[data-adj]").forEach((btn) => {
      btn.onclick = () => {
        state.result = CDMotor.adjust(engineInput(), btn.dataset.adj);
        Object.assign(state, {
          alcool: state.result.state.alcool,
          destilado: state.result.state.destilado,
          destiladoAuto: !state.result.state.destilado,
          sabores: state.result.state.sabores.slice(),
          perfil: state.result.state.perfil.slice(),
          forca: state.result.state.forca,
          copo: state.result.state.copo || state.copo,
        });
        renderResultado();
        window.scrollTo({ top: 0, behavior: "smooth" });
      };
    });

    $("#btn-nova").onclick = () => {
      resetChoices();
      go("home");
    };
  }

  function bindHome() {
    $("#cta-criar").onclick = () => startCreate(false);
    $("#cta-surpresa").onclick = () => surprise(false);
    $("#cta-zero").onclick = () => startCreate(true);
    $("#cta-surpresa-zero").onclick = () => surprise(true);
    $("#btn-next").onclick = () => next();
    $("#btn-back").onclick = () => back();
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindHome();
    render();
  });
})();
