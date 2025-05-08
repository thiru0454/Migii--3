import { useState, useEffect, useRef } from "react";
import { supabase } from "@/utils/supabaseClient";
import { User, UserType } from "@/types/auth";
import { getAllBusinessUsers } from "@/utils/businessDatabase";
import { toast } from "sonner";
import { 
  getAllWorkersFromStorage, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  confirmOtp 
} from "@/utils/firebase";

export const useAuthProvider = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    // Restore user from localStorage if available
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("currentUser");
      }
    }
    
    // Check Supabase session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoading(false);
      
      if (!session) {
        // If there's no Supabase session, clear any stored user data
        setCurrentUser(null);
        localStorage.removeItem("currentUser");
      }
    });

    return () => {
      subscription.unsubscribe();
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
      }
    };
  }, []);

  const login = async (email: string, password: string, userType: UserType): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (userType === "admin") {
        if (email === "admin@migii.com" && password === "admin123") {
          const user: User = {
            id: "admin-1",
            email,
            name: "Admin User",
            userType: "admin",
          };
          setCurrentUser(user);
          localStorage.setItem("currentUser", JSON.stringify(user));
          setIsLoading(false);
          return true;
        }
        toast.error("Invalid admin credentials");
        setIsLoading(false);
        return false;
      } else if (userType === "business") {
        // Use local storage for business login
        const businessUsers = getAllBusinessUsers();
        const business = businessUsers.find(
          (user) => user.email.trim().toLowerCase() === email.trim().toLowerCase() && user.password === password
        );
        if (!business) {
          toast.error("Invalid business credentials");
          setIsLoading(false);
          return false;
        }
        const user: User = {
          id: business.id,
          email: business.email,
          name: business.name,
          userType: "business",
          businessId: business.businessId,
        };
        setCurrentUser(user);
        localStorage.setItem("currentUser", JSON.stringify(user));
        setIsLoading(false);
        return true;
      }
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login.");
      setIsLoading(false);
      return false;
    }
  };

  const loginWithPhone = async (phone: string): Promise<string> => {
    try {
      setIsLoading(true);
      
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(null, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            console.log("Recaptcha verified");
          },
          'expired-callback': () => {
            toast.error("reCAPTCHA expired. Please try again.");
          }
        });
      }
      
      // Get all workers from local storage
      const workers = getAllWorkersFromStorage();
      
      // Find worker by phone
      const worker = workers.find(w => w.phone === phone);
      
      if (!worker) {
        throw new Error("Phone number not registered. Please register first.");
      }
      
      // Set current user immediately if we found the worker (for demo purposes)
      const workerUser: User = {
        id: worker.id,
        email: worker.email || `worker-${worker.phone}@migii.app`,
        name: worker.name,
        userType: "worker",
        phone: worker.phone,
      };
      
      setCurrentUser(workerUser);
      localStorage.setItem("currentUser", JSON.stringify(workerUser));
      setIsLoading(false);
      
      // Just return the phone for verification ID
      return phone;
    } catch (error: any) {
      console.error("Phone login error:", error);
      toast.error(`Failed to send OTP: ${error.message || error}`);
      setIsLoading(false);
      throw error;
    }
  };

  const verifyOtp = async (verificationId: string, otp: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Confirm OTP using our mock function
      const result = await confirmOtp(verificationId, otp);
      
      if (!result || !result.user) {
        throw new Error("Invalid OTP verification result");
      }
      
      const phone = verificationId;
      
      // Get all workers from local storage
      const workers = getAllWorkersFromStorage();
      
      // Find worker by phone
      const worker = workers.find(w => w.phone === phone);
      
      if (worker) {
        const workerUser: User = {
          id: worker.id,
          email: worker.email || `worker-${worker.phone}@migii.app`,
          name: worker.name,
          userType: "worker",
          phone: worker.phone,
        };
        
        setCurrentUser(workerUser);
        localStorage.setItem("currentUser", JSON.stringify(workerUser));
        
        setIsLoading(false);
        return true;
      } else {
        toast.error("Phone number not found in registered workers. Please register first.");
        await supabase.auth.signOut();
        setIsLoading(false);
        return false;
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast.error(`Invalid OTP: ${error.message || "Please try again"}`);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    supabase.auth.signOut().then(() => {
      setCurrentUser(null);
      localStorage.removeItem("currentUser");
      toast.success("Logged out successfully");
    }).catch((error) => {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    });
  };

  return {
    currentUser,
    isLoading,
    login,
    loginWithPhone,
    verifyOtp,
    logout,
  };
};
