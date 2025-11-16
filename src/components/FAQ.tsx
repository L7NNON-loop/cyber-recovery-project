import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Como funciona o robô?",
    answer: "O robô utiliza algoritmos de inteligência artificial e machine learning para analisar padrões do jogo Aviator em tempo real. Ele processa milhares de dados por segundo para identificar os melhores momentos de entrada e saída, fornecendo previsões precisas sobre onde o multiplicador vai cair."
  },
  {
    question: "O Robô é confiável?",
    answer: "Sim, o Mozbots é totalmente confiável. Nosso sistema já ajudou mais de 10.000 moçambicanos a maximizar seus ganhos no Aviator. Utilizamos tecnologia avançada de IA com taxa de acerto de 100% nas previsões, e oferecemos suporte 24/7 para todos os usuários."
  },
  {
    question: "Quanto custa o acesso ao robô?",
    answer: "Entre em contato conosco através do botão 'Começar Agora' para conhecer nossos planos e valores. Oferecemos diferentes opções de assinatura para atender às necessidades de todos os jogadores."
  },
  {
    question: "O sistema é compatível com qual casa de apostas?",
    answer: "O Mozbots é compatível com as principais casas de apostas que oferecem o jogo Aviator. Nosso sistema funciona perfeitamente com plataformas populares em Moçambique e internacionalmente."
  }
];

export const FAQ = () => {
  return (
    <section className="py-12 px-2 sm:px-4">
      <div className="container mx-auto max-w-3xl px-2 sm:px-0">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
          Perguntas Mais Frequentes
        </h2>
        
        <Accordion type="single" collapsible className="w-full space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-card border border-border rounded-lg px-4 sm:px-6 data-[state=open]:border-primary/50"
            >
              <AccordionTrigger className="text-left text-base font-semibold hover:text-primary hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              {faq.answer && (
                <AccordionContent className="text-sm text-muted-foreground pt-2">
                  {faq.answer}
                </AccordionContent>
              )}
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
