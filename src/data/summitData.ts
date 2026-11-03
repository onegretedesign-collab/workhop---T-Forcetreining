export interface Speaker {
  id: string;
  name: string;
  instagram: string;
  role: string;
  company: string;
  time: string;
  talkTitle: string;
  category: string;
  avatarSeed: string;
  photoUrl: string;
  accentColor: string;
  bio: string;
  talkDescription: string;
  keyTakeaways: string[];
  hookQuoteTop: string;
  hookQuoteHighlight: string;
}

export interface BannerPreset {
  id: string;
  name: string;
  description: string;
  url: string;
  svgGradientStyle?: string;
}

export const SUMMIT_EVENT = {
  name: "WORKSHOP - T-Forcetreining",
  tagline: "Performance 360º: Hipertrofia, Hormonal, Nutrição & Tratamento de Lesões",
  edition: "Edição Oficial",
  date: "20 de Fevereiro",
  dayOfWeek: "Sexta-feira",
  time: "Início pontual às 15:00",
  venue: "Dragon Gym & Centro de Convenções",
  address: "Av. das Nações Unidas, 12551 - Brooklin Novo, São Paulo - SP",
  price: 200.00,
  maxInstallments: 12,
  spotsLeft: 42,
  totalSpots: 500,
};

export const BANNER_PRESETS: BannerPreset[] = [
  {
    id: "preset-dragon-official",
    name: "Banner Oficial - Performance 360º",
    description: "Arte oficial do WORKSHOP - T-Forcetreining Dragon Gym com todos os palestrantes.",
    url: "https://i.postimg.cc/nzjjTH3B/BANNER-SITE-WOHRSHOP-DRAGON.png",
  },
  {
    id: "preset-crimson-vortex",
    name: "Obsidian & Crimson Vortex",
    description: "Geometria minimalista em preto absoluto #0A0A0A com arcos de energia em vermelho vibrante #E50914.",
    url: "preset://crimson-vortex",
  },
  {
    id: "preset-cyber-grid",
    name: "Cybernetic Horizon 2026",
    description: "Grid de perspectiva isométrica com pulso de luz vermelho e partículas de dados.",
    url: "preset://cyber-grid",
  },
  {
    id: "preset-minimal-red-glow",
    name: "Minimal Red Studio Glow",
    description: "Gradiente radial refinado com iluminação de palco de conferência internacional.",
    url: "preset://minimal-red-glow",
  },
  {
    id: "preset-circuit-core",
    name: "Neural Core Architecture",
    description: "Topologia de circuitos quânticos e filamentos luminescentes carmesim.",
    url: "preset://circuit-core",
  },
];

export const SPEAKERS: Speaker[] = [
  {
    id: "speaker-1",
    name: "Personal Tiago Alves",
    instagram: "@t_forcetraining",
    role: "Especialista em Treinamento de Força & Performance",
    company: "T-Force Training",
    time: "08:45 - 09:45",
    talkTitle: "Periodização de Força e Hipertrofia: Da Teoria Científica à Prática de Alta Intensidade",
    category: "Treinamento & Força",
    avatarSeed: "tiago",
    photoUrl: "https://i.postimg.cc/RFHCjzP6/Whats-App-Image-2026-10-26-at-21-01-41.jpg",
    accentColor: "#E50914",
    hookQuoteTop: "Metodologia com Propósito, Estratégia que entrega",
    hookQuoteHighlight: "Resultados Máximos.",
    bio: "Fundador da T-Force Training e treinador de referência em alta performance. Especialista em biomecânica aplicada ao treinamento resistido, prescrição de força e evolução estrutural contínua de atletas e praticantes avançados.",
    talkDescription: "Como estruturar ciclos de periodização e progressão de sobrecarga de alta densidade sem comprometer articulações. Ajustes finos de biomecânica para maximizar o recrutamento de fibras e quebrar estagnações.",
    keyTakeaways: [
      "Protocolos práticos de periodização ondulatória diária para hipertrofia",
      "Biomecânica de alavancas para otimizar ativação muscular sob carga",
      "Manejo de volume e densidade para evolução sem sobrecarga lesiva",
    ],
  },
  {
    id: "speaker-2",
    name: "Marcelo",
    instagram: "@Marcellaojr",
    role: "Especialista em Performance & Fisiologia do Exercício",
    company: "Performance & Força",
    time: "10:00 - 11:00",
    talkTitle: "Estratégias Avançadas de Intensificação e Adaptação Muscular",
    category: "Fisiologia & Performance",
    avatarSeed: "marcelo",
    photoUrl: "https://i.postimg.cc/FRLF2QPY/MARCELO.jpg",
    accentColor: "#E50914",
    hookQuoteTop: "Treinamento Avançado com Ciência e Prática para",
    hookQuoteHighlight: "Resultados Reais.",
    bio: "Treinador com ampla experiência em condicionamento físico avançado, periodização e superação de limites. Especialista em métodos de intensificação e resposta metabólica.",
    talkDescription: "Análise aprofundada dos métodos avançados de treino: rest-pause, cluster sets, drop sets e modulação de tempo sob tensão para estimular novas adaptações musculares.",
    keyTakeaways: [
      "Aplicação assertiva de técnicas de intensificação sem fadiga residual excessiva",
      "Fisiologia da falha muscular concêntrica vs. reserva de repetições (RIR)",
      "Ajustes de carga e cadência para máxima resposta hipertrófica",
    ],
  },
  {
    id: "speaker-3",
    name: "Dr Guilherme Silverio",
    instagram: "@dr.guilhermesilverio",
    role: "Médico do Esporte & Longevidade",
    company: "Medicina Integrativa & Esporte",
    time: "11:15 - 12:15",
    talkTitle: "Medicina Esportiva, Otimização Hormonal e Longevidade Saudável",
    category: "Medicina Esportiva",
    avatarSeed: "guilherme",
    photoUrl: "https://i.postimg.cc/cJj49Jcv/DR-GUILHERME.jpg",
    accentColor: "#E50914",
    hookQuoteTop: "Saúde e Performance Integradas para uma Vida com",
    hookQuoteHighlight: "Máxima Vitalidade.",
    bio: "Médico especialista em medicina esportiva, modulação metabólica e longevidade. Auxilia atletas e entusiastas a alcançarem sua melhor versão física mantendo a saúde cardiovascular e hormonal blindada.",
    talkDescription: "Como os biomarcadores laboratoriais guiam o ajuste individual de saúde e performance. Diretrizes médicas para prevenção de lesões, manejo do sono, controle do cortisol e suporte metabólico avançado.",
    keyTakeaways: [
      "Interpretação clínica de exames essenciais para quem treina pesado",
      "Estratégias médicas para otimização hormonal natural e modulação do estresse",
      "Longevidade celular e proteção cardiovascular em atletas de alta demanda",
    ],
  },
  {
    id: "speaker-4",
    name: "Jeriton",
    instagram: "@jeritonperformance",
    role: "Treinador & Consultor de Alta Performance",
    company: "Jeriton Performance",
    time: "14:00 - 15:00",
    talkTitle: "Biomecânica Aplicada e Construção de Físicos de Elite",
    category: "Biomecânica & Performance",
    avatarSeed: "jeriton",
    photoUrl: "https://i.postimg.cc/LX14rMyn/JERITON.jpg",
    accentColor: "#E50914",
    hookQuoteTop: "Precisão Técnica e Disciplina: A chave para",
    hookQuoteHighlight: "Construir Campeões.",
    bio: "Treinador e consultor esportivo focado em biomecânica de precisão, postura sob carga e desenvolvimento muscular simétrico. Prepara atletas e praticantes dedicados à evolução constante.",
    talkDescription: "Estudo detalhado dos vetores de força e alinhamento anatômico nos principais levantamentos. Como pequenas correções de ângulo geram enormes ganhos de hipertrofia e eliminam dores articulares.",
    keyTakeaways: [
      "Análise angular de exercícios multiarticulares fundamentais",
      "Individualização do posicionamento articular de acordo com a anatomia",
      "Sistemas de feedback proprioceptivo para ativação muscular alvo",
    ],
  },
  {
    id: "speaker-5",
    name: "Nathálya Souza",
    instagram: "@nutrinathalyasouza",
    role: "Nutricionista Esportiva & Clínica",
    company: "Nutrição & Alta Performance",
    time: "15:15 - 16:15",
    talkTitle: "Nutrição Estratégica: Periodização de Macronutrientes e Suplementação Eficaz",
    category: "Nutrição Esportiva",
    avatarSeed: "nathalya",
    photoUrl: "https://i.postimg.cc/4d94rT8H/NATHALIA.jpg",
    accentColor: "#E50914",
    hookQuoteTop: "Nutrição com Base Científica para Potencializar seu",
    hookQuoteHighlight: "Metabolismo e Ganho.",
    bio: "Nutricionista clínica e esportiva, referência em emagrecimento definitivo, recomposição corporal e hipertrofia. Especialista em estratégias alimentares sustentáveis e de alto rendimento.",
    talkDescription: "Periodização de calorias e macronutrientes alinhada às fases de treino. O que a ciência comprova sobre suplementos ergogênicos, hidratação celular e nutrição pré/pós-treino de alta eficiência.",
    keyTakeaways: [
      "Montagem prática de cardápios para perda de gordura sem perda de massa magra",
      "Guia baseado em evidências de suplementação eficaz vs. desperdício financeiro",
      "Estratégias de refeed, carb-cycling e adesão comportamental consistente",
    ],
  },
  {
    id: "speaker-6",
    name: "Dra Leiliara Borges",
    instagram: "@dra.leiliaraborges",
    role: "Fisioterapeuta Especialista em Reabilitação & Biomecânica",
    company: "Fisioterapia Esportiva",
    time: "16:30 - 17:30",
    talkTitle: "Prevenção de Lesões Articulares e Reabilitação Funcional no Treino Pesado",
    category: "Fisioterapia & Saúde",
    avatarSeed: "leiliara",
    photoUrl: "https://i.postimg.cc/1tqRLZW5/IMG-3602-JPG.jpg",
    accentColor: "#E50914",
    hookQuoteTop: "Movimento Livre de Dores: Fortaleça sua estrutura e",
    hookQuoteHighlight: "Treine sem Limites.",
    bio: "Fisioterapeuta com ampla atuação em ortopedia e fisioterapia esportiva. Dedicada à reabilitação e prevenção de lesões musculoesqueléticas em atletas de musculação e modalidades de força.",
    talkDescription: "Rotinas de mobilidade, estabilidade escapular, alinhamento de quadril e descompressão lombar. Como blindar as articulações para suportar altas cargas com longevidade e zero dor.",
    keyTakeaways: [
      "Testes rápidos de mobilidade de tornozelo, quadril e ombro antes do treino",
      "Técnicas de ativação de estabilizadores profundos para proteger a coluna",
      "Manejo imediato de desconfortos tendíneos e estratégias preventivas",
    ],
  },
];

export const LOGISTICS_STEPS = [
  {
    step: "01",
    time: "07:30",
    title: "Chegada & Recepção Exclusiva",
    description: "Abertura dos portões do Centro de Convenções com Welcome Coffee premium, barista e primeiros encontros de networking.",
    details: "Estacionamento com serviço de valet no subsolo e acesso direto aos elevadores da ala Master.",
  },
  {
    step: "02",
    time: "07:45",
    title: "Leitura Instantânea do Voucher",
    description: "Apresente o QR Code do seu voucher digital no celular (ou impresso) em nossos totens de atendimento expresso.",
    details: "Leitores ópticos de alta velocidade validam sua inscrição em menos de 3 segundos, sem filas.",
  },
  {
    step: "03",
    time: "08:00",
    title: "Emissão & Entrega do Crachá Físico Nominal",
    description: "Retirada do seu crachá oficial personalizado com seu nome, empresa e credencial gravados em material de alta resistência.",
    details: "Acompanha cordão oficial do evento WORKSHOP - T-Forcetreining e Kit de Boas-Vindas executivo.",
  },
  {
    step: "04",
    time: "08:30",
    title: "Acesso à Plenária Principal",
    description: "Entrada liberada para a abertura solene com início pontual da primeira palestra magna às 08:45.",
    details: "Lugares confortáveis com conexão Wi-Fi dedicada e pontos de recarga para dispositivos.",
  },
];

export const TICKET_BENEFITS = [
  "Crachá físico nominal exclusivo com cordão oficial WORKSHOP - T-Forcetreining",
  "Acesso all-access às 6 palestras magnas e painéis de debate",
  "Welcome Coffee matinal + Estações contínuas de café especial",
  "Kit oficial do participante com bloco executivo e brindes selecionados",
  "Acesso ao Happy Hour de networking com open bar das 18h às 19h30",
  "Certificado digital oficial de participação (10 horas complementares)",
  "Gravação integral em 4K das 6 palestras com acesso liberado por 1 ano",
  "Entrada na comunidade exclusiva de participantes no Discord e WhatsApp",
];
