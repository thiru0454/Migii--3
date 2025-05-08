export interface BusinessUser {
  id: string;
  businessId: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  status: "active" | "inactive" | "suspended";
  registrationDate: string;
}

// Initialize business users in localStorage if not already set
export const initBusinessDatabase = () => {
  if (!localStorage.getItem("businessUsers")) {
    const initialBusinessUsers: BusinessUser[] = [
      {
        id: "b1",
        businessId: "BUS-001",
        name: "Acme Construction",
        email: "business@example.com",
        phone: "9876543210",
        password: "business123",
        status: "active",
        registrationDate: "2025-01-15T00:00:00.000Z",
      },
    ];
    localStorage.setItem("businessUsers", JSON.stringify(initialBusinessUsers));
  }
};

export const getAllBusinessUsers = (): BusinessUser[] => {
  const users = localStorage.getItem("businessUsers");
  return users ? JSON.parse(users) : [];
};

export const getBusinessUserById = (id: string): BusinessUser | undefined => {
  const users = getAllBusinessUsers();
  return users.find((user) => user.id === id);
};

export const deleteBusinessUser = (id: string): void => {
  const users = getAllBusinessUsers();
  const updatedUsers = users.filter((user) => user.id !== id);
  localStorage.setItem("businessUsers", JSON.stringify(updatedUsers));
};
