/* Motor de sugestão — pipeline app-motor-regras.md */
window.CDMotor = (function () {
  const D = () => window.CDData;

  function clone(o) {
    return JSON.parse(JSON.stringify(o));
  }

  /** §2.1 Validar */
  function validate(state) {
    const s = clone(state);
    if (!s.sabores || s.sabores.length < 1) throw new Error("Selecione ao menos 1 sabor.");
    if (!s.perfil || s.perfil.length < 1) throw new Error("Selecione 1–2 perfis.");
    if (s.alcool === "sem") s.destilado = null;
    s.forca = s.forca || "equilibrado";
    s.copo = s.copo || "auto";
    s.sabores = s.sabores.slice(0, 3);
    s.perfil = s.perfil.slice(0, 2);
    return s;
  }

  /** §3 Resolver base */
  function resolveBase(state) {
    if (state.alcool === "sem") {
      const zero = pickZeroBase(state);
      return { type: "zero", id: zero.id, label: zero.label, suggested: true, alt: null };
    }
    if (state.destilado) {
      return {
        type: "spirit",
        id: state.destilado,
        label: D().SPIRIT_LABELS[state.destilado] || state.destilado,
        suggested: false,
        alt: suggestSpirit(state, state.destilado),
      };
    }
    const primary = suggestSpirit(state, null);
    const alt = suggestSpirit(state, primary);
    return {
      type: "spirit",
      id: primary,
      label: D().SPIRIT_LABELS[primary],
      suggested: true,
      alt,
    };
  }

  function suggestSpirit(state, exclude) {
    const scores = { vodka: 0, gin: 0, rum: 0, whiskey: 0, cachaca: 0, tequila: 0 };
    const tags = [...(state.sabores || []), ...(state.perfil || [])];
    D().SPIRIT_HEURISTICS.forEach((h) => {
      h.tags.forEach((t) => {
        if (tags.includes(t)) {
          h.spirits.forEach((sp) => {
            scores[sp] += t === state.sabores[0] ? 3 : 1;
          });
        }
      });
    });
    // perfil boosts
    (state.perfil || []).forEach((p) => {
      if (p === "herbal" || p === "floral") scores.gin += 2;
      if (p === "amadeirado" || p === "amargo") scores.whiskey += 2;
      if (p === "picante") scores.tequila += 2;
      if (p === "frutado" || p === "equilibrado") scores.vodka += 1;
      if (p === "refrescante") scores.gin += 1;
    });
    if ((state.sabores || []).includes("melao")) {
      scores.vodka += 2;
      scores.gin += 1;
    }
    if ((state.sabores || []).some((s) => s === "amaro" || s === "ramazzotti")) {
      scores.whiskey += 2;
      scores.gin += 1;
    }
    if (exclude) scores[exclude] = -99;
    let best = "gin";
    let bestScore = -1;
    Object.keys(scores).forEach((k) => {
      if (scores[k] > bestScore) {
        bestScore = scores[k];
        best = k;
      }
    });
    if (bestScore <= 0 && !exclude) {
      const p = (state.perfil || [])[0];
      if (p === "equilibrado" || p === "frutado") return "vodka";
      return "gin";
    }
    return best;
  }

  function pickZeroBase(state) {
    const lead = state.sabores[0];
    if (["manjericao", "hortela", "alecrim", "pepino"].includes(lead)) return D().ZERO_BASES.find((z) => z.id === "tisana");
    if (["morango", "framboesa", "amora", "melancia", "melao"].includes(lead)) return D().ZERO_BASES.find((z) => z.id === "cha-hibisco");
    if (["limao", "lima", "grapefruit", "maracuja"].includes(lead)) return D().ZERO_BASES.find((z) => z.id === "shrub");
    if (["cafe", "chocolate", "canela", "amaro", "ramazzotti"].includes(lead)) return D().ZERO_BASES.find((z) => z.id === "blend-zero");
    return D().ZERO_BASES.find((z) => z.id === "cha-verde") || D().ZERO_BASES[0];
  }

  /** §4 Expandir sabores → acorde + ponte */
  function expandFlavors(state) {
    const lead = state.sabores[0];
    const secondary = state.sabores.slice(1);
    const aff = D().getAffinities(lead) || [];
    // filter to known ingredients, prefer secondary overlap
    let candidates = aff.filter((a) => D().getIngredient(a));
    secondary.forEach((s) => {
      const sa = D().getAffinities(s) || [];
      sa.forEach((x) => {
        if (!candidates.includes(x) && D().getIngredient(x) && x !== lead) candidates.push(x);
      });
    });
    // align to profile
    const perfil = state.perfil || [];
    const scored = candidates.map((id) => {
      let sc = 1;
      const ing = D().getIngredient(id);
      if (perfil.includes("citrico") && ing.group === "citrico") sc += 3;
      if (perfil.includes("herbal") && ing.group === "erva") sc += 3;
      if (perfil.includes("floral") && ing.group === "floral") sc += 3;
      if (perfil.includes("picante") && (id === "chile" || id === "gengibre")) sc += 3;
      if (perfil.includes("frutado") && ["berry", "tropical", "stone", "fruta", "pome"].includes(ing.group)) sc += 2;
      if (perfil.includes("doce") && (ing.group === "doce" || id === "coco" || id === "baunilha")) sc += 2;
      if (perfil.includes("amadeirado") && ["canela", "cafe", "chocolate", "maca"].includes(id)) sc += 2;
      if (perfil.includes("refrescante") && ["hortela", "pepino", "lima", "gengibre"].includes(id)) sc += 2;
      if (perfil.includes("amargo") && (["grapefruit", "cafe", "laranja", "amaro", "ramazzotti"].includes(id) || ing.group === "bitter")) sc += 3;
      if (perfil.includes("refrescante") && id === "melao") sc += 2;
      if (perfil.includes("frutado") && id === "melao") sc += 2;
      if (secondary.includes(id)) sc += 4;
      // volume: penalize multiple loud
      if (ing.volume === "loud") sc -= 0.5;
      return { id, sc, volume: ing.volume };
    });
    scored.sort((a, b) => b.sc - a.sc);

    // build chord 3 notes + 1 bridge; max 1 loud
    const chord = [lead];
    let loudCount = D().getIngredient(lead)?.volume === "loud" ? 1 : 0;
    for (const c of scored) {
      if (chord.includes(c.id)) continue;
      if (c.volume === "loud" && loudCount >= 1) continue;
      chord.push(c.id);
      if (c.volume === "loud") loudCount++;
      if (chord.length >= 3) break;
    }
    // bridge: common affinity between lead and second chord note, or citrus default
    let bridge = null;
    if (chord.length >= 2) {
      const a1 = D().getAffinities(chord[0]) || [];
      const a2 = D().getAffinities(chord[1]) || [];
      bridge = a1.find((x) => a2.includes(x) && !chord.includes(x)) || null;
    }
    if (!bridge) {
      bridge = ["lima", "limao", "gengibre", "hortela"].find((x) => !chord.includes(x)) || "lima";
    }
    if (chord.length < 3) {
      for (const c of scored) {
        if (!chord.includes(c.id)) {
          chord.push(c.id);
          break;
        }
      }
    }
    return { lead, chord, bridge, secondary, affinities: scored.slice(0, 8).map((s) => s.id) };
  }

  /** Live complementos for UI */
  function suggestComplements(sabores) {
    if (!sabores || !sabores.length) return [];
    const lead = sabores[0];
    const aff = D().getAffinities(lead) || [];
    const out = [];
    aff.forEach((id) => {
      if (!sabores.includes(id) && D().getIngredient(id)) {
        out.push({ id, label: D().getIngredient(id).label, source: "LIVRO" });
      }
    });
    sabores.slice(1).forEach((s) => {
      (D().getAffinities(s) || []).forEach((id) => {
        if (!sabores.includes(id) && !out.find((o) => o.id === id) && D().getIngredient(id)) {
          out.push({ id, label: D().getIngredient(id).label, source: "LIVRO" });
        }
      });
    });
    return out.slice(0, 10);
  }


  function isBitterLead(flavors, state) {
    const ids = [flavors.lead, ...(flavors.secondary || []), ...(state.sabores || [])];
    return ids.some((id) => id === "amaro" || id === "ramazzotti");
  }

  function bitterLabel(state, flavors) {
    if ((state.sabores || []).includes("ramazzotti") || flavors.lead === "ramazzotti") return "Ramazzotti";
    if ((state.sabores || []).includes("amaro") || flavors.lead === "amaro") return "Amaro italiano";
    return "Campari / amaro";
  }

  /** §5 Família estrutural */
  function chooseFamily(state, base, flavors) {
    const p = state.perfil || [];
    const lead = flavors.lead;
    const leadIng = D().getIngredient(lead);
    const bitter = isBitterLead(flavors, state);
    const fruitLead = ["berry", "tropical", "citrico", "fruta", "stone", "pome"].includes(leadIng?.group);

    if (state.alcool === "sem") {
      if (bitter && (p.includes("refrescante") || p.includes("amargo"))) return "mocktail-long";
      if (p.includes("refrescante") || p.includes("herbal")) return "mocktail-long";
      return "mocktail-up";
    }
    // Melão + amaro/Ramazzotti: aperitivo long / spritz / spirit-forward
    if (bitter) {
      if (p.includes("refrescante") || lead === "melao" || fruitLead) return "spritz";
      if (p.includes("amadeirado") || base.id === "whiskey") return "build";
      if (p.includes("amargo") || leadIng?.group === "bitter") return "spirit-forward";
      return "spritz";
    }
    if (p.includes("amargo") && (base.id === "whiskey" || base.id === "gin") && !fruitLead) {
      if (p.includes("amadeirado") || lead === "cafe" || lead === "chocolate") return "build";
      return "spirit-forward";
    }
    if (p.includes("refrescante") && !p.includes("picante")) {
      if (lead === "gengibre" || flavors.chord.includes("gengibre")) return "mule";
      if (base.id === "gin" && (p.includes("herbal") || p.includes("floral"))) return "gin-tonic";
      if (lead === "melao") return "long";
      return "long";
    }
    if (p.includes("amargo") && p.includes("refrescante")) return "spritz";
    if (
      p.includes("citrico") ||
      p.includes("frutado") ||
      p.includes("equilibrado") ||
      fruitLead
    ) {
      return "sour";
    }
    if (p.includes("amadeirado") || base.id === "whiskey") return "build";
    if (p.includes("herbal") && base.id === "gin") return "sour";
    return "sour";
  }

  /** §6 Proporções */
  function proportions(forca, family, perfil) {
    const f = forca || "equilibrado";
    let base, acido, doce;
    const isLong = ["long", "highball", "collins", "gin-tonic", "mule", "spritz", "mocktail-long"].includes(family);
    const isSpirit = ["spirit-forward", "build"].includes(family);

    if (isSpirit) {
      if (f === "suave") {
        base = 40;
        acido = 0;
        doce = 15;
      } else if (f === "forte") {
        base = 60;
        acido = 0;
        doce = 10;
      } else {
        base = 50;
        acido = 0;
        doce = 15;
      }
    } else if (isLong) {
      if (f === "suave") base = 40;
      else if (f === "forte") base = 60;
      else base = 50;
      if (family === "gin-tonic") base = f === "forte" ? 70 : f === "suave" ? 50 : 70;
      acido = f === "suave" ? 15 : f === "forte" ? 10 : 10;
      doce = f === "suave" ? 15 : f === "forte" ? 10 : 15;
    } else {
      // sour-like
      if (f === "suave") {
        base = 40;
        acido = 28;
        doce = 20;
      } else if (f === "forte") {
        base = 58;
        acido = 18;
        doce = 12;
      } else {
        base = 50;
        acido = 22;
        doce = 18;
      }
    }

    // perfil puxa esqueleto §6.3
    (perfil || []).forEach((p) => {
      if (p === "doce") {
        doce += 5;
        acido = Math.max(0, acido - 3);
      }
      if (p === "citrico") acido += 5;
      if (p === "amargo") {
        /* bitter added later */
      }
    });

    return { base, acido, doce };
  }

  function techniqueFor(family) {
    if (["spirit-forward"].includes(family)) return { method: "MEXIDO", detail: "MEXIDO no mixing glass, coagagem simples, servir up ou rocks." };
    if (["build"].includes(family)) return { method: "MONTADO", detail: "MONTADO direto no copo sobre rock grande; swirl ocasional." };
    if (["long", "highball", "collins", "gin-tonic", "mule", "spritz", "mocktail-long"].includes(family))
      return { method: "MONTADO", detail: "MONTADO no copo com gelo; completar com soft; misturar levemente." };
    return { method: "BATIDO", detail: "BATIDO ≥10 s, coagagem dupla, gelar taça, passar tudo para o copo/taça." };
  }

  /** §7 Copo */
  function chooseGlass(family, copoId) {
    const glasses = D().GLASSES;
    if (copoId && copoId !== "auto") {
      const g = glasses.find((x) => x.id === copoId);
      if (g) return g;
    }
    const map = {
      sour: "coupe-megan-300",
      daisy: "coupe-megan-300",
      "spirit-forward": "whiskey-forest-310",
      build: "whiskey-forest-310",
      rocks: "whiskey-soho-310",
      long: "long-350",
      highball: "long-forest-390",
      collins: "long-350",
      spritz: "vinho-xtra-460",
      "gin-tonic": "gin-600",
      mule: "mule-cobre-500",
      "mocktail-up": "coupe-xtra-220",
      "mocktail-long": "long-300",
      "spirit-up": "martini-210",
    };
    const id = map[family] || "coupe-megan-300";
    return glasses.find((g) => g.id === id) || glasses[0];
  }

  function liquidName(id, kind) {
    const m = D().LIQUID_MAP[id];
    if (!m) return null;
    return m[kind] || null;
  }

  function ingredientLabel(id) {
    return D().getIngredient(id)?.label || id;
  }

  function nameDrink(state, base, flavors, family, variant) {
    const lead = ingredientLabel(flavors.lead).toUpperCase();
    const spiritBit =
      base.type === "zero"
        ? "ZERO"
        : { vodka: "VODKA", gin: "GIN", rum: "RUM", whiskey: "WHISKEY", cachaca: "CANA", tequila: "AGAVE" }[base.id] || "TB";
    const famBit = {
      sour: "SOUR",
      daisy: "DAISY",
      "spirit-forward": "FORWARD",
      build: "FASHIONED",
      long: "HIGHBALL",
      highball: "HIGHBALL",
      collins: "COLLINS",
      spritz: "SPRITZ",
      "gin-tonic": "TÔNICA",
      mule: "MULE",
      "mocktail-up": "FRESH",
      "mocktail-long": "COOLER",
    }[family] || "DRINK";

    const names = [
      `${lead} ${famBit}`,
      `${spiritBit} ${lead}`,
      `NOVA ${lead}`,
    ];
    if (variant === "B") return `${lead} ${flavors.bridge ? ingredientLabel(flavors.bridge).toUpperCase() : "PONTE"}`;
    if (variant === "C") {
      if (base.alt) return `${({ vodka: "VODKA", gin: "GIN", rum: "RUM", whiskey: "WHISKEY", cachaca: "CANA", tequila: "AGAVE" }[base.alt] || "ALT")} ${lead}`;
      return `${lead} SUAVE`;
    }
    return names[0];
  }

  function buildIngredients(state, base, flavors, family, props, variant) {
    const items = [];
    const isZero = base.type === "zero";
    const spiritId = variant === "C" && base.alt ? base.alt : base.id;
    const spiritLabel = isZero ? base.label : D().SPIRIT_LABELS[spiritId] || spiritId;

    let baseMl = props.base;
    if (variant === "C" && !base.alt) {
      // versão mais suave
      baseMl = Math.max(35, baseMl - 10);
    }

    items.push({ nome: spiritLabel, qtd: baseMl, unidade: "ml", role: "base" });

    // acid
    const acidSource =
      flavors.chord.find((id) => ["limao", "lima", "grapefruit", "laranja"].includes(id)) ||
      (state.perfil.includes("citrico") ? "limao" : null) ||
      (["sour", "daisy", "mocktail-up", "long", "mule", "collins"].includes(family) ? (flavors.lead === "lima" || flavors.chord.includes("lima") ? "lima" : "limao") : null);

    if (props.acido > 0 && acidSource) {
      const j = liquidName(acidSource, "juice") || `Suco de ${ingredientLabel(acidSource).toLowerCase()}`;
      items.push({ nome: j, qtd: props.acido, unidade: "ml", role: "acido" });
    }

    // sweet / fruit body from lead
    const lead = flavors.lead;
    const leadJuice = liquidName(lead, "juice");
    const leadSyrup = liquidName(lead, "syrup");
    let doceLeft = props.doce;

    if (leadJuice && !["limao", "lima", "laranja", "grapefruit"].includes(lead)) {
      const fruitMl = family === "sour" || family === "mocktail-up" ? 20 : 25;
      items.push({ nome: leadJuice, qtd: fruitMl, unidade: "ml", role: "fruta" });
      if (["manga", "melancia", "melao", "abacaxi", "pessego", "morango"].includes(lead)) doceLeft = Math.max(8, doceLeft - 5);
    }

    // bridge / chord syrup or herb
    const bridge = variant === "B" ? flavors.bridge : flavors.chord[1] || flavors.bridge;
    const bridgeSyrup = liquidName(bridge, "syrup");
    if (bridgeSyrup && doceLeft > 0) {
      const q = Math.min(doceLeft, family === "build" ? props.doce : Math.round(doceLeft * 0.6));
      items.push({ nome: bridgeSyrup, qtd: q, unidade: "ml", role: "doce" });
      doceLeft -= q;
    } else if (leadSyrup && doceLeft > 0 && !leadJuice) {
      items.push({ nome: leadSyrup, qtd: doceLeft, unidade: "ml", role: "doce" });
      doceLeft = 0;
    }

    if (doceLeft > 0) {
      const sweetName =
        state.perfil.includes("doce") && liquidName("mel", "syrup")
          ? liquidName("mel", "syrup")
          : spiritId === "tequila"
            ? "Néctar de agave"
            : "Xarope simples (1:1)";
      items.push({ nome: sweetName, qtd: doceLeft, unidade: "ml", role: "doce" });
    }

    // bitter for amargo / spirit-forward / amaro-as-sabor / spritz
    const wantsBitter =
      state.perfil.includes("amargo") ||
      family === "spirit-forward" ||
      family === "build" ||
      family === "spritz" ||
      isBitterLead(flavors, state);
    if (wantsBitter) {
      const named = bitterLabel(state, flavors);
      const houseAmaro = named !== "Campari / amaro";
      if (family === "build") {
        if (houseAmaro) {
          items.push({ nome: named, qtd: state.perfil.includes("amargo") ? 15 : 10, unidade: "ml", role: "amargo" });
        } else {
          items.push({ nome: "Angostura bitter", qtd: 2, unidade: "dash", role: "amargo" });
        }
      } else if (family === "spirit-forward") {
        items.push({ nome: "Vermute rosso", qtd: 25, unidade: "ml", role: "mod" });
        items.push({ nome: named, qtd: 25, unidade: "ml", role: "amargo" });
      } else if (family === "spritz") {
        items.push({ nome: named, qtd: houseAmaro ? 40 : 40, unidade: "ml", role: "amargo" });
      } else {
        items.push({ nome: houseAmaro ? named : "Bitter aromático", qtd: houseAmaro ? 15 : 5, unidade: "ml", role: "amargo" });
      }
    }

    // top-up soft
    if (["long", "highball", "collins", "mocktail-long"].includes(family)) {
      items.push({ nome: "Soda", qtd: "COMPLETAR", unidade: "", role: "top" });
    }
    if (family === "gin-tonic") {
      items.push({ nome: "Tônica", qtd: "COMPLETAR", unidade: "", role: "top" });
    }
    if (family === "mule") {
      items.push({ nome: "Ginger beer", qtd: "COMPLETAR", unidade: "", role: "top" });
    }
    if (family === "spritz") {
      items.push({ nome: "Espumante (TB) / Prosecco", qtd: "COMPLETAR", unidade: "", role: "top" });
      items.push({ nome: "Soda", qtd: 20, unidade: "ml", role: "top" });
    }

    // herbs as muddle / slap
    const herb = flavors.chord.find((id) => ["hortela", "manjericao", "cilantro", "alecrim"].includes(id));
    if (herb && family !== "spirit-forward") {
      items.push({
        nome: `${ingredientLabel(herb)} (folhas)`,
        qtd: herb === "alecrim" ? 1 : 6,
        unidade: herb === "alecrim" ? "sprig" : "folhas",
        role: "erva",
      });
    }

    // chili sub-limiar
    if (state.perfil.includes("picante") || flavors.chord.includes("chile")) {
      if (!items.find((i) => /chili|jalapeño/i.test(i.nome))) {
        items.push({ nome: "Xarope de chili (sub-limiar)", qtd: 5, unidade: "ml", role: "picante" });
      }
    }

    // sal sub-limiar LI/TB
    if (["cafe", "chocolate", "morango", "tomate", "melancia", "melao", "abacaxi"].includes(lead) || state.perfil.includes("frutado")) {
      items.push({ nome: "Solução salina 20%", qtd: 2, unidade: "gotas", role: "sal" });
    }

    return items;
  }

  function garnishFor(flavors, family) {
    const leadG = liquidName(flavors.lead, "garnish");
    const bridgeG = liquidName(flavors.bridge, "garnish");
    const parts = [];
    if (leadG) parts.push(leadG);
    else if (bridgeG) parts.push(bridgeG);
    if (flavors.chord.includes("hortela") && !parts.some((p) => /hortel/i.test(p))) parts.push("Copa de hortelã");
    if (family === "build") parts.push("Zest de laranja expresso");
    if (!parts.length) parts.push("Zest de limão siciliano");
    return parts.join(" · ");
  }

  function paladarTags(state, family) {
    const tags = [];
    (state.perfil || []).forEach((p) => {
      const map = {
        doce: "DOCE",
        amargo: "AMARGO",
        citrico: "CÍTRICO",
        equilibrado: "EQUILIBRADO",
        herbal: "HERBAL",
        frutado: "FRUTADO",
        amadeirado: "AMADEIRADO",
        floral: "FLORAL",
        picante: "PICANTE",
        refrescante: "REFRESCANTE",
      };
      if (map[p]) tags.push(map[p]);
    });
    if (state.forca === "forte" && !tags.includes("FORTE")) tags.push("FORTE");
    if (state.forca === "suave" && !tags.includes("SUAVE")) tags.push("SUAVE");
    if (family === "mule" && !tags.includes("REFRESCANTE")) tags.push("REFRESCANTE");
    return tags.slice(0, 4);
  }

  function explain(state, base, flavors, family, glass) {
    const parts = [];
    parts.push({
      title: "Pairing",
      text: `Protagonista ${ingredientLabel(flavors.lead)}; acorde ${flavors.chord.map(ingredientLabel).join(" + ")}; ponte ${ingredientLabel(flavors.bridge)}. [LIVRO] afinidades · [BAR] base.`,
    });
    if (base.suggested && base.type === "spirit") {
      parts.push({
        title: "Base",
        text: `Destilado sugerido: ${base.label} pela heurística protagonista/perfil [BAR/TB].${base.alt ? ` Alternativa no card C: ${D().SPIRIT_LABELS[base.alt]}.` : ""}`,
      });
    } else if (base.type === "zero") {
      parts.push({ title: "Zero álcool", text: `Base sem álcool: ${base.label}. Mantém ácido + doce + textura; ABV ≈ 0. [TB]` });
    } else {
      parts.push({ title: "Base", text: `Usando ${base.label} escolhido. [TB]` });
    }
    parts.push({
      title: "Estrutura",
      text: `Família ${family.toUpperCase()} · força ${state.forca} · proporções LI/TB (base mediana ~50 ml sour). Método ${techniqueFor(family).method}.`,
    });
    parts.push({
      title: "Copo",
      text: `${glass.name} (${glass.ml} ml): ${glass.why} [MATRIZ]`,
    });
    return parts;
  }

  function buildFicha(state, base, flavors, family, props, glass, variant) {
    const tech = techniqueFor(family);
    const ingredients = buildIngredients(state, base, flavors, family, props, variant);
    // for spirit-forward negroni-like, simplify ingredients
    if (family === "spirit-forward" && variant === "A") {
      const spiritId = base.id;
      const fixed = [
        { nome: D().SPIRIT_LABELS[spiritId], qtd: props.base || 40, unidade: "ml", role: "base" },
        { nome: "Vermute rosso", qtd: props.base >= 50 ? 25 : 20, unidade: "ml", role: "mod" },
        { nome: bitterLabel(state, flavors), qtd: props.base >= 50 ? 25 : 20, unidade: "ml", role: "amargo" },
      ];
      if (flavors.chord.includes("laranja") || state.perfil.includes("amadeirado")) {
        /* garnish handles orange */
      }
      return finalizeFicha(state, base, flavors, family, glass, variant, tech, fixed);
    }

    return finalizeFicha(state, base, flavors, family, glass, variant, tech, ingredients);
  }

  function finalizeFicha(state, base, flavors, family, glass, variant, tech, ingredients) {
    const nome = nameDrink(state, base, flavors, family, variant);
    const categoria = state.alcool === "sem" ? "3 ZERO ÁLCOOL" : "2 AUTORAL";
    const mirror =
      state.alcool === "com"
        ? {
            nome: nome + " SEM ÁLCOOL",
            nota: `Trocar ${ingredients[0]?.nome || "base"} por ${pickZeroBase(state).label}; manter ácido/doce/ervas.`,
          }
        : null;

    return {
      variant,
      nome,
      categoria,
      ingredientes: ingredients,
      paladar: paladarTags(state, family),
      preparo: tech.detail,
      metodo: tech.method,
      copo: glass.name,
      copoMl: glass.ml,
      copoWhy: glass.why,
      guarnicao: garnishFor(flavors, family),
      gelo: family === "build" ? "GELO CUBO GRANDE / ESFERA" : family.includes("long") || family === "mule" || family === "gin-tonic" ? "GELO CUBO NORMAL" : "Taça gelada · sem gelo no serviço (up)",
      canudo: ["long", "mule", "gin-tonic", "mocktail-long", "collins", "highball"].includes(family) ? "LONGO" : null,
      familia: family,
      mirror,
      baseId: base.type === "zero" ? null : variant === "C" && base.alt ? base.alt : base.id,
    };
  }

  /** Main pipeline */
  function generate(rawState) {
    const state = validate(rawState);
    const base = resolveBase(state);
    const flavors = expandFlavors(state);
    const familyA = chooseFamily(state, base, flavors);

    // Variant B: alternate method or bridge focus
    let familyB = familyA;
    if (familyA === "sour") familyB = state.perfil.includes("refrescante") ? "long" : "sour";
    else if (familyA === "long" || familyA === "mule") familyB = "sour";
    else if (familyA === "spirit-forward") familyB = "build";
    else if (familyA === "build") familyB = "spirit-forward";
    else if (familyA === "spritz") familyB = isBitterLead(flavors, state) ? "long" : "sour";
    else if (familyA.startsWith("mocktail")) familyB = familyA === "mocktail-long" ? "mocktail-up" : "mocktail-long";
    else familyB = "long";

    // Variant C: alt base or softer
    const familyC = familyA;

    const propsA = proportions(state.forca, familyA, state.perfil);
    const propsB = proportions(state.forca, familyB, state.perfil);
    let forcaC = state.forca;
    if (!base.alt) forcaC = state.forca === "forte" ? "equilibrado" : state.forca === "suave" ? "equilibrado" : "suave";
    const propsC = proportions(forcaC, familyC, state.perfil);

    const glassA = chooseGlass(familyA, state.copo);
    const glassB = chooseGlass(familyB, state.copo === "auto" ? "auto" : state.copo);
    const glassC = chooseGlass(familyC, state.copo);

    const fichas = [
      buildFicha(state, base, flavors, familyA, propsA, glassA, "A"),
      buildFicha(state, base, flavors, familyB, propsB, glassB, "B"),
      buildFicha(state, base, flavors, familyC, propsC, glassC, "C"),
    ];

    return {
      state,
      base,
      flavors: {
        lead: flavors.lead,
        chord: flavors.chord,
        bridge: flavors.bridge,
        chordLabels: flavors.chord.map(ingredientLabel),
        bridgeLabel: ingredientLabel(flavors.bridge),
        affinities: flavors.affinities.map(ingredientLabel),
      },
      glassSuggested: glassA,
      explain: explain(state, base, flavors, familyA, glassA),
      fichas,
    };
  }

  /** Adjustments §9 */
  function adjust(prevState, action) {
    const s = clone(prevState);
    if (action === "mais-doce") {
      if (!s.perfil.includes("doce")) {
        if (s.perfil.length >= 2) s.perfil[1] = "doce";
        else s.perfil.push("doce");
      }
      s._nudge = "doce";
    } else if (action === "mais-citrico") {
      if (!s.perfil.includes("citrico")) {
        if (s.perfil.length >= 2) s.perfil[1] = "citrico";
        else s.perfil.push("citrico");
      }
      s._nudge = "citrico";
    } else if (action === "mais-forte") {
      s.forca = s.forca === "suave" ? "equilibrado" : "forte";
    } else if (action === "mais-suave") {
      s.forca = s.forca === "forte" ? "equilibrado" : "suave";
    } else if (action === "trocar-base") {
      if (s.alcool === "sem") {
        /* cycle zero base via clearing — generate will pick */
        s._forceZeroCycle = true;
      } else {
        const order = ["vodka", "gin", "rum", "whiskey", "cachaca", "tequila"];
        const cur = s.destilado || suggestSpirit(s, null);
        const idx = order.indexOf(cur);
        s.destilado = order[(idx + 1) % order.length];
      }
    } else if (action === "outra-rodada") {
      // rotate sabores: move secondary affinities into play by shuffling secondary
      if (s.sabores.length === 1) {
        const aff = D().getAffinities(s.sabores[0]) || [];
        const next = aff.find((a) => D().getIngredient(a));
        if (next) s.sabores.push(next);
      } else {
        s.sabores = [s.sabores[0], ...s.sabores.slice(1).reverse()];
      }
      s._seed = (s._seed || 0) + 1;
    }
    return generate(s);
  }

  function surprise(zero) {
    const ings = D().INGREDIENTS;
    const pick = () => ings[Math.floor(Math.random() * ings.length)].id;
    const s1 = pick();
    let s2 = pick();
    while (s2 === s1) s2 = pick();
    const profiles = D().PROFILES;
    const p1 = profiles[Math.floor(Math.random() * profiles.length)].id;
    let p2 = profiles[Math.floor(Math.random() * profiles.length)].id;
    while (p2 === p1) p2 = profiles[Math.floor(Math.random() * profiles.length)].id;
    const forcas = ["suave", "equilibrado", "forte"];
    return generate({
      alcool: zero ? "sem" : "com",
      destilado: null,
      sabores: [s1, s2],
      perfil: [p1, p2],
      forca: forcas[Math.floor(Math.random() * forcas.length)],
      copo: "auto",
    });
  }

  return {
    generate,
    adjust,
    surprise,
    suggestComplements,
    suggestSpirit,
    chooseGlass,
    validate,
  };
})();
