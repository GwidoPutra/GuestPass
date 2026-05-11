import api from "./api";
import { LoginRequest, LoginResponse, RegisterRequest } from "./types";

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/Auth/login", data);
  return response.data;
}

export async function register(data: RegisterRequest): Promise<string> {
  const response = await api.post("/Auth/register", data);
  return response.data;
}
