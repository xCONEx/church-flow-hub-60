
import { Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { MasterProvider } from "@/contexts/MasterContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { EventProvider } from "@/contexts/EventContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LazyMasterDashboard, LazyRepertoire, PageLoader } from "@/components/LazyComponents";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { Dashboard } from "@/pages/Dashboard";
import { Members } from "@/pages/Members";
import { Invites } from "@/pages/Invites";
import { Scales } from "@/pages/Scales";
import { ChurchSettings } from "@/pages/ChurchSettings";
import { Training } from "@/pages/Training";
import { Profile } from "@/pages/Profile";
import { Settings } from "@/pages/Settings";
import { Events } from "@/pages/Events";
import { Unauthorized } from "@/pages/Unauthorized";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";

// Optimize query client with better defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 15 * 60 * 1000, // 15 minutes
      refetchOnWindowFocus: false,
      retry: 1,
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
      networkMode: 'online',
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <MasterProvider>
            <NotificationProvider>
              <EventProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'leader', 'collaborator', 'member']}>
                        <Dashboard />
                      </ProtectedRoute>
                    } 
                  />

                  <Route 
                    path="/master-dashboard" 
                    element={
                      <ProtectedRoute allowedRoles={['master']}>
                        <Suspense fallback={<PageLoader />}>
                          <LazyMasterDashboard />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/scales" 
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'leader', 'collaborator', 'member']}>
                        <Scales />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/members" 
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'leader']}>
                        <Members />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/repertoire" 
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'leader', 'collaborator', 'member']}>
                        <Suspense fallback={<PageLoader />}>
                          <LazyRepertoire />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />

                  <Route 
                    path="/training" 
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'leader', 'collaborator', 'member']}>
                        <Training />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/invites" 
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'leader']}>
                        <Invites />
                      </ProtectedRoute>
                    } 
                  />

                  <Route 
                    path="/church-settings" 
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <ChurchSettings />
                      </ProtectedRoute>
                    } 
                  />

                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute allowedRoles={['master', 'admin', 'leader', 'collaborator', 'member']}>
                        <Profile />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/settings" 
                    element={
                      <ProtectedRoute allowedRoles={['master', 'admin', 'leader', 'collaborator', 'member']}>
                        <Settings />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/events" 
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'leader', 'collaborator', 'member']}>
                        <Events />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Simplified redirects for communication/notifications/reports */}
                  <Route 
                    path="/communication" 
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'leader', 'collaborator', 'member']}>
                        <Dashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/notifications" 
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'leader', 'collaborator', 'member']}>
                        <Dashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/reports" 
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'leader']}>
                        <Dashboard />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </EventProvider>
            </NotificationProvider>
          </MasterProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
