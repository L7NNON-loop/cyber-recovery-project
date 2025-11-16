import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, database } from "@/lib/firebase";
import { ref, get, update } from "firebase/database";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, Mail, Calendar, Smartphone, History, Lock, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [changingPassword, setChangingPassword] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
          description: "Não foi possível carregar suas informações",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, toast]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "❌ Senhas não coincidem",
        description: "A nova senha e a confirmação devem ser iguais",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "❌ Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setChangingPassword(true);

    try {
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error("Usuário não autenticado");

      // Reautenticar usuário
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Atualizar senha
      await updatePassword(user, newPassword);

      toast({
        title: "✅ Senha alterada!",
        description: "Sua senha foi atualizada com sucesso",
      });

      // Limpar campos
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error);
      toast({
        title: "❌ Erro ao alterar senha",
        description: error.code === "auth/wrong-password" 
          ? "Senha atual incorreta" 
          : "Erro ao processar. Tente novamente",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-MZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Carregando perfil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 text-muted-foreground hover:text-primary rounded-lg"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Dashboard
        </Button>

        <div className="space-y-6">
          {/* Profile Info Card */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Informações do Perfil
              </CardTitle>
              <CardDescription>Seus dados de cadastro e assinatura</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nome de Usuário
                  </Label>
                  <div className="p-3 bg-secondary/50 rounded-lg border border-border">
                    <p className="text-foreground font-medium">{userData?.username}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <div className="p-3 bg-secondary/50 rounded-lg border border-border">
                    <p className="text-foreground font-medium">{userData?.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Telefone M-Pesa
                  </Label>
                  <div className="p-3 bg-secondary/50 rounded-lg border border-border">
                    <p className="text-foreground font-medium">{userData?.phoneNumber}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Data de Cadastro
                  </Label>
                  <div className="p-3 bg-secondary/50 rounded-lg border border-border">
                    <p className="text-foreground font-medium">
                      {userData?.createdAt ? formatDate(userData.createdAt) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status da Assinatura</p>
                    <p className="text-lg font-bold text-primary">
                      {userData?.subscriptionDays} dias de acesso
                    </p>
                  </div>
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Expira em: {userData?.subscriptionExpiry ? formatDate(userData.subscriptionExpiry) : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                Alterar Senha
              </CardTitle>
              <CardDescription>Atualize sua senha de acesso</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Senha Atual</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Digite sua senha atual"
                    required
                    className="bg-secondary/50 border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Digite a nova senha (mín. 6 caracteres)"
                    required
                    className="bg-secondary/50 border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Digite a nova senha novamente"
                    required
                    className="bg-secondary/50 border-border"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={changingPassword}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
                >
                  {changingPassword ? "Alterando..." : "Alterar Senha"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Login History Card */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Histórico de Login
              </CardTitle>
              <CardDescription>Últimas atividades na sua conta</CardDescription>
            </CardHeader>
            <CardContent>
              {userData?.loginHistory && userData.loginHistory.length > 0 ? (
                <div className="space-y-3">
                  {userData.loginHistory.slice(-5).reverse().map((login: any, index: number) => (
                    <div key={index} className="p-3 bg-secondary/30 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-foreground">Login #{userData.loginHistory.length - index}</p>
                        <span className="text-xs text-primary">
                          {login.timestamp ? formatDate(login.timestamp) : 'N/A'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        IP: {login.ip || 'N/A'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        Device: {login.device ? login.device.substring(0, 50) + '...' : 'N/A'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum histórico de login disponível
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
