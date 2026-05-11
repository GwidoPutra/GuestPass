import api from "./api";
import { Event, EventCreateRequest, EventUpdateRequest } from "./types";

export async function getEvents(): Promise<Event[]> {
  const response = await api.get<Event[]>("/Event");
  return response.data;
}

export async function getEvent(id: string): Promise<Event> {
  const response = await api.get<Event>(`/Event/${id}`);
  return response.data;
}

export async function createEvent(data: EventCreateRequest): Promise<Event> {
  const response = await api.post<Event>("/Event", data);
  return response.data;
}

export async function updateEvent(id: string, data: EventUpdateRequest): Promise<Event> {
  const response = await api.put<Event>(`/Event/${id}`, data);
  return response.data;
}

export async function deleteEvent(id: string): Promise<void> {
  await api.delete(`/Event/${id}`);
}
