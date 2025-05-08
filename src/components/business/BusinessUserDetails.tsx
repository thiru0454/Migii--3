
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BusinessUser } from "@/utils/businessDatabase";

type BusinessUserDetailsProps = {
  business: BusinessUser;
  onEdit: () => void;
};

export function BusinessUserDetails({ business, onEdit }: BusinessUserDetailsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1">
        <Label>Business ID</Label>
        <div className="font-medium">{business.businessId}</div>
      </div>
      <div className="space-y-1">
        <Label>Registration Date</Label>
        <div className="font-medium">{new Date(business.registrationDate).toLocaleDateString()}</div>
      </div>
      <div className="space-y-1">
        <Label>Name</Label>
        <div className="font-medium">{business.name}</div>
      </div>
      <div className="space-y-1">
        <Label>Email</Label>
        <div className="font-medium">{business.email}</div>
      </div>
      <div className="space-y-1">
        <Label>Phone</Label>
        <div className="font-medium">{business.phone}</div>
      </div>
      <div className="space-y-1">
        <Label>Status</Label>
        <div className="font-medium">{business.status}</div>
      </div>
      <div className="md:col-span-2 pt-4">
        <Button onClick={onEdit}>Edit Business</Button>
      </div>
    </div>
  );
}
