import axios from "@/lib/axios";

export async function getRateSets() {
  const response = await axios.get("/rate-sets/list");
  return response.data.data;
}

export async function createRateSet(data: any) {
  const response = await axios.post("/rate-sets/create", data);

  return response.data.data;
}

export async function uploadRateSet(formData: FormData) {
  const response = await axios.post("/rate-sets/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data;
}

export async function getRateSetItems(id: string) {
  const response = await axios.get(`/rate-sets/edit/${id}/item-table`);
  return response.data.data;
}

export async function deleteRateSet(id: string) {
  const response = await axios.delete("/rate-sets/delete", { data: { id } });
  return response.data.data;
}

export async function getRateSet(id: string) {
  const response = await axios.get(`/rate-sets/edit/${id}/items`);
  return response.data.data;
}

export async function updateRateSet(id: string, data: any) {
  const response = await axios.put(`/rate-sets/edit/${id}/items`, data);
  return response.data.data;
}
