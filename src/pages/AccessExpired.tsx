import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AccessExpired = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-card border-2 border-destructive/50 rounded-lg p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Acesso Expirado
            </h1>
            <p className="text-muted-foreground">
              Seu acesso expirou. Por favor, renove sua assinatura para continuar usando o sistema.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={() => navigate("/register")}
              className="w-full"
            >
              Registrar Novamente
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="w-full"
            >
              Voltar para Início
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessExpired;
