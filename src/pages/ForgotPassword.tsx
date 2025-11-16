import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha",
      });
      navigate('/login');
    } catch (error: any) {
      toast({
        title: "Erro ao enviar email",
        description: error.message || "Verifique o email informado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-2 py-8">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 text-muted-foreground hover:text-primary"
          onClick={() => navigate('/login')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="bg-card border border-primary rounded-2xl p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">MozBots</h1>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">Esqueceu a senha?</h2>
            <p className="text-sm text-muted-foreground">
              Digite seu email para receber instruções de redefinição de senha
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-secondary border-secondary text-foreground"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg h-12"
            >
              {loading ? "Enviando..." : "Enviar Email"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Voltar para o login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
