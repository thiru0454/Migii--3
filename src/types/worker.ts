
export type MigrantWorker = {
  id: string;
  name: string;
  "Full Name": string;
  age: number;
  "Age": number;
  phone: string;
  "Phone Number": string;
  email?: string;
  "Email Address"?: string;
  primarySkill?: string;
  "Primary Skill": string;
  originState?: string;
  "Origin State": string;
  status: "active" | "inactive" | "pending";
  registrationDate: string;
  "Photo URL"?: string;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
  aadhaar: string;
  "Aadhaar Number": string;
  assignedBusinessId?: string;
  skill: string;
};

// Add a Worker interface that matches the one used in components
export interface Worker {
  id: string;
  name: string;
  phone: string;
  skill: string;
  status: string;
  originState?: string;
  age?: number;
  email?: string;
  photoUrl?: string;
  aadhaar?: string;
}

// Define WorkerLocation interface to use in location tracking
export interface WorkerLocation {
  workerId: string;
  name: string;
  latitude: number;
  longitude: number;
  timestamp: number;
}
