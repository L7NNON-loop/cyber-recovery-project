import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, database } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Mines = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedMines, setSelectedMines] = useState(3);
  const [countdown, setCountdown] = useState(0);
  const [grid, setGrid] = useState<boolean[]>(Array(25).fill(false));
  const [revealed, setRevealed] = useState(false);

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

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handlePredict = () => {
    if (countdown > 0) return;

    // Gerar grid aleatório com o número de minas selecionado
    const newGrid = Array(25).fill(false);
    const minePositions = new Set<number>();
    
    while (minePositions.size < selectedMines) {
      const pos = Math.floor(Math.random() * 25);
      minePositions.add(pos);
    }

    minePositions.forEach(pos => {
      newGrid[pos] = true;
    });

    setGrid(newGrid);
    setRevealed(true);
    setCountdown(30);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <h1 className="text-3xl font-bold text-center text-primary mb-6">
            Bot de Mines
          </h1>

          {/* Seletor de minas */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Quantidade de Minas
            </label>
            <div className="flex gap-3 justify-center">
              {[3, 6, 9].map((num) => (
                <Button
                  key={num}
                  variant={selectedMines === num ? "default" : "outline"}
                  onClick={() => setSelectedMines(num)}
                  className="w-20"
                >
                  {num}
                </Button>
              ))}
            </div>
          </div>

          {/* Grid de Mines */}
          <div className="grid grid-cols-5 gap-2 p-4 bg-background rounded-lg">
            {grid.map((isMine, index) => (
              <div
                key={index}
                className={cn(
                  "aspect-square rounded-md border-2 transition-all duration-300 flex items-center justify-center text-lg font-bold",
                  revealed
                    ? isMine
                      ? "bg-destructive/20 border-destructive"
                      : "bg-primary/20 border-primary"
                    : "bg-muted border-border"
                )}
              >
                {revealed && (isMine ? "💣" : "💎")}
              </div>
            ))}
          </div>

          {/* Botão Prever */}
          <Button
            onClick={handlePredict}
            disabled={countdown > 0}
            className="w-full h-12 text-lg font-semibold"
          >
            {countdown > 0 ? `Aguarde ${countdown}s` : "Prever"}
          </Button>

          {/* Texto de conexão */}
          <p className="text-center text-xs text-muted-foreground opacity-60">
            conectado elephantbet através de api/F*****#ga*****
          </p>
        </div>
      </div>
    </div>
  );
};

export default Mines;
