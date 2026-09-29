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
| `data.js` | Sabores da lista mestre (nome, sem marca), afinidades e 1–2 pares exóticos, tipos de bebida da casa, pairing, copos da MATRIZ e heurística de base |

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

Início → Álcool/destilado → Sabores (1 a 3) → Perfil → Força → Espuma → Ficha ao vivo.

O copo não é um passo: entra no montador, com até 5 opções da MATRIZ.

## Motor

Perfil (sem Refrescante):

- **Doce** — adoçante perto de 30 ml e acidulante perto de 15 ml
- **Amargo** — entra um bitter
- **Cítrico** — acidulante perto de 30 ml e adoçante perto de 15 ml
- **Equilibrado** — os dois no meio da faixa

Xarope, purê, licor doce e o acidulante ficam entre **15 e 30 ml** quando entram. Flor de sabugueiro (elderflower), macaron e amaretto ficam um pouco abaixo, em cerca de **10–15 ml**. O acidulante cítrico é só **limão tahiti** (mais agressivo) ou **limão siciliano** (mais suave). Famílias spirit-forward (ancestral, vermouth, milanese, duo, trio) não obrigam limão, e na ficha dá para tirar o limão mesmo quando ele entrou.
- **Herbal / frutado / floral / picante** — a nota correspondente entra na ficha
- **Amadeirado** — a base sugerida é envelhecida (whisky, conhaque, brandy e afins)

Força:

- **Suave** — um pouco menos de álcool; a sugestão prefere base de teor mais baixo
- **Equilibrado** — base por volta de 50 ml
- **Forte** — um pouco mais de álcool
- **Refrescante** — só esta força leva alongador (refrigerante, suco, espumante, soda). Suave, equilibrado e forte saem sem essa linha

Espuma: só entra na ficha quando a pessoa escolhe uma, ou pede “Deixa o app escolher”. “Sem espuma” (o padrão) deixa a receita sem cobertura. No montador dá para ligar ou tirar a espuma.

O montador calcula a ficha a cada toque. Na ficha, **+** e **−** ajustam o ml da linha sem gerar outro drink. Dá para escolher **Travar proporção** (os outros ml acompanham) ou **Só avisar** (o equilíbrio sai do eixo e o app avisa, sem forçar). **Total de líquido** soma os ml abaixo dos ingredientes. A ficha não traz mais o tipo de gelo. **Exportar receita** copia o texto e baixa um `.txt`. Texto marcado **[BAR]** é inferência fora da regra escrita. Zero álcool ocupa o volume da base (~50 ml no equilibrado) com H2OH!, soda limonada, suco e/ou espumante sem álcool. Xarope, licor ou purê pedem limão tahiti ou siciliano, exceto nas famílias spirit-forward (ancestral, vermouth, milanese, duo, trio). Em Base, Sabores, Espuma e Copo, o **cardápio** acrescenta qualquer item além das sugestões. Sabores na ficha sobe até 20, e cada sugestão tem pairing real com o protagonista. As sugestões de sabor trazem 1 ou 2 pares exóticos quando o livro nomeia o par.
