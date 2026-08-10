import axios from "@/lib/axios";

export const getParticipants = async () => {
  const response = await axios.get("/participants/list");

  return response.data.data;
};

export const getParticipantById = async (id: string) => {
  const response = await axios.get(`/participants/detail/${id}`);

  return response.data.data;
};

export const createParticipants = async (values: any) => {
  const response = await axios.post("/participants/create", values);

  return response.data.data;
};

export const editParticipant = async (id: string, values: any) => {
  const response = await axios.put(`/participants/edit/${id}`, values);

  return response.data.data;
};

export const deleteParticipant = async (id: string) => {
  const response = await axios.delete(`/participants/delete/${id}`);

  return response.data.data;
};