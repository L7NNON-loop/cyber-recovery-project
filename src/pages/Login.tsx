import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, database } from "@/lib/firebase";
import { ref, get, update } from "firebase/database";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Verificar status do usuário
      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const userData = snapshot.val();
        
        // Verificar se os dados essenciais existem
        if (!userData || !userData.username || !userData.email) {
          await auth.signOut();
          toast({
            title: "Conta incompleta",
            description: "Sua conta não possui dados válidos. Contacte o suporte.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }
        
        // Verificar se o usuário está ativo e não expirado
        const expiryDate = new Date(userData.subscriptionExpiry);
        const now = new Date();
        
        if (expiryDate <= now) {
          await auth.signOut();
          navigate('/access-expired');
          return;
        }
        
        if (userData.statususer === false || userData.criadouser !== "true") {
          await auth.signOut();
          navigate('/user-disabled');
          return;
        }
        
        const loginHistory = userData.loginHistory || [];
        
        loginHistory.push({
          timestamp: new Date().toISOString(),
          ip: "N/A",
          device: navigator.userAgent
        });
        
        await update(userRef, {
          loginHistory: loginHistory,
          lastLogin: new Date().toISOString()
        });
      }
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao MozBots",
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Verifique suas credenciais",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 text-muted-foreground hover:text-primary"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground mb-1">Entrar</h2>
            <p className="text-sm text-muted-foreground">
              Entre com suas credenciais
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-secondary border-secondary text-foreground"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-secondary border-secondary text-foreground"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg h-12"
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/forgot-password')}
              className="text-sm text-muted-foreground hover:text-primary transition-colors mb-4 block mx-auto"
            >
              Esqueceu a senha?
            </button>
            <p className="text-sm text-foreground">
              Não tem uma conta?{" "}
              <button
                onClick={() => navigate('/register')}
                className="text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Registre-se
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
