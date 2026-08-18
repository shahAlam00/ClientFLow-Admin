import api from "@/lib/axios";

const result = (response) => response.data?.data ?? response.data;

export const getInvoices = async () => {
  const data = result(await api.get("/invoices"));
  return Array.isArray(data) ? data : data?.invoices ?? [];
};

export const createInvoice = async (payload) => result(await api.post("/invoices", payload));
export const updateInvoice = async (id, payload) => result(await api.put(`/invoices/${id}`, payload));
export const deleteInvoice = async (id) => result(await api.delete(`/invoices/${id}`));
