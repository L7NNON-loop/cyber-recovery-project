import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, database } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import { MaintenanceOverlay } from "@/components/MaintenanceOverlay";

const Aviator1 = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
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
        const maintenanceRef = ref(database, "maintenance/aviator1");
        const maintenanceSnapshot = await get(maintenanceRef);
        console.log("Aviator1 - Checking maintenance:", maintenanceSnapshot.exists());
        if (maintenanceSnapshot.exists()) {
          const maintenanceConfig = maintenanceSnapshot.val();
          console.log("Aviator1 - Maintenance config:", maintenanceConfig);
          console.log("Aviator1 - Enabled value:", maintenanceConfig.enabled, "Type:", typeof maintenanceConfig.enabled);
          
          // Check if enabled is true
          if (maintenanceConfig.enabled === true) {
            console.log("Aviator1 - Setting maintenance mode ON");
            setMaintenance(maintenanceConfig);
          } else {
            console.log("Aviator1 - Maintenance is OFF");
            setMaintenance(null);
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
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">
          Robô Cyber Hacker
        </h1>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-muted-foreground">
            Funcionalidade do Cyber Hacker em desenvolvimento...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Aviator1;
