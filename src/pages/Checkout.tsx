import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Check, Shield, Clock, Zap, Smartphone, Lock } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, database } from "@/lib/firebase";
import { ref, set } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const formData = location.state?.formData || { username: "", email: "", password: "" };
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const PACKAGE_PRICE = 350;
  const ACCESS_DAYS = 2;
  const WALLET_ID = "50c282d1-843f-4b9c-a287-2140e9e8d94b";
  const API_KEY = "b3b33cba8a903626a015d592754f1dcec756e9fbb12d411516f4a79b04aba8923ebb6396da29e61c899154ab005aaf056961b819c263e1ec5d88c60b9cae6aba";

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.match(/^(84|85|86|87)\d{7}$/)) {
      toast({
        title: "❌ Número inválido",
        description: "O número deve ter 9 dígitos e começar com 84, 85, 86 ou 87",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log("🚀 Iniciando pagamento M-Pesa...");

      // Realizar transferência via Gibrapay
      const paymentResponse = await fetch("https://gibrapay.online/v1/transfer", {
        method: "POST",
        headers: {
          "API-Key": API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          wallet_id: WALLET_ID,
          amount: PACKAGE_PRICE,
          number_phone: phoneNumber
        })
      });

      const paymentData = await paymentResponse.json();
      console.log("📦 Resposta do pagamento:", paymentData);

      if (paymentData.status === "success") {
        toast({
          title: "✅ Pagamento iniciado!",
          description: "Confirme a transação no seu celular M-Pesa",
        });

        // Aguardar confirmação da transação
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Verificar status da transação
        const transactionCheckResponse = await fetch(
          `https://gibrapay.online/v1/transactions/${WALLET_ID}`,
          {
            headers: {
              "API-Key": API_KEY,
              "Content-Type": "application/json"
            }
          }
        );

        const transactionsData = await transactionCheckResponse.json();
        console.log("📊 Transações verificadas:", transactionsData);

        // Procurar pela transação mais recente correspondente
        const recentTransaction = transactionsData.data?.find(
          (tx: any) => tx.number_phone === phoneNumber && 
                      parseFloat(tx.amount) === PACKAGE_PRICE &&
                      tx.type === "transfer"
        );
        
        if (recentTransaction && recentTransaction.status === "complete") {
          console.log("✅ Pagamento confirmado! Criando conta...");

          // Criar conta no Firebase
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            formData.email,
            formData.password
          );

          // Calcular data de expiração
          const expirationDate = new Date();
          expirationDate.setDate(expirationDate.getDate() + ACCESS_DAYS);

          // Salvar dados no Realtime Database
          await set(ref(database, `users/${userCredential.user.uid}`), {
            username: formData.username,
            email: formData.email,
            phoneNumber: phoneNumber,
            subscriptionExpiry: expirationDate.toISOString(),
            subscriptionDays: ACCESS_DAYS,
            createdAt: new Date().toISOString(),
            paymentAmount: PACKAGE_PRICE,
            transactionId: recentTransaction.id || "N/A",
            statususer: "ativo",
            criadouser: "true",
            bairro: "",
            loginHistory: [{
              timestamp: new Date().toISOString(),
              ip: "N/A",
              device: navigator.userAgent
            }]
          });

          toast({
            title: "🎉 Conta criada com sucesso!",
            description: "Redirecionando para o login...",
          });

          setTimeout(() => navigate('/login'), 2000);
        } else {
          toast({
            title: "⏳ Processando pagamento",
            description: "Confirme a solicitação no seu M-Pesa. Aguarde alguns segundos...",
          });
          
          setTimeout(() => {
            setLoading(false);
            toast({
              title: "⚠️ Verificação necessária",
              description: "Se você já confirmou o pagamento, tente fazer login. Caso contrário, confirme no seu celular.",
            });
          }, 8000);
        }
      } else {
        throw new Error(paymentData.message || "Erro ao processar pagamento");
      }
    } catch (error: any) {
      console.error("❌ Erro no processamento:", error);
      toast({
        title: "❌ Erro ao processar",
        description: error.message || "Verifique sua conexão e tente novamente",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 text-muted-foreground hover:text-primary hover:bg-secondary rounded-lg"
          onClick={() => navigate('/register')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="bg-card border border-primary/20 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-lg px-4 py-1.5 mb-2">
              <Shield className="w-4 h-4 text-primary" />
              <h1 className="text-lg font-bold text-primary">
                Finalizar Pagamento
              </h1>
            </div>
            <p className="text-muted-foreground text-xs">
              Complete o pagamento para ativar seu acesso premium
            </p>
          </div>

          {/* Alert */}
          <Alert className="mb-4 border border-primary/20 bg-primary/5 rounded-lg p-3">
            <Shield className="h-4 w-4 text-primary" />
            <AlertDescription className="text-foreground ml-2 text-xs">
              Você receberá uma solicitação de pagamento M-Pesa no seu celular. Confirme para completar o registro.
            </AlertDescription>
          </Alert>

          {/* User Summary */}
          <div className="bg-secondary/50 border border-border rounded-lg p-4 mb-4">
            <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-primary" />
              Dados do Registro
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 bg-background/50 rounded-md">
                <span className="text-muted-foreground">Usuário:</span>
                <span className="text-foreground font-medium">{formData.username}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-background/50 rounded-md">
                <span className="text-muted-foreground">Email:</span>
                <span className="text-foreground font-medium">{formData.email}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-primary/10 border border-primary/20 rounded-md">
                <span className="text-muted-foreground">Acesso:</span>
                <span className="text-primary font-semibold">{ACCESS_DAYS} dias (48 horas)</span>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-secondary/30 border border-border rounded-lg p-3 mb-4">
            <h3 className="text-xs font-semibold text-foreground mb-2">Vantagens Premium</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5 p-2 bg-background/40 rounded-md">
                <Check className="w-3 h-3 text-primary flex-shrink-0" />
                <span className="text-[10px] text-foreground">100% de acerto</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 bg-background/40 rounded-md">
                <Zap className="w-3 h-3 text-primary flex-shrink-0" />
                <span className="text-[10px] text-foreground">Sinais em tempo real</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 bg-background/40 rounded-md">
                <Clock className="w-3 h-3 text-primary flex-shrink-0" />
                <span className="text-[10px] text-foreground">Suporte 24h</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 bg-background/40 rounded-md">
                <Shield className="w-3 h-3 text-primary flex-shrink-0" />
                <span className="text-[10px] text-foreground">IA Avançada</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handlePayment} className="space-y-4">
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-4">
              <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-primary" />
                Método de Pagamento
              </h3>
              
              <div className="mb-3">
                <div className="inline-flex items-center gap-1.5 bg-primary/20 border border-primary/40 rounded-md px-3 py-1.5">
                  <Smartphone className="w-4 h-4 text-primary" />
                  <span className="text-primary font-bold text-xs">M-Pesa</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="phone" className="text-xs font-medium text-foreground">
                  Número de Telefone M-Pesa
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="84XXXXXXX ou 85XXXXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  maxLength={9}
                  required
                  className="bg-background/70 border-border hover:border-primary/50 focus:border-primary text-foreground h-9 rounded-lg text-sm"
                />
                <p className="text-[10px] text-muted-foreground">
                  Digite os 9 dígitos (84, 85, 86 ou 87)
                </p>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/40 rounded-lg p-4 text-center">
              <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">Valor Total</p>
              <div className="flex items-baseline justify-center gap-1.5 mb-1">
                <p className="text-3xl font-bold text-primary">{PACKAGE_PRICE}</p>
                <span className="text-base font-semibold text-primary">MT</span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Acesso Premium por <span className="text-primary font-bold">{ACCESS_DAYS} dias</span>
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm h-10 rounded-lg shadow-lg hover:shadow-primary/30 transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Processando...
                </span>
              ) : (
                "Confirmar e Pagar"
              )}
            </Button>
          </form>

          {/* Footer Security */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-primary" />
                <span>Pagamento Seguro SSL</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-3 h-3 text-primary" />
                <span>M-Pesa Dev Portal</span>
              </div>
            </div>
            <p className="text-center text-[10px] text-muted-foreground mt-2">
              🔒 Ao confirmar, você concorda com nossos termos de serviço
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
