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
  checkoutUrl: "https://mpago.li/2jW7NJq",
};

export const BANNER_PRESETS: BannerPreset[] = [
  {
    id: "preset-dragon-official",
    name: "Banner Oficial - Performance 360º",
    description: "Arte oficial do WORKSHOP - T-Forcetreining Dragon Gym com todos os palestrantes.",
    url: "https://i.postimg.cc/LsN91H0k/BANNER-SITE-WOHRSHOP-DRAGON.png",
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
    role: "Personal especialista em hipertrofia",
    company: "Personal especialista em hipertrofia",
    time: "08:45 - 09:45",
    talkTitle: "Além das Repetições",
    category: "Treinamento & Força",
    avatarSeed: "tiago",
    photoUrl: "https://i.postimg.cc/RFHCjzP6/Whats-App-Image-2026-10-26-at-21-01-41.jpg",
    accentColor: "#E50914",
    hookQuoteTop: "Metodologia com Propósito, Estratégia que entrega",
    hookQuoteHighlight: "Resultados Máximos.",
    bio: "Fundador da T-Force Training e treinador de referência em alta performance. Especialista em biomecânica aplicada ao treinamento resistido, prescrição de força e evolução estrutural contínua de atletas e praticantes avançados.",
    talkDescription: "O que diferencia um treinador comum de um profissional de excelência. Da ciência à prática: conhecimento, estratégia e resultados consistentes de alta densidade.",
    keyTakeaways: [
      "O que diferencia um treinador comum de um profissional de excelência",
      "Da ciência à prática: conhecimento, estratégia e resultados de alta performance",
    ],
  },
  {
    id: "speaker-2",
    name: "Marcelo",
    instagram: "@Marcellaojr",
    role: "Atleta Fisioculturismo + de X títulos",
    company: "Atleta Fisioculturismo + de X títulos",
    time: "10:00 - 11:00",
    talkTitle: "Apresentação sobre sua Trajetória e as Dificuldades até Chegar no Palco",
    category: "Fisiologia & Performance",
    avatarSeed: "marcelo",
    photoUrl: "https://i.postimg.cc/FRLF2QPY/MARCELO.jpg",
    accentColor: "#E50914",
    hookQuoteTop: "Treinamento Avançado com Ciência e Prática para",
    hookQuoteHighlight: "Resultados Reais.",
    bio: "Treinador com ampla experiência em condicionamento físico avançado, periodização e superação de limites. Especialista em métodos de intensificação e resposta metabólica.",
    talkDescription: "Além de contar sua trajetória no fisiculturismo de alto nível, também contará sobre as dificuldades, renúncias e bastidores reais até chegar no palco, a superação de limites e a conquista de mais de X títulos.",
    keyTakeaways: [
      "Trajetória no fisiculturismo e superação de limites",
      "As dificuldades, renúncias e bastidores até chegar no palco",
      "Disciplina de atleta de elite e rotina para múltiplos títulos",
    ],
  },
  {
    id: "speaker-3",
    name: "Dr Guilherme Silverio",
    instagram: "@dr.guilhermesilverio",
    role: "Reposição Hormonal/ Emagrecimento e Nutroterapia",
    company: "Reposição Hormonal/ Emagrecimento e Nutroterapia",
    time: "11:15 - 12:15",
    talkTitle: "Nutrologia & Reposição Hormonal",
    category: "Medicina Esportiva",
    avatarSeed: "guilherme",
    photoUrl: "https://i.postimg.cc/cJj49Jcv/DR-GUILHERME.jpg",
    accentColor: "#E50914",
    hookQuoteTop: "Saúde e Performance Integradas para uma Vida com",
    hookQuoteHighlight: "Máxima Vitalidade.",
    bio: "Médico especialista em medicina esportiva, modulação metabólica e longevidade. Auxilia atletas e entusiastas a alcançarem sua melhor versão física mantendo a saúde cardiovascular e hormonal blindada.",
    talkDescription: "NUTROLOGIA: Foco em Performance e Hipertrofia, Emagrecimento e Definição, Saúde, Longevidade e Qualidade de Vida. REPOSIÇÃO HORMONAL: Bem-Estar Geral e Longevidade.",
    keyTakeaways: [
      "NUTROLOGIA: Foco em Performance, Hipertrofia, Emagrecimento e Definição",
      "REPOSIÇÃO HORMONAL: Bem-Estar Geral, Longevidade e Qualidade de Vida",
    ],
  },
  {
    id: "speaker-4",
    name: "Jeriton",
    instagram: "@jeritonperformance",
    role: "Analista do movimento/ Prevenção/ Performance e Retorno ao Esporte com segurança",
    company: "Analista do movimento/ Prevenção/ Performance e Retorno ao Esporte com segurança",
    time: "14:00 - 15:00",
    talkTitle: "Do Laboratório ao Campo: o que realmente funciona na preparação física de atletas profissionais",
    category: "Biomecânica & Performance",
    avatarSeed: "jeriton",
    photoUrl: "https://i.postimg.cc/LX14rMyn/JERITON.jpg",
    accentColor: "#E50914",
    hookQuoteTop: "Precisão Técnica e Disciplina: A chave para",
    hookQuoteHighlight: "Construir Campeões.",
    bio: "Treinador e consultor esportivo focado em biomecânica de precisão, postura sob carga e desenvolvimento muscular simétrico. Prepara atletas e praticantes dedicados à evolução constante.",
    talkDescription: "O que realmente funciona na preparação física de atletas profissionais. Análise prática de biomecânica, prevenção, performance e retorno seguro ao esporte em alto rendimento.",
    keyTakeaways: [
      "Do laboratório ao campo: métodos validados na prática de atletas de elite",
      "Prevenção, análise do movimento e retorno seguro ao esporte",
    ],
  },
  {
    id: "speaker-5",
    name: "Nathálya Souza",
    instagram: "@nutrinathalyasouza",
    role: "Nutricionista",
    company: "Nutricionista",
    time: "15:15 - 16:15",
    talkTitle: "Hipertrofia Muscular: Mitos, Verdades e Abordagens Atuais",
    category: "Nutrição Esportiva",
    avatarSeed: "nathalya",
    photoUrl: "https://i.postimg.cc/4d94rT8H/NATHALIA.jpg",
    accentColor: "#E50914",
    hookQuoteTop: "Nutrição com Base Científica para Potencializar seu",
    hookQuoteHighlight: "Metabolismo e Ganho.",
    bio: "Nutricionista clínica e esportiva, referência em emagrecimento definitivo, recomposição corporal e hipertrofia. Especialista em estratégias alimentares sustentáveis e de alto rendimento.",
    talkDescription: "Uma abordagem atualizada sobre a nutrição voltada à hipertrofia muscular. Desmistificando condutas nutricionais, suplementação eficaz e estratégias práticas para resultados acelerados.",
    keyTakeaways: [
      "Uma abordagem atualizada sobre a nutrição voltada à hipertrofia",
      "Mitos, verdades e evidências científicas na dieta de ganho muscular",
    ],
  },
  {
    id: "speaker-6",
    name: "Dra Leiliara Borges",
    instagram: "@dra.leiliaraborges",
    role: "Fisioterapia Ortopédica Esportiva e Funcional",
    company: "Fisioterapia Ortopédica Esportiva e Funcional",
    time: "16:30 - 17:30",
    talkTitle: "Lesões na Musculação: Prevenção, Saúde e Performance — Da Fisioterapia à Academia",
    category: "Fisioterapia & Saúde",
    avatarSeed: "leiliara",
    photoUrl: "https://i.postimg.cc/1tqRLZW5/IMG-3602-JPG.jpg",
    accentColor: "#E50914",
    hookQuoteTop: "Movimento Livre de Dores: Fortaleça sua estrutura e",
    hookQuoteHighlight: "Treine sem Limites.",
    bio: "Fisioterapeuta com ampla atuação em ortopedia e fisioterapia esportiva. Dedicada à reabilitação e prevenção de lesões musculoesqueléticas em atletas de musculação e modalidades de força.",
    talkDescription: "Lesões na musculação: prevenção, saúde e performance — da fisioterapia à academia. Abordagem prática sobre dores e lesões comuns, fatores de sobrecarga e estratégias de reabilitação no treino pesado.",
    keyTakeaways: [
      "Principais dores e lesões em praticantes de musculação",
      "Fatores associados às lesões e à sobrecarga no treinamento",
      "Prevenção e reabilitação: da fisioterapia à academia",
    ],
  },
];

export const LOGISTICS_STEPS = [
  {
    step: "01",
    time: "14:00",
    title: "CHEGADA E RECEPÇÃO EXCLUSIVA",
    description: "Abertura dos portões da Academia dragon as 14hs, para momentos de network e troca de conhecimentos.",
  },
  {
    step: "02",
    time: "14:20",
    title: "RECEPÇÃO E CREDENCIAMENTO",
    description: "As 14:20, Retirada do seu crachás oficial personalizado com seu nome, empresa e credencial.",
  },
  {
    step: "03",
    time: "15:00",
    title: "ESCOLHA O MELHOR LUGAR E VIVA ESSA EXPERIÊNCIA",
    description: "15hs Daremos início ás palestras. E esperamos que viva o extraordinário e que destrave o que te prende de elevar seu próximo nível.",
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
