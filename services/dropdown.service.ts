import axios from "@/lib/axios";

export async function getPricingRegionDropdown() {
  const response = await axios.get("dropdown/pricing-regions");

  return response.data.data;
}

export const getParticipantDropdown = async () => {
  const response = await axios.get("/dropdown/participants");
  return response.data.data;
};

export const getProviderDropdown = async () => {
  const response = await axios.get("/dropdown/providers");
  return response.data.data;
};

export const getSupportCategoryDropdown = async () => {
  const response = await axios.get(`/dropdown/support-category`);
  return response.data.data;
};

export const getSupportItemDropdown = async (category_id: string) => {
  const response = await axios.get(
    `/dropdown/support-item?category_id=${category_id}`,
  );
  return response.data.data;
};

export const getAllSupportItemDropdown = async () => {
  const response = await axios.get(`/dropdown/support-item`);
  return response.data.data;
};

export const getSupportTypeDropdown = async () => {
  const response = await axios.get(`/dropdown/type`);
  return response.data.data;
};

export const getUserDropdown = async () => {
  const response = await axios.get(`/dropdown/user`);
  return response.data.data;
};

export const getRoleDropdown = async () => {
  const response = await axios.get(`/dropdown/role`);
  return response.data.data;
};