# Criador de Drinks

App estático (HTML/CSS/JS) do **Grupo The Bartenders** para montar um drink em etapas: escolhas de álcool, sabores, perfil, força e copo passam pelo motor de regras e voltam **2–3 fichas** no padrão TB.

Visual **dark bar** (preto/carvão + dourado), pensado primeiro para celular. Interface em **português (Brasil)**.

**Endereço:** https://producaothebartenders-collab.github.io/drink_creator/

Publicação pelo GitHub Pages a partir do branch `main`, pasta `/` (raiz). O arquivo `.nojekyll` faz o Pages servir HTML, CSS e JS sem processamento do Jekyll.

---

## Arquivos

| Arquivo | Papel |
|---------|--------|
| `index.html` | Shell e telas do stepper |
| `styles.css` | Visual dark bar |
| `app.js` | Interface: stepper, chips, resultado e ajustes |
| `motor.js` | Pipeline de sugestão |
| `data.js` | Subset curado: ingredientes (incl. **melão**, **amaro**, **Ramazzotti**), tipos de bebida da casa (sem marca), pairing, copos da MATRIZ e heurística de base |

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

## Motor (pipeline)

1. Validar a entrada (álcool, pelo menos 1 sabor, perfil 1–2, força, copo)
2. Resolver a base (destilado, automático ou zero álcool)
3. Expandir sabores em acorde e ponte
4. Escolher a família estrutural (sour, long, mule, spirit-forward, build, spritz, gin-tonic, mocktail)
5. Ajustar proporções pela força e pelo perfil
6. Sugerir o copo pela MATRIZ (automático ou manual)
7. Gerar 2–3 fichas TB (A match · B ponte/método · C base alternativa ou versão suave)
8. Explicar a escolha e oferecer ajustes (mais doce, cítrico, força, trocar base, outra rodada)

**Caminhos especiais:** melão + Ramazzotti/amaro segue spritz, long drink ou spirit-forward com o amaro nomeado; zero álcool usa base de chá, shrub, tisana ou blend.

As referências de treino (Flavor Bible, Liquid Intelligence, carta TB e MATRIZ de copos) estão parafraseadas no motor.
