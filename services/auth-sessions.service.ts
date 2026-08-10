import axiosInstance from "@/lib/axios";

export const getAuthSessions = async () => {
  const response = await axiosInstance.get(`/auth-sessions/list`);

  return response.data.data;
};

export const getAuthSessionDetails = async (id: string) => {
  const response = await axiosInstance.get(`/auth-sessions/details/${id}`);

  return response.data.data;
};

export const deleteAuthSession = async (id: string) => {
  const response = await axiosInstance.delete(`/auth-sessions/delete/${id}`);

  return response.data.data;
};

export const revokeAuthSession = async (id: string) => {
  const response = await axiosInstance.put(`/auth-sessions/revoke/${id}`);

  return response.data.data;
};