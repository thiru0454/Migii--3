import { Button } from "@/components/ui/button";
import { Download, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface AdminDashboardHeaderProps {
  onLogout: () => void;
  workers: any[];
}

export function AdminDashboardHeader({ onLogout, workers }: AdminDashboardHeaderProps) {
  const exportToExcel = () => {
    try {
      const workersData = workers.map(worker => ({
        Name: worker.name,
        Age: worker.age,
        Phone: worker.phone,
        Skill: worker.skill,
        'Origin State': worker.originState,
        Status: worker.status
      }));

      const ws = XLSX.utils.json_to_sheet(workersData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Workers");
      
      XLSX.writeFile(wb, "workers_data.xlsx");
      toast.success("Successfully exported to Excel!");
    } catch (error) {
      toast.error("Failed to export Excel file");
      console.error("Excel export error:", error);
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text("Workers Data", 14, 15);
      
      // Prepare the data
      const workersData = workers.map(worker => [
        worker.name,
        worker.age.toString(),
        worker.phone,
        worker.skill,
        worker.originState,
        worker.status
      ]);
      
      // Add the table
      (doc as any).autoTable({
        head: [['Name', 'Age', 'Phone', 'Skill', 'Origin State', 'Status']],
        body: workersData,
        startY: 25,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] },
      });

      // Save the PDF
      doc.save('workers_data.pdf');
      toast.success("Successfully exported to PDF!");
    } catch (error) {
      toast.error("Failed to export PDF file");
      console.error("PDF export error:", error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">MIGII Admin Panel</h1>
        <p className="text-muted-foreground">
          Manage workers, businesses, locations, and support requests
        </p>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={exportToExcel} className="cursor-pointer">
              <Download className="mr-2 h-4 w-4" />
              Export to Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportToPDF} className="cursor-pointer">
              <Download className="mr-2 h-4 w-4" />
              Export to PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="destructive" onClick={onLogout} className="gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
