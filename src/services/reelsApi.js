import axios from "@/lib/axios";

export const getReels = async () => {
  const res = await axios.get("/reels", {
    params: { _t: Date.now() } // Har request par naya timestamp jayega
  });
  return res.data;
};

export const createReel = async (formData) => {
  // Yahan hum headers pass nahi kar rahe, 
  // kyunki FormData bhejne par browser automatically 'multipart/form-data' 
  // aur 'boundary' set kar deta hai.
  const res = await axios.post("/reels", formData);
  return res.data;
};

export const updateReel = async (id, formData) => {
  // Update ke liye bhi same logic
  const res = await axios.put(`/reels/${id}`, formData);
  return res.data;
};

export const deleteReel = async (id) => {
  const res = await axios.delete(`/reels/${id}`);
  return res.data;
};