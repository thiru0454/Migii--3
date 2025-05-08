
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { BusinessUser } from "@/utils/businessDatabase";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash, Eye } from "lucide-react";

interface BusinessUsersTableProps {
  businesses: BusinessUser[];
  onViewDetails: (business: BusinessUser) => void;
  onEdit: (business: BusinessUser) => void;
  onDelete: (business: BusinessUser) => void;
  isLoading?: boolean;
}

export function BusinessUsersTable({
  businesses,
  onViewDetails,
  onEdit,
  onDelete,
  isLoading = false,
}: BusinessUsersTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Business ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Registration Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                Loading business users...
              </TableCell>
            </TableRow>
          ) : businesses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                No business users found
              </TableCell>
            </TableRow>
          ) : (
            businesses.map((business) => (
              <TableRow key={business.id}>
                <TableCell className="font-medium">{business.businessId}</TableCell>
                <TableCell>{business.name}</TableCell>
                <TableCell>{business.email}</TableCell>
                <TableCell>{business.phone}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      business.status === "active"
                        ? "success"
                        : business.status === "inactive"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {business.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(business.registrationDate).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewDetails(business)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(business)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(business)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
