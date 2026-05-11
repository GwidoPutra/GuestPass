import api from "./api";
import { Profile } from "./types";

export async function getProfiles(): Promise<Profile[]> {
  const response = await api.get<Profile[]>("/Profile");
  return response.data;
}

export async function getProfile(id: string): Promise<Profile> {
  const response = await api.get<Profile>(`/Profile/${id}`);
  return response.data;
}

export async function toggleApproval(id: string): Promise<Profile> {
  const response = await api.put<Profile>(`/Profile/${id}/approve`);
  return response.data;
}

export async function deleteProfile(id: string): Promise<void> {
  await api.delete(`/Profile/${id}`);
}
