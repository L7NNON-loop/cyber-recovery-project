import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Check, Shield, Clock, Zap, Smartphone } from "lucide-react";
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
    
    if (!phoneNumber.match(/^(84|85)\d{7}$/)) {
      toast({
        title: "❌ Número inválido",
        description: "O número deve ter 9 dígitos e começar com 84 ou 85",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Primeiro: processar pagamento via Gibrapay
      console.log("Iniciando pagamento...", {
        wallet: WALLET_ID,
        phone: phoneNumber,
        amount: PACKAGE_PRICE
      });

      const paymentResponse = await fetch(`https://gibrapay.online/v1/transfer/${WALLET_ID}`, {
        method: "POST",
        headers: {
          "API-Key": API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          number_phone: phoneNumber,
          amount: PACKAGE_PRICE,
          description: `Acesso MozBots Premium - ${formData.username}`
        })
      });

      console.log("Status da resposta:", paymentResponse.status);
      
      if (!paymentResponse.ok) {
        throw new Error(`Erro na API: ${paymentResponse.status} - ${paymentResponse.statusText}`);
      }

      const paymentData = await paymentResponse.json();
      console.log("Resposta do pagamento:", paymentData);

      // Verificar se o pagamento foi bem-sucedido
      if (paymentData.status === "success") {
        toast({
          title: "✅ Pagamento iniciado!",
          description: "Processando sua transação...",
        });

        // Aguardar um pouco para dar tempo da transação processar
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Verificar o status da transação
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
        console.log("Transações:", transactionsData);

        // Procurar pela transação mais recente
        const recentTransaction = transactionsData.data?.[0];
        
        if (recentTransaction && recentTransaction.status === "complete") {
          // Pagamento confirmado - criar conta no Firebase
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            formData.email,
            formData.password
          );

          // Salvar dados adicionais no Realtime Database
          const expirationDate = new Date();
          expirationDate.setDate(expirationDate.getDate() + ACCESS_DAYS);

          await set(ref(database, `users/${userCredential.user.uid}`), {
            username: formData.username,
            email: formData.email,
            phoneNumber: phoneNumber,
            subscriptionExpiry: expirationDate.toISOString(),
            subscriptionDays: ACCESS_DAYS,
            createdAt: new Date().toISOString(),
            paymentAmount: PACKAGE_PRICE,
            transactionId: paymentData.data?.id || "N/A",
            loginHistory: []
          });

          toast({
            title: "🎉 Conta criada com sucesso!",
            description: "Seu pagamento foi confirmado. Faça login para acessar.",
          });

          setTimeout(() => navigate('/login'), 2000);
        } else {
          // Pagamento pendente ou falhou
          toast({
            title: "⏳ Pagamento pendente",
            description: "Aguarde a confirmação do M-Pesa no seu celular",
          });
        }
      } else {
        throw new Error(paymentData.message || "Erro ao processar pagamento");
      }
    } catch (error: any) {
      console.error("Erro completo:", error);
      toast({
        title: "❌ Erro ao processar pagamento",
        description: error.message || "Verifique os dados e tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 text-muted-foreground hover:text-primary"
          onClick={() => navigate('/register')}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </Button>

        <div className="bg-card border-2 border-primary/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-block bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl px-6 py-3 mb-3">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Finalizar Pagamento
              </h1>
            </div>
          </div>

          {/* Alert Message */}
          <Alert className="mb-6 border-2 border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl">
            <Shield className="h-5 w-5 text-primary" />
            <AlertDescription className="text-foreground font-medium ml-2">
              Para finalizar seu registro, complete o pagamento via M-Pesa. Você receberá uma solicitação no seu celular.
            </AlertDescription>
          </Alert>

          {/* User Data Summary */}
          <div className="bg-gradient-to-br from-secondary/80 to-secondary/50 border-2 border-border rounded-2xl p-5 mb-6">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Seus Dados de Registro
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-3 bg-background/30 rounded-xl">
                <span className="text-muted-foreground">Nome de Usuário:</span>
                <span className="text-foreground font-semibold">{formData.username}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-background/30 rounded-xl">
                <span className="text-muted-foreground">Email:</span>
                <span className="text-foreground font-semibold">{formData.email}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl border border-primary/30">
                <span className="text-muted-foreground">Validade do Acesso:</span>
                <span className="text-primary font-bold">{ACCESS_DAYS} dias (48 horas)</span>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-br from-secondary/50 to-secondary/30 border-2 border-border rounded-2xl p-5 mb-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Privilégios do Acesso Premium</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 bg-background/30 rounded-xl">
                <div className="bg-primary/20 p-2 rounded-lg">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-foreground font-medium">100% de acerto</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background/30 rounded-xl">
                <div className="bg-primary/20 p-2 rounded-lg">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-foreground font-medium">Sinais em tempo real</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background/30 rounded-xl">
                <div className="bg-primary/20 p-2 rounded-lg">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-foreground font-medium">Suporte 24/24</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background/30 rounded-xl">
                <div className="bg-primary/20 p-2 rounded-lg">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-foreground font-medium">IA Avançada</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handlePayment} className="space-y-6">
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/30 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-primary" />
                Método de Pagamento
              </h3>
              
              <div className="mb-5">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/30 to-primary/20 border-2 border-primary/50 rounded-xl px-6 py-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="text-primary font-bold text-lg">M-Pesa</span>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-foreground block">
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
                  className="w-full bg-secondary/50 border-2 border-border hover:border-primary/50 focus:border-primary text-foreground text-lg h-14 rounded-xl"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Digite apenas os 9 dígitos (começando com 84 ou 85)
                </p>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 border-2 border-primary/50 rounded-2xl p-6 text-center shadow-lg">
              <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wide">Valor Total</p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">{PACKAGE_PRICE}</p>
                <span className="text-2xl font-bold text-primary">MT</span>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Acesso Premium por <span className="text-primary font-bold">{ACCESS_DAYS} dias</span>
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold text-lg h-16 rounded-2xl shadow-xl hover:shadow-primary/50 transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Processando Pagamento...
                </span>
              ) : (
                "Confirmar e Pagar"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            🔒 Pagamento seguro via M-Pesa • Ao confirmar, você concorda com nossos termos de serviço
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
