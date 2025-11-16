import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [authCode, setAuthCode] = useState("");

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.toLowerCase() === "milionário") {
      setStep(2);
    } else {
      toast({
        title: "Acesso negado",
        description: "Nome de usuário incorreto",
        variant: "destructive",
      });
    }
  };

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (fatherName.toLowerCase() === "marques") {
      setStep(3);
      toast({
        title: "Sucesso!",
        description: "Verificação 1 concluída",
      });
    } else {
      toast({
        title: "Acesso negado",
        description: "Resposta incorreta",
        variant: "destructive",
      });
    }
  };

  const handleStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    if (authCode.toUpperCase() === "MADARA") {
      toast({
        title: "Acesso concedido!",
        description: "Bem-vindo ao painel administrativo",
      });
      // Navigate to admin dashboard or show admin content
      setStep(4);
    } else {
      toast({
        title: "Acesso negado",
        description: "Código de autorização incorreto",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-2 py-8">
      <div className="w-full max-w-md">
        <div className="bg-card border border-primary rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-center text-foreground">Painel Administrativo</h1>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Verificação de segurança em {step} de 3
            </p>
          </div>

          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-foreground">
                  Nome de usuário
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Digite o nome de usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-secondary border-secondary text-foreground"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              >
                Próximo
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="fatherName" className="text-sm font-medium text-foreground">
                  Qual o nome do seu pai?
                </label>
                <Input
                  id="fatherName"
                  type="text"
                  placeholder="Digite o nome"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  required
                  className="w-full bg-secondary border-secondary text-foreground"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              >
                Próximo
              </Button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleStep3} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="authCode" className="text-sm font-medium text-foreground">
                  Qual o código de autorização?
                </label>
                <Input
                  id="authCode"
                  type="text"
                  placeholder="Digite o código"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  required
                  className="w-full bg-secondary border-secondary text-foreground"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              >
                Acessar
              </Button>
            </form>
          )}

          {step === 4 && (
            <div className="text-center space-y-4">
              <div className="p-6 bg-primary/10 rounded-lg">
                <h2 className="text-xl font-bold text-foreground mb-2">Acesso Concedido</h2>
                <p className="text-sm text-muted-foreground">
                  Bem-vindo ao painel administrativo do MozBots
                </p>
              </div>
              <Button
                onClick={() => navigate('/')}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Ir para página inicial
              </Button>
            </div>
          )}

          {step < 4 && (
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/')}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Voltar para página inicial
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
