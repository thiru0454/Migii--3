
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkerLoginForm } from "@/components/forms/WorkerLoginForm";
import { useIsMobile } from "@/hooks/use-mobile";

interface WorkerLoginCardProps {
  onSuccess: () => void;
}

export function WorkerLoginCard({ onSuccess }: WorkerLoginCardProps) {
  const isMobile = useIsMobile();

  return (
    <div className="flex items-center justify-center w-full min-h-[calc(100vh-200px)] py-8 px-4 md:px-0">
      <Card className={`w-full ${isMobile ? 'max-w-[90%]' : 'max-w-md'} mx-auto shadow-lg border-border`}>
        <CardHeader className="text-center space-y-2 pb-6">
          <CardTitle className="text-2xl font-bold text-primary">Worker Login</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your phone number or email to receive an OTP
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 md:px-6 pb-8">
          <WorkerLoginForm onSuccess={onSuccess} />
        </CardContent>
      </Card>
    </div>
  );
}
