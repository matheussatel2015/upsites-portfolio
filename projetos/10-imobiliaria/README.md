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

> Imóveis, fotos e dados são **fictícios**, para fins de demonstração de portfólio.
