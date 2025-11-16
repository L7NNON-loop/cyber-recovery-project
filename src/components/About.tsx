import { Card } from "@/components/ui/card";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export const About = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <section className="py-12 px-2 sm:px-4">
      <div className="container mx-auto max-w-3xl px-2 sm:px-0">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
          O Que É o Mozbots?
        </h2>
        
        <Card className="bg-card border-primary/50 p-6 relative">
          <div className={`space-y-3 text-sm text-card-foreground/90 ${!isExpanded ? 'line-clamp-3' : ''}`}>
            <p>
              O <span className="text-primary font-semibold">Mozbots</span> é um sistema revolucionário de análise preditiva desenvolvido especificamente para o jogo <span className="text-primary font-semibold">Aviator</span>. Utilizando algoritmos de <span className="text-primary font-semibold">machine learning</span> e análise de padrões em tempo real, nosso robô identifica as melhores oportunidades de entrada e os momentos ideais para sacar seus ganhos.
            </p>
            
            <p>
              Ele analisa o Aviator em tempo real e mostra onde o Aviator vai cair com <span className="text-primary font-bold">100% de acerto</span>. Com uma interface intuitiva e atualização a cada segundo, você recebe sinais precisos sobre <span className="text-primary font-semibold">QUANDO entrar</span> e <span className="text-primary font-semibold">ONDE sacar</span>.
            </p>
          </div>
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-4 flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
          >
            {isExpanded ? (
              <>
                Ver menos <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Ver mais <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </Card>
      </div>
    </section>
  );
};
