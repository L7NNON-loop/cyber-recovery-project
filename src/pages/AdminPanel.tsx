import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { database } from "@/lib/firebase";
import { ref, get, set, update } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import { Search, UserPlus, Edit2, Ban, CheckCircle } from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

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

const AdminPanel = () => {
  const { toast } = useToast();
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
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const usersData = snapshot.val();
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
      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newUser.email,
        newUser.password
      );

      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + newUser.subscriptionDays);

      // Salvar no Realtime Database
      await set(ref(database, `users/${userCredential.user.uid}`), {
        username: newUser.username,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        bairro: newUser.bairro,
        subscriptionExpiry: expirationDate.toISOString(),
        subscriptionDays: newUser.subscriptionDays,
        createdAt: new Date().toISOString(),
        statususer: "ativo",
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

  const handleToggleStatus = async (uid: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "ativo" ? "desativado" : "ativo";
      await update(ref(database, `users/${uid}`), {
        statususer: newStatus
      });

      toast({
        title: "Status atualizado!",
        description: `Usuário ${newStatus === "ativo" ? "ativado" : "desativado"} com sucesso`,
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

  const handleUpdateUser = async (uid: string) => {
    try {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + editData.subscriptionDays);

      await update(ref(database, `users/${uid}`), {
        bairro: editData.bairro,
        subscriptionDays: editData.subscriptionDays,
        subscriptionExpiry: expirationDate.toISOString()
      });

      toast({
        title: "Usuário atualizado!",
        description: "Dados atualizados com sucesso",
      });
      setEditingUser(null);
      loadUsers();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Painel Administrativo</h1>
          <p className="text-sm text-muted-foreground">Gerencie usuários do sistema</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Pesquisar usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setShowAddUser(!showAddUser)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Adicionar Usuário
            </Button>
          </div>

          {showAddUser && (
            <form onSubmit={handleAddUser} className="bg-secondary/50 rounded-lg p-4 mb-4 space-y-3">
              <h3 className="font-semibold text-sm mb-2">Novo Usuário</h3>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Nome de usuário"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  required
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  required
                />
                <Input
                  type="password"
                  placeholder="Senha"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  required
                />
                <Input
                  placeholder="Telefone"
                  value={newUser.phoneNumber}
                  onChange={(e) => setNewUser({...newUser, phoneNumber: e.target.value})}
                  required
                />
                <Input
                  placeholder="Bairro"
                  value={newUser.bairro}
                  onChange={(e) => setNewUser({...newUser, bairro: e.target.value})}
                />
                <Input
                  type="number"
                  placeholder="Dias de acesso"
                  value={newUser.subscriptionDays}
                  onChange={(e) => setNewUser({...newUser, subscriptionDays: parseInt(e.target.value)})}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Criar Usuário</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddUser(false)}>Cancelar</Button>
              </div>
            </form>
          )}
        </div>

        <div className="space-y-3">
          {filteredUsers.map(user => (
            <div key={user.uid} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">{user.username}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      user.statususer === "ativo" 
                        ? "bg-green-500/20 text-green-500" 
                        : "bg-red-500/20 text-red-500"
                    }`}>
                      {user.statususer}
                    </span>
                  </div>
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Email: {user.email}</p>
                    <p>Telefone: {user.phoneNumber}</p>
                    <p>Bairro: {user.bairro || "Não informado"}</p>
                    <p>Dias de acesso: {user.subscriptionDays}</p>
                    <p>Expira em: {new Date(user.subscriptionExpiry).toLocaleDateString('pt-BR')}</p>
                  </div>

                  {editingUser === user.uid && (
                    <div className="mt-3 space-y-2 bg-secondary/30 p-3 rounded-lg">
                      <Input
                        placeholder="Bairro"
                        value={editData.bairro}
                        onChange={(e) => setEditData({...editData, bairro: e.target.value})}
                      />
                      <Input
                        type="number"
                        placeholder="Dias de acesso"
                        value={editData.subscriptionDays}
                        onChange={(e) => setEditData({...editData, subscriptionDays: parseInt(e.target.value)})}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleUpdateUser(user.uid)}>Salvar</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingUser(null)}>Cancelar</Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingUser(user.uid);
                      setEditData({
                        bairro: user.bairro || "",
                        subscriptionDays: user.subscriptionDays || 0
                      });
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={user.statususer === "ativo" ? "destructive" : "default"}
                    onClick={() => handleToggleStatus(user.uid, user.statususer)}
                  >
                    {user.statususer === "ativo" ? (
                      <Ban className="w-4 h-4" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
