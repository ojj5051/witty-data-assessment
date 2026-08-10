import axios from "@/lib/axios";

export async function getUserRoles() {
  const response = await axios.get("/user-roles/list");
  return response.data.data;
}

export async function deleteUserRole(id: string) {
  const response = await axios.delete(`/user-roles/delete/${id}`);
  return response.data.data;
}

export async function editUserRole(id: string, data: any) {
  const response = await axios.put(`/user-roles/edit/${id}`, data);
  return response.data.data;
}

export async function createUserRole(data: any) {
  const response = await axios.post("/user-roles/create", data);
  return response.data.data;
}

export async function getUserRoleDetails(id: string) {
  const response = await axios.get(`/user-roles/details/${id}`);
  return response.data.data;
}