import Cookies from "js-cookie";

export async function getLaboratories() {
  const token = Cookies.get('token');

  const response = await fetch("http://localhost:5000/api/laboratorios", {
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
