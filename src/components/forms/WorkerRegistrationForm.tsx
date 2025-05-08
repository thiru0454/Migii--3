import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MigrantWorker } from "@/types/worker";
import { useGeolocation } from "@/hooks/useGeolocation";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, MapPin } from "lucide-react";
import { registerWorkerInStorage } from "@/utils/firebase";
import { sendRegistrationEmail } from "@/utils/emailService";
import { useIsMobile } from "@/hooks/use-mobile";
import { registerNewWorker } from '@/services/workerService';
import { SKILLS } from "@/constants/skills";

const STATES = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"];

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  age: z.coerce.number().min(18, { message: "Worker must be at least 18 years old." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  email: z.string().email({ message: "Please enter a valid email address." }).optional(),
  originState: z.string({ required_error: "Please select your origin state." }),
  skill: z.string({ required_error: "Please select your primary skill." }),
  aadhaar: z.string().min(12, { message: "Aadhaar number must be 12 digits." }).max(12, { message: "Aadhaar number must be 12 digits." }).regex(/^\d+$/, { message: "Aadhaar number must contain only digits." }),
});

interface WorkerRegistrationFormProps {
  onSuccess?: (data: MigrantWorker) => void;
}

export function WorkerRegistrationForm({ onSuccess }: WorkerRegistrationFormProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const location = useGeolocation();
  const isMobile = useIsMobile();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      age: undefined,
      phone: "",
      email: "",
      originState: "",
      skill: "",
      aadhaar: ""
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      setError(null);

      // Prepare worker data including location
      const workerData = {
        name: values.name,
        age: values.age,
        phone: values.phone,
        email: values.email,
        originState: values.originState,
        skill: values.skill,
        aadhaar: values.aadhaar,
        photoUrl: photoPreview || undefined,
        latitude: location.latitude || undefined,
        longitude: location.longitude || undefined,
      };

      // Register worker in Supabase
      const registeredWorker = await registerNewWorker(workerData);
      
      toast.success('Worker updated to Supabase!');
      
      if (onSuccess) {
        onSuccess(registeredWorker);
      }
      
      form.reset();
      setPhotoPreview(null);
      
    } catch (error: any) {
      console.error("Registration error:", error);
      setError(error?.message || "Registration failed. Please try again.");
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const compressImage = (file: File, maxSizeInMB: number = 0.5): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDimension = 400;
          if (width > height && width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const quality = 0.4;
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        img.onerror = (error) => { reject(error); };
      };
      reader.onerror = (error) => { reject(error); };
    });
  };

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const compressedImage = await compressImage(file);
        setPhotoPreview(compressedImage);
      } catch (error) {
        console.error("Error compressing image:", error);
        toast.error("Error processing image. Please try a smaller image.");
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className={`grid grid-cols-1 ${isMobile ? "" : "md:grid-cols-2"} gap-6`}>
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}/>
          <FormField control={form.control} name="age" render={({ field }) => (
            <FormItem>
              <FormLabel>Age</FormLabel>
              <FormControl><Input type="number" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}/>
          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl><Input placeholder="9876543210" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}/>
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl><Input type="email" placeholder="worker@example.com" {...field} /></FormControl>
              <FormDescription>Used for communication and OTP verification</FormDescription>
              <FormMessage />
            </FormItem>
          )}/>
          <FormField control={form.control} name="aadhaar" render={({ field }) => (
            <FormItem>
              <FormLabel>Aadhaar Number <span className="text-red-500">*</span></FormLabel>
              <FormControl><Input placeholder="123456789012" {...field} /></FormControl>
              <FormDescription>Required for verification. Will be kept confidential.</FormDescription>
              <FormMessage />
            </FormItem>
          )}/>
          <FormField control={form.control} name="originState" render={({ field }) => (
            <FormItem>
              <FormLabel>Origin State</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Select your origin state" /></SelectTrigger>
                </FormControl>
                <SelectContent className={isMobile ? "max-h-[200px]" : ""}>
                  {STATES.map((state) => (<SelectItem key={state} value={state}>{state}</SelectItem>))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}/>
          <FormField control={form.control} name="skill" render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Skill</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your primary skill" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SKILLS.map((skill) => (
                    <SelectItem key={skill} value={skill}>
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}/>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {location.loading
              ? "Detecting your location..."
              : location.error
                ? `Location unavailable`
                : `Latitude: ${location.latitude?.toFixed(4)}, Longitude: ${location.longitude?.toFixed(4)}`}
          </span>
        </div>
        <div className="space-y-2">
          <FormLabel>Photo</FormLabel>
          <div className="flex flex-col items-center space-y-2">
            <div className="border-2 border-dashed border-gray-300 rounded-md p-4 w-full text-center">
              <Input type="file" accept="image/*" className="hidden" id="worker-photo" onChange={handlePhotoChange}/>
              <label htmlFor="worker-photo" className="cursor-pointer text-primary hover:text-primary/80">
                {photoPreview ? (
                  <div className="flex flex-col items-center">
                    <img src={photoPreview} alt="Preview" className="h-32 w-32 object-cover rounded-full mb-2"/>
                    <span>Change photo</span>
                  </div>
                ) : (<div className="py-4">Click to upload photo</div>)}
              </label>
            </div>
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Registering..." : "Register Worker"}
        </Button>
        <div className="text-center text-sm text-muted-foreground mt-2">
          Registration typically completes in 2-3 seconds
        </div>
      </form>
    </Form>
  );
}
