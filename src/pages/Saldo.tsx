import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import SEOHead from "@/components/ui/seo-head";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, CreditCard, ArrowDownLeft } from "lucide-react";

const Saldo = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pb-20">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Carregando saldo...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const transactions = [
    { id: 1, description: "Venda - Curso de React", value: "+R$ 197,00", date: "12/09/2025" },
    { id: 2, description: "Saque para conta bancária", value: "-R$ 500,00", date: "10/09/2025" },
    { id: 3, description: "Venda - Mentoria 1:1", value: "+R$ 500,00", date: "09/09/2025" },
  ];

  return (
    <>
      <SEOHead 
        title="Saldo - Nexus Market"
        description="Gerencie seu saldo e saques na plataforma."
      />
      
      <AdminLayout>
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Saldo</h1>
            <p className="text-muted-foreground text-lg">
              Gerencie seu saldo e solicite saques
            </p>
          </div>

          {/* Saldo Principal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="md:col-span-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Saldo Disponível</p>
                    <p className="text-4xl font-bold text-green-600">R$ 1.847,50</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Última atualização: há 5 minutos
                    </p>
                  </div>
                  <DollarSign className="w-16 h-16 text-green-600" />
                </div>
                <div className="mt-6">
                  <Button className="w-full md:w-auto">
                    <ArrowDownLeft className="w-4 h-4 mr-2" />
                    Solicitar Saque
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Saldo Pendente</p>
                      <p className="text-2xl font-bold">R$ 297,00</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Saques Este Mês</p>
                      <p className="text-2xl font-bold">R$ 500,00</p>
                    </div>
                    <CreditCard className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Histórico de Transações */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Transações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{transaction.date}</p>
                    </div>
                    <span className={`font-bold ${
                      transaction.value.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Informações de Saque */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Informações sobre Saques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Prazos de Saque</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• PIX: Até 1 dia útil</li>
                    <li>• TED: Até 2 dias úteis</li>
                    <li>• DOC: Até 3 dias úteis</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Valor Mínimo</h4>
                  <p className="text-sm text-muted-foreground">
                    O valor mínimo para saque é de R$ 50,00
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </>
  );
};

export default Saldo;