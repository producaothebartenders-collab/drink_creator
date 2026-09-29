/* Criador de Drinks — dados curados (subset) · Grupo The Bartenders
   Fontes parafraseadas: Flavor Bible, Liquid Intelligence, carta TB, MATRIZ.
   Não é dump de listas copyrighted. */
window.CDData = (function () {
  const INGREDIENTS = [
    { id: "limao", label: "Limão", group: "citrico", volume: "moderate", affinities: ["hortela", "manjericao", "gengibre", "mel", "coco", "pepino", "laranja", "morango"] },
    { id: "lima", label: "Lima", group: "citrico", volume: "moderate", affinities: ["gengibre", "hortela", "coco", "manga", "chile", "cilantro", "pepino", "abacaxi", "melao"] },
    { id: "laranja", label: "Laranja", group: "citrico", volume: "moderate", affinities: ["canela", "cafe", "chocolate", "gengibre", "cranberry", "baunilha", "amaro", "ramazzotti", "melao"] },
    { id: "grapefruit", label: "Grapefruit", group: "citrico", volume: "loud", affinities: ["mel", "hortela", "gengibre", "coco", "abacaxi", "maracuja"] },
    { id: "morango", label: "Morango", group: "berry", volume: "moderate", affinities: ["limao", "lima", "hortela", "manjericao", "mel", "baunilha"] },
    { id: "framboesa", label: "Framboesa", group: "berry", volume: "moderate", affinities: ["limao", "hortela", "pessego", "mel", "laranja"] },
    { id: "amora", label: "Amora", group: "berry", volume: "moderate", affinities: ["lima", "hortela", "limao", "canela", "mel"] },
    { id: "maca", label: "Maçã", group: "pome", volume: "moderate", affinities: ["canela", "gengibre", "mel", "limao", "cravo"] },
    { id: "pera", label: "Pêra", group: "pome", volume: "quiet", affinities: ["gengibre", "canela", "mel", "limao", "baunilha"] },
    { id: "pessego", label: "Pêssego", group: "stone", volume: "moderate", affinities: ["manjericao", "hortela", "limao", "gengibre", "baunilha", "framboesa"] },
    { id: "melancia", label: "Melancia", group: "fruta", volume: "quiet", affinities: ["lima", "hortela", "manjericao", "pepino", "chile", "gengibre"] },
    { id: "melao", label: "Melão", group: "fruta", volume: "quiet", affinities: ["lima", "hortela", "manjericao", "pepino", "gengibre", "elderflower", "amaro", "ramazzotti", "laranja"] },
    { id: "abacaxi", label: "Abacaxi", group: "tropical", volume: "moderate", affinities: ["coco", "lima", "gengibre", "hortela", "chile", "baunilha", "maracuja"] },
    { id: "manga", label: "Manga", group: "tropical", volume: "moderate", affinities: ["lima", "cilantro", "chile", "coco", "gengibre", "hortela", "maracuja"] },
    { id: "maracuja", label: "Maracujá", group: "tropical", volume: "loud", affinities: ["coco", "lima", "hortela", "gengibre", "morango", "abacaxi"] },
    { id: "coco", label: "Coco", group: "tropical", volume: "moderate", affinities: ["abacaxi", "lima", "manga", "maracuja", "gengibre", "chocolate", "cafe"] },
    { id: "lichia", label: "Lichia", group: "tropical", volume: "moderate", affinities: ["lima", "hortela", "gengibre", "rosa"] },
    { id: "hortela", label: "Hortelã", group: "erva", volume: "quiet", affinities: ["lima", "limao", "morango", "pepino", "gengibre", "coco", "chocolate", "melao"] },
    { id: "manjericao", label: "Manjericão", group: "erva", volume: "moderate", affinities: ["limao", "lima", "morango", "pepino", "tomate", "abacaxi"] },
    { id: "alecrim", label: "Alecrim", group: "erva", volume: "loud", affinities: ["limao", "laranja", "mel", "maca", "grapefruit"] },
    { id: "cilantro", label: "Cilantro", group: "erva", volume: "moderate", affinities: ["lima", "chile", "manga", "abacaxi", "pepino", "coco"] },
    { id: "pepino", label: "Pepino", group: "vegetal", volume: "quiet", affinities: ["hortela", "lima", "manjericao", "chile", "gengibre", "cilantro", "melao"] },
    { id: "tomate", label: "Tomate", group: "vegetal", volume: "moderate", affinities: ["manjericao", "cilantro", "chile", "lima", "pepino"] },
    { id: "gengibre", label: "Gengibre", group: "especiaria", volume: "loud", affinities: ["lima", "limao", "mel", "hortela", "coco", "pera", "grapefruit"] },
    { id: "canela", label: "Canela", group: "especiaria", volume: "loud", affinities: ["maca", "chocolate", "cafe", "laranja", "coco", "pera"] },
    { id: "cardamomo", label: "Cardamomo", group: "especiaria", volume: "loud", affinities: ["cafe", "chocolate", "laranja", "mel", "pera", "gengibre"] },
    { id: "chile", label: "Chili / Jalapeño", group: "especiaria", volume: "loud", affinities: ["lima", "pepino", "melancia", "abacaxi", "manga", "cilantro", "chocolate"] },
    { id: "cafe", label: "Café", group: "outros", volume: "loud", affinities: ["chocolate", "canela", "laranja", "coco", "baunilha", "cardamomo"] },
    { id: "chocolate", label: "Chocolate", group: "outros", volume: "loud", affinities: ["cafe", "laranja", "hortela", "chile", "canela", "coco", "maracuja"] },
    { id: "lavanda", label: "Lavanda", group: "floral", volume: "loud", affinities: ["limao", "mel", "morango", "baunilha"] },
    { id: "elderflower", label: "Elderflower", group: "floral", volume: "moderate", affinities: ["limao", "pepino", "hortela", "pera", "framboesa", "melao"] },
    { id: "amaro", label: "Amaro", group: "bitter", volume: "loud", affinities: ["laranja", "cafe", "chocolate", "limao", "canela", "melao", "gengibre", "ramazzotti"] },
    { id: "ramazzotti", label: "Ramazzotti", group: "bitter", volume: "loud", affinities: ["laranja", "melao", "limao", "cafe", "chocolate", "canela", "gengibre", "amaro"] },
    { id: "mel", label: "Mel", group: "doce", volume: "moderate", affinities: ["limao", "gengibre", "alecrim", "lavanda", "maca"] },
    { id: "baunilha", label: "Baunilha", group: "doce", volume: "quiet", affinities: ["coco", "chocolate", "abacaxi", "pessego", "cafe"] },
  ];

  const PROFILES = [
    { id: "doce", label: "Doce" },
    { id: "amargo", label: "Amargo" },
    { id: "citrico", label: "Cítrico" },
    { id: "equilibrado", label: "Equilibrado" },
    { id: "herbal", label: "Herbal" },
    { id: "frutado", label: "Frutado" },
    { id: "amadeirado", label: "Amadeirado" },
    { id: "floral", label: "Floral" },
    { id: "picante", label: "Picante" },
    { id: "refrescante", label: "Refrescante" },
  ];

  /** Tipos da casa (matriz-bebidas-tipos): rótulo sem marca e sem volume.
      SKUs zero álcool (gin sem álcool, espumante 0%) não entram na lista com álcool. */
  const SPIRIT_TYPES = [
    { id: "cachaca-prata", label: "Cachaça prata", category: "cachaca", role: "base", house: true },
    { id: "cachaca-ouro", label: "Cachaça ouro", category: "cachaca", role: "base", house: true },
    { id: "cachaca", label: "Cachaça", category: "cachaca", role: "base", house: true },
    { id: "cachaca-jambu", label: "Cachaça de jambu", category: "cachaca", role: "base", house: true },
    { id: "vodka", label: "Vodka", category: "vodka", role: "base", house: true },
    { id: "vodka-cucumber-mint", label: "Vodka cucumber & mint", category: "vodka", role: "base", house: true },
    { id: "vodka-pear", label: "Vodka pear", category: "vodka", role: "base", house: true },
    { id: "vodka-vanilla", label: "Vodka vanilla", category: "vodka", role: "base", house: true },
    { id: "vodka-coco", label: "Vodka de coco", category: "vodka", role: "base", house: true },
    { id: "rum-branco", label: "Rum branco", category: "rum", role: "base", house: true },
    { id: "rum-ouro", label: "Rum ouro", category: "rum", role: "base", house: true },
    { id: "rum-envelhecido", label: "Rum envelhecido", category: "rum", role: "base", house: true },
    { id: "rum-especiado", label: "Rum especiado", category: "rum", role: "base", house: true },
    { id: "rum-coco", label: "Rum de coco", category: "rum", role: "base", house: true },
    { id: "steinhager", label: "Steinhäger", category: "steinhager", role: "base", house: true },
    { id: "gin", label: "Gin", category: "gin", role: "base", house: true },
    { id: "gin-frutado", label: "Gin frutado", category: "gin", role: "base", house: true },
    { id: "whisky", label: "Whisky", category: "whiskey", role: "base", house: true },
    { id: "whisky-12", label: "Whisky 12 anos", category: "whiskey", role: "base", house: true },
    { id: "whisky-18", label: "Whisky 18 anos", category: "whiskey", role: "base", house: true },
    { id: "whisky-double", label: "Whisky double", category: "whiskey", role: "base", house: true },
    { id: "bourbon", label: "Bourbon", category: "whiskey", role: "base", house: true },
    { id: "whiskey-fire", label: "Whiskey fire", category: "whiskey", role: "base", house: true },
    { id: "espumante-brut", label: "Espumante brut", category: "espumante", role: "base", house: true },
    { id: "espumante-prosecco", label: "Espumante prosecco", category: "espumante", role: "base", house: true },
    { id: "espumante-moscatel", label: "Espumante moscatel", category: "espumante", role: "base", house: true },
    { id: "espumante-rose", label: "Espumante rosé", category: "espumante", role: "base", house: true },
    { id: "vermouth-rosso", label: "Vermouth rosso", category: "vermouth", role: "modificador", house: true },
    { id: "vermouth-bianco", label: "Vermouth bianco", category: "vermouth", role: "modificador", house: true },
    { id: "vermouth-rosato", label: "Vermouth rosato", category: "vermouth", role: "modificador", house: true },
    { id: "vermouth-dry", label: "Vermouth dry", category: "vermouth", role: "modificador", house: true },
    { id: "bitter-italiano", label: "Bitter italiano", category: "bitter", role: "modificador", house: true },
    { id: "bitter-angostura", label: "Bitter angostura", category: "bitter", role: "modificador", house: true },
    { id: "bitter-cacau", label: "Bitter de cacau", category: "bitter", role: "modificador", house: true },
    { id: "bitter-artesanal", label: "Bitter artesanal", category: "bitter", role: "modificador", house: true },
    { id: "bitter-herbal", label: "Bitter herbal", category: "bitter", role: "modificador", house: true },
    { id: "bitter-alcachofra", label: "Bitter de alcachofra", category: "bitter", role: "modificador", house: true },
    { id: "fernet", label: "Fernet", category: "bitter", role: "modificador", house: true },
    { id: "bitter-digestivo", label: "Bitter digestivo", category: "bitter", role: "modificador", house: true },
    { id: "aperitivo-laranja", label: "Aperitivo laranja", category: "aperitivo", role: "modificador", house: true },
    { id: "aperitivo-vinho", label: "Aperitivo de vinho", category: "aperitivo", role: "modificador", house: true },
    { id: "saque", label: "Saquê", category: "saque", role: "base", house: true },
    { id: "soju", label: "Soju", category: "soju", role: "base", house: true },
    { id: "vinho-branco", label: "Vinho branco", category: "vinho", role: "base", house: true },
    { id: "vinho-tinto", label: "Vinho tinto", category: "vinho", role: "base", house: true },
    { id: "vinho-rose", label: "Vinho rosé", category: "vinho", role: "base", house: true },
    { id: "jerez", label: "Vinho de jerez", category: "vinho", role: "base", house: true },
    { id: "conhaque", label: "Conhaque", category: "conhaque", role: "base", house: true },
    { id: "brandy", label: "Brandy", category: "brandy", role: "base", house: true },
    { id: "tequila-prata", label: "Tequila prata", category: "tequila", role: "base", house: true },
    { id: "tequila-ouro", label: "Tequila ouro", category: "tequila", role: "base", house: true },
    { id: "brize", label: "Brizê", category: "brize", role: "base", house: true },
    { id: "pisco", label: "Pisco", category: "pisco", role: "base", house: true },
    { id: "licor-pessego", label: "Licor de pêssego", category: "licor", role: "modificador", house: true },
    { id: "licor-framboesa", label: "Licor de framboesa", category: "licor", role: "modificador", house: true },
    { id: "licor-curacao-blue", label: "Licor curaçao blue", category: "licor", role: "modificador", house: true },
    { id: "licor-curacao", label: "Licor curaçao", category: "licor", role: "modificador", house: true },
    { id: "licor-cafe", label: "Licor de café", category: "licor", role: "modificador", house: true },
    { id: "triple-sec", label: "Triple sec", category: "licor", role: "modificador", house: true },
    { id: "licor-baunilha-citrico", label: "Licor baunilha cítrico", category: "licor", role: "modificador", house: true },
    { id: "licor-cream", label: "Licor cream", category: "licor", role: "modificador", house: true },
    { id: "licor-avela", label: "Licor de avelã", category: "licor", role: "modificador", house: true },
    { id: "licor-whisky-mel", label: "Licor de whisky e mel", category: "licor", role: "modificador", house: true },
    { id: "licor-elderflower", label: "Licor de elderflower", category: "licor", role: "modificador", house: true },
    { id: "licor-canela", label: "Licor de canela", category: "licor", role: "modificador", house: true },
    { id: "limoncello", label: "Limoncello", category: "licor", role: "modificador", house: true },
    { id: "licor-chocolate", label: "Licor de chocolate", category: "licor", role: "modificador", house: true },
    { id: "amaretto", label: "Amaretto", category: "licor", role: "modificador", house: true },
  ];

  function isZeroAlcoholSku(item) {
    const blob = `${item.id} ${item.label} ${item.category || ""} ${item.role || ""}`
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    return /sem[\s-]*alcool|0\s*%|zero[\s-]*alcool|alcohol[\s-]*free/.test(blob);
  }

  const SPIRITS = SPIRIT_TYPES.filter((s) => !isZeroAlcoholSku(s));

  /** Famílias para agrupar o passo Destilado e para a heurística de base. */
  const SPIRIT_CATEGORY_ORDER = [
    "vodka", "gin", "cachaca", "rum", "whiskey", "tequila", "steinhager", "brize",
    "pisco", "conhaque", "brandy", "saque", "soju", "espumante", "vinho",
    "vermouth", "aperitivo", "bitter", "licor",
  ];

  const SPIRIT_CATEGORY_LABELS = {
    vodka: "Vodka",
    gin: "Gin",
    cachaca: "Cachaça",
    rum: "Rum",
    whiskey: "Whisky",
    tequila: "Tequila",
    steinhager: "Steinhäger",
    brize: "Brizê",
    pisco: "Pisco",
    conhaque: "Conhaque",
    brandy: "Brandy",
    saque: "Saquê",
    soju: "Soju",
    espumante: "Espumante",
    vinho: "Vinho",
    vermouth: "Vermouth",
    aperitivo: "Aperitivo",
    bitter: "Bitter",
    licor: "Licor",
  };

  /** Heurística §3.3 — protagonista/perfil → família. weight < 1 é default leve, sem regra de casa. */
  const SPIRIT_HEURISTICS = [
    { spirits: ["gin"], tags: ["herbal", "floral", "pepino", "limao", "lima", "manjericao", "elderflower", "lavanda", "alecrim", "melao"] },
    { spirits: ["rum"], tags: ["abacaxi", "coco", "manga", "baunilha", "banana", "tropical"] },
    { spirits: ["cachaca"], tags: ["limao", "maracuja", "abacaxi", "manga", "gengibre", "hortela"] },
    { spirits: ["vodka"], tags: ["morango", "framboesa", "amora", "melancia", "melao", "pepino", "cafe", "equilibrado", "frutado"] },
    { spirits: ["whiskey"], tags: ["amadeirado", "cafe", "chocolate", "maca", "pera", "canela", "amargo", "pessego", "amaro", "ramazzotti"] },
    { spirits: ["tequila"], tags: ["picante", "chile", "cilantro", "manga", "melancia", "lima", "abacaxi", "tomate"] },
    { spirits: ["espumante"], tags: ["floral", "frutado", "refrescante", "morango", "pessego", "framboesa"], weight: 0.5 },
    { spirits: ["pisco"], tags: ["citrico", "limao", "lima", "floral"], weight: 0.5 },
    { spirits: ["saque"], tags: ["pera", "pessego", "lichia", "floral", "pepino"], weight: 0.5 },
    { spirits: ["soju"], tags: ["frutado", "refrescante", "melancia", "melao", "morango"], weight: 0.5 },
    { spirits: ["conhaque", "brandy"], tags: ["amadeirado", "maca", "pera", "cafe", "chocolate", "canela"], weight: 0.5 },
    { spirits: ["vinho"], tags: ["frutado", "floral", "refrescante", "morango", "pessego"], weight: 0.5 },
    { spirits: ["steinhager"], tags: ["herbal", "limao", "alecrim"], weight: 0.5 },
  ];

  /** Copos MATRIZ (subset útil para o motor) */
  const GLASSES = [
    { id: "coupe-megan-300", name: "Taça Coupé Megan 300 ml", ml: 300, families: ["sour", "daisy", "mocktail-up"], why: "Sour up: líquido + espuma cabe com folga ~30%." },
    { id: "coupe-xtra-220", name: "Taça Coupé Xtra 220 ml", ml: 220, families: ["sour", "daisy"], why: "Coupé clássico TB para sours batidos." },
    { id: "martini-210", name: "Taça Martini 210 ml", ml: 210, families: ["sour", "spirit-up"], why: "Serviço up elegante; volume útil ~90–150 ml." },
    { id: "whiskey-forest-310", name: "Copo Whiskey Forest 310 ml", ml: 310, families: ["spirit-forward", "build", "rocks"], why: "Rocks + gelo grande; spirit-forward / Old-Fashioned like." },
    { id: "whiskey-soho-310", name: "Copo Whiskey Soho 310 ml", ml: 310, families: ["spirit-forward", "build", "rocks"], why: "Rocks TB com borda limpa." },
    { id: "whiskey-hermitage-330", name: "Copo Whiskey L'Hermitage 330 ml", ml: 330, families: ["spirit-forward", "build", "rocks"], why: "Rocks generoso para build amadeirado." },
    { id: "long-300", name: "Copo Long Drink 300 ml", ml: 300, families: ["long", "highball", "collins", "mocktail-long"], why: "Long clássico: base + gelo + soft." },
    { id: "long-350", name: "Copo Long Drink 350 ml", ml: 350, families: ["long", "highball", "collins", "mocktail-long"], why: "Long com mais folga para gelo e top-up." },
    { id: "long-forest-390", name: "Copo Long Drink Forest 390 ml", ml: 390, families: ["long", "highball"], why: "Highball alto; ideal refrescante." },
    { id: "vinho-xtra-460", name: "Taça Vinho Xtra 460 ml", ml: 460, families: ["spritz"], why: "Spritz / aperitivo leve com gelo." },
    { id: "vinho-dc-470", name: "Taça Vinho 470 ml (DC)", ml: 470, families: ["spritz"], why: "Taça ampla para spritz montado." },
    { id: "gin-600", name: "Taça Gin 600 ml", ml: 600, families: ["gin-tonic"], why: "Gin tônica: base generosa + tônica COMPLETAR." },
    { id: "mule-cobre-500", name: "Caneca de Cobre 500 ml", ml: 500, families: ["mule"], why: "Mule: ginger beer + gelo + aroma." },
  ];

  /** Ingredientes líquidos derivados (para receitas) */
  const LIQUID_MAP = {
    limao: { juice: "Suco de limão siciliano", syrup: null, garnish: "Zest de limão siciliano" },
    lima: { juice: "Suco de lima", syrup: null, garnish: "Rodela de lima" },
    laranja: { juice: "Suco de laranja", syrup: null, garnish: "Zest de laranja" },
    grapefruit: { juice: "Suco de grapefruit", syrup: "Xarope de grapefruit", garnish: "Twist de grapefruit" },
    morango: { juice: "Purê de morango", syrup: "Xarope de morango", garnish: "Morango fresco" },
    framboesa: { juice: "Purê de framboesa", syrup: "Xarope de framboesa", garnish: "Framboesa" },
    amora: { juice: "Purê de amora", syrup: "Xarope de amora", garnish: "Amora" },
    maca: { juice: "Suco de maçã", syrup: "Xarope de maçã e canela", garnish: "Fatia de maçã" },
    pera: { juice: "Suco de pêra", syrup: "Xarope de pêra", garnish: "Fatia de pêra" },
    pessego: { juice: "Purê de pêssego", syrup: "Xarope de pêssego", garnish: "Fatia de pêssego" },
    melancia: { juice: "Suco de melancia", syrup: null, garnish: "Cubo de melancia" },
    melao: { juice: "Purê / suco de melão", syrup: "Xarope de melão", garnish: "Cubo de melão" },
    amaro: { juice: null, syrup: null, garnish: "Zest de laranja" },
    ramazzotti: { juice: null, syrup: null, garnish: "Zest de laranja / twist" },
    abacaxi: { juice: "Suco de abacaxi", syrup: null, garnish: "Triângulo de abacaxi" },
    manga: { juice: "Purê de manga", syrup: null, garnish: "Cubo de manga" },
    maracuja: { juice: "Polpa de maracujá", syrup: null, garnish: "Sementes de maracujá" },
    coco: { juice: "Água de coco", syrup: "Xarope de coco", garnish: "Flocos de coco" },
    lichia: { juice: "Suco de lichia", syrup: "Xarope de lichia", garnish: "Lichia" },
    hortela: { juice: null, syrup: null, garnish: "Copa de hortelã" },
    manjericao: { juice: null, syrup: null, garnish: "Folhas de manjericão" },
    alecrim: { juice: null, syrup: "Xarope de alecrim", garnish: "Sprig de alecrim" },
    cilantro: { juice: null, syrup: null, garnish: "Folhas de cilantro" },
    pepino: { juice: "Suco de pepino", syrup: null, garnish: "Fita de pepino" },
    tomate: { juice: "Suco de tomate", syrup: null, garnish: "Cherry tomato" },
    gengibre: { juice: null, syrup: "Xarope de gengibre", garnish: "Chips de gengibre" },
    canela: { juice: null, syrup: "Xarope de canela", garnish: "Canela em rama" },
    cardamomo: { juice: null, syrup: "Xarope de cardamomo", garnish: "Vagem de cardamomo" },
    chile: { juice: null, syrup: "Xarope de chili", garnish: "Rodela de jalapeño" },
    cafe: { juice: "Espresso", syrup: "Xarope de café", garnish: "Grãos de café" },
    chocolate: { juice: null, syrup: "Xarope de chocolate", garnish: "Raspagem de chocolate" },
    lavanda: { juice: null, syrup: "Xarope de lavanda", garnish: "Flor de lavanda" },
    elderflower: { juice: null, syrup: "Cordial de elderflower", garnish: "Flor / zest" },
    mel: { juice: null, syrup: "Mel diluído (1:1)", garnish: null },
    baunilha: { juice: null, syrup: "Xarope de baunilha", garnish: null },
  };

  const SPIRIT_LABELS = {};
  SPIRITS.forEach((s) => {
    SPIRIT_LABELS[s.id] = s.label;
  });
  // Baldes usados pelo motor (auto / alternativa) quando o id da família não é um SKU.
  Object.keys(SPIRIT_CATEGORY_LABELS).forEach((cat) => {
    if (!SPIRIT_LABELS[cat]) SPIRIT_LABELS[cat] = SPIRIT_CATEGORY_LABELS[cat];
  });

  const ZERO_BASES = [
    { id: "cha-hibisco", label: "Chá de hibisco concentrado" },
    { id: "cha-verde", label: "Chá verde gelado" },
    { id: "shrub", label: "Shrub cítrico" },
    { id: "blend-zero", label: "Blend zero (TB)" },
    { id: "tisana", label: "Tisana herbal" },
  ];

  function getSpirit(id) {
    return SPIRITS.find((s) => s.id === id) || null;
  }

  function spiritCategory(id) {
    const rec = getSpirit(id);
    return rec ? rec.category : id || null;
  }

  function spiritRole(id) {
    const rec = getSpirit(id);
    return rec ? rec.role : "base";
  }

  function getIngredient(id) {
    return INGREDIENTS.find((i) => i.id === id);
  }

  function getAffinities(id) {
    const ing = getIngredient(id);
    return ing ? ing.affinities.slice() : [];
  }

  return {
    INGREDIENTS,
    PROFILES,
    SPIRITS,
    SPIRIT_HEURISTICS,
    SPIRIT_CATEGORY_ORDER,
    SPIRIT_CATEGORY_LABELS,
    GLASSES,
    LIQUID_MAP,
    SPIRIT_LABELS,
    ZERO_BASES,
    getIngredient,
    getAffinities,
    getSpirit,
    spiritCategory,
    spiritRole,
  };
})();
