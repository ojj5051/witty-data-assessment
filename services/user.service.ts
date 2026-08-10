import axios from "@/lib/axios";

export async function getUsers() {
  const response = await axios.get("/users/list");
  return response.data.data;
}

export async function getUserDetails(id: string) {
  const response = await axios.get(`/users/details/${id}`);
  return response.data.data;
}

export async function deleteUser(id: string) {
  const response = await axios.delete(`/users/delete/${id}`);
  return response.data.data;
}

export async function editUser(id: string, data: any) {
  const response = await axios.put(`/users/edit/${id}`, data);
  return response.data.data;
}

export async function createUser(data: any) {
  const response = await axios.post("/users/create", data);
  return response.data.data;
}

export async function changeUserPassword(id: string, password: any) {
  const response = await axios.put(`/users/password/${id}`, password);
  return response.data.data;
}