import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, database } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import { Home, User, Bot } from "lucide-react";
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
      case "profile":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Perfil</h2>
            <p className="text-muted-foreground">Em desenvolvimento...</p>
          </div>
        );
      case "bots":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Bots</h2>
            <p className="text-muted-foreground">Em desenvolvimento...</p>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Bem-vindo ao MozBots</h2>
            {userData && (
              <div className="bg-card border border-border rounded-xl p-6">
                <p className="text-lg text-foreground">Olá, <span className="text-primary font-bold">{userData.username}</span>!</p>
                <p className="text-sm text-muted-foreground mt-2">
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
      <main className="pb-24 px-4 py-8 max-w-4xl mx-auto">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-card border-2 border-primary/30 rounded-full shadow-lg px-4 py-3">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-full transition-all ${
              activeTab === "home" 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:text-primary"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs font-medium">Home</span>
          </button>

          <button
            onClick={() => setActiveTab("bots")}
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-full transition-all ${
              activeTab === "bots" 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:text-primary"
            }`}
          >
            <Bot className="w-5 h-5" />
            <span className="text-xs font-medium">Bots</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-full transition-all ${
              activeTab === "profile" 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:text-primary"
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-xs font-medium">Perfil</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Dashboard;
