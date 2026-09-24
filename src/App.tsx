import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Loader } from 'lucide-react';

// Lazy load all pages
const HomePage = React.lazy(() => import('./pages/HomePage'));
const AssetExplorerPage = React.lazy(() => import('./pages/explorer/AssetExplorerPage'));
const TokenizePage = React.lazy(() => import('./pages/tokenize/TokenizePage'));
const DashboardPage = React.lazy(() => import('./pages/dashboard/DashboardPage'));
const ProfilePage = React.lazy(() => import('./pages/profile/ProfilePage'));
const ValidatorsPage = React.lazy(() => import('./pages/ValidatorsPage'));
const MarketplacePage = React.lazy(() => import('./pages/MarketplacePage'));
const CommunityPage = React.lazy(() => import('./pages/CommunityPage'));
const AssetDetailPage = React.lazy(() => import('./pages/AssetDetailPage'));
const MyAssetsPage = React.lazy(() => import('./pages/MyAssetsPage'));
const ApiTestPage = React.lazy(() => import('./pages/ApiTestPage'));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <Loader className="w-8 h-8 text-primary-600 animate-spin" />
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes with standard layout */}
          <Route path="/" element={
            <div className="flex flex-col min-h-screen">
              <main className="flex-grow bg-neutral-50">
                <HomePage />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/marketplace" element={
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow bg-neutral-50">
                <MarketplacePage />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/asset/:id" element={
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow bg-neutral-50">
                <AssetDetailPage />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/community" element={
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow bg-neutral-50">
                <CommunityPage />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/api-test" element={<ApiTestPage />} />
          <Route path="/api/lijinApiTest" element={<ApiTestPage />} />
          <Route path="/lijinApiTest" element={<ApiTestPage />} />
          
          {/* Dashboard layout routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/explorer" element={<AssetExplorerPage />} />
            <Route path="/asset-creation" element={<TokenizePage />} />
            <Route path="/validators" element={<ValidatorsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/my-assets" element={<MyAssetsPage />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;