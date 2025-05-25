import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_BACK_ENV

export async function getLaboratories() {
  const token = Cookies.get('token');

  const response = await fetch(`${BASE_URL}/api/laboratorios`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    const fallbackMessage = result?.mensaje || result?.error;
    throw new Error(fallbackMessage);
  }

  return result;
}
