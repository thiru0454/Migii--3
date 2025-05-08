import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { WorkerTabs } from "@/components/worker/WorkerTabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn } from "lucide-react";
import { WorkerLoginForm } from "@/components/forms/WorkerLoginForm";
import { getAllWorkers } from "@/utils/supabaseClient";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const WorkerLogin = () => {
  const { currentUser, logout } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [workerData, setWorkerData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchWorkerData = async () => {
      if (currentUser && currentUser.userType === "worker") {
        setIsLoading(true);
        setIsLoggedIn(true);
        let worker = null;
        const { data, error } = await getAllWorkers();
        if (!error && data) {
          if (currentUser.phone) {
            worker = data.find((w: any) => {
              const dbPhone = String(w["Phone Number"]).trim();
              const userPhone = String(currentUser.phone).trim();
              console.log('[WorkerLogin Dashboard] Comparing:', dbPhone, userPhone);
              return dbPhone === userPhone;
            });
          }
          if (!worker && currentUser.email) {
            worker = data.find((w: any) => {
              const dbEmail = String(w["Email Address"]).trim();
              const userEmail = String(currentUser.email).trim();
              console.log('[WorkerLogin Dashboard] Comparing:', dbEmail, userEmail);
              return dbEmail === userEmail;
            });
          }
        }
        if (worker) {
          setWorkerData(worker);
        } else {
          setWorkerData(null);
        }
        setIsLoading(false);
      } else {
        setIsLoggedIn(false);
        setWorkerData(null);
      }
    };
    fetchWorkerData();
  }, [currentUser]);

  const handleSignOut = () => {
    logout();
    setIsLoggedIn(false);
    setWorkerData(null);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 my-6">
        {isLoggedIn ? (
          isLoading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <LoadingSpinner />
            </div>
          ) : workerData ? (
            <WorkerTabs 
              workerData={workerData} 
              onSignOut={handleSignOut} 
            />
          ) : (
            <div className="text-center text-lg text-red-500 py-12">No worker data found.</div>
          )
        ) : (
          <div className="flex items-center justify-center w-full min-h-[calc(100vh-200px)] py-8">
            <Card className="w-full max-w-md mx-auto shadow-lg border-border">
              <CardHeader className="text-center space-y-2 pb-6">
                <CardTitle className="text-2xl font-bold text-primary">Worker Login</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Enter your phone number to access your worker dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-8">
                <WorkerLoginForm onSuccess={handleLoginSuccess} />
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  <p>Not registered yet?</p>
                  <Button 
                    variant="link" 
                    onClick={() => navigate("/worker-registration")}
                  >
                    Register as Worker
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WorkerLogin; 