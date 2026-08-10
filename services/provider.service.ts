import axios from "@/lib/axios";

export const getProviders = async () => {
  const response = await axios.get("/providers/list");

  return response.data.data;
};

export const createProvider = async (data: any) => {
  const response = await axios.post("/providers/create", data);

  return response.data.data;
};

export const editProvider = async (id: string, data: any) => {
  const response = await axios.put(`/providers/edit/${id}`, data);

  return response.data.data;
};

export const deleteProvider = async (id: string) => {
  const response = await axios.delete(`/providers/delete/${id}`);

  return response.data.data;
};

export const getProviderById = async (id: string) => {
  const response = await axios.get(`/providers/detail/${id}`);

  return response.data.data;
};