import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProducerLayout } from '@/components/producer/producer-layout';
import ProducerDashboard from './ProducerDashboard';
import ProducerSales from './ProducerSales';
import { useAuth } from '@/contexts/AuthContext';

const ProducerStores = lazy(() => import('./ProducerStores'));
const ProducerProducts = lazy(() => import('./ProductsList'));
const ProducerClients = lazy(() => import('./Clientes'));
const ProducerFinances = lazy(() => import('./Analytics'));
const ProducerCoupons = lazy(() => import('./CouponManagement'));
const ProducerAffiliates = lazy(() => import('./ProducerAffiliates'));
const ProducerIntegrations = lazy(() => import('./ProducerIntegrations'));
const ProducerSettings = lazy(() => import('./Configuracoes'));

export default function Producer() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <ProducerLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }>
        <Routes>
          <Route index element={<ProducerDashboard />} />
          <Route path="sales" element={<ProducerSales />} />
          <Route path="stores" element={<ProducerStores />} />
          <Route path="products" element={<ProducerProducts />} />
          <Route path="clients" element={<ProducerClients />} />
          <Route path="finances" element={<ProducerFinances />} />
          <Route path="coupons" element={<ProducerCoupons />} />
          <Route path="affiliates" element={<ProducerAffiliates />} />
          <Route path="integrations" element={<ProducerIntegrations />} />
          <Route path="settings" element={<ProducerSettings />} />
        </Routes>
      </Suspense>
    </ProducerLayout>
  );
}