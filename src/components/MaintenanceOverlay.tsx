import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import cyberHacker from "@/assets/cyber-hacker.png";

interface MaintenanceOverlayProps {
  reason: string;
  message: string;
  endTime: string;
  imageUrl?: string;
}

export const MaintenanceOverlay = ({ reason, message, endTime, imageUrl }: MaintenanceOverlayProps) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endTime).getTime() - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft("Em breve");
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-lg">
      <div className="relative max-w-2xl w-full mx-4 bg-card/90 backdrop-blur-sm border-2 border-primary/50 rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-primary/30 shadow-lg">
            <img
              src={imageUrl || cyberHacker}
              alt="Robô em Manutenção"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>

          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-primary animate-pulse">
              🔧 Manutenção em Andamento
            </h1>
            
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {reason}
              </h2>
              <p className="text-muted-foreground">
                {message}
              </p>
            </div>

            <div className="bg-accent/20 border border-accent rounded-lg p-6">
              <p className="text-sm text-muted-foreground mb-2">
                Retorna em:
              </p>
              <p className="text-3xl font-bold text-primary font-mono">
                {timeLeft}
              </p>
            </div>
          </div>

          <Button
            onClick={() => navigate("/dashboard")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg"
          >
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};
