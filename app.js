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
    espuma: "nenhuma",
    session: null,
    picks: null,
    balanceMode: "warn",
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
      scrollResultado = true;
      go("resultado");
    } catch (e) {
      console.error(e);
      alert(e.message || "Erro ao montar a ficha.");
    }
  }

  function reassemble() {
    const scrollY = window.scrollY;
    const catalogScroll = [...document.querySelectorAll(".catalog-list")].map((el) => [el, el.scrollTop]);
    const live = CDMotor.assemble(state.session.state, state.picks);
    if (live.flavorIds && state.picks) state.picks.flavorIds = live.flavorIds.slice();
    state.session.ficha = live.ficha;
    state.session.explain = live.explain;
    state.session.warnings = live.warnings;
    paintLive();
    syncFlavorChips();
    syncOmitAcidChip();
    ["bases", "flavors", "foams", "glasses"].forEach(syncCatalogOnStates);
    catalogScroll.forEach(([el, top]) => {
      if (el.isConnected) el.scrollTop = top;
    });
    window.scrollTo(0, scrollY);
  }

  function syncFlavorChips() {
    const root = $("#pool-flavors");
    if (!root || !state.picks) return;
    root.querySelectorAll("[data-flavor]").forEach((btn) => {
      btn.classList.toggle("on", state.picks.flavorIds.includes(btn.dataset.flavor));
    });
  }

  function syncOmitAcidChip() {
    const btn = $("#btn-sem-limao");
    if (!btn || !state.picks) return;
    btn.classList.toggle("on", !!state.picks.omitAcid);
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
    state.espuma = "nenhuma";
    state.session = null;
    state.picks = null;
    state.balanceMode = "warn";
  }

  let scrollResultado = false;

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
          ? list.map((c) => `<span class="comp-chip${c.exotic ? " exotic" : ""}">${escapeHtml(c.label)}<em>[${c.source}]</em>${c.exotic ? `<em class="exotic-tag">exótico</em>` : ""}</span>`).join("")
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
      list = list.filter((ing) => {
        const blob = fold([ing.label, ...(ing.aliases || []), labels[ing.group] || ""].join(" "));
        return blob.includes(q);
      });
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
      doce: "Adoçante perto de 30 ml e acidulante perto de 15 ml. Os dois ficam entre 15 e 30 ml.",
      amargo: "A ficha leva um bitter.",
      citrico: "Acidulante perto de 30 ml e adoçante perto de 15 ml. Os dois ficam entre 15 e 30 ml.",
      equilibrado: "Adoçante e acidulante no meio da faixa, os dois entre 15 e 30 ml.",
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
          ? `O app escolhe ${top.label} e coloca na ficha.`
          : "O app escolhe uma espuma e coloca na ficha.";
      } catch (e) {
        hint.textContent = "O app escolhe uma espuma e coloca na ficha.";
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
      .map((ing, i) => {
        const adjustable = ing.unidade === "ml" && typeof ing.qtd === "number";
        const qtd = adjustable
          ? `<span class="ml-controls"><button type="button" class="ml-btn" data-ml="-1" data-i="${i}" aria-label="Diminuir ${escapeHtml(ing.nome)}">−</button><span class="qtd">${escapeHtml(qtdText(ing))}</span><button type="button" class="ml-btn" data-ml="1" data-i="${i}" aria-label="Aumentar ${escapeHtml(ing.nome)}">+</button></span>`
          : `<span class="qtd">${escapeHtml(qtdText(ing))}</span>`;
        return `<li><span class="ing-nome">${escapeHtml(ing.nome)}</span>${qtd}</li>`;
      })
      .join("");
    const liquido = typeof f.liquidoMl === "number" ? f.liquidoMl : CDMotor.sumLiquidMl(f.ingredientes);
    const totais = `<p class="ficha-totais">Base ${f.baseMl} ml · acidulante ${f.acidSum} ml · adoçante ${f.sweetSum} ml</p>`;
    const lockOn = state.balanceMode === "lock";
    const balance = `<fieldset class="balance-mode">
          <legend>Ao ajustar os ml</legend>
          <label><input type="radio" name="balance-mode" value="lock" ${lockOn ? "checked" : ""}> <span><strong>Travar proporção</strong> — os outros ml acompanham</span></label>
          <label><input type="radio" name="balance-mode" value="warn" ${lockOn ? "" : "checked"}> <span><strong>Só avisar</strong> — se o ácido se afastar do doce, avisa sem forçar</span></label>
        </fieldset>`;
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
          ${balance}
          <ul class="ing-list">${ings}</ul>
          <p class="ficha-liquido">Total de líquido: ${liquido} ml</p>
          ${totais}
          <div class="ficha-field"><strong>Preparo</strong>${escapeHtml(f.preparo)}</div>
          <div class="ficha-field"><strong>Copo / taça</strong>${escapeHtml(f.copo)} (${f.copoMl} ml)</div>
          <div class="ficha-field"><strong>Guarnição</strong>${escapeHtml(f.guarnicao || "—")}</div>
          ${f.canudo ? `<div class="ficha-field"><strong>Canudo</strong>${escapeHtml(f.canudo)}</div>` : ""}
          <div class="btn-row" style="margin-top:12px">
            <button type="button" class="btn btn-primary" id="btn-export">Exportar receita</button>
          </div>
          <p class="hint" id="export-status"></p>
          ${warnings}
        </div>
      </article>
      <div class="why-box">${why}</div>
    `;
  }

  function recalcTotals() {
    const r = state.session;
    if (!r || !r.ficha) return;
    const f = r.ficha;
    let base = 0;
    let acid = 0;
    let sweet = 0;
    f.ingredientes.forEach((ing) => {
      if (ing.unidade !== "ml" || typeof ing.qtd !== "number") return;
      if (ing.role === "base") base += ing.qtd;
      else if (ing.role === "acido") acid += ing.qtd;
      else if (ing.role === "doce" || ing.role === "fruta" || ing.role === "floral" || ing.role === "picante") sweet += ing.qtd;
    });
    if (f.licorIsSweet) sweet += base;
    f.baseMl = base;
    f.acidSum = acid;
    f.sweetSum = sweet;
    f.liquidoMl = CDMotor.sumLiquidMl(f.ingredientes);
    const exp = (r.explain || []).find((e) => e.title === "Proporção");
    if (exp && exp.text) {
      exp.text = exp.text.replace(
        /^Adoçante \d+ ml · acidulante \d+ ml · base \d+ ml\./,
        `Adoçante ${sweet} ml · acidulante ${acid} ml · base ${base} ml.`
      );
    }
    const perfil = (r.state && r.state.perfil) || [];
    const warnings = (r.warnings || []).filter((w) => !/^Perfil (doce|cítrico|equilibrado)/.test(w) && !/^Acidulante longe/.test(w));
    if (!f.estrutura) {
      if (perfil.includes("doce") && !(sweet > acid)) {
        warnings.push("Perfil doce pede mais adoçante (xarope, purê ou licor) do que acidulante.");
      }
      if (perfil.includes("citrico") && !(acid > sweet)) {
        warnings.push("Perfil cítrico pede mais acidulante do que adoçante.");
      }
      if (perfil.includes("equilibrado") && (acid === 0 || sweet === 0 || Math.abs(acid - sweet) > 2)) {
        warnings.push("Perfil equilibrado pede doce e ácido na mesma medida.");
      }
      if (!perfil.includes("doce") && !perfil.includes("citrico") && !perfil.includes("equilibrado") && acid > 0 && sweet > 0 && Math.abs(acid - sweet) > 10) {
        warnings.push("Acidulante longe do adoçante.");
      }
      if (acid === 0 && sweet > 0) {
        warnings.push("Acidulante longe do adoçante: o doce ficou sem ácido.");
      }
    }
    r.warnings = warnings;
  }

  function fichaTexto(f) {
    const lines = [f.nome, f.categoria + (f.metodo ? ` · ${f.metodo}` : "")];
    if (f.paladar && f.paladar.length) lines.push(`Paladar: ${f.paladar.join(" · ")}`);
    lines.push("", "Ingredientes");
    (f.ingredientes || []).forEach((ing) => {
      lines.push(`${ing.nome} — ${qtdText(ing)}`);
    });
    const liquido = typeof f.liquidoMl === "number" ? f.liquidoMl : CDMotor.sumLiquidMl(f.ingredientes);
    lines.push("", `Total de líquido: ${liquido} ml`);
    lines.push("", "Preparo", f.preparo || "", "", "Copo / taça", `${f.copo}${f.copoMl ? ` (${f.copoMl} ml)` : ""}`);
    lines.push("", "Guarnição", f.guarnicao || "");
    if (f.canudo) lines.push("", "Canudo", f.canudo);
    lines.push("");
    return lines.join("\n");
  }

  function downloadText(filename, text) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function exportRecipe() {
    const f = state.session && state.session.ficha;
    const status = $("#export-status");
    if (!f) return;
    const text = fichaTexto(f);
    const slug = String(f.nome || "receita")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "receita";
    let copied = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        copied = true;
      }
    } catch (e) {
      copied = false;
    }
    if (!copied) {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      try {
        copied = document.execCommand("copy");
      } catch (e) {
        copied = false;
      }
      area.remove();
    }
    downloadText(`${slug}.txt`, text);
    if (status) {
      status.textContent = copied
        ? "Receita copiada e arquivo .txt baixado."
        : "Arquivo .txt baixado.";
    }
  }

  function bindLiveControls() {
    const box = $("#live-ficha");
    if (!box) return;
    box.querySelectorAll(".ml-btn").forEach((btn) => {
      btn.onclick = () => {
        const ing = state.session && state.session.ficha && state.session.ficha.ingredientes[Number(btn.dataset.i)];
        const dir = Number(btn.dataset.ml);
        if (!ing || ing.unidade !== "ml" || typeof ing.qtd !== "number" || !dir) return;
        const prev = ing.qtd;
        const next = Math.max(0, prev + dir * 5);
        if (state.balanceMode === "lock" && prev > 0 && next !== prev) {
          const ratio = next / prev;
          state.session.ficha.ingredientes.forEach((other) => {
            if (other === ing || other.unidade !== "ml" || typeof other.qtd !== "number" || other.qtd <= 0) return;
            let scaled = Math.round((other.qtd * ratio) / 5) * 5;
            if (scaled === other.qtd) scaled = other.qtd + (next > prev ? 5 : -5);
            other.qtd = Math.max(5, scaled);
          });
        }
        ing.qtd = next;
        recalcTotals();
        paintLive();
      };
    });
    const exportBtn = $("#btn-export");
    if (exportBtn) exportBtn.onclick = () => exportRecipe();
    box.querySelectorAll('input[name="balance-mode"]').forEach((radio) => {
      radio.onchange = () => {
        if (radio.checked) state.balanceMode = radio.value === "lock" ? "lock" : "warn";
      };
    });
  }

  function paintLive() {
    const box = $("#live-ficha");
    if (box) box.innerHTML = liveHtml();
    bindLiveControls();
  }

  function flavorChipText(f) {
    if (!f) return "";
    if (f.id === "limao" || f.id === "limao-tahiti") return "Limão tahiti · mais agressivo";
    if (f.id === "limao-siciliano") return "Limão siciliano · mais suave";
    return f.exotic ? `${f.label} · exótico` : f.label;
  }

  function catalogHtml(kind) {
    return `<div class="catalog" data-catalog="${kind}">
      <button type="button" class="btn btn-ghost btn-sm catalog-toggle">Cardápio</button>
      <div class="catalog-panel" hidden>
        <label class="sr-only" for="catalog-q-${kind}">Buscar no cardápio</label>
        <input type="search" id="catalog-q-${kind}" placeholder="Buscar no cardápio" autocomplete="off" enterkeyhint="search" />
        <div class="catalog-list"></div>
      </div>
    </div>`;
  }

  function catalogEntries(kind) {
    const st = state.session && state.session.state;
    if (!st) return [];
    if (kind === "bases") return CDMotor.catalogBases(st).map((b) => ({ id: b.id, label: b.label }));
    if (kind === "flavors") {
      return CDMotor.catalogFlavors().map((f) => ({
        id: f.id,
        label: flavorChipText(f),
        aliases: [f.label],
      }));
    }
    if (kind === "foams") return CDMotor.catalogFoams().map((f) => ({ id: f.id, label: f.label }));
    if (kind === "glasses") return CDMotor.catalogGlasses().map((g) => ({ id: g.id, label: g.name }));
    return [];
  }

  function catalogIsOn(kind, id) {
    if (!state.picks) return false;
    if (kind === "bases") return state.picks.baseId === id;
    if (kind === "flavors") return state.picks.flavorIds.includes(id);
    if (kind === "foams") return state.picks.foamId === id;
    if (kind === "glasses") return state.picks.glassId === id;
    return false;
  }

  function paintCatalogList(box) {
    const kind = box.dataset.catalog;
    const input = box.querySelector("input");
    const q = fold((input && input.value) || "");
    const items = catalogEntries(kind).filter((it) => !q || fold(it.label).includes(q) || (it.aliases || []).some((alias) => fold(alias).includes(q)));
    const list = box.querySelector(".catalog-list");
    list.innerHTML = items.length
      ? items.map((it) => `<button type="button" class="catalog-item${catalogIsOn(kind, it.id) ? " on" : ""}" data-id="${escapeHtml(it.id)}">${escapeHtml(it.label)}</button>`).join("")
      : `<p class="empty">Nenhum item com esse nome.</p>`;
    list.querySelectorAll("[data-id]").forEach((btn) => {
      btn.onclick = () => pickFromCatalog(kind, btn.dataset.id);
    });
  }

  function syncCatalogOnStates(kind) {
    const box = document.querySelector(`.catalog[data-catalog="${kind}"]`);
    if (!box) return;
    box.querySelectorAll(".catalog-item").forEach((btn) => {
      btn.classList.toggle("on", catalogIsOn(kind, btn.dataset.id));
    });
  }

  function poolRoot(kind) {
    if (kind === "bases") return $("#pool-bases");
    if (kind === "flavors") return $("#pool-flavors");
    if (kind === "foams") return $("#pool-foams");
    if (kind === "glasses") return $("#pool-glasses");
    return null;
  }

  function chipLabel(kind, item) {
    if (!item) return "";
    if (kind === "flavors") return flavorChipText(item);
    if (kind === "glasses") return String(item.name || item.label || "").replace(/Copo |Taça /g, "");
    return item.label || "";
  }

  function poolAttr(kind) {
    if (kind === "bases") return "data-base";
    if (kind === "flavors") return "data-flavor";
    if (kind === "foams") return "data-foam";
    if (kind === "glasses") return "data-glass";
    return "data-id";
  }

  function bindPoolChip(kind, btn) {
    if (kind === "bases") {
      btn.onclick = () => {
        state.picks.baseId = btn.getAttribute("data-base");
        syncPoolSelection("bases");
        reassemble();
      };
    } else if (kind === "flavors") {
      btn.onclick = () => toggleFlavorId(btn.getAttribute("data-flavor"));
    } else if (kind === "foams") {
      btn.onclick = () => {
        state.picks.foamId = btn.getAttribute("data-foam") || null;
        syncPoolSelection("foams");
        reassemble();
      };
    } else if (kind === "glasses") {
      btn.onclick = () => {
        state.picks.glassId = btn.getAttribute("data-glass");
        syncPoolSelection("glasses");
        reassemble();
      };
    }
  }

  function ensurePoolChip(kind, item) {
    const root = poolRoot(kind);
    if (!root || !item) return null;
    const attr = poolAttr(kind);
    let btn = root.querySelector(`[${attr}="${CSS.escape(item.id)}"]`);
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip";
      btn.setAttribute(attr, item.id);
      btn.textContent = chipLabel(kind, item);
      bindPoolChip(kind, btn);
      if (kind === "foams") {
        const none = root.querySelector('[data-foam=""]');
        if (none) root.insertBefore(btn, none);
        else root.appendChild(btn);
      } else root.appendChild(btn);
    }
    return btn;
  }

  function syncPoolSelection(kind) {
    const root = poolRoot(kind);
    if (!root || !state.picks) return;
    if (kind === "bases") {
      root.querySelectorAll("[data-base]").forEach((b) => b.classList.toggle("on", b.getAttribute("data-base") === state.picks.baseId));
    } else if (kind === "flavors") {
      syncFlavorChips();
      syncOmitAcidChip();
    } else if (kind === "foams") {
      root.querySelectorAll("[data-foam]").forEach((b) => {
        const id = b.getAttribute("data-foam") || null;
        b.classList.toggle("on", id === state.picks.foamId || (!id && !state.picks.foamId));
      });
    } else if (kind === "glasses") {
      root.querySelectorAll("[data-glass]").forEach((b) => b.classList.toggle("on", b.getAttribute("data-glass") === state.picks.glassId));
    }
  }

  function rememberLemon(ids) {
    const lemons = (ids || []).filter((id) => CDMotor.isLemonAcid(id));
    if (lemons.length) state.picks.lemonBeforeOmit = lemons.slice();
  }

  function restoreRememberedLemon() {
    const remembered = (state.picks.lemonBeforeOmit || []).filter((id) => CDMotor.isLemonAcid(id));
    if (!remembered.length) return;
    if (state.picks.flavorIds.some((id) => CDMotor.isLemonAcid(id))) return;
    remembered.forEach((id) => {
      if (!state.picks.flavorIds.includes(id)) state.picks.flavorIds.push(id);
    });
  }

  function toggleFlavorId(id) {
    if (!state.picks || !id) return false;
    const arr = state.picks.flavorIds;
    const i = arr.indexOf(id);
    if (i >= 0) {
      const lemon = CDMotor.isLemonAcid(id);
      if (arr.length === 1 && !lemon) return false;
      arr.splice(i, 1);
      if (lemon && !arr.some((fid) => CDMotor.isLemonAcid(fid))) {
        rememberLemon([id]);
        state.picks.omitAcid = true;
      }
    } else {
      arr.push(id);
      if (CDMotor.isLemonAcid(id)) state.picks.omitAcid = false;
    }
    reassemble();
    return true;
  }

  function toggleOmitAcid() {
    if (!state.picks) return;
    if (state.picks.omitAcid) {
      state.picks.omitAcid = false;
      restoreRememberedLemon();
    } else {
      rememberLemon(state.picks.flavorIds);
      state.picks.omitAcid = true;
      state.picks.flavorIds = state.picks.flavorIds.filter((fid) => !CDMotor.isLemonAcid(fid));
    }
    reassemble();
  }

  function pickFromCatalog(kind, id) {
    if (!state.session || !state.picks || !id) return;
    const pools = state.session.pools;
    const st = state.session.state;
    if (kind === "bases") {
      if (state.picks.baseId === id) return;
      const item = CDMotor.catalogBases(st).find((b) => b.id === id);
      if (!item) return;
      if (!pools.bases.some((b) => b.id === id)) pools.bases.push(item);
      state.picks.baseId = id;
      ensurePoolChip("bases", item);
    } else if (kind === "flavors") {
      if (state.picks.flavorIds.includes(id)) {
        toggleFlavorId(id);
        return;
      }
      const item = CDMotor.catalogFlavors().find((f) => f.id === id);
      if (!item) return;
      if (!pools.flavors.some((f) => f.id === id)) {
        pools.flavors.push({ id: item.id, label: item.label, group: item.group, role: CDMotor.roleOf(item.id), exotic: false, kind: "catalog" });
      }
      state.picks.flavorIds.push(id);
      if (CDMotor.isLemonAcid(id)) state.picks.omitAcid = false;
      ensurePoolChip("flavors", pools.flavors.find((f) => f.id === id));
    } else if (kind === "foams") {
      if (state.picks.foamId === id) return;
      const item = CDMotor.catalogFoams().find((f) => f.id === id);
      if (!item) return;
      if (!pools.foams.some((f) => f.id === id)) pools.foams.push(item);
      state.picks.foamId = id;
      ensurePoolChip("foams", item);
    } else if (kind === "glasses") {
      if (state.picks.glassId === id) return;
      const item = CDMotor.catalogGlasses().find((g) => g.id === id);
      if (!item) return;
      if (!pools.glasses.some((g) => g.id === id)) pools.glasses.push(item);
      state.picks.glassId = id;
      ensurePoolChip("glasses", item);
    } else return;
    syncPoolSelection(kind);
    reassemble();
  }

  function customAddHtml(kind, placeholder) {
    return `<form class="custom-add" data-custom="${kind}" autocomplete="off">
      <label class="sr-only" for="custom-${kind}">${escapeHtml(placeholder)}</label>
      <input type="text" id="custom-${kind}" placeholder="${escapeHtml(placeholder)}" autocomplete="off" enterkeyhint="done" maxlength="80" />
      <button type="submit" class="btn btn-ghost btn-sm">Adicionar</button>
    </form>`;
  }

  function poolMatchTexts(kind, item) {
    if (kind === "glasses") return [item.name, item.label].filter(Boolean);
    if (kind === "flavors") return [item.label, flavorChipText(item)].filter(Boolean);
    return [item.label].filter(Boolean);
  }

  function findLabeled(kind, label) {
    const target = fold(label);
    const pool = (state.session.pools[kind] || []);
    const inPool = pool.find((item) => poolMatchTexts(kind, item).some((text) => fold(text) === target));
    if (inPool) return { source: "pool", id: inPool.id };
    const inCat = catalogEntries(kind).find((it) => fold(it.label) === target || (it.aliases || []).some((alias) => fold(alias) === target));
    if (inCat) return { source: "catalog", id: inCat.id };
    return null;
  }

  function slugPart(text) {
    return fold(text).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item";
  }

  function uniqueCustomId(kind, label) {
    const prefix = { bases: "base", flavors: "flavor", foams: "foam", glasses: "glass" }[kind] || "item";
    const base = `custom-${prefix}-${slugPart(label)}`;
    const customs = (state.picks && state.picks.customs) || {};
    const pools = state.session.pools;
    const taken = (candidate) => {
      if (customs[candidate]) return true;
      return ["bases", "flavors", "foams", "glasses", "lengtheners"].some((key) => (pools[key] || []).some((item) => item.id === candidate));
    };
    if (!taken(base)) return base;
    let n = 2;
    let id = `${base}-${n}`;
    while (taken(id)) {
      n += 1;
      id = `${base}-${n}`;
    }
    return id;
  }

  function makeCustomPoolItem(kind, id, label) {
    if (kind === "bases") {
      const zero = state.alcool === "sem";
      return {
        id,
        label,
        type: zero ? "zero" : "spirit",
        category: zero ? "zero" : "custom",
        role: zero ? "zero" : "base",
        custom: true,
      };
    }
    if (kind === "flavors") {
      return { id, label, group: "outros", role: "doce", exotic: false, kind: "custom", custom: true };
    }
    if (kind === "foams") return { id, label, custom: true };
    return { id, name: label, label, ml: 300, why: "Copo livre informado na ficha.", custom: true };
  }

  function selectPoolId(kind, id) {
    if (!state.picks || !id) return;
    if (kind === "bases") state.picks.baseId = id;
    else if (kind === "flavors") {
      if (!state.picks.flavorIds.includes(id)) state.picks.flavorIds.push(id);
      if (CDMotor.isLemonAcid(id)) state.picks.omitAcid = false;
    } else if (kind === "foams") state.picks.foamId = id;
    else if (kind === "glasses") state.picks.glassId = id;
    syncPoolSelection(kind);
    reassemble();
  }

  function addCustomItem(kind, raw) {
    const label = String(raw || "").replace(/\s+/g, " ").trim();
    if (!label || !state.session || !state.picks) return false;
    const found = findLabeled(kind, label);
    if (found && found.source === "pool") {
      const item = (state.session.pools[kind] || []).find((entry) => entry.id === found.id);
      ensurePoolChip(kind, item);
      selectPoolId(kind, found.id);
      return true;
    }
    if (found && found.source === "catalog") {
      pickFromCatalog(kind, found.id);
      return true;
    }
    const id = uniqueCustomId(kind, label);
    const item = makeCustomPoolItem(kind, id, label);
    state.session.pools[kind].push(item);
    if (!state.picks.customs) state.picks.customs = {};
    state.picks.customs[id] = {
      id,
      kind: kind === "flavors" ? "flavor" : kind === "bases" ? "base" : kind === "foams" ? "foam" : "glass",
      label,
      ml: kind === "glasses" ? 300 : undefined,
    };
    ensurePoolChip(kind, item);
    selectPoolId(kind, id);
    return true;
  }

  function bindCustomAdds() {
    document.querySelectorAll(".custom-add").forEach((form) => {
      form.onsubmit = (ev) => {
        ev.preventDefault();
        const input = form.querySelector("input");
        if (!input) return;
        if (!String(input.value || "").trim()) return;
        if (addCustomItem(form.dataset.custom, input.value)) input.value = "";
      };
    });
  }

  function bindCatalogs() {
    document.querySelectorAll(".catalog").forEach((box) => {
      const panel = box.querySelector(".catalog-panel");
      const input = box.querySelector("input");
      const toggle = box.querySelector(".catalog-toggle");
      if (!panel || !toggle) return;
      toggle.onclick = () => {
        const willOpen = panel.hasAttribute("hidden");
        document.querySelectorAll(".catalog-panel").forEach((p) => p.setAttribute("hidden", ""));
        if (!willOpen) return;
        panel.removeAttribute("hidden");
        if (input) input.value = "";
        paintCatalogList(box);
        if (input) input.focus();
      };
      if (input) input.oninput = () => paintCatalogList(box);
    });
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
    const foamBlock = `<section class="pool">
          <h2>Espuma</h2>
          <p class="hint">A cobertura só entra na ficha se você escolher uma espuma. O cardápio lista todas.</p>
          <div class="chip-grid" id="pool-foams">
            ${chipRow(pools.foams, state.picks.foamId, "data-foam", (f) => f.label)}
            <button type="button" class="chip auto-pick ${state.picks.foamId ? "" : "on"}" data-foam="">Sem espuma</button>
          </div>
          ${customAddHtml("foams", "Digite outra espuma")}
          ${catalogHtml("foams")}
        </section>`;
    const lenItems = pools.lengtheners.slice();
    root.innerHTML = `
      <div class="result-header">
        <h1 class="screen-title">Monte a ficha</h1>
        <p class="screen-sub">Escolha em cada grupo. A receita e as doses atualizam na hora.</p>
      </div>
      <div id="live-ficha">${liveHtml()}</div>
      <section class="pool">
        <h2>${baseTitle}</h2>
        <p class="hint">${state.alcool === "sem" ? "Até 5 sugestões. O cardápio abre H2OH!, soda limonada, suco e espumante sem álcool." : "Até 5 sugestões. Uma base por vez. O cardápio abre qualquer base da casa."}</p>
        <div class="chip-grid" id="pool-bases">
          ${chipRow(pools.bases, state.picks.baseId, "data-base", (b) => b.label)}
        </div>
        ${customAddHtml("bases", "Digite outra base")}
        ${catalogHtml("bases")}
      </section>
      <section class="pool">
        <h2>Sabores na ficha</h2>
        <p class="hint">Até 20. Cada sugestão tem pairing com o protagonista. Dá para tirar o limão. O cardápio abre a lista inteira.</p>
        <div class="chip-grid" id="pool-flavors">
          <button type="button" class="chip auto-pick ${state.picks.omitAcid ? "on" : ""}" id="btn-sem-limao">Sem limão</button>
          ${chipRow(pools.flavors, state.picks.flavorIds, "data-flavor", flavorChipText)}
        </div>
        ${customAddHtml("flavors", "Digite outro sabor")}
        ${catalogHtml("flavors")}
      </section>
      ${foamBlock}
      <section class="pool">
        <h2>Copo</h2>
        <p class="hint">Até 5 da MATRIZ. O primeiro é o sugerido. O cardápio abre os outros copos.</p>
        <div class="chip-grid" id="pool-glasses">
          ${chipRow(pools.glasses, state.picks.glassId, "data-glass", (g) => `${(g.name || g.label || "").replace(/Copo |Taça /g, "")}`)}
        </div>
        ${customAddHtml("glasses", "Digite outro copo")}
        ${catalogHtml("glasses")}
      </section>
      ${state.forca === "refrescante" ? `<section class="pool">
        <h2>Alongador</h2>
        <p class="hint">Força refrescante: a ficha leva refrigerante, suco, espumante ou soda.</p>
        <div class="chip-grid" id="pool-length">
          ${chipRow(lenItems, state.picks.lengthenerId, "data-len", (l) => l.label)}
        </div>
      </section>` : ""}
      <div class="btn-row" style="margin-top:16px">
        <button type="button" class="btn btn-ghost" id="btn-back-build">← Voltar</button>
        <button type="button" class="btn btn-ghost" id="btn-nova">Nova criação</button>
      </div>
    `;

    $("#pool-bases").querySelectorAll("[data-base]").forEach((btn) => bindPoolChip("bases", btn));
    $("#pool-flavors").querySelectorAll("[data-flavor]").forEach((btn) => bindPoolChip("flavors", btn));
    const omitBtn = $("#btn-sem-limao");
    if (omitBtn) omitBtn.onclick = () => toggleOmitAcid();
    const foamRoot = $("#pool-foams");
    if (foamRoot) foamRoot.querySelectorAll("[data-foam]").forEach((btn) => bindPoolChip("foams", btn));
    $("#pool-glasses").querySelectorAll("[data-glass]").forEach((btn) => bindPoolChip("glasses", btn));
    const lenRoot = $("#pool-length");
    if (lenRoot) {
      lenRoot.querySelectorAll("[data-len]").forEach((btn) => {
        btn.onclick = () => {
          const id = btn.dataset.len || null;
          if (!id) return;
          state.picks.lengthenerId = id;
          lenRoot.querySelectorAll("[data-len]").forEach((b) => {
            b.classList.toggle("on", b.dataset.len === state.picks.lengthenerId);
          });
          reassemble();
        };
      });
    }
    $("#btn-back-build").onclick = () => back();
    bindLiveControls();
    bindCatalogs();
    bindCustomAdds();
    $("#btn-nova").onclick = () => {
      resetChoices();
      go("home");
    };
    if (scrollResultado) {
      scrollResultado = false;
      window.scrollTo(0, 0);
    }
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
