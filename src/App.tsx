import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, RequireAdmin, RequireAuth, RequireBusiness } from "./contexts/AuthContext";
import { WorkerRequestsProvider } from "@/contexts/WorkerRequestsContext";
import { WorkersProvider } from "@/contexts/WorkersContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CustomerSupport } from "@/components/CustomerSupport";
import { LanguageSelector } from "@/components/LanguageSelector";
import Index from "./pages/Index";
import WorkerRegistration from "./pages/WorkerRegistration";
import WorkerLogin from "./pages/WorkerLogin";
import AdminDashboard from "./pages/AdminDashboard";
import BusinessDashboard from "./pages/business/Dashboard";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "./components/theme-provider";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TestSupabaseConnection } from "@/components/TestSupabaseConnection";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="migii-theme">
      <TooltipProvider>
        <LanguageProvider>
          <AuthProvider>
            <WorkersProvider>
              <WorkerRequestsProvider>
                <BrowserRouter>
                  <Toaster position="top-right" />
                  
                  {/* Add language selector to all routes */}
                  {/* <div className="fixed top-4 right-4 z-50">
                    <LanguageSelector />
                  </div> */}
                  
                  <Routes>
                    <Route path="/" element={<Index />} />
                    
                    {/* Protected Routes */}
                    <Route 
                      path="/admin-dashboard/*" 
                      element={
                        <RequireAdmin>
                          <AdminDashboard />
                        </RequireAdmin>
                      } 
                    />
                    <Route 
                      path="/business-dashboard/*" 
                      element={
                        <RequireBusiness>
                          <BusinessDashboard />
                        </RequireBusiness>
                      } 
                    />
                    
                    {/* Authentication Route */}
                    <Route path="/login" element={<Login />} />
                    
                    {/* Worker Routes */}
                    <Route path="/worker-registration" element={<WorkerRegistration />} />
                    <Route path="/worker-login" element={<WorkerLogin />} />
                    
                    {/* Test Routes */}
                    <Route path="/test-supabase" element={
                      <DashboardLayout>
                        <TestSupabaseConnection />
                      </DashboardLayout>
                    } />
                    
                    {/* Utility Routes */}
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    <Route path="/settings" element={<Settings />} />
                    
                    {/* Redirects */}
                    <Route path="/admin" element={<Navigate to="/login?tab=admin" replace />} />
                    <Route path="/business" element={<Navigate to="/login?tab=business" replace />} />
                    <Route path="/worker" element={<Navigate to="/login?tab=worker" replace />} />
                    <Route path="/register" element={<Navigate to="/worker-registration" replace />} />
                    <Route path="/signin" element={<Navigate to="/login" replace />} />
                    
                    {/* Catch-all */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  
                  {/* Add customer support to all routes */}
                  <CustomerSupport />
                </BrowserRouter>
              </WorkerRequestsProvider>
            </WorkersProvider>
          </AuthProvider>
        </LanguageProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
