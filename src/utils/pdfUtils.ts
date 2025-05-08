
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const generateWorkerIDCardPDF = async (workerId: string): Promise<void> => {
  const element = document.getElementById(`worker-card-${workerId}`);
  if (!element) return;

  // Optimize html2canvas for faster rendering
  const canvas = await html2canvas(element, {
    scale: 1, // Lower scale for faster rendering
    logging: false, // Disable logging for performance
    useCORS: true, // Better image handling
    allowTaint: true, // Allow tainted canvas for better performance
  });
  
  // Use lower quality JPEG instead of PNG for faster processing
  const imgData = canvas.toDataURL('image/jpeg', 0.7);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const imgWidth = 210; // A4 width in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
  pdf.save(`worker-id-${workerId}.pdf`);
};
