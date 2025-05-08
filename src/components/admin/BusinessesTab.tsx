
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { BusinessUser, getAllBusinessUsers, deleteBusinessUser } from "@/utils/businessDatabase";
import { BusinessUsersTable } from "@/components/admin/BusinessUsersTable";
import { BusinessUserForm } from "@/components/business/BusinessUserForm";
import { BusinessUserDetails } from "@/components/business/BusinessUserDetails";
import { toast } from "sonner";

export function BusinessesTab() {
  const [businessUsers, setBusinessUsers] = useState<BusinessUser[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessUser | null>(null);
  const [businessDialogOpen, setBusinessDialogOpen] = useState(false);
  const [businessDialogMode, setBusinessDialogMode] = useState<"view" | "edit" | "add">("view");

  useEffect(() => {
    setBusinessUsers(getAllBusinessUsers());
  }, []);

  const onBusinessFormSubmit = async (values: any) => {
    try {
      if (businessDialogMode === "add") {
        const newBusinessUser: BusinessUser = {
          id: "",
          businessId: values.businessId,
          name: values.name,
          email: values.email,
          phone: values.phone,
          password: values.password,
          status: values.status,
          registrationDate: new Date().toISOString(),
        };
        
        const users = getAllBusinessUsers();
        const newId = `b${users.length + 1}`;
        newBusinessUser.id = newId;
        
        setBusinessUsers([...users, newBusinessUser]);
        localStorage.setItem("businessUsers", JSON.stringify([...users, newBusinessUser]));
        
        toast.success("Business user added successfully");
      } else if (businessDialogMode === "edit" && selectedBusiness) {
        const users = getAllBusinessUsers();
        const updatedUsers = users.map(user => 
          user.id === selectedBusiness.id 
            ? { 
                ...user, 
                businessId: values.businessId, 
                name: values.name,
                email: values.email,
                phone: values.phone,
                password: values.password,
                status: values.status,
              } 
            : user
        );
        
        setBusinessUsers(updatedUsers);
        localStorage.setItem("businessUsers", JSON.stringify(updatedUsers));
        
        toast.success("Business user updated successfully");
      }
      
      setBusinessDialogOpen(false);
    } catch (error) {
      toast.error("An error occurred", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleDeleteBusiness = (business: BusinessUser) => {
    if (confirm(`Are you sure you want to delete ${business.name}?`)) {
      try {
        deleteBusinessUser(business.id);
        setBusinessUsers(getAllBusinessUsers());
        toast.success("Business user deleted successfully");
      } catch (error) {
        toast.error("Failed to delete business user");
      }
    }
  };

  const handleViewBusinessDetails = (business: BusinessUser) => {
    setSelectedBusiness(business);
    setBusinessDialogMode("view");
    setBusinessDialogOpen(true);
  };

  const handleEditBusiness = (business: BusinessUser) => {
    setSelectedBusiness(business);
    setBusinessDialogMode("edit");
    setBusinessDialogOpen(true);
  };

  const handleAddBusiness = () => {
    setSelectedBusiness(null);
    setBusinessDialogMode("add");
    setBusinessDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl">Business Users</CardTitle>
          <Button onClick={handleAddBusiness}>Add Business</Button>
        </CardHeader>
        <CardContent>
          <BusinessUsersTable 
            businesses={businessUsers}
            onViewDetails={handleViewBusinessDetails}
            onEdit={handleEditBusiness}
            onDelete={handleDeleteBusiness}
          />
        </CardContent>
      </Card>

      <Dialog open={businessDialogOpen} onOpenChange={setBusinessDialogOpen}>
        <DialogContent className="max-w-2xl">
          {businessDialogMode === "view" && selectedBusiness ? (
            <BusinessUserDetails 
              business={selectedBusiness}
              onEdit={() => setBusinessDialogMode("edit")}
            />
          ) : (
            <BusinessUserForm
              mode={businessDialogMode === "edit" ? "edit" : "add"}
              initialData={selectedBusiness || undefined}
              onSubmit={onBusinessFormSubmit}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
