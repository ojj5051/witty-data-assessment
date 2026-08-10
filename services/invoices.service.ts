import axios from "@/lib/axios";

export const getInvoices = async () => {
  const response = await axios.get("/invoices/list");

  return response.data.data;
};

export const createInvoice = async (invoiceData: any) => {
  const response = await axios.post("/invoices/create", invoiceData);

  return response.data.data;
};

export const getInvoiceById = async (id: string) => {
  const response = await axios.get(`/invoices/detail/${id}`);

  return response.data.data;
};

export const editInvoice = async (id: string, invoiceData: any) => {
  const response = await axios.put(`/invoices/edit/${id}`, invoiceData);

  return response.data.data;
};

export const deleteInvoice = async (id: string) => {
  const response = await axios.delete(`/invoices/delete/${id}`);

  return response.data.data;
};

export const getInvoiceItems = async (
  startDate?: string,
  endDate?: string,
) => {
  const params = new URLSearchParams();

  if (startDate) params.set("start_date", startDate);
  if (endDate) params.set("end_date", endDate);

  const response = await axios.get(`/invoices/list-items?${params.toString()}`);

  return response.data.data;
};
