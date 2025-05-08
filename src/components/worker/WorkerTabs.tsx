import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";

const cardClass = "bg-white shadow-md rounded-lg p-6 mb-6 border border-gray-200";
const listCardClass = "bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4";

// Example WorkerTabs component. Replace with your actual implementation if needed.
const WorkerTabs = ({ workerData, onSignOut }: { workerData: any; onSignOut: () => void }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'assigned' | 'notifications'>('profile');
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [pendingAssignments, setPendingAssignments] = useState<any[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);

  // Fetch accepted assignments for Assigned Works
  useEffect(() => {
    if (activeTab === 'assigned' && workerData?.id) {
      setLoadingAssignments(true);
      supabase
        .from('worker_assignments')
        .select('*, businesses(name)')
        .eq('worker_id', workerData.id)
        .eq('status', 'accepted')
        .then(({ data, error }) => {
          if (!error) setAssignments(data || []);
          setLoadingAssignments(false);
        });
    }
  }, [activeTab, workerData?.id]);

  // Fetch pending assignments for Notifications
  useEffect(() => {
    if (activeTab === 'notifications' && workerData?.id) {
      setLoadingPending(true);
      supabase
        .from('worker_assignments')
        .select('*, businesses(name)')
        .eq('worker_id', workerData.id)
        .eq('status', 'pending')
        .then(({ data, error }) => {
          if (!error) setPendingAssignments(data || []);
          setLoadingPending(false);
        });
    }
  }, [activeTab, workerData?.id]);

  // Accept/Decline handlers
  const handleAssignmentAction = async (assignmentId: string, action: 'accepted' | 'declined') => {
    await supabase
      .from('worker_assignments')
      .update({ status: action, updated_at: new Date().toISOString() })
      .eq('id', assignmentId);
    // Refresh pending assignments
    setPendingAssignments(prev => prev.filter(a => a.id !== assignmentId));
    // Optionally, refresh accepted assignments if action is 'accepted'
    if (action === 'accepted') {
      setActiveTab('assigned'); // Switch to Assigned Works to show the new assignment
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-8 text-center text-primary">Worker Dashboard</h2>
      <div className="mb-8 flex gap-4 border-b justify-center">
        <button
          className={`pb-2 px-4 font-semibold transition-colors duration-200 ${activeTab === 'profile' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-primary'}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          className={`pb-2 px-4 font-semibold transition-colors duration-200 ${activeTab === 'assigned' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-primary'}`}
          onClick={() => setActiveTab('assigned')}
        >
          Assigned Works
        </button>
        <button
          className={`pb-2 px-4 font-semibold transition-colors duration-200 ${activeTab === 'notifications' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-primary'}`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
      </div>
      {activeTab === 'profile' && (
        <div className={cardClass}>
          <h3 className="text-xl font-semibold mb-4 text-primary">Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><strong>Name:</strong> {workerData["Full Name"] || workerData.name}</div>
            <div><strong>Phone:</strong> {workerData["Phone Number"] || workerData.phone}</div>
            <div><strong>Email:</strong> {workerData["Email Address"] || workerData.email}</div>
            <div><strong>Skill:</strong> {workerData["Primary Skill"] || workerData.skill}</div>
            <div><strong>Origin State:</strong> {workerData["Origin State"] || workerData.originState}</div>
            <div><strong>Status:</strong> {workerData.status}</div>
          </div>
        </div>
      )}
      {activeTab === 'assigned' && (
        <div className={cardClass}>
          <h3 className="text-xl font-semibold mb-4 text-primary">Assigned Works</h3>
          {loadingAssignments ? (
            <div className="text-gray-500">Loading...</div>
          ) : assignments.length === 0 ? (
            <div className="text-gray-500">No assigned works yet.</div>
          ) : (
            <div>
              {assignments.map(a => (
                <div key={a.id} className={listCardClass}>
                  <div className="mb-2"><b>Business:</b> {a.businesses?.name || a.business_id}</div>
                  <div className="mb-2"><b>Status:</b> <span className={a.status === 'pending' ? 'text-yellow-600' : 'text-green-600'}>{a.status}</span></div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {activeTab === 'notifications' && (
        <div className={cardClass}>
          <h3 className="text-xl font-semibold mb-4 text-primary">Notifications</h3>
          {loadingPending ? (
            <div className="text-gray-500">Loading...</div>
          ) : pendingAssignments.length === 0 ? (
            <div className="text-gray-500">No notifications at this time.</div>
          ) : (
            <div>
              {pendingAssignments.map(a => (
                <div key={a.id} className={listCardClass}>
                  <div className="mb-2"><b>Business:</b> {a.businesses?.name || a.business_id}</div>
                  <div className="mb-2"><b>Status:</b> <span className="text-yellow-600">Pending</span></div>
                  <div className="flex gap-2 mt-2">
                    <button
                      className="px-4 py-1 bg-green-500 hover:bg-green-600 text-white rounded"
                      onClick={() => handleAssignmentAction(a.id, 'accepted')}
                    >
                      Accept
                    </button>
                    <button
                      className="px-4 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                      onClick={() => handleAssignmentAction(a.id, 'declined')}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="flex justify-center mt-8">
        <button className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded shadow transition-all" onClick={onSignOut}>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export { WorkerTabs }; 