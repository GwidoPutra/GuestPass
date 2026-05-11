// Auth DTOs
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

// User state
export interface AuthUser {
  token: string;
  role: string;
}

// Event DTOs
export interface Event {
  id: string;
  name: string;
  location: string;
  date: string;
  createdBy: string | null;
  createdAt: string;
}

export interface EventCreateRequest {
  name: string;
  location: string;
  date: string;
}

export interface EventUpdateRequest {
  name: string;
  location: string;
  date: string;
}
