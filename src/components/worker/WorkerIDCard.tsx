
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import QRCode from "react-qr-code";

interface WorkerIDCardProps {
  workerId: string;
  name: string;
  phone: string;
  skill: string;
  originState: string;
  photoUrl?: string;
}

export function WorkerIDCard({ 
  workerId, 
  name, 
  phone, 
  skill, 
  originState, 
  photoUrl 
}: WorkerIDCardProps) {
  // Get the initials for the avatar fallback
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className="overflow-hidden border-2 border-migii/20 max-w-md mx-auto">
      <div className="bg-migii p-4 text-white text-center">
        <h3 className="font-bold">MIGII WORKER ID</h3>
      </div>
      <CardContent className="p-6 flex flex-col items-center space-y-4">
        <Avatar className="h-24 w-24 border-4 border-migii">
          <AvatarImage src={photoUrl} alt={name} />
          <AvatarFallback className="bg-migii-muted text-migii-dark font-bold text-2xl">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="w-full text-center space-y-2">
          <h3 className="font-bold text-xl">{name}</h3>
          <p className="text-muted-foreground">{skill}</p>
          <div className="bg-migii-muted py-2 px-4 rounded-md font-mono font-bold text-migii-dark my-2">
            {workerId}
          </div>
        </div>
        
        <div className="w-full grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Phone</p>
            <p className="font-medium">{phone}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Origin State</p>
            <p className="font-medium">{originState}</p>
          </div>
        </div>
        
        <div className="mt-4 p-2 bg-white rounded-lg">
          <QRCode value={workerId} size={128} />
        </div>
      </CardContent>
    </Card>
  );
}
