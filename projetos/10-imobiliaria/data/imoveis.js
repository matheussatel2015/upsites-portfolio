/* ============================================================
   Lar & Co. Imóveis — base de dados dos imóveis
   ------------------------------------------------------------
   COMO ADICIONAR UM IMÓVEL:
   1. Crie uma pasta em  fotos/<slug>/  e coloque as imagens (1.jpg, 2.jpg, ...).
   2. Copie um bloco abaixo e ajuste os campos.
   3. Use um "id" único (sem espaços) — ele aparece na URL: imovel.html?id=<id>.

   CAMPOS:
   - finalidade: "venda" ou "aluguel"
   - tipo: "Apartamento" | "Casa" | "Cobertura" | "Studio" | "Sala comercial" | ...
   - preco: número (em reais). Para aluguel é o valor mensal.
   - fotos: caminhos relativos a partir desta pasta do site.
   ============================================================ */
window.IMOVEIS = [
  {
    id: "ap-batel-301",
    titulo: "Apartamento moderno no Batel",
    finalidade: "venda",
    tipo: "Apartamento",
    bairro: "Batel",
    cidade: "Curitiba/PR",
    preco: 890000,
    condominio: 980,
    iptu: 320,
    quartos: 3,
    suites: 1,
    banheiros: 2,
    vagas: 2,
    area: 110,
    destaque: true,
    resumo: "3 quartos com suíte, varanda gourmet e 2 vagas, a passos da Av. do Batel.",
    descricao: "Apartamento impecável em uma das regiões mais valorizadas de Curitiba. Sala ampla integrada à varanda gourmet com churrasqueira, cozinha planejada, 3 dormitórios sendo uma suíte com closet. Andar alto, face norte, muita luz natural. Prédio com lazer completo: piscina, academia, salão de festas e portaria 24h.",
    caracteristicas: ["Varanda gourmet", "Cozinha planejada", "Suíte com closet", "Andar alto", "Lazer completo", "Portaria 24h"],
    fotos: ["fotos/ap-batel/1.jpg", "fotos/ap-batel/2.jpg", "fotos/ap-batel/3.jpg"]
  },
  {
    id: "casa-santa-felicidade",
    titulo: "Casa ampla em Santa Felicidade",
    finalidade: "venda",
    tipo: "Casa",
    bairro: "Santa Felicidade",
    cidade: "Curitiba/PR",
    preco: 1350000,
    condominio: 0,
    iptu: 410,
    quartos: 4,
    suites: 2,
    banheiros: 4,
    vagas: 3,
    area: 280,
    destaque: true,
    resumo: "Casa de 280m² com 4 quartos, 2 suítes, quintal amplo e 3 vagas.",
    descricao: "Excelente residência em terreno de 450m². Living em dois ambientes, lavabo, cozinha com despensa, área de serviço e dependência. No pavimento superior, 4 dormitórios, sendo 2 suítes. Quintal espaçoso com espaço gourmet e jardim. Ótima localização, próxima a comércios e restaurantes.",
    caracteristicas: ["Terreno 450m²", "Espaço gourmet", "2 suítes", "Quintal com jardim", "Dependência completa", "Garagem para 3 carros"],
    fotos: ["fotos/casa-sf/1.jpg", "fotos/casa-sf/2.jpg", "fotos/casa-sf/3.jpg"]
  },
  {
    id: "cobertura-agua-verde",
    titulo: "Cobertura duplex no Água Verde",
    finalidade: "venda",
    tipo: "Cobertura",
    bairro: "Água Verde",
    cidade: "Curitiba/PR",
    preco: 2100000,
    condominio: 1850,
    iptu: 720,
    quartos: 4,
    suites: 4,
    banheiros: 5,
    vagas: 4,
    area: 320,
    destaque: true,
    resumo: "Cobertura duplex de altíssimo padrão, 4 suítes e terraço com piscina privativa.",
    descricao: "Cobertura duplex exclusiva com 320m² de puro requinte. Pé-direito duplo no living, 4 suítes amplas, home office e lavabo. No terraço, piscina privativa, espaço gourmet e vista panorâmica da cidade. Acabamento premium, automação residencial e 4 vagas demarcadas.",
    caracteristicas: ["Piscina privativa", "Pé-direito duplo", "4 suítes", "Automação residencial", "Vista panorâmica", "Acabamento premium"],
    fotos: ["fotos/cob-agua-verde/1.jpg", "fotos/cob-agua-verde/2.jpg", "fotos/cob-agua-verde/3.jpg"]
  },
  {
    id: "ap-centro-aluguel",
    titulo: "Apartamento compacto no Centro",
    finalidade: "aluguel",
    tipo: "Apartamento",
    bairro: "Centro",
    cidade: "Curitiba/PR",
    preco: 2800,
    condominio: 650,
    iptu: 120,
    quartos: 2,
    suites: 0,
    banheiros: 1,
    vagas: 1,
    area: 65,
    destaque: false,
    resumo: "2 quartos, 1 vaga, perto de tudo. Ideal para quem trabalha no Centro.",
    descricao: "Apartamento funcional e bem distribuído, a poucos passos do transporte público, comércio e serviços. 2 dormitórios, sala com sacada, cozinha e área de serviço. Prédio com elevador, portaria e salão de festas. Pronto para morar.",
    caracteristicas: ["Sacada", "Elevador", "Portaria", "Próximo ao transporte", "Pronto para morar"],
    fotos: ["fotos/ap-centro/1.jpg", "fotos/ap-centro/2.jpg", "fotos/ap-centro/3.jpg"]
  },
  {
    id: "studio-reboucas",
    titulo: "Studio mobiliado no Rebouças",
    finalidade: "aluguel",
    tipo: "Studio",
    bairro: "Rebouças",
    cidade: "Curitiba/PR",
    preco: 1600,
    condominio: 480,
    iptu: 80,
    quartos: 1,
    suites: 0,
    banheiros: 1,
    vagas: 1,
    area: 38,
    destaque: false,
    resumo: "Studio mobiliado e equipado, perto da UTFPR. Pacote ideal para estudantes.",
    descricao: "Studio inteligente totalmente mobiliado e equipado: cama, sofá, cozinha com cooktop, geladeira e microondas. Prédio novo com coworking, lavanderia compartilhada, bicicletário e academia. A 5 minutos da UTFPR. Internet inclusa no condomínio.",
    caracteristicas: ["Mobiliado", "Coworking", "Academia", "Bicicletário", "Internet inclusa", "Próximo à UTFPR"],
    fotos: ["fotos/studio-reboucas/1.jpg", "fotos/studio-reboucas/2.jpg", "fotos/studio-reboucas/3.jpg"]
  },
  {
    id: "casa-cond-campo-comprido",
    titulo: "Casa em condomínio no Campo Comprido",
    finalidade: "venda",
    tipo: "Casa",
    bairro: "Campo Comprido",
    cidade: "Curitiba/PR",
    preco: 1150000,
    condominio: 720,
    iptu: 360,
    quartos: 3,
    suites: 1,
    banheiros: 3,
    vagas: 2,
    area: 190,
    destaque: false,
    resumo: "Casa em condomínio fechado com segurança 24h e área de lazer completa.",
    descricao: "Sobrado em condomínio fechado com total segurança e privacidade. 3 dormitórios sendo 1 suíte, living integrado à cozinha gourmet, lavabo e quintal com deck. Condomínio com piscina, quadra, playground e portaria 24h. Perfeito para famílias.",
    caracteristicas: ["Condomínio fechado", "Segurança 24h", "Quintal com deck", "Quadra e playground", "Cozinha gourmet", "Ambiente familiar"],
    fotos: ["fotos/casa-cond-cc/1.jpg", "fotos/casa-cond-cc/2.jpg", "fotos/casa-cond-cc/3.jpg"]
  }
];
