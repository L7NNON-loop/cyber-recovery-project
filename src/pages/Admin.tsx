import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { database } from "@/lib/firebase";
import { ref, get, set, update } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import { Search, UserPlus, Edit2, Ban, CheckCircle, Shield, ArrowLeft } from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { validateAdminCode } from "@/lib/auth-config";
import { useNavigate } from "react-router-dom";

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

  useEffect(() => {
    if (isAuthenticated) {
      loadUsers();
    }
  }, [isAuthenticated]);

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
        </div>

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
