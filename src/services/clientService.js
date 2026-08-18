import api from "@/lib/axios";

export const getClients = async () => {
  const res = await api.get("/clients");
  const data = res.data?.data ?? res.data;
  return Array.isArray(data) ? data : data?.clients || [];
};

export const getClientById = async (id) => {
  const res = await api.get(`/clients/${id}`);
  return res.data?.data ?? res.data;
};

export const deleteClient = async (id) => {
  const res = await api.delete(`/clients/${id}`);
  return res.data;
};

export const updateClient = async (id, data) => {
  const res = await api.put(`/clients/${id}`, data);
  return res.data?.data ?? res.data;
};
