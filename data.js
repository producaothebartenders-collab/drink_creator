/* Criador de Drinks — dados · Grupo The Bartenders
   Sabores: lista mestre (nomes, sem marca). Afinidades só onde já havia
   heurística de Flavor Bible; o resto fica vazio e o motor usa ponte [BAR].
   Outras fontes parafraseadas: Liquid Intelligence, carta TB, MATRIZ. */
window.CDData = (function () {
  /** Lista mestre — nomes sem marca. A ordem inicial é a da fonte; os doces novos entram no fim. */
  const FLAVOR_NAMES = [
    "Limão", "Limão siciliano", "Limão meyer", "Limão preservado", "Lima", "Folha de limão kaffir",
    "Laranja", "Laranja blood", "Laranja mandarina", "Toranja", "Yuzu", "Bergamota", "Tangerina",
    "Morango", "Framboesa", "Amora", "Mirtilo", "Cranberry", "Cereja", "Groselha", "Elderberry",
    "Maçã", "Pera", "Pêssego", "Nectarina", "Damasco", "Ameixa", "Figo", "Tâmara", "Romã", "Marmelo",
    "Caqui", "Ruibarbo", "Melancia", "Melão cantaloupe", "Melão honeydew", "Abacaxi", "Manga", "Mamão",
    "Mamão verde", "Maracujá", "Goiaba", "Lichia", "Banana", "Coco", "Água de coco", "Tamarindo", "Kiwi",
    "Carambola", "Hortelã", "Hortelã-pimenta", "Manjericão", "Manjericão tailandês", "Alecrim", "Tomilho",
    "Tomilho-limão", "Coentro", "Salsa", "Endro", "Estragão", "Sálvia", "Orégano", "Orégano mexicano",
    "Manjerona", "Cebolinha", "Shiso", "Capim-limão", "Verbena-limão", "Hissopo de anis", "Louro", "Lavanda",
    "Gengibre", "Canela", "Cardamomo", "Cravo", "Noz-moscada", "Allspice", "Anis-estrelado", "Baunilha",
    "Açafrão", "Cúrcuma", "Cominho", "Coentro semente", "Funcho semente", "Pimenta-do-reino", "Pimenta branca",
    "Pimenta sichuan", "Pimenta espelette", "Páprica defumada", "Anis", "Fenugreek", "Sumac", "Galanga",
    "Chile jalapeño", "Chile serrano", "Chile thai", "Chile habanero", "Chile chipotle", "Chile ancho",
    "Chile guajillo", "Chile poblano", "Flocos de chili", "Wasabi", "Raiz-forte", "Pepino", "Tomate", "Aipo",
    "Sal de aipo", "Beterraba", "Funcho", "Abacate", "Azeitona", "Alcaparra", "Cenoura", "Milho", "Abóbora",
    "Aspargo", "Alcachofra", "Rabanete", "Jícama", "Café", "Espresso", "Chocolate", "Cacau", "Cacau nibs",
    "Chocolate branco", "Matcha", "Chá preto", "Chá verde", "Hibisco", "Mel", "Maple", "Agave", "Melaço",
    "Açúcar mascavo", "Açúcar de coco", "Açúcar de palma", "Melado de romã", "Amêndoa", "Avelã", "Noz", "Pecã",
    "Pistache", "Castanha de caju", "Macadâmia", "Gergelim", "Tahine", "Flor de sabugueiro", "Água de rosas",
    "Jasmim", "Flor de laranjeira", "Violeta", "Rosa", "Vinagre balsâmico", "Vinagre de maçã",
    "Vinagre de champagne", "Verjus", "Umeboshi", "Shoyu", "Miso", "Fumaça", "Sal marinho", "Junípero",
    "Pandan", "Alcaçuz", "Pólen de funcho", "Uva", "Passas", "Damasco seco", "Figo seco", "Cereja seca",
    "Cranberry seco", "Pêssego branco", "Maçã verde", "Gengibre cristalizado", "Canela em pau", "Café frio",
    "Chocolate amargo", "Mel de laranjeira", "Creme de coco", "Leite de coco", "Leite de amêndoa",
    "Toranja rosa", "Lima key", "Manga verde", "Pimenta rosa", "Cardamomo verde", "Manjericão roxo",
    "Erva-cidreira", "Camomila", "Vinagre de arroz", "Néctar de coco", "Tomate seco", "Água de tomate",
    "Suco de aipo", "Suco de beterraba", "Casca de laranja", "Casca de limão", "Flor de hibisco", "Mostarda",
    "Açaí", "Cupuaçu", "Cumaru", "Pitaya", "Jabuticaba", "Timur berry", "Curaçao blue", "Amaretto",
    "Gum nero", "Falernum", "Grenadine", "Bubble gum", "Algodão doce", "Caramelo", "Curry", "Caldo de cana",
    "Tajín", "Frutas vermelhas", "Chá branco", "Bitter artesanal",
    "Brigadeiro", "Pé de moleque", "Doce de leite", "Crème brûlée", "Marshmallow tostado",
    "Macaron", "Caramelo salgado", "Beijinho", "Paçoca", "Churros", "Bolo de aniversário",
    "Tutti-frutti", "Unicórnio", "Blue raspberry", "Leite condensado",
  ];

  const SABOR_GROUPS = [
    { id: "citrico", label: "Cítricos" },
    { id: "berry", label: "Berries" },
    { id: "tropical", label: "Tropicais" },
    { id: "fruta", label: "Frutas" },
    { id: "erva", label: "Ervas" },
    { id: "especiaria", label: "Especiarias" },
    { id: "floral", label: "Florais" },
    { id: "cafe", label: "Café / chocolate" },
    { id: "doce", label: "Doces" },
    { id: "noz", label: "Nozes" },
    { id: "vegetal", label: "Vegetais" },
    { id: "casa", label: "TB / casa" },
    { id: "outros", label: "Outros" },
  ];

  function foldLabel(s) {
    return String(s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  function flavorSlug(label) {
    return foldLabel(label)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  /** Grupo simples pelo nome. A ordem das regras evita o conflito óbvio (flor vs cítrico, semente vs erva). */
  function inferFlavorGroup(label) {
    const s = foldLabel(label);
    if (/^(curacao blue|amaretto|gum nero|falernum|grenadine|bubble gum|algodao doce|tajin|bitter artesanal)$/.test(s)) return "casa";
    if (s === "rosa" || s === "agua de rosas" || /flor de|lavanda|jasmim|violeta|camomila|hibisco|polen/.test(s)) return "floral";
    if (/cafe|espresso|chocolate|cacau|matcha|^cha\b/.test(s)) return "cafe";
    if (/semente/.test(s)) return "especiaria";
    if (/hortela|manjericao|alecrim|tomilho|coentro|salsa|endro|estragao|salvia|oregano|manjerona|cebolinha|shiso|capim-limao|verbena-limao|hissopo|louro|erva-cidreira|pandan/.test(s)) return "erva";
    if (/noz-moscada|gengibre|canela|cardamomo|cravo|allspice|anis|acafrao|curcuma|cominho|pimenta|paprica|fenugreek|sumac|galanga|chile|chili|wasabi|raiz-forte|mostarda|cumaru|curry|junipero/.test(s)) return "especiaria";
    if (/^mel$|mel de|maple|agave|melaco|acucar|melado|alcacuz|caramelo|nectar de|baunilha|brigadeiro|pe de moleque|doce de leite|creme brulee|marshmallow|macaron|beijinho|pacoca|churros|bolo de aniversario|tutti-frutti|unicornio|blue raspberry|leite condensado/.test(s)) return "doce";
    if (/limao|lima|laranja|toranja|yuzu|bergamota|tangerina|kaffir/.test(s)) return "citrico";
    if (/morango|framboesa|amora|mirtilo|cranberry|cereja|groselha|elderberry|berry|frutas vermelhas/.test(s)) return "berry";
    if (/abacaxi|manga|mamao|maracuja|goiaba|lichia|banana|coco|tamarindo|kiwi|carambola|melancia|melao|pitaya|cupuacu|jabuticaba|acai|caldo de cana/.test(s)) return "tropical";
    if (/amendoa|avela|^noz$|peca|pistache|caju|macadamia|gergelim|tahine/.test(s)) return "noz";
    if (/vinagre|verjus|umeboshi|shoyu|miso|fumaca|sal marinho/.test(s)) return "outros";
    if (/maca|pera|pessego|nectarina|damasco|ameixa|figo|tamara|roma|marmelo|caqui|ruibarbo|^uva$|passas/.test(s)) return "fruta";
    if (/pepino|tomate|aipo|beterraba|^funcho$|abacate|azeitona|alcaparra|cenoura|milho|abobora|aspargo|alcachofra|rabanete|jicama/.test(s)) return "vegetal";
    return "outros";
  }

  /**
   * Afinidades já curadas (Flavor Bible parafraseado), remapeadas para os ids da lista mestre.
   * Grapefruit → toranja, cilantro → coentro, chile → chile-jalapeno,
   * elderflower → flor-de-sabugueiro, melão → melão cantaloupe.
   * Amaro e Ramazzotti saíram da lista (não estão na fonte); as arestas deles caem fora.
   */
  const CURATED = {
    limao: { volume: "moderate", affinities: ["hortela", "manjericao", "gengibre", "mel", "coco", "pepino", "laranja", "morango"] },
    lima: { volume: "moderate", affinities: ["gengibre", "hortela", "coco", "manga", "chile-jalapeno", "coentro", "pepino", "abacaxi", "melao-cantaloupe"] },
    laranja: { volume: "moderate", affinities: ["canela", "cafe", "chocolate", "gengibre", "cranberry", "baunilha", "melao-cantaloupe"] },
    toranja: { volume: "loud", affinities: ["mel", "hortela", "gengibre", "coco", "abacaxi", "maracuja"] },
    morango: { volume: "moderate", affinities: ["limao", "lima", "hortela", "manjericao", "mel", "baunilha"] },
    framboesa: { volume: "moderate", affinities: ["limao", "hortela", "pessego", "mel", "laranja"] },
    amora: { volume: "moderate", affinities: ["lima", "hortela", "limao", "canela", "mel"] },
    maca: { volume: "moderate", affinities: ["canela", "gengibre", "mel", "limao", "cravo"] },
    pera: { volume: "quiet", affinities: ["gengibre", "canela", "mel", "limao", "baunilha"] },
    pessego: { volume: "moderate", affinities: ["manjericao", "hortela", "limao", "gengibre", "baunilha", "framboesa"] },
    melancia: { volume: "quiet", affinities: ["lima", "hortela", "manjericao", "pepino", "chile-jalapeno", "gengibre"] },
    "melao-cantaloupe": { volume: "quiet", affinities: ["lima", "hortela", "manjericao", "pepino", "gengibre", "flor-de-sabugueiro", "laranja"] },
    abacaxi: { volume: "moderate", affinities: ["coco", "lima", "gengibre", "hortela", "chile-jalapeno", "baunilha", "maracuja"] },
    manga: { volume: "moderate", affinities: ["lima", "coentro", "chile-jalapeno", "coco", "gengibre", "hortela", "maracuja"] },
    maracuja: { volume: "loud", affinities: ["coco", "lima", "hortela", "gengibre", "morango", "abacaxi"] },
    coco: { volume: "moderate", affinities: ["abacaxi", "lima", "manga", "maracuja", "gengibre", "chocolate", "cafe"] },
    lichia: { volume: "moderate", affinities: ["lima", "hortela", "gengibre", "rosa"] },
    hortela: { volume: "quiet", affinities: ["lima", "limao", "morango", "pepino", "gengibre", "coco", "chocolate", "melao-cantaloupe"] },
    manjericao: { volume: "moderate", affinities: ["limao", "lima", "morango", "pepino", "tomate", "abacaxi"] },
    alecrim: { volume: "loud", affinities: ["limao", "laranja", "mel", "maca", "toranja"] },
    coentro: { volume: "moderate", affinities: ["lima", "chile-jalapeno", "manga", "abacaxi", "pepino", "coco"] },
    pepino: { volume: "quiet", affinities: ["hortela", "lima", "manjericao", "chile-jalapeno", "gengibre", "coentro", "melao-cantaloupe"] },
    tomate: { volume: "moderate", affinities: ["manjericao", "coentro", "chile-jalapeno", "lima", "pepino"] },
    gengibre: { volume: "loud", affinities: ["lima", "limao", "mel", "hortela", "coco", "pera", "toranja"] },
    canela: { volume: "loud", affinities: ["maca", "chocolate", "cafe", "laranja", "coco", "pera"] },
    cardamomo: { volume: "loud", affinities: ["cafe", "chocolate", "laranja", "mel", "pera", "gengibre"] },
    "chile-jalapeno": { volume: "loud", affinities: ["lima", "pepino", "melancia", "abacaxi", "manga", "coentro", "chocolate"] },
    cafe: { volume: "loud", affinities: ["chocolate", "canela", "laranja", "coco", "baunilha", "cardamomo"] },
    chocolate: { volume: "loud", affinities: ["cafe", "laranja", "hortela", "chile-jalapeno", "canela", "coco", "maracuja"] },
    lavanda: { volume: "loud", affinities: ["limao", "mel", "morango", "baunilha"] },
    "flor-de-sabugueiro": { volume: "moderate", affinities: ["limao", "pepino", "hortela", "pera", "framboesa", "melao-cantaloupe"] },
    mel: { volume: "moderate", affinities: ["limao", "gengibre", "alecrim", "lavanda", "maca"] },
    baunilha: { volume: "quiet", affinities: ["coco", "chocolate", "abacaxi", "pessego", "cafe"] },
    brigadeiro: { volume: "moderate", affinities: ["chocolate", "doce-de-leite", "cafe", "leite-condensado"] },
    "pe-de-moleque": { volume: "moderate", affinities: ["caramelo", "banana", "cafe", "canela"] },
    "doce-de-leite": { volume: "moderate", affinities: ["caramelo", "cafe", "baunilha", "leite-condensado"] },
    "creme-brulee": { volume: "moderate", affinities: ["baunilha", "caramelo", "cafe", "laranja"] },
    "marshmallow-tostado": { volume: "moderate", affinities: ["baunilha", "chocolate", "caramelo"] },
    macaron: { volume: "quiet", affinities: ["amendoa", "baunilha", "framboesa", "rosa"] },
    "caramelo-salgado": { volume: "moderate", affinities: ["caramelo", "cafe", "maca", "chocolate"] },
    beijinho: { volume: "moderate", affinities: ["coco", "leite-condensado", "cravo", "baunilha"] },
    pacoca: { volume: "moderate", affinities: ["chocolate", "cafe", "banana", "caramelo"] },
    churros: { volume: "moderate", affinities: ["canela", "chocolate", "doce-de-leite", "caramelo"] },
    "bolo-de-aniversario": { volume: "moderate", affinities: ["baunilha", "morango", "chocolate", "leite-condensado"] },
    "tutti-frutti": { volume: "moderate", affinities: ["morango", "abacaxi", "laranja", "banana"] },
    unicornio: { volume: "moderate", affinities: ["baunilha", "framboesa", "limao", "algodao-doce"] },
    "blue-raspberry": { volume: "loud", affinities: ["framboesa", "limao", "curacao-blue"] },
    "leite-condensado": { volume: "moderate", affinities: ["cafe", "chocolate", "coco", "baunilha"] },
    "limao-siciliano": { volume: "moderate", affinities: ["mel", "baunilha", "tomilho", "lavanda", "hortela", "pera", "manjericao", "flor-de-sabugueiro"] },
  };

  /**
   * 1–2 pares menos óbvios, ainda assim afinidade real (Flavor Bible parafraseado).
   * Não repetem o miolo óbvio (limão / hortelã / gengibre) quando há outra ponte no livro.
   */
  const EXOTIC = {
    limao: ["cardamomo", "lavanda"],
    lima: ["capim-limao", "lichia"],
    laranja: ["cardamomo", "cravo"],
    toranja: ["canela", "morango"],
    morango: ["pimenta-do-reino", "pessego"],
    framboesa: ["pimenta-do-reino", "laranja"],
    amora: ["pimenta-do-reino", "laranja"],
    maca: ["tomilho", "noz-moscada"],
    pera: ["cardamomo", "chocolate"],
    pessego: ["vinagre-balsamico", "canela"],
    melancia: ["tomate", "pimenta-do-reino"],
    "melao-cantaloupe": ["pimenta-do-reino", "coco"],
    abacaxi: ["capim-limao", "chocolate"],
    manga: ["cardamomo", "capim-limao"],
    maracuja: ["chocolate", "capim-limao"],
    coco: ["banana", "capim-limao"],
    lichia: ["jasmim", "cardamomo"],
    hortela: ["chile-jalapeno", "pessego"],
    manjericao: ["pessego", "chile-jalapeno"],
    alecrim: ["tomilho", "canela"],
    coentro: ["tomate", "abacate"],
    pepino: ["tomate", "coco"],
    tomate: ["melancia", "pimenta-do-reino"],
    gengibre: ["cenoura", "canela"],
    canela: ["chile-jalapeno", "cravo"],
    cardamomo: ["agua-de-rosas", "coco"],
    "chile-jalapeno": ["tomate", "laranja"],
    cafe: ["limao", "amendoa"],
    chocolate: ["banana", "pera"],
    lavanda: ["framboesa", "mirtilo"],
    "flor-de-sabugueiro": ["lichia", "flor-de-laranjeira"],
    mel: ["tomilho", "cardamomo"],
    baunilha: ["cardamomo", "canela"],
    brigadeiro: ["maracuja", "chile-jalapeno"],
    "pe-de-moleque": ["maca", "laranja"],
    "doce-de-leite": ["maca", "sal-marinho"],
    "creme-brulee": ["framboesa", "laranja"],
    "marshmallow-tostado": ["cafe", "canela"],
    macaron: ["lavanda", "flor-de-laranjeira"],
    "caramelo-salgado": ["pera", "laranja"],
    beijinho: ["maracuja", "cardamomo"],
    pacoca: ["laranja", "canela"],
    churros: ["cafe", "laranja"],
    "bolo-de-aniversario": ["framboesa", "lavanda"],
    "tutti-frutti": ["manjericao", "cardamomo"],
    unicornio: ["lichia", "lavanda"],
    "blue-raspberry": ["pimenta-do-reino", "manjericao"],
    "leite-condensado": ["limao", "canela"],
  };

  /** Ponte de grupo só quando o protagonista não tem par exótico nomeado. [BAR] */
  const EXOTIC_BY_GROUP = {
    citrico: ["cardamomo", "lavanda"],
    berry: ["pimenta-do-reino", "vinagre-balsamico"],
    tropical: ["capim-limao", "cardamomo"],
    fruta: ["tomilho", "pimenta-do-reino"],
    erva: ["toranja", "tomate"],
    floral: ["pera", "lichia"],
    cafe: ["limao", "coco"],
    doce: ["laranja", "pimenta-do-reino"],
    noz: ["laranja", "cafe"],
    especiaria: ["pera", "laranja"],
    vegetal: ["gengibre", "coentro"],
    casa: ["baunilha", "laranja"],
    outros: ["limao", "mel"],
  };

  /** Busca: não duplica sabor; só aponta para o que já existe. */
  const FLAVOR_ALIASES = {
    "bubble-gum": ["chiclete", "chicletes"],
    maracuja: ["maracuja azul"],
    "curacao-blue": ["maracuja azul", "blue curacao"],
    "bolo-de-aniversario": ["birthday cake", "birthday"],
    "marshmallow-tostado": ["marshmallow"],
    "leite-condensado": ["ninho", "leite em po"],
    "creme-brulee": ["creme brulee", "creme brulée"],
    limao: ["limão tahiti", "tahiti", "lima tahiti"],
    "limao-siciliano": ["siciliano", "lemon", "limão siciliano"],
    "flor-de-sabugueiro": ["elderflower", "elder flower", "sabugueiro"],
  };

  const INGREDIENTS = FLAVOR_NAMES.map((label) => {
    const id = flavorSlug(label);
    const curated = CURATED[id] || {};
    return {
      id,
      label,
      group: inferFlavorGroup(label),
      volume: curated.volume || "moderate",
      affinities: (curated.affinities || []).slice(),
      exotic: (EXOTIC[id] || []).slice(),
      aliases: (FLAVOR_ALIASES[id] || []).slice(),
    };
  });

  const limaoRow = INGREDIENTS.find((i) => i.id === "limao");
  if (limaoRow) limaoRow.label = "Limão tahiti";

  /**
   * Pares a mais, ainda culinários (Flavor Bible / coquetelaria clássica), para o
   * pool da ficha chegar perto de 20 sem cair na ponte genérica [BAR].
   * Uma linha "id: a, b, c" liga o protagonista a cada parceiro. A leitura é simétrica.
   */
  const PAIR_EXTRA_TEXT = `
limao: limao-siciliano, framboesa, cha-preto, tomilho, ruibarbo, hibisco
limao-siciliano: mel, baunilha, tomilho, lavanda, hortela, pera, manjericao, flor-de-sabugueiro, gengibre, pessego, framboesa, camomila, alecrim, cha-preto, morango, cardamomo, lima, mel-de-laranjeira
limao-meyer: mel, gengibre, hortela, baunilha, tomilho, lavanda, framboesa, pessego, flor-de-sabugueiro, manjericao, limao
limao-preservado: mel, gengibre, cardamomo, canela, pimenta-do-reino, coentro, chile-jalapeno, hortela, iogurte
folha-de-limao-kaffir: gengibre, capim-limao, coco, chile-thai, coentro, lima, manga, hortela, pandan, galanga
laranja: morango, cardamomo, cravo, hortela, alecrim, flor-de-sabugueiro, baunilha, chocolate, cafe
laranja-blood: chocolate, cafe, canela, roma, hortela, gengibre, cardamomo, baunilha, morango, cravo
laranja-mandarina: chocolate, canela, gengibre, hortela, cravo, baunilha, cranberry, cardamomo, mel, cafe
yuzu: gengibre, mel, hortela, pepino, shiso, pimenta-sichuan, flor-de-sabugueiro, pera, wasabi, shoyu, limao, manga
bergamota: mel, lavanda, baunilha, cha-preto, tomilho, flor-de-laranjeira, limao, cardamomo, pera, gengibre
tangerina: canela, cravo, chocolate, gengibre, hortela, cranberry, baunilha, cardamomo, mel, laranja
toranja: morango, alecrim, flor-de-sabugueiro, manjericao, canela, limao, hortela, mel
toranja-rosa: mel, hortela, gengibre, morango, alecrim, flor-de-sabugueiro, pepino, manjericao, limao, baunilha
lima: limao, flor-de-sabugueiro, manjericao, mel, morango, cardamomo
lima-key: hortela, gengibre, coco, abacaxi, manga, coentro, chile-jalapeno, mel, limao, hortela
casca-de-laranja: chocolate, cafe, canela, cardamomo, baunilha, cravo, laranja, anis-estrelado
casca-de-limao: gengibre, hortela, mel, baunilha, tomilho, lavanda, limao, cardamomo
morango: framboesa, laranja, chocolate, amendoa, coco, gengibre, vinagre-balsamico, rosa, flor-de-sabugueiro, ruibarbo, hibisco, abacaxi, leite-condensado, canela, cafe, amora, mirtilo
framboesa: morango, chocolate, limao, rosa, flor-de-sabugueiro, baunilha, pessego, vinagre-balsamico, amendoa, lavanda, hibisco, laranja
amora: morango, limao, baunilha, pessego, canela, mel, laranja, hortela, violeta, maca
mirtilo: limao, lavanda, hortela, baunilha, limao-siciliano, mel, pessego, gengibre, violeta, limao, iogurte, limao
cranberry: laranja, hortela, gengibre, canela, maca, mel, noz, limao, tangerina, alecrim
cereja: chocolate, baunilha, amendoa, amaretto, limao, cafe, canela, hortela, pessego, laranja, baunilha, kirsch
groselha: limao, hortela, gengibre, mel, framboesa, rosa, laranja, morango
elderberry: limao, maca, canela, gengibre, flor-de-sabugueiro, mel, cravo, amora, laranja
cereja-seca: chocolate, amendoa, canela, cafe, baunilha, laranja, amaretto, noz
cranberry-seco: laranja, canela, noz, gengibre, maca, mel, cravo
timur-berry: limao, gengibre, pimenta-sichuan, manga, coentro, hortela, maracuja, capim-limao
frutas-vermelhas: limao, hortela, baunilha, laranja, rosa, mel, manjericao, morango, framboesa, pimenta-do-reino
maca: tomilho, noz-moscada, caramelo, limao, canela, gengibre, baunilha, calvados, pera, flor-de-sabugueiro
maca-verde: limao, gengibre, hortela, pepino, manjericao, mel, canela, tomilho
pera: cardamomo, chocolate, gengibre, canela, baunilha, limao, flor-de-sabugueiro, tomilho, mel, anis-estrelado, queijo
pessego: vinagre-balsamico, canela, limao, manjericao, hortela, baunilha, framboesa, gengibre, tomilho, flor-de-sabugueiro, amaretto
pessego-branco: baunilha, limao, flor-de-sabugueiro, hortela, mel, gengibre, rosa, manjericao
nectarina: limao, manjericao, baunilha, hortela, gengibre, mel, framboesa, tomilho, amaretto
damasco: baunilha, amendoa, mel, limao, cardamomo, gengibre, laranja, amaretto, alecrim, canela
damasco-seco: amendoa, canela, laranja, mel, baunilha, cardamomo, cha-preto, gengibre
ameixa: canela, amendoa, baunilha, limao, anis-estrelado, mel, amaretto, laranja, cravo
figo: mel, baunilha, laranja, amendoa, tomilho, balsamico, queijo, canela, anis, mel
figo-seco: amendoa, canela, laranja, mel, baunilha, anis, noz, cha-preto
tamara: laranja, cafe, chocolate, canela, amendoa, baunilha, cardamomo, noz, mel
roma: laranja, hortela, gengibre, limao, rosa, cardamomo, canela, morango, pepino
marmelo: canela, limao, maca, cravo, mel, gengibre, baunilha, pera
caqui: limao, gengibre, canela, baunilha, hortela, mel, noz, laranja
ruibarbo: morango, limao, gengibre, laranja, morango, baunilha, hortela, morango
uva: limao, hortela, flor-de-sabugueiro, gengibre, alecrim, manjericao, tomilho, laranja
passas: canela, laranja, noz, baunilha, rum, cafe, cravo, limao
abacaxi: hortela, coco, gengibre, limao, lima, baunilha, pimenta, maracuja, hortela
manga: lima, cardamomo, gengibre, coco, hortela, limao, maracuja, coentro, chile-jalapeno, iogurte
manga-verde: lima, coentro, chile-jalapeno, hortela, gengibre, sal, pepino, coentro
mamao: lima, gengibre, hortela, limao, maracuja, coco, laranja, mel
mamao-verde: lima, coentro, chile-jalapeno, gengibre, hortela, shoyu, limao
goiaba: lima, gengibre, hortela, morango, limao, baunilha, coco, canela
lichia: rosa, jasmim, lima, gengibre, flor-de-sabugueiro, hortela, limao, pepino, cardamomo
banana: chocolate, cafe, canela, coco, baunilha, rum, noz, caramelo, limao
agua-de-coco: abacaxi, lima, hortela, gengibre, limao, maracuja, coco
tamarindo: lima, gengibre, chile-jalapeno, laranja, mel, canela, limao, pimenta
kiwi: lima, hortela, morango, gengibre, limao, maracuja, pepino, mel
carambola: lima, gengibre, hortela, limao, chile-jalapeno, coentro, pepino
melancia: lima, hortela, manjericao, pepino, limao, gengibre, morango, rosa, flor-de-sabugueiro
melao-honeydew: lima, hortela, gengibre, pepino, limao, flor-de-sabugueiro, manjericao, melao-cantaloupe
acai: banana, morango, limao, guarana, cacau, mel, hortela, coco
cupuacu: maracuja, limao, banana, chocolate, baunilha, coco, laranja, gengibre
pitaya: limao, hortela, coco, gengibre, morango, lima, maracuja, baunilha
jabuticaba: limao, canela, cravo, laranja, gengibre, baunilha, hortela, cachaça
caldo-de-cana: limao, gengibre, hortela, abacaxi, canela, lima, maracuja
creme-de-coco: abacaxi, limao, baunilha, manga, maracuja, hortela, gengibre
leite-de-coco: abacaxi, limao, manga, baunilha, cardamomo, cafe, hortela
hortela: limao, lima, morango, pepino, chocolate, gengibre, abacaxi, maracuja, limao-siciliano
hortela-pimenta: limao, chocolate, gengibre, morango, lima, laranja, pepino, cacau
manjericao: morango, limao, pessego, tomate, abacaxi, lima, morango, laranja
manjericao-tailandes: lima, coco, gengibre, chile-thai, manga, coentro, capim-limao, hortela
manjericao-roxo: morango, limao, framboesa, laranja, tomate, vinagre-balsamico, mel
alecrim: limao, laranja, toranja, mel, maca, tomilho, gengibre, pessego, pera
tomilho: limao, limao-siciliano, mel, maca, pera, pessego, lavanda, gengibre, laranja, alecrim
tomilho-limao: limao, mel, frango, pessego, gengibre, hortela, pera, lavanda
coentro: lima, manga, chile-jalapeno, limao, pepino, abacaxi, gengibre, coco, tomate
salsa: limao, lima, tomate, pepino, coentro, chile-jalapeno, laranja, abacaxi, hortela, gengibre
endro: limao, pepino, limao-siciliano, funcho, gengibre, hortela, iogurte, batata, vodka
estragao: limao, limao-siciliano, mostarda, funcho, pera, pessego, laranja, mel, baunilha
salvia: limao, laranja, pera, maca, mel, manteiga, alecrim, pessego, baunilha
oregano: limao, tomate, laranja, chile-jalapeno, alho, mel, limao-siciliano
oregano-mexicano: lima, tomate, chile-jalapeno, limao, coentro, abacaxi, laranja
manjerona: limao, tomate, laranja, pessego, mel, baunilha, hortela
cebolinha: limao, gengibre, pepino, coentro, lima, shoyu, pepino
shiso: pepino, limao, yuzu, gengibre, morango, pepino, gengibre, lima, umeboshi
capim-limao: gengibre, lima, coco, chile-thai, coentro, hortela, limao, manga, pandan
verbena-limao: limao, pessego, morango, mel, hortela, gengibre, framboesa, baunilha
hissopo-de-anis: limao, mel, laranja, anis, funcho, pera, hortela
louro: limao, laranja, baunilha, canela, tomilho, creme, pera
erva-cidreira: limao, mel, hortela, gengibre, camomila, pessego, baunilha, limao-siciliano
pandan: coco, baunilha, limao, manga, arroz, gengibre, leite-de-coco, abacaxi
gengibre: limao, lima, mel, hortela, limao-siciliano, canela, pera, abacaxi, maracuja, laranja
gengibre-cristalizado: limao, chocolate, laranja, canela, pera, mel, cafe, baunilha
canela: maca, chocolate, laranja, pera, cafe, limao, cravo, baunilha, amendoa, melao
canela-em-pau: maca, laranja, chocolate, cravo, mel, limao, baunilha, cafe
cardamomo: cafe, chocolate, laranja, pera, limao, rosa, coco, baunilha, manga
cardamomo-verde: cafe, laranja, pera, limao, rosa, manga, baunilha, chocolate
cravo: laranja, canela, maca, mel, cafe, chocolate, limao, abacaxi, cravo
noz-moscada: leite, maca, pera, baunilha, chocolate, canela, limao, creme, ovo
allspice: laranja, limao, canela, cravo, gengibre, cafe, abacaxi, rum
anis-estrelado: laranja, pera, limao, canela, cafe, figo, chocolate, funcho
anis: laranja, limao, funcho, canela, figo, pera, cafe, erva-doce
acafrao: laranja, limao, rosa, mel, cardamomo, baunilha, pessego, leite
curcuma: laranja, gengibre, limao, coco, pimenta-do-reino, mel, leite, manga
cominho: limao, laranja, coentro, chile-jalapeno, tomate, lima, hortela, iogurte
coentro-semente: limao, laranja, coentro, cominho, gengibre, chile, lima
funcho-semente: laranja, limao, pera, anis, hortela, funcho, mel, laranja
pimenta-do-reino: morango, limao, chocolate, morango, abacaxi, pessego, melancia, tomate
pimenta-branca: limao, pera, frango, creme, gengibre, limao-siciliano, funcho
pimenta-sichuan: limao, gengibre, yuzu, laranja, mel, pessego, chocolate, manga
pimenta-espelette: chocolate, morango, limao, laranja, tomate, pessego, mel
paprica-defumada: limao, laranja, chocolate, tomate, mel, fumaca, canela
pimenta-rosa: morango, limao, chocolate, laranja, baunilha, pessego, framboesa, mel
junipero: limao, laranja, hortela, pepino, alecrim, cardamomo, toranja, limao-siciliano
galanga: lima, capim-limao, coco, chile-thai, gengibre, coentro, limao
chile-jalapeno: lima, limao, abacaxi, manga, chocolate, morango, pepino, coentro, abacaxi
chile-serrano: lima, limao, manga, abacaxi, coentro, pepino, melancia, gengibre
chile-thai: lima, capim-limao, coco, coentro, gengibre, manga, limao, hortela
chile-habanero: manga, abacaxi, lima, laranja, maracuja, mel, cenoura, limao
chile-chipotle: limao, laranja, chocolate, cafe, abacaxi, mel, fumaca, tomate
chile-ancho: chocolate, cafe, laranja, canela, limao, cereja, baunilha
chile-guajillo: laranja, limao, chocolate, tomate, canela, abacaxi, mel
chile-poblano: milho, limao, queijo, coentro, creme, tomate, laranja
flocos-de-chili: limao, laranja, chocolate, mel, manga, abacaxi, tomate
wasabi: limao, pepino, gengibre, yuzu, shoyu, pepino, abacate
raiz-forte: limao, tomate, maca, beterraba, mostarda, laranja, pepino
mostarda: mel, limao, laranja, funcho, pessego, estragao, vinagre, mel
cumaru: baunilha, cafe, chocolate, laranja, coco, amendoa, rum, limao
curry: lima, coco, gengibre, manga, limao, coentro, abacaxi, leite-de-coco
lavanda: limao, limao-siciliano, mel, morango, baunilha, framboesa, mirtilo, limao, pessego, cha-preto
hibisco: limao, gengibre, laranja, morango, canela, rosa, hortela, maracuja, baunilha
flor-de-hibisco: limao, gengibre, laranja, morango, rosa, canela, hortela
flor-de-sabugueiro: limao, limao-siciliano, pepino, hortela, pera, framboesa, lichia, morango, maca, toranja, gengibre, lima, uva, jasmim, rosa, pessego, kiwi, melancia, manjericao, mel
agua-de-rosas: cardamomo, limao, morango, framboesa, baunilha, pistache, mel, lichia, jasmim
jasmim: limao, cha-verde, lichia, pera, pessego, mel, flor-de-sabugueiro, baunilha, manga
flor-de-laranjeira: laranja, limao, mel, baunilha, amendoa, figo, cardamomo, cha-preto, pessego
violeta: framboesa, limao, baunilha, chocolate, mirtilo, rosa, mel, amora
rosa: limao, framboesa, morango, cardamomo, lichia, mel, baunilha, pistache, agua-de-rosas
camomila: limao, limao-siciliano, mel, maca, lavanda, baunilha, pessego, pera, hortela
polen-de-funcho: laranja, limao, mel, pera, anis, funcho, hortela
cafe: limao, laranja, chocolate, baunilha, canela, cardamomo, amendoa, coco, laranja, pera
espresso: chocolate, laranja, limao, baunilha, canela, cardamomo, amendoa, leite
cafe-frio: leite, baunilha, chocolate, laranja, canela, cardamomo, limao, coco
cacau: baunilha, laranja, canela, cafe, chile, baunilha, amendoa, leite
cacau-nibs: laranja, cafe, baunilha, canela, chile, chocolate, mel
chocolate: laranja, cafe, hortela, baunilha, morango, framboesa, limao, canela, pimenta-rosa, pera, banana, cereja
chocolate-branco: morango, limao, baunilha, framboesa, laranja, hortela, coco, lavanda
chocolate-amargo: laranja, cafe, cereja, pimenta, limao, canela, baunilha, framboesa
matcha: limao, baunilha, leite, gengibre, morango, chocolate-branco, hortela, yuzu
cha-preto: limao, limao-siciliano, bergamota, laranja, baunilha, canela, leite, cardamomo, pessego
cha-verde: limao, gengibre, hortela, jasmim, pessego, limao-siciliano, mel, pepino
cha-branco: pessego, mel, jasmim, limao, flor-de-sabugueiro, pera, baunilha, lichia
mel: limao, limao-siciliano, gengibre, lavanda, tomilho, laranja, maca, pera, pessego, alecrim, baunilha, cardamomo
mel-de-laranjeira: limao, laranja, gengibre, baunilha, tomilho, lavanda, pessego, flor-de-laranjeira
maple: limao, laranja, canela, maca, baunilha, gengibre, cafe, noz, bourbon
agave: limao, lima, laranja, gengibre, abacaxi, manga, chile, hortela
melaco: limao, gengibre, laranja, canela, cafe, gengibre, rum, maca
acucar-mascavo: limao, canela, gengibre, laranja, cafe, baunilha, maca, cravo
acucar-de-coco: limao, coco, baunilha, gengibre, laranja, canela, cafe
acucar-de-palma: limao, coco, gengibre, laranja, baunilha, canela, cafe
melado-de-roma: limao, laranja, rosa, hortela, gengibre, canela, morango
alcacuz: limao, laranja, anis, funcho, hortela, gengibre, canela
nectar-de-coco: limao, abacaxi, baunilha, gengibre, hortela, maracuja, coco
caramelo: limao, maca, cafe, baunilha, laranja, sal, chocolate, pera, canela
macaron: limao, limao-siciliano, chocolate, morango, pistache, mel, cafe, violeta, pessego, cereja, leite-condensado, framboesa, rosa, lavanda, baunilha, amendoa
amaretto: amendoa, cereja, laranja, cafe, chocolate, baunilha, pessego, damasco, figo, canela, pera, ameixa, mel, limao, limao-siciliano, macaron, pessego
brigadeiro: chocolate, cafe, morango, limao, leite-condensado, baunilha, avela, canela
amendoa: limao, cereja, baunilha, cafe, chocolate, pessego, damasco, laranja, mel, canela, amaretto
avelã: chocolate, cafe, limao, baunilha, laranja, mel, cacau, avela
avelã: chocolate, cafe, baunilha, laranja, mel, limao
noz: cafe, chocolate, mel, laranja, canela, maca, pera, baunilha, figo
peca: maple, baunilha, cafe, chocolate, laranja, canela, bourbon, maca
pistache: rosa, limao, baunilha, chocolate, framboesa, cardamomo, mel, laranja, leite
castanha-de-caju: baunilha, coco, limao, caramelo, cafe, chocolate, canela
macadamia: baunilha, coco, cafe, chocolate, limao, caramelo, abacaxi
gergelim: limao, mel, gengibre, baunilha, laranja, shoyu, mel, limao
tahine: limao, mel, baunilha, cafe, chocolate, laranja, gengibre, canela
leite-de-amendoa: baunilha, cafe, limao, canela, chocolate, cereja, mel, laranja
pepino: limao, lima, hortela, gengibre, flor-de-sabugueiro, manjericao, endro, yuzu, morango
tomate: limao, manjericao, coentro, hortela, laranja, pepino, pimenta-do-reino, morango, salsinha
aipo: limao, gengibre, maca, pepino, tomate, endro, limao-siciliano
sal-de-aipo: limao, tomate, gengibre, pepino, vodka, pimenta
beterraba: limao, laranja, gengibre, hortela, chocolate, framboesa, queijo, anis
funcho: limao, laranja, pera, hortela, anis, maçã, pepino, estragao, limao-siciliano
abacate: limao, lima, coentro, tomate, chile, pepino, laranja, hortela
azeitona: limao, laranja, tomilho, alecrim, funcho, vermute, gin
alcaparra: limao, laranja, tomate, azeitona, salsa, endro
cenoura: laranja, gengibre, limao, canela, mel, cominho, laranja, hortela
milho: limao, manteiga, chile, lima, coentro, baunilha, mel
abobora: canela, noz-moscada, laranja, limao, gengibre, baunilha, maple, cravo
aspargo: limao, laranja, hortela, estragao, limao-siciliano, manteiga
alcachofra: limao, laranja, hortela, azeite, alho, menta
rabanete: limao, manteiga, sal, endro, pepino, hortela
jicama: limao, lima, chile, coentro, laranja, pepino, hortela, manga
tomate-seco: limao, manjericao, laranja, alecrim, queijo, pimenta
agua-de-tomate: limao, aipo, pepino, coentro, pimenta, tabasco, horseradish
suco-de-aipo: limao, gengibre, maca, pepino, hortela
suco-de-beterraba: limao, laranja, gengibre, maca, hortela, framboesa
vinagre-balsamico: morango, pessego, limao, figo, tomate, framboesa, laranja, mel
vinagre-de-maca: limao, mel, gengibre, maca, hortela, canela
vinagre-de-champagne: morango, pessego, limao, framboesa, pepino, flor-de-sabugueiro
vinagre-de-arroz: limao, gengibre, pepino, shoyu, pepino, manga
verjus: limao, pera, maca, uva, hortela, pessego
umeboshi: shiso, limao, gengibre, pepino, shoyu, yuzu
shoyu: limao, gengibre, laranja, gergelim, mel, wasabi, yuzu
miso: limao, gengibre, laranja, sesamo, mel, baunilha, pera
fumaca: limao, laranja, chocolate, maple, canela, whisky, pimenta
sal-marinho: limao, chocolate, caramelo, melancia, tomate, pepino, toranja
curacao-blue: laranja, limao, abacaxi, coco, maracuja, baunilha, hortela
gum-nero: laranja, limao, cafe, chocolate, laranja, genziana
falernum: limao, lima, gengibre, amendoa, cravo, canela, lima, hortela
grenadine: limao, laranja, romã, hortela, gengibre, morango, tequila
bubble-gum: morango, limao, baunilha, framboesa, tutti-frutti, laranja
algodao-doce: morango, baunilha, limao, framboesa, tutti-frutti, leite
tajin: lima, limao, manga, abacaxi, melancia, pepino, manga, laranja
bitter-artesanal: laranja, limao, cafe, chocolate, canela, genciana, toranja
fenugreek: maple, cafe, limao, cominho, curry, mel, laranja, gengibre, cardamomo, baunilha
sumac: limao, tomate, hortela, pepino, laranja, gengibre, roma, coentro, manga
avela: chocolate, cafe, baunilha, laranja, mel, limao, cacau, canela, avela
`;

  const PAIR_EXTRA = {};
  PAIR_EXTRA_TEXT.split("\n").forEach((line) => {
    const raw = line.trim();
    if (!raw || raw.indexOf(":") < 0) return;
    const id = raw.slice(0, raw.indexOf(":")).trim();
    const parts = raw.slice(raw.indexOf(":") + 1).split(",").map((s) => s.trim()).filter(Boolean);
    if (!PAIR_EXTRA[id]) PAIR_EXTRA[id] = [];
    parts.forEach((pid) => {
      if (!PAIR_EXTRA[id].includes(pid)) PAIR_EXTRA[id].push(pid);
    });
  });

  function ingredientIdSet() {
    return new Set(INGREDIENTS.map((i) => i.id));
  }

  function getRealPairings(id) {
    const known = ingredientIdSet();
    if (!id || !known.has(id)) return [];
    const out = [];
    const push = (pid) => {
      if (!pid || pid === id || !known.has(pid) || out.includes(pid)) return;
      out.push(pid);
    };
    const ing = INGREDIENTS.find((i) => i.id === id);
    (ing && ing.affinities ? ing.affinities : []).forEach(push);
    (ing && ing.exotic ? ing.exotic : []).forEach(push);
    (PAIR_EXTRA[id] || []).forEach(push);
    INGREDIENTS.forEach((other) => {
      if (other.id === id) return;
      const back = (other.affinities || []).includes(id) || (other.exotic || []).includes(id) || (PAIR_EXTRA[other.id] || []).includes(id);
      if (back) push(other.id);
    });
    return out;
  }

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
  ];

  /** Força — Refrescante saiu do perfil e entrou aqui. */
  const FORCAS = [
    { id: "suave", label: "Suave", hint: "Um pouco menos de álcool. Quando o app sugere a base, prefere teor mais baixo." },
    { id: "equilibrado", label: "Equilibrado", hint: "Base alcoólica em torno de 50 ml." },
    { id: "forte", label: "Forte", hint: "Um pouco mais de álcool." },
    { id: "refrescante", label: "Refrescante", hint: "Entra refrigerante, suco, espumante ou outro alongador." },
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
    { spirits: ["gin"], tags: ["herbal", "floral", "pepino", "limao", "lima", "manjericao", "elderflower", "flor-de-sabugueiro", "lavanda", "alecrim", "melao", "melao-cantaloupe", "melao-honeydew"] },
    { spirits: ["rum"], tags: ["abacaxi", "coco", "manga", "baunilha", "banana", "tropical"] },
    { spirits: ["cachaca"], tags: ["limao", "maracuja", "abacaxi", "manga", "gengibre", "hortela"] },
    { spirits: ["vodka"], tags: ["morango", "framboesa", "amora", "melancia", "melao", "melao-cantaloupe", "melao-honeydew", "pepino", "cafe", "equilibrado", "frutado"] },
    { spirits: ["whiskey"], tags: ["amadeirado", "cafe", "chocolate", "maca", "pera", "canela", "amargo", "pessego", "amaro", "ramazzotti"] },
    { spirits: ["tequila"], tags: ["picante", "chile", "chile-jalapeno", "chile-serrano", "chile-thai", "chile-habanero", "chile-chipotle", "chile-ancho", "chile-guajillo", "chile-poblano", "flocos-de-chili", "cilantro", "coentro", "manga", "melancia", "lima", "abacaxi", "tomate"] },
    { spirits: ["espumante"], tags: ["floral", "frutado", "refrescante", "morango", "pessego", "framboesa"], weight: 0.5 },
    { spirits: ["pisco"], tags: ["citrico", "limao", "lima", "floral"], weight: 0.5 },
    { spirits: ["saque"], tags: ["pera", "pessego", "lichia", "floral", "pepino"], weight: 0.5 },
    { spirits: ["soju"], tags: ["frutado", "refrescante", "melancia", "melao", "melao-cantaloupe", "melao-honeydew", "morango"], weight: 0.5 },
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
    limao: { juice: "Suco de limão tahiti", syrup: null, garnish: "Zest de limão tahiti" },
    "limao-tahiti": { juice: "Suco de limão tahiti", syrup: null, garnish: "Zest de limão tahiti" },
    "limao-siciliano": { juice: "Suco de limão siciliano", syrup: null, garnish: "Zest de limão siciliano" },
    lima: { juice: "Suco de lima", syrup: null, garnish: "Rodela de lima" },
    laranja: { juice: "Suco de laranja", syrup: null, garnish: "Zest de laranja" },
    grapefruit: { juice: "Suco de grapefruit", syrup: "Xarope de grapefruit", garnish: "Twist de grapefruit" },
    toranja: { juice: "Suco de toranja", syrup: "Xarope de toranja", garnish: "Twist de toranja" },
    morango: { juice: "Purê de morango", syrup: "Xarope de morango", garnish: "Morango fresco" },
    framboesa: { juice: "Purê de framboesa", syrup: "Xarope de framboesa", garnish: "Framboesa" },
    amora: { juice: "Purê de amora", syrup: "Xarope de amora", garnish: "Amora" },
    maca: { juice: "Suco de maçã", syrup: "Xarope de maçã e canela", garnish: "Fatia de maçã" },
    pera: { juice: "Suco de pêra", syrup: "Xarope de pêra", garnish: "Fatia de pêra" },
    pessego: { juice: "Purê de pêssego", syrup: "Xarope de pêssego", garnish: "Fatia de pêssego" },
    melancia: { juice: "Suco de melancia", syrup: null, garnish: "Cubo de melancia" },
    melao: { juice: "Purê / suco de melão", syrup: "Xarope de melão", garnish: "Cubo de melão" },
    "melao-cantaloupe": { juice: "Purê / suco de melão", syrup: "Xarope de melão", garnish: "Cubo de melão" },
    "melao-honeydew": { juice: "Purê / suco de melão", syrup: "Xarope de melão", garnish: "Cubo de melão" },
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
    coentro: { juice: null, syrup: null, garnish: "Folhas de coentro" },
    pepino: { juice: "Suco de pepino", syrup: null, garnish: "Fita de pepino" },
    tomate: { juice: "Suco de tomate", syrup: null, garnish: "Cherry tomato" },
    gengibre: { juice: null, syrup: "Xarope de gengibre", garnish: "Chips de gengibre" },
    canela: { juice: null, syrup: "Xarope de canela", garnish: "Canela em rama" },
    cardamomo: { juice: null, syrup: "Xarope de cardamomo", garnish: "Vagem de cardamomo" },
    chile: { juice: null, syrup: "Xarope de chili", garnish: "Rodela de jalapeño" },
    "chile-jalapeno": { juice: null, syrup: "Xarope de chili", garnish: "Rodela de jalapeño" },
    cafe: { juice: "Espresso", syrup: "Xarope de café", garnish: "Grãos de café" },
    chocolate: { juice: null, syrup: "Xarope de chocolate", garnish: "Raspagem de chocolate" },
    lavanda: { juice: null, syrup: "Xarope de lavanda", garnish: "Flor de lavanda" },
    elderflower: { juice: null, syrup: "Cordial de flor de sabugueiro", garnish: "Flor de sabugueiro" },
    "flor-de-sabugueiro": { juice: null, syrup: "Cordial de flor de sabugueiro", garnish: "Flor de sabugueiro" },
    mel: { juice: null, syrup: "Mel diluído (1:1)", garnish: null },
    baunilha: { juice: null, syrup: "Xarope de baunilha", garnish: null },
    brigadeiro: { juice: null, syrup: "Calda de brigadeiro", garnish: null },
    "pe-de-moleque": { juice: null, syrup: "Calda de pé de moleque", garnish: null },
    "doce-de-leite": { juice: null, syrup: "Doce de leite", garnish: null },
    "creme-brulee": { juice: null, syrup: "Calda de crème brûlée", garnish: null },
    "marshmallow-tostado": { juice: null, syrup: "Xarope de marshmallow tostado", garnish: null },
    macaron: { juice: null, syrup: "Xarope de macaron", garnish: null },
    "caramelo-salgado": { juice: null, syrup: "Xarope de caramelo salgado", garnish: null },
    beijinho: { juice: null, syrup: "Calda de beijinho", garnish: null },
    pacoca: { juice: null, syrup: "Xarope de paçoca", garnish: null },
    churros: { juice: null, syrup: "Xarope de churros", garnish: null },
    "bolo-de-aniversario": { juice: null, syrup: "Xarope de bolo de aniversário", garnish: null },
    "tutti-frutti": { juice: null, syrup: "Xarope tutti-frutti", garnish: null },
    unicornio: { juice: null, syrup: "Xarope de unicórnio", garnish: null },
    "blue-raspberry": { juice: null, syrup: "Xarope blue raspberry", garnish: null },
    "leite-condensado": { juice: null, syrup: "Leite condensado", garnish: null },
  };

  const SPIRIT_LABELS = {};
  SPIRITS.forEach((s) => {
    SPIRIT_LABELS[s.id] = s.label;
  });
  // Baldes usados pelo motor (auto / alternativa) quando o id da família não é um SKU.
  Object.keys(SPIRIT_CATEGORY_LABELS).forEach((cat) => {
    if (!SPIRIT_LABELS[cat]) SPIRIT_LABELS[cat] = SPIRIT_CATEGORY_LABELS[cat];
  });

  /** Volume da base sem álcool — preferência da casa. O rótulo do suco é fechado no motor. */
  const ZERO_BASES = [
    { id: "h2oh", label: "H2OH!" },
    { id: "soda-limonada", label: "Soda limonada" },
    { id: "suco", label: "Suco" },
    { id: "espumante-sem-alcool", label: "Espumante sem álcool" },
    { id: "combo-suco-h2oh", label: "Suco + H2OH!" },
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
    return ing && ing.affinities ? ing.affinities.slice() : [];
  }

  function getExoticSuggestions(id) {
    const ing = getIngredient(id);
    if (!ing) return [];
    const named = (ing.exotic || []).filter((x) => x !== id && getIngredient(x));
    if (named.length) {
      return named.slice(0, 2).map((x) => ({ id: x, source: "LIVRO" }));
    }
    const fallback = (EXOTIC_BY_GROUP[ing.group] || []).filter((x) => x !== id && getIngredient(x));
    return fallback.slice(0, 2).map((x) => ({ id: x, source: "BAR" }));
  }

  const FOAMS = [
    { id: "gengibre", label: "ESPUMA GENGIBRE", tags: ["gengibre", "picante", "lima", "limao"] },
    { id: "baunilha", label: "ESPUMA BAUNILHA", tags: ["baunilha", "doce", "chocolate", "cafe", "coco"] },
    { id: "cupuacu", label: "ESPUMA CUPUAÇU", tags: ["cupuacu", "maracuja", "abacaxi", "tropical", "doce"] },
    { id: "limao-siciliano", label: "ESPUMA LIMÃO SICILIANO", tags: ["limao", "limao-siciliano", "citrico"] },
    { id: "canela", label: "ESPUMA CANELA", tags: ["canela", "amadeirado", "maca", "chocolate"] },
    { id: "pistache", label: "ESPUMA PISTACHE", tags: ["pistache", "doce", "baunilha"] },
    { id: "elderflower", label: "ESPUMA ELDERFLOWER (FLOR DE SABUGUEIRO)", tags: ["flor-de-sabugueiro", "floral", "pera", "limao"] },
    { id: "amaretto", label: "ESPUMA AMARETTO", tags: ["amaretto", "amendoa", "doce"] },
    { id: "amaretto-especiarias", label: "ESPUMA AMARETTO COM ESPECIARIAS", tags: ["amaretto", "canela", "cardamomo", "amadeirado"] },
    { id: "melancia", label: "ESPUMA MELANCIA", tags: ["melancia", "frutado", "hortela"] },
    { id: "morango", label: "ESPUMA MORANGO", tags: ["morango", "frutado", "baunilha"] },
    { id: "maca-verde", label: "ESPUMA DE MAÇÃ VERDE", tags: ["maca", "maca-verde", "citrico"] },
    { id: "amendoas", label: "ESPUMA DE AMÊNDOAS", tags: ["amendoa", "doce", "amaretto"] },
    { id: "cereja", label: "ESPUMA DE CEREJA", tags: ["cereja", "frutado", "chocolate"] },
    { id: "gengibre-lichia", label: "ESPUMA DE GENGIBRE COM LICHIA", tags: ["gengibre", "lichia", "picante", "floral"] },
  ];

  const LENGTHENERS = [
    { id: "soda", label: "Soda", kind: "soft" },
    { id: "tonica", label: "Tônica", kind: "soft" },
    { id: "ginger-beer", label: "Ginger beer", kind: "soft" },
    { id: "agua-gas", label: "Água com gás", kind: "soft" },
    { id: "agua-coco", label: "Água de coco", kind: "juice" },
    { id: "espumante-brut", label: "Espumante brut", kind: "sparkling" },
    { id: "espumante-prosecco", label: "Espumante prosecco", kind: "sparkling" },
    { id: "espumante-moscatel", label: "Espumante moscatel", kind: "sparkling" },
    { id: "espumante-rose", label: "Espumante rosé", kind: "sparkling" },
  ];

  const LOW_ABV_CATEGORIES = ["espumante", "vinho", "soju", "saque", "vermouth", "aperitivo", "licor"];
  const AGED_SPIRIT_IDS = [
    "cachaca-ouro", "rum-ouro", "rum-envelhecido",
    "whisky", "whisky-12", "whisky-18", "whisky-double", "bourbon",
    "conhaque", "brandy", "tequila-ouro", "jerez",
  ];

  function isLowAbvCategory(category) {
    return LOW_ABV_CATEGORIES.includes(category);
  }

  function isAgedSpiritId(id) {
    return AGED_SPIRIT_IDS.includes(id);
  }

  return {
    FLAVOR_NAMES,
    INGREDIENTS,
    SABOR_GROUPS,
    PROFILES,
    FORCAS,
    FOAMS,
    LENGTHENERS,
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
    getExoticSuggestions,
    getRealPairings,
    getSpirit,
    spiritCategory,
    spiritRole,
    isLowAbvCategory,
    isAgedSpiritId,
  };
})();
