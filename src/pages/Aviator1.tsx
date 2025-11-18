import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, database } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Aviator1 = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);
        
        if (!snapshot.exists()) {
          navigate("/login");
          return;
        }

        const userData = snapshot.val();
        const expiryDate = new Date(userData.subscriptionExpiry);
        const now = new Date();

        if (expiryDate <= now || userData.statususer === false) {
          navigate("/access-expired");
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold text-foreground mb-8">
          Robô Cyber Hacker
        </h1>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-muted-foreground">
            Funcionalidade do Cyber Hacker em desenvolvimento...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Aviator1;
