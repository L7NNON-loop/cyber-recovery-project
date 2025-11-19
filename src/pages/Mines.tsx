import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, database } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import { Bomb, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MaintenanceOverlay } from "@/components/MaintenanceOverlay";

const Mines = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedMines, setSelectedMines] = useState(3);
  const [countdown, setCountdown] = useState(0);
  const [grid, setGrid] = useState<boolean[]>(Array(25).fill(false));
  const [revealed, setRevealed] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [maintenance, setMaintenance] = useState<any>(null);

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

        // Check maintenance status
        const maintenanceRef = ref(database, "maintenance/mines");
        const maintenanceSnapshot = await get(maintenanceRef);
        if (maintenanceSnapshot.exists() && maintenanceSnapshot.val().enabled) {
          setMaintenance(maintenanceSnapshot.val());
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

    setIsPredicting(true);
    setRevealed(false);

    setTimeout(() => {
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
      setIsPredicting(false);
      setCountdown(30);
    }, 1200);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Carregando...</div>
      </div>
    );
  }

  if (maintenance?.enabled) {
    return (
      <MaintenanceOverlay
        reason={maintenance.reason}
        message={maintenance.message}
        endTime={maintenance.endTime}
        imageUrl={maintenance.imageUrl}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-card border border-border rounded-lg p-6 space-y-6 shadow-lg">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Bot de Mines
            </h1>
            <p className="text-xs text-muted-foreground">Sistema de Previsão Avançado</p>
          </div>

          {/* Seletor de minas */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground block text-center">
              Quantidade de Minas
            </label>
            <div className="flex gap-3 justify-center">
              {[3, 6, 9].map((num) => (
                <Button
                  key={num}
                  variant={selectedMines === num ? "default" : "outline"}
                  onClick={() => setSelectedMines(num)}
                  disabled={isPredicting || countdown > 0}
                  className={cn(
                    "w-20 h-12 text-lg font-bold transition-all",
                    selectedMines === num && "ring-2 ring-primary/50"
                  )}
                >
                  {num}
                </Button>
              ))}
            </div>
          </div>

          {/* Grid de Mines */}
          <div className="relative">
            {isPredicting && (
              <div className="absolute inset-0 z-30 bg-background/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-medium text-primary">Analisando padrões...</p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-5 gap-2 p-4 bg-gradient-to-br from-background to-muted/20 rounded-xl border border-border/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-slide-in-right" />
              {grid.map((isMine, index) => (
                <div
                  key={index}
                  className={cn(
                    "aspect-square rounded-lg border-2 transition-all duration-500 flex items-center justify-center relative overflow-hidden",
                    "shadow-md hover:shadow-lg",
                    revealed
                      ? isMine
                        ? "bg-gradient-to-br from-destructive/30 to-destructive/10 border-destructive animate-fade-in"
                        : "bg-gradient-to-br from-primary/30 to-primary/10 border-primary animate-fade-in"
                      : "bg-gradient-to-br from-muted to-muted/50 border-border hover:border-primary/30"
                  )}
                  style={{ animationDelay: `${index * 20}ms` }}
                >
                  {revealed && (
                    isMine ? (
                      <Bomb className="w-6 h-6 text-destructive animate-scale-in" />
                    ) : (
                      <Gem className="w-6 h-6 text-primary animate-scale-in" />
                    )
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Botão Prever */}
          <Button
            onClick={handlePredict}
            disabled={countdown > 0 || isPredicting}
            className={cn(
              "w-full h-14 text-lg font-semibold transition-all shadow-lg",
              countdown > 0 ? "bg-muted" : "bg-gradient-to-r from-primary to-primary/80 hover:shadow-primary/50"
            )}
          >
            {isPredicting ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Prevendo...
              </span>
            ) : countdown > 0 ? (
              `Aguarde ${countdown}s`
            ) : (
              "Prever Posições"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Mines;
