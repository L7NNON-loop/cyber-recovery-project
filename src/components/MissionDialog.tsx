import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Share2, CheckCircle2, Gift } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

interface MissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MissionDialog = ({ open, onOpenChange }: MissionDialogProps) => {
  const [shares, setShares] = useState(0);
  const totalShares = 7;
  const progress = (shares / totalShares) * 100;

  useEffect(() => {
    const savedShares = localStorage.getItem('mozbots-shares');
    if (savedShares) {
      setShares(parseInt(savedShares));
    }
  }, []);

  const handleShare = () => {
    if (shares >= totalShares) {
      toast({
        title: "Missão completa!",
        description: "Você já completou todos os compartilhamentos.",
      });
      return;
    }

    const shareUrl = window.location.origin;
    const shareText = `🚀 Descubra o *MozBots* - Sistema de IA para Aviator com 100% de acerto!\n\n${shareUrl}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
    
    const newShares = shares + 1;
    setShares(newShares);
    localStorage.setItem('mozbots-shares', newShares.toString());
    
    if (newShares >= totalShares) {
      toast({
        title: "🎉 Parabéns!",
        description: "Missão completa! Redirecionando...",
      });
      setTimeout(() => {
        window.location.href = "https://aviatorai-grok.vercel.app/";
      }, 2000);
    } else {
      toast({
        title: "Compartilhado!",
        description: `${newShares}/${totalShares} compartilhamentos concluídos`,
      });
    }
  };

  const handleClaimReward = () => {
    window.location.href = "https://aviatorai-grok.vercel.app/";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm bg-card border border-primary/30 rounded-[10px] p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2 text-foreground">
            <Gift className="w-5 h-5 text-primary" />
            Ganhe Acesso Grátis
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="text-center space-y-1">
            <p className="text-sm text-foreground">
              Compartilhe no WhatsApp e ganhe
            </p>
            <p className="text-base font-bold text-primary">
              Robô MozBots Gratuito
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-semibold text-primary">
                {shares}/{totalShares}
              </span>
            </div>
            
            <Progress value={progress} className="h-2" />
            
            <div className="flex gap-1 items-center justify-center">
              {Array.from({ length: totalShares }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i < shares ? "bg-primary" : "bg-muted-foreground/20"
                  }`}
                />
              ))}
            </div>
          </div>

          {shares >= totalShares ? (
            <Button
              onClick={handleClaimReward}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11"
            >
              <Gift className="w-4 h-4 mr-2" />
              Resgatar Agora
            </Button>
          ) : (
            <Button
              onClick={handleShare}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar no WhatsApp
            </Button>
          )}

          <div className="bg-muted/20 rounded-lg p-3 space-y-1.5">
            <p className="text-xs font-semibold text-foreground">
              Como funciona?
            </p>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              <li>• Compartilhe 7 vezes no WhatsApp</li>
              <li>• Progresso salvo automaticamente</li>
              <li>• Ganhe acesso gratuito ao robô!</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
