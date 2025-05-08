
// Mock data for demonstration purposes

// Worker Data
export const mockWorkers = [
  {
    id: "TN-MIG-20240101-12345",
    name: "Rahul Kumar",
    age: 28,
    phone: "9876543210",
    originState: "Bihar",
    skill: "Construction Worker",
    status: "active" as "active" | "inactive" | "pending",
    registrationDate: "01 Jan 2024",
  },
  {
    id: "TN-MIG-20240102-23456",
    name: "Priya Singh",
    age: 24,
    phone: "8765432109",
    originState: "Uttar Pradesh",
    skill: "Electrician",
    status: "active" as "active" | "inactive" | "pending",
    registrationDate: "02 Jan 2024",
  },
  {
    id: "TN-MIG-20240105-34567",
    name: "Amit Sharma",
    age: 32,
    phone: "7654321098",
    originState: "Rajasthan",
    skill: "Plumber",
    status: "inactive" as "active" | "inactive" | "pending",
    registrationDate: "05 Jan 2024",
  },
  {
    id: "TN-MIG-20240110-45678",
    name: "Sunita Devi",
    age: 29,
    phone: "6543210987",
    originState: "Jharkhand",
    skill: "Cleaner",
    status: "active" as "active" | "inactive" | "pending",
    registrationDate: "10 Jan 2024",
  },
  {
    id: "TN-MIG-20240115-56789",
    name: "Manoj Patel",
    age: 35,
    phone: "5432109876",
    originState: "Madhya Pradesh",
    skill: "Carpenter",
    status: "pending" as "active" | "inactive" | "pending",
    registrationDate: "15 Jan 2024",
  },
  {
    id: "TN-MIG-20240120-67890",
    name: "Neha Gupta",
    age: 27,
    phone: "4321098765",
    originState: "West Bengal",
    skill: "Painter",
    status: "active" as "active" | "inactive" | "pending",
    registrationDate: "20 Jan 2024",
  },
  {
    id: "TN-MIG-20240125-78901",
    name: "Rajesh Yadav",
    age: 31,
    phone: "3210987654",
    originState: "Odisha",
    skill: "Driver",
    status: "active" as "active" | "inactive" | "pending",
    registrationDate: "25 Jan 2024",
  },
];

// Help Requests
export const mockHelpRequests = [
  {
    id: "REQ-20240401-12345",
    workerId: "TN-MIG-20240101-12345",
    workerName: "Rahul Kumar",
    requestDate: "01 Apr 2024",
    message: "I need help with finding accommodation near my work site. My current place is too far and commuting is difficult.",
    status: "pending" as "pending" | "processing" | "resolved",
  },
  {
    id: "REQ-20240328-23456",
    workerId: "TN-MIG-20240102-23456",
    workerName: "Priya Singh",
    requestDate: "28 Mar 2024",
    message: "My ID card is damaged and I need a replacement. When can I visit the office to get a new one?",
    status: "processing" as "pending" | "processing" | "resolved",
  },
  {
    id: "REQ-20240325-34567",
    workerId: "TN-MIG-20240105-34567",
    workerName: "Amit Sharma",
    requestDate: "25 Mar 2024",
    message: "I haven't received my payment for the work completed last week. Please help resolve this issue.",
    status: "resolved" as "pending" | "processing" | "resolved",
  },
];

// Dashboard Stats
export const dashboardStats = {
  totalWorkers: 145,
  activeWorkers: 112,
  pendingRegistrations: 8,
  helpRequests: 5,
  recentRegistrations: 23,
  popularSkills: [
    { skill: "Construction Worker", count: 45 },
    { skill: "Painter", count: 28 },
    { skill: "Electrician", count: 22 },
    { skill: "Plumber", count: 18 },
  ],
  stateDistribution: [
    { state: "Bihar", count: 35 },
    { state: "Uttar Pradesh", count: 28 },
    { state: "Rajasthan", count: 18 },
    { state: "West Bengal", count: 16 },
    { state: "Jharkhand", count: 14 },
    { state: "Others", count: 34 },
  ],
};
