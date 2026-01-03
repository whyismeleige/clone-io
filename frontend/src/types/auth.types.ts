export type Mode = "local" | "github" | "google";

export interface User {
  _id: string;
  email: string;
  name: string;
  avatar: string;
  activity?: {
    lastLogin: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
