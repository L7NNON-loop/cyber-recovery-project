import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MissionDialog } from "@/components/MissionDialog";

const Register = () => {
  const navigate = useNavigate();
  const [showPricing, setShowPricing] = useState(true);
  const [showMission, setShowMission] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-2 py-8">
      <div className="w-full max-w-md">
        {showPricing ? (
          <div className="bg-card border border-border rounded-lg p-6">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 text-foreground hover:text-primary"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <div className="text-center mb-6">
              <h1 className="text-xl font-bold text-foreground mb-1">Plano de Assinatura</h1>
              <p className="text-sm text-muted-foreground">
                Acesso MozBots Premium
              </p>
            </div>

            <div className="border border-primary/50 rounded-xl p-4 mb-4 text-center bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="text-3xl font-bold text-primary mb-1">
                350<span className="text-lg">MT</span>
              </div>
              <p className="text-xs text-muted-foreground">
                por 2 dias de uso (48 horas)
              </p>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs">
                  <span className="text-primary font-semibold">Acesso por 48 horas (2 dias)</span>
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs">
                  Sinais em tempo real com <span className="text-primary font-semibold">100% de acerto</span>
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs">
                  Suporte <span className="text-primary font-semibold">24/24</span>
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs text-foreground">
                  Análise de padrões avançada com IA
                </p>
              </div>
            </div>

            <div className="bg-muted/30 border border-border rounded-lg p-3 mb-4">
              <p className="text-xs text-center text-foreground">
                O período de 48 horas começa após a confirmação do pagamento.
              </p>
            </div>

            <Button
              onClick={() => {
                setShowPricing(false);
                setFormData({ username: "", email: "", password: "" });
              }}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 mb-3"
            >
              Comprar Agora
            </Button>

            <button
              onClick={() => navigate('/')}
              className="text-xs text-primary hover:text-primary/80 transition-colors block mx-auto"
            >
              Voltar para a página inicial
            </button>

            <div className="mt-4 pt-4 border-t border-border">
              <Button
                onClick={() => setShowMission(true)}
                variant="outline"
                className="w-full border-primary/50 text-primary hover:bg-primary/10"
              >
                <Gift className="w-4 h-4 mr-2" />
                Obter Robô Gratuito
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-card border-2 border-primary/30 rounded-2xl p-6 sm:p-8 shadow-xl">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 text-muted-foreground hover:text-primary"
              onClick={() => setShowPricing(true)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <div className="text-center mb-6">
              <div className="inline-block bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl px-6 py-3 mb-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Criar Conta
                </h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Preencha os dados para finalizar o registro
              </p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              navigate('/checkout', { state: { formData } });
            }} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-foreground flex items-center gap-2">
                  Nome de Usuário
                </label>
                <input
                  id="username"
                  type="text"
                  className="w-full h-11 px-4 py-2 bg-secondary/50 border-2 border-border hover:border-primary/50 focus:border-primary rounded-xl text-foreground transition-colors"
                  placeholder="Seu nome de usuário"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-2">
                  Email do Usuário
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full h-11 px-4 py-2 bg-secondary/50 border-2 border-border hover:border-primary/50 focus:border-primary rounded-xl text-foreground transition-colors"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground flex items-center gap-2">
                  Senha do Usuário
                </label>
                <input
                  id="password"
                  type="password"
                  className="w-full h-11 px-4 py-2 bg-secondary/50 border-2 border-border hover:border-primary/50 focus:border-primary rounded-xl text-foreground transition-colors"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold text-lg h-12 rounded-xl shadow-lg hover:shadow-primary/50 transition-all"
              >
                Continuar para Pagamento
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-foreground">
              Já tem uma conta?{" "}
              <button
                onClick={() => navigate('/login')}
                className="text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Entrar
              </button>
            </p>
          </div>
        )}
      </div>

      <MissionDialog open={showMission} onOpenChange={setShowMission} />
    </div>
  );
};

export default Register;
