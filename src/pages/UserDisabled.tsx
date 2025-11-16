import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserDisabled = () => {
  const navigate = useNavigate();
  const whatsappNumber = "+258871009140";

  const handleWhatsAppContact = () => {
    window.open(`https://wa.me/${whatsappNumber.replace('+', '')}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-card border-2 border-destructive/50 rounded-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="w-10 h-10 text-destructive" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Usuário Desativado
          </h1>
          
          <p className="text-muted-foreground mb-6">
            Sua conta foi desativada. Para mais informações, entre em contato com o suporte.
          </p>
          
          <div className="space-y-3">
            <Button
              onClick={handleWhatsAppContact}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Contactar Suporte via WhatsApp
            </Button>
            
            <p className="text-sm text-muted-foreground">
              Suporte: {whatsappNumber}
            </p>
            
            <Button
              variant="outline"
              onClick={() => navigate('/')}
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

export default UserDisabled;
