import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface BotCardProps {
  image: string;
  title: string;
  route: string;
}

export const BotCard = ({ image, title, route }: BotCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="relative group">
      <div className="bg-card border border-border rounded-lg p-4 hover:border-primary transition-all duration-300 overflow-hidden">
        <div className="relative w-full aspect-square mb-4 overflow-hidden rounded-md">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover relative z-10"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 z-20" />
        </div>
        <Button
          onClick={() => navigate(route)}
          className="w-full bg-primary hover:bg-primary/90"
        >
          Entrar
        </Button>
      </div>
    </div>
  );
};
