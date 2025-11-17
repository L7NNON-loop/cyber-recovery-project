import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, database } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import { Home, User, Bot, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("home");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
          setUserData(snapshot.val());
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
        return (
          <div className="space-y-4">
            <button
              onClick={() => setActiveTab("estrategia")}
              className="text-xs text-primary hover:text-primary/80 mb-2"
            >
              ← Voltar
            </button>
            <h2 className="text-lg font-bold text-foreground">Estratégias de Jogo</h2>
            <div className="space-y-3">
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-foreground mb-2">Martingale</h3>
                <p className="text-xs text-muted-foreground">Estratégia clássica de progressão após perdas.</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-foreground mb-2">Fibonacci</h3>
                <p className="text-xs text-muted-foreground">Baseada na sequência de Fibonacci.</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-foreground mb-2">Anti-Martingale</h3>
                <p className="text-xs text-muted-foreground">Aumenta aposta após vitórias.</p>
              </div>
            </div>
          </div>
        );
      case "manual-100x":
        return (
          <div className="space-y-4">
            <button
              onClick={() => setActiveTab("estrategia")}
              className="text-xs text-primary hover:text-primary/80 mb-2"
            >
              ← Voltar
            </button>
            <h2 className="text-lg font-bold text-foreground">Manual dos 100x</h2>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">PDF será disponibilizado em breve.</p>
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
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-card border border-primary/20 rounded-lg shadow-lg px-2 py-2">
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
