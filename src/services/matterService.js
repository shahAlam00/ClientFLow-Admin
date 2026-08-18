import API from '@/lib/axios';

export const getMatters = () => API.get('/non-litigation-matters').then(r => {
  const data = r.data?.data ?? r.data;
  return Array.isArray(data) ? data : data?.matters || data?.items || [];
});
export const getMatterById = (id) => API.get(`/non-litigation-matters/${id}`).then(r => r.data?.data ?? r.data);
export const createMatter = (formData) => API.post('/non-litigation-matters', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data?.data ?? r.data);
export const updateMatter = (id, formData) => API.put(`/non-litigation-matters/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data?.data ?? r.data);
export const deleteMatter = (id) => API.delete(`/non-litigation-matters/${id}`).then(r => r.data);
