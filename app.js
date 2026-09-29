/* UI stepper — Criador de Drinks */
(function () {
  const STEPS = ["home", "alcool", "sabores", "perfil", "forca", "espumas", "resultado"];
  const STEP_LABELS = {
    home: "Início",
    alcool: "Álcool",
    sabores: "Sabores",
    perfil: "Perfil",
    forca: "Força",
    espumas: "Espuma",
    resultado: "Ficha",
  };

  const state = {
    step: "home",
    alcool: null,
    destilado: null, // null = app escolhe; string = spirit id
    destiladoAuto: true,
    spiritQuery: "",
    spiritCat: "todas",
    saborQuery: "",
    saborCat: "todas",
    sabores: [],
    perfil: [],
    forca: "equilibrado",
    espuma: "auto",
    session: null,
    picks: null,
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
      case "espumas":
        return true;
      default:
        return true;
    }
  }

  function next() {
    if (state.step === "alcool" && state.alcool === "sem") {
      state.destilado = null;
      state.destiladoAuto = true;
    }
    if (state.step === "espumas") {
      enterResultado();
      return;
    }
    const i = stepIndex();
    if (i < STEPS.length - 1) go(STEPS[i + 1]);
  }

  function back() {
    if (state.step === "resultado") {
      go("espumas");
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
      espuma: state.espuma,
    };
  }

  function enterResultado() {
    try {
      state.session = CDMotor.prepareBuilder(engineInput());
      state.picks = state.session.picks;
      go("resultado");
    } catch (e) {
      console.error(e);
      alert(e.message || "Erro ao montar a ficha.");
    }
  }

  function reassemble() {
    const live = CDMotor.assemble(state.session.state, state.picks);
    state.session.ficha = live.ficha;
    state.session.explain = live.explain;
    state.session.warnings = live.warnings;
    paintLive();
  }

  function startCreate() {
    resetChoices();
    go("alcool");
  }

  function resetChoices() {
    state.alcool = null;
    state.destilado = null;
    state.destiladoAuto = true;
    state.spiritQuery = "";
    state.spiritCat = "todas";
    state.saborQuery = "";
    state.saborCat = "todas";
    state.sabores = [];
    state.perfil = [];
    state.forca = "equilibrado";
    state.espuma = "auto";
    state.session = null;
    state.picks = null;
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
    const flowSteps = STEPS.slice(1, 6);
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
      else if (state.step === "resultado") ind.textContent = "Ficha";
      else {
        const n = flowSteps.indexOf(state.step) + 1;
        ind.textContent = `${n}/${flowSteps.length} · ${STEP_LABELS[state.step]}`;
      }
    }

    if (state.step === "alcool") renderAlcool();
    if (state.step === "sabores") renderSabores();
    if (state.step === "perfil") renderPerfil();
    if (state.step === "forca") renderForca();
    if (state.step === "espumas") renderEspumas();
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
      nextBtn.textContent = state.step === "espumas" ? "Montar ficha →" : "Continuar →";
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
      renderSpiritPicker();
    } else {
      spiritBox.style.display = "none";
    }
  }

  function fold(s) {
    return String(s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  function houseSpirits() {
    return CDData.SPIRITS.filter((s) => {
      const blob = fold(`${s.id} ${s.label} ${s.category || ""} ${s.role || ""}`);
      return !/sem[\s-]*alcool|0\s*%|zero[\s-]*alcool|alcohol[\s-]*free/.test(blob);
    });
  }

  function renderSpiritPicker() {
    const spirits = houseSpirits();
    const hint = $("#spirit-hint");
    if (hint) {
      hint.textContent = `${spirits.length} tipos da casa, sem marca. Busque ou filtre por família.`;
    }

    const auto = $("#spirit-auto");
    auto.innerHTML = `<button type="button" class="chip auto-pick ${state.destiladoAuto ? "on" : ""}" data-sp="__auto__">Deixa o app escolher</button>`;
    auto.querySelector("[data-sp]").onclick = () => {
      state.destiladoAuto = true;
      state.destilado = null;
      const groups = $("#spirit-groups");
      if (groups) groups.querySelectorAll("[data-sp]").forEach((b) => b.classList.remove("on"));
      auto.querySelector("[data-sp]").classList.add("on");
    };

    const order = CDData.SPIRIT_CATEGORY_ORDER.filter((c) => spirits.some((s) => s.category === c));
    const cats = $("#spirit-cats");
    const catButtons = [{ id: "todas", label: "Todas" }].concat(
      order.map((id) => ({ id, label: CDData.SPIRIT_CATEGORY_LABELS[id] || id }))
    );
    cats.innerHTML = catButtons
      .map(
        (c) =>
          `<button type="button" class="cat-pill ${state.spiritCat === c.id ? "on" : ""}" data-cat="${c.id}" role="tab" aria-selected="${state.spiritCat === c.id}">${escapeHtml(c.label)}</button>`
      )
      .join("");
    cats.querySelectorAll("[data-cat]").forEach((btn) => {
      btn.onclick = () => {
        state.spiritCat = btn.dataset.cat;
        cats.querySelectorAll("[data-cat]").forEach((b) => {
          const on = b.dataset.cat === state.spiritCat;
          b.classList.toggle("on", on);
          b.setAttribute("aria-selected", String(on));
        });
        renderSpiritGroups(spirits);
      };
    });

    const search = $("#spirit-search");
    if (search && document.activeElement !== search) search.value = state.spiritQuery;
    if (search && !search.dataset.bound) {
      search.dataset.bound = "1";
      search.oninput = () => {
        state.spiritQuery = search.value;
        renderSpiritGroups(houseSpirits());
      };
    }

    renderSpiritGroups(spirits);
  }

  function renderSpiritGroups(spirits) {
    const q = fold(state.spiritQuery.trim());
    const cat = state.spiritCat || "todas";
    let list = spirits.filter((s) => (cat === "todas" ? true : s.category === cat));
    if (q) {
      list = list.filter((s) => {
        const fam = CDData.SPIRIT_CATEGORY_LABELS[s.category] || s.category;
        return fold(s.label).includes(q) || fold(fam).includes(q);
      });
    }

    const root = $("#spirit-groups");
    if (!list.length) {
      root.innerHTML = `<p class="spirit-empty">Nenhum tipo com esse filtro.</p>`;
      return;
    }

    const order = CDData.SPIRIT_CATEGORY_ORDER.slice();
    const seen = new Set();
    const groups = [];
    order.forEach((c) => {
      const items = list.filter((s) => s.category === c);
      if (!items.length) return;
      seen.add(c);
      groups.push({ id: c, items });
    });
    list.forEach((s) => {
      if (seen.has(s.category)) return;
      seen.add(s.category);
      groups.push({ id: s.category, items: list.filter((x) => x.category === s.category) });
    });

    root.innerHTML = groups
      .map((g) => {
        const title = CDData.SPIRIT_CATEGORY_LABELS[g.id] || g.id;
        const chips = g.items
          .map(
            (s) =>
              `<button type="button" class="chip ${!state.destiladoAuto && state.destilado === s.id ? "on" : ""}" data-sp="${escapeHtml(s.id)}">${escapeHtml(s.label)}</button>`
          )
          .join("");
        return `<section class="spirit-group"><h3>${escapeHtml(title)}</h3><div class="chip-grid">${chips}</div></section>`;
      })
      .join("");

    root.querySelectorAll("[data-sp]").forEach((btn) => {
      btn.onclick = () => {
        state.destiladoAuto = false;
        state.destilado = btn.dataset.sp;
        const autoBtn = $("#spirit-auto [data-sp]");
        if (autoBtn) autoBtn.classList.remove("on");
        root.querySelectorAll("[data-sp]").forEach((b) => b.classList.toggle("on", b.dataset.sp === state.destilado));
      };
    });
  }

  function renderSabores() {
    const groups = CDData.SABOR_GROUPS || [];
    const picked = $("#sabor-picked");
    if (picked) {
      if (!state.sabores.length) {
        picked.innerHTML = `<p class="empty">Nenhum sabor ainda. O primeiro escolhido é o protagonista.</p>`;
      } else {
        picked.innerHTML = state.sabores
          .map((id, i) => {
            const ing = CDData.getIngredient(id);
            const label = ing ? ing.label : id;
            const role = i === 0 ? "protagonista" : String(i + 1);
            return `<button type="button" class="chip on" data-s="${escapeHtml(id)}"><span class="ord">${role}</span>${escapeHtml(label)}</button>`;
          })
          .join("");
        picked.querySelectorAll("[data-s]").forEach((btn) => {
          btn.onclick = () => toggleSabor(btn.dataset.s);
        });
      }
    }

    const cats = $("#sabor-cats");
    const catButtons = [{ id: "todas", label: "Todas" }].concat(groups);
    if (cats) {
      cats.innerHTML = catButtons
        .map((c) => {
          const on = state.saborCat === c.id;
          return `<button type="button" class="cat-pill ${on ? "on" : ""}" data-cat="${c.id}" role="tab" aria-selected="${on}">${escapeHtml(c.label)}</button>`;
        })
        .join("");
      cats.querySelectorAll("[data-cat]").forEach((btn) => {
        btn.onclick = () => {
          state.saborCat = btn.dataset.cat;
          renderSabores();
        };
      });
    }

    const search = $("#sabor-search");
    if (search && document.activeElement !== search) search.value = state.saborQuery;
    if (search && !search.dataset.bound) {
      search.dataset.bound = "1";
      search.oninput = () => {
        state.saborQuery = search.value;
        renderSaborGroups();
      };
    }

    renderSaborGroups();

    const comp = $("#complements");
    const list = CDMotor.suggestComplements(state.sabores);
    if (!state.sabores.length) {
      comp.innerHTML = `<h3>Complementos sugeridos</h3><p class="empty">Escolha um protagonista para ver afinidades [LIVRO].</p>`;
    } else {
      const barOnly = list.length > 0 && list.every((c) => c.source === "BAR");
      comp.innerHTML =
        `<h3>Complementos sugeridos</h3>` +
        (list.length
          ? list.map((c) => `<span class="comp-chip">${escapeHtml(c.label)}<em>[${c.source}]</em></span>`).join("")
          : `<p class="empty">Sem sugestão extra.</p>`) +
        (barOnly ? `<p class="hint">Sem pairing de livro — ponte leve de bar.</p>` : `<p class="hint">Até 3 sabores · o 1º é o protagonista.</p>`);
    }
  }

  function renderSaborGroups() {
    const root = $("#sabor-groups");
    if (!root) return;
    const q = fold(state.saborQuery.trim());
    const cat = state.saborCat || "todas";
    const labels = {};
    (CDData.SABOR_GROUPS || []).forEach((g) => {
      labels[g.id] = g.label;
    });
    let list = CDData.INGREDIENTS.filter((ing) => (cat === "todas" ? true : ing.group === cat));
    if (q) {
      list = list.filter((ing) => fold(ing.label).includes(q) || fold(labels[ing.group] || "").includes(q));
    }

    const count = $("#sabor-count");
    if (count) {
      const total = CDData.INGREDIENTS.length;
      count.textContent =
        q || cat !== "todas"
          ? `${list.length} de ${total} sabores · até 3 · o 1º é o protagonista.`
          : `${total} sabores · até 3 · o 1º é o protagonista.`;
    }

    if (!list.length) {
      root.innerHTML = `<p class="spirit-empty">Nenhum sabor com esse filtro.</p>`;
      return;
    }

    const full = state.sabores.length >= 3;
    const order = (CDData.SABOR_GROUPS || []).map((g) => g.id);
    const grouped = [];
    const seen = new Set();
    order.forEach((id) => {
      const items = list.filter((ing) => ing.group === id);
      if (!items.length) return;
      seen.add(id);
      grouped.push({ id, items });
    });
    list.forEach((ing) => {
      if (seen.has(ing.group)) return;
      seen.add(ing.group);
      grouped.push({ id: ing.group, items: list.filter((x) => x.group === ing.group) });
    });

    root.innerHTML = grouped
      .map((g) => {
        const title = labels[g.id] || g.id;
        const chips = g.items
          .map((ing) => {
            const idx = state.sabores.indexOf(ing.id);
            const on = idx >= 0;
            const disabled = full && !on;
            const ord = on ? `<span class="ord">${idx === 0 ? "1" : idx + 1}</span>` : "";
            return `<button type="button" class="chip ${on ? "on" : ""}" data-s="${escapeHtml(ing.id)}" ${disabled ? "disabled" : ""}>${ord}${escapeHtml(ing.label)}</button>`;
          })
          .join("");
        return `<section class="spirit-group"><h3>${escapeHtml(title)}</h3><div class="chip-grid">${chips}</div></section>`;
      })
      .join("");

    root.querySelectorAll("[data-s]").forEach((btn) => {
      btn.onclick = () => toggleSabor(btn.dataset.s);
    });
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
    const notes = {
      doce: "Mais adoçante (xarope, purê, licor) do que acidulante.",
      amargo: "A ficha leva um bitter.",
      citrico: "Mais acidulante do que adoçante.",
      equilibrado: "Doce e ácido na mesma medida.",
      herbal: "Entra uma nota herbal.",
      frutado: "Entra fruta.",
      amadeirado: "A base sugerida é envelhecida.",
      floral: "Entra uma nota de flor.",
      picante: "Entra pimenta, gengibre ou similar.",
    };
    const hint = $("#perfil-hint");
    if (hint) {
      hint.textContent = state.perfil.length
        ? state.perfil.map((id) => notes[id]).filter(Boolean).join(" ")
        : "Escolha 1 ou 2. A primeira manda se as duas puxarem o equilíbrio para lados opostos.";
    }
  }

  function renderForca() {
    const grid = $("#forca-chips");
    grid.innerHTML = CDData.FORCAS.map(
      (o) => `<button type="button" class="chip ${state.forca === o.id ? "on" : ""}" data-f="${o.id}">${escapeHtml(o.label)}</button>`
    ).join("");
    grid.querySelectorAll("[data-f]").forEach((btn) => {
      btn.onclick = () => {
        state.forca = btn.dataset.f;
        renderForca();
        updateNav();
      };
    });
    const cur = CDData.FORCAS.find((o) => o.id === state.forca);
    $("#forca-hint").textContent = cur ? cur.hint : "";
  }

  function renderEspumas() {
    const grid = $("#espuma-chips");
    const opts = [
      { id: "auto", label: "Deixa o app escolher", auto: true },
      { id: "nenhuma", label: "Sem espuma", auto: true },
    ].concat(CDData.FOAMS);
    grid.innerHTML = opts
      .map((o) => {
        const on = state.espuma === o.id;
        const cls = o.auto ? "chip auto-pick" : "chip";
        return `<button type="button" class="${cls} ${on ? "on" : ""}" data-e="${escapeHtml(o.id)}">${escapeHtml(o.label)}</button>`;
      })
      .join("");
    grid.querySelectorAll("[data-e]").forEach((btn) => {
      btn.onclick = () => {
        state.espuma = btn.dataset.e;
        renderEspumas();
        updateNav();
      };
    });
    const hint = $("#espuma-hint");
    if (!hint) return;
    if (state.espuma === "nenhuma") {
      hint.textContent = "A ficha sai sem espuma.";
      return;
    }
    if (state.espuma === "auto") {
      try {
        const top = CDMotor.topFoam(engineInput());
        hint.textContent = top
          ? `Se deixar vazio, o app sugere ${top.label}, pelo sabor e pelo perfil.`
          : "O app escolhe uma espuma que conversa com os sabores.";
      } catch (e) {
        hint.textContent = "O app escolhe uma espuma que conversa com os sabores.";
      }
      return;
    }
    const foam = CDData.FOAMS.find((f) => f.id === state.espuma);
    hint.textContent = foam ? `${foam.label} entra na ficha. No montador dá para trocar.` : "";
  }

  function qtdText(ing) {
    if (ing.qtd === "COMPLETAR" || ing.qtd === "COBERTURA" || ing.qtd === "toque") return String(ing.qtd);
    return `${ing.qtd}${ing.unidade ? " " + ing.unidade : ""}`;
  }

  function liveHtml() {
    const r = state.session;
    if (!r || !r.ficha) return `<p class="screen-sub">Sem ficha.</p>`;
    const f = r.ficha;
    const ings = f.ingredientes
      .map((ing) => `<li><span>${escapeHtml(ing.nome)}</span><span class="qtd">${escapeHtml(qtdText(ing))}</span></li>`)
      .join("");
    const tags = (f.paladar || []).map((t) => `<span>${escapeHtml(t)}</span>`).join("");
    const warnings = (r.warnings || [])
      .map((w) => `<p class="aviso">${escapeHtml(w)}</p>`)
      .join("");
    const why = (r.explain || [])
      .map((e) => `<div class="why-item"><strong>${escapeHtml(e.title)}</strong><p>${escapeHtml(e.text)}</p></div>`)
      .join("");
    return `
      <article class="ficha ficha-live open">
        <div class="ficha-head static">
          <span class="ficha-letter">TB</span>
          <span class="ficha-title-block">
            <div class="ficha-nome">${escapeHtml(f.nome)}</div>
            <div class="ficha-cat">${escapeHtml(f.categoria)} · ${escapeHtml(f.metodo)}</div>
            <div class="ficha-tags">${tags}</div>
          </span>
        </div>
        <div class="ficha-body">
          <ul class="ing-list">${ings}</ul>
          <div class="ficha-field"><strong>Preparo</strong>${escapeHtml(f.preparo)}</div>
          <div class="ficha-field"><strong>Copo / taça</strong>${escapeHtml(f.copo)} (${f.copoMl} ml)</div>
          <div class="ficha-field"><strong>Guarnição</strong>${escapeHtml(f.guarnicao)}</div>
          <div class="ficha-field"><strong>Gelo</strong>${escapeHtml(f.gelo)}</div>
          ${f.canudo ? `<div class="ficha-field"><strong>Canudo</strong>${escapeHtml(f.canudo)}</div>` : ""}
          ${warnings}
        </div>
      </article>
      <div class="why-box">${why}</div>
    `;
  }

  function paintLive() {
    const box = $("#live-ficha");
    if (box) box.innerHTML = liveHtml();
  }

  function chipRow(items, selected, attr, labelOf) {
    return items
      .map((item) => {
        const id = item.id;
        const on = Array.isArray(selected) ? selected.includes(id) : selected === id;
        return `<button type="button" class="chip ${on ? "on" : ""}" ${attr}="${escapeHtml(id)}">${escapeHtml(labelOf(item))}</button>`;
      })
      .join("");
  }

  function renderResultado() {
    const root = $("#resultado-content");
    if (!state.session || !state.picks) {
      root.innerHTML = `<p class="screen-sub">Nada para montar. Volte um passo.</p>`;
      return;
    }
    const pools = state.session.pools;
    const baseTitle = state.alcool === "sem" ? "Base sem álcool" : "Base alcoólica";
    const foamBlock = pools.foams.length
      ? `<section class="pool">
          <h2>Espuma</h2>
          <p class="hint">Até 5. Toque para trocar. A cobertura entra no fim.</p>
          <div class="chip-grid" id="pool-foams">
            ${chipRow(pools.foams, state.picks.foamId, "data-foam", (f) => f.label)}
            <button type="button" class="chip auto-pick ${state.picks.foamId ? "" : "on"}" data-foam="">Sem espuma</button>
          </div>
        </section>`
      : "";
    const lenItems = pools.lengtheners.slice();
    root.innerHTML = `
      <div class="result-header">
        <h1 class="screen-title">Monte a ficha</h1>
        <p class="screen-sub">Escolha em cada grupo. A receita e as doses atualizam na hora.</p>
      </div>
      <div id="live-ficha">${liveHtml()}</div>
      <section class="pool">
        <h2>${baseTitle}</h2>
        <p class="hint">Até 5 sugestões. Uma base por vez.</p>
        <div class="chip-grid" id="pool-bases">
          ${chipRow(pools.bases, state.picks.baseId, "data-base", (b) => b.label)}
        </div>
      </section>
      <section class="pool">
        <h2>Sabores na ficha</h2>
        <p class="hint">Até 10. Marque o que entra. O perfil puxa o que não pode faltar.</p>
        <div class="chip-grid" id="pool-flavors">
          ${chipRow(pools.flavors, state.picks.flavorIds, "data-flavor", (f) => f.label)}
        </div>
      </section>
      ${foamBlock}
      <section class="pool">
        <h2>Copo</h2>
        <p class="hint">Até 5 da MATRIZ. O primeiro é o sugerido para o serviço.</p>
        <div class="chip-grid" id="pool-glasses">
          ${chipRow(pools.glasses, state.picks.glassId, "data-glass", (g) => `${g.name.replace(/Copo |Taça /g, "")}`)}
        </div>
      </section>
      <section class="pool">
        <h2>Alongador</h2>
        <p class="hint">${state.forca === "refrescante" ? "Força refrescante: escolha refrigerante, suco ou espumante." : "Refrigerante, suco, espumante. Opcional fora da força refrescante."}</p>
        <div class="chip-grid" id="pool-length">
          ${chipRow(lenItems, state.picks.lengthenerId, "data-len", (l) => l.label)}
          ${state.forca === "refrescante" ? "" : `<button type="button" class="chip auto-pick ${state.picks.lengthenerId ? "" : "on"}" data-len="">Sem alongador</button>`}
        </div>
      </section>
      <div class="btn-row" style="margin-top:16px">
        <button type="button" class="btn btn-ghost" id="btn-back-build">← Voltar</button>
        <button type="button" class="btn btn-ghost" id="btn-nova">Nova criação</button>
      </div>
    `;

    $("#pool-bases").querySelectorAll("[data-base]").forEach((btn) => {
      btn.onclick = () => {
        state.picks.baseId = btn.dataset.base;
        $("#pool-bases").querySelectorAll("[data-base]").forEach((b) => b.classList.toggle("on", b.dataset.base === state.picks.baseId));
        reassemble();
      };
    });
    $("#pool-flavors").querySelectorAll("[data-flavor]").forEach((btn) => {
      btn.onclick = () => {
        const id = btn.dataset.flavor;
        const arr = state.picks.flavorIds;
        const i = arr.indexOf(id);
        if (i >= 0) {
          if (arr.length === 1) return;
          arr.splice(i, 1);
        } else arr.push(id);
        btn.classList.toggle("on", arr.includes(id));
        reassemble();
      };
    });
    const foamRoot = $("#pool-foams");
    if (foamRoot) {
      foamRoot.querySelectorAll("[data-foam]").forEach((btn) => {
        btn.onclick = () => {
          state.picks.foamId = btn.dataset.foam || null;
          foamRoot.querySelectorAll("[data-foam]").forEach((b) => b.classList.toggle("on", (b.dataset.foam || null) === state.picks.foamId || (!b.dataset.foam && !state.picks.foamId)));
          reassemble();
        };
      });
    }
    $("#pool-glasses").querySelectorAll("[data-glass]").forEach((btn) => {
      btn.onclick = () => {
        state.picks.glassId = btn.dataset.glass;
        $("#pool-glasses").querySelectorAll("[data-glass]").forEach((b) => b.classList.toggle("on", b.dataset.glass === state.picks.glassId));
        reassemble();
      };
    });
    $("#pool-length").querySelectorAll("[data-len]").forEach((btn) => {
      btn.onclick = () => {
        const id = btn.dataset.len || null;
        if (state.forca === "refrescante" && !id) return;
        state.picks.lengthenerId = id;
        $("#pool-length").querySelectorAll("[data-len]").forEach((b) => {
          const bid = b.dataset.len || null;
          b.classList.toggle("on", bid === state.picks.lengthenerId);
        });
        reassemble();
      };
    });
    $("#btn-back-build").onclick = () => back();
    $("#btn-nova").onclick = () => {
      resetChoices();
      go("home");
    };
    window.scrollTo(0, 0);
  }

  function bindHome() {
    $("#cta-criar").onclick = () => startCreate();
    $("#btn-next").onclick = () => next();
    $("#btn-back").onclick = () => back();
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindHome();
    render();
  });
})();
