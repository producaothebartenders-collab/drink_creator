/* Motor de sugestão — montador ao vivo.
   Perfil e força seguem as regras pedidas; o esqueleto de dose continua LI/TB.
   Inferência que não estava escrita entra marcada [BAR] no texto da ficha. */
window.CDMotor = (function () {
  const D = () => window.CDData;

  function clone(o) {
    return JSON.parse(JSON.stringify(o));
  }

  function spiritCategory(id) {
    if (!id) return null;
    return D().spiritCategory ? D().spiritCategory(id) : id;
  }

  function spiritRole(id) {
    if (!id) return "base";
    return D().spiritRole ? D().spiritRole(id) : "base";
  }

  function spiritLabel(id) {
    if (!id) return "";
    const labels = D().SPIRIT_LABELS || {};
    if (labels[id]) return labels[id];
    const rec = D().getSpirit ? D().getSpirit(id) : null;
    return rec ? rec.label : id;
  }

  function flavorLabel(id) {
    if (!id) return "";
    const ing = D().getIngredient(id);
    if (ing) return ing.label;
    if (String(id).indexOf("juice:") === 0) {
      const fid = id.slice(6);
      return `Suco de ${flavorLabel(fid).toLowerCase()}`;
    }
    return spiritLabel(id) || id;
  }

  const NAME_BITS = {
    vodka: "VODKA",
    gin: "GIN",
    rum: "RUM",
    whiskey: "WHISKEY",
    cachaca: "CANA",
    tequila: "AGAVE",
    espumante: "ESPUMANTE",
    pisco: "PISCO",
    saque: "SAQUÊ",
    soju: "SOJU",
    conhaque: "CONHAQUE",
    brandy: "BRANDY",
    vinho: "VINHO",
    steinhager: "STEINHÄGER",
    brize: "BRIZÊ",
    vermouth: "VERMOUTH",
    licor: "LICOR",
    bitter: "BITTER",
    aperitivo: "APERITIVO",
  };

  function nameBit(id, category) {
    const cat = category || spiritCategory(id);
    if (id && cat && id !== cat) {
      const label = spiritLabel(id);
      if (label && label !== id) return label.toUpperCase();
    }
    return NAME_BITS[cat] || NAME_BITS[id] || (spiritLabel(id) || "TB").toUpperCase();
  }

  const FORCAS = ["suave", "equilibrado", "forte", "refrescante"];

  function validate(state) {
    const s = clone(state || {});
    if (!s.sabores || s.sabores.length < 1) throw new Error("Selecione ao menos 1 sabor.");
    if (!s.perfil || s.perfil.length < 1) throw new Error("Selecione 1–2 perfis.");
    s.perfil = s.perfil.filter((p) => p && p !== "refrescante").slice(0, 2);
    if (!s.perfil.length) throw new Error("Selecione 1–2 perfis.");
    if (s.alcool === "sem") s.destilado = null;
    s.forca = FORCAS.includes(s.forca) ? s.forca : "equilibrado";
    s.espuma = s.espuma || "auto";
    s.sabores = s.sabores.slice(0, 3);
    return s;
  }

  function computeCategoryScores(state) {
    const scores = {
      vodka: 0, gin: 0, rum: 0, whiskey: 0, cachaca: 0, tequila: 0,
      espumante: 0, pisco: 0, saque: 0, soju: 0, conhaque: 0, brandy: 0, vinho: 0, steinhager: 0,
      vermouth: 0, licor: 0, bitter: 0, aperitivo: 0, brize: 0,
    };
    const tags = [...(state.sabores || []), ...(state.perfil || [])];
    if (state.forca === "refrescante") tags.push("refrescante");
    D().SPIRIT_HEURISTICS.forEach((h) => {
      const w = h.weight == null ? 1 : h.weight;
      h.tags.forEach((t) => {
        if (tags.includes(t)) {
          h.spirits.forEach((sp) => {
            scores[sp] = (scores[sp] || 0) + (t === state.sabores[0] ? 3 : 1) * w;
          });
        }
      });
    });
    (state.perfil || []).forEach((p) => {
      if (p === "herbal" || p === "floral") scores.gin += 2;
      if (p === "amadeirado" || p === "amargo") scores.whiskey += 2;
      if (p === "picante") scores.tequila += 2;
      if (p === "frutado" || p === "equilibrado") scores.vodka += 1;
      if (p === "floral") scores.saque += 1;
      if (p === "citrico") scores.pisco += 1;
      if (p === "amadeirado") {
        scores.conhaque += 1;
        scores.brandy += 1;
      }
      if (p === "frutado" || p === "floral") scores.vinho += 1;
      if (p === "herbal") scores.steinhager += 1;
    });
    if (state.forca === "refrescante") {
      scores.gin += 1;
      scores.espumante += 1;
      scores.soju += 1;
    }
    if ((state.sabores || []).some(isMelao)) {
      scores.vodka += 2;
      scores.gin += 1;
    }
    if ((state.sabores || []).some((s) => s === "amaro" || s === "ramazzotti")) {
      scores.whiskey += 2;
      scores.gin += 1;
    }
    return scores;
  }

  function suggestSpirit(state, exclude) {
    const scores = computeCategoryScores(state);
    if (exclude) scores[spiritCategory(exclude) || exclude] = -99;
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

  function isMelao(id) {
    return id === "melao" || id === "melao-cantaloupe" || id === "melao-honeydew";
  }

  function pickZeroBase(state) {
    const lead = state.sabores[0];
    const group = D().getIngredient(lead)?.group;
    if (["manjericao", "hortela", "alecrim", "pepino"].includes(lead) || group === "erva") {
      return D().ZERO_BASES.find((z) => z.id === "tisana");
    }
    if (["morango", "framboesa", "amora", "melancia"].includes(lead) || isMelao(lead) || group === "berry") {
      return D().ZERO_BASES.find((z) => z.id === "cha-hibisco");
    }
    if (["limao", "lima", "toranja", "maracuja"].includes(lead) || group === "citrico") {
      return D().ZERO_BASES.find((z) => z.id === "shrub");
    }
    if (["cafe", "chocolate", "canela", "bitter-artesanal"].includes(lead) || group === "cafe") {
      return D().ZERO_BASES.find((z) => z.id === "blend-zero");
    }
    return D().ZERO_BASES.find((z) => z.id === "cha-verde") || D().ZERO_BASES[0];
  }

  function suggestComplements(sabores) {
    if (!sabores || !sabores.length) return [];
    const lead = sabores[0];
    const aff = D().getAffinities(lead) || [];
    const out = [];
    aff.forEach((id) => {
      if (!sabores.includes(id) && D().getIngredient(id)) {
        out.push({ id, label: flavorLabel(id), source: "LIVRO" });
      }
    });
    sabores.slice(1).forEach((s) => {
      (D().getAffinities(s) || []).forEach((id) => {
        if (!sabores.includes(id) && !out.find((o) => o.id === id) && D().getIngredient(id)) {
          out.push({ id, label: flavorLabel(id), source: "LIVRO" });
        }
      });
    });
    if (!out.length) {
      ["limao", "lima", "hortela", "gengibre"].forEach((id) => {
        if (!sabores.includes(id) && D().getIngredient(id) && !out.find((o) => o.id === id)) {
          out.push({ id, label: flavorLabel(id), source: "BAR" });
        }
      });
    }
    return out.slice(0, 10);
  }

  function isPicanteId(id) {
    return /gengibre|chile|pimenta|jalapeno|wasabi|raiz-forte|timur|curry|mostarda|tajin|galanga|chili|paprica|paprika/.test(String(id || ""));
  }

  function isAngostura(id) {
    return id === "bitter-angostura" || /angostura/.test(String(id || ""));
  }

  function groupOf(id) {
    return D().getIngredient(id)?.group || null;
  }

  function isFruitGroup(group) {
    return ["berry", "tropical", "fruta", "stone", "pome"].includes(group);
  }

  function roleOf(id) {
    const spirit = D().getSpirit(id);
    const group = groupOf(id);
    if (id === "bitter-artesanal" || id === "gum-nero" || group === "bitter" || (spirit && (spirit.category === "bitter" || spirit.category === "aperitivo"))) return "amargo";
    if (group === "citrico" || group === "acido" || /vinagre|verjus|umeboshi/.test(id)) return "acido";
    if (isPicanteId(id) || id === "tajin") return "picante";
    if (group === "erva") return "erva";
    if (group === "floral") return "floral";
    if (isFruitGroup(group)) return "fruta";
    if (group === "doce" || group === "noz" || (spirit && spirit.category === "licor")) return "doce";
    if (group === "casa" && id !== "bitter-artesanal" && id !== "gum-nero" && id !== "tajin") return "doce";
    if (group === "especiaria") return "doce";
    if (group === "cafe" || group === "outros") {
      if (id === "cafe" || id === "espresso" || id === "cafe-frio") return "corpo";
      if (id === "chocolate" || id === "chocolate-branco" || id === "chocolate-amargo" || id === "cacau" || id === "cacau-nibs") return "doce";
      return "aroma";
    }
    if (group === "vegetal") {
      const mapped = D().LIQUID_MAP[id];
      if (mapped && mapped.juice) return "corpo";
    }
    return "aroma";
  }

  function isSweetRole(role) {
    return role === "doce" || role === "fruta" || role === "floral";
  }

  function flavorView(state, flavorIds) {
    const ids = flavorIds && flavorIds.length ? flavorIds.slice() : (state.sabores || []).slice();
    const lead = (state.sabores || []).find((id) => ids.includes(id)) || ids[0] || state.sabores[0];
    const chord = [];
    if (lead) chord.push(lead);
    ids.forEach((id) => {
      if (!chord.includes(id)) chord.push(id);
    });
    return { lead, chord, secondary: (state.sabores || []).slice(1) };
  }

  function selectionHasBitter(state, flavors) {
    const ids = [...(flavors.chord || []), ...(state.sabores || [])];
    if ((state.perfil || []).includes("amargo")) return true;
    return ids.some((id) => roleOf(id) === "amargo" || id === "amaro" || id === "ramazzotti");
  }

  function chooseFamily(state, base, flavors) {
    const p = state.perfil || [];
    const fresh = state.forca === "refrescante";
    const lead = flavors.lead;
    const leadIng = D().getIngredient(lead);
    const bitter = selectionHasBitter(state, flavors);
    const fruitLead = isFruitGroup(leadIng?.group);
    const cat = base.category || spiritCategory(base.id);
    const role = base.role || (base.type === "zero" ? "zero" : spiritRole(base.id));
    const ginLike = cat === "gin" || cat === "steinhager";
    const whiskeyLike = cat === "whiskey" || cat === "conhaque" || cat === "brandy";

    if (state.alcool === "sem" || base.type === "zero") {
      if (bitter && (fresh || p.includes("amargo"))) return "mocktail-long";
      if (fresh || p.includes("herbal")) return "mocktail-long";
      return "mocktail-up";
    }
    if (role === "modificador") {
      if (cat === "licor") {
        if (fresh) return "long";
        if (p.includes("amadeirado") || p.includes("amargo")) return "build";
        return "sour";
      }
      if (p.includes("amadeirado")) return "build";
      return "spritz";
    }
    if (cat === "espumante") return "spritz";
    if (cat === "vinho") {
      if (p.includes("amadeirado")) return "build";
      if (p.includes("citrico") && !fresh && !bitter) return "sour";
      return "spritz";
    }
    if (bitter && (state.sabores || []).some((id) => id === "amaro" || id === "ramazzotti" || roleOf(id) === "amargo")) {
      if (fresh || lead === "melao" || fruitLead) return "spritz";
      if (p.includes("amadeirado") || whiskeyLike) return "build";
      if (p.includes("amargo") || leadIng?.group === "bitter") return "spirit-forward";
      return "spritz";
    }
    if (p.includes("amargo") && (whiskeyLike || ginLike) && !fruitLead) {
      if (p.includes("amadeirado") || lead === "cafe" || lead === "chocolate") return "build";
      return "spirit-forward";
    }
    if (fresh && !p.includes("picante")) {
      if (lead === "gengibre" || (flavors.chord || []).includes("gengibre")) return "mule";
      if (ginLike && (p.includes("herbal") || p.includes("floral"))) return "gin-tonic";
      return "long";
    }
    if (p.includes("amargo") && fresh) return "spritz";
    if (p.includes("citrico") || p.includes("frutado") || p.includes("equilibrado") || fruitLead || cat === "pisco") {
      return "sour";
    }
    if (p.includes("amadeirado") || whiskeyLike) return "build";
    if ((cat === "saque" || cat === "soju") && !fruitLead) return "long";
    if (p.includes("herbal") && ginLike) return "sour";
    return "sour";
  }

  function balanceMode(perfil) {
    return (perfil || []).find((p) => p === "doce" || p === "citrico" || p === "equilibrado") || null;
  }

  function proportions(forca, family, perfil) {
    const f0 = forca || "equilibrado";
    const f = f0 === "refrescante" ? "equilibrado" : f0;
    let base;
    let acido;
    let doce;
    const isLong = ["long", "highball", "collins", "gin-tonic", "mule", "spritz", "mocktail-long"].includes(family);
    const isSpirit = ["spirit-forward", "build"].includes(family);

    if (isSpirit) {
      if (f === "suave") {
        base = 40; acido = 0; doce = 15;
      } else if (f === "forte") {
        base = 60; acido = 0; doce = 10;
      } else {
        base = 50; acido = 0; doce = 15;
      }
    } else if (isLong) {
      if (f === "suave") base = 40;
      else if (f === "forte") base = 60;
      else base = 50;
      if (family === "gin-tonic") base = f === "forte" ? 60 : f === "suave" ? 40 : 50;
      acido = f === "suave" ? 15 : 10;
      doce = f === "suave" ? 15 : f === "forte" ? 10 : 15;
    } else if (f === "suave") {
      base = 40; acido = 28; doce = 20;
    } else if (f === "forte") {
      base = 60; acido = 18; doce = 12;
    } else {
      base = 50; acido = 22; doce = 18;
    }

    const tags = perfil || [];
    if (tags.includes("doce")) {
      doce += 5;
      acido = Math.max(0, acido - 3);
    }
    if (tags.includes("citrico")) acido += 5;

    const mode = balanceMode(tags);
    if (mode === "equilibrado") {
      const mid = Math.max(12, Math.round((acido + doce) / 2));
      acido = mid;
      doce = mid;
    } else if (mode === "doce" && doce <= acido) {
      doce = acido + 5;
    } else if (mode === "citrico" && acido <= doce) {
      acido = doce + 5;
    }
    return { base, acido, doce };
  }

  function alcoholMl(forca, family, base, perfil) {
    const ml = proportions(forca, family, perfil).base;
    const cat = base.category;
    const f = forca === "refrescante" ? "equilibrado" : forca || "equilibrado";
    if (cat === "espumante" || cat === "vinho") {
      if (f === "suave") return 90;
      if (f === "forte") return 120;
      return 100;
    }
    if (cat === "saque" || cat === "soju") {
      if (f === "suave") return 50;
      if (f === "forte") return 70;
      return 60;
    }
    return ml;
  }

  function techniqueFor(family) {
    if (family === "spirit-forward") return { method: "MEXIDO", detail: "MEXIDO no mixing glass, coagagem simples, servir up ou rocks." };
    if (family === "build") return { method: "MONTADO", detail: "MONTADO direto no copo sobre rock grande; swirl ocasional." };
    if (["long", "highball", "collins", "gin-tonic", "mule", "spritz", "mocktail-long"].includes(family)) {
      return { method: "MONTADO", detail: "MONTADO no copo com gelo; completar com o alongador; misturar levemente." };
    }
    return { method: "BATIDO", detail: "BATIDO ≥10 s, coagagem dupla, gelar taça, passar tudo para o copo/taça." };
  }

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

  function plainBonus(spirit) {
    const plain = new Set([
      "vodka", "gin", "cachaca", "rum-branco", "whisky", "tequila-prata", "steinhager", "brize",
      "pisco", "saque", "soju", "espumante-brut", "vinho-branco", "conhaque", "brandy",
    ]);
    return plain.has(spirit.id) ? 0.6 : 0;
  }

  function scoreSku(spirit, state, catScores) {
    let sc = catScores[spirit.category] || 0;
    sc += plainBonus(spirit);
    if (spirit.role === "base") sc += 0.8;
    if (state.destilado && spirit.id === state.destilado) sc += 100;
    if ((state.perfil || []).includes("amadeirado") && D().isAgedSpiritId(spirit.id)) sc += 5;
    if (state.forca === "suave" && D().isLowAbvCategory(spirit.category)) sc += 4;
    return sc;
  }

  function suggestBases(state, limit) {
    const n = limit || 5;
    if (state.alcool === "sem") {
      const preferred = pickZeroBase(state);
      const list = D().ZERO_BASES.map((z) => ({
        id: z.id,
        label: z.label,
        type: "zero",
        category: "zero",
        role: "zero",
      }));
      list.sort((a, b) => (a.id === preferred.id ? -1 : b.id === preferred.id ? 1 : 0));
      return list.slice(0, n);
    }
    const catScores = computeCategoryScores(state);
    const ranked = D().SPIRITS.map((spirit) => ({
      id: spirit.id,
      label: spirit.label,
      type: "spirit",
      category: spirit.category,
      role: spirit.role,
      sc: scoreSku(spirit, state, catScores),
    })).sort((a, b) => b.sc - a.sc || a.label.localeCompare(b.label, "pt"));

    const bestByCat = new Map();
    ranked.forEach((spirit) => {
      const cur = bestByCat.get(spirit.category);
      if (!cur || spirit.sc > cur.sc) bestByCat.set(spirit.category, spirit);
    });
    let pool = [...bestByCat.values()].sort((a, b) => b.sc - a.sc).slice(0, n);
    function ensure(pred) {
      if (pool.some(pred)) return;
      const found = ranked.find(pred);
      if (!found) return;
      const without = pool.filter((s) => s.category !== found.category);
      without[Math.max(0, without.length - 1)] = found;
      pool = without.slice(0, n);
      if (!pool.some((s) => s.id === found.id)) pool.unshift(found);
      pool = pool.slice(0, n);
    }
    if (state.forca === "suave") ensure((s) => D().isLowAbvCategory(s.category));
    if ((state.perfil || []).includes("amadeirado")) ensure((s) => D().isAgedSpiritId(s.id));
    if (state.destilado) {
      const chosen = ranked.find((s) => s.id === state.destilado);
      if (chosen) {
        pool = [chosen].concat(pool.filter((s) => s.id !== chosen.id && s.category !== chosen.category)).slice(0, n);
      }
    }
    return pool;
  }

  function baseRecord(id, state) {
    if (state.alcool === "sem") {
      const z = D().ZERO_BASES.find((x) => x.id === id) || pickZeroBase(state);
      return { type: "zero", id: z.id, label: z.label, category: "zero", role: "zero", suggested: !state.destilado };
    }
    const sp = D().getSpirit(id);
    if (!sp) {
      const fallback = suggestBases(state, 1)[0];
      return baseRecord(fallback.id, state);
    }
    return {
      type: "spirit",
      id: sp.id,
      label: sp.label,
      category: sp.category,
      role: sp.role,
      suggested: !state.destilado,
    };
  }

  function bitterChoices(state) {
    const sab = state.sabores || [];
    if (sab.includes("bitter-artesanal")) return ["bitter-artesanal", "bitter-angostura"];
    const lead = sab[0];
    if ((state.perfil || []).includes("amadeirado") || ["cafe", "chocolate", "canela"].includes(lead) || groupOf(lead) === "cafe") {
      return ["bitter-angostura", "bitter-italiano"];
    }
    const g = groupOf(lead);
    if (isFruitGroup(g) || g === "citrico") return ["bitter-italiano", "aperitivo-laranja"];
    return ["bitter-italiano", "bitter-angostura"];
  }

  function bestBy(state, pred, fallback) {
    const lead = state.sabores[0];
    const aff = D().getAffinities(lead) || [];
    const fromAff = aff.find((id) => pred(id));
    if (fromAff) return fromAff;
    if ((state.sabores || []).some(pred)) return state.sabores.find(pred);
    return fallback;
  }

  function bestAcid(state) {
    return bestBy(state, (id) => roleOf(id) === "acido", "limao");
  }

  function bestSweet(state) {
    return bestBy(state, (id) => isSweetRole(roleOf(id)), "mel");
  }

  function bestHerb(state) {
    return bestBy(state, (id) => roleOf(id) === "erva", "hortela");
  }

  function bestFruit(state) {
    return bestBy(state, (id) => roleOf(id) === "fruta", "morango");
  }

  function bestFloral(state) {
    return bestBy(state, (id) => roleOf(id) === "floral", "flor-de-sabugueiro");
  }

  function bestSpice(state) {
    return bestBy(state, (id) => roleOf(id) === "picante", "gengibre");
  }

  function suggestFlavorPool(state, limit) {
    const n = limit || 10;
    const perfil = state.perfil || [];
    const pool = [];
    const push = (id) => {
      if (!id || pool.some((p) => p.id === id)) return;
      const group = groupOf(id);
      const spirit = D().getSpirit(id);
      if (!group && !(spirit && (spirit.category === "bitter" || spirit.category === "aperitivo" || spirit.category === "licor"))) return;
      pool.push({
        id,
        label: flavorLabel(id),
        group: group || (spirit && spirit.category === "licor" ? "doce" : "bitter"),
        role: roleOf(id),
      });
    };

    (state.sabores || []).forEach(push);
    const obligations = [];
    if (perfil.includes("amargo")) bitterChoices(state).forEach((id) => obligations.push(id));
    if (perfil.includes("herbal")) obligations.push(bestHerb(state));
    if (perfil.includes("frutado")) obligations.push(bestFruit(state));
    if (perfil.includes("floral")) obligations.push(bestFloral(state));
    if (perfil.includes("picante")) obligations.push(bestSpice(state));
    obligations.push(bestAcid(state), bestSweet(state));
    obligations.forEach(push);
    suggestComplements(state.sabores).forEach((c) => push(c.id));

    const must = new Set([...(state.sabores || []), ...obligations.filter(Boolean)]);
    const head = pool.filter((p) => must.has(p.id));
    const tail = pool.filter((p) => !must.has(p.id));
    const merged = head.concat(tail);
    if (head.length >= n) return head.slice(0, n);
    return merged.slice(0, n);
  }

  function scoreFoam(foam, state) {
    let sc = 0;
    const sabores = state.sabores || [];
    const perfil = state.perfil || [];
    (foam.tags || []).forEach((tag) => {
      if (sabores.includes(tag)) sc += tag === sabores[0] ? 6 : 4;
      if (perfil.includes(tag)) sc += 3;
      sabores.forEach((id) => {
        if (groupOf(id) && groupOf(id) === tag) sc += 2;
      });
    });
    return sc;
  }

  const FOAM_FALLBACK = {
    citrico: "limao-siciliano",
    doce: "baunilha",
    floral: "elderflower",
    picante: "gengibre",
    frutado: "morango",
    amadeirado: "canela",
    herbal: "gengibre",
    amargo: "cereja",
    equilibrado: "limao-siciliano",
  };

  function rankFoams(state) {
    const ranked = D().FOAMS.map((foam, index) => ({
      ...foam,
      sc: scoreFoam(foam, state),
      index,
    })).sort((a, b) => b.sc - a.sc || a.index - b.index);
    if (!ranked.some((f) => f.sc > 0)) {
      const id = FOAM_FALLBACK[(state.perfil || [])[0]] || "limao-siciliano";
      const fb = ranked.find((f) => f.id === id);
      if (fb) {
        fb.sc = 0.1;
        fb.fallback = true;
        ranked.sort((a, b) => b.sc - a.sc || a.index - b.index);
      }
    }
    return ranked;
  }

  function suggestFoams(state, limit) {
    const n = limit || 5;
    if (state.espuma === "nenhuma") return [];
    const ranked = rankFoams(state).map((f) => ({
      id: f.id,
      label: f.label,
      sc: f.sc,
      fallback: !!f.fallback,
    }));
    if (state.espuma && state.espuma !== "auto" && state.espuma !== "nenhuma") {
      const chosen = D().FOAMS.find((f) => f.id === state.espuma);
      const rest = ranked.filter((f) => f.id !== state.espuma);
      const head = chosen ? [{ id: chosen.id, label: chosen.label, sc: 99, fallback: false }] : [];
      return head.concat(rest).slice(0, n);
    }
    return ranked.slice(0, n);
  }

  function topFoam(state) {
    const list = suggestFoams(Object.assign({}, state, { espuma: "auto" }), 1);
    return list[0] || null;
  }

  function suggestGlasses(family) {
    const suggested = chooseGlass(family, "auto");
    const longG = D().GLASSES.find((g) => g.id === "long-350");
    const rocks = D().GLASSES.find((g) => g.id === "whiskey-forest-310");
    const scored = D().GLASSES.map((g) => {
      let sc = 0;
      if (g.families.includes(family)) sc += 5;
      if (g.id === suggested.id) sc += 2;
      return { g, sc };
    }).sort((a, b) => b.sc - a.sc);
    const pool = [];
    const push = (g) => {
      if (g && !pool.some((x) => x.id === g.id)) pool.push(g);
    };
    push(suggested);
    push(longG);
    push(rocks);
    scored.forEach((row) => {
      if (pool.length < 5) push(row.g);
    });
    return pool.slice(0, 5).map((g) => ({ id: g.id, name: g.name, ml: g.ml, why: g.why }));
  }

  function suggestLengtheners(state) {
    const scores = {};
    D().LENGTHENERS.forEach((l) => {
      scores[l.id] = 1;
    });
    const perfil = state.perfil || [];
    const sabores = state.sabores || [];
    if (sabores.some((id) => isPicanteId(id)) || perfil.includes("picante")) scores["ginger-beer"] += 4;
    if (perfil.includes("herbal") || perfil.includes("floral") || spiritCategory(state.destilado) === "gin") scores.tonica += 3;
    if (perfil.includes("amargo")) scores["espumante-brut"] += 4;
    if (sabores.some((id) => groupOf(id) === "tropical" || id === "coco")) scores["agua-coco"] += 3;
    if (state.forca === "refrescante") scores.soda += 2;
    if (perfil.includes("frutado")) scores.soda += 1;

    const juices = [];
    sabores.forEach((id) => {
      const group = groupOf(id);
      if (!group || ["citrico", "acido", "erva", "bitter"].includes(group)) return;
      const mapped = D().LIQUID_MAP[id];
      if (mapped && mapped.juice && id !== "cafe") {
        juices.push({ id: `juice:${id}`, label: mapped.juice, kind: "juice", sc: 5 });
      } else if (isFruitGroup(group)) {
        juices.push({ id: `juice:${id}`, label: `Suco de ${flavorLabel(id).toLowerCase()}`, kind: "juice", sc: 4 });
      }
    });
    juices.sort((a, b) => b.sc - a.sc);

    const ranked = D().LENGTHENERS.map((l) => Object.assign({}, l, { sc: scores[l.id] || 0 }))
      .sort((a, b) => b.sc - a.sc);
    const out = [];
    const push = (item) => {
      if (item && !out.some((x) => x.id === item.id) && out.length < 5) out.push(item);
    };
    if (juices[0]) push(juices[0]);
    ranked.forEach(push);
    return out.slice(0, 5);
  }

  function getLengthener(id, state) {
    if (!id) return null;
    const known = D().LENGTHENERS.find((l) => l.id === id);
    if (known) return known;
    if (String(id).indexOf("juice:") === 0) {
      const fid = id.slice(6);
      const mapped = D().LIQUID_MAP[fid];
      return {
        id,
        label: (mapped && mapped.juice) || `Suco de ${flavorLabel(fid).toLowerCase()}`,
        kind: "juice",
      };
    }
    const fromPool = suggestLengtheners(state).find((l) => l.id === id);
    return fromPool || null;
  }

  function applyLengthenerFamily(family, state, base, flavors, lengthener) {
    if (!lengthener) return { family, shifted: false };
    const cat = base.category;
    if (lengthener.id === "tonica" && (cat === "gin" || cat === "steinhager")) {
      return { family: "gin-tonic", shifted: family !== "gin-tonic" };
    }
    if (lengthener.id === "ginger-beer") {
      const spicy = (flavors.chord || []).some((id) => id === "gengibre" || isPicanteId(id)) || (state.perfil || []).includes("picante");
      if (spicy || state.forca === "refrescante") return { family: "mule", shifted: family !== "mule" };
    }
    if (lengthener.kind === "sparkling" && ((state.perfil || []).includes("amargo") || (flavors.chord || []).some((id) => roleOf(id) === "amargo"))) {
      return { family: "spritz", shifted: family !== "spritz" };
    }
    const short = ["sour", "daisy", "spirit-forward", "build", "mocktail-up", "spirit-up", "rocks"].includes(family);
    if (short) {
      const next = state.alcool === "sem" || base.type === "zero" ? "mocktail-long" : "long";
      return { family: next, shifted: true };
    }
    return { family, shifted: false };
  }

  function defaultFlavorIds(state, pool) {
    const perfil = state.perfil || [];
    const ids = [];
    const add = (id) => {
      if (!id || ids.includes(id)) return;
      if (!pool.some((p) => p.id === id)) return;
      ids.push(id);
    };
    (state.sabores || []).forEach(add);
    if (perfil.includes("amargo")) add(bitterChoices(state)[0]);
    if (perfil.includes("herbal")) add(bestHerb(state));
    if (perfil.includes("frutado")) add(bestFruit(state));
    if (perfil.includes("floral")) add(bestFloral(state));
    if (perfil.includes("picante")) add(bestSpice(state));

    const baseGuess = state.alcool === "sem"
      ? baseRecord(pickZeroBase(state).id, state)
      : baseRecord(state.destilado || suggestBases(state, 1)[0].id, state);
    let view = flavorView(state, ids);
    let family = chooseFamily(state, baseGuess, view);
    const props = proportions(state.forca, family, perfil);
    const has = (pred) => ids.some(pred);
    if (props.acido > 0 && !has((id) => roleOf(id) === "acido")) add(bestAcid(state));
    if (props.doce > 0 && !has((id) => isSweetRole(roleOf(id)) || roleOf(id) === "picante")) add(bestSweet(state));
    if (perfil.includes("doce") || perfil.includes("citrico") || perfil.includes("equilibrado")) {
      if (!has((id) => roleOf(id) === "acido")) add(bestAcid(state));
      if (!has((id) => isSweetRole(roleOf(id)))) add(bestSweet(state));
    }
    return ids;
  }

  function prepareBuilder(raw) {
    const state = validate(raw);
    const bases = suggestBases(state, 5);
    const flavors = suggestFlavorPool(state, 10);
    const foams = suggestFoams(state, 5);
    const lengtheners = suggestLengtheners(state);
    const flavorIds = defaultFlavorIds(state, flavors);
    const baseId = state.alcool === "sem"
      ? (bases.find((b) => b.id === pickZeroBase(state).id) || bases[0]).id
      : (state.destilado && bases.some((b) => b.id === state.destilado) ? state.destilado : bases[0].id);
    const base = baseRecord(baseId, state);
    const view = flavorView(state, flavorIds);
    let family = chooseFamily(state, base, view);
    const longish = ["long", "highball", "collins", "gin-tonic", "mule", "spritz", "mocktail-long"].includes(family) || state.forca === "refrescante";
    const lengthenerId = longish && lengtheners[0] ? lengtheners[0].id : null;
    const len = getLengthener(lengthenerId, state);
    const shifted = applyLengthenerFamily(family, state, base, view, len);
    family = shifted.family;
    const glasses = suggestGlasses(family);
    const foamId = state.espuma === "nenhuma" ? null : (foams[0] ? foams[0].id : null);
    const picks = {
      baseId,
      flavorIds,
      foamId,
      glassId: glasses[0] ? glasses[0].id : null,
      lengthenerId,
    };
    const live = assemble(state, picks);
    return {
      state,
      pools: { bases, flavors, foams, glasses, lengtheners },
      picks,
      ficha: live.ficha,
      explain: live.explain,
      warnings: live.warnings,
    };
  }

  function splitTotal(ids, total) {
    const map = {};
    if (!ids.length || total <= 0) {
      ids.forEach((id) => {
        map[id] = 0;
      });
      return map;
    }
    const base = Math.floor(total / ids.length);
    let rem = total - base * ids.length;
    ids.forEach((id) => {
      map[id] = base + (rem > 0 ? 1 : 0);
      if (rem > 0) rem -= 1;
    });
    return map;
  }

  function sumMap(map) {
    return Object.keys(map).reduce((acc, key) => acc + (map[key] || 0), 0);
  }

  function enforceBalance(acidMap, sweetMap, perfil, spiceIds) {
    const mode = balanceMode(perfil);
    const bump = (map, avoid, delta) => {
      const keys = Object.keys(map).filter((k) => map[k] > 0 || true);
      const pref = keys.find((k) => !avoid.includes(k)) || keys[0];
      if (pref) map[pref] = (map[pref] || 0) + delta;
    };
    let acid = sumMap(acidMap);
    let sweet = sumMap(sweetMap);
    if (!mode) return;
    if (mode === "equilibrado") {
      if (!Object.keys(acidMap).length || !Object.keys(sweetMap).length) return;
      const mid = Math.max(acid, sweet);
      if (acid < mid) bump(acidMap, [], mid - acid);
      if (sweet < mid) bump(sweetMap, spiceIds, mid - sweet);
      return;
    }
    if (mode === "doce" && sweet <= acid && Object.keys(sweetMap).length) {
      bump(sweetMap, spiceIds, acid - sweet + 5);
    }
    if (mode === "citrico" && acid <= sweet && Object.keys(acidMap).length) {
      bump(acidMap, [], sweet - acid + 5);
    }
  }

  function barLiquid(id, kind) {
    const ing = D().getIngredient(id);
    if (!ing) return null;
    const label = ing.label.toLowerCase();
    const g = ing.group;
    if (kind === "juice") {
      if (g === "citrico" || g === "vegetal") return `Suco de ${label}`;
      if (g === "berry" || g === "tropical" || g === "fruta") return `Purê de ${label}`;
      return null;
    }
    if (kind === "syrup") {
      if (id === "bitter-artesanal") return null;
      if (g === "casa") return ing.label;
      if (["especiaria", "doce", "floral", "cafe", "noz", "outros"].includes(g)) return `Xarope de ${label}`;
      return null;
    }
    if (kind === "garnish") {
      if (g === "citrico") return `Zest de ${label}`;
      if (["erva", "floral", "berry", "tropical", "fruta"].includes(g)) return ing.label;
      return null;
    }
    return null;
  }

  function lineName(id, role) {
    const label = flavorLabel(id);
    const mapped = D().LIQUID_MAP[id];
    if (role === "acido") return (mapped && mapped.juice) || barLiquid(id, "juice") || `Suco de ${label.toLowerCase()}`;
    if (role === "fruta") return (mapped && mapped.juice) || barLiquid(id, "juice") || `Purê de ${label.toLowerCase()}`;
    if (role === "corpo") return (mapped && mapped.juice) || barLiquid(id, "juice") || label;
    if (role === "doce" || role === "floral" || role === "picante") {
      return (mapped && mapped.syrup) || barLiquid(id, "syrup") || `Xarope de ${label.toLowerCase()}`;
    }
    if (role === "erva") return `${label} (folhas)`;
    if (role === "amargo") return label;
    return label;
  }

  function bitterDose(family, id, perfil) {
    if (isAngostura(id)) return { qtd: 2, unidade: "dash" };
    if (family === "spritz") return { qtd: 40, unidade: "ml" };
    if (family === "spirit-forward") return { qtd: 25, unidade: "ml" };
    if (family === "build") return { qtd: (perfil || []).includes("amargo") ? 15 : 10, unidade: "ml" };
    return { qtd: (perfil || []).includes("amargo") ? 15 : 10, unidade: "ml" };
  }

  function garnishFor(flavorIds, family) {
    const parts = [];
    flavorIds.forEach((id) => {
      const g = (D().LIQUID_MAP[id] && D().LIQUID_MAP[id].garnish) || barLiquid(id, "garnish");
      if (g && !parts.includes(g)) parts.push(g);
    });
    if (flavorIds.includes("hortela") && !parts.some((p) => /hortel/i.test(p))) parts.push("Copa de hortelã");
    if (family === "build") parts.push("Zest de laranja expresso");
    if (!parts.length) parts.push("Zest de limão siciliano");
    return parts.slice(0, 3).join(" · ");
  }

  function paladarTags(state, family) {
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
    };
    const tags = [];
    (state.perfil || []).forEach((p) => {
      if (map[p]) tags.push(map[p]);
    });
    if (state.forca === "forte") tags.push("FORTE");
    if (state.forca === "suave") tags.push("SUAVE");
    if (state.forca === "refrescante") tags.push("REFRESCANTE");
    if (family === "mule" && !tags.includes("REFRESCANTE")) tags.push("REFRESCANTE");
    return tags.slice(0, 4);
  }

  function nameDrink(base, lead, family) {
    const leadBit = flavorLabel(lead).toUpperCase();
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
    if (base.type !== "zero" && base.id && base.category && base.id !== base.category) {
      return `${nameBit(base.id, base.category)} ${leadBit}`;
    }
    return `${leadBit} ${famBit}`;
  }

  function assemble(rawState, picks) {
    const state = rawState.sabores ? rawState : validate(rawState);
    const safe = picks || {};
    const flavorIds = (safe.flavorIds || state.sabores || []).slice();
    let lengthener = getLengthener(safe.lengthenerId, state);
    if (state.forca === "refrescante" && !lengthener) lengthener = getLengthener("soda", state);

    const base = baseRecord(safe.baseId, state);
    const view = flavorView(state, flavorIds);
    let family = chooseFamily(state, base, view);
    const shift = applyLengthenerFamily(family, state, base, view, lengthener);
    family = shift.family;
    const props = proportions(state.forca, family, state.perfil);
    const baseMl = alcoholMl(state.forca, family, base, state.perfil);

    const byRole = {};
    flavorIds.forEach((id) => {
      const role = roleOf(id);
      if (!byRole[role]) byRole[role] = [];
      if (!byRole[role].includes(id)) byRole[role].push(id);
    });

    const spiceIds = byRole.picante || [];
    const sweetIds = []
      .concat(byRole.fruta || [], byRole.doce || [], byRole.floral || []);
    let doceLeft = props.doce;
    const spiceMap = {};
    spiceIds.forEach((id) => {
      spiceMap[id] = 5;
      doceLeft = Math.max(0, doceLeft - 5);
    });
    const sweetMap = splitTotal(sweetIds, Math.max(0, doceLeft));
    Object.keys(spiceMap).forEach((id) => {
      sweetMap[id] = spiceMap[id];
    });
    const acidMap = splitTotal(byRole.acido || [], props.acido);
    const licorCredit = base.category === "licor" ? baseMl : 0;
    if (licorCredit && balanceMode(state.perfil) === "equilibrado" && Object.keys(acidMap).length) {
      const target = licorCredit + sumMap(sweetMap);
      const acidNow = sumMap(acidMap);
      if (acidNow < target) {
        const key = Object.keys(acidMap)[0];
        acidMap[key] += target - acidNow;
      }
    } else if (licorCredit && balanceMode(state.perfil) === "citrico" && Object.keys(acidMap).length) {
      const sweetSide = licorCredit + sumMap(sweetMap);
      const acidNow = sumMap(acidMap);
      if (acidNow <= sweetSide) {
        const key = Object.keys(acidMap)[0];
        acidMap[key] += sweetSide - acidNow + 5;
      }
    } else {
      enforceBalance(acidMap, sweetMap, state.perfil, spiceIds);
    }

    const items = [];
    items.push({ nome: base.label, qtd: baseMl, unidade: "ml", role: "base" });

    (byRole.acido || []).forEach((id) => {
      if (!acidMap[id]) return;
      items.push({ nome: lineName(id, "acido"), qtd: acidMap[id], unidade: "ml", role: "acido" });
    });
    sweetIds.forEach((id) => {
      const role = roleOf(id);
      const q = sweetMap[id];
      if (!q) return;
      items.push({ nome: lineName(id, role), qtd: q, unidade: "ml", role });
    });
    (byRole.corpo || []).forEach((id) => {
      const q = id === "cafe" ? 30 : 20;
      items.push({ nome: lineName(id, "corpo"), qtd: q, unidade: "ml", role: "corpo" });
    });
    (byRole.picante || []).forEach((id) => {
      items.push({ nome: lineName(id, "picante"), qtd: sweetMap[id] || 5, unidade: "ml", role: "picante" });
    });
    (byRole.amargo || []).forEach((id) => {
      const dose = bitterDose(family, id, state.perfil);
      items.push({ nome: lineName(id, "amargo"), qtd: dose.qtd, unidade: dose.unidade, role: "amargo" });
    });
    (byRole.erva || []).forEach((id) => {
      const sprig = id === "alecrim";
      items.push({
        nome: lineName(id, "erva"),
        qtd: sprig ? 1 : 6,
        unidade: sprig ? "sprig" : "folhas",
        role: "erva",
      });
    });
    (byRole.aroma || []).forEach((id) => {
      items.push({ nome: flavorLabel(id), qtd: "toque", unidade: "", role: "aroma" });
    });

    const lead = view.lead;
    if (["cafe", "chocolate", "morango", "tomate", "melancia", "abacaxi"].includes(lead) || isMelao(lead) || (state.perfil || []).includes("frutado")) {
      items.push({ nome: "Solução salina 20%", qtd: 2, unidade: "gotas", role: "sal" });
    }

    if (lengthener) {
      const splash = (base.category === "espumante" || base.category === "vinho") && lengthener.kind !== "juice";
      items.push({
        nome: lengthener.label,
        qtd: splash ? 30 : "COMPLETAR",
        unidade: splash ? "ml" : "",
        role: "top",
      });
    }

    const foam = safe.foamId ? D().FOAMS.find((f) => f.id === safe.foamId) : null;
    if (foam) items.push({ nome: foam.label, qtd: "COBERTURA", unidade: "", role: "espuma" });

    const tech = techniqueFor(family);
    let preparo = tech.detail;
    if (foam) preparo += " Finalizar com a espuma.";

    const glass = chooseGlass(family, safe.glassId || "auto");
    const sweetSum = sumMap(sweetMap) + licorCredit;
    const acidSum = sumMap(acidMap);

    const warnings = [];
    const perfil = state.perfil || [];
    if (perfil.includes("doce") && !(sweetSum > acidSum)) {
      warnings.push("Perfil doce pede mais adoçante (xarope, purê ou licor) do que acidulante.");
    }
    if (perfil.includes("citrico") && !(acidSum > sweetSum)) {
      warnings.push("Perfil cítrico pede mais acidulante do que adoçante.");
    }
    if (balanceMode(perfil) === "equilibrado" && (acidSum === 0 || sweetSum === 0 || Math.abs(acidSum - sweetSum) > 2)) {
      warnings.push("Perfil equilibrado pede doce e ácido na mesma medida.");
    }
    if (perfil.includes("amargo") && !items.some((i) => i.role === "amargo")) {
      warnings.push("Perfil amargo pede um bitter — italiano, aperitivo, amaro ou angostura.");
    }
    if (perfil.includes("herbal") && !items.some((i) => i.role === "erva")) {
      warnings.push("Perfil herbal pede uma nota herbal.");
    }
    if (perfil.includes("frutado") && !flavorIds.some((id) => roleOf(id) === "fruta")) {
      warnings.push("Perfil frutado pede fruta.");
    }
    if (perfil.includes("floral") && !flavorIds.some((id) => roleOf(id) === "floral")) {
      warnings.push("Perfil floral pede uma nota de flor.");
    }
    if (perfil.includes("picante") && !flavorIds.some((id) => roleOf(id) === "picante")) {
      warnings.push("Perfil picante pede pimenta, gengibre ou similar.");
    }
    if (perfil.includes("amadeirado") && base.type !== "zero" && !D().isAgedSpiritId(base.id)) {
      warnings.push("Perfil amadeirado pede base envelhecida — whisky, conhaque, brandy e afins.");
    }
    const sparklingBase = base.category === "espumante" || base.category === "vinho";
    if (state.forca === "refrescante" && !items.some((i) => i.role === "top") && !sparklingBase) {
      warnings.push("Força refrescante pede refrigerante, suco, espumante ou outro alongador.");
    }

    const explain = [];
    explain.push({
      title: "Proporção",
      text: `Adoçante ${sweetSum} ml · acidulante ${acidSum} ml · base ${baseMl} ml. ${
        balanceMode(perfil) === "equilibrado"
          ? "Equilibrado fica na casa de 1:1."
          : balanceMode(perfil) === "doce"
            ? "Doce leva mais xarope, purê ou licor do que ácido."
            : balanceMode(perfil) === "citrico"
              ? "Cítrico leva mais acidulante do que adoçante."
              : "Esqueleto LI/TB da família " + family + "."
      }${perfil.filter((p) => p === "doce" || p === "citrico" || p === "equilibrado").length > 1 ? " [BAR] A primeira tag de equilíbrio manda na conta." : ""}`,
    });
    const forcaTxt = {
      suave: "Suave reduz um pouco o volume de álcool e, na sugestão, prefere base de teor mais baixo.",
      equilibrado: "Equilibrado segura a base por volta de 50 ml (vinho e espumante seguem a dose de serviço, acima disso).",
      forte: "Forte aumenta um pouco o volume de álcool.",
      refrescante: "Refrescante exige alongador: refrigerante, suco, espumante ou equivalente.",
    }[state.forca];
    explain.push({ title: "Força", text: forcaTxt });
    if (shift.shifted && lengthener) {
      explain.push({
        title: "Serviço",
        text: `O alongador (${lengthener.label}) pede copo montado. [BAR]`,
      });
    }
    if (foam) {
      const ranked = rankFoams(state);
      const meta = ranked.find((f) => f.id === foam.id);
      explain.push({
        title: "Espuma",
        text: meta && meta.fallback
          ? `${foam.label} entra como par mais próximo do perfil, sem match direto de sabor. [BAR]`
          : `${foam.label} acompanha os sabores escolhidos.`,
      });
    }
    explain.push({
      title: "Copo",
      text: `${glass.name} (${glass.ml} ml): ${glass.why} [MATRIZ]`,
    });

    const ficha = {
      nome: nameDrink(base, lead, family),
      categoria: state.alcool === "sem" || base.type === "zero" ? "3 ZERO ÁLCOOL" : "2 AUTORAL",
      ingredientes: items,
      paladar: paladarTags(state, family),
      preparo,
      metodo: tech.method,
      copo: glass.name,
      copoMl: glass.ml,
      copoWhy: glass.why,
      guarnicao: garnishFor(flavorIds, family),
      gelo: family === "build"
        ? "GELO CUBO GRANDE / ESFERA"
        : ["long", "highball", "collins", "mule", "gin-tonic", "mocktail-long", "spritz"].includes(family)
          ? "GELO CUBO NORMAL"
          : "Taça gelada · sem gelo no serviço (up)",
      canudo: ["long", "mule", "gin-tonic", "mocktail-long", "collins", "highball"].includes(family) ? "LONGO" : null,
      familia: family,
      baseId: base.id,
      sweetSum,
      acidSum,
      baseMl,
    };

    return { ficha, explain, warnings, family, base };
  }

  return {
    validate,
    suggestSpirit,
    suggestComplements,
    suggestBases,
    suggestFlavorPool,
    suggestFoams,
    suggestGlasses,
    suggestLengtheners,
    topFoam,
    chooseGlass,
    prepareBuilder,
    assemble,
    proportions,
    roleOf,
  };
})();
