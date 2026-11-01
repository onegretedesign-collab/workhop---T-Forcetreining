export interface Speaker {
  id: string;
  name: string;
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
  tagline: "Tecnologia Disruptiva, Design Exponencial & Infraestrutura do Futuro",
  edition: "4ª Edição Oficial",
  date: "28 de Novembro de 2026",
  dayOfWeek: "Sábado",
  time: "Credenciamento às 07:30 · Encerramento às 19:30",
  venue: "Centro de Convenções WTC Events Center",
  address: "Av. das Nações Unidas, 12551 - Brooklin Novo, São Paulo - SP",
  price: 200.00,
  maxInstallments: 12,
  spotsLeft: 42,
  totalSpots: 500,
};

export const BANNER_PRESETS: BannerPreset[] = [
  {
    id: "preset-crimson-vortex",
    name: "Obsidian & Crimson Vortex (Padrão)",
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
    name: "Dra. Sofia Albuquerque",
    role: "VP de Inteligência Artificial & LLMs",
    company: "Neuralis Global Labs",
    time: "08:45 - 09:45",
    talkTitle: "Modelos de Raciocínio Autônomo e a Próxima Fronteira dos Agentes",
    category: "Inteligência Artificial",
    avatarSeed: "sofia",
    photoUrl: "https://i.postimg.cc/RFHCjzP6/Whats-App-Image-2026-10-26-at-21-01-41.jpg",
    accentColor: "#E50914",
    hookQuoteTop: "Modelos de Raciocínio com Propósito, Estratégia que entrega",
    hookQuoteHighlight: "Resultados.",
    bio: "Pioneira em pesquisa de modelos fundacionais na América Latina, doutora pelo MIT e ex-pesquisadora sênior em Silicon Valley. Lidera uma equipe de 80 engenheiros focados em raciocínio multi-etapas e alinhamento de agentes autônomos em ambientes de missão crítica.",
    talkDescription: "Como arquiteturas de cadeia de pensamento e planejamento auto-corretivo transformam fluxos corporativos reais. Demonstrações ao vivo de orquestração de enxames de agentes com tolerância a falhas e auditoria determinística.",
    keyTakeaways: [
      "Transição de LLMs puramente reativos para agentes orquestrados por objetivos",
      "Redução de 78% em alucinações através de validação baseada em grafos",
      "Padrões de governança e segurança para agentes com permissões de execução",
    ],
  },
  {
    id: "speaker-2",
    name: "Marcus Vinicius Prado",
    role: "Head of Product Design & Systems",
    company: "Vortex Design Studio",
    time: "10:00 - 11:00",
    talkTitle: "Design de Sistemas Exponenciais: Além do Glassmorphism e Telas Estáticas",
    category: "Design & UX",
    avatarSeed: "marcus",
    photoUrl: "https://i.postimg.cc/FRLF2QPY/MARCELO.jpg",
    accentColor: "#E50914",
    hookQuoteTop: "Design de Sistemas com Propósito é a diferença entre aparecer e",
    hookQuoteHighlight: "Impactar.",
    bio: "Mais de 15 anos desenhando produtos digitais usados por mais de 40 milhões de pessoas mensalmente. Especialista em microinterações cinemáticas, design tokens em escala corporativa e interfaces com altíssimo contraste funcional.",
    talkDescription: "Um manifesto prático contra interfaces genéricas e sem identidade. Como estruturar tipografia ousada, densidade matemática de informação e microinterações táteis de alta resposta para reter usuários exigentes.",
    keyTakeaways: [
      "A regra 60-30-10 aplicada a produtos digitais dark-mode premium",
      "Como desenhar para latência zero com transições de compositor",
      "Sistemas de design orientados a dados sem perder a assinatura autoral",
    ],
  },
  {
    id: "speaker-3",
    name: "Helena Siqueira",
    role: "Chief Information Security Officer (CISO)",
    company: "Aegis Cyber Defense",
    time: "11:15 - 12:15",
    talkTitle: "Engenharia de Resiliência: Criptografia Pós-Quântica na Nuvem",
    category: "Cibersegurança",
    avatarSeed: "helena",
    photoUrl: "https://i.postimg.cc/cJj49Jcv/DR-GUILHERME.jpg",
    accentColor: "#E50914",
    hookQuoteTop: "Sua arquitetura de segurança merece mais do que defesas, merece",
    hookQuoteHighlight: "Direção & Blindagem.",
    bio: "Reconhecida como uma das principais referências em segurança ofensiva e defesa de infraestruturas críticas. Consultora de bancos centrais e conselheira em iniciativas de proteção de dados e ciber-resiliência militar.",
    talkDescription: "A iminente quebra dos algoritmos RSA/ECC por computação quântica exige migração imediata. Apresentação dos padrões NIST pós-quânticos e como blindar APIs e chaves públicas corporativas hoje.",
    keyTakeaways: [
      "Mapeamento de riscos do ataque 'Harvest Now, Decrypt Later'",
      "Implementação prática dos algoritmos ML-KEM e ML-DSA em pipelines de CI/CD",
      "Resiliência operacional contra invasões de zero-day com isolamento de enclave",
    ],
  },
  {
    id: "speaker-4",
    name: "Rodrigo Takahashi",
    role: "Diretor de Arquitetura Distribuída & Edge",
    company: "Apex Cloud Infrastructure",
    time: "14:00 - 15:00",
    talkTitle: "Bancos Globais em Baixa Latência: A Nova Ordem da Infraestrutura Distribuída",
    category: "Cloud & Arquitetura",
    avatarSeed: "rodrigo",
    photoUrl: "https://i.postimg.cc/LX14rMyn/JERITON.jpg",
    accentColor: "#E50914",
    hookQuoteTop: "Infraestrutura Distribuída em escala é a diferença entre operar e",
    hookQuoteHighlight: "Liderar.",
    bio: "Engenheiro de infraestrutura que liderou migrações de escala petabyte em unicórnios de telecomunicações e streaming. Defensor ferrenho de arquiteturas auto-escaláveis com custos previsíveis e borda inteligente.",
    talkDescription: "Como desenhar sistemas distribuídos que operam em menos de 10ms globais sem perder consistência ACID. Análise de falhas reais em ambientes multi-cloud e técnicas de sobrevivência a partições de rede catastróficas.",
    keyTakeaways: [
      "Padrões de replicação multi-região com consistência eventual causal",
      "Edge computing vs. Datacenter central: onde realmente colocar a computação",
      "Otimização de custos de egress e governança de nós em escala",
    ],
  },
  {
    id: "speaker-5",
    name: "Beatriz Cavalcanti",
    role: "Diretora de Inovação & Ativos Digitais",
    company: "Horizon Financial Technologies",
    time: "15:15 - 16:15",
    talkTitle: "Finanças Conectadas: A Revolução do Real Digital (Drex) e Trilhos Rápidos",
    category: "Fintech & Web3",
    avatarSeed: "beatriz",
    photoUrl: "https://i.postimg.cc/4d94rT8H/NATHALIA.jpg",
    accentColor: "#E50914",
    hookQuoteTop: "Trilhos Financeiros Programáveis: A revolução entre transacionar e",
    hookQuoteHighlight: "Inovar.",
    bio: "Membro de grupos de trabalho técnicos para modernização do Sistema Financeiro Nacional. Liderou a implantação de transações Pix com liquidação sub-segundo e é co-autora de projetos-piloto de CBDC no Brasil.",
    talkDescription: "A fusão entre Open Finance, Pix Automático e Smart Contracts do Drex. Casos concretos de novos modelos de negócios que se tornam possíveis quando a liquidação financeira é programável nativamente.",
    keyTakeaways: [
      "Arquitetura de privacidade do Drex e conformidade com LGPD/Bacen",
      "Como o Pix programável substituirá assinaturas tradicionais de cartão",
      "Tokenização de recebíveis e ativos reais (RWA) com governança auditável",
    ],
  },
  {
    id: "speaker-6",
    name: "Gabriel Fontana",
    role: "Chief Data Scientist & Co-Fundador",
    company: "Axiom Analytics Group",
    time: "16:30 - 17:30",
    talkTitle: "Decisões Algorítmicas sob Incerteza Extrema: Métricas que Geram Caixa",
    category: "Data Science & Growth",
    avatarSeed: "gabriel",
    photoUrl: "https://i.postimg.cc/1tqRLZW5/IMG-3602-JPG.jpg",
    accentColor: "#E50914",
    hookQuoteTop: "Decisões Algorítmicas sob Incerteza: A métrica que realmente gera",
    hookQuoteHighlight: "Caixa.",
    bio: "Ex-líder de algoritmos de precificação dinâmica e alocação de risco. Mestre em Estatística Aplicada, autor de publicações sobre modelos bayesianos e consultor de conselhos de administração em estratégia data-driven.",
    talkDescription: "Por que 80% dos dashboards corporativos são descartáveis e como construir motores analíticos focados exclusivamente em lucro operacional e redução de churn sob cenários macroeconômicos voláteis.",
    keyTakeaways: [
      "Desmistificando métricas de vaidade em favor de margem de contribuição direta",
      "Modelagem bayesiana para tomada de decisão em mercados com poucas amostras",
      "Framework prático para conectar telemetria de produto a demonstrações de resultado",
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
