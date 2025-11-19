import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth, database } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { MaintenanceOverlay } from "@/components/MaintenanceOverlay";
import { strategies } from "@/data/strategies";
import { Plane, TrendingUp, Zap, Shield, Activity } from "lucide-react";

const Aviator2 = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedStrategy, setSelectedStrategy] = useState<string>("martingale");
  const [isActive, setIsActive] = useState(false);
  const [predictions, setPredictions] = useState<{ multiplier: number; confidence: number; timestamp: Date }[]>([]);
  const [currentMultiplier, setCurrentMultiplier] = useState<number | null>(null);
  const [maintenance, setMaintenance] = useState<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
        const maintenanceRef = ref(database, "maintenance/aviator2");
        const maintenanceSnapshot = await get(maintenanceRef);
        if (maintenanceSnapshot.exists()) {
          const maintenanceConfig = maintenanceSnapshot.val();
          if (maintenanceConfig.enabled === true) {
            setMaintenance(maintenanceConfig);
          }
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
    if (isActive) {
      const interval = setInterval(() => {
        generatePrediction();
      }, 8000 + Math.random() * 7000); // Entre 8-15 segundos

      return () => clearInterval(interval);
    }
  }, [isActive, selectedStrategy]);

  const generatePrediction = () => {
    const strategy = strategies.find(s => s.id === selectedStrategy);
    if (!strategy) return;

    // Gerar multiplicador baseado na estratégia
    let multiplier = 1.5 + Math.random() * 3.5; // Entre 1.5x e 5x
    let confidence = 70 + Math.random() * 25; // Entre 70% e 95%

    // Ajustar com base no risco da estratégia
    if (strategy.riskLevel === "Alto") {
      multiplier += Math.random() * 2; // Multiplicadores mais altos
      confidence -= 10; // Menor confiança
    } else if (strategy.riskLevel === "Baixo") {
      multiplier = Math.min(multiplier, 3); // Limitar multiplicadores
      confidence += 5; // Maior confiança
    }

    const prediction = {
      multiplier: parseFloat(multiplier.toFixed(2)),
      confidence: parseFloat(confidence.toFixed(1)),
      timestamp: new Date()
    };

    setPredictions(prev => [prediction, ...prev].slice(0, 10));
    setCurrentMultiplier(prediction.multiplier);

    toast({
      title: "🎯 Nova Entrada Detectada!",
      description: `Multiplicador: ${prediction.multiplier}x | Confiança: ${prediction.confidence}%`,
    });

    // Enviar comando para iframe (simulação)
    if (iframeRef.current) {
      try {
        iframeRef.current.contentWindow?.postMessage({
          type: 'AVIATOR_PREDICTION',
          data: prediction
        }, '*');
      } catch (e) {
        console.log("Iframe communication limited by CORS");
      }
    }
  };

  const handleToggleBot = () => {
    setIsActive(!isActive);
    if (!isActive) {
      toast({
        title: "🤖 Bot Ativado",
        description: `Estratégia ${strategies.find(s => s.id === selectedStrategy)?.name} iniciada`,
      });
      generatePrediction();
    } else {
      toast({
        title: "⏸️ Bot Pausado",
        description: "Previsões interrompidas",
      });
    }
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

  const selectedStrategyData = strategies.find(s => s.id === selectedStrategy);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-screen p-4">
        {/* Controles - Esquerda */}
        <div className="lg:col-span-1 space-y-4 overflow-y-auto">
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <Plane className="w-8 h-8 text-primary animate-pulse" />
              <h1 className="text-2xl font-bold text-foreground">
                Hacker Aviator
              </h1>
            </div>
            <Separator className="my-4" />

            {/* Status */}
            <div className={`p-4 rounded-lg mb-4 ${isActive ? 'bg-green-500/20 border border-green-500/50' : 'bg-muted/50'}`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Status:</span>
                <span className={`flex items-center gap-2 ${isActive ? 'text-green-500' : 'text-muted-foreground'}`}>
                  <Activity className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                  {isActive ? 'ATIVO' : 'INATIVO'}
                </span>
              </div>
            </div>

            {/* Seleção de Estratégia */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Estratégia de Apostas
              </h3>
              <div className="grid gap-2">
                {strategies.slice(0, 4).map((strategy) => (
                  <Button
                    key={strategy.id}
                    variant={selectedStrategy === strategy.id ? "default" : "outline"}
                    className={`w-full justify-start ${
                      selectedStrategy === strategy.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-primary/10'
                    }`}
                    onClick={() => setSelectedStrategy(strategy.id)}
                    disabled={isActive}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    {strategy.name}
                    <span className={`ml-auto text-xs px-2 py-1 rounded ${
                      strategy.riskLevel === 'Alto' ? 'bg-red-500/20 text-red-500' :
                      strategy.riskLevel === 'Médio' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-green-500/20 text-green-500'
                    }`}>
                      {strategy.riskLevel}
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Info da Estratégia */}
            {selectedStrategyData && (
              <Card className="mt-4 p-4 bg-muted/50">
                <h4 className="font-semibold mb-2">{selectedStrategyData.name}</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {selectedStrategyData.description}
                </p>
                <div className="text-xs space-y-1">
                  <div className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>{selectedStrategyData.pros[0]}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-500">✗</span>
                    <span>{selectedStrategyData.cons[0]}</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Botão de Ativação */}
            <Button
              onClick={handleToggleBot}
              className={`w-full mt-6 py-6 text-lg font-bold ${
                isActive 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-primary hover:bg-primary/90'
              }`}
            >
              <Zap className="w-5 h-5 mr-2" />
              {isActive ? 'PAUSAR BOT' : 'ATIVAR BOT'}
            </Button>
          </Card>

          {/* Previsão Atual */}
          {currentMultiplier && isActive && (
            <Card className="p-6 bg-gradient-to-br from-primary/20 to-primary/5 border-primary/50 animate-pulse">
              <h3 className="text-sm text-muted-foreground mb-2">Próxima Entrada:</h3>
              <div className="text-5xl font-bold text-primary">
                {currentMultiplier}x
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Entre antes deste multiplicador! 🎯
              </p>
            </Card>
          )}
        </div>

        {/* Iframe - Centro */}
        <div className="lg:col-span-2 rounded-xl overflow-hidden shadow-2xl border-2 border-primary/20">
          <iframe
            ref={iframeRef}
            src="https://www.placard.co.mz"
            className="w-full h-full"
            title="Placard Aviator"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            allow="fullscreen"
          />
        </div>
      </div>

      {/* Histórico de Previsões - Rodapé Fixo */}
      {predictions.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border p-4">
          <div className="container mx-auto">
            <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
              Últimas Previsões
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {predictions.map((pred, idx) => (
                <div
                  key={idx}
                  className="flex-shrink-0 bg-background border border-border rounded-lg p-3 min-w-[120px]"
                >
                  <div className="text-2xl font-bold text-primary">
                    {pred.multiplier}x
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {pred.confidence}% confiança
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Aviator2;
