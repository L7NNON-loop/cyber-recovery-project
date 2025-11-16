import { Check } from "lucide-react";

const features = [
  {
    text: (
      <>
        <span className="text-primary font-bold">Mais de 10.000 moçambicanos</span> já estão faturando todos os dias usando o <span className="text-primary font-bold">MozBots</span>
      </>
    )
  },
  {
    text: (
      <>
        Sistema de <span className="text-primary font-bold">Inteligência Artificial</span> que analisa o Aviator em tempo real
      </>
    )
  },
  {
    text: (
      <>
        <span className="text-primary font-bold">100% de acerto</span> - o robô mostra exatamente onde o Aviator vai cair
      </>
    )
  },
  {
    text: (
      <>
        Suporte <span className="text-primary font-bold">24/24</span> para todos os usuários
      </>
    )
  }
];

export const Features = () => {
  return (
    <section className="py-12 px-2 sm:px-4">
      <div className="container mx-auto max-w-3xl px-2 sm:px-0">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
          Por que escolher o MozBots?
        </h2>
        
        <div className="border-2 border-primary rounded-2xl p-6 sm:p-8 bg-card/30">
          <div className="space-y-5">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm sm:text-base text-foreground leading-relaxed">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
