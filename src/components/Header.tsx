import { Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const navigate = useNavigate();
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-3 sm:px-4 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center">
            <Plane className="w-8 h-8 text-primary" />
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-foreground hover:text-primary hover:bg-transparent"
              onClick={() => navigate('/login')}
            >
              Entrar
            </Button>
            <Button 
              size="sm" 
              className="bg-primary hover:bg-primary/90 text-white px-6"
              onClick={() => navigate('/login')}
            >
              Registre-se
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
};
