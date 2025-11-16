import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export const CTA = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-12 px-2 sm:px-4">
      <div className="container mx-auto max-w-3xl px-2 sm:px-0">
        <Card className="bg-card border-primary/50 p-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto Para Começar?
          </h2>
          <p className="text-base text-muted-foreground mb-6">
            Junte-se a centenas de jogadores que já estão maximizando seus ganhos no Aviator com IA
          </p>
          <Button 
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white px-10 text-base animate-glow"
            onClick={() => navigate('/login')}
          >
            Começar Agora
          </Button>
        </Card>
      </div>
    </section>
  );
};
