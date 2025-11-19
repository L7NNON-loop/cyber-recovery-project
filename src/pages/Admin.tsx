import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { database } from "@/lib/firebase";
import { ref, get, set, update } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import { Search, UserPlus, Edit2, Ban, CheckCircle, Shield, ArrowLeft, Wrench, Palette } from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { validateAdminCode } from "@/lib/auth-config";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface User {
  uid: string;
  username: string;
  email: string;
  phoneNumber: string;
  statususer: string;
  criadouser: string;
  bairro: string;
  subscriptionDays: number;
  subscriptionExpiry: string;
  createdAt: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    bairro: "",
    subscriptionDays: 2
  });

  const [editData, setEditData] = useState({
    bairro: "",
    subscriptionDays: 0
  });

  // Maintenance state
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [maintenanceData, setMaintenanceData] = useState({
    enabled: false,
    target: "aviator2", // aviator1, aviator2, mines, all
    reason: "Melhorias no Sistema",
    message: "Estamos realizando manutenções para melhorar sua experiência.",
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    imageUrl: ""
  });

  // Customization state
  const [showCustomization, setShowCustomization] = useState(false);
  const [customFont, setCustomFont] = useState({
    enabled: false,
    fontFamily: "Inter"
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadUsers();
      loadMaintenanceSettings();
      loadCustomization();
    }
  }, [isAuthenticated]);

  const loadMaintenanceSettings = async () => {
    try {
      const maintenanceRef = ref(database, "maintenance");
      const snapshot = await get(maintenanceRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Load the most recent maintenance config
        if (data.aviator2) setMaintenanceData(prev => ({ ...prev, ...data.aviator2, target: "aviator2" }));
      }
    } catch (error) {
      console.error("Error loading maintenance:", error);
    }
  };

  const loadCustomization = async () => {
    try {
      const customRef = ref(database, "customization");
      const snapshot = await get(customRef);
      if (snapshot.exists()) {
        setCustomFont(snapshot.val().font || customFont);
      }
    } catch (error) {
      console.error("Error loading customization:", error);
    }
  };

  const handleSaveMaintenance = async () => {
    try {
      const targets = maintenanceData.target === "all" 
        ? ["aviator1", "aviator2", "mines"] 
        : [maintenanceData.target];

      for (const target of targets) {
        await set(ref(database, `maintenance/${target}`), {
          enabled: maintenanceData.enabled,
          reason: maintenanceData.reason,
          message: maintenanceData.message,
          endTime: maintenanceData.endTime,
          imageUrl: maintenanceData.imageUrl
        });
      }

      toast({
        title: "Manutenção Atualizada",
        description: `Configurações salvas para ${maintenanceData.target}`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar configurações",
        variant: "destructive",
      });
    }
  };

  const handleSaveCustomization = async () => {
    try {
      await set(ref(database, "customization/font"), customFont);
      
      // Apply font to document
      if (customFont.enabled) {
        document.documentElement.style.fontFamily = customFont.fontFamily;
      } else {
        document.documentElement.style.fontFamily = "";
      }

      toast({
        title: "Customização Salva",
        description: "Fonte personalizada atualizada",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar customização",
        variant: "destructive",
      });
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateAdminCode(authCode)) {
      setIsAuthenticated(true);
      toast({
        title: "Acesso concedido!",
        description: "Bem-vindo ao painel administrativo",
      });
    } else {
      toast({
        title: "Acesso negado",
        description: "Código de autorização incorreto",
        variant: "destructive",
      });
    }
  };

  const loadUsers = async () => {
    try {
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const now = new Date();
        
        // Verificar e desativar usuários expirados
        for (const uid in usersData) {
          const user = usersData[uid];
          if (user.subscriptionExpiry) {
            const expiryDate = new Date(user.subscriptionExpiry);
            if (expiryDate <= now && user.statususer !== false) {
              await update(ref(database, `users/${uid}`), {
                statususer: false
              });
              usersData[uid].statususer = false;
            }
          }
        }
        
        const usersList = Object.keys(usersData).map(uid => ({
          uid,
          ...usersData[uid]
        }));
        setUsers(usersList);
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newUser.email,
        newUser.password
      );

      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + newUser.subscriptionDays);

      await set(ref(database, `users/${userCredential.user.uid}`), {
        username: newUser.username,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        bairro: newUser.bairro,
        subscriptionExpiry: expirationDate.toISOString(),
        subscriptionDays: newUser.subscriptionDays,
        createdAt: new Date().toISOString(),
        statususer: true,
        criadouser: "true",
        paymentAmount: 350,
        transactionId: "ADMIN_CREATED",
        loginHistory: []
      });

      toast({
        title: "Usuário criado com sucesso!",
        description: `${newUser.username} foi adicionado ao sistema`,
      });

      setShowAddUser(false);
      setNewUser({
        username: "",
        email: "",
        password: "",
        phoneNumber: "",
        bairro: "",
        subscriptionDays: 2
      });
      loadUsers();
    } catch (error: any) {
      toast({
        title: "Erro ao criar usuário",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (uid: string, currentStatus: any) => {
    try {
      const newStatus = currentStatus ? false : true;
      await update(ref(database, `users/${uid}`), {
        statususer: newStatus
      });

      toast({
        title: "Status atualizado!",
        description: `Usuário ${newStatus ? "ativado" : "desativado"} com sucesso`,
      });
      loadUsers();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditUser = async (uid: string) => {
    try {
      const updates: any = {
        bairro: editData.bairro
      };

      if (editData.subscriptionDays > 0) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + editData.subscriptionDays);
        updates.subscriptionExpiry = expirationDate.toISOString();
        updates.subscriptionDays = editData.subscriptionDays;
        updates.statususer = true; // Reativar ao renovar
      }

      await update(ref(database, `users/${uid}`), updates);

      toast({
        title: "Usuário atualizado!",
        description: "Dados atualizados com sucesso",
      });

      setEditingUser(null);
      setEditData({ bairro: "", subscriptionDays: 0 });
      loadUsers();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 text-muted-foreground hover:text-primary"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-center text-foreground">Admin</h1>
              <p className="text-xs text-muted-foreground text-center mt-1">
                Acesso restrito - Código necessário
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="authCode" className="text-sm font-medium text-foreground">
                  Código de Autorização
                </label>
                <Input
                  id="authCode"
                  type="password"
                  placeholder="Digite o código"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  required
                  className="w-full bg-secondary border-secondary text-foreground"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              >
                Entrar
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Painel Admin</h1>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>

        <div className="grid gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-card border-border"
              />
            </div>
            <Button
              onClick={() => setShowAddUser(!showAddUser)}
              className="bg-primary hover:bg-primary/90"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Adicionar Usuário
            </Button>
          </div>

          {showAddUser && (
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Novo Usuário</h3>
              <form onSubmit={handleAddUser} className="grid gap-3">
                <Input
                  placeholder="Nome de usuário"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  required
                  className="bg-secondary border-secondary text-sm"
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                  className="bg-secondary border-secondary text-sm"
                />
                <Input
                  type="password"
                  placeholder="Senha"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                  className="bg-secondary border-secondary text-sm"
                />
                <Input
                  placeholder="Telefone"
                  value={newUser.phoneNumber}
                  onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
                  required
                  className="bg-secondary border-secondary text-sm"
                />
                <Input
                  placeholder="Bairro"
                  value={newUser.bairro}
                  onChange={(e) => setNewUser({ ...newUser, bairro: e.target.value })}
                  className="bg-secondary border-secondary text-sm"
                />
                <Input
                  type="number"
                  placeholder="Dias de assinatura"
                  value={newUser.subscriptionDays}
                  onChange={(e) => setNewUser({ ...newUser, subscriptionDays: parseInt(e.target.value) })}
                  required
                  className="bg-secondary border-secondary text-sm"
                />
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-sm">
                    Criar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddUser(false)}
                    className="text-sm"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Maintenance Section */}
          <Card className="p-6 bg-card/80 backdrop-blur-sm">
            <Button
              onClick={() => setShowMaintenance(!showMaintenance)}
              variant="outline"
              className="w-full justify-start mb-4"
            >
              <Wrench className="w-4 h-4 mr-2" />
              Gerenciar Manutenção
            </Button>

            {showMaintenance && (
              <div className="space-y-4 mt-4">
                <Separator />
                
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Status da Manutenção</label>
                    <Button
                      variant={maintenanceData.enabled ? "destructive" : "default"}
                      size="sm"
                      onClick={() => setMaintenanceData({ ...maintenanceData, enabled: !maintenanceData.enabled })}
                    >
                      {maintenanceData.enabled ? "Desativar" : "Ativar"}
                    </Button>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Aplicar Em:</label>
                    <Select
                      value={maintenanceData.target}
                      onValueChange={(value) => setMaintenanceData({ ...maintenanceData, target: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aviator1">Robô Cyber Hacker</SelectItem>
                        <SelectItem value="aviator2">Hacker Aviator Bets</SelectItem>
                        <SelectItem value="mines">Mines Bot</SelectItem>
                        <SelectItem value="all">Todo o Site (exceto Admin)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Motivo</label>
                    <Input
                      value={maintenanceData.reason}
                      onChange={(e) => setMaintenanceData({ ...maintenanceData, reason: e.target.value })}
                      placeholder="Ex: Melhorias no Sistema"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Mensagem</label>
                    <Textarea
                      value={maintenanceData.message}
                      onChange={(e) => setMaintenanceData({ ...maintenanceData, message: e.target.value })}
                      placeholder="Mensagem detalhada para os usuários"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Data/Hora de Retorno</label>
                    <Input
                      type="datetime-local"
                      value={maintenanceData.endTime.slice(0, 16)}
                      onChange={(e) => setMaintenanceData({ ...maintenanceData, endTime: new Date(e.target.value).toISOString() })}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">URL da Imagem (opcional)</label>
                    <Input
                      value={maintenanceData.imageUrl}
                      onChange={(e) => setMaintenanceData({ ...maintenanceData, imageUrl: e.target.value })}
                      placeholder="URL da imagem do robô"
                    />
                  </div>

                  <Button
                    onClick={handleSaveMaintenance}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    Salvar Configurações de Manutenção
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Customization Section */}
          <Card className="p-6 bg-card/80 backdrop-blur-sm">
            <Button
              onClick={() => setShowCustomization(!showCustomization)}
              variant="outline"
              className="w-full justify-start mb-4"
            >
              <Palette className="w-4 h-4 mr-2" />
              Customização Visual
            </Button>

            {showCustomization && (
              <div className="space-y-4 mt-4">
                <Separator />
                
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Fonte Personalizada</label>
                    <Button
                      variant={customFont.enabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCustomFont({ ...customFont, enabled: !customFont.enabled })}
                    >
                      {customFont.enabled ? "Ativada" : "Desativada"}
                    </Button>
                  </div>

                  {customFont.enabled && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Família da Fonte</label>
                      <Select
                        value={customFont.fontFamily}
                        onValueChange={(value) => setCustomFont({ ...customFont, fontFamily: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter (Padrão)</SelectItem>
                          <SelectItem value="Roboto">Roboto</SelectItem>
                          <SelectItem value="Poppins">Poppins</SelectItem>
                          <SelectItem value="Montserrat">Montserrat</SelectItem>
                          <SelectItem value="Open Sans">Open Sans</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button
                    onClick={handleSaveCustomization}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    Salvar Customização
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        <Separator className="my-6" />

        <h2 className="text-xl font-bold text-foreground mb-4">Gerenciar Usuários</h2>

        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <div key={user.uid} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground">{user.username}</h3>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tel: {user.phoneNumber} • Bairro: {user.bairro || "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Expira: {new Date(user.subscriptionExpiry).toLocaleDateString('pt-MZ')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingUser(editingUser === user.uid ? null : user.uid)}
                    className="text-xs"
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant={user.statususer === "ativo" ? "destructive" : "default"}
                    onClick={() => handleToggleStatus(user.uid, user.statususer)}
                    className="text-xs"
                  >
                    {user.statususer === "ativo" ? <Ban className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                  </Button>
                </div>
              </div>

              {editingUser === user.uid && (
                <div className="mt-3 pt-3 border-t border-border space-y-2">
                  <Input
                    placeholder="Novo bairro"
                    value={editData.bairro}
                    onChange={(e) => setEditData({ ...editData, bairro: e.target.value })}
                    className="bg-secondary border-secondary text-sm"
                  />
                  <Input
                    type="number"
                    placeholder="Adicionar dias"
                    value={editData.subscriptionDays || ""}
                    onChange={(e) => setEditData({ ...editData, subscriptionDays: parseInt(e.target.value) || 0 })}
                    className="bg-secondary border-secondary text-sm"
                  />
                  <Button
                    onClick={() => handleEditUser(user.uid)}
                    size="sm"
                    className="w-full bg-primary hover:bg-primary/90 text-sm"
                  >
                    Salvar
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin;
