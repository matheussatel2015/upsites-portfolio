# LP 10 — Painel Admin para a Lar & Co. Imóveis

**Data:** 2026-06-20
**Projeto:** `portfolio-premium/projetos/10-imobiliaria` (UPsites portfolio)
**Status:** Aprovado (brainstorming) — pronto para plano de implementação

---

## 1. Objetivo

Transformar a LP 10 (**Lar & Co. Imóveis**), hoje um site estático *data-driven*, em um
**sistema com painel administrativo** para **cadastrar, editar e excluir imóveis** e
**gerenciar fotos**, mantendo a publicação no **GitHub Pages**.

### Propósito e escopo (decisão-chave)

É uma **demonstração de portfólio**, coerente com o caráter fictício/demonstrativo das
demais peças. Logo:

- **Sem backend e sem custo:** continua 100% estático no GitHub Pages.
- **Persistência client-side:** o admin salva no `localStorage` do navegador.
- **Exportação:** botão para baixar o `imoveis.js` atualizado, que o autor commita
  manualmente quando quiser tornar as mudanças permanentes/públicas.

**Não-objetivos (YAGNI):** banco de dados real, autenticação segura, upload de arquivos
para servidor, multiusuário, painel de métricas.

---

## 2. Decisões de design (resumo)

| Tema | Decisão |
|------|---------|
| Hospedagem | GitHub Pages (estático), sem servidor |
| Persistência | `localStorage` (abordagem A), chave única de *overlay* |
| Fotos | Upload do arquivo → **compressão via canvas** (máx. 1280px, JPEG ~0.8) → data URL |
| Login | Tela `admin`/`admin` **apenas estética** (client-side), flag em `sessionStorage` |
| Sincronia público↔admin | Páginas públicas **mesclam** seed + overlay e refletem alterações na hora |
| Aviso no público | Mostrar aviso sutil "exibindo alterações locais" quando há overlay ativo |
| Backup | Exportar/Importar **backup JSON** do overlay |

---

## 3. Arquitetura

### 3.1 Estrutura de arquivos

```
10-imobiliaria/
├── index.html              # (existente) listagem — passa a ler do Store
├── imovel.html             # (existente) detalhe — passa a ler do Store
├── admin.html              # 🆕 painel: login + CRUD + upload de fotos
├── data/
│   └── imoveis.js          # (existente) SEED — fonte versionada, imutável em runtime
└── assets/
    ├── styles.css          # (existente)
    ├── listagem.js         # (existente) — usa Store.getAll()
    ├── imovel.js           # (existente) — usa Store.getById()
    ├── store.js            # 🆕 camada de dados (seed + overlay localStorage)
    ├── admin.css           # 🆕 estilos do painel
    └── admin.js            # 🆕 lógica do painel
```

### 3.2 Camada de dados — `store.js` (`window.Store`)

Fonte única da verdade, usada por **todas** as páginas. Não depende de build.

| Função | Responsabilidade |
|--------|------------------|
| `getAll()` | Lista final = **merge** do seed (`window.IMOVEIS`) com o overlay. Editados sobrescrevem por `id`; novos são adicionados; excluídos (tombstone) são ocultados. |
| `getById(id)` | Um imóvel já mesclado, ou `null`. |
| `upsert(imovel)` | Cria/atualiza um imóvel no overlay. Se o `id` existe no seed, grava em `updated`; se é novo, em `created`. |
| `remove(id)` | Adiciona o `id` a `deleted` (tombstone). |
| `resetOverlay()` | Limpa o overlay (volta ao seed versionado). |
| `exportData()` | Gera o conteúdo final do `imoveis.js` (seed + edições) no mesmo formato do arquivo atual. |
| `exportBackup()` / `importBackup(json)` | Serializa/restaura o overlay completo (validado por schema). |
| `usage()` | Uso estimado do `localStorage` (% e bytes) para o indicador no admin. |
| `hasOverlay()` | `true` se há qualquer alteração local (usado pelo aviso no público). |

**Formato do overlay** (uma chave `localStorage`, ex.: `larco_admin_overlay_v1`):

```json
{
  "version": 1,
  "updated": { "<id>": { /* imóvel completo */ } },
  "created": [ { /* imóvel completo */ } ],
  "deleted": [ "<id>", "..." ]
}
```

O `data/imoveis.js` (seed) **nunca** é alterado em runtime — é a base; o overlay é a
camada de edições. Isso garante o merge fino e mantém o arquivo versionado intacto até a
exportação.

---

## 4. Modelo de dados de um imóvel

Mantém o schema atual do `imoveis.js` (sem mudança de campos):

```
id, titulo, finalidade ("venda"|"aluguel"), tipo, bairro, cidade,
preco, condominio, iptu,
quartos, suites, banheiros, vagas, area,
destaque (bool), resumo, descricao,
caracteristicas: string[],
fotos: string[]   // caminhos "fotos/<slug>/N.jpg" no seed; data URLs quando vindo do admin
```

`<img src>` aceita data URL como string válida, então fotos do admin renderizam sem
alterar os templates.

---

## 5. Painel admin (`admin.html` + `admin.js` + `admin.css`)

Single-page; alterna seções via JS. Identidade visual da Lar & Co. (esmeralda/creme,
Fraunces + Figtree), com layout de "app" (topbar/sidebar).

### 5.1 Login (estético)

- Campos usuário/senha; valida contra constantes (`admin` / `admin`).
- Sucesso → flag em `sessionStorage` (`larco_admin_session`) → mostra o painel.
- "Sair" limpa o flag. Aviso: *"Acesso demonstrativo — autenticação apenas ilustrativa."*

### 5.2 Dashboard (lista)

- Tabela de `Store.getAll()`: thumb da capa, título, finalidade, tipo, bairro, preço, selo
  de destaque, badge **Seed / Editado / Novo**.
- Topo: **+ Novo imóvel**, busca rápida, **indicador de uso do `localStorage`** (barra %),
  **Exportar `imoveis.js`**, **Exportar/Importar backup JSON**, **Restaurar seed**.
- Linha: **Editar** · **Excluir** (com confirmação).

### 5.3 Formulário (criar/editar)

Campos agrupados:

- **Identificação:** `id` (auto via slug do título, editável; **bloqueado ao editar** para
  não quebrar URLs), título, finalidade, tipo, bairro, cidade.
- **Valores:** preço, condomínio, IPTU.
- **Números:** quartos, suítes, banheiros, vagas, área.
- **Destaque:** checkbox.
- **Textos:** resumo (curto), descrição (longa).
- **Características:** editor de *tags* (adiciona/remove itens do array).
- **Fotos:** ver 5.4.

### 5.4 Upload de fotos com compressão (coração da abordagem A)

- Input múltiplo + **arrastar-e-soltar**.
- `compressImage(file)` via canvas: redimensiona para **máx. 1280px** no maior lado,
  exporta **JPEG qualidade ~0.8** → data URL.
- Galeria de previews: **reordenar** (1ª = capa), **remover**.
- Guarda também o **caminho lógico** `fotos/<slug>/N.jpg` de cada foto (usado no export).
- Estima tamanho e **avisa se perto da cota** antes de salvar.

### 5.5 Validação do formulário

Antes do `Store.upsert`: obrigatórios (título, finalidade, tipo, bairro, preço); números
não-negativos; `id` único; ≥ 1 foto. Erros **inline por campo**, sem `alert()`.

---

## 6. Integração com as páginas públicas

- `index.html` e `imovel.html` carregam `assets/store.js` **após** `data/imoveis.js`.
- `listagem.js`: usa **`Store.getAll()`** (filtros/ordenação inalterados).
- `imovel.js`: usa **`Store.getById(id)`**.
- Fotos (inclusive data URLs) renderizam sem mudança de template.
- Quando `Store.hasOverlay()`, exibir **aviso sutil**: "exibindo alterações locais".
- Comportamento esperado: alterações aparecem na hora no **mesmo navegador**; em outro
  navegador/anônimo aparece **só o seed**.

---

## 7. Exportação (tornar permanente)

- **Exportar `imoveis.js`:** `Store.exportData()` monta o arquivo final (seed + edições +
  novos − excluídos) no **mesmo formato/comentário** do atual e dispara o download.
- **Manifesto de fotos:** gera `fotos-manifest.txt` listando cada caminho
  `fotos/<slug>/N.jpg` esperado (os binários são copiados manualmente antes do commit).
- **Backup JSON:** exportar/importar o overlay completo (portar trabalho entre máquinas).
- **Restaurar seed:** limpa o overlay (com confirmação).
- **Fluxo de publicação real:** exportar → substituir `data/imoveis.js` → copiar fotos para
  `fotos/<slug>/` → `git commit && git push`. Documentado no README.

---

## 8. Tratamento de erros e casos de borda

### Erros
- **`localStorage` indisponível:** detectado no início; público cai para **só seed**; admin
  avisa *"Armazenamento local indisponível — alterações não serão salvas."*
- **Cota estourada (`QuotaExceededError`):** escreve em cópia e só efetiva se OK (não
  corrompe overlay); orienta remover/comprimir fotos.
- **Falha ao comprimir:** valida `type image/*`, captura erro do canvas, rejeita o arquivo
  com mensagem por-foto sem travar o lote.
- **Overlay JSON inválido/versão antiga:** try/catch no parse; ignora overlay (usa seed) e
  loga aviso; nunca quebra a página pública.
- **Import de backup inválido:** valida schema antes de aplicar; rejeita com mensagem.

### Casos de borda
- **`id` duplicado:** validação bloqueia; slug automático sufixa `-2`, `-3`…
- **Excluir item do seed:** tombstone no overlay; **Restaurar seed** traz de volta.
- **Editar item do seed:** copia para `updated[id]`; seed original intacto.
- **Imóvel sem fotos:** bloqueado (mín. 1). Capa = 1ª foto.
- **Sessão admin:** expira ao fechar a aba (`sessionStorage`); recarregar dentro da aba
  mantém logado.

---

## 9. Validação / testes

Demo estática, sem framework de teste. **Checklist manual reproduzível** via Playwright
(servindo por `python -m http.server`, pois `file://` é bloqueado):

1. Login `admin/admin` entra; senha errada bloqueia.
2. Criar imóvel com foto → aparece na listagem pública (mesmo navegador) e no detalhe.
3. Editar item do seed → reflete; **Restaurar seed** reverte.
4. Excluir → some da listagem; restaurar traz de volta.
5. Filtros/ordenação funcionam com itens do overlay.
6. Exportar `imoveis.js` → formato correto e parseável.
7. Recarregar a aba → persiste; aba anônima → só seed.
8. Sem regressão visual (desktop + mobile, sem scroll horizontal).
9. `node --check` no `imoveis.js` exportado (JS válido).

---

## 10. Entregáveis

- 🆕 `assets/store.js`, `admin.html`, `assets/admin.js`, `assets/admin.css`
- ✏️ `assets/listagem.js`, `assets/imovel.js`, `index.html`, `imovel.html` (integração com Store)
- ✏️ `README.md` (documentar admin, export e fluxo de publicação)
- Sem novas dependências; sem build; compatível com GitHub Pages.
