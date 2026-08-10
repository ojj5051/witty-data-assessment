import axios from "@/lib/axios";

export async function login(email: any, password: any) {
  const response = await axios.post("/auth/login", {
    email,
    password,
  });

  return response.data.data;
}

export async function logout() {
  const response = await axios.post("/auth/logout");
  return response.data.data;
}

export async function getCurrentUser(request: Request) {
  const response = await axios.get("/auth/get-user", {
    data: {
      request,
    },
  });
  return response.data.data;
}
