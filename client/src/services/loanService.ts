import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_BACK_ENV

// Interface that matches your updated Mongoose schema
export interface Loan {
  _id?: string;
  tipo_beneficiado: 'estudiante' | 'docente';
  numero_identificacion: string;
  nombre_beneficiado: string;
  correo_beneficiado: string;
  equipos: Array<{
    equipo_id: string;
    cantidad: number;
  }>;
  fecha_prestamo?: Date;
  fecha_devolucion: Date;
  fecha_devolucion_real?: Date | null;
  estado?: 'activo' | 'devuelto' | 'vencido';
  evidencia_foto?: string;
  laboratorio_id: string;
  descripcion?: string;
}

// Interface for API responses with populated data
export interface LoanFromApi {
  _id: string;
  tipo_beneficiado: string;
  numero_identificacion: string;
  nombre_beneficiado: string;
  correo_beneficiado: string;
  equipos: Array<{
    equipo_id: {
      _id: string;
      nombre: string;
      descripcion?: string;
      categoria: string;
      laboratorio_id: {
        _id: string;
        nombre: string;
        descripcion?: string;
      };
    };
    cantidad: number;
  }>;
  // NUEVO: cantidades devueltas por equipo
  equipos_devueltos?: Array<{
    equipo_id: string | { _id: string };
    cantidad: number;
  }>;
  // NUEVO: nota de devolución
  nota_devolucion?: string;
  fecha_prestamo: string;
  fecha_devolucion: string;
  fecha_devolucion_real?: string;
  estado: "activo" | "devuelto" | "vencido";
  evidencia_foto?: string;
  laboratorio_id: {
    _id: string;
    nombre: string;
    descripcion?: string;
  };
  descripcion?: string;
  createdAt: string;
  updatedAt: string;
}

// Interface for loan creation - updated for multiple equipment
export interface CreateLoanData {
  tipo_beneficiado: 'estudiante' | 'docente';
  numero_identificacion: string;
  nombre_beneficiado: string;
  correo_beneficiado: string;
  equipos: Array<{
    equipo_id: string;
    cantidad: number;
  }>;
  fecha_devolucion: string;
  evidencia_foto?: string;
  laboratorio_id: string;
  descripcion?: string;
}

// Interface for loan updates
export interface UpdateLoanData {
  fecha_devolucion?: string;
  estado?: "activo" | "devuelto" | "vencido";
  evidencia_foto?: string;
  descripcion?: string;
  equipos_devueltos?: Array<{
    equipo_id: string;
    cantidad: number;
  }>;
  nota_devolucion?: string;
}

// Interface for filtering loans
export interface LoansFilters {
  estado?: string;
  tipo_beneficiado?: string;
  equipo_id?: string;
  laboratorio_id?: string;
  desde?: string;
  hasta?: string;
  todos?: boolean;
}

// Create a new loan with multiple equipment support
export async function createLoan(data: CreateLoanData) {
  console.log("FUNCIÓN createLoan LLAMADA CON DATOS:", data);

  const token = Cookies.get("token");

  if (!token) {
    console.error("No hay token de autenticación");
    throw new Error("No hay token de autenticación");
  }

  try {
    const response = await fetch(`${BASE_URL}/api/prestamos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    console.log("Respuesta recibida:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    const result = await response.json();
    console.log("Datos de respuesta:", result);

    if (!response.ok) {
      console.error("Error en la respuesta:", result);
      throw new Error(result.mensaje || "Error al crear el préstamo");
    }

    return result;
  } catch (error) {
    console.error("Error en la petición:", error);
    throw error;
  }
}

// Get all loans with optional filters
export async function getLoans(filters?: LoansFilters): Promise<LoanFromApi[]> {
  const token = Cookies.get("token");

  if (!token) {
    throw new Error("No hay token de autenticación");
  }

  // Build query string with filters
  const queryParams = new URLSearchParams();

  if (filters) {
    if (filters.estado) queryParams.append("estado", filters.estado);
    if (filters.tipo_beneficiado) queryParams.append("tipo_beneficiado", filters.tipo_beneficiado);
    if (filters.equipo_id) queryParams.append("equipo_id", filters.equipo_id);
    if (filters.laboratorio_id) queryParams.append("laboratorio_id", filters.laboratorio_id);
    if (filters.desde) queryParams.append("desde", filters.desde);
    if (filters.hasta) queryParams.append("hasta", filters.hasta);
    if (filters.todos) queryParams.append("todos", filters.todos.toString());
  }

  const url = `${BASE_URL}/api/prestamos${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  console.log("Obteniendo préstamos con URL:", url);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    const fallbackMessage = result?.mensaje || result?.error;
    throw new Error(fallbackMessage || "Error al obtener préstamos");
  }

  return result.data;
}

// Get a loan by ID
export async function getLoanById(id: string): Promise<LoanFromApi> {
  const token = Cookies.get("token");

  if (!token) {
    throw new Error("No hay token de autenticación");
  }

  const response = await fetch(`${BASE_URL}/api/prestamos/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    const fallbackMessage = result?.mensaje || result?.error;
    throw new Error(fallbackMessage || "Error al obtener préstamo");
  }

  return result.data;
}

// Update a loan
export async function updateLoan(id: string, data: UpdateLoanData) {
  const token = Cookies.get("token");

  if (!token) {
    throw new Error("No hay token de autenticación");
  }

  console.log("Actualizando préstamo:", id, "con datos:", data);

  const response = await fetch(`${BASE_URL}/api/prestamos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    const fallbackMessage = result?.mensaje || result?.error;
    throw new Error(fallbackMessage || "Error al actualizar préstamo");
  }

  return result.data;
}

// Delete a loan
export async function deleteLoan(id: string): Promise<void> {
  const token = Cookies.get("token");

  if (!token) {
    throw new Error("No hay token de autenticación");
  }

  const response = await fetch(`${BASE_URL}/api/prestamos/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    const fallbackMessage = result?.mensaje || result?.error;
    throw new Error(fallbackMessage || "Error al eliminar préstamo");
  }

  return;
}

// Generate a PDF for a loan
export async function generateLoanPDF(
  id: string
): Promise<{ url: string; fileName: string }> {
  const token = Cookies.get("token");

  if (!token) {
    throw new Error("No hay token de autenticación");
  }

  const response = await fetch(
    `${BASE_URL}/api/prestamos/${id}/pdf`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    const fallbackMessage = result?.mensaje || result?.error;
    throw new Error(fallbackMessage || "Error al generar PDF del préstamo");
  }

  return result.data;
}

// Generate a report of loans
export async function generateLoansReport(
  filters?: LoansFilters
): Promise<{ url: string; fileName: string; count: number }> {
  const token = Cookies.get("token");

  if (!token) {
    throw new Error("No hay token de autenticación");
  }

  // Build query string with filters
  const queryParams = new URLSearchParams();

  if (filters) {
    if (filters.estado) queryParams.append("estado", filters.estado);
    if (filters.laboratorio_id)
      queryParams.append("laboratorio_id", filters.laboratorio_id);
    if (filters.desde) queryParams.append("desde", filters.desde);
    if (filters.hasta) queryParams.append("hasta", filters.hasta);
  }

  const url = `${BASE_URL}/api/prestamos/reporte${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    const fallbackMessage = result?.mensaje || result?.error;
    throw new Error(fallbackMessage || "Error al generar reporte de préstamos");
  }

  return result.data;
}

// Check for overdue loans
export async function checkOverdueLoans(): Promise<{
  vencidos: number;
  porVencer: number;
  total: number;
}> {
  const token = Cookies.get("token");

  if (!token) {
    throw new Error("No hay token de autenticación");
  }

  const response = await fetch(
    `${BASE_URL}/api/prestamos/verificar-vencidos`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    const fallbackMessage = result?.mensaje || result?.error;
    throw new Error(fallbackMessage || "Error al verificar préstamos vencidos");
  }

  return result.data;
}

// Helper functions for specific loan queries
export async function getLoansByLaboratory(
  laboratoryId: string
): Promise<LoanFromApi[]> {
  return getLoans({ laboratorio_id: laboratoryId });
}

export async function getLoansByBeneficiaryType(
  type: 'estudiante' | 'docente'
): Promise<LoanFromApi[]> {
  return getLoans({ tipo_beneficiado: type });
}

export async function getLoansByEquipment(
  equipmentId: string
): Promise<LoanFromApi[]> {
  return getLoans({ equipo_id: equipmentId });
}

export async function getActiveLoans(): Promise<LoanFromApi[]> {
  return getLoans({ estado: "activo" });
}

export async function getOverdueLoans(): Promise<LoanFromApi[]> {
  return getLoans({ estado: "vencido" });
}

export async function getReturnedLoans(): Promise<LoanFromApi[]> {
  return getLoans({ estado: "devuelto" });
}

// Register a new loan - updated for multiple equipment
export async function registerLoan(data: {
  tipo_beneficiado: 'estudiante' | 'docente';
  numero_identificacion: string;
  nombre_beneficiado: string;
  correo_beneficiado: string;
  equipos: Array<{
    equipo_id: string;
    cantidad: number;
  }>;
  fecha_devolucion: string;
  evidencia_foto?: string;
  laboratorio_id: string;
  descripcion?: string;
}) {
  return createLoan(data);
}