# UPsites — Portfólio de Landing Pages de Alta Conversão

Portfólio premium com **10 landing pages comerciais + 1 projeto externo no GitHub** + uma página principal de apresentação. Cada projeto tem identidade visual única, layout exclusivo e estratégia de conversão própria para seu segmento.

🔗 **Demo online:** _(GitHub Pages — link na aba "Pages" do repositório)_

## Projetos

| # | Marca | Segmento | Identidade |
|---|-------|----------|-----------|
| 01 | Castelo & Aragão | Advocacia empresarial premium | Dark + dourado · Cormorant Garamond |
| 02 | Vivá Estética | Clínica de estética feminina | Rosé gold + nude · Italiana · slider antes/depois |
| 03 | Solvi Energia | Energia solar | Navy + amarelo · Sora · simulador de economia |
| 04 | Átrio Imóveis | Imobiliária de alto padrão | Champagne editorial · Bodoni Moda |
| 05 | Fluxon | Software SaaS B2B | Dark + gradientes · Unbounded · dashboard interativo |
| 06 | FORJA | Academia premium | Preto + vermelho · Anton |
| 07 | Brask | Construtora e reformas | Navy + laranja · Oswald · timeline |
| 08 | Reverso | Agência de marketing | Off-black + chartreuse · Syne · layout assimétrico |
| 09 | Vesti Bem | Confecção e uniformes | Azul + amarelo + coral · visual vibrante |
| 10 | Lar & Co. Imóveis | Imobiliária com área administrativa | Verde profundo · filtros e páginas |
| 11 | SAISO | Projeto externo (GitHub) | Detalhes visuais e técnicos no repositório |

## Tecnologia

- **HTML, CSS e JavaScript puro** — sem frameworks, sem build.
- Cada página é **auto-contida** (abre com duplo-clique).
- Totalmente responsivo (mobile-first), com animações de scroll, contadores, formulários validados e microinterações.
- Fotos via Unsplash (CDN) com fallback on-brand; ícones em SVG inline.

## Como rodar localmente

Abra `index.html` no navegador. Para que as pré-visualizações em `<iframe>` da página principal carreguem sem bloqueio, sirva a pasta via HTTP:

```bash
python -m http.server 8000
# acesse http://localhost:8000
```

## Estrutura

```
index.html                 # Página principal do portfólio
projetos/
  01-advocacia/index.html
  02-estetica/index.html
  03-energia-solar/index.html
  04-imobiliaria/index.html
  05-saas/index.html
  06-academia/index.html
  07-construtora/index.html
  08-marketing/index.html
  09-confeccao/index.html
  10-imobiliaria/index.html
```
Projeto externo adicional:
- SAISO (GitHub): https://github.com/matheussatel2015/v0-landing-page-saiso

---

> Todos os projetos, marcas, números e depoimentos são **fictícios**, criados exclusivamente para fins de demonstração de portfólio.
