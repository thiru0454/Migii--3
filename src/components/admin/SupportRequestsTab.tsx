import { useEffect, useState } from "react";
import { getSupportRequests, updateSupportRequestStatus } from "@/utils/supabaseClient";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface SupportRequest {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  created_at: string;
}

export function SupportRequestsTab() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SupportRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    const { data } = await getSupportRequests();
    setRequests(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id: string, status: string) => {
    setActionLoading(true);
    await updateSupportRequestStatus(id, status);
    setActionLoading(false);
    setDialogOpen(false);
    fetchRequests();
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Support Requests</h2>
      {loading ? (
        <div>Loading...</div>
      ) : requests.length === 0 ? (
        <div>No support requests found.</div>
      ) : (
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-muted">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Message</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Created At</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="border-b">
                <td className="p-2 border">{req.name}</td>
                <td className="p-2 border">{req.email}</td>
                <td className="p-2 border">{req.message.slice(0, 30)}...</td>
                <td className="p-2 border">{req.status}</td>
                <td className="p-2 border">{new Date(req.created_at).toLocaleString()}</td>
                <td className="p-2 border">
                  <Button size="sm" variant="outline" onClick={() => { setSelected(req); setDialogOpen(true); }}>View</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Support Request Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-2">
              <div><b>Name:</b> {selected.name}</div>
              <div><b>Email:</b> {selected.email}</div>
              <div><b>Message:</b> <pre className="whitespace-pre-wrap">{selected.message}</pre></div>
              <div><b>Status:</b> {selected.status}</div>
              <div><b>Created At:</b> {new Date(selected.created_at).toLocaleString()}</div>
            </div>
          )}
          <DialogFooter>
            <Button disabled={actionLoading || selected?.status === 'resolved'} onClick={() => selected && handleAction(selected.id, 'resolved')}>Resolve</Button>
            <Button disabled={actionLoading || selected?.status === 'declined'} variant="destructive" onClick={() => selected && handleAction(selected.id, 'declined')}>Decline</Button>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 