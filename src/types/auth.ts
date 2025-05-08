
export type UserType = "admin" | "business" | "worker";

export type User = {
  id: string;
  email: string;
  name: string;
  userType: UserType;
  phone?: string;
  businessId?: string;
  registrationDate?: string;
  status?: "active" | "inactive";
};
