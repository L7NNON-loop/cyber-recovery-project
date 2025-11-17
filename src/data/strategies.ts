export interface Strategy {
  id: string;
  name: string;
  description: string;
  detailedDescription: string;
  howToUse: string[];
  example: string;
  pros: string[];
  cons: string[];
  riskLevel: "Baixo" | "Médio" | "Alto";
}

export const strategies: Strategy[] = [
  {
    id: "martingale",
    name: "Martingale",
    description: "Estratégia clássica de progressão após perdas.",
    detailedDescription: "A estratégia Martingale consiste em dobrar a aposta após cada perda, retornando à aposta inicial após uma vitória. O objetivo é recuperar todas as perdas anteriores mais um lucro igual à aposta inicial.",
    howToUse: [
      "Comece com uma aposta base (ex: 10 MZN)",
      "Se perder, dobre a aposta (20 MZN)",
      "Continue dobrando após cada perda (40, 80, 160...)",
      "Após uma vitória, volte à aposta inicial",
      "Recomendado ter bankroll de pelo menos 10x a aposta inicial"
    ],
    example: "Aposta 1: 10 MZN (Perda) → Aposta 2: 20 MZN (Perda) → Aposta 3: 40 MZN (Vitória) = Lucro de 10 MZN",
    pros: [
      "Simples de entender e aplicar",
      "Recuperação rápida de perdas",
      "Funciona bem em sequências curtas"
    ],
    cons: [
      "Requer bankroll grande",
      "Risco de atingir limite da mesa",
      "Perdas longas podem ser devastadoras"
    ],
    riskLevel: "Alto"
  },
  {
    id: "fibonacci",
    name: "Fibonacci",
    description: "Baseada na sequência matemática de Fibonacci.",
    detailedDescription: "Esta estratégia utiliza a famosa sequência de Fibonacci (1, 1, 2, 3, 5, 8, 13, 21...) para determinar o valor das apostas. Após uma perda, avance na sequência; após uma vitória, retroceda dois números.",
    howToUse: [
      "Use a sequência: 1, 1, 2, 3, 5, 8, 13, 21, 34...",
      "Comece com a primeira unidade (ex: 10 MZN)",
      "Após perda, avance para o próximo número",
      "Após vitória, retroceda dois números",
      "Se estiver nos primeiros dois números, volte ao início"
    ],
    example: "10 (Perda) → 10 (Perda) → 20 (Perda) → 30 (Vitória) → retorna para 10",
    pros: [
      "Progressão mais lenta que Martingale",
      "Menor risco de grandes perdas",
      "Matemática comprovada"
    ],
    cons: [
      "Recuperação mais lenta",
      "Complexa para iniciantes",
      "Requer disciplina rigorosa"
    ],
    riskLevel: "Médio"
  },
  {
    id: "anti-martingale",
    name: "Anti-Martingale (Paroli)",
    description: "Aumenta aposta após vitórias, não após perdas.",
    detailedDescription: "Oposta à Martingale, esta estratégia dobra a aposta após vitórias e retorna à base após perdas. O objetivo é maximizar lucros durante sequências vencedoras.",
    howToUse: [
      "Defina aposta base (ex: 10 MZN)",
      "Após vitória, dobre a aposta",
      "Após perda, volte à aposta base",
      "Defina limite de dobras (geralmente 3-4)",
      "Após atingir limite, volte à base"
    ],
    example: "10 (Vitória) → 20 (Vitória) → 40 (Vitória) → volta para 10",
    pros: [
      "Aproveita sequências vencedoras",
      "Limita perdas durante má fase",
      "Menos arriscada que Martingale"
    ],
    cons: [
      "Lucros podem ser perdidos rapidamente",
      "Requer timing perfeito",
      "Difícil identificar fim da sequência"
    ],
    riskLevel: "Médio"
  },
  {
    id: "dalembert",
    name: "D'Alembert",
    description: "Progressão equilibrada e conservadora.",
    detailedDescription: "Sistema de progressão mais suave que aumenta a aposta em uma unidade após perda e diminui uma unidade após vitória. Baseado na teoria do equilíbrio.",
    howToUse: [
      "Defina unidade base (ex: 10 MZN)",
      "Após perda, adicione uma unidade",
      "Após vitória, subtraia uma unidade",
      "Nunca vá abaixo da aposta mínima",
      "Pare quando voltar à aposta base com lucro"
    ],
    example: "10 (Perda) → 20 (Perda) → 30 (Vitória) → 20 (Vitória) → 10",
    pros: [
      "Progressão suave e controlada",
      "Menos arriscada",
      "Boa para jogadores conservadores"
    ],
    cons: [
      "Recuperação lenta",
      "Lucros menores",
      "Requer muitas apostas"
    ],
    riskLevel: "Baixo"
  },
  {
    id: "labouchere",
    name: "Labouchere",
    description: "Sistema de cancelamento de números.",
    detailedDescription: "Crie uma sequência de números que somados resultam no lucro desejado. Aposte a soma dos números das extremidades. Cancele números quando ganhar, adicione quando perder.",
    howToUse: [
      "Crie sequência (ex: 1-2-3-4)",
      "Aposte soma das extremidades (1+4 = 5)",
      "Vitória: cancele extremidades (fica 2-3)",
      "Perda: adicione aposta no final (1-2-3-4-5)",
      "Complete quando cancelar todos números"
    ],
    example: "Sequência 1-2-3: Aposta 4 (1+3) → Vitória → Sequência fica 2",
    pros: [
      "Controle total sobre lucro alvo",
      "Flexível e personalizável",
      "Menos agressiva que Martingale"
    ],
    cons: [
      "Complexa para iniciantes",
      "Sequências longas possíveis",
      "Requer concentração"
    ],
    riskLevel: "Médio"
  },
  {
    id: "flat-betting",
    name: "Aposta Fixa",
    description: "Sempre aposte o mesmo valor.",
    detailedDescription: "A estratégia mais simples: aposte sempre o mesmo valor, independente de vitórias ou derrotas. Foca em gerenciamento de banca e disciplina.",
    howToUse: [
      "Defina % do bankroll (ex: 2-5%)",
      "Aposte sempre esse valor",
      "Nunca aumente por emoção",
      "Ajuste apenas quando bankroll mudar significativamente",
      "Foque em análise, não em sistema"
    ],
    example: "Bankroll 1000 MZN → Aposta sempre 20 MZN (2%)",
    pros: [
      "Zero estresse",
      "Máximo controle de perdas",
      "Fácil de manter disciplina"
    ],
    cons: [
      "Crescimento lento",
      "Menos emocionante",
      "Não recupera perdas rapidamente"
    ],
    riskLevel: "Baixo"
  },
  {
    id: "oscar-grind",
    name: "Oscar's Grind",
    description: "Progressão positiva conservadora.",
    detailedDescription: "Sistema de progressão lenta que visa lucro de uma unidade por ciclo. Aumenta aposta após vitória, mantém após perda até recuperar.",
    howToUse: [
      "Comece com uma unidade",
      "Após perda, mantenha a aposta",
      "Após vitória, aumente uma unidade",
      "Quando atingir lucro de uma unidade, reinicie",
      "Nunca aumente após perda"
    ],
    example: "10 (P) → 10 (P) → 10 (V) → 20 (V) → lucro atingido",
    pros: [
      "Baixo risco",
      "Lucros consistentes",
      "Proteção contra grandes perdas"
    ],
    cons: [
      "Lento para recuperar",
      "Requer paciência",
      "Lucros pequenos"
    ],
    riskLevel: "Baixo"
  },
  {
    id: "1-3-2-6",
    name: "Sistema 1-3-2-6",
    description: "Sequência fixa de progressão positiva.",
    detailedDescription: "Sistema de quatro apostas em sequência fixa. Projetado para maximizar vitórias consecutivas enquanto protege o bankroll.",
    howToUse: [
      "Primeira aposta: 1 unidade",
      "Se ganhar: 3 unidades",
      "Se ganhar novamente: 2 unidades",
      "Se ganhar de novo: 6 unidades",
      "Qualquer perda: volta ao início",
      "Após completar sequência: reinicia"
    ],
    example: "10 (V) → 30 (V) → 20 (V) → 60 (V) = Lucro de 120 MZN",
    pros: [
      "Protege lucros",
      "Simples de seguir",
      "Bom para sequências curtas"
    ],
    cons: [
      "Raro completar sequência",
      "Lucros podem desaparecer",
      "Requer disciplina para reiniciar"
    ],
    riskLevel: "Médio"
  }
];
