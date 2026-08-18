import API from "@/lib/api";

export const getAppointments = () => API.get("/appointments");

export const createAppointment = (data) =>
  API.post("/appointments", data);

export const updateAppointment = (id, data) =>
  API.put(`/appointments/${id}`, data);

export const deleteAppointment = (id) =>
  API.delete(`/appointments/${id}`);