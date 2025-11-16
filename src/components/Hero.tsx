import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();
  
  const scrollToVideo = () => {
    const videoSection = document.getElementById('video-section');
    if (videoSection) {
      videoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center pt-20 pb-12 px-3 sm:px-4">
      <div className="container mx-auto text-center max-w-4xl px-2 sm:px-0">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/50 bg-primary/10 mb-8">
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary font-medium">Inteligência Artificial Avançada</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          Domine o Aviator
        </h1>
        
        <p className="text-base md:text-lg text-muted-foreground mb-10 max-w-3xl mx-auto">
          O robô mostra onde o Aviator vai cair com <span className="text-primary font-bold">100% de acerto</span> usando IA avançada em tempo real
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-white px-8 text-base"
            onClick={() => navigate('/login')}
          >
            Começar Agora
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="border-border hover:bg-secondary text-base"
            onClick={scrollToVideo}
          >
            Ver como funciona
          </Button>
        </div>
      </div>
    </section>
  );
};
