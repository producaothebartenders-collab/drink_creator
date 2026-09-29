# Criador de Drinks

App estático (HTML/CSS/JS) do **Grupo The Bartenders** para montar um drink em etapas: álcool, sabores, perfil, força e espuma. No fim, um **montador** oferece bases, sabores, espuma, copo e alongador — a ficha e as doses atualizam ao vivo.

Visual **dark bar** (preto/carvão + dourado), pensado primeiro para celular. Interface em **português (Brasil)**.

**Endereço:** https://producaothebartenders-collab.github.io/drink_creator/

Publicação pelo GitHub Pages a partir do branch `main`, pasta `/` (raiz). O arquivo `.nojekyll` faz o Pages servir HTML, CSS e JS sem processamento do Jekyll.

---

## Arquivos

| Arquivo | Papel |
|---------|--------|
| `index.html` | Shell e telas do stepper |
| `styles.css` | Visual dark bar |
| `app.js` | Interface: stepper, chips e montador ao vivo |
| `motor.js` | Regras de perfil, força, espuma e doses |
| `data.js` | 220 sabores da lista mestre (nome, sem marca), afinidades só onde já havia heurística, tipos de bebida da casa, pairing, copos da MATRIZ e heurística de base |

Os arquivos ficam na **raiz** do repositório. Caminhos de CSS e JS são relativos, então a página funciona tanto no Pages (`/drink_creator/`) quanto num servidor local.

---

## Abrir localmente

Na raiz do repositório:

```bash
python3 -m http.server 8765
```

Abra **http://localhost:8765/**.

No Windows, com Python:

```powershell
python -m http.server 8765
```

Sem Python, com Node.js:

```powershell
npx --yes serve -l 8765
```

Para parar o servidor: `Ctrl+C`.

---

## Fluxo

Início → Álcool/destilado → Sabores (1 a 3, entre os 220) → Perfil → Força → Espuma → Ficha ao vivo.

O copo não é um passo: entra no montador, com até 5 opções da MATRIZ.

## Motor

Perfil (sem Refrescante):

- **Doce** — mais adoçante (xarope, purê, licor) do que acidulante
- **Amargo** — entra um bitter
- **Cítrico** — mais acidulante do que adoçante
- **Equilibrado** — doce e ácido na mesma medida
- **Herbal / frutado / floral / picante** — a nota correspondente entra na ficha
- **Amadeirado** — a base sugerida é envelhecida (whisky, conhaque, brandy e afins)

Força:

- **Suave** — um pouco menos de álcool; a sugestão prefere base de teor mais baixo
- **Equilibrado** — base por volta de 50 ml
- **Forte** — um pouco mais de álcool
- **Refrescante** — entra refrigerante, suco, espumante ou outro alongador

Espuma: uma da lista, nenhuma, ou “Deixa o app escolher”. No montador, até 5 espumas quando há espuma.

O montador calcula a ficha a cada toque. Texto marcado **[BAR]** é inferência fora da regra escrita. Zero álcool usa base de chá, shrub, tisana ou blend. Os 220 sabores e os tipos de destilado da casa permanecem.
