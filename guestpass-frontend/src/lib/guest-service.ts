import api from "./api";
import { Guest, GuestCreateRequest } from "./types";

export async function getGuests(eventId: string): Promise<Guest[]> {
  const response = await api.get<Guest[]>("/Guest", {
    params: { eventId },
  });
  return response.data;
}

export async function getGuest(id: string): Promise<Guest> {
  const response = await api.get<Guest>(`/Guest/${id}`);
  return response.data;
}

export async function createGuest(data: GuestCreateRequest): Promise<Guest> {
  const response = await api.post<Guest>("/Guest", data);
  return response.data;
}

export async function checkInGuest(id: string): Promise<Guest> {
  const response = await api.put<Guest>(`/Guest/${id}/checkin`);
  return response.data;
}

export async function checkInByToken(token: string): Promise<Guest> {
  const response = await api.post<Guest>("/Guest/checkin-by-token", { token });
  return response.data;
}

export async function deleteGuest(id: string): Promise<void> {
  await api.delete(`/Guest/${id}`);
}
