import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, database } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import { Home, User, Bot, Trophy, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { strategies } from "@/data/strategies";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("home");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          
          // Verificar se os dados essenciais existem
          if (!data.username || !data.subscriptionExpiry) {
            await auth.signOut();
            toast({
              title: "Login Desabilitado",
              description: "Contacte o suporte.",
              variant: "destructive",
            });
            navigate('/login');
            return;
          }
          
          setUserData(data);
        } else {
          await auth.signOut();
          toast({
            title: "Login Desabilitado",
            description: "Contacte o suporte.",
            variant: "destructive",
          });
          navigate('/login');
        }
      } catch (error) {
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar seus dados",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, toast]);

  const renderContent = () => {
    switch (activeTab) {
      case "bots":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Bots</h2>
            <p className="text-sm text-muted-foreground">Em desenvolvimento...</p>
          </div>
        );
      case "estrategia":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">O que você deseja?</h2>
            <div className="grid gap-3">
              <button
                onClick={() => setActiveTab("estrategia-jogo")}
                className="bg-card border border-border rounded-lg p-4 text-left hover:bg-secondary/50 transition-all"
              >
                <h3 className="text-sm font-semibold text-foreground mb-1">Estratégia De Jogo</h3>
                <p className="text-xs text-muted-foreground">Martingale, Fibonacci e outras estratégias</p>
              </button>
              <button
                onClick={() => setActiveTab("manual-100x")}
                className="bg-card border border-border rounded-lg p-4 text-left hover:bg-secondary/50 transition-all"
              >
                <h3 className="text-sm font-semibold text-foreground mb-1">Manual dos 100x</h3>
                <p className="text-xs text-muted-foreground">Guia completo em PDF</p>
              </button>
            </div>
          </div>
        );
      case "estrategia-jogo":
        if (selectedStrategy) {
          const strategy = strategies.find(s => s.id === selectedStrategy);
          if (!strategy) return null;

          return (
            <div className="space-y-4">
              <button
                onClick={() => {
                  setSelectedStrategy(null);
                }}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80"
              >
                <ArrowLeft className="w-3 h-3" />
                Voltar
              </button>
              
              <div className="bg-card border border-border rounded-lg p-4 space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground mb-1">{strategy.name}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    strategy.riskLevel === "Alto" ? "bg-red-500/20 text-red-400" :
                    strategy.riskLevel === "Médio" ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-green-500/20 text-green-400"
                  }`}>
                    Risco {strategy.riskLevel}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Descrição</h3>
                  <p className="text-xs text-muted-foreground">{strategy.detailedDescription}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Como Usar</h3>
                  <ol className="list-decimal list-inside space-y-1">
                    {strategy.howToUse.map((step, i) => (
                      <li key={i} className="text-xs text-muted-foreground">{step}</li>
                    ))}
                  </ol>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Exemplo</h3>
                  <p className="text-xs text-muted-foreground bg-secondary/50 p-2 rounded">{strategy.example}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-green-400 mb-2">Vantagens</h3>
                    <ul className="space-y-1">
                      {strategy.pros.map((pro, i) => (
                        <li key={i} className="text-xs text-muted-foreground">• {pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-red-400 mb-2">Desvantagens</h3>
                    <ul className="space-y-1">
                      {strategy.cons.map((con, i) => (
                        <li key={i} className="text-xs text-muted-foreground">• {con}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-4">
            <button
              onClick={() => setActiveTab("estrategia")}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80"
            >
              <ArrowLeft className="w-3 h-3" />
              Voltar
            </button>
            <h2 className="text-lg font-bold text-foreground">Estratégias de Jogo</h2>
            <div className="grid gap-2">
              {strategies.map((strategy) => (
                <button
                  key={strategy.id}
                  onClick={() => setSelectedStrategy(strategy.id)}
                  className="bg-card border border-border rounded-lg p-3 text-left hover:bg-secondary/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-sm font-semibold text-foreground">{strategy.name}</h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      strategy.riskLevel === "Alto" ? "bg-red-500/20 text-red-400" :
                      strategy.riskLevel === "Médio" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-green-500/20 text-green-400"
                    }`}>
                      {strategy.riskLevel}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{strategy.description}</p>
                </button>
              ))}
            </div>
          </div>
        );
      case "manual-100x":
        return (
          <div className="space-y-4">
            <button
              onClick={() => setActiveTab("estrategia")}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80"
            >
              <ArrowLeft className="w-3 h-3" />
              Voltar
            </button>
            <h2 className="text-lg font-bold text-foreground">Manual dos 100x</h2>
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <object 
                data="/manual-100x.pdf#toolbar=1&navpanes=0&scrollbar=1" 
                type="application/pdf"
                className="w-full h-[75vh]"
                style={{
                  borderRadius: '6px',
                }}
              >
                <embed 
                  src="/manual-100x.pdf#toolbar=1&navpanes=0&scrollbar=1" 
                  type="application/pdf"
                  className="w-full h-[75vh]"
                  style={{
                    borderRadius: '6px',
                  }}
                />
              </object>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Bem-vindo ao MozBots</h2>
            {userData && (
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-sm text-foreground">Olá, <span className="text-primary font-semibold">{userData.username}</span>!</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Seu acesso expira em: {new Date(userData.subscriptionExpiry).toLocaleDateString('pt-MZ')}
                </p>
              </div>
            )}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="pb-20 px-4 py-6 max-w-4xl mx-auto">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg px-4 py-3 z-50">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "home" 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:text-primary hover:bg-secondary/50"
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="text-[10px] font-medium">Home</span>
          </button>

          <button
            onClick={() => setActiveTab("bots")}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "bots" 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:text-primary hover:bg-secondary/50"
            }`}
          >
            <Bot className="w-4 h-4" />
            <span className="text-[10px] font-medium">Bots</span>
          </button>

          <button
            onClick={() => setActiveTab("estrategia")}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "estrategia" || activeTab === "estrategia-jogo" || activeTab === "manual-100x"
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:text-primary hover:bg-secondary/50"
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span className="text-[10px] font-medium">Estratégia</span>
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all text-muted-foreground hover:text-primary hover:bg-secondary/50"
          >
            <User className="w-4 h-4" />
            <span className="text-[10px] font-medium">Perfil</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Dashboard;
