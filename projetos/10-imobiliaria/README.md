# Lar & Co. Imóveis — site de imóveis (data-driven)

Site estático multipágina, **sem build e sem backend**. Os imóveis são lidos de um único
arquivo de dados e as fotos ficam numa pasta. Para mudar o site, você só edita esses arquivos.

## Estrutura

```
10-imobiliaria/
├── index.html          # Listagem + filtros
├── imovel.html         # Página de detalhe (abre via imovel.html?id=<id>)
├── data/
│   └── imoveis.js       # 👉 TODOS os imóveis ficam aqui (window.IMOVEIS)
├── fotos/
│   └── <slug>/          # 👉 fotos de cada imóvel: 1.jpg, 2.jpg, 3.jpg ...
└── assets/
    ├── styles.css       # estilos
    ├── listagem.js      # lógica da listagem/filtros
    └── imovel.js        # lógica da página de detalhe
```

## Como adicionar um imóvel novo

1. **Crie a pasta das fotos:** `fotos/minha-casa/` e coloque as imagens (`1.jpg`, `2.jpg`, ...).
   A primeira foto (`1.jpg`) é a capa que aparece na listagem.
2. **Adicione um bloco em `data/imoveis.js`** copiando um existente e ajustando:
   ```js
   {
     id: "minha-casa",            // único, sem espaços — vira imovel.html?id=minha-casa
     titulo: "Casa charmosa no Bigorrilho",
     finalidade: "venda",         // "venda" ou "aluguel"
     tipo: "Casa",                // Apartamento | Casa | Cobertura | Studio | ...
     bairro: "Bigorrilho",
     cidade: "Curitiba/PR",
     preco: 980000,               // número; para aluguel é o valor por mês
     condominio: 0, iptu: 300,
     quartos: 3, suites: 1, banheiros: 2, vagas: 2, area: 160,
     destaque: false,             // true = aparece com selo e primeiro na ordenação
     resumo: "Frase curta para a listagem.",
     descricao: "Texto completo que aparece na página do imóvel.",
     caracteristicas: ["Quintal", "Churrasqueira", "Suíte"],
     fotos: ["fotos/minha-casa/1.jpg", "fotos/minha-casa/2.jpg"]
   }
   ```
3. Pronto. Os filtros (tipo, bairro, preço) se atualizam sozinhos a partir dos dados.

## Como rodar

Para abrir localmente, sirva a pasta por HTTP (o `<script>` de dados funciona até em `file://`,
mas servir por HTTP evita qualquer surpresa):

```bash
python -m http.server 8000
# acesse http://localhost:8000
```

## Filtros disponíveis na listagem

Finalidade (Comprar/Alugar), busca por texto, tipo, bairro, nº de quartos (mínimo),
preço máximo e ordenação (destaques, menor/maior preço, maior área).

---

## Painel administrativo (`admin.html`)

> **Demonstração de portfólio.** Tudo acontece no navegador — sem backend, sem servidor de arquivos,
> sem custo. O painel existe para mostrar o conceito de gestão de conteúdo 100% estático.

### Acesso

Não há link público no site; acesse diretamente pela URL:

```
http://localhost:8000/admin.html
```

Serve **obrigatoriamente** via HTTP (não `file://`) para que `localStorage` e scripts funcionem
sem restrições. Use o mesmo servidor do item "Como rodar":

```bash
python -m http.server 8000
```

A página tem `<meta name="robots" content="noindex,nofollow">` — não será indexada por buscadores.

### Login (demonstrativo)

| Campo | Valor |
|-------|-------|
| Usuário | `admin` |
| Senha | `admin` |

A autenticação é **ilustrativa e client-side**: nenhuma credencial é validada em servidor.
A sessão dura enquanto a aba estiver aberta (`sessionStorage`); fechar a aba desloga automaticamente.

### O que é possível fazer

- **Cadastrar, editar e excluir imóveis** pelo formulário do painel.
- **Gerenciar fotos:** upload com compressão automática via `<canvas>` — redimensiona para no máximo
  1280 px e exporta em JPEG com qualidade ~0,8; fotos são armazenadas como Data URLs.
- **Badge de status:** cada imóvel exibe `Seed` (dados originais), `Editado` ou `Novo`.
- **Busca** em tempo real na listagem de imóveis do painel.
- **Indicador de uso do `localStorage`** (KB usados vs. limite do navegador).
- **Restaurar seed:** descarta todas as alterações locais e volta ao conjunto original de imóveis.

### Persistência (como os dados ficam salvos)

O painel salva as alterações no **`localStorage` do navegador** como um overlay — a "camada" local
fica sobre o arquivo versionado `data/imoveis.js`, que **não é alterado em runtime**.

- No mesmo navegador onde você editou, as páginas públicas (`index.html`, `imovel.html`) refletem
  as alterações e exibem um aviso sutil de "alterações locais".
- Em outro navegador ou em aba anônima, só o seed (dados originais) é exibido.

### Exportar / publicar (tornar as alterações permanentes)

Para que as alterações apareçam para todos os visitantes, é preciso incorporá-las ao projeto e
fazer deploy. O painel oferece três botões de exportação:

| Botão | O que faz |
|-------|-----------|
| **Exportar imoveis.js** | Baixa o arquivo `imoveis.js` final (seed + overlay mesclados) pronto para substituir `data/imoveis.js` no projeto. Junto com ele, baixa um **`fotos-manifest.txt`** com os caminhos esperados para todas as fotos (`fotos/<id>/1.jpg`, `fotos/<id>/2.jpg`, …). |
| **Exportar backup** | Baixa um JSON com o overlay atual (útil para transportar o trabalho entre máquinas). |
| **Importar backup** | Carrega um JSON de backup salvo anteriormente, restaurando o overlay neste navegador. |

### Fluxo de publicação real (passo a passo)

1. No painel, clique em **Exportar imoveis.js** — dois arquivos são baixados:
   `imoveis.js` e `fotos-manifest.txt`.
2. Substitua `data/imoveis.js` no projeto pelo arquivo baixado.
3. Para cada imóvel com fotos novas, crie a pasta `fotos/<id>/` e coloque as imagens conforme
   os caminhos listados no `fotos-manifest.txt` (`1.jpg`, `2.jpg`, …).
4. Faça commit e push:
   ```bash
   git add data/imoveis.js fotos/
   git commit -m "feat: atualiza imóveis e fotos"
   git push
   ```
5. O GitHub Pages (ou seu host estático) fará o deploy automaticamente.
   A partir daí, todos os visitantes verão os dados atualizados.

---

> Imóveis, fotos e dados são **fictícios**, para fins de demonstração de portfólio.
