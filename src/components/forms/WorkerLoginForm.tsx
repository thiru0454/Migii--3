import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { sendOtpEmail, verifyOtp } from "@/utils/emailService";
import { toast } from "sonner";
import { AlertCircle, Loader2, Mail, MessageSquare, Phone, Timer } from "lucide-react";
import { getAllWorkers } from "@/utils/supabaseClient";
import { useIsMobile } from "@/hooks/use-mobile";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/contexts/AuthContext";

const contactSchema = z.object({
  contact: z.string().min(1, { message: "Email or phone number is required" }),
});

const otpSchema = z.object({
  otp: z.string().min(6, { message: "OTP should be 6 digits" }),
});

interface WorkerLoginFormProps {
  onSuccess: () => void;
}

export function WorkerLoginForm({ onSuccess }: WorkerLoginFormProps) {
  const [step, setStep] = useState<"contact" | "otp">("contact");
  const [isLoading, setIsLoading] = useState(false);
  const [contact, setContact] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const isMobile = useIsMobile();
  const { currentUser, login, logout } = useAuth();

  const contactForm = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      contact: "",
    },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const handleSendOTP = async (data: z.infer<typeof contactSchema>) => {
    setIsLoading(true);
    setError(null);
    try {
      const contactValue = data.contact.trim();
      setContact(contactValue);
      const isEmail = contactValue.includes('@');
      // Fetch all workers and filter for the matching one
      const { data: workers, error } = await getAllWorkers();
      console.log('[WorkerLoginForm] handleSendOTP - contact:', contactValue);
      console.log('[WorkerLoginForm] handleSendOTP - fetched workers:', workers);
      if (error || !workers) {
        setError("Failed to fetch workers from Supabase");
        setIsLoading(false);
        return;
      }
      console.log("Fetched workers from Supabase:", workers);
      console.log("Trying to match contact:", contactValue);
      const worker = isEmail
        ? workers.find((w: any) =>
            (w["Email Address"] && String(w["Email Address"]).trim() === contactValue.trim()) ||
            (w.email && String(w.email).trim() === contactValue.trim())
          )
        : workers.find((w: any) => {
            const dbPhone = w["Phone Number"] ? String(w["Phone Number"]).trim() : "";
            const dbPhoneNew = w.phone ? String(w.phone).trim() : "";
            const inputPhone = contactValue.trim();
            return dbPhone === inputPhone || dbPhoneNew === inputPhone;
          });
      console.log('[WorkerLoginForm] handleSendOTP - matched worker:', worker);
      if (!worker) {
        setError(`No worker found with this ${isEmail ? 'email' : 'phone number'}`);
        setIsLoading(false);
        return;
      }
      // Skip actual OTP sending, just go to OTP step
      setStep("otp");
      setTimeLeft(60);
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err.message || "An error occurred while sending OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (data: z.infer<typeof otpSchema>) => {
    setIsLoading(true);
    setError(null);
    try {
      // Accept '123456' as the only valid OTP
      if (data.otp === '123456') {
        const isEmail = contact.includes('@');
        // Fetch all workers and filter for the matching one
        const { data: workers, error } = await getAllWorkers();
        console.log('[WorkerLoginForm] handleVerifyOTP - contact:', contact);
        console.log('[WorkerLoginForm] handleVerifyOTP - fetched workers:', workers);
        if (error || !workers) {
          setError("Failed to fetch workers from Supabase");
          setIsLoading(false);
          return;
        }
        console.log("Fetched workers from Supabase:", workers);
        console.log("Trying to match contact:", contact);
        const worker = isEmail
          ? workers.find((w: any) =>
              (w["Email Address"] && String(w["Email Address"]).trim() === contact.trim()) ||
              (w.email && String(w.email).trim() === contact.trim())
            )
          : workers.find((w: any) => {
              const dbPhone = w["Phone Number"] ? String(w["Phone Number"]).trim() : "";
              const dbPhoneNew = w.phone ? String(w.phone).trim() : "";
              const inputPhone = contact.trim();
              return dbPhone === inputPhone || dbPhoneNew === inputPhone;
            });
        console.log('[WorkerLoginForm] handleVerifyOTP - matched worker:', worker);
        if (!worker) {
          setError("Worker not found");
          setIsLoading(false);
          return;
        }
        // Set Auth context's currentUser to the logged-in worker
        const workerUser = {
          id: worker.id,
          email: worker["Email Address"] || worker.email || "",
          name: worker["Full Name"] || worker.name || "",
          userType: "worker",
          phone: worker["Phone Number"] || worker.phone || "",
        };
        localStorage.setItem('currentUser', JSON.stringify(workerUser));
        if (typeof login === 'function') {
          // Use login to set currentUser in context
          await login(workerUser.email, '', 'worker');
        }
        toast.success("Login successful!");
        onSuccess();
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during verification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timeLeft > 0) return;
    
    setIsLoading(true);
    try {
      const isEmail = contact.includes('@');
      
      const worker = isEmail
        ? await getAllWorkers()
          .then(({ data }) => data.find((w: any) => (w["Email Address"] && w["Email Address"] === contact) || (w.email && w.email === contact)))
        : await getAllWorkers()
          .then(({ data }) => data.find((w: any) => (w["Phone Number"] && w["Phone Number"] === contact) || (w.phone && w.phone === contact)));
        
      if (!worker) {
        setError("Worker not found");
        setIsLoading(false);
        return;
      }
      
      const emailToUse = isEmail 
        ? contact 
        : (worker.email || `${contact}@migii.worker.temp`);
        
      const sent = await sendOtpEmail(emailToUse);
      
      if (sent) {
        setTimeLeft(60);
        const timer = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while resending OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive" className="animate-in fade-in slide-in-from-top duration-300">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === "contact" ? (
        <Form {...contactForm}>
          <form onSubmit={contactForm.handleSubmit(handleSendOTP)} className="space-y-6 animate-in fade-in slide-in-from-bottom duration-300">
            <FormField
              control={contactForm.control}
              name="contact"
              render={({ field }) => (
                <FormItem className="hover-glow rounded-lg">
                  <FormLabel>Email or Phone Number</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="Enter your email or phone number" 
                        {...field} 
                        className="pl-10 transition-all duration-200 hover:border-primary/50 focus:border-primary"
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        {field.value.includes('@') ? 
                          <Mail className="h-5 w-5" /> : 
                          <Phone className="h-5 w-5" />
                        }
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    We'll send a one-time password to this contact
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full hover-scale" disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Sending OTP...
                </>
              ) : (
                "Get OTP"
              )}
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...otpForm}>
          <form onSubmit={otpForm.handleSubmit(handleVerifyOTP)} className="space-y-6 animate-in fade-in slide-in-from-bottom duration-300">
            <div className="space-y-2">
              <FormLabel>Enter OTP sent to {contact}</FormLabel>
              <FormField
                control={otpForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex justify-center">
                        <InputOTP maxLength={6} {...field}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </FormControl>
                    <FormDescription className="text-center">
                      {timeLeft > 0 ? (
                        <div className="flex items-center justify-center gap-1 text-muted-foreground">
                          <Timer className="h-4 w-4" />
                          <span>Resend OTP in {timeLeft} seconds</span>
                        </div>
                      ) : (
                        <button 
                          type="button" 
                          onClick={handleResendOTP} 
                          className="text-primary hover:underline"
                          disabled={isLoading}
                        >
                          Resend OTP
                        </button>
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button type="submit" className="w-full hover-scale" disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Verifying...
                </>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Verify OTP</span>
                </div>
              )}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full hover-scale"
              onClick={() => setStep("contact")}
              disabled={isLoading}
            >
              Back to Login
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}
